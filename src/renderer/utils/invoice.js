import dayjs from "dayjs";

export const getInvoiceName = ({ invoice, me, client, settings }) => {
  const template = settings.invoice_file_name;
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
  const template = settings.invoice_number_format;
  return template
    .replace(/{YYYY}/g, dayjs(emissionDate).format("YYYY"))
    .replace(/{MM}/g, dayjs(emissionDate).format("MM"))
    .replace(/{CLIENT CODE}/g, getClientCode(client))
    .replace(/{INC}/g, inc)
    .replace("--", "-");
};
