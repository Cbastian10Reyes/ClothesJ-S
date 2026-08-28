import React from "react"

import { Link } from "react-router-dom"

import { Search } from "react-feather"

import clsx from "clsx"

import Card from "./Card"

export default function Product({
  link,
  name,
  imgSrc,
  price,
  originalPrice,
  discount,
}) {
  const hasDiscount =
    Number(discount) > 0

  return (
    <Card
      imgSrc={imgSrc}
      className={clsx(
        "!max-w-72 !max-h-xs",
        "rounded-lg m-2"
      )}
    >
      {/* ETIQUETA DE DESCUENTO */}
      {hasDiscount && (
        <div
          className={clsx(
            "absolute top-4 right-4 z-20",
            "bg-red-600 text-white",
            "px-3 py-2 rounded-lg",
            "text-sm font-bold",
            "shadow-lg"
          )}
        >
          -{discount}%
        </div>
      )}

      {/* ACCIÓN */}
      <div
        className={clsx(
          "absolute inset-0 text-black text-center",
          "flex flex-col justify-center items-center",
          "opacity-0 transition ease-out",
          "group-hover:(opacity-100 bg-black/20)"
        )}
      >
        <Link to={link}>
          <ProductButton>
            <Search className="min-w-8" />
          </ProductButton>
        </Link>
      </div>

      {/* INFORMACIÓN */}
      <div
        className={clsx(
          "absolute bottom-0 left-0 right-0",
          "bg-black/70 text-white p-4"
        )}
      >
        <p className="font-semibold truncate">
          {name}
        </p>

        {hasDiscount ? (
          <div className="flex items-center gap-3 mt-1">

            {/* PRECIO ORIGINAL */}
            <span className="text-sm text-gray-300 line-through">
              $
              {Number(
                originalPrice
              ).toLocaleString("es-CO")}
            </span>

            {/* PRECIO CON DESCUENTO */}
            <span className="font-bold text-lg">
              $
              {Math.round(
                price
              ).toLocaleString("es-CO")}
            </span>

          </div>
        ) : (
          <p className="font-bold mt-1">
            $
            {Number(
              price
            ).toLocaleString("es-CO")}
          </p>
        )}
      </div>
    </Card>
  )
}

function ProductButton({
  children,
  className,
  ...props
}) {
  return (
    <button
      className={`
        m-6 bg-white w-12 h-12
        flex justify-center items-center
        rounded-full
        transition-all duration-300
        ease-out
        hover:(px-14)
        focus:outline-none
        ${className ?? ""}
      `}
      {...props}
    >
      {children}
    </button>
  )
}