import { redirect, useFetcher, useLoaderData, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import html2pdf from "html2pdf.js";
import { useMemo, useRef, useState } from "react";
import CreatableSelect from "react-select/creatable";
import { readFile, writeFile } from "renderer/utils/fileManagement";
import useSetDocumentTitle from "renderer/services/useSetDocumentTitle";
import OpenInNewWindowIcon from "renderer/components/OpenInNewWindowIcon";
import {
  formatThousands,
  getFormattedTotalPretaxPrice,
  getFormattedTotalPrice,
  getFormattedTotalVAT,
  getItemPriceWithVat,
} from "renderer/utils/prices";
import { getSettings } from "renderer/utils/settings";
import { getInvoiceName, getInvoiceNumber, getNextInvoiceNumber, sortInvoices } from "renderer/utils/invoice";
import { computeEmailBody, computeEmailSubject } from "renderer/utils/contact";
import { ButtonsSatus } from "renderer/components/Invoice/ButtonsSatus";

export const loader = async ({ params }) => {
  const settings = await getSettings();
  const me = await readFile("me.json", { default: {} });
  const clients = await readFile("clients.json", { default: [] });
  const invoices = await readFile("invoices.json", { default: [] });
  const invoice =
    params.invoice_number !== "new"
      ? invoices.find((_invoice) => _invoice.invoice_number === params.invoice_number)
      : null;
  return { settings, invoice, invoices, clients, me };
};

export const action = async ({ request, params }) => {
  const invoices = await readFile("invoices.json", { default: [] });

  const form = await request.formData();
  const updatedInvoice = invoices.find((_invoice) => _invoice.invoice_number === params.invoice_number) ?? {};
  if (form.get("invoice_number")) updatedInvoice.invoice_number = form.get("invoice_number");
  if (form.get("client")) {
    updatedInvoice.client = form.get("client");
  }
  if (form.get("title")) updatedInvoice.title = form.get("title");
  if (form.get("status")) updatedInvoice.status = form.get("status");
  if (form.get("items")) updatedInvoice.items = JSON.parse(form.get("items"));
  if (form.get("emission_date")) updatedInvoice.emission_date = form.get("emission_date");
  if (form.get("due_date")) updatedInvoice.due_date = form.get("due_date");
  if (form.get("paid_date")) updatedInvoice.paid_date = form.get("paid_date");
  if (form.get("notes")) updatedInvoice.notes = form.get("notes");

  if (params.invoice_number !== updatedInvoice.invoice_number) {
    if (invoices.find((_invoice) => _invoice.invoice_number === updatedInvoice.invoice_number)) {
      return { ok: false, error: "Invoice number already exists" };
    }
  }

  await writeFile(
    "invoices.json",
    params.invoice_number === "new"
      ? [...invoices, updatedInvoice].sort(sortInvoices)
      : invoices
          .map((_invoice) => (_invoice.invoice_number === params.invoice_number ? updatedInvoice : _invoice))
          .sort(sortInvoices),
  );
  if (params.invoice_number !== updatedInvoice.invoice_number) {
    return redirect(`/invoice/${updatedInvoice.invoice_number}`);
  }
  return { ok: true };
};

function Invoice() {
  const { invoices, invoice, clients, me, settings } = useLoaderData();

  const defaultItem = {
    title: "",
    quantity: 1,
    unit_price: 600,
    vat: 0,
  };

  const invoiceFetcher = useFetcher();
  const printableAreaRef = useRef(null);

  const [items, setItems] = useState(invoice?.items?.length > 0 ? invoice?.items : [defaultItem]);

  const client = clients.find((_client) => _client.organisation_number === invoice?.client);
  const originalClient = useRef(client);

  const defaultEmissionDate = dayjs(invoice?.emission_date);
  const defaultDueDate = dayjs(invoice?.due_date || defaultEmissionDate.add(1, "month"));

  const invoiceNumber = useMemo(() => {
    const defaultInvoiceNumber = getInvoiceNumber({
      emissionDate: defaultEmissionDate,
      settings,
      client,
      inc: getNextInvoiceNumber(invoices),
    });
    if (!settings.invoice_number_format.includes("CLIENT CODE")) return invoice?.invoice_number || defaultInvoiceNumber;
    if (!client) return invoice?.invoice_number || defaultInvoiceNumber;
    if (invoice?.invoice_number?.includes("XXXX")) {
      return defaultInvoiceNumber;
    }
    if (originalClient.current?.organisation_number !== client?.organisation_number) {
      originalClient.current = client;
      return defaultInvoiceNumber;
    }
    return invoice?.invoice_number || defaultInvoiceNumber;
  }, [invoice?.invoice_number, defaultEmissionDate, settings, client, invoices.length]);

  useSetDocumentTitle(
    `Invoice ${invoiceNumber}${client?.organisation_name ? ` - ${client?.organisation_name}` : ""} - ${dayjs(
      invoice?.emission_date,
    ).format("DD/MM/YYYY")}`,
  );

  const [isPrinting, setIsPrinting] = useState(false);

  const generatePdf = async (folder) => {
    const invoiceFileName = getInvoiceName({ invoice, me, settings, client });
    const opt = {
      margin: 0,
      filename: invoiceFileName,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };
    setIsPrinting(true);
    if (!folder) {
      return html2pdf()
        .from(printableAreaRef.current)
        .set(opt)
        .save()
        .catch((err) => {
          setIsPrinting(false);
          console.log(err);
        });
    }
    const pdfData = await html2pdf()
      .from(printableAreaRef.current)
      .set(opt)
      .output("arraybuffer") // Use output method with 'arraybuffer' option
      .catch((err) => {
        setIsPrinting(false);
        console.log(err);
      });
    setIsPrinting(false);
    return pdfData;
  };

  return (
    <div
      className={[
        "border-80 h-full w-full overflow-auto print:overflow-hidden",
        isPrinting ? "!overflow-hidden" : "",
      ].join(" ")}
    >
      <div className={["my-12 flex items-center justify-between px-12 print:hidden"].join(" ")}>
        <h1 className="text-3xl font-bold">Invoice</h1>
        <div className="flex items-center gap-4">
          <button
            className="rounded border py-2 px-12"
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.print();
              }
            }}
          >
            🖨️ Print
          </button>
          <button
            className="rounded border py-2 px-12"
            type="button"
            title="It will export the invoice as PDF in the location of your choice."
            onClick={() => generatePdf()}
          >
            Export as PDF
          </button>
          <button
            className="rounded border py-2 px-12"
            type="button"
            onClick={async () => {
              const pdfData = await generatePdf(settings.invoices_folder_path);

              const invoiceFileName = getInvoiceName({ invoice, me, settings, client });
              const filePathAndName = `${settings.invoices_folder_path}/${invoiceFileName}`;

              const confirmedPathName = await window.electron.ipcRenderer.invoke(
                "app:save-pdf",
                pdfData,
                filePathAndName,
              );

              if (!confirmedPathName || confirmedPathName !== filePathAndName) {
                return window.electron.ipcRenderer.invoke(
                  "dialog:showMessageBoxSync",
                  "The file was not saved. Please contact the developer.",
                );
              }

              const body = computeEmailBody({ settings, client, invoice, me });
              const subject = computeEmailSubject({ settings, client, invoice, me });

              window.electron.ipcRenderer.invoke("app:send-email", {
                from: me.email,
                to: client.email,
                cc: client.email_cc,
                subject,
                body,
                filePathAndName,
              });
            }}
            title="It will export the invoice as PDF in your folder, and open your default email client with the generic email template you defined in your settings."
          >
            ＠ Email
          </button>
        </div>
      </div>
      {/* <SelectInvoiceStatus
        invoiceFetcher={invoiceFetcher}
        invoiceNumber={invoiceNumber}
        status={invoice.status || "draft"}
      /> */}
      <ButtonsSatus invoice={invoice} invoiceNumber={invoiceNumber} alwaysShowAll />
      <div className={["h-a4 w-a4 m-auto mb-10 max-w-3xl border border-gray-500"].join(" ")}>
        <div
          ref={printableAreaRef}
          className="h-a4 w-a4 max-w-3xl text-base text-gray-600 overflow-hidden flex flex-col p-8"
        >
          <invoiceFetcher.Form className="mb-10 flex justify-between" key={invoiceNumber}>
            <p className="mb-0 text-xl text-gray-900">Invoice</p>
            <p className="text-right">
              <b>
                Invoice #:{" "}
                <input
                  type="text"
                  placeholder={invoiceNumber}
                  name="invoice_number"
                  className={["print:hidden", isPrinting ? "!hidden" : ""].join(" ")}
                  defaultValue={invoiceNumber}
                  size={invoiceNumber.length}
                  onBlur={(e) => {
                    const form = new FormData();
                    form.append("invoice_number", e.currentTarget.value);
                    form.append("from", "invoice number");
                    invoiceFetcher.submit(form, { method: "post" });
                  }}
                />
                <span className={["hidden print:inline", isPrinting ? "!inline" : ""].join(" ")}>{invoiceNumber}</span>
              </b>
              <br />
              Emission date:{" "}
              <input
                type="date"
                name="emission_date"
                className={["print:hidden", isPrinting ? "!hidden" : ""].join(" ")}
                defaultValue={defaultEmissionDate.format("YYYY-MM-DD")}
                onBlur={(e) => {
                  const form = new FormData();
                  form.append(e.currentTarget.name, e.currentTarget.value);
                  form.append("invoice_number", invoiceNumber);
                  form.append("from", "emission date");
                  invoiceFetcher.submit(form, { method: "post" });
                }}
              />
              <span className={["hidden print:inline", isPrinting ? "!inline" : ""].join(" ")}>
                {defaultEmissionDate.format("DD/MM/YYYY")}
              </span>
              <br />
              Due date:{" "}
              <input
                type="date"
                name="due_date"
                className={["print:hidden", isPrinting ? "!hidden" : ""].join(" ")}
                defaultValue={defaultDueDate.format("YYYY-MM-DD")}
                onBlur={(e) => {
                  const form = new FormData();
                  form.append(e.currentTarget.name, e.currentTarget.value);
                  form.append("invoice_number", invoiceNumber);
                  form.append("from", "due date");
                  invoiceFetcher.submit(form, { method: "post" });
                }}
              />
              <span className={["hidden print:inline", isPrinting ? "!inline" : ""].join(" ")}>
                {defaultDueDate.format("DD/MM/YYYY")}
              </span>
            </p>
          </invoiceFetcher.Form>
          <div className="mb-10 flex justify-between">
            <p>
              <b>{me?.organisation_name}</b>
              <br />
              {me?.address}
              <br />
              {me?.zip} {me?.city}
              <br />
              {me?.country}
              <br />
              {me?.organisation_number_type}: {me?.organisation_number}
              <br />
              VAT: {me?.vat_number}
            </p>

            <div className="text-right">
              {!isPrinting && (
                <CreatableSelect
                  options={clients}
                  className="min-w-[16rem]"
                  onChange={(_client) => {
                    const form = new FormData();
                    form.append("client", _client.organisation_number);
                    form.append("from", "client select");
                    form.append("invoice_number", invoiceNumber);
                    form.append("emission_date", defaultEmissionDate.format("YYYY-MM-DD"));
                    form.append("due_date", defaultDueDate.format("YYYY-MM-DD"));
                    invoiceFetcher.submit(form, { method: "post" });
                  }}
                  name="client"
                  value={client}
                  getOptionValue={(option) => option.organisation_number}
                  formatOptionLabel={ClientOption}
                />
              )}
              {client?.organisation_name && (
                <p className="text-right">
                  {isPrinting && (
                    <>
                      <b>{client?.organisation_name}</b>
                      <br />
                    </>
                  )}
                  {client?.address}
                  <br />
                  {client?.zip} {client?.city}
                  <br />
                  {client?.country}
                  <br />
                  {client?.organisation_number_type}: {client?.organisation_number}
                  <br />
                  VAT: {client?.vat_number}
                </p>
              )}
            </div>
          </div>
          <input
            type="text"
            className="mt-3 mb-6 w-full text-xl font-semibold"
            placeholder="Title of invoice"
            name="title"
            defaultValue={invoice?.title}
            onBlur={(e) => {
              const { value } = e.currentTarget;
              const form = new FormData();
              form.append("title", value);
              form.append("invoice_number", invoiceNumber);
              form.append("from", "title");
              form.append("emission_date", defaultEmissionDate.format("YYYY-MM-DD"));
              form.append("due_date", defaultDueDate.format("YYYY-MM-DD"));
              invoiceFetcher.submit(form, { method: "post" });
            }}
          />
          <div className="grid grid-cols-invoice overflow-hidden border border-gray-400 bg-gray-300">
            <div />
            <p className="flex h-full items-center">Item</p>
            <p className="border-l border-gray-400 text-center">Quantity (days)</p>
            <p className="border-l border-gray-400 text-center">
              Pre-tax price
              <br />
              (€)
            </p>
            <p className="border-l border-gray-400 text-center">
              VAT
              <br />
              (%)
            </p>
            <p className="border-l border-gray-400 text-center">
              Price
              <br />
              (€)
            </p>
          </div>
          {items?.map((item, index) => {
            return (
              <Item
                key={index + item.title}
                invoiceFetcher={invoiceFetcher}
                invoiceNumber={invoiceNumber}
                item={item}
                index={index}
                setItems={setItems}
                items={items}
                defaultEmissionDate={defaultEmissionDate}
                defaultDueDate={defaultDueDate}
              />
            );
          })}
          <div className="mt-2 grid grid-cols-invoice  border border-transparent">
            <p className="col-start-5 text-right">Pre-tax total:</p>
            <p className="text-center">{getFormattedTotalPretaxPrice(items)} €</p>
          </div>
          <div className="mt-2 grid grid-cols-invoice  border border-transparent">
            <button
              className={["col-span-2 print:hidden", isPrinting ? "!hidden" : ""].join(" ")}
              type="button"
              onClick={() => {
                setItems([...items, defaultItem]);
              }}
            >
              Add an item
            </button>
            <p className="col-start-5 text-right">VAT:</p>
            <p className="text-center">{getFormattedTotalVAT(items)} €</p>
          </div>
          <div className="mt-2 grid grid-cols-invoice  border border-transparent font-bold">
            <p className="col-start-5 text-right">To pay:</p>
            <p className="text-center">{getFormattedTotalPrice(items)} €</p>
          </div>
          <div className="mt-auto flex justify-start gap-4">
            <p>Payment details:</p>
            <p>
              IBAN: NL20 BUNQ 2082 8975 83
              <br />
              BIC: BUNQNL2AXXX <br />
            </p>
          </div>
          <p className="text-sm mt-10">
            <strong>Payment terms:</strong> Payment is due within 30 days of receipt of invoice. Late payments will be
            subject to a 5% surcharge, to which will be added a 40€ collection fee.
          </p>
          <p className="mt-10 w-full text-center text-xs">
            A.J.M. AMBROSELLI - Goudsbloemstraat 35D - 1015JJ Amsterdam - Netherlands
            <br />
            KVK Nummer: 88631273 - Btw-identificatienummer: NL004636768B16
            <br />
            <strong>Thank you for your business!</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

function Item({ item, index, items, setItems, invoiceNumber, invoiceFetcher, defaultEmissionDate, defaultDueDate }) {
  return (
    <invoiceFetcher.Form
      key={item.title}
      className="grid grid-cols-invoice border border-t-0 border-gray-400"
      onBlur={(e) => {
        const data = Object.fromEntries(new FormData(e.currentTarget).entries());
        const newItems = items
          .map((_item, _index) => {
            if (_index === index) {
              if (!data.title?.length) return null;
              return data;
            }
            return _item;
          })
          .filter(Boolean);
        const form = new FormData();
        form.append("items", JSON.stringify(newItems));
        form.append("invoice_number", invoiceNumber);
        form.append("emission_date", defaultEmissionDate.format("YYYY-MM-DD"));
        form.append("due_date", defaultDueDate.format("YYYY-MM-DD"));
        invoiceFetcher.submit(form, { method: "post" });
        setItems(newItems);
      }}
    >
      <input type="hidden" name="invoice_number" defaultValue={invoiceNumber} />
      <p className="py-2">{index + 1} - </p>
      <input
        className="border-none py-2"
        type="text"
        placeholder="Type a task here..."
        name="title"
        defaultValue={item.title}
      />

      <input
        className="border-l border-gray-400 py-2 text-center"
        type="number"
        name="quantity"
        defaultValue={item.quantity}
      />

      <input
        className="border-l border-gray-400 py-2 text-center"
        type="number"
        name="unit_price"
        defaultValue={item.unit_price}
        placeholder="600"
      />

      <input className="border-l border-gray-400 py-2 text-center" type="number" name="vat" defaultValue={item.vat} />
      <p className="border-l border-gray-400 py-2 text-center">{formatThousands(getItemPriceWithVat(item))} €</p>
    </invoiceFetcher.Form>
  );
}

function Client({ client, selected }) {
  const navigate = useNavigate();
  return (
    <div className="flex w-full justify-end items-center">
      {selected ? <b>{client?.organisation_name}</b> : <span>{client?.organisation_name}</span>}
      <button
        type="button"
        className="ml-4 z-50"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/client/${client?.organisation_number}`);
        }}
      >
        <OpenInNewWindowIcon className="h-3 w-3" />
      </button>
    </div>
  );
}

function CreateClient({ name }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      className="z-50"
      onClick={(e) => {
        e.stopPropagation();
        window?.localStorage?.setItem("client", JSON.stringify({ organisation_name: name }));
        navigate("/client/new");
      }}
    >
      Create new client &quot;{name}&quot;
    </button>
  );
}

function ClientOption(_client, options) {
  // eslint-disable-next-line react/destructuring-assignment
  if (options.context === "menu") {
    // eslint-disable-next-line react/destructuring-assignment
    if (_client.__isNew__) {
      return <CreateClient name={_client?.value} />;
    }
    return <Client client={_client} />;
  }
  if (_client?.__isNew__) {
    return <span>Création de {_client?.name}...</span>;
  }
  return <Client client={_client} selected />;
}

export default Invoice;
