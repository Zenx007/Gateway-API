import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { USER_MESSAGES } from 'App/Helpers/ConstantsMessages/UserMessages'

export default class CreateUserValidator {
  public schema = schema.create({
    email: schema.string({ trim: true }, [rules.email()]),
    password: schema.string({}, [rules.minLength(8)]),
  })

  public messages = {
    'email.required': USER_MESSAGES.REQUIRED_EMAIL,
    'email.email': USER_MESSAGES.INVALID_EMAIL,
    'password.required': USER_MESSAGES.REQUIRED_PASSWORD,
    'password.minLength': USER_MESSAGES.INVALID_PASSWORD_MIN_LENGTH,
  }
}
