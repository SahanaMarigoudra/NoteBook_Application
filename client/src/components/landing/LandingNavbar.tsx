import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, PenTool, LayoutDashboard, Menu, X, ArrowRight } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { Button } from '@/components/ui/button';

export function LandingNavbar() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStartWriting = () => {
    if (isAuthenticated) {
      navigate('/notes/new');
    } else {
      navigate('/register');
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-[#F7F3EB]/95 backdrop-blur-md border-b border-[#E8DEC8] shadow-xs'
          : 'bg-[#F7F3EB] border-b border-[#E8DEC8]/60'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group transition-transform duration-150 hover:scale-[1.01]"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3D2C20] to-[#251A13] flex items-center justify-center text-[#F7F3EB] shadow-md shadow-[#3D2C20]/20 border border-[#5A4333]/40">
              <BookOpen className="w-5 h-5 text-[#D4A373] transition-transform duration-300 group-hover:rotate-[-6deg]" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl font-bold tracking-tight text-[#292821]">
                NoteSpace
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#8A7967] -mt-1 font-sans font-medium">
                Digital Notebook
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#554A3E]">
            <a
              href="#"
              className="hover:text-[#B96F52] transition-colors duration-150 py-1"
            >
              Home
            </a>
            <a
              href="#features"
              className="hover:text-[#B96F52] transition-colors duration-150 py-1"
            >
              Features
            </a>
            <a
              href="#templates"
              className="hover:text-[#B96F52] transition-colors duration-150 py-1"
            >
              Templates
            </a>
            <a
              href="#philosophy"
              className="hover:text-[#B96F52] transition-colors duration-150 py-1"
            >
              Philosophy
            </a>
          </nav>

          {/* Right Action CTA Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-[#554A3E] hover:text-[#292821] hover:bg-[#EFE8D8]"
                >
                  <Link to="/dashboard" className="flex items-center gap-1.5 font-medium">
                    <LayoutDashboard className="w-4 h-4 text-[#8A7967]" />
                    <span>My Dashboard</span>
                  </Link>
                </Button>
                <Button
                  size="sm"
                  onClick={handleStartWriting}
                  className="bg-[#B96F52] hover:bg-[#A35D42] text-white shadow-sm shadow-[#B96F52]/20 font-medium px-4"
                >
                  <PenTool className="w-3.5 h-3.5 mr-1.5" />
                  <span>Start Writing</span>
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-[#554A3E] hover:text-[#292821] hover:bg-[#EFE8D8] font-medium"
                >
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button
                  size="sm"
                  onClick={handleStartWriting}
                  className="bg-[#B96F52] hover:bg-[#A35D42] text-white shadow-sm shadow-[#B96F52]/20 font-medium px-4"
                >
                  <PenTool className="w-3.5 h-3.5 mr-1.5" />
                  <span>Start Writing</span>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#554A3E] hover:bg-[#EFE8D8] focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#E8DEC8] space-y-3 bg-[#F7F3EB]">
            <a
              href="#"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-[#292821] hover:bg-[#EFE8D8] rounded-md"
            >
              Home
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-[#292821] hover:bg-[#EFE8D8] rounded-md"
            >
              Features
            </a>
            <a
              href="#templates"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-[#292821] hover:bg-[#EFE8D8] rounded-md"
            >
              Templates
            </a>
            <a
              href="#philosophy"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-[#292821] hover:bg-[#EFE8D8] rounded-md"
            >
              Philosophy
            </a>
            <div className="pt-3 border-t border-[#E8DEC8] flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <Button
                    variant="outline"
                    asChild
                    className="w-full justify-center border-[#DDD3C2]"
                  >
                    <Link to="/dashboard">Go to Dashboard</Link>
                  </Button>
                  <Button
                    onClick={handleStartWriting}
                    className="w-full justify-center bg-[#B96F52] hover:bg-[#A35D42] text-white"
                  >
                    <PenTool className="w-4 h-4 mr-2" />
                    <span>Start Writing</span>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    asChild
                    className="w-full justify-center border-[#DDD3C2]"
                  >
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button
                    onClick={handleStartWriting}
                    className="w-full justify-center bg-[#B96F52] hover:bg-[#A35D42] text-white"
                  >
                    <PenTool className="w-4 h-4 mr-2" />
                    <span>Start Writing</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
