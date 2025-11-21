import React from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { cn } from "@/lib/cn";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  className,
}: ModalProps) {
  return (
    <Dialog open={isOpen} as="div" className="relative z-50" onClose={onClose}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className={cn(
              "w-full max-w-xl rounded-xl bg-white p-6 backdrop-blur-2xl duration-200 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0 relative",
              className
            )}
          >
            {/* Close X Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-200 text-gray-500 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {children}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
