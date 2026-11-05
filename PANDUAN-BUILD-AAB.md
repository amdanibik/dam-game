# Panduan Build AAB — Game Daman untuk Windows

Panduan ini dijalankan di **PC Windows Anda** (bukan di WSL), kecuali disebutkan khusus.

## A. Persiapan Awal (Lakukan Sekali)

### 1. Install Java JDK 17
- Download dari: https://adoptium.net/temurin/releases/?version=17
- Pilih: Windows x64 → JDK → .msi
- Install, lalu verifikasi: buka Command Prompt → `java -version`

### 2. Install Android Studio
- Download dari: https://developer.android.com/studio
- Install dengan semua komponen default (Android SDK, AVD, Build Tools)
- Saat pertama kali buka, ikuti wizard setup → pilih "Standard"
- Tunggu Android Studio mendownload SDK (bisa 1-2GB)

### 3. Set Environment Variable ANDROID_HOME
Buka System Environment Variables → tambahkan:
  - Variable: ANDROID_HOME
  - Value: C:\Users\[USERNAME]\AppData\Local\Android\Sdk

Tambahkan juga ke PATH:
  - %ANDROID_HOME%\platform-tools
  - %ANDROID_HOME%\cmdline-tools\latest\bin

---

## B. Install Capacitor & Generate Project Android

Buka **Command Prompt atau PowerShell Windows** (bukan WSL), lalu:

### Opsi 1: Jalankan dari Windows (Paling Stabil)
```
# Copy dulu folder game ke Windows filesystem agar lebih mudah
xcopy \\wsl$\Ubuntu\home\danibik\bik-app\game C:\Projects\daman-game /E /I

# Masuk ke folder
cd C:\Projects\daman-game

# Install Capacitor
npm install

# Tambah platform Android
npx cap add android

# Sync file web ke Android
npx cap sync android

# Buka di Android Studio
npx cap open android
```

### Opsi 2: Langsung dari WSL (Jika Node & npm sudah ada di WSL)
Buka terminal WSL, lalu:
```bash
cd /home/danibik/bik-app/game
npm install
npx cap add android
npx cap sync android

# Buka Android Studio dari Windows dengan path WSL:
# Di Android Studio: File → Open → \\wsl$\Ubuntu\home\danibik\bik-app\game\android
```

---

## C. Konfigurasi di Android Studio

Setelah Android Studio terbuka dengan project android/:

### 1. Edit file: android/app/build.gradle
Pastikan nilainya seperti ini:
```
android {
    compileSdk = 35
    defaultConfig {
        applicationId "id.bik.daman"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
    }
}
```

### 2. Install Icon (setelah icon tersedia)
- Taruh file `icon-512.png` di folder: `resources/`
- Jalankan di terminal: `npx capacitor-assets generate --android`
- Atau manual: klik kanan `res` → Image Asset di Android Studio

### 3. Kunci Orientasi Portrait
Edit `android/app/src/main/AndroidManifest.xml`:
Tambahkan di dalam tag `<activity`:
```
android:screenOrientation="portrait"
```

---

## D. Build APK (untuk Testing di HP Anda)

Di Android Studio:
1. Menu: Build → Build Bundle(s) / APK(s) → Build APK(s)
2. Tunggu proses build selesai
3. Klik "locate" di notifikasi untuk menemukan file .apk
4. Transfer ke HP Android → Install (aktifkan "Sumber Tidak Dikenal" di pengaturan HP)
5. Uji semua fitur game

---

## E. Buat Keystore (Sekali Saja — SIMPAN BAIK-BAIK!)

Buka Command Prompt di Windows:
```
keytool -genkey -v ^
  -keystore C:\Projects\daman-release.jks ^
  -keyalg RSA -keysize 2048 ^
  -validity 10000 ^
  -alias daman-key
```

Isi form yang muncul:
- Password keystore: [buat password kuat]
- First and Last Name: Muhammad Amdanibik
- Organization: Evo Corp
- City: Kediri
- State: Jawa Timur
- Country: ID

SIMPAN INFORMASI INI DI TEMPAT AMAN:
  - File: C:\Projects\daman-release.jks
  - Alias: daman-key
  - Password keystore: [yang Anda buat]
  - Password key: [yang Anda buat]

---

## F. Build AAB Release (untuk Upload ke Play Store)

Di Android Studio:
1. Menu: Build → Generate Signed Bundle / APK
2. Pilih: Android App Bundle (.aab)
3. Klik Next
4. Key store path: pilih file daman-release.jks
5. Isi password keystore dan key
6. Key alias: daman-key
7. Klik Next
8. Pilih: release
9. Klik Finish

File AAB tersimpan di:
`android/app/build/outputs/bundle/release/app-release.aab`

---

## G. Upload ke Google Play Console

1. Buka: https://play.google.com/console
2. Klik "Create App" → Game Daman
3. Isi informasi aplikasi:
   - Nama: Game Daman
   - Bahasa default: Bahasa Indonesia
   - Jenis: Game
   - Gratis/berbayar: Gratis
4. Navigasi ke: Testing → Internal testing → Create new release
5. Upload file: app-release.aab
6. Undang minimal 12 tester (teman/keluarga via email Google mereka)
7. Tunggu 14 hari
8. Ajukan Production release

---

## H. Perintah Update (Setiap Ada Perubahan Kode)

```bash
# Di WSL / terminal game folder:
npx cap sync android

# Naikkan versionCode di android/app/build.gradle
# versionCode = 2 (naik 1 setiap update)
# versionName = "1.1.0"

# Build AAB baru di Android Studio
# Upload ke Play Console
```
