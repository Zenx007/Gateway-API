import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Product from 'App/Models/Product'

export default class extends BaseSeeder {
  public async run() {
    const products = [
      { name: 'Produto A', amount: 1500, isActive: true },
      { name: 'Produto B', amount: 2500, isActive: true },
      { name: 'Produto C', amount: 999, isActive: true },
    ]

    for (const product of products) {
      await Product.updateOrCreate({ name: product.name }, product)
    }
  }
}
