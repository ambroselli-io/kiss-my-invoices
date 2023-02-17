import { useMemo, useState } from "react";
import { useFetcher } from "react-router-dom";

export function ButtonsSatus({ invoice, invoiceNumber, className = "", alwaysShowAll = false }) {
  const statusFetcher = useFetcher();

  const selected = useMemo(() => {
    if (!invoice?.status) return "DRAFT";
    if (["loading", "submitting"].includes(statusFetcher.state)) {
      if (statusFetcher.formData?.get("invoice_number") !== invoiceNumber) return invoice.status;
      const newValue = statusFetcher.formData?.get("status");
      if (newValue) return newValue;
    }
    return invoice?.status;
  }, [invoice?.status, statusFetcher.formData, statusFetcher.state, invoiceNumber]);

  const [showAll, setShowAll] = useState(alwaysShowAll);

  return (
    <statusFetcher.Form
      className={["flex flex-wrap items-center justify-center gap-1 p-1", className].filter(Boolean).join(" ")}
      method="POST"
      action={`/invoice/${invoiceNumber}`}
      onSubmit={(e) => {
        if (alwaysShowAll) return;
        console.log(invoice.status === e.nativeEvent.submitter.value);
        setShowAll(invoice.status === e.nativeEvent.submitter.value);
      }}
    >
      <input type="hidden" name="invoice_number" defaultValue={invoiceNumber} />
      <button
        className={[
          selected === "DRAFT" && "!bg-blue-700 !text-white",
          "active:!bg-blue-700 active:!text-white",
          "rounded-full border-2 border-blue-700 px-6",
          (showAll || selected === "") && "border-opacity-40 bg-blue-200 bg-opacity-40 text-blue-700 text-opacity-40",
          !showAll && !["", "DRAFT"].includes(selected) && "hidden",
        ]
          .filter(Boolean)
          .join(" ")}
        name="status"
        disabled={!invoice?.invoice_number}
        type="submit"
        value="DRAFT"
      >
        Draft
      </button>
      <button
        className={[
          selected === "SENT" && "!bg-yellow-300 !text-white",
          "active:!bg-yellow-300 active:!text-white",
          "rounded-full border-2 border-yellow-400 px-6",
          (showAll || selected === "") && "border-opacity-40 bg-yellow-100 bg-opacity-40 text-gray-500 text-opacity-40",
          !showAll && !["", "SENT"].includes(selected) && "hidden",
        ]
          .filter(Boolean)
          .join(" ")}
        name="status"
        disabled={!invoice?.invoice_number}
        type="submit"
        value="SENT"
      >
        Sent
      </button>
      <button
        className={[
          selected === "OVERDUE" && "!bg-red-500 !text-white",
          "active:!bg-red-500 active:!text-white",
          "rounded-full border-2 border-red-500 px-6",
          (showAll || selected === "") && "border-opacity-40 bg-red-200 bg-opacity-40 text-red-700 text-opacity-40",
          !showAll && !["", "OVERDUE"].includes(selected) && "hidden",
        ]
          .filter(Boolean)
          .join(" ")}
        name="status"
        disabled={!invoice?.invoice_number}
        type="submit"
        value="OVERDUE"
      >
        Overdue
      </button>
      <button
        className={[
          selected === "PAID" && "!bg-green-700 !text-white",
          "active:!bg-green-700 active:!text-white",
          "rounded-full border-2 border-green-700 px-6",
          (showAll || selected === "") && "border-opacity-40 bg-green-200 bg-opacity-40 text-green-700 text-opacity-40",
          !showAll && !["", "PAID"].includes(selected) && "hidden",
        ]
          .filter(Boolean)
          .join(" ")}
        name="status"
        disabled={!invoice?.invoice_number}
        type="submit"
        value="PAID"
      >
        💋 Paid
      </button>
      <button
        className={[
          selected === "CANCELED" && "!bg-gray-900 !text-white",
          "active:!bg-gray-900 active:!text-white",
          "rounded-full border-2 border-gray-900 px-6",
          (showAll || selected === "") && "border-opacity-40 bg-white bg-opacity-40 text-gray-900 text-opacity-40",
          !showAll && !["", "CANCELED"].includes(selected) && "hidden",
        ]
          .filter(Boolean)
          .join(" ")}
        name="status"
        disabled={!invoice?.invoice_number}
        type="submit"
        value="CANCELED"
      >
        CANCELED
      </button>
    </statusFetcher.Form>
  );
}
