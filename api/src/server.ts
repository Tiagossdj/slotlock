import { env } from './config/env'
import { buildApp } from './infra/http/server'

const start = async () => {
  const app = await buildApp()

  app.listen({ port: env.PORT, host: env.HOST }, (err) => {
    if (err) {
      app.log.error(err)
      process.exit(1)
    }

    app.log.info(`>> For Devs http://localhost:${env.PORT}`)
  })
}

start()
