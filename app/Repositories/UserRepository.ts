import User from 'App/Models/User'
import { UserRole } from 'App/Enums/UserRole'
import { USER_MESSAGES } from 'App/Helpers/ConstantsMessages/UserMessages'
import IUserRepository, { CreateUserInput, UpdateUserInput } from './IUserRepository'
import { Result } from 'App/Helpers/Utils/Result'

export default class UserRepository implements IUserRepository {
  public async create(data: CreateUserInput): Promise<Result<User>> {
    try {
      const normalizedEmailResult = this.normalizeEmail(data.email)
      if (normalizedEmailResult.isFailed) {
        return Result.Fail(USER_MESSAGES.STORE_ERROR)
      }

      const existingUserResult = await this.findByEmail(normalizedEmailResult.value as string)
      if (existingUserResult.isFailed) {
        return Result.Fail(existingUserResult.errors)
      }

      if (existingUserResult.value) {
        return Result.Fail(USER_MESSAGES.EMAIL_ALREADY_EXISTS)
      }

      const user = await User.create({
        email: normalizedEmailResult.value as string,
        password: data.password,
        role: data.role ?? UserRole.USER,
      })

      return Result.Ok(user)
    } catch (error) {
      return Result.Fail(USER_MESSAGES.STORE_ERROR)
    }
  }

  public async findById(id: number): Promise<Result<User | null>> {
    try {
      const user = await User.find(id)
      return Result.Ok(user)
    } catch (error) {
      return Result.Fail(USER_MESSAGES.SHOW_ERROR)
    }
  }

  public async findByEmail(email: string): Promise<Result<User | null>> {
    try {
      const normalizedEmailResult = this.normalizeEmail(email)
      if (normalizedEmailResult.isFailed) {
        return Result.Fail(USER_MESSAGES.SHOW_ERROR)
      }

      const user = await User.query().where('email', normalizedEmailResult.value as string).first()
      return Result.Ok(user)
    } catch (error) {
      return Result.Fail(USER_MESSAGES.SHOW_ERROR)
    }
  }

  public async list(): Promise<Result<User[]>> {
    try {
      const users = await User.query().orderBy('id', 'asc')
      return Result.Ok(users)
    } catch (error) {
      return Result.Fail(USER_MESSAGES.INDEX_ERROR)
    }
  }

  public async update(id: number, data: UpdateUserInput): Promise<Result<User | null>> {
    try {
      const userResult = await this.findById(id)
      if (userResult.isFailed) {
        return Result.Fail(userResult.errors)
      }

      const user = userResult.value
      if (!user) {
        return Result.Ok(null)
      }

      if (data.email && data.email !== user.email) {
        const normalizedEmailResult = this.normalizeEmail(data.email)
        if (normalizedEmailResult.isFailed) {
          return Result.Fail(USER_MESSAGES.UPDATE_ERROR)
        }

        const existingUserResult = await this.findByEmail(normalizedEmailResult.value as string)
        if (existingUserResult.isFailed) {
          return Result.Fail(existingUserResult.errors)
        }

        if (existingUserResult.value && existingUserResult.value.id !== user.id) {
          return Result.Fail(USER_MESSAGES.EMAIL_ALREADY_EXISTS)
        }

        user.email = normalizedEmailResult.value as string
      }

      if (data.password) {
        user.password = data.password
      }

      if (data.role) {
        user.role = data.role
      }

      await user.save()

      return Result.Ok(user)
    } catch (error) {
      return Result.Fail(USER_MESSAGES.UPDATE_ERROR)
    }
  }

  public async delete(id: number): Promise<Result<boolean>> {
    try {
      const deletedRows = await User.query().where('id', id).delete()
      if (Array.isArray(deletedRows)) {
        return Result.Ok(deletedRows.length > 0)
      }

      return Result.Ok(deletedRows > 0)
    } catch (error) {
      return Result.Fail(USER_MESSAGES.DESTROY_ERROR)
    }
  }

  private normalizeEmail(email: string): Result<string> {
    try {
      return Result.Ok(email.trim().toLowerCase())
    } catch (error) {
      return Result.Fail(USER_MESSAGES.SHOW_ERROR)
    }
  }
}
