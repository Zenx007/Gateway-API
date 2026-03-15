import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { PRODUCT_MESSAGES } from 'App/Helpers/ConstantsMessages/ProductMessages'

export default class CreatePaymentChargeValidator {
  public schema = schema.create({
    items: schema.array().members(
      schema.object().members({
        productId: schema.number([rules.unsigned()]),
        quantity: schema.number([rules.unsigned()]),
      })
    ),
    cardNumber: schema.string({}, [rules.regex(/^\d{16}$/)]),
    cvv: schema.string({}, [rules.regex(/^\d{3}$/)]),
  })

  public messages = {
    'items.required': 'Itens da compra são obrigatórios',
    'items.array': 'Itens devem ser enviados em formato de lista',
    'items.*.productId.required': 'ID do produto é obrigatório',
    'items.*.productId.unsigned': PRODUCT_MESSAGES.INVALID_ID,
    'items.*.quantity.required': 'Quantidade é obrigatória',
    'items.*.quantity.unsigned': PRODUCT_MESSAGES.INVALID_QUANTITY,
    'cardNumber.required': 'Número do cartão é obrigatório',
    'cardNumber.regex': 'Número do cartão deve conter 16 dígitos',
    'cvv.required': 'CVV é obrigatório',
    'cvv.regex': 'CVV deve conter 3 dígitos',
  }
}
