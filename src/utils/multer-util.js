const multer = require("multer");
const { BlobServiceClient } = require("@azure/storage-blob");
const path = require("path");

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER_NAME || "cards";

let blobServiceClient = null;
let containerClient = null;

const isValidConnectionString =
    CONNECTION_STRING &&
    !CONNECTION_STRING.includes("<YOUR_AZURE_ACCOUNT_NAME>") &&
    !CONNECTION_STRING.includes("<YOUR_AZURE_ACCOUNT_KEY>");

if (isValidConnectionString) {
    try {
        blobServiceClient = BlobServiceClient.fromConnectionString(CONNECTION_STRING);
        containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

        // Ensure container exists with public blob read access
        (async () => {
            try {
                const exists = await containerClient.exists();
                if (!exists) {
                    await containerClient.create({ access: "blob" });
                    console.log(`Azure container '${CONTAINER_NAME}' created with public blob access.`);
                }
            } catch (err) {
                console.error("Error ensuring Azure container exists:", err.message);
            }
        })();
    } catch (initErr) {
        console.error("⚠️ Error initializing Azure Blob Storage client:", initErr.message);
    }
} else {
    console.warn("⚠️ Warning: AZURE_STORAGE_CONNECTION_STRING in .env is missing or contains placeholder values. Please update it with your actual Azure connection string.");
}

// Custom Multer Storage Engine for Azure Blob Storage
const azureBlobStorage = {
    _handleFile(req, file, cb) {
        if (!containerClient) {
            return cb(new Error("Azure Blob Storage client is not initialized. Please configure valid AZURE_STORAGE_CONNECTION_STRING in .env."));
        }

        const ext = path.extname(file.originalname);
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(7);
        const sanitizedFilename = file.originalname
            .replace(ext, '')
            .replace(/[^a-zA-Z0-9]/g, '-')
            .toLowerCase();

        const blobName = `cards/${file.fieldname}-${sanitizedFilename}-${timestamp}-${randomString}${ext}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        const chunks = [];
        file.stream.on("data", (chunk) => chunks.push(chunk));
        file.stream.on("end", async () => {
            try {
                const buffer = Buffer.concat(chunks);
                await blockBlobClient.upload(buffer, buffer.length, {
                    blobHTTPHeaders: {
                        blobContentType: file.mimetype,
                    },
                });

                cb(null, {
                    location: blockBlobClient.url, // Keeps exact compatibility with controller (file.location)
                    url: blockBlobClient.url,
                    blobName: blobName,
                    container: CONTAINER_NAME,
                    size: buffer.length,
                    mimetype: file.mimetype,
                    originalname: file.originalname,
                });
            } catch (uploadError) {
                cb(uploadError);
            }
        });
        file.stream.on("error", (streamError) => cb(streamError));
    },

    _removeFile(req, file, cb) {
        if (file.blobName && containerClient) {
            const blockBlobClient = containerClient.getBlockBlobClient(file.blobName);
            blockBlobClient.deleteIfExists().then(() => cb(null)).catch(cb);
        } else {
            cb(null);
        }
    },
};

const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
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
    storage: azureBlobStorage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 50
    },
});

module.exports = cardUpload;