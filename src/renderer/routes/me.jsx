import { useRef, useState } from "react";
import { Form, useLoaderData } from "react-router-dom";
import Select from "react-select";
import { readFile, writeFile } from "../utils/fileManagement";
import { countries } from "../utils/countries";

export const webLoader = async () => {
  const me = JSON.parse(window.localStorage.getItem("me.json") || "{}");
  return { me };
};

export const webAction = async ({ request }) => {
  const me = JSON.parse(window.localStorage.getItem("me.json") || "{}");
  window.countryCode = me?.country_code;
  const updatedMe = Object.fromEntries(await request.formData());
  if (!updatedMe.country_code) {
    updatedMe.country_code = me?.country_code;
  }
  if (updatedMe?.country_code?.length && !countries.find((c) => c.code === updatedMe.country_code)) {
    // eslint-disable-next-line no-alert
    return window.alert(
      "This country code doesn't exist. Please check https://en.wikipedia.org/wiki ISO_3166-1_alpha-2#Officially_assigned_code_elements to find yours.",
    );
  }
  window.localStorage.setItem("me.json", JSON.stringify({ ...me, ...updatedMe }));
  return { ok: true };
};

export const electronLoader = async () => {
  const me = await readFile("me.json", { default: {} });
  return { me };
};

export const electronAction = async ({ request }) => {
  const me = await readFile("me.json");
  window.countryCode = me?.country_code;
  const updatedMe = Object.fromEntries(await request.formData());
  if (!updatedMe.country_code) {
    updatedMe.country_code = me?.country_code;
  }
  if (updatedMe?.country_code?.length && !countries.find((c) => c.code === updatedMe.country_code)) {
    return window.electron.ipcRenderer.invoke(
      "dialog:showMessageBoxSync",
      "This country code doesn't exist. Please check https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#Officially_assigned_code_elements to find yours.",
    );
  }
  await writeFile("me.json", { ...me, ...updatedMe });

  return { ok: true };
};

function Me() {
  const { me } = useLoaderData();
  const [saveDisabled, setSaveDisabled] = useState(true);

  const defaultValues = useRef(
    me ?? JSON.parse(typeof window !== "undefined" ? window?.localStorage?.getItem("me") || "{}" : "{}"),
  );

  return (
    <Form
      className="flex h-full w-full flex-col bg-green-200 overflow-auto pb-20"
      method="post"
      form="me"
      onChange={(e) => {
        const json = Object.fromEntries(new FormData(e.currentTarget));
        if (typeof window !== "undefined") {
          window.localStorage.setItem("me", JSON.stringify(json));
        }
        setSaveDisabled(false);
      }}
      onSubmit={() => {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("me");
        }
        setSaveDisabled(true);
      }}
    >
      <input type="hidden" name="_id" defaultValue={defaultValues.current._id} />
      <div className="my-12 flex items-center justify-between px-12">
        <h1 className="text-3xl font-bold">My identity</h1>
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
            <label htmlFor="organisation_name">
              Company Name <sup>*</sup>
            </label>
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
            <label htmlFor="organisation_number_type">
              Organisation number type <sup>*</sup> (KVK, SIRET, ...)
            </label>
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
              defaultValue={defaultValues.current.vat_number}
            />
            <label htmlFor="vat_number">VAT number</label>
          </div>
        </div>
        <div className="flex min-w-md grow basis-1/3 flex-col gap-4 p-4">
          <div className="mb-3 flex max-w-lg flex-col-reverse gap-2">
            <textarea
              name="address"
              id="address"
              className="outline-main block w-full rounded border border-black bg-transparent p-2.5 text-black transition-all"
              placeholder="1, avenue des Champs Elysées"
              rows={1}
              defaultValue={defaultValues.current.address}
            />
            <label htmlFor="address">
              Address <sup>*</sup>
            </label>
          </div>
          <div className="mb-3 flex max-w-lg flex-col-reverse gap-2">
            <input
              name="city"
              type="text"
              id="city"
              className="outline-main block w-full rounded border border-black bg-transparent p-2.5 text-black transition-all"
              placeholder="Paris"
              defaultValue={defaultValues.current.city}
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
              placeholder="75018"
              defaultValue={defaultValues.current.zip}
            />
            <label htmlFor="zip">
              Zip <sup>*</sup>
            </label>
          </div>
          <div className="mb-3 flex max-w-lg flex-col-reverse gap-2">
            <Select
              options={countries}
              className="outline-main block w-full py-1 rounded bg-transparent text-black transition-all [&_*]:!border-black"
              name="country_code"
              defaultInputValue={countries.find((c) => c.code === defaultValues.current.country_code)?.country}
              getOptionValue={(option) => option.code}
              getOptionLabel={(option) => option.country}
              form="me"
              onChange={() => {
                setSaveDisabled(false);
              }}
            />
            <label htmlFor="country_code">
              Country <sup>*</sup>
            </label>
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
              name="description"
              type="text"
              id="description"
              className="outline-main block w-full rounded border border-black bg-transparent p-2.5 text-black transition-all"
              placeholder="Web developer - Fullstack JS"
              defaultValue={defaultValues.current.description}
            />
            <label htmlFor="contact_name">One liner description</label>
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
              name="phone"
              type="text"
              id="phone"
              className="outline-main block w-full rounded border border-black bg-transparent p-2.5 text-black transition-all"
              placeholder="+33 6 12 34 56 78"
              defaultValue={defaultValues.current.phone}
            />
            <label htmlFor="phone">Phone</label>
          </div>
          <div className="mb-3 flex max-w-lg flex-col-reverse gap-2">
            <input
              name="website"
              type="text"
              id="website"
              className="outline-main block w-full rounded border border-black bg-transparent p-2.5 text-black transition-all"
              placeholder="https://kiss-my-invoice.com"
              defaultValue={defaultValues.current.website}
            />
            <label htmlFor="phone">Website</label>
          </div>
        </div>
      </div>
    </Form>
  );
}

export default Me;
