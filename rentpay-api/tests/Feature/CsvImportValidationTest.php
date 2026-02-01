<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CsvImportValidationTest extends TestCase
{
    use RefreshDatabase;

    public function test_import_rejects_missing_headers(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);

        $csv = "name,notes\nUnit A,Main floor\n";
        $file = UploadedFile::fake()->createWithContent('units.csv', $csv);

        $this->postJson('/api/admin/import/units', ['file' => $file])
            ->assertStatus(422)
            ->assertJsonStructure(['errors']);
    }
}
