import { paymentMiddleware, Resource, Network } from 'x402-next'
import { NextRequest } from 'next/server'
import type { Address } from 'viem'

/**
 * IMPORTANT: The receiver address MUST be a Solana WALLET address (system account),
 * NOT a token account address. The x402 facilitator will automatically handle
 * creating/using the associated token account for USDC transfers.
 * 
 * To get your wallet address:
 * - Use Phantom or another Solana wallet
 * - Copy the main wallet address (starts with letters/numbers, ~44 chars)
 * - DO NOT use a token account address (those are longer and different format)
 */
const address = (process.env.NEXT_PUBLIC_RECEIVER_ADDRESS || process.env.NEXT_PUBLIC_WALLET_ADDRESS) as Address
const network = (process.env.NEXT_PUBLIC_NETWORK || 'solana-devnet') as Network
const facilitatorUrl = (process.env.NEXT_PUBLIC_FACILITATOR_URL || 'https://x402.org/facilitator') as Resource
const cdpClientKey = process.env.NEXT_PUBLIC_CDP_CLIENT_KEY || ''

// Validate required configuration
if (!address) {
  console.error('\n❌ ERROR: NEXT_PUBLIC_RECEIVER_ADDRESS or NEXT_PUBLIC_WALLET_ADDRESS must be set')
  console.error('   This must be a Solana WALLET address (system account), NOT a token account')
  console.error('   Example: CmGgLQL36Y9ubtTsy2zmE46TAxwCBm66onZmPPhUWNqv')
  console.error('   See SETUP.md for detailed instructions\n')
  throw new Error('Missing receiver address. Check SETUP.md for instructions.')
}

// Basic address format validation (Solana addresses are base58, typically 32-44 chars)
if (address && (address.length < 32 || address.length > 44)) {
  console.warn('\n⚠️  WARNING: Receiver address length looks unusual')
  console.warn(`   Address length: ${address.length} (expected 32-44 characters)`)
  console.warn('   Make sure this is a WALLET address, not a token account\n')
}

if (!cdpClientKey) {
  console.warn('\n⚠️  WARNING: NEXT_PUBLIC_CDP_CLIENT_KEY is not set. Payment widget may not work.\n')
}

// Log configuration on startup (without sensitive data)
console.log('\n✅ x402 Middleware Configuration:')
console.log(`   Network: ${network}`)
console.log(`   Facilitator: ${facilitatorUrl}`)
console.log(`   Receiver: ${address.substring(0, 8)}...${address.substring(address.length - 8)}`)
console.log(`   CDP Key: ${cdpClientKey ? 'Set ✓' : 'Missing ✗'}\n`)

const x402PaymentMiddleware = paymentMiddleware(
  address,
  {
    '/api/animals': {
      price: '$0.001',
      config: {
        description: 'Get a random animal based on character repetition',
      },
      network: 'solana-devnet' as Network,
    },
  },
  {
    url: facilitatorUrl,
  },
  {
    cdpClientKey,
    appLogo: '/logos/x402-examples.png',
    appName: 'Guess the Animal - x402',
    sessionTokenEndpoint: '/api/x402/session-token',
  },
)

export const middleware = (req: NextRequest) => {
  const delegate = x402PaymentMiddleware as unknown as (
    request: NextRequest,
  ) => ReturnType<typeof x402PaymentMiddleware>
  return delegate(req)
}

// Configure which paths the middleware should run on
// More specific matcher to reduce bundle size
export const config = {
  matcher: [
    '/api/animals',
    '/animals',
    '/',
  ],
}
