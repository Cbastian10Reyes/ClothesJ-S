const productService = require("../../services/products/product.service");
const uploadService = require("../../services/uploads/upload.service");
const AppError = require("../../utils/app-error");

const parseProductBody = (body) => {
  const data = { ...body };

  if (typeof data.variants === "string") {
    try {
      data.variants = JSON.parse(data.variants);
    } catch (_error) {
      throw new AppError(
        "Variants must be valid JSON",
        400,
        "INVALID_PRODUCT_VARIANTS"
      );
    }
  }

  if (data.isActive !== undefined) {
    data.isActive = data.isActive === "true";
  }

  if (data.isFeatured !== undefined) {
    data.isFeatured = data.isFeatured === "true";
  }

  return data;
};

const createProduct = async (req, res, next) => {
  try {
    const data = parseProductBody(req.body);

    const uploadedImages = await uploadService.uploadImages(
      req.files,
      "products"
    );

    const product = await productService.createProduct(
      data,
      uploadedImages
    );

    return res.status(201).json({
      success: true,
      code: "PRODUCT_CREATED",
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    return next(error);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const filters = {
      brand: req.query.brand,
      category: req.query.category,
      gender: req.query.gender,
    };

    if (req.query.isFeatured !== undefined) {
      filters.isFeatured = req.query.isFeatured === "true";
    }

    const products = await productService.getProducts(filters);

    return res.status(200).json({
      success: true,
      code: "PRODUCTS_FETCHED",
      message: "Products fetched successfully",
      data: products,
    });
  } catch (error) {
    return next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      code: "PRODUCT_FETCHED",
      message: "Product fetched successfully",
      data: product,
    });
  } catch (error) {
    return next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const data = parseProductBody(req.body);

    let uploadedImages = null;

    if (req.files && req.files.length > 0) {
      uploadedImages = await uploadService.uploadImages(
        req.files,
        "products"
      );
    }

    const product = await productService.updateProduct(
      req.params.id,
      data,
      uploadedImages
    );

    return res.status(200).json({
      success: true,
      code: "PRODUCT_UPDATED",
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    return next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id);

    return res.status(200).json({
      success: true,
      code: "PRODUCT_DELETED",
      message: "Product deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};