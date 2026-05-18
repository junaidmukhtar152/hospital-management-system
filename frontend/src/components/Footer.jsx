import React from 'react';

const Footer = () => {
  // Logic: Correctly gets the current year
  const currentYear = new Date().getFullYear();

  return (
    // Updated: Changed color scheme to blue for background and gray-100 for text
    <footer className="bg-blue-600 text-gray-100 mt-12 shadow-lg">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Left: Copyright */}
        <p className="text-sm text-center md:text-left text-gray-200">
          &copy; {currentYear} EasyCare Hospital System. All rights reserved.
        </p>

        {/* Center: Links - Uses a slightly lighter text color for links for better readability */}
        <div className="flex flex-col sm:flex-row items-center gap-2 text-xs text-gray-200">
          <a href="/privacy" className="hover:text-white transition duration-200 ease-in-out px-2 py-1 rounded-sm">
            Privacy Policy
          </a>
          {/* Using a different color for the separator for visual distinction */}
          <span className="text-blue-300 hidden sm:inline">|</span>
          <a href="/terms" className="hover:text-white transition duration-200 ease-in-out px-2 py-1 rounded-sm">
            Terms of Service
          </a>
        </div>

        {/* Right: Optional simple social text - Uses an even lighter text for emphasis */}
        <div className="flex space-x-4 text-gray-100 text-xs mt-2 md:mt-0 items-center">
          <span className="text-gray-200">Follow us:</span>
          {/* Added font-medium for links and slightly increased space for better click targets */}
          <a href="#" className="hover:text-white hover:underline transition duration-200 ease-in-out font-medium">Facebook</a>
          <a href="#" className="hover:text-white hover:underline transition duration-200 ease-in-out font-medium">Twitter</a>
          <a href="#" className="hover:text-white hover:underline transition duration-200 ease-in-out font-medium">Instagram</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;