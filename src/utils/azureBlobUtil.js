const { BlobServiceClient } = require('@azure/storage-blob');
const fs = require('fs');
const folder = '/temp';

class AzureBlobUtil {
  constructor(connectionString) {
    const connStr = connectionString || process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!connStr || connStr.includes('<YOUR_AZURE_ACCOUNT_NAME>') || connStr.includes('<YOUR_AZURE_ACCOUNT_KEY>')) {
      throw new Error("AZURE_STORAGE_CONNECTION_STRING is missing or contains unconfigured placeholder values in .env");
    }
    this.blobServiceClient = BlobServiceClient.fromConnectionString(connStr);
  }

  // Test connection to Azure Blob Storage and verify/create container
  async testConnection(containerName) {
    try {
      if (containerName) {
        const containerClient = this.blobServiceClient.getContainerClient(containerName);
        const exists = await containerClient.exists();
        if (!exists) {
          await containerClient.create({ access: 'blob' });
          console.log(`Container '${containerName}' created successfully with public blob access.`);
        } else {
          console.log(`Successfully connected to Azure container: ${containerName}`);
        }
        return true;
      } else {
        const iter = this.blobServiceClient.listContainers();
        const containers = [];
        for await (const container of iter) {
          containers.push(container.name);
        }
        console.log('Azure Blob Storage connection successful. Containers:', containers);
        return true;
      }
    } catch (err) {
      console.error('Error connecting to Azure Blob Storage:', err.message);
      return false;
    }
  }

  // Upload file content (Buffer or string) to specified container and blob
  async uploadFile(containerName, blobName, fileContent, contentType = 'application/octet-stream') {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      const length = Buffer.isBuffer(fileContent) ? fileContent.length : Buffer.byteLength(fileContent);

      await blockBlobClient.upload(fileContent, length, {
        blobHTTPHeaders: {
          blobContentType: contentType,
        },
      });

      console.log(`File uploaded successfully to ${containerName}/${blobName}`);
      return blockBlobClient.url;
    } catch (err) {
      console.error('Error uploading file to Azure:', err);
      throw err;
    }
  }

  // Download a blob to a local file
  async downloadFile(containerName, blobName, filenames) {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      const downloadResponse = await blockBlobClient.download(0);

      const destPath = `${folder}/${filenames}`;
      const writeStream = fs.createWriteStream(destPath);
      downloadResponse.readableStreamBody.pipe(writeStream);

      return new Promise((resolve, reject) => {
        writeStream.on('finish', () => {
          console.log('File downloaded and saved successfully to', destPath);
          resolve(destPath);
        });
        writeStream.on('error', (err) => {
          console.error('Error writing file:', err);
          reject(err);
        });
      });
    } catch (err) {
      console.error('Error downloading file from Azure:', err);
      throw err;
    }
  }

  // List all blobs in the specified container
  async listFiles(containerName) {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(containerName);
      const blobs = [];
      for await (const blob of containerClient.listBlobsFlat()) {
        blobs.push(blob);
      }
      return blobs;
    } catch (err) {
      console.error('Error listing files from Azure container:', err);
      throw err;
    }
  }

  // Delete a blob
  async deleteFile(containerName, blobName) {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.deleteIfExists();
      console.log(`Blob ${blobName} deleted successfully from Azure.`);
      return true;
    } catch (err) {
      console.error('Error deleting blob from Azure:', err);
      throw err;
    }
  }
}

module.exports = AzureBlobUtil;
