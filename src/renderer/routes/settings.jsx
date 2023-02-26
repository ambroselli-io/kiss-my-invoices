import dayjs from "dayjs";
import { useRef, useState } from "react";
import { Form, redirect, useLoaderData } from "react-router-dom";
import { genericEmailTemplate, genericEmailTemplateSubject } from "../utils/contact";
import { getFolderPath } from "../utils/fileManagement";
import { defaultInvoiceName, defaultInvoiceNumberFormat } from "../utils/invoice";
import { getSettings, setSettings } from "../utils/settings";

export const webLoader = async () => {
  const settings = JSON.parse(window.localStorage.getItem("settings.json") || "{}");
  return { settings, forWeb: true };
};

export const webAction = async ({ request }) => {
  const formData = await request.formData();
  const updatedSettings = Object.fromEntries(formData);
  if (updatedSettings.onboarding) delete updatedSettings.onboarding;
  window.localStorage.setItem("settings.json", JSON.stringify(updatedSettings));
  return { ok: true };
};

export const electronLoader = async () => {
  const settings = await getSettings();
  const folderPath = await getFolderPath();
  return { settings, folderPath };
};

export const electronAction = async ({ request }) => {
  const formData = await request.formData();
  const updatedSettings = Object.fromEntries(formData);
  if (updatedSettings.onboarding) delete updatedSettings.onboarding;
  const settings = await setSettings(updatedSettings);
  if (settings.invoices_folder_path_error) {
    return window.electron.ipcRenderer.invoke(
      "dialog:showMessageBoxSync",
      "The path you provided is not a valid path. Please double check that the folder exists.",
    );
  }
  if (JSON.stringify(settings) !== JSON.stringify(updatedSettings)) {
    return window.electron.ipcRenderer.invoke(
      "dialog:showMessageBoxSync",
      "The file was not saved. Please contact support.",
    );
  }
  if (formData.get("onboarding")) {
    return redirect("/me");
  }
  return { ok: true };
};

function Settings() {
  const { settings, folderPath, forWeb } = useLoaderData();

  const defaultValues = useRef(
    settings ?? JSON.parse(typeof window !== "undefined" ? window?.localStorage?.getItem("settings") || "{}" : "{}"),
  );

  const [saveDisabled, setSaveDisabled] = useState(() => {
    if (defaultInvoiceName !== defaultValues.current.invoice_file_name) return false;
    if (defaultInvoiceNumberFormat !== defaultValues.current.invoice_number_format) return false;
    if (genericEmailTemplate !== defaultValues.current.generic_email_template_body) return false;
    if (genericEmailTemplateSubject !== defaultValues.current.generic_email_template_subject) return false;
    return true;
  });

  if (!folderPath && !forWeb) {
    return (
      <Form
        className="flex h-full w-full flex-col"
        method="post"
        onChange={(e) => {
          setSaveDisabled(false);
        }}
        onSubmit={() => {
          setSaveDisabled(true);
        }}
      >
        <input type="hidden" name="onboarding" value="true" />
        <div className="flex-1 flex items-center justify-center border-b-2 bg-orange-200">
          <h1 className="text-3xl font-bold">Welcome to Kiss my invoices! 💋</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <h2 className="text-lg font-semibold max-w-screen-lg text-center">
            <label htmlFor="kiss_my_invoices_folder_path">
              Before you start creating clients and invoices,
              <br />
              please tell us a path where we can save them on your computer:
            </label>
          </h2>
          <div className="flex min-w-md basis-1/2 flex-col gap-4 p-4">
            <div className="mb-3 flex max-w-screen-lg flex-col-reverse items-center gap-2">
              <input
                name="kiss_my_invoices_folder_path"
                type="text"
                id="kiss_my_invoices_folder_path"
                className="outline-main block w-full rounded border border-black bg-transparent p-2.5 text-black transition-all"
                placeholder="/Users/arnaudambroselli/Pro/__admin/ZZP/My invoices"
                defaultValue={folderPath}
              />
            </div>
            <button
              disabled={saveDisabled}
              className="rounded bg-gray-800 py-2 px-12 text-gray-50 disabled:opacity-30"
              type="submit"
            >
              Save
            </button>
          </div>
        </div>
      </Form>
    );
  }

  return (
    <Form
      className="flex h-full w-full flex-col bg-orange-200"
      method="post"
      onChange={(e) => {
        const json = Object.fromEntries(new FormData(e.currentTarget));
        if (typeof window !== "undefined") {
          window.localStorage.setItem("settings", JSON.stringify(json));
        }
        setSaveDisabled(false);
      }}
      onSubmit={() => {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("settings");
        }
        setSaveDisabled(true);
      }}
    >
      <div className="my-12 flex items-center justify-between px-12">
        <h1 className="text-3xl font-bold">My settings</h1>
        <div className="flex items-center gap-4">
          <button
            disabled={saveDisabled}
            className="rounded bg-gray-800 py-2 px-12 text-gray-50 disabled:opacity-30"
            type="submit"
          >
            Save
          </button>
        </div>
      </div>
      <div className="flex flex-col bg-white border-y-2">
        <details open={!folderPath} className="flex min-w-md grow basis-1/2 flex-col gap-4 p-4">
          <summary>
            <h2 className="inline text-lg font-semibold">Files and folders required settings</h2>
          </summary>
          <div className="pt-2 pl-4">
            {!forWeb && (
              <div className="mb-3 flex max-w-screen-lg flex-col-reverse gap-2">
                <input
                  name="kiss_my_invoices_folder_path"
                  type="text"
                  id="kiss_my_invoices_folder_path"
                  className="outline-main block w-full rounded border border-black bg-transparent p-2.5 text-black transition-all"
                  placeholder="/Users/arnaudambroselli/Pro/__admin/ZZP/My invoices"
                  defaultValue={folderPath}
                />
                <label htmlFor="kiss_my_invoices_folder_path">Invoices folder path</label>
              </div>
            )}
            <div className="mb-3 flex max-w-screen-lg flex-col-reverse gap-2">
              <input
                name="invoice_file_name"
                type="text"
                id="invoice_file_name"
                className="outline-main block w-full rounded border border-black bg-transparent p-2.5 text-black transition-all"
                placeholder="{INVOICE DATE} - {INVOICE NUMBER} - {MY COMPANY NAME} - {CLIENT NAME}.pdf"
                defaultValue={defaultValues.current.invoice_file_name || defaultInvoiceName}
              />
              <details className="text-xs text-gray-500 pl-8">
                <summary className="-mr-4">
                  Click here to see the list of items you can use to make up your invoice name
                </summary>
                We&#39;ll replace the following items with the actual values (don&#39;t forget to add the curly brackets
                around the item name):
                <ul className="list-inside list-disc">
                  <li>
                    <code>{`{INVOICE DATE}`}</code> - The invoice emission date
                  </li>
                  <li>
                    <code>{`{INVOICE NUMBER}`}</code> - The invoice number
                  </li>
                  <li>
                    <code>{`{INVOICE TITLE}`}</code> - The invoice title
                  </li>
                  <li>
                    <code>{`{MY COMPANY NAME}`}</code> - Your company name
                  </li>
                  <li>
                    <code>{`{CLIENT NAME}`}</code> - The client name
                  </li>
                </ul>
              </details>
              <label htmlFor="invoice_file_name">Typical invoice file name</label>
            </div>
            <div className="mb-3 flex max-w-screen-lg flex-col-reverse gap-2">
              <input
                name="invoice_number_format"
                type="text"
                id="invoice_number_format"
                className="outline-main block w-full rounded border border-black bg-transparent p-2.5 text-black transition-all"
                placeholder="{YYYY}-{MM}-{INC}"
                defaultValue={defaultValues.current.invoice_number_format || defaultInvoiceNumberFormat}
              />
              <details className="text-xs text-gray-500 pl-8">
                <summary className="-mr-4">
                  Click here to see the list of items you can use to make up your invoice name
                </summary>
                We&#39;ll replace the following items with the actual values (don&#39;t forget to add the curly brackets
                around the item name):
                <ul className="list-inside list-disc">
                  <li>
                    <code>{`{YYYY}`}</code> - The current year (e.g. {dayjs().format("YYYY")})
                  </li>
                  <li>
                    <code>{`{MM}`}</code> - The current month (e.g. {dayjs().format("MM")})
                  </li>
                  <li>
                    <code>{`{CLIENT CODE}`}</code> - The client code if any
                  </li>
                  <li>
                    <code>{`{INC}`}</code> - The incremental number (e.g. 001, 002, 003, etc.)
                  </li>
                </ul>
              </details>
              <label htmlFor="invoice_number_format">Typical invoice number</label>
            </div>
          </div>
        </details>
        <details
          open={!defaultValues.current.payment_details}
          className="flex min-w-md grow basis-1/2 flex-col gap-4 p-4"
        >
          <summary>
            <h2 className="inline text-lg font-semibold">Payment settings</h2>
          </summary>
          <div className="pt-2 pl-4">
            <div className="mb-3 flex max-w-lg flex-col-reverse gap-2">
              <textarea
                name="payment_details"
                id="payment_details"
                className="outline-main block w-full rounded border border-black bg-transparent p-2.5 text-black transition-all"
                placeholder="IBAN: NL20 XXXX 1234 5678 1&#10;BIC: MAGIC2AXXX"
                defaultValue={defaultValues.current.payment_details}
                rows={3}
              />
              <label htmlFor="payment_details">Payment details</label>
            </div>
            <div className="mb-3 flex max-w-lg flex-col-reverse gap-2">
              <textarea
                name="payment_terms"
                id="payment_terms"
                className="outline-main block w-full rounded border border-black bg-transparent p-2.5 text-black transition-all"
                placeholder="Payment is due within 30 days of receipt of invoice. Late payments will be subject to a 5% surcharge, to which will be added a 40€ collection fee."
                rows={3}
                defaultValue={defaultValues.current.payment_terms}
              />
              <details className="text-xs text-gray-500 pl-8">
                <summary className="-mr-4">Show me an example of payment terms</summary>
                Payment is due within 30 days of receipt of invoice. Late payments will be subject to a 5% surcharge, to
                which will be added a 40€ collection fee.
              </details>
              <label htmlFor="payment_terms">Payment terms</label>
            </div>
          </div>
        </details>
        <details open className="flex min-w-md grow basis-1/2 flex-col gap-4 p-4">
          <summary>
            <h2 className="inline text-lg font-semibold">Generic Email Template</h2>
          </summary>
          <div className="pt-2 pl-4">
            <details className="text-xs text-gray-500 pl-4 mb-4">
              <summary className="-mr-4">
                Click here to see the list of items you can use to make up your generic template email
              </summary>
              We&#39;ll replace the following items with the actual values (don&#39;t forget to add the curly brackets
              around the item name):
              <ul className="list-inside list-disc">
                <li>
                  <code>{`{client.organisation_name}`}</code> - The client organisation name
                </li>
                <li>
                  <code>{`{client.code}`}</code> - The client code
                </li>
                <li>
                  <code>{`{client.address}`}</code> - The client address (street, street number, etc.)
                </li>
                <li>
                  <code>{`{client.city}`}</code> - The client city
                </li>
                <li>
                  <code>{`{client.zip}`}</code> - The client zip code
                </li>
                <li>
                  <code>{`{client.country}`}</code> - The client country
                </li>
                <li>
                  <code>{`{client.contact_name}`}</code> - The client contact name
                </li>
                <li>
                  <code>{`{client.phone}`}</code> - The client phone number
                </li>
                <li>
                  <code>{`{me.organisation_name}`}</code> - Your organisation name
                </li>
                <li>
                  <code>{`{me.organisation_number}`}</code> - Your organisation number
                </li>
                <li>
                  <code>{`{me.vat_number}`}</code> - Your VAT number
                </li>
                <li>
                  <code>{`{me.address}`}</code> - Your address (street, street number, etc.)
                </li>
                <li>
                  <code>{`{me.city}`}</code> - Your city
                </li>
                <li>
                  <code>{`{me.zip}`}</code> - Your zip code
                </li>
                <li>
                  <code>{`{me.country}`}</code> - Your country
                </li>
                <li>
                  <code>{`{me.contact_name}`}</code> - Your contact name
                </li>
                <li>
                  <code>{`{me.email}`}</code> - Your email
                </li>
                <li>
                  <code>{`{me.phone}`}</code> - Your phone number
                </li>
                <li>
                  <code>{`{me.website}`}</code> - Your website
                </li>
                <li>
                  <code>{`{me.description}`}</code> - Your description (job, passion, whatever)
                </li>
                <li>
                  <code>{`{invoice.title}`}</code> - The invoice title
                </li>
                <li>
                  <code>{`{invoice.invoice_number}`}</code> - The invoice number
                </li>
                <li>
                  <code>{`{invoice.emission_date}`}</code> - The invoice date
                </li>
                <li>
                  <code>{`{invoice.due_date}`}</code> - The invoice due date
                </li>
                <li>
                  <code>{`{invoice.amount}`}</code> - The invoice amount
                </li>
              </ul>
            </details>
            <div className="mb-3 flex max-w-screen-lg flex-col-reverse gap-2">
              <input
                name="generic_email_template_subject"
                type="text"
                id="generic_email_template_subject"
                className="outline-main block w-full rounded border border-black bg-transparent p-2.5 text-black transition-all"
                placeholder="Invoice {invoice.invoice_number} for {invoice.title}"
                defaultValue={defaultValues.current.generic_email_template_subject || genericEmailTemplateSubject}
                key={defaultValues.current.generic_email_template_subject || genericEmailTemplateSubject}
              />
              <label htmlFor="generic_email_template_subject">Subject</label>
            </div>
            <div className="mb-3 flex max-w-screen-lg flex-col-reverse gap-2">
              <textarea
                name="generic_email_template_body"
                id="generic_email_template_body"
                className="outline-main block w-full rounded border border-black bg-transparent p-2.5 text-black transition-all"
                placeholder={genericEmailTemplate}
                key={defaultValues.current.generic_email_template_body || genericEmailTemplate}
                defaultValue={defaultValues.current.generic_email_template_body || genericEmailTemplate}
                rows={20}
              />
              <label htmlFor="generic_email_template_body">Body</label>
            </div>
          </div>
        </details>
      </div>
    </Form>
  );
}

export default Settings;
