"use client";

import { useEffect } from "react";

export default function DemoPage() {
  useEffect(() => {
    window.location.replace("/demo.html");
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white font-sans p-4">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
      <h2 className="text-base font-bold">Loading Interactive Demo...</h2>
      <p className="text-xs text-gray-400 mt-1">If not redirected automatically, <a href="/demo.html" className="text-emerald-400 underline">click here</a>.</p>
    </div>
  );
}
