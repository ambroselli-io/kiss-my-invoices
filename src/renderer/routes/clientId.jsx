import { useMemo, useState } from "react";
import { Form, redirect, useLoaderData } from "react-router-dom";
import Select from "react-select";
import useSetDocumentTitle from "../services/useSetDocumentTitle";
import { countries } from "../utils/countries";
import { readFile, writeFile } from "../utils/fileManagement";
import { genericEmailTemplate, genericEmailTemplateSubject } from "../utils/contact";

export const webLoader = async ({ params }) => {
  const settings = JSON.parse(window.localStorage.getItem("settings.json") || "{}");
  const clients = JSON.parse(window.localStorage.getItem("clients.json") || "[]");
  const client =
    params.clientId !== "new" ? clients.find((_client) => _client.organisation_number === params.clientId) : null;
  return { client, settings };
};

export const webAction = async ({ request, params }) => {
  const clients = JSON.parse(window.localStorage.getItem("clients.json") || "[]");
  const oldClient = clients.find((_client) => _client.organisation_number === params.clientId);
  const updatedClient = Object.fromEntries(await request.formData());
  if (!updatedClient.country_code) {
    updatedClient.country_code = oldClient?.country_code;
  }
  if (updatedClient.code) {
    // remove all spaces
    updatedClient.code = updatedClient.code.replace(/\s/g, "").toUpperCase();
  }
  window.localStorage.setItem(
    "clients.json",
    params.clientId === "new"
      ? JSON.stringify([...clients, updatedClient])
      : JSON.stringify(
          clients.map((_client) => (_client.organisation_number === params.clientId ? updatedClient : _client)),
        ),
  );
  if (params.clientId !== updatedClient.organisation_number) {
    return redirect(`/client/${updatedClient.organisation_number}`);
  }
  return { ok: true };
};

export const electronLoader = async ({ params }) => {
  const settings = await readFile("settings.json");
  const clients = await readFile("clients.json", { default: [] });
  const client =
    params.clientId !== "new" ? clients.find((_client) => _client.organisation_number === params.clientId) : null;
  return { client, settings };
};

export const electronAction = async ({ request, params }) => {
  const clients = await readFile("clients.json", { default: [] });
  const oldClient = clients.find((_client) => _client.organisation_number === params.clientId);
  const updatedClient = Object.fromEntries(await request.formData());
  if (!updatedClient.country_code) {
    updatedClient.country_code = oldClient?.country_code;
  }
  if (updatedClient.code) {
    // remove all spaces
    updatedClient.code = updatedClient.code.replace(/\s/g, "").toUpperCase();
  }
  await writeFile(
    "clients.json",
    params.clientId === "new"
      ? [...clients, updatedClient]
      : clients.map((_client) => (_client.organisation_number === params.clientId ? updatedClient : _client)),
  );
  if (params.clientId !== updatedClient.organisation_number) {
    return redirect(`/client/${updatedClient.organisation_number}`);
  }
  return { ok: true };
};

function Client() {
  const { client, settings } = useLoaderData();
  const [saveDisabled, setSaveDisabled] = useState(true);

  const defaultValues = useMemo(() => {
    if (client) return client;
    return JSON.parse(typeof window !== "undefined" ? window?.localStorage?.getItem("client") || "{}" : "{}");
  }, [client]);

  useSetDocumentTitle(
    `${defaultValues?.organisation_name ?? ""}${defaultValues?.organisation_name ? " | " : ""}💋 Kiss my Invoices`,
  );

  return (
    <Form
      className="flex h-full w-full flex-col bg-blue-200"
      key={JSON.stringify(defaultValues)}
      method="post"
      id="client-form"
      onChange={(e) => {
        const json = Object.fromEntries(new FormData(e.currentTarget));
        if (typeof window !== "undefined") {
          window.localStorage.setItem("client", JSON.stringify(json));
        }
        setSaveDisabled(false);
      }}
      onSubmit={() => {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("client");
        }
        setSaveDisabled(true);
      }}
    >
      <div className="my-12 flex items-center justify-between px-12">
        <h1 className="text-3xl font-bold">{defaultValues.organisation_name || "Client"}</h1>
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
      <div className="flex flex-wrap bg-white border-y-2">
        <fieldset className="flex min-w-md grow basis-1/3 flex-col gap-4 p-4">
          <h2 className="text-lg font-semibold">Organisation identity</h2>
          <div className="mb-3 flex max-w-lg flex-col-reverse gap-2">
            <input
              name="organisation_name"
              type="text"
              id="organisation_name"
              className="outline-main block w-full rounded border border-black bg-transparent p-2.5 text-black transition-all"
              placeholder="Froadmaps"
              required
              defaultValue={defaultValues.organisation_name}
              key={defaultValues.organisation_name}
            />
            <label htmlFor="organisation_name">
              Name <sup>*</sup>
            </label>
          </div>
          <div className="mb-3 flex max-w-lg flex-col-reverse gap-2">
            <input
              name="code"
              type="text"
              id="code"
              className="outline-main block w-full rounded border border-black bg-transparent p-2.5 text-black transition-all"
              placeholder="CLI"
              defaultValue={defaultValues.code}
              key={defaultValues.code}
            />
            <label htmlFor="code">Code</label>
          </div>
          <div className="mb-3 flex max-w-lg flex-col-reverse gap-2">
            <input
              name="organisation_number_type"
              type="text"
              id="organisation_number_type"
              className="outline-main block w-full rounded border border-black bg-transparent p-2.5 text-black transition-all"
              placeholder="SIRET - KvK - ..."
              required
              defaultValue={defaultValues.organisation_number_type}
              key={defaultValues.organisation_number_type}
            />
            <label htmlFor="organisation_number_type">
              Organisation number type (KVK, SIRET, ...) <sup>*</sup>
            </label>
          </div>
          <div className="mb-3 flex max-w-lg flex-col-reverse gap-2">
            <input
              name="organisation_number"
              type="text"
              id="organisation_number"
              className="outline-main block w-full rounded border border-black bg-transparent p-2.5 text-black transition-all"
              placeholder="123456789"
              defaultValue={defaultValues.organisation_number}
              key={defaultValues.organisation_number}
            />
            <label htmlFor="organisation_number">
              Organisation number <sup>*</sup>
            </label>
          </div>
          <div className="mb-3 flex max-w-lg flex-col-reverse gap-2">
            <input
              name="vat_number"
              type="text"
              id="vat_number"
              className="outline-main block w-full rounded border border-black bg-transparent p-2.5 text-black transition-all"
              placeholder="NL123456789B01"
              defaultValue={defaultValues.vat_number}
              key={defaultValues.vat_number}
            />
            <label htmlFor="vat_number">VAT number</label>
          </div>
          <div className="mb-3 flex max-w-lg items-center justify-start gap-2">
            <input
              name="is_vat_applicable"
              type="checkbox"
              id="is_vat_applicable"
              className="outline-main block rounded border border-black bg-transparent p-2.5 text-black transition-all"
              defaultChecked={defaultValues.is_vat_applicable}
            />
            <label htmlFor="is_vat_applicable">VAT applicable</label>
          </div>
        </fieldset>
        <fieldset className="flex min-w-md grow basis-1/3 flex-col gap-4 p-4">
          <h2 className="text-lg font-semibold">Address details</h2>
          <div className="mb-3 flex max-w-lg flex-col-reverse gap-2">
            <textarea
              name="address"
              id="address"
              className="outline-main block w-full rounded border border-black bg-transparent p-2.5 text-black transition-all"
              placeholder="1234 Main St"
              defaultValue={defaultValues.address}
              key={defaultValues.address}
              rows={1}
            />
            <label htmlFor="address">
              Street and street number and all <sup>*</sup>
            </label>
          </div>
          <div className="mb-3 flex max-w-lg flex-col-reverse gap-2">
            <input
              name="city"
              type="text"
              id="city"
              className="outline-main block w-full rounded border border-black bg-transparent p-2.5 text-black transition-all"
              placeholder="San Francisco"
              defaultValue={defaultValues.city}
              key={defaultValues.city}
            />
            <label htmlFor="city">
              City <sup>*</sup>
            </label>
          </div>
          <div className="mb-3 flex max-w-lg flex-col-reverse gap-2">
            <input
              name="zip"
              type="text"
              id="zip"
              className="outline-main block w-full rounded border border-black bg-transparent p-2.5 text-black transition-all"
              placeholder="1015JJ"
              defaultValue={defaultValues.zip}
              key={defaultValues.zip}
            />
            <label htmlFor="zip">Zip</label>
          </div>
          <div className="mb-3 flex max-w-lg flex-col-reverse gap-2">
            <Select
              options={countries}
              className="outline-main block w-full py-1 rounded bg-transparent text-black transition-all [&_*]:!border-black"
              name="country_code"
              defaultInputValue={countries.find((c) => c.code === defaultValues.country_code)?.country}
              getOptionValue={(option) => option.code}
              getOptionLabel={(option) => option.country}
              form="client-form"
              onChange={() => {
                setSaveDisabled(false);
              }}
            />
            <label htmlFor="country_code">
              Country <sup>*</sup>
            </label>
          </div>
        </fieldset>
        <fieldset className="flex min-w-md grow basis-1/3 flex-col gap-4 p-4">
          <h2 className="text-lg font-semibold">Contact details</h2>
          <div className="mb-3 flex max-w-lg flex-col-reverse gap-2">
            <input
              name="contact_name"
              type="text"
              id="contact_name"
              className="outline-main block w-full rounded border border-black bg-transparent p-2.5 text-black transition-all"
              placeholder="Arnaud Ambro"
              defaultValue={defaultValues.contact_name}
              key={defaultValues.contact_name}
            />
            <label htmlFor="contact_name">Contact</label>
          </div>
          <div className="mb-3 flex max-w-lg flex-col-reverse gap-2">
            <input
              name="email"
              type="email"
              id="email"
              multiple
              className="outline-main block w-full rounded border border-black bg-transparent p-2.5 text-black transition-all"
              placeholder="ilike@froadmaps.com"
              defaultValue={defaultValues.email}
              key={defaultValues.email}
            />
            <label htmlFor="email">Email</label>
          </div>
          <div className="mb-3 flex max-w-lg flex-col-reverse gap-2">
            <input
              name="email_cc"
              type="email"
              id="email_cc"
              multiple
              className="outline-main block w-full rounded border border-black bg-transparent p-2.5 text-black transition-all"
              placeholder="ilike@froadmaps.com"
              defaultValue={defaultValues.email_cc}
              key={defaultValues.email_cc}
            />
            <label htmlFor="email_cc">Email CC</label>
          </div>
          <div className="mb-3 flex max-w-lg flex-col-reverse gap-2">
            <input
              name="email_bcc"
              type="email"
              multiple
              id="email_bcc"
              className="outline-main block w-full rounded border border-black bg-transparent p-2.5 text-black transition-all"
              placeholder="ilike@froadmaps.com"
              defaultValue={defaultValues.email_bcc}
              key={defaultValues.email_bcc}
            />
            <label htmlFor="email_cc">Email BCC</label>
          </div>
          <div className="mb-3 flex max-w-lg flex-col-reverse gap-2">
            <input
              name="phone"
              type="text"
              id="phone"
              className="outline-main block w-full rounded border border-black bg-transparent p-2.5 text-black transition-all"
              // placeholder french number with +33
              placeholder="+33 6 12 34 56 78"
              defaultValue={defaultValues.phone}
              key={defaultValues.phone}
            />
            <label htmlFor="phone">Phone</label>
          </div>
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
              name="email_template_subject"
              type="text"
              id="email_template_subject"
              className="outline-main block w-full rounded border border-black bg-transparent p-2.5 text-black transition-all"
              placeholder={settings.generic_email_template_subject || genericEmailTemplateSubject}
              defaultValue={
                defaultValues.email_template_subject ||
                settings.generic_email_template_subject ||
                genericEmailTemplateSubject
              }
              key={defaultValues.email_template_subject || genericEmailTemplateSubject}
            />
            <label htmlFor="email_template_subject">Default Email Subject</label>
          </div>
          <div className="mb-3 flex max-w-screen-lg flex-col-reverse gap-2">
            <textarea
              name="email_template_body"
              id="email_template_body"
              className="outline-main block w-full rounded border border-black bg-transparent p-2.5 text-black transition-all"
              placeholder={settings.generic_email_template_body || genericEmailTemplate}
              key={defaultValues.email_template_body || genericEmailTemplate}
              defaultValue={
                defaultValues.email_template_body || settings.generic_email_template_body || genericEmailTemplate
              }
              rows={20}
            />
            <label htmlFor="email_template_body">Default Email Body</label>
          </div>
        </fieldset>
      </div>
    </Form>
  );
}

export default Client;
