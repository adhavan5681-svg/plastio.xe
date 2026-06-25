"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ClientDetailPage({ params }) {
  const { id } = params;
  const router = useRouter();
  const { data: session, status } = useSession();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchClient();
    }
  }, [status, id]);

  const fetchClient = async () => {
    try {
      const res = await fetch(`/api/clients/${id}`);
      if (res.ok) {
        const data = await res.json();
        setClient(data);
      } else {
        const errData = await res.json();
        setError(errData.error || "Failed to load client details.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred loading client.");
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await uploadFiles(e.target.files);
    }
  };

  const uploadFiles = async (fileList) => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    const filesToUpload = Array.from(fileList).filter((file) =>
      validTypes.includes(file.type)
    );

    if (filesToUpload.length === 0) {
      alert("Please upload only JPG or PNG images.");
      return;
    }

    setUploading(true);
    setError("");

    const formData = new FormData();
    filesToUpload.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const res = await fetch(`/api/clients/${id}/upload`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        await fetchClient();
      } else {
        const errData = await res.json();
        setError(errData.error || "Failed to upload photos.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to upload photos.");
    } finally {
      setUploading(false);
    }
  };

  const handlePublish = async () => {
    setError("");
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PUBLISHED" }),
      });

      if (res.ok) {
        await fetchClient();
      } else {
        const errData = await res.json();
        setError(errData.error || "Failed to publish client gallery.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred during publishing.");
    }
  };

  const copyToClipboard = () => {
    if (!client) return;
    const galleryUrl = `${window.location.origin}/gallery/${client.uniqueLink}`;
    navigator.clipboard.writeText(galleryUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="text-stone-600 font-serif text-lg animate-pulse">Loading client workspace...</div>
      </div>
    );
  }

  if (status === "unauthenticated" || !client) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="text-red-600 font-serif text-lg">{error || "Client not found."}</div>
      </div>
    );
  }

  const selectedPhotos = client.photos.filter((p) => p.isSelected);
  const selectedCount = selectedPhotos.length;
  const totalCount = client.photos.length;

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-stone-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-stone-600 hover:text-stone-950 transition-colors inline-flex items-center gap-1.5"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-serif text-2xl font-bold tracking-wide text-stone-900">SIGNATURE</span>
            <span className="text-xs uppercase tracking-widest text-stone-500 font-sans border-l border-stone-300 pl-2">Studios</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        {/* Error Alert */}
        {error && (
          <div className="rounded-md bg-red-50 p-4 border border-red-200 max-w-3xl">
            <div className="text-sm font-medium text-red-800">{error}</div>
          </div>
        )}

        {/* Workspace Card */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-serif font-bold text-stone-900 tracking-tight">{client.name}</h1>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                  client.status === "PENDING"
                    ? "bg-amber-50 text-amber-800 border border-amber-200/60"
                    : client.status === "PUBLISHED"
                    ? "bg-sky-50 text-sky-800 border border-sky-200/60"
                    : "bg-emerald-50 text-emerald-800 border border-emerald-200/60"
                }`}
              >
                {client.status.toLowerCase()}
              </span>
            </div>
            <div className="flex gap-4 text-sm text-stone-600 flex-wrap">
              <div>
                Event: <span className="font-semibold text-stone-900">{new Date(client.eventDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
              </div>
              <div className="border-l border-stone-300 pl-4">
                Phone: <span className="font-semibold text-stone-900">{client.phone}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap items-center">
            {/* Gallery PIN Badge - always visible */}
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
              <svg className="h-4 w-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] uppercase tracking-wider text-amber-700 font-semibold">Gallery PIN</span>
                <span className="text-lg font-bold font-mono text-amber-900 tracking-[0.3em]">{client.pin}</span>
              </div>
            </div>

            {client.status === "PENDING" && (
              <button
                onClick={handlePublish}
                disabled={totalCount === 0}
                className="rounded-md bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-stone-850 focus:outline-none disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors"
              >
                Publish Gallery
              </button>
            )}

            {(client.status === "PUBLISHED" || client.status === "SUBMITTED") && (
              <div className="flex items-center gap-2 bg-stone-100 border border-stone-200 rounded-md p-1.5 pl-3">
                <span className="text-xs text-stone-600 truncate max-w-xs font-sans">
                  {window.location.origin}/gallery/{client.uniqueLink}
                </span>
                <button
                  onClick={copyToClipboard}
                  className="rounded bg-white px-2.5 py-1 text-xs font-semibold text-stone-900 border border-stone-200 hover:bg-stone-50 transition-colors"
                >
                  {copied ? "Copied!" : "Copy Link"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Selected Photos Banner */}
        {client.status === "SUBMITTED" && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-500 text-white p-2">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-serif font-bold text-emerald-900">Selection Submitted</h2>
                <p className="text-sm text-emerald-850">The client has selected their choices for this wedding event.</p>
              </div>
            </div>
            <div className="text-xl font-bold font-serif text-emerald-900 bg-white border border-emerald-200 px-4 py-2 rounded-xl">
              Selected: {selectedCount} of {totalCount}
            </div>
          </div>
        )}

        {/* Photo Uploader */}
        {client.status !== "SUBMITTED" && (
          <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-serif font-semibold text-stone-900">Upload Photos</h2>
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`relative rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-10 text-center transition-all ${
                dragActive
                  ? "border-stone-500 bg-stone-50/80"
                  : "border-stone-300 hover:border-stone-400 bg-stone-50/20"
              }`}
            >
              <input
                id="file-upload"
                type="file"
                multiple
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleFileInput}
                className="hidden"
                disabled={uploading}
              />
              <svg className="h-10 w-10 text-stone-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v12m0 0l-3-3m3 3l3-3m2.25-9a13.5 13.5 0 01-16.5 0M2.25 9h19.5" />
              </svg>
              <p className="text-sm text-stone-700 font-medium">
                {uploading ? (
                  <span className="animate-pulse">Uploading and compressing photos...</span>
                ) : (
                  <>
                    Drag & drop files here, or{" "}
                    <label htmlFor="file-upload" className="text-stone-900 hover:underline cursor-pointer font-bold">
                      browse
                    </label>
                  </>
                )}
              </p>
              <p className="text-xs text-stone-500 mt-2">PNG or JPG formats only. Max resolution compressed to 1600px wide.</p>
            </div>
          </div>
        )}

        {/* Photos Grid */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-serif font-semibold text-stone-900">
            {client.status === "SUBMITTED" ? "Client Selections" : "Uploaded Photos"} ({totalCount})
          </h2>
          {totalCount === 0 ? (
            <div className="text-center py-12 text-stone-500 text-sm">
              No photos uploaded to this gallery yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {client.photos.map((photo) => (
                <div
                  key={photo.id}
                  className={`group relative overflow-hidden rounded-xl border aspect-[4/3] bg-stone-100 flex items-center justify-center transition-all ${
                    photo.isSelected
                      ? "border-emerald-500 ring-2 ring-emerald-500/30"
                      : "border-stone-200/80 hover:border-stone-300"
                  }`}
                >
                  <img
                    src={photo.filepath}
                    alt={photo.filename}
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                  {photo.isSelected && (
                    <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-1 shadow-sm z-10">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2 translate-y-full group-hover:translate-y-0 transition-transform text-white text-xs truncate">
                    {photo.filename}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
