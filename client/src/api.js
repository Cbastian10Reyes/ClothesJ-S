const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api"

/**
 * Ejecuta una petición HTTP contra el backend.
 */
async function request(endpoint, options = {}) {
  try {
    const response = await fetch(
      `${API_URL}${endpoint}`,
      options
    )

    let data = null

    const contentType =
      response.headers.get("content-type")

    if (
      contentType?.includes(
        "application/json"
      )
    ) {
      data = await response.json()
    }

    if (!response.ok) {
      return {
        status: "error",
        statusCode: response.status,
        message:
          data?.message ||
          data?.error ||
          "Error al realizar la petición",
        code: data?.code || null,
        data,
      }
    }

    return data
  } catch (error) {
    console.error(
      "API request error:",
      error
    )

    return {
      status: "error",
      statusCode: 500,
      message:
        "No fue posible conectar con el servidor",
      code: "NETWORK_ERROR",
    }
  }
}

/* =========================================================
   CATEGORIES
========================================================= */

/**
 * Obtener todas las categorías.
 *
 * GET /categories
 */
async function fetchCategories() {
  return request("/categories")
}

/**
 * Obtener una categoría por ID.
 *
 * GET /categories/:id
 */
async function fetchCategory(id) {
  if (!id) {
    return {
      status: "error",
      message:
        "Category id is required",
    }
  }

  return request(
    `/categories/${id}`
  )
}

/**
 * Crear una categoría.
 *
 * POST /categories
 */
async function createCategory(
  category
) {
  return request("/categories", {
    method: "POST",
    headers: {
      "Content-Type":
        "application/json",
    },
    body: JSON.stringify(
      category
    ),
  })
}

/**
 * Actualizar una categoría.
 *
 * PATCH /categories/:id
 */
async function updateCategory(
  id,
  category
) {
  if (!id) {
    return {
      status: "error",
      message:
        "Category id is required",
    }
  }

  return request(
    `/categories/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(
        category
      ),
    }
  )
}

/**
 * Eliminar una categoría.
 *
 * DELETE /categories/:id
 */
async function deleteCategory(id) {
  if (!id) {
    return {
      status: "error",
      message:
        "Category id is required",
    }
  }

  return request(
    `/categories/${id}`,
    {
      method: "DELETE",
    }
  )
}

/* =========================================================
   PRODUCTS
========================================================= */

/**
 * Obtener productos.
 *
 * GET /products
 *
 * Filtros soportados:
 *
 * {
 *   brand,
 *   category,
 *   gender,
 *   isFeatured
 * }
 */
async function fetchProducts(
  filters = {}
) {
  const params =
    new URLSearchParams()

  if (filters.brand) {
    params.append(
      "brand",
      filters.brand
    )
  }

  if (filters.category) {
    params.append(
      "category",
      filters.category
    )
  }

  if (filters.gender) {
    params.append(
      "gender",
      filters.gender
    )
  }

  if (
    filters.isFeatured !==
    undefined
  ) {
    params.append(
      "isFeatured",
      String(
        filters.isFeatured
      )
    )
  }

  const query =
    params.toString()

  const endpoint = query
    ? `/products?${query}`
    : "/products"

  return request(endpoint)
}

/**
 * Obtener producto por ID.
 *
 * GET /products/:id
 */
async function fetchProduct(id) {
  if (!id) {
    return {
      status: "error",
      message:
        "Product id is required",
    }
  }

  return request(
    `/products/${id}`
  )
}

/**
 * Crear producto.
 *
 * POST /products
 */
async function createProduct(
  product,
  images = []
) {
  const formData =
    buildProductFormData(
      product,
      images
    )

  return request(
    "/products",
    {
      method: "POST",
      body: formData,
    }
  )
}

/**
 * Actualizar producto.
 *
 * PATCH /products/:id
 */
async function updateProduct(
  id,
  product,
  images = []
) {
  if (!id) {
    return {
      status: "error",
      message:
        "Product id is required",
    }
  }

  const formData =
    buildProductFormData(
      product,
      images
    )

  return request(
    `/products/${id}`,
    {
      method: "PATCH",
      body: formData,
    }
  )
}

/**
 * Eliminar producto.
 *
 * DELETE /products/:id
 */
async function deleteProduct(id) {
  if (!id) {
    return {
      status: "error",
      message:
        "Product id is required",
    }
  }

  return request(
    `/products/${id}`,
    {
      method: "DELETE",
    }
  )
}

/* =========================================================
   ORDERS
========================================================= */

/**
 * Crear una orden.
 *
 * POST /orders
 *
 * El backend espera:
 *
 * {
 *   customer: {
 *     name,
 *     phone,
 *     email?,
 *     city?,
 *     address?,
 *     notes?
 *   },
 *   items: [
 *     {
 *       productId,
 *       variantId,
 *       quantity
 *     }
 *   ]
 * }
 *
 * Los precios, descuentos, subtotales
 * y total son calculados por el backend.
 */
async function createOrder(
  order
) {
  if (
    !order ||
    !order.customer ||
    !Array.isArray(
      order.items
    ) ||
    order.items.length === 0
  ) {
    return {
      status: "error",
      message:
        "Order data is required",
      code:
        "INVALID_ORDER_DATA",
    }
  }

  return request("/orders", {
    method: "POST",
    headers: {
      "Content-Type":
        "application/json",
    },
    body: JSON.stringify(
      order
    ),
  })
}

/* =========================================================
   PRODUCT FORM DATA
========================================================= */

/**
 * Construye el FormData utilizado
 * para crear y actualizar productos.
 *
 * Soporta:
 *
 * {
 *   name,
 *   description,
 *   gender,
 *   category,
 *   brand,
 *   variants,
 *   discount,
 *   isActive,
 *   isFeatured
 * }
 */
function buildProductFormData(
  product,
  images = []
) {
  const formData =
    new FormData()

  if (
    product.name !==
    undefined
  ) {
    formData.append(
      "name",
      product.name
    )
  }

  if (
    product.description !==
    undefined
  ) {
    formData.append(
      "description",
      product.description
    )
  }

  if (
    product.gender !==
    undefined
  ) {
    formData.append(
      "gender",
      product.gender
    )
  }

  if (
    product.category !==
    undefined
  ) {
    formData.append(
      "category",
      product.category
    )
  }

  if (
    product.brand !==
    undefined
  ) {
    formData.append(
      "brand",
      product.brand ?? ""
    )
  }

  if (
    product.variants !==
    undefined
  ) {
    formData.append(
      "variants",
      JSON.stringify(
        product.variants
      )
    )
  }

  if (
    product.discount !==
    undefined
  ) {
    formData.append(
      "discount",
      String(
        product.discount
      )
    )
  }

  if (
    product.isActive !==
    undefined
  ) {
    formData.append(
      "isActive",
      String(
        product.isActive
      )
    )
  }

  if (
    product.isFeatured !==
    undefined
  ) {
    formData.append(
      "isFeatured",
      String(
        product.isFeatured
      )
    )
  }

  images.forEach(
    (image) => {
      formData.append(
        "images",
        image
      )
    }
  )

  return formData
}

/* =========================================================
   HELPERS
========================================================= */

/**
 * Obtiene la imagen principal
 * de un producto.
 */
function getProductPrimaryImage(
  product
) {
  if (
    !product?.images?.length
  ) {
    return null
  }

  const primaryImage =
    product.images.find(
      (image) =>
        image.isPrimary
    )

  return (
    primaryImage?.url ||
    product.images[0]?.url ||
    null
  )
}

/**
 * Obtiene el precio mínimo
 * de un producto entre todas
 * sus variantes.
 */
function getProductMinPrice(
  product
) {
  if (
    !product?.variants?.length
  ) {
    return 0
  }

  return Math.min(
    ...product.variants.map(
      (variant) =>
        Number(
          variant.price
        ) || 0
    )
  )
}

/**
 * Obtiene el precio máximo
 * de un producto entre todas
 * sus variantes.
 */
function getProductMaxPrice(
  product
) {
  if (
    !product?.variants?.length
  ) {
    return 0
  }

  return Math.max(
    ...product.variants.map(
      (variant) =>
        Number(
          variant.price
        ) || 0
    )
  )
}

/**
 * Obtiene el stock total
 * del producto.
 */
function getProductStock(
  product
) {
  if (
    !product?.variants?.length
  ) {
    return 0
  }

  return product.variants.reduce(
    (
      total,
      variant
    ) =>
      total +
      (Number(
        variant.stock
      ) || 0),
    0
  )
}

/**
 * Calcula el precio final
 * de una variante aplicando
 * el descuento del producto.
 */
function getProductFinalPrice(
  product,
  variant
) {
  const price =
    Number(
      variant?.price
    ) || 0

  const discount =
    Number(
      product?.discount
    ) || 0

  if (
    discount <= 0
  ) {
    return price
  }

  return Math.round(
    price -
      (price *
        discount) /
        100
  )
}

/* =========================================================
   EXPORT
========================================================= */

export default {
  fetchCategories,
  fetchCategory,
  createCategory,
  updateCategory,
  deleteCategory,

  fetchProducts,
  fetchProduct,
  createProduct,
  updateProduct,
  deleteProduct,

  createOrder,

  getProductPrimaryImage,
  getProductMinPrice,
  getProductMaxPrice,
  getProductStock,
  getProductFinalPrice,
}