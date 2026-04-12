const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const hasBody = options?.body !== undefined

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(hasBody && { 'Content-Type': 'application/json' }),
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message ?? 'Request failed')
  }

  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as T
  }

  return res.json()
}