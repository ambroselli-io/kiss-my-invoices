import { Link } from "react-router-dom";
import { getFormattedTotalPretaxPrice, getFormattedTotalPrice, getFormattedTotalVAT } from "../../utils/prices";

export function InvoiceRow({ invoice, index, className }) {
  return (
    <Link
      to={`/invoice/${invoice.invoice_number}`}
      key={invoice.invoice_number}
      aria-label={invoice.title}
      className={["grid-cols-invoices group grid", className].join(" ")}
    >
      <p className="border-x border-b-2 p-2">{invoice.invoice_number}</p>
      <p className="border-x border-b-2 p-2">{invoice.title}</p>
      <p className="border-x border-b-2 p-2">{invoice.client.organisation_name}</p>
      <p className="border-x border-b-2 p-2">{invoice.emission_date}</p>
      <p className="border-x border-b-2 p-2">{getFormattedTotalPretaxPrice(invoice.items)} €</p>
      <p className="border-x border-b-2 p-2">{getFormattedTotalVAT(invoice.items)} €</p>
      <p className="border-x border-b-2 p-2">{getFormattedTotalPrice(invoice.items)} €</p>
    </Link>
  );
}
