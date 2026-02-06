<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('trucks', function (Blueprint $table) {
            $table->string('truck_number', 50)->nullable()->after('name');
            $table->string('model', 100)->nullable()->after('truck_number');
            $table->unsignedInteger('capacity')->nullable()->after('model');
        });
    }

    public function down(): void
    {
        Schema::table('trucks', function (Blueprint $table) {
            $table->dropColumn(['truck_number', 'model', 'capacity']);
        });
    }
};
