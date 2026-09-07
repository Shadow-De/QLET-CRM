import React from "react";
import { PropertiesTable } from "@/components/dashboard/PropertiesTable";

export const metadata = {
  title: "Properties | QletLettings",
  description: "View and manage all properties.",
};

export default function PropertiesPage() {
  return (
    <main className="flex-1 px-unit-4 md:px-unit-8 py-unit-6 flex flex-col gap-unit-6 max-w-[1680px] w-full mx-auto">
      <PropertiesTable />
    </main>
  );
}
