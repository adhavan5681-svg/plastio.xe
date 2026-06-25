import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  const { slug } = params;

  try {
    const client = await prisma.client.findUnique({
      where: { uniqueLink: slug }
    });

    if (!client) {
      return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
    }

    if (client.status === "SUBMITTED") {
      return NextResponse.json({ error: "Selection already submitted" }, { status: 400 });
    }

    const { selectedPhotoIds } = await req.json();

    if (!Array.isArray(selectedPhotoIds)) {
      return NextResponse.json({ error: "Invalid selectedPhotoIds. Expected array." }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.photo.updateMany({
        where: { clientId: client.id },
        data: { isSelected: false }
      }),
      prisma.photo.updateMany({
        where: {
          clientId: client.id,
          id: { in: selectedPhotoIds }
        },
        data: { isSelected: true }
      }),
      prisma.client.update({
        where: { id: client.id },
        data: { status: "SUBMITTED" }
      })
    ]);

    return NextResponse.json({ message: "Selections submitted successfully" });
  } catch (error) {
    console.error("Submission error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
