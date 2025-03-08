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

// Fetch links from combined storage
async function fetchLinks(): Promise<{
  pinned: LinkData[]
  recent: LinkData[]
}> {
  // Placeholder - will be implemented in storage tasks
  return { pinned: [], recent: [] }
}

// React Query hooks
export function useLinks() {
  return useQuery({
    queryKey: ['links'],
    queryFn: fetchLinks,
    staleTime: 1000 * 60 * 5 // 5 minutes
  })
}

export function useLinkActions() {
  const queryClient = useQueryClient()

  const addLink = useMutation({
    mutationFn: async (link: LinkData) => {
      // Placeholder - will implement storage in next tasks
      return link
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['links'] })
  })

  const updateLink = useMutation({
    mutationFn: async (link: LinkData) => {
      // Placeholder - will implement storage in next tasks
      return link
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['links'] })
  })

  const deleteLink = useMutation({
    mutationFn: async (url: string) => {
      // Placeholder - will implement storage in next tasks
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
