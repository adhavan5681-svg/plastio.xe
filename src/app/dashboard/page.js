"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchClients();
    }
  }, [status]);

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients");
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (err) {
      console.error("Error loading clients:", err);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="text-stone-600 font-serif text-lg animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-stone-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="font-serif text-2xl font-bold tracking-wide text-stone-900">SIGNATURE</span>
            <span className="text-xs uppercase tracking-widest text-stone-500 font-sans border-l border-stone-300 pl-2">Studios</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-stone-600">
              Welcome, <span className="font-medium text-stone-950">{session?.user?.name}</span>
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-sm font-medium text-stone-600 hover:text-stone-950 transition-colors border border-stone-200 hover:bg-stone-50 rounded-md px-3 py-1.5"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-stone-900 tracking-tight">Clients</h1>
            <p className="mt-2 text-sm text-stone-600">
              Manage client details, upload photos, and track customer print selections.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              href="/dashboard/clients/new"
              className="inline-flex items-center justify-center rounded-md bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-stone-850 focus:outline-none transition-colors"
            >
              Add Client
            </Link>
          </div>
        </div>

        {clients.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center max-w-lg mx-auto mt-12 shadow-sm">
            <svg
              className="mx-auto h-12 w-12 text-stone-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-serif font-semibold text-stone-900">No clients yet</h3>
            <p className="mt-2 text-sm text-stone-600">Get started by creating your first client gallery.</p>
            <div className="mt-6">
              <Link
                href="/dashboard/clients/new"
                className="inline-flex items-center rounded-md bg-stone-900 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-850"
              >
                Add Client
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {clients.map((client) => {
              const formattedDate = new Date(client.eventDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              });

              return (
                <div
                  key={client.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white border border-stone-200/80 p-6 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-serif text-xl font-bold text-stone-900 group-hover:text-stone-700 transition-colors">
                        {client.name}
                      </h3>
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

                    <div className="space-y-2 text-sm text-stone-600">
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zM14.25 15h.008v.008H14.25V15zm0 2.25h.008v.008H14.25v-.008zM16.5 15h.008v.008H16.5V15zm0 2.25h.008v.008H16.5v-.008z" />
                        </svg>
                        <span>{formattedDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.387a12.035 12.035 0 01-7.108-7.108c-.145-.44.02-9.27.387-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                        </svg>
                        <span>{client.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      {client.status === "SUBMITTED" ? (
                        <div className="flex items-center gap-1.5 text-emerald-850 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded text-xs font-semibold">
                          <svg className="h-3.5 w-3.5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                          </svg>
                          <span>{client.selectedPhotos} / {client.totalPhotos} selected</span>
                        </div>
                      ) : (
                        <span className="text-xs text-stone-500 font-medium">
                          {client.totalPhotos} {client.totalPhotos === 1 ? "photo" : "photos"} uploaded
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/dashboard/clients/${client.id}`}
                      className="text-sm font-semibold text-stone-900 hover:text-stone-700 transition-colors inline-flex items-center gap-1"
                    >
                      <span>Manage</span>
                      <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M4 2.5L7.5 6L4 9.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
