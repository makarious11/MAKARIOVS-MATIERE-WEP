<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ShippingZone;

class ShippingZoneSeeder extends Seeder
{
    public function run(): void
    {
        $zones = [
            ['governorate' => 'cairo', 'name_en' => 'Cairo', 'name_ar' => 'القاهرة', 'fee' => 50.00, 'eta_days' => '1–2 days'],
            ['governorate' => 'giza', 'name_en' => 'Giza', 'name_ar' => 'الجيزة', 'fee' => 50.00, 'eta_days' => '1–2 days'],
            ['governorate' => 'alexandria', 'name_en' => 'Alexandria', 'name_ar' => 'الإسكندرية', 'fee' => 60.00, 'eta_days' => '2–3 days'],
            ['governorate' => 'dakahlia', 'name_en' => 'Dakahlia (Mansoura)', 'name_ar' => 'الدقهلية (المنصورة)', 'fee' => 70.00, 'eta_days' => '2–4 days'],
            ['governorate' => 'gharbia', 'name_en' => 'Gharbia (Tanta)', 'name_ar' => 'الغربية (طنطا)', 'fee' => 70.00, 'eta_days' => '2–4 days'],
            ['governorate' => 'sharqia', 'name_en' => 'Sharqia (Zagazig)', 'name_ar' => 'الشرقية (الزقازيق)', 'fee' => 70.00, 'eta_days' => '2–4 days'],
            ['governorate' => 'monufia', 'name_en' => 'Monufia', 'name_ar' => 'المنوفية', 'fee' => 70.00, 'eta_days' => '2–4 days'],
            ['governorate' => 'qalyubia', 'name_en' => 'Qalyubia', 'name_ar' => 'القليوبية', 'fee' => 60.00, 'eta_days' => '1–3 days'],
            ['governorate' => 'beheira', 'name_en' => 'Beheira (Damanhur)', 'name_ar' => 'البحيرة (دمنهور)', 'fee' => 70.00, 'eta_days' => '2–4 days'],
            ['governorate' => 'kafr_el_sheikh', 'name_en' => 'Kafr El Sheikh', 'name_ar' => 'كفر الشيخ', 'fee' => 75.00, 'eta_days' => '2–4 days'],
            ['governorate' => 'damietta', 'name_en' => 'Damietta', 'name_ar' => 'دمياط', 'fee' => 75.00, 'eta_days' => '2–4 days'],
            ['governorate' => 'port_said', 'name_en' => 'Port Said', 'name_ar' => 'بورسعيد', 'fee' => 75.00, 'eta_days' => '2–4 days'],
            ['governorate' => 'ismailia', 'name_en' => 'Ismailia', 'name_ar' => 'الإسماعيلية', 'fee' => 75.00, 'eta_days' => '2–4 days'],
            ['governorate' => 'suez', 'name_en' => 'Suez', 'name_ar' => 'السويس', 'fee' => 75.00, 'eta_days' => '2–4 days'],
            ['governorate' => 'fayoum', 'name_en' => 'Fayoum', 'name_ar' => 'الفيوم', 'fee' => 80.00, 'eta_days' => '3–5 days'],
            ['governorate' => 'beni_suef', 'name_en' => 'Beni Suef', 'name_ar' => 'بني سويف', 'fee' => 80.00, 'eta_days' => '3–5 days'],
            ['governorate' => 'minya', 'name_en' => 'Minya', 'name_ar' => 'المنيا', 'fee' => 85.00, 'eta_days' => '3–5 days'],
            ['governorate' => 'asyut', 'name_en' => 'Asyut', 'name_ar' => 'أسيوط', 'fee' => 85.00, 'eta_days' => '3–5 days'],
            ['governorate' => 'sohag', 'name_en' => 'Sohag', 'name_ar' => 'سوهاج', 'fee' => 90.00, 'eta_days' => '3–5 days'],
            ['governorate' => 'qena', 'name_en' => 'Qena', 'name_ar' => 'قنا', 'fee' => 90.00, 'eta_days' => '3–5 days'],
            ['governorate' => 'luxor', 'name_en' => 'Luxor', 'name_ar' => 'الأقصر', 'fee' => 95.00, 'eta_days' => '3–5 days'],
            ['governorate' => 'aswan', 'name_en' => 'Aswan', 'name_ar' => 'أسوان', 'fee' => 95.00, 'eta_days' => '3–5 days'],
            ['governorate' => 'red_sea', 'name_en' => 'Red Sea', 'name_ar' => 'البحر الأحمر', 'fee' => 95.00, 'eta_days' => '3–5 days'],
            ['governorate' => 'south_sinai', 'name_en' => 'South Sinai', 'name_ar' => 'جنوب سيناء', 'fee' => 100.00, 'eta_days' => '3–5 days'],
            ['governorate' => 'north_sinai', 'name_en' => 'North Sinai', 'name_ar' => 'شمال سيناء', 'fee' => 110.00, 'eta_days' => '4–6 days'],
            ['governorate' => 'matrouh', 'name_en' => 'Matrouh', 'name_ar' => 'مطروح', 'fee' => 100.00, 'eta_days' => '3–5 days'],
            ['governorate' => 'new_valley', 'name_en' => 'New Valley', 'name_ar' => 'الوادي الجديد', 'fee' => 110.00, 'eta_days' => '4–6 days'],
        ];

        foreach ($zones as $zone) {
            ShippingZone::updateOrCreate(['governorate' => $zone['governorate']], $zone);
        }
    }
}

