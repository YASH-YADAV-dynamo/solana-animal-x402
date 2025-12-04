import { paymentMiddleware } from 'x402-next'
import { NextRequest } from 'next/server'
import type { Address } from 'viem'

const address = (process.env.NEXT_PUBLIC_RECEIVER_ADDRESS || process.env.NEXT_PUBLIC_WALLET_ADDRESS) as Address
const facilitatorUrl = (process.env.NEXT_PUBLIC_FACILITATOR_URL || 'https://x402.org/facilitator') as `https://${string}`
const cdpClientKey = process.env.NEXT_PUBLIC_CDP_CLIENT_KEY || ''

const x402PaymentMiddleware = paymentMiddleware(
  address,
  {
    '/api/animals': {
      price: '$0.001',
      config: { description: 'Get a random animal based on character repetition' },
      network: 'solana-devnet',
    },
  },
  { url: facilitatorUrl },
  { cdpClientKey, appName: 'Guess the Animal - x402', sessionTokenEndpoint: '/api/x402/session-token' },
)

export const middleware = x402PaymentMiddleware as unknown as (req: NextRequest) => ReturnType<typeof x402PaymentMiddleware>

export const config = {
  matcher: ['/api/animals'],
}
