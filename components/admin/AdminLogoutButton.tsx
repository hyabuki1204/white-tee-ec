"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ADMIN_COPY } from "@/lib/admin/copy";
import { adminBtnSecondary } from "@/lib/admin/ui";

export function AdminLogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className={adminBtnSecondary}
    >
      {isLoading ? ADMIN_COPY.nav.loggingOut : ADMIN_COPY.nav.logout}
    </button>
  );
}
