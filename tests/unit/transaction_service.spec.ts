import { test } from '@japa/runner'
import TransactionService from 'App/Services/TransactionService'
import type ITransactionRepository, {
  CreateTransactionInput,
  TransactionItemInput,
} from 'App/Repositories/ITransactionRepository'
import type IGatewayRepository from 'App/Repositories/IGatewayRepository'
import Transaction from 'App/Models/Transaction'
import Gateway from 'App/Models/Gateway'
import { Result } from 'App/Helpers/Utils/Result'
import { TransactionStatus } from 'App/Enums/TransactionStatus'
import { TRANSACTION_MESSAGES } from 'App/Helpers/ConstantsMessages/TransactionMessages'
import { GatewayProvider } from 'App/Enums/GatewayProvider'

class FakeTransactionRepository implements ITransactionRepository {
  public saveCalls = 0

  constructor(private transaction: Transaction | null) {}

  public async create(_data: CreateTransactionInput) {
    throw new Error('Not implemented in test')
  }

  public async list() {
    return Result.Ok([])
  }

  public async findById(_id: number) {
    return Result.Ok(this.transaction)
  }

  public async save(transaction: Transaction) {
    this.saveCalls += 1
    this.transaction = transaction
    return Result.Ok(transaction)
  }

  public async createItems(_items: TransactionItemInput[]) {
    return Result.Ok(true)
  }
}

class FakeGatewayRepository implements IGatewayRepository {
  constructor(private readonly gateway: Gateway | null) {}

  public async list() {
    return Result.Ok(this.gateway ? [this.gateway] : [])
  }

  public async listActiveByPriority() {
    return Result.Ok(this.gateway ? [this.gateway] : [])
  }

  public async findById(_id: number) {
    return Result.Ok(this.gateway)
  }

  public async findByPriority(_priority: number) {
    return Result.Ok(this.gateway)
  }

  public async save(gateway: Gateway) {
    return Result.Ok(gateway)
  }
}

class FakePaymentGatewayClientFactory {
  public refundCalls = 0
  public lastExternalId: string | null = null

  public create(_gateway: Gateway) {
    return Result.Ok({
      charge: async () => Result.Fail('Not implemented in test'),
      refund: async (externalId: string) => {
        this.refundCalls += 1
        this.lastExternalId = externalId
        return Result.Ok({ rawResponse: { refunded: true } })
      },
    })
  }
}

test.group('TransactionService', () => {
  test('deve falhar quando ID de reembolso for inválido', async ({ assert }) => {
    const transactionRepository = new FakeTransactionRepository(null)
    const gatewayRepository = new FakeGatewayRepository(null)
    const clientFactory = new FakePaymentGatewayClientFactory()
    const service = new TransactionService(
      transactionRepository,
      gatewayRepository,
      clientFactory as any
    )

    const result = await service.refund(0)

    assert.isTrue(result.isFailed)
    assert.equal(result.errors[0], TRANSACTION_MESSAGES.INVALID_ID)
  })

  test('deve falhar quando compra não estiver paga', async ({ assert }) => {
    const transactionRepository = new FakeTransactionRepository({
      id: 1,
      gatewayId: 1,
      externalId: 'ext-1',
      status: TransactionStatus.FAILED,
      amount: 1000,
      clientName: 'Cliente Teste',
      clientEmail: 'cliente@teste.com',
      cardLastNumbers: '6063',
      rawResponse: '{}',
      errorMessage: 'Erro de pagamento',
    } as Transaction)

    const gatewayRepository = new FakeGatewayRepository({
      id: 1,
      name: 'Gateway 1',
      provider: GatewayProvider.GATEWAY_1,
      baseUrl: 'http://localhost:3001',
      isActive: true,
      priority: 1,
    } as Gateway)

    const clientFactory = new FakePaymentGatewayClientFactory()
    const service = new TransactionService(
      transactionRepository,
      gatewayRepository,
      clientFactory as any
    )

    const result = await service.refund(1)

    assert.isTrue(result.isFailed)
    assert.equal(result.errors[0], TRANSACTION_MESSAGES.INVALID_REFUND_STATUS)
    assert.equal(clientFactory.refundCalls, 0)
  })

  test('deve realizar reembolso quando compra estiver paga', async ({ assert }) => {
    const transactionRepository = new FakeTransactionRepository({
      id: 10,
      gatewayId: 2,
      clientId: 1,
      externalId: 'ext-paid-001',
      status: TransactionStatus.PAID,
      amount: 5500,
      clientName: 'Cliente Teste',
      clientEmail: 'cliente@teste.com',
      cardLastNumbers: '6063',
      rawResponse: '{"payment":"ok"}',
      errorMessage: null,
    } as Transaction)

    const gatewayRepository = new FakeGatewayRepository({
      id: 2,
      name: 'Gateway 2',
      provider: GatewayProvider.GATEWAY_2,
      baseUrl: 'http://localhost:3002',
      isActive: true,
      priority: 2,
    } as Gateway)

    const clientFactory = new FakePaymentGatewayClientFactory()
    const service = new TransactionService(
      transactionRepository,
      gatewayRepository,
      clientFactory as any
    )

    const result = await service.refund(10)

    assert.isTrue(result.isSuccess)
    assert.equal(result.value?.status, TransactionStatus.REFUNDED)
    assert.equal(result.value?.errorMessage, null)
    assert.equal(clientFactory.refundCalls, 1)
    assert.equal(clientFactory.lastExternalId, 'ext-paid-001')
    assert.equal(transactionRepository.saveCalls, 1)
  })
})
