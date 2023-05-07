import { Link, useLoaderData } from "react-router-dom";
import { InvoiceRow } from "../components/Invoice/InvoiceRow";
import useSetDocumentTitle from "../services/useSetDocumentTitle";
import { readFile } from "../utils/fileManagement";
import dayjs from "dayjs";
import { formatToCurrency, getTotalPretaxPrice } from "renderer/utils/prices";

export const webLoader = async () => {
  const me = JSON.parse(window.localStorage.getItem("me.json") || "{}");
  const invoices = JSON.parse(window.localStorage.getItem("invoices.json") || "[]");
  const clients = JSON.parse(window.localStorage.getItem("clients.json") || "[]");
  window.countryCode = me?.country_code;
  return {
    me,
    invoices: invoices.map((invoice) => ({
      ...invoice,
      client: clients.find((client) => client.organisation_number === invoice.client),
    })),
  };
};

export const electronLoader = async () => {
  const me = await readFile("me.json", { default: {} });
  const invoices = await readFile("invoices.json", { default: [] });
  const clients = await readFile("clients.json", { default: [] });
  window.countryCode = me?.country_code;
  return {
    me,
    invoices: invoices.map((invoice) => ({
      ...invoice,
      client: clients.find((client) => client.organisation_number === invoice.client),
    })),
  };
};

function Invoices() {
  const data = useLoaderData();
  const invoices = data.invoices || [];
  const me = data.me || {};

  const onColumnClick = (event) => {
    console.log(event);
  };

  useSetDocumentTitle(`Invoices ${me?.organisation_name} | 💋 Kiss my Invoices`);

  const reducedByMonth = invoices?.reduce((months, invoice, index) => {
    const month = dayjs(invoice.emission_date).format("YYYY-MM");
    if (!months[month]) months[month] = 0;
    months[month] += getTotalPretaxPrice(invoice.items);
    return months;
  }, {});

  const totalYear = Object.values(reducedByMonth).reduce((acc, value) => acc + value, 0);

  const estimationYear = (totalYear / Object.keys(reducedByMonth).length) * 12;

  return (
    <div className="flex h-full w-full flex-col overflow-auto pb-20">
      <div className="py-12 flex items-center justify-between px-12 print:hidden bg-amber-100">
        <h1 className="text-3xl font-bold">Invoices {me?.organisation_name}</h1>
        <div className="flex items-center gap-4">
          <Link className="rounded bg-gray-800 py-2 px-12 text-gray-50" to="/invoice/new">
            New invoice
          </Link>
          <Link className="rounded bg-gray-800 py-2 px-12 text-gray-50" to="/client/new">
            New client
          </Link>
        </div>
      </div>
      {!!invoices.length && (
        <main className="flex flex-1 basis-full flex-col justify-start pb-4 text-xs md:pb-8 ">
          <div className="relative w-full max-w-full bg-white">
            <div
              aria-roledescription="Header of the list of features - Clicking on a column header can sort the invoice by the column, ascending or descending"
              className="grid-cols-stats sticky top-0 z-50 hidden md:grid"
            >
              <div className="flex cursor-pointer border-y-2 border-x border-gray-900 bg-white p-2 text-left font-medium text-gray-900">
                <div className="relative flex w-full -translate-y-1/2 rotate-90 md:translate-y-0 md:rotate-0">
                  <SortArrowButton
                    field="emission_date"
                    onClick={onColumnClick}
                    // sortOrder={sortOrder}
                    // sortBy={sortBy}
                  />
                  <HeaderButton title={`🤑\Month\u00A0Date`} field="emission_date" onClick={onColumnClick} />
                </div>
              </div>
              <div className="cursor-pointer border-y-2 border-x border-gray-900 bg-white p-2 text-left font-medium text-gray-900 md:flex">
                <div className="relative flex w-full -translate-y-1/2 rotate-90 md:translate-y-0 md:rotate-0">
                  <SortArrowButton
                    field="globalAmount"
                    onClick={onColumnClick}
                    // sortOrder={sortOrder}
                    // sortBy={sortBy}
                  />
                  <HeaderButton title={`💸\u00A0Amount HT\u00A0`} field="globalAmount" onClick={onColumnClick} />
                </div>
              </div>
            </div>
            {Object.entries(reducedByMonth).map(([month, total]) => {
              return (
                <div key={month} className="grid-cols-stats group grid">
                  <div className="border-x border-b-2 p-2">{month}</div>
                  <div className="border-x border-b-2 p-2">{formatToCurrency(total)}</div>
                </div>
              );
            })}
            <br />
            <div className="grid-cols-stats group grid">
              <div className="border-x border-y-2 p-2">TOTAL</div>
              <div className="border-x border-y-2 p-2">{formatToCurrency(totalYear)}</div>
            </div>
            <br />
            <div className="grid-cols-stats group grid">
              <div className="border-x border-y-2 p-2">Estimation year</div>
              <div className="border-x border-y-2 p-2">{formatToCurrency(estimationYear)}</div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

export function SortArrowButton({ field, onClick, sortOrder, sortBy, className = "" }) {
  if (!sortBy) return null;
  if (sortBy !== field) return null;
  return (
    <button
      className={["mr-2", className].join(" ")}
      onClick={onClick}
      type="button"
      aria-label="Changer l'ordre de tri"
      data-sortkey={field}
    >
      <span>
        {sortOrder === "ASC" && `\u00A0\u2193`}
        {sortOrder === "DESC" && `\u00A0\u2191`}
      </span>
    </button>
  );
}

function HeaderButton({ title, field, onClick }) {
  return (
    <button
      className="grow text-left"
      aria-label={`Sort by ${title}`}
      type="button"
      data-sortkey={field}
      onClick={onClick}
    >
      {title}
    </button>
  );
}

export default Invoices;
