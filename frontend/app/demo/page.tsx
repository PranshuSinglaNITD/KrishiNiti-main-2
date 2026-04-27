"use client";

import { useState } from "react";

export default function DemoPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async () => {
    const res = await fetch("/api/recommend", {
      method: "POST",
      body: JSON.stringify({ query: input }),
    });

    const data = await res.json();
    setResult(data);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-10 bg-zinc-50">
      <h1 className="text-3xl font-bold mb-6">Live Demo</h1>

      <textarea
        placeholder="e.g. 50 quintal wheat, Hoshangabad, harvest in 10 days"
        className="w-full max-w-xl p-4 border rounded-lg"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        className="mt-4 px-6 py-3 bg-green-600 text-white rounded-full"
      >
        Get Recommendation
      </button>

      {result && (
        <div className="mt-8 p-6 bg-black text-white rounded-xl max-w-xl w-full">
          <p>📍 Best Mandi: {result.mandi}</p>
          <p>📅 Sell In: {result.days} days</p>
          <p>💰 Expected Gain: ₹{result.profit}</p>
        </div>
      )}
    </div>
  );
}