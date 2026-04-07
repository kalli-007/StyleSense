import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Sparkles, Loader2, ShoppingBag, ExternalLink, Image as ImageIcon } from 'lucide-react';
import Markdown from 'react-markdown';
import { getFashionAdvice, generateOutfitSketch } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface Recommendation {
  title: string;
  description: string;
  prompt: string;
  shoppingLinks: { label: string; url: string }[];
  imageUrl?: string | null;
  isGenerating?: boolean;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  recommendations?: Recommendation[];
}

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm your StyleSense consultant. How can I help you elevate your look today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const response = await getFashionAdvice(userMsg);
      const newMsg: Message = { 
        role: 'assistant', 
        content: response.advice,
        recommendations: response.recommendations
      };
      
      setMessages(prev => {
        const updated = [...prev, newMsg];
        const msgIndex = updated.length - 1;
        
        // Automatically visualize all recommendations for this message
        if (newMsg.recommendations) {
          newMsg.recommendations.forEach((_, recIndex) => {
            visualizeRecommendation(msgIndex, recIndex, updated);
          });
        }
        
        return updated;
      });
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an error while styling. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const visualizeRecommendation = async (msgIndex: number, recIndex: number, currentMessages?: Message[]) => {
    const list = currentMessages || messages;
    const msg = list[msgIndex];
    if (!msg.recommendations) return;
    const rec = msg.recommendations[recIndex];
    if (rec.imageUrl || rec.isGenerating) return;

    setMessages(prev => prev.map((m, i) => {
      if (i === msgIndex && m.recommendations) {
        return {
          ...m,
          recommendations: m.recommendations.map((r, j) => 
            j === recIndex ? { ...r, isGenerating: true } : r
          )
        };
      }
      return m;
    }));

    try {
      const imageUrl = await generateOutfitSketch(rec.prompt);
      setMessages(prev => prev.map((m, i) => {
        if (i === msgIndex && m.recommendations) {
          return {
            ...m,
            recommendations: m.recommendations.map((r, j) => 
              j === recIndex ? { ...r, imageUrl, isGenerating: false } : r
            )
          };
        }
        return m;
      }));
    } catch (error) {
      setMessages(prev => prev.map((m, i) => {
        if (i === msgIndex && m.recommendations) {
          return {
            ...m,
            recommendations: m.recommendations.map((r, j) => 
              j === recIndex ? { ...r, isGenerating: false } : r
            )
          };
        }
        return m;
      }));
    }
  };

  return (
    <div className="flex flex-col h-[600px] glass-card rounded-3xl overflow-hidden">
      <div className="p-4 border-b border-zinc-100 flex items-center gap-2 bg-white">
        <Sparkles className="w-5 h-5 text-fashion-gold" />
        <h2 className="font-serif text-lg font-semibold">Style Consultant</h2>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-fashion-cream/30">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex flex-col gap-3 max-w-[90%]",
                msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              <div className={cn(
                "flex gap-3",
                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                  msg.role === 'user' ? "bg-fashion-gold text-white" : "bg-fashion-black text-white"
                )}>
                  {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
                </div>
                <div className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                  msg.role === 'user' 
                    ? "bg-fashion-black text-white rounded-tr-none" 
                    : "bg-white text-fashion-black rounded-tl-none border border-zinc-100"
                )}>
                  <div className="markdown-body">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                </div>
              </div>

              {msg.recommendations && msg.recommendations.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-2 pl-11">
                  {msg.recommendations.map((rec, j) => (
                    <motion.div 
                      key={j}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white rounded-xl overflow-hidden border border-zinc-100 shadow-sm flex flex-col"
                    >
                      <div className="aspect-square bg-fashion-cream/30 relative group">
                        {rec.imageUrl ? (
                          <img src={rec.imageUrl} alt={rec.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                            {rec.isGenerating ? (
                              <Loader2 className="w-5 h-5 animate-spin text-fashion-gold" />
                            ) : (
                              <button 
                                onClick={() => visualizeRecommendation(i, j)}
                                className="text-[10px] font-bold text-fashion-gold uppercase tracking-wider hover:underline flex items-center gap-1"
                              >
                                <ImageIcon size={12} />
                                Visualize
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h4 className="font-bold text-xs mb-1">{rec.title}</h4>
                        <div className="space-y-1 mt-2">
                          {rec.shoppingLinks.map((link, k) => (
                            <a 
                              key={k}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between w-full px-2 py-1.5 bg-fashion-cream/50 hover:bg-fashion-gold/10 rounded text-[9px] font-bold uppercase tracking-wider text-fashion-black transition-colors"
                            >
                              {link.label}
                              <ExternalLink size={10} />
                            </a>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex gap-3 mr-auto">
            <div className="w-8 h-8 rounded-full bg-fashion-black text-white flex items-center justify-center animate-pulse">
              <Sparkles size={16} />
            </div>
            <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-zinc-100 shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin text-fashion-gold" />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-zinc-100">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask for styling advice..."
            className="w-full pl-4 pr-12 py-3 bg-fashion-cream/50 border-none rounded-full focus:ring-2 focus:ring-fashion-gold transition-all text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 bg-fashion-black text-white rounded-full hover:bg-zinc-800 disabled:opacity-50 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
