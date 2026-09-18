import React, {
  useEffect,
  useState,
} from "react"

import {
  Eye,
  Package,
  ShoppingBag,
} from "react-feather"

import {
  useNavigate,
} from "react-router-dom"

import api from "@/api"

import Button from "@/components/Button"

import {
  useAdminAuth,
} from "@/context/AdminAuthContext"

export default function AdminOrdersPage() {
  const navigate = useNavigate()

  const {
    token,
    logout,
  } = useAdminAuth()

  const [orders, setOrders] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true)
        setError("")

        const response =
          await api.fetchOrders(
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
              "No fue posible cargar los pedidos."
          )

          return
        }

        setOrders(
          Array.isArray(
            response?.data
          )
            ? response.data
            : []
        )
      } catch (error) {
        console.error(
          "Error loading orders:",
          error
        )

        setError(
          "No fue posible cargar los pedidos."
        )
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [
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
      "es-CO"
    )
  }

  const getStatusClasses = (
    status
  ) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700"

      case "CONFIRMED":
        return "bg-blue-100 text-blue-700"

      case "COMPLETED":
        return "bg-green-100 text-green-700"

      case "CANCELLED":
        return "bg-red-100 text-red-700"

      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  const getStatusLabel = (
    status
  ) => {
    switch (status) {
      case "PENDING":
        return "Pendiente"

      case "CONFIRMED":
        return "Confirmado"

      case "COMPLETED":
        return "Completado"

      case "CANCELLED":
        return "Cancelado"

      default:
        return status || "-"
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">
          Cargando pedidos...
        </p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4">

      <div className="max-w-7xl mx-auto">

        {/* CABECERA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Pedidos
            </h1>

            <p className="text-gray-500 mt-1">
              Consulta los pedidos realizados en CLOTHES J&S.
            </p>
          </div>

          <Button
            secondary
            onClick={() =>
              navigate(
                "/admin/products"
              )
            }
          >
            <Package className="mr-2" />

            Productos
          </Button>

        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* SIN PEDIDOS */}
        {!orders.length ? (
          <section className="bg-white border border-gray-200 rounded-2xl p-10 text-center">

            <ShoppingBag
              size={40}
              className="mx-auto text-gray-400"
            />

            <h2 className="text-xl font-bold text-gray-900 mt-4">
              No hay pedidos
            </h2>

            <p className="text-gray-500 mt-2">
              Los pedidos de tus clientes aparecerán aquí.
            </p>

          </section>
        ) : (
          <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-gray-50 border-b border-gray-200">

                  <tr>

                    <th className="text-left text-sm font-semibold text-gray-600 px-5 py-4">
                      Pedido
                    </th>

                    <th className="text-left text-sm font-semibold text-gray-600 px-5 py-4">
                      Cliente
                    </th>

                    <th className="text-left text-sm font-semibold text-gray-600 px-5 py-4">
                      Teléfono
                    </th>

                    <th className="text-left text-sm font-semibold text-gray-600 px-5 py-4">
                      Total
                    </th>

                    <th className="text-left text-sm font-semibold text-gray-600 px-5 py-4">
                      Estado
                    </th>

                    <th className="text-left text-sm font-semibold text-gray-600 px-5 py-4">
                      Fecha
                    </th>

                    <th className="text-right text-sm font-semibold text-gray-600 px-5 py-4">
                      Acciones
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-gray-200">

                  {orders.map(
                    (order) => (
                      <tr
                        key={
                          order._id
                        }
                        className="hover:bg-gray-50"
                      >

                        <td className="px-5 py-4">

                          <p className="font-semibold text-gray-900">
                            {
                              order.orderNumber
                            }
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
                            {order.items?.length ||
                              0}{" "}
                            producto(s)
                          </p>

                        </td>

                        <td className="px-5 py-4 text-gray-700">
                          {
                            order.customer
                              ?.name ||
                            "-"
                          }
                        </td>

                        <td className="px-5 py-4 text-gray-700">
                          {
                            order.customer
                              ?.phone ||
                            "-"
                          }
                        </td>

                        <td className="px-5 py-4 font-semibold text-gray-900">
                          $
                          {formatPrice(
                            order.total
                          )}
                        </td>

                        <td className="px-5 py-4">

                          <span
                            className={`
                              inline-flex
                              px-3
                              py-1
                              rounded-full
                              text-xs
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

                        </td>

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {formatDate(
                            order.createdAt
                          )}
                        </td>

                        <td className="px-5 py-4">

                          <div className="flex justify-end">

                            <button
                              type="button"
                              title="Ver pedido"
                              onClick={() =>
                                navigate(
                                  `/admin/orders/${order._id}`
                                )
                              }
                              className="
                                w-10
                                h-10
                                flex
                                items-center
                                justify-center
                                rounded-lg
                                border
                                border-gray-300
                                text-gray-600
                                hover:bg-gray-100
                                transition-colors
                              "
                            >
                              <Eye
                                size={18}
                              />
                            </button>

                          </div>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

          </section>
        )}

      </div>

    </main>
  )
}