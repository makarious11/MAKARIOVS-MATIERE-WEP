export interface GovernorateOption {
  value: string;
  name_en: string;
  name_ar: string;
  fee: number;
  eta_days: string;
}

export const EGYPT_GOVERNORATES: GovernorateOption[] = [
  { value: 'cairo', name_en: 'Cairo', name_ar: 'القاهرة', fee: 50, eta_days: '1–2 days' },
  { value: 'giza', name_en: 'Giza', name_ar: 'الجيزة', fee: 50, eta_days: '1–2 days' },
  { value: 'alexandria', name_en: 'Alexandria', name_ar: 'الإسكندرية', fee: 60, eta_days: '2–3 days' },
  { value: 'dakahlia', name_en: 'Dakahlia (Mansoura)', name_ar: 'الدقهلية (المنصورة)', fee: 70, eta_days: '2–4 days' },
  { value: 'gharbia', name_en: 'Gharbia (Tanta)', name_ar: 'الغربية (طنطا)', fee: 70, eta_days: '2–4 days' },
  { value: 'sharqia', name_en: 'Sharqia (Zagazig)', name_ar: 'الشرقية (الزقازيق)', fee: 70, eta_days: '2–4 days' },
  { value: 'monufia', name_en: 'Monufia', name_ar: 'المنوفية', fee: 70, eta_days: '2–4 days' },
  { value: 'qalyubia', name_en: 'Qalyubia', name_ar: 'القليوبية', fee: 60, eta_days: '1–3 days' },
  { value: 'beheira', name_en: 'Beheira (Damanhur)', name_ar: 'البحيرة (دمنهور)', fee: 70, eta_days: '2–4 days' },
  { value: 'kafr_el_sheikh', name_en: 'Kafr El Sheikh', name_ar: 'كفر الشيخ', fee: 75, eta_days: '2–4 days' },
  { value: 'damietta', name_en: 'Damietta', name_ar: 'دمياط', fee: 75, eta_days: '2–4 days' },
  { value: 'port_said', name_en: 'Port Said', name_ar: 'بورسعيد', fee: 75, eta_days: '2–4 days' },
  { value: 'ismailia', name_en: 'Ismailia', name_ar: 'الإسماعيلية', fee: 75, eta_days: '2–4 days' },
  { value: 'suez', name_en: 'Suez', name_ar: 'السويس', fee: 75, eta_days: '2–4 days' },
  { value: 'fayoum', name_en: 'Fayoum', name_ar: 'الفيوم', fee: 80, eta_days: '3–5 days' },
  { value: 'beni_suef', name_en: 'Beni Suef', name_ar: 'بني سويف', fee: 80, eta_days: '3–5 days' },
  { value: 'minya', name_en: 'Minya', name_ar: 'المنيا', fee: 85, eta_days: '3–5 days' },
  { value: 'asyut', name_en: 'Asyut', name_ar: 'أسيوط', fee: 85, eta_days: '3–5 days' },
  { value: 'sohag', name_en: 'Sohag', name_ar: 'سوهاج', fee: 90, eta_days: '3–5 days' },
  { value: 'qena', name_en: 'Qena', name_ar: 'قنا', fee: 90, eta_days: '3–5 days' },
  { value: 'luxor', name_en: 'Luxor', name_ar: 'الأقصر', fee: 95, eta_days: '3–5 days' },
  { value: 'aswan', name_en: 'Aswan', name_ar: 'أسوان', fee: 95, eta_days: '3–5 days' },
  { value: 'red_sea', name_en: 'Red Sea (Hurghada/Gouna)', name_ar: 'البحر الأحمر (الغردقة/الجونة)', fee: 95, eta_days: '3–5 days' },
  { value: 'south_sinai', name_en: 'South Sinai (Sharm El Sheikh/Dahab)', name_ar: 'جنوب سيناء (شرم الشيخ/دهب)', fee: 100, eta_days: '3–5 days' },
  { value: 'north_sinai', name_en: 'North Sinai', name_ar: 'شمال سيناء', fee: 110, eta_days: '4–6 days' },
  { value: 'matrouh', name_en: 'Matrouh (Sahel)', name_ar: 'مطروح (الساحل)', fee: 100, eta_days: '3–5 days' },
  { value: 'new_valley', name_en: 'New Valley', name_ar: 'الوادي الجديد', fee: 110, eta_days: '4–6 days' },
];

