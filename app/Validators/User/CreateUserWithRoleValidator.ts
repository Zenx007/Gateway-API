import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { UserRole } from 'App/Enums/UserRole'
import { USER_MESSAGES } from 'App/Helpers/ConstantsMessages/UserMessages'

export default class CreateUserWithRoleValidator {
  public schema = schema.create({
    email: schema.string({ trim: true }, [rules.email()]),
    password: schema.string({}, [rules.minLength(8)]),
    role: schema.enum(Object.values(UserRole)),
  })

  public messages = {
    'email.required': USER_MESSAGES.REQUIRED_EMAIL,
    'email.email': USER_MESSAGES.INVALID_EMAIL,
    'password.required': USER_MESSAGES.REQUIRED_PASSWORD,
    'password.minLength': USER_MESSAGES.INVALID_PASSWORD_MIN_LENGTH,
    'role.required': USER_MESSAGES.ROLE_REQUIRED,
    'role.enum': USER_MESSAGES.INVALID_ROLE,
  }
}
