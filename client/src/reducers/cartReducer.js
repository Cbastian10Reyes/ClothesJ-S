export const initialCartState = {
  products: [],
  total: 0,
}

function getProductUnitPrice(product) {
  if (product.finalPrice !== undefined) {
    return Number(product.finalPrice) || 0
  }

  if (product.selectedVariant?.price !== undefined) {
    return Number(product.selectedVariant.price) || 0
  }

  return 0
}

function getCartTotal(products) {
  return products.reduce((sum, product) => {
    const unitPrice =
      getProductUnitPrice(product)

    const quantity =
      Number(product.quantity) || 0

    return sum + unitPrice * quantity
  }, 0)
}

function isSameCartItem(
  product,
  productId,
  variantId
) {
  return (
    product._id === productId &&
    product.selectedVariant?._id ===
      variantId
  )
}

export default function cartReducer(
  state,
  action
) {
  let newProducts

  switch (action.type) {
    case "RESET":
    case "CLEAR_CART":
      return initialCartState

    case "SET_PRODUCTS":
      return {
        ...state,
        products: action.payload,
        total: getCartTotal(
          action.payload
        ),
      }

    case "ADD_PRODUCTS": {
      newProducts = [
        ...state.products,
      ]

      action.payload.forEach(
        (product) => {
          const productId =
            product._id

          const variantId =
            product.selectedVariant?._id

          if (
            !productId ||
            !variantId
          ) {
            return
          }

          const existingIndex =
            newProducts.findIndex(
              (cartProduct) =>
                isSameCartItem(
                  cartProduct,
                  productId,
                  variantId
                )
            )

          if (existingIndex >= 0) {
            const existingProduct =
              newProducts[
                existingIndex
              ]

            const stock =
              Number(
                existingProduct
                  .selectedVariant
                  ?.stock
              ) || 0

            const currentQuantity =
              Number(
                existingProduct.quantity
              ) || 0

            const quantityToAdd =
              Number(
                product.quantity
              ) || 1

            const newQuantity =
              Math.min(
                currentQuantity +
                  quantityToAdd,
                stock
              )

            newProducts[
              existingIndex
            ] = {
              ...existingProduct,
              quantity: newQuantity,
            }

            return
          }

          const stock =
            Number(
              product.selectedVariant
                ?.stock
            ) || 0

          if (stock <= 0) {
            return
          }

          const requestedQuantity =
            Number(
              product.quantity
            ) || 1

          const quantity =
            Math.min(
              requestedQuantity,
              stock
            )

          newProducts.push({
            ...product,
            quantity,
          })
        }
      )

      return {
        ...state,
        products: newProducts,
        total: getCartTotal(
          newProducts
        ),
      }
    }

    case "REMOVE_PRODUCT": {
      const {
        productId,
        variantId,
      } = action.payload

      newProducts =
        state.products.filter(
          (product) =>
            !isSameCartItem(
              product,
              productId,
              variantId
            )
        )

      return {
        ...state,
        products: newProducts,
        total: getCartTotal(
          newProducts
        ),
      }
    }

    case "SET_PRODUCT_QUANTITY": {
      const {
        productId,
        variantId,
        quantity,
      } = action.payload

      if (quantity < 1) {
        return state
      }

      newProducts =
        state.products.map(
          (product) => {
            if (
              !isSameCartItem(
                product,
                productId,
                variantId
              )
            ) {
              return product
            }

            const stock =
              Number(
                product
                  .selectedVariant
                  ?.stock
              ) || 0

            const safeQuantity =
              Math.min(
                quantity,
                stock
              )

            return {
              ...product,
              quantity:
                safeQuantity,
            }
          }
        )

      return {
        ...state,
        products: newProducts,
        total: getCartTotal(
          newProducts
        ),
      }
    }

    default:
      return state
  }
}