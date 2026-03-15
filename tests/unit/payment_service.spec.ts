import { test } from '@japa/runner'
import PaymentService from 'App/Services/PaymentService'
import { Result } from 'App/Helpers/Utils/Result'
import { GatewayProvider } from 'App/Enums/GatewayProvider'
import { TransactionStatus } from 'App/Enums/TransactionStatus'
import { PaymentChargeVO } from 'App/Communication/ViewObjects/Payment/PaymentChargeVO'
import type IGatewayRepository from 'App/Repositories/IGatewayRepository'
import type ITransactionRepository, {
  CreateTransactionInput,
  TransactionItemInput,
} from 'App/Repositories/ITransactionRepository'
import type IProductRepository from 'App/Repositories/IProductRepository'
import type IClientRepository from 'App/Repositories/IClientRepository'
import type Gateway from 'App/Models/Gateway'
import type Transaction from 'App/Models/Transaction'
import type Product from 'App/Models/Product'
import type Client from 'App/Models/Client'

class FakeGatewayRepository implements IGatewayRepository {
  constructor(private readonly gateways: Gateway[]) {}

  public async listActiveByPriority() {
    return Result.Ok(this.gateways)
  }

  public async findById(id: number) {
    return Result.Ok(this.gateways.find((gateway) => gateway.id === id) ?? null)
  }

  public async findByPriority(priority: number) {
    return Result.Ok(this.gateways.find((gateway) => gateway.priority === priority) ?? null)
  }

  public async save(gateway: Gateway) {
    return Result.Ok(gateway)
  }
}

class FakeProductRepository implements IProductRepository {
  constructor(private readonly products: Product[]) {}

  public async create() {
    throw new Error('Not implemented in test')
  }

  public async findById(id: number) {
    return Result.Ok(this.products.find((product) => product.id === id) ?? null)
  }

  public async findByIds(ids: number[]) {
    return Result.Ok(this.products.filter((product) => ids.includes(product.id)))
  }

  public async hasTransactionLinks() {
    return Result.Ok(false)
  }

  public async list() {
    return Result.Ok(this.products)
  }

  public async update() {
    throw new Error('Not implemented in test')
  }

  public async delete() {
    throw new Error('Not implemented in test')
  }
}

class FakeClientRepository implements IClientRepository {
  public async upsertByEmail(data: { name: string; email: string }) {
    return Result.Ok({
      id: 1,
      name: data.name,
      email: data.email,
    } as Client)
  }

  public async list() {
    throw new Error('Not implemented in test')
  }

  public async findByIdWithTransactions() {
    throw new Error('Not implemented in test')
  }
}

class FakeTransactionRepository implements ITransactionRepository {
  public lastCreateInput: CreateTransactionInput | null = null

  public async create(data: CreateTransactionInput) {
    this.lastCreateInput = data
    return Result.Ok({
      id: 1,
      gatewayId: data.gatewayId,
      clientId: data.clientId,
      externalId: data.externalId,
      status: data.status,
      amount: data.amount,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      cardLastNumbers: data.cardLastNumbers,
    } as Transaction)
  }

  public async list() {
    return Result.Ok([])
  }

  public async findById() {
    return Result.Ok(null)
  }

  public async save(transaction: Transaction) {
    return Result.Ok(transaction)
  }

  public async createItems(_items: TransactionItemInput[]) {
    return Result.Ok(true)
  }
}

class FakeGatewayClientFactory {
  public attempts: string[] = []

  public create(gateway: Gateway) {
    if (gateway.provider === GatewayProvider.GATEWAY_1) {
      return Result.Ok({
        charge: async () => {
          this.attempts.push('gateway_1')
          return Result.Fail('Erro gateway 1')
        },
        refund: async () => Result.Ok({ rawResponse: {} }),
      })
    }

    return Result.Ok({
      charge: async () => {
        this.attempts.push('gateway_2')
        return Result.Ok({ externalId: 'ext-2', rawResponse: { ok: true } })
      },
      refund: async () => Result.Ok({ rawResponse: {} }),
    })
  }
}

test.group('PaymentService', () => {
  test('deve calcular valor por produto/quantidade e aplicar fallback entre gateways', async ({
    assert,
  }) => {
    const gateways = [
      {
        id: 1,
        provider: GatewayProvider.GATEWAY_1,
        priority: 1,
        isActive: true,
      } as Gateway,
      {
        id: 2,
        provider: GatewayProvider.GATEWAY_2,
        priority: 2,
        isActive: true,
      } as Gateway,
    ]

    const products = [
      { id: 1, amount: 1500, isActive: true } as Product,
      { id: 2, amount: 2500, isActive: true } as Product,
    ]

    const gatewayRepository = new FakeGatewayRepository(gateways)
    const transactionRepository = new FakeTransactionRepository()
    const productRepository = new FakeProductRepository(products)
    const clientRepository = new FakeClientRepository()
    const factory = new FakeGatewayClientFactory()

    const service = new PaymentService(
      gatewayRepository,
      transactionRepository,
      productRepository,
      clientRepository,
      factory as any
    )

    const model = new PaymentChargeVO(
      [
        { productId: 1, quantity: 2 },
        { productId: 2, quantity: 1 },
      ],
      '5569000000006063',
      '010'
    )

    const result = await service.charge(model, {
      name: 'Cliente Teste',
      email: 'cliente@teste.com',
    })

    assert.isTrue(result.isSuccess)
    assert.deepEqual(factory.attempts, ['gateway_1', 'gateway_2'])
    assert.equal(transactionRepository.lastCreateInput?.amount, 5500)
    assert.equal(transactionRepository.lastCreateInput?.status, TransactionStatus.PAID)
    assert.equal(transactionRepository.lastCreateInput?.items?.length, 2)
  })

  test('deve falhar quando produto nao existe', async ({ assert }) => {
    const gateways = [
      {
        id: 1,
        provider: GatewayProvider.GATEWAY_1,
        priority: 1,
        isActive: true,
      } as Gateway,
    ]

    const gatewayRepository = new FakeGatewayRepository(gateways)
    const transactionRepository = new FakeTransactionRepository()
    const productRepository = new FakeProductRepository([])
    const clientRepository = new FakeClientRepository()
    const factory = new FakeGatewayClientFactory()

    const service = new PaymentService(
      gatewayRepository,
      transactionRepository,
      productRepository,
      clientRepository,
      factory as any
    )

    const model = new PaymentChargeVO([{ productId: 99, quantity: 1 }], '5569000000006063', '010')

    const result = await service.charge(model, {
      name: 'Cliente Teste',
      email: 'cliente@teste.com',
    })

    assert.isTrue(result.isFailed)
    assert.equal(result.errors[0], 'Um ou mais produtos não foram encontrados')
  })
})
