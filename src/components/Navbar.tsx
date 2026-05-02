import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img src="/SF-logo.png" alt="Salone Freelance Logo" className="h-10 w-auto mr-3" />
              <span className="text-xl font-bold text-gray-900 hidden sm:block">Salone Freelance</span>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link to="/jobs" className="text-gray-600 hover:text-primary-600 px-3 py-2 text-sm font-medium">Browse Jobs</Link>
              <Link to="/talent" className="text-gray-600 hover:text-primary-600 px-3 py-2 text-sm font-medium">Find Talent</Link>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition duration-150 ease-in-out"
                placeholder="Search jobs..."
              />
            </div>
            <Link to="/login" className="text-gray-600 hover:text-primary-600 px-3 py-2 text-sm font-medium">Log in</Link>
            <Link to="/signup" className="bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out">Sign up</Link>
          </div>

          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/jobs" className="block text-gray-600 hover:text-primary-600 px-3 py-2 text-base font-medium">Browse Jobs</Link>
            <Link to="/talent" className="block text-gray-600 hover:text-primary-600 px-3 py-2 text-base font-medium">Find Talent</Link>
            <Link to="/login" className="block text-gray-600 hover:text-primary-600 px-3 py-2 text-base font-medium">Log in</Link>
            <Link to="/signup" className="block bg-primary-600 text-white px-3 py-2 rounded-md text-base font-medium">Sign up</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
