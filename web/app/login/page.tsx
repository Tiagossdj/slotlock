'use client'

import { useState } from 'react'
import { useLogin } from '@/lib/hooks/useAuth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const login = useLogin()

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault()
    login.mutate({ email, password })
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
        </form>
      </div>
    </div>
  )
}