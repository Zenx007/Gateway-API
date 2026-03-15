import Client from 'App/Models/Client'
import Transaction from 'App/Models/Transaction'
import IClientRepository, { UpsertClientInput } from 'App/Repositories/IClientRepository'
import { Result } from 'App/Helpers/Utils/Result'
import { CLIENT_MESSAGES } from 'App/Helpers/ConstantsMessages/ClientMessages'

export default class ClientRepository implements IClientRepository {
  public async upsertByEmail(data: UpsertClientInput): Promise<Result<Client>> {
    try {
      const client = await Client.updateOrCreate(
        { email: data.email.trim().toLowerCase() },
        { name: data.name, email: data.email.trim().toLowerCase() }
      )
      return Result.Ok(client)
    } catch (error) {
      return Result.Fail(CLIENT_MESSAGES.SHOW_ERROR)
    }
  }

  public async list(): Promise<Result<Client[]>> {
    try {
      const clients = await Client.query().orderBy('id', 'asc')
      return Result.Ok(clients)
    } catch (error) {
      return Result.Fail(CLIENT_MESSAGES.INDEX_ERROR)
    }
  }

  public async findByIdWithTransactions(id: number): Promise<Result<Client | null>> {
    try {
      const parsedId = Number(id)
      if (!Number.isInteger(parsedId) || parsedId <= 0) {
        return Result.Ok(null)
      }

      const client = await Client.find(parsedId)
      if (!client) {
        return Result.Ok(null)
      }

      const transactions = await Transaction.query()
        .where('client_id', parsedId)
        .preload('gateway')
        .preload('transactionProducts', (itemQuery) => {
          itemQuery.preload('product')
        })
        .orderBy('id', 'desc')

      ;(client as any).$setRelated('transactions', transactions)

      return Result.Ok(client)
    } catch (error) {
      return Result.Fail(CLIENT_MESSAGES.SHOW_ERROR)
    }
  }
}
