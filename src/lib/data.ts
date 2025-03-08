import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { LinkData } from '~/lib/constants'

// Zod schema for link validation
const linkSchema = z.object({
  url: z.string().url(),
  title: z.string().min(1),
  timestamp: z.number().int().positive(),
  pinned: z.boolean().optional()
})

// LocalStorage key constants
const PINNED_LINKS_KEY = 'farcaster_links/pinned'

// Fetch pinned links from localStorage
async function fetchLinks(): Promise<{
  pinned: LinkData[]
  recent: LinkData[]
}> {
  try {
    // Get from localStorage
    const pinnedData = localStorage.getItem(PINNED_LINKS_KEY) || '[]'
    const pinned = z.array(linkSchema).parse(JSON.parse(pinnedData))
    
    // Get recent from IndexedDB
    const recent = await new Promise<LinkData[]>((resolve) => {
      const request = indexedDB.open('linksDB', 1)
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        const tx = db.transaction('recentLinks', 'readonly')
        const store = tx.objectStore('recentLinks')
        resolve(store.getAll())
      }
      request.onerror = () => resolve([])
    })

    return { pinned, recent: recent.slice(0, 5) } // Return last 5 recent
  } catch (error) {
    console.error('Error loading links:', error)
    return { pinned: [], recent: [] }
  }
}

// React Query hooks
export function usePinnedLinks() {
  return useQuery({
    queryKey: ['links'],
    queryFn: fetchLinks,
    select: data => data.pinned,
    staleTime: 1000 * 60 * 5 // 5 minutes
  })
}

export function useRecentLinks() {
  return useQuery({
    queryKey: ['links'],
    queryFn: fetchLinks, 
    select: data => data.recent,
    staleTime: 1000 * 60 * 5 // 5 minutes
  })
}

// Sync initial state on mount
export function useSyncLinks() {
  const queryClient = useQueryClient()
  
  useEffect(() => {
    // Sync localStorage -> React Query
    const updateFromStorage = () => {
      try {
        const data = localStorage.getItem(PINNED_LINKS_KEY)
        if (data) {
          const parsed = JSON.parse(data)
          const validated = z.array(linkSchema).parse(parsed)
          queryClient.setQueryData(['links'], old => ({
            ...(old as { pinned: LinkData[], recent: LinkData[] }),
            pinned: validated
          }))
        }
      } catch (error) {
        console.error('Invalid localStorage data:', error)
      }
    }

    // Initial sync
    updateFromStorage()
    
    // Sync on storage events
    window.addEventListener('storage', updateFromStorage)
    return () => window.removeEventListener('storage', updateFromStorage)
  }, [queryClient])

  // Sync React Query -> localStorage
  useUpdateEffect(() => {
    const pinned = queryClient.getQueryData<LinkData[]>(['links', 'pinned']) || []
    try {
      localStorage.setItem(PINNED_LINKS_KEY, JSON.stringify(pinned))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  })
}

export function useLinkActions() {
  const queryClient = useQueryClient()

  const addLink = useMutation({
    mutationFn: async (link: LinkData) => {
      const validated = linkSchema.parse(link)
      const current = JSON.parse(localStorage.getItem(PINNED_LINKS_KEY) || '[]')
      const updated = [...current.filter((l: LinkData) => l.url !== validated.url), validated]
      localStorage.setItem(PINNED_LINKS_KEY, JSON.stringify(updated))
      return validated
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['links'] })
  })

  const updateLink = useMutation({
    mutationFn: async (link: LinkData) => {
      const validated = linkSchema.parse(link)
      const current = JSON.parse(localStorage.getItem(PINNED_LINKS_KEY) || '[]')
      const updated = current.map((l: LinkData) => l.url === validated.url ? validated : l)
      localStorage.setItem(PINNED_LINKS_KEY, JSON.stringify(updated))
      return validated
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['links'] })
  })

  const deleteLink = useMutation({
    mutationFn: async (url: string) => {
      const current = JSON.parse(localStorage.getItem(PINNED_LINKS_KEY) || '[]')
      const updated = current.filter((l: LinkData) => l.url !== url)
      localStorage.setItem(PINNED_LINKS_KEY, JSON.stringify(updated))
      return url
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['links'] })
  })

  return {
    addLink: (link: LinkData) => {
      const validated = linkSchema.parse(link)
      queryClient.setQueryData(['links'], (old: { pinned: LinkData[], recent: LinkData[] }) => ({
        ...old,
        pinned: [...old.pinned, validated]
      }))
      return addLink.mutate(validated)
    },
    updateLink: (link: LinkData) => {
      const validated = linkSchema.parse(link)
      queryClient.setQueryData(['links'], (old: { pinned: LinkData[], recent: LinkData[] }) => ({
        ...old,
        pinned: old.pinned.map(l => l.url === validated.url ? validated : l)
      }))
      return updateLink.mutate(validated)
    },
    deleteLink: (url: string) => {
      queryClient.setQueryData(['links'], (old: { pinned: LinkData[], recent: LinkData[] }) => ({
        ...old,
        pinned: old.pinned.filter(l => l.url !== url)
      }))
      return deleteLink.mutate(url)
    }
  }
}
