import React, {
  useEffect,
  useState,
} from "react"

import {
  useNavigate,
  useParams,
} from "react-router-dom"

import {
  Plus,
  Trash2,
  Upload,
  ChevronLeft,
} from "react-feather"

import api from "@/api"

import Button from "@/components/Button"

import {
  useAdminAuth,
} from "@/context/AdminAuthContext"

const EMPTY_VARIANT = {
  color: "",
  codeColor: "#000000",
  size: "",
  stock: 0,
  price: 0,
}

export default function AdminEditProductPage() {
  const navigate = useNavigate()

  const { id } = useParams()

  const {
    token,
    logout,
  } = useAdminAuth()

  const [categories, setCategories] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [submitting, setSubmitting] =
    useState(false)

  const [error, setError] =
    useState("")

  const [success, setSuccess] =
    useState("")

  const [newImages, setNewImages] =
    useState([])

  const [newImagePreviews, setNewImagePreviews] =
    useState([])

  const [currentImages, setCurrentImages] =
    useState([])

  const [form, setForm] = useState({
    name: "",
    description: "",
    gender: "",
    category: "",
    brand: "",
    discount: 0,
    isActive: true,
    isFeatured: false,
    variants: [],
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError("")

        const [
          productResponse,
          categoriesResponse,
        ] = await Promise.all([
          api.fetchProduct(id),
          api.fetchCategories(),
        ])

        if (
          productResponse?.status === "error" ||
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
          categoriesResponse?.status === "error" ||
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
              category.isActive !== false
          )
        )

        setCurrentImages(
          product.images || []
        )

        setForm({
          name:
            product.name || "",

          description:
            product.description || "",

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
            product.isActive !== false,

          isFeatured:
            Boolean(
              product.isFeatured
            ),

          variants:
            product.variants?.length
              ? product.variants.map(
                  (variant) => ({
                    _id:
                      variant._id,

                    color:
                      variant.color ||
                      "",

                    codeColor:
                      variant.codeColor ||
                      "#000000",

                    size:
                      variant.size ||
                      "",

                    stock:
                      Number(
                        variant.stock
                      ) || 0,

                    price:
                      Number(
                        variant.price
                      ) || 0,
                  })
                )
              : [
                  {
                    ...EMPTY_VARIANT,
                  },
                ],
        })
      } catch (error) {
        console.error(
          "Error loading product:",
          error
        )

        setError(
          "No fue posible cargar la información del producto."
        )
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id])

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
  }, [newImagePreviews])

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
      (currentForm) => ({
        ...currentForm,

        [name]:
          type === "checkbox"
            ? checked
            : value,
      })
    )
  }

  const handleVariantChange = (
    index,
    field,
    value
  ) => {
    setForm(
      (currentForm) => {
        const variants = [
          ...currentForm.variants,
        ]

        variants[index] = {
          ...variants[index],

          [field]:
            field === "stock" ||
            field === "price"
              ? Number(value)
              : value,
        }

        return {
          ...currentForm,
          variants,
        }
      }
    )
  }

  const addVariant = () => {
    setForm(
      (currentForm) => ({
        ...currentForm,

        variants: [
          ...currentForm.variants,
          {
            ...EMPTY_VARIANT,
          },
        ],
      })
    )
  }

  const removeVariant = (
    index
  ) => {
    if (
      form.variants.length === 1
    ) {
      setError(
        "El producto debe tener al menos una variante."
      )

      return
    }

    setForm(
      (currentForm) => ({
        ...currentForm,

        variants:
          currentForm.variants.filter(
            (
              _variant,
              variantIndex
            ) =>
              variantIndex !==
              index
          ),
      })
    )
  }

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

  const validateForm = () => {
    if (!form.name.trim()) {
      return "El nombre es obligatorio."
    }

    if (
      !form.description.trim()
    ) {
      return "La descripción es obligatoria."
    }

    if (!form.gender.trim()) {
      return "Selecciona el género."
    }

    if (!form.category) {
      return "Selecciona una categoría."
    }

    const discount =
      Number(form.discount)

    if (
      Number.isNaN(discount) ||
      discount < 0 ||
      discount > 100
    ) {
      return "El descuento debe estar entre 0 y 100."
    }

    if (!form.variants.length) {
      return "Debe existir al menos una variante."
    }

    for (
      let index = 0;
      index <
      form.variants.length;
      index += 1
    ) {
      const variant =
        form.variants[index]

      if (
        !variant.color.trim() ||
        !variant.codeColor.trim() ||
        !variant.size.trim()
      ) {
        return `Completa todos los datos de la variante ${
          index + 1
        }.`
      }

      if (
        Number(
          variant.stock
        ) < 0
      ) {
        return `El stock de la variante ${
          index + 1
        } no puede ser negativo.`
      }

      if (
        Number(
          variant.price
        ) < 0
      ) {
        return `El precio de la variante ${
          index + 1
        } no puede ser negativo.`
      }
    }

    return null
  }

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault()

    const validationError =
      validateForm()

    if (validationError) {
      setError(
        validationError
      )

      setSuccess("")

      return
    }

    try {
      setSubmitting(true)
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
          form.variants.map(
            (variant) => ({
              color:
                variant.color.trim(),

              codeColor:
                variant.codeColor.trim(),

              size:
                variant.size.trim(),

              stock:
                Number(
                  variant.stock
                ),

              price:
                Number(
                  variant.price
                ),
            })
          ),
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

      setTimeout(() => {
        navigate(
          "/admin/products"
        )
      }, 1000)
    } catch (error) {
      console.error(
        "Update product error:",
        error
      )

      setError(
        "Ocurrió un error actualizando el producto."
      )
    } finally {
      setSubmitting(false)
    }
  }

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

          {/* INFORMACIÓN GENERAL */}
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
                  value={form.name}
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
                  value={form.brand}
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
                  value={form.gender}
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
                    (category) => (
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

          {/* VARIANTES */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">

            <div className="flex items-center justify-between mb-6">

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Variantes
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Modifica color, talla, stock y precio.
                </p>
              </div>

              <Button
                type="button"
                secondary
                onClick={
                  addVariant
                }
              >
                <Plus className="mr-2" />

                Agregar variante
              </Button>

            </div>

            <div className="space-y-4">

              {form.variants.map(
                (
                  variant,
                  index
                ) => (
                  <div
                    key={
                      variant._id ||
                      index
                    }
                    className="border border-gray-200 rounded-xl p-4"
                  >

                    <div className="flex justify-between items-center mb-4">

                      <h3 className="font-semibold text-gray-800">
                        Variante{" "}
                        {index + 1}
                      </h3>

                      <button
                        type="button"
                        onClick={() =>
                          removeVariant(
                            index
                          )
                        }
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2
                          size={20}
                        />
                      </button>

                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

                      <input
                        type="text"
                        value={
                          variant.color
                        }
                        onChange={(
                          event
                        ) =>
                          handleVariantChange(
                            index,
                            "color",
                            event.target
                              .value
                          )
                        }
                        placeholder="Color"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />

                      <div className="flex gap-2">

                        <input
                          type="color"
                          value={
                            variant.codeColor
                          }
                          onChange={(
                            event
                          ) =>
                            handleVariantChange(
                              index,
                              "codeColor",
                              event.target
                                .value
                            )
                          }
                          className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                        />

                        <input
                          type="text"
                          value={
                            variant.codeColor
                          }
                          onChange={(
                            event
                          ) =>
                            handleVariantChange(
                              index,
                              "codeColor",
                              event.target
                                .value
                            )
                          }
                          className="min-w-0 flex-1 border border-gray-300 rounded-lg px-3 py-2"
                        />

                      </div>

                      <input
                        type="text"
                        value={
                          variant.size
                        }
                        onChange={(
                          event
                        ) =>
                          handleVariantChange(
                            index,
                            "size",
                            event.target
                              .value
                          )
                        }
                        placeholder="Talla"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />

                      <input
                        type="number"
                        value={
                          variant.stock
                        }
                        min="0"
                        onChange={(
                          event
                        ) =>
                          handleVariantChange(
                            index,
                            "stock",
                            event.target
                              .value
                          )
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />

                      <input
                        type="number"
                        value={
                          variant.price
                        }
                        min="0"
                        step="100"
                        onChange={(
                          event
                        ) =>
                          handleVariantChange(
                            index,
                            "price",
                            event.target
                              .value
                          )
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />

                    </div>

                  </div>
                )
              )}

            </div>

          </section>

          {/* IMÁGENES ACTUALES */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">

            <h2 className="text-xl font-bold text-gray-900">
              Imágenes
            </h2>

            {currentImages.length > 0 && (
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
                            index + 1
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

            {newImagePreviews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">

                {newImagePreviews.map(
                  (
                    preview,
                    index
                  ) => (
                    <div
                      key={preview}
                      className="aspect-square bg-gray-100 rounded-xl overflow-hidden"
                    >
                      <img
                        src={
                          preview
                        }
                        alt={`Nueva ${
                          index + 1
                        }`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )
                )}

              </div>
            )}

          </section>

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