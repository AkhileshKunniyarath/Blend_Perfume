import { Readable } from 'node:stream';
import { NextResponse } from 'next/server';
import minioClient from '@/lib/minio';

type MediaRouteContext = {
  params: Promise<{
    bucket: string;
    objectPath: string[];
  }>;
};

export async function GET(_req: Request, { params }: MediaRouteContext) {
  try {
    const { bucket, objectPath } = await params;

    if (!bucket || !objectPath?.length) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const objectName = objectPath.map(decodeURIComponent).join('/');
    const decodedBucket = decodeURIComponent(bucket);
    const [objectStream, objectStat] = await Promise.all([
      minioClient.getObject(decodedBucket, objectName),
      minioClient.statObject(decodedBucket, objectName),
    ]);

    return new NextResponse(Readable.toWeb(objectStream) as ReadableStream<Uint8Array>, {
      headers: {
        'Content-Type': objectStat.metaData['content-type'] || 'application/octet-stream',
        'Content-Length': String(objectStat.size),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving media object:', error);
    return NextResponse.json({ error: 'Failed to load media' }, { status: 404 });
  }
}
