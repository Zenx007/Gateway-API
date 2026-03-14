import Gateway from 'App/Models/Gateway'
import { Result } from 'App/Helpers/Utils/Result'

export default interface IGatewayRepository {
  list(): Promise<Result<Gateway[]>>
  listActiveByPriority(): Promise<Result<Gateway[]>>
  findById(id: number): Promise<Result<Gateway | null>>
  findByPriority(priority: number): Promise<Result<Gateway | null>>
  save(gateway: Gateway): Promise<Result<Gateway>>
}
