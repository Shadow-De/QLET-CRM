"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PropertyForm } from "@/components/dashboard/PropertyForm";
import { propertiesApi } from "@/lib/api-client";

export default function EditPropertyPage() {
  const params = useParams();
  const id = params.id as string;
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      propertiesApi.get(id)
        .then((res: any) => {
          // res = { data: { property: {...} }, error: null }
          const prop = res?.data?.property ?? res?.data ?? res?.property ?? null;
          setProperty(prop);
          setLoading(false);
        })
        .catch((err: any) => {
          console.error("Failed to load property", err);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) {
    return <div className="p-8 text-outline">Loading property...</div>;
  }

  return (
    <div className="p-8">
      <PropertyForm property={property} />
    </div>
  );
}
