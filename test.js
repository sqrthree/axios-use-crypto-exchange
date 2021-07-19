const axios = require('axios')
const test = require('ava')

const useCryptoExchange = require('./dist/index.umd')

const mockAdapter = (config) => {
  return new Promise((resolve) => {
    const response = {
      data: config.data,
      status: 200,
      statusText: 'OK',
      headers: config.headers,
      config: config,
      request: null,
    }

    resolve(response)
  })
}

const publicKey = () => `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCviWqreUasyZ4sFOIBYPcINGsh
Fmtx4QpP8zDf2GJx592WcT1I1AHuuLaMiwIIdaZjOq9GjlcPSZfqgTXZn2gDnoXN
8tpNZxjFqHZ3aOWlRBxxxjubMg8MYTzXKH1elbK2n/HdpuEsuiv+SfezZyLf2p5V
TlOHy6NQiZjboYTPRwIDAQAB
-----END PUBLIC KEY-----`
const sendEncryptedSecret = () => 'key'

test('should throw an error without getServerPublicKey option', (t) => {
  const request = axios.create({
    adapter: mockAdapter,
  })

  t.throws(
    () => {
      request.interceptors.request.use(
        useCryptoExchange({
          sendEncryptedSecret,
          secret: 'secret',
        })
      )
    },
    {
      message: 'getServerPublicKey is required.',
    }
  )
})

test('should throw an error without sendEncryptedSecret option', (t) => {
  const request = axios.create({
    adapter: mockAdapter,
  })

  t.throws(
    () => {
      request.interceptors.request.use(
        useCryptoExchange({
          getServerPublicKey: () => publicKey,
          secret: 'secret',
        })
      )
    },
    {
      message: 'sendEncryptedSecret is required.',
    }
  )
})

test('should throw an error without secret option', (t) => {
  const request = axios.create({
    adapter: mockAdapter,
  })

  t.throws(
    () => {
      request.interceptors.request.use(
        useCryptoExchange({
          getServerPublicKey: () => 'key',
          sendEncryptedSecret,
        })
      )
    },
    {
      message: 'secret is required.',
    }
  )
})

test('should return with key in GET request', async (t) => {
  const request = axios.create({
    adapter: mockAdapter,
  })

  request.interceptors.request.use(
    useCryptoExchange({
      getServerPublicKey: () => publicKey,
      sendEncryptedSecret,
      secret: 'secret,',
    })
  )

  const { config } = await request.get('/', {
    params: {
      a: 1,
    },
  })

  t.is(config.params.a, 1)
  t.truthy(config.params.key)
})

test('should return with key in POST request', async (t) => {
  const request = axios.create({
    adapter: mockAdapter,
  })

  request.interceptors.request.use(
    useCryptoExchange({
      getServerPublicKey: () => publicKey,
      sendEncryptedSecret,
      secret: 'secret,',
    })
  )

  const { data } = await request.post('/', {
    a: 1,
  })

  t.is(data.a, 1)
  t.truthy(data.key)
})
