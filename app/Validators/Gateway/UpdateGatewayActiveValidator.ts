import { schema } from '@ioc:Adonis/Core/Validator'

export default class UpdateGatewayActiveValidator {
  public schema = schema.create({
    isActive: schema.boolean(),
  })

  public messages = {
    'isActive.required': 'Campo isActive é obrigatório',
  }
}
