const { 
  BlobServiceClient, 
  StorageSharedKeyCredential, 
  generateBlobSASQueryParameters, 
  BlobSASPermissions 
} = require('@azure/storage-blob');
const fs = require('fs');
const folder = '/temp';

class AzureBlobUtil {
  constructor(connectionString) {
    const connStr = connectionString || process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!connStr || connStr.includes('<YOUR_AZURE_ACCOUNT_NAME>') || connStr.includes('<YOUR_AZURE_ACCOUNT_KEY>')) {
      throw new Error("AZURE_STORAGE_CONNECTION_STRING is missing or contains unconfigured placeholder values in .env");
    }
    this.blobServiceClient = BlobServiceClient.fromConnectionString(connStr);

    try {
      const parts = Object.fromEntries(
        connStr.split(';').filter(Boolean).map(p => {
          const idx = p.indexOf('=');
          return idx > -1 ? [p.substring(0, idx).trim(), p.substring(idx + 1).trim()] : [p, ''];
        })
      );
      this.accountName = parts.AccountName;
      this.accountKey = parts.AccountKey;
      if (this.accountName && this.accountKey) {
        this.sharedKeyCredential = new StorageSharedKeyCredential(this.accountName, this.accountKey);
      }
    } catch (parseErr) {
      console.warn("Could not parse StorageSharedKeyCredential for SAS generation:", parseErr.message);
    }
  }

  /**
   * Generates a 10-year read SAS token for a specific blob.
   */
  generateBlobSasToken(containerName, blobName) {
    if (!this.sharedKeyCredential) return '';
    try {
      const permissions = BlobSASPermissions.parse('r');
      const startsOn = new Date(Date.now() - 5 * 60 * 1000); // 5 min skew buffer
      const expiresOn = new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000); // 10 years

      return generateBlobSASQueryParameters({
        containerName,
        blobName,
        permissions,
        startsOn,
        expiresOn,
      }, this.sharedKeyCredential).toString();
    } catch (err) {
      console.error('Error generating Blob SAS token:', err.message);
      return '';
    }
  }

  /**
   * Returns a publicly viewable SAS URL for a blob or raw Azure URL.
   */
  getSasUrl(containerName, blobNameOrUrl) {
    if (!blobNameOrUrl || typeof blobNameOrUrl !== 'string') return blobNameOrUrl;

    let targetBlobName = blobNameOrUrl;
    let targetContainer = containerName || process.env.AZURE_STORAGE_CONTAINER_NAME || 'cards';

    // If it already has an active signature, return unchanged
    if (blobNameOrUrl.includes('sig=')) {
      return blobNameOrUrl;
    }

    // If full URL was passed: https://account.blob.core.windows.net/cards/cards/...
    if (blobNameOrUrl.startsWith('http://') || blobNameOrUrl.startsWith('https://')) {
      try {
        const urlObj = new URL(blobNameOrUrl);
        const segments = urlObj.pathname.split('/').filter(Boolean);
        if (segments.length >= 2) {
          targetContainer = segments[0];
          targetBlobName = decodeURIComponent(segments.slice(1).join('/'));
        } else {
          return blobNameOrUrl;
        }
      } catch (e) {
        return blobNameOrUrl;
      }
    }

    const sasToken = this.generateBlobSasToken(targetContainer, targetBlobName);
    if (!sasToken) return blobNameOrUrl;

    const baseUrl = `https://${this.accountName || 'digicardblobstorage'}.blob.core.windows.net/${targetContainer}/${encodeURI(targetBlobName)}`;
    return `${baseUrl}?${sasToken}`;
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

  // Automatically configure CORS on Azure Storage so frontend html-to-image can snapshot card without CORS errors
  async ensureCorsRules() {
    try {
      await this.blobServiceClient.setProperties({
        cors: [
          {
            allowedOrigins: '*',
            allowedMethods: 'GET,HEAD,OPTIONS,PUT,POST',
            allowedHeaders: '*',
            exposedHeaders: '*',
            maxAgeInSeconds: 86400,
          }
        ]
      });
      console.log('✅ Azure Blob Storage CORS configured successfully (* allowed)');
      return true;
    } catch (err) {
      console.warn('⚠️ Azure Blob CORS auto-config notice:', err.message);
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
      return this.getSasUrl(containerName, blobName) || blockBlobClient.url;
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
