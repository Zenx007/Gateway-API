import Product from 'App/Models/Product'
import ProductRepository from 'App/Repositories/ProductRepository'
import IProductRepository from 'App/Repositories/IProductRepository'
import { ProductSaveVO } from 'App/Communication/ViewObjects/Product/ProductSaveVO'
import { ProductUpdateVO } from 'App/Communication/ViewObjects/Product/ProductUpdateVO'
import { Result } from 'App/Helpers/Utils/Result'
import { PRODUCT_MESSAGES } from 'App/Helpers/ConstantsMessages/ProductMessages'

export default class ProductService {
  constructor(private readonly productRepository: IProductRepository = new ProductRepository()) {}

  public async create(model: ProductSaveVO): Promise<Result<Product>> {
    try {
      if (model.amount <= 0) {
        return Result.Fail(PRODUCT_MESSAGES.INVALID_AMOUNT)
      }

      return await this.productRepository.create({
        name: model.name,
        amount: model.amount,
      })
    } catch (error) {
      return Result.Fail(PRODUCT_MESSAGES.STORE_ERROR)
    }
  }

  public async list(): Promise<Result<Product[]>> {
    try {
      return await this.productRepository.list()
    } catch (error) {
      return Result.Fail(PRODUCT_MESSAGES.INDEX_ERROR)
    }
  }

  public async findById(id: number): Promise<Result<Product | null>> {
    try {
      const idResult = this.validateId(id)
      if (idResult.isFailed) {
        return Result.Fail(idResult.errors)
      }

      const productResult = await this.productRepository.findById(id)
      if (productResult.isFailed) {
        return Result.Fail(productResult.errors)
      }

      if (!productResult.value) {
        return Result.Fail(PRODUCT_MESSAGES.NOT_FOUND)
      }

      return Result.Ok(productResult.value)
    } catch (error) {
      return Result.Fail(PRODUCT_MESSAGES.SHOW_ERROR)
    }
  }

  public async update(id: number, model: ProductUpdateVO): Promise<Result<Product | null>> {
    try {
      const idResult = this.validateId(id)
      if (idResult.isFailed) {
        return Result.Fail(idResult.errors)
      }

      if (typeof model.amount !== 'undefined' && model.amount <= 0) {
        return Result.Fail(PRODUCT_MESSAGES.INVALID_AMOUNT)
      }

      const updateResult = await this.productRepository.update(id, {
        name: model.name,
        amount: model.amount,
        isActive: model.isActive,
      })
      if (updateResult.isFailed) {
        return Result.Fail(updateResult.errors)
      }

      if (!updateResult.value) {
        return Result.Fail(PRODUCT_MESSAGES.NOT_FOUND)
      }

      return Result.Ok(updateResult.value)
    } catch (error) {
      return Result.Fail(PRODUCT_MESSAGES.UPDATE_ERROR)
    }
  }

  public async delete(id: number): Promise<Result<boolean>> {
    try {
      const idResult = this.validateId(id)
      if (idResult.isFailed) {
        return Result.Fail(idResult.errors)
      }

      const productResult = await this.productRepository.findById(id)
      if (productResult.isFailed) {
        return Result.Fail(productResult.errors)
      }

      if (!productResult.value) {
        return Result.Fail(PRODUCT_MESSAGES.NOT_FOUND)
      }

      const hasLinksResult = await this.productRepository.hasTransactionLinks(id)
      if (hasLinksResult.isFailed) {
        return Result.Fail(hasLinksResult.errors)
      }

      if (hasLinksResult.value) {
        return Result.Fail(PRODUCT_MESSAGES.PRODUCT_HAS_TRANSACTIONS)
      }

      const deleteResult = await this.productRepository.delete(id)
      if (deleteResult.isFailed) {
        return Result.Fail(deleteResult.errors)
      }

      if (!deleteResult.value) {
        return Result.Fail(PRODUCT_MESSAGES.NOT_FOUND)
      }

      return Result.Ok(true)
    } catch (error) {
      return Result.Fail(PRODUCT_MESSAGES.DESTROY_ERROR)
    }
  }

  private validateId(id: number): Result<true> {
    try {
      if (!Number.isInteger(id) || id <= 0) {
        return Result.Fail(PRODUCT_MESSAGES.INVALID_ID)
      }

      return Result.Ok(true)
    } catch (error) {
      return Result.Fail(PRODUCT_MESSAGES.INVALID_ID)
    }
  }
}
