'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FaPhoneAlt, FaWhatsapp, FaCommentDots, FaTimes, FaFacebookMessenger } from 'react-icons/fa';

const ContactFloatingButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center space-y-3">
      {isOpen && (
        <>
          <Link
            href="tel:+8801886929763"
            className="bg-green-500 hover:bg-green-600 p-4 rounded-full text-white shadow-md transition"
          >
            <FaPhoneAlt />
          </Link>
          <Link
            href="https://wa.me/+8801886929763"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-400 hover:bg-green-500 p-4 rounded-full text-white shadow-md transition"
          >
            <FaWhatsapp />
          </Link>
          <Link
            href="https://m.me/61574272148754"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-400 hover:bg-green-500 p-4 rounded-full text-white shadow-md transition"
          >
            <FaFacebookMessenger />
          </Link>
        </>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-full text-white shadow-md transition ${
          isOpen ? 'bg-green-300 hover:bg-green-400' : 'bg-green-500 hover:bg-green-600'
        }`}
      >
        {isOpen ? <FaTimes /> : <FaCommentDots />}
      </button>
    </div>
  );
};

export default ContactFloatingButton;
