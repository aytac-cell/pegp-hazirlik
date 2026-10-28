# Sürüm notları

Sürüm numarası `js/version.js` dosyasında tutulur. Her yayında şu adımlar izlenir:

- `js/version.js` ve `sw.js` içindeki sürüm artırılır.
- Bu dosyaya ve `APP_CHANGES` listesine yeni sürümün notu eklenir.
- Commit `v<sürüm>` etiketiyle işaretlenir.

## 1.13.1 (2026-10-28)

- Ders dili «Ελληνικά» seçiliyken her sayfanın sağ alt köşesinde sabit bir «TR» butonu var.
  - Basınca bütün Yunanca metinlerin altında Türkçe çeviri açılır, tekrar basınca kapanır. Tercih hatırlanır.
  - Bölüm sınavı sırasında basınca sınav baştan başlamaz; sadece çeviriler açılıp kapanır.

## 1.13.0 (2026-10-28)

- **Bölüm sınavları Yunanca:** Soru, şıklar ve cevap sonrası açıklama, sınavdaki gibi Yunanca gösteriliyor.
  - Sağ üstteki «TR» butonu Türkçe çeviriyi her satırın altında açar veya kapatır. Tercih hatırlanır.
  - Tablolardan üretilen çekim soruları zaten Yunanca olduğu için bu sorularda buton yok.
- **Derslerdeki sınav soruları kutusu:** Ders dili Türkçe olsa da sorular Yunanca gösteriliyor.
  - Doğru/Yanlış etiketleri «✓ Σωστό / ✗ Λάθος», doğrusu «✓ Σωστό είναι:» olarak yazıyor.
  - Türkçe çeviri varsayılan olarak kapalı; «TR» butonuyla açılıyor.

## 1.12.1 (2026-10-28)

- Derslerdeki «📝 Bu dersin sınav soruları ve cevapları» kutusunda Türkçe çeviri açılıp kapatılabiliyor.
  - Her sorunun sağ üstündeki «TR» butonu o sorunun çevirisini açar/kapatır.
  - Kutu başlığındaki «TR · hepsi» butonu bütün soruları birden açar/kapatır; bu tercih hatırlanır.
  - Çeviri kapalıyken sorular yalnızca Yunanca görünür.

## 1.12.0 (2026-10-28)

- Doğru/Yanlış sorularında her yanlış ifadenin altında artık «✓ Doğrusu» yazıyor; toplam 86 ifade. Bu bilgi derslerde, soru kartlarında ve soru listesinde görünüyor.
- Kelime sözlüğüne yeni ifadelerdeki kelimeler eklendi; sözlük artık 7.513 kelime biçimini kapsıyor.

## 1.11.0 (2026-10-28)

- **Yeni: Kelimenin üzerine gelince çevirisi.** Yunanca bir kelimenin üzerine fareyle gelince (telefonda dokununca) Türkçe anlamı, sözlük hâli ve dilbilgisi bilgisi görünür. Örnek: κράτους → κράτος · devlet · tamlayan hâl.
- Sitedeki 7.476 Yunanca kelime biçiminin hepsi sözlükte var.
- Kelime öğreticideki sorularda, cevabı ele vermemesi için kapalı.
- Ayarlar'dan açılıp kapatılabilir.

## 1.10.0 (2026-10-28)

- **Yeni:** Her derste «📝 Bu dersin sınav soruları ve cevapları» bölümü var. Derse bağlı resmî soruların hepsi cevaplarıyla öğretiliyor.
- Gösterim, soru türüne göre:
  - Boşluk doldurma soruları, cevaplar yerine yerleştirilmiş tam cümleler olarak (Yunanca ve Türkçe).
  - Doğru/yanlış ifadeleri ✓/✗ ile.
  - Eşleştirmeler çiftler hâlinde.
- Cevabın Yunancası her zaman görünüyor.

## 1.9.0 (2026-10-27)

- **Derslerde görseller:** 48 konu bölümüne toplam 317 görsel eklendi.
  - Her bölümün başında bir kapak resmi var.
  - Altyazılı galerilerde On İki Tanrı sembolleriyle birlikte, anıtlar, kişiler, adalar ve eserler gösteriliyor.
  - Görsele tıklayınca büyüyor.
  - Tüm görseller Wikimedia Commons'tan, serbest lisanslı ve kaynak bilgisiyle.
- **«📌 Sınavda sorulanlar»:** Her dersin sonunda bu kutu var. Derse bağlı her resmî sınav sorusunun cevabı artık o derste anlatılıyor; doğru/yanlış sorularının bütün ifadeleri de dahil.
- Yol haritasında ve içindekilerde küçük kapak resimleri gösteriliyor.
- Orta boy ekranlarda menü taşması düzeltildi.

## 1.8.0 (2026-10-27)

- **Yeni: Yol haritası.** 66 ders tek sırada (Ders 1–66), kolaydan zora. 3 ay = 3 seviye, toplam 12 hafta.
- Ana sayfanın en üstünde «Sıradaki ders» kartı ve 0/66 ilerleme göstergesi var.
- Ders sayfalarında «Ders N / 66» yazıyor. Bölüm sınavı geçilince doğrudan sıradaki derse geçiliyor.
- Yol haritasında her haftanın kelime grupları, cumartesi tekrarı ve 2. aydan itibaren deneme sınavları da yer alıyor.

## 1.7.2 (2026-10-27)

- Çekim tablolarında her hâlin altına Türkçe soru kalıbı ve kullanım notu eklendi. Örnekler: "kimin? neyin?", "«kime?» anlamında -e", "σε/από/για'dan sonra -e/-de/-den".
- Yeni sürüm yüklendiğinde sayfa kendiliğinden bir kez yenilenir, eski dosyalar ekranda kalmaz.

## 1.7.1 (2026-10-27)

- Dilbilgisi bölüm sınavlarında cevaptan sonra «🇹🇷 Türkçesi» butonu çıkıyor. Butona basınca cümlenin doğru cevapla tamamlanmış Yunancası (🔊 ile dinlenebilir) ve Türkçe anlamı açılıyor. Aynı bilgi yanlış cevaplar listesinde de görünüyor.

## 1.7.0 (2026-10-27)

- **Dilbilgisi derslerinde çok daha fazla örnek.** Her bölümde günlük hayattan Yunanca örnek cümleler var; çevirileri ve açıklamalarıyla birlikte, 🔊 ile dinlenebiliyor.
- **Dilbilgisi bölüm sınavları artık kullanım üzerine.** Sorularda cümle içinde doğru biçim, zaman ya da hâl seçiliyor, doğru cümle bulunuyor, hata yakalanıyor.
- Alıştırmalar, Yunanca öğretim sitelerindeki alıştırma türlerinden uyarlandı. Kaynaklar her bölümün altında listeleniyor.

## 1.6.0 (2026-10-26)

- **Yeni: Ses seçimi.** Kadın, erkek veya otomatik ses seçilebilir. Ayrıca her dil için cihazdaki sesler arasından seçilip denenebilir; Ayarlar'da ve ders oynatıcısında.
- **Fotoğraflı sorular artık resimli.** 25 soruya Wikimedia Commons'tan aynı konuyu gösteren serbest lisanslı görseller eklendi. Yazar ve lisans her görselin altında ve Hakkında sayfasında yazıyor.
- Bu sorular artık çalışmaya ve sınav provasına da dahil.
- **Yerel kopya:** `tools/extract_local_images.py`, resmî PDF'lerdeki orijinal fotoğrafları sadece yerel kopya için çıkarır. Bu dosyalar git dışındadır ve yayımlanmaz.

## 1.5.0 (2026-10-26)

- **Yeni: Dersi dinle.** Ders seçtiğin dilde sesli okunur: Türkçe, English, Ελληνικά ya da önce Yunanca sonra Türkçe.
- **Oynatıcı:** önceki/sonraki paragraf, oynat/duraklat ve okuma hızı (0.75×–1.5×).
- Okunan paragraf vurgulanır ve sayfa onu takip eder. Bir paragrafa dokununca okuma oradan devam eder.
- Türkçe/İngilizce metindeki Yunanca kelimeler Yunanca sesle okunur.

## 1.4.1 (2026-10-26)

- **Düzeltme:** Bölüm sınavı soruları artık yalnızca o bölümde anlatılan bilgilerden geliyor. Her bölüm için en az 15 soruluk bir havuz var.
- Resmi soru bankasından ve komşu bölümlerden gelen ilgisiz sorular kaldırıldı.
- Her cevaptan sonra dersteki ilgili bilgiyi hatırlatan kısa bir açıklama gösteriliyor.
- Sorular ders dilinde gösteriliyor: Türkçe, English, Ελληνικά veya iki dilli.

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
