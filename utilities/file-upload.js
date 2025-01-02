const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const dotnev = require('dotenv');

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const fileUploader = async files => {
  const fileStructure = {};

  for (const fieldName in files) {
    fileStructure[fieldName] = await Promise.all(
      files[fieldName].map(async file => {
        const result = await cloudinary.uploader.upload(file.path);
        fs.unlinkSync(file.path);
        return {
          originalName: file.originalname,
          cloudinaryUrl: result.secure_url,
        };
      })
    );
  }

  return fileStructure;
};

module.exports = fileUploader;
