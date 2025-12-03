'use client'

import { useState, useEffect } from 'react'

interface AnimalResponse {
  animal: {
    name: string
    description: string
    similarityScore: number
  }
  originalName: string
  totalAnimals: number
  closestMatches: number
}

export default function AnimalsPage() {
  const [animal, setAnimal] = useState<AnimalResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [showInput, setShowInput] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check if we're returning from a payment attempt
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const nameParam = urlParams.get('name')
    if (nameParam && !animal) {
      setName(nameParam)
      // Try to fetch after a short delay (payment might have completed)
      setTimeout(() => {
        fetchAnimal(nameParam, true)
      }, 1000)
    }
  }, [])

  const fetchAnimal = async (nameToUse?: string, isRetry = false) => {
    const nameValue = nameToUse || name.trim()
    if (!nameValue) {
      setError('Please enter your name')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ name: nameValue })
      const response = await fetch(`/api/animals?${params.toString()}`, {
        credentials: 'include', // Important for cookies/sessions
        headers: {
          'Accept': 'application/json',
        },
      })
      
      if (!response.ok) {
        if (response.status === 402) {
          // Payment required - the x402 middleware should handle this
          // But if we're here from a redirect, the widget should have appeared
          if (!isRetry) {
            // Direct navigation to trigger x402 widget
            // The middleware will intercept and show payment UI
            window.location.href = `/api/animals?${params.toString()}`
            return
          } else {
            // If we get 402 again after redirect, payment might have failed
            const responseText = await response.text()
            console.error('402 Payment Required - Response:', responseText)
            setError('Payment required but widget may not have appeared. Check browser console and ensure NEXT_PUBLIC_RECEIVER_ADDRESS is a wallet address (not token account).')
            setLoading(false)
            return
          }
        } else {
          const errorText = await response.text()
          console.error(`API Error ${response.status}:`, errorText)
          setError(`Error ${response.status}: ${errorText || response.statusText}`)
          setLoading(false)
          return
        }
      }
      
      const data: AnimalResponse = await response.json()
      setAnimal(data)
      setShowInput(false)
      setError(null)
    } catch (err) {
      console.error('Fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch animal. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchAnimal()
  }

  if (animal) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <main className="flex w-full flex-col items-center justify-center p-8 gap-6">
          <div className="w-full max-w-xl text-black">
            <h1 className="text-3xl font-bold mb-2">Your Animal Match</h1>
            <p className="text-lg font-semibold mb-1">{animal.animal.name}</p>
            <p className="text-sm mb-1">{animal.animal.description}</p>
            <p className="text-xs mb-1">
              Similarity score (lower is closer): <span className="font-semibold">{animal.animal.similarityScore}</span>
            </p>
            <p className="text-xs mb-1">
              Based on name: <span className="font-semibold">{animal.originalName}</span>
            </p>
            <p className="text-[10px] mt-1">
              Chosen from {animal.closestMatches} closest animals. Total in database: {animal.totalAnimals}.
            </p>
          </div>

          <div className="w-full max-w-xl border-2 border-black bg-white text-black p-4">
            <h2 className="text-sm font-bold mb-2">Raw JSON Response</h2>
            <pre className="text-[10px] leading-relaxed overflow-x-auto whitespace-pre-wrap break-words">
              {JSON.stringify(animal, null, 2)}
            </pre>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <main className="flex w-full flex-col items-center justify-center p-8 gap-6">
        {showInput && (
          <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6">
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError(null)
              }}
              className="border-2 border-black px-6 py-3 text-black bg-white focus:outline-none focus:ring-2 focus:ring-black text-lg"
              placeholder="Enter your name"
              autoFocus
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-12 py-4 bg-black text-white border-4 border-black hover:bg-white hover:text-black transition-all font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'LOADING...' : 'PAY & GET ANIMAL'}
            </button>
          </form>
        )}
        
        {error && (
          <div className="mt-4 p-4 bg-red-50 border-2 border-red-300 rounded max-w-md text-center">
            <p className="text-red-800 text-sm font-semibold mb-2">Error</p>
            <p className="text-red-600 text-xs">{error}</p>
            {error.includes('Payment') && (
              <p className="text-red-500 text-xs mt-2">
                If payment failed, check that NEXT_PUBLIC_RECEIVER_ADDRESS is a wallet address (not a token account)
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

