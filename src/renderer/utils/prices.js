const getItemPrice =
  (considerVat = true) =>
  (item) => {
    if (considerVat && item.vat > 0)
      return Math.round(item.quantity * item.unit_price * (1 + item.vat / 100) * 100) / 100;
    return Math.round((item.quantity * item.unit_price * 100) / 100);
  };

export const getItemPriceWithNoVat = getItemPrice(false);
export const getItemPriceWithVat = getItemPrice(true);

export const formatThousands = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

export const getTotalPretaxPrice = (items = []) =>
  items.map(getItemPriceWithNoVat).reduce((total, price) => price + total, 0);
export const getTotalPrice = (items = []) =>
  items.map(getItemPriceWithNoVat).reduce((total, price) => price + total, 0);
export const getFormattedTotalVAT = (items = []) => formatThousands(getTotalPrice(items) - getTotalPretaxPrice(items));
export const getFormattedTotalPretaxPrice = (items = []) => formatThousands(getTotalPretaxPrice(items));
export const getFormattedTotalPrice = (items = []) => formatThousands(getTotalPrice(items));
