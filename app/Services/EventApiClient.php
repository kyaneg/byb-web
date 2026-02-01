<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class EventApiClient
{
    private const CACHE_DURATION_SECONDS = 900;

    private const AUTH_CACHE_SECONDS = 3600;

    /**
     * Get the normalized base URL (without /v1 suffix).
     */
    protected function getNormalizedBaseUrl(): string
    {
        $baseUrl = rtrim(Config::get('events.api_base_url'), '/');

        return preg_replace('/\/v1$/', '', $baseUrl);
    }

    /**
     * Get a configured HTTP client instance for the events API.
     */
    public function client(?string $locale = null): PendingRequest
    {
        $baseUrl = $this->getNormalizedBaseUrl();
        $locale = $locale ?? Config::get('events.default_locale', 'en');

        $client = Http::baseUrl($baseUrl)
            ->acceptJson()
            ->asJson()
            ->withHeaders([
                'Accept-Language' => $locale,
            ])
            ->timeout(10);

        // Add authentication token if available
        $token = $this->getApiToken();
        if ($token) {
            $client->withToken($token);
        }

        return $client;
    }

    /**
     * Get API authentication token.
     * Caches the token to avoid repeated authentication requests.
     */
    protected function getApiToken(): ?string
    {
        $email = Config::get('events.api_email');
        $password = Config::get('events.api_password');

        // If no credentials configured, return null (for development/testing)
        if (! $email || ! $password) {
            return null;
        }

        return Cache::remember('api_auth_token', self::AUTH_CACHE_SECONDS, function () use ($email, $password) {
            $baseUrl = $this->getNormalizedBaseUrl();
            $loginUrl = $baseUrl.'/v1/auth/login';

            try {
                $response = Http::acceptJson()
                    ->asJson()
                    ->post($loginUrl, [
                        'email' => $email,
                        'password' => $password,
                        'device_name' => 'eventon-calendar-app',
                    ]);

                if ($response->successful()) {
                    $data = $response->json();

                    return $data['data']['token'] ?? $data['token'] ?? null;
                }

                Log::channel('api')->warning('Failed to authenticate with API', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'endpoint' => $loginUrl,
                ]);

                return null;
            } catch (\Exception $e) {
                Log::channel('api')->error('Error authenticating with API', [
                    'exception' => get_class($e),
                    'message' => $e->getMessage(),
                    'endpoint' => $loginUrl,
                ]);

                return null;
            }
        });
    }

    /**
     * Fetch events from the byb-db API with retry logic and caching.
     *
     * @param  array<string, mixed>  $params
     * @return array<string, mixed>
     */
    public function fetchEvents(array $params = [], ?string $locale = null, int $maxRetries = 3): array
    {
        $cacheKey = $this->getEventsCacheKey($params, $locale);

        return Cache::remember($cacheKey, self::CACHE_DURATION_SECONDS, function () use ($params, $locale, $maxRetries) {
            // Always use 'v1/events' as baseUrl is normalized in client() method
            $endpoint = 'v1/events';

            $attempt = 0;
            $lastException = null;

            while ($attempt < $maxRetries) {
                try {
                    $response = $this->client($locale)->get($endpoint, $params);

                    if ($response->successful()) {
                        $json = $response->json();

                        // Laravel resource collections typically wrap data in a "data" key
                        $rawEvents = Arr::get($json, 'data', $json);

                        return [
                            'events' => $this->normalizeEvents($rawEvents),
                            'meta' => Arr::except($json, ['data']),
                        ];
                    }

                    // Don't retry on client errors (4xx)
                    if ($response->status() >= 400 && $response->status() < 500) {
                        Log::channel('api')->warning('Event API client error', [
                            'status' => $response->status(),
                            'endpoint' => $endpoint,
                            'params' => $params,
                        ]);

                        return [
                            'events' => [],
                            'meta' => [
                                'error' => true,
                                'message' => $response->json('message') ?? 'Failed to load events.',
                                'status' => $response->status(),
                            ],
                        ];
                    }

                    // Retry on server errors (5xx) or network errors
                    $attempt++;
                    if ($attempt < $maxRetries) {
                        sleep(min($attempt, 3)); // Exponential backoff: 1s, 2s, 3s

                        continue;
                    }

                    // Last attempt failed
                    Log::channel('api')->error('Event API request failed after retries', [
                        'status' => $response->status(),
                        'endpoint' => $endpoint,
                        'attempts' => $attempt,
                    ]);

                    return [
                        'events' => [],
                        'meta' => [
                            'error' => true,
                            'message' => $response->json('message') ?? 'Failed to load events after multiple attempts.',
                            'status' => $response->status(),
                        ],
                    ];
                } catch (\Exception $e) {
                    $lastException = $e;
                    $attempt++;

                    // Log network errors
                    Log::channel('api')->warning('Event API network error', [
                        'exception' => get_class($e),
                        'message' => $e->getMessage(),
                        'endpoint' => $endpoint,
                        'attempt' => $attempt,
                    ]);

                    if ($attempt < $maxRetries) {
                        sleep(min($attempt, 3)); // Exponential backoff

                        continue;
                    }
                }
            }

            // All retries exhausted
            Log::channel('api')->error('Event API request failed completely', [
                'endpoint' => $endpoint,
                'attempts' => $attempt,
                'exception' => $lastException?->getMessage(),
            ]);

            return [
                'events' => [],
                'meta' => [
                    'error' => true,
                    'message' => 'Network error: Unable to connect to the events API. Please check your connection and try again.',
                    'status' => 0,
                ],
            ];
        });
    }

    /**
     * Get cache key for events API request.
     *
     * @param  array<string, mixed>  $params
     */
    protected function getEventsCacheKey(array $params, ?string $locale): string
    {
        // Sort params for consistent cache keys
        ksort($params);
        $paramsHash = md5(json_encode($params));
        $localeKey = $locale ?? 'default';

        return "event_api_client:events:{$localeKey}:{$paramsHash}";
    }

    /**
     * Fetch lookups for filters (types, industries, etc.) from the API.
     *
     * @return array<string, array<int, array<string, mixed>>>
     */
    public function fetchFilterLookups(?string $locale = null): array
    {
        $client = $this->client($locale);

        $endpoints = [
            'types' => '/event-types',
            'industries' => '/industries',
            'countries' => '/countries',
            'statuses' => '/event-statuses',
            'tags' => '/tags',
        ];

        $results = [];

        // Always use 'v1' prefix as baseUrl is normalized in client() method
        foreach ($endpoints as $key => $endpoint) {
            $fullEndpoint = 'v1'.ltrim($endpoint, '/');
            $response = $client->get($fullEndpoint);

            if ($response->ok()) {
                $json = $response->json();
                $results[$key] = Arr::get($json, 'data', $json);
            } else {
                $results[$key] = [];
            }
        }

        return $results;
    }

    /**
     * Normalize events into a calendar-friendly structure.
     *
     * @param  array<int, array<string, mixed>>  $rawEvents
     * @return array<int, array<string, mixed>>
     */
    public function normalizeEvents(array $rawEvents): array
    {
        return array_map(function (array $event): array {
            $start = $event['start_datetime'] ?? null;
            $end = $event['end_datetime'] ?? null;

            $assetBase = rtrim(Config::get('events.asset_base_url'), '/');

            return [
                'id' => $event['id'] ?? null,
                'title' => $event['title'] ?? '',
                'description' => $event['description'] ?? '',
                'startDateTime' => $start,
                'endDateTime' => $end,
                'timezone' => $event['timezone'] ?? null,
                'allDay' => $this->isAllDay($start, $end),
                'status' => $event['event_status'] ?? null,
                'type' => $event['event_type'] ?? null,
                'industry' => $event['industry'] ?? null,
                'country' => $event['country'] ?? null,
                'organizers' => $this->normalizeOrganizers($event['organizers'] ?? [], $assetBase),
                'venue' => $event['venue'] ?? null,
                'tags' => $event['tags'] ?? [],
                'googleMapsUrl' => $event['google_maps_url'] ?? null,
                'images' => $this->normalizeImages($event['images'] ?? [], $assetBase),
                'isAccommodationAvailable' => $event['is_accommodation_available'] ?? false,
                'externalLink' => $event['external_link'] ?? null,
                'relatedEvents' => $this->normalizeAssociatedEvents($event['related_events'] ?? [], $assetBase),
                'colocatedEvents' => $this->normalizeAssociatedEvents($event['colocated_events'] ?? [], $assetBase),
                'industryColor' => $event['industry_color'] ?? null,
            ];
        }, $rawEvents);
    }

    /**
     * Normalize an array of images to absolute URLs.
     *
     * @param  mixed  $images
     * @return array<int, mixed>
     */
    protected function normalizeImages(mixed $images, string $assetBase): array
    {
        if (! is_array($images)) {
            $images = [$images];
        }

        return array_map(function ($image) use ($assetBase) {
            if (is_array($image) && isset($image['url'])) {
                $image['url'] = $this->normalizeAssetUrl($image['url'], $assetBase);

                return $image;
            }

            return $this->normalizeAssetUrl((string) $image, $assetBase);
        }, $images);
    }

    /**
     * Normalize organizers data with image URL processing.
     *
     * @param  array<int, array<string, mixed>>  $organizers
     * @return array<int, array<string, mixed>>
     */
    protected function normalizeOrganizers(array $organizers, string $assetBase): array
    {
        return array_map(function ($organizer) use ($assetBase) {
            if (! is_array($organizer)) {
                return null;
            }

            if (! empty($organizer['image'])) {
                $organizer['image'] = $this->normalizeAssetUrl(
                    (string) $organizer['image'],
                    $assetBase
                );
            }

            return $organizer;
        }, $organizers);
    }

    /**
     * Normalize associated events (related or colocated) with their images and organizer.
     *
     * @param  array<int, array<string, mixed>>  $events
     * @return array<int, array<string, mixed>>
     */
    protected function normalizeAssociatedEvents(array $events, string $assetBase): array
    {
        return array_map(function (array $event) use ($assetBase): array {
            $start = $event['start_datetime'] ?? null;
            $end = $event['end_datetime'] ?? null;

            return [
                'id' => $event['id'] ?? null,
                'title' => $event['title'] ?? '',
                'description' => $event['description'] ?? '',
                'startDateTime' => $start,
                'endDateTime' => $end,
                'timezone' => $event['timezone'] ?? null,
                'allDay' => $this->isAllDay($start, $end),
                'status' => $event['event_status'] ?? null,
                'type' => $event['event_type'] ?? null,
                'industry' => $event['industry'] ?? null,
                'country' => $event['country'] ?? null,
                'organizers' => $this->normalizeOrganizers($event['organizers'] ?? [], $assetBase),
                'venue' => $event['venue'] ?? null,
                'tags' => $event['tags'] ?? [],
                'googleMapsUrl' => $event['google_maps_url'] ?? null,
                'images' => $this->normalizeImages($event['images'] ?? [], $assetBase),
                'isAccommodationAvailable' => $event['is_accommodation_available'] ?? false,
                'externalLink' => $event['external_link'] ?? null,
                // Include related/co-located events if they exist in the API response
                'relatedEvents' => isset($event['related_events']) ? $this->normalizeAssociatedEvents($event['related_events'], $assetBase) : [],
                'colocatedEvents' => isset($event['colocated_events']) ? $this->normalizeAssociatedEvents($event['colocated_events'], $assetBase) : [],
            ];
        }, $events);
    }

    /**
     * Normalize a single asset URL or path to use the configured asset base URL.
     */
    protected function normalizeAssetUrl(string $url, string $assetBase): string
    {
        if ($url === '') {
            return $url;
        }

        // If absolute URL, replace the host with the asset base URL but keep the path
        if (Str::startsWith($url, ['http://', 'https://'])) {
            $path = parse_url($url, PHP_URL_PATH) ?: '';

            return rtrim($assetBase, '/').'/'.ltrim($path, '/');
        }

        // Relative path: ensure it has storage/ prefix, then prefix with asset base
        if (! Str::startsWith($url, 'storage/')) {
            $url = 'storage/'.ltrim($url, '/');
        }

        return rtrim($assetBase, '/').'/'.ltrim($url, '/');
    }

    /**
     * Determine whether an event should be treated as all-day.
     */
    protected function isAllDay(?string $start, ?string $end): bool
    {
        if (! $start || ! $end) {
            return false;
        }

        // Simple heuristic: if both times are midnight, treat as all-day
        return str_ends_with($start, 'T00:00:00Z') && str_ends_with($end, 'T23:59:59Z');
    }

    /**
     * Fetch portfolios from the byb-db API with retry logic and caching.
     *
     * @param  array<string, mixed>  $params
     * @return array<int, array<string, mixed>>
     */
    public function fetchPortfolios(array $params = [], ?string $locale = null, int $maxRetries = 3): array
    {
        $cacheKey = $this->getPortfoliosCacheKey($params, $locale);

        return Cache::remember($cacheKey, self::CACHE_DURATION_SECONDS, function () use ($params, $locale, $maxRetries) {
            // Always use 'v1/portfolios' as baseUrl is normalized in client() method
            $endpoint = 'v1/portfolios';

            $attempt = 0;
            $lastException = null;

            while ($attempt < $maxRetries) {
                try {
                    $response = $this->client($locale)->get($endpoint, $params);

                    if ($response->successful()) {
                        $json = $response->json();

                        // Laravel resource collections wrap data in a "data" key
                        if (isset($json['data']) && is_array($json['data'])) {
                            $rawPortfolios = $json['data'];
                        } elseif (is_array($json) && ! isset($json['data'])) {
                            $rawPortfolios = $json;
                        } else {
                            Log::channel('api')->warning('Portfolio API returned invalid data format', [
                                'json_keys' => is_array($json) ? array_keys($json) : 'not_array',
                                'endpoint' => $endpoint,
                            ]);

                            return [];
                        }

                        if (! is_array($rawPortfolios) || empty($rawPortfolios)) {
                            return [];
                        }

                        // Normalize portfolio images to absolute URLs
                        $assetBase = rtrim(Config::get('events.asset_base_url'), '/');

                        return array_map(function (array $portfolio) use ($assetBase): array {
                            // Normalize images array (new format - preferred)
                            if (isset($portfolio['images']) && is_array($portfolio['images']) && ! empty($portfolio['images'])) {
                                $portfolio['images'] = array_map(function ($image) use ($assetBase) {
                                    if (is_string($image) && ! empty($image) && ! Str::startsWith($image, ['http://', 'https://'])) {
                                        // If path doesn't start with storage/, add it (Filament stores in storage/app/public)
                                        if (! Str::startsWith($image, 'storage/')) {
                                            $image = 'storage/'.ltrim($image, '/');
                                        }

                                        return $this->normalizeAssetUrl($image, $assetBase);
                                    }

                                    return $image;
                                }, array_filter($portfolio['images']));
                            } elseif (isset($portfolio['image']) && is_string($portfolio['image']) && ! empty($portfolio['image'])) {
                                // Fallback: if only single image exists, convert to array format
                                if (! Str::startsWith($portfolio['image'], ['http://', 'https://'])) {
                                    if (! Str::startsWith($portfolio['image'], 'storage/')) {
                                        $portfolio['image'] = 'storage/'.ltrim($portfolio['image'], '/');
                                    }
                                    $portfolio['image'] = $this->normalizeAssetUrl($portfolio['image'], $assetBase);
                                }
                                // Also set images array for consistency
                                $portfolio['images'] = [$portfolio['image']];
                            } else {
                                $portfolio['images'] = [];
                            }

                            // Normalize single image URL for backward compatibility (first image from array)
                            if (! empty($portfolio['images']) && is_array($portfolio['images'])) {
                                $portfolio['image'] = $portfolio['images'][0];
                            } elseif (empty($portfolio['image'])) {
                                $portfolio['image'] = null;
                            }

                            // Normalize industry image if present
                            if (isset($portfolio['industry']['image']) && ! empty($portfolio['industry']['image'])) {
                                if (! Str::startsWith($portfolio['industry']['image'], ['http://', 'https://'])) {
                                    if (! Str::startsWith($portfolio['industry']['image'], 'storage/')) {
                                        $portfolio['industry']['image'] = 'storage/'.ltrim($portfolio['industry']['image'], '/');
                                    }
                                    $portfolio['industry']['image'] = $this->normalizeAssetUrl(
                                        (string) $portfolio['industry']['image'],
                                        $assetBase
                                    );
                                }
                            }

                            return $portfolio;
                        }, $rawPortfolios);
                    }

                    // Don't retry on client errors (4xx)
                    if ($response->status() >= 400 && $response->status() < 500) {
                        Log::channel('api')->warning('Portfolio API client error', [
                            'status' => $response->status(),
                            'endpoint' => $endpoint,
                        ]);

                        return [];
                    }

                    // Retry on server errors (5xx)
                    $attempt++;
                    if ($attempt < $maxRetries) {
                        sleep(min($attempt, 3));

                        continue;
                    }

                    Log::channel('api')->error('Portfolio API request failed after retries', [
                        'status' => $response->status(),
                        'endpoint' => $endpoint,
                        'attempts' => $attempt,
                    ]);

                    return [];
                } catch (\Exception $e) {
                    $lastException = $e;
                    $attempt++;

                    Log::channel('api')->warning('Portfolio API network error', [
                        'exception' => get_class($e),
                        'message' => $e->getMessage(),
                        'endpoint' => $endpoint,
                        'attempt' => $attempt,
                    ]);

                    if ($attempt < $maxRetries) {
                        sleep(min($attempt, 3));

                        continue;
                    }
                }
            }

            // All retries exhausted
            Log::channel('api')->error('Portfolio API request failed completely', [
                'endpoint' => $endpoint,
                'attempts' => $attempt,
                'exception' => $lastException?->getMessage(),
            ]);

            return [];
        });
    }

    /**
     * Get cache key for portfolios API request.
     *
     * @param  array<string, mixed>  $params
     */
    protected function getPortfoliosCacheKey(array $params, ?string $locale): string
    {
        // Sort params for consistent cache keys
        ksort($params);
        $paramsHash = md5(json_encode($params));
        $localeKey = $locale ?? 'default';

        return "event_api_client:portfolios:{$localeKey}:{$paramsHash}";
    }
}
