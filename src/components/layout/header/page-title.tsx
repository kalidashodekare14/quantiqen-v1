"use client";

import { usePathname } from "next/navigation";

export function PageTitle() {
  const pathname = usePathname();

  const title = pathname.split("/").filter(Boolean).pop()?.replace(/-/g, " ");

  return <h1 className="text-xl lg:text-2xl font-semibold capitalize">{title || "Dashboard"}</h1>;
}
