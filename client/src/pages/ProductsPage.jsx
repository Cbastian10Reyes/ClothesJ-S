import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  Filter,
  X,
} from "react-feather"

import {
  useLocation,
} from "react-router-dom"

import ProductList from "@/ui/ProductList"

import Container from "@/components/Container"

import Button from "@/components/Button"

import useClickOutside from "@/hooks/useClickOutside"

import api from "../api"

import {
  CartContext,
} from "@/App"

const sortOptions = [
  "Popular",
  "Nuevos",
  "Precio: menor a mayor",
  "Precio: mayor a menor",
]

const DEFAULT_MIN_PRICE = 0
const DEFAULT_MAX_PRICE = 500000

export default function ProductsPage() {
  const {
    cartDispatch,
  } = useContext(CartContext)

  const location =
    useLocation()

  const query =
    new URLSearchParams(
      location.search
    )

  const categoryFromUrl =
    query.get("category")

  const gender =
    query.get("gender")

  const [
    products,
    setProducts,
  ] = useState([])

  const [
    allProducts,
    setAllProducts,
  ] = useState([])

  const [
    categories,
    setCategories,
  ] = useState([])

  const [
    loadingProducts,
    setLoadingProducts,
  ] = useState(true)

  const [
    productsError,
    setProductsError,
  ] = useState("")

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState(
    categoryFromUrl || ""
  )

  const [
    selectedBrand,
    setSelectedBrand,
  ] = useState("")

  const [
    minPrice,
    setMinPrice,
  ] = useState(
    DEFAULT_MIN_PRICE
  )

  const [
    maxPrice,
    setMaxPrice,
  ] = useState(
    DEFAULT_MAX_PRICE
  )

  const [
    sort,
    setSort,
  ] = useState(0)

  const [
    showFilters,
    setShowFilters,
  ] = useState(false)

  useEffect(() => {
    setSelectedCategory(
      categoryFromUrl || ""
    )
  }, [
    categoryFromUrl,
  ])

  useEffect(() => {
    const loadCategories =
      async () => {
        try {
          const resp =
            await api.fetchCategories()

          if (
            resp?.success &&
            Array.isArray(
              resp.data
            )
          ) {
            setCategories(
              resp.data
            )
          }
        } catch (error) {
          console.error(
            "Error loading categories:",
            error
          )
        }
      }

    loadCategories()
  }, [])

  useEffect(() => {
    const loadProducts =
      async () => {
        try {
          setLoadingProducts(
            true
          )

          setProductsError("")

          const filters = {}

          if (gender) {
            filters.gender =
              gender
          }

          if (
            selectedCategory
          ) {
            filters.category =
              selectedCategory
          }

          const resp =
            await api.fetchProducts(
              filters
            )

          if (
            resp?.success &&
            Array.isArray(
              resp.data
            )
          ) {
            setAllProducts(
              resp.data
            )
          } else {
            setAllProducts([])

            setProductsError(
              resp?.message ||
                "No fue posible cargar los productos."
            )
          }
        } catch (error) {
          console.error(
            "Error loading products:",
            error
          )

          setAllProducts([])

          setProductsError(
            "No fue posible cargar los productos."
          )
        } finally {
          setLoadingProducts(
            false
          )
        }
      }

    loadProducts()
  }, [
    gender,
    selectedCategory,
  ])

  const availableBrands =
    useMemo(() => {
      return [
        ...new Set(
          allProducts
            .map(
              (product) =>
                product.brand
            )
            .filter(Boolean)
        ),
      ].sort()
    }, [
      allProducts,
    ])

  useEffect(() => {
    if (
      selectedBrand &&
      !availableBrands.includes(
        selectedBrand
      )
    ) {
      setSelectedBrand("")
    }
  }, [
    availableBrands,
    selectedBrand,
  ])

  useEffect(() => {
    let filteredProducts = [
      ...allProducts,
    ]

    if (selectedBrand) {
      filteredProducts =
        filteredProducts.filter(
          (product) =>
            product.brand
              ?.toLowerCase() ===
            selectedBrand.toLowerCase()
        )
    }

    filteredProducts =
      filteredProducts.filter(
        (product) => {
          const price =
            api.getProductMinPrice(
              product
            )

          return (
            price >= minPrice &&
            price <= maxPrice
          )
        }
      )

    switch (sort) {
      case 1:
        filteredProducts.sort(
          (a, b) =>
            new Date(
              b.createdAt
            ) -
            new Date(
              a.createdAt
            )
        )
        break

      case 2:
        filteredProducts.sort(
          (a, b) =>
            api.getProductMinPrice(
              a
            ) -
            api.getProductMinPrice(
              b
            )
        )
        break

      case 3:
        filteredProducts.sort(
          (a, b) =>
            api.getProductMinPrice(
              b
            ) -
            api.getProductMinPrice(
              a
            )
        )
        break

      default:
        break
    }

    setProducts(
      filteredProducts
    )
  }, [
    allProducts,
    selectedBrand,
    minPrice,
    maxPrice,
    sort,
  ])

  const addToCart = (
    product,
    quantity = 1
  ) => {
    cartDispatch({
      type: "ADD_PRODUCTS",

      payload: [
        {
          ...product,
          quantity,
        },
      ],
    })
  }

  const clearFilters = () => {
    setSelectedCategory("")
    setSelectedBrand("")
    setMinPrice(
      DEFAULT_MIN_PRICE
    )
    setMaxPrice(
      DEFAULT_MAX_PRICE
    )
  }

  return (
    <main>

      <Container
        heading={
          gender
            ? `Moda ${
                gender ===
                "Masculino"
                  ? "Hombre"
                  : "Mujer"
              }`
            : selectedCategory
              ? "Productos de la categoría"
              : "Todos los Productos"
        }
        type="page"
      >

        <section className="flex justify-between items-center mb-6">

          <Button
            secondary
            onClick={() =>
              setShowFilters(
                true
              )
            }
          >
            <Filter
              width={20}
              height={20}
              className="mr-2"
            />

            Filtros
          </Button>

        </section>

        {/* CONTENIDO PRODUCTOS */}
        {loadingProducts ? (
          <ProductsLoadingSkeleton />
        ) : productsError ? (
          <div className="text-center py-16">

            <p className="text-red-600 font-semibold">
              No fue posible cargar los productos.
            </p>

            <p className="text-gray-500 text-sm mt-2">
              Intenta nuevamente en unos segundos.
            </p>

          </div>
        ) : products.length > 0 ? (
          <ProductList
            products={
              products
            }
            onAddToCart={
              addToCart
            }
          />
        ) : (
          <div className="text-center py-16 text-gray-500">
            No se encontraron productos con los filtros seleccionados.
          </div>
        )}

      </Container>

      {/* FILTROS */}
      {showFilters && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40"
            onClick={() =>
              setShowFilters(
                false
              )
            }
          />

          <aside
            className="
              fixed
              top-0
              left-0
              z-50
              w-full
              max-w-sm
              h-full
              bg-white
              shadow-2xl
              overflow-y-auto
            "
          >

            <div className="flex justify-between items-center px-6 py-5 border-b border-gray-200">

              <div>

                <h2 className="text-2xl font-bold">
                  Filtros
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Encuentra lo que estás buscando
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowFilters(
                    false
                  )
                }
                className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
              >
                <X />
              </button>

            </div>

            <div className="p-6 space-y-8">

              {/* CATEGORÍA */}
              <div>

                <h3 className="font-bold text-lg mb-4">
                  Categoría
                </h3>

                <select
                  value={
                    selectedCategory
                  }
                  onChange={(
                    event
                  ) => {
                    setSelectedCategory(
                      event.target.value
                    )

                    setSelectedBrand(
                      ""
                    )
                  }}
                  className="
                    w-full
                    border
                    border-gray-300
                    rounded-lg
                    px-4
                    py-3
                    bg-white
                    focus:outline-none
                    focus:ring-2
                    focus:ring-gray-800
                  "
                >
                  <option value="">
                    Todas las categorías
                  </option>

                  {categories.map(
                    (
                      category
                    ) => (
                      <option
                        key={
                          category._id
                        }
                        value={
                          category._id
                        }
                      >
                        {
                          category.name
                        }
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* MARCA */}
              <div>

                <h3 className="font-bold text-lg mb-4">
                  Marca
                </h3>

                <select
                  value={
                    selectedBrand
                  }
                  onChange={(
                    event
                  ) =>
                    setSelectedBrand(
                      event.target.value
                    )
                  }
                  className="
                    w-full
                    border
                    border-gray-300
                    rounded-lg
                    px-4
                    py-3
                    bg-white
                    focus:outline-none
                    focus:ring-2
                    focus:ring-gray-800
                  "
                >
                  <option value="">
                    Todas las marcas
                  </option>

                  {availableBrands.map(
                    (brand) => (
                      <option
                        key={
                          brand
                        }
                        value={
                          brand
                        }
                      >
                        {brand}
                      </option>
                    )
                  )}

                </select>

                {selectedCategory && (
                  <p className="text-xs text-gray-500 mt-2">
                    Se muestran únicamente las marcas disponibles en esta categoría.
                  </p>
                )}

              </div>

              {/* PRECIO */}
              <div>

                <h3 className="font-bold text-lg mb-2">
                  Rango de precios
                </h3>

                <div className="flex justify-between text-sm text-gray-600 mb-4">

                  <span>
                    $
                    {Number(
                      minPrice
                    ).toLocaleString(
                      "es-CO"
                    )}
                  </span>

                  <span>
                    $
                    {Number(
                      maxPrice
                    ).toLocaleString(
                      "es-CO"
                    )}
                  </span>

                </div>

                <div className="space-y-5">

                  <div>

                    <label className="text-sm text-gray-500">
                      Precio mínimo
                    </label>

                    <input
                      type="range"
                      min={
                        DEFAULT_MIN_PRICE
                      }
                      max={
                        DEFAULT_MAX_PRICE
                      }
                      step="10000"
                      value={
                        minPrice
                      }
                      onChange={(
                        event
                      ) => {
                        const value =
                          Number(
                            event.target.value
                          )

                        if (
                          value <=
                          maxPrice
                        ) {
                          setMinPrice(
                            value
                          )
                        }
                      }}
                      className="w-full mt-2"
                    />

                  </div>

                  <div>

                    <label className="text-sm text-gray-500">
                      Precio máximo
                    </label>

                    <input
                      type="range"
                      min={
                        DEFAULT_MIN_PRICE
                      }
                      max={
                        DEFAULT_MAX_PRICE
                      }
                      step="10000"
                      value={
                        maxPrice
                      }
                      onChange={(
                        event
                      ) => {
                        const value =
                          Number(
                            event.target.value
                          )

                        if (
                          value >=
                          minPrice
                        ) {
                          setMaxPrice(
                            value
                          )
                        }
                      }}
                      className="w-full mt-2"
                    />

                  </div>

                </div>

              </div>

            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex space-x-3">

              <Button
                secondary
                className="flex-1"
                onClick={
                  clearFilters
                }
              >
                Limpiar
              </Button>

              <Button
                className="flex-1"
                onClick={() =>
                  setShowFilters(
                    false
                  )
                }
              >
                Ver productos
              </Button>

            </div>

          </aside>
        </>
      )}

    </main>
  )
}

function ProductsLoadingSkeleton() {
  return (
    <div
      className="
        grid
        grid-cols-2
        sm:grid-cols-2
        md:grid-cols-3
        lg:grid-cols-4
        gap-4
      "
    >

      {Array.from({
        length: 8,
      }).map(
        (_, index) => (
          <div
            key={index}
            className="animate-pulse"
          >

            <div className="w-full aspect-[3/4] bg-gray-200 rounded-lg" />

            <div className="mt-3 h-4 bg-gray-200 rounded w-3/4" />

            <div className="mt-2 h-4 bg-gray-200 rounded w-1/2" />

            <div className="mt-3 h-5 bg-gray-200 rounded w-1/3" />

          </div>
        )
      )}

    </div>
  )
}