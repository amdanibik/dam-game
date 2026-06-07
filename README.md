# 🎮 Game DAMAN - Permainan Tradisional Indonesia

Selamat datang di **DAMAN**, permainan tradisional Indonesia yang seru dan strategis! Game ini adalah adaptasi digital dari permainan rakyat yang telah dimainkan turun temurun.

---

## 📖 Cara Memainkan

### Tujuan Permainan
Menangkap semua pion lawan sampai habis untuk menjadi pemenang!

### Setup Awal
- **Papan**: Grid 5×5 dengan 25 titik permainan
- **Pemain 1 (Abu-abu)**: 10 pion di baris atas (baris 0-1)
- **Pemain 2 (Merah)**: 10 pion di baris bawah (baris 3-4)
- **Baris Tengah**: Kosong dan menjadi area pertempuran

### Aturan Dasar

#### 1️⃣ **Gerakan Pion**
- Setiap pion dapat bergerak ke **titik-titik tetangga** yang terhubung dengan garis putih
- Titik tetangga adalah 8 arah: ke atas, bawah, kiri, kanan, dan ke 4 arah diagonal
- Pion hanya dapat pindah ke **titik yang kosong** (tidak ada pion lain)
- Dalam satu giliran normal, pion bergerak **1 langkah** ke titik kosong

#### 2️⃣ **Menangkap Pion Lawan (Makan)**
Ini adalah bagian paling penting dalam game:
- Jika ada pion lawan **bersebelahan** dengan pion Anda, dan
- Titik di sebelahnya (yang berlawanan arah) **kosong**, maka
- Anda dapat **melompati pion lawan** dan **menangkapnya**
- Pion yang ditangkap akan hilang dari papan

**Contoh:**
```
[Pion Saya] - [Pion Lawan] - [Kosong]
    ↓            ↓           ↓
Pion saya dapat melompati pion lawan dan mendarat di titik kosong
```

#### 3️⃣ **Multi-Capture (Makan Berantai)**
- Setelah menangkap satu pion lawan, jika masih ada kesempatan menangkap pion lawan lain, 
- Anda **HARUS melanjutkan menangkap** (makan berantai)
- Gerakan akan terus berlanjut sampai tidak ada lagi pion lawan yang bisa ditangkap

#### 4️⃣ **Kewajiban Makan**
- Jika ada kesempatan menangkap pion lawan (**langkah makan tersedia**), pemain **WAJIB melakukan langkah makan**
- Pemain tidak boleh memilih langkah gerak normal jika ada langkah makan yang bisa dilakukan
- Fitur "Wajib Makan" dapat diubah dari tombol kontrol game

#### 5️⃣ **Giliran Bermain**
- Pemain 1 (Abu-abu) bermain terlebih dahulu
- Setelah satu langkah selesai, giliran berganti ke pemain lain
- Indikator giliran ditampilkan di bagian atas layar

### 🏆 Kondisi Menang
- Pemain memenangkan permainan ketika **semua pion lawan telah ditangkap dan hilang dari papan**
- Permainan akan berakhir otomatis dan menampilkan pesan pemenang

---

## 🎮 Cara Bermain di Game

### Melakukan Gerakan
1. **Klik pion Anda** yang ingin dipindahkan
   - Pion yang dipilih akan ditandai dengan warna kuning emas
   - Titik-titik hijau menunjukkan semua posisi yang bisa dituju dengan langkah normal
   - Titik-titik merah menunjukkan semua posisi yang bisa dituju dengan langkah makan

2. **Klik titik tujuan** 
   - Pion akan bergerak ke titik tersebut
   - Jika itu langkah makan, pion lawan akan ditangkap
   - Jika bisa makan berantai, silakan lanjutkan memilih gerakan berikutnya

3. **Selesaikan giliran**
   - Setelah selesai dengan semua gerakan yang diperlukan, giliran otomatis berganti

### Tampilan Visual
- **Warna Pion:**
  - Pemain 1: Abu-abu cerah (#d3d3d3)
  - Pemain 2: Merah gelap (#a52a2a)

- **Indikator Warna Gerakan:**
  - 🟢 Hijau: Gerakan normal yang tersedia
  - 🔴 Merah: Gerakan makan yang tersedia

---

## 🎛️ Tombol Kontrol

| Tombol | Fungsi |
|--------|--------|
| **Restart Game** | Mulai permainan baru dari awal |
| **Undo Langkah** | Batalkan langkah terakhir dan kembali ke kondisi sebelumnya |
| **🔊 Sound: ON/OFF** | Aktifkan/matikan efek suara |
| **Wajib Makan: ON/OFF** | Aktifkan/matikan aturan kewajiban makan |

---

## 💡 Tips Strategis

1. **Kontrol Pusat Papan**
   - Baris tengah (baris 2) adalah area penting strategis
   - Kuasai pusat untuk membuka peluang menangkap pion lawan

2. **Terjebak Pion Lawan**
   - Coba letak pion Anda sedemikian rupa sehingga pion lawan terjebak
   - Pion yang terjebak tidak bisa bergerak dan mudah ditangkap

3. **Manfaatkan Multi-Capture**
   - Cari kesempatan untuk makan berantai
   - Satu gerakan makan berantai bisa menghilangkan 2-3 pion lawan sekaligus

4. **Lindungi Pion Anda**
   - Jangan tinggalkan pion sendirian di mana bisa dilompati
   - Kelompokkan pion untuk pertahanan

5. **Antisipasi Langkah Lawan**
   - Pikirkan langkah 2-3 gerakan ke depan
   - Hindari membuka peluang bagi lawan untuk menangkap banyak pion

---

## 🤖 Mode AI

- Game dilengkapi dengan AI untuk Pemain 2
- AI menggunakan algoritma Minimax dengan depth 3 untuk membuat keputusan strategis
- AI akan berpikir dan menampilkan timer waktu pemikiran
- Bermain melawan AI memberikan tantangan yang seru dan realistis

---

## 🎯 Pengalaman Bermain

Game ini dirancang untuk:
- ✅ Menghibur dan menantang otak
- ✅ Melestarikan permainan tradisional Indonesia
- ✅ Dimainkan cepat (biasanya 5-15 menit per permainan)
- ✅ Cocok untuk semua usia

---

## 📝 Catatan Penting

- Tidak ada batasan waktu untuk bermain - ambil waktu Anda untuk berpikir
- Anda bisa membatalkan langkah terakhir dengan tombol "Undo" jika perlu
- Permainan bisa diulang berkali-kali tanpa batasan
- Nikmati pengalaman bermain permainan tradisional yang didigitalkan! 🎮

---

**Semoga Anda menikmati permainan DAMAN!** 🎉
