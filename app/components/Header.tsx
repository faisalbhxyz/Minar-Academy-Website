import React from "react";
import Menu from "./Menu";
import { BsFillTelephoneFill } from "react-icons/bs";
import SelectClass from "./SelectClass";

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white shadow">
      <div className="w-1/2 text-xl font-bold text-gray-800">Minar</div>
      <div className="w-1/2 items-center justify-center gap-5 hidden md:flex">
        <SelectClass />
        <Menu />
      </div>
      <div className="w-1/2 flex items-center justify-end gap-10">
        <button className="px-6 py-2 text-primary flex items-center gap-1">
          <BsFillTelephoneFill /> 16910
        </button>
        <button className="px-6 py-2 text-white bg-primary rounded">
          লগ-ইন
        </button>
      </div>
    </header>
  );
}
