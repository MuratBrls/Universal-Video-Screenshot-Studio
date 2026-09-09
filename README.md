# Universal Video Screenshot Studio — Safari Extension & macOS App

macOS ve Safari için geliştirilmiş, yalnızca YouTube'da değil; **Vimeo, Twitter/X, Instagram, TikTok, Reddit, haber portalları, özel HTML5 video oynatıcıları ve gömülü iframe'ler dahil her web sitesindeki videolardan** orijinal çözünürlüğünde kayıpsız frame yakalayan profesyonel Safari eklentisi ve bağımsız macOS uygulaması.

---

## 🌟 Öne Çıkan Özellikler

- 🌐 **Evrensel Video Desteği:** Safari'de açtığınız herhangi bir web sayfasındaki HTML5 videoları otomatik tespit eder.
- 📸 **Orijinal Çözünürlükte Frame Yakalama:** Video kaynağının gerçek piksel çözünürlüğünde (1080p, 4K, 8K) GPU decode edilmiş tam kareyi kaydeder.
- 🎨 **Display-P3 Geniş Renk Gamutu:** Geniş renk profili ve HDR renk doğruluğunu kaybetmeden yakalar (sRGB'den üstün renk derinliği).
- 💾 **3 Farklı Çıktı Formatı:**
  - **PNG:** Tam kayıpsız (Lossless, Display-P3 renk uzayı — 4K için tavsiye edilen)
  - **JPG:** Ayarlanabilir sıkıştırma kalitesi (%60 – %100)
  - **TIF:** Profesyonel kayıpsız TIFF formatı (`UTIF` motoru)
- ⌨️ **Klavye Kısayolu (Varsayılan: `P`):** Sayfada video izlerken herhangi bir anda `P` tuşuna basarak frame'i anında kaydedin (tuş ayarlar üzerinden istenildiği gibi değiştirilebilir).
- 🖱️ **Akıllı Çift Arayüz:**
  - **YouTube'da:** YouTube video oynatıcı kontrol çubuğuna entegre yerel butonlar (`[ 📷 ]` ve `[ ⚙️ ]`).
  - **Diğer Tüm Sitelerde:** Videonun üzerine fare ile gelindiğinde sağ üst köşede beliren, videoyu engellemeyen şık ve yarı saydam macOS cam tasarımlı butonlar.
- 🚀 **Safari Araç Çubuğu Popup Menüsü:** Araç çubuğundaki eklenti simgesine tıklayarak sayfadaki videoyu tek tıkla yakalama, format ve kalite ayarlarını değiştirme.
- 📂 **Doğrudan İndirilenler (Downloads) Klasörüne:** macOS dosya sistemine tam uyumlu, video başlığı ve zaman damgasıyla isimlendirilmiş otomatik kayıt:
  ```
  VideoBasligi_01m23s.png
  DiziBolum_1h04m12s.tif
  ```
- 🛡️ **CORS Güvenlik Koruması Desteği:** Çapraz kaynaklı (cross-origin) korumalı video akışlarında otomatik ekran alanı eşleme mekanizması.

---

## 🚀 Kurulum ve Safari'de Etkinleştirme

Hazırlanan `Universal Video Screenshot Studio.app` dosyası doğrudan bu klasörde derlenmiş ve imzalanmıştır:

1. **Uygulamayı Açın:**
   Klasördeki `Universal Video Screenshot Studio.app` uygulamasına çift tıklayıp açın.
   *(İsteğe bağlı olarak uygulamayı `/Applications` (Uygulamalar) klasörünüze de sürükleyebilirsiniz).*
2. **Safari Geliştirici Menüsünü Açın (Henüz açık değilse):**
   - **Safari → Ayarlar (Settings) → İleri Düzey (Advanced)** sekmesine gidin.
   - En alttaki **"Geliştirici özelliklerini göster" (Show features for web developers)** seçeneğini işaretleyin.
3. **İmzasız Eklentilere İzin Verin:**
   - Safari üst menüsünden **Geliştirme (Develop) → İmzasız Eklentilere İzin Ver (Allow Unsigned Extensions)** seçeneğini onaylayın ve Mac parolanızı girin.
4. **Eklentiyi Etkinleştirin:**
   - **Safari → Ayarlar (Settings) → Eklentiler (Extensions)** sekmesine gidin.
   - Listede görünen **Universal Video Screenshot Studio** kutucuğunu işaretleyerek aktif edin.
   - Eklentiye tüm web sitelerinde çalışabilmesi için istenirse *"Her web sitesinde her zaman izin ver"* yetkisi verin.

---

## 🎯 Nasıl Kullanılır?

### 1. Klavye ile Anında Yakalama (En Hızlı Yöntem)
- Safari'de herhangi bir video içeren sayfaya gidin (YouTube, Vimeo, Twitter, haber siteleri vb.).
- İstediğiniz kareye gelin (videoyu duraklatabilir veya oynatırken de basabilirsiniz).
- Klavyeden **`P`** tuşuna basın.
- Ekranın sağ üst köşesinde çözünürlüğü ve dosya boyutunu belirten Apple bildirim kartı görünür ve dosya **Downloads** klasörünüze iner.

### 2. Video Üzerindeki Buton ile Yakalama
- YouTube'da oynatıcının sağ altındaki kontrol çubuğunda **kamera** simgesine tıklayın.
- Diğer web sitelerinde farenizi videonun üzerine getirdiğinizde sağ üstte beliren **kamera** simgesine tıklayın.

### 3. Safari Araç Çubuğundan Yakalama
- Safari adres çubuğunun yanındaki eklenti simgesine tıklayın.
- Açılan pencerede **"Mevcut Frame'i Yakala"** butonuna basın.

---

## ⚙️ Ayarlar

Ayar panelini videonun üzerindeki çark simgesinden `[ ⚙️ ]` veya Safari araç çubuğundaki eklenti simgesinden açabilirsiniz:

| Ayar | Açıklama |
|---|---|
| **Format (PNG / JPG / TIF)** | Çıktı dosya formatını belirler. En yüksek kalite için PNG veya TIF seçin. |
| **JPG Kalitesi** | JPG seçildiğinde %60 ile %100 arasında kalite kaydırıcısı aktif olur. |
| **Kısayol Tuşu** | "Değiştir" butonuna basıp klavyeden yeni bir tuşa bastığınızda kısayol güncellenir. |
| **Video Üzerinde Buton Göster** | Video üzerindeki yüzen butonları açıp kapatmanızı sağlar (yalnızca kısayol kullanmak isteyenler kapatabilir). |

---

## 📁 Proje Dosya Yapısı

```
Video Downloader/
├── Universal Video Screenshot Studio.app         # Hazır derlenmiş macOS uygulaması
├── Universal Video Screenshot Studio.xcodeproj   # Xcode kaynak projesi
├── Universal Video Screenshot Studio/             # macOS Container App Swift kodları
├── Universal Video Screenshot Studio Extension/   # Safari Extension Swift & Resources
├── manifest.json                                 # Web Extension Manifest v3 tanımı
├── content.js                                    # Evrensel video yakalama motoru ve arayüz
├── background.js                                 # Arka plan servis scripti & CORS fallback
├── popup.html                                    # Safari toolbar popup arayüzü
├── popup.js                                      # Popup kontrol mantığı
├── utif.js                                       # Kayıpsız TIFF kodlayıcı kütüphanesi
├── icons/                                        # Eklenti ve uygulama ikonları
└── README.md                                     # Bu kılavuz belgesi
```

---

## 🛠️ Kaynak Koddan Tekrar Derleme (İsteğe Bağlı)

Xcode ile projeyi yeniden derlemek isterseniz:
```bash
# Xcode ile projeyi açmak için:
open "Universal Video Screenshot Studio.xcodeproj"

# Ya da terminalden derlemek için:
xcodebuild -scheme "Universal Video Screenshot Studio" -configuration Release build
```
