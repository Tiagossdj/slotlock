import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Resource } from "@/lib/types";

export function useResources() {
  return useQuery({
    queryKey: ["resources"],
    queryFn: () => apiFetch<Resource[]>("/api/resources"),
  });
}

export function useResource(id: string) {
  return useQuery({
    queryKey: ["resources", id],
    queryFn: () => apiFetch<Resource>(`/api/resources/${id}`),
    enabled: !!id,
  });
}

export function useCreateResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; type: Resource["type"] }) =>
      apiFetch<Resource>("/api/resources", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
  });
}

export function useDeleteResource() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/resources/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      console.log('deleted! invalidating...')
      queryClient.invalidateQueries({ queryKey: ['resources'] })
    },
    onError: (err) => {
      console.log('delete error:', err)
    },
  })
}
