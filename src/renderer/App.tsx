import { createHashRouter, Link, NavLink, Outlet, RouterProvider, useLoaderData, useMatches } from "react-router-dom";
import Home, { loader as homeLoader } from "./routes/_index";
import Client, { loader as clientLoader, action as clientAction } from "./routes/clientId";
import Me, { loader as meLoader, action as meAction } from "./routes/me";
import Settings, { loader as settingsLoader, action as settingsAction } from "./routes/settings";
import Invoice, { loader as invoiceLoader, action as invoiceAction } from "./routes/invoiceId";
import "./styles/tailwind.css";
import "./styles/global.css";
import "./styles/reset.css";
import { getSettings } from "./utils/settings";
import type { Settings as SettingsType } from "./utils/settings";
import Clients, { loader as clientsLoader } from "./routes/clients";

const loader = async (): Promise<SettingsType> => {
  const settings = await getSettings();
  return settings;
};

function Root() {
  const settings: SettingsType = useLoaderData();
  const matches = useMatches();
  const invoices_folder_path = settings?.invoices_folder_path;
  const invoices_folder_path_error = settings?.invoices_folder_path_error;

  // check if match.patname matched /invoice/:invoice_number, invoice_number is any string
  // and get the invoice_number
  const isInvoice = matches[1]?.pathname?.match(/^\/invoice\/.+/);
  const invoice_number = isInvoice && isInvoice[0].replace("/invoice/", "");

  // const isClient = matches[1]?.pathname?.match(/^\/client\/.+/);
  // const clientNumber = isClient && isClient[0].replace("/client/", "");

  const isSettings = matches[1]?.pathname === "/settings";
  const showSettingsError = !!invoices_folder_path_error || (!isSettings && !invoices_folder_path);

  return (
    <div className="h-full w-full">
      {!!invoices_folder_path && (
        <nav className="w-full text-sm border-b border-gray-400 flex print:hidden">
          <NavLink to="settings" className="px-5 py-2 [&.active_.kiss]:!visible">
            <span className="kiss invisible mr-2">💋</span>My settings
          </NavLink>
          <NavLink to="me" className="px-5 py-2 [&.active_.kiss]:!visible">
            <span className="kiss invisible mr-2">💋</span>My identity
          </NavLink>
          <NavLink to="/" className="px-5 py-2 [&.active_.kiss]:!visible">
            <span className="kiss invisible mr-2">💋</span>My invoices
          </NavLink>
          <NavLink to="client" className="px-5 py-2 [&.active_.kiss]:!visible">
            <span className="kiss invisible mr-2">💋</span>My clients
          </NavLink>
          {!!invoice_number && (
            <NavLink to="invoice" className="px-5 py-2">
              <span className="mr-2">💋</span>Invoice {invoice_number}
            </NavLink>
          )}
          {/* {!!clientNumber && (
          <NavLink to={`/client/${clientNumber}`} className="px-5 py-2">
            <span className="mr-2">💋</span>Client {clientNumber}
          </NavLink>
        )} */}
        </nav>
      )}
      {showSettingsError && (
        <div className="w-full p-4">
          <div
            className={[
              !invoices_folder_path && "rounded border-2 border-yellow-400 bg-yellow-100 p-2 text-center text-gray-400",
              !!invoices_folder_path_error &&
                "rounded border-2 border-red-500 bg-red-200 p-2 text-center text-gray-700",
            ].join(" ")}
          >
            <Link to="settings">
              {!invoices_folder_path_error && (
                <>
                  <u>Click here</u> to setup your Invoices folder path before you start using <b>Kiss my Invoices 💋</b>
                </>
              )}
              {!!invoices_folder_path_error && (
                <>
                  {!isSettings && (
                    <>
                      The Invoice folder you indicate does not exist, <u>click here</u> to fix it before using{" "}
                      <b>💋 Kiss my Invoices</b>
                    </>
                  )}
                  {!!isSettings && <>The Invoice folder you indicate does not exist, double check its spelling</>}
                </>
              )}
            </Link>
          </div>
        </div>
      )}
      <Outlet />
    </div>
  );
}

// TS an ErrorBoundary component with error as only prop
function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);
  return (
    <pre>
      <code>{error?.message}</code>
    </pre>
  );
}

const router = createHashRouter(
  [
    {
      path: "/",
      element: <Root />,
      loader,
      children: [
        {
          element: <Home />,
          loader: homeLoader,
          index: true,
          errorElement: <ErrorBoundary />,
        },
        {
          path: "me",
          element: <Me />,
          loader: meLoader,
          action: meAction,
        },
        {
          path: "settings",
          element: <Settings />,
          loader: settingsLoader,
          action: settingsAction,
        },
        {
          path: "/invoice/:invoice_number",
          element: <Invoice />,
          loader: invoiceLoader,
          action: invoiceAction,
        },
        {
          path: "/client",
          element: <Clients />,
          loader: clientsLoader,
        },
        {
          path: "/client/:clientId",
          element: <Client />,
          loader: clientLoader,
          action: clientAction,
        },
      ],
    },
  ],
  {
    // initialEntries: ["/", "/invoice/new", "/invoice/2023-02-004"],
    // initialEntries: ["/", "/me"],
    // initialEntries: ["/", "/client/481 071 769 00071"],
    // initialEntries: ["/"],
  },
);

export default function App() {
  return <RouterProvider router={router} />;
}
