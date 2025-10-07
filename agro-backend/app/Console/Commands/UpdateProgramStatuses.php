<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\SubsidyProgram;
use Illuminate\Support\Facades\DB;

class UpdateProgramStatuses extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'programs:update-statuses';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Auto-update subsidy program statuses based on start and end dates';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $now = now();

        DB::transaction(function () use ($now) {
            // Move approved programs with future start dates to pending (upcoming)
            // Note: These should already be pending on approval if start_date is future
            // This ensures consistency if any drift occurs.
            SubsidyProgram::where('approval_status', 'approved')
                ->where('start_date', '>', $now)
                ->whereIn('status', ['pending', 'ongoing'])
                ->update(['status' => 'pending']);

            // Move approved programs to ongoing when start date is reached
            SubsidyProgram::where('approval_status', 'approved')
                ->where('start_date', '<=', $now)
                ->where('end_date', '>=', $now)
                ->where('status', '!=', 'ongoing')
                ->update(['status' => 'ongoing']);

            // Complete programs when end date has passed
            SubsidyProgram::where('approval_status', 'approved')
                ->where('end_date', '<', $now)
                ->whereIn('status', ['pending', 'ongoing'])
                ->update(['status' => 'completed']);
        });

        $this->info('Program statuses updated successfully.');
        return Command::SUCCESS;
    }
}


