import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PaymentService from 'App/Services/PaymentService'
import { ApiResponse } from 'App/Helpers/CustomObjects/ApiResponse'
import { PAYMENT_MESSAGES } from 'App/Helpers/ConstantsMessages/PaymentMessages'
import CreatePaymentChargeValidator from 'App/Validators/Payment/CreatePaymentChargeValidator'
import { PaymentChargeVO } from 'App/Communication/ViewObjects/Payment/PaymentChargeVO'

export default class PaymentsController {
  private readonly paymentService = new PaymentService()

  private buildDisplayNameFromEmail(email: string, fallbackId?: number): string {
    const localPart = (email || '').split('@')[0] || ''
    const normalized = localPart
      .replace(/[^a-zA-Z0-9]+/g, ' ')
      .trim()
      .split(' ')
      .filter((part) => part.length > 0)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ')

    if (normalized.length > 0) {
      return normalized
    }

    return typeof fallbackId === 'number' ? `Usuário ${fallbackId}` : 'Usuário'
  }

  /**
   * @store
   * @summary Processa compra por produto(s), calcula total no backend e aplica fallback por prioridade
   * @description Este endpoint usa o usuário autenticado no token (exemplo: admin@gatewayapi.local)
   * @requestBody {"items":[{"productId":1,"quantity":2}],"cardNumber":"5569000000006063","cvv":"010"}
   */
  public async store({ request, response }: HttpContextContract) {
    const apiResponse = new ApiResponse()

    try {
      const authUser = (request as any).authUser
      if (!authUser || !authUser.email) {
        apiResponse.success = false
        apiResponse.object = null
        apiResponse.message = 'Usuário não autenticado'
        apiResponse.number = 401

        return response.status(401).send(apiResponse)
      }

      const payload = await request.validate(CreatePaymentChargeValidator)
      const model = PaymentChargeVO.fromPayload(payload)
      const clientData = {
        name: this.buildDisplayNameFromEmail(authUser.email, authUser.id),
        email: String(authUser.email).trim().toLowerCase(),
      }

      const result = await this.paymentService.charge(model, clientData)
      if (result.isFailed) {
        apiResponse.success = false
        apiResponse.object = null
        apiResponse.message = result.errors[0] ?? PAYMENT_MESSAGES.CHARGE_ERROR
        apiResponse.number = 400

        return response.status(400).send(apiResponse)
      }

      apiResponse.success = true
      apiResponse.object = result.value
      apiResponse.message = PAYMENT_MESSAGES.CHARGE_SUCCESS
      apiResponse.number = 201

      return response.status(201).send(apiResponse)
    } catch (error) {
      apiResponse.success = false
      apiResponse.object = null
      apiResponse.message = PAYMENT_MESSAGES.CHARGE_ERROR
      apiResponse.number = 500

      return response.status(500).send(apiResponse)
    }
  }
}
