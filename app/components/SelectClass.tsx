import React from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { IoIosArrowDown } from "react-icons/io";

export default function SelectClass() {
  return (
    <Menu>
      <MenuButton className="w-[110px] flex items-center gap-1 outline-none">
        ক্লাস ৬-১২
        <IoIosArrowDown />
      </MenuButton>

      <MenuItems
        transition
        anchor="bottom start"
        className="w-52 z-[999] origin-top-left rounded-md border bg-white p-1 text-sm transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0"
      >
        <MenuItem>
          <button className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-gray-100">
            আলিম/HSC ১ম বর্ষ
          </button>
        </MenuItem>
        <MenuItem>
          <button className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-gray-100">
            আলিম/HSC ২য় বর্ষ
          </button>
        </MenuItem>
        <MenuItem>
          <button className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-gray-100">
            দাখিল/SSC ৯ম শ্রেণি
          </button>
        </MenuItem>
        <MenuItem>
          <button className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-gray-100">
            দাখিল/SSC ১০ম শ্রেণি
          </button>
        </MenuItem>
      </MenuItems>
    </Menu>
  );
}
