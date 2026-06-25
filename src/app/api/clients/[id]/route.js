import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  try {
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        photos: {
          orderBy: { uploadedAt: "asc" }
        }
      }
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    if (client.studioId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error("Failed to fetch client:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  try {
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        _count: {
          select: { photos: true }
        }
      }
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    if (client.studioId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { status } = await req.json();
    if (!status || !["PENDING", "PUBLISHED", "SUBMITTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    if (status === "PUBLISHED" && client._count.photos === 0) {
      return NextResponse.json({ error: "Cannot publish client gallery with zero photos" }, { status: 400 });
    }

    const updatedClient = await prisma.client.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json(updatedClient);
  } catch (error) {
    console.error("Failed to update client status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
