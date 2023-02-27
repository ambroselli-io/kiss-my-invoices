import { Link, NavLink, Outlet, useLoaderData, useMatches } from "react-router-dom";
import "./styles/tailwind.css";
import "./styles/global.css";
import "./styles/reset.css";

function Root() {
  const { folderPath, forWeb } = useLoaderData();
  const matches = useMatches();

  // check if match.patname matched /invoice/:invoice_number, invoice_number is any string
  // and get the invoice_number
  const isInvoice = matches[1]?.pathname?.match(/^\/invoice\/.+/);
  const invoice_number = isInvoice && isInvoice[0].replace("/invoice/", "");

  // const isClient = matches[1]?.pathname?.match(/^\/client\/.+/);
  // const clientNumber = isClient && isClient[0].replace("/client/", "");

  return (
    <div className="h-full w-full">
      {!!forWeb && (
        <p className="bg-rose-500 text-white font-bold text-xs py-3 m-0 text-center">
          This is for demo purpose only, your data won&#39;t be saved. Please{" "}
          <Link to="download" className="underline">
            download
          </Link>{" "}
          the app to have a full experience.
        </p>
      )}
      {(!!forWeb || !!folderPath) && (
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
          {!!forWeb && (
            <NavLink to="download" className="px-5 py-2  [&.active_.kiss]:!visible">
              <span className="kiss invisible mr-2">💋</span>Download
            </NavLink>
          )}
        </nav>
      )}
      <Outlet />
    </div>
  );
}

export default Root;
