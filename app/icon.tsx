import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

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
          background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
          borderRadius: '8px',
          fontFamily: 'sans-serif',
          fontWeight: 900,
          fontSize: 20,
          color: 'white',
          letterSpacing: '-1px',
        }}
      >
        F
      </div>
    ),
    { ...size }
  )
}
