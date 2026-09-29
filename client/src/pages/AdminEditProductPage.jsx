import React, {
  useEffect,
  useState,
} from "react"

import {
  Plus,
  Trash2,
  Upload,
  ChevronLeft,
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

/*
 * =========================
 * TALLAS
 * =========================
 */

const SIZE_GROUPS = [
  {
    label: "Ropa",
    sizes: [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "XXL",
    ],
  },

  {
    label: "Jeans",
    sizes: [
      "28",
      "30",
      "32",
      "34",
      "36",
      "38",
      "40",
      "42",
    ],
  },

  {
    label: "Calzado",
    sizes: [
      "35",
      "36",
      "37",
      "38",
      "39",
      "40",
      "41",
      "42",
      "43",
      "44",
    ],
  },
]

const EMPTY_COLOR = {
  name: "",
  code: "#000000",
}

const createEmptyColorway = () => ({
  colors: [
    {
      ...EMPTY_COLOR,
    },
  ],

  selectedSizes: [],

  stockBySize: {},

  /*
   * Aquí guardamos el _id original
   * de cada variante según la talla.
   *
   * Ejemplo:
   * {
   *   "38": "mongoId...",
   *   "39": "mongoId..."
   * }
   */
  variantIdsBySize: {},

  price: 0,
})

/*
 * =========================
 * NOMBRE AUTOMÁTICO
 * =========================
 */

const buildColorwayName = (
  colors
) => {
  return colors
    .map(
      (color) =>
        color.name?.trim()
    )
    .filter(Boolean)
    .join(" / ")
}

/*
 * =========================
 * COMPATIBILIDAD LEGACY
 * =========================
 *
 * Productos antiguos:
 *
 * color: "Negro"
 * codeColor: "#000000"
 *
 * Productos nuevos:
 *
 * colors: [
 *   {
 *     name: "Negro",
 *     code: "#000000"
 *   }
 * ]
 */

const getVariantColors = (
  variant
) => {
  if (
    Array.isArray(
      variant.colors
    ) &&
    variant.colors.length >
      0
  ) {
    return variant.colors.map(
      (color) => ({
        name:
          color.name || "",

        code:
          color.code ||
          "#000000",
      })
    )
  }

  return [
    {
      name:
        variant.color ||
        "Color",

      code:
        variant.codeColor ||
        "#000000",
    },
  ]
}

/*
 * =========================
 * VARIANTS -> COLORWAYS
 * =========================
 */

const buildColorwaysFromVariants = (
  variants = []
) => {
  if (
    !Array.isArray(
      variants
    ) ||
    variants.length === 0
  ) {
    return [
      createEmptyColorway(),
    ]
  }

  const groups =
    new Map()

  variants.forEach(
    (variant) => {
      const colors =
        getVariantColors(
          variant
        )

      const colorwayName =
        variant.color ||
        buildColorwayName(
          colors
        )

      /*
       * Incluimos el precio en la llave
       * para no mezclar variantes antiguas
       * del mismo color que tuvieran
       * precios diferentes.
       */
      const price =
        Number(
          variant.price
        ) || 0

      const normalizedColors =
        colors
          .map(
            (color) =>
              `${color.name
                ?.trim()
                .toLowerCase()}-${color.code
                ?.trim()
                .toLowerCase()}`
          )
          .join("|")

      const key =
        `${colorwayName
          .trim()
          .toLowerCase()}|${normalizedColors}|${price}`

      if (
        !groups.has(key)
      ) {
        groups.set(
          key,
          {
            colors,

            selectedSizes:
              [],

            stockBySize:
              {},

            variantIdsBySize:
              {},

            price,
          }
        )
      }

      const colorway =
        groups.get(key)

      const size =
        String(
          variant.size ||
          ""
        )
          .trim()
          .toUpperCase()

      if (!size) {
        return
      }

      if (
        !colorway.selectedSizes.includes(
          size
        )
      ) {
        colorway.selectedSizes.push(
          size
        )
      }

      colorway.stockBySize[
        size
      ] =
        Number(
          variant.stock
        ) || 0

      if (
        variant._id
      ) {
        colorway.variantIdsBySize[
          size
        ] =
          variant._id
      }
    }
  )

  return Array.from(
    groups.values()
  )
}

export default function AdminEditProductPage() {
  const navigate =
    useNavigate()

  const {
    id,
  } = useParams()

  const {
    token,
    logout,
  } = useAdminAuth()

  const [
    categories,
    setCategories,
  ] = useState([])

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    submitting,
    setSubmitting,
  ] = useState(false)

  const [
    error,
    setError,
  ] = useState("")

  const [
    success,
    setSuccess,
  ] = useState("")

  const [
    newImages,
    setNewImages,
  ] = useState([])

  const [
    newImagePreviews,
    setNewImagePreviews,
  ] = useState([])

  const [
    currentImages,
    setCurrentImages,
  ] = useState([])

  const [
    form,
    setForm,
  ] = useState({
    name: "",
    description: "",
    gender: "",
    category: "",
    brand: "",
    discount: 0,
    isActive: true,
    isFeatured: false,

    colorways: [
      createEmptyColorway(),
    ],
  })

  /*
   * =========================
   * CARGAR PRODUCTO
   * =========================
   */

  useEffect(() => {
    const loadData =
      async () => {
        try {
          setLoading(
            true
          )

          setError("")

          const [
            productResponse,
            categoriesResponse,
          ] =
            await Promise.all([
              api.fetchProduct(
                id
              ),

              api.fetchCategories(),
            ])

          if (
            productResponse?.status ===
              "error" ||
            !productResponse?.success ||
            !productResponse?.data
          ) {
            setError(
              productResponse?.message ||
                "No fue posible cargar el producto."
            )

            return
          }

          if (
            categoriesResponse?.status ===
              "error" ||
            !categoriesResponse?.success ||
            !Array.isArray(
              categoriesResponse?.data
            )
          ) {
            setError(
              categoriesResponse?.message ||
                "No fue posible cargar las categorías."
            )

            return
          }

          const product =
            productResponse.data

          setCategories(
            categoriesResponse.data.filter(
              (category) =>
                category.isActive !==
                false
            )
          )

          setCurrentImages(
            product.images || []
          )

          setForm({
            name:
              product.name || "",

            description:
              product.description ||
              "",

            gender:
              product.gender || "",

            category:
              product.category?._id ||
              product.category ||
              "",

            brand:
              product.brand || "",

            discount:
              Number(
                product.discount
              ) || 0,

            isActive:
              product.isActive !==
              false,

            isFeatured:
              Boolean(
                product.isFeatured
              ),

            colorways:
              buildColorwaysFromVariants(
                product.variants
              ),
          })
        } catch (
          error
        ) {
          console.error(
            "Error loading product:",
            error
          )

          setError(
            "No fue posible cargar la información del producto."
          )
        } finally {
          setLoading(
            false
          )
        }
      }

    loadData()
  }, [
    id,
  ])

  /*
   * =========================
   * LIMPIAR PREVIEWS
   * =========================
   */

  useEffect(() => {
    return () => {
      newImagePreviews.forEach(
        (preview) => {
          URL.revokeObjectURL(
            preview
          )
        }
      )
    }
  }, [
    newImagePreviews,
  ])

  /*
   * =========================
   * INPUTS GENERALES
   * =========================
   */

  const handleInputChange = (
    event
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target

    setForm(
      (
        currentForm
      ) => ({
        ...currentForm,

        [name]:
          type ===
          "checkbox"
            ? checked
            : value,
      })
    )
  }

  /*
   * =========================
   * COLORWAYS
   * =========================
   */

  const addColorway =
    () => {
      setForm(
        (
          currentForm
        ) => ({
          ...currentForm,

          colorways: [
            ...currentForm.colorways,
            createEmptyColorway(),
          ],
        })
      )
    }

  const removeColorway = (
    colorwayIndex
  ) => {
    if (
      form.colorways
        .length === 1
    ) {
      setError(
        "El producto debe tener al menos una combinación de color."
      )

      return
    }

    setError("")

    setForm(
      (
        currentForm
      ) => ({
        ...currentForm,

        colorways:
          currentForm.colorways.filter(
            (
              _colorway,
              index
            ) =>
              index !==
              colorwayIndex
          ),
      })
    )
  }

  /*
   * =========================
   * COLORES
   * =========================
   */

  const addColor = (
    colorwayIndex
  ) => {
    setForm(
      (
        currentForm
      ) => {
        const colorways =
          currentForm.colorways.map(
            (
              colorway,
              index
            ) => {
              if (
                index !==
                colorwayIndex
              ) {
                return colorway
              }

              if (
                colorway.colors
                  .length >= 4
              ) {
                return colorway
              }

              return {
                ...colorway,

                colors: [
                  ...colorway.colors,

                  {
                    ...EMPTY_COLOR,
                  },
                ],
              }
            }
          )

        return {
          ...currentForm,
          colorways,
        }
      }
    )
  }

  const removeColor = (
    colorwayIndex,
    colorIndex
  ) => {
    setForm(
      (
        currentForm
      ) => {
        const colorways =
          currentForm.colorways.map(
            (
              colorway,
              index
            ) => {
              if (
                index !==
                colorwayIndex
              ) {
                return colorway
              }

              if (
                colorway.colors
                  .length === 1
              ) {
                return colorway
              }

              return {
                ...colorway,

                colors:
                  colorway.colors.filter(
                    (
                      _color,
                      indexColor
                    ) =>
                      indexColor !==
                      colorIndex
                  ),
              }
            }
          )

        return {
          ...currentForm,
          colorways,
        }
      }
    )
  }

  const handleColorChange = (
    colorwayIndex,
    colorIndex,
    field,
    value
  ) => {
    setForm(
      (
        currentForm
      ) => {
        const colorways =
          currentForm.colorways.map(
            (
              colorway,
              index
            ) => {
              if (
                index !==
                colorwayIndex
              ) {
                return colorway
              }

              const colors =
                colorway.colors.map(
                  (
                    color,
                    indexColor
                  ) => {
                    if (
                      indexColor !==
                      colorIndex
                    ) {
                      return color
                    }

                    return {
                      ...color,

                      [field]:
                        value,
                    }
                  }
                )

              return {
                ...colorway,
                colors,
              }
            }
          )

        return {
          ...currentForm,
          colorways,
        }
      }
    )
  }

  /*
   * =========================
   * TALLAS
   * =========================
   */

  const toggleSize = (
    colorwayIndex,
    size
  ) => {
    setForm(
      (
        currentForm
      ) => {
        const colorways =
          currentForm.colorways.map(
            (
              colorway,
              index
            ) => {
              if (
                index !==
                colorwayIndex
              ) {
                return colorway
              }

              const alreadySelected =
                colorway.selectedSizes.includes(
                  size
                )

              if (
                alreadySelected
              ) {
                const {
                  [size]:
                    _stock,
                  ...remainingStock
                } =
                  colorway.stockBySize

                const {
                  [size]:
                    _variantId,
                  ...remainingIds
                } =
                  colorway.variantIdsBySize

                return {
                  ...colorway,

                  selectedSizes:
                    colorway.selectedSizes.filter(
                      (
                        selectedSize
                      ) =>
                        selectedSize !==
                        size
                    ),

                  stockBySize:
                    remainingStock,

                  /*
                   * Si el usuario desmarca la talla,
                   * la variante dejará de enviarse,
                   * por lo que el backend la elimina
                   * del arreglo de variantes.
                   */
                  variantIdsBySize:
                    remainingIds,
                }
              }

              return {
                ...colorway,

                selectedSizes: [
                  ...colorway.selectedSizes,
                  size,
                ],

                stockBySize: {
                  ...colorway.stockBySize,

                  [size]:
                    colorway
                      .stockBySize[
                      size
                    ] ?? 0,
                },
              }
            }
          )

        return {
          ...currentForm,
          colorways,
        }
      }
    )
  }

  /*
   * =========================
   * STOCK
   * =========================
   */

  const handleStockChange = (
    colorwayIndex,
    size,
    value
  ) => {
    setForm(
      (
        currentForm
      ) => {
        const colorways =
          currentForm.colorways.map(
            (
              colorway,
              index
            ) => {
              if (
                index !==
                colorwayIndex
              ) {
                return colorway
              }

              return {
                ...colorway,

                stockBySize: {
                  ...colorway.stockBySize,

                  [size]:
                    Number(
                      value
                    ),
                },
              }
            }
          )

        return {
          ...currentForm,
          colorways,
        }
      }
    )
  }

  /*
   * =========================
   * PRECIO
   * =========================
   */

  const handleColorwayPriceChange =
    (
      colorwayIndex,
      value
    ) => {
      setForm(
        (
          currentForm
        ) => {
          const colorways =
            currentForm.colorways.map(
              (
                colorway,
                index
              ) => {
                if (
                  index !==
                  colorwayIndex
                ) {
                  return colorway
                }

                return {
                  ...colorway,

                  price:
                    Number(
                      value
                    ),
                }
              }
            )

          return {
            ...currentForm,
            colorways,
          }
        }
      )
    }

  /*
   * =========================
   * IMÁGENES
   * =========================
   */

  const handleImagesChange = (
    event
  ) => {
    const selectedFiles =
      Array.from(
        event.target.files ||
          []
      )

    newImagePreviews.forEach(
      (preview) => {
        URL.revokeObjectURL(
          preview
        )
      }
    )

    setNewImages(
      selectedFiles
    )

    setNewImagePreviews(
      selectedFiles.map(
        (file) =>
          URL.createObjectURL(
            file
          )
      )
    )
  }

  /*
   * =========================
   * VALIDACIÓN
   * =========================
   */

  const validateForm =
    () => {
      if (
        !form.name.trim()
      ) {
        return "El nombre es obligatorio."
      }

      if (
        !form.description.trim()
      ) {
        return "La descripción es obligatoria."
      }

      if (
        !form.gender.trim()
      ) {
        return "Selecciona el género."
      }

      if (
        !form.category
      ) {
        return "Selecciona una categoría."
      }

      const discount =
        Number(
          form.discount
        )

      if (
        Number.isNaN(
          discount
        ) ||
        discount < 0 ||
        discount > 100
      ) {
        return "El descuento debe estar entre 0 y 100."
      }

      if (
        !form.colorways
          .length
      ) {
        return "Debe existir al menos una combinación de color."
      }

      const colorwayNames =
        new Set()

      for (
        let index = 0;
        index <
        form.colorways.length;
        index += 1
      ) {
        const colorway =
          form.colorways[
            index
          ]

        if (
          !Array.isArray(
            colorway.colors
          ) ||
          colorway.colors
            .length < 1 ||
          colorway.colors
            .length > 4
        ) {
          return `La combinación ${
            index + 1
          } debe tener entre 1 y 4 colores.`
        }

        const internalColors =
          new Set()

        for (
          let colorIndex = 0;
          colorIndex <
          colorway.colors
            .length;
          colorIndex += 1
        ) {
          const color =
            colorway.colors[
              colorIndex
            ]

          if (
            !color.name?.trim()
          ) {
            return `Ingresa el nombre del color ${
              colorIndex + 1
            } de la combinación ${
              index + 1
            }.`
          }

          if (
            !color.code?.trim()
          ) {
            return `Ingresa el código del color ${
              colorIndex + 1
            } de la combinación ${
              index + 1
            }.`
          }

          const validHex =
            /^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(
              color.code.trim()
            )

          if (!validHex) {
            return `El código ${color.code} no es un color hexadecimal válido.`
          }

          const internalKey =
            `${color.name
              .trim()
              .toLowerCase()}-${color.code
              .trim()
              .toLowerCase()}`

          if (
            internalColors.has(
              internalKey
            )
          ) {
            return `El color "${color.name}" está repetido dentro de la combinación ${
              index + 1
            }.`
          }

          internalColors.add(
            internalKey
          )
        }

        const colorwayName =
          buildColorwayName(
            colorway.colors
          )

        const normalizedName =
          colorwayName
            .toLowerCase()

        if (
          colorwayNames.has(
            normalizedName
          )
        ) {
          return `La combinación "${colorwayName}" está repetida.`
        }

        colorwayNames.add(
          normalizedName
        )

        if (
          colorway.selectedSizes
            .length === 0
        ) {
          return `Selecciona al menos una talla para "${colorwayName}".`
        }

        if (
          Number.isNaN(
            Number(
              colorway.price
            )
          ) ||
          Number(
            colorway.price
          ) < 0
        ) {
          return `El precio de "${colorwayName}" no es válido.`
        }

        for (
          const size of
          colorway.selectedSizes
        ) {
          const stock =
            Number(
              colorway
                .stockBySize[
                size
              ]
            )

          if (
            Number.isNaN(
              stock
            ) ||
            stock < 0
          ) {
            return `El stock de la talla ${size} en "${colorwayName}" no es válido.`
          }
        }
      }

      return null
    }

  /*
   * =========================
   * COLORWAYS -> VARIANTS
   * =========================
   */

  const buildVariants =
    () => {
      return form.colorways.flatMap(
        (
          colorway
        ) => {
          const colors =
            colorway.colors.map(
              (color) => ({
                name:
                  color.name
                    .trim(),

                code:
                  color.code
                    .trim()
                    .toUpperCase(),
              })
            )

          const color =
            buildColorwayName(
              colors
            )

          return colorway.selectedSizes.map(
            (size) => {
              const variant = {
                color,

                colors,

                size:
                  size
                    .trim()
                    .toUpperCase(),

                stock:
                  Number(
                    colorway
                      .stockBySize[
                      size
                    ]
                  ) || 0,

                price:
                  Number(
                    colorway.price
                  ) || 0,
              }

              /*
               * Variante que ya existía:
               * conserva su Mongo _id.
               */
              const existingId =
                colorway
                  .variantIdsBySize[
                  size
                ]

              if (
                existingId
              ) {
                variant._id =
                  existingId
              }

              return variant
            }
          )
        }
      )
    }

  /*
   * =========================
   * GUARDAR
   * =========================
   */

  const handleSubmit =
    async (
      event
    ) => {
      event.preventDefault()

      const validationError =
        validateForm()

      if (
        validationError
      ) {
        setError(
          validationError
        )

        setSuccess("")

        return
      }

      try {
        setSubmitting(
          true
        )

        setError("")
        setSuccess("")

        const productData = {
          name:
            form.name.trim(),

          description:
            form.description.trim(),

          gender:
            form.gender.trim(),

          category:
            form.category,

          brand:
            form.brand.trim(),

          discount:
            Number(
              form.discount
            ) || 0,

          isActive:
            form.isActive,

          isFeatured:
            form.isFeatured,

          variants:
            buildVariants(),
        }

        const response =
          await api.updateProduct(
            id,
            productData,
            newImages,
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
              "No fue posible actualizar el producto."
          )

          return
        }

        setSuccess(
          "Producto actualizado correctamente."
        )

        setTimeout(
          () => {
            navigate(
              "/admin/products"
            )
          },
          1000
        )
      } catch (
        error
      ) {
        console.error(
          "Update product error:",
          error
        )

        setError(
          "Ocurrió un error actualizando el producto."
        )
      } finally {
        setSubmitting(
          false
        )
      }
    }

  /*
   * =========================
   * LOADING
   * =========================
   */

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">

        <p className="text-gray-500">
          Cargando producto...
        </p>

      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4">

      <div className="max-w-6xl mx-auto">

        {/* CABECERA */}
        <div className="flex items-center justify-between mb-8">

          <div>

            <h1 className="text-3xl font-bold text-gray-900">
              Editar producto
            </h1>

            <p className="text-gray-500 mt-1">
              Actualiza la información del producto.
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
            <ChevronLeft className="mr-2" />

            Volver
          </Button>

        </div>

        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-8"
        >

          {/* =============================== */}
          {/* INFORMACIÓN GENERAL */}
          {/* =============================== */}

          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">

            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Información general
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre *
                </label>

                <input
                  type="text"
                  name="name"
                  value={
                    form.name
                  }
                  onChange={
                    handleInputChange
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-gray-900"
                />

              </div>

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Marca
                </label>

                <input
                  type="text"
                  name="brand"
                  value={
                    form.brand
                  }
                  onChange={
                    handleInputChange
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-gray-900"
                />

              </div>

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Género *
                </label>

                <select
                  name="gender"
                  value={
                    form.gender
                  }
                  onChange={
                    handleInputChange
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white focus:outline-none focus:border-gray-900"
                >
                  <option value="">
                    Selecciona género
                  </option>

                  <option value="Masculino">
                    Masculino
                  </option>

                  <option value="Femenino">
                    Femenino
                  </option>

                  <option value="Unisex">
                    Unisex
                  </option>

                </select>

              </div>

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Categoría *
                </label>

                <select
                  name="category"
                  value={
                    form.category
                  }
                  onChange={
                    handleInputChange
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white focus:outline-none focus:border-gray-900"
                >
                  <option value="">
                    Selecciona categoría
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

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descuento %
                </label>

                <input
                  type="number"
                  name="discount"
                  value={
                    form.discount
                  }
                  onChange={
                    handleInputChange
                  }
                  min="0"
                  max="100"
                  step="1"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-gray-900"
                />

              </div>

            </div>

            <div className="mt-5">

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Descripción *
              </label>

              <textarea
                name="description"
                value={
                  form.description
                }
                onChange={
                  handleInputChange
                }
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 resize-none focus:outline-none focus:border-gray-900"
              />

            </div>

            <div className="flex flex-wrap gap-6 mt-6">

              <label className="flex items-center gap-2 cursor-pointer">

                <input
                  type="checkbox"
                  name="isActive"
                  checked={
                    form.isActive
                  }
                  onChange={
                    handleInputChange
                  }
                />

                <span className="text-sm font-semibold text-gray-700">
                  Producto activo
                </span>

              </label>

              <label className="flex items-center gap-2 cursor-pointer">

                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={
                    form.isFeatured
                  }
                  onChange={
                    handleInputChange
                  }
                />

                <span className="text-sm font-semibold text-gray-700">
                  Producto destacado
                </span>

              </label>

            </div>

          </section>

          {/* =============================== */}
          {/* COLORES Y TALLAS */}
          {/* =============================== */}

          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">

              <div>

                <h2 className="text-xl font-bold text-gray-900">
                  Colores y tallas
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Modifica combinaciones de colores, tallas, stock y precio.
                </p>

              </div>

              <Button
                type="button"
                secondary
                onClick={
                  addColorway
                }
              >
                <Plus className="mr-2" />

                Agregar combinación
              </Button>

            </div>

            <div className="space-y-6">

              {form.colorways.map(
                (
                  colorway,
                  colorwayIndex
                ) => {
                  const colorwayName =
                    buildColorwayName(
                      colorway.colors
                    )

                  return (
                    <div
                      key={
                        colorwayIndex
                      }
                      className="border border-gray-200 rounded-2xl overflow-hidden"
                    >

                      {/* CABECERA */}
                      <div className="flex justify-between items-center bg-gray-50 border-b border-gray-200 px-5 py-4">

                        <div>

                          <p className="text-xs font-semibold uppercase text-gray-500">
                            Combinación{" "}
                            {colorwayIndex +
                              1}
                          </p>

                          <h3 className="font-bold text-lg text-gray-900 mt-1">
                            {colorwayName ||
                              "Sin definir"}
                          </h3>

                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeColorway(
                              colorwayIndex
                            )
                          }
                          className="
                            p-2
                            text-gray-400
                            hover:text-red-600
                            hover:bg-red-50
                            rounded-lg
                            transition-colors
                          "
                        >
                          <Trash2
                            size={
                              20
                            }
                          />
                        </button>

                      </div>

                      <div className="p-5 space-y-7">

                        {/* COLORES */}
                        <div>

                          <div className="flex items-center justify-between gap-4 mb-4">

                            <div>

                              <h4 className="font-semibold text-gray-900">
                                Colores
                              </h4>

                              <p className="text-sm text-gray-500 mt-1">
                                Puedes usar entre 1 y 4 colores por combinación.
                              </p>

                            </div>

                            <button
                              type="button"
                              disabled={
                                colorway
                                  .colors
                                  .length >=
                                4
                              }
                              onClick={() =>
                                addColor(
                                  colorwayIndex
                                )
                              }
                              className="
                                flex
                                items-center
                                text-sm
                                font-semibold
                                text-gray-700
                                hover:text-black
                                disabled:text-gray-300
                                disabled:cursor-not-allowed
                              "
                            >
                              <Plus
                                size={
                                  17
                                }
                                className="mr-1"
                              />

                              Agregar color
                            </button>

                          </div>

                          <div className="space-y-3">

                            {colorway.colors.map(
                              (
                                color,
                                colorIndex
                              ) => (
                                <div
                                  key={
                                    colorIndex
                                  }
                                  className="
                                    grid
                                    grid-cols-1
                                    sm:grid-cols-[1fr_180px_44px]
                                    gap-3
                                    items-end
                                  "
                                >

                                  <div>

                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                      Color{" "}
                                      {colorIndex +
                                        1}
                                    </label>

                                    <input
                                      type="text"
                                      value={
                                        color.name
                                      }
                                      onChange={(
                                        event
                                      ) =>
                                        handleColorChange(
                                          colorwayIndex,
                                          colorIndex,
                                          "name",
                                          event
                                            .target
                                            .value
                                        )
                                      }
                                      placeholder="Ej. Blanco"
                                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-900"
                                    />

                                  </div>

                                  <div>

                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                      Código
                                    </label>

                                    <div className="flex gap-2">

                                      <input
                                        type="color"
                                        value={
                                          color.code
                                        }
                                        onChange={(
                                          event
                                        ) =>
                                          handleColorChange(
                                            colorwayIndex,
                                            colorIndex,
                                            "code",
                                            event
                                              .target
                                              .value
                                          )
                                        }
                                        className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                                      />

                                      <input
                                        type="text"
                                        value={
                                          color.code
                                        }
                                        onChange={(
                                          event
                                        ) =>
                                          handleColorChange(
                                            colorwayIndex,
                                            colorIndex,
                                            "code",
                                            event
                                              .target
                                              .value
                                          )
                                        }
                                        className="min-w-0 flex-1 border border-gray-300 rounded-lg px-3 py-2"
                                      />

                                    </div>

                                  </div>

                                  <button
                                    type="button"
                                    disabled={
                                      colorway
                                        .colors
                                        .length ===
                                      1
                                    }
                                    onClick={() =>
                                      removeColor(
                                        colorwayIndex,
                                        colorIndex
                                      )
                                    }
                                    className="
                                      h-10
                                      flex
                                      items-center
                                      justify-center
                                      text-gray-400
                                      hover:text-red-600
                                      hover:bg-red-50
                                      rounded-lg
                                      disabled:text-gray-200
                                      disabled:cursor-not-allowed
                                    "
                                  >
                                    <Trash2
                                      size={
                                        18
                                      }
                                    />
                                  </button>

                                </div>
                              )
                            )}

                          </div>

                          {/* PREVIEW */}
                          <div className="mt-5">

                            <p className="text-sm font-semibold text-gray-700 mb-2">
                              Vista previa
                            </p>

                            <div className="flex items-center gap-3">

                              <div className="flex w-24 h-9 border border-gray-300 rounded-lg overflow-hidden bg-gray-100">

                                {colorway.colors.map(
                                  (
                                    color,
                                    index
                                  ) => (
                                    <div
                                      key={
                                        index
                                      }
                                      style={{
                                        backgroundColor:
                                          color.code,

                                        width: `${
                                          100 /
                                          colorway
                                            .colors
                                            .length
                                        }%`,
                                      }}
                                    />
                                  )
                                )}

                              </div>

                              <span className="text-sm font-semibold text-gray-700">
                                {colorwayName ||
                                  "Agrega los nombres de los colores"}
                              </span>

                            </div>

                          </div>

                        </div>

                        {/* PRECIO */}
                        <div className="max-w-xs">

                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Precio *
                          </label>

                          <input
                            type="number"
                            min="0"
                            step="100"
                            value={
                              colorway.price
                            }
                            onChange={(
                              event
                            ) =>
                              handleColorwayPriceChange(
                                colorwayIndex,
                                event
                                  .target
                                  .value
                              )
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-gray-900"
                          />

                          <p className="text-xs text-gray-500 mt-1">
                            Se aplicará a todas las tallas de esta combinación.
                          </p>

                        </div>

                        {/* TALLAS */}
                        <div>

                          <h4 className="font-semibold text-gray-900">
                            Tallas disponibles
                          </h4>

                          <p className="text-sm text-gray-500 mt-1">
                            Selecciona las tallas disponibles para esta combinación.
                          </p>

                          <div className="space-y-5 mt-5">

                            {SIZE_GROUPS.map(
                              (
                                group
                              ) => (
                                <div
                                  key={
                                    group.label
                                  }
                                >

                                  <p className="text-sm font-semibold text-gray-700 mb-2">
                                    {
                                      group.label
                                    }
                                  </p>

                                  <div className="flex flex-wrap gap-2">

                                    {group.sizes.map(
                                      (
                                        size
                                      ) => {
                                        const selected =
                                          colorway.selectedSizes.includes(
                                            size
                                          )

                                        return (
                                          <button
                                            key={`${group.label}-${size}`}
                                            type="button"
                                            onClick={() =>
                                              toggleSize(
                                                colorwayIndex,
                                                size
                                              )
                                            }
                                            className={`
                                              min-w-12
                                              px-3
                                              py-2
                                              border
                                              rounded-lg
                                              text-sm
                                              font-semibold
                                              transition-colors

                                              ${
                                                selected
                                                  ? "bg-gray-900 border-gray-900 text-white"
                                                  : "bg-white border-gray-300 text-gray-700 hover:border-gray-700"
                                              }
                                            `}
                                          >
                                            {
                                              size
                                            }
                                          </button>
                                        )
                                      }
                                    )}

                                  </div>

                                </div>
                              )
                            )}

                          </div>

                        </div>

                        {/* STOCK */}
                        {colorway
                          .selectedSizes
                          .length >
                          0 && (
                          <div>

                            <h4 className="font-semibold text-gray-900">
                              Stock por talla
                            </h4>

                            <p className="text-sm text-gray-500 mt-1">
                              Modifica el inventario disponible de cada talla.
                            </p>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-4">

                              {colorway.selectedSizes.map(
                                (
                                  size
                                ) => (
                                  <div
                                    key={
                                      size
                                    }
                                    className="border border-gray-200 rounded-xl p-3 bg-gray-50"
                                  >

                                    <label className="block text-sm font-bold text-gray-800 mb-2">
                                      Talla{" "}
                                      {
                                        size
                                      }
                                    </label>

                                    <input
                                      type="number"
                                      min="0"
                                      step="1"
                                      value={
                                        colorway
                                          .stockBySize[
                                          size
                                        ] ??
                                        0
                                      }
                                      onChange={(
                                        event
                                      ) =>
                                        handleStockChange(
                                          colorwayIndex,
                                          size,
                                          event
                                            .target
                                            .value
                                        )
                                      }
                                      className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-gray-900"
                                    />

                                  </div>
                                )
                              )}

                            </div>

                          </div>
                        )}

                      </div>

                    </div>
                  )
                }
              )}

            </div>

          </section>

          {/* =============================== */}
          {/* IMÁGENES */}
          {/* =============================== */}

          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">

            <h2 className="text-xl font-bold text-gray-900">
              Imágenes
            </h2>

            {currentImages.length >
              0 && (
              <>

                <p className="text-sm text-gray-500 mt-1">
                  Imágenes actuales del producto.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-5">

                  {currentImages.map(
                    (
                      image,
                      index
                    ) => (
                      <div
                        key={
                          image.publicId ||
                          index
                        }
                        className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden"
                      >
                        <img
                          src={
                            image.url
                          }
                          alt={`Producto ${
                            index +
                            1
                          }`}
                          className="w-full h-full object-cover"
                        />

                        {image.isPrimary && (
                          <span className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            Principal
                          </span>
                        )}

                      </div>
                    )
                  )}

                </div>

              </>
            )}

            <label className="mt-6 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-gray-500">

              <Upload
                size={32}
                className="text-gray-400"
              />

              <span className="mt-3 font-semibold text-gray-700">
                Reemplazar imágenes
              </span>

              <span className="text-sm text-gray-500 mt-1">
                Si seleccionas nuevas imágenes, reemplazarán las actuales.
              </span>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={
                  handleImagesChange
                }
                className="hidden"
              />

            </label>

            {newImagePreviews.length >
              0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">

                {newImagePreviews.map(
                  (
                    preview,
                    index
                  ) => (
                    <div
                      key={
                        preview
                      }
                      className="aspect-square bg-gray-100 rounded-xl overflow-hidden"
                    >
                      <img
                        src={
                          preview
                        }
                        alt={`Nueva ${
                          index +
                          1
                        }`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )
                )}

              </div>
            )}

          </section>

          {/* MENSAJES */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3">
              {success}
            </div>
          )}

          {/* GUARDAR */}
          <div className="flex justify-end gap-3">

            <Button
              type="button"
              secondary
              disabled={
                submitting
              }
              onClick={() =>
                navigate(
                  "/admin/products"
                )
              }
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={
                submitting
              }
            >
              {submitting
                ? "Guardando..."
                : "Guardar cambios"}
            </Button>

          </div>

        </form>

      </div>

    </main>
  )
}