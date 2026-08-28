const express = require("express");

const productController = require("../../controllers/products/product.controller");
const upload = require("../../middlewares/upload.middleware");

const router = express.Router();

router.post("/", upload.array("images", 6), productController.createProduct);

router.get("/", productController.getProducts);

router.get("/:id", productController.getProductById);

router.patch("/:id", upload.array("images", 6), productController.updateProduct);

router.delete("/:id", productController.deleteProduct);

module.exports = router;