import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Root from "./root";
import Settings, { webLoader as settingsLoader, webAction as settingsAction } from "./routes/settings";
import Me, { webLoader as meLoader, webAction as meAction } from "./routes/me";
import Invoices, { webLoader as homeLoader } from "./routes/invoices";
import Stats, { webLoader as statsLoader } from "./routes/stats";
import Invoice, { webLoader as invoiceLoader, webAction as invoiceAction } from "./routes/invoiceId";
import Clients, { webLoader as clientsLoader } from "./routes/clients";
import Client, { webLoader as clientLoader, webAction as clientAction } from "./routes/clientId";
import Download from "./routes/download";
import Legal from "./routes/legal";
import "./styles/tailwind.css";
import "./styles/global.css";
import "./styles/reset.css";
import Open from "./routes/open";

function webLoader() {
  return { forWeb: true };
}

function ErrorBoundary({ error }) {
  console.error(error);
  return (
    <pre>
      <code>{error?.message}</code>
    </pre>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    loader: webLoader,
    children: [
      {
        element: <Invoices />,
        loader: homeLoader,
        index: true,
        errorElement: <ErrorBoundary />,
      },
      {
        element: <Stats />,
        loader: statsLoader,
      },
      {
        path: "/legal",
        element: <Legal />,
      },
      {
        path: "/download",
        element: <Download />,
      },
      {
        path: "/open",
        element: <Open />,
      },
      {
        path: "/me",
        element: <Me />,
        loader: meLoader,
        action: meAction,
      },
      {
        path: "/settings",
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
]);

export default function App() {
  return <RouterProvider router={router} />;
}
