import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Load animals data with better error handling for production
let animalsData: { name: string; description: string }[] = []

try {
  const dataPath = path.join(process.cwd(), 'data', 'animals.json')
  const fileContent = fs.readFileSync(dataPath, 'utf8')
  animalsData = JSON.parse(fileContent)
} catch (error) {
  console.error('Error loading animals.json:', error)
  // Fallback data if file can't be read
  animalsData = [
    { name: 'Elephant', description: 'A large mammal with a trunk' },
    { name: 'Giraffe', description: 'The tallest land animal' },
    { name: 'Penguin', description: 'A flightless bird from Antarctica' },
  ]
}

// Count letter repetitions in a name (only a–z)
function getCharCounts(name: string): Record<string, number> {
  const charCount: Record<string, number> = {}

  for (const char of name.toLowerCase()) {
    if (/[a-z]/.test(char)) {
      charCount[char] = (charCount[char] || 0) + 1
    }
  }

  return charCount
}

// Simple distance between two repetition profiles
function getRepetitionDistance(
  a: Record<string, number>,
  b: Record<string, number>,
): number {
  const letters = new Set([...Object.keys(a), ...Object.keys(b)])
  let distance = 0

  for (const letter of letters) {
    const ac = a[letter] || 0
    const bc = b[letter] || 0
    distance += Math.abs(ac - bc)
  }

  return distance
}

function getSimilarAnimalForName(userName: string) {
  const cleanedName = userName.trim()
  const baseName = cleanedName.length > 0 ? cleanedName : 'anonymous'
  const userCounts = getCharCounts(baseName)

  const scoredAnimals = animalsData.map((animal) => {
    const animalCounts = getCharCounts(animal.name)
    const distance = getRepetitionDistance(userCounts, animalCounts)
    return { ...animal, distance }
  })

  const minDistance = Math.min(...scoredAnimals.map((a) => a.distance))
  const closestAnimals = scoredAnimals.filter((a) => a.distance === minDistance)
  const randomIndex = Math.floor(Math.random() * closestAnimals.length)
  const selected = closestAnimals[randomIndex]

  return {
    selected,
    minDistance,
    ties: closestAnimals.length,
    originalName: baseName,
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const name = searchParams.get('name') ?? 'anonymous'
    const forceJson = searchParams.get('format') === 'json' || searchParams.get('json') === 'true'
    const { selected, minDistance, ties, originalName } = getSimilarAnimalForName(name)

    const acceptHeader = req.headers.get('accept') || ''
    const isJsonRequest = acceptHeader.includes('application/json') || forceJson
    const isFetchRequest = req.headers.get('sec-fetch-mode') === 'cors' || 
                          req.headers.get('sec-fetch-mode') === 'navigate' ||
                          req.headers.get('x-requested-with') === 'XMLHttpRequest'

    // Only redirect to UI page if:
    // 1. It's a pure browser navigation (not a fetch/XHR request)
    // 2. AND the request doesn't explicitly ask for JSON (via header or query param)
    // 3. AND it's not a CORS/fetch request
    // This ensures that after payment, fetch requests get JSON, not redirects
    if (acceptHeader.includes('text/html') && !isJsonRequest && !isFetchRequest && !forceJson) {
      const url = new URL(req.url)
      url.pathname = '/animals'
      url.searchParams.set('name', originalName)
      return NextResponse.redirect(url.toString())
    }

    const responseData = {
      animal: {
        name: selected.name,
        description: selected.description,
        similarityScore: minDistance,
      },
      originalName,
      totalAnimals: animalsData.length,
      closestMatches: ties,
    }

    // Get the origin from the request for CORS
    // Try origin header first, then referer, then construct from host
    let origin = req.headers.get('origin')
    if (!origin) {
      const referer = req.headers.get('referer')
      if (referer) {
        origin = referer.split('/').slice(0, 3).join('/')
      } else {
        // Same-origin request - construct from host
        const host = req.headers.get('host')
        const protocol = req.headers.get('x-forwarded-proto') || 'https'
        if (host) {
          origin = `${protocol}://${host}`
        }
      }
    }
    const corsHeaders: Record<string, string> = {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization, X-Requested-With',
      'Access-Control-Allow-Credentials': 'true',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      // Prevent browser from treating this as a download
      'Content-Disposition': 'inline',
      'X-Content-Type-Options': 'nosniff',
    }
    
    // When credentials are included, we must specify the origin (not *)
    if (origin) {
      corsHeaders['Access-Control-Allow-Origin'] = origin
    } else {
      // Fallback to * only if no origin (shouldn't happen with credentials)
      corsHeaders['Access-Control-Allow-Origin'] = '*'
    }

    return NextResponse.json(responseData, {
      status: 200,
      headers: corsHeaders,
    })
  } catch (error) {
    console.error('GET /api/animals error:', error)
    const origin = req.headers.get('origin') || req.headers.get('referer')?.split('/').slice(0, 3).join('/')
    return NextResponse.json(
      { error: 'Failed to fetch animal', details: error instanceof Error ? error.message : 'Unknown error' },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin || '*',
          'Access-Control-Allow-Credentials': 'true',
        },
      }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const name = typeof body.name === 'string' ? body.name : 'anonymous'

    const { selected, minDistance, ties, originalName } = getSimilarAnimalForName(name)

    const responseData = {
      animal: {
        name: selected.name,
        description: selected.description,
        similarityScore: minDistance,
      },
      originalName,
      totalAnimals: animalsData.length,
      closestMatches: ties,
    }

    // Get the origin from the request for CORS
    // Try origin header first, then referer, then construct from host
    let origin = req.headers.get('origin')
    if (!origin) {
      const referer = req.headers.get('referer')
      if (referer) {
        origin = referer.split('/').slice(0, 3).join('/')
      } else {
        // Same-origin request - construct from host
        const host = req.headers.get('host')
        const protocol = req.headers.get('x-forwarded-proto') || 'https'
        if (host) {
          origin = `${protocol}://${host}`
        }
      }
    }
    const corsHeaders: Record<string, string> = {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization, X-Requested-With',
      'Access-Control-Allow-Credentials': 'true',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      // Prevent browser from treating this as a download
      'Content-Disposition': 'inline',
      'X-Content-Type-Options': 'nosniff',
    }
    
    // When credentials are included, we must specify the origin (not *)
    if (origin) {
      corsHeaders['Access-Control-Allow-Origin'] = origin
    } else {
      // Fallback to * only if no origin (shouldn't happen with credentials)
      corsHeaders['Access-Control-Allow-Origin'] = '*'
    }

    return NextResponse.json(responseData, {
      status: 200,
      headers: corsHeaders,
    })
  } catch (error) {
    console.error('POST /api/animals error:', error)
    const origin = req.headers.get('origin') || req.headers.get('referer')?.split('/').slice(0, 3).join('/')
    return NextResponse.json(
      { error: 'Failed to fetch animal', details: error instanceof Error ? error.message : 'Unknown error' },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin || '*',
          'Access-Control-Allow-Credentials': 'true',
        },
      }
    )
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin')
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // 24 hours
  }
  
  // When credentials are included, we must specify the origin (not *)
  if (origin) {
    headers['Access-Control-Allow-Origin'] = origin
  } else {
    // Fallback to * only if no origin
    headers['Access-Control-Allow-Origin'] = '*'
  }
  
  return new NextResponse(null, {
    status: 200,
    headers,
  })
}

