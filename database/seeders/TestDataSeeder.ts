import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Env from '@ioc:Adonis/Core/Env'
import User from 'App/Models/User'
import Gateway from 'App/Models/Gateway'
import Product from 'App/Models/Product'
import Client from 'App/Models/Client'
import Transaction from 'App/Models/Transaction'
import TransactionProduct from 'App/Models/TransactionProduct'
import { UserRole } from 'App/Enums/UserRole'
import { GatewayProvider } from 'App/Enums/GatewayProvider'
import { TransactionStatus } from 'App/Enums/TransactionStatus'
import { AUTH_DEFAULTS } from 'App/Helpers/Constants/AuthDefaults'

export default class extends BaseSeeder {
  public async run() {
    await User.updateOrCreate(
      { email: AUTH_DEFAULTS.ADMIN_EMAIL },
      {
        email: AUTH_DEFAULTS.ADMIN_EMAIL,
        password: AUTH_DEFAULTS.ADMIN_PASSWORD,
        role: UserRole.ADMIN,
      }
    )

    await User.updateOrCreate(
      { email: 'manager@gatewayapi.local' },
      {
        email: 'manager@gatewayapi.local',
        password: '12345678',
        role: UserRole.MANAGER,
      }
    )

    await User.updateOrCreate(
      { email: 'finance@gatewayapi.local' },
      {
        email: 'finance@gatewayapi.local',
        password: '12345678',
        role: UserRole.FINANCE,
      }
    )

    const gateway1 = await Gateway.updateOrCreate(
      { provider: GatewayProvider.GATEWAY_1 },
      {
        name: 'Gateway 1',
        provider: GatewayProvider.GATEWAY_1,
        baseUrl: Env.get('GATEWAY_1_BASE_URL', 'http://localhost:3001'),
        isActive: true,
        priority: 1,
      }
    )

    const gateway2 = await Gateway.updateOrCreate(
      { provider: GatewayProvider.GATEWAY_2 },
      {
        name: 'Gateway 2',
        provider: GatewayProvider.GATEWAY_2,
        baseUrl: Env.get('GATEWAY_2_BASE_URL', 'http://localhost:3002'),
        isActive: true,
        priority: 2,
      }
    )

    const productA = await Product.updateOrCreate(
      { name: 'Produto A' },
      { name: 'Produto A', amount: 1500, isActive: true }
    )

    const productB = await Product.updateOrCreate(
      { name: 'Produto B' },
      { name: 'Produto B', amount: 2500, isActive: true }
    )

    const client1 = await Client.updateOrCreate(
      { email: 'cliente1@teste.com' },
      { name: 'Cliente Teste 1', email: 'cliente1@teste.com' }
    )

    const client2 = await Client.updateOrCreate(
      { email: 'cliente2@teste.com' },
      { name: 'Cliente Teste 2', email: 'cliente2@teste.com' }
    )

    const transactionPaid = await Transaction.query()
      .where('external_id', 'demo-ext-paid-001')
      .andWhere('client_email', client1.email)
      .first()

    if (!transactionPaid) {
      const createdPaid = await Transaction.create({
        gatewayId: gateway1.id,
        clientId: client1.id,
        externalId: 'demo-ext-paid-001',
        status: TransactionStatus.PAID,
        amount: 5500,
        clientName: client1.name,
        clientEmail: client1.email,
        cardLastNumbers: '6063',
        errorMessage: null,
        rawResponse: JSON.stringify({ seededBy: 'TestDataSeeder' }),
      })

      await TransactionProduct.createMany([
        {
          transactionId: createdPaid.id,
          productId: productA.id,
          quantity: 2,
          unitAmount: productA.amount,
          totalAmount: productA.amount * 2,
        },
        {
          transactionId: createdPaid.id,
          productId: productB.id,
          quantity: 1,
          unitAmount: productB.amount,
          totalAmount: productB.amount,
        },
      ])
    }

    const transactionFailed = await Transaction.query()
      .where('external_id', 'demo-ext-failed-001')
      .andWhere('client_email', client2.email)
      .first()

    if (!transactionFailed) {
      const createdFailed = await Transaction.create({
        gatewayId: gateway2.id,
        clientId: client2.id,
        externalId: 'demo-ext-failed-001',
        status: TransactionStatus.FAILED,
        amount: 2500,
        clientName: client2.name,
        clientEmail: client2.email,
        cardLastNumbers: '9999',
        errorMessage: 'Falha simulada de pagamento',
        rawResponse: JSON.stringify({ seededBy: 'TestDataSeeder' }),
      })

      await TransactionProduct.create({
        transactionId: createdFailed.id,
        productId: productB.id,
        quantity: 1,
        unitAmount: productB.amount,
        totalAmount: productB.amount,
      })
    }

  }
}
