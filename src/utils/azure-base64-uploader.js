const AzureBlobUtil = require('./azureBlobUtil');

let azureBlobUtilInstance = null;
function getAzureBlobUtil() {
  if (!azureBlobUtilInstance) {
    try {
      azureBlobUtilInstance = new AzureBlobUtil();
    } catch (err) {
      console.error('⚠️ Could not initialize AzureBlobUtil:', err.message);
      return null;
    }
  }
  return azureBlobUtilInstance;
}

function isBase64DataUrl(str) {
  return typeof str === 'string' && str.startsWith('data:') && str.includes(';base64,');
}

const MIME_EXT_MAP = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
  'application/pdf': '.pdf',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov',
  'audio/mpeg': '.mp3',
  'audio/wav': '.wav',
};

/**
 * Uploads a base64 Data URL to Azure Blob Storage and returns its public URL.
 * If the input is not a base64 data URL, it returns the input unchanged.
 */
async function uploadBase64ToAzure(base64Str, prefix = 'file', originalName = '') {
  if (!isBase64DataUrl(base64Str)) {
    return base64Str;
  }

  const azureUtil = getAzureBlobUtil();
  if (!azureUtil) {
    console.warn('⚠️ Azure storage client unavailable, keeping original data');
    return base64Str;
  }

  try {
    const matches = base64Str.match(/^data:([a-zA-Z0-9/.-]+);base64,(.+)$/);
    if (!matches) {
      return base64Str;
    }

    const mimeType = matches[1].toLowerCase();
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const ext = MIME_EXT_MAP[mimeType] || (mimeType.startsWith('image/') ? '.jpg' : '.bin');
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const safeName = (originalName || prefix)
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase() || 'upload';

    const blobName = `cards/${prefix}-${safeName}-${timestamp}-${randomString}${ext}`;
    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'cards';

    console.log(`📤 Uploading Base64 ${prefix} (${buffer.length} bytes, ${mimeType}) to Azure Blob Storage: ${blobName}...`);
    const url = await azureUtil.uploadFile(containerName, blobName, buffer, mimeType);
    console.log(`✅ Uploaded to Azure Blob: ${url}`);
    return url;
  } catch (err) {
    console.error(`❌ Failed to upload base64 for ${prefix} to Azure Blob Storage:`, err.message);
    return base64Str; // Return original on error as fallback
  }
}

/**
 * Traverses all file and image fields of a card object, uploads any base64
 * data URLs directly to Azure Blob Storage, and replaces them with the returned public URLs.
 */
async function processCardBase64Files(cardDetails) {
  if (!cardDetails || typeof cardDetails !== 'object') {
    return cardDetails;
  }

  // 1. Profile Photo
  if (cardDetails.profilePhoto && isBase64DataUrl(cardDetails.profilePhoto)) {
    cardDetails.profilePhoto = await uploadBase64ToAzure(cardDetails.profilePhoto, 'profilePhoto');
  }

  // 2. Company Logo
  if (cardDetails.companyLogo && isBase64DataUrl(cardDetails.companyLogo)) {
    cardDetails.companyLogo = await uploadBase64ToAzure(cardDetails.companyLogo, 'companyLogo');
  }

  // 3. Catalog PDF
  if (cardDetails.catalogPDF) {
    if (typeof cardDetails.catalogPDF === 'string' && isBase64DataUrl(cardDetails.catalogPDF)) {
      cardDetails.catalogPDF = await uploadBase64ToAzure(cardDetails.catalogPDF, 'catalogPDF');
    } else if (typeof cardDetails.catalogPDF === 'object' && isBase64DataUrl(cardDetails.catalogPDF.url)) {
      cardDetails.catalogPDF.url = await uploadBase64ToAzure(
        cardDetails.catalogPDF.url,
        'catalogPDF',
        cardDetails.catalogPDF.name || ''
      );
    }
  }

  // 4. Catalog (backward compatibility)
  if (cardDetails.catalog && isBase64DataUrl(cardDetails.catalog)) {
    cardDetails.catalog = await uploadBase64ToAzure(cardDetails.catalog, 'catalog');
  }

  // 5. Profile Video
  if (cardDetails.profileVideo && typeof cardDetails.profileVideo === 'object') {
    if (isBase64DataUrl(cardDetails.profileVideo.url)) {
      cardDetails.profileVideo.url = await uploadBase64ToAzure(
        cardDetails.profileVideo.url,
        'profileVideo',
        cardDetails.profileVideo.title || ''
      );
    }
    if (isBase64DataUrl(cardDetails.profileVideo.thumbnail)) {
      cardDetails.profileVideo.thumbnail = await uploadBase64ToAzure(
        cardDetails.profileVideo.thumbnail,
        'profileVideo-thumb'
      );
    }
  }

  // 6. Product Video
  if (cardDetails.productVideo && typeof cardDetails.productVideo === 'object') {
    if (isBase64DataUrl(cardDetails.productVideo.url)) {
      cardDetails.productVideo.url = await uploadBase64ToAzure(
        cardDetails.productVideo.url,
        'productVideo',
        cardDetails.productVideo.title || ''
      );
    }
    if (isBase64DataUrl(cardDetails.productVideo.thumbnail)) {
      cardDetails.productVideo.thumbnail = await uploadBase64ToAzure(
        cardDetails.productVideo.thumbnail,
        'productVideo-thumb'
      );
    }
  }

  // 7. Gallery items
  if (Array.isArray(cardDetails.gallery)) {
    for (let i = 0; i < cardDetails.gallery.length; i++) {
      const item = cardDetails.gallery[i];
      if (typeof item === 'string' && isBase64DataUrl(item)) {
        cardDetails.gallery[i] = await uploadBase64ToAzure(item, 'gallery');
      } else if (item && typeof item === 'object') {
        if (isBase64DataUrl(item.url)) {
          item.url = await uploadBase64ToAzure(item.url, 'gallery', item.title || item.name || '');
        }
        if (isBase64DataUrl(item.thumbnail)) {
          item.thumbnail = await uploadBase64ToAzure(item.thumbnail, 'gallery-thumb');
        }
      }
    }
  }

  // 8. Services
  if (Array.isArray(cardDetails.services)) {
    for (let service of cardDetails.services) {
      if (service && isBase64DataUrl(service.image)) {
        service.image = await uploadBase64ToAzure(service.image, 'service', service.name || '');
      }
    }
  }

  // 9. Products
  if (Array.isArray(cardDetails.products)) {
    for (let product of cardDetails.products) {
      if (product && isBase64DataUrl(product.image)) {
        product.image = await uploadBase64ToAzure(product.image, 'product', product.name || '');
      }
    }
  }

  // 10. Downloads
  if (Array.isArray(cardDetails.downloads)) {
    for (let download of cardDetails.downloads) {
      if (download && isBase64DataUrl(download.fileData)) {
        const url = await uploadBase64ToAzure(download.fileData, 'download', download.name || '');
        download.fileUrl = url;
        delete download.fileData; // Remove large base64 payload
      } else if (download && isBase64DataUrl(download.fileUrl)) {
        download.fileUrl = await uploadBase64ToAzure(download.fileUrl, 'download', download.name || '');
      }
    }
  }

  // 11. Videos list
  if (Array.isArray(cardDetails.videos)) {
    for (let video of cardDetails.videos) {
      if (video && isBase64DataUrl(video.videoData)) {
        const url = await uploadBase64ToAzure(video.videoData, 'video', video.title || '');
        video.url = url;
        delete video.videoData;
      } else if (video && isBase64DataUrl(video.url)) {
        video.url = await uploadBase64ToAzure(video.url, 'video', video.title || '');
      }
      if (video && isBase64DataUrl(video.thumbnail)) {
        video.thumbnail = await uploadBase64ToAzure(video.thumbnail, 'video-thumb');
      }
    }
  }

  return cardDetails;
}

module.exports = {
  isBase64DataUrl,
  uploadBase64ToAzure,
  processCardBase64Files,
};
