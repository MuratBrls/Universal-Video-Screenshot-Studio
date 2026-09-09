# 🎬 Universal Video Screenshot Studio (Safari & macOS)

> **Safari ve macOS için Profesyonel Orijinal Video Karesi (Frame) Yakalama Aracı**  
> Ekran görüntüsü değil; doğrudan HTML5 video akışının donanım (GPU) çözücüsünden piksel piksel ham kare kaydeder.

---

## 📌 Bu Program Nedir ve Neden Farklıdır?

Klasik ekran görüntüsü alma araçları (veya Mac'in `Cmd+Shift+4` kısayolu), ekranda o an görünen pikselleri yakalar. Video küçük bir pencerede oynuyorsa ekran görüntüsü de küçük ve pikselli çıkar.

**Universal Video Screenshot Studio ise:**
1. Videonun web sayfasındaki boyutuna bakmaz; doğrudan video akışının **orijinal çözünürlüğüne (1080p, 4K, vb.)** bağlanır.
2. Web sitesinin video oynatıcı arayüzünü, butonlarını veya zaman çubuğunu görüntüye dahil etmez; sadece **temiz film karesini** alır.
3. Apple'ın **Display-P3 geniş renk profilini** kullanarak HDR ve yüksek renk doğruluğunu korur.
4. YouTube, Vimeo, Twitter/X, Instagram, TikTok, Reddit, haber siteleri, arşivler ve özel web video oynatıcılarının **tamamında** çalışır.

---

## 🚀 Adım Adım Kurulum Rehberi (Safari)

Eklentiyi ilk kez kurarken Apple'ın güvenlik politikaları gereği Safari'de geliştirici izinlerini açmak gerekir. Bu işlem yalnızca **bir defa** yapılır:

### 1. Adım: Uygulamayı Açın
1. Proje klasöründeki **`Universal Video Screenshot Studio.app`** uygulamasına çift tıklayarak açın.
2. Karşınıza küçük bir karşılama penceresi gelecektir. Uygulama, Safari eklentisini sisteminize kaydeder.
*(İsterseniz uygulamayı `Uygulamalar` (Applications) klasörünüze taşıyabilirsiniz).*

---

### 2. Adım: Safari'de "Geliştirici" Menüsünü Açın
Eğer Safari'nin üst menü çubuğunda **"Geliştirme" (Develop)** menüsünü zaten görüyorsanız bu adımı atlayıp 3. adıma geçebilirsiniz.

1. **Safari**'yi açın.
2. Sol üstteki menüden **Safari → Ayarlar...** (veya klavyeden `Cmd + ,`) bölümüne girin.
3. En sağdaki **İleri Düzey** (Advanced) sekmesine tıklayın.
4. En altta yer alan **"Web geliştiricileri için özellikleri göster"** (Show features for web developers) kutucuğunu **işaretleyin**.
5. Artık Safari'nin üst menü çubuğunda **"Geliştirme"** sekmesi belirecektir.

---

### 3. Adım: İmzasız Eklentilere İzin Verin
*(App Store dışından yerel olarak derlenen tüm Safari eklentileri için Apple bu adımı zorunlu kılar)*

1. Safari'nin üst menüsünden **Geliştirme** (Develop) menüsüne tıklayın.
2. Menüdeki **"İmzasız Eklentilere İzin Ver"** (Allow Unsigned Extensions) seçeneğine tıklayın.
3. Mac parolanızı veya Touch ID'nizi onaylayın.

---

### 4. Adım: Eklentiyi Etkinleştirin ve İzin Verin
1. Safari üst menüsünden **Safari → Ayarlar... → Eklentiler** (Extensions) sekmesine gidin.
2. Sol listede **Universal Video Screenshot Studio** eklentisini göreceksiniz. Yanındaki **kutucuğu işaretleyerek açın**.
3. Sağ tarafta beliren butonlardan **"Her Web Sitesinde Her Zaman İzin Ver..."** (Always Allow on Every Website) seçeneğini seçin. *(Bu sayede eklenti YouTube dışındaki Twitter, Vimeo, haber siteleri gibi tüm sayfalarda çalışabilir).*

> 🎉 **Tebrikler!** Kurulum tamamlandı. Safari adres çubuğunuzun yanında eklenti simgesi belirecektir.

---

## 🎯 Nasıl Kullanılır? (3 Farklı Yöntem)

### 🥇 Yöntem 1: Tek Tuşla Anında Yakalama (En Hızlı Yöntem)
* Safari'de video içeren herhangi bir sayfayı açın (örneğin bir YouTube videosu veya Twitter akışı).
* Videoda yakalamak istediğiniz kareye gelin (ister videoyu duraklatın, ister oynarken basın).
* Klavyenizden **`P`** tuşuna basın.
* Ekranın sağ üst köşesinde çözünürlüğü ve dosya boyutunu gösteren şık bir bildirim kartı belirir.
* Orijinal video karesi anında Mac'inizin **İndirilenler (Downloads)** klasörüne kaydedilir.

---

### 🥈 Yöntem 2: Video Üzerindeki Butonlar
* **YouTube'da:** Video oynatıcının sağ altındaki kontrol çubuğunda yerel **[ 📷 ] Kamera** ve **[ ⚙️ ] Ayarlar** butonları otomatik olarak yerleşir.
* **Diğer Tüm Sitelerde:** Farenizi videonun üzerine getirdiğinizde sağ üst köşede cam efektli (yarı saydam) butonlar ve video çözünürlük etiketi görünür:
  - **Kamera Simgesi:** Tıklandığında kareyi anında indirir.
  - **Çözünürlük Rozeti:** Tıklandığında ayar menüsünü açar (örneğin `1080p HD` veya `4K UHD`).
  - **Çark Simgesi:** Çıktı formatı, kalite ve kısayol ayarlarını açar.

---

### 🥉 Yöntem 3: Safari Araç Çubuğu Menüsü
* Safari adres çubuğunun hemen yanındaki eklenti simgesine tıklayın.
* Açılan mini pencerede sayfada aktif video olup olmadığını görürsünüz.
* **"Video Karesini Yakala"** butonuna basarak tek tıkla kaydedebilirsiniz.

---

## ⚙️ Ayarlar ve Kişiselleştirme

Ayar paneline video üzerindeki çark simgesinden veya Safari araç çubuğu menüsünden erişebilirsiniz:

| Ayar | Seçenekler | Açıklama |
|---|---|---|
| **Çözünürlük Kalitesi** | `1080p` *(Varsayılan)*<br>`4K UHD`<br>`Orijinal` | **1080p:** Twitter/Instagram gibi sitelerde video feed'de düşük kalitede başlasa bile en az Full HD netliğe yükseltir.<br>**4K UHD:** Görüntüyü 4K Ultra HD çözünürlüğe süper-örnekler.<br>**Orijinal:** Kaynak akışın ham piksel ölçüsünü korur. |
| **Format** | `PNG` *(Önerilen)*<br>`JPG`<br>`TIF` | **PNG:** Kayıpsız ve Display-P3 geniş renk uzayında kaydeder.<br>**JPG:** Ayarlanabilir kalite (%60 – %100) ile daha küçük dosya boyutu üretir.<br>**TIF:** Profesyonel baskı ve montaj için sıkıştırmasız TIFF kaydeder. |
| **Klavye Kısayolu** | İstenilen herhangi bir tuş | Varsayılan `P` tuşudur. "Değiştir" butonuna basıp istediğiniz başka bir tuşa basarak güncelleyebilirsiniz. |
| **Video Üzerinde Buton Göster** | Açık / Kapalı | Video üzerindeki yüzen butonları kapatıp yalnızca klavye kısayoluyla çalışmak isterseniz kapatabilirsiniz. |

---

## 📂 Dosyalar Nereye Kaydedilir?

Tüm kareler doğrudan Mac'inizin yerel **`~/Downloads` (İndirilenler)** klasörüne şu formatta otomatik adlandırılarak indirilir:

```text
Video_Basligi_01m45s.png
Film_Sahnesi_1h22m10s.tif
Twitter_Post_00m14s.jpg
```

---

## 🛠️ Xcode ile Düzenleme ve Geliştirme

Proje native bir Xcode projesidir. Kodları düzenlemek veya geliştirmek çok kolaydır:

1. **Projeyi Açın:**
   Terminalden:
   ```bash
   open "Universal Video Screenshot Studio.xcodeproj"
   ```
   veya klasördeki `.xcodeproj` dosyasına çift tıklayın.

2. **Kaynak Dosyalar Nerede?**
   Xcode sol panelinde:
   - **`Universal Video Screenshot Studio Extension/Resources/`**:
     - `content.js`: Video yakalama algoritması, arayüz butonları ve kısayol dinleyicisi.
     - `popup.html` & `popup.js`: Safari araç çubuğu menüsü.
     - `rules.json`: CORS engellerini kaldıran kurallar.
     - `manifest.json`: Eklenti yetkileri ve tanımları.
   - **`Universal Video Screenshot Studio/`**:
     - `AppDelegate.swift` & `ViewController.swift`: Mac uygulaması Swift kodları.

3. **Derleme ve Çalıştırma:**
   - Xcode üzerinden **`Cmd + R`** tuşlarına basın veya sol üstteki **Play (▶)** butonuna tıklayın.
   - Proje otomatik derlenecek ve Safari'ye enjekte olacaktır.

---

## ❓ Sıkça Sorulan Sorular ve Sorun Giderme

### 1. Eklenti Safari Ayarlarında Görünmüyor, Ne Yapmalıyım?
1. Klasördeki `Universal Video Screenshot Studio.app` uygulamasını bir kez açıp kapatın.
2. Safari'yi tamamen kapatın (`Cmd + Q`) ve yeniden açın.
3. Hala görünmüyorsa Terminal'i açıp şu komutu yapıştırıp Enter'a basın (bu komut Mac'inize uygulamayı tanıtır):
   ```bash
   /System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f "Universal Video Screenshot Studio.app"
   ```

### 2. Safari'yi Her Kapatıp Açtığımda Eklenti Pasife Düşüyor
Apple, App Store dışından yüklenen geliştirici eklentilerinde güvenlik nedeniyle her Safari açılışında geliştirici modunu kontrol eder:
- Safari üst menüsünden **Geliştirme → İmzasız Eklentilere İzin Ver** seçeneğinin işaretli olduğundan emin olun.

### 3. Twitter / Instagram'da Ekran Resmi Neden Bazen Düşük Çözünürlüklü Oluyor?
Twitter ve Instagram gibi platformlar, veri tasarrufu sağlamak için video akışını feed içinde 360p veya 480p gibi düşük çözünürlükte başlatır:
- **Çözüm 1:** Eklenti ayarlarından Çözünürlüğü **`1080p`** veya **`4K`** olarak seçin (eklenti otomatik olarak Full HD netliğe süper-örnekler).
- **Çözüm 2:** Tweet'in veya videonun üzerine tıklayıp tam boyuta getirin; platform tam çözünürlüklü akışı yüklediğinde eklenti orijinal ham kareyi çeker.

### 4. Yorum veya Tweet Yazarken `P` Tuşuna Basarsam Ekran Görüntüsü Alır mı?
**Hayır.** Eklenti akıllı yazı alanı algılama filtresine sahiptir. Herhangi bir arama kutusuna, yorum alanına veya tweet yazma kutusuna yazı yazarken kısayol tuşu devreye girmez.
