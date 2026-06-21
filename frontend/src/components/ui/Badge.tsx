import clsx from "clsx";

import type { Priority, TicketStatus } from "../../types";
import {
  prettifyEnum,
  priorityTone,
  statusTone,
} from "../../utils/format";

export function StatusBadge({
  status,
}: {
  status: TicketStatus;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
        statusTone[status]
      )}
    >
      {prettifyEnum(status)}
    </span>
  );
}

export function PriorityBadge({
  priority,
}: {
  priority: Priority;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
        priorityTone[priority]
      )}
    >
      {prettifyEnum(priority)}
    </span>
  );
}