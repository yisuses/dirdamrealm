import express, { Response } from 'express'

const app = express()
const port = 3002

// Body parsing Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', async (req, res): Promise<Response> => {
  return res.status(200).send({
    message: 'Hello World!',
  })
})

try {
  app.listen(port, (): void => {
    console.log(`Connected successfully on port ${port}`)
  })
} catch (error) {
  console.error(`Error occured: ${(error as Error).message}`)
}
