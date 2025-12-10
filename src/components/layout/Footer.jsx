// layout/Footer.jsx
import React from "react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-4 md:px-6">
      <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-600">
        <div className="mb-2 md:mb-0">
          <p className="text-center md:text-left">
            © {currentYear} Bemsol Opex. All rights reserved.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <a
            href="#"
            className="hover:text-green-600 transition-colors"
          >
            Privacy Policy
          </a>
          <span className="text-gray-300">|</span>
          <a
            href="#"
            className="hover:text-green-600 transition-colors"
          >
            Terms of Service
          </a>
          <span className="text-gray-300">|</span>
          <a
            href="#"
            className="hover:text-green-600 transition-colors"
          >
            Support
          </a>
        </div>
      </div>
    </footer>
  );
};

