import React from "react";

export default function ConsultationForm() {
  return (
    <div className="w-full border border-primary bg-gray-100 mt-10 shadow-xl rounded-2xl p-10 space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800">
          Get Your Free Consultation
        </h2>
        <p className="text-gray-600 mt-2">
          Take the first step towards success. Schedule your free consultation
          today!
        </p>
      </div>
      <form className="space-y-4">
        <input
          type="text"
          placeholder="Your Name"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="email"
          placeholder="Your Email"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="tel"
          placeholder="Your Phone Number"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="w-full bg-primary text-white py-3 rounded-lg font-semibold transition duration-200"
        >
          Schedule Now
        </button>
      </form>
    </div>
  );
}
