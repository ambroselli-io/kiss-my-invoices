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
import Root from "./root";
import Download from "./routes/download";

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
        element: <Home />,
        loader: homeLoader,
        index: true,
        errorElement: <ErrorBoundary />,
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
