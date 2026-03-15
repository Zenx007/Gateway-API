import { Result } from 'App/Helpers/Utils/Result'

export type GatewayChargeInput = {
  amount: number
  name: string
  email: string
  cardNumber: string
  cvv: string
}

export type GatewayChargeOutput = {
  externalId: string | null
  rawResponse: unknown
}

export type GatewayRefundOutput = {
  rawResponse: unknown
}

export default interface IPaymentGatewayClient {
  charge(input: GatewayChargeInput): Promise<Result<GatewayChargeOutput>>
  refund(externalId: string): Promise<Result<GatewayRefundOutput>>
}
