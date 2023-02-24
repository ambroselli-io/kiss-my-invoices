import dayjs from "dayjs";

export const defaultInvoiceName = `{INVOICE NUMBER} - {MY COMPANY NAME} - {CLIENT NAME} - {INVOICE TITLE}.pdf`;
export const defaultInvoiceNumberFormat = `{YYYY}-{MM}-{INC}`;

export const sortInvoices = (a, b) => {
  // sort only by incremental number
  const aInc = parseInt(a.invoice_number.split("-").pop(), 10);
  const bInc = parseInt(b.invoice_number.split("-").pop(), 10);
  return aInc - bInc;
};

export const getNextInvoiceNumber = (invoices) => {
  const lastInvoice = invoices[invoices.length - 1];
  const lastInc = lastInvoice ? parseInt(lastInvoice.invoice_number.split("-").pop(), 10) : 0;
  const nextInc = lastInc + 1;
  return String(nextInc).padStart(3, "0");
};

export const getInvoiceName = ({ invoice, me, client, settings }) => {
  const template = settings.invoice_file_name || defaultInvoiceName;
  const templateWithPDFExtension = template.endsWith(".pdf") ? template : `${template}.pdf`;
  return templateWithPDFExtension
    .replace(/{INVOICE DATE}/g, dayjs(invoice.emission_date).format("DD-MM-YYYY"))
    .replace(/{INVOICE NUMBER}/g, invoice.invoice_number)
    .replace(/{INVOICE TITLE}/g, invoice.title)
    .replace(/{MY COMPANY NAME}/g, me.organisation_name)
    .replace(/{CLIENT NAME}/g, client.organisation_name);
};

const getClientCode = (client) => {
  if (!client) return "XXXX";
  if (client.code) return client.code;
  return "";
};

export const getInvoiceNumber = ({ client, emissionDate, settings, inc }) => {
  const template = settings.invoice_number_format || defaultInvoiceNumberFormat;
  return template
    .replace(/{YYYY}/g, dayjs(emissionDate).format("YYYY"))
    .replace(/{MM}/g, dayjs(emissionDate).format("MM"))
    .replace(/{CLIENT CODE}/g, getClientCode(client))
    .replace(/{INC}/g, inc)
    .replace("--", "-");
};
