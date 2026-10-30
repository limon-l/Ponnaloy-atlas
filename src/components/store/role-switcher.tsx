"use client";

import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { setRole, useAtlasState } from "@/lib/store";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

export function RoleSwitcher({ className }: { className?: string }) {
  const state = useAtlasState();
  const { toast } = useToast();
  const router = useRouter();

  return (
    <label className={cn("inline-flex items-center gap-2", className)}>
      <span className="sr-only">Preview role</span>
      <span className="hidden text-2xs uppercase tracking-[0.12em] text-ink-faint sm:inline">View as</span>
      <Select
        value={state.role}
        onChange={(event) => {
          const role = event.target.value as Role;
          setRole(role);
          toast({
            title: `Previewing ${role.toLowerCase()} surfaces`,
            description: "Demo role switch only. The API remains authoritative for real permissions.",
            tone: "info",
          });
          router.push(role === "CUSTOMER" ? "/" : role === "SELLER" ? "/seller" : "/admin");
        }}
        className="h-9 w-auto min-w-28 border-line bg-surface-raised text-xs"
        aria-label="Preview the experience as a role"
      >
        <option value="CUSTOMER">Customer</option>
        <option value="SELLER">Seller</option>
        <option value="ADMIN">Admin</option>
      </Select>
    </label>
  );
}
