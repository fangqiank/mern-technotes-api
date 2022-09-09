import express from 'express'
import {} from 'dotenv/config'
import path from 'path'
import { fileURLToPath } from 'url'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import mongoose from 'mongoose'
mongoose.Promise = global.Promise
import router from './routes/root.js'
import noteRoute from './routes/noteRoute.js'
import userRoute from './routes/userRoute.js'
import authRoute from './routes/authRoute.js'
import { logger, logEvents } from './middleware/logger.js'
import { errorHandler } from './middleware/errorHandler.js'
import { corsOptions } from './config/corsOption.js'
import { connectDb } from './config/dbConn.js'

console.log(process.env.NODE_ENV)

connectDb()

const __filename = fileURLToPath(import.meta.url)

const __dirname = path.dirname(__filename)

const app = express()

const PORT = process.env.PORT || 3500

app.use(logger)

app.use(cors(corsOptions))

app.use(express.json())

app.use(cookieParser())

app.use('/', express.static(path.join(__dirname, 'public')))

app.use('/', router)
app.use('/notes', noteRoute)
app.use('/users', userRoute)
app.use('/auth', authRoute)

app.all('*', (req, res) => {
  res.status(404)

  req.accepts('html')
    ? res.sendFile(path.join(__dirname, './views/404.html'))
    : req.accepts('json')
    ? res.josn({ message: ' 404 Not found' })
    : res.type('txt').send('404 Not found')
})

app.use(errorHandler)

mongoose.connection.once('open', () => {
  console.log('MongoDB Connected...')
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})

mongoose.connection.on('error', (err) => {
  console.log(err)
  logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    'mongoErrLog.log',
  )
})
