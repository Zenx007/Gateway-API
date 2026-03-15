import { DateTime } from 'luxon'
import { BaseModel, belongsTo, BelongsTo, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Gateway from 'App/Models/Gateway'
import Client from 'App/Models/Client'
import { TransactionStatus } from 'App/Enums/TransactionStatus'
import TransactionProduct from 'App/Models/TransactionProduct'

export default class Transaction extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ columnName: 'gateway_id' })
  public gatewayId: number | null

  @column({ columnName: 'client_id' })
  public clientId: number | null

  @column({ columnName: 'external_id' })
  public externalId: string | null

  @column()
  public status: TransactionStatus

  @column()
  public amount: number

  @column({ columnName: 'client_name' })
  public clientName: string

  @column({ columnName: 'client_email' })
  public clientEmail: string

  @column({ columnName: 'card_last_numbers' })
  public cardLastNumbers: string

  @column({ columnName: 'error_message' })
  public errorMessage: string | null

  @column({ columnName: 'raw_response' })
  public rawResponse: string | null

  @belongsTo(() => Gateway)
  public gateway: BelongsTo<typeof Gateway>

  @belongsTo(() => Client)
  public client: BelongsTo<typeof Client>

  @hasMany(() => TransactionProduct)
  public transactionProducts: HasMany<typeof TransactionProduct>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
