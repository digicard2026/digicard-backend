
const { S3Client, HeadBucketCommand, ListBucketsCommand, PutObjectCommand, GetObjectCommand, ListObjectsV2Command,  DeleteObjectCommand  } = require('@aws-sdk/client-s3');
const region = process.env.AWS_REGION || 'eu-north-1';
const fs = require('fs');
const folder = '/temp';
class S3Util {
  constructor(region) {
    this.s3 = new S3Client({ region }); // Initialize S3Client with specified region
  }

  // Test the connection to S3 by listing buckets or checking bucket access
  async testConnection(bucketName) {
    try {
      if (bucketName) {

        const command = new HeadBucketCommand({ Bucket: bucketName });
        await this.s3.send(command);
        console.log(`Successfully connected to bucket: ${bucketName}`);
        return true;
      } else {

        const command = new ListBucketsCommand({});
        const data = await this.s3.send(command);
        console.log('Connection successful. Buckets:', data.Buckets);
        return true;
      }
    } catch (err) {
      console.error('Error connecting to S3:', err);
      return false;
    }
  }


  async uploadFile(bucketName, key, fileContent) {
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: fileContent,
    };
    const command = new PutObjectCommand(params);

    try {
      const data = await this.s3.send(command);
      console.log(`File uploaded successfully to ${bucketName}/${key}`);
      return `https://${bucketName}.s3.${this.s3.config.region}.amazonaws.com/${key}`;
    } catch (err) {
      console.error('Error uploading file:', err);
      throw err;
    }
  }


  async downloadFile(bucketName, key, filenames) {
    const params = {
      Bucket: bucketName,
      Key: key,
    };
    const command = new GetObjectCommand(params);
    try {
      const data = await this.s3.send(command);
      const writeStream = fs.createWriteStream(`${folder}/${filenames}`);
      data.Body.pipe(writeStream);

      writeStream.on('finish', () => {
        console.log('File downloaded and saved successfully!');
      });

      writeStream.on('error', (err) => {
        console.error('Error writing file:', err);
      });
    } catch (err) {
      console.error('Error downloading file:', err);
      throw err;
    }
  }

  // List all objects in the specified bucket
  async listFiles(bucketName) {
    const params = {
      Bucket: bucketName,
    };
    const command = new ListObjectsV2Command(params);

    try {
      const data = await this.s3.send(command);
      return data.Contents;
    } catch (err) {
      console.error('Error listing files:', err);
      throw err;
    }
  }
}

module.exports = S3Util;

