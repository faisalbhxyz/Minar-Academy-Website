import React from "react";
import ResourceCard from "./ResourceCard";
import { resources } from "@/lib/constants";

export default function Page() {
  const academic = resources.filter((item) => item.tag === "academic");

  return (
    <>
      <ResourceCard
        title="একাডেমিক পড়াশোনার সবকিছু"
        items={academic}
        link="/resource/academic"
      />
    </>
  );
}
