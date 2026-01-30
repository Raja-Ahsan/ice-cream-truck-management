<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ServiceArea extends Model
{
    protected $fillable = [
        'name',
        'zip_code',
        'center_lat',
        'center_lng',
        'radius_km',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'center_lat' => 'decimal:7',
            'center_lng' => 'decimal:7',
        ];
    }
}
