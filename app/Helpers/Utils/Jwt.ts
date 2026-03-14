import crypto from 'node:crypto'

type JwtPayload = {
  sub: string
  email: string
  role: string
  iat: number
  exp: number
}

type JwtVerifyResult =
  | {
      isValid: true
      payload: JwtPayload
    }
  | {
      isValid: false
      error: 'expired' | 'invalid'
    }

export default class Jwt {
  public static sign(
    payload: {
      sub: string
      email: string
      role: string
    },
    secret: string,
    expiresInSeconds: number
  ): string {
    const nowInSeconds = Math.floor(Date.now() / 1000)
    const fullPayload: JwtPayload = {
      ...payload,
      iat: nowInSeconds,
      exp: nowInSeconds + expiresInSeconds,
    }

    const header = {
      alg: 'HS256',
      typ: 'JWT',
    }

    const headerEncoded = this.base64UrlEncode(JSON.stringify(header))
    const payloadEncoded = this.base64UrlEncode(JSON.stringify(fullPayload))
    const signature = this.signValue(`${headerEncoded}.${payloadEncoded}`, secret)

    return `${headerEncoded}.${payloadEncoded}.${signature}`
  }

  public static verify(token: string, secret: string): JwtVerifyResult {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) {
        return { isValid: false, error: 'invalid' }
      }

      const [headerEncoded, payloadEncoded, signature] = parts

      const expectedSignature = this.signValue(`${headerEncoded}.${payloadEncoded}`, secret)
      if (!this.safeCompare(signature, expectedSignature)) {
        return { isValid: false, error: 'invalid' }
      }

      const header = JSON.parse(this.base64UrlDecode(headerEncoded))
      if (header?.alg !== 'HS256' || header?.typ !== 'JWT') {
        return { isValid: false, error: 'invalid' }
      }

      const payload = JSON.parse(this.base64UrlDecode(payloadEncoded)) as JwtPayload

      if (
        !payload ||
        typeof payload.sub !== 'string' ||
        typeof payload.email !== 'string' ||
        typeof payload.role !== 'string' ||
        typeof payload.exp !== 'number'
      ) {
        return { isValid: false, error: 'invalid' }
      }

      const nowInSeconds = Math.floor(Date.now() / 1000)
      if (nowInSeconds >= payload.exp) {
        return { isValid: false, error: 'expired' }
      }

      return { isValid: true, payload }
    } catch {
      return { isValid: false, error: 'invalid' }
    }
  }

  private static signValue(value: string, secret: string): string {
    const signature = crypto.createHmac('sha256', secret).update(value).digest('base64')
    return this.base64ToUrlSafe(signature)
  }

  private static base64UrlEncode(value: string): string {
    const base64 = Buffer.from(value, 'utf8').toString('base64')
    return this.base64ToUrlSafe(base64)
  }

  private static base64UrlDecode(value: string): string {
    const base64 = this.urlSafeToBase64(value)
    return Buffer.from(base64, 'base64').toString('utf8')
  }

  private static base64ToUrlSafe(base64: string): string {
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
  }

  private static urlSafeToBase64(value: string): string {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
    const padding = (4 - (base64.length % 4)) % 4
    return base64 + '='.repeat(padding)
  }

  private static safeCompare(a: string, b: string): boolean {
    const aBuffer = Buffer.from(a)
    const bBuffer = Buffer.from(b)
    if (aBuffer.length !== bBuffer.length) {
      return false
    }

    return crypto.timingSafeEqual(aBuffer, bBuffer)
  }
}
