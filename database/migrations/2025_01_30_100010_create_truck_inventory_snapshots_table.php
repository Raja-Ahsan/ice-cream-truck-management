<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('truck_inventory_snapshot_lines');
        Schema::dropIfExists('truck_inventory_snapshots');

        Schema::create('truck_inventory_snapshots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('truck_id')->constrained()->cascadeOnDelete();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->timestamp('snapshot_at');
            $table->timestamps();
        });

        Schema::create('truck_inventory_snapshot_lines', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('truck_inventory_snapshot_id');
            $table->foreign('truck_inventory_snapshot_id', 'truck_inv_snap_line_snap_id_foreign')->references('id')->on('truck_inventory_snapshots')->cascadeOnDelete();
            $table->foreignId('inventory_product_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('quantity_assigned')->default(0);
            $table->unsignedInteger('quantity_used')->nullable();
            $table->unsignedInteger('quantity_remaining')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('truck_inventory_snapshot_lines');
        Schema::dropIfExists('truck_inventory_snapshots');
    }
};
