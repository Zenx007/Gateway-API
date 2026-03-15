import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import TransactionService from 'App/Services/TransactionService'
import { ApiResponse } from 'App/Helpers/CustomObjects/ApiResponse'
import { TRANSACTION_MESSAGES } from 'App/Helpers/ConstantsMessages/TransactionMessages'

export default class TransactionsController {
  private readonly transactionService = new TransactionService()

  /**
   * @index
   * @summary Lista todas as compras
   */
  public async index({ response }: HttpContextContract) {
    const apiResponse = new ApiResponse()

    try {
      const result = await this.transactionService.list()
      if (result.isFailed) {
        apiResponse.success = false
        apiResponse.object = null
        apiResponse.message = result.errors[0] ?? TRANSACTION_MESSAGES.INDEX_ERROR
        apiResponse.number = 500
        return response.status(500).send(apiResponse)
      }

      apiResponse.success = true
      apiResponse.object =
        result.value?.map((transaction) => ({
          id: transaction.id,
          gatewayId: transaction.gatewayId,
          clientId: transaction.clientId,
          externalId: transaction.externalId,
          status: transaction.status,
          amount: transaction.amount,
          clientName: transaction.clientName,
          clientEmail: transaction.clientEmail,
          cardLastNumbers: transaction.cardLastNumbers,
          errorMessage: transaction.errorMessage,
          createdAt: transaction.createdAt,
          updatedAt: transaction.updatedAt,
        })) ?? []
      apiResponse.message = TRANSACTION_MESSAGES.INDEX_SUCCESS
      apiResponse.number = 200
      return response.status(200).send(apiResponse)
    } catch (error) {
      apiResponse.success = false
      apiResponse.object = null
      apiResponse.message = TRANSACTION_MESSAGES.INDEX_ERROR
      apiResponse.number = 500
      return response.status(500).send(apiResponse)
    }
  }

  /**
   * @show
   * @summary Detalha uma compra por ID
   * @paramPath id - ID da compra - @type(number) @required
   */
  public async show({ params, response }: HttpContextContract) {
    const apiResponse = new ApiResponse()

    try {
      const result = await this.transactionService.findById(Number(params.id))
      if (result.isFailed) {
        const firstError = result.errors[0] ?? TRANSACTION_MESSAGES.SHOW_ERROR
        apiResponse.success = false
        apiResponse.object = null
        apiResponse.message = firstError
        apiResponse.number = firstError === TRANSACTION_MESSAGES.NOT_FOUND ? 404 : 400
        return response.status(apiResponse.number).send(apiResponse)
      }

      apiResponse.success = true
      apiResponse.object = result.value
      apiResponse.message = TRANSACTION_MESSAGES.SHOW_SUCCESS
      apiResponse.number = 200
      return response.status(200).send(apiResponse)
    } catch (error) {
      apiResponse.success = false
      apiResponse.object = null
      apiResponse.message = TRANSACTION_MESSAGES.SHOW_ERROR
      apiResponse.number = 500
      return response.status(500).send(apiResponse)
    }
  }

  /**
   * @update
   * @summary Realiza reembolso de uma compra
   * @paramPath id - ID da compra - @type(number) @required
   */
  public async refund({ params, response }: HttpContextContract) {
    const apiResponse = new ApiResponse()

    try {
      const result = await this.transactionService.refund(Number(params.id))
      if (result.isFailed) {
        const firstError = result.errors[0] ?? TRANSACTION_MESSAGES.REFUND_ERROR
        apiResponse.success = false
        apiResponse.object = null
        apiResponse.message = firstError
        apiResponse.number =
          firstError === TRANSACTION_MESSAGES.NOT_FOUND
            ? 404
            : firstError === TRANSACTION_MESSAGES.INVALID_REFUND_STATUS
            ? 422
            : 400
        return response.status(apiResponse.number).send(apiResponse)
      }

      apiResponse.success = true
      apiResponse.object = result.value
      apiResponse.message = TRANSACTION_MESSAGES.REFUND_SUCCESS
      apiResponse.number = 200
      return response.status(200).send(apiResponse)
    } catch (error) {
      apiResponse.success = false
      apiResponse.object = null
      apiResponse.message = TRANSACTION_MESSAGES.REFUND_ERROR
      apiResponse.number = 500
      return response.status(500).send(apiResponse)
    }
  }
}
