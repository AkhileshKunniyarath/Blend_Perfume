import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import minioClient, {
  MINIO_BUCKET_NAME,
  ensureBucketExists,
  getMinioObjectUrl,
  isMinioConfigured,
} from '@/lib/minio';

export async function POST(req: NextRequest) {
  // Guard: return a clear error if storage is not yet configured
  if (!isMinioConfigured) {
    return NextResponse.json(
      {
        error:
          'Storage is not configured. Add MINIO_URL (or MINIO_ENDPOINT), MINIO_ACCESS_KEY, and MINIO_SECRET_KEY to .env.local and restart the server.',
      },
      { status: 503 }
    );
  }

  try {
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Request must be multipart/form-data' },
        { status: 400 }
      );
    }

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse form data. Please try uploading again.' },
        { status: 400 }
      );
    }

    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = file.name
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9._-]/g, '');
    const fileName = `${Date.now()}-${randomUUID()}-${safeName || 'upload'}`;

    await ensureBucketExists();

    await minioClient.putObject(
      MINIO_BUCKET_NAME,
      fileName,
      buffer,
      file.size,
      { 'Content-Type': file.type }
    );
    const fileUrl = getMinioObjectUrl(fileName);

    return NextResponse.json({ url: fileUrl }, { status: 201 });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}

