import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, Search, User, LogOut, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import LoginModal from '../auth/LoginModal';
import RegisterModal from '../auth/RegisterModal';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // Refs for click outside detection
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  // Debounce search to prevent rapid API calls
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  
  const { user, isAuthenticated, isAdmin, isStaff, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMenuOpen(false);
    setIsSearchOpen(false);
    setActiveDropdown(null);
    setIsUserMenuOpen(false);
    
    // Clear any pending search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (searchQuery.trim()) {
      // Debounce search navigation
      searchTimeoutRef.current = setTimeout(() => {
        navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
        setSearchQuery('');
        setIsSearchOpen(false);
      }, 300);
    }
  };

  // Cleanup search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleDropdownItemClick = () => {
    setActiveDropdown(null);
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const switchToRegister = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(true);
  };

  const switchToLogin = () => {
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
  };

  const isActive = (path: string) => {
    if (path === '/shop') {
      const category = new URLSearchParams(location.search).get('category');
      return location.pathname === path && !category;
    }
    return location.pathname === path;
  };

  const isCategoryActive = (category: string) => {
    const urlCategory = new URLSearchParams(location.search).get('category');
    return urlCategory === category;
  };

  const menuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.3, ease: "easeInOut" }
    },
    open: {
      opacity: 1,
      height: "auto",
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  };

  const dropdownVariants = {
    closed: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: { duration: 0.2, ease: "easeInOut" }
    },
    open: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.2, ease: "easeInOut" }
    }
  };

  // If user is admin/staff and on admin dashboard, show minimal header
  if ((isAdmin || isStaff) && location.pathname === '/admin') {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md py-2">
        <div className="container-custom">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-serif font-semibold text-gold-500">
                FK Designers
              </span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className="flex items-center text-sm text-gray-600 hover:text-gold-600 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Store
              </Link>
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gold-600"
                >
                  <User className="h-5 w-5" />
                  <span className="text-sm hidden sm:inline">{user?.first_name}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial="closed"
                      animate="open"
                      exit="closed"
                      variants={dropdownVariants}
                      className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md overflow-hidden z-20"
                    >
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
        }`}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center z-50 relative">
              <span className={`text-xl font-serif font-semibold transition-colors ${
                isScrolled ? 'text-gold-500' : 'text-gold-400'
              }`}>
                FK Designers
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8" ref={dropdownRef}>
              <Link to="/" className={`nav-link ${isActive('/') ? 'nav-link-active' : ''} text-black`}>
                Home
              </Link>
              
              <div className="relative group">
                <button 
                  className={`nav-link flex items-center ${isCategoryActive('men') ? 'nav-link-active' : ''} text-black`}
                  onClick={() => toggleDropdown('men')}
                >
                  Men's <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                
                <AnimatePresence>
                  {activeDropdown === 'men' && (
                    <motion.div
                      initial="closed"
                      animate="open"
                      exit="closed"
                      variants={dropdownVariants}
                      className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md overflow-hidden z-20"
                    >
                      <Link to="/shop?category=men&subcategory=ethnic" className="filter-option" onClick={handleDropdownItemClick}>Ethnic Wear</Link>
                      <Link to="/shop?category=men&subcategory=suits" className="filter-option" onClick={handleDropdownItemClick}>Suits</Link>
                      <Link to="/shop?category=men&subcategory=kurta" className="filter-option" onClick={handleDropdownItemClick}>Kurta Sets</Link>
                      <Link to="/shop?category=men&subcategory=sherwani" className="filter-option" onClick={handleDropdownItemClick}>Sherwani</Link>
                      <Link to="/shop?category=men&subcategory=jackets" className="filter-option" onClick={handleDropdownItemClick}>Sadri & Waistcoat</Link>
                      <Link to="/shop?category=men&subcategory=pathani" className="filter-option" onClick={handleDropdownItemClick}>Pathani</Link>
                      <Link to="/shop?category=men" className="filter-option text-gold-600 font-medium" onClick={handleDropdownItemClick}>View All Men's</Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="relative group">
                <button 
                  className={`nav-link flex items-center ${isCategoryActive('kids') ? 'nav-link-active' : ''} text-black`}
                  onClick={() => toggleDropdown('kids')}
                >
                  Kid's <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                
                <AnimatePresence>
                  {activeDropdown === 'kids' && (
                    <motion.div
                      initial="closed"
                      animate="open"
                      exit="closed"
                      variants={dropdownVariants}
                      className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md overflow-hidden z-20"
                    >
                      <Link to="/shop?category=kids&subcategory=ethnic" className="filter-option" onClick={handleDropdownItemClick}>Ethnic Wear</Link>
                      <Link to="/shop?category=kids&subcategory=suits" className="filter-option" onClick={handleDropdownItemClick}>Suits</Link>
                      <Link to="/shop?category=kids&subcategory=kurta" className="filter-option" onClick={handleDropdownItemClick}>Kurta Sets</Link>
                      <Link to="/shop?category=kids&subcategory=sherwani" className="filter-option" onClick={handleDropdownItemClick}>Sherwani</Link>
                      <Link to="/shop?category=kids&subcategory=jackets" className="filter-option" onClick={handleDropdownItemClick}>Sadri & Waistcoat</Link>
                      <Link to="/shop?category=kids&subcategory=pathani" className="filter-option" onClick={handleDropdownItemClick}>Pathani</Link>
                      <Link to="/shop?category=kids" className="filter-option text-gold-600 font-medium" onClick={handleDropdownItemClick}>View All Kid's</Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link 
                to="/shop?category=fabric" 
                className={`nav-link ${isCategoryActive('fabric') ? 'nav-link-active' : ''} text-black`}
              >
                Fabrics
              </Link>
              
              <Link to="/customization" className={`nav-link ${isActive('/customization') ? 'nav-link-active' : ''} text-black`}>
                Customization
              </Link>
              
              <Link to="/about" className={`nav-link ${isActive('/about') ? 'nav-link-active' : ''} text-black`}>
                About Us
              </Link>
              
              <Link to="/contact" className={`nav-link ${isActive('/contact') ? 'nav-link-active' : ''} text-black`}>
                Contact
              </Link>
            </nav>

            {/* Action Icons */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="relative" ref={searchRef}>
                <button 
                  className="nav-link text-black"
                  aria-label="Search"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                >
                  <Search className="h-5 w-5" />
                </button>
                
                <AnimatePresence>
                  {isSearchOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-md p-4 z-20"
                    >
                      <form onSubmit={handleSearch}>
                        <div className="flex">
                          <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-gold-500 focus:border-gold-500"
                            autoFocus
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 bg-gold-500 text-white rounded-r-md hover:bg-gold-600 transition-colors"
                          >
                            <Search className="h-4 w-4" />
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 nav-link text-black"
                  >
                    <User className="h-5 w-5" />
                    <span className="text-sm">{user?.first_name}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={dropdownVariants}
                        className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md overflow-hidden z-20"
                      >
                        {(isAdmin || isStaff) && (
                          <Link
                            to="/admin"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            Admin Dashboard
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="nav-link flex items-center text-black"
                >
                  <User className="h-5 w-5 mr-1" />
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden flex items-center focus:outline-none z-50 relative text-black"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
              className="lg:hidden bg-white shadow-lg overflow-hidden"
            >
              <div className="container-custom py-4 max-h-screen overflow-y-auto">
                <div className="flex flex-col space-y-4">
                  <Link to="/" className="py-3 text-lg font-medium border-b border-gray-100">Home</Link>
                  
                  <div className="border-b border-gray-100 pb-2">
                    <button 
                      className="flex items-center justify-between w-full py-3 text-lg font-medium"
                      onClick={() => toggleDropdown('mobile-men')}
                    >
                      Men's
                      <ChevronDown className={`h-5 w-5 transition-transform ${activeDropdown === 'mobile-men' ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {activeDropdown === 'mobile-men' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="pl-4 py-2 space-y-3 overflow-hidden"
                        >
                          <Link to="/shop?category=men&subcategory=ethnic" className="block py-2 text-gray-600">Ethnic Wear</Link>
                          <Link to="/shop?category=men&subcategory=suits" className="block py-2 text-gray-600">Suits</Link>
                          <Link to="/shop?category=men&subcategory=kurta" className="block py-2 text-gray-600">Kurta Sets</Link>
                          <Link to="/shop?category=men&subcategory=sherwani" className="block py-2 text-gray-600">Sherwani</Link>
                          <Link to="/shop?category=men&subcategory=jackets" className="block py-2 text-gray-600">Sadri & Waistcoat</Link>
                          <Link to="/shop?category=men&subcategory=pathani" className="block py-2 text-gray-600">Pathani</Link>
                          <Link to="/shop?category=men" className="block py-2 text-gold-600 font-medium">View All Men's</Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <div className="border-b border-gray-100 pb-2">
                    <button 
                      className="flex items-center justify-between w-full py-3 text-lg font-medium"
                      onClick={() => toggleDropdown('mobile-kids')}
                    >
                      Kid's
                      <ChevronDown className={`h-5 w-5 transition-transform ${activeDropdown === 'mobile-kids' ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {activeDropdown === 'mobile-kids' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="pl-4 py-2 space-y-3 overflow-hidden"
                        >
                          <Link to="/shop?category=kids&subcategory=ethnic" className="block py-2 text-gray-600">Ethnic Wear</Link>
                          <Link to="/shop?category=kids&subcategory=suits" className="block py-2 text-gray-600">Suits</Link>
                          <Link to="/shop?category=kids&subcategory=kurta" className="block py-2 text-gray-600">Kurta Sets</Link>
                          <Link to="/shop?category=kids&subcategory=sherwani" className="block py-2 text-gray-600">Sherwani</Link>
                          <Link to="/shop?category=kids&subcategory=jackets" className="block py-2 text-gray-600">Sadri & Waistcoat</Link>
                          <Link to="/shop?category=kids&subcategory=pathani" className="block py-2 text-gray-600">Pathani</Link>
                          <Link to="/shop?category=kids" className="block py-2 text-gold-600 font-medium">View All Kid's</Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <Link to="/shop?category=fabric" className="border-b border-gray-100 py-3 text-lg font-medium">Fabrics</Link>
                  <Link to="/customization" className="border-b border-gray-100 py-3 text-lg font-medium">Customization</Link>
                  <Link to="/about" className="border-b border-gray-100 py-3 text-lg font-medium">About Us</Link>
                  <Link to="/contact" className="border-b border-gray-100 py-3 text-lg font-medium">Contact</Link>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <form onSubmit={handleSearch} className="flex mb-4">
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-gold-500 focus:border-gold-500"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-gold-500 text-white rounded-r-md hover:bg-gold-600 transition-colors"
                      >
                        <Search className="h-4 w-4" />
                      </button>
                    </form>
                    
                    {isAuthenticated ? (
                      <div className="space-y-3">
                        <div className="text-sm text-gray-600">
                          Welcome, {user?.first_name}!
                        </div>
                        {(isAdmin || isStaff) && (
                          <Link
                            to="/admin"
                            className="block py-2 text-gold-600 font-medium"
                          >
                            Admin Dashboard
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="flex items-center py-2 text-gray-700 w-full text-left"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsLoginOpen(true)}
                        className="flex items-center py-2 text-gold-600 font-medium"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Sign In
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Auth Modals */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)}
        onSwitchToRegister={switchToRegister}
      />
      <RegisterModal 
        isOpen={isRegisterOpen} 
        onClose={() => setIsRegisterOpen(false)}
        onSwitchToLogin={switchToLogin}
      />
    </>
  );
};

export default Header;