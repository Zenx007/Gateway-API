export class ApiResponse<T = any> {
  public success: boolean
  public object: T | null
  public message?: string | null
  public number: number = 0

  constructor() {
    this.success = false
    this.object = null
    this.message = null
    this.number = 0
  }
}
