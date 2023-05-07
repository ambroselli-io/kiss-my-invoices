import { createHashRouter, redirect, RouterProvider } from "react-router-dom";
import Root from "./root";
import Settings, { electronLoader as settingsLoader, electronAction as settingsAction } from "./routes/settings";
import Me, { electronLoader as meLoader, electronAction as meAction } from "./routes/me";
import Invoices, { electronLoader as homeLoader } from "./routes/invoices";
import Stats, { electronLoader as statsLoader } from "./routes/stats";
import Invoice, { electronLoader as invoiceLoader, electronAction as invoiceAction } from "./routes/invoiceId";
import Clients, { electronLoader as clientsLoader } from "./routes/clients";
import Client, { electronLoader as clientLoader, electronAction as clientAction } from "./routes/clientId";
import Legal from "./routes/legal";
import "./styles/tailwind.css";
import "./styles/global.css";
import "./styles/reset.css";
import { getSettings } from "./utils/settings";
import type { Settings as SettingsType } from "./utils/settings";
import { getFolderPath } from "./utils/fileManagement";

const loader = async ({
  request,
}: {
  request: any;
}): Promise<Response | { settings: SettingsType; folderPath: string }> => {
  const settings = await getSettings();
  const folderPath = await getFolderPath();
  const url = new URL(request.url);
  const isSettings = url.pathname === "/settings";
  if (!folderPath && !isSettings) {
    return redirect("/settings");
  }
  return { settings, folderPath };
};

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
          element: <Invoices />,
          loader: homeLoader,
          index: true,
        },
        {
          path: "stats",
          element: <Stats />,
          loader: statsLoader,
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
