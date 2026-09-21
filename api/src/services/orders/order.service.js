const mongoose = require("mongoose");

const Order = require("../../models/orders/order.model");
const Product = require("../../models/products/product.model");
const AppError = require("../../utils/app-error");
const path = require("path");
const PDFDocument = require("pdfkit");

const ORDER_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  PREPARING: "PREPARING",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
};

const FREE_SHIPPING_GOAL = 250000;

const SHIPPING_COST = 15000;

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
  const customer = validateCustomer(
    data.customer
  );

  validateOrderItems(
    data.items
  );

  const items =
    await buildOrderItems(
      data.items
    );

  const productsTotal =
    items.reduce(
      (
        accumulator,
        item
      ) =>
        accumulator +
        item.subtotal,
      0
    );

  const total =
    productsTotal <
    FREE_SHIPPING_GOAL
      ? productsTotal +
        SHIPPING_COST
      : productsTotal;

  const orderNumber =
    await generateOrderNumber();

  const order =
    await Order.create({
      orderNumber,
      customer,
      items,
      total,
      status:
        ORDER_STATUS.PENDING,
      source:
        "WHATSAPP",
      whatsappSent:
        false,
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
  const productsToUpdate = [];

  for (const item of order.items) {
    const product = await Product.findById(
      item.product
    );

    if (!product) {
      throw new AppError(
        `Product ${item.name} no longer exists`,
        404,
        "PRODUCT_NOT_FOUND"
      );
    }

    let variant =
      product.variants.id(
        item.variantId
      );

    // Fallback para órdenes antiguas
    if (!variant) {
      variant =
        product.variants.find(
          (productVariant) =>
            productVariant.color
              ?.trim()
              .toLowerCase() ===
              item.color
                ?.trim()
                .toLowerCase() &&
            productVariant.size
              ?.trim()
              .toUpperCase() ===
              item.size
                ?.trim()
                .toUpperCase()
        );
    }

    if (!variant) {
      throw new AppError(
        `Variant no longer exists for ${item.name}`,
        404,
        "PRODUCT_VARIANT_NOT_FOUND"
      );
    }

    if (
      variant.stock <
      item.quantity
    ) {
      throw new AppError(
        `Insufficient stock for ${item.name} - ${item.color} ${item.size}`,
        409,
        "INSUFFICIENT_PRODUCT_STOCK"
      );
    }

    productsToUpdate.push({
      product,
      variant,
      item,
    });
  }

  for (const entry of productsToUpdate) {
    entry.variant.stock -=
      entry.item.quantity;

    await entry.product.save();
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

const formatCurrency = (value) => {
  return `$${Number(value || 0).toLocaleString("es-CO")}`;
};

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString(
    "es-CO",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
};

const getOrderStatusLabel = (status) => {
  const labels = {
    PENDING: "Pendiente",
    CONFIRMED: "Confirmado",
    PREPARING: "Preparando",
    SHIPPED: "Enviado",
    DELIVERED: "Entregado",
    CANCELLED: "Cancelado",
  };

  return labels[status] || status || "-";
};

const generateOrderInvoice = async (id) => {
  const order = await getOrderById(id);

  /*
   * ========================================
   * TOTALES
   * ========================================
   */

  const originalSubtotal = order.items.reduce(
    (total, item) =>
      total +
      Number(
        item.originalUnitPrice ||
          item.unitPrice ||
          0
      ) *
        Number(
          item.quantity || 0
        ),
    0
  );

  /*
   * Total real de productos
   * después de descuentos
   */
  const productsTotal = order.items.reduce(
    (total, item) =>
      total +
      Number(
        item.subtotal || 0
      ),
    0
  );

  /*
   * Descuentos aplicados
   */
  const discountTotal = Math.max(
    originalSubtotal -
      productsTotal,
    0
  );

  /*
   * El total almacenado en la orden
   * ya incluye el costo de envío.
   *
   * Por eso el envío se obtiene de:
   *
   * order.total - productsTotal
   */
  const shippingCost = Math.max(
    Number(order.total || 0) -
      productsTotal,
    0
  );

  /*
   * El total de la factura debe ser
   * exactamente el total almacenado
   * en la orden.
   */
  const invoiceTotal =
    Number(
      order.total || 0
    );

  const logoPath = path.join(
    __dirname,
    "../../assets/clothes-js-logo.png"
  );

  return new Promise(
    (resolve, reject) => {
      try {
        const doc =
          new PDFDocument({
            size: "A4",
            margin: 45,
            info: {
              Title: `Factura ${order.orderNumber}`,
              Author:
                "CLOTHES J&S",
              Subject:
                "Comprobante de compra",
            },
          });

        const chunks = [];

        doc.on(
          "data",
          (chunk) => {
            chunks.push(
              chunk
            );
          }
        );

        doc.on(
          "end",
          () => {
            resolve(
              Buffer.concat(
                chunks
              )
            );
          }
        );

        doc.on(
          "error",
          reject
        );

        const pageWidth =
          doc.page.width;

        const contentWidth =
          pageWidth -
          doc.page.margins.left -
          doc.page.margins.right;

        const left =
          doc.page.margins.left;

        const right =
          pageWidth -
          doc.page.margins.right;

        /*
         * ========================================
         * COLORES
         * ========================================
         */

        const colors = {
          text: "#111111",
          secondary:
            "#666666",
          lightText:
            "#777777",
          border:
            "#E4E4E4",
          lightBackground:
            "#F8F8F8",
          tableHeader:
            "#F1F1F1",
          accent:
            "#B28A55",
          successBackground:
            "#EAF7EF",
          successText:
            "#267447",
          warningBackground:
            "#FFF5D9",
          warningText:
            "#9A6A00",
          dangerBackground:
            "#FDECEC",
          dangerText:
            "#A83232",
          infoBackground:
            "#EAF2FB",
          infoText:
            "#295C91",
        };

        /*
         * ========================================
         * HELPERS
         * ========================================
         */

        const drawLine = (
          y
        ) => {
          doc
            .strokeColor(
              colors.border
            )
            .lineWidth(1)
            .moveTo(
              left,
              y
            )
            .lineTo(
              right,
              y
            )
            .stroke();
        };

        const drawCard = (
          x,
          y,
          width,
          height
        ) => {
          doc
            .roundedRect(
              x,
              y,
              width,
              height,
              8
            )
            .fillAndStroke(
              colors.lightBackground,
              colors.border
            );
        };

        const drawStatusBadge =
          (
            status,
            x,
            y
          ) => {
            const statusStyles =
              {
                PENDING: {
                  background:
                    colors.warningBackground,
                  text:
                    colors.warningText,
                },

                CONFIRMED: {
                  background:
                    colors.infoBackground,
                  text:
                    colors.infoText,
                },

                PREPARING: {
                  background:
                    "#F3EDFF",
                  text:
                    "#7251A3",
                },

                SHIPPED: {
                  background:
                    "#EBEEFF",
                  text:
                    "#4C5EA7",
                },

                DELIVERED: {
                  background:
                    colors.successBackground,
                  text:
                    colors.successText,
                },

                CANCELLED: {
                  background:
                    colors.dangerBackground,
                  text:
                    colors.dangerText,
                },
              };

            const style =
              statusStyles[
                status
              ] || {
                background:
                  "#EEEEEE",
                text:
                  colors.secondary,
              };

            doc
              .roundedRect(
                x,
                y,
                105,
                28,
                7
              )
              .fill(
                style.background
              );

            doc
              .fillColor(
                style.text
              )
              .font(
                "Helvetica-Bold"
              )
              .fontSize(9)
              .text(
                getOrderStatusLabel(
                  status
                ).toUpperCase(),
                x,
                y + 9,
                {
                  width: 105,
                  align:
                    "center",
                }
              );
          };

        /*
         * ========================================
         * ENCABEZADO
         * ========================================
         */

        try {
          doc.image(
            logoPath,
            left,
            40,
            {
              fit: [
                80,
                80,
              ],
              align:
                "center",
              valign:
                "center",
            }
          );
        } catch (error) {
          console.warn(
            "Invoice logo could not be loaded:",
            error.message
          );
        }

        doc
          .fillColor(
            colors.text
          )
          .font(
            "Helvetica-Bold"
          )
          .fontSize(27)
          .text(
            "CLOTHES J&S",
            left + 100,
            49,
            {
              width: 280,
            }
          );

        doc
          .fillColor(
            colors.secondary
          )
          .font(
            "Helvetica"
          )
          .fontSize(10)
          .text(
            "WEAR YOUR STORY",
            left + 101,
            83,
            {
              characterSpacing:
                2,
            }
          );

        doc
          .strokeColor(
            colors.accent
          )
          .lineWidth(2)
          .moveTo(
            left + 101,
            105
          )
          .lineTo(
            left + 220,
            105
          )
          .stroke();

        doc
          .fillColor(
            colors.secondary
          )
          .font(
            "Helvetica"
          )
          .fontSize(9)
          .text(
            "Comprobante de compra",
            right - 150,
            55,
            {
              width: 150,
              align:
                "right",
            }
          );

        doc
          .fillColor(
            colors.text
          )
          .font(
            "Helvetica-Bold"
          )
          .fontSize(10)
          .text(
            order.orderNumber,
            right - 150,
            72,
            {
              width: 150,
              align:
                "right",
            }
          );

        drawLine(130);

        /*
         * ========================================
         * FACTURA + ESTADO
         * ========================================
         */

        doc
          .fillColor(
            colors.text
          )
          .font(
            "Helvetica-Bold"
          )
          .fontSize(24)
          .text(
            "COMPROBANTE",
            left,
            153
          );

        doc
          .fontSize(13)
          .text(
            order.orderNumber,
            left,
            186
          );

        doc
          .fillColor(
            colors.secondary
          )
          .font(
            "Helvetica"
          )
          .fontSize(9)
          .text(
            `Fecha: ${formatDate(
              order.createdAt
            )}`,
            left,
            208
          );

        doc
          .fillColor(
            colors.secondary
          )
          .font(
            "Helvetica"
          )
          .fontSize(8)
          .text(
            "ESTADO DEL PEDIDO",
            right - 110,
            158,
            {
              width: 110,
              align:
                "center",
            }
          );

        drawStatusBadge(
          order.status,
          right - 108,
          178
        );

        /*
         * ========================================
         * CARDS CLIENTE Y PEDIDO
         * ========================================
         */

        const cardsY = 245;
        const cardGap = 15;

        const cardWidth =
          (contentWidth -
            cardGap) /
          2;

        const cardHeight =
          150;

        drawCard(
          left,
          cardsY,
          cardWidth,
          cardHeight
        );

        drawCard(
          left +
            cardWidth +
            cardGap,
          cardsY,
          cardWidth,
          cardHeight
        );

        /*
         * CLIENTE
         */

        doc
          .fillColor(
            colors.text
          )
          .font(
            "Helvetica-Bold"
          )
          .fontSize(11)
          .text(
            "INFORMACIÓN DEL CLIENTE",
            left + 15,
            cardsY + 16
          );

        const clientX =
          left + 15;

        let clientY =
          cardsY + 42;

        const writeClientRow =
          (
            label,
            value
          ) => {
            doc
              .fillColor(
                colors.secondary
              )
              .font(
                "Helvetica"
              )
              .fontSize(8)
              .text(
                label,
                clientX,
                clientY
              );

            doc
              .fillColor(
                colors.text
              )
              .font(
                "Helvetica-Bold"
              )
              .fontSize(9)
              .text(
                value ||
                  "-",
                clientX +
                  62,
                clientY,
                {
                  width:
                    cardWidth -
                    87,
                }
              );

            clientY += 20;
          };

        writeClientRow(
          "Nombre:",
          order.customer
            ?.name
        );

        writeClientRow(
          "Teléfono:",
          order.customer
            ?.phone
        );

        writeClientRow(
          "Correo:",
          order.customer
            ?.email
        );

        writeClientRow(
          "Ciudad:",
          order.customer
            ?.city
        );

        writeClientRow(
          "Dirección:",
          order.customer
            ?.address
        );

        /*
         * PEDIDO
         */

        const orderCardX =
          left +
          cardWidth +
          cardGap +
          15;

        let orderCardY =
          cardsY + 42;

        doc
          .fillColor(
            colors.text
          )
          .font(
            "Helvetica-Bold"
          )
          .fontSize(11)
          .text(
            "INFORMACIÓN DEL PEDIDO",
            orderCardX,
            cardsY + 16
          );

        const writeOrderRow =
          (
            label,
            value
          ) => {
            doc
              .fillColor(
                colors.secondary
              )
              .font(
                "Helvetica"
              )
              .fontSize(8)
              .text(
                label,
                orderCardX,
                orderCardY
              );

            doc
              .fillColor(
                colors.text
              )
              .font(
                "Helvetica-Bold"
              )
              .fontSize(9)
              .text(
                value ||
                  "-",
                orderCardX +
                  82,
                orderCardY,
                {
                  width:
                    cardWidth -
                    112,
                }
              );

            orderCardY += 22;
          };

        writeOrderRow(
          "Pedido:",
          order.orderNumber
        );

        writeOrderRow(
          "Fecha:",
          formatDate(
            order.createdAt
          )
        );

        writeOrderRow(
          "Origen:",
          order.source ||
            "-"
        );

        writeOrderRow(
          "Estado:",
          getOrderStatusLabel(
            order.status
          )
        );

        /*
         * ========================================
         * PRODUCTOS
         * ========================================
         */

        let y =
          cardsY +
          cardHeight +
          28;

        const tableX = left;

        const tableWidth =
          contentWidth;

        const columns = {
          number: {
            x: tableX,
            width: 25,
          },

          product: {
            x:
              tableX + 25,
            width: 170,
          },

          color: {
            x:
              tableX +
              195,
            width: 65,
          },

          size: {
            x:
              tableX +
              260,
            width: 45,
          },

          quantity: {
            x:
              tableX +
              305,
            width: 55,
          },

          price: {
            x:
              tableX +
              360,
            width: 72,
          },

          subtotal: {
            x:
              tableX +
              432,
            width:
              tableWidth -
              432,
          },
        };

        const drawTableHeader =
          () => {
            doc
              .roundedRect(
                tableX,
                y,
                tableWidth,
                30,
                5
              )
              .fill(
                colors.tableHeader
              );

            doc
              .fillColor(
                colors.text
              )
              .font(
                "Helvetica-Bold"
              )
              .fontSize(7.5);

            doc.text(
              "#",
              columns.number
                .x,
              y + 11,
              {
                width:
                  columns
                    .number
                    .width,
                align:
                  "center",
              }
            );

            doc.text(
              "PRODUCTO",
              columns.product
                .x,
              y + 11,
              {
                width:
                  columns
                    .product
                    .width,
              }
            );

            doc.text(
              "COLOR",
              columns.color.x,
              y + 11,
              {
                width:
                  columns.color
                    .width,
              }
            );

            doc.text(
              "TALLA",
              columns.size.x,
              y + 11,
              {
                width:
                  columns.size
                    .width,
                align:
                  "center",
              }
            );

            doc.text(
              "CANT.",
              columns.quantity
                .x,
              y + 11,
              {
                width:
                  columns
                    .quantity
                    .width,
                align:
                  "center",
              }
            );

            doc.text(
              "PRECIO",
              columns.price.x,
              y + 11,
              {
                width:
                  columns.price
                    .width,
                align:
                  "right",
              }
            );

            doc.text(
              "SUBTOTAL",
              columns.subtotal
                .x,
              y + 11,
              {
                width:
                  columns
                    .subtotal
                    .width,
                align:
                  "right",
              }
            );

            y += 38;
          };

        drawTableHeader();

        order.items.forEach(
          (
            item,
            index
          ) => {
            const rowHeight =
              Number(
                item.discount
              ) > 0
                ? 52
                : 42;

            if (
              y +
                rowHeight >
              735
            ) {
              doc.addPage();

              y = 50;

              drawTableHeader();
            }

            doc
              .fillColor(
                colors.text
              )
              .font(
                "Helvetica"
              )
              .fontSize(8.5);

            doc.text(
              String(
                index + 1
              ),
              columns.number.x,
              y + 5,
              {
                width:
                  columns.number
                    .width,
                align:
                  "center",
              }
            );

            doc
              .font(
                "Helvetica-Bold"
              )
              .text(
                item.name,
                columns.product.x,
                y + 5,
                {
                  width:
                    columns.product
                      .width -
                    5,
                }
              );

            if (
              Number(
                item.discount
              ) > 0
            ) {
              doc
                .fillColor(
                  colors.dangerText
                )
                .font(
                  "Helvetica"
                )
                .fontSize(7)
                .text(
                  `${item.discount}% descuento`,
                  columns.product.x,
                  y + 21,
                  {
                    width:
                      columns.product
                        .width,
                  }
                );
            }

            doc
              .fillColor(
                colors.text
              )
              .font(
                "Helvetica"
              )
              .fontSize(8);

            doc.text(
              item.color ||
                "-",
              columns.color.x,
              y + 5,
              {
                width:
                  columns.color
                    .width,
              }
            );

            doc.text(
              item.size ||
                "-",
              columns.size.x,
              y + 5,
              {
                width:
                  columns.size
                    .width,
                align:
                  "center",
              }
            );

            doc.text(
              String(
                item.quantity
              ),
              columns.quantity.x,
              y + 5,
              {
                width:
                  columns.quantity
                    .width,
                align:
                  "center",
              }
            );

            doc.text(
              formatCurrency(
                item.unitPrice
              ),
              columns.price.x,
              y + 5,
              {
                width:
                  columns.price
                    .width,
                align:
                  "right",
              }
            );

            doc
              .font(
                "Helvetica-Bold"
              )
              .text(
                formatCurrency(
                  item.subtotal
                ),
                columns.subtotal.x,
                y + 5,
                {
                  width:
                    columns.subtotal
                      .width,
                  align:
                    "right",
                }
              );

            y += rowHeight;

            doc
              .strokeColor(
                colors.border
              )
              .lineWidth(0.7)
              .moveTo(
                tableX,
                y
              )
              .lineTo(
                tableX +
                  tableWidth,
                y
              )
              .stroke();

            y += 5;
          }
        );

        /*
         * ========================================
         * RESUMEN
         * ========================================
         */

        if (y > 610) {
          doc.addPage();

          y = 60;
        }

        y += 20;

        const summaryWidth =
          220;

        const summaryX =
          right -
          summaryWidth;

        const summaryHeight =
          discountTotal > 0
            ? 145
            : 120;

        doc
          .roundedRect(
            summaryX,
            y,
            summaryWidth,
            summaryHeight,
            8
          )
          .fillAndStroke(
            colors.lightBackground,
            colors.border
          );

        let summaryY =
          y + 16;

        /*
         * SUBTOTAL
         */

        doc
          .fillColor(
            colors.secondary
          )
          .font(
            "Helvetica"
          )
          .fontSize(9)
          .text(
            "Subtotal",
            summaryX + 15,
            summaryY
          );

        doc
          .fillColor(
            colors.text
          )
          .font(
            "Helvetica-Bold"
          )
          .text(
            formatCurrency(
              originalSubtotal
            ),
            summaryX + 100,
            summaryY,
            {
              width: 100,
              align:
                "right",
            }
          );

        summaryY += 25;

        /*
         * DESCUENTOS
         */

        if (
          discountTotal > 0
        ) {
          doc
            .fillColor(
              colors.dangerText
            )
            .font(
              "Helvetica"
            )
            .text(
              "Descuentos",
              summaryX + 15,
              summaryY
            );

          doc
            .font(
              "Helvetica-Bold"
            )
            .text(
              `-${formatCurrency(
                discountTotal
              )}`,
              summaryX + 100,
              summaryY,
              {
                width: 100,
                align:
                  "right",
              }
            );

          summaryY += 25;
        }

        /*
         * COSTO DE ENVÍO
         */

        doc
          .fillColor(
            colors.secondary
          )
          .font(
            "Helvetica"
          )
          .fontSize(9)
          .text(
            "Costo de envío",
            summaryX + 15,
            summaryY
          );

        if (
          shippingCost > 0
        ) {
          doc
            .fillColor(
              colors.text
            )
            .font(
              "Helvetica-Bold"
            )
            .text(
              formatCurrency(
                shippingCost
              ),
              summaryX + 100,
              summaryY,
              {
                width: 100,
                align:
                  "right",
              }
            );
        } else {
          doc
            .fillColor(
              colors.successText
            )
            .font(
              "Helvetica-Bold"
            )
            .text(
              "GRATIS",
              summaryX + 100,
              summaryY,
              {
                width: 100,
                align:
                  "right",
              }
            );
        }

        summaryY += 28;

        /*
         * SEPARADOR
         */

        doc
          .strokeColor(
            colors.border
          )
          .moveTo(
            summaryX + 15,
            summaryY
          )
          .lineTo(
            summaryX +
              summaryWidth -
              15,
            summaryY
          )
          .stroke();

        summaryY += 12;

        /*
         * TOTAL
         */

        doc
          .fillColor(
            colors.text
          )
          .font(
            "Helvetica-Bold"
          )
          .fontSize(12)
          .text(
            "TOTAL",
            summaryX + 15,
            summaryY
          );

        doc
          .fontSize(14)
          .text(
            formatCurrency(
              invoiceTotal
            ),
            summaryX + 95,
            summaryY - 2,
            {
              width: 105,
              align:
                "right",
            }
          );

        y +=
          summaryHeight +
          25;

        /*
         * ========================================
         * NOTAS
         * ========================================
         */

        if (
          order.customer
            ?.notes
        ) {
          if (y > 680) {
            doc.addPage();

            y = 60;
          }

          doc
            .roundedRect(
              left,
              y,
              contentWidth,
              65,
              8
            )
            .fillAndStroke(
              colors.lightBackground,
              colors.border
            );

          doc
            .fillColor(
              colors.text
            )
            .font(
              "Helvetica-Bold"
            )
            .fontSize(9)
            .text(
              "NOTAS",
              left + 15,
              y + 13
            );

          doc
            .fillColor(
              colors.secondary
            )
            .font(
              "Helvetica"
            )
            .fontSize(9)
            .text(
              order.customer
                .notes,
              left + 15,
              y + 32,
              {
                width:
                  contentWidth -
                  30,
              }
            );

          y += 85;
        }

        /*
         * ========================================
         * AGRADECIMIENTO
         * ========================================
         */

        if (y > 690) {
          doc.addPage();

          y = 90;
        }

        doc
          .fillColor(
            colors.text
          )
          .font(
            "Helvetica-Bold"
          )
          .fontSize(17)
          .text(
            "¡Gracias por tu compra!",
            left,
            y,
            {
              width:
                contentWidth,
              align:
                "center",
            }
          );

        doc
          .moveDown(0.5)
          .fillColor(
            colors.secondary
          )
          .font(
            "Helvetica"
          )
          .fontSize(9)
          .text(
            "En CLOTHES J&S queremos que cada prenda sea parte de tu historia.",
            {
              width:
                contentWidth,
              align:
                "center",
            }
          );

        doc
          .moveDown(0.4)
          .fillColor(
            colors.accent
          )
          .font(
            "Helvetica-Bold"
          )
          .fontSize(10)
          .text(
            "WEAR YOUR STORY",
            {
              width:
                contentWidth,
              align:
                "center",
              characterSpacing:
                1.5,
            }
          );

        doc.moveDown(1.5);

        drawLine(
          doc.y
        );

        doc.moveDown(0.8);

        doc
          .fillColor(
            colors.lightText
          )
          .font(
            "Helvetica"
          )
          .fontSize(7.5)
          .text(
            "Este documento corresponde a un comprobante de compra generado a partir del pedido registrado en CLOTHES J&S.",
            left,
            doc.y,
            {
              width:
                contentWidth,
              align:
                "center",
            }
          );

        doc.end();
      } catch (error) {
        reject(error);
      }
    }
  );
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  markWhatsappSent,
  generateOrderInvoice,
};