import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ProductService from 'App/Services/ProductService'
import { ApiResponse } from 'App/Helpers/CustomObjects/ApiResponse'
import { PRODUCT_MESSAGES } from 'App/Helpers/ConstantsMessages/ProductMessages'
import CreateProductValidator from 'App/Validators/Product/CreateProductValidator'
import UpdateProductValidator from 'App/Validators/Product/UpdateProductValidator'
import { ProductSaveVO } from 'App/Communication/ViewObjects/Product/ProductSaveVO'
import { ProductUpdateVO } from 'App/Communication/ViewObjects/Product/ProductUpdateVO'

export default class ProductsController {
  private readonly productService = new ProductService()

  /**
   * @index
   * @summary Lista todos os produtos
   */
  public async index({ response }: HttpContextContract) {
    const apiResponse = new ApiResponse()

    try {
      const result = await this.productService.list()
      if (result.isFailed) {
        apiResponse.success = false
        apiResponse.object = null
        apiResponse.message = result.errors[0] ?? PRODUCT_MESSAGES.INDEX_ERROR
        apiResponse.number = 500

        return response.status(500).send(apiResponse)
      }

      apiResponse.success = true
      apiResponse.object =
        result.value?.map((product) => ({
          id: product.id,
          name: product.name,
          amount: product.amount,
          isActive: product.isActive,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        })) ?? []
      apiResponse.message = PRODUCT_MESSAGES.INDEX_SUCCESS
      apiResponse.number = 200
      return response.status(200).send(apiResponse)
    } catch (error) {
      apiResponse.success = false
      apiResponse.object = null
      apiResponse.message = PRODUCT_MESSAGES.INDEX_ERROR
      apiResponse.number = 500
      return response.status(500).send(apiResponse)
    }
  }

  /**
   * @show
   * @summary Busca produto por ID
   * @paramPath id - ID do produto - @type(number) @required
   */
  public async show({ params, response }: HttpContextContract) {
    const apiResponse = new ApiResponse()

    try {
      const result = await this.productService.findById(Number(params.id))
      if (result.isFailed) {
        const firstError = result.errors[0] ?? PRODUCT_MESSAGES.SHOW_ERROR
        apiResponse.success = false
        apiResponse.object = null
        apiResponse.message = firstError
        apiResponse.number = firstError === PRODUCT_MESSAGES.NOT_FOUND ? 404 : 400

        return response.status(apiResponse.number).send(apiResponse)
      }

      apiResponse.success = true
      apiResponse.object = result.value
      apiResponse.message = PRODUCT_MESSAGES.SHOW_SUCCESS
      apiResponse.number = 200
      return response.status(200).send(apiResponse)
    } catch (error) {
      apiResponse.success = false
      apiResponse.object = null
      apiResponse.message = PRODUCT_MESSAGES.SHOW_ERROR
      apiResponse.number = 500
      return response.status(500).send(apiResponse)
    }
  }

  /**
   * @store
   * @summary Cria um produto
   * @requestBody {"name":"Produto A","amount":1500}
   */
  public async store({ request, response }: HttpContextContract) {
    const apiResponse = new ApiResponse()

    try {
      const payload = await request.validate(CreateProductValidator)
      const model = ProductSaveVO.fromPayload(payload)
      const result = await this.productService.create(model)

      if (result.isFailed) {
        apiResponse.success = false
        apiResponse.object = null
        apiResponse.message = result.errors[0] ?? PRODUCT_MESSAGES.STORE_ERROR
        apiResponse.number = 400
        return response.status(400).send(apiResponse)
      }

      apiResponse.success = true
      apiResponse.object = result.value
      apiResponse.message = PRODUCT_MESSAGES.STORE_SUCCESS
      apiResponse.number = 201
      return response.status(201).send(apiResponse)
    } catch (error) {
      apiResponse.success = false
      apiResponse.object = null
      apiResponse.message = PRODUCT_MESSAGES.STORE_ERROR
      apiResponse.number = 500
      return response.status(500).send(apiResponse)
    }
  }

  /**
   * @update
   * @summary Atualiza produto
   * @paramPath id - ID do produto - @type(number) @required
   * @requestBody {"name":"Produto B","amount":2500,"isActive":true}
   */
  public async update({ params, request, response }: HttpContextContract) {
    const apiResponse = new ApiResponse()

    try {
      const payload = await request.validate(UpdateProductValidator)
      if (Object.keys(payload).length === 0) {
        apiResponse.success = false
        apiResponse.object = null
        apiResponse.message = 'Informe ao menos um campo para atualização'
        apiResponse.number = 400
        return response.status(400).send(apiResponse)
      }

      const model = ProductUpdateVO.fromPayload(payload)
      const result = await this.productService.update(Number(params.id), model)
      if (result.isFailed) {
        const firstError = result.errors[0] ?? PRODUCT_MESSAGES.UPDATE_ERROR
        apiResponse.success = false
        apiResponse.object = null
        apiResponse.message = firstError
        apiResponse.number = firstError === PRODUCT_MESSAGES.NOT_FOUND ? 404 : 400
        return response.status(apiResponse.number).send(apiResponse)
      }

      apiResponse.success = true
      apiResponse.object = result.value
      apiResponse.message = PRODUCT_MESSAGES.UPDATE_SUCCESS
      apiResponse.number = 200
      return response.status(200).send(apiResponse)
    } catch (error) {
      apiResponse.success = false
      apiResponse.object = null
      apiResponse.message = PRODUCT_MESSAGES.UPDATE_ERROR
      apiResponse.number = 500
      return response.status(500).send(apiResponse)
    }
  }

  /**
   * @destroy
   * @summary Remove produto
   * @paramPath id - ID do produto - @type(number) @required
   */
  public async destroy({ params, response }: HttpContextContract) {
    const apiResponse = new ApiResponse<boolean>()

    try {
      const result = await this.productService.delete(Number(params.id))
      if (result.isFailed) {
        const firstError = result.errors[0] ?? PRODUCT_MESSAGES.DESTROY_ERROR
        apiResponse.success = false
        apiResponse.object = null
        apiResponse.message = firstError
        apiResponse.number =
          firstError === PRODUCT_MESSAGES.NOT_FOUND
            ? 404
            : firstError === PRODUCT_MESSAGES.PRODUCT_HAS_TRANSACTIONS
            ? 409
            : 400
        return response.status(apiResponse.number).send(apiResponse)
      }

      apiResponse.success = true
      apiResponse.object = result.value
      apiResponse.message = PRODUCT_MESSAGES.DESTROY_SUCCESS
      apiResponse.number = 200
      return response.status(200).send(apiResponse)
    } catch (error) {
      apiResponse.success = false
      apiResponse.object = null
      apiResponse.message = PRODUCT_MESSAGES.DESTROY_ERROR
      apiResponse.number = 500
      return response.status(500).send(apiResponse)
    }
  }
}
