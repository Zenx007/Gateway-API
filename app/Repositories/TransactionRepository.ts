import Transaction from 'App/Models/Transaction'
import TransactionProduct from 'App/Models/TransactionProduct'
import { Result } from 'App/Helpers/Utils/Result'
import { PAYMENT_MESSAGES } from 'App/Helpers/ConstantsMessages/PaymentMessages'
import ITransactionRepository, {
  CreateTransactionInput,
  TransactionItemInput,
} from 'App/Repositories/ITransactionRepository'

export default class TransactionRepository implements ITransactionRepository {
  public async create(data: CreateTransactionInput): Promise<Result<Transaction>> {
    try {
      const transaction = await Transaction.create({
        gatewayId: data.gatewayId,
        clientId: data.clientId,
        externalId: data.externalId,
        status: data.status,
        amount: data.amount,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        cardLastNumbers: data.cardLastNumbers,
        errorMessage: data.errorMessage ?? null,
        rawResponse: data.rawResponse ?? null,
      })

      if (data.items && data.items.length > 0) {
        const itemsResult = await this.createItems(
          data.items.map((item) => ({
            transactionId: transaction.id,
            productId: item.productId,
            quantity: item.quantity,
            unitAmount: item.unitAmount,
            totalAmount: item.totalAmount,
          }))
        )

        if (itemsResult.isFailed) {
          return Result.Fail(itemsResult.errors)
        }
      }

      return Result.Ok(transaction)
    } catch (error) {
      return Result.Fail(PAYMENT_MESSAGES.CHARGE_ERROR)
    }
  }

  public async list(): Promise<Result<Transaction[]>> {
    try {
      const transactions = await Transaction.query()
        .preload('client')
        .preload('gateway')
        .preload('transactionProducts', (itemQuery) => {
          itemQuery.preload('product')
        })
        .orderBy('id', 'desc')

      return Result.Ok(transactions)
    } catch (error) {
      return Result.Fail(PAYMENT_MESSAGES.CHARGE_ERROR)
    }
  }

  public async findById(id: number): Promise<Result<Transaction | null>> {
    try {
      const parsedId = Number(id)
      if (!Number.isInteger(parsedId) || parsedId <= 0) {
        return Result.Ok(null)
      }

      const transaction = await Transaction.query()
        .where('id', parsedId)
        .preload('client')
        .preload('gateway')
        .preload('transactionProducts', (itemQuery) => {
          itemQuery.preload('product')
        })
        .limit(1)
        .first()

      return Result.Ok(transaction)
    } catch (error) {
      return Result.Fail(PAYMENT_MESSAGES.CHARGE_ERROR)
    }
  }

  public async save(transaction: Transaction): Promise<Result<Transaction>> {
    try {
      await transaction.save()
      return Result.Ok(transaction)
    } catch (error) {
      return Result.Fail(PAYMENT_MESSAGES.CHARGE_ERROR)
    }
  }

  public async createItems(items: TransactionItemInput[]): Promise<Result<boolean>> {
    try {
      await TransactionProduct.createMany(
        items.map((item) => ({
          transactionId: item.transactionId,
          productId: item.productId,
          quantity: item.quantity,
          unitAmount: item.unitAmount,
          totalAmount: item.totalAmount,
        }))
      )
      return Result.Ok(true)
    } catch (error) {
      return Result.Fail(PAYMENT_MESSAGES.CHARGE_ERROR)
    }
  }
}
