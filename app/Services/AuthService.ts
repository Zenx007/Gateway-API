import Hash from '@ioc:Adonis/Core/Hash'
import Env from '@ioc:Adonis/Core/Env'
import AuthRepository from 'App/Repositories/AuthRepository'
import IAuthRepository from 'App/Repositories/IAuthRepository'
import { Result } from 'App/Helpers/Utils/Result'
import { AUTH_MESSAGES } from 'App/Helpers/ConstantsMessages/AuthMessages'
import Jwt from 'App/Helpers/Utils/Jwt'

type LoginOutput = {
  token: string
  user: {
    id: number
    email: string
    role: string
  }
}

export default class AuthService {
  constructor(private readonly authRepository: IAuthRepository = new AuthRepository()) {}

  public async login(email: string, password: string): Promise<Result<LoginOutput>> {
    try {
      const normalizedEmail = email.trim().toLowerCase()
      const userResult = await this.authRepository.findUserByEmail(normalizedEmail)
      if (userResult.isFailed) {
        return Result.Fail(userResult.errors)
      }

      const user = userResult.value
      if (!user) {
        return Result.Fail(AUTH_MESSAGES.INVALID_CREDENTIALS)
      }

      const validPassword = await Hash.verify(user.password, password)
      if (!validPassword) {
        return Result.Fail(AUTH_MESSAGES.INVALID_CREDENTIALS)
      }

      const jwtSecret = Env.get('JWT_SECRET', 'gatewayapi-jwt-default-secret-change-me')
      const jwtExpiresIn = Number(Env.get('JWT_EXPIRES_IN_SECONDS', 60 * 60 * 24 * 7))
      const token = Jwt.sign(
        {
          sub: String(user.id),
          email: user.email,
          role: user.role,
        },
        jwtSecret,
        jwtExpiresIn
      )

      return Result.Ok({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      })
    } catch (error) {
      return Result.Fail(AUTH_MESSAGES.LOGIN_ERROR)
    }
  }
}
