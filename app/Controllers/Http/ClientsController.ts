import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ClientService from 'App/Services/ClientService'
import { ApiResponse } from 'App/Helpers/CustomObjects/ApiResponse'
import { CLIENT_MESSAGES } from 'App/Helpers/ConstantsMessages/ClientMessages'

export default class ClientsController {
  private readonly clientService = new ClientService()

  /**
   * @index
   * @summary Lista todos os clientes
   */
  public async index({ response }: HttpContextContract) {
    const apiResponse = new ApiResponse()

    try {
      const result = await this.clientService.list()
      if (result.isFailed) {
        apiResponse.success = false
        apiResponse.object = null
        apiResponse.message = result.errors[0] ?? CLIENT_MESSAGES.INDEX_ERROR
        apiResponse.number = 500
        return response.status(500).send(apiResponse)
      }

      apiResponse.success = true
      apiResponse.object =
        result.value?.map((client) => ({
          id: client.id,
          name: client.name,
          email: client.email,
          createdAt: client.createdAt,
          updatedAt: client.updatedAt,
        })) ?? []
      apiResponse.message = CLIENT_MESSAGES.INDEX_SUCCESS
      apiResponse.number = 200
      return response.status(200).send(apiResponse)
    } catch (error) {
      apiResponse.success = false
      apiResponse.object = null
      apiResponse.message = CLIENT_MESSAGES.INDEX_ERROR
      apiResponse.number = 500
      return response.status(500).send(apiResponse)
    }
  }

  /**
   * @show
   * @summary Detalha um cliente com suas compras
   * @paramPath id - ID do cliente - @type(number) @required
   */
  public async show({ params, response }: HttpContextContract) {
    const apiResponse = new ApiResponse()

    try {
      const result = await this.clientService.findByIdWithTransactions(Number(params.id))
      if (result.isFailed) {
        const firstError = result.errors[0] ?? CLIENT_MESSAGES.SHOW_ERROR
        apiResponse.success = false
        apiResponse.object = null
        apiResponse.message = firstError
        apiResponse.number = firstError === CLIENT_MESSAGES.NOT_FOUND ? 404 : 400
        return response.status(apiResponse.number).send(apiResponse)
      }

      apiResponse.success = true
      apiResponse.object = result.value
      apiResponse.message = CLIENT_MESSAGES.SHOW_SUCCESS
      apiResponse.number = 200
      return response.status(200).send(apiResponse)
    } catch (error) {
      apiResponse.success = false
      apiResponse.object = null
      apiResponse.message = CLIENT_MESSAGES.SHOW_ERROR
      apiResponse.number = 500
      return response.status(500).send(apiResponse)
    }
  }
}
