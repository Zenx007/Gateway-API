import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'transactions'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('gateway_id').unsigned().nullable().references('id').inTable('gateways').onDelete('SET NULL')
      table.string('external_id', 255).nullable()
      table.string('status', 50).notNullable()
      table.integer('amount').notNullable()
      table.string('client_name', 160).notNullable()
      table.string('client_email', 255).notNullable()
      table.string('card_last_numbers', 4).notNullable()
      table.text('error_message').nullable()
      table.text('raw_response').nullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
