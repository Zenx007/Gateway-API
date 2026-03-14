type ProductUpdatePayload = {
  name?: string
  amount?: number
  isActive?: boolean
}

export class ProductUpdateVO {
  public name?: string
  public amount?: number
  public isActive?: boolean

  constructor(name?: string, amount?: number, isActive?: boolean) {
    this.name = name
    this.amount = amount
    this.isActive = isActive
  }

  public static fromPayload(payload: ProductUpdatePayload): ProductUpdateVO {
    return new ProductUpdateVO(payload.name, payload.amount, payload.isActive)
  }
}
