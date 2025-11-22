import React, { useEffect, useState } from 'react';

export default function Countdown({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  function getTimeLeft() {
    const diff = new Date(targetDate).getTime() - Date.now();
    if (diff <= 0) return null;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return { days, hours, minutes, seconds };
  }

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(t);
  }, [targetDate]);

  if (!timeLeft) return <div className="text-center text-lg font-semibold">PO sudah dibuka atau telah berakhir</div>;

  return (
    <div className="flex gap-3 justify-center items-center text-center">
      <div className="p-3 bg-white/80 rounded shadow">
        <div className="text-2xl font-bold">{timeLeft.days}</div>
        <div className="text-sm">Hari</div>
      </div>
      <div className="p-3 bg-white/80 rounded shadow">
        <div className="text-2xl font-bold">{timeLeft.hours}</div>
        <div className="text-sm">Jam</div>
      </div>
      <div className="p-3 bg-white/80 rounded shadow">
        <div className="text-2xl font-bold">{timeLeft.minutes}</div>
        <div className="text-sm">Menit</div>
      </div>
      <div className="p-3 bg-white/80 rounded shadow">
        <div className="text-2xl font-bold">{timeLeft.seconds}</div>
        <div className="text-sm">Detik</div>
      </div>
    </div>
  );
}