import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { USER_MESSAGES } from 'App/Helpers/ConstantsMessages/UserMessages'

export default class UpdateUserValidator {
  public schema = schema.create({
    email: schema.string.optional({ trim: true }, [rules.email()]),
    password: schema.string.optional({}, [rules.minLength(8)]),
  })

  public messages = {
    'email.email': USER_MESSAGES.INVALID_EMAIL,
    'password.minLength': USER_MESSAGES.INVALID_PASSWORD_MIN_LENGTH,
  }
}
