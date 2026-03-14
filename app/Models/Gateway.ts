import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Transaction from 'App/Models/Transaction'
import { GatewayProvider } from 'App/Enums/GatewayProvider'

export default class Gateway extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public provider: GatewayProvider

  @column({ columnName: 'base_url' })
  public baseUrl: string

  @column({ columnName: 'is_active' })
  public isActive: boolean

  @column()
  public priority: number

  @hasMany(() => Transaction)
  public transactions: HasMany<typeof Transaction>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
