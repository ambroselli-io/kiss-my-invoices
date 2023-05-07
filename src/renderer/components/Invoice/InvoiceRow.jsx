import { Link } from "react-router-dom";
import { getFormattedTotalPretaxPrice } from "../../utils/prices";
import { ButtonsStatus } from "./ButtonsStatus";

function GoToInvoiceOnClick({ invoice, className, children }) {
  return (
    <Link
      to={`/invoice/${invoice.invoice_number}`}
      className={className}
      aria-label={`Go to invoice ${invoice.invoice_number} ${invoice.title}`}
    >
      {children}
    </Link>
  );
}

export function InvoiceRow({ invoice, className }) {
  return (
    <div
      key={invoice.invoice_number}
      aria-label={invoice.title}
      className={["grid-cols-invoices group grid", className].join(" ")}
    >
      <GoToInvoiceOnClick invoice={invoice} className="border-x border-b-2 p-2">
        {invoice.invoice_number}
      </GoToInvoiceOnClick>
      <GoToInvoiceOnClick invoice={invoice} className="border-x border-b-2 p-2">
        {invoice.title}
      </GoToInvoiceOnClick>
      <GoToInvoiceOnClick invoice={invoice} className="border-x border-b-2 p-2">
        {invoice.client?.organisation_name}
      </GoToInvoiceOnClick>
      <GoToInvoiceOnClick invoice={invoice} className="border-x border-b-2 p-2">
        {invoice.emission_date}
      </GoToInvoiceOnClick>
      {/* <GoToInvoiceOnClick invoice={invoice} className="border-x border-b-2 p-2">{getFormattedTotalPretaxPrice(invoice.items)}</GoToInvoiceOnClick> */}
      {/* <GoToInvoiceOnClick invoice={invoice} className="border-x border-b-2 p-2">{getFormattedTotalVAT(invoice.items)}</GoToInvoiceOnClick> */}
      <GoToInvoiceOnClick invoice={invoice} className="border-x border-b-2 p-2">
        {getFormattedTotalPretaxPrice(invoice.items)}
      </GoToInvoiceOnClick>
      <div className="border-x border-b-2 flex justify-center items-center">
        <ButtonsStatus invoice={invoice} invoiceNumber={invoice.invoice_number} />
      </div>
    </div>
  );
}
