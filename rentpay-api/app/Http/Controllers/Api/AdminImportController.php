<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Charge;
use App\Models\Lease;
use App\Models\Property;
use App\Models\Unit;
use App\Models\User;
use App\Services\LeaseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Validator;

class AdminImportController extends Controller
{
    public function __construct(private LeaseService $leaseService)
    {
    }

    public function importUnits(Request $request): JsonResponse
    {
        $admin = $this->requireAdmin($request);
        $file = $this->validateFile($request);

        [$rows, $errors] = $this->parseCsv($file->getRealPath(), ['property_id', 'name', 'notes']);
        if (! empty($errors)) {
            return response()->json(['errors' => $errors], 422);
        }

        $validationErrors = [];
        foreach ($rows as $index => $row) {
            $validator = Validator::make($row, [
                'property_id' => ['required', 'integer'],
                'name' => ['required', 'string'],
                'notes' => ['nullable', 'string'],
            ]);

            if ($validator->fails()) {
                $validationErrors[] = ['row' => $index + 2, 'errors' => $validator->errors()->all()];
                continue;
            }

            $property = Property::query()
                ->where('id', $row['property_id'])
                ->where('user_id', $admin->id)
                ->first();

            if (! $property) {
                $validationErrors[] = ['row' => $index + 2, 'errors' => ['Property not found for admin.']];
            }
        }

        if (! empty($validationErrors)) {
            return response()->json(['errors' => $validationErrors], 422);
        }

        foreach ($rows as $row) {
            Unit::create([
                'property_id' => (int) $row['property_id'],
                'name' => $row['name'],
                'notes' => Arr::get($row, 'notes'),
            ]);
        }

        return response()->json(['imported' => count($rows)]);
    }

    public function importLeases(Request $request): JsonResponse
    {
        $admin = $this->requireAdmin($request);
        $file = $this->validateFile($request);

        [$rows, $errors] = $this->parseCsv($file->getRealPath(), [
            'unit_id',
            'tenant_user_id',
            'rent_amount',
            'due_day',
            'start_date',
            'end_date',
        ]);

        if (! empty($errors)) {
            return response()->json(['errors' => $errors], 422);
        }

        $validationErrors = [];
        foreach ($rows as $index => $row) {
            $validator = Validator::make($row, [
                'unit_id' => ['required', 'integer'],
                'tenant_user_id' => ['required', 'integer'],
                'rent_amount' => ['required', 'integer', 'min:1'],
                'due_day' => ['required', 'integer', 'min:1', 'max:28'],
                'start_date' => ['required', 'date'],
                'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            ]);

            if ($validator->fails()) {
                $validationErrors[] = ['row' => $index + 2, 'errors' => $validator->errors()->all()];
                continue;
            }

            $unit = Unit::with('property')
                ->where('id', $row['unit_id'])
                ->first();

            if (! $unit || $unit->property?->user_id !== $admin->id) {
                $validationErrors[] = ['row' => $index + 2, 'errors' => ['Unit not found for admin.']];
            }

            $tenant = User::query()
                ->where('id', $row['tenant_user_id'])
                ->where('role', 'tenant')
                ->first();

            if (! $tenant) {
                $validationErrors[] = ['row' => $index + 2, 'errors' => ['Tenant user not found.']];
            }
        }

        if (! empty($validationErrors)) {
            return response()->json(['errors' => $validationErrors], 422);
        }

        foreach ($rows as $row) {
            $this->leaseService->createLease($admin, [
                'unit_id' => (int) $row['unit_id'],
                'tenant_user_id' => (int) $row['tenant_user_id'],
                'rent_amount' => (int) $row['rent_amount'],
                'due_day' => (int) $row['due_day'],
                'start_date' => $row['start_date'],
                'end_date' => $this->nullableValue(Arr::get($row, 'end_date')),
            ]);
        }

        return response()->json(['imported' => count($rows)]);
    }

    public function importCharges(Request $request): JsonResponse
    {
        $admin = $this->requireAdmin($request);
        $file = $this->validateFile($request);

        [$rows, $errors] = $this->parseCsv($file->getRealPath(), [
            'lease_id',
            'amount',
            'due_date',
            'status',
        ]);

        if (! empty($errors)) {
            return response()->json(['errors' => $errors], 422);
        }

        $validationErrors = [];
        foreach ($rows as $index => $row) {
            $validator = Validator::make($row, [
                'lease_id' => ['required', 'integer'],
                'amount' => ['required', 'integer', 'min:1'],
                'due_date' => ['required', 'date'],
                'status' => ['nullable', 'in:due,paid,void'],
            ]);

            if ($validator->fails()) {
                $validationErrors[] = ['row' => $index + 2, 'errors' => $validator->errors()->all()];
                continue;
            }

            $lease = Lease::with('unit.property')
                ->where('id', $row['lease_id'])
                ->first();

            if (! $lease || $lease->unit?->property?->user_id !== $admin->id) {
                $validationErrors[] = ['row' => $index + 2, 'errors' => ['Lease not found for admin.']];
            }
        }

        if (! empty($validationErrors)) {
            return response()->json(['errors' => $validationErrors], 422);
        }

        foreach ($rows as $row) {
            Charge::create([
                'lease_id' => (int) $row['lease_id'],
                'amount' => (int) $row['amount'],
                'due_date' => $row['due_date'],
                'status' => $row['status'] ?: 'due',
            ]);
        }

        return response()->json(['imported' => count($rows)]);
    }

    private function validateFile(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt'],
        ]);

        return $request->file('file');
    }

    private function requireAdmin(Request $request)
    {
        $user = $request->user();
        if (! $user || $user->role !== 'admin') {
            abort(403, 'Forbidden');
        }

        return $user;
    }

    private function parseCsv(string $path, array $requiredHeaders): array
    {
        $handle = fopen($path, 'r');
        if (! $handle) {
            return [[], [['row' => 1, 'errors' => ['Unable to read CSV file.']]]];
        }

        $headers = fgetcsv($handle);
        if (! $headers) {
            fclose($handle);
            return [[], [['row' => 1, 'errors' => ['CSV file is empty.']]]];
        }

        $headers = array_map(function ($h, $index) {
            $value = trim((string) $h);
            if ($index === 0) {
                $value = preg_replace('/^\xEF\xBB\xBF/', '', $value);
            }
            return strtolower($value);
        }, $headers, array_keys($headers));

        $missing = array_diff($requiredHeaders, $headers);
        if (! empty($missing)) {
            fclose($handle);
            return [[], [['row' => 1, 'errors' => ['Missing headers: '.implode(', ', $missing)]]]];
        }

        $rows = [];
        while (($row = fgetcsv($handle)) !== false) {
            if (count(array_filter($row, fn ($cell) => trim((string) $cell) !== '')) === 0) {
                continue;
            }
            $normalized = array_map(fn ($cell) => is_string($cell) ? trim($cell) : $cell, $row);
            $rows[] = array_combine($headers, array_pad($normalized, count($headers), null));
        }
        fclose($handle);

        return [$rows, []];
    }

    private function nullableValue($value)
    {
        if (is_string($value) && trim($value) === '') {
            return null;
        }

        return $value;
    }
}
