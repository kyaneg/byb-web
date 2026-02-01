<?php

namespace Tests\Unit\Services;

use App\Services\EventApiClient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class EventApiClientTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Config::set('events.api_base_url', 'https://byb-db.test/api');
        Config::set('events.asset_base_url', 'https://byb-db.test');
        Config::set('events.default_locale', 'en');
    }

    public function test_fetches_events_from_api(): void
    {
        Http::fake([
            'byb-db.test/api/v1/events*' => Http::response([
                'data' => [
                    [
                        'id' => 1,
                        'title' => 'Test Event',
                        'start_datetime' => '2024-01-01T10:00:00Z',
                        'end_datetime' => '2024-01-01T12:00:00Z',
                    ],
                ],
                'meta' => [
                    'current_page' => 1,
                    'total' => 1,
                ],
            ], 200),
        ]);

        $client = new EventApiClient;
        $result = $client->fetchEvents();

        $this->assertArrayHasKey('events', $result);
        $this->assertArrayHasKey('meta', $result);
        $this->assertCount(1, $result['events']);
        $this->assertEquals('Test Event', $result['events'][0]['title']);
    }

    public function test_handles_api_errors_gracefully(): void
    {
        Http::fake([
            'byb-db.test/api/v1/events*' => Http::response([
                'message' => 'Server Error',
            ], 500),
        ]);

        $client = new EventApiClient;
        $result = $client->fetchEvents();

        $this->assertEquals([], $result['events']);
        $this->assertTrue($result['meta']['error']);
        $this->assertEquals(500, $result['meta']['status']);
    }

    public function test_normalizes_event_data(): void
    {
        Http::fake([
            'byb-db.test/api/v1/events*' => Http::response([
                'data' => [
                    [
                        'id' => 1,
                        'title' => 'Test Event',
                        'start_datetime' => '2024-01-01T10:00:00Z',
                        'end_datetime' => '2024-01-01T12:00:00Z',
                        'images' => ['/storage/images/event1.jpg'],
                        'organizers' => [
                            [
                                'id' => 1,
                                'name' => 'Test Organizer',
                                'image' => '/storage/images/organizer1.jpg',
                            ],
                        ],
                    ],
                ],
            ], 200),
        ]);

        $client = new EventApiClient;
        $result = $client->fetchEvents();

        $event = $result['events'][0];
        $this->assertArrayHasKey('startDateTime', $event);
        $this->assertArrayHasKey('endDateTime', $event);
        $this->assertArrayHasKey('allDay', $event);
        $this->assertStringContainsString('https://byb-db.test', $event['images'][0]);
        $this->assertStringContainsString('https://byb-db.test', $event['organizers'][0]['image']);
    }

    public function test_normalizes_asset_urls(): void
    {
        Http::fake([
            'byb-db.test/api/v1/events*' => Http::response([
                'data' => [
                    [
                        'id' => 1,
                        'title' => 'Test Event',
                        'images' => ['/storage/images/event1.jpg'],
                    ],
                ],
            ], 200),
        ]);

        $client = new EventApiClient;
        $result = $client->fetchEvents();

        $this->assertEquals('https://byb-db.test/storage/images/event1.jpg', $result['events'][0]['images'][0]);
    }

    public function test_detects_all_day_events(): void
    {
        Http::fake([
            'byb-db.test/api/v1/events*' => Http::response([
                'data' => [
                    [
                        'id' => 1,
                        'title' => 'All Day Event',
                        'start_datetime' => '2024-01-01T00:00:00Z',
                        'end_datetime' => '2024-01-01T23:59:59Z',
                    ],
                    [
                        'id' => 2,
                        'title' => 'Regular Event',
                        'start_datetime' => '2024-01-01T10:00:00Z',
                        'end_datetime' => '2024-01-01T12:00:00Z',
                    ],
                ],
            ], 200),
        ]);

        $client = new EventApiClient;
        $result = $client->fetchEvents();

        $this->assertTrue($result['events'][0]['allDay']);
        $this->assertFalse($result['events'][1]['allDay']);
    }

    public function test_fetches_portfolios_from_api(): void
    {
        Http::fake([
            'byb-db.test/api/v1/portfolios*' => Http::response([
                'data' => [
                    [
                        'id' => 1,
                        'title' => 'Test Portfolio',
                        'image' => '/storage/images/portfolio1.jpg',
                    ],
                ],
            ], 200),
        ]);

        $client = new EventApiClient;
        $result = $client->fetchPortfolios();

        $this->assertCount(1, $result);
        $this->assertEquals('Test Portfolio', $result[0]['title']);
    }

    public function test_normalizes_portfolio_images(): void
    {
        Http::fake([
            'byb-db.test/api/v1/portfolios*' => Http::response([
                'data' => [
                    [
                        'id' => 1,
                        'title' => 'Test Portfolio',
                        'images' => ['images/portfolio1.jpg'],
                    ],
                ],
            ], 200),
        ]);

        $client = new EventApiClient;
        $result = $client->fetchPortfolios();

        $this->assertStringContainsString('https://byb-db.test', $result[0]['images'][0]);
    }

    public function test_handles_portfolio_api_errors(): void
    {
        Http::fake([
            'byb-db.test/api/v1/portfolios*' => Http::response([
                'message' => 'Not Found',
            ], 404),
        ]);

        $client = new EventApiClient;
        $result = $client->fetchPortfolios();

        $this->assertEquals([], $result);
    }
}
