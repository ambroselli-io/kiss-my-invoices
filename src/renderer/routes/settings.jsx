import dayjs from "dayjs";
import { useRef, useState } from "react";
import { Form, useLoaderData } from "react-router-dom";
import { genericEmailTemplate, genericEmailTemplateSubject } from "renderer/utils/contact";
import { getSettings, setSettings } from "renderer/utils/settings";

export const loader = async () => {
  const settings = await getSettings();
  return { settings };
};

export const action = async ({ request }) => {
  const updatedSettings = Object.fromEntries(await request.formData());
  console.log("updatedSettings", updatedSettings);
  const settings = await setSettings(updatedSettings);
  if (JSON.stringify(settings) !== JSON.stringify(updatedSettings)) {
    return { ok: false, status: 500, body: "Something went wrong" };
  }
  return { ok: true };
};

function Settings() {
  const { settings } = useLoaderData();

  const defaultValues = useRef(
    settings ?? JSON.parse(typeof window !== "undefined" ? window?.localStorage?.getItem("settings") || "{}" : "{}"),
  );

  const defaultInvoiceName = `{INVOICE NUMBER} - {MY COMPANY NAME} - {CLIENT NAME} - {INVOICE TITLE}.pdf`;
  const defaultInvoiceNumberFormat = `{YYYY}-{MM}-{INC}`;
  const [saveDisabled, setSaveDisabled] = useState(() => {
    if (defaultInvoiceName !== defaultValues.current.invoice_file_name) return false;
    if (defaultInvoiceNumberFormat !== defaultValues.current.invoice_number_format) return false;
    if (genericEmailTemplate !== defaultValues.current.generic_email_template_body) return false;
    if (genericEmailTemplateSubject !== defaultValues.current.generic_email_template_subject) return false;
    return true;
  });

  return (
    <Form
      className="flex h-full w-full flex-col"
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
      <div className="flex flex-wrap">
        <fieldset className="flex min-w-md grow basis-1/2 flex-col gap-4 p-4">
          <h2 className="text-lg font-semibold">Global settings</h2>
          <div className="mb-3 flex max-w-screen-lg flex-col-reverse gap-2">
            <input
              name="invoices_folder_path"
              type="text"
              id="invoices_folder_path"
              className="outline-main block w-full rounded border border-black bg-transparent p-2.5 text-black transition-all"
              placeholder="/Users/arnaudambroselli/Pro/__admin/ZZP/My invoices"
              defaultValue={defaultValues.current.invoices_folder_path}
            />
            <label htmlFor="name">Invoices folder path</label>
          </div>
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
            <label htmlFor="name">Typical invoice file name</label>
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
            <label htmlFor="name">Typical invoice number</label>
          </div>
        </fieldset>
        <fieldset className="flex min-w-md grow basis-1/2 flex-col gap-4 p-4">
          <h2 className="text-lg font-semibold">Generic Email Template</h2>
          <details className="text-xs text-gray-500 pl-8">
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
        </fieldset>
      </div>
    </Form>
  );
}

export default Settings;
