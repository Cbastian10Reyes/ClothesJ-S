const orderService = require("../../services/orders/order.service");

const createOrder = async (req, res, next) => {
  try {
    const order = await orderService.createOrder(req.body);

    return res.status(201).json({
      success: true,
      code: "ORDER_CREATED",
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    return next(error);
  }
};

const getOrders = async (_req, res, next) => {
  try {
    const orders = await orderService.getOrders();

    return res.status(200).json({
      success: true,
      code: "ORDERS_FETCHED",
      message: "Orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    return next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id);

    return res.status(200).json({
      success: true,
      code: "ORDER_FETCHED",
      message: "Order fetched successfully",
      data: order,
    });
  } catch (error) {
    return next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await orderService.updateOrderStatus(
      req.params.id,
      req.body.status
    );

    return res.status(200).json({
      success: true,
      code: "ORDER_STATUS_UPDATED",
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    return next(error);
  }
};

const markWhatsappSent = async (req, res, next) => {
  try {
    const order = await orderService.markWhatsappSent(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      code: "ORDER_WHATSAPP_SENT",
      message: "Order marked as sent to WhatsApp",
      data: order,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  markWhatsappSent,
};