type LoginPayload = {
  email: string
  password: string
}

export class LoginVO {
  public email: string
  public password: string

  constructor(email: string, password: string) {
    this.email = email
    this.password = password
  }

  public static fromPayload(payload: LoginPayload): LoginVO {
    return new LoginVO(payload.email, payload.password)
  }
}
