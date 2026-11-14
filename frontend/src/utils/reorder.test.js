import { orders } from '../data/orders.js'
import { products } from '../data/products.js'
import { buildReorderCart } from './reorder.js'

const order = (id) => orders.find((o) => o.id === id)
const optionValues = (cartItem) => cartItem.selectedOptions.map((o) => o.value)

describe('buildReorderCart', () => {
  it('copies each available item with its quantity', () => {
    // ord-1005: 2 × Brown Sugar Milk Tea with a note
    const { cartItems, unavailableItems } = buildReorderCart(order('ord-1005'), products)
    expect(unavailableItems).toEqual([])
    expect(cartItems).toHaveLength(1)
    expect(cartItems[0]).toMatchObject({
      productId: 'prod-brown-sugar-milk-tea',
      name: 'Brown Sugar Milk Tea',
      quantity: 2,
      specialInstructions: 'Light ice, please.',
    })
  })

  it('keeps past customizations that are still on the menu', () => {
    // ord-1006 Earl Grey: Large, Iced, 50%, Oat (now "Oat milk")
    const [latte] = buildReorderCart(order('ord-1006'), products).cartItems
    expect(optionValues(latte)).toEqual(
      expect.arrayContaining(['Large (16 oz)', 'Iced', '50%', 'Oat milk']),
    )
  })

  it("prices items from today's menu, including option upcharges", () => {
    const [latte] = buildReorderCart(order('ord-1006'), products).cartItems
    const expected = latte.selectedOptions.reduce((sum, o) => sum + (o.additionalPrice ?? 0), 6.25)
    expect(latte.unitPrice).toBeCloseTo(expected)
    expect(latte.totalPrice).toBeCloseTo(expected * latte.quantity)
  })

  it('leaves out unavailable items and names them', () => {
    // ord-1000: sold-out Taro Milk Tea + Jasmine Green Tea
    const { cartItems, unavailableItems } = buildReorderCart(order('ord-1000'), products)
    expect(unavailableItems).toEqual(['Taro Milk Tea'])
    expect(cartItems.map((item) => item.name)).toEqual(['Jasmine Green Tea'])
  })

  it('reports past choices the menu no longer offers', () => {
    // ord-1005 had "Whole" milk and "Tapioca pearls", which today's menu doesn't offer.
    const { changedOptions } = buildReorderCart(order('ord-1005'), products)
    expect(changedOptions).toEqual([
      { productName: 'Brown Sugar Milk Tea', options: ['Whole (Milk)', 'Tapioca pearls (Add-on)'] },
    ])
  })

  it('returns no items when everything is unavailable', () => {
    const taroOnly = { ...order('ord-1000'), items: [order('ord-1000').items[0]] }
    const { cartItems, unavailableItems } = buildReorderCart(taroOnly, products)
    expect(cartItems).toEqual([])
    expect(unavailableItems).toEqual(['Taro Milk Tea'])
  })
})
