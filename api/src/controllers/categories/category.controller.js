const categoryService = require("../../services/categories/category.service");

const createCategory = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.body);

    return res.status(201).json({
      success: true,
      code: "CATEGORY_CREATED",
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    return next(error);
  }
};

const getCategories = async (_req, res, next) => {
  try {
    const categories = await categoryService.getCategories();

    return res.status(200).json({
      success: true,
      code: "CATEGORIES_FETCHED",
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    return next(error);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);

    return res.status(200).json({
      success: true,
      code: "CATEGORY_FETCHED",
      message: "Category fetched successfully",
      data: category,
    });
  } catch (error) {
    return next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const category = await categoryService.updateCategory(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      code: "CATEGORY_UPDATED",
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    return next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    await categoryService.deleteCategory(req.params.id);

    return res.status(200).json({
      success: true,
      code: "CATEGORY_DELETED",
      message: "Category deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};