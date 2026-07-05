import Link from "next/link";
import React from "react";

type Crumb = {
  label: string;
  href?: string;
};

export default function AcademicBreadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <div className="wrapper flex flex-wrap items-center gap-2 py-3 text-sm md:text-base">
      {crumbs.map((crumb, index) => (
        <React.Fragment key={`${crumb.label}-${index}`}>
          {index > 0 ? <span>›</span> : null}
          {crumb.href ? (
            <Link href={crumb.href} className="text-primary hover:underline">
              {crumb.label}
            </Link>
          ) : (
            <span className="text-gray-700">{crumb.label}</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
