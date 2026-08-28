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

const createCategory = async (data) => {
  const name = data.name?.trim();

  if (!name) {
    throw new AppError(
      "Category name is required",
      400,
      "CATEGORY_NAME_REQUIRED"
    );
  }

  const existingCategory = await Category.findOne({
    name: { $regex: `^${name}$`, $options: "i" },
  });

  if (existingCategory) {
    throw new AppError(
      "Category already exists",
      409,
      "CATEGORY_ALREADY_EXISTS"
    );
  }

  const slug = buildSlug(name);

  const existingSlug = await Category.findOne({ slug });

  if (existingSlug) {
    throw new AppError(
      "Category slug already exists",
      409,
      "CATEGORY_SLUG_ALREADY_EXISTS"
    );
  }

  const category = await Category.create({
    name,
    slug,
    description: data.description?.trim() || "",
    image: data.image?.trim() || null,
    isActive:
      typeof data.isActive === "boolean"
        ? data.isActive
        : true,
  });

  return category;
};

const getCategories = async () => {
  return Category.find().sort({ createdAt: -1 });
};

const getCategoryById = async (id) => {
  const category = await Category.findById(id);

  if (!category) {
    throw new AppError(
      "Category not found",
      404,
      "CATEGORY_NOT_FOUND"
    );
  }

  return category;
};

const updateCategory = async (id, data) => {
  const category = await getCategoryById(id);

  if (data.name !== undefined) {
    const name = data.name.trim();

    if (!name) {
      throw new AppError(
        "Category name cannot be empty",
        400,
        "CATEGORY_NAME_REQUIRED"
      );
    }

    const duplicatedCategory = await Category.findOne({
      _id: { $ne: id },
      name: { $regex: `^${name}$`, $options: "i" },
    });

    if (duplicatedCategory) {
      throw new AppError(
        "Category already exists",
        409,
        "CATEGORY_ALREADY_EXISTS"
      );
    }

    const slug = buildSlug(name);

    const duplicatedSlug = await Category.findOne({
      _id: { $ne: id },
      slug,
    });

    if (duplicatedSlug) {
      throw new AppError(
        "Category slug already exists",
        409,
        "CATEGORY_SLUG_ALREADY_EXISTS"
      );
    }

    category.name = name;
    category.slug = slug;
  }

  if (data.description !== undefined) {
    category.description = data.description.trim();
  }

  if (data.image !== undefined) {
    category.image = data.image?.trim() || null;
  }

  if (data.isActive !== undefined) {
    category.isActive = data.isActive;
  }

  await category.save();

  return category;
};

const deleteCategory = async (id) => {
  const category = await getCategoryById(id);

  await category.deleteOne();

  return category;
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};