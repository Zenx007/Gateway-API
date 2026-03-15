import Transaction from 'App/Models/Transaction'
import TransactionRepository from 'App/Repositories/TransactionRepository'
import ITransactionRepository from 'App/Repositories/ITransactionRepository'
import GatewayRepository from 'App/Repositories/GatewayRepository'
import IGatewayRepository from 'App/Repositories/IGatewayRepository'
import PaymentGatewayClientFactory from 'App/Services/PaymentGateway/PaymentGatewayClientFactory'
import { Result } from 'App/Helpers/Utils/Result'
import { TransactionStatus } from 'App/Enums/TransactionStatus'
import { TRANSACTION_MESSAGES } from 'App/Helpers/ConstantsMessages/TransactionMessages'
import Gateway from 'App/Models/Gateway'

export default class TransactionService {
  constructor(
    private readonly transactionRepository: ITransactionRepository = new TransactionRepository(),
    private readonly gatewayRepository: IGatewayRepository = new GatewayRepository(),
    private readonly paymentGatewayFactory: PaymentGatewayClientFactory = new PaymentGatewayClientFactory()
  ) {}

  public async list(): Promise<Result<Transaction[]>> {
    try {
      return await this.transactionRepository.list()
    } catch (error) {
      return Result.Fail(TRANSACTION_MESSAGES.INDEX_ERROR)
    }
  }

  public async findById(id: number): Promise<Result<Transaction | null>> {
    try {
      if (!Number.isInteger(id) || id <= 0) {
        return Result.Fail(TRANSACTION_MESSAGES.INVALID_ID)
      }

      const result = await this.transactionRepository.findById(id)
      if (result.isFailed) {
        return Result.Fail(result.errors)
      }

      if (!result.value) {
        return Result.Fail(TRANSACTION_MESSAGES.NOT_FOUND)
      }

      return Result.Ok(result.value)
    } catch (error) {
      return Result.Fail(TRANSACTION_MESSAGES.SHOW_ERROR)
    }
  }

  public async refund(id: number): Promise<Result<Transaction | null>> {
    try {
      if (!Number.isInteger(id) || id <= 0) {
        return Result.Fail(TRANSACTION_MESSAGES.INVALID_ID)
      }

      const transactionResult = await this.transactionRepository.findById(id)
      if (transactionResult.isFailed) {
        return Result.Fail(transactionResult.errors)
      }

      const transaction = transactionResult.value
      if (!transaction) {
        return Result.Fail(TRANSACTION_MESSAGES.NOT_FOUND)
      }

      if (transaction.status !== TransactionStatus.PAID) {
        return Result.Fail(TRANSACTION_MESSAGES.INVALID_REFUND_STATUS)
      }

      if (!transaction.gatewayId || !transaction.externalId) {
        return Result.Fail(TRANSACTION_MESSAGES.INVALID_REFUND_STATUS)
      }

      const gatewaysResult = await this.resolveRefundGateways(transaction.gatewayId)
      if (gatewaysResult.isFailed || !gatewaysResult.value || gatewaysResult.value.length === 0) {
        return Result.Fail(gatewaysResult.errors)
      }

      const gateways = gatewaysResult.value
      const refundErrors: string[] = []

      for (const gateway of gateways) {
        const clientFactoryResult = this.paymentGatewayFactory.create(gateway)
        if (clientFactoryResult.isFailed || !clientFactoryResult.value) {
          refundErrors.push(clientFactoryResult.errors[0] ?? TRANSACTION_MESSAGES.REFUND_ERROR)
          continue
        }

        const refundResult = await clientFactoryResult.value.refund(transaction.externalId)
        if (refundResult.isFailed) {
          refundErrors.push(refundResult.errors[0] ?? TRANSACTION_MESSAGES.REFUND_ERROR)
          continue
        }

        transaction.status = TransactionStatus.REFUNDED
        transaction.rawResponse = JSON.stringify({
          previousRawResponse: transaction.rawResponse,
          refundGateway: {
            id: gateway.id,
            provider: gateway.provider,
            priority: gateway.priority,
          },
          refundRawResponse: refundResult.value?.rawResponse ?? null,
        })
        transaction.errorMessage = null

        const saveResult = await this.transactionRepository.save(transaction)
        if (saveResult.isFailed) {
          return Result.Fail(saveResult.errors)
        }

        return Result.Ok(saveResult.value)
      }

      return Result.Fail(
        refundErrors.length > 0
          ? `${TRANSACTION_MESSAGES.REFUND_ALL_GATEWAYS_FAILED}: ${refundErrors.join(' | ')}`
          : TRANSACTION_MESSAGES.REFUND_ALL_GATEWAYS_FAILED
      )
    } catch (error) {
      return Result.Fail(TRANSACTION_MESSAGES.REFUND_ERROR)
    }
  }

  private async resolveRefundGateways(originalGatewayId: number): Promise<Result<Gateway[]>> {
    try {
      const ordered: Gateway[] = []
      const added = new Set<number>()

      const originalGatewayResult = await this.gatewayRepository.findById(originalGatewayId)
      if (originalGatewayResult.isFailed) {
        return Result.Fail(originalGatewayResult.errors)
      }

      const originalGateway = originalGatewayResult.value
      if (originalGateway) {
        ordered.push(originalGateway)
        added.add(originalGateway.id)
      }

      const activeGatewaysResult = await this.gatewayRepository.listActiveByPriority()
      if (activeGatewaysResult.isFailed) {
        return Result.Fail(activeGatewaysResult.errors)
      }

      const activeGateways = activeGatewaysResult.value ?? []
      for (const gateway of activeGateways) {
        if (!added.has(gateway.id)) {
          ordered.push(gateway)
          added.add(gateway.id)
        }
      }

      if (ordered.length === 0) {
        return Result.Fail(TRANSACTION_MESSAGES.INVALID_REFUND_STATUS)
      }

      return Result.Ok(ordered)
    } catch (error) {
      return Result.Fail(TRANSACTION_MESSAGES.REFUND_ERROR)
    }
  }
}
