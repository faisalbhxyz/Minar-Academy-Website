import Link from "next/link";
import React from "react";
import { GoDotFill } from "react-icons/go";

import { fetchAcademicNoteClasses } from "@/lib/academicNotes";
import { toBnNumber } from "@/lib/helpers";

export const revalidate = 300;

export default async function ResourcePage() {
  const classes = await fetchAcademicNoteClasses();

  return (
    <div className="wrapper py-10 first:mt-10">
      <h1 className="text-2xl md:text-3xl font-semibold mb-8">
        একাডেমিক পড়াশোনার সবকিছু
      </h1>

      {classes.length === 0 ? (
        <p className="text-gray-500 py-10 text-center">
          এই মুহূর্তে কোনো লেকচার শীট পাওয়া যায়নি।
        </p>
      ) : (
        <div className="grid lg:grid-cols-3 gap-5">
          {classes.map((item) => (
            <Link
              key={item.id}
              href={`/resource/academic/${item.slug}`}
              className="flex items-center gap-5 border hover:border-primary p-5 rounded-lg transition-colors"
            >
              <div
                className="size-16 shrink-0 rounded-full flex items-center justify-center text-white text-lg font-semibold"
                style={{ backgroundColor: item.icon_color }}
              >
                {item.icon_label}
              </div>
              <div>
                <p className="text-xl font-semibold">{item.title}</p>
                <div className="flex items-center gap-2 text-gray-500">
                  <GoDotFill size={10} />
                  <p className="text-sm">
                    {toBnNumber(item.note_count)} টি লেকচার শীট [PDF Download]
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
