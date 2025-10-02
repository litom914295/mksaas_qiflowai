import { ImageResponse } from 'next/og';

export const size = {
  width: 32,
  height: 32,
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
          background: 'white',
        }}
      >
        <svg
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <rect x='2' y='2' width='20' height='20' rx='4' fill='#6D28D9' />
          <path
            d='M7 12h10M12 7v10'
            stroke='white'
            strokeWidth='2'
            strokeLinecap='round'
          />
        </svg>
      </div>
    ),
    size
  );
}
