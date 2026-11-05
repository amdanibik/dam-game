# 📱 Panduan Build APK & AAB Game Daman (Google Play Store)

> **Status Saat Ini:** Proyek native Android (`id.bik.daman`) sudah selesai di-generate dan disinkronkan di folder `android/`.

---

## 🛠️ Langkah 1: Install Alat di Windows (Sekali Saja)

Karena Anda menggunakan Windows + WSL, proses kompilasi native Android Studio dijalankan langsung dari sisi Windows (memerlukan GUI desktop).

1. **Install Java JDK 17:**
   - Unduh installer Windows: [Adoptium Eclipse Temurin JDK 17 (x64 .msi)](https://adoptium.net/temurin/releases/?version=17)
   - Jalankan installer hingga selesai.

2. **Install Android Studio:**
   - Unduh: [Android Studio Resmi](https://developer.android.com/studio)
   - Install dengan opsi default (termasuk Android SDK & Platform Tools).
   - Buka Android Studio pertama kali untuk membiarkannya menyelesaikan download SDK.

---

## 📂 Langkah 2: Buka Proyek di Android Studio

1. Buka **Android Studio** di Windows.
2. Pilih **Open** (atau *File → Open*).
3. Masukkan path proyek Android Anda di WSL:
   ```text
   \\wsl$\Ubuntu\home\danibik\bik-app\game\android
   ```
   *(Atau browse via Network → wsl$ → Ubuntu → home → danibik → bik-app → game → android)*.
4. Biarkan Android Studio melakukan **Gradle Sync** untuk pertama kali (pastikan PC terhubung ke internet).

---

## 🎨 Langkah 3: Pasang Ikon Aplikasi (App Icon)

Ikon game bernuansa tradisional yang sudah di-generate tersimpan di:
`\\wsl$\Ubuntu\home\danibik\bik-app\game\resources\icon-source.jpg`

Cara termudah memasangnya di Android Studio:
1. Di panel kiri Android Studio, klik kanan folder **`app/res`** (atau di struktur Android: `app → res`).
2. Pilih **New → Image Asset**.
3. Di tab **Foreground Layer**:
   - Source Asset: pilih **Path**
   - Klik ikon folder, pilih file `icon-source.jpg` yang ada di folder `resources/`.
   - Geser slider **Resize** agar pas di dalam lingkaran/persegi preview.
4. Di tab **Background Layer**:
   - Pilih Color: `#8B7355` (warna cokelat tema daman).
5. Klik **Next → Finish**. Android Studio akan otomatis membuat semua ukuran ikon untuk semua tipe HP Android!

---

## 🚀 Langkah 4: Build APK (Untuk Langsung Ditest di HP)

1. Di menu atas Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
2. Tunggu proses build selesai (~1-2 menit).
3. Muncul notifikasi di pojok kanan bawah: *APK(s) generated successfully* → klik **locate**.
4. Salin file `app-debug.apk` ke HP Android Anda (bisa via USB, WhatsApp, atau Google Drive) dan instal untuk mencoba bermain langsung di HP!

---

## 🔐 Langkah 5: Buat Keystore (Untuk Upload Play Store — Sekali Seumur Hidup)

Google Play mewajibkan file AAB ditandatangani dengan sertifikat digital (*Keystore*).

Buka **Command Prompt (CMD)** di Windows, lalu jalankan:

```cmd
keytool -genkey -v -keystore C:\Users\%USERNAME%\daman-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias daman-key
```

Masukkan data:
- **Keystore password:** Buat password yang aman (misal: catat di catatan penting Anda).
- **Nama lengkap:** Muhammad Amdanibik
- **Organisasi:** Evo Corp
- **Kota:** Kediri
- **Provinsi:** Jawa Timur
- **Kode Negara:** ID

> [!CAUTION]
> **SIMPAN BAIK-BAIK:**
> - File: `C:\Users\[Username Anda]\daman-release.jks`
> - Alias: `daman-key`
> - Password yang Anda buat
> 
> Jika file atau password ini hilang, Anda tidak akan bisa mengunggah pembaruan (*update*) ke aplikasi yang sama di Play Store!

---

## 📦 Langkah 6: Build File AAB (*Android App Bundle*)

1. Di Android Studio, klik menu: **Build → Generate Signed Bundle / APK**.
2. Pilih **Android App Bundle (.aab)** → klik **Next**.
3. Isi informasi penandatanganan:
   - **Key store path:** Klik *Choose existing...* dan pilih file `daman-release.jks` yang Anda buat di Langkah 5.
   - **Key store password:** Masukkan password keystore Anda.
   - **Key alias:** `daman-key`
   - **Key password:** Masukkan password key Anda.
4. Klik **Next**.
5. Pilih Destination Folder dan Build Variant: **release**.
6. Klik **Create / Finish**.
7. Setelah selesai, klik **locate** pada notifikasi. File Anda adalah:
   ```text
   app-release.aab
   ```
   File inilah yang akan diunggah ke Google Play Console!

---

## 🌐 Langkah 7: Unggah ke Google Play Console

1. Buka [Google Play Console](https://play.google.com/console).
2. Di dashboard, klik tombol **Create App (Buat Aplikasi)**:
   - **App name:** Game Daman
   - **Default language:** Indonesian (id)
   - **App or game:** Game
   - **Free or paid:** Free (Gratis)
   - Centang persetujuan kebijakan, klik **Create app**.
3. Buka menu **Testing → Internal testing** (atau **Closed testing**):
   - Klik **Create new release**.
   - Upload file `app-release.aab` yang telah di-generate.
   - Masukkan Release notes: `Rilis perdana Game Daman tradisional Indonesia`.
   - Klik **Next → Save → Start rollout to Internal testing**.
4. Tambahkan email tester (teman/keluarga) untuk masa pengujian 14 hari yang diwajibkan Google.
5. Setelah periode selesai, klik **Promote release → Production** untuk merilisnya ke publik di seluruh dunia!

---

## 🔄 Cara Update Kode Game di Masa Depan

Jika nanti Anda mengubah aturan game, tampilan, atau warna di file HTML/CSS/JS:

1. Di terminal WSL folder game, cukup jalankan:
   ```bash
   npm run sync
   ```
2. Buka `android/app/build.gradle`:
   - Naikkan `versionCode` (misal dari `1` ke `2`).
   - Ubah `versionName` (misal dari `"1.0"` ke `"1.1"`).
3. Di Android Studio: **Build → Generate Signed Bundle / APK** → pilih AAB release → Upload file `.aab` baru ke Google Play Console!
