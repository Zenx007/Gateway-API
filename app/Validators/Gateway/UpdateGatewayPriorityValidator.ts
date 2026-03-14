import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { GATEWAY_MESSAGES } from 'App/Helpers/ConstantsMessages/GatewayMessages'

export default class UpdateGatewayPriorityValidator {
  public schema = schema.create({
    priority: schema.number([rules.unsigned()]),
  })

  public messages = {
    'priority.required': 'Prioridade é obrigatória',
    'priority.unsigned': GATEWAY_MESSAGES.INVALID_PRIORITY,
  }
}
