/* eslint-disable no-alert */
import { Link, redirect, useFetcher, useLoaderData, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import html2pdf from "html2pdf.js";
import React, { useMemo, useRef, useState } from "react";
import CreatableSelect from "react-select/creatable";
import { getFolderPath, readFile, writeFile } from "../utils/fileManagement";
import useSetDocumentTitle from "../services/useSetDocumentTitle";
import OpenInNewWindowIcon from "../components/OpenInNewWindowIcon";
import {
  formatToCurrency,
  getCurrencySymbol,
  getFormattedTotalPretaxPrice,
  getFormattedTotalPrice,
  getFormattedTotalVAT,
  getItemPriceWithVat,
} from "../utils/prices";
import { getSettings } from "../utils/settings";
import {
  defaultInvoiceNumberFormat,
  getInvoiceName,
  getInvoiceNumber,
  getNextInvoiceNumber,
  sortInvoices,
} from "../utils/invoice";
import { computeEmailBody, computeEmailSubject } from "../utils/contact";
import { ButtonsSatus } from "../components/Invoice/ButtonsSatus";
import { countries } from "../utils/countries";

const defaultItem = {
  title: "",
  quantity: 1,
  unit_price: 600,
  unit: "day",
  vat: 0,
};

export const webLoader = async ({ params }) => {
  const settings = await JSON.parse(window.localStorage.getItem("settings.json") || "{}");
  const me = JSON.parse(window.localStorage.getItem("me.json") || "{}");
  window.countryCode = me?.country_code;
  const clients = JSON.parse(window.localStorage.getItem("clients.json") || "[]");
  const invoices = JSON.parse(window.localStorage.getItem("invoices.json") || "[]");
  const invoice =
    params.invoice_number !== "new"
      ? invoices.find((_invoice) => _invoice.invoice_number === params.invoice_number)
      : null;
  return { settings, invoice, invoices, clients, me, forWeb: true };
};

export const webAction = async ({ request, params }) => {
  const invoices = JSON.parse(window.localStorage.getItem("invoices.json") || "[]");
  const form = await request.formData();
  const updatedInvoice = structuredClone(
    invoices.find((_invoice) => _invoice.invoice_number === params.invoice_number) ?? {},
  );
  if (form.get("action") === "duplicate") {
    return { ok: false };
  }
  if (form.get("action") === "delete") {
    window.localStorage.setItem(
      "invoices.json",
      JSON.stringify(invoices.filter((_invoice) => _invoice.invoice_number !== params.invoice_number)),
    );
    return redirect("/");
  }
  if (form.get("invoice_number")) updatedInvoice.invoice_number = form.get("invoice_number");
  if (form.get("client")) {
    updatedInvoice.client = form.get("client");
  }
  if (form.get("title")) updatedInvoice.title = form.get("title");
  if (form.get("status")) updatedInvoice.status = form.get("status");
  if (form.get("items")) {
    updatedInvoice.items = JSON.parse(form.get("items")) || [];
    if (updatedInvoice?.items?.length > 0) {
      window.defaultItem = updatedInvoice.items[updatedInvoice.items.length - 1] ?? defaultItem;
    }
  }
  if (form.get("emission_date")) updatedInvoice.emission_date = form.get("emission_date");
  if (form.get("due_date")) updatedInvoice.due_date = form.get("due_date");
  if (form.get("paid_date")) updatedInvoice.paid_date = form.get("paid_date");
  if (form.get("notes")) updatedInvoice.notes = form.get("notes");

  if (params.invoice_number !== updatedInvoice.invoice_number) {
    if (invoices.find((_invoice) => _invoice.invoice_number === updatedInvoice.invoice_number)) {
      return { ok: false, error: "Invoice number already exists" };
    }
  }

  window.localStorage.setItem(
    "invoices.json",
    JSON.stringify(
      params.invoice_number === "new"
        ? [...invoices, updatedInvoice].sort(sortInvoices)
        : invoices
            .map((_invoice) => (_invoice.invoice_number === params.invoice_number ? updatedInvoice : _invoice))
            .sort(sortInvoices),
    ),
  );
  if (params.invoice_number !== updatedInvoice.invoice_number) {
    return redirect(`/invoice/${updatedInvoice.invoice_number}`);
  }
  return { ok: true };
};

export const electronLoader = async ({ params }) => {
  const settings = await getSettings();
  const folderPath = await getFolderPath();
  const me = await readFile("me.json", { default: {} });
  window.countryCode = me?.country_code;
  const clients = await readFile("clients.json", { default: [] });
  const invoices = await readFile("invoices.json", { default: [] });
  const invoice =
    params.invoice_number !== "new"
      ? invoices.find((_invoice) => _invoice.invoice_number === params.invoice_number)
      : null;

  return { settings, invoice, invoices, clients, me, folderPath };
};

export const electronAction = async ({ request, params }) => {
  const invoices = await readFile("invoices.json", { default: [] });
  const form = await request.formData();
  const updatedInvoice = structuredClone(
    invoices.find((_invoice) => _invoice.invoice_number === params.invoice_number) ?? {},
  );
  if (form.get("action") === "duplicate") {
    const settings = await getSettings();
    const clients = await readFile("clients.json", { default: [] });
    const client = clients.find((_client) => _client.organisation_number === updatedInvoice?.client);
    updatedInvoice.invoice_number = getInvoiceNumber({
      emissionDate: dayjs(),
      settings,
      client,
      inc: getNextInvoiceNumber(invoices),
    });
    updatedInvoice.status = "DRAFT";
    updatedInvoice.emission_date = dayjs().format("YYYY-MM-DD");
    updatedInvoice.due_date = dayjs().add(1, "month").format("YYYY-MM-DD");

    await writeFile("invoices.json", [...invoices, updatedInvoice].sort(sortInvoices));
    return redirect(`/invoice/${updatedInvoice.invoice_number}`);
  }
  if (form.get("action") === "delete") {
    await writeFile(
      "invoices.json",
      invoices.filter((_invoice) => _invoice.invoice_number !== params.invoice_number),
    );
    return redirect("/");
  }
  if (form.get("invoice_number")) updatedInvoice.invoice_number = form.get("invoice_number");
  if (form.get("client")) {
    updatedInvoice.client = form.get("client");
  }
  if (form.get("title")) updatedInvoice.title = form.get("title");
  if (form.get("status")) updatedInvoice.status = form.get("status");
  if (form.get("items")) {
    updatedInvoice.items = JSON.parse(form.get("items")) || [];
    if (updatedInvoice?.items?.length > 0) {
      window.defaultItem = updatedInvoice.items[updatedInvoice.items.length - 1] ?? defaultItem;
    }
  }
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
  const { invoices, invoice, clients, me, settings, folderPath, forWeb } = useLoaderData();

  const myDefaultItem = typeof window === "undefined" ? defaultItem : window.defaultItem ?? defaultItem;

  const invoiceFetcher = useFetcher();
  const printableAreaRef = useRef(null);

  const [items, setItems] = useState(invoice?.items?.length > 0 ? invoice?.items : [myDefaultItem]);

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
    const invoiceNumberFormat = settings.invoice_number_format || defaultInvoiceNumberFormat;
    if (!invoiceNumberFormat.includes("CLIENT CODE")) return invoice?.invoice_number || defaultInvoiceNumber;
    if (!client) return invoice?.invoice_number || defaultInvoiceNumber;
    if (invoice?.invoice_number?.includes("XXXX")) {
      return defaultInvoiceNumber;
    }
    if (originalClient.current?.organisation_number !== client?.organisation_number) {
      originalClient.current = client;
      return defaultInvoiceNumber;
    }
    return invoice?.invoice_number || defaultInvoiceNumber;
  }, [defaultEmissionDate, settings, client, invoices, invoice?.invoice_number]);

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

    /*

    chatGPT proposal for not aving the greyed names in Finder

    const generatePdf = async () => {
  const invoiceFileName = getInvoiceName({ invoice, me, settings, client });
  const opt = {
    margin: 0,
    filename: invoiceFileName,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  };
  setIsPrinting(true);
  html2pdf()
    .from(printableAreaRef.current)
    .set(opt)
    .output("datauristring") // Use output method with 'datauristring' option
    .then((pdfData) => {
      setIsPrinting(false);
      const options = {
        title: "Save PDF",
        defaultPath: invoiceFileName,
        filters: [
          {
            name: "PDF Files",
            extensions: ["pdf"],
          },
        ],
      };
      const filePath = dialog.showSaveDialogSync(options);
      if (filePath) {
        fs.writeFile(filePath, Buffer.from(pdfData, "base64"), (err) => {
          if (err) {
            console.log(err);
          }
        });
      }
    })
    .catch((err) => {
      setIsPrinting(false);
      console.log(err);
    });
};
In this example, we use the output() method with the datauristring option to generate the PDF data as a base64-encoded string. We then use the dialog.showSaveDialogSync() method to prompt the user to select a save location and filename for the PDF. Finally, we use the fs.writeFile() method to write the PDF data to the selected file path.

This should ensure that the PDF file is saved with the desired filename and prevent the greyed-out name issue on macOS.





    */
  };

  return (
    <div
      className={[
        "border-80 h-full w-full overflow-auto print:overflow-hidden bg-amber-100",
        isPrinting ? "!overflow-hidden" : "",
      ].join(" ")}
    >
      <div className={["my-12 flex items-center justify-between px-12 print:hidden"].join(" ")}>
        <h1 className="text-3xl font-bold">Invoice</h1>
        <div className="flex items-center gap-4">
          <button
            className="rounded border py-2 px-12 bg-white"
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                setIsPrinting(true);
                setTimeout(() => {
                  window.print();
                  setTimeout(() => {
                    setIsPrinting(false);
                  });
                });
              }
            }}
          >
            🖨️ Print / Save as PDF
          </button>
          {/* <button
            className="rounded border py-2 px-12 bg-white"
            type="button"
            title="It will export the invoice as PDF in the location of your choice."
            onClick={() => {
              if (forWeb) {
                return window.alert("This feature is not available in the web version. Please download the app.");
              }
              generatePdf();
            }}
          >
            Export as PDF
          </button> */}
          <button
            className="rounded border py-2 px-12 bg-black text-white disabled:opacity-50"
            type="button"
            disabled={!invoice}
            onClick={async () => {
              if (forWeb) {
                return window.alert("This feature is not available in the web version. Please download the app.");
              }
              const pdfData = await generatePdf(folderPath);

              const invoiceFileName = getInvoiceName({ invoice, me, settings, client });
              const filePathAndName = `${folderPath}/${invoiceFileName}`;

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
                bcc: client.email_bcc,
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
      <div className="h-a4 w-a4 m-auto mb-10 mt-2 max-w-3xl relative">
        <div className="relative w-full">
          <ButtonsSatus className="print:hidden" invoice={invoice} invoiceNumber={invoiceNumber} alwaysShowAll />
          <div className={["flex gap-1 absolute left-full top-0 print:hidden", isPrinting ? "hidden" : ""].join(" ")}>
            <button
              className="rounded border px-4 my-1 bg-white"
              type="submit"
              disabled={!invoice}
              onClick={(e) => {
                if (forWeb) {
                  return window.alert("This feature is not available in the web version. Please download the app.");
                }
                const form = new FormData();
                form.append("action", "duplicate");
                form.append("from", "invoice number");
                invoiceFetcher.submit(form, { method: "post" });
              }}
            >
              ✌️&nbsp;Duplicate
            </button>
            {!!invoice && (
              <button
                className="rounded border border-red-500 text-red-500 disabled:opacity-50 px-4 my-1 bg-white"
                type="submit"
                title="You can't delete an invoice that has been sent."
                disabled={invoice.status !== "DRAFT"}
                onClick={(e) => {
                  if (forWeb) {
                    return window.alert("This feature is not available in the web version. Please download the app.");
                  }
                  const form = new FormData();
                  form.append("action", "delete");
                  form.append("from", "invoice number");
                  invoiceFetcher.submit(form, { method: "post" });
                }}
              >
                🗑️&nbsp;Delete
              </button>
            )}
          </div>
        </div>
        <div
          ref={printableAreaRef}
          contentEditable
          className={[
            "h-a4 w-a4 text-base text-gray-600 overflow-hidden flex flex-col p-8 bg-white",
            isPrinting ? "" : "max-w-3xl border-2 print:border-none border-gray-500",
          ].join(" ")}
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
              {me?.organisation_name && (
                <>
                  {me?.organisation_name}
                  <br />
                </>
              )}
              {me?.address && (
                <>
                  {me?.address}
                  <br />
                </>
              )}
              {(me?.zip || me?.city) && (
                <>
                  {me?.zip ? `${me?.zip} ` : ""}
                  {me?.city}
                  <br />
                </>
              )}
              {me?.country_code && (
                <>
                  {countries.find((c) => c.code === me.country_code)?.country}
                  <br />
                </>
              )}
              {me?.organisation_number_type && me?.organisation_number && (
                <>
                  {me?.organisation_number_type}: {me?.organisation_number}
                  <br />
                </>
              )}
              {!!me?.vat_number?.length && <>VAT: {me?.vat_number}</>}
            </p>
            <div className="text-right">
              {!isPrinting && (
                <CreatableSelect
                  options={clients}
                  className="min-w-[16rem] print:hidden"
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
              <p className="text-right">
                {isPrinting && (
                  <>
                    <b className={isPrinting ? "" : "hidden"}>{client?.organisation_name}</b>
                    <br className={isPrinting ? "" : "hidden"} />
                  </>
                )}
                {client?.address && (
                  <>
                    {client?.address}
                    <br />
                  </>
                )}
                {(client?.zip || client?.city) && (
                  <>
                    {client?.zip ? `${client?.zip} ` : ""}
                    {client?.city}
                    <br />
                  </>
                )}
                {client?.country_code && (
                  <>
                    {countries.find((c) => c.code === client.country_code)?.country}
                    <br />
                  </>
                )}
                {client?.organisation_number_type && client?.organisation_number && (
                  <>
                    {client?.organisation_number_type}: {client?.organisation_number}
                    <br />
                  </>
                )}
                {!!client?.vat_number?.length && <>VAT: {client?.vat_number}</>}
              </p>
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
          <div className="grid grid-cols-invoice border border-gray-400 bg-gray-300">
            <div />
            <div className="flex h-full items-center">Item</div>
            <CenteredForPrinting isPrinting={isPrinting}>Quantity</CenteredForPrinting>
            <CenteredForPrinting isPrinting={isPrinting}>Unit</CenteredForPrinting>
            <CenteredForPrinting isPrinting={isPrinting}>
              Pre-tax
              <br />
              unit price ({getCurrencySymbol(me.country_code)})
            </CenteredForPrinting>
            <CenteredForPrinting isPrinting={isPrinting}>
              VAT
              <br />
              (%)
            </CenteredForPrinting>
            <CenteredForPrinting isPrinting={isPrinting}>Price</CenteredForPrinting>
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
            <p className="col-start-5 col-span-2 text-right">Pre-tax total:</p>
            <p className="text-right pr-3">{getFormattedTotalPretaxPrice(items)}</p>
          </div>
          <div className="mt-2 grid grid-cols-invoice  border border-transparent">
            <button
              className={["col-span-2 rounded border px-4 print:hidden", isPrinting ? "!hidden" : ""].join(" ")}
              type="button"
              onClick={() => {
                setItems([...items, myDefaultItem]);
              }}
            >
              Add an item
            </button>
            <p className="col-start-5 col-span-2 text-right">VAT:</p>
            <p className="text-right pr-3">{getFormattedTotalVAT(items)}</p>
          </div>
          <div className="mt-2 grid grid-cols-invoice  border border-transparent font-bold">
            <p className="col-start-5 col-span-2 text-right">To pay:</p>
            <p className="text-right pr-3">{getFormattedTotalPrice(items)}</p>
          </div>
          <div className="mt-auto flex justify-start gap-4">
            {!isPrinting && !settings?.payment_details ? (
              <Link
                to="/settings"
                className="w-full flex items-center justify-start rounded border-2 border-yellow-400 bg-yellow-100 p-2 text-center text-gray-400"
              >
                <p className="text-left">
                  <u>Click here</u> to setup your payment details
                  <br />
                  <small>This yellow frame won&#39;t be printed</small>
                </p>
              </Link>
            ) : (
              <>
                <p>Payment details:</p>
                <p>
                  {settings.payment_details?.split("\n").map((line) => {
                    return (
                      <React.Fragment key={line}>
                        {line}
                        <br />
                      </React.Fragment>
                    );
                  })}
                </p>
              </>
            )}
          </div>
          {!isPrinting && !settings?.payment_terms ? (
            <Link
              to="/settings"
              className="mt-10 w-full flex items-center justify-start rounded border-2 border-yellow-400 bg-yellow-100 p-2 text-center text-gray-400"
            >
              <p className="text-left">
                <u>Click here</u> to setup your payment terms
                <br />
                <small>This yellow frame won&#39;t be printed</small>
              </p>
            </Link>
          ) : (
            <p className="text-sm mt-10">
              <strong>Payment terms:</strong>{" "}
              {settings.payment_terms?.split("\n").map((line) => {
                return (
                  <React.Fragment key={line}>
                    {line}
                    <br />
                  </React.Fragment>
                );
              })}
            </p>
          )}

          <p className="mt-10 w-full text-center text-xs">
            {me.organisation_name} - {me.address} - {me.zip} {me.city} -{" "}
            {countries.find((c) => c.code === me.country_code)?.country}
            <br />
            {me.organisation_number_type}: {me.organisation_number}
            {me.vat_number ? ` - VAT: ${me.vat_number}` : ""}
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
          .map((_item, _index, _items) => {
            if (index === _items.length - 1) return data;
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
      <p className="py-2 pl-1">{index + 1} - </p>
      <input
        className="py-2 text-base"
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
        type="text"
        name="unit"
        defaultValue={item.unit || "day"}
      />

      <input
        className="border-l border-gray-400 py-2 text-center"
        type="number"
        name="unit_price"
        defaultValue={item.unit_price}
        placeholder="600"
      />

      <input className="border-l border-gray-400 py-2 text-center" type="number" name="vat" defaultValue={item.vat} />
      <p className="border-l border-gray-400 py-2 text-right pr-4">{formatToCurrency(getItemPriceWithVat(item))}</p>
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

function CenteredForPrinting({ children, className = "" }) {
  return (
    <div
      className={[
        "p-0 m-0 align-top border-l border-gray-400 text-center flex flex-col h-full justify-center items-center",
        className,
      ].join(" ")}
    >
      <span className={[""].filter(Boolean).join(" ")}>{children}</span>
    </div>
  );
}

export default Invoice;
