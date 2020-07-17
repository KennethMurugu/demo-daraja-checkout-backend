import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import { getOAuthToken, lnm, lnmcallback } from './api'

import dotenv from 'dotenv'
dotenv.config()

const serverIP: any = process.env.SERVER_IP || '127.0.0.1'

let app = express()
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
)
app.use(cors())
app.use(function (req, response, next) {
  console.log(`[Request] path=${req.path}, body=${JSON.stringify(req.body)}`)
  next()
})
app
  .get('/demo-cart-checkout/test', function (req, res) {
    res.send('MAIN TEST URL')
  })
  .get('/demo-cart-checkout/oauthtoken', getOAuthToken)
  .post('/demo-cart-checkout/lnm', lnm)
  .get('/demo-cart-checkout/lnmcallback', lnmcallback)

app.listen(8081, serverIP, () => {
  console.info(`Backend Server listening on ${serverIP}:8081`)
})
