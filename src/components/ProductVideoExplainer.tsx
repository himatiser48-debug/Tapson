import React, { useState } from 'react';
import { Play, X, Sparkles, CheckCircle2, ShieldCheck, Truck, MessageCircle, ExternalLink } from 'lucide-react';
import { Language, StoreSettings } from '../types';
import { getTranslation } from '../utils/translations';

interface ProductVideoExplainerProps {
  settings: StoreSettings;
  lang: Language;
}

export const ProductVideoExplainer: React.FC<ProductVideoExplainerProps> = ({ settings, lang }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const t = getTranslation(lang);

  // If merchant turned off explainer video, don't render
  if (settings.showExplainerVideo === false) {
    return null;
  }

  const rawVideoUrl = settings.videoUrl?.trim() || 'https://www.youtube.com/watch?v=ScMzIvxBSi4';

  // Helper to extract embed url for YouTube or return standard url
  const getEmbedUrl = (url: string) => {
    try {
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let videoId = '';
        if (url.includes('youtu.be/')) {
          videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
        } else if (url.includes('v=')) {
          videoId = url.split('v=')[1]?.split('&')[0] || '';
        } else if (url.includes('embed/')) {
          return url;
        }
        return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0` : url;
      }
      return url;
    } catch {
      return url;
    }
  };

  const embedUrl = getEmbedUrl(rawVideoUrl);
  const isYouTube = embedUrl.includes('youtube') || embedUrl.includes('youtu.be');

  const title = settings.videoTitle || t.watchVideo;
  const description = settings.videoDescription || t.videoSubtitle;

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950 text-white p-5 sm:p-7 shadow-xl border border-slate-700/80 mb-6 transition-all duration-300">
      
      {/* Background Glow effects */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
        
        {/* Left / Info Text Area */}
        <div className="flex-1 space-y-4 text-center lg:text-start">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin-hover" />
            <span>{t.explainerVideoBadge}</span>
          </div>

          <h3 className="text-xl sm:text-2xl lg:text-3xl font-black leading-tight tracking-tight text-white">
            {title}
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            {description}
          </p>

          {/* Value Badges */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-200">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-xl backdrop-blur-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">{t.guarantee1}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-xl backdrop-blur-xs">
              <Truck className="w-4 h-4 text-teal-400 shrink-0" />
              <span className="font-semibold">{t.guarantee2}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-xl backdrop-blur-xs">
              <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">{t.guarantee3}</span>
            </div>
          </div>

          {!isPlaying && (
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <button
                onClick={() => setIsPlaying(true)}
                className="inline-flex items-center gap-2.5 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs sm:text-sm shadow-lg hover:shadow-emerald-500/30 transition transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{t.playVideo}</span>
              </button>

              <span className="text-[11px] text-slate-400">
                مدة العرض: دقيقة واحدة لاكتشاف التفاصيل
              </span>
            </div>
          )}

        </div>

        {/* Right / Video Player Container */}
        <div className="w-full lg:w-1/2 max-w-lg shrink-0">
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border-2 border-emerald-500/30 shadow-2xl group">
            
            {isPlaying ? (
              <div className="w-full h-full relative">
                {isYouTube ? (
                  <iframe
                    src={embedUrl}
                    title="فيديو شرح المنتج"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <video
                    src={rawVideoUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Close / Minimize Video Button */}
                <button
                  onClick={() => setIsPlaying(false)}
                  className="absolute top-2.5 left-2.5 z-20 p-2 bg-black/80 hover:bg-black text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 backdrop-blur-xs border border-white/20 cursor-pointer"
                  title={t.closeVideo}
                >
                  <X className="w-3.5 h-3.5" />
                  <span className="text-[10px]">{t.closeVideo}</span>
                </button>
              </div>
            ) : (
              /* Video Poster with Animated Play Button */
              <div 
                onClick={() => setIsPlaying(true)}
                className="w-full h-full relative flex items-center justify-center cursor-pointer select-none"
              >
                <img
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80"
                  alt="معاينة فيديو المنتجات"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500 filter brightness-75"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30"></div>

                {/* Center Pulsing Play Trigger */}
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-2xl transition transform group-hover:scale-110">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50"></span>
                    <Play className="w-7 h-7 sm:w-9 sm:h-9 fill-white ml-0.5" />
                  </div>
                  <span className="text-xs font-black tracking-wide bg-slate-900/80 px-3 py-1 rounded-full border border-white/20 text-white backdrop-blur-xs">
                    {t.playVideo} 🎬
                  </span>
                </div>

                <div className="absolute bottom-3 right-3 text-[11px] text-slate-300 bg-black/60 px-2.5 py-0.5 rounded-lg backdrop-blur-xs">
                  دقة عالية 1080p
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

    </section>
  );
};
