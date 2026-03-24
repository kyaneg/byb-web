<?php

use App\Http\Controllers\CalendarController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\PortfolioController;
use App\Http\Controllers\WelcomeController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [WelcomeController::class, 'index'])->name('welcome');
Route::get('/portfolio', [PortfolioController::class, 'index'])->name('portfolio');

Route::get('/calendar', [CalendarController::class, 'index'])->name('calendar.index');
Route::get('/calendar/event/{eventId}', [CalendarController::class, 'showEvent'])->name('calendar.event.show');

Route::get('/about', function () {
    return Inertia::render('About');
})->name('about');

Route::get('/services', function () {
    return Inertia::render('Services');
})->name('services');

Route::controller(ContactController::class)->group(function () {
    Route::get('/contact', 'index')->name('contact');
    Route::post('/contact', 'send')->name('contact.send');
});

Route::get('/admin', fn() => redirect('https://admin.buildyourbooth.net'))->name('admin');

// require __DIR__ . '/auth.php';
