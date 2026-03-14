type ProductSavePayload = {
  name: string
  amount: number
}

export class ProductSaveVO {
  public name: string
  public amount: number

  constructor(name: string, amount: number) {
    this.name = name
    this.amount = amount
  }

  public static fromPayload(payload: ProductSavePayload): ProductSaveVO {
    return new ProductSaveVO(payload.name, payload.amount)
  }
}
