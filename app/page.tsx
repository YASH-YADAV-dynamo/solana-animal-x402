import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <main className="flex min-h-screen w-full flex-col items-center justify-center gap-8">
            <Link
          href="/animals"
          className="px-16 py-8 bg-black text-white hover:bg-white hover:text-black border-4 border-black transition-all font-bold text-xl"
            >
          LET'S GO
            </Link>
        <div className="flex items-center gap-2 text-xs text-black">
          <span>Powered by</span>
          <svg width="16" height="16" viewBox="0 0 397 312" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M64.6 237.9c3.3-2 7.1-3.1 10.9-3.1h317.4c5 0 7.5 6 4 9.5l-62.7 62.7c-3.3 2-7.1 3.1-10.9 3.1H6c-5 0-7.5-6-4-9.5l62.6-62.7z" fill="url(#solana-gradient-1)"/>
            <path d="M64.6 3.1C67.9 1.1 71.7 0 75.5 0h317.4c5 0 7.5 6 4 9.5L334.2 72.2c-3.3 2-7.1 3.1-10.9 3.1H6c-5 0-7.5-6-4-9.5L64.6 3.1z" fill="url(#solana-gradient-2)"/>
            <path d="M333.1 120.4c-3.3-2-7.1-3.1-10.9-3.1H4.8c-5 0-7.5 6-4 9.5l62.7 62.7c3.3 2 7.1 3.1 10.9 3.1h317.4c5 0 7.5-6 4-9.5l-62.7-62.7z" fill="url(#solana-gradient-3)"/>
            <defs>
              <linearGradient id="solana-gradient-1" x1="200" y1="0" x2="200" y2="312" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00FFA3"/>
                <stop offset="1" stopColor="#DC1FFF"/>
              </linearGradient>
              <linearGradient id="solana-gradient-2" x1="200" y1="0" x2="200" y2="312" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00FFA3"/>
                <stop offset="1" stopColor="#DC1FFF"/>
              </linearGradient>
              <linearGradient id="solana-gradient-3" x1="200" y1="0" x2="200" y2="312" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00FFA3"/>
                <stop offset="1" stopColor="#DC1FFF"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
      </main>
    </div>
  )
}
