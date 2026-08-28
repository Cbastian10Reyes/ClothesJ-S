const WHATSAPP_NUMBER = "573156005669"

function formatPrice(value) {
  return Number(value || 0).toLocaleString(
    "es-CO"
  )
}

export function buildWhatsAppOrderMessage(
  products,
  total
) {
  const wavingHand = "\uD83D\uDC4B"
  const shoppingBag = "\uD83D\uDECD\uFE0F"
  const smile = "\uD83D\uDE0A"

  const productsMessage = products
    .map((product) => {
      const quantity =
        Number(product.quantity) || 1

      const unitPrice =
        Number(product.finalPrice) ||
        Number(
          product.selectedVariant?.price
        ) ||
        0

      const subtotal =
        unitPrice * quantity

      const color =
        product.selectedColor ||
        product.selectedVariant?.color ||
        "N/A"

      const size =
        product.selectedSize ||
        product.selectedVariant?.size ||
        "N/A"

      return [
        `${shoppingBag} *${product.name}*`,
        `Color: ${color}`,
        `Talla: ${size}`,
        `Cantidad: ${quantity}`,
        `Precio unitario: $${formatPrice(
          unitPrice
        )}`,
        `Subtotal: $${formatPrice(
          subtotal
        )}`,
      ].join("\n")
    })
    .join("\n\n")

  return [
    `Hola, *CLOTHES J&S* ${wavingHand}`,
    "",
    "Quisiera realizar el siguiente pedido:",
    "",
    productsMessage,
    "",
    "--------------------------------",
    `*TOTAL DEL PEDIDO: $${formatPrice(
      total
    )}*`,
    "--------------------------------",
    "",
    "Quedo atento(a) para coordinar los datos de entrega y el método de pago.",
    "",
    `¡Gracias! ${smile}`,
  ].join("\n")
}

export function sendOrderToWhatsApp(
  products,
  total
) {
  const message =
    buildWhatsAppOrderMessage(
      products,
      total
    )

  console.log(
    "Mensaje antes de enviar:",
    message
  )

  const encodedMessage =
    encodeURIComponent(message)

  const whatsappUrl =
    `https://api.whatsapp.com/send` +
    `?phone=${WHATSAPP_NUMBER}` +
    `&text=${encodedMessage}`

  window.open(
    whatsappUrl,
    "_blank",
    "noopener,noreferrer"
  )
}