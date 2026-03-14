import Product from 'App/Models/Product'
import { Result } from 'App/Helpers/Utils/Result'

export type CreateProductInput = {
  name: string
  amount: number
}

export type UpdateProductInput = {
  name?: string
  amount?: number
  isActive?: boolean
}

export default interface IProductRepository {
  create(data: CreateProductInput): Promise<Result<Product>>
  findById(id: number): Promise<Result<Product | null>>
  findByIds(ids: number[]): Promise<Result<Product[]>>
  hasTransactionLinks(id: number): Promise<Result<boolean>>
  list(): Promise<Result<Product[]>>
  update(id: number, data: UpdateProductInput): Promise<Result<Product | null>>
  delete(id: number): Promise<Result<boolean>>
}
