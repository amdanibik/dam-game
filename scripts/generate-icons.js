// Skrip ini dijalankan di PC Windows Anda (bukan WSL) menggunakan Node.js
// setelah `npm install` dijalankan dan paket sharp tersedia.
//
// JALANKAN: node scripts/generate-icons.js

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SOURCE = path.join(__dirname, '..', 'resources', 'icon-source.jpg');
const OUT_DIR = path.join(__dirname, '..', 'icons');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

(async () => {
    for (const size of SIZES) {
        const output = path.join(OUT_DIR, `icon-${size}.png`);
        await sharp(SOURCE)
            .resize(size, size, { fit: 'cover', position: 'center' })
            .png()
            .toFile(output);
        console.log(`Generated: icon-${size}.png (${size}x${size})`);
    }
    console.log('\nSemua icon berhasil di-generate di folder icons/');
})();
