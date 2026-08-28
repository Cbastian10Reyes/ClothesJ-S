const express = require("express");

const categoryRoutes = require("./categories/category.routes");
const productRoutes = require("./products/product.routes");
const orderRoutes = require("./orders/order.routes");

const router = express.Router();

router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/orders", orderRoutes);

module.exports = router;