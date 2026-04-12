export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const hasBody = options?.body !== undefined

  
  const res = await fetch(url, {
    ...options,
    credentials: 'include', // envia o cookie httpOnly em todo request
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