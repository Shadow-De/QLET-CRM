"use client";

import React, { useState } from "react";
import { LeadsPageHeader } from "@/components/dashboard/LeadsPageHeader";
import { LeadsBoard } from "@/components/dashboard/LeadsBoard";

export default function LeadsPage() {
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("All");
  const [budget, setBudget] = useState("All");
  const [moveIn, setMoveIn] = useState("All");

  const clearFilters = () => {
    setSearch("");
    setRegion("All");
    setBudget("All");
    setMoveIn("All");
  };

  const hasActiveFilters = search.trim() !== "" || region !== "All" || budget !== "All" || moveIn !== "All";

  return (
    <main className="flex-1 px-unit-4 md:px-unit-8 py-unit-6 flex flex-col gap-unit-6 max-w-[1680px] w-full mx-auto">
      <LeadsPageHeader 
        search={search}
        onSearchChange={setSearch}
        region={region}
        onRegionChange={setRegion}
        budget={budget}
        onBudgetChange={setBudget}
        moveIn={moveIn}
        onMoveInChange={setMoveIn}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <LeadsBoard 
        search={search}
        region={region}
        budget={budget}
        moveIn={moveIn}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />
    </main>
  );
}
