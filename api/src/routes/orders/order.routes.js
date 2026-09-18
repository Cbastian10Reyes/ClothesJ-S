const express = require("express");
const requireAdmin = require("../../middlewares/requireAdmin");

const orderController = require("../../controllers/orders/order.controller");

const router = express.Router();

router.post("/", orderController.createOrder);

router.get("/", requireAdmin, orderController.getOrders);

router.get("/:id", requireAdmin, orderController.getOrderById);

router.patch("/:id/status",requireAdmin, orderController.updateOrderStatus);

router.patch("/:id/whatsapp", requireAdmin, orderController.markWhatsappSent);

router.get("/:id/invoice", requireAdmin, orderController.downloadInvoice);

module.exports = router;