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
        anchor="bottom"
        className="w-52 origin-top rounded-md border bg-white p-1 text-sm transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0"
      >
        <MenuItem>
          <button className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-gray-100">
            এইসএসসি
          </button>
        </MenuItem>
        <MenuItem>
          <button className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-gray-100">
            দশম শ্রেণী
          </button>
        </MenuItem>
        <MenuItem>
          <button className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-gray-100">
            নবম শ্রেণী
          </button>
        </MenuItem>
        <MenuItem>
          <button className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-gray-100">
            অষ্টম শ্রেণী
          </button>
        </MenuItem>
        <MenuItem>
          <button className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-gray-100">
            সপ্তম শ্রেণী
          </button>
        </MenuItem>
        <MenuItem>
          <button className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-gray-100">
            ষষ্ঠ শ্রেণী
          </button>
        </MenuItem>
      </MenuItems>
    </Menu>
  );
}
