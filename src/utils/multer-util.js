// const multer = require("multer");
// const multerS3 = require("multer-s3");
// const { S3Client } = require("@aws-sdk/client-s3");
// const path = require("path");

// const MAX_FILE_SIZE = 5 * 1024 * 1024; // 2MB
// const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
// const REGION = process.env.AWS_REGION;
// const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
// const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
// console.log(REGION, BUCKET_NAME, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY,'multer');


// const s3 = new S3Client({
//   region: REGION,
//   credentials: {
//     accessKeyId: AWS_ACCESS_KEY_ID,
//     secretAccessKey: AWS_SECRET_ACCESS_KEY,
//   },
// });

// // Multer-S3 Storage
// const storage = multerS3({
//   s3,
//   bucket: BUCKET_NAME,
//   contentType: multerS3.AUTO_CONTENT_TYPE,
//   key: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     const fileName = `${file.fieldname}-${Date.now()}${ext}`;
//     cb(null, `cards/${fileName}`);
//   },
// });

// const allowedMimeTypes = [
//   "image/jpeg",
//   "image/png",
//   "image/jpg",
//   "application/pdf",
//   "video/mp4",
//   "video/webm",
//   "video/quicktime"
// ];

// const fileFilter = (req, file, cb) => {
//   if (allowedMimeTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error("Invalid file type. Only JPEG, PNG, JPG, PDF allowed."), false);
//   }
// };

// const cardUpload = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: MAX_FILE_SIZE },
// });

// module.exports = cardUpload;
const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3");
const path = require("path");

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB (adjusted)
const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const REGION = process.env.AWS_REGION;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

// Validate environment variables
if (!BUCKET_NAME || !REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
    throw new Error("AWS configuration missing in environment variables");
}

const s3 = new S3Client({
    region: REGION,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
});

// Multer-S3 Storage
const storage = multerS3({
    s3,
    bucket: BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(7);
        const sanitizedFilename = file.originalname
            .replace(ext, '')
            .replace(/[^a-zA-Z0-9]/g, '-')
            .toLowerCase();
        const fileName = `${file.fieldname}-${sanitizedFilename}-${timestamp}-${randomString}${ext}`;
        cb(null, `cards/${fileName}`);
    },
});

const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp", // Added webp support
    "image/gif",
    "application/pdf",
    "video/mp4",
    "video/webm",
    "video/quicktime"
];

const fileFilter = (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types: images, PDF, videos.`), false);
    }
};

const cardUpload = multer({
    storage,
    fileFilter,
    limits: { 
        fileSize: MAX_FILE_SIZE,
        files: 50 // Total files limit
    },
});

module.exports = cardUpload;