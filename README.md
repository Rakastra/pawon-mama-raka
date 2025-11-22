# Pawon Mama Raka — Pre-Order Website (PO)

Deskripsi
- Website Pre-Order untuk "Pawon Mama Raka".
- Fitur utama: Homepage dengan countdown PO, admin panel untuk membuat/menjalankan PO, Google Authentication untuk user, user dashboard, invoice printable, dan rekap pesanan per PO.

Stack yang disarankan
- Next.js (React)
- Tailwind CSS
- Firebase Authentication (Google) + Firestore (database)
- Vercel / Firebase Hosting untuk deploy
- (Opsional) Stripe untuk pembayaran online

Quickstart (lokal)
1. clone repo
2. yarn install
3. siapkan Firebase project dan duplikat .env.local.example -> .env.local
4. yarn dev

Struktur direktori (inti)
- src/pages — halaman Next.js
- src/components — komponen UI (Countdown, ItemCard, AdminControls)
- src/lib/firebase.js — init Firebase
- src/hooks — custom hooks

Catatan
- File ini adalah skeleton awal. Setelah konfirmasi akses ke GitHub, saya bisa push langsung atau lanjut implementasi fitur lengkap.
