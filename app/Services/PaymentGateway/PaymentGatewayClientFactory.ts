import { GatewayProvider } from 'App/Enums/GatewayProvider'
import Gateway from 'App/Models/Gateway'
import { Result } from 'App/Helpers/Utils/Result'
import { PAYMENT_MESSAGES } from 'App/Helpers/ConstantsMessages/PaymentMessages'
import IPaymentGatewayClient from 'App/Services/PaymentGateway/Contracts/IPaymentGatewayClient'
import Gateway1Client from 'App/Services/PaymentGateway/Clients/Gateway1Client'
import Gateway2Client from 'App/Services/PaymentGateway/Clients/Gateway2Client'

export default class PaymentGatewayClientFactory {
  public create(gateway: Gateway): Result<IPaymentGatewayClient> {
    switch (gateway.provider) {
      case GatewayProvider.GATEWAY_1:
        return Result.Ok(new Gateway1Client(gateway))
      case GatewayProvider.GATEWAY_2:
        return Result.Ok(new Gateway2Client(gateway))
      default:
        return Result.Fail(`${PAYMENT_MESSAGES.UNSUPPORTED_GATEWAY}: ${gateway.provider}`)
    }
  }
}
