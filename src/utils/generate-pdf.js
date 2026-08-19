const PDFDocument = require('pdfkit');
const getInvoiceTemplate = require('./template');

module.exports = async function generateInvoicePDF(invoice) {
    console.log(invoice);
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      getInvoiceTemplate(doc, invoice);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
