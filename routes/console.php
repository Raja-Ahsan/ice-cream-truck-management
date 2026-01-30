<?php

use App\Jobs\CleanInactiveGpsSessionsJob;
use App\Jobs\DailySummaryToAdminJob;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::job(new DailySummaryToAdminJob)->dailyAt('07:00');
Schedule::job(new CleanInactiveGpsSessionsJob)->dailyAt('03:00');
