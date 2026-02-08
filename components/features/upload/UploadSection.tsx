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

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      e.target.value = ''; // Reset input to allow re-upload of same file
    }
  };

  return (
    <div
      id="upload-section"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`w-full max-w-6xl min-h-[400px] md:h-[640px] h-auto border-4 border-dashed rounded-[40px] md:rounded-[96px] flex flex-col items-center justify-center text-center p-6 md:p-20 space-y-8 md:space-y-12 backdrop-blur-xl transition-all duration-700 relative overflow-hidden group shadow-2xl
        ${isDragging
          ? 'border-violet-500 bg-violet-50/10 dark:bg-violet-900/10 scale-[1.02]'
          : 'border-slate-200 dark:border-white/5 bg-white/50 dark:bg-[#0f172a]/10 hover:bg-white/80 dark:hover:bg-[#0f172a]/20 hover:scale-[1.002]'
        }`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent transition-opacity duration-1000 ${isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
      <div className="w-32 h-32 md:w-48 md:h-48 rounded-[36px] md:rounded-[56px] bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-3xl relative z-10 group-hover:scale-110 transition-transform duration-700">
        <BrandLogo size={72} className="w-24 h-24 md:w-36 md:h-36" />
        <div className="absolute -top-4 -right-4 md:-top-6 md:-right-6 w-12 h-12 md:w-16 md:h-16 bg-violet-500 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-2xl border-4 md:border-8 border-white dark:border-[#020617] animate-bounce z-20"><Sparkles className="w-5 h-5 md:w-7 md:h-7 text-white" /></div>
      </div>

      <div className="space-y-6 md:space-y-8 relative z-10">
        <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-[0.1em]">Hirely AI Resume Helper</h2>
        <p className="max-w-3xl text-base md:text-xl text-slate-500 dark:text-slate-500 leading-relaxed mx-auto font-medium transition-all px-4">
          {isDragging ? "Drop your resume here!" : "Upload your resume and the job you want. We'll show you exactly how to bridge the gap and get hired."}
        </p>

        <div className="pt-6 md:pt-10 space-y-6">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-8 py-4 md:px-14 md:py-7 bg-violet-500 text-white rounded-[24px] md:rounded-[36px] font-black uppercase text-sm md:text-base tracking-widest shadow-2xl shadow-violet-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 md:gap-6 mx-auto"
            aria-label="Upload resume file"
          >
            <Upload className="w-6 h-6" /> Choose Resume File
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleInputChange}
            className="hidden"
            accept=".pdf,.docx"
            aria-label="Resume file upload"
          />
        </div>

        {selectedFile && (
          <div className="flex items-center gap-4 justify-center text-violet-500 animate-in fade-in zoom-in font-black uppercase text-sm tracking-[0.2em] mt-10">
            <div className="p-2 bg-violet-500 rounded-full shadow-lg"><CheckCircle2 className="w-5 h-5 text-white" /></div>
            {selectedFile.name}
          </div>
        )}
      </div>
    </div>
  );
};
