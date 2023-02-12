import { useRef, useState } from "react";
import { Form, Link, useLoaderData } from "react-router-dom";
import { readFile, writeFile } from "renderer/utils/fileManagement";

export const loader = async ({ params }) => {
  const clients = await readFile("clients.json", { default: [] });
  const client =
    params.clientId !== "new" ? clients.find((_client) => _client.organisation_number === params.clientId) : null;
  return { client };
};

export const action = async ({ request, params }) => {
  const clients = await readFile("clients.json", { default: [] });
  const updatedClient = Object.fromEntries(await request.formData());
  await writeFile(
    "clients.json",
    params === "new"
      ? [...clients, updatedClient]
      : clients.map((_client) => (_client.organisation_number === params.clientId ? updatedClient : _client)),
  );
  return { ok: true };
};

function Client() {
  const { client } = useLoaderData();
  const [saveDisabled, setSaveDisabled] = useState(true);

  const defaultValues = useRef(
    client ?? JSON.parse(typeof window !== "undefined" ? window?.localStorage?.getItem("client") || "{}" : "{}"),
  );

  return (
    <Form
      className="flex h-full w-full flex-col"
      method="post"
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
        <h1 className="text-3xl font-bold">Client</h1>
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
        <div className="flex min-w-md grow basis-1/3 flex-col gap-4 p-4">
          <div className="mb-3 flex max-w-lg flex-col-reverse gap-2">
            <input
              name="organisation_name"
              type="text"
              id="organisation_name"
              className="outline-main block w-full rounded border border-black bg-transparent p-2.5 text-black transition-all"
              placeholder="Froadmaps"
              defaultValue={defaultValues.current.organisation_name}
            />
            <label htmlFor="name">Name</label>
          </div>
          <div className="mb-3 flex max-w-lg flex-col-reverse gap-2">
            <input
              name="organisation_number_type"
              type="text"
              id="organisation_number_type"
              className="outline-main block w-full rounded border border-black bg-transparent p-2.5 text-black transition-all"
              placeholder="SIRET - KvK - ..."
              defaultValue={defaultValues.current.organisation_number_type}
            />
            <label htmlFor="organisation_number_type">Organisation number type (KVK, SIRET, ...)</label>
          </div>
          <div className="mb-3 flex max-w-lg flex-col-reverse gap-2">
            <input
              name="organisation_number"
              type="text"
              id="organisation_number"
              className="outline-main block w-full rounded border border-black bg-transparent p-2.5 text-black transition-all"
              placeholder="123456789"
              defaultValue={defaultValues.current.organisation_number}
            />
            <label htmlFor="organisation_number">Organisation number</label>
          </div>
          <div className="mb-3 flex max-w-lg flex-col-reverse gap-2">
            <input
              name="vat_number"
              type="text"
              id="vat_number"
              className="outline-main block w-full rounded border border-black bg-transparent p-2.5 text-black transition-all"
              placeholder="NL123456789B01"
              defaultValue={defaultValues.current.vat_number}
            />
            <label htmlFor="vat_number">VAT number</label>
          </div>
          <div className="mb-3 flex max-w-lg items-center justify-start gap-2">
            <input
              name="is_vat_applicable"
              type="checkbox"
              id="is_vat_applicable"
              className="outline-main block rounded border border-black bg-transparent p-2.5 text-black transition-all"
              defaultChecked={defaultValues.current.is_vat_applicable}
            />
            <label htmlFor="is_vat_applicable">VAT applicable</label>
          </div>
        </div>
        <div className="flex min-w-md grow basis-1/3 flex-col gap-4 p-4">
          <div className="mb-3 flex max-w-lg flex-col-reverse gap-2">
            <textarea
              name="address"
              id="address"
              className="outline-main block w-full rounded border border-black bg-transparent p-2.5 text-black transition-all"
              placeholder="1234 Main St"
              defaultValue={defaultValues.current.address}
            />
            <label htmlFor="address">Address</label>
          </div>
          <div className="mb-3 flex max-w-lg flex-col-reverse gap-2">
            <input
              name="city"
              type="text"
              id="city"
              className="outline-main block w-full rounded border border-black bg-transparent p-2.5 text-black transition-all"
              placeholder="San Francisco"
              defaultValue={defaultValues.current.city}
            />
            <label htmlFor="city">City</label>
          </div>
          <div className="mb-3 flex max-w-lg flex-col-reverse gap-2">
            <input
              name="zip"
              type="text"
              id="zip"
              className="outline-main block w-full rounded border border-black bg-transparent p-2.5 text-black transition-all"
              placeholder="1015JJ"
              defaultValue={defaultValues.current.zip}
            />
            <label htmlFor="zip">Zip</label>
          </div>
          <div className="mb-3 flex max-w-lg flex-col-reverse gap-2">
            <input
              name="country"
              type="text"
              id="country"
              className="outline-main block w-full rounded border border-black bg-transparent p-2.5 text-black transition-all"
              placeholder="United States"
              defaultValue={defaultValues.current.country}
            />
            <label htmlFor="country">Country</label>
          </div>
        </div>
        <div className="flex min-w-md grow basis-1/3 flex-col gap-4 p-4">
          <div className="mb-3 flex max-w-lg flex-col-reverse gap-2">
            <input
              name="contact_name"
              type="text"
              id="contact_name"
              className="outline-main block w-full rounded border border-black bg-transparent p-2.5 text-black transition-all"
              placeholder="Arnaud Ambro"
              defaultValue={defaultValues.current.contact_name}
            />
            <label htmlFor="contact_name">Contact</label>
          </div>
          <div className="mb-3 flex max-w-lg flex-col-reverse gap-2">
            <input
              name="email"
              type="email"
              id="email"
              className="outline-main block w-full rounded border border-black bg-transparent p-2.5 text-black transition-all"
              placeholder="ilike@froadmaps.com"
              defaultValue={defaultValues.current.email}
            />
            <label htmlFor="email">Email</label>
          </div>
          <div className="mb-3 flex max-w-lg flex-col-reverse gap-2">
            <input
              name="email_cc"
              type="email"
              id="email_cc"
              className="outline-main block w-full rounded border border-black bg-transparent p-2.5 text-black transition-all"
              placeholder="ilike@froadmaps.com"
              defaultValue={defaultValues.current.email_cc}
            />
            <label htmlFor="email_cc">Email CC</label>
          </div>
          <div className="mb-3 flex max-w-lg flex-col-reverse gap-2">
            <input
              name="phone"
              type="text"
              id="phone"
              className="outline-main block w-full rounded border border-black bg-transparent p-2.5 text-black transition-all"
              // placeholder french number with +33
              placeholder="+33 6 12 34 56 78"
              defaultValue={defaultValues.current.phone}
            />
            <label htmlFor="phone">Phone</label>
          </div>
        </div>
      </div>
    </Form>
  );
}

export default Client;
