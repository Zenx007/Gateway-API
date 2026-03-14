import User from 'App/Models/User'
import IUserRepository from 'App/Repositories/IUserRepository'
import UserRepository from 'App/Repositories/UserRepository'
import { Result } from 'App/Helpers/Utils/Result'
import { USER_MESSAGES } from 'App/Helpers/ConstantsMessages/UserMessages'
import { UserSaveVO } from 'App/Communication/ViewObjects/User/UserSaveVO'
import { UserUpdateVO } from 'App/Communication/ViewObjects/User/UserUpdateVO'
import { UserRole } from 'App/Enums/UserRole'

export default class UserService {
  constructor(private readonly userRepository: IUserRepository = new UserRepository()) {}

  public async create(model: UserSaveVO): Promise<Result<User>> {
    try {
      return await this.userRepository.create({
        email: model.email,
        password: model.password,
      })
    } catch (error) {
      return Result.Fail(USER_MESSAGES.STORE_ERROR)
    }
  }

  public async createWithRole(model: UserSaveVO, role: UserRole): Promise<Result<User>> {
    try {
      if (!Object.values(UserRole).includes(role)) {
        return Result.Fail(USER_MESSAGES.INVALID_ROLE)
      }

      return await this.userRepository.create({
        email: model.email,
        password: model.password,
        role,
      })
    } catch (error) {
      return Result.Fail(USER_MESSAGES.STORE_ERROR)
    }
  }

  public async findById(id: number): Promise<Result<User | null>> {
    try {
      const idResult = this.validateUserId(id)
      if (idResult.isFailed) {
        return Result.Fail(idResult.errors)
      }

      const userResult = await this.userRepository.findById(id)
      if (userResult.isFailed) {
        return Result.Fail(userResult.errors)
      }

      if (!userResult.value) {
        return Result.Fail(USER_MESSAGES.NOT_FOUND)
      }

      return Result.Ok(userResult.value)
    } catch (error) {
      return Result.Fail(USER_MESSAGES.SHOW_ERROR)
    }
  }

  public async findByEmail(email: string): Promise<Result<User | null>> {
    try {
      const emailResult = this.validateEmail(email)
      if (emailResult.isFailed) {
        return Result.Fail(emailResult.errors)
      }

      return await this.userRepository.findByEmail(email)
    } catch (error) {
      return Result.Fail(USER_MESSAGES.SHOW_ERROR)
    }
  }

  public async list(): Promise<Result<User[]>> {
    try {
      return await this.userRepository.list()
    } catch (error) {
      return Result.Fail(USER_MESSAGES.INDEX_ERROR)
    }
  }

  public async update(id: number, model: UserUpdateVO): Promise<Result<User | null>> {
    try {
      const idResult = this.validateUserId(id)
      if (idResult.isFailed) {
        return Result.Fail(idResult.errors)
      }

      const userExistsResult = await this.validateUserExists(id)
      if (userExistsResult.isFailed) {
        return Result.Fail(userExistsResult.errors)
      }

      const updateResult = await this.userRepository.update(id, {
        email: model.email,
        password: model.password,
        role: model.role,
      })
      if (updateResult.isFailed) {
        return Result.Fail(updateResult.errors)
      }

      if (!updateResult.value) {
        return Result.Fail(USER_MESSAGES.NOT_FOUND)
      }

      return Result.Ok(updateResult.value)
    } catch (error) {
      return Result.Fail(USER_MESSAGES.UPDATE_ERROR)
    }
  }

  public async delete(id: number): Promise<Result<boolean>> {
    try {
      const idResult = this.validateUserId(id)
      if (idResult.isFailed) {
        return Result.Fail(idResult.errors)
      }

      const userExistsResult = await this.validateUserExists(id)
      if (userExistsResult.isFailed) {
        return Result.Fail(userExistsResult.errors)
      }

      const deleteResult = await this.userRepository.delete(id)
      if (deleteResult.isFailed) {
        return Result.Fail(deleteResult.errors)
      }

      if (!deleteResult.value) {
        return Result.Fail(USER_MESSAGES.NOT_FOUND)
      }

      return Result.Ok(true)
    } catch (error) {
      return Result.Fail(USER_MESSAGES.DESTROY_ERROR)
    }
  }

  private validateUserId(id: number): Result<true> {
    try {
      if (!Number.isInteger(id) || id <= 0) {
        return Result.Fail(USER_MESSAGES.INVALID_USER_ID)
      }

      return Result.Ok(true)
    } catch (error) {
      return Result.Fail(USER_MESSAGES.INVALID_USER_ID)
    }
  }

  private async validateUserExists(id: number): Promise<Result<true>> {
    try {
      const userResult = await this.userRepository.findById(id)
      if (userResult.isFailed) {
        return Result.Fail(userResult.errors)
      }

      if (!userResult.value) {
        return Result.Fail(USER_MESSAGES.NOT_FOUND)
      }

      return Result.Ok(true)
    } catch (error) {
      return Result.Fail(USER_MESSAGES.SHOW_ERROR)
    }
  }

  private validateEmail(email?: string): Result<true> {
    try {
      if (!email || email.trim().length === 0) {
        return Result.Fail(USER_MESSAGES.REQUIRED_EMAIL)
      }

      const normalizedEmail = email.trim()
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(normalizedEmail)) {
        return Result.Fail(USER_MESSAGES.INVALID_EMAIL)
      }

      return Result.Ok(true)
    } catch (error) {
      return Result.Fail(USER_MESSAGES.INVALID_EMAIL)
    }
  }
}
