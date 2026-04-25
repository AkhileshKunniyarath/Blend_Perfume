import { ImageResponse } from 'next/og';

export const alt = 'Blend Perfume brand card';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(135deg, #efe7dc 0%, #f6f2eb 45%, #ddd4ca 100%)',
        }}
      >
        <div
          style={{
            width: 1040,
            height: 500,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 54,
            border: '18px solid #d2d2d6',
            background: '#060606',
            boxShadow: '0 36px 80px rgba(0, 0, 0, 0.22)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: 180,
              fontWeight: 800,
              fontFamily: 'Arial, sans-serif',
              letterSpacing: 8,
              lineHeight: 1,
            }}
          >
            <span>BL</span>
            <div
              style={{
                width: 160,
                height: 190,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                margin: '0 18px',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  width: 56,
                  height: 38,
                  borderRadius: 14,
                  background: '#ffffff',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 28,
                  width: 78,
                  height: 22,
                  borderRadius: 10,
                  background: '#ffffff',
                }}
              />
              <div
                style={{
                  width: 138,
                  height: 138,
                  borderRadius: '50%',
                  border: '24px solid #ffffff',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  width: 104,
                  height: 52,
                  borderRadius: 26,
                  background: '#060606',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: 72,
                  top: 74,
                  padding: '10px 24px',
                  borderRadius: 14,
                  background: '#b51919',
                  color: '#111111',
                  fontSize: 26,
                  fontWeight: 800,
                  fontFamily: 'Arial, sans-serif',
                }}
              >
                BLEND
              </div>
            </div>
            <span>ND</span>
          </div>

          <div
            style={{
              width: 930,
              height: 14,
              borderRadius: 999,
              background: '#c8c8cc',
              marginTop: 30,
            }}
          />

          <div
            style={{
              marginTop: 52,
              color: '#ffffff',
              fontSize: 54,
              fontWeight: 700,
              letterSpacing: 8,
              fontFamily: 'Georgia, serif',
            }}
          >
            MAKE OWN PERFUME
          </div>
        </div>
      </div>
    ),
    size
  );
}
