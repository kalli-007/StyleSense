import React, { useState } from 'react';
import { Wand2, Loader2, Download, Sparkles, RefreshCw } from 'lucide-react';
import { generateOutfitSketch } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';

export const Visualizer: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const surprisePrompts = [
    "A futuristic cyberpunk evening gown in neon violet and chrome",
    "A 1920s Gatsby-inspired flapper dress with modern sustainable fabrics",
    "A high-fashion streetwear look featuring oversized puffer jackets and metallic boots",
    "An elegant bohemian wedding dress with intricate 3D floral lace",
    "A minimalist architectural suit in charcoal wool with asymmetrical tailoring",
    "A vibrant avant-garde outfit inspired by tropical birds and exotic flowers"
  ];

  const handleSurprise = () => {
    const randomPrompt = surprisePrompts[Math.floor(Math.random() * surprisePrompts.length)];
    setPrompt(randomPrompt);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      const result = await generateOutfitSketch(prompt);
      setGeneratedImage(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="glass-card rounded-3xl p-8 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-fashion-gold" />
        <h2 className="font-serif text-xl font-semibold">Outfit Visualizer</h2>
      </div>

      <div className="flex flex-col gap-6 flex-1">
        <div className="relative">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Describe your vision</label>
            <button 
              onClick={handleSurprise}
              className="text-[10px] font-bold text-fashion-gold uppercase tracking-widest hover:underline flex items-center gap-1"
            >
              <RefreshCw size={10} />
              Surprise Me
            </button>
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your dream outfit (e.g., 'A futuristic cyberpunk evening gown in neon violet and chrome')..."
            className="w-full p-4 bg-fashion-cream/50 border-none rounded-2xl focus:ring-2 focus:ring-fashion-gold transition-all text-sm min-h-[100px] resize-none"
          />
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="absolute bottom-4 right-4 px-6 py-2 bg-fashion-black text-white rounded-full font-medium flex items-center gap-2 hover:bg-zinc-800 disabled:opacity-50 transition-all shadow-lg"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 size={18} />}
            {isGenerating ? 'Designing...' : 'Generate'}
          </button>
        </div>

        <div className="flex-1 rounded-2xl border-2 border-dashed border-zinc-100 bg-fashion-cream/20 overflow-hidden relative min-h-[300px]">
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center"
              >
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-fashion-gold/20 border-t-fashion-gold rounded-full animate-spin" />
                  <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-fashion-gold animate-pulse" />
                </div>
                <div>
                  <p className="font-serif text-lg font-medium">Creating your vision</p>
                  <p className="text-xs text-zinc-400 mt-1">Our AI is sketching your personalized fashion concept...</p>
                </div>
              </motion.div>
            ) : generatedImage ? (
              <motion.div 
                key="image"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full w-full group"
              >
                <img src={generatedImage} alt="Generated outfit" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button 
                    onClick={() => setGeneratedImage(null)}
                    className="p-3 bg-white text-fashion-black rounded-full hover:bg-fashion-gold hover:text-white transition-all shadow-xl"
                  >
                    <RefreshCw size={20} />
                  </button>
                  <a 
                    href={generatedImage} 
                    download="stylesense-outfit.png"
                    className="p-3 bg-white text-fashion-black rounded-full hover:bg-fashion-gold hover:text-white transition-all shadow-xl"
                  >
                    <Download size={20} />
                  </a>
                </div>
              </motion.div>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center text-zinc-300 p-8 text-center">
                <Wand2 size={48} className="mb-4 opacity-20" />
                <p className="text-sm font-medium">Your fashion sketch will appear here</p>
                <p className="text-xs mt-1">Describe an outfit to start visualizing</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
