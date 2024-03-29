import dayjs from "dayjs";
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
  if (!window.countryCode) window.countryCode = "FR";
  const currency = countries.find((c) => c.code === window.countryCode)?.currency;
  const options = { style: "currency", currency };
  const parts = new Intl.NumberFormat(window.countryCode, options).formatToParts(1);
  const currencySymbol = parts.find((part) => part.type === "currency").value;
  return currencySymbol;
};

export const formatToCurrency = (number) => {
  if (!window.countryCode) window.countryCode = "FR";
  const currency = countries.find((c) => c.code === window.countryCode)?.currency;
  return Intl.NumberFormat(window.countryCode, {
    style: "currency",
    currency,
    minimumSignificantDigits: 1,
    maximumFractionDigits: 2,
  }).format(number);
};

export const getTotalPretaxPrice = (items = []) =>
  items.map(getItemPriceWithNoVat).reduce((total, price) => price + total, 0);
export const getTotalPrice = (items = []) =>
  Math.round(items.map(getItemPriceWithVat).reduce((total, price) => price + total, 0));
export const getFormattedTotalVAT = (items = []) => formatToCurrency(getTotalPrice(items) - getTotalPretaxPrice(items));
export const getFormattedTotalPretaxPrice = (items = []) => formatToCurrency(getTotalPretaxPrice(items));
export const getFormattedTotalPrice = (items = []) => formatToCurrency(getTotalPrice(items));

export const getInvoicesTotalPrice = (invoices = [], status = "") => {
  const filteredInvoices =
    status.length === 0
      ? invoices
      : invoices.filter((invoice) => {
          if (["OVERDUE", "SENT"].includes(status) && invoice.status === "SENT") {
            if (!invoice?.due_date) return status === "SENT";
            const dueDate = dayjs(invoice.due_date);
            if (dueDate.isAfter(dayjs())) return status === "SENT";
            return status === "OVERDUE";
          }
          return status === invoice.status;
        });
  const totalInvoiced = filteredInvoices.reduce((total, invoice) => total + getTotalPrice(invoice.items), 0);
  return formatToCurrency(totalInvoiced);
};
