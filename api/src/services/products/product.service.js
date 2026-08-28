const mongoose = require("mongoose");

const uploadService = require("../uploads/upload.service");
const Product = require("../../models/products/product.model");
const Category = require("../../models/categories/category.model");
const AppError = require("../../utils/app-error");

const buildSlug = (value) => {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const validateCategory = async (categoryId) => {
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new AppError(
      "Invalid category id",
      400,
      "INVALID_CATEGORY_ID"
    );
  }

  const category = await Category.findById(categoryId);

  if (!category) {
    throw new AppError(
      "Category not found",
      404,
      "CATEGORY_NOT_FOUND"
    );
  }

  if (!category.isActive) {
    throw new AppError(
      "Category is inactive",
      400,
      "CATEGORY_INACTIVE"
    );
  }

  return category;
};

const validateVariants = (variants) => {
  if (!Array.isArray(variants) || variants.length === 0) {
    throw new AppError(
      "At least one product variant is required",
      400,
      "PRODUCT_VARIANT_REQUIRED"
    );
  }

  const duplicatedVariants = new Set();

  for (const variant of variants) {
    const color = variant.color?.trim();
    const size = variant.size?.trim().toUpperCase();
    const codeColor = variant.codeColor?.trim();

    if (!color || !size || !codeColor) {
      throw new AppError(
        "Variant color, size, and code color are required",
        400,
        "INVALID_PRODUCT_VARIANT"
      );
    }

    if (
      typeof variant.stock !== "number" ||
      variant.stock < 0
    ) {
      throw new AppError(
        "Variant stock must be greater than or equal to zero",
        400,
        "INVALID_PRODUCT_STOCK"
      );
    }

    if (
      typeof variant.price !== "number" ||
      variant.price < 0
    ) {
      throw new AppError(
        "Variant price must be greater than or equal to zero",
        400,
        "INVALID_PRODUCT_PRICE"
      );
    }

    const key = `${color.toLowerCase()}-${size}`;

    if (duplicatedVariants.has(key)) {
      throw new AppError(
        `Duplicated variant: ${color} ${size}`,
        400,
        "DUPLICATED_PRODUCT_VARIANT"
      );
    }

    duplicatedVariants.add(key);
  }
};

const normalizeVariants = (variants) => {
  return variants.map((variant) => ({
    color: variant.color.trim(),
    codeColor: variant.codeColor.trim(),
    size: variant.size.trim().toUpperCase(),
    stock: variant.stock,
    price: variant.price,
  }));
};

const createProduct = async (data, images = []) => {
  const name = data.name?.trim();
  const description = data.description?.trim();
  const gender = data.gender?.trim();

  if (!name) {
    throw new AppError(
      "Product name is required",
      400,
      "PRODUCT_NAME_REQUIRED"
    );
  }

  if (!description) {
    throw new AppError(
      "Product description is required",
      400,
      "PRODUCT_DESCRIPTION_REQUIRED"
    );
  }

  if (!data.category) {
    throw new AppError(
      "Product category is required",
      400,
      "PRODUCT_CATEGORY_REQUIRED"
    );
  }

  await validateCategory(data.category);

  validateVariants(data.variants);

  const slug = buildSlug(name);

  const existingProduct = await Product.findOne({
    slug,
  });

  if (existingProduct) {
    throw new AppError(
      "Product already exists",
      409,
      "PRODUCT_ALREADY_EXISTS"
    );
  }

  const discount =
    data.discount !== undefined &&
    data.discount !== null &&
    data.discount !== ""
      ? Number(data.discount)
      : 0;

  if (
    Number.isNaN(discount) ||
    discount < 0 ||
    discount > 100
  ) {
    throw new AppError(
      "Product discount must be between 0 and 100",
      400,
      "INVALID_PRODUCT_DISCOUNT"
    );
  }

  const product = await Product.create({
    name,
    slug,
    description,
    gender,
    category: data.category,
    brand: data.brand?.trim() || null,
    images,
    variants: normalizeVariants(data.variants),

    discount,

    isActive:
      typeof data.isActive === "boolean"
        ? data.isActive
        : true,

    isFeatured:
      typeof data.isFeatured === "boolean"
        ? data.isFeatured
        : false,
  });

  return Product.findById(product._id).populate(
    "category",
    "name slug"
  );
};

const getProducts = async (filters = {}) => {
  const query = {};

  if (filters.brand) {
    query.brand = {
      $regex: `^${filters.brand.trim()}$`,
      $options: "i",
    };
  }

  if (filters.category) {
    if (!mongoose.Types.ObjectId.isValid(filters.category)) {
      throw new AppError(
        "Invalid category id",
        400,
        "INVALID_CATEGORY_ID"
      );
    }

    query.category = filters.category;
  }

  if (filters.isFeatured !== undefined) {
    query.isFeatured = filters.isFeatured;
  }

  if (filters.gender) {
      query.gender = {
          $regex: `^${filters.gender.trim()}$`,
          $options: "i",
      }
  }

  return Product.find(query)
    .populate("category", "name slug")
    .sort({ createdAt: -1 });
};

const getProductById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(
      "Invalid product id",
      400,
      "INVALID_PRODUCT_ID"
    );
  }

  const product = await Product.findById(id).populate(
    "category",
    "name slug"
  );

  if (!product) {
    throw new AppError(
      "Product not found",
      404,
      "PRODUCT_NOT_FOUND"
    );
  }

  return product;
};

const updateProduct = async (id, data, images = null) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(
      "Invalid product id",
      400,
      "INVALID_PRODUCT_ID"
    );
  }

  const product = await Product.findById(id);

  if (!product) {
    throw new AppError(
      "Product not found",
      404,
      "PRODUCT_NOT_FOUND"
    );
  }

  if (data.name !== undefined) {
    const name = data.name.trim();

    if (!name) {
      throw new AppError(
        "Product name cannot be empty",
        400,
        "PRODUCT_NAME_REQUIRED"
      );
    }

    const slug = buildSlug(name);

    const duplicatedProduct = await Product.findOne({
      _id: { $ne: id },
      slug,
    });

    if (duplicatedProduct) {
      throw new AppError(
        "Product already exists",
        409,
        "PRODUCT_ALREADY_EXISTS"
      );
    }

    product.name = name;
    product.slug = slug;
  }

  if (data.description !== undefined) {
    const description = data.description.trim();

    if (!description) {
      throw new AppError(
        "Product description cannot be empty",
        400,
        "PRODUCT_DESCRIPTION_REQUIRED"
      );
    }

    product.description = description;
  }

  if (data.category !== undefined) {
    await validateCategory(data.category);
    product.category = data.category;
  }

  if (data.brand !== undefined) {
    product.brand = data.brand?.trim() || null;
  }

  if (data.variants !== undefined) {
    validateVariants(data.variants);
    product.variants = normalizeVariants(data.variants);
  }

  if (data.isActive !== undefined) {
    product.isActive = data.isActive;
  }

  if (data.isFeatured !== undefined) {
    product.isFeatured = data.isFeatured;
  }

  const previousImages = [...product.images];

  if (images !== null) {
    product.images = images;
  }

  await product.save();

  if (images !== null && previousImages.length > 0) {
    await uploadService.deleteImages(previousImages);
  }

  return Product.findById(product._id).populate(
    "category",
    "name slug"
  );
};

const deleteProduct = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(
      "Invalid product id",
      400,
      "INVALID_PRODUCT_ID"
    );
  }

  const product = await Product.findById(id);

  if (!product) {
    throw new AppError(
      "Product not found",
      404,
      "PRODUCT_NOT_FOUND"
    );
  }

  await uploadService.deleteImages(product.images);

  await product.deleteOne();

  return product;
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};