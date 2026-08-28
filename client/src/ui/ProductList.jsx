import React, { useContext } from "react"

import Product from "@/components/Product"

import { CartContext } from "@/App"

import api from "../api"

export default function ProductList({
  products = [],
  onAddToCart,
}) {
  const { cart } = useContext(CartContext)

  if (!Array.isArray(products)) {
    return null
  }

  return (
    <div className="flex flex-wrap justify-center">
      {products.map((product) => {
        const image =
          api.getProductPrimaryImage(product)

        const originalPrice =
          api.getProductMinPrice(product)

        const discount =
          Number(product.discount) || 0

        const hasDiscount =
          discount > 0

        const finalPrice = hasDiscount
          ? originalPrice -
            (originalPrice * discount) / 100
          : originalPrice

        const isInCart =
          cart?.products?.some(
            (cartProduct) =>
              cartProduct._id === product._id
          ) ?? false

        return (
          <Product
            key={product._id}
            name={product.name}
            imgSrc={image}
            price={finalPrice}
            originalPrice={originalPrice}
            discount={discount}
            link={`/products/${product._id}`}
            onAddToCart={() =>
              onAddToCart(product)
            }
            isInCart={isInCart}
          />
        )
      })}
    </div>
  )
}