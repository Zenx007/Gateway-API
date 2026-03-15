import Env from '@ioc:Adonis/Core/Env'
import Gateway from 'App/Models/Gateway'
import { Result } from 'App/Helpers/Utils/Result'
import IPaymentGatewayClient, {
  GatewayChargeInput,
  GatewayChargeOutput,
  GatewayRefundOutput,
} from 'App/Services/PaymentGateway/Contracts/IPaymentGatewayClient'

export default class Gateway1Client implements IPaymentGatewayClient {
  constructor(private readonly gateway: Gateway) {}

  public async charge(input: GatewayChargeInput): Promise<Result<GatewayChargeOutput>> {
    try {
      const tokenResult = await this.authenticate()
      if (tokenResult.isFailed) {
        return Result.Fail(tokenResult.errors)
      }

      const response = await fetch(`${this.gateway.baseUrl}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenResult.value}`,
        },
        body: JSON.stringify({
          amount: input.amount,
          name: input.name,
          email: input.email,
          cardNumber: input.cardNumber,
          cvv: input.cvv,
        }),
      })

      const payload = await this.safeJson(response)

      if (!response.ok) {
        return Result.Fail(this.extractError(payload, 'Falha no Gateway 1'))
      }

      return Result.Ok({
        externalId: this.extractExternalId(payload),
        rawResponse: payload,
      })
    } catch (error) {
      return Result.Fail('Falha no Gateway 1')
    }
  }

  public async refund(externalId: string): Promise<Result<GatewayRefundOutput>> {
    try {
      const tokenResult = await this.authenticate()
      if (tokenResult.isFailed) {
        return Result.Fail(tokenResult.errors)
      }

      const response = await fetch(`${this.gateway.baseUrl}/transactions/${externalId}/charge_back`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenResult.value}`,
        },
      })

      const payload = await this.safeJson(response)
      if (!response.ok || this.hasPayloadError(payload)) {
        return Result.Fail(this.extractError(payload, 'Falha no reembolso do Gateway 1'))
      }

      return Result.Ok({ rawResponse: payload })
    } catch (error) {
      return Result.Fail('Falha no reembolso do Gateway 1')
    }
  }

  private async authenticate(): Promise<Result<string>> {
    try {
      const loginEmail = Env.get('GATEWAY_1_LOGIN_EMAIL', 'dev@betalent.tech')
      const loginToken = Env.get('GATEWAY_1_LOGIN_TOKEN', 'FEC9BB078BF338F464F96B48089EB498')

      const response = await fetch(`${this.gateway.baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginEmail,
          token: loginToken,
        }),
      })

      const payload = await this.safeJson(response)

      if (!response.ok) {
        return Result.Fail(this.extractError(payload, 'Falha de autenticação no Gateway 1'))
      }

      const token = typeof payload?.token === 'string' ? payload.token : loginToken
      return Result.Ok(token)
    } catch (error) {
      return Result.Fail('Falha de autenticação no Gateway 1')
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

    return payload.id ?? payload.transactionId ?? null
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
