<?php

namespace Database\Seeders;

use App\Models\StoreSetting;
use Illuminate\Database\Seeder;

class StoreSettingsSeeder extends Seeder
{
    private const SETTINGS = [
        'store' => [
            'name' => 'Immersive',
            'tagline' => 'Premium essentials, thoughtfully crafted.',
            'support_email' => 'support@immersive.test',
            'support_phone' => '+91 98765 43210',
            'address' => 'Indiranagar, Bengaluru, Karnataka 560038, India',
            'announcement' => '',
        ],
        'shipping' => [
            'free_shipping_threshold' => '100',
            'standard_fee' => '9.99',
            'express_fee' => '24.99',
            'free_shipping_enabled' => 'true',
            'express_enabled' => 'true',
        ],
        'tax' => [
            'tax_rate' => '8',
            'tax_inclusive' => 'false',
        ],
        'profile' => [
            'company_name' => 'Immersive Labs Pvt Ltd',
            'company_address' => 'Indiranagar, Bengaluru, Karnataka 560038, India',
            'gstin' => '29ABCDE1234F1Z5',
            'website' => 'https://immersive.test',
        ],
        'security' => [
            'allow_guest_checkout' => 'true',
            'require_login_for_checkout' => 'false',
            'maintenance_mode' => 'false',
        ],
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (self::SETTINGS as $group => $values) {
            foreach ($values as $key => $value) {
                StoreSetting::set($group, $key, $value);
            }
        }

        $this->command?->info('Store settings seeded.');
    }
}