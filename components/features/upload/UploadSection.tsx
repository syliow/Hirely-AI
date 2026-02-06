import React, { useRef, useState } from 'react';
import { BrandLogo } from '@/components/BrandLogo';
import { Sparkles, Upload, CheckCircle2 } from 'lucide-react';
import { FileData } from '@/lib/types';

interface UploadSectionProps {
  onFileSelect: (file: File) => void;
  selectedFile: FileData | null;
}

export const UploadSection: React.FC<UploadSectionProps> = ({ onFileSelect, selectedFile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      e.target.value = '';
    }
  };

  return (
    <div
      id="upload-section"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`w-full max-w-6xl h-[640px] border-4 border-dashed rounded-[96px] flex flex-col items-center justify-center text-center p-20 space-y-12 backdrop-blur-xl transition-all duration-700 relative overflow-hidden group shadow-2xl
        ${isDragging
          ? 'border-violet-500 bg-violet-50/10 dark:bg-violet-900/10 scale-[1.02]'
          : 'border-slate-200 dark:border-white/5 bg-white/50 dark:bg-[#0f172a]/10 hover:bg-white/80 dark:hover:bg-[#0f172a]/20 hover:scale-[1.002]'
        }`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
      <div className="w-48 h-48 rounded-[56px] bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-3xl relative z-10 group-hover:scale-110 transition-transform duration-700">
        <BrandLogo size={72} className="w-36 h-36" />
        <div className="absolute -top-6 -right-6 w-16 h-16 bg-violet-500 rounded-3xl flex items-center justify-center shadow-2xl border-8 border-white dark:border-[#020617] animate-bounce z-20"><Sparkles className="w-7 h-7 text-white" /></div>
      </div>
      <div className="space-y-8 relative z-10">
        <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase tracking-[0.1em]">Hirely AI Resume Helper</h2>
        <p className="max-w-3xl text-xl text-slate-500 dark:text-slate-500 leading-relaxed mx-auto font-medium">
          {isDragging ? "Drop your resume here!" : "Upload your resume and the job you want. We'll show you exactly how to bridge the gap and get hired."}
        </p>
        <div className="pt-10 space-y-6">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-14 py-7 bg-violet-500 text-white rounded-[36px] font-black uppercase text-base tracking-widest shadow-2xl shadow-violet-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-6 mx-auto"
          >
            <Upload className="w-6 h-6" /> Choose Resume File
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleInputChange}
            className="hidden"
            accept=".pdf,.docx"
          />
        </div>
        {selectedFile && <div className="flex items-center gap-4 justify-center text-violet-500 animate-in fade-in zoom-in font-black uppercase text-sm tracking-[0.2em] mt-10"><div className="p-2 bg-violet-500 rounded-full shadow-lg"><CheckCircle2 className="w-5 h-5 text-white" /></div> {selectedFile.name}</div>}
      </div>
    </div>
  );
};
