import React, { useState } from 'react';
import { WeatherConfig } from '../types';
import { Wand2, Layers, Loader2, Thermometer, Wind, CloudRain, Sun, Palette } from 'lucide-react';
import { generateWeatherFromPrompt } from '../services/geminiService';

interface ControlsProps {
  config: WeatherConfig;
  setConfig: React.Dispatch<React.SetStateAction<WeatherConfig>>;
  exploded: boolean;
  setExploded: (v: boolean) => void;
}

export const Controls: React.FC<ControlsProps> = ({ config, setConfig, exploded, setExploded }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const newConfig = await generateWeatherFromPrompt(prompt);
      setConfig(newConfig);
    } catch (e: any) {
      let msg = "Failed to generate weather. Try again.";
      if (e.status === 429 || (e.message && e.message.includes('429'))) {
        msg = "Quota exceeded. Please wait a moment.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: keyof WeatherConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="w-96 h-full bg-slate-900 border-r border-slate-700 p-6 flex flex-col gap-6 overflow-y-auto z-10 shadow-2xl">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          AtmoStudio
        </h1>
        <p className="text-slate-400 text-sm mt-1">Procedural Weather Designer</p>
      </div>

      {/* AI Generator */}
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
        <div className="flex items-center gap-2 mb-3">
          <Wand2 size={16} className="text-purple-400" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">AI Generation</h2>
        </div>
        <div className="flex gap-2 mb-2">
          <input 
            type="text" 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Cyberpunk acid rain in Tokyo"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-slate-500"
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
        </div>
        <button 
          onClick={handleGenerate}
          disabled={loading || !prompt}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : "Generate Config"}
        </button>
        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      </div>

      {/* Exploded View Toggle */}
      <div className="flex items-center justify-between bg-slate-800 p-4 rounded-xl border border-slate-700">
        <div className="flex items-center gap-2">
          <Layers size={18} className="text-blue-400" />
          <span className="text-sm font-medium">Exploded View</span>
        </div>
        <button 
          onClick={() => setExploded(!exploded)}
          className={`w-12 h-6 rounded-full p-1 transition-colors ${exploded ? 'bg-blue-600' : 'bg-slate-600'}`}
        >
          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${exploded ? 'translate-x-6' : 'translate-x-0'}`} />
        </button>
      </div>

      {/* Manual Controls */}
      <div className="space-y-6">
        
        {/* Colors */}
        <section>
          <div className="flex items-center gap-2 mb-3 text-slate-300">
            <Palette size={16} />
            <h3 className="text-xs font-bold uppercase">Background</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-xs text-slate-500 block mb-1">Top</label>
                <div className="flex items-center gap-2">
                    <input type="color" value={config.bgTop} onChange={(e) => handleChange('bgTop', e.target.value)} className="w-8 h-8 rounded bg-transparent cursor-pointer" />
                    <span className="text-xs font-mono">{config.bgTop}</span>
                </div>
             </div>
             <div>
                <label className="text-xs text-slate-500 block mb-1">Bottom</label>
                <div className="flex items-center gap-2">
                    <input type="color" value={config.bgBottom} onChange={(e) => handleChange('bgBottom', e.target.value)} className="w-8 h-8 rounded bg-transparent cursor-pointer" />
                    <span className="text-xs font-mono">{config.bgBottom}</span>
                </div>
             </div>
          </div>
        </section>

        {/* Clouds */}
        <section>
          <div className="flex items-center gap-2 mb-3 text-slate-300">
            <CloudRain size={16} />
            <h3 className="text-xs font-bold uppercase">Atmosphere</h3>
          </div>
          <div className="space-y-3">
             <div className="flex justify-between text-xs text-slate-500">
               <span>Cloud Density</span>
               <span>{config.cloudDensity.toFixed(2)}</span>
             </div>
             <input 
                type="range" min="0" max="1" step="0.01" 
                value={config.cloudDensity} 
                onChange={(e) => handleChange('cloudDensity', parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
             />

             <div className="flex justify-between text-xs text-slate-500">
               <span>Rain Intensity</span>
               <span>{config.rainIntensity.toFixed(2)}</span>
             </div>
             <input 
                type="range" min="0" max="1" step="0.01" 
                value={config.rainIntensity} 
                onChange={(e) => handleChange('rainIntensity', parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
             />

             <div className="flex justify-between text-xs text-slate-500">
               <span>Snow Intensity</span>
               <span>{config.snowIntensity.toFixed(2)}</span>
             </div>
             <input 
                type="range" min="0" max="1" step="0.01" 
                value={config.snowIntensity} 
                onChange={(e) => handleChange('snowIntensity', parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
             />
          </div>
        </section>

        {/* Sun & Position */}
        <section>
          <div className="flex items-center gap-2 mb-3 text-slate-300">
            <Sun size={16} />
            <h3 className="text-xs font-bold uppercase">Celestial</h3>
          </div>
          <div className="space-y-3">
             <div className="flex justify-between text-xs text-slate-500">
               <span>Sun Position X</span>
               <span>{config.sunPositionX.toFixed(2)}</span>
             </div>
             <input 
                type="range" min="-1" max="1" step="0.01" 
                value={config.sunPositionX} 
                onChange={(e) => handleChange('sunPositionX', parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
             />
             <div className="flex justify-between text-xs text-slate-500">
               <span>Sun Position Y</span>
               <span>{config.sunPositionY.toFixed(2)}</span>
             </div>
             <input 
                type="range" min="-1" max="1" step="0.01" 
                value={config.sunPositionY} 
                onChange={(e) => handleChange('sunPositionY', parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
             />
             <div className="flex justify-between text-xs text-slate-500 mt-2">
                 <span>Sun Color</span>
             </div>
             <input type="color" value={config.sunColor} onChange={(e) => handleChange('sunColor', e.target.value)} className="w-full h-6 rounded bg-transparent cursor-pointer" />
          </div>
        </section>

        {/* Meta */}
        <section>
           <div className="flex items-center gap-2 mb-3 text-slate-300">
            <Thermometer size={16} />
            <h3 className="text-xs font-bold uppercase">Details</h3>
          </div>
          <div className="space-y-2">
              <label className="text-xs text-slate-500">Label</label>
              <input 
                type="text" 
                value={config.conditionLabel} 
                onChange={(e) => handleChange('conditionLabel', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-white"
              />
              <label className="text-xs text-slate-500">Temp (°)</label>
              <input 
                type="number" 
                value={config.temperature} 
                onChange={(e) => handleChange('temperature', parseInt(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-white"
              />
          </div>
        </section>

      </div>
    </div>
  );
};