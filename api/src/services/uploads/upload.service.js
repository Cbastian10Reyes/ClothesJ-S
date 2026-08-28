const cloudinary = require("../../config/cloudinary");
const AppError = require("../../utils/app-error");

const uploadBuffer = (buffer, folder = "products") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(
            new AppError(
              "Error uploading image",
              500,
              "IMAGE_UPLOAD_ERROR"
            )
          );
        }

        return resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    stream.end(buffer);
  });
};

const uploadImages = async (files, folder = "products") => {
  if (!files || files.length === 0) {
    return [];
  }

  const uploadedImages = await Promise.all(
    files.map((file) => uploadBuffer(file.buffer, folder))
  );

  return uploadedImages.map((image, index) => ({
    ...image,
    isPrimary: index === 0,
  }));
};

const deleteImage = async (publicId) => {
  if (!publicId) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (_error) {
    throw new AppError(
      "Error deleting image",
      500,
      "IMAGE_DELETE_ERROR"
    );
  }
};

const deleteImages = async (images = []) => {
  const publicIds = images
    .map((image) => image.publicId)
    .filter(Boolean);

  await Promise.all(publicIds.map((publicId) => deleteImage(publicId)));
};

module.exports = {
  uploadImages,
  deleteImage,
  deleteImages,
};