import React, {
  useEffect,
  useState,
} from "react"

import {
  ChevronLeft,
  CheckCircle,
  Download,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Save,
  User,
} from "react-feather"

import {
  useNavigate,
  useParams,
} from "react-router-dom"

import api from "@/api"

import Button from "@/components/Button"

import {
  useAdminAuth,
} from "@/context/AdminAuthContext"

const ORDER_STATUSES = [
  {
    value: "PENDING",
    label: "Pendiente",
  },
  {
    value: "CONFIRMED",
    label: "Confirmado",
  },
  {
    value: "PREPARING",
    label: "Preparando",
  },
  {
    value: "SHIPPED",
    label: "Enviado",
  },
  {
    value: "DELIVERED",
    label: "Entregado",
  },
  {
    value: "CANCELLED",
    label: "Cancelado",
  },
]

export default function AdminOrderDetailsPage() {
  const { id } = useParams()

  const navigate = useNavigate()

  const {
    token,
    logout,
  } = useAdminAuth()

  const [order, setOrder] =
    useState(null)

  const [status, setStatus] =
    useState("")

  const [loading, setLoading] =
    useState(true)

  const [
    updatingStatus,
    setUpdatingStatus,
  ] = useState(false)

  const [
    markingWhatsapp,
    setMarkingWhatsapp,
  ] = useState(false)

  const [
    downloadingInvoice,
    setDownloadingInvoice,
  ] = useState(false)

  const [error, setError] =
    useState("")

  const [success, setSuccess] =
    useState("")

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true)
        setError("")

        const response =
          await api.fetchOrder(
            id,
            token
          )

        if (
          response?.status ===
          "error"
        ) {
          if (
            response.statusCode ===
            401
          ) {
            logout()

            navigate(
              "/admin/login",
              {
                replace: true,
              }
            )

            return
          }

          setError(
            response?.message ||
              "No fue posible cargar el pedido."
          )

          return
        }

        if (
          !response?.success ||
          !response?.data
        ) {
          setError(
            "No fue posible cargar el pedido."
          )

          return
        }

        setOrder(
          response.data
        )

        setStatus(
          response.data.status ||
            "PENDING"
        )
      } catch (error) {
        console.error(
          "Error loading order:",
          error
        )

        setError(
          "Ocurrió un error cargando el pedido."
        )
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [
    id,
    token,
    logout,
    navigate,
  ])

  const formatPrice = (
    value
  ) =>
    Number(
      value || 0
    ).toLocaleString(
      "es-CO"
    )

  const formatDate = (
    value
  ) => {
    if (!value) {
      return "-"
    }

    return new Date(
      value
    ).toLocaleString(
      "es-CO",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    )
  }

  const getStatusLabel = (
    value
  ) => {
    const statusOption =
      ORDER_STATUSES.find(
        (item) =>
          item.value === value
      )

    return (
      statusOption?.label ||
      value ||
      "-"
    )
  }

  const getStatusClasses = (
    value
  ) => {
    switch (value) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700"

      case "CONFIRMED":
        return "bg-blue-100 text-blue-700"

      case "PREPARING":
        return "bg-purple-100 text-purple-700"

      case "SHIPPED":
        return "bg-indigo-100 text-indigo-700"

      case "DELIVERED":
        return "bg-green-100 text-green-700"

      case "CANCELLED":
        return "bg-red-100 text-red-700"

      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  const isFinalStatus =
    order?.status === "DELIVERED" ||
    order?.status === "CANCELLED"

  const handleUpdateStatus =
    async () => {
      if (!order) {
        return
      }

      try {
        setUpdatingStatus(true)
        setError("")
        setSuccess("")

        const response =
          await api.updateOrderStatus(
            order._id,
            status,
            token
          )

        if (
          response?.status ===
          "error"
        ) {
          if (
            response.statusCode ===
            401
          ) {
            logout()

            navigate(
              "/admin/login",
              {
                replace: true,
              }
            )

            return
          }

          setError(
            response?.message ||
              "No fue posible actualizar el estado."
          )

          return
        }

        const updatedOrder =
          response?.data

        if (updatedOrder) {
          setOrder(
            updatedOrder
          )

          setStatus(
            updatedOrder.status
          )
        } else {
          setOrder(
            (
              currentOrder
            ) => ({
              ...currentOrder,
              status,
            })
          )
        }

        setSuccess(
          "Estado del pedido actualizado correctamente."
        )
      } catch (error) {
        console.error(
          "Update order status error:",
          error
        )

        setError(
          "Ocurrió un error actualizando el estado."
        )
      } finally {
        setUpdatingStatus(false)
      }
    }

  const handleMarkWhatsapp =
    async () => {
      if (!order) {
        return
      }

      try {
        setMarkingWhatsapp(true)
        setError("")
        setSuccess("")

        const response =
          await api.markOrderWhatsappSent(
            order._id,
            token
          )

        if (
          response?.status ===
          "error"
        ) {
          if (
            response.statusCode ===
            401
          ) {
            logout()

            navigate(
              "/admin/login",
              {
                replace: true,
              }
            )

            return
          }

          setError(
            response?.message ||
              "No fue posible actualizar WhatsApp."
          )

          return
        }

        const updatedOrder =
          response?.data

        if (updatedOrder) {
          setOrder(
            updatedOrder
          )
        } else {
          setOrder(
            (
              currentOrder
            ) => ({
              ...currentOrder,
              whatsappSent: true,
            })
          )
        }

        setSuccess(
          "Pedido marcado como enviado por WhatsApp."
        )
      } catch (error) {
        console.error(
          "Whatsapp update error:",
          error
        )

        setError(
          "Ocurrió un error actualizando WhatsApp."
        )
      } finally {
        setMarkingWhatsapp(false)
      }
    }

  const handleDownloadInvoice =
    async () => {
      if (!order) {
        return
      }

      try {
        setDownloadingInvoice(true)
        setError("")
        setSuccess("")

        const response =
          await api.downloadOrderInvoice(
            order._id,
            token
          )

        if (
          response?.status ===
          "error"
        ) {
          if (
            response.statusCode ===
            401
          ) {
            logout()

            navigate(
              "/admin/login",
              {
                replace: true,
              }
            )

            return
          }

          setError(
            response?.message ||
              "No fue posible descargar la factura."
          )

          return
        }

        if (
          !response?.success ||
          !response?.blob
        ) {
          setError(
            "No fue posible descargar la factura."
          )

          return
        }

        const url =
          URL.createObjectURL(
            response.blob
          )

        const link =
          document.createElement(
            "a"
          )

        link.href = url

        link.download =
          `Factura-${order.orderNumber}.pdf`

        document.body.appendChild(
          link
        )

        link.click()

        document.body.removeChild(
          link
        )

        URL.revokeObjectURL(
          url
        )

        setSuccess(
          "Factura descargada correctamente."
        )
      } catch (error) {
        console.error(
          "Download invoice error:",
          error
        )

        setError(
          "Ocurrió un error descargando la factura."
        )
      } finally {
        setDownloadingInvoice(false)
      }
    }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">

        <p className="text-gray-500">
          Cargando pedido...
        </p>

      </main>
    )
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-gray-100 py-10 px-4">

        <div className="max-w-4xl mx-auto">

          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">

            <h1 className="text-2xl font-bold text-gray-900">
              Pedido no disponible
            </h1>

            <p className="text-gray-500 mt-2">
              {error ||
                "No fue posible encontrar el pedido."}
            </p>

            <Button
              className="mt-6"
              onClick={() =>
                navigate(
                  "/admin/orders"
                )
              }
            >
              Volver a pedidos
            </Button>

          </div>

        </div>

      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4">

      <div className="max-w-6xl mx-auto">

        {/* CABECERA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">

          <div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admin/orders"
                )
              }
              className="
                flex
                items-center
                text-gray-500
                hover:text-gray-900
                transition-colors
                mb-3
              "
            >
              <ChevronLeft
                size={19}
                className="mr-1"
              />

              Volver a pedidos
            </button>

            <div className="flex flex-wrap items-center gap-3">

              <h1 className="text-3xl font-bold text-gray-900">
                {order.orderNumber}
              </h1>

              <span
                className={`
                  inline-flex
                  px-3
                  py-1
                  rounded-full
                  text-sm
                  font-semibold
                  ${getStatusClasses(
                    order.status
                  )}
                `}
              >
                {getStatusLabel(
                  order.status
                )}
              </span>

            </div>

            <p className="text-gray-500 mt-2">
              Creado el{" "}
              {formatDate(
                order.createdAt
              )}
            </p>

          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">

            <Button
              secondary
              disabled={
                downloadingInvoice
              }
              onClick={
                handleDownloadInvoice
              }
            >
              <Download
                size={18}
                className="mr-2"
              />

              {downloadingInvoice
                ? "Generando..."
                : "Descargar factura"}
            </Button>

            <div className="bg-white border border-gray-200 rounded-xl px-5 py-3">

              <p className="text-xs uppercase tracking-wide text-gray-500">
                Total del pedido
              </p>

              <p className="text-2xl font-bold text-gray-900 mt-1">
                $
                {formatPrice(
                  order.total
                )}
              </p>

            </div>

          </div>

        </div>

        {/* MENSAJES */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* COLUMNA PRINCIPAL */}
          <div className="lg:col-span-2 space-y-6">

            {/* PRODUCTOS */}
            <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

              <div className="p-6 border-b border-gray-200">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">

                    <Package
                      size={20}
                      className="text-gray-600"
                    />

                  </div>

                  <div>

                    <h2 className="text-xl font-bold text-gray-900">
                      Productos
                    </h2>

                    <p className="text-sm text-gray-500">
                      {order.items?.length ||
                        0}{" "}
                      producto(s) en el pedido
                    </p>

                  </div>

                </div>

              </div>

              <div className="divide-y divide-gray-200">

                {order.items?.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={
                        item._id ||
                        item.variantId ||
                        index
                      }
                      className="p-6"
                    >

                      <div className="flex flex-col sm:flex-row justify-between gap-5">

                        <div className="flex-1">

                          <h3 className="text-lg font-bold text-gray-900">
                            {
                              item.name
                            }
                          </h3>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4 text-sm">

                            <div>

                              <p className="text-gray-500">
                                Color
                              </p>

                              <p className="font-semibold text-gray-900 mt-1">
                                {
                                  item.color ||
                                  "-"
                                }
                              </p>

                            </div>

                            <div>

                              <p className="text-gray-500">
                                Talla
                              </p>

                              <p className="font-semibold text-gray-900 mt-1">
                                {
                                  item.size ||
                                  "-"
                                }
                              </p>

                            </div>

                            <div>

                              <p className="text-gray-500">
                                Cantidad
                              </p>

                              <p className="font-semibold text-gray-900 mt-1">
                                {
                                  item.quantity
                                }
                              </p>

                            </div>

                          </div>

                        </div>

                        <div className="sm:text-right min-w-36">

                          <p className="text-sm text-gray-500">
                            Precio unitario
                          </p>

                          <p className="font-semibold text-gray-900 mt-1">
                            $
                            {formatPrice(
                              item.unitPrice
                            )}
                          </p>

                          <p className="text-sm text-gray-500 mt-3">
                            Subtotal
                          </p>

                          <p className="text-xl font-bold text-gray-900 mt-1">
                            $
                            {formatPrice(
                              item.subtotal
                            )}
                          </p>

                        </div>

                      </div>

                    </div>
                  )
                )}

              </div>

              <div className="bg-gray-50 border-t border-gray-200 p-6">

                <div className="flex justify-between items-center">

                  <span className="text-lg font-semibold text-gray-700">
                    Total
                  </span>

                  <span className="text-2xl font-bold text-gray-900">
                    $
                    {formatPrice(
                      order.total
                    )}
                  </span>

                </div>

              </div>

            </section>

            {/* DATOS DEL CLIENTE */}
            <section className="bg-white border border-gray-200 rounded-2xl p-6">

              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Información del cliente
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                <CustomerInfo
                  icon={<User size={18} />}
                  label="Nombre"
                  value={
                    order.customer
                      ?.name
                  }
                />

                <CustomerInfo
                  icon={<Phone size={18} />}
                  label="Teléfono"
                  value={
                    order.customer
                      ?.phone
                  }
                />

                <CustomerInfo
                  icon={<Mail size={18} />}
                  label="Correo"
                  value={
                    order.customer
                      ?.email
                  }
                />

                <CustomerInfo
                  icon={<MapPin size={18} />}
                  label="Ciudad"
                  value={
                    order.customer
                      ?.city
                  }
                />

                <div className="sm:col-span-2">

                  <CustomerInfo
                    icon={<MapPin size={18} />}
                    label="Dirección"
                    value={
                      order.customer
                        ?.address
                    }
                  />

                </div>

                {order.customer
                  ?.notes && (
                  <div className="sm:col-span-2">

                    <p className="text-sm text-gray-500">
                      Notas
                    </p>

                    <div className="mt-2 bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-700">
                      {
                        order.customer
                          .notes
                      }
                    </div>

                  </div>
                )}

              </div>

            </section>

          </div>

          {/* COLUMNA LATERAL */}
          <aside className="space-y-6">

            {/* ESTADO */}
            <section className="bg-white border border-gray-200 rounded-2xl p-6">

              <h2 className="text-lg font-bold text-gray-900">
                Estado del pedido
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Actualiza el estado según avance el pedido.
              </p>

              <select
                value={status}
                disabled={
                  isFinalStatus
                }
                onChange={(event) =>
                  setStatus(
                    event.target.value
                  )
                }
                className="
                  w-full
                  mt-5
                  border
                  border-gray-300
                  rounded-lg
                  px-4
                  py-3
                  bg-white
                  focus:outline-none
                  focus:border-gray-900
                  disabled:bg-gray-100
                  disabled:text-gray-500
                  disabled:cursor-not-allowed
                "
              >
                {ORDER_STATUSES.map(
                  (statusOption) => (
                    <option
                      key={
                        statusOption.value
                      }
                      value={
                        statusOption.value
                      }
                    >
                      {
                        statusOption.label
                      }
                    </option>
                  )
                )}
              </select>

              <Button
                className="w-full mt-4"
                disabled={
                  updatingStatus ||
                  isFinalStatus ||
                  status ===
                    order.status
                }
                onClick={
                  handleUpdateStatus
                }
              >
                <Save
                  size={18}
                  className="mr-2"
                />

                {updatingStatus
                  ? "Guardando..."
                  : "Actualizar estado"}
              </Button>

              {isFinalStatus && (
                <p className="text-sm text-gray-500 mt-3">
                  Este pedido ya se encuentra en un estado final y no puede modificarse.
                </p>
              )}

            </section>

            {/* WHATSAPP */}
            <section className="bg-white border border-gray-200 rounded-2xl p-6">

              <div className="flex items-center gap-3">

                <div
                  className={`
                    w-11
                    h-11
                    rounded-full
                    flex
                    items-center
                    justify-center

                    ${
                      order.whatsappSent
                        ? "bg-green-100"
                        : "bg-gray-100"
                    }
                  `}
                >
                  {order.whatsappSent ? (
                    <CheckCircle
                      size={21}
                      className="text-green-600"
                    />
                  ) : (
                    <MessageCircle
                      size={21}
                      className="text-gray-600"
                    />
                  )}
                </div>

                <div>

                  <h2 className="font-bold text-gray-900">
                    WhatsApp
                  </h2>

                  <p
                    className={
                      order.whatsappSent
                        ? "text-sm text-green-600"
                        : "text-sm text-gray-500"
                    }
                  >
                    {order.whatsappSent
                      ? "Mensaje enviado"
                      : "Pendiente de envío"}
                  </p>

                </div>

              </div>

              {!order.whatsappSent && (
                <Button
                  secondary
                  className="w-full mt-5"
                  disabled={
                    markingWhatsapp
                  }
                  onClick={
                    handleMarkWhatsapp
                  }
                >
                  <MessageCircle
                    size={18}
                    className="mr-2"
                  />

                  {markingWhatsapp
                    ? "Actualizando..."
                    : "Marcar como enviado"}
                </Button>
              )}

            </section>

            {/* INFORMACIÓN */}
            <section className="bg-white border border-gray-200 rounded-2xl p-6">

              <h2 className="font-bold text-gray-900">
                Información
              </h2>

              <div className="space-y-4 mt-4 text-sm">

                <div>

                  <p className="text-gray-500">
                    Número de pedido
                  </p>

                  <p className="font-semibold text-gray-900 mt-1">
                    {
                      order.orderNumber
                    }
                  </p>

                </div>

                <div>

                  <p className="text-gray-500">
                    Origen
                  </p>

                  <p className="font-semibold text-gray-900 mt-1">
                    {
                      order.source ||
                      "-"
                    }
                  </p>

                </div>

                <div>

                  <p className="text-gray-500">
                    Fecha de creación
                  </p>

                  <p className="font-semibold text-gray-900 mt-1">
                    {formatDate(
                      order.createdAt
                    )}
                  </p>

                </div>

                {order.updatedAt && (
                  <div>

                    <p className="text-gray-500">
                      Última actualización
                    </p>

                    <p className="font-semibold text-gray-900 mt-1">
                      {formatDate(
                        order.updatedAt
                      )}
                    </p>

                  </div>
                )}

              </div>

            </section>

          </aside>

        </div>

      </div>

    </main>
  )
}

function CustomerInfo({
  icon,
  label,
  value,
}) {
  return (
    <div className="flex items-start gap-3">

      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 flex-shrink-0">
        {icon}
      </div>

      <div className="min-w-0">

        <p className="text-sm text-gray-500">
          {label}
        </p>

        <p className="font-semibold text-gray-900 mt-1 break-words">
          {value || "-"}
        </p>

      </div>

    </div>
  )
}