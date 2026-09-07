import React from "react";
import { TenantsTable } from "@/components/dashboard/TenantsTable";

export const metadata = {
  title: "Tenants Management | QletLettings",
  description: "Manage live AST leases, rent collection, and deposit bonds.",
};

export default function TenantsPage() {
  return <TenantsTable />;
}
