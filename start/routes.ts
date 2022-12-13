/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'
import { Limiter } from '@adonisjs/limiter/build/services'

Route.get('/test/using-middleware', async () => {
  return { hello: 'world' }
}).middleware('throttle:global')

Route.get('/test/using-limiter-manager', async ({ request, response }) => {
  const throttleKey = request.ip()

  const limiter = Limiter.use({
    requests: 1,
    duration: '10 second',
    blockDuration: '1 min',
  })

  if (await limiter.isBlocked(throttleKey)) {
    return response.tooManyRequests('Request attempts exhausted. Please try after some time')
  }

  try {
    const username = request.input('username')
    const password = request.input('password')

    if (username !== 'username' && password !== 'password') {
      throw 'Incorrect username and password'
    }
  } catch (error) {
    await limiter.increment(throttleKey)
    return { error: 'An error occured' }
  }

  await limiter.delete(throttleKey)
  return { hello: 'world' }
})
