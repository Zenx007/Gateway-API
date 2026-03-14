import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { PRODUCT_MESSAGES } from 'App/Helpers/ConstantsMessages/ProductMessages'

export default class UpdateProductValidator {
  public schema = schema.create({
    name: schema.string.optional({ trim: true }),
    amount: schema.number.optional([rules.unsigned()]),
    isActive: schema.boolean.optional(),
  })

  public messages = {
    'amount.unsigned': PRODUCT_MESSAGES.INVALID_AMOUNT,
  }
}
