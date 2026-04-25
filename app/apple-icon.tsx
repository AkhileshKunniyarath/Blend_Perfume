import { ImageResponse } from 'next/og';

export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0a',
          borderRadius: 42,
          border: '10px solid #d2d2d6',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 24,
            width: 28,
            height: 20,
            borderRadius: 8,
            background: '#ffffff',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 38,
            width: 40,
            height: 16,
            borderRadius: 8,
            background: '#ffffff',
          }}
        />
        <div
          style={{
            width: 82,
            height: 82,
            borderRadius: '50%',
            border: '16px solid #ffffff',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 26,
            width: 66,
            height: 34,
            borderRadius: 18,
            background: '#0a0a0a',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 86,
            top: 76,
            padding: '6px 10px',
            borderRadius: 10,
            background: '#b51919',
            color: '#111111',
            fontSize: 14,
            fontWeight: 800,
            fontFamily: 'Arial, sans-serif',
          }}
        >
          BLEND
        </div>
      </div>
    ),
    size
  );
}
