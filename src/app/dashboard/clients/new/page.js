"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function NewClientPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [name, setName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handlePinChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 4);
    setPin(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (pin.length !== 4) {
      setError("Please enter a 4-digit PIN for the gallery.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, eventDate, phone, pin }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create client.");
      } else {
        router.push(`/dashboard/clients/${data.id}`);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="text-stone-600 font-serif text-lg animate-pulse">Loading...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-stone-600 hover:text-stone-950 transition-colors inline-flex items-center gap-1.5"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Dashboard</span>
          </Link>
          <div className="font-serif text-xl font-bold tracking-wide text-stone-900">SIGNATURE</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="bg-white rounded-2xl border border-stone-200/80 p-8 shadow-sm">
          <div className="border-b border-stone-100 pb-5 mb-6">
            <h1 className="text-2xl font-serif font-bold text-stone-900">Create New Client</h1>
            <p className="mt-1 text-sm text-stone-600">
              Set up a client wedding profile to generate their custom selection gallery.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-4 border border-red-200">
                <div className="text-sm font-medium text-red-800">{error}</div>
              </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="client-name" className="block text-sm font-medium text-stone-700">
                  Client Name (e.g. Ramesh & Priya)
                </label>
                <input
                  id="client-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 placeholder-stone-400 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 sm:text-sm"
                  placeholder="Ramesh & Priya"
                />
              </div>

              <div>
                <label htmlFor="event-date" className="block text-sm font-medium text-stone-700">
                  Wedding Event Date
                </label>
                <input
                  id="event-date"
                  type="date"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="phone-number" className="block text-sm font-medium text-stone-700">
                  Client Phone Number
                </label>
                <input
                  id="phone-number"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 placeholder-stone-400 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 sm:text-sm"
                  placeholder="+15550199"
                />
              </div>

              {/* PIN Field */}
              <div className="sm:col-span-2">
                <label htmlFor="gallery-pin" className="block text-sm font-medium text-stone-700">
                  Gallery PIN (4 digits)
                </label>
                <p className="text-xs text-stone-500 mt-0.5 mb-1">
                  Clients must enter this PIN to access their photo gallery. Share it with them privately.
                </p>
                <div className="relative max-w-[140px]">
                  <input
                    id="gallery-pin"
                    type="text"
                    inputMode="numeric"
                    pattern="\d{4}"
                    maxLength={4}
                    required
                    value={pin}
                    onChange={handlePinChange}
                    className="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 text-center text-xl tracking-[0.5em] font-bold placeholder-stone-300 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 sm:text-sm"
                    placeholder="••••"
                  />
                  {pin.length === 4 && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 mt-0.5">
                      <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex gap-1.5 mt-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 w-7 rounded-full transition-colors ${
                        i < pin.length ? "bg-amber-500" : "bg-stone-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-stone-100">
              <Link
                href="/dashboard"
                className="rounded-md border border-stone-300 bg-white py-2 px-4 text-sm font-medium text-stone-700 shadow-sm hover:bg-stone-50 focus:outline-none transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-stone-900 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-stone-850 focus:outline-none disabled:bg-stone-400 transition-colors"
              >
                {loading ? "Creating..." : "Create & Continue"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
