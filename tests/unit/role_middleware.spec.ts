import { test } from '@japa/runner'
import RoleMiddleware from 'App/Middleware/Role'
import { UserRole } from 'App/Enums/UserRole'
import { AUTH_MESSAGES } from 'App/Helpers/ConstantsMessages/AuthMessages'

type FakeResponse = {
  statusCode: number | null
  body: any
  status: (code: number) => FakeResponse
  send: (payload: any) => FakeResponse
}

function createFakeResponse(): FakeResponse {
  return {
    statusCode: null,
    body: null,
    status(code: number) {
      this.statusCode = code
      return this
    },
    send(payload: any) {
      this.body = payload
      return this
    },
  }
}

test.group('Role middleware', () => {
  test('deve permitir acesso quando role estiver autorizada', async ({ assert }) => {
    const middleware = new RoleMiddleware()
    const response = createFakeResponse()
    const request: any = {
      authUser: {
        id: 1,
        role: UserRole.ADMIN,
      },
    }

    let nextCalled = false
    await middleware.handle(
      {
        request,
        response,
      } as any,
      async () => {
        nextCalled = true
      },
      [UserRole.ADMIN]
    )

    assert.isTrue(nextCalled)
    assert.isNull(response.statusCode)
  })

  test('deve bloquear acesso quando role não estiver autorizada', async ({ assert }) => {
    const middleware = new RoleMiddleware()
    const response = createFakeResponse()
    const request: any = {
      authUser: {
        id: 2,
        role: UserRole.USER,
      },
    }

    let nextCalled = false
    await middleware.handle(
      {
        request,
        response,
      } as any,
      async () => {
        nextCalled = true
      },
      [UserRole.ADMIN, UserRole.MANAGER]
    )

    assert.isFalse(nextCalled)
    assert.equal(response.statusCode, 403)
    assert.equal(response.body?.message, AUTH_MESSAGES.FORBIDDEN)
  })

  test('deve retornar não autenticado quando authUser não existir', async ({ assert }) => {
    const middleware = new RoleMiddleware()
    const response = createFakeResponse()
    const request: any = {}

    let nextCalled = false
    await middleware.handle(
      {
        request,
        response,
      } as any,
      async () => {
        nextCalled = true
      },
      [UserRole.ADMIN]
    )

    assert.isFalse(nextCalled)
    assert.equal(response.statusCode, 401)
    assert.equal(response.body?.message, AUTH_MESSAGES.UNAUTHORIZED)
  })
})
