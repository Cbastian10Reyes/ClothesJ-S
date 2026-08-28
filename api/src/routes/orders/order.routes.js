const express = require("express");

const orderController = require("../../controllers/orders/order.controller");

const router = express.Router();

router.post("/", orderController.createOrder);

router.get("/", orderController.getOrders);

router.get("/:id", orderController.getOrderById);

router.patch("/:id/status",orderController.updateOrderStatus);

router.patch("/:id/whatsapp",orderController.markWhatsappSent);

module.exports = router;