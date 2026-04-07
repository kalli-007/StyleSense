import React, { useState } from 'react';
import { Upload, Image as ImageIcon, Loader2, Wand2, X, Sparkles, ShoppingBag, ExternalLink, Tag, Palette, Layers } from 'lucide-react';
import { analyzeStyle, generateOutfitSketch, StyleAnalysis } from '../services/geminiService';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';

interface RelatedOutfitWithImage {
  title: string;
  description: string;
  prompt: string;
  shoppingLinks: { label: string; url: string }[];
  imageUrl?: string | null;
  isGenerating?: boolean;
}

export const StyleAnalyzer: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<StyleAnalysis | null>(null);
  const [recommendations, setRecommendations] = useState<RelatedOutfitWithImage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAnalysisResult(null);
        setRecommendations([]);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAnalysis = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    try {
      const base64 = image.split(',')[1];
      const result = await analyzeStyle(base64, 'image/jpeg');
      setAnalysisResult(result);
      const initialRecs = result.recommendations.map(o => ({ ...o }));
      setRecommendations(initialRecs);

      // Automatically visualize all recommendations
      initialRecs.forEach((_, index) => {
        visualizeOutfit(index, initialRecs);
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const visualizeOutfit = async (index: number, currentRecs?: RelatedOutfitWithImage[]) => {
    const list = currentRecs || recommendations;
    const outfit = list[index];
    if (outfit.imageUrl || outfit.isGenerating) return;

    setRecommendations(prev => prev.map((o, i) => i === index ? { ...o, isGenerating: true } : o));
    
    try {
      const imageUrl = await generateOutfitSketch(outfit.prompt);
      setRecommendations(prev => prev.map((o, i) => i === index ? { ...o, imageUrl, isGenerating: false } : o));
    } catch (error) {
      setRecommendations(prev => prev.map((o, i) => i === index ? { ...o, isGenerating: false } : o));
    }
  };

  return (
    <div className="glass-card rounded-3xl p-8 h-full flex flex-col overflow-y-auto">
      <div className="flex items-center gap-2 mb-6">
        <ImageIcon className="w-5 h-5 text-fashion-gold" />
        <h2 className="font-serif text-xl font-semibold">Style Intelligence</h2>
      </div>

      <div className="flex flex-col gap-8">
        {!image ? (
          <label className="aspect-video border-2 border-dashed border-zinc-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-fashion-gold hover:bg-fashion-gold/5 transition-all group">
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            <div className="p-4 bg-white rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6 text-fashion-black" />
            </div>
            <p className="text-sm font-medium">Upload outfit for computer vision analysis</p>
            <p className="text-xs text-zinc-400 mt-1">AI will extract color, pattern, and style features</p>
          </label>
        ) : (
          <div className="relative aspect-video rounded-2xl overflow-hidden group">
            <img src={image} alt="To analyze" className="w-full h-full object-cover" />
            <button 
              onClick={() => { setImage(null); setAnalysisResult(null); setRecommendations([]); }}
              className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-sm transition-colors"
            >
              <X size={18} />
            </button>
            {!analysisResult && !isAnalyzing && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={runAnalysis}
                  className="px-6 py-3 bg-white text-fashion-black rounded-full font-medium flex items-center gap-2 hover:bg-fashion-gold hover:text-white transition-all shadow-lg"
                >
                  <Wand2 size={18} />
                  Process Image
                </button>
              </div>
            )}
          </div>
        )}

        <AnimatePresence>
          {(isAnalyzing || analysisResult) && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="space-y-8"
            >
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 bg-white rounded-2xl border border-zinc-100">
                  <Loader2 className="w-8 h-8 animate-spin text-fashion-gold" />
                  <p className="text-sm font-medium text-zinc-500">Extracting features & generating recommendations...</p>
                </div>
              ) : (
                <>
                  {/* Extracted Features */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
                      <div className="flex items-center gap-2 text-fashion-gold mb-2">
                        <Palette size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Colors</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {analysisResult?.extractedFeatures.colors.map(c => (
                          <span key={c} className="px-2 py-0.5 bg-zinc-100 rounded text-[10px] font-medium">{c}</span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
                      <div className="flex items-center gap-2 text-fashion-gold mb-2">
                        <Layers size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Patterns</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {analysisResult?.extractedFeatures.patterns.map(p => (
                          <span key={p} className="px-2 py-0.5 bg-zinc-100 rounded text-[10px] font-medium">{p}</span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
                      <div className="flex items-center gap-2 text-fashion-gold mb-2">
                        <Tag size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Style</span>
                      </div>
                      <span className="text-[10px] font-medium">{analysisResult?.extractedFeatures.style}</span>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
                      <div className="flex items-center gap-2 text-fashion-gold mb-2">
                        <Sparkles size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Occasion</span>
                      </div>
                      <span className="text-[10px] font-medium">{analysisResult?.extractedFeatures.occasion}</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-8 border border-zinc-100 shadow-sm">
                    <h3 className="font-serif text-lg font-bold mb-4 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-fashion-gold" />
                      Styling Analysis
                    </h3>
                    <div className="markdown-body text-sm">
                      <Markdown>{analysisResult?.analysis || ''}</Markdown>
                    </div>
                  </div>

                  {recommendations.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-serif text-lg font-bold flex items-center gap-2 px-2">
                        <ShoppingBag className="w-4 h-4 text-fashion-gold" />
                        AI Recommendations
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {recommendations.map((outfit, i) => (
                          <motion.div 
                            key={i}
                            whileHover={{ y: -5 }}
                            className="bg-white rounded-2xl overflow-hidden border border-zinc-100 shadow-sm flex flex-col"
                          >
                            <div className="aspect-[3/4] bg-fashion-cream/30 relative overflow-hidden group">
                              {outfit.imageUrl ? (
                                <img src={outfit.imageUrl} alt={outfit.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                                  {outfit.isGenerating ? (
                                    <Loader2 className="w-6 h-6 animate-spin text-fashion-gold" />
                                  ) : (
                                    <>
                                      <ImageIcon className="w-8 h-8 text-zinc-200 mb-2" />
                                      <button 
                                        onClick={() => visualizeOutfit(i)}
                                        className="text-xs font-bold text-fashion-gold uppercase tracking-wider hover:underline"
                                      >
                                        Generate Outfit Idea
                                      </button>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                              <h4 className="font-bold text-sm mb-1">{outfit.title}</h4>
                              <p className="text-xs text-zinc-500 line-clamp-2 mb-4">{outfit.description}</p>
                              
                              <div className="mt-auto space-y-2">
                                {outfit.shoppingLinks.map((link, j) => (
                                  <a 
                                    key={j}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between w-full px-3 py-2 bg-fashion-cream/50 hover:bg-fashion-gold/10 rounded-lg text-[10px] font-bold uppercase tracking-wider text-fashion-black transition-colors group/link"
                                  >
                                    {link.label}
                                    <ExternalLink size={12} className="text-zinc-400 group-hover/link:text-fashion-gold" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
