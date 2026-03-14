import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import GatewayService from 'App/Services/GatewayService'
import { ApiResponse } from 'App/Helpers/CustomObjects/ApiResponse'
import { GATEWAY_MESSAGES } from 'App/Helpers/ConstantsMessages/GatewayMessages'

export default class GatewaysController {
  private readonly gatewayService = new GatewayService()

  private resolveValidationMessage(error: any, fallback: string): string {
    const firstValidationMessage = error?.messages?.errors?.[0]?.message
    if (typeof firstValidationMessage === 'string' && firstValidationMessage.trim().length > 0) {
      return firstValidationMessage
    }

    return fallback
  }

  private getFirstDefinedValue(source: Record<string, any>, keys: string[]): any {
    for (const key of keys) {
      if (typeof source[key] !== 'undefined') {
        return source[key]
      }
    }

    return undefined
  }

  private parseBooleanLike(value: any): boolean | null {
    if (typeof value === 'boolean') {
      return value
    }

    if (typeof value === 'number') {
      if (value === 1) {
        return true
      }

      if (value === 0) {
        return false
      }
    }

    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase()
      if (['true', '1', 'yes', 'sim'].includes(normalized)) {
        return true
      }

      if (['false', '0', 'no', 'nao', 'não'].includes(normalized)) {
        return false
      }
    }

    return null
  }

  private parseIntegerLike(value: any): number | null {
    if (typeof value === 'number' && Number.isInteger(value)) {
      return value
    }

    if (typeof value === 'string' && value.trim().length > 0) {
      const numeric = Number(value.trim())
      if (Number.isInteger(numeric)) {
        return numeric
      }
    }

    return null
  }

  /**
   * @index
   * @summary Lista todos os gateways
   */
  public async index({ response }: HttpContextContract) {
    const apiResponse = new ApiResponse()

    try {
      const result = await this.gatewayService.list()
      if (result.isFailed) {
        apiResponse.success = false
        apiResponse.object = null
        apiResponse.message = result.errors[0] ?? GATEWAY_MESSAGES.INDEX_ERROR
        apiResponse.number = 500
        return response.status(500).send(apiResponse)
      }

      apiResponse.success = true
      apiResponse.object =
        result.value?.map((gateway) => ({
          id: gateway.id,
          name: gateway.name,
          provider: gateway.provider,
          baseUrl: gateway.baseUrl,
          isActive: gateway.isActive,
          priority: gateway.priority,
          createdAt: gateway.createdAt,
          updatedAt: gateway.updatedAt,
        })) ?? []
      apiResponse.message = GATEWAY_MESSAGES.INDEX_SUCCESS
      apiResponse.number = 200
      return response.status(200).send(apiResponse)
    } catch (error) {
      apiResponse.success = false
      apiResponse.object = null
      apiResponse.message = GATEWAY_MESSAGES.INDEX_ERROR
      apiResponse.number = 500
      return response.status(500).send(apiResponse)
    }
  }

  /**
   * @updateActive
   * @summary Ativa ou desativa um gateway
   * @paramPath id - ID do gateway - @type(number) @required
   * @requestBody {"isActive":true}
   */
  public async updateActive({ params, request, response }: HttpContextContract) {
    const apiResponse = new ApiResponse()

    try {
      const payload = request.all()
      const nestedBody =
        payload.body && typeof payload.body === 'object' && !Array.isArray(payload.body)
          ? payload.body
          : {}
      const nestedData =
        payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)
          ? payload.data
          : {}
      const queryString = request.qs()
      const rawIsActive =
        this.getFirstDefinedValue(payload, ['isActive', 'is_active', 'isactive']) ??
        this.getFirstDefinedValue(nestedBody, ['isActive', 'is_active', 'isactive']) ??
        this.getFirstDefinedValue(nestedData, ['isActive', 'is_active', 'isactive']) ??
        this.getFirstDefinedValue(queryString, ['isActive', 'is_active', 'isactive'])

      const parsedIsActive = this.parseBooleanLike(rawIsActive)
      if (parsedIsActive === null) {
        apiResponse.success = false
        apiResponse.object = null
        apiResponse.message = 'Campo isActive é obrigatório e deve ser booleano'
        apiResponse.number = 400
        return response.status(400).send(apiResponse)
      }

      const result = await this.gatewayService.updateActive(Number(params.id), parsedIsActive)

      if (result.isFailed) {
        const firstError = result.errors[0] ?? GATEWAY_MESSAGES.UPDATE_ERROR
        apiResponse.success = false
        apiResponse.object = null
        apiResponse.message = firstError
        apiResponse.number = firstError === GATEWAY_MESSAGES.NOT_FOUND ? 404 : 400
        return response.status(apiResponse.number).send(apiResponse)
      }

      apiResponse.success = true
      apiResponse.object = result.value
      apiResponse.message = GATEWAY_MESSAGES.UPDATE_ACTIVE_SUCCESS
      apiResponse.number = 200
      return response.status(200).send(apiResponse)
    } catch (error) {
      const validationMessage = this.resolveValidationMessage(error, GATEWAY_MESSAGES.UPDATE_ERROR)
      apiResponse.success = false
      apiResponse.object = null
      apiResponse.message = validationMessage
      apiResponse.number = validationMessage === GATEWAY_MESSAGES.UPDATE_ERROR ? 500 : 400
      return response.status(apiResponse.number).send(apiResponse)
    }
  }

  /**
   * @updatePriority
   * @summary Atualiza prioridade de um gateway
   * @paramPath id - ID do gateway - @type(number) @required
   * @requestBody {"priority":1}
   */
  public async updatePriority({ params, request, response }: HttpContextContract) {
    const apiResponse = new ApiResponse()

    try {
      const payload = request.all()
      const nestedBody =
        payload.body && typeof payload.body === 'object' && !Array.isArray(payload.body)
          ? payload.body
          : {}
      const nestedData =
        payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)
          ? payload.data
          : {}
      const queryString = request.qs()
      const rawPriority =
        this.getFirstDefinedValue(payload, ['priority', 'prioridade']) ??
        this.getFirstDefinedValue(nestedBody, ['priority', 'prioridade']) ??
        this.getFirstDefinedValue(nestedData, ['priority', 'prioridade']) ??
        this.getFirstDefinedValue(queryString, ['priority', 'prioridade'])

      const parsedPriority = this.parseIntegerLike(rawPriority)
      if (parsedPriority === null || parsedPriority <= 0) {
        apiResponse.success = false
        apiResponse.object = null
        apiResponse.message = GATEWAY_MESSAGES.INVALID_PRIORITY
        apiResponse.number = 400
        return response.status(400).send(apiResponse)
      }

      const result = await this.gatewayService.updatePriority(Number(params.id), parsedPriority)

      if (result.isFailed) {
        const firstError = result.errors[0] ?? GATEWAY_MESSAGES.UPDATE_ERROR
        apiResponse.success = false
        apiResponse.object = null
        apiResponse.message = firstError
        apiResponse.number =
          firstError === GATEWAY_MESSAGES.NOT_FOUND
            ? 404
            : firstError === GATEWAY_MESSAGES.PRIORITY_ALREADY_IN_USE
            ? 409
            : 400
        return response.status(apiResponse.number).send(apiResponse)
      }

      apiResponse.success = true
      apiResponse.object = result.value
      apiResponse.message = GATEWAY_MESSAGES.UPDATE_PRIORITY_SUCCESS
      apiResponse.number = 200
      return response.status(200).send(apiResponse)
    } catch (error) {
      const validationMessage = this.resolveValidationMessage(error, GATEWAY_MESSAGES.UPDATE_ERROR)
      apiResponse.success = false
      apiResponse.object = null
      apiResponse.message = validationMessage
      apiResponse.number = validationMessage === GATEWAY_MESSAGES.UPDATE_ERROR ? 500 : 400
      return response.status(apiResponse.number).send(apiResponse)
    }
  }
}
