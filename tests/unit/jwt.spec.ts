import { test } from '@japa/runner'
import Jwt from 'App/Helpers/Utils/Jwt'

test.group('JWT util', () => {
  test('deve gerar e validar token corretamente', async ({ assert }) => {
    const secret = 'test-secret'
    const token = Jwt.sign(
      {
        sub: '1',
        email: 'admin@gatewayapi.local',
        role: 'ADMIN',
      },
      secret,
      60
    )

    const result = Jwt.verify(token, secret)

    assert.isTrue(result.isValid)
    if (result.isValid) {
      assert.equal(result.payload.sub, '1')
      assert.equal(result.payload.email, 'admin@gatewayapi.local')
      assert.equal(result.payload.role, 'ADMIN')
    }
  })

  test('deve falhar com secret inválido', async ({ assert }) => {
    const token = Jwt.sign(
      {
        sub: '1',
        email: 'admin@gatewayapi.local',
        role: 'ADMIN',
      },
      'secret-a',
      60
    )

    const result = Jwt.verify(token, 'secret-b')

    assert.isFalse(result.isValid)
    if (!result.isValid) {
      assert.equal(result.error, 'invalid')
    }
  })

  test('deve falhar token expirado', async ({ assert }) => {
    const token = Jwt.sign(
      {
        sub: '1',
        email: 'admin@gatewayapi.local',
        role: 'ADMIN',
      },
      'test-secret',
      -1
    )

    const result = Jwt.verify(token, 'test-secret')

    assert.isFalse(result.isValid)
    if (!result.isValid) {
      assert.equal(result.error, 'expired')
    }
  })
})
