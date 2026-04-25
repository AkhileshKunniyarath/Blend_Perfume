import { ImageResponse } from 'next/og';

export const size = {
  width: 512,
  height: 512,
};

export const contentType = 'image/png';

export default function Icon() {
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
          borderRadius: 110,
          border: '28px solid #d2d2d6',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 72,
            width: 84,
            height: 58,
            borderRadius: 18,
            background: '#ffffff',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 112,
            width: 118,
            height: 40,
            borderRadius: 16,
            background: '#ffffff',
          }}
        />
        <div
          style={{
            width: 220,
            height: 220,
            borderRadius: '50%',
            border: '34px solid #ffffff',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 84,
            width: 168,
            height: 88,
            borderRadius: 44,
            background: '#0a0a0a',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 234,
            top: 210,
            padding: '14px 28px',
            borderRadius: 18,
            background: '#b51919',
            color: '#111111',
            fontSize: 34,
            fontWeight: 800,
            letterSpacing: 1,
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
