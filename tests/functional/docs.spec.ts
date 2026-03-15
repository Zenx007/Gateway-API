import { test } from '@japa/runner'

test.group('Documentação', () => {
  test('deve carregar o Swagger UI', async ({ client }) => {
    const response = await client.get('/docs')

    response.assertStatus(200)
    response.assertTextIncludes('Swagger UI')
  })

  test('deve retornar o JSON do Swagger', async ({ client }) => {
    const response = await client.get('/swagger')

    response.assertStatus(200)
    response.assertBodyContains({
      openapi: '3.0.0',
    })
  })
})
