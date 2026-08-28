import React from "react"

import CartItem from "@/components/CartItem"

import api from "@/api"

export default function CartList({
  items = [],
  setItemQuantity,
  removeItem,
}) {
  return (
    <>
      {items.map((item) => {
        const productId = item._id

        const variantId =
          item.selectedVariant?._id

        const image =
          api.getProductPrimaryImage(item)

        const unitPrice =
          Number(item.finalPrice) ||
          Number(
            item.selectedVariant?.price
          ) ||
          0

        const quantity =
          Number(item.quantity) || 1

        const totalPrice =
          unitPrice * quantity

        const stock =
          Number(
            item.selectedVariant?.stock
          ) || 0

        return (
          <CartItem
            key={`${productId}-${variantId}`}
            imgSrc={image}
            name={item.name}
            price={unitPrice}
            totalPrice={totalPrice}
            quantity={quantity}
            stock={stock}
            size={item.selectedSize}
            color={item.selectedColor}
            codeColor={
              item.selectedCodeColor
            }
            discount={
              Number(item.discount) || 0
            }
            originalPrice={
              Number(item.originalPrice) ||
              Number(
                item.selectedVariant?.price
              ) ||
              0
            }
            setQuantity={(qty) =>
              setItemQuantity(
                productId,
                variantId,
                qty
              )
            }
            onRemove={() =>
              removeItem(
                productId,
                variantId
              )
            }
          />
        )
      })}
    </>
  )
}