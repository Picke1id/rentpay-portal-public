<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('charge_id')->constrained('charges')->cascadeOnDelete();
            $table->string('provider')->default('stripe');
            $table->string('provider_payment_id')->nullable();
            $table->string('status')->default('pending');
            $table->unsignedInteger('amount');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['charge_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
