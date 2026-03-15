import Env from '@ioc:Adonis/Core/Env'
import Gateway from 'App/Models/Gateway'
import { Result } from 'App/Helpers/Utils/Result'
import IPaymentGatewayClient, {
  GatewayChargeInput,
  GatewayChargeOutput,
  GatewayRefundOutput,
} from 'App/Services/PaymentGateway/Contracts/IPaymentGatewayClient'

export default class Gateway2Client implements IPaymentGatewayClient {
  constructor(private readonly gateway: Gateway) {}

  public async charge(input: GatewayChargeInput): Promise<Result<GatewayChargeOutput>> {
    try {
      const response = await fetch(`${this.gateway.baseUrl}/transacoes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Gateway-Auth-Token': Env.get('GATEWAY_2_AUTH_TOKEN', 'tk_f2198cc671b5289fa856'),
          'Gateway-Auth-Secret': Env.get('GATEWAY_2_AUTH_SECRET', '3d15e8ed6131446ea7e3456728b1211f'),
        },
        body: JSON.stringify({
          valor: input.amount,
          nome: input.name,
          email: input.email,
          numeroCartao: input.cardNumber,
          cvv: input.cvv,
        }),
      })

      const payload = await this.safeJson(response)
      if (!response.ok) {
        return Result.Fail(this.extractError(payload, 'Falha no Gateway 2'))
      }

      return Result.Ok({
        externalId: this.extractExternalId(payload),
        rawResponse: payload,
      })
    } catch (error) {
      return Result.Fail('Falha no Gateway 2')
    }
  }

  public async refund(externalId: string): Promise<Result<GatewayRefundOutput>> {
    try {
      const response = await fetch(`${this.gateway.baseUrl}/transacoes/reembolso`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Gateway-Auth-Token': Env.get('GATEWAY_2_AUTH_TOKEN', 'tk_f2198cc671b5289fa856'),
          'Gateway-Auth-Secret': Env.get('GATEWAY_2_AUTH_SECRET', '3d15e8ed6131446ea7e3456728b1211f'),
        },
        body: JSON.stringify({
          id: externalId,
        }),
      })

      const payload = await this.safeJson(response)
      if (!response.ok || this.hasPayloadError(payload)) {
        return Result.Fail(this.extractError(payload, 'Falha no reembolso do Gateway 2'))
      }

      return Result.Ok({ rawResponse: payload })
    } catch (error) {
      return Result.Fail('Falha no reembolso do Gateway 2')
    }
  }

  private async safeJson(response: Response): Promise<any> {
    try {
      return await response.json()
    } catch {
      return null
    }
  }

  private extractExternalId(payload: any): string | null {
    if (!payload || typeof payload !== 'object') {
      return null
    }

    return payload.id ?? payload.transactionId ?? payload.transacaoId ?? null
  }

  private extractError(payload: any, fallback: string): string {
    if (!payload || typeof payload !== 'object') {
      return fallback
    }

    return payload.message ?? payload.error ?? fallback
  }

  private hasPayloadError(payload: any): boolean {
    if (!payload || typeof payload !== 'object') {
      return false
    }

    if (typeof payload.error === 'string' && payload.error.trim().length > 0) {
      return true
    }

    if (typeof payload.statusCode === 'number' && payload.statusCode >= 400) {
      return true
    }

    return false
  }
}
