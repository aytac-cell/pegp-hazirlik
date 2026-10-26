# ΠΕΓΠ Hazırlık – Yunan Vatandaşlık Sınavı

Yunan vatandaşlık sınavının (Π.Ε.Γ.Π.) konu bölümü için çalışma sitesi. Resmi soru bankasındaki 300 sorunun tamamını içerir. Sorular Yunanca asıllarıyla, yanlarında Türkçe ve İngilizce çevirileriyle yer alır.

## Özellikler

- **Dersler:** Dört konunun anlatımı, toplam 48 bölüm. Her bölümde Yunanca terim sözlüğü, zaman çizelgeleri, tablolar ve haritalar var; sonunda o bölümün sorularını çalışma bağlantısı bulunur.
- **Dilbilgisi dersi:** Artikeller, isim ve sıfatların dört hâlde çekimi, fiillerin bütün zamanları (etken/edilgen) ve düzensiz fiiller; çekim tabloları Vikisözlük gibi kaynaklarla doğrulandı.
- **Kelime öğretici:** A1–B2 seviyelerinde konu bazında Yunanca kelimeler, 4 yönde sorulur. Türkçe veya İngilizceden Yunancaya sorulurken resim gösterilir, Yunancadan sorulurken gösterilmez. İsimlerin çekim tablosu ve fiillerin zaman çekimleri cevaptan sonra açılabilir.
- **Akıllı tekrar (SRS):** Anki benzeri bir sistem. Kısa öğrenme adımlarıyla başlar, sonra artan aralıklarla tekrar ettirir. Günlük yeni kart sayısı ayarlanabilir.
- **Altı soru tipi, hepsi etkileşimli:** çoktan seçmeli, doğru/yanlış, boşluk doldurma, eşleştirme, açık uçlu ve harita. Harita sorularında Yunanistan haritasına dokunarak tahmin yaparsın; gerçek konuma 60 km'den yakın tahminler doğru sayılır.
- **Sınav provası:** Gerçek dağılımla 20 soru (4 coğrafya, 4 kültür, 6 tarih, 6 kurumlar), her soru 2 puan, geçme sınırı 20/40. İsteğe bağlı süre sayacı var, sonunda sorular tek tek gözden geçirilir.
- **İstatistik:** Son 16 haftanın çalışma takvimi, konu bazında başarı, kartların durumu ve sınav geçmişi.
- **Arama:** Yunanca, Türkçe ve İngilizce aynı anda aranır.
- **Yunanca seslendirme:** Cihazda Yunanca ses varsa sorular sesli okunabilir.
- **Telefona kurulabilir (PWA), çevrimdışı çalışır.**
- Türkçe/İngilizce arayüz, açık/koyu tema, ilerlemeyi yedekleme ve geri yükleme.

İlerleme yalnızca tarayıcının `localStorage`'ında tutulur; sunucu yoktur.

## Yerelde çalıştırma

```bash
python -m http.server 8765
```

Ardından http://localhost:8765 adresini aç. Dosyaya çift tıklayarak açmak da çalışır, ama çevrimdışı mod (service worker) sadece http üzerinden etkinleşir.

## Yayımlama (GitHub Pages)

Klasörü bir GitHub deposuna gönder, sonra *Settings → Pages → Deploy from branch → main / (root)* yolunu izle. Derleme adımı yoktur; site tamamen statiktir.

## Soru verisini güncelleme

Bakanlık bankayı yılda iki kez günceller.

- `data/src/{geo,cul,his,ins}.json`: soruların kaynak dosyaları. Şema `data/src/SCHEMA.md` dosyasında anlatılıyor.
- `data/src/lessons/*.json`: ders notları (şema: `LESSON_SCHEMA.md`). `data/src/words/*.json`: kelime listeleri (şema: `WORDS_SCHEMA.md`).
- `python tools/build.py`: tüm dosyaları doğrular ve `data/questions.js` dosyasını üretir. Bir hata varsa dosyayı yazmaz.

`sw.js` dosyasındaki `VERSION` değerini artırırsan kullanıcıların önbelleği yenilenir.

## Kaynak ve lisans notları

- **Sorular ve resmi cevaplar:** «Υπουργείο Εσωτερικών – Γενική Γραμματεία Ιθαγένειας – Πλατφόρμα Εξετάσεων Πιστοποιητικού Επάρκειας Γνώσεων για Πολιτογράφηση (Π.Ε.Γ.Π)», https://exetaseis-ithageneia.ypes.gr (Kasım 2026 bankası). Bu içerik, platformun «Όροι Χρήσης Περιεχομένου» belgesi ve ν. 4727/2020 kapsamında yeniden kullanılıyor. Bu belgenin şartları şöyle:
  - Yunanca metin değiştirilmeden kullanılmalı.
  - Kaynak açıkça ve kalıcı biçimde gösterilmeli. Site bunu her sayfanın altında yapıyor.
  - Sitenin resmi olmadığı açıkça belirtilmeli.
  - Çeviriler ve diğer eklemeler, site sahibinin içeriği olarak işaretlenmeli.
  - Devlet amblemi veya logosu kullanılmamalı.
- **Çeviriler, notlar ve harita konumları** bu projenin kendi içeriğidir. Fotoğrafa dayanan sorularda fotoğraflar telif nedeniyle kullanılmaz. Bu sorular aramada görünür, ama çalışma oturumlarına ve sınav provasına alınmaz.
- **Harita çizgileri:** Natural Earth (kamu malı), world-atlas@2.0.2 üzerinden alındı.
- Kod, https://digstraightthrough.github.io/greek-flashcards/ sitesinden esinlenilerek sıfırdan yazıldı; o projenin kodu veya çevirileri kullanılmadı.
