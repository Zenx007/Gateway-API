import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { PRODUCT_MESSAGES } from 'App/Helpers/ConstantsMessages/ProductMessages'

export default class CreateProductValidator {
  public schema = schema.create({
    name: schema.string({ trim: true }),
    amount: schema.number([rules.unsigned()]),
  })

  public messages = {
    'name.required': 'Nome do produto é obrigatório',
    'amount.required': 'Valor do produto é obrigatório',
    'amount.unsigned': PRODUCT_MESSAGES.INVALID_AMOUNT,
  }
}
