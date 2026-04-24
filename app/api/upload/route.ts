import { NextResponse } from 'next/server';
import minioClient, { MINIO_BUCKET_NAME, ensureBucketExists } from '@/lib/minio';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

    await ensureBucketExists();

    await minioClient.putObject(
      MINIO_BUCKET_NAME,
      fileName,
      buffer,
      file.size,
      { 'Content-Type': file.type }
    );

    // Depending on your setup, the URL might be different
    // Often it's http://<minio-host>:<port>/<bucket-name>/<file-name>
    const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
    const host = process.env.MINIO_ENDPOINT || 'localhost';
    const port = process.env.MINIO_PORT || '9000';
    
    const fileUrl = `${protocol}://${host}:${port}/${MINIO_BUCKET_NAME}/${fileName}`;

    return NextResponse.json({ url: fileUrl }, { status: 201 });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
