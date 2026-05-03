import { Client } from 'minio';

type MinioConnectionConfig = {
  endPoint: string;
  port?: number;
  useSSL: boolean;
};

const MINIO_BUCKET_NAME = process.env.MINIO_BUCKET_NAME?.trim() || 'ecommerce-images';
const MINIO_REGION = process.env.MINIO_REGION?.trim() || 'us-east-1';

function parsePort(value?: string) {
  if (!value) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function resolveConnectionConfig(): MinioConnectionConfig {
  const minioUrl = process.env.MINIO_URL?.trim();
  if (minioUrl) {
    const parsedUrl = new URL(minioUrl);

    return {
      endPoint: parsedUrl.hostname,
      port: parsePort(parsedUrl.port),
      useSSL: parsedUrl.protocol === 'https:',
    };
  }

  return {
    endPoint: process.env.MINIO_ENDPOINT?.trim() || 'localhost',
    port: parsePort(process.env.MINIO_PORT) ?? 9000,
    useSSL: process.env.MINIO_USE_SSL === 'true',
  };
}

const minioConnection = resolveConnectionConfig();

const minioClient = new Client({
  endPoint: minioConnection.endPoint,
  port: minioConnection.port,
  useSSL: minioConnection.useSSL,
  pathStyle: true,
  accessKey: process.env.MINIO_ACCESS_KEY || '',
  secretKey: process.env.MINIO_SECRET_KEY || '',
  region: MINIO_REGION,
});

export const isMinioConfigured = Boolean(
  (process.env.MINIO_URL?.trim() || process.env.MINIO_ENDPOINT?.trim()) &&
    process.env.MINIO_ACCESS_KEY?.trim() &&
    process.env.MINIO_SECRET_KEY?.trim()
);

function buildMinioBaseUrl() {
  const configuredPublicUrl =
    process.env.MINIO_PUBLIC_URL?.trim() || process.env.MINIO_URL?.trim();

  if (configuredPublicUrl) {
    return configuredPublicUrl.replace(/\/+$/, '');
  }

  const protocol = minioConnection.useSSL ? 'https' : 'http';
  const defaultPort = minioConnection.useSSL ? 443 : 80;
  const portSegment =
    minioConnection.port && minioConnection.port !== defaultPort
      ? `:${minioConnection.port}`
      : '';

  return `${protocol}://${minioConnection.endPoint}${portSegment}`;
}

const MINIO_BASE_URL = buildMinioBaseUrl();

function buildPublicReadPolicy(bucketName: string) {
  return JSON.stringify({
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Principal: {
          AWS: ['*'],
        },
        Action: ['s3:GetObject'],
        Resource: [`arn:aws:s3:::${bucketName}/*`],
      },
    ],
  });
}

let bucketReadyPromise: Promise<void> | null = null;

export async function ensureBucketExists() {
  if (!bucketReadyPromise) {
    bucketReadyPromise = (async () => {
      const exists = await minioClient.bucketExists(MINIO_BUCKET_NAME);
      if (!exists) {
        await minioClient.makeBucket(MINIO_BUCKET_NAME, MINIO_REGION);
      }

      await minioClient.setBucketPolicy(
        MINIO_BUCKET_NAME,
        buildPublicReadPolicy(MINIO_BUCKET_NAME)
      );
    })();
  }

  try {
    await bucketReadyPromise;
  } catch (error) {
    bucketReadyPromise = null;
    throw error;
  }
}

export function getMinioProxyUrl(objectName: string, bucketName = MINIO_BUCKET_NAME) {
  const encodedSegments = objectName
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  return `/api/media/${encodeURIComponent(bucketName)}/${encodedSegments}`;
}

export function getMinioObjectUrl(objectName: string) {
  return getMinioProxyUrl(objectName);
}

export function getMinioPublicObjectUrl(objectName: string) {
  return new URL(
    `${encodeURIComponent(MINIO_BUCKET_NAME)}/${encodeURIComponent(objectName)}`,
    `${MINIO_BASE_URL}/`
  ).toString();
}

export { MINIO_BUCKET_NAME };

export default minioClient;
