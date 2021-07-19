(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('node-forge')) :
  typeof define === 'function' && define.amd ? define(['node-forge'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.useCryptoExchange = factory(global.forge));
}(this, (function (forge) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var forge__default = /*#__PURE__*/_interopDefaultLegacy(forge);

  const publicEncrypt = function publicEncrypt(key, data) {
    const { publicKeyFromPem } = forge__default['default'].pki;

    const publicKey = publicKeyFromPem(key);
    const cipherText = publicKey.encrypt(data, 'RSA-OAEP');
    const result = forge__default['default'].util.encode64(cipherText);

    return result
  };

  let key = '';

  /**
   *
   * @param {Object} options
   * @param {() => Promise<string>} options.getServerPublicKey
   * @param {string} options.secret
   *
   * @returns
   */
  function useCryptoExchange(options) {
    return async function interceptor(config) {
      const { method, params, data } = config;
      const { getServerPublicKey, secret } = options;

      const hasParams = params && Object.keys(params).length > 0;
      const hasBody = data && Object.keys(data).length > 0;

      if (!key) {
        const serverPublicKey = await getServerPublicKey();
        const encryptedSecret = publicEncrypt(serverPublicKey, secret);

        key = await options.sendEncryptedSecret(encryptedSecret);
      }

      if (method === 'get' || method === 'delete' || hasParams) {
        config.params = Object.assign({}, params, {
          key,
        });
      }

      if (
        method === 'post' ||
        method === 'put' ||
        method === 'patch' ||
        hasBody
      ) {
        config.data = Object.assign({}, data, {
          key,
        });
      }

      return config
    }
  }

  return useCryptoExchange;

})));
