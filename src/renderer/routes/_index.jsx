import { Link, useLoaderData } from "react-router-dom";
import { InvoiceRow } from "renderer/components/Invoice/InvoiceRow";
import { readFile } from "renderer/utils/fileManagement";

export const loader = async () => {
  const me = await readFile("me.json", { default: {} });
  const invoices = await readFile("invoices.json", { default: [] });
  const clients = await readFile("clients.json", { default: [] });

  return {
    me,
    invoices: invoices.map((invoice) => ({
      ...invoice,
      client: clients.find((client) => client.organisation_number === invoice.client),
    })),
  };
};

function Home() {
  const data = useLoaderData();
  const invoices = data.invoices || [];
  const me = data.me || {};

  const onColumnClick = (event) => {
    console.log(event);
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="my-12 flex items-center justify-between px-12 print:hidden">
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
      <main className="flex flex-1 basis-full flex-col justify-start pb-4 text-xs md:pb-8">
        <div className="relative w-full max-w-full">
          <div
            aria-roledescription="Header of the list of features - Clicking on a column header can sort the invoice by the column, ascending or descending"
            className="grid-cols-invoices sticky top-0 z-50 hidden md:grid"
          >
            <div className="flex cursor-pointer border-y-2 border-x border-gray-900 bg-white p-2 text-left font-medium text-gray-900">
              <div className="relative flex w-full -translate-y-1/2 rotate-90 md:translate-y-0 md:rotate-0">
                <SortArrowButton
                  field="invoice_number"
                  onClick={onColumnClick}
                  // sortOrder={sortOrder}
                  // sortBy={sortBy}
                />
                <HeaderButton title="Invoice Number" field="invoice_number" onClick={onColumnClick} />
              </div>
            </div>
            <div className="flex cursor-pointer border-y-2 border-x border-gray-900 bg-white p-2 text-left font-medium text-gray-900">
              <div className="relative flex w-full -translate-y-1/2 rotate-90 md:translate-y-0 md:rotate-0">
                <SortArrowButton
                  field="content"
                  onClick={onColumnClick}
                  // sortOrder={sortOrder}
                  // sortBy={sortBy}
                />
                <HeaderButton title="Invoice Title" field="title" onClick={onColumnClick} />
              </div>
            </div>
            <div className="flex cursor-pointer border-y-2 border-x border-gray-900 bg-white p-2 text-left font-medium text-gray-900">
              <div className="relative flex w-full -translate-y-1/2 rotate-90 md:translate-y-0 md:rotate-0">
                <SortArrowButton
                  field="content"
                  onClick={onColumnClick}
                  // sortOrder={sortOrder}
                  // sortBy={sortBy}
                />
                <HeaderButton title="Client" field="client" onClick={onColumnClick} />
              </div>
            </div>
            <div className="flex cursor-pointer border-y-2 border-x border-gray-900 bg-white p-2 text-left font-medium text-gray-900">
              <div className="relative flex w-full -translate-y-1/2 rotate-90 md:translate-y-0 md:rotate-0">
                <SortArrowButton
                  field="emission_date"
                  onClick={onColumnClick}
                  // sortOrder={sortOrder}
                  // sortBy={sortBy}
                />
                <HeaderButton title={`🤑\u00A0Émission\u00A0Date`} field="emission_date" onClick={onColumnClick} />
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
            <div className="flex cursor-pointer border-y-2 border-x border-gray-900 bg-white p-2 text-left font-medium text-gray-900">
              <div className="relative flex w-full -translate-y-1/2 rotate-90 md:translate-y-0 md:rotate-0">
                <SortArrowButton
                  field="vat"
                  onClick={onColumnClick}
                  // sortOrder={sortOrder}
                  // sortBy={sortBy}
                />
                <HeaderButton title={`❗️\u00A0VAT`} field="vat" onClick={onColumnClick} />
              </div>
            </div>
            <div className="flex cursor-pointer border-y-2 border-x border-gray-900 bg-white p-2 text-left font-medium text-gray-900">
              <div className="relative flex w-full -translate-y-1/2 rotate-90 md:translate-y-0 md:rotate-0">
                <SortArrowButton
                  field="vat"
                  onClick={onColumnClick}
                  // sortOrder={sortOrder}
                  // sortBy={sortBy}
                />
                <HeaderButton title={`💵\u00A0Amount TTC`} field="price" onClick={onColumnClick} />
              </div>
            </div>
          </div>
          {invoices.map((invoice, index) => {
            return <InvoiceRow key={invoice._id || index} invoice={invoice} index={index} />;
          })}
        </div>
      </main>
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

export default Home;
