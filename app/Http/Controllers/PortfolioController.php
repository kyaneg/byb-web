<?php

namespace App\Http\Controllers;

use App\Services\EventApiClient;
use App\Services\LocaleService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class PortfolioController extends Controller
{
    public function index(Request $request, EventApiClient $client, LocaleService $localeService): Response
    {
        $locale = $localeService->resolveFromRequest($request);

        $portfolios = $client->fetchPortfolios([
            'limit' => 3,
            'locale' => $locale,
            'include' => 'industry',
        ], $locale);

        Log::channel('api')->info('Portfolios fetched for welcome page', [
            'count' => count($portfolios),
            'locale' => $locale,
            'ip' => $request->ip(),
        ]);

        return Inertia::render('Portfolio', [
            'portfolios' => $portfolios,
            'locale' => $locale,
        ]);
    }
}
