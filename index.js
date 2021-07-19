import forge from 'node-forge'

const publicEncrypt = function publicEncrypt(key, data) {
  const { publicKeyFromPem } = forge.pki

  const publicKey = publicKeyFromPem(key)
  const cipherText = publicKey.encrypt(data, 'RSA-OAEP')
  const result = forge.util.encode64(cipherText)

  return result
}

let key = ''

/**
 *
 * @param {Object} options
 * @param {() => Promise<string>} options.getServerPublicKey
 * @param {(str: string) => Promise<void>} options.sendEncryptedSecret
 * @param {string} options.secret
 *
 * @returns interceptor
 */
export default function useCryptoExchange(options = {}) {
  const { getServerPublicKey, sendEncryptedSecret, secret } = options

  if (!getServerPublicKey) {
    throw Error('getServerPublicKey is required.')
  }

  if (!sendEncryptedSecret) {
    throw Error('sendEncryptedSecret is required.')
  }

  if (!secret) {
    throw Error('secret is required.')
  }

  return async function interceptor(config) {
    const { method, params, data } = config

    const hasParams = params && Object.keys(params).length > 0
    const hasBody = data && Object.keys(data).length > 0

    if (!key) {
      const serverPublicKey = await getServerPublicKey()
      const encryptedSecret = publicEncrypt(serverPublicKey, secret)

      key = await sendEncryptedSecret(encryptedSecret)
    }

    if (method === 'get' || method === 'delete' || hasParams) {
      config.params = Object.assign({}, params, {
        key,
      })
    }

    if (
      method === 'post' ||
      method === 'put' ||
      method === 'patch' ||
      hasBody
    ) {
      config.data = Object.assign({}, data, {
        key,
      })
    }

    return config
  }
}
