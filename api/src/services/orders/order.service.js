const mongoose = require("mongoose");

const Order = require("../../models/orders/order.model");
const Product = require("../../models/products/product.model");
const AppError = require("../../utils/app-error");

const ORDER_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  PREPARING: "PREPARING",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
};

const generateOrderNumber = async () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const datePart = `${year}${month}${day}`;

  const startOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const endOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  );

  const ordersToday = await Order.countDocuments({
    createdAt: {
      $gte: startOfDay,
      $lt: endOfDay,
    },
  });

  const sequence = String(ordersToday + 1).padStart(4, "0");

  return `ORD-${datePart}-${sequence}`;
};

const validateCustomer = (customer) => {
  if (!customer || typeof customer !== "object") {
    throw new AppError(
      "Customer information is required",
      400,
      "ORDER_CUSTOMER_REQUIRED"
    );
  }

  const name = customer.name?.trim();
  const phone = customer.phone?.trim();

  if (!name) {
    throw new AppError(
      "Customer name is required",
      400,
      "CUSTOMER_NAME_REQUIRED"
    );
  }

  if (!phone) {
    throw new AppError(
      "Customer phone is required",
      400,
      "CUSTOMER_PHONE_REQUIRED"
    );
  }

  return {
    name,
    phone,
    email: customer.email?.trim().toLowerCase() || null,
    city: customer.city?.trim() || null,
    address: customer.address?.trim() || null,
    notes: customer.notes?.trim() || null,
  };
};

const validateOrderItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError(
      "Order must contain at least one item",
      400,
      "ORDER_ITEMS_REQUIRED"
    );
  }
};

const buildOrderItems = async (items) => {
  const orderItems = [];

  for (const item of items) {
    const productId = item.productId;
    const variantId = item.variantId;
    const quantity = Number(item.quantity);

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new AppError(
        "Invalid product id",
        400,
        "INVALID_PRODUCT_ID"
      );
    }

    if (!mongoose.Types.ObjectId.isValid(variantId)) {
      throw new AppError(
        "Invalid product variant id",
        400,
        "INVALID_PRODUCT_VARIANT_ID"
      );
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new AppError(
        "Quantity must be a positive integer",
        400,
        "INVALID_ORDER_QUANTITY"
      );
    }

    const product = await Product.findById(productId);

    if (!product) {
      throw new AppError(
        "Product not found",
        404,
        "PRODUCT_NOT_FOUND"
      );
    }

    if (!product.isActive) {
      throw new AppError(
        `Product ${product.name} is inactive`,
        400,
        "PRODUCT_INACTIVE"
      );
    }

    const variant = product.variants.id(variantId);

    if (!variant) {
      throw new AppError(
        `Variant not found for product ${product.name}`,
        404,
        "PRODUCT_VARIANT_NOT_FOUND"
      );
    }

    if (variant.stock < quantity) {
      throw new AppError(
        `Insufficient stock for ${product.name} - ${variant.color} ${variant.size}`,
        409,
        "INSUFFICIENT_PRODUCT_STOCK"
      );
    }

    const originalUnitPrice =
      Number(variant.price) || 0;

    const discount =
      Number(product.discount) || 0;

    const unitPrice =
      discount > 0
        ? Math.round(
            originalUnitPrice -
              (originalUnitPrice * discount) / 100
          )
        : originalUnitPrice;

    const subtotal =
      unitPrice * quantity;

    orderItems.push({
      product: product._id,
      variantId: variant._id,
      name: product.name,
      color: variant.color,
      size: variant.size,
      quantity,

      originalUnitPrice,
      discount,
      unitPrice,
      subtotal,
    });
  }

  return orderItems;
};

const createOrder = async (data) => {
  const customer = validateCustomer(data.customer);

  validateOrderItems(data.items);

  const items = await buildOrderItems(data.items);

  const total = items.reduce(
    (accumulator, item) => accumulator + item.subtotal,
    0
  );

  const orderNumber = await generateOrderNumber();

  const order = await Order.create({
    orderNumber,
    customer,
    items,
    total,
    status: ORDER_STATUS.PENDING,
    source: "WHATSAPP",
    whatsappSent: false,
  });

  return order;
};

const getOrders = async () => {
  return Order.find()
    .populate("items.product", "name slug images")
    .sort({ createdAt: -1 });
};

const getOrderById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(
      "Invalid order id",
      400,
      "INVALID_ORDER_ID"
    );
  }

  const order = await Order.findById(id).populate(
    "items.product",
    "name slug images"
  );

  if (!order) {
    throw new AppError(
      "Order not found",
      404,
      "ORDER_NOT_FOUND"
    );
  }

  return order;
};

const discountOrderStock = async (order) => {
  for (const item of order.items) {
    const product = await Product.findById(item.product);

    if (!product) {
      throw new AppError(
        `Product ${item.name} no longer exists`,
        404,
        "PRODUCT_NOT_FOUND"
      );
    }

    const variant = product.variants.id(item.variantId);

    if (!variant) {
      throw new AppError(
        `Variant no longer exists for ${item.name}`,
        404,
        "PRODUCT_VARIANT_NOT_FOUND"
      );
    }

    if (variant.stock < item.quantity) {
      throw new AppError(
        `Insufficient stock for ${item.name} - ${item.color} ${item.size}`,
        409,
        "INSUFFICIENT_PRODUCT_STOCK"
      );
    }
  }

  for (const item of order.items) {
    const product = await Product.findById(item.product);

    const variant = product.variants.id(item.variantId);

    variant.stock -= item.quantity;

    await product.save();
  }
};

const updateOrderStatus = async (id, status) => {
  const order = await getOrderById(id);

  const normalizedStatus = status?.trim().toUpperCase();

  if (!Object.values(ORDER_STATUS).includes(normalizedStatus)) {
    throw new AppError(
      "Invalid order status",
      400,
      "INVALID_ORDER_STATUS"
    );
  }

  if (
    order.status === ORDER_STATUS.CANCELLED ||
    order.status === ORDER_STATUS.DELIVERED
  ) {
    throw new AppError(
      `Order with status ${order.status} cannot be modified`,
      409,
      "ORDER_STATUS_NOT_MODIFIABLE"
    );
  }

  if (
    order.status !== ORDER_STATUS.CONFIRMED &&
    normalizedStatus === ORDER_STATUS.CONFIRMED
  ) {
    await discountOrderStock(order);
  }

  order.status = normalizedStatus;

  await order.save();

  return order;
};

const markWhatsappSent = async (id) => {
  const order = await getOrderById(id);

  order.whatsappSent = true;

  await order.save();

  return order;
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  markWhatsappSent,
};