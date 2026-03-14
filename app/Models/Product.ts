import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import TransactionProduct from 'App/Models/TransactionProduct'

export default class Product extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public amount: number

  @column({ columnName: 'is_active' })
  public isActive: boolean

  @hasMany(() => TransactionProduct)
  public transactionProducts: HasMany<typeof TransactionProduct>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
