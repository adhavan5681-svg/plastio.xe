import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { slug } = params;

  try {
    const client = await prisma.client.findUnique({
      where: { uniqueLink: slug },
      include: {
        studio: {
          select: {
            name: true
          }
        },
        photos: {
          orderBy: { uploadedAt: "asc" }
        }
      }
    });

    if (!client) {
      return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error("Failed to fetch gallery:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
