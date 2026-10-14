import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Zap, PenLine, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/AuthContext';
import { InteractiveNotebook } from './InteractiveNotebook';

export function NotebookHero() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handlePrimaryCTA = () => {
    if (isAuthenticated) {
      navigate('/notes/new');
    } else {
      navigate('/register');
    }
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-16 sm:pt-12 sm:pb-24 lg:pt-16 lg:pb-32 bg-[#F7F3EB]">
      {/* Background Decorative Paper Accent Gradients */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-96 h-96 bg-[#A6B49A]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-[#B96F52]/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[700px] h-64 bg-[#D4A373]/8 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Two-Column Grid: Left Content (40%) & Right Notebook (60%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column — Editorial Hero Content (~40% on desktop) */}
          <div className="lg:col-span-5 flex flex-col items-start text-left z-10">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EAE2D2] border border-[#DDD3C2] text-[#8A7967] text-[11px] sm:text-xs font-semibold tracking-widest uppercase mb-5 sm:mb-6">
              <Sparkles className="w-3.5 h-3.5 text-[#B96F52]" />
              <span>YOUR SPACE. YOUR THOUGHTS.</span>
            </div>

            {/* Headline in Elegant Editorial Serif */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.25rem] font-bold text-[#292821] tracking-tight leading-[1.12] mb-5 sm:mb-6">
              Every Thought Deserves a Page.
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-[#554A3E] leading-relaxed mb-8 max-w-lg font-sans">
              Capture ideas, organize your thoughts, and turn everyday notes into something meaningful. Your personal digital notebook, designed around the way you think.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mb-4">
              <Button
                size="lg"
                onClick={handlePrimaryCTA}
                className="bg-[#B96F52] hover:bg-[#A35D42] text-white shadow-lg shadow-[#B96F52]/25 font-semibold text-base px-6 h-12 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Create Your First Note</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-[#D8CEBD] text-[#4A3F33] hover:text-[#292821] hover:bg-[#EFE8D8] bg-transparent font-medium text-base h-12 px-5"
              >
                <a href="#features">Explore Features</a>
              </Button>
            </div>

            {/* Small Line Underneath */}
            <p className="text-xs sm:text-sm text-[#8A7967] font-serif italic mb-8 sm:mb-10 pl-1">
              One space for everything on your mind.
            </p>

            {/* Editorial Badges / Social Proof */}
            <div className="pt-6 border-t border-[#E8DEC8] w-full flex items-center justify-between sm:justify-start sm:gap-8 text-xs text-[#6B5E4F]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#A6B49A]" />
                <span className="font-medium">Sub-50ms Search</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#B96F52]" />
                <span className="font-medium">Tactile Interaction</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#D4A373]" />
                <span className="font-medium">Zero Distractions</span>
              </div>
            </div>
          </div>

          {/* Right Column — Realistic Open Notebook (~60% on desktop) */}
          <div className="lg:col-span-7 flex justify-center w-full">
            <InteractiveNotebook />
          </div>

        </div>
      </div>
    </section>
  );
}
