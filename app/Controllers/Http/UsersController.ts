import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UserService from 'App/Services/UserService'
import { USER_MESSAGES } from 'App/Helpers/ConstantsMessages/UserMessages'
import { ApiResponse } from 'App/Helpers/CustomObjects/ApiResponse'
import { UserSaveVO } from 'App/Communication/ViewObjects/User/UserSaveVO'
import { UserUpdateVO } from 'App/Communication/ViewObjects/User/UserUpdateVO'
import CreateUserValidator from 'App/Validators/User/CreateUserValidator'
import CreateUserWithRoleValidator from 'App/Validators/User/CreateUserWithRoleValidator'
import UpdateUserValidator from 'App/Validators/User/UpdateUserValidator'
import { UserRole } from 'App/Enums/UserRole'

export default class UsersController {
  private readonly userService = new UserService()

  private resolveValidationMessage(error: any, fallback: string): string {
    const firstValidationMessage = error?.messages?.errors?.[0]?.message
    if (typeof firstValidationMessage === 'string' && firstValidationMessage.trim().length > 0) {
      return firstValidationMessage
    }

    return fallback
  }

  /**
   * @roles
   * @summary Lista todos os perfis de usuário
   */
  public async roles({ response }: HttpContextContract) {
    const apiResponse = new ApiResponse<string[]>()

    try {
      apiResponse.success = true
      apiResponse.object = Object.values(UserRole)
      apiResponse.message = USER_MESSAGES.ROLES_SUCCESS
      apiResponse.number = 200

      return response.status(200).send(apiResponse)
    } catch (error) {
      apiResponse.success = false
      apiResponse.object = null
      apiResponse.message = USER_MESSAGES.ROLES_ERROR
      apiResponse.number = 500

      return response.status(500).send(apiResponse)
    }
  }

  /**
   * @index
   * @summary Lista todos os usuarios
   */
  public async index({ response }: HttpContextContract) {
    const apiResponse = new ApiResponse()

    try {
      const result = await this.userService.list()
      if (result.isFailed) {
        apiResponse.success = false
        apiResponse.object = null
        apiResponse.message = result.errors[0] ?? USER_MESSAGES.INDEX_ERROR
        apiResponse.number = 500

        return response.status(500).send(apiResponse)
      }

      apiResponse.success = true
      apiResponse.object =
        result.value?.map((user) => ({
          id: user.id,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })) ?? []
      apiResponse.message = USER_MESSAGES.INDEX_SUCCESS
      apiResponse.number = 200

      return response.status(200).send(apiResponse)
    } catch (error) {
      apiResponse.success = false
      apiResponse.object = null
      apiResponse.message = USER_MESSAGES.INDEX_ERROR
      apiResponse.number = 500

      return response.status(500).send(apiResponse)
    }
  }

  /**
   * @show
   * @summary Busca um usuario por ID
   * @paramPath id - ID do usuario - @type(number) @required
   */
  public async show({ params, response }: HttpContextContract) {
    const apiResponse = new ApiResponse()

    try {
      const result = await this.userService.findById(Number(params.id))
      if (result.isFailed) {
        const firstError = result.errors[0] ?? USER_MESSAGES.SHOW_ERROR
        if (firstError === USER_MESSAGES.NOT_FOUND) {
          apiResponse.success = false
          apiResponse.object = null
          apiResponse.message = firstError
          apiResponse.number = 404

          return response.status(404).send(apiResponse)
        }

        apiResponse.success = false
        apiResponse.object = null
        apiResponse.message = firstError
        apiResponse.number = 500

        return response.status(500).send(apiResponse)
      }

      apiResponse.success = true
      apiResponse.object = result.value
      apiResponse.message = USER_MESSAGES.SHOW_SUCCESS
      apiResponse.number = 200

      return response.status(200).send(apiResponse)
    } catch (error) {
      apiResponse.success = false
      apiResponse.object = null
      apiResponse.message = USER_MESSAGES.SHOW_ERROR
      apiResponse.number = 500

      return response.status(500).send(apiResponse)
    }
  }

  /**
   * @store
   * @summary Cria um novo usuario
   * @requestBody {"email":"user@email.com","password":"12345678"}
   */
  public async store({ request, response }: HttpContextContract) {
    const apiResponse = new ApiResponse()

    try {
      const requestData = request.all()
      if (typeof requestData.role !== 'undefined') {
        apiResponse.success = false
        apiResponse.object = null
        apiResponse.message = USER_MESSAGES.INVALID_ROLE
        apiResponse.number = 400

        return response.status(400).send(apiResponse)
      }

      const payload = await request.validate(CreateUserValidator)
      const model = UserSaveVO.fromPayload(payload)
      const result = await this.userService.create(model)

      if (result.isFailed) {
        const firstError = result.errors[0] ?? USER_MESSAGES.STORE_ERROR
        if (firstError === USER_MESSAGES.EMAIL_ALREADY_EXISTS) {
          apiResponse.success = false
          apiResponse.object = null
          apiResponse.message = firstError
          apiResponse.number = 409

          return response.status(409).send(apiResponse)
        }

        apiResponse.success = false
        apiResponse.object = null
        apiResponse.message = firstError
        apiResponse.number = 400

        return response.status(400).send(apiResponse)
      }

      apiResponse.success = true
      apiResponse.object = result.value
      apiResponse.message = USER_MESSAGES.STORE_SUCCESS
      apiResponse.number = 201

      return response.status(201).send(apiResponse)
    } catch (error) {
      const validationMessage = this.resolveValidationMessage(error, USER_MESSAGES.STORE_ERROR)
      apiResponse.success = false
      apiResponse.object = null
      apiResponse.message = validationMessage
      apiResponse.number = validationMessage === USER_MESSAGES.STORE_ERROR ? 500 : 400

      return response.status(apiResponse.number).send(apiResponse)
    }
  }

  /**
   * @register
   * @summary Cadastro público de usuário comum
   * @requestBody {"email":"user@email.com","password":"12345678"}
   */
  public async register({ request, response }: HttpContextContract) {
    const apiResponse = new ApiResponse()

    try {
      const requestData = request.all()
      if (typeof requestData.role !== 'undefined') {
        apiResponse.success = false
        apiResponse.object = null
        apiResponse.message = USER_MESSAGES.INVALID_ROLE
        apiResponse.number = 400

        return response.status(400).send(apiResponse)
      }

      const payload = await request.validate(CreateUserValidator)
      const model = UserSaveVO.fromPayload(payload)
      const result = await this.userService.create(model)

      if (result.isFailed) {
        const firstError = result.errors[0] ?? USER_MESSAGES.STORE_ERROR
        if (firstError === USER_MESSAGES.EMAIL_ALREADY_EXISTS) {
          apiResponse.success = false
          apiResponse.object = null
          apiResponse.message = firstError
          apiResponse.number = 409

          return response.status(409).send(apiResponse)
        }

        apiResponse.success = false
        apiResponse.object = null
        apiResponse.message = firstError
        apiResponse.number = 400

        return response.status(400).send(apiResponse)
      }

      apiResponse.success = true
      apiResponse.object = result.value
      apiResponse.message = USER_MESSAGES.STORE_SUCCESS
      apiResponse.number = 201

      return response.status(201).send(apiResponse)
    } catch (error) {
      const validationMessage = this.resolveValidationMessage(error, USER_MESSAGES.STORE_ERROR)
      apiResponse.success = false
      apiResponse.object = null
      apiResponse.message = validationMessage
      apiResponse.number = validationMessage === USER_MESSAGES.STORE_ERROR ? 500 : 400

      return response.status(apiResponse.number).send(apiResponse)
    }
  }

  /**
   * @storeWithRole
   * @summary Cria um novo usuario com perfil (apenas ADMIN)
   * @requestBody {"email":"manager@email.com","password":"12345678","role":"MANAGER"}
   */
  public async storeWithRole({ request, response }: HttpContextContract) {
    const apiResponse = new ApiResponse()

    try {
      const requestData = request.all()
      if (typeof requestData.role === 'undefined' || requestData.role === null) {
        apiResponse.success = false
        apiResponse.object = null
        apiResponse.message = USER_MESSAGES.ROLE_REQUIRED
        apiResponse.number = 400

        return response.status(400).send(apiResponse)
      }

      if (!Object.values(UserRole).includes(requestData.role as UserRole)) {
        apiResponse.success = false
        apiResponse.object = null
        apiResponse.message = USER_MESSAGES.INVALID_ROLE
        apiResponse.number = 400

        return response.status(400).send(apiResponse)
      }

      const payload = await request.validate(CreateUserWithRoleValidator)
      const model = UserSaveVO.fromPayload(payload)
      const result = await this.userService.createWithRole(model, payload.role as UserRole)

      if (result.isFailed) {
        const firstError = result.errors[0] ?? USER_MESSAGES.STORE_ERROR
        if (firstError === USER_MESSAGES.EMAIL_ALREADY_EXISTS) {
          apiResponse.success = false
          apiResponse.object = null
          apiResponse.message = firstError
          apiResponse.number = 409

          return response.status(409).send(apiResponse)
        }

        apiResponse.success = false
        apiResponse.object = null
        apiResponse.message = firstError
        apiResponse.number = 400

        return response.status(400).send(apiResponse)
      }

      apiResponse.success = true
      apiResponse.object = result.value
      apiResponse.message = USER_MESSAGES.STORE_WITH_ROLE_SUCCESS
      apiResponse.number = 201

      return response.status(201).send(apiResponse)
    } catch (error) {
      const validationMessage = this.resolveValidationMessage(error, USER_MESSAGES.STORE_ERROR)
      apiResponse.success = false
      apiResponse.object = null
      apiResponse.message = validationMessage
      apiResponse.number = validationMessage === USER_MESSAGES.STORE_ERROR ? 500 : 400

      return response.status(apiResponse.number).send(apiResponse)
    }
  }

  /**
   * @update
   * @summary Atualiza um usuario
   * @paramPath id - ID do usuario - @type(number) @required
   * @requestBody {"email":"novo@email.com","password":"12345678"}
   */
  public async update({ params, request, response }: HttpContextContract) {
    const apiResponse = new ApiResponse()

    try {
      const authUser = (request as any).authUser
      const targetUserId = Number(params.id)
      if (!authUser || authUser.id !== targetUserId) {
        apiResponse.success = false
        apiResponse.object = null
        apiResponse.message = USER_MESSAGES.ONLY_OWNER_CAN_UPDATE
        apiResponse.number = 403

        return response.status(403).send(apiResponse)
      }

      const requestData = request.all()
      if (typeof requestData.role !== 'undefined') {
        apiResponse.success = false
        apiResponse.object = null
        apiResponse.message = USER_MESSAGES.ONLY_OWNER_CAN_UPDATE
        apiResponse.number = 403

        return response.status(403).send(apiResponse)
      }

      const payload = await request.validate(UpdateUserValidator)

      if (Object.keys(payload).length === 0) {
        apiResponse.success = false
        apiResponse.object = null
        apiResponse.message = USER_MESSAGES.UPDATE_EMPTY_PAYLOAD
        apiResponse.number = 400

        return response.status(400).send(apiResponse)
      }

      const model = UserUpdateVO.fromPayload(payload)
      const result = await this.userService.update(targetUserId, model)

      if (result.isFailed) {
        const firstError = result.errors[0] ?? USER_MESSAGES.UPDATE_ERROR
        if (firstError === USER_MESSAGES.NOT_FOUND) {
          apiResponse.success = false
          apiResponse.object = null
          apiResponse.message = firstError
          apiResponse.number = 404

          return response.status(404).send(apiResponse)
        }

        if (firstError === USER_MESSAGES.EMAIL_ALREADY_EXISTS) {
          apiResponse.success = false
          apiResponse.object = null
          apiResponse.message = firstError
          apiResponse.number = 409

          return response.status(409).send(apiResponse)
        }

        apiResponse.success = false
        apiResponse.object = null
        apiResponse.message = firstError
        apiResponse.number = 400

        return response.status(400).send(apiResponse)
      }

      apiResponse.success = true
      apiResponse.object = result.value
      apiResponse.message = USER_MESSAGES.UPDATE_SUCCESS
      apiResponse.number = 200

      return response.status(200).send(apiResponse)
    } catch (error) {
      apiResponse.success = false
      apiResponse.object = null
      apiResponse.message = USER_MESSAGES.UPDATE_ERROR
      apiResponse.number = 500

      return response.status(500).send(apiResponse)
    }
  }

  /**
   * @destroy
   * @summary Remove um usuario
   * @paramPath id - ID do usuario - @type(number) @required
   */
  public async destroy({ params, request, response }: HttpContextContract) {
    const apiResponse = new ApiResponse<boolean>()

    try {
      const authUser = (request as any).authUser
      const targetUserId = Number(params.id)
      if (!authUser) {
        apiResponse.success = false
        apiResponse.object = null
        apiResponse.message = USER_MESSAGES.DESTROY_ERROR
        apiResponse.number = 401

        return response.status(401).send(apiResponse)
      }

      const canDelete = authUser.role === UserRole.ADMIN || authUser.id === targetUserId
      if (!canDelete) {
        apiResponse.success = false
        apiResponse.object = null
        apiResponse.message = USER_MESSAGES.ONLY_OWNER_OR_ADMIN_CAN_DELETE
        apiResponse.number = 403

        return response.status(403).send(apiResponse)
      }

      const result = await this.userService.delete(targetUserId)
      if (result.isFailed) {
        const firstError = result.errors[0] ?? USER_MESSAGES.DESTROY_ERROR
        if (firstError === USER_MESSAGES.NOT_FOUND) {
          apiResponse.success = false
          apiResponse.object = null
          apiResponse.message = firstError
          apiResponse.number = 404

          return response.status(404).send(apiResponse)
        }

        apiResponse.success = false
        apiResponse.object = null
        apiResponse.message = firstError
        apiResponse.number = 400

        return response.status(400).send(apiResponse)
      }

      apiResponse.success = true
      apiResponse.object = result.value
      apiResponse.message = USER_MESSAGES.DESTROY_SUCCESS
      apiResponse.number = 200

      return response.status(200).send(apiResponse)
    } catch (error) {
      apiResponse.success = false
      apiResponse.object = null
      apiResponse.message = USER_MESSAGES.DESTROY_ERROR
      apiResponse.number = 500

      return response.status(500).send(apiResponse)
    }
  }
}
