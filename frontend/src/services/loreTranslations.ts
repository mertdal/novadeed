export type LoreType = {
  mythology: string;
  discovery: string;
  significance: string;
};

export const DEFAULT_LORE: Record<'en' | 'tr', LoreType> = {
  en: {
    mythology: 'This star has been observed by human civilizations for millennia, woven into the tapestry of countless cultural narratives and celestial maps.',
    discovery: 'Catalogued by ancient astronomers and later precisely measured during the modern era of telescopic observation.',
    significance: 'Each star represents a unique nuclear furnace, converting hydrogen into helium, illuminating the cosmos for billions of years.',
  },
  tr: {
    mythology: 'Bu yıldız binlerce yıldır insan uygarlıkları tarafından gözlemlenmiş, sayısız kültürel anlatının ve gökyüzü haritalarının dokusuna işlenmiştir.',
    discovery: 'Antik gökbilimciler tarafından kataloglanmış ve daha sonra teleskopik gözlemin modern çağında hassas bir şekilde ölçülmüştür.',
    significance: 'Her yıldız, milyarlarca yıl boyunca kozmosu aydınlatan, hidrojeni helyuma dönüştüren benzersiz bir nükleer fırını temsil eder.',
  },
};

export const STAR_LORE: Record<string, Record<'en' | 'tr', LoreType>> = {
  Sirius: {
    en: {
      mythology: 'Known as the "Dog Star" in Greek mythology, Sirius was associated with the goddess Isis in Egyptian culture. Its heliacal rising marked the flooding of the Nile.',
      discovery: 'Known since antiquity. Its companion white dwarf, Sirius B, was discovered in 1862 by Alvan Graham Clark.',
      significance: 'The brightest star in the night sky. A binary star system at only 8.6 light years away.',
    },
    tr: {
      mythology: 'Yunan mitolojisinde "Köpek Yıldızı" olarak bilinen Sirius, Mısır kültüründe tanrıça Isis ile ilişkilendirilirdi. Helyak doğuşu Nil\'in taşmasını müjdelerdi.',
      discovery: 'Antik çağlardan beri bilinmektedir. Beyaz cüce eşi Sirius B, 1862\'de Alvan Graham Clark tarafından keşfedilmiştir.',
      significance: 'Gece gökyüzündeki en parlak yıldızdır. Sadece 8,6 ışık yılı uzaklıkta bir ikili yıldız sistemidir.',
    },
  },
  Vega: {
    en: {
      mythology: 'In Chinese mythology, Vega represents Zhinu, the weaving girl, separated from her lover by the Milky Way. In Arabic, its name means "the swooping eagle".',
      discovery: 'One of the first stars to be photographed (1850) and to have its spectrum recorded.',
      significance: 'Once the North Star ~12,000 years ago, and will be again in ~13,000 years due to precession.',
    },
    tr: {
      mythology: 'Çin mitolojisinde Vega, Samanyolu tarafından sevgilisinden ayrılan dokumacı kız Zhinu\'yu temsil eder. Arapça adı "süzülen kartal" anlamına gelir.',
      discovery: 'Fotoğrafı çekilen (1850) ve spektrumu kaydedilen ilk yıldızlardan biridir.',
      significance: 'Yaklaşık 12.000 yıl önce Kutup Yıldızı idi ve presesyon nedeniyle yaklaşık 13.000 yıl sonra tekrar o konuma gelecek.',
    },
  },
  Betelgeuse: {
    en: {
      mythology: 'Its name derives from Arabic "Yad al-Jawzā" meaning "Hand of Orion". Ancient cultures saw it as a red giant marking Orion\'s shoulder.',
      discovery: 'Sir John Herschel noted its variability in 1836. Recent dimming events have fascinated astronomers.',
      significance: 'A red supergiant nearing the end of its life. Expected to explode as a supernova within the next 100,000 years.',
    },
    tr: {
      mythology: 'Adı Arapça "Avcı\'nın Eli" anlamına gelen "Yad el-Cevza"dan gelir. Antik kültürler onu Orion\'un omzunu işaret eden bir kırmızı dev olarak görmüştür.',
      discovery: 'Sir John Herschel 1836\'da değişkenliğini fark etti. Son zamanlardaki kararma olayları gökbilimcileri büyülemiştir.',
      significance: 'Ömrünün sonuna yaklaşan bir kırmızı süperdevdir. Önümüzdeki 100.000 yıl içinde bir süpernova olarak patlaması beklenmektedir.',
    },
  },
  Polaris: {
    en: {
      mythology: 'The "North Star" has guided navigators for centuries. Norse mythology associated it with the cosmic axis "Veraldar Nagli".',
      discovery: 'Known since antiquity as a navigation aid. Its Cepheid variable nature was confirmed in 1911.',
      significance: 'Currently the closest bright star to the north celestial pole, essential for navigation.',
    },
    tr: {
      mythology: '"Kutup Yıldızı" yüzyıllardır denizcilere rehberlik etmiştir. İskandinav mitolojisi onu kozmik eksen "Veraldar Nagli" ile ilişkilendirirdi.',
      discovery: 'Navigasyon yardımı olarak antik çağlardan beri bilinmektedir. Sefe değişen yapısı 1911 yılında doğrulanmıştır.',
      significance: 'Şu anda kuzey gökbölgesine en yakın parlak yıldızdır ve navigasyon için temel öneme sahiptir.',
    },
  },
  Rigel: {
    en: {
      mythology: 'Its name comes from Arabic "Rijl Jawza al-Yusra" meaning "Left Leg of the Central One". Associated with Orion in Greek mythology.',
      discovery: 'F.G.W. Struve resolved it as a binary system in 1831.',
      significance: 'A blue supergiant approximately 120,000 times more luminous than our Sun.',
    },
    tr: {
      mythology: 'Adı Arapça "Merkezi Olanın Sol Bacağı" anlamına gelen "Rijl Jawza al-Yusra"dan gelir. Yunan mitolojisinde Orion ile ilişkilendirilir.',
      discovery: 'F.G.W. Struve 1831 yılında onu bir ikili sistem olarak tanımlamıştır.',
      significance: 'Güneşimizden yaklaşık 120.000 kat daha parlak bir mavi süperdevdir.',
    },
  },
  Aldebaran: {
    en: {
      mythology: 'Known as the "Eye of Taurus" in many cultures. In Arabic, its name means "The Follower" as it appears to follow the Pleiades across the sky.',
      discovery: 'One of the easiest stars to find, marking the eye of Taurus the Bull since ancient times.',
      significance: 'An orange giant star that has exhausted its hydrogen fuel and expanded to about 44 times the Sun\'s diameter.',
    },
    tr: {
      mythology: 'Birçok kültürde "Boğa\'nın Gözü" olarak bilinir. Arapça adı, gökyüzünde Ülker yıldız kümesini takip ettiği için "Takipçi" anlamına gelir.',
      discovery: 'Antik çağlardan beri Boğa takımyıldızının gözünü işaret eden, bulunması en kolay yıldızlardan biridir.',
      significance: 'Hidrojen yakıtını tüketmiş ve Güneş\'in çapının yaklaşık 44 katına kadar genişlemiş turuncu bir dev yıldızdır.',
    },
  },
  Antares: {
    en: {
      mythology: 'Its name means "Rival of Mars" (Anti-Ares) due to its reddish color. Sacred to many indigenous cultures as a harvest marker.',
      discovery: 'Known since antiquity. Its binary companion was discovered by Johann Tobias Bürg in 1819.',
      significance: 'A red supergiant so large that if placed at the center of our solar system, its surface would extend beyond the orbit of Mars.',
    },
    tr: {
      mythology: 'Kırmızımsı rengi nedeniyle adı "Mars\'ın Rakibi" (Anti-Ares) anlamına gelir. Birçok yerli kültür için hasat zamanı belirteci olarak kutsaldı.',
      discovery: 'Antik çağlardan beri bilinmektedir. İkili eşi 1819\'da Johann Tobias Bürg tarafından keşfedilmiştir.',
      significance: 'O kadar büyük bir kırmızı süperdevdir ki güneş sistemimizin merkezine yerleştirilse yüzeyi Mars yörüngesinin ötesine uzanırdı.',
    },
  },
  Deneb: {
    en: {
      mythology: 'Its name comes from Arabic "Dhanab" meaning "tail" — it marks the tail of Cygnus the Swan. Part of the Summer Triangle asterism.',
      discovery: 'Known since ancient times as one of the brightest stars in the northern sky.',
      significance: 'One of the most luminous stars visible to the naked eye, approximately 200,000 times brighter than the Sun.',
    },
    tr: {
      mythology: 'Adı Arapça "kuyruk" anlamına gelen "Dhanab"dan gelir - Kuğu takımyıldızının kuyruğunu işaret eder. Yaz Üçgeni asterizminin bir parçasıdır.',
      discovery: 'Antik çağlardan beri kuzey gökyüzünün en parlak yıldızlarından biri olarak bilinmektedir.',
      significance: 'Çıplak gözle görülebilen en parlak yıldızlardan biridir, Güneş\'ten yaklaşık 200.000 kat daha parlaktır.',
    },
  },
  Sun: {
    en: {
      mythology: 'Worshipped universally by humanity (Ra, Apollo, Inti). The undisputed celestial core of human civilization.',
      discovery: 'Determined to be the center of the solar system by Copernicus in the 16th century.',
      significance: 'Accounts for 99.86% of the mass in the Solar System. Our primary source of energy and life.',
    },
    tr: {
      mythology: 'İnsanlık tarafından evrensel olarak tapınılmıştır (Ra, Apollo, Inti). İnsan uygarlığının tartışmasız göksel çekirdeğidir.',
      discovery: '16. yüzyılda Kopernik tarafından güneş sisteminin merkezi olduğu belirlenmiştir.',
      significance: 'Güneş Sistemi\'ndeki kütlenin %99,86\'sını oluşturur. Birincil enerji ve yaşam kaynağımızdır.',
    },
  },
  Earth: {
    en: {
      mythology: 'Gaia in Greek mythos. The only known cradle of life in the observable universe.',
      discovery: 'Acknowledged as a planet orbiting the Sun during the Copernican Revolution.',
      significance: 'Home. The third orbital body, defined by liquid surface water and a nitrogen-oxygen atmosphere.',
    },
    tr: {
      mythology: 'Yunan mitolojisinde Gaia. Gözlemlenebilir evrendeki tek bilinen yaşam beşiğidir.',
      discovery: 'Kopernik Devrimi sırasında Güneş etrafında dönen bir gezegen olduğu kabul edilmiştir.',
      significance: 'Yuva. Sıvı yüzey suyu ve azot-oksijen atmosferi ile tanımlanan üçüncü yörünge gövdesidir.',
    },
  },
};
