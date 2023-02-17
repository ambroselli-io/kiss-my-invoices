import Select from "react-select";

const statuses = [
  { value: "draft", label: "Draft" },
  { value: "to_send", label: "To send" },
  { value: "sent", label: "Sent" },
  { value: "paid", label: "Paid" },
  { value: "canceled", label: "Canceled" },
];

function getValue(status) {
  return statuses.find((s) => s.value === status);
}

function SelectInvoiceStatus({ status, invoiceNumber, invoiceFetcher }) {
  return (
    <invoiceFetcher.Form
      method="POST"
      className={["flew-wrap my-8 flex items-center justify-center gap-4 print:hidden"].join(" ")}
    >
      <input type="hidden" name="invoice_number" defaultValue={invoiceNumber} />
      <Select
        options={statuses}
        className="min-w-[16rem]"
        name="status"
        onChange={(_status) => {
          const form = new FormData();
          form.append("status", _status.value);
          form.append("from", "status select");
          form.append("invoice_number", invoiceNumber);
          console.log("form", Object.fromEntries(form));
          invoiceFetcher.submit(form, { method: "post" });
        }}
        value={getValue(status)}
      />
    </invoiceFetcher.Form>
  );
}

export default SelectInvoiceStatus;
