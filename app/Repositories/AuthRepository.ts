import User from 'App/Models/User'
import IAuthRepository from 'App/Repositories/IAuthRepository'
import { Result } from 'App/Helpers/Utils/Result'
import { AUTH_MESSAGES } from 'App/Helpers/ConstantsMessages/AuthMessages'

export default class AuthRepository implements IAuthRepository {
  public async findUserByEmail(email: string): Promise<Result<User | null>> {
    try {
      const user = await User.query().where('email', email).first()
      return Result.Ok(user)
    } catch (error) {
      return Result.Fail(AUTH_MESSAGES.LOGIN_ERROR)
    }
  }

  public async findUserById(id: number): Promise<Result<User | null>> {
    try {
      const user = await User.find(id)
      return Result.Ok(user)
    } catch (error) {
      return Result.Fail(AUTH_MESSAGES.TOKEN_INVALID)
    }
  }
}
