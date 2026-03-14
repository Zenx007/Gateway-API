import Env from '@ioc:Adonis/Core/Env'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import type { NextFn } from '@ioc:Adonis/Core/Server'
import AuthRepository from 'App/Repositories/AuthRepository'
import { AUTH_MESSAGES } from 'App/Helpers/ConstantsMessages/AuthMessages'
import Jwt from 'App/Helpers/Utils/Jwt'

export default class Auth {
  private readonly authRepository = new AuthRepository()

  public async handle({ request, response }: HttpContextContract, next: NextFn) {
    try {
      const authorization = request.header('authorization')
      if (!authorization || !authorization.startsWith('Bearer ')) {
        return response.status(401).send({
          success: false,
          object: null,
          message: AUTH_MESSAGES.TOKEN_REQUIRED,
          number: 401,
        })
      }

      const token = authorization.replace('Bearer ', '').trim()
      if (!token) {
        return response.status(401).send({
          success: false,
          object: null,
          message: AUTH_MESSAGES.TOKEN_REQUIRED,
          number: 401,
        })
      }

      const jwtSecret = Env.get('JWT_SECRET', 'gatewayapi-jwt-default-secret-change-me')
      const jwtResult = Jwt.verify(token, jwtSecret)
      if (!jwtResult.isValid) {
        return response.status(401).send({
          success: false,
          object: null,
          message: jwtResult.error === 'expired' ? AUTH_MESSAGES.TOKEN_EXPIRED : AUTH_MESSAGES.TOKEN_INVALID,
          number: 401,
        })
      }

      const userId = Number(jwtResult.payload.sub)
      if (!Number.isInteger(userId) || userId <= 0) {
        return response.status(401).send({
          success: false,
          object: null,
          message: AUTH_MESSAGES.TOKEN_INVALID,
          number: 401,
        })
      }

      const userResult = await this.authRepository.findUserById(userId)
      if (userResult.isFailed || !userResult.value) {
        return response.status(401).send({
          success: false,
          object: null,
          message: AUTH_MESSAGES.TOKEN_INVALID,
          number: 401,
        })
      }

      ;(request as any).authUser = userResult.value
      await next()
    } catch (error) {
      return response.status(401).send({
        success: false,
        object: null,
        message: AUTH_MESSAGES.UNAUTHORIZED,
        number: 401,
      })
    }
  }
}
