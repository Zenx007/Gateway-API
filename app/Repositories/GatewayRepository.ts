import Gateway from 'App/Models/Gateway'
import { Result } from 'App/Helpers/Utils/Result'
import { PAYMENT_MESSAGES } from 'App/Helpers/ConstantsMessages/PaymentMessages'
import IGatewayRepository from 'App/Repositories/IGatewayRepository'

export default class GatewayRepository implements IGatewayRepository {
  public async list(): Promise<Result<Gateway[]>> {
    try {
      const gateways = await Gateway.query().orderBy('priority', 'asc')
      return Result.Ok(gateways)
    } catch (error) {
      return Result.Fail(PAYMENT_MESSAGES.CHARGE_ERROR)
    }
  }

  public async listActiveByPriority(): Promise<Result<Gateway[]>> {
    try {
      const gateways = await Gateway.query().where('is_active', true).orderBy('priority', 'asc')
      return Result.Ok(gateways)
    } catch (error) {
      return Result.Fail(PAYMENT_MESSAGES.CHARGE_ERROR)
    }
  }

  public async findById(id: number): Promise<Result<Gateway | null>> {
    try {
      const gateway = await Gateway.find(id)
      return Result.Ok(gateway)
    } catch (error) {
      return Result.Fail(PAYMENT_MESSAGES.CHARGE_ERROR)
    }
  }

  public async findByPriority(priority: number): Promise<Result<Gateway | null>> {
    try {
      const gateway = await Gateway.query().where('priority', priority).first()
      return Result.Ok(gateway)
    } catch (error) {
      return Result.Fail(PAYMENT_MESSAGES.CHARGE_ERROR)
    }
  }

  public async save(gateway: Gateway): Promise<Result<Gateway>> {
    try {
      await gateway.save()
      return Result.Ok(gateway)
    } catch (error) {
      return Result.Fail(PAYMENT_MESSAGES.CHARGE_ERROR)
    }
  }
}
