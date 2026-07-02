"use client";

import { usePathname } from "next/navigation";

export function PageTitle() {
  const pathname = usePathname();

  const title = pathname.split("/").filter(Boolean).pop()?.replace(/-/g, " ");

  return <h1 className="text-sm font-semibold capitalize lg:text-xl">{title || "Dashboard"}</h1>;
}
