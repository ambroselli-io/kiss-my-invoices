import { useRef, useState } from "react";
import { Form, useLoaderData } from "react-router-dom";
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
  const [saveDisabled, setSaveDisabled] = useState(defaultInvoiceName === defaultValues.current.invoice_file_name);

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
        <div className="flex min-w-md grow basis-1/3 flex-col gap-4 p-4">
          <div className="mb-3 flex max-w-lg flex-col-reverse gap-2">
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
            <details open className="text-xs text-gray-500 pl-8">
              <summary className="-mr-4">
                Here below are the list of items you can use to make up your invoice name
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
        </div>
      </div>
    </Form>
  );
}

export default Settings;
