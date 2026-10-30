"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { markAllNotificationsRead, markNotificationRead, useAtlasState } from "@/lib/store";
import type { Role } from "@/lib/types";
import { cn, formatDateTime } from "@/lib/utils";

export function Notifications({ role }: { role: Role }) {
  const state = useAtlasState();
  const [open, setOpen] = React.useState(false);
  const relevant = state.notifications
    .filter((item) => item.audience === role || (role === "SUPER_ADMIN" && item.audience === "ADMIN"))
    .slice(0, 8);
  const unread = relevant.filter((item) => !item.read).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="focus-ring relative grid size-10 place-items-center rounded-md text-ink-soft transition-colors hover:bg-ink/[0.05] hover:text-ink"
          aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        >
          <Bell className="size-[1.15rem]" aria-hidden="true" />
          {unread > 0 && (
            <span className="absolute right-2 top-2 grid min-w-4 place-items-center rounded-full bg-copper px-1 text-[0.5625rem] font-semibold leading-4 text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(92vw,24rem)] p-0" align="end">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <div>
            <p className="text-sm font-medium text-ink">Notifications</p>
            <p className="text-2xs text-ink-faint">{unread ? `${unread} unread` : "You are all caught up"}</p>
          </div>
          {unread > 0 && (
            <button
              type="button"
              onClick={() => markAllNotificationsRead(role)}
              className="focus-ring inline-flex items-center gap-1.5 rounded text-2xs font-medium text-teal hover:underline"
            >
              <CheckCheck className="size-3.5" aria-hidden="true" />
              Mark all read
            </button>
          )}
        </div>
        <ul className="max-h-[min(60vh,26rem)] divide-y divide-line overflow-y-auto">
          {relevant.length === 0 && (
            <li className="px-4 py-10 text-center text-sm text-ink-faint">Nothing new for this role.</li>
          )}
          {relevant.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                onClick={() => {
                  markNotificationRead(item.id);
                  setOpen(false);
                }}
                className="focus-ring relative block px-4 py-3.5 transition-colors hover:bg-ink/[0.035]"
              >
                <span
                  className={cn(
                    "absolute left-1.5 top-5 size-1.5 rounded-full bg-copper",
                    item.read && "bg-transparent"
                  )}
                  aria-hidden="true"
                />
                <span className={cn("block text-sm", item.read ? "font-normal text-ink-soft" : "font-medium text-ink")}>
                  {item.title}
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-ink-soft">{item.body}</span>
                <span className="mt-1 block font-mono text-[0.625rem] uppercase tracking-[0.1em] text-ink-faint">
                  {formatDateTime(item.at)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="border-t border-line px-4 py-2.5 text-2xs text-ink-faint">
          Demo notifications · actions update this browser only.
        </div>
      </PopoverContent>
    </Popover>
  );
}
