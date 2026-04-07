import React, { useState } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { StyleAnalyzer } from './components/StyleAnalyzer';
import { Visualizer } from './components/Visualizer';
import { 
  Sparkles, 
  MessageSquare, 
  Camera, 
  Palette, 
  Menu, 
  X,
  Instagram,
  Twitter,
  Facebook
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

type Tab = 'consultant' | 'analyzer' | 'visualizer';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('consultant');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const tabs = [
    { id: 'consultant', label: 'Consultant', icon: MessageSquare },
    { id: 'analyzer', label: 'Analyzer', icon: Camera },
    { id: 'visualizer', label: 'Visualizer', icon: Palette },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 fashion-gradient rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="text-fashion-gold w-6 h-6" />
              </div>
              <h1 className="text-2xl font-serif font-bold tracking-tighter text-fashion-black">
                Style<span className="text-fashion-gold italic">Sense</span>
              </h1>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-all relative py-2",
                    activeTab === tab.id ? "text-fashion-black" : "text-zinc-400 hover:text-fashion-black"
                  )}
                >
                  <tab.icon size={18} />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-fashion-gold"
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-white border-b border-zinc-100 p-4 space-y-2 shadow-xl"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as Tab); setIsMenuOpen(false); }}
                className={cn(
                  "w-full flex items-center gap-3 p-4 rounded-xl text-sm font-medium",
                  activeTab === tab.id ? "bg-fashion-cream text-fashion-black" : "text-zinc-500"
                )}
              >
                <tab.icon size={20} />
                {tab.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Hero & Info */}
          <div className="lg:col-span-4 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 bg-fashion-gold/10 text-fashion-gold text-xs font-bold rounded-full uppercase tracking-widest mb-4">
                AI-Powered Fashion
              </span>
              <h2 className="text-5xl font-serif font-bold leading-tight text-fashion-black mb-6">
                Elevate Your <br />
                <span className="italic text-fashion-gold">Personal Style</span>
              </h2>
              <p className="text-zinc-500 leading-relaxed">
                Experience the future of fashion with StyleSense. Our generative AI analyzes your preferences, 
                visualizes your ideas, and provides expert styling advice to help you look your absolute best for any occasion.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-white rounded-2xl border border-zinc-100 shadow-sm">
                <h3 className="text-2xl font-serif font-bold text-fashion-black">50k+</h3>
                <p className="text-xs text-zinc-400 mt-1">Style Combinations</p>
              </div>
              <div className="p-6 bg-white rounded-2xl border border-zinc-100 shadow-sm">
                <h3 className="text-2xl font-serif font-bold text-fashion-black">24/7</h3>
                <p className="text-xs text-zinc-400 mt-1">AI Consultation</p>
              </div>
            </div>

            <div className="pt-8 border-t border-zinc-100">
              <p className="text-xs font-bold text-fashion-black uppercase tracking-widest mb-4">Trending Now</p>
              <div className="flex flex-wrap gap-2">
                {['Quiet Luxury', 'Cyberpunk', 'Vintage 90s', 'Eco-Chic', 'Minimalist'].map(tag => (
                  <span key={tag} className="px-3 py-1 bg-white border border-zinc-100 rounded-full text-xs text-zinc-500 hover:border-fashion-gold hover:text-fashion-gold cursor-pointer transition-colors">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Components */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {activeTab === 'consultant' && (
                <motion.div
                  key="consultant"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="h-full"
                >
                  <ChatInterface />
                </motion.div>
              )}
              {activeTab === 'analyzer' && (
                <motion.div
                  key="analyzer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="h-full"
                >
                  <StyleAnalyzer />
                </motion.div>
              )}
              {activeTab === 'visualizer' && (
                <motion.div
                  key="visualizer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="h-full"
                >
                  <Visualizer />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-fashion-black text-white py-16 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="text-fashion-gold w-6 h-6" />
                <h2 className="text-2xl font-serif font-bold tracking-tighter">
                  Style<span className="text-fashion-gold italic">Sense</span>
                </h2>
              </div>
              <p className="text-zinc-400 max-w-md leading-relaxed">
                StyleSense is your personal AI fashion companion, dedicated to making high-end styling accessible to everyone. 
                Powered by advanced generative models to redefine your wardrobe.
              </p>
              <div className="flex gap-4 mt-8">
                <button className="p-2 bg-zinc-800 rounded-full hover:bg-fashion-gold transition-colors">
                  <Instagram size={20} />
                </button>
                <button className="p-2 bg-zinc-800 rounded-full hover:bg-fashion-gold transition-colors">
                  <Twitter size={20} />
                </button>
                <button className="p-2 bg-zinc-800 rounded-full hover:bg-fashion-gold transition-colors">
                  <Facebook size={20} />
                </button>
              </div>
            </div>
            
            <div>
              <h4 className="font-serif text-lg font-bold mb-6">Features</h4>
              <ul className="space-y-4 text-zinc-400 text-sm">
                <li><button onClick={() => setActiveTab('consultant')} className="hover:text-fashion-gold transition-colors">Style Consultant</button></li>
                <li><button onClick={() => setActiveTab('analyzer')} className="hover:text-fashion-gold transition-colors">Outfit Analyzer</button></li>
                <li><button onClick={() => setActiveTab('visualizer')} className="hover:text-fashion-gold transition-colors">Visualizer</button></li>
                <li><button className="hover:text-fashion-gold transition-colors">Trend Reports</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-serif text-lg font-bold mb-6">Company</h4>
              <ul className="space-y-4 text-zinc-400 text-sm">
                <li><button className="hover:text-fashion-gold transition-colors">About Us</button></li>
                <li><button className="hover:text-fashion-gold transition-colors">Privacy Policy</button></li>
                <li><button className="hover:text-fashion-gold transition-colors">Terms of Service</button></li>
                <li><button className="hover:text-fashion-gold transition-colors">Contact</button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-zinc-800 mt-16 pt-8 text-center text-zinc-500 text-xs">
            <p>© 2026 StyleSense AI. All rights reserved. Designed for the modern wardrobe.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
