<?php

namespace App\Http\Controllers;

use App\Services\EventApiClient;
use App\Services\LocaleService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class CalendarController extends Controller
{
    /**
     * API relationships to include in event responses.
     */
    private const EVENT_INCLUDES = 'eventStatus,eventType,industry,country,organizers,venue,tags,colocatedEvents';

    public function index(Request $request, EventApiClient $client, LocaleService $localeService): Response
    {
        $now = now();

        $month = (int) $request->query('month', $now->month);
        $year = (int) $request->query('year', $now->year);
        $locale = $localeService->resolveFromRequest($request);

        $current = Carbon::createFromDate($year, $month, 1)->startOfMonth();
        $startDate = $current->copy()->startOfMonth()->toDateString();
        $endDate = $current->copy()->endOfMonth()->toDateString();

        $filters = $request->only([
            'status',
            'type',
            'industry',
            'country',
            'organizer',
            'venue',
            'tags',
            'search',
        ]);

        $apiParams = array_merge($filters, [
            'start_date' => $startDate,
            'end_date' => $endDate,
            'include' => self::EVENT_INCLUDES,
            'per_page' => 100,
        ]);

        $eventsPayload = $client->fetchEvents($apiParams, $locale);
        $events = $eventsPayload['events'] ?? [];

        $hasActiveFilters = ! empty(array_filter($filters));

        if ($hasActiveFilters) {
            $optionsParams = [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'include' => self::EVENT_INCLUDES,
                'per_page' => 100,
            ];

            $optionsPayload = $client->fetchEvents($optionsParams, $locale);
            $allEventsForMonth = $optionsPayload['events'] ?? [];
        } else {
            $allEventsForMonth = $events;
        }

        $filterOptionsForCurrentMonth = [
            'types' => $this->buildFilterOptions($allEventsForMonth, 'type'),
            'industries' => $this->buildFilterOptions($allEventsForMonth, 'industry'),
            'countries' => $this->buildFilterOptions($allEventsForMonth, 'country'),
            'statuses' => $this->buildFilterOptions($allEventsForMonth, 'status'),
            'tags' => $this->buildFilterOptions($allEventsForMonth, 'tags', true),
        ];

        Log::channel('api')->info('Calendar page viewed', [
            'month' => $month,
            'year' => $year,
            'locale' => $locale,
            'event_count' => count($events),
            'has_filters' => $hasActiveFilters,
            'filters' => $filters,
            'ip' => $request->ip(),
        ]);

        return Inertia::render('Calendar/Index', [
            'initialMonth' => $month,
            'initialYear' => $year,
            'events' => $events,
            'filters' => [
                'options' => $filterOptionsForCurrentMonth,
                'active' => $filters,
            ],
            'meta' => $eventsPayload['meta'] ?? [],
            'ui' => [
                'showJumpMonths' => (bool) config('events.show_jump_months', true),
            ],
            'locale' => $locale,
        ]);
    }

    /**
     * Fetch a single event with its related and co-located events.
     * Used when clicking on a related/co-located event to get its full data.
     */
    public function showEvent(Request $request, int $eventId, EventApiClient $client, LocaleService $localeService): \Illuminate\Http\JsonResponse
    {
        $locale = $localeService->resolveFromRequest($request);

        try {
            $apiParams = [
                'include' => self::EVENT_INCLUDES,
                'include_related' => true,
            ];

            // Fetch the specific event from the API
            $response = $client->client($locale)->get("v1/events/{$eventId}", $apiParams);

            if ($response->successful()) {
                $json = $response->json();
                $rawEvent = \Illuminate\Support\Arr::get($json, 'data', $json);

                // Normalize the event using the same method as the main events list
                $normalizedEvents = $client->normalizeEvents([$rawEvent]);
                $event = $normalizedEvents[0] ?? null;

                if ($event) {
                    return response()->json(['event' => $event]);
                }
            }

            return response()->json(['error' => 'Event not found'], 404);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::channel('api')->error('Error fetching event', [
                'event_id' => $eventId,
                'error' => $e->getMessage(),
                'exception' => get_class($e),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'Failed to fetch event',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Build filter options from events collection.
     *
     * @param  array<int, array<string, mixed>>  $events
     * @return array<int, mixed>
     */
    protected function buildFilterOptions(array $events, string $key, bool $flatten = false): array
    {
        $collection = collect($events)->pluck($key);

        if ($flatten) {
            $collection = $collection->flatten(1);
        }

        return $collection
            ->filter()
            ->unique('id')
            ->values()
            ->all();
    }
}
