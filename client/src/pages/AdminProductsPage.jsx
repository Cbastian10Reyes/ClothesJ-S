import React, {
  useEffect,
  useState,
} from "react"

import {
  Edit2,
  Plus,
  Trash2,
  X,
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

export default function AdminProductsPage() {
  const navigate = useNavigate()

  const {
    token,
    logout,
  } = useAdminAuth()

  const [products, setProducts] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")

  const [deletingId, setDeletingId] =
    useState(null)

  const [
    productToDelete,
    setProductToDelete,
  ] = useState(null)

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError("")

      const response =
        await api.fetchProducts()

      if (
        response?.status === "error" ||
        !response?.success ||
        !Array.isArray(
          response?.data
        )
      ) {
        setError(
          response?.message ||
            "No fue posible cargar los productos."
        )

        return
      }

      setProducts(
        response.data
      )
    } catch (error) {
      console.error(
        "Error loading products:",
        error
      )

      setError(
        "No fue posible cargar los productos."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const openDeleteModal = (
    product
  ) => {
    setError("")

    setProductToDelete(
      product
    )
  }

  const closeDeleteModal = () => {
    if (deletingId) {
      return
    }

    setProductToDelete(null)
  }

  const handleDelete = async () => {
    if (!productToDelete) {
      return
    }

    try {
      setDeletingId(
        productToDelete._id
      )

      setError("")

      const response =
        await api.deleteProduct(
          productToDelete._id,
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
            "No fue posible eliminar el producto."
        )

        return
      }

      setProducts(
        (currentProducts) =>
          currentProducts.filter(
            (currentProduct) =>
              currentProduct._id !==
              productToDelete._id
          )
      )

      setProductToDelete(null)
    } catch (error) {
      console.error(
        "Delete product error:",
        error
      )

      setError(
        "Ocurrió un error eliminando el producto."
      )
    } finally {
      setDeletingId(null)
    }
  }

  const getImage = (
    product
  ) => {
    return (
      api.getProductPrimaryImage(
        product
      ) || null
    )
  }

  const getPrice = (
    product
  ) => {
    const price =
      api.getProductMinPrice(
        product
      )

    return Number(
      price
    ).toLocaleString(
      "es-CO"
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">

        <p className="text-gray-500">
          Cargando productos...
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
              Productos
            </h1>

            <p className="text-gray-500 mt-1">
              Administra los productos de la tienda.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">

            {/* PEDIDOS */}
            <Button
              secondary
              onClick={() =>
                navigate(
                  "/admin/orders"
                )
              }
            >
              <ShoppingBag
                size={18}
                className="mr-2"
              />

              Pedidos
            </Button>

            {/* CERRAR SESIÓN */}
            <Button
              secondary
              onClick={() => {
                logout()

                navigate(
                  "/admin/login",
                  {
                    replace: true,
                  }
                )
              }}
            >
              Cerrar sesión
            </Button>

            {/* CREAR PRODUCTO */}
            <Button
              onClick={() =>
                navigate(
                  "/admin/products/create"
                )
              }
            >
              <Plus className="mr-2" />

              Crear producto
            </Button>

          </div>

        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* SIN PRODUCTOS */}
        {!products.length ? (
          <section className="bg-white border border-gray-200 rounded-2xl p-10 text-center">

            <h2 className="text-xl font-bold text-gray-900">
              No hay productos
            </h2>

            <p className="text-gray-500 mt-2">
              Crea tu primer producto para comenzar.
            </p>

            <Button
              className="mt-6"
              onClick={() =>
                navigate(
                  "/admin/products/create"
                )
              }
            >
              <Plus className="mr-2" />

              Crear producto
            </Button>

          </section>
        ) : (
          <>
            {/* DESKTOP */}
            <section className="hidden md:block bg-white border border-gray-200 rounded-2xl overflow-hidden">

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead className="bg-gray-50 border-b border-gray-200">

                    <tr>

                      <th className="text-left text-sm font-semibold text-gray-600 px-5 py-4">
                        Producto
                      </th>

                      <th className="text-left text-sm font-semibold text-gray-600 px-5 py-4">
                        Categoría
                      </th>

                      <th className="text-left text-sm font-semibold text-gray-600 px-5 py-4">
                        Marca
                      </th>

                      <th className="text-left text-sm font-semibold text-gray-600 px-5 py-4">
                        Precio
                      </th>

                      <th className="text-left text-sm font-semibold text-gray-600 px-5 py-4">
                        Stock
                      </th>

                      <th className="text-left text-sm font-semibold text-gray-600 px-5 py-4">
                        Estado
                      </th>

                      <th className="text-right text-sm font-semibold text-gray-600 px-5 py-4">
                        Acciones
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-gray-200">

                    {products.map(
                      (product) => {
                        const image =
                          getImage(
                            product
                          )

                        return (
                          <tr
                            key={
                              product._id
                            }
                            className="hover:bg-gray-50"
                          >

                            {/* PRODUCTO */}
                            <td className="px-5 py-4">

                              <div className="flex items-center gap-4">

                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">

                                  {image ? (
                                    <img
                                      src={image}
                                      alt={
                                        product.name
                                      }
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                                      Sin imagen
                                    </div>
                                  )}

                                </div>

                                <div>

                                  <p className="font-semibold text-gray-900">
                                    {
                                      product.name
                                    }
                                  </p>

                                  <p className="text-sm text-gray-500">
                                    {
                                      product.gender
                                    }
                                  </p>

                                  {Number(
                                    product.discount
                                  ) > 0 && (
                                    <span className="inline-block mt-1 text-xs font-semibold text-red-600">
                                      -
                                      {
                                        product.discount
                                      }
                                      %
                                    </span>
                                  )}

                                </div>

                              </div>

                            </td>

                            {/* CATEGORÍA */}
                            <td className="px-5 py-4 text-gray-700">
                              {
                                product
                                  .category
                                  ?.name ||
                                "-"
                              }
                            </td>

                            {/* MARCA */}
                            <td className="px-5 py-4 text-gray-700">
                              {
                                product.brand ||
                                "-"
                              }
                            </td>

                            {/* PRECIO */}
                            <td className="px-5 py-4 font-semibold text-gray-900">
                              $
                              {
                                getPrice(
                                  product
                                )
                              }
                            </td>

                            {/* STOCK */}
                            <td className="px-5 py-4 text-gray-700">
                              {
                                api.getProductStock(
                                  product
                                )
                              }
                            </td>

                            {/* ESTADO */}
                            <td className="px-5 py-4">

                              <span
                                className={`
                                  inline-flex
                                  px-3
                                  py-1
                                  rounded-full
                                  text-xs
                                  font-semibold

                                  ${
                                    product.isActive
                                      ? "bg-green-100 text-green-700"
                                      : "bg-gray-200 text-gray-600"
                                  }
                                `}
                              >
                                {product.isActive
                                  ? "Activo"
                                  : "Inactivo"}
                              </span>

                            </td>

                            {/* ACCIONES */}
                            <td className="px-5 py-4">

                              <div className="flex justify-end gap-2">

                                <button
                                  type="button"
                                  title="Editar producto"
                                  onClick={() =>
                                    navigate(
                                      `/admin/products/${product._id}/edit`
                                    )
                                  }
                                  className="
                                    w-10 h-10
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
                                  <Edit2
                                    size={18}
                                  />
                                </button>

                                <button
                                  type="button"
                                  title="Eliminar producto"
                                  disabled={
                                    deletingId ===
                                    product._id
                                  }
                                  onClick={() =>
                                    openDeleteModal(
                                      product
                                    )
                                  }
                                  className="
                                    w-10 h-10
                                    flex
                                    items-center
                                    justify-center
                                    rounded-lg
                                    border
                                    border-red-200
                                    text-red-600
                                    hover:bg-red-50
                                    transition-colors
                                    disabled:opacity-40
                                  "
                                >
                                  <Trash2
                                    size={18}
                                  />
                                </button>

                              </div>

                            </td>

                          </tr>
                        )
                      }
                    )}

                  </tbody>

                </table>

              </div>

            </section>

            {/* MOBILE */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">

              {products.map(
                (product) => {
                  const image =
                    getImage(
                      product
                    )

                  return (
                    <article
                      key={
                        product._id
                      }
                      className="bg-white border border-gray-200 rounded-2xl overflow-hidden"
                    >

                      <div className="h-56 bg-gray-100">

                        {image ? (
                          <img
                            src={image}
                            alt={
                              product.name
                            }
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            Sin imagen
                          </div>
                        )}

                      </div>

                      <div className="p-4">

                        <div className="flex justify-between gap-3">

                          <div>

                            <h2 className="font-bold text-gray-900">
                              {
                                product.name
                              }
                            </h2>

                            <p className="text-sm text-gray-500 mt-1">
                              {
                                product.brand ||
                                "Sin marca"
                              }
                            </p>

                          </div>

                          {Number(
                            product.discount
                          ) > 0 && (
                            <span className="h-fit bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded">
                              -
                              {
                                product.discount
                              }
                              %
                            </span>
                          )}

                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-4 text-sm">

                          <div>
                            <p className="text-gray-500">
                              Categoría
                            </p>

                            <p className="font-semibold">
                              {
                                product
                                  .category
                                  ?.name ||
                                "-"
                              }
                            </p>
                          </div>

                          <div>
                            <p className="text-gray-500">
                              Precio
                            </p>

                            <p className="font-semibold">
                              $
                              {
                                getPrice(
                                  product
                                )
                              }
                            </p>
                          </div>

                          <div>
                            <p className="text-gray-500">
                              Stock
                            </p>

                            <p className="font-semibold">
                              {
                                api.getProductStock(
                                  product
                                )
                              }
                            </p>
                          </div>

                          <div>
                            <p className="text-gray-500">
                              Estado
                            </p>

                            <p
                              className={
                                product.isActive
                                  ? "font-semibold text-green-600"
                                  : "font-semibold text-gray-500"
                              }
                            >
                              {product.isActive
                                ? "Activo"
                                : "Inactivo"}
                            </p>
                          </div>

                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-5">

                          <Button
                            secondary
                            onClick={() =>
                              navigate(
                                `/admin/products/${product._id}/edit`
                              )
                            }
                          >
                            <Edit2
                              size={17}
                              className="mr-2"
                            />

                            Editar
                          </Button>

                          <Button
                            secondary
                            disabled={
                              deletingId ===
                              product._id
                            }
                            onClick={() =>
                              openDeleteModal(
                                product
                              )
                            }
                          >
                            <Trash2
                              size={17}
                              className="mr-2"
                            />

                            Eliminar
                          </Button>

                        </div>

                      </div>

                    </article>
                  )
                }
              )}

            </section>
          </>
        )}

      </div>

      {/* MODAL ELIMINAR PRODUCTO */}
      {productToDelete && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/50
            px-4
            py-6
          "
          onClick={
            closeDeleteModal
          }
        >

          <div
            className="
              relative
              bg-white
              w-full
              max-w-md
              rounded-2xl
              shadow-2xl
              p-6
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* CERRAR */}
            <button
              type="button"
              disabled={
                Boolean(
                  deletingId
                )
              }
              onClick={
                closeDeleteModal
              }
              className="
                absolute
                top-4
                right-4
                w-9
                h-9
                flex
                items-center
                justify-center
                rounded-full
                text-gray-400
                hover:bg-gray-100
                hover:text-gray-700
                transition-colors
                disabled:opacity-40
              "
            >
              <X size={20} />
            </button>

            {/* ICONO */}
            <div
              className="
                w-14
                h-14
                rounded-full
                bg-red-100
                flex
                items-center
                justify-center
              "
            >
              <Trash2
                size={26}
                className="text-red-600"
              />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mt-5">
              Eliminar producto
            </h2>

            <p className="text-gray-600 mt-2 leading-relaxed">
              ¿Seguro que deseas eliminar este producto?
            </p>

            {/* PRODUCTO */}
            <div className="flex items-center gap-4 mt-5 bg-gray-50 border border-gray-200 rounded-xl p-3">

              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">

                {getImage(
                  productToDelete
                ) ? (
                  <img
                    src={getImage(
                      productToDelete
                    )}
                    alt={
                      productToDelete.name
                    }
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                    Sin imagen
                  </div>
                )}

              </div>

              <div className="min-w-0">

                <p className="font-bold text-gray-900 truncate">
                  {
                    productToDelete.name
                  }
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  {
                    productToDelete.brand ||
                    "Sin marca"
                  }
                </p>

                <p className="text-sm font-semibold text-gray-900 mt-1">
                  $
                  {
                    getPrice(
                      productToDelete
                    )
                  }
                </p>

              </div>

            </div>

            {/* ADVERTENCIA */}
            <div className="mt-5 rounded-lg bg-red-50 border border-red-100 px-4 py-3">

              <p className="text-sm text-red-700">
                Esta acción eliminará definitivamente el producto y sus imágenes. No se puede deshacer.
              </p>

            </div>

            {/* BOTONES */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">

              <Button
                secondary
                className="flex-1"
                disabled={
                  Boolean(
                    deletingId
                  )
                }
                onClick={
                  closeDeleteModal
                }
              >
                Cancelar
              </Button>

              <button
                type="button"
                disabled={
                  deletingId ===
                  productToDelete._id
                }
                onClick={
                  handleDelete
                }
                className="
                  flex-1
                  min-h-11
                  rounded-lg
                  bg-red-600
                  text-white
                  font-semibold
                  px-4
                  py-3
                  transition-colors
                  hover:bg-red-700
                  focus:outline-none
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >
                {deletingId ===
                productToDelete._id
                  ? "Eliminando..."
                  : "Eliminar producto"}
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  )
}