import { DateTime } from 'luxon'
import { BaseModel, belongsTo, BelongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Product from 'App/Models/Product'
import Transaction from 'App/Models/Transaction'

export default class TransactionProduct extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ columnName: 'transaction_id' })
  public transactionId: number

  @column({ columnName: 'product_id' })
  public productId: number

  @column()
  public quantity: number

  @column({ columnName: 'unit_amount' })
  public unitAmount: number

  @column({ columnName: 'total_amount' })
  public totalAmount: number

  @belongsTo(() => Transaction)
  public transaction: BelongsTo<typeof Transaction>

  @belongsTo(() => Product)
  public product: BelongsTo<typeof Product>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
