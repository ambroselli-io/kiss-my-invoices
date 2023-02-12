import { createBrowserRouter, createHashRouter, Link, Outlet, RouterProvider } from "react-router-dom";
import Home, { loader as homeLoader } from "./routes/_index";
import Client, { loader as clientLoader, action as clientAction } from "./routes/clientId";
import Me, { loader as meLoader, action as meAction } from "./routes/me";
import Invoice, { loader as invoiceLoader, action as invoiceAction } from "./routes/invoiceId";
import "./styles/tailwind.css";
import "./styles/global.css";
import "./styles/reset.css";

function Root() {
  return (
    <div className="h-full w-full">
      <div className="w-full text-sm border-b border-gray-400 flex print:hidden">
        <Link to="me" className="px-5 py-2">
          My identity
        </Link>
        <Link to="home" className="px-5 py-2">
          My invoices
        </Link>
        <Link to="client" className="px-5 py-2">
          My clients
        </Link>
      </div>
      <Outlet />
    </div>
  );
}

const router = createHashRouter(
  [
    {
      path: "/",
      element: <Root />,
      children: [
        {
          path: "home",
          element: <Home />,
          loader: homeLoader,
        },
        {
          path: "me",
          element: <Me />,
          loader: meLoader,
          action: meAction,
        },
        {
          path: "/invoice/:invoice_number",
          element: <Invoice />,
          loader: invoiceLoader,
          action: invoiceAction,
          errorElement: <div>Invoice not found</div>,
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
