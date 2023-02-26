import { createBrowserRouter, NavLink, Outlet, RouterProvider, useMatches } from "react-router-dom";
import Home, { webLoader as homeLoader } from "./routes/_index";
import Client, { webLoader as clientLoader, webAction as clientAction } from "./routes/clientId";
import Me, { webLoader as meLoader, webAction as meAction } from "./routes/me";
import Settings, { webLoader as settingsLoader, webAction as settingsAction } from "./routes/settings";
import Invoice, { webLoader as invoiceLoader, webAction as invoiceAction } from "./routes/invoiceId";
import "./styles/tailwind.css";
import "./styles/global.css";
import "./styles/reset.css";
import Clients, { webLoader as clientsLoader } from "./routes/clients";
import Legal from "./routes/legal";

function Root() {
  const matches = useMatches();

  // check if match.patname matched /invoice/:invoice_number, invoice_number is any string
  // and get the invoice_number
  const isInvoice = matches[1]?.pathname?.match(/^\/invoice\/.+/);
  const invoice_number = isInvoice && isInvoice[0].replace("/invoice/", "");

  // const isClient = matches[1]?.pathname?.match(/^\/client\/.+/);
  // const clientNumber = isClient && isClient[0].replace("/client/", "");

  return (
    <div className="h-full w-full">
      <nav className="w-full text-sm border-b-2 z-50 flex sticky top-0 bg-white print:hidden">
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
        <NavLink to="legal" className="ml-auto px-5 py-2  [&.active_.kiss]:!visible">
          <span className="kiss invisible mr-2">💋</span>About-us
        </NavLink>
      </nav>
      <Outlet />
    </div>
  );
}

function ErrorBoundary({ error }) {
  console.error(error);
  return (
    <pre>
      <code>{error?.message}</code>
    </pre>
  );
}

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Root />,
      children: [
        {
          element: <Home />,
          loader: homeLoader,
          index: true,
          errorElement: <ErrorBoundary />,
        },
        {
          path: "legal",
          element: <Legal />,
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
