import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'
import { UserRole } from 'App/Enums/UserRole'
import { AUTH_DEFAULTS } from 'App/Helpers/Constants/AuthDefaults'

export default class extends BaseSeeder {
  public async run() {
    await User.updateOrCreate(
      { email: AUTH_DEFAULTS.ADMIN_EMAIL },
      {
        email: AUTH_DEFAULTS.ADMIN_EMAIL,
        password: AUTH_DEFAULTS.ADMIN_PASSWORD,
        role: UserRole.ADMIN,
      }
    )
  }
}
