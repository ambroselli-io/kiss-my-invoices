import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { useFetcher } from "react-router-dom";

export function ButtonsStatus({ invoice, invoiceNumber, className = "", alwaysShowAll = false }) {
  const statusFetcher = useFetcher();

  const numberOfDaysOverdue = useMemo(() => {
    if (!invoice?.due_date) return 0;
    const dueDate = dayjs(invoice.due_date);
    if (dueDate.isAfter(dayjs())) return 0;
    return dayjs().diff(dueDate, "day");
  }, [invoice?.due_date]);

  const selected = useMemo(() => {
    if (!invoice?.status) return "DRAFT";
    if (["loading", "submitting"].includes(statusFetcher.state)) {
      if (statusFetcher.formData?.get("invoice_number") !== invoiceNumber) return invoice.status;
      const newValue = statusFetcher.formData?.get("status");
      if (newValue) return newValue;
    }
    if (invoice?.status === "SENT" && numberOfDaysOverdue > 0) return "OVERDUE";
    return invoice?.status;
  }, [invoice?.status, statusFetcher.formData, statusFetcher.state, invoiceNumber, numberOfDaysOverdue]);

  const [showAll, setShowAll] = useState(alwaysShowAll);

  return (
    <statusFetcher.Form
      className={["flex flex-wrap items-center justify-center gap-1 p-1", className].filter(Boolean).join(" ")}
      method="POST"
      action={`/invoice/${invoiceNumber}`}
      onSubmit={(e) => {
        if (alwaysShowAll) return;
        setShowAll(invoice.status === e.nativeEvent.submitter.value);
      }}
    >
      <input type="hidden" name="invoice_number" defaultValue={invoiceNumber} />
      <button
        className={[
          selected === "DRAFT" && "!bg-blue-700 !text-white",
          "active:!bg-blue-700 active:!text-white",
          "rounded-full border-2 border-blue-700 px-6",
          (showAll || selected === "") && "bg-blue-50 opacity-100 text-blue-700",
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
          (selected === "SENT" || numberOfDaysOverdue > 0) && "!bg-yellow-300 !text-white",
          "active:!bg-yellow-300 active:!text-white",
          "rounded-full border-2 border-yellow-400 px-6",
          (showAll || selected === "") && "bg-yellow-50 opacity-100 text-gray-500",
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
          (showAll || selected === "") && "bg-red-50 opacity-100 text-red-700",
          !showAll && !["", "OVERDUE"].includes(selected) && "hidden",
        ]
          .filter(Boolean)
          .join(" ")}
        name="status"
        disabled={!invoice?.invoice_number}
        type="submit"
        value="OVERDUE"
      >
        {numberOfDaysOverdue > 0 ? <>Overdue {numberOfDaysOverdue}&nbsp;days</> : "Overdue"}
      </button>
      <button
        className={[
          selected === "PAID" && "!bg-green-700 !text-white",
          "active:!bg-green-700 active:!text-white",
          "rounded-full border-2 border-green-700 px-6",
          (showAll || selected === "") && "bg-green-50 opacity-100 text-green-700",
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
          (showAll || selected === "") && "bg-gray-50 opacity-100 text-gray-900",
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
