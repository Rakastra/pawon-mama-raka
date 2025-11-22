import React from 'react';
import Countdown from '../components/Countdown';

export default function Home() {
  // placeholder target, nantinya ambil dari Firestore: currentPO.releaseAt
  const demoTarget = new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString();

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <header className="w-full max-w-4xl text-center my-8">
        <h1 className="text-4xl font-extrabold">Pawon Mama Raka — Pre Order</h1>
        <p className="text-gray-600 mt-2">Pre-order roti & makanan rumahan</p>
      </header>

      <section className="w-full max-w-2xl bg-indigo-600/10 p-6 rounded">
        <h2 className="text-2xl font-semibold mb-4 text-center">Countdown sampai PO rilis</h2>
        <Countdown targetDate={demoTarget} />
      </section>

      <section className="w-full max-w-4xl mt-8">
        <h3 className="text-xl font-semibold mb-4">Item ter-highlight (contoh)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Item cards: diisi dari katalog Firestore */}
          <div className="p-4 bg-white rounded shadow">Roti Tawar — Rp20.000</div>
          <div className="p-4 bg-white rounded shadow">Roti Coklat — Rp22.000</div>
          <div className="p-4 bg-white rounded shadow">Brownies — Rp25.000</div>
        </div>
      </section>
    </main>
  );
}