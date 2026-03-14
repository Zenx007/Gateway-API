import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import type { NextFn } from '@ioc:Adonis/Core/Server'
import { AUTH_MESSAGES } from 'App/Helpers/ConstantsMessages/AuthMessages'
import User from 'App/Models/User'

export default class Role {
  public async handle({ request, response }: HttpContextContract, next: NextFn, allowedRoles: string[]) {
    try {
      const authUser = (request as any).authUser as User | undefined
      if (!authUser) {
        return response.status(401).send({
          success: false,
          object: null,
          message: AUTH_MESSAGES.UNAUTHORIZED,
          number: 401,
        })
      }

      const normalizedAllowedRoles = allowedRoles.map((role) => String(role).trim().toUpperCase())
      const currentUserRole = String(authUser.role ?? '')
        .trim()
        .toUpperCase()

      if (!normalizedAllowedRoles.includes(currentUserRole)) {
        return response.status(403).send({
          success: false,
          object: null,
          message: AUTH_MESSAGES.FORBIDDEN,
          number: 403,
        })
      }

      await next()
    } catch (error) {
      return response.status(403).send({
        success: false,
        object: null,
        message: AUTH_MESSAGES.FORBIDDEN,
        number: 403,
      })
    }
  }
}
