import { allowedOrigins } from './allowedOrigins.js'

export const corsOptions = {
  origin: (origin, callback) => {
    allowedOrigins.indexOf(origin) !== -1 || !origin
      ? callback(null, true)
      : callback(new Error('Origin not allowed'))
  },
  credentials: true,
  optionsSuccessStatus: 200,
}
