type UserSavePayload = {
  email?: string
  password?: string
}

export class UserSaveVO {
  public email: string
  public password: string

  constructor(email: string, password: string) {
    this.email = email
    this.password = password
  }

  public static fromPayload(payload: UserSavePayload): UserSaveVO {
    return new UserSaveVO(payload.email ?? '', payload.password ?? '')
  }
}
