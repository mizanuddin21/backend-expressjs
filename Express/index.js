import express from 'express'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

// Import routes
import invoiceRoute from './routes/invoice.js'
import productRoute from './routes/products.js'

// Middleware
app.use(bodyParser.json())
app.use('/invoice', invoiceRoute)
app.use('/product', productRoute)

// Start server
app.listen(port, () => console.log(`Server is running on port ${port}`))
