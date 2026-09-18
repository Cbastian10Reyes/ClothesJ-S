const express = require("express");
const requireAdmin = require("../../middlewares/requireAdmin");

const productController = require("../../controllers/products/product.controller");
const upload = require("../../middlewares/upload.middleware");

const router = express.Router();

router.post("/", requireAdmin, upload.array("images", 6), productController.createProduct);

router.get("/", productController.getProducts);

router.get("/:id", productController.getProductById);

router.patch("/:id", requireAdmin, upload.array("images", 6), productController.updateProduct);

router.delete("/:id", requireAdmin, productController.deleteProduct);

module.exports = router;