import { test } from '@japa/runner'
import UserService from 'App/Services/UserService'
import IUserRepository, { CreateUserInput, UpdateUserInput } from 'App/Repositories/IUserRepository'
import { Result } from 'App/Helpers/Utils/Result'
import User from 'App/Models/User'
import { UserRole } from 'App/Enums/UserRole'
import { USER_MESSAGES } from 'App/Helpers/ConstantsMessages/UserMessages'
import { UserSaveVO } from 'App/Communication/ViewObjects/User/UserSaveVO'
import { UserUpdateVO } from 'App/Communication/ViewObjects/User/UserUpdateVO'

class FakeUserRepository implements IUserRepository {
  constructor(private readonly users: User[] = []) {}

  public async create(data: CreateUserInput) {
    const normalizedEmail = data.email.trim().toLowerCase()
    const alreadyExists = this.users.find((user) => user.email === normalizedEmail)
    if (alreadyExists) {
      return Result.Fail(USER_MESSAGES.EMAIL_ALREADY_EXISTS)
    }

    const user = {
      id: this.users.length + 1,
      email: normalizedEmail,
      password: data.password,
      role: data.role ?? UserRole.USER,
    } as User

    this.users.push(user)
    return Result.Ok(user)
  }

  public async findById(id: number) {
    return Result.Ok(this.users.find((user) => user.id === id) ?? null)
  }

  public async findByEmail(email: string) {
    return Result.Ok(this.users.find((user) => user.email === email.trim().toLowerCase()) ?? null)
  }

  public async list() {
    return Result.Ok(this.users)
  }

  public async update(id: number, data: UpdateUserInput) {
    const user = this.users.find((item) => item.id === id)
    if (!user) {
      return Result.Ok(null)
    }

    if (data.email) {
      const normalizedEmail = data.email.trim().toLowerCase()
      const alreadyExists = this.users.find((item) => item.email === normalizedEmail && item.id !== id)
      if (alreadyExists) {
        return Result.Fail(USER_MESSAGES.EMAIL_ALREADY_EXISTS)
      }

      user.email = normalizedEmail
    }
    if (data.password) {
      user.password = data.password
    }
    if (data.role) {
      user.role = data.role
    }

    return Result.Ok(user)
  }

  public async delete(id: number) {
    const index = this.users.findIndex((item) => item.id === id)
    if (index < 0) {
      return Result.Ok(false)
    }

    this.users.splice(index, 1)
    return Result.Ok(true)
  }
}

test.group('UserService', () => {
  test('deve falhar ao criar usuário com role inválida', async ({ assert }) => {
    const repository = new FakeUserRepository()
    const service = new UserService(repository)

    const result = await service.createWithRole(
      UserSaveVO.fromPayload({
        email: 'test@gatewayapi.local',
        password: '12345678',
      }),
      'INVALID_ROLE' as UserRole
    )

    assert.isTrue(result.isFailed)
    assert.equal(result.errors[0], USER_MESSAGES.INVALID_ROLE)
  })

  test('deve retornar erro ao buscar usuário com ID inválido', async ({ assert }) => {
    const repository = new FakeUserRepository()
    const service = new UserService(repository)

    const result = await service.findById(0)

    assert.isTrue(result.isFailed)
    assert.equal(result.errors[0], USER_MESSAGES.INVALID_USER_ID)
  })

  test('deve criar usuário com role USER quando role não for informada', async ({ assert }) => {
    const repository = new FakeUserRepository()
    const service = new UserService(repository)

    const result = await service.create(
      UserSaveVO.fromPayload({
        email: 'novo@gatewayapi.local',
        password: '12345678',
      })
    )

    assert.isTrue(result.isSuccess)
    assert.equal(result.value?.role, UserRole.USER)
  })

  test('deve bloquear atualização com e-mail já existente', async ({ assert }) => {
    const repository = new FakeUserRepository([
      { id: 1, email: 'admin@gatewayapi.local', password: '12345678', role: UserRole.ADMIN } as User,
      { id: 2, email: 'user@gatewayapi.local', password: '12345678', role: UserRole.USER } as User,
    ])
    const service = new UserService(repository)

    const result = await service.update(
      2,
      UserUpdateVO.fromPayload({
        email: 'admin@gatewayapi.local',
      })
    )

    assert.isTrue(result.isFailed)
    assert.equal(result.errors[0], USER_MESSAGES.EMAIL_ALREADY_EXISTS)
  })
})
