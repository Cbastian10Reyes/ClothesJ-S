import React from "react"

import Input from "@/components/Input"

import Button from "@/components/Button"

export default function CartSummary({
  subtotal,
  charges,
  discounts,
  onCheckout,
}) {
  const chargesTotal = charges.reduce(
    (sum, charge) => sum + charge.amount,
    0
  )

  const discountTotal = discounts.reduce(
    (sum, discount) => sum + discount.amount,
    0
  )

  const total =
    subtotal +
    chargesTotal -
    discountTotal

  return (
    <div className="flex flex-col p-4 space-y-4">

      <h2 className="uppercase text-3xl">
        Resumen del carrito
      </h2>

      <div className="border-t border-b border-gray-200 space-y-4 py-4">

        <div className="flex justify-between text-lg">
          <span>Subtotal</span>

          <span>
            $
            {Number(
              subtotal
            ).toLocaleString("es-CO")}
          </span>
        </div>

        {charges.map((charge) => (
          <div
            className="flex justify-between"
            key={charge.name}
          >
            <span>{charge.name}</span>

            <span>
              $
              {Number(
                charge.amount
              ).toLocaleString("es-CO")}
            </span>
          </div>
        ))}

        {discounts.map((discount) => (
          <div
            className="flex justify-between"
            key={discount.name}
          >
            <span>{discount.name}</span>

            <span>
              -$
              {Number(
                discount.amount
              ).toLocaleString("es-CO")}
            </span>
          </div>
        ))}

        <div className="flex justify-between font-medium text-2xl">
          <span>Total</span>

          <span>
            $
            {Number(
              total
            ).toLocaleString("es-CO")}
          </span>
        </div>

      </div>

      <div className="flex justify-between">
        <Input
          placeholder="Código de descuento"
          className="!min-w-20"
        />

        <Button
          secondary
          disabled
        >
          Aplicar
        </Button>
      </div>

      <Button
        className="w-full self-center"
        onClick={onCheckout}
      >
        Finalizar compra
      </Button>

    </div>
  )
}