import React from "react"

import {
  Plus,
  Minus,
  Trash,
} from "react-feather"

export default function CartItem({
  imgSrc,
  name,
  price,
  totalPrice,
  originalPrice,
  discount,
  quantity,
  stock,
  size,
  color,
  codeColor,
  setQuantity,
  onRemove,
}) {
  const hasDiscount =
    Number(discount) > 0

  const canIncrease =
    quantity < stock

  const handleDecrease = () => {
    if (quantity <= 1) {
      onRemove()
      return
    }

    setQuantity(quantity - 1)
  }

  const handleIncrease = () => {
    if (!canIncrease) {
      return
    }

    setQuantity(quantity + 1)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4">

      {/* IMAGEN */}
      <section className="w-full sm:w-36 h-40 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {imgSrc ? (
          <img
            className="w-full h-full object-cover"
            src={imgSrc}
            alt={name}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
            Sin imagen
          </div>
        )}
      </section>

      {/* INFORMACIÓN */}
      <section className="flex-1 min-w-0">

        <div className="flex justify-between gap-4">

          <div className="min-w-0">
            <h3 className="text-xl font-semibold text-gray-900 truncate">
              {name}
            </h3>

            {/* VARIANTE */}
            <div className="flex flex-wrap items-center gap-5 mt-3 text-sm text-gray-600">

              {/* COLOR */}
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700">
                  Color:
                </span>

                <span
                  className="w-6 h-6 rounded-md border border-gray-300 shadow-sm"
                  style={{
                    backgroundColor:
                      codeColor || "#D1D5DB",
                  }}
                  title={color}
                />

                <span>
                  {color || "N/A"}
                </span>
              </div>

              {/* TALLA */}
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700">
                  Talla:
                </span>

                <span
                  className="
                    min-w-9 h-9
                    px-2
                    flex
                    items-center
                    justify-center
                    rounded-md
                    border
                    border-gray-300
                    bg-gray-50
                    font-semibold
                    text-gray-800
                  "
                >
                  {size || "-"}
                </span>
              </div>

            </div>

            {/* STOCK */}
            <p className="text-sm text-gray-500 mt-3">
              Disponibles:{" "}
              <span className="font-semibold text-gray-700">
                {stock}
              </span>
            </p>

            {/* PRECIO UNITARIO */}
            <div className="mt-4">

              <p className="text-sm text-gray-500">
                Precio por unidad
              </p>

              {hasDiscount ? (
                <div className="flex items-center gap-3">

                  <span className="text-sm text-gray-400 line-through">
                    $
                    {Number(
                      originalPrice
                    ).toLocaleString("es-CO")}
                  </span>

                  <span className="text-lg font-bold text-red-600">
                    $
                    {Number(
                      price
                    ).toLocaleString("es-CO")}
                  </span>

                  <span className="text-xs font-bold text-red-600 bg-red-50 rounded px-2 py-1">
                    -{discount}%
                  </span>

                </div>
              ) : (
                <span className="text-lg font-semibold text-gray-900">
                  $
                  {Number(
                    price
                  ).toLocaleString("es-CO")}
                </span>
              )}

            </div>
          </div>

          {/* ELIMINAR */}
          <button
            type="button"
            onClick={onRemove}
            title="Eliminar producto"
            className="
              w-10 h-10
              flex
              items-center
              justify-center
              flex-shrink-0
              rounded-full
              text-gray-500
              hover:(bg-red-50 text-red-600)
              transition-colors
              focus:outline-none
            "
          >
            <Trash size={19} />
          </button>

        </div>

        {/* CANTIDAD Y TOTAL */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mt-6 pt-4 border-t border-gray-200">

          {/* CANTIDAD */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Cantidad
            </p>

            <div className="inline-flex items-center border border-gray-300 rounded-lg overflow-hidden">

              <button
                type="button"
                onClick={handleDecrease}
                className="
                  w-11 h-11
                  flex
                  items-center
                  justify-center
                  hover:bg-gray-100
                  transition-colors
                  focus:outline-none
                "
              >
                {quantity === 1 ? (
                  <Trash size={18} />
                ) : (
                  <Minus size={18} />
                )}
              </button>

              <span
                className="
                  min-w-12
                  h-11
                  flex
                  items-center
                  justify-center
                  border-l
                  border-r
                  border-gray-300
                  text-lg
                  font-semibold
                "
              >
                {quantity}
              </span>

              <button
                type="button"
                onClick={handleIncrease}
                disabled={!canIncrease}
                title={
                  canIncrease
                    ? "Agregar unidad"
                    : "Stock máximo alcanzado"
                }
                className={`
                  w-11 h-11
                  flex
                  items-center
                  justify-center
                  transition-colors
                  focus:outline-none

                  ${
                    canIncrease
                      ? "hover:bg-gray-100 cursor-pointer"
                      : "bg-gray-100 text-gray-300 cursor-not-allowed"
                  }
                `}
              >
                <Plus size={18} />
              </button>

            </div>

            {!canIncrease && (
              <p className="text-xs text-gray-500 mt-2">
                Stock máximo alcanzado.
              </p>
            )}
          </div>

          {/* TOTAL */}
          <div className="sm:text-right">

            <p className="text-sm text-gray-500">
              Total
            </p>

            <p className="text-2xl font-bold text-gray-900">
              $
              {Number(
                totalPrice
              ).toLocaleString("es-CO")}
            </p>

          </div>

        </div>

      </section>

    </div>
  )
}