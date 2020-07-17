import Axios, { AxiosResponse, AxiosRequestConfig } from 'axios'
import { Request, Response } from 'express'
import moment from 'moment'

const api = Axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
})

// let ACCESS_TOKEN: string = ''

async function apiCall(
  response: Response,
  url: string,
  options: AxiosRequestConfig,
  success: (data?: any) => void
) {
  let apiResponse = null
  try {
    apiResponse = await Axios(url, options)
    if (apiResponse.status >= 200 && apiResponse.status < 300) {
      success(apiResponse.data)
    } else {
      resOut(response, 'fail', apiResponse.data, apiResponse.status)
    }
  } catch (err) {
    let e = {
      status: err.response.status,
      data: err.response.data,
      headers: err.response.headers,
    }
    console.error('Error response:')
    console.error(e)
    resOut(response, 'fail', e, e.status)
  }
}

function resStatus(response: AxiosResponse) {
  if (response.status >= 200 && response.status < 300) {
    return Promise.resolve(response.data)
  } else {
    console.error('[resStatus]Something went wrong...')
    console.error(response.status)
    return Promise.reject(new Error(response.statusText))
  }
}

function resOut(response: Response, msg: string, data?: any, status?: number) {
  let s = {
    msg,
    data,
  }
  response.setHeader('Content-Type', 'application/json')

  if (status) response.status(status).send(JSON.stringify(s))
  else response.send(JSON.stringify(s))
}

export function getOAuthToken(req: Request, res: Response) {
  const consumer_key = 'U1guBLi2G8Tl91h6vEyAKN9DSvit06hC'
  const consumer_secret = 'djOFZRI6uqq6AaLF'
  // Get Base64 auth string
  let auth =
    'Basic ' +
    Buffer.from(consumer_key + ':' + consumer_secret).toString('base64')
  // console.log(auth)

  // Api options
  const options: AxiosRequestConfig = {
    method: 'GET',
    headers: {
      Authorization: auth,
      'Content-Type': 'text/plain',
    },
  }
  const url =
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'

  apiCall(res, url, options, (data) => {
    console.log('getOAuthToken():', data)

    resOut(res, 'ok', data)
  })
}

export function lnm(req: Request, res: Response) {
  // Daraja params
  const ACCESS_TOKEN = req.body.access_token
  const LNMPasskey =
    'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'
  const BusinessShortCode = '174379'
  const Timestamp = moment(new Date()).format('YYYYMMDDHHmmss')
  const Password = Buffer.from(
    BusinessShortCode + '' + LNMPasskey + '' + Timestamp
  ).toString('base64')
  const TransactionType = 'CustomerPayBillOnline'
  //  const Amount = getCartTotal()
  const Amount = req.body.amount
  const PartyA = req.body.phone
  const PartyB = '174379'
  const PhoneNumber = req.body.phone
  const CallBackURL = 'https://kenkim.co.ke/demo-cart-checkout/lnmcallback'
  const AccountReference = '1234567890'
  const TransactionDesc = 'Demo Cart Checkout Transaction'

  // Api options
  let auth = 'Bearer ' + ACCESS_TOKEN
  let body = {
    BusinessShortCode,
    Password,
    Timestamp,
    TransactionType,
    Amount,
    PartyA,
    PartyB,
    PhoneNumber,
    CallBackURL,
    AccountReference,
    TransactionDesc,
  }
  const options: AxiosRequestConfig = {
    method: 'POST',
    headers: {
      Authorization: auth,
      'Content-Type': 'application/json',
    },
    data: body,
  }
  const url = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'

  apiCall(res, url, options, (data) => {
    console.log('makePayment():', data)
    resOut(res, 'ok', data)
  })
}

export function lnmcallback(req: Request, res: Response) {
  res.end()
}
