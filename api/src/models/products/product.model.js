const mongoose = require("mongoose");

const productImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },

    publicId: {
      type: String,
      required: true,
      trim: true,
    },

    isPrimary: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  }
);

const productVariantSchema = new mongoose.Schema(
  {
    color: {
      type: String,
      required: [true, "Variant color is required"],
      trim: true,
    },

    codeColor: {
      type: String,
      required: [true, "Variant color code is required"],
      trim: true,
    },

    size: {
      type: String,
      required: [true, "Variant size is required"],
      trim: true,
      uppercase: true,
    },

    stock: {
      type: Number,
      required: [true, "Variant stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },

    price: {
      type: Number,
      required: [true, "Variant price is required"],
      min: [0, "Price cannot be negative"],
    },
  },
  {
    _id: true,
  }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [120, "Product name cannot exceed 120 characters"],
    },

    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },

    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    gender: {
      type: String,
      required: [true, "Product gender is required"],
      trim: true,
      maxlength: [50, "Gender cannot exceed 50 characters"],
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product category is required"],
      index: true,
    },

    brand: {
      type: String,
      trim: true,
      maxlength: [80, "Brand cannot exceed 80 characters"],
      default: null,
    },

    images: {
      type: [productImageSchema],
      default: [],
    },

    variants: {
      type: [productVariantSchema],
      default: [],
    },

    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
      max: [100, "Discount cannot exceed 100"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;