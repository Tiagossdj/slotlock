'use client'

import { Suspense } from 'react'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLogin } from '@/lib/hooks/useAuth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')
  const login = useLogin()
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    login.mutate({ email, password }, {
      onSuccess: ({ user }) => {
        router.push(redirect ?? (user.role === 'admin' ? '/' : '/availability'))
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 p-8 rounded-xl border border-border bg-card">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">SlotLock</h1>
          <p className="text-sm text-muted-foreground">
            Entre com suas credenciais para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Senha
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {login.isError && (
            <p className="text-sm text-destructive">
              {login.error.message}
            </p>
          )}

          <button
            type="submit"
            disabled={login.isPending}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {login.isPending ? 'Entrando...' : 'Entrar'}
          </button>

              <p className="text-center text-sm text-muted-foreground">
                Não tem uma conta?{' '}
              <Link href="/register" className="text-primary hover:underline font-medium">
                Criar conta
              </Link>
              </p>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LoginForm />
    </Suspense>
  )
}