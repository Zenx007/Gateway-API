import User from 'App/Models/User'
import { Result } from 'App/Helpers/Utils/Result'

export default interface IAuthRepository {
  findUserByEmail(email: string): Promise<Result<User | null>>
  findUserById(id: number): Promise<Result<User | null>>
}
