import Transaction from 'App/Models/Transaction'
import { Result } from 'App/Helpers/Utils/Result'
import { TransactionStatus } from 'App/Enums/TransactionStatus'

export type CreateTransactionInput = {
  gatewayId: number | null
  clientId: number | null
  externalId: string | null
  status: TransactionStatus
  amount: number
  clientName: string
  clientEmail: string
  cardLastNumbers: string
  errorMessage?: string | null
  rawResponse?: string | null
  items?: Array<{
    productId: number
    quantity: number
    unitAmount: number
    totalAmount: number
  }>
}

export type TransactionItemInput = {
  transactionId: number
  productId: number
  quantity: number
  unitAmount: number
  totalAmount: number
}

export default interface ITransactionRepository {
  create(data: CreateTransactionInput): Promise<Result<Transaction>>
  list(): Promise<Result<Transaction[]>>
  findById(id: number): Promise<Result<Transaction | null>>
  save(transaction: Transaction): Promise<Result<Transaction>>
  createItems(items: TransactionItemInput[]): Promise<Result<boolean>>
}
