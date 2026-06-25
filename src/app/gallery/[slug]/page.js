"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function PublicGalleryPage({ params }) {
  const { slug } = params;
  const router = useRouter();

  // PIN gate state
  const [pinUnlocked, setPinUnlocked] = useState(false);
  const [pin, setPin] = useState(["", "", "", ""]);
  const [pinError, setPinError] = useState("");
  const [pinLoading, setPinLoading] = useState(false);
  const pinRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  // Gallery state
  const [client, setClient] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Auto-focus first PIN box on mount
  useEffect(() => {
    if (!pinUnlocked && pinRefs[0].current) {
      pinRefs[0].current.focus();
    }
  }, [pinUnlocked]);

  const handlePinDigit = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newPin = [...pin];
    newPin[index] = digit;
    setPin(newPin);
    setPinError("");

    if (digit && index < 3) {
      pinRefs[index + 1].current?.focus();
    }

    // Auto-submit when all 4 digits entered
    if (digit && index === 3) {
      const fullPin = [...newPin.slice(0, 3), digit].join("");
      if (fullPin.length === 4) {
        submitPin(fullPin);
      }
    }
  };

  const handlePinKeyDown = (index, e) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      pinRefs[index - 1].current?.focus();
    }
    if (e.key === "Enter") {
      submitPin(pin.join(""));
    }
  };

  const handlePinPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (pasted.length === 4) {
      setPin(pasted.split(""));
      submitPin(pasted);
    }
  };

  const submitPin = async (fullPin) => {
    if (fullPin.length !== 4) {
      setPinError("Please enter all 4 digits.");
      return;
    }
    setPinLoading(true);
    setPinError("");

    try {
      const res = await fetch(`/api/gallery/${slug}/verify-pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: fullPin }),
      });

      if (res.ok) {
        setPinUnlocked(true);
        fetchGallery();
      } else {
        const data = await res.json();
        setPinError(data.error || "Incorrect PIN. Please try again.");
        setPin(["", "", "", ""]);
        setTimeout(() => pinRefs[0].current?.focus(), 50);
      }
    } catch {
      setPinError("Connection error. Please try again.");
    } finally {
      setPinLoading(false);
    }
  };

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/gallery/${slug}`);
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setClient(data);
        setPhotos(data.photos || []);
        const preSelected = data.photos
          .filter((photo) => photo.isSelected)
          .map((photo) => photo.id);
        setSelectedIds(preSelected);
      } else {
        setNotFound(true);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load gallery.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (photoId) => {
    if (client?.status === "SUBMITTED") return;
    setSelectedIds((prev) =>
      prev.includes(photoId)
        ? prev.filter((id) => id !== photoId)
        : [...prev, photoId]
    );
  };

  const handleSubmit = async () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one photo before submitting.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/gallery/${slug}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedPhotoIds: selectedIds }),
      });

      if (res.ok) {
        router.push(`/gallery/${slug}/thank-you`);
      } else {
        const errData = await res.json();
        setError(errData.error || "Failed to submit selections.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred during submission.");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── PIN LOCK SCREEN ──────────────────────────────────────────────────────
  if (!pinUnlocked) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center px-4">
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-600/8 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-600/15 border border-amber-600/30 mb-5">
              <svg className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-serif font-bold text-white tracking-tight">Private Gallery</h1>
            <p className="text-sm text-stone-400 mt-2 font-sans">
              Enter the 4-digit PIN shared by your wedding studio
            </p>
          </div>

          {/* PIN Input Card */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 space-y-6">
            {/* 4 digit boxes */}
            <div className="flex justify-center gap-3">
              {pin.map((digit, i) => (
                <input
                  key={i}
                  ref={pinRefs[i]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinDigit(i, e.target.value)}
                  onKeyDown={(e) => handlePinKeyDown(i, e)}
                  onPaste={i === 0 ? handlePinPaste : undefined}
                  className={`w-14 h-16 text-center text-2xl font-bold font-mono rounded-xl border-2 bg-white/10 text-white outline-none transition-all duration-200 caret-transparent
                    ${pinError
                      ? "border-red-500 bg-red-500/10 animate-shake"
                      : digit
                      ? "border-amber-500 bg-amber-500/10"
                      : "border-white/20 focus:border-amber-400 focus:bg-white/15"
                    }`}
                />
              ))}
            </div>

            {/* Error message */}
            {pinError && (
              <div className="text-center">
                <p className="text-sm text-red-400 font-medium">{pinError}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              onClick={() => submitPin(pin.join(""))}
              disabled={pinLoading || pin.join("").length !== 4}
              className="w-full rounded-xl bg-amber-600 hover:bg-amber-500 disabled:bg-white/10 disabled:cursor-not-allowed text-white font-semibold py-3 text-sm transition-all duration-200 shadow-lg shadow-amber-600/20"
            >
              {pinLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verifying...
                </span>
              ) : (
                "Unlock Gallery →"
              )}
            </button>
          </div>

          <p className="text-center text-xs text-stone-600 mt-6 font-sans">
            Don&#39;t have your PIN? Contact your wedding studio.
          </p>
        </div>
      </div>
    );
  }

  // ─── GALLERY LOADING ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="text-stone-600 font-serif text-lg animate-pulse">Opening wedding gallery...</div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-4 text-center">
        <h1 className="text-4xl font-serif font-bold text-stone-900 mb-2">Gallery Not Found</h1>
        <p className="text-sm text-stone-600 max-w-md mb-6">
          The link you followed may have expired, or it is incorrect. Please check with your wedding studio.
        </p>
        <div className="font-serif text-sm font-semibold tracking-wider text-stone-400">SIGNATURE STUDIOS</div>
      </div>
    );
  }

  const isSubmitted = client?.status === "SUBMITTED";

  // ─── GALLERY VIEW ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-stone-50 pb-32">
      {/* Header Banner */}
      <header className="bg-white border-b border-stone-200/60 py-12 px-4 text-center space-y-3">
        <span className="text-xs uppercase tracking-widest text-stone-500 font-sans font-medium">
          Wedding Selection Gallery
        </span>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-stone-900 tracking-tight">
          {client?.name}
        </h1>
        <div className="h-0.5 w-16 bg-stone-300 mx-auto"></div>
        <p className="text-sm text-stone-650 font-serif italic">
          by {client?.studio?.name}
        </p>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        {error && (
          <div className="rounded-md bg-red-50 p-4 border border-red-200 max-w-3xl mx-auto">
            <div className="text-sm font-medium text-red-800">{error}</div>
          </div>
        )}

        {isSubmitted && (
          <div className="max-w-3xl mx-auto bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center space-y-2">
            <h2 className="text-lg font-serif font-bold text-amber-900">Selections Submitted</h2>
            <p className="text-sm text-stone-600">
              You have already submitted your selection of <strong>{selectedIds.length}</strong> {selectedIds.length === 1 ? "photo" : "photos"}.
              This gallery is now in read-only view.
            </p>
          </div>
        )}

        {/* Photo Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {photos.map((photo) => {
            const isSelected = selectedIds.includes(photo.id);
            return (
              <div
                key={photo.id}
                onClick={() => toggleSelection(photo.id)}
                className={`group relative overflow-hidden rounded-2xl border bg-stone-100 aspect-[4/3] flex items-center justify-center transition-all duration-350 ${
                  !isSubmitted ? "cursor-pointer" : ""
                } ${
                  isSelected
                    ? "border-amber-600 ring-4 ring-amber-600/10 scale-[0.99]"
                    : "border-stone-200/80 hover:border-stone-350"
                }`}
              >
                <img
                  src={photo.filepath}
                  alt={photo.filename}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  style={{ contentVisibility: 'auto' }}
                />

                {isSelected && (
                  <div className="absolute inset-0 bg-stone-900/10 transition-opacity">
                    <div className="absolute top-3 right-3 bg-amber-600 text-white rounded-full p-1.5 shadow-md">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}

                {!isSubmitted && !isSelected && (
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* Sticky Bottom Counter */}
      <div className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-md border-t border-stone-200 py-4 px-6 z-20 shadow-lg">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wider text-stone-500 font-sans">
              Selection Progress
            </span>
            <span className="font-serif text-lg font-bold text-stone-950">
              {selectedIds.length} {selectedIds.length === 1 ? "photo" : "photos"} selected
            </span>
          </div>

          {!isSubmitted ? (
            <button
              onClick={handleSubmit}
              disabled={selectedIds.length === 0 || submitting}
              className="rounded-md bg-stone-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-stone-850 focus:outline-none disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Submitting Selection..." : "Submit Selection"}
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-amber-805 bg-amber-50 px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider border border-amber-200">
              Submitted
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
