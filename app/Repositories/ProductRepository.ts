import Product from 'App/Models/Product'
import TransactionProduct from 'App/Models/TransactionProduct'
import IProductRepository, {
  CreateProductInput,
  UpdateProductInput,
} from 'App/Repositories/IProductRepository'
import { Result } from 'App/Helpers/Utils/Result'
import { PRODUCT_MESSAGES } from 'App/Helpers/ConstantsMessages/ProductMessages'

export default class ProductRepository implements IProductRepository {
  public async create(data: CreateProductInput): Promise<Result<Product>> {
    try {
      const product = await Product.create({
        name: data.name,
        amount: data.amount,
        isActive: true,
      })
      return Result.Ok(product)
    } catch (error) {
      return Result.Fail(PRODUCT_MESSAGES.STORE_ERROR)
    }
  }

  public async findById(id: number): Promise<Result<Product | null>> {
    try {
      const product = await Product.find(id)
      return Result.Ok(product)
    } catch (error) {
      return Result.Fail(PRODUCT_MESSAGES.SHOW_ERROR)
    }
  }

  public async findByIds(ids: number[]): Promise<Result<Product[]>> {
    try {
      if (ids.length === 0) {
        return Result.Ok([])
      }
      const products = await Product.query().whereIn('id', ids)
      return Result.Ok(products)
    } catch (error) {
      return Result.Fail(PRODUCT_MESSAGES.SHOW_ERROR)
    }
  }

  public async hasTransactionLinks(id: number): Promise<Result<boolean>> {
    try {
      const firstLink = await TransactionProduct.query().where('product_id', id).first()
      return Result.Ok(Boolean(firstLink))
    } catch (error) {
      return Result.Fail(PRODUCT_MESSAGES.DESTROY_ERROR)
    }
  }

  public async list(): Promise<Result<Product[]>> {
    try {
      const products = await Product.query().orderBy('id', 'asc')
      return Result.Ok(products)
    } catch (error) {
      return Result.Fail(PRODUCT_MESSAGES.INDEX_ERROR)
    }
  }

  public async update(id: number, data: UpdateProductInput): Promise<Result<Product | null>> {
    try {
      const product = await Product.find(id)
      if (!product) {
        return Result.Ok(null)
      }

      if (typeof data.name !== 'undefined') {
        product.name = data.name
      }
      if (typeof data.amount !== 'undefined') {
        product.amount = data.amount
      }
      if (typeof data.isActive !== 'undefined') {
        product.isActive = data.isActive
      }

      await product.save()
      return Result.Ok(product)
    } catch (error) {
      return Result.Fail(PRODUCT_MESSAGES.UPDATE_ERROR)
    }
  }

  public async delete(id: number): Promise<Result<boolean>> {
    try {
      const deletedRows = await Product.query().where('id', id).delete()
      return Result.Ok(deletedRows > 0)
    } catch (error) {
      return Result.Fail(PRODUCT_MESSAGES.DESTROY_ERROR)
    }
  }
}
