import CryptoJS from 'crypto-js'
import JSEncrypt from 'jsencrypt'

const publicKey = import.meta.env.VITE_APP_RSA_PUBLIC_KEY
const privateKey = import.meta.env.VITE_APP_RSA_PRIVATE_KEY

/**
 * 随机生成32位的字符串
 * @returns {string}
 */
function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  const charactersLength = characters.length
  for (let i = 0; i < 32; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

/**
 * 随机生成aes 密钥
 * @returns {string}
 */
export function generateAesKey() {
  return CryptoJS.enc.Utf8.parse(generateRandomString())
}

/**
 * 加密base64
 * @returns {string}
 */
export function encryptBase64(str: CryptoJS.lib.WordArray) {
  return CryptoJS.enc.Base64.stringify(str)
}

/**
 * 解密base64
 */
export function decryptBase64(str: string) {
  return CryptoJS.enc.Base64.parse(str)
}

/**
 * 使用密钥对数据进行加密
 * @param message
 * @param aesKey
 * @returns {string}
 */
export function encryptWithAes(message: string, aesKey: CryptoJS.lib.WordArray) {
  const encrypted = CryptoJS.AES.encrypt(message, aesKey, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  })
  return encrypted.toString()
}

/**
 * 使用密钥对数据进行解密
 * @param message
 * @param aesKey
 * @returns {string}
 */
export function decryptWithAes(message: string, aesKey: CryptoJS.lib.WordArray) {
  const decrypted = CryptoJS.AES.decrypt(message, aesKey, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  })
  return decrypted.toString(CryptoJS.enc.Utf8)
}

// 加密
export function encrypt(txt: string) {
  const jsEncrypt = new JSEncrypt()
  jsEncrypt.setPublicKey(publicKey) // 设置公钥
  return jsEncrypt.encrypt(txt) // 对数据进行加密
}

// 解密
export function decrypt(txt: string) {
  const jsEncrypt = new JSEncrypt()
  jsEncrypt.setPrivateKey(privateKey) // 设置私钥
  return jsEncrypt.decrypt(txt) // 对数据进行解密
}
