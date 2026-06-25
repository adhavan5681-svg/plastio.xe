import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST /api/gallery/[slug]/verify-pin — verify the PIN for a gallery
export async function POST(req, { params }) {
  const { slug } = params;
  const { pin } = await req.json();

  if (!pin) {
    return NextResponse.json({ error: "PIN is required" }, { status: 400 });
  }

  try {
    const client = await prisma.client.findUnique({
      where: { uniqueLink: slug },
      select: { pin: true, status: true }
    });

    if (!client) {
      return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
    }

    if (client.status === "PENDING") {
      return NextResponse.json({ error: "Gallery not published yet" }, { status: 403 });
    }

    if (client.pin !== String(pin).trim()) {
      return NextResponse.json({ error: "Incorrect PIN" }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PIN verify error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
