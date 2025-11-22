import React from 'react';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold">Admin Dashboard — Pawon Mama Raka</h1>

      <section className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-white rounded shadow">
          <h2 className="font-semibold">Katalog Item</h2>
          <p className="text-sm text-gray-500">CRUD item roti/makanan</p>
        </div>

        <div className="p-4 bg-white rounded shadow">
          <h2 className="font-semibold">PO Management</h2>
          <p className="text-sm text-gray-500">Buat PO baru, atur tanggal rilis, pilih item</p>
        </div>

        <div className="p-4 bg-white rounded shadow">
          <h2 className="font-semibold">List Pesanan & Rekap</h2>
          <p className="text-sm text-gray-500">Lihat pesanan per PO, cetak invoice, update status bayar</p>
        </div>

        <div className="p-4 bg-white rounded shadow">
          <h2 className="font-semibold">List User</h2>
          <p className="text-sm text-gray-500">Detail user, alamat, WA, history</p>
        </div>
      </section>
    </div>
  );
}