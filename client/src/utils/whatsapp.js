const WHATSAPP_NUMBER =
  import.meta.env.VITE_WHATSAPP_NUMBER

export function sendOrderToWhatsApp(
  products,
  orderNumber
) {
  if (
    !Array.isArray(products) ||
    products.length === 0
  ) {
    return
  }

  const productLines =
    products
      .map((product) => {
        const variant =
          product.selectedVariant

        return [
          product.name,
          `Color: ${variant?.color || "-"}`,
          `Talla: ${variant?.size || "-"}`,
          `Cantidad: ${Number(product.quantity) || 1}`,
        ].join("\n")
      })
      .join("\n\n")

  const message = [
    "Hola, CLOTHES J&S",
    "",
    "Quisiera realizar el siguiente pedido:",
    "",
    `Pedido: ${orderNumber}`,
    "",
    productLines,
    "",
    "Quedo atento(a) para coordinar los datos de entrega y el método de pago.",
    "",
    "¡Gracias!",
  ].join("\n")

  const encodedMessage =
    encodeURIComponent(message)

  const whatsappUrl =
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`

  window.open(
    whatsappUrl,
    "_blank",
    "noopener,noreferrer"
  )
}