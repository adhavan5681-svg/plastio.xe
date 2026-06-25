import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import sharp from "sharp";

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: clientId } = params;

  try {
    const client = await prisma.client.findUnique({
      where: { id: clientId }
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    if (client.studioId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const formData = await req.formData();
    const files = formData.getAll("files");

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const savedPhotos = [];

    for (const file of files) {
      if (!(file instanceof File)) continue;

      const buffer = Buffer.from(await file.arrayBuffer());
      const cleanName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const filename = `${Date.now()}-${cleanName}`;
      const filepath = `wedding-photos/${clientId}/${filename}`;

      const image = sharp(buffer);
      const metadata = await image.metadata();

      let pipeline = image;
      if (metadata.width > 1600) {
        pipeline = pipeline.resize({ width: 1600, fit: "inside", withoutEnlargement: true });
      }
      
      const processedBuffer = await pipeline.jpeg({ quality: 85 }).toBuffer();

      const { error: uploadError } = await supabase.storage
        .from('wedding-photos')
        .upload(filepath, processedBuffer, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        return NextResponse.json({ error: "Failed to upload photo" }, { status: 500 });
      }

      const { data: { publicUrl } } = supabase.storage
        .from('wedding-photos')
        .getPublicUrl(filepath);

      const photo = await prisma.photo.create({
        data: {
          clientId,
          filename: file.name,
          filepath: publicUrl
        }
      });

      savedPhotos.push(photo);
    }

    return NextResponse.json({ message: "Photos uploaded successfully", photos: savedPhotos });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
