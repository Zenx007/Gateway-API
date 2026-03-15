import Transaction from 'App/Models/Transaction'
import Product from 'App/Models/Product'
import { Result } from 'App/Helpers/Utils/Result'
import { PAYMENT_MESSAGES } from 'App/Helpers/ConstantsMessages/PaymentMessages'
import { PRODUCT_MESSAGES } from 'App/Helpers/ConstantsMessages/ProductMessages'
import { PaymentChargeVO } from 'App/Communication/ViewObjects/Payment/PaymentChargeVO'
import GatewayRepository from 'App/Repositories/GatewayRepository'
import IGatewayRepository from 'App/Repositories/IGatewayRepository'
import ITransactionRepository from 'App/Repositories/ITransactionRepository'
import TransactionRepository from 'App/Repositories/TransactionRepository'
import IProductRepository from 'App/Repositories/IProductRepository'
import ProductRepository from 'App/Repositories/ProductRepository'
import IClientRepository from 'App/Repositories/IClientRepository'
import ClientRepository from 'App/Repositories/ClientRepository'
import PaymentGatewayClientFactory from 'App/Services/PaymentGateway/PaymentGatewayClientFactory'
import { TransactionStatus } from 'App/Enums/TransactionStatus'

type ResolvedItem = {
  productId: number
  quantity: number
  unitAmount: number
  totalAmount: number
}

type AuthenticatedClientData = {
  name: string
  email: string
}

export default class PaymentService {
  constructor(
    private readonly gatewayRepository: IGatewayRepository = new GatewayRepository(),
    private readonly transactionRepository: ITransactionRepository = new TransactionRepository(),
    private readonly productRepository: IProductRepository = new ProductRepository(),
    private readonly clientRepository: IClientRepository = new ClientRepository(),
    private readonly paymentGatewayFactory: PaymentGatewayClientFactory = new PaymentGatewayClientFactory()
  ) {}

  public async charge(model: PaymentChargeVO, clientData: AuthenticatedClientData): Promise<Result<Transaction>> {
    try {
      const resolvedItemsResult = await this.resolveItems(model)
      if (resolvedItemsResult.isFailed || !resolvedItemsResult.value) {
        return Result.Fail(resolvedItemsResult.errors)
      }

      const { items, amount } = resolvedItemsResult.value

      const clientResult = await this.clientRepository.upsertByEmail({
        name: clientData.name,
        email: clientData.email,
      })
      if (clientResult.isFailed || !clientResult.value) {
        return Result.Fail(clientResult.errors)
      }

      const gatewaysResult = await this.gatewayRepository.listActiveByPriority()
      if (gatewaysResult.isFailed) {
        return Result.Fail(gatewaysResult.errors)
      }

      const gateways = gatewaysResult.value ?? []
      if (gateways.length === 0) {
        return Result.Fail(PAYMENT_MESSAGES.NO_ACTIVE_GATEWAYS)
      }

      const gatewayErrors: string[] = []

      for (const gateway of gateways) {
        try {
          const gatewayClientResult = this.paymentGatewayFactory.create(gateway)
          if (gatewayClientResult.isFailed || !gatewayClientResult.value) {
            gatewayErrors.push(gatewayClientResult.errors[0] ?? PAYMENT_MESSAGES.UNSUPPORTED_GATEWAY)
            continue
          }

          const chargeResult = await gatewayClientResult.value.charge({
            amount,
            name: clientData.name,
            email: clientData.email,
            cardNumber: model.cardNumber,
            cvv: model.cvv,
          })

          if (chargeResult.isFailed) {
            gatewayErrors.push(chargeResult.errors[0] ?? PAYMENT_MESSAGES.CHARGE_ERROR)
            continue
          }

          const transactionResult = await this.transactionRepository.create({
            gatewayId: gateway.id,
            clientId: clientResult.value.id,
            externalId: chargeResult.value?.externalId ?? null,
            status: TransactionStatus.PAID,
            amount,
            clientName: clientData.name,
            clientEmail: clientData.email,
            cardLastNumbers: this.getCardLastNumbers(model.cardNumber),
            rawResponse: JSON.stringify(chargeResult.value?.rawResponse ?? {}),
            items,
          })

          if (transactionResult.isFailed) {
            return Result.Fail(transactionResult.errors)
          }

          return Result.Ok(transactionResult.value)
        } catch (error) {
          gatewayErrors.push(PAYMENT_MESSAGES.CHARGE_ERROR)
          continue
        }
      }

      const failedTransactionResult = await this.transactionRepository.create({
        gatewayId: null,
        clientId: clientResult.value.id,
        externalId: null,
        status: TransactionStatus.FAILED,
        amount,
        clientName: clientData.name,
        clientEmail: clientData.email,
        cardLastNumbers: this.getCardLastNumbers(model.cardNumber),
        errorMessage: gatewayErrors.join(' | ') || PAYMENT_MESSAGES.ALL_GATEWAYS_FAILED,
        rawResponse: JSON.stringify({ errors: gatewayErrors }),
        items,
      })

      if (failedTransactionResult.isFailed) {
        return Result.Fail(failedTransactionResult.errors)
      }

      return Result.Fail(PAYMENT_MESSAGES.ALL_GATEWAYS_FAILED)
    } catch (error) {
      return Result.Fail(PAYMENT_MESSAGES.CHARGE_ERROR)
    }
  }

  private getCardLastNumbers(cardNumber: string): string {
    return cardNumber.slice(-4)
  }

  private async resolveItems(model: PaymentChargeVO): Promise<Result<{ items: ResolvedItem[]; amount: number }>> {
    try {
      if (!Array.isArray(model.items) || model.items.length === 0) {
        return Result.Fail(PAYMENT_MESSAGES.INVALID_ITEMS)
      }

      const itemQuantities = new Map<number, number>()
      for (const item of model.items) {
        if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
          return Result.Fail(PRODUCT_MESSAGES.INVALID_QUANTITY)
        }

        itemQuantities.set(item.productId, (itemQuantities.get(item.productId) ?? 0) + item.quantity)
      }

      const productIds = Array.from(itemQuantities.keys())
      const productsResult = await this.productRepository.findByIds(productIds)
      if (productsResult.isFailed) {
        return Result.Fail(productsResult.errors)
      }

      const products = productsResult.value ?? []
      if (products.length !== productIds.length) {
        return Result.Fail(PAYMENT_MESSAGES.ITEM_NOT_FOUND)
      }

      const productsById = new Map<number, Product>()
      products.forEach((product) => productsById.set(product.id, product))

      let amount = 0
      const items: ResolvedItem[] = []

      for (const [productId, quantity] of itemQuantities.entries()) {
        const product = productsById.get(productId)
        if (!product) {
          return Result.Fail(PAYMENT_MESSAGES.ITEM_NOT_FOUND)
        }

        if (!product.isActive) {
          return Result.Fail(PRODUCT_MESSAGES.INACTIVE_PRODUCT)
        }

        const totalAmount = product.amount * quantity
        amount += totalAmount
        items.push({
          productId: product.id,
          quantity,
          unitAmount: product.amount,
          totalAmount,
        })
      }

      if (amount <= 0) {
        return Result.Fail(PAYMENT_MESSAGES.INVALID_ITEMS)
      }

      return Result.Ok({ items, amount })
    } catch (error) {
      return Result.Fail(PAYMENT_MESSAGES.CHARGE_ERROR)
    }
  }
}
