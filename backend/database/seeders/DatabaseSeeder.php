<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Coupon;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Admin User for L'VENUS
        User::updateOrCreate(
            ['email' => 'admin@lvenus.test'],
            [
                'name' => 'L’VENUS Administrator',
                'phone' => '+201012345678',
                'password' => Hash::make('password'),
            ]
        );

        // 2. Seed Default Coupons
        Coupon::updateOrCreate(
            ['code' => 'LVENUS10'],
            [
                'type' => 'percent',
                'value' => 10,
                'min_total' => 1000,
                'is_active' => true,
            ]
        );

        Coupon::updateOrCreate(
            ['code' => 'VENUS10'],
            [
                'type' => 'percent',
                'value' => 10,
                'min_total' => 1000,
                'is_active' => true,
            ]
        );

        Coupon::updateOrCreate(
            ['code' => 'MAISON20'],
            [
                'type' => 'percent',
                'value' => 20,
                'min_total' => 3000,
                'is_active' => true,
            ]
        );

        // 3. Seed Categories, Products and Shipping Zones
        $this->call([
            CategorySeeder::class,
            ProductSeeder::class,
            ShippingZoneSeeder::class,
        ]);
    }
}
