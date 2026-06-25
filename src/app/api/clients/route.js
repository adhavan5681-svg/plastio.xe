import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";

function generateSlug(name) {
  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  const randomSuffix = crypto.randomBytes(4).toString("hex");
  return `${cleanName}-${randomSuffix}`;
}

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const clients = await prisma.client.findMany({
      where: { studioId: session.user.id },
      include: {
        _count: {
          select: { photos: true }
        },
        photos: {
          where: { isSelected: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const formattedClients = clients.map(client => {
      const selectedCount = client.photos.length;
      return {
        id: client.id,
        name: client.name,
        eventDate: client.eventDate,
        phone: client.phone,
        uniqueLink: client.uniqueLink,
        pin: client.pin,
        status: client.status,
        createdAt: client.createdAt,
        totalPhotos: client._count.photos,
        selectedPhotos: selectedCount
      };
    });

    return NextResponse.json(formattedClients);
  } catch (error) {
    console.error("Failed to fetch clients:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, eventDate, phone, pin } = await req.json();
    if (!name || !eventDate || !phone) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Validate PIN: must be exactly 4 digits
    const pinValue = pin ? String(pin).trim() : "";
    if (!pinValue || !/^\d{4}$/.test(pinValue)) {
      return NextResponse.json({ error: "PIN must be exactly 4 digits" }, { status: 400 });
    }

    const uniqueLink = generateSlug(name);

    const client = await prisma.client.create({
      data: {
        studioId: session.user.id,
        name,
        eventDate: new Date(eventDate),
        phone,
        uniqueLink,
        pin: pinValue,
        status: "PENDING"
      }
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error("Failed to create client:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
