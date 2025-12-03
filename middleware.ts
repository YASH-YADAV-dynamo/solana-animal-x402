import { paymentMiddleware, type Network, type Resource } from 'x402-next'
import { NextRequest } from 'next/server'
import type { Address } from 'viem'

// Minimal configuration - only what's needed
const address = (process.env.NEXT_PUBLIC_RECEIVER_ADDRESS || process.env.NEXT_PUBLIC_WALLET_ADDRESS) as Address
const facilitatorUrl = (process.env.NEXT_PUBLIC_FACILITATOR_URL || 'https://x402.org/facilitator') as Resource
const cdpClientKey = process.env.NEXT_PUBLIC_CDP_CLIENT_KEY || ''

// Minimal validation - wallet address should be 32-44 chars (not a token account)
if (address && (address.length < 32 || address.length > 44)) {
  throw new Error(`Invalid receiver address length: ${address.length}. Must be a wallet address (32-44 chars), not a token account.`)
}

// Minimal middleware - only handle /api/animals route
const x402PaymentMiddleware = paymentMiddleware(
  address,
  {
    '/api/animals': {
      price: '$0.001',
      config: { description: 'Get a random animal based on character repetition' },
      network: 'solana-devnet' as Network,
    },
  },
  { url: facilitatorUrl },
  { cdpClientKey, appName: 'Guess the Animal - x402', sessionTokenEndpoint: '/api/x402/session-token' },
)

export const middleware = (req: NextRequest) => {
  return (x402PaymentMiddleware as unknown as (req: NextRequest) => ReturnType<typeof x402PaymentMiddleware>)(req)
}

// Only match the API route to minimize bundle
export const config = {
  matcher: ['/api/animals'],
}
