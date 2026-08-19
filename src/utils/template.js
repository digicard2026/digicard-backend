// const moment = require('moment');

// function getInvoiceTemplate(doc, invoice) {
//   const { billingDetails, createdAt, _id } = invoice;
//   const patient = invoice.patient;
//   const doctor = invoice.doctor;
//   const department = invoice.department; 
//   const appointment = invoice.appointment;

//   const fullName = `${patient.first_name} ${patient.middle_name || ''} ${patient.last_name}`.trim();
//   const invoiceDate = moment(createdAt).format('DD-MM-YYYY HH:mm');
//   const visitDate = moment(appointment.appointmentDate).format('DD-MM-YYYY');
//   const discounted = billingDetails.consultationFee - (billingDetails.consultationFee * billingDetails.discount / 100);

//   // === Header ===
//   doc.fillColor('#333333');
//   doc.fontSize(22).text('Gravitywave Labs HMS', { align: 'center' });
//   doc.fontSize(10).fillColor('#555555').text('Address Line 1, City, State - ZIP', { align: 'center' });
//   doc.text('Phone: +91-XXXXXXXXXX | Email: clinic@gravitywavelabs.com', { align: 'center' });

//   doc.moveDown();
//   doc.fillColor('#000000').fontSize(16).text('INVOICE', { align: 'center', underline: true });

//   // === Invoice Info Box ===
//   doc.moveDown();
//   doc.roundedRect(50, doc.y, 500, 40, 5).fillOpacity(1.fill('#f0f0f0').stroke();
//   doc.fillColor('#000000').fontSize(10).text(`Invoice ID: ${_id || 'N/A'}`, 60, doc.y - 30);
//   doc.text(`Date: ${invoiceDate}`, 400, doc.y - 15);

//   doc.moveDown(2);

//   // === Patient Details Section ===
//   doc.fillColor('#004080').fontSize(12).text('Patient Details:', { underline: true });
//   doc.fillColor('#000000').fontSize(10);
//   doc.text(`Name: ${fullName}`);
//   doc.text(`Gender: ${patient.gender || appointment.gender}`);
//   doc.text(`Age: ${appointment.age.value || patient.age.value} ${appointment.age.unit || patient.age.unit}`);
//   doc.text(`Contact: ${patient.contactNumber || appointment.contactNumber || 'N/A'}`);
//   doc.text(`Email: ${patient.email || 'N/A'}`);

//   doc.moveDown();

//   // === Doctor & Visit Details Section ===
//   doc.fillColor('#004080').fontSize(12).text('Doctor & Visit Details:', { underline: true });
//   doc.fillColor('#000000').fontSize(10);
//   doc.text(`Doctor: Dr. ${doctor.first_name} ${doctor.last_name}`);
//   doc.text(`Department: ${department.departmentName}`);
//   doc.text(`Visit Type: ${appointment.visitType}`);
//   doc.text(`Visit Date: ${visitDate}`);

//   doc.moveDown();

//   // === Billing Table Section ===
//   doc.fillColor('#004080').fontSize(12).text('Billing Details:', { underline: true });
//   doc.moveDown(0.5);
//   doc.fontSize(10);

//   // Table headers
//   const tableTop = doc.y;
//   const left = 60;
//   doc.fillColor('#e6f2ff').rect(left - 10, tableTop - 2, 480, 20).fill();
//   doc.fillColor('#000000')
//     .text('Description', left, tableTop)
//     .text('Amount (INR)', 400, tableTop, { width: 90, align: 'right' });

//   doc.moveDown();

//   // Table rows
//   doc.fillColor('#000000');
//   const rowSpacing = 20;
//   const startY = doc.y;

//   doc.text('Consultation Fee', left, startY)
//      .text(billingDetails.consultationFee.toFixed(2), 400, startY, { width: 90, align: 'right' });

//   doc.text('Discount', left, startY + rowSpacing)
//      .text(`${billingDetails.discount}%`, 400, startY + rowSpacing, { width: 90, align: 'right' });

//   doc.moveTo(left - 10, startY + rowSpacing * 2)
//      .lineTo(540, startY + rowSpacing * 2)
//      .dash(1, { space: 2 })
//      .stroke();

//   doc.text('Total Amount', left, startY + rowSpacing * 2 + 5)
//      .font('Helvetica-Bold')
//      .text(`${discounted.toFixed(2)}`, 400, startY + rowSpacing * 2 + 5, { width: 90, align: 'right' })
//      .font('Helvetica');

//   doc.moveDown(2);
//   doc.text(`Payment Method: ${billingDetails.paymentMethod}`, { align: 'left' });

//   // === Footer ===
//   doc.moveDown(3);
//   doc.fontSize(12).fillColor('#000000').text('Thank you for visiting!', { align: 'center' });

//   return doc;
// }

// module.exports = getInvoiceTemplate;
const moment = require('moment');

function getInvoiceTemplate(doc, invoice) {
  const { billingDetails, createdAt, _id } = invoice;
  const patient = invoice.patient;
  const doctor = invoice.doctor;
  const department = invoice.department;
  const appointment = invoice.appointment;

  const fullName = `${patient.first_name} ${patient.middle_name || ''} ${patient.last_name}`.trim();
  const doctorFullName = `${doctor.salutation} ${doctor.first_name}${doctor.middle_name ? ' ' + doctor.middle_name : ''} ${doctor.last_name}`;
  const invoiceDate = moment(createdAt).format('DD-MM-YYYY HH:mm');
  const visitDate = moment(appointment.appointmentDate).format('DD-MM-YYYY');
  const discounted = billingDetails.consultationFee - (billingDetails.consultationFee * billingDetails.discount / 100);


  const pageWidth = doc.page.width;
  const margin = 50;
  const colGap = 30;
  const colWidth = (pageWidth - margin * 2 - colGap) / 2;
  const leftColX = margin + 30;
  const rightColX = margin + colWidth + colGap + 20;
  const lineHeight = 14;


  doc.fillColor('#1f2937').fontSize(22).font('Helvetica-Bold').text('Gravitywave Labs HMS', { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(10).font('Helvetica').fillColor('#4b5563')
  //  .text(
  //   `${doctorFullName}`,
  //   { align: 'center', fontSize: 14 }
  // )
  .text(
    `${doctor.contact_address.addressLine1}${doctor.contact_address.addressLine2 ? ', ' + doctor.contact_address.addressLine2 : ''}, ${doctor.contact_address.city}, ${doctor.contact_address.state} - ${doctor.contact_address.zipCode}`,
    { align: 'center' }
  )
  .text(
    `Phone: +91-${doctor.contact_no} | Email: ${doctor.email_id}`,
    { align: 'center' }
  );
  doc.moveDown(1.5);
  doc.fillColor('#1f2937').fontSize(16).font('Helvetica-Bold').text('INVOICE', { align: 'center' });

  doc.moveDown(1.5);


  const invoiceBoxTop = doc.y;
  doc.roundedRect(margin, invoiceBoxTop, pageWidth - 2 * margin, 50, 8).fillOpacity(1).fill('#f3f4f6').stroke();
  doc.fillColor('#111827').fontSize(10).font('Helvetica')
    .text(`Invoice ID: ${_id || 'N/A'}`, margin + 15, invoiceBoxTop + 10)
    .text(`Date: ${invoiceDate}`, pageWidth - margin - 140, invoiceBoxTop + 10);

  doc.moveDown(4);


  const detailsTop = doc.y;
  const boxHeight = 5 * lineHeight + 30;
  doc.roundedRect(margin, detailsTop - 5, pageWidth - 2 * margin, boxHeight, 8).fillOpacity(1).fill('#f9fafb').stroke();


  const headingFontSize = 11;
  const labelFontSize = 10;
  const bodyFont = 'Helvetica';
  const headingFont = 'Helvetica-Bold';
  let y = detailsTop + 5;

  doc.fillColor('#1e3a8a').fontSize(headingFontSize).font(headingFont)
    .text('PATIENT DETAILS', leftColX, y)
    .text('DOCTOR & VISIT DETAILS', rightColX, y);

  y += 18;


  doc.fillColor('#111827').fontSize(labelFontSize).font(bodyFont)
    .text(`Name: ${fullName}`, leftColX, y)
    .text(`Gender: ${patient.gender || appointment.gender}`, leftColX, y + lineHeight)
    .text(`Age: ${appointment?.age?.value || patient?.age?.value} ${appointment?.age?.unit || patient?.age?.unit}`, leftColX, y + lineHeight * 2)
    .text(`Contact: ${patient.contactNumber || appointment.contactNumber || 'N/A'}`, leftColX, y + lineHeight * 3)
    .text(`Email: ${patient.email || 'N/A'}`, leftColX, y + lineHeight * 4);

 
  doc.text(`Doctor: Dr. ${doctor.first_name} ${doctor.last_name}`, rightColX, y)
    .text(`Department: ${department.departmentName || department}`, rightColX, y + lineHeight)
    .text(`Visit Type: ${appointment.visitType}`, rightColX, y + lineHeight * 2)
    .text(`Visit Date: ${visitDate}`, rightColX, y + lineHeight * 3);

  doc.moveDown(4); 

  

  const tableTop = doc.y;
  const tableLeft = margin + 10;
  const tableRight = pageWidth - margin - 100;

  doc.fillColor('#d1d5db').roundedRect(tableLeft - 5, tableTop - 2, pageWidth - 2 * margin - 10, 22, 5).fill();
  doc.fillColor('#000000').fontSize(10).font(headingFont)
    .text('Description', tableLeft, tableTop + 4)
    .text('Amount (INR)', tableRight, tableTop + 4, { width: 90, align: 'right' });

  doc.moveDown(1.5);

  doc.font(bodyFont).fillColor('#111827');
  doc.text('Consultation Fee', tableLeft, doc.y)
    .text(billingDetails.consultationFee.toFixed(2), tableRight, doc.y - 10, { width: 90, align: 'right' });

  doc.moveDown(1);
  doc.text('Discount', tableLeft, doc.y)
    .text(`${billingDetails.discount}%`, tableRight, doc.y - 10, { width: 90, align: 'right' });

  doc.moveDown(0.5);
  doc.moveTo(tableLeft - 5, doc.y).lineTo(pageWidth - margin - 5, doc.y).dash(1, { space: 2 }).stroke();

  doc.moveDown(0.7);
  doc.font(headingFont).text('Total Amount', tableLeft, doc.y)
    .text(`${discounted.toFixed(2)}`, tableRight, doc.y - 10, { width: 90, align: 'right' });

  doc.moveDown(2);

  doc.font(bodyFont).fillColor('#111827')
    .text(`Payment Method: ${billingDetails.paymentMethod}`, margin, doc.y, { align: 'center' });

  
  doc.moveDown(3);
  doc.fontSize(11).fillColor('#1f2937').font(headingFont)
    .text('Thank you for visiting!', margin, doc.y, { align: 'center' });

  return doc;
}

module.exports = getInvoiceTemplate;
