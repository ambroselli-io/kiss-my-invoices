import { countries } from "./countries";

const getItemPrice =
  (considerVat = true) =>
  (item) => {
    if (considerVat && item.vat > 0)
      return Math.round(item.quantity * item.unit_price * (1 + item.vat / 100) * 100) / 100;
    return Math.round((item.quantity * item.unit_price * 100) / 100);
  };

export const getItemPriceWithNoVat = getItemPrice(false);
export const getItemPriceWithVat = getItemPrice(true);
export const getCurrencySymbol = () => {
  const currency = countries.find((c) => c.code === window.countryCode)?.currency;
  const options = { style: "currency", currency };
  const parts = new Intl.NumberFormat(window.countryCode, options).formatToParts(1);
  const currencySymbol = parts.find((part) => part.type === "currency").value;
  return currencySymbol;
};

export const formatToCurrency = (number) => {
  const currency = countries.find((c) => c.code === window.countryCode)?.currency;
  return Intl.NumberFormat(window.countryCode, { style: "currency", currency, minimumSignificantDigits: 1 }).format(
    number,
  );
};

export const getTotalPretaxPrice = (items = []) =>
  items.map(getItemPriceWithNoVat).reduce((total, price) => price + total, 0);
export const getTotalPrice = (items = []) =>
  items.map(getItemPriceWithNoVat).reduce((total, price) => price + total, 0);
export const getFormattedTotalVAT = (items = []) => formatToCurrency(getTotalPrice(items) - getTotalPretaxPrice(items));
export const getFormattedTotalPretaxPrice = (items = []) => formatToCurrency(getTotalPretaxPrice(items));
export const getFormattedTotalPrice = (items = []) => formatToCurrency(getTotalPrice(items));

export const getInvoicesTotalPrice = (invoices = [], statuses = []) => {
  const filteredInvoices =
    statuses.length === 0 ? invoices : invoices.filter((invoice) => statuses.includes(invoice.status));
  const totalInvoiced = filteredInvoices.reduce((total, invoice) => total + getTotalPrice(invoice.items), 0);
  return formatToCurrency(totalInvoiced);
};
