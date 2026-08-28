import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom"

import {
  Check,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  X,
} from "react-feather"

import Button from "@/components/Button"

import Loader from "@/components/Loader"

import api from "../api"

import { CartContext } from "@/App"

export default function ProductDetailsPage() {
  const { cart, cartDispatch } =
    useContext(CartContext)

  const navigate = useNavigate()

  const { id } = useParams()

  const [product, setProduct] =
    useState(null)

  const [selectedColor, setSelectedColor] =
    useState("")

  const [selectedSize, setSelectedSize] =
    useState("")

  const [currentImageIndex, setCurrentImageIndex] =
    useState(0)

  useEffect(() => {
    const loadProduct = async () => {
      const resp = await api.fetchProduct(id)

      if (
        resp?.status === "error" ||
        !resp?.success ||
        !resp?.data
      ) {
        navigate("/404", {
          replace: true,
        })

        return
      }

      setProduct(resp.data)
      setCurrentImageIndex(0)
    }

    loadProduct()
  }, [id, navigate])

  const productImages = useMemo(() => {
    if (!product?.images?.length) {
      return []
    }

    return [...product.images].sort(
      (a, b) =>
        Number(b.isPrimary) -
        Number(a.isPrimary)
    )
  }, [product])

  const availableColors = useMemo(() => {
    if (!product?.variants?.length) {
      return []
    }

    const colors = new Map()

    product.variants.forEach((variant) => {
      if (
        variant.color &&
        !colors.has(variant.color)
      ) {
        colors.set(variant.color, {
          name: variant.color,
          codeColor:
            variant.codeColor ||
            "#D1D5DB",
        })
      }
    })

    return Array.from(colors.values())
  }, [product])

  const availableSizes = useMemo(() => {
  if (!product?.variants?.length) {
    return []
  }

  return [
    ...new Set(
      product.variants
        .map((variant) => variant.size)
        .filter(Boolean)
    ),
  ]
}, [product])

  const selectedVariant = useMemo(() => {
    if (
      !product ||
      !selectedColor ||
      !selectedSize
    ) {
      return null
    }

    return product.variants?.find(
      (variant) =>
        variant.color === selectedColor &&
        variant.size === selectedSize
    )
  }, [
    product,
    selectedColor,
    selectedSize,
  ])

  const price = useMemo(() => {
    if (!product) {
      return 0
    }

    if (selectedVariant) {
      return Number(selectedVariant.price) || 0
    }

    return api.getProductMinPrice(product)
  }, [product, selectedVariant])

  const discount =
    Number(product?.discount) || 0

  const hasDiscount =
    discount > 0

  const discountedPrice = useMemo(() => {
    if (!hasDiscount) {
      return price
    }

    return (
      price -
      (price * discount) / 100
    )
  }, [
    price,
    discount,
    hasDiscount,
  ])

  const isInCart =
    cart?.products?.some(
      (cartProduct) =>
        cartProduct._id === id &&
        cartProduct.selectedVariant?._id ===
          selectedVariant?._id
    ) ?? false

  const getVariantBySize = (size) => {
    if (!selectedColor) {
      return null
    }

    return product?.variants?.find(
      (variant) =>
        variant.color === selectedColor &&
        variant.size === size
    )
  }

  const handleSelectColor = (color) => {
    setSelectedColor(color)
    setSelectedSize("")
  }

  const handleSelectSize = (size) => {
    const variant =
      getVariantBySize(size)

    if (
      !variant ||
      variant.stock <= 0
    ) {
      return
    }

    setSelectedSize(size)
  }

  const nextImage = () => {
    if (productImages.length <= 1) {
      return
    }

    setCurrentImageIndex(
      (currentIndex) =>
        currentIndex ===
        productImages.length - 1
          ? 0
          : currentIndex + 1
    )
  }

  const previousImage = () => {
    if (productImages.length <= 1) {
      return
    }

    setCurrentImageIndex(
      (currentIndex) =>
        currentIndex === 0
          ? productImages.length - 1
          : currentIndex - 1
    )
  }

  const addToCart = () => {
    if (!selectedVariant) {
      return
    }

    cartDispatch({
      type: "ADD_PRODUCTS",
      payload: [
        {
          ...product,

          selectedVariant,

          selectedColor:
            selectedVariant.color,

          selectedCodeColor:
            selectedVariant.codeColor,

          selectedSize:
            selectedVariant.size,

          originalPrice:
            Number(selectedVariant.price),

          finalPrice:
            hasDiscount
              ? Math.round(
                  discountedPrice
                )
              : Number(
                  selectedVariant.price
                ),

          discount,

          quantity: 1,
        },
      ],
    })
  }

  if (!product) {
    return <Loader />
  }

  return (
    <main className="relative mb-20">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 py-12 px-6 max-w-7xl mx-auto">

        {/* GALERÍA DE IMÁGENES */}
        <section className="relative flex items-center justify-center overflow-hidden rounded-2xl bg-gray-100">

          {/* DESCUENTO */}
          {hasDiscount && (
            <div
              className="
                absolute top-5 right-5 z-20
                bg-red-600 text-white
                px-4 py-2
                rounded-lg
                font-bold
                shadow-lg
              "
            >
              -{discount}%
            </div>
          )}

          {productImages.length > 0 ? (
            <>
              <img
                className="
                  w-full
                  h-full
                  max-h-[700px]
                  object-cover
                  transition-opacity
                  duration-300
                "
                src={
                  productImages[
                    currentImageIndex
                  ]?.url
                }
                alt={`${product.name} ${
                  currentImageIndex + 1
                }`}
              />

              {/* FLECHA IZQUIERDA */}
              {productImages.length > 1 && (
                <button
                  type="button"
                  onClick={previousImage}
                  aria-label="Imagen anterior"
                  className="
                    absolute
                    left-4
                    top-1/2
                    transform
                    -translate-y-1/2
                    z-20
                    w-12 h-12
                    flex
                    items-center
                    justify-center
                    rounded-full
                    bg-black/50
                    text-white
                    shadow-lg
                    transition-all
                    duration-200
                    hover:(bg-black/75 scale-105)
                    focus:outline-none
                  "
                >
                  <ChevronLeft
                    width={30}
                    height={30}
                  />
                </button>
              )}

              {/* FLECHA DERECHA */}
              {productImages.length > 1 && (
                <button
                  type="button"
                  onClick={nextImage}
                  aria-label="Siguiente imagen"
                  className="
                    absolute
                    right-4
                    top-1/2
                    transform
                    -translate-y-1/2
                    z-20
                    w-12 h-12
                    flex
                    items-center
                    justify-center
                    rounded-full
                    bg-black/50
                    text-white
                    shadow-lg
                    transition-all
                    duration-200
                    hover:(bg-black/75 scale-105)
                    focus:outline-none
                  "
                >
                  <ChevronRight
                    width={30}
                    height={30}
                  />
                </button>
              )}

              {/* INDICADORES */}
              {productImages.length > 1 && (
                <div
                  className="
                    absolute
                    bottom-5
                    left-1/2
                    transform
                    -translate-x-1/2
                    z-20
                    flex
                    items-center
                    gap-2
                    bg-black/30
                    rounded-full
                    px-3
                    py-2
                  "
                >
                  {productImages.map(
                    (image, index) => (
                      <button
                        key={
                          image.publicId ||
                          index
                        }
                        type="button"
                        aria-label={`Ver imagen ${
                          index + 1
                        }`}
                        onClick={() =>
                          setCurrentImageIndex(
                            index
                          )
                        }
                        className={`
                          h-2.5
                          rounded-full
                          transition-all
                          duration-200
                          focus:outline-none

                          ${
                            currentImageIndex ===
                            index
                              ? "w-7 bg-white"
                              : "w-2.5 bg-white/60 hover:bg-white"
                          }
                        `}
                      />
                    )
                  )}
                </div>
              )}

              {/* CONTADOR */}
              {productImages.length > 1 && (
                <div
                  className="
                    absolute
                    bottom-5
                    right-5
                    z-20
                    bg-black/50
                    text-white
                    text-sm
                    px-3
                    py-1
                    rounded-full
                  "
                >
                  {currentImageIndex + 1}
                  {" / "}
                  {productImages.length}
                </div>
              )}
            </>
          ) : (
            <div className="h-96 w-full flex items-center justify-center text-gray-400">
              Imagen no disponible
            </div>
          )}

        </section>

        {/* INFORMACIÓN */}
        <section className="flex flex-col justify-center space-y-6">

          <div>
            {product.brand && (
              <p className="text-sm uppercase tracking-widest text-gray-500 mb-2">
                {product.brand}
              </p>
            )}

            <h1 className="text-4xl font-bold text-gray-900">
              {product.name}
            </h1>
          </div>

          <p className="text-lg text-gray-600 leading-relaxed">
            {product.description}
          </p>

          {/* PRECIO */}
          <div>
            {hasDiscount ? (
              <div className="flex items-center gap-4">

                <span className="text-xl text-gray-400 line-through">
                  $
                  {Number(
                    price
                  ).toLocaleString("es-CO")}
                </span>

                <span className="text-3xl font-bold text-red-600">
                  $
                  {Math.round(
                    discountedPrice
                  ).toLocaleString("es-CO")}
                </span>

              </div>
            ) : (
              <span className="text-3xl font-bold text-gray-900">
                $
                {Number(
                  price
                ).toLocaleString("es-CO")}
              </span>
            )}
          </div>

          {/* COLORES */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Color
            </h3>

            <div className="flex flex-wrap gap-4">
              {availableColors.map(
                (color) => {
                  const hasStock =
                    product.variants.some(
                      (variant) =>
                        variant.color ===
                          color.name &&
                        variant.stock > 0
                    )

                  const isSelected =
                    selectedColor ===
                    color.name

                  return (
                    <button
                      key={color.name}
                      type="button"
                      disabled={!hasStock}
                      title={color.name}
                      onClick={() =>
                        handleSelectColor(
                          color.name
                        )
                      }
                      className={`
                        relative
                        w-12 h-12
                        rounded-lg
                        border-2
                        transition-all
                        duration-200
                        focus:outline-none

                        ${
                          isSelected
                            ? "border-black scale-110 shadow-md"
                            : "border-gray-300"
                        }

                        ${
                          hasStock
                            ? "cursor-pointer hover:scale-105"
                            : "cursor-not-allowed opacity-40"
                        }
                      `}
                    >
                      <span
                        className="absolute inset-1 rounded-md"
                        style={{
                          backgroundColor:
                            color.codeColor,
                        }}
                      />

                      {!hasStock && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <X
                            size={28}
                            className="text-gray-700"
                          />
                        </span>
                      )}
                    </button>
                  )
                }
              )}
            </div>

            {selectedColor && (
              <p className="text-sm text-gray-500 mt-3">
                Color seleccionado:{" "}
                <span className="font-semibold text-gray-800">
                  {selectedColor}
                </span>
              </p>
            )}
          </div>

          {/* TALLAS */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Talla
            </h3>
          
            {!selectedColor && (
              <p className="text-sm text-gray-500 mb-4">
                Selecciona primero un color.
              </p>
            )}
          
            <div className="flex flex-wrap gap-3">
              {availableSizes.map((size) => {
                const variant =
                  getVariantBySize(size)
          
                const isAvailable =
                  Boolean(
                    selectedColor &&
                      variant &&
                      variant.stock > 0
                  )
          
                const isSelected =
                  selectedSize === size
          
                return (
                  <button
                    key={size}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() =>
                      handleSelectSize(size)
                    }
                    className={`
                      relative
                      min-w-14 h-14
                      px-3
                      rounded-lg
                      border-2
                      font-semibold
                      transition-all
                      duration-200
                      focus:outline-none
          
                      ${
                        isSelected
                          ? "border-black bg-black text-white"
                          : ""
                      }
          
                      ${
                        isAvailable &&
                        !isSelected
                          ? "border-gray-300 bg-white text-gray-800 hover:border-black"
                          : ""
                      }
          
                      ${
                        !isAvailable
                          ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                          : ""
                      }
                    `}
                  >
                    {size}
          
                    {!isAvailable && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <X
                          size={34}
                          className="text-gray-400 opacity-70"
                        />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* STOCK */}
          {selectedVariant && (
            <div className="rounded-lg bg-gray-100 px-4 py-3 text-gray-700">
              <span className="font-semibold">
                Disponibilidad:
              </span>{" "}
              {selectedVariant.stock}{" "}
              {selectedVariant.stock === 1
                ? "prenda"
                : "prendas"}
            </div>
          )}

          {!selectedVariant && (
            <p className="text-sm text-gray-500">
              Selecciona color y talla para
              agregar el producto al carrito.
            </p>
          )}

          {/* CARRITO */}
          {isInCart ? (
            <Link to="/cart">
              <Button
                link
                className="sm:max-w-xs text-base"
              >
                <Check className="mr-2" />

                <span>
                  Ver en carrito
                </span>
              </Button>
            </Link>
          ) : (
            <Button
              className="sm:max-w-xs text-base"
              onClick={addToCart}
              disabled={!selectedVariant}
            >
              <ShoppingCart className="opacity-80 mr-4" />

              <span>
                Agregar al carrito
              </span>
            </Button>
          )}

        </section>

      </div>

      <Button
        onClick={() =>
          navigate(-1)
        }
        className="absolute top-0 left-4 text-lg"
        secondary
      >
        <ChevronLeft className="mr-2" />

        Volver
      </Button>

    </main>
  )
}