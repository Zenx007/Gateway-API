import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Env from '@ioc:Adonis/Core/Env'
import Gateway from 'App/Models/Gateway'
import { GatewayProvider } from 'App/Enums/GatewayProvider'

export default class extends BaseSeeder {
  public async run() {
    const gateways = [
      {
        name: 'Gateway 1',
        provider: GatewayProvider.GATEWAY_1,
        baseUrl: Env.get('GATEWAY_1_BASE_URL', 'http://localhost:3001'),
        isActive: true,
        priority: 1,
      },
      {
        name: 'Gateway 2',
        provider: GatewayProvider.GATEWAY_2,
        baseUrl: Env.get('GATEWAY_2_BASE_URL', 'http://localhost:3002'),
        isActive: true,
        priority: 2,
      },
    ]

    for (const gateway of gateways) {
      await Gateway.updateOrCreate({ provider: gateway.provider }, gateway)
    }
  }
}
