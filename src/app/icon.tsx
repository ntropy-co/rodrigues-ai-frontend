import { ImageResponse } from 'next/og'

export const size = {
  width: 32,
  height: 32
}

export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background:
            'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          position: 'relative'
        }}
      >
        {/* Folha estilizada */}
        <div
          style={{
            width: '80%',
            height: '80%',
            background:
              'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
            transform: 'rotate(-45deg)',
            position: 'relative'
          }}
        />

        {/* Ponto central (caule) */}
        <div
          style={{
            position: 'absolute',
            bottom: '2px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '3px',
            height: '8px',
            background: '#166534',
            borderRadius: '2px'
          }}
        />
      </div>
    ),
    {
      ...size
    }
  )
}
