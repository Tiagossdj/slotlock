import 'dotenv/config'

const required = [
  'DATABASE_URL',
  'PORT',
  'JWT_SECRET',
  'RAILWAY_PUBLIC_URL',
] as const

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`❌ Missing environment variable: ${key}`)
  }
}

export const env = {
  DATABASE_URL: process.env.DATABASE_URL as string,
  PORT: Number(process.env.PORT),
  HOST: process.env.HOST ?? '0.0.0.0',
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  JWT_SECRET: process.env.JWT_SECRET as string,
  RAILWAY_PUBLIC_URL: process.env.RAILWAY_PUBLIC_URL as string,
}
