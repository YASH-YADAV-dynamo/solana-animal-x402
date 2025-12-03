import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const animalsData: { name: string; description: string }[] = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'data', 'animals.json'), 'utf8'),
)

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
    const { selected, minDistance, ties, originalName } = getSimilarAnimalForName(name)

    const acceptHeader = req.headers.get('accept') || ''

    // If this was a direct browser navigation (text/html), redirect to the UI page
    // so the user sees a nicely formatted response instead of raw JSON.
    if (acceptHeader.includes('text/html')) {
      const url = new URL(req.url)
      url.pathname = '/animals'
      url.searchParams.set('name', originalName)
      return NextResponse.redirect(url.toString())
    }

    return NextResponse.json({
      animal: {
        name: selected.name,
        description: selected.description,
        similarityScore: minDistance,
      },
      originalName,
      totalAnimals: animalsData.length,
      closestMatches: ties,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch animal' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const name = typeof body.name === 'string' ? body.name : 'anonymous'

    const { selected, minDistance, ties, originalName } = getSimilarAnimalForName(name)

    return NextResponse.json({
      animal: {
        name: selected.name,
        description: selected.description,
        similarityScore: minDistance,
      },
      originalName,
      totalAnimals: animalsData.length,
      closestMatches: ties,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch animal' }, { status: 500 })
  }
}

