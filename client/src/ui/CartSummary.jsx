import React from "react"

import Input from "@/components/Input"

import Button from "@/components/Button"

export default function CartSummary({
  subtotal,
  discountTotal,
  total,
  onCheckout,
}) {
  const formatPrice = (value) =>
    Number(value || 0).toLocaleString(
      "es-CO"
    )

  const FREE_SHIPPING_GOAL = 250000

  const progress = Math.min(
    (Number(total || 0) /
      FREE_SHIPPING_GOAL) *
      100,
    100
  )

  const reachedGoal =
    Number(total || 0) >=
    FREE_SHIPPING_GOAL

  const remainingAmount = Math.max(
    FREE_SHIPPING_GOAL -
      Number(total || 0),
    0
  )

  return (
    <div className="flex flex-col p-4 space-y-4">

      <h2 className="uppercase text-3xl">
        Detalle Carrito
      </h2>

      <div className="border-t border-b border-gray-200 space-y-4 py-4">

        {/* SUBTOTAL */}
        <div className="flex justify-between text-lg">
          <span>
            Subtotal
          </span>

          <span>
            ${formatPrice(subtotal)}
          </span>
        </div>

        {/* DESCUENTOS */}
        {discountTotal > 0 && (
          <div className="flex justify-between text-lg text-red-600">

            <span>
              Descuentos
            </span>

            <span>
              -$
              {formatPrice(
                discountTotal
              )}
            </span>

          </div>
        )}

        {/* TOTAL */}
        <div className="flex justify-between font-medium text-2xl pt-2">

          <span>
            Total
          </span>

          <span>
            ${formatPrice(total)}
          </span>

        </div>

        {/* PROGRESO */}
        <div className="pt-3">

          <div className="flex justify-between items-center text-sm mb-2">

            <span
              className={
                reachedGoal
                  ? "font-semibold text-green-600"
                  : "font-semibold text-gray-700"
              }
            >
              {reachedGoal
                ? "¡Meta alcanzada!"
                : "Progreso de compra"}
            </span>

            <span className="text-gray-500">
              $
              {formatPrice(total)}
              {" / "}
              $
              {formatPrice(
                FREE_SHIPPING_GOAL
              )}
            </span>

          </div>

          {/* BARRA */}
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">

            <div
              className={`
                h-full
                rounded-full
                transition-all
                duration-500

                ${
                  reachedGoal
                    ? "bg-green-500"
                    : "bg-red-500"
                }
              `}
              style={{
                width: `${progress}%`,
              }}
            />

          </div>

          {/* TEXTO */}
          <div className="mt-2">

            {reachedGoal ? (
              <p className="text-sm text-green-600 font-medium">
                ¡Tu compra tiene envío gratis!
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                Te faltan{" "}
                <span className="font-semibold text-red-600">
                  $
                  {formatPrice(
                    remainingAmount
                  )}
                </span>{" "}
                para obtener envío gratis.
              </p>
            )}

          </div>

        </div>

      </div>

      {/* CUPÓN */}
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

      {/* CHECKOUT */}
      <Button
        className="w-full self-center"
        onClick={onCheckout}
      >
        Finalizar compra
      </Button>

    </div>
  )
}