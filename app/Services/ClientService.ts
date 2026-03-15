import Client from 'App/Models/Client'
import ClientRepository from 'App/Repositories/ClientRepository'
import IClientRepository from 'App/Repositories/IClientRepository'
import { Result } from 'App/Helpers/Utils/Result'
import { CLIENT_MESSAGES } from 'App/Helpers/ConstantsMessages/ClientMessages'

export default class ClientService {
  constructor(private readonly clientRepository: IClientRepository = new ClientRepository()) {}

  public async list(): Promise<Result<Client[]>> {
    try {
      return await this.clientRepository.list()
    } catch (error) {
      return Result.Fail(CLIENT_MESSAGES.INDEX_ERROR)
    }
  }

  public async findByIdWithTransactions(id: number): Promise<Result<Client | null>> {
    try {
      if (!Number.isInteger(id) || id <= 0) {
        return Result.Fail(CLIENT_MESSAGES.INVALID_ID)
      }

      const result = await this.clientRepository.findByIdWithTransactions(id)
      if (result.isFailed) {
        return Result.Fail(result.errors)
      }

      if (!result.value) {
        return Result.Fail(CLIENT_MESSAGES.NOT_FOUND)
      }

      return Result.Ok(result.value)
    } catch (error) {
      return Result.Fail(CLIENT_MESSAGES.SHOW_ERROR)
    }
  }
}
