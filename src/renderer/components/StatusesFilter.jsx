import { DropdownMenu } from "./DropdownMenu";

export const StatusesFilter = ({ className = "", filteredStatuses = [] }) => {
  return (
    <DropdownMenu
      id="statuses-filter"
      className={[
        "[&_.menu-button.hide-menu]:italic [&_.menu-button.hide-menu]:opacity-50",
        className,
      ].join(" ")}
      title={`Filter${filteredStatuses.length ? ` (${filteredStatuses.length})` : ""}...`}>
      <form
        method="post"
        id="status-filter"
        className="status-filter flex flex-col items-start"
        onSubmit={console.log}>
        <input type="hidden" name="action" value="filter" />
        <button
          className={["!r-2 !p-1", filteredStatuses.includes("TOSEND") ? "line-through" : ""].join(
            " "
          )}
          type="submit"
          form="status-filter"
          name="status"
          value="TOSEND">
          To send
        </button>
        <button
          className={[
            "!p-1 !pr-4 ",
            filteredStatuses.includes("TOBEPAID") ? "line-through" : "",
          ].join(" ")}
          type="submit"
          form="status-filter"
          name="status"
          value="TOBEPAID">
          To be paid
        </button>
        <button
          className={["!p-1 !pr-4 ", filteredStatuses.includes("PAID") ? "line-through" : ""].join(
            " "
          )}
          type="submit"
          form="status-filter"
          name="status"
          value="PAID">
          Paid
        </button>
      </form>
    </DropdownMenu>
  );
};
