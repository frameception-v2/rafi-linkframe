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
    const data = localStorage.getItem(PINNED_LINKS_KEY) || '[]'
    const parsed = JSON.parse(data)
    const pinned = z.array(linkSchema).parse(parsed)
    return { pinned, recent: [] }
  } catch (error) {
    console.error('Error loading links:', error)
    return { pinned: [], recent: [] }
  }
}

// React Query hooks
export function useLinks() {
  return useQuery({
    queryKey: ['links'],
    queryFn: fetchLinks,
    staleTime: 1000 * 60 * 5 // 5 minutes
  })
}

// Sync initial state on mount
export function useSyncLinks() {
  const queryClient = useQueryClient()
  
  useEffect(() => {
    try {
      const data = localStorage.getItem(PINNED_LINKS_KEY)
      if (data) {
        const parsed = JSON.parse(data)
        const validated = z.array(linkSchema).parse(parsed)
        queryClient.setQueryData(['links', 'pinned'], validated)
      }
    } catch (error) {
      console.error('Invalid localStorage data:', error)
    }
  }, [queryClient])
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
    addLink: (link: LinkData) => addLink.mutate(linkSchema.parse(link)),
    updateLink: (link: LinkData) => updateLink.mutate(linkSchema.parse(link)),
    deleteLink: (url: string) => deleteLink.mutate(url)
  }
}
