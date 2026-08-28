import React, {
  useContext,
  useState,
} from "react"

import { Link } from "react-router-dom"

import { ShoppingBag } from "react-feather"

import { CartContext } from "@/App"

import CartList from "@/ui/CartList"

import CartSummary from "@/ui/CartSummary"

import Button from "@/components/Button"

import PageHeader from "@/components/PageHeader"

import api from "@/api"

import {
  sendOrderToWhatsApp,
} from "@/utils/whatsapp"

const initialCustomer = {
  name: "",
  phone: "",
  email: "",
  city: "",
  address: "",
  notes: "",
}

export default function CartPage() {
  const [
    showWhatsAppConfirmation,
    setShowWhatsAppConfirmation,
  ] = useState(false)

  const [
    customer,
    setCustomer,
  ] = useState(initialCustomer)

  const [
    creatingOrder,
    setCreatingOrder,
  ] = useState(false)

  const [
    checkoutError,
    setCheckoutError,
  ] = useState("")

  const { cart, cartDispatch } =
    useContext(CartContext)

  const setProductQuantity = (
    productId,
    variantId,
    quantity
  ) => {
    const product = cart.products.find(
      (item) =>
        item._id === productId &&
        item.selectedVariant?._id === variantId
    )

    if (!product) {
      return
    }

    const stock =
      Number(
        product.selectedVariant?.stock
      ) || 0

    if (quantity < 1) {
      cartDispatch({
        type: "REMOVE_PRODUCT",
        payload: {
          productId,
          variantId,
        },
      })

      return
    }

    const safeQuantity = Math.min(
      quantity,
      stock
    )

    cartDispatch({
      type: "SET_PRODUCT_QUANTITY",
      payload: {
        productId,
        variantId,
        quantity: safeQuantity,
      },
    })
  }

  const removeProduct = (
    productId,
    variantId
  ) => {
    cartDispatch({
      type: "REMOVE_PRODUCT",
      payload: {
        productId,
        variantId,
      },
    })
  }

  const handleCustomerChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target

    setCustomer(
      (currentCustomer) => ({
        ...currentCustomer,
        [name]: value,
      })
    )
  }

  const validateCustomerForm = () => {
    if (!customer.name.trim()) {
      return "Ingresa tu nombre."
    }

    if (!customer.phone.trim()) {
      return "Ingresa tu número de teléfono."
    }

    return null
  }

  const buildOrderData = () => {
    return {
      customer: {
        name:
          customer.name.trim(),

        phone:
          customer.phone.trim(),

        email:
          customer.email.trim() ||
          undefined,

        city:
          customer.city.trim() ||
          undefined,

        address:
          customer.address.trim() ||
          undefined,

        notes:
          customer.notes.trim() ||
          undefined,
      },

      items: cart.products.map(
        (product) => ({
          productId:
            product._id,

          variantId:
            product.selectedVariant?._id,

          quantity:
            Number(
              product.quantity
            ) || 1,
        })
      ),
    }
  }

  const handleCheckout = async () => {
    const validationError =
      validateCustomerForm()

    if (validationError) {
      setCheckoutError(
        validationError
      )

      return
    }

    if (!cart?.products?.length) {
      setCheckoutError(
        "Tu carrito está vacío."
      )

      return
    }

    try {
      setCreatingOrder(true)
      setCheckoutError("")

      const orderData =
        buildOrderData()

      const resp =
        await api.createOrder(
          orderData
        )

      if (
        resp?.status === "error" ||
        !resp?.success ||
        !resp?.data
      ) {
        setCheckoutError(
          resp?.message ||
            "No fue posible crear el pedido."
        )

        return
      }

      const createdOrder =
        resp.data

      setShowWhatsAppConfirmation(
        false
      )

      sendOrderToWhatsApp(
        cart.products,
        createdOrder.total,
        createdOrder.orderNumber
      )
    } catch (error) {
      console.error(
        "Error creando pedido:",
        error
      )

      setCheckoutError(
        "Ocurrió un error creando el pedido. Intenta nuevamente."
      )
    } finally {
      setCreatingOrder(false)
    }
  }

  const openCheckoutModal = () => {
    setCheckoutError("")

    setShowWhatsAppConfirmation(
      true
    )
  }

  const closeCheckoutModal = () => {
    if (creatingOrder) {
      return
    }

    setShowWhatsAppConfirmation(
      false
    )

    setCheckoutError("")
  }

  if (!cart?.products?.length) {
    return (
      <main className="min-h-screen flex flex-col items-center text-center my-14 p-4">

        <PageHeader>
          Tu carrito de compras está vacío
        </PageHeader>

        <Link to="/products">
          <Button
            link
            className="text-xl"
          >
            <ShoppingBag className="mr-2" />

            Continuar comprando
          </Button>
        </Link>

      </main>
    )
  }

  return (
    <main className="my-14">

      <PageHeader>
        Tu carrito de compras
      </PageHeader>

      <section className="max-w-6xl mx-auto my-16 relative gap-8 flex flex-col p-4 md:(flex-row items-start)">

        {/* PRODUCTOS */}
        <section className="flex-1 sm:min-w-md divide-y divide-gray-200 border border-gray-300 rounded-lg shadow-sm overflow-hidden">

          <CartList
            items={cart.products}

            setItemQuantity={(
              productId,
              variantId,
              quantity
            ) =>
              setProductQuantity(
                productId,
                variantId,
                quantity
              )
            }

            removeItem={(
              productId,
              variantId
            ) =>
              removeProduct(
                productId,
                variantId
              )
            }
          />

        </section>

        {/* RESUMEN */}
        <section className="w-full md:w-auto border border-gray-300 rounded-lg shadow-sm py-4 md:(sticky top-20)">

          <CartSummary
            onCheckout={
              openCheckoutModal
            }
            subtotal={cart.total}
            charges={[]}
            discounts={[]}
          />

        </section>

      </section>

      {/* CHECKOUT */}
      {showWhatsAppConfirmation && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-start
            justify-center
            bg-black/50
            px-4
            py-10
            overflow-y-auto
          "
          onClick={
            closeCheckoutModal
          }
        >

          <div
            className="
              bg-white
              w-full
              max-w-lg
              rounded-2xl
              shadow-2xl
              p-6
              my-8
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <h2 className="text-2xl font-bold text-gray-900">
              Finalizar pedido
            </h2>

            <p className="text-gray-600 mt-3 leading-relaxed">
              Completa tus datos para
              registrar el pedido. Después
              te redirigiremos a WhatsApp
              para coordinar la entrega y
              el método de pago.
            </p>

            {/* DATOS CLIENTE */}
            <div className="mt-6 space-y-4">

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Nombre *
                </label>

                <input
                  type="text"
                  name="name"
                  value={customer.name}
                  onChange={
                    handleCustomerChange
                  }
                  placeholder="Tu nombre"
                  className="
                    w-full
                    border
                    border-gray-300
                    rounded-lg
                    px-4
                    py-3
                    focus:outline-none
                    focus:border-gray-800
                  "
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Teléfono *
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={customer.phone}
                  onChange={
                    handleCustomerChange
                  }
                  placeholder="Ej. 3243788203"
                  className="
                    w-full
                    border
                    border-gray-300
                    rounded-lg
                    px-4
                    py-3
                    focus:outline-none
                    focus:border-gray-800
                  "
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Correo
                </label>

                <input
                  type="email"
                  name="email"
                  value={customer.email}
                  onChange={
                    handleCustomerChange
                  }
                  placeholder="correo@ejemplo.com"
                  className="
                    w-full
                    border
                    border-gray-300
                    rounded-lg
                    px-4
                    py-3
                    focus:outline-none
                    focus:border-gray-800
                  "
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Ciudad
                </label>

                <input
                  type="text"
                  name="city"
                  value={customer.city}
                  onChange={
                    handleCustomerChange
                  }
                  placeholder="Ciudad"
                  className="
                    w-full
                    border
                    border-gray-300
                    rounded-lg
                    px-4
                    py-3
                    focus:outline-none
                    focus:border-gray-800
                  "
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Dirección
                </label>

                <input
                  type="text"
                  name="address"
                  value={customer.address}
                  onChange={
                    handleCustomerChange
                  }
                  placeholder="Dirección de entrega"
                  className="
                    w-full
                    border
                    border-gray-300
                    rounded-lg
                    px-4
                    py-3
                    focus:outline-none
                    focus:border-gray-800
                  "
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Notas
                </label>

                <textarea
                  name="notes"
                  value={customer.notes}
                  onChange={
                    handleCustomerChange
                  }
                  placeholder="Información adicional sobre tu pedido"
                  rows={3}
                  className="
                    w-full
                    border
                    border-gray-300
                    rounded-lg
                    px-4
                    py-3
                    resize-none
                    focus:outline-none
                    focus:border-gray-800
                  "
                />
              </div>

            </div>

            {/* RESUMEN */}
            <div className="mt-6 rounded-lg bg-gray-100 px-4 py-3">

              <div className="flex justify-between text-sm text-gray-600">

                <span>
                  Unidades
                </span>

                <span className="font-semibold text-gray-900">
                  {cart.products.reduce(
                    (
                      total,
                      product
                    ) =>
                      total +
                      (Number(
                        product.quantity
                      ) || 0),
                    0
                  )}
                </span>

              </div>

              <div className="flex justify-between mt-2">

                <span className="font-semibold text-gray-700">
                  Total estimado
                </span>

                <span className="text-xl font-bold text-gray-900">
                  $
                  {Number(
                    cart.total
                  ).toLocaleString(
                    "es-CO"
                  )}
                </span>

              </div>

            </div>

            {/* ERROR */}
            {checkoutError && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                {checkoutError}
              </div>
            )}

            {/* ACCIONES */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">

              <Button
                secondary
                className="flex-1"
                disabled={
                  creatingOrder
                }
                onClick={
                  closeCheckoutModal
                }
              >
                Cancelar
              </Button>

              <Button
                className="flex-1"
                disabled={
                  creatingOrder
                }
                onClick={
                  handleCheckout
                }
              >
                {creatingOrder
                  ? "Creando pedido..."
                  : "Continuar a WhatsApp"}
              </Button>

            </div>

          </div>

        </div>
      )}

    </main>
  )
}