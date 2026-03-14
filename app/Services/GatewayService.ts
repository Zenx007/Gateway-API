import Gateway from 'App/Models/Gateway'
import GatewayRepository from 'App/Repositories/GatewayRepository'
import IGatewayRepository from 'App/Repositories/IGatewayRepository'
import { Result } from 'App/Helpers/Utils/Result'
import { GATEWAY_MESSAGES } from 'App/Helpers/ConstantsMessages/GatewayMessages'

export default class GatewayService {
  constructor(private readonly gatewayRepository: IGatewayRepository = new GatewayRepository()) {}

  public async list(): Promise<Result<Gateway[]>> {
    try {
      return await this.gatewayRepository.list()
    } catch (error) {
      return Result.Fail(GATEWAY_MESSAGES.INDEX_ERROR)
    }
  }

  public async updateActive(id: number, isActive: boolean): Promise<Result<Gateway | null>> {
    try {
      const idResult = this.validateId(id)
      if (idResult.isFailed) {
        return Result.Fail(idResult.errors)
      }

      const gatewayResult = await this.gatewayRepository.findById(id)
      if (gatewayResult.isFailed) {
        return Result.Fail(gatewayResult.errors)
      }

      const gateway = gatewayResult.value
      if (!gateway) {
        return Result.Fail(GATEWAY_MESSAGES.NOT_FOUND)
      }

      gateway.isActive = isActive
      const saveResult = await this.gatewayRepository.save(gateway)
      if (saveResult.isFailed) {
        return Result.Fail(saveResult.errors)
      }

      return Result.Ok(saveResult.value)
    } catch (error) {
      return Result.Fail(GATEWAY_MESSAGES.UPDATE_ERROR)
    }
  }

  public async updatePriority(id: number, priority: number): Promise<Result<Gateway | null>> {
    try {
      const idResult = this.validateId(id)
      if (idResult.isFailed) {
        return Result.Fail(idResult.errors)
      }

      if (!Number.isInteger(priority) || priority <= 0) {
        return Result.Fail(GATEWAY_MESSAGES.INVALID_PRIORITY)
      }

      const gatewayResult = await this.gatewayRepository.findById(id)
      if (gatewayResult.isFailed) {
        return Result.Fail(gatewayResult.errors)
      }

      const gateway = gatewayResult.value
      if (!gateway) {
        return Result.Fail(GATEWAY_MESSAGES.NOT_FOUND)
      }

      const currentByPriority = await this.gatewayRepository.findByPriority(priority)
      if (currentByPriority.isFailed) {
        return Result.Fail(currentByPriority.errors)
      }

      const gatewayWithRequestedPriority = currentByPriority.value

      if (gatewayWithRequestedPriority && gatewayWithRequestedPriority.id !== gateway.id) {
        const originalPriority = gateway.priority

        gateway.priority = priority
        gatewayWithRequestedPriority.priority = originalPriority

        const saveTargetResult = await this.gatewayRepository.save(gateway)
        if (saveTargetResult.isFailed) {
          return Result.Fail(saveTargetResult.errors)
        }

        const saveSwappedResult = await this.gatewayRepository.save(gatewayWithRequestedPriority)
        if (saveSwappedResult.isFailed) {
          return Result.Fail(saveSwappedResult.errors)
        }

        return Result.Ok(saveTargetResult.value)
      }

      gateway.priority = priority
      const saveResult = await this.gatewayRepository.save(gateway)
      if (saveResult.isFailed) {
        return Result.Fail(saveResult.errors)
      }

      return Result.Ok(saveResult.value)
    } catch (error) {
      return Result.Fail(GATEWAY_MESSAGES.UPDATE_ERROR)
    }
  }

  private validateId(id: number): Result<true> {
    try {
      if (!Number.isInteger(id) || id <= 0) {
        return Result.Fail(GATEWAY_MESSAGES.INVALID_ID)
      }

      return Result.Ok(true)
    } catch (error) {
      return Result.Fail(GATEWAY_MESSAGES.INVALID_ID)
    }
  }
}
