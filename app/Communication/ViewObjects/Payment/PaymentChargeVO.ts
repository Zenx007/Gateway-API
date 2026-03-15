type PaymentItemPayload = {
  productId: number
  quantity: number
}

type PaymentChargePayload = {
  items: PaymentItemPayload[]
  cardNumber: string
  cvv: string
}

export type PaymentItemVO = {
  productId: number
  quantity: number
}

export class PaymentChargeVO {
  public items: PaymentItemVO[]
  public cardNumber: string
  public cvv: string

  constructor(items: PaymentItemVO[], cardNumber: string, cvv: string) {
    this.items = items
    this.cardNumber = cardNumber
    this.cvv = cvv
  }

  public static fromPayload(payload: PaymentChargePayload): PaymentChargeVO {
    return new PaymentChargeVO(
      payload.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      payload.cardNumber,
      payload.cvv
    )
  }
}
