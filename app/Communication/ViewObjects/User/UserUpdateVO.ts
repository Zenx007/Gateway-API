import { UserRole } from 'App/Enums/UserRole'

type UserUpdatePayload = {
  email?: string
  password?: string
  role?: UserRole | string
}

export class UserUpdateVO {
  public email?: string
  public password?: string
  public role?: UserRole

  constructor(email?: string, password?: string, role?: UserRole) {
    this.email = email
    this.password = password
    this.role = role
  }

  public static fromPayload(payload: UserUpdatePayload): UserUpdateVO {
    return new UserUpdateVO(payload.email, payload.password, payload.role as UserRole)
  }
}
