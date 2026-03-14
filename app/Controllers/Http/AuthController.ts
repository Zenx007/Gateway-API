import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AuthService from 'App/Services/AuthService'
import LoginValidator from 'App/Validators/Auth/LoginValidator'
import { LoginVO } from 'App/Communication/ViewObjects/Auth/LoginVO'
import { ApiResponse } from 'App/Helpers/CustomObjects/ApiResponse'
import { AUTH_MESSAGES } from 'App/Helpers/ConstantsMessages/AuthMessages'

export default class AuthController {
  private readonly authService = new AuthService()

  /**
   * @store
   * @summary Realiza login da aplicação
   * @requestBody {"email":"admin@gatewayapi.local","password":"12345678"}
   */
  public async store({ request, response }: HttpContextContract) {
    const apiResponse = new ApiResponse()

    try {
      const payload = await request.validate(LoginValidator)
      const model = LoginVO.fromPayload(payload)
      const result = await this.authService.login(model.email, model.password)

      if (result.isFailed) {
        apiResponse.success = false
        apiResponse.object = null
        apiResponse.message = result.errors[0] ?? AUTH_MESSAGES.LOGIN_ERROR
        apiResponse.number = 401

        return response.status(401).send(apiResponse)
      }

      apiResponse.success = true
      apiResponse.object = result.value
      apiResponse.message = AUTH_MESSAGES.LOGIN_SUCCESS
      apiResponse.number = 200

      return response.status(200).send(apiResponse)
    } catch (error) {
      apiResponse.success = false
      apiResponse.object = null
      apiResponse.message = AUTH_MESSAGES.LOGIN_ERROR
      apiResponse.number = 500

      return response.status(500).send(apiResponse)
    }
  }
}
