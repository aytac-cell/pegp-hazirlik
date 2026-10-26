# Sürüm notları

Sürüm numarası `js/version.js` dosyasında tutulur. Her yayında şu adımlar izlenir:

- `js/version.js` ve `sw.js` içindeki sürüm artırılır.
- Bu dosyaya ve `APP_CHANGES` listesine yeni sürümün notu eklenir.
- Commit `v<sürüm>` etiketiyle işaretlenir.

## 1.4.0 (2026-10-26)

- **Yeni: Bölüm sınavı.** Her ders bölümünün sonunda 10 soruluk bir sınav var. Ders sonuna kadar okunduğunda açılır.
- Bölümü geçmek için en az 9/10 gerekir.
- 9/10'un altında bölüm tamamlanmış sayılmaz:
  - Yanlış cevaplar doğrularıyla gösterilir.
  - Ders yeniden açılır.
  - Sınav ancak ders tekrar sonuna kadar okununca açılır.
- Sorular bölümün kendi içeriğinden her seferinde farklı seçilir: resmi sınav soruları, Yunanca terimler, tarihler ve çekim tabloları.
- İçindekiler listesinde her bölümün sınav puanı görünür.

## 1.3.0 (2026-10-26)

- **Yeni: Dilbilgisi dersi.** Artikeller ile isim ve sıfatların artikelleriyle dört hâlde çekimi (tekil/çoğul).
- **Fiil zamanları:**
  - Şimdiki zaman, geçmiş sürekli ve basit geçmiş (aorist).
  - Sürekli ve basit gelecek.
  - Perfect zamanlar, dilek ve emir kipi.
  - Etken ve edilgen fiiller.
- Düzensiz fiiller ve özel çekimleri.
- Kelime öğreticide isimlerin çekim tablosu ve fiillerin zaman çekimleri gösteriliyor.
- Çekimler Vikisözlük ve Yunan Dili Portalı gibi kaynaklarla kontrol edildi. Kaynaklar derslerde listeleniyor.

## 1.2.0 (2026-10-26)

- **Yeni:** Dersler Yunanca da okunabiliyor. Ders dili seçicisinde dört seçenek var: Türkçe, English, Ελληνικά, Ελληνικά + Türkçe.
- İki dilli modda her paragrafın Yunancası üstte, çevirisi altında gösteriliyor.
- Yunanca modlarda paragraflar sesli dinlenebiliyor (🔊).

## 1.1.1 (2026-10-26)

- Sürüm numarası sol üst köşede, logonun yanında gösteriliyor. Tıklayınca sürüm notları açılır.

## 1.1.0 (2026-10-26)

- **Yeni: Dersler bölümü.** Coğrafya, kültür, tarih ve devlet kurumları için konu anlatımı.
- Her derste Yunanca terim sözlüğü, zaman çizelgeleri, tablolar ve haritalar var.
- Her bölümün sonunda o bölümün sorularını çalışma modu.
- Okunan bölümler takip edilir.
- **Yeni: Kelime öğretici.** A1'den B2'ye kadar Yunanca kelimeler, seviye ve konu bazında, akıllı tekrarla çalışılır.
- Kelimeler 4 yönde sorulabilir. Yunancadan Türkçeye veya İngilizceye sorulurken resim gösterilmez; Türkçe veya İngilizceden Yunancaya sorulurken kelimenin resmi gösterilir.
- Kelimeler 4 seçenekle ya da kart çevirerek cevaplanabilir; Yunanca seslendirme de var.
- Uygulamanın altbilgisinde sürüm numarası, Hakkında sayfasında sürüm notları gösterilir.

## 1.0.0 (2026-10-26)

- Resmi soru bankasının 300 sorusu (Kasım 2026), Türkçe ve İngilizce çevirileriyle.
- Akıllı tekrar sistemi (aralıklı tekrar).
- Gerçek dağılımla sınav provası: süre sayacı ve puanlama.
- Haritaya dokunarak cevaplanan harita soruları.
- İstatistikler, arama, Yunanca seslendirme ve koyu tema.
- Telefona kurulabilir, çevrimdışı çalışır; ilerleme yedeklenebilir.
