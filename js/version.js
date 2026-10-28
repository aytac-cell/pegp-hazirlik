// App version and release notes. Bump VERSION here (and VERSION in sw.js) for every release,
// add an entry at the top of CHANGES, and tag the commit as v<version>.
window.APP_VERSION = "1.13.1";
window.APP_CHANGES = [
  {
    v: "1.13.1", date: "2026-10-28",
    tr: [
      "Ders dili «Ελληνικά» seçiliyken her sayfanın sağ altında sabit bir «TR» butonu var: basınca bütün Yunanca metinlerin altında Türkçe çeviri açılır, tekrar basınca kapanır (sınav sırasında sınav baştan başlamaz)"
    ],
    en: [
      "With the «Ελληνικά» lesson language, a fixed «EN» button sits bottom-right on every page: it opens/closes the translation under all Greek text (a running quiz is not restarted)"
    ]
  },
  {
    v: "1.13.0", date: "2026-10-28",
    tr: [
      "Bölüm sınavları artık sınavdaki gibi Yunanca: soru, şıklar ve açıklama Yunanca; «TR» butonuna basınca altlarında Türkçesi açılır (tercih hatırlanır)",
      "Derslerdeki sınav soruları kutusu da her ders dilinde Yunanca; Doğru/Yanlış etiketleri «✓ Σωστό / ✗ Λάθος», Türkçe çeviri «TR» butonuyla açılır"
    ],
    en: [
      "Section quizzes are now in Greek, as in the exam: question, options and explanation; the «EN» button opens the translation underneath (remembered)",
      "The lesson exam-question box is in Greek in every lesson language; true/false labels read «✓ Σωστό / ✗ Λάθος», translation behind the button"
    ]
  },
  {
    v: "1.12.1", date: "2026-10-28",
    tr: [
      "Derslerdeki «Bu dersin sınav soruları ve cevapları» kutusunda Türkçe çeviri açılıp kapatılabiliyor: her sorunun sağ üstünde «TR» butonu, kutu başlığında hepsi için tek buton (tercih hatırlanır)"
    ],
    en: [
      "Lesson exam-question box: the translation can be shown or hidden — an «EN» button on each question and one for all in the box header (remembered)"
    ]
  },
  {
    v: "1.12.0", date: "2026-10-28",
    tr: [
      "Doğru/Yanlış sorularında her yanlış ifadenin altında «✓ Doğrusu» yazıyor (86 ifade): derslerde, soru kartlarında ve soru listesinde",
      "Kelime sözlüğüne yeni ifadelerin kelimeleri eklendi (7.513 biçim)"
    ],
    en: [
      "True/false questions: every false statement now shows «✓ Correct version» underneath (86 statements) — in lessons, question cards and the question list",
      "Hover dictionary extended to the new wording (7,513 forms)"
    ]
  },
  {
    v: "1.11.0", date: "2026-10-28",
    tr: [
      "Yeni: Yunanca bir kelimenin üzerine fareyle gelince (telefonda dokununca) Türkçe anlamı, sözlük hâli ve dilbilgisi bilgisi görünür (ör. κράτους → κράτος · devlet · tamlayan hâl)",
      "Sitedeki 7.476 Yunanca kelime biçiminin hepsi sözlükte; kelime öğreticideki sorularda cevabı ele vermemek için kapalı",
      "Ayarlar'dan açılıp kapatılabilir"
    ],
    en: [
      "New: point at a Greek word (tap on phones) to see its meaning, dictionary form and grammar (e.g. κράτους → κράτος · state · genitive)",
      "All 7,476 Greek word forms on the site are covered; switched off inside vocabulary drills so it can't give answers away",
      "Can be turned off in Settings"
    ]
  },
  {
    v: "1.10.0", date: "2026-10-28",
    tr: [
      "Yeni: Her derste «📝 Bu dersin sınav soruları ve cevapları» — derse bağlı resmî soruların hepsi cevaplarıyla öğretiliyor",
      "Boşluk doldurma soruları cevaplar yerine yerleştirilmiş tam cümleler olarak (Yunanca ve Türkçe), doğru/yanlış ifadeleri ✓/✗ ile, eşleştirmeler çiftler hâlinde",
      "Cevabın Yunancası her zaman görünür"
    ],
    en: [
      "New: «📝 This lesson's exam questions and answers» in every lesson — all official questions linked to the lesson, taught with their answers",
      "Fill-ins shown as completed sentences (Greek and translation), true/false statements with ✓/✗, matchings as pairs",
      "The Greek answer is always shown"
    ]
  },
  {
    v: "1.9.0", date: "2026-10-27",
    tr: [
      "Derslerde görseller: 48 konu bölümünde 317 görsel, her bölümde kapak resmi ve altyazılı galeriler (On İki Tanrı sembolleriyle, anıtlar, kişiler, adalar, eserler); tıklayınca büyür",
      "Her dersin sonunda «📌 Sınavda sorulanlar»: derse bağlı her resmî sınav sorusunun cevabı artık o derste anlatılıyor (tüm doğru/yanlış ifadeleri dahil)",
      "Yol haritasında ve içindekilerde küçük kapak resimleri",
      "Orta boy ekranlarda menü taşması düzeltildi"
    ],
    en: [
      "Pictures in lessons: 317 images across the 48 subject sections — a cover for each section and captioned galleries (the Twelve Gods with their symbols, monuments, people, islands, artworks); tap to enlarge",
      "«📌 Asked in the exam» at the end of each lesson: every official question linked to a lesson is now answered in that lesson (including every true/false statement)",
      "Small cover pictures on the roadmap and in the table of contents",
      "Fixed the menu overflowing on medium-size screens"
    ]
  },
  {
    v: "1.8.0", date: "2026-10-27",
    tr: [
      "Yeni: Yol haritası — 66 ders tek sırada (Ders 1–66), kolaydan zora; 3 ay = 3 seviye, 12 hafta",
      "Ana sayfanın en üstünde «Sıradaki ders» kartı; ilerleme 0/66",
      "Ders sayfalarında «Ders N / 66»; bölüm sınavı geçilince doğrudan sıradaki derse geçilir",
      "Her haftanın kelime grupları, cumartesi tekrarı ve 2. aydan itibaren deneme sınavları yol haritasında"
    ],
    en: [
      "New: Roadmap — all 66 lessons in one order (Lesson 1–66), easy to hard; 3 months = 3 levels, 12 weeks",
      "«Next lesson» card at the top of the home page; progress 0/66",
      "Lesson pages show «Lesson N / 66»; passing the quiz goes straight to the next lesson",
      "Each week's word groups, Saturday review and (from month 2) mock exams are on the roadmap"
    ]
  },
  {
    v: "1.7.2", date: "2026-10-27",
    tr: [
      "Çekim tablolarında her hâlin altına Türkçe soru kalıbı ve kullanım notu eklendi (kimin? neyin? · «kime?» anlamında -e; σε/από/για'dan sonra -e/-de/-den …)",
      "Yeni sürüm yüklendiğinde sayfa kendiliğinden bir kez yenilenir; eski dosyalar ekranda kalmaz"
    ],
    en: [
      "Declension tables: each case now shows its question words and a usage note (whose? · 'to whom'; after σε/από/για …)",
      "When a new version is installed the page reloads once, so no outdated files stay on screen"
    ]
  },
  {
    v: "1.7.1", date: "2026-10-27",
    tr: ["Dilbilgisi bölüm sınavlarında cevaptan sonra «🇹🇷 Türkçesi» butonu: cümlenin doğru cevapla tamamlanmış Yunancası (🔊 ile dinlenebilir) ve Türkçe anlamı; yanlış cevap listesinde de görünür"],
    en: ["Grammar section quizzes: a «🇬🇧 Translation» button after answering shows the completed Greek sentence (with 🔊) and its meaning; also in the list of wrong answers"]
  },
  {
    v: "1.7.0", date: "2026-10-27",
    tr: [
      "Dilbilgisi derslerinde çok daha fazla örnek: her bölümde günlük hayattan Yunanca örnek cümleler, çevirileri ve açıklamalarıyla (🔊 ile dinlenebilir)",
      "Dilbilgisi bölüm sınavları artık kullanım üzerine: cümle içinde doğru biçimi/zamanı/hâli seçme, doğru cümleyi bulma, hatayı yakalama",
      "Alıştırmalar, Yunanca öğretim sitelerindeki alıştırma türlerinden uyarlandı; kaynaklar bölüm altında"
    ],
    en: [
      "Many more examples in the grammar lessons: everyday Greek sentences in every section, with translations and notes (listen with 🔊)",
      "Grammar section quizzes now test usage: pick the right form/tense/case in a sentence, find the correct sentence, spot the error",
      "Exercises adapted from the exercise types of Greek-teaching sites; sources listed under each section"
    ]
  },
  {
    v: "1.6.0", date: "2026-10-26",
    tr: [
      "Yeni: Ses seçimi — kadın / erkek / otomatik; her dil için cihazdaki sesler arasından seçim ve deneme (Ayarlar ve ders oynatıcısı)",
      "Fotoğraflı sorular artık resimli: 25 soruya Wikimedia Commons'tan aynı konuyu gösteren serbest lisanslı görseller eklendi (yazar ve lisans her görselin altında ve Hakkında sayfasında)",
      "Bu sorular artık çalışmaya ve sınav provasına da dahil",
      "Kendi bilgisayarında: resmî soru bankasındaki orijinal sınav fotoğraflarını gösterme desteği (kişisel kopya, yayımlanmaz)"
    ],
    en: [
      "New: voice choice — female / male / auto, plus picking and testing a specific device voice per language (Settings and the lesson player)",
      "Photo-based questions now have pictures: 25 questions got freely licensed images of the same subject from Wikimedia Commons (author and licence under each image and on the About page)",
      "These questions are now included in study and the mock exam",
      "On your own computer: support for showing the original pictures from the official bank (personal copy, never published)"
    ]
  },
  {
    v: "1.5.0", date: "2026-10-26",
    tr: [
      "Yeni: Dersi dinle — ders seçtiğin dilde sesli okunur (Türkçe, English, Ελληνικά veya önce Yunanca sonra Türkçe)",
      "Oynatıcı: önceki/sonraki paragraf, oynat/duraklat, okuma hızı (0.75×–1.5×)",
      "Okunan paragraf vurgulanır ve sayfa onu takip eder; bir paragrafa dokununca oradan devam eder",
      "Türkçe/İngilizce metindeki Yunanca kelimeler Yunanca sesle okunur"
    ],
    en: [
      "New: Listen to the lesson — read aloud in your chosen language (Turkish, English, Greek, or Greek followed by the translation)",
      "Player: previous/next paragraph, play/pause, reading speed (0.75×–1.5×)",
      "The paragraph being read is highlighted and followed; tap a paragraph to continue from there",
      "Greek words inside Turkish/English text are spoken with a Greek voice"
    ]
  },
  {
    v: "1.4.1", date: "2026-10-26",
    tr: [
      "Düzeltme: Bölüm sınavı soruları artık yalnızca o bölümde anlatılan bilgilerden geliyor (her bölüm için en az 15 soruluk havuz)",
      "Resmi soru bankasından ve komşu bölümlerden gelen ilgisiz sorular kaldırıldı",
      "Her cevaptan sonra dersteki ilgili bilgiyi hatırlatan kısa açıklama",
      "Sorular ders dilinde gösteriliyor (Türkçe, English, Ελληνικά veya iki dilli)"
    ],
    en: [
      "Fix: section quiz questions now come only from what that section teaches (a pool of at least 15 per section)",
      "Removed unrelated questions from the official bank and from neighbouring sections",
      "A short explanation from the lesson after every answer",
      "Questions follow the lesson language (Turkish, English, Greek or bilingual)"
    ]
  },
  {
    v: "1.4.0", date: "2026-10-26",
    tr: [
      "Yeni: Her ders bölümünün sonunda 10 soruluk bölüm sınavı",
      "Sınav, bölüm sonuna kadar okunduğunda açılır; bölümü geçmek için en az 9/10 gerekir",
      "9/10'un altında bölüm tamamlanmış sayılmaz: yanlışlar gösterilir, ders yeniden okunur ve sınav ancak ders tekrar sonuna kadar okununca açılır",
      "Sorular bölümün içeriğinden her seferinde farklı seçilir: resmi sınav soruları, Yunanca terimler, tarihler ve çekim tabloları",
      "İçindekiler listesinde her bölümün sınav puanı görünür"
    ],
    en: [
      "New: a 10-question quiz at the end of every lesson section",
      "The quiz unlocks once you read to the end; you need at least 9/10 to pass the section",
      "Below 9/10 the section is not completed: your mistakes are shown, you re-read the lesson and the quiz unlocks again at the end",
      "Questions are drawn fresh each time from the section: official exam questions, Greek terms, dates and inflection tables",
      "The table of contents shows each section's quiz score"
    ]
  },
  {
    v: "1.3.0", date: "2026-10-26",
    tr: [
      "Yeni: Dilbilgisi dersi — artikeller, isim ve sıfatların artikelleriyle dört hâlde çekimi (tekil/çoğul)",
      "Fiil zamanları: şimdiki, geçmiş sürekli, basit geçmiş (aorist), sürekli ve basit gelecek, perfect zamanlar, dilek ve emir kipi; etken ve edilgen fiiller",
      "Düzensiz fiiller ve özel çekimleri (είμαι, έχω, πάω, λέω, τρώω, έρχομαι, γίνομαι …)",
      "Kelime öğreticide isimlerin çekim tablosu ve fiillerin zaman çekimleri",
      "Çekimler Vikisözlük ve Yunan Dili Portalı gibi kaynaklarla kontrol edildi; kaynaklar derslerde listeleniyor"
    ],
    en: [
      "New: Grammar course — articles, declension of nouns and adjectives with articles in all four cases (singular/plural)",
      "Verb tenses: present, imperfect, aorist, future continuous and simple, perfect tenses, subjunctive and imperative; active and passive verbs",
      "Irregular verbs and their special forms (είμαι, έχω, πάω, λέω, τρώω, έρχομαι, γίνομαι …)",
      "Declension tables for nouns and tense tables for verbs in the vocabulary trainer",
      "Forms checked against sources such as Wiktionary and the Portal for the Greek Language; sources listed in the lessons"
    ]
  },
  {
    v: "1.2.0", date: "2026-10-26",
    tr: [
      "Yeni: Dersler Yunanca da okunabiliyor — ders dili seçici: Türkçe, English, Ελληνικά, Ελληνικά + Türkçe",
      "İki dilli modda her paragrafın Yunancası ve altında çevirisi",
      "Yunanca modlarda paragrafları sesli dinleme (🔊)"
    ],
    en: [
      "New: lessons can be read in Greek — lesson language picker: Türkçe, English, Ελληνικά, Ελληνικά + English",
      "Bilingual mode shows each paragraph in Greek with the translation underneath",
      "Listen to paragraphs in Greek (🔊)"
    ]
  },
  {
    v: "1.1.1", date: "2026-10-26",
    tr: ["Sürüm numarası sol üst köşede, logonun yanında gösteriliyor; tıklayınca sürüm notları açılır"],
    en: ["Version number shown in the top-left corner next to the logo; click it for the release notes"]
  },
  {
    v: "1.1.0", date: "2026-10-26",
    tr: [
      "Yeni: Dersler bölümü — coğrafya, kültür, tarih ve devlet kurumları için konu anlatımı",
      "Her derste Yunanca terim sözlüğü, zaman çizelgeleri, tablolar ve haritalar",
      "Her bölümün sonunda o bölümün sorularını çalışma modu",
      "Okunan bölümlerin takibi",
      "Yeni: Kelime öğretici — A1'den B2'ye seviye ve konu bazında Yunanca kelimeler, akıllı tekrarla",
      "Kelimelerde 4 yön: Yunanca→Türkçe/İngilizce (resimsiz), Türkçe/İngilizce→Yunanca (resimli)",
      "Uygulama içinde sürüm numarası ve sürüm notları"
    ],
    en: [
      "New: Lessons — explanations for geography, culture, history and institutions",
      "Greek glossary, timelines, tables and maps in every lesson",
      "Practise each section's questions right after reading it",
      "Tracks which sections you have read",
      "New: Vocabulary trainer — Greek words from A1 to B2 by level and topic, with spaced repetition",
      "Four directions: Greek→Turkish/English (no picture), Turkish/English→Greek (with picture)",
      "Version number and release notes inside the app"
    ]
  },
  {
    v: "1.0.0", date: "2026-10-26",
    tr: [
      "Resmi soru bankasının 300 sorusu (Kasım 2026), Türkçe ve İngilizce çevirili",
      "Akıllı tekrar sistemi (aralıklı tekrar)",
      "Gerçek dağılımla sınav provası, süre sayacı ve puanlama",
      "Haritaya dokunarak cevaplanan harita soruları",
      "İstatistikler, arama, Yunanca seslendirme, koyu tema",
      "Telefona kurulabilir, çevrimdışı çalışır; ilerleme yedekleme"
    ],
    en: [
      "All 300 questions of the official bank (November 2026) with Turkish and English translations",
      "Spaced repetition",
      "Mock exam with the real distribution, timer and scoring",
      "Map questions answered by tapping the map",
      "Statistics, search, Greek speech, dark theme",
      "Installable, works offline; progress backup"
    ]
  }
];
