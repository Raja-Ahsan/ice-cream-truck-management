<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->date('event_date');
            $table->time('event_time');
            $table->unsignedInteger('duration_minutes');
            $table->foreignId('package_id')->constrained()->cascadeOnDelete();
            $table->string('customer_name');
            $table->string('customer_phone');
            $table->string('customer_email');
            $table->text('event_address');
            $table->text('special_notes')->nullable();
            $table->string('status')->default('pending'); // pending, confirmed, assigned, dispatched, in_progress, completed, cancelled
            $table->string('payment_status')->default('pending'); // pending, authorized, paid, failed, refunded
            $table->string('stripe_payment_intent_id')->nullable();
            $table->decimal('total_amount', 10, 2);
            $table->foreignId('truck_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('driver_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('dispatched_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
