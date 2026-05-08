import { CartItem } from '@/types'

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER

export function buildWhatsAppLink(
  productName: string,
  storage: string,
  price: number
): string {
  const text = `Hi, I'm interested in ${productName} (${storage}) priced at €${price}`
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
}

export function buildCartWhatsAppLink(
  cartItems: CartItem[],
  couponCode?: string,
  total?: number
): string {
  const itemLines = cartItems
    .map(
      (item) =>
        `- ${item.product_name} (${item.storage}) x${item.quantity} = €${(item.price * item.quantity).toFixed(2)}`
    )
    .join('\n')

  let text = `Hi, I'd like to order the following items:\n\n${itemLines}`

  if (couponCode) {
    text += `\n\nCoupon code: ${couponCode}`
  }

  if (total !== undefined) {
    text += `\n\nTotal: €${total.toFixed(2)}`
  }

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
}
