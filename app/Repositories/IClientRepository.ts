import Client from 'App/Models/Client'
import { Result } from 'App/Helpers/Utils/Result'

export type UpsertClientInput = {
  name: string
  email: string
}

export default interface IClientRepository {
  upsertByEmail(data: UpsertClientInput): Promise<Result<Client>>
  list(): Promise<Result<Client[]>>
  findByIdWithTransactions(id: number): Promise<Result<Client | null>>
}
