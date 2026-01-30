<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class Setting extends Model
{
    protected $fillable = ['key', 'value', 'is_encrypted', 'group'];

    protected function casts(): array
    {
        return ['is_encrypted' => 'boolean'];
    }

    public static function get(string $key, $default = null)
    {
        $row = static::where('key', $key)->first();
        if (! $row) {
            return $default;
        }
        if ($row->is_encrypted && $row->value) {
            try {
                return Crypt::decryptString($row->value);
            } catch (\Throwable $e) {
                return $default;
            }
        }
        return $row->value ?? $default;
    }

    public static function set(string $key, $value, bool $encrypt = false, string $group = 'general'): void
    {
        if ($encrypt && $value !== null && $value !== '') {
            $value = Crypt::encryptString($value);
        }
        static::updateOrCreate(
            ['key' => $key],
            ['value' => $value, 'is_encrypted' => $encrypt, 'group' => $group]
        );
    }

    public static function getGroup(string $group, bool $maskSecrets = false): array
    {
        $items = static::where('group', $group)->get();
        $out = [];
        foreach ($items as $item) {
            $value = $item->value;
            if ($item->is_encrypted && $value) {
                try {
                    $value = Crypt::decryptString($value);
                } catch (\Throwable $e) {
                    $value = '';
                }
                if ($maskSecrets) {
                    $value = strlen($value) > 8 ? substr($value, 0, 4) . '••••••••' . substr($value, -4) : '••••••••';
                }
            }
            $out[$item->key] = $value;
        }
        return $out;
    }

    public static function setGroup(string $group, array $data, array $encryptedKeys = []): void
    {
        foreach ($data as $key => $value) {
            if ($value === null || $value === '') {
                continue;
            }
            $encrypt = in_array($key, $encryptedKeys, true);
            static::set($key, $value, $encrypt, $group);
        }
    }
}
