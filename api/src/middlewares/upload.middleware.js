const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (_req, file, callback) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return callback(
      new Error("Only JPG, PNG and WEBP images are allowed")
    );
  }

  return callback(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 6,
  },
  fileFilter,
});

module.exports = upload;