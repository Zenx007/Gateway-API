import User from 'App/Models/User'
import { UserRole } from 'App/Enums/UserRole'
import { Result } from 'App/Helpers/Utils/Result'

export type CreateUserInput = {
  email: string
  password: string
  role?: UserRole
}

export type UpdateUserInput = {
  email?: string
  password?: string
  role?: UserRole
}

export default interface IUserRepository {
  create(data: CreateUserInput): Promise<Result<User>>
  findById(id: number): Promise<Result<User | null>>
  findByEmail(email: string): Promise<Result<User | null>>
  list(): Promise<Result<User[]>>
  update(id: number, data: UpdateUserInput): Promise<Result<User | null>>
  delete(id: number): Promise<Result<boolean>>
}
