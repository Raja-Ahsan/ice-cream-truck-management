<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('truck_inventory_snapshots', function (Blueprint $table) {
            $table->string('review_status', 20)->default('pending_review')->after('snapshot_at'); // pending_review, approved, flagged
            $table->timestamp('reviewed_at')->nullable()->after('review_status');
            $table->foreignId('reviewed_by')->nullable()->after('reviewed_at')->constrained('users')->nullOnDelete();
        });

        Schema::table('inventory_products', function (Blueprint $table) {
            $table->unsignedInteger('quantity_in_stock')->default(0)->after('unit');
        });
    }

    public function down(): void
    {
        Schema::table('truck_inventory_snapshots', function (Blueprint $table) {
            $table->dropForeign(['reviewed_by']);
            $table->dropColumn(['review_status', 'reviewed_at', 'reviewed_by']);
        });

        Schema::table('inventory_products', function (Blueprint $table) {
            $table->dropColumn('quantity_in_stock');
        });
    }
};
