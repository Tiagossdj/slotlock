'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRegister } from '@/lib/hooks/useAuth'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validationError, setValidationError] = useState('')
  const register = useRegister()

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault()
    setValidationError('')

    if (password !== confirmPassword) {
      setValidationError('As senhas não coincidem')
      return
    }

    if (password.length < 6) {
      setValidationError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    register.mutate({ email, password })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 p-8 rounded-xl border border-border bg-card">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Criar conta</h1>
          <p className="text-sm text-muted-foreground">
            Crie sua conta para agendar serviços
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
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirmar senha
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {(validationError || register.isError) && (
            <p className="text-sm text-destructive">
              {validationError || register.error?.message}
            </p>
          )}

          <button
            type="submit"
            disabled={register.isPending}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {register.isPending ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Já tem uma conta?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}