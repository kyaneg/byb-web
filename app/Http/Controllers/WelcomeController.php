<?php

namespace App\Http\Controllers;

use App\Services\EventApiClient;
use App\Services\LocaleService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class WelcomeController extends Controller
{
    public function index(Request $request, EventApiClient $client, LocaleService $localeService): Response
    {
        $locale = $localeService->resolveFromRequest($request);

        return Inertia::render('Welcome', [
            'locale' => $locale,
        ]);
    }
}
