<?php

namespace App\Services;

use App\Models\Charge;
use App\Models\Lease;
use App\Models\Unit;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\DatabaseManager;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class LeaseService
{
    public function __construct(private DatabaseManager $db)
    {
    }

    /**
     * @param array<string, mixed> $data
     */
    public function createLease(User $admin, array $data): Lease
    {
        $unit = Unit::with('property')->find($data['unit_id']);

        if (! $unit || $unit->property?->user_id !== $admin->id) {
            throw new ModelNotFoundException('Unit not found.');
        }

        return $this->db->transaction(function () use ($data): Lease {
            $lease = Lease::create($data);

            $dueDate = $this->initialDueDate(
                Carbon::parse($data['start_date']),
                (int) $data['due_day']
            );

            Charge::create([
                'lease_id' => $lease->id,
                'amount' => $lease->rent_amount,
                'due_date' => $dueDate->toDateString(),
                'status' => 'due',
            ]);

            return $lease;
        });
    }

    private function initialDueDate(Carbon $startDate, int $dueDay): Carbon
    {
        $candidate = $startDate->copy()->day($dueDay);

        if ($startDate->day > $dueDay) {
            $candidate = $candidate->addMonthNoOverflow();
        }

        return $candidate;
    }
}
