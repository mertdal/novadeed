export type Language = 'en' | 'tr';

export interface TranslationSchema {
  // Auth & Generic
  signin: string;
  signup: string;
  logout: string;
  email_label: string;
  password_label: string;
  owner_name_label: string;
  custom_name_label: string;
  confirm_purchase: string;
  purchasing: string;
  success: string;
  error: string;
  syncing: string;
  total: string;
  registry_stored: string;
  already_have_account: string;
  dont_have_account: string;

  // Navigation & HUD
  search_stars: string;
  search_placeholder: string;
  dashboard: string;
  explore_cosmos: string;
  close_drawer: string;
  back: string;
  fly_to: string;
  certificate: string;
  navigation: string;
  star_navigation: string;
  orbiting: string;
  
  // Controls
  pan_alignment: string;
  telemetry_zoom: string;
  thruster: string;
  acquire_data: string;
  
  // Landing Page
  explore_universe: string;
  universe: string;
  landing_subtitle: string;
  initialize_join: string;
  resume_session: string;
  new_explorer: string;
  identity_verification: string;
  establish_link: string;
  restore_access: string;
  create_link: string;
  authorize_access: string;
  
  // Star Details
  class: string;
  star_id: string;
  distance: string;
  magnitude: string;
  spectral_class: string;
  unclaimed: string;
  already_owned: string;
  claim_this_star: string;
  purchase_star: string;
  black_hole: string;
  
  // New Technical translations
  nasa_real_data: string;
  singularity: string;
  status_classified: string;
  status_unclaimed: string;
  named_by: string;
  registration_fee: string;

  // Spectral Names
  spectral_blue_supergiant: string;
  spectral_blue_white_giant: string;
  spectral_white_star: string;
  spectral_yellow_white_star: string;
  spectral_yellow_dwarf: string;
  spectral_orange_dwarf: string;
  spectral_red_dwarf: string;
  
  // Dashboard Stats
  stars_owned: string;
  rank: string;
  stellar_explorer: string;
  my_collection: string;
  no_stars_yet: string;
}

export const translations: Record<Language, TranslationSchema> = {
  en: {
    // Auth & Generic
    signin: 'Sign In',
    signup: 'Sign Up',
    logout: 'Logout',
    email_label: 'Electronic Mail Address',
    password_label: 'Security Access Key',
    owner_name_label: 'Registry Owner Name',
    custom_name_label: 'Designated Star Name',
    confirm_purchase: 'Confirm Acquisition',
    purchasing: 'Processing...',
    success: 'Authorization Success',
    error: 'System Error',
    syncing: 'Syncing...',
    total: 'Total',
    registry_stored: 'Registry data stored in galactic archive.',
    already_have_account: 'System Access Key already exists?',
    dont_have_account: 'First mission?',

    // Navigation & HUD
    search_stars: 'Search Stars...',
    search_placeholder: 'Analyze celestial coordinates...',
    dashboard: 'User Dashboard',
    explore_cosmos: 'Explore Cosmos',
    close_drawer: 'Close Drawer',
    back: 'Back',
    fly_to: 'Fly To',
    certificate: 'See Certificate',
    navigation: 'System Navigation',
    star_navigation: 'STAR NAVIGATION',
    orbiting: 'Orbiting',
    
    // Controls
    pan_alignment: 'PAN ALIGNMENT',
    telemetry_zoom: 'TELEMETRY ZOOM',
    thruster: 'THRUSTER',
    acquire_data: 'ACQUIRE DATA',
    
    // Landing Page
    explore_universe: 'Explore Universe',
    universe: 'Universe',
    landing_subtitle: 'The premier decentralized galactic registry. Secure your legacy among the stars with quantum-encrypted ownership.',
    initialize_join: 'Initialize / Join Registry',
    resume_session: 'Resume Session',
    new_explorer: 'New Explorer',
    identity_verification: 'Identity Verification',
    establish_link: 'Establish uplink to the StarBound network.',
    restore_access: 'Restore your galactic presence.',
    create_link: 'Create Link',
    authorize_access: 'Authorize Access',
    
    // Star Details
    class: 'Class',
    star_id: 'Star ID',
    distance: 'Distance',
    magnitude: 'Magnitude',
    spectral_class: 'Spectral Class',
    unclaimed: 'Unclaimed',
    already_owned: 'Already Named',
    claim_this_star: 'Claim this Star',
    purchase_star: 'Secure Star Registry',
    black_hole: 'Gravitational Singularity',
    
    // New Technical translations
    nasa_real_data: 'NASA REAL DATA',
    singularity: 'SINGULARITY',
    status_classified: 'STATUS: CLASSIFIED',
    status_unclaimed: 'STATUS: UNCLAIMED',
    named_by: 'Named by',
    registration_fee: 'REGISTRATION_FEE',

    // Spectral Names
    spectral_blue_supergiant: 'Blue Supergiant',
    spectral_blue_white_giant: 'Blue-White Giant',
    spectral_white_star: 'White Star',
    spectral_yellow_white_star: 'Yellow-White Star',
    spectral_yellow_dwarf: 'Yellow Dwarf (Sun-like)',
    spectral_orange_dwarf: 'Orange Dwarf',
    spectral_red_dwarf: 'Red Dwarf',
    
    // Dashboard Stats
    stars_owned: 'Stars Owned',
    rank: 'Explorer Rank',
    stellar_explorer: 'Stellar Explorer',
    my_collection: 'My Star Collection',
    no_stars_yet: 'No stars in your registry yet.',
  },
  tr: {
    // Auth & Generic
    signin: 'Giriş Yap',
    signup: 'Kayıt Ol',
    logout: 'Oturumu Kapat',
    email_label: 'Elektronik Posta Adresi',
    password_label: 'Güvenlik Erişim Anahtarı',
    owner_name_label: 'Kayıt Sahibi Adı',
    custom_name_label: 'Belirlenen Yıldız Adı',
    confirm_purchase: 'Edinmeyi Onayla',
    purchasing: 'İşleniyor...',
    success: 'Yetkilendirme Başarılı',
    error: 'Sistem Hatası',
    syncing: 'Eşitleniyor...',
    total: 'Toplam',
    registry_stored: 'Kayıt verileri galaktik arşive kaydedildi.',
    already_have_account: 'Erişim anahtarınız var mı?',
    dont_have_account: 'İlk göreviniz mi?',

    // Navigation & HUD
    search_stars: 'Yıldız Ara...',
    search_placeholder: 'Göksel koordinatları analiz et...',
    dashboard: 'Kullanıcı Paneli',
    explore_cosmos: 'Kozmosu Keşfet',
    close_drawer: 'Paneli Kapat',
    back: 'Geri',
    fly_to: 'Git',
    certificate: 'Sertifikayı Gör',
    navigation: 'Sistem Navigasyonu',
    star_navigation: 'YILDIZ NAVİGASYONU',
    orbiting: 'Yörüngede',

    // Controls
    pan_alignment: 'PAN HİZALAMA',
    telemetry_zoom: 'TELEMETRİ ZOOM',
    thruster: 'İTİCİ GÜÇ',
    acquire_data: 'VERİ EDİN',

    // Landing Page
    explore_universe: 'Evreni Keşfet',
    universe: 'Evren',
    landing_subtitle: 'Lider merkeziyetsiz galaktik kayıt defteri. Kuantum şifreli mülkiyet ile yıldızlar arasındaki mirasınızı güvence altına alın.',
    initialize_join: 'Başlat / Kayda Katıl',
    resume_session: 'Oturuma Devam Et',
    new_explorer: 'Yeni Kaşif',
    identity_verification: 'Kimlik Doğrulama',
    establish_link: 'StarBound ağına yukarı bağlantı kurun.',
    restore_access: 'Galaktik varlığınızı geri yükleyin.',
    create_link: 'Bağlantı Oluştur',
    authorize_access: 'Erişime Yetki Ver',
    
    // Star Details
    class: 'Sınıf',
    star_id: 'Yıldız ID',
    distance: 'Uzaklık',
    magnitude: 'Parlaklık',
    spectral_class: 'Tayf Sınıfı',
    unclaimed: 'Sahiplenilmemiş',
    already_owned: 'İsimlendirilmiş',
    claim_this_star: 'Bu Yıldızı Sahiplen',
    purchase_star: 'Yıldız Kaydını Güvenceye Al',
    black_hole: 'Kütleçekimsel Tekillik',

    // New Technical translations
    nasa_real_data: 'NASA GERÇEK VERİ',
    singularity: 'TEKİLLİK',
    status_classified: 'DURUM: KAYITLI',
    status_unclaimed: 'DURUM: SAHİPSİZ',
    named_by: 'Sahiplenen:',
    registration_fee: 'KAYIT_ÜCRETİ',

    // Spectral Names
    spectral_blue_supergiant: 'Mavi Süperdev',
    spectral_blue_white_giant: 'Mavi-Beyaz Dev',
    spectral_white_star: 'Beyaz Yıldız',
    spectral_yellow_white_star: 'Sarı-Beyaz Yıldız',
    spectral_yellow_dwarf: 'Sarı Cüce (Güneş benzeri)',
    spectral_orange_dwarf: 'Turuncu Cüce',
    spectral_red_dwarf: 'Kızıl Cüce',
    
    // Dashboard Stats
    stars_owned: 'Sahiplenilen Yıldızlar',
    rank: 'Kaşif Rütbesi',
    stellar_explorer: 'Yıldız Kaşifi',
    my_collection: 'Yıldız Koleksiyonum',
    no_stars_yet: 'Henüz kaydınızda yıldız bulunmuyor.',
  },
};

export type TranslationKeys = keyof TranslationSchema;

export const useTranslation = (lang: Language): TranslationSchema => {
  return translations[lang];
};
