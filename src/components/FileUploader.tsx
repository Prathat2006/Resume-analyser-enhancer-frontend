import React, { useState } from 'react';
import { Upload, FileText, Link, Loader } from 'lucide-react';

interface FileUploaderProps {
  onFilesUploaded: (pdfFile: File | null, jobUrl: string) => void;
  onGetScore: () => void;
  loading: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFilesUploaded,
  onGetScore,
  loading
}) => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [jobUrl, setJobUrl] = useState('');
  const [errors, setErrors] = useState<{ pdf?: string; url?: string }>({});

  const validateNaukriUrl = (url: string): boolean => {
    return url.includes('naukri.com') && url.includes('job-listings');
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setPdfFile(file);
        setErrors(prev => ({ ...prev, pdf: undefined }));
        onFilesUploaded(file, jobUrl);
      } else {
        setErrors(prev => ({ ...prev, pdf: 'Please upload a PDF file only' }));
      }
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setJobUrl(url);
    
    if (url && !validateNaukriUrl(url)) {
      setErrors(prev => ({ ...prev, url: 'Please enter a valid Naukri.com job listing URL' }));
    } else {
      setErrors(prev => ({ ...prev, url: undefined }));
      onFilesUploaded(pdfFile, url);
    }
  };

  const canGetScore = pdfFile && jobUrl && validateNaukriUrl(jobUrl) && !errors.pdf && !errors.url;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-blue-900/20 shadow-2xl">
      <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
        <Upload className="text-blue-400" />
        Upload Resume & Job Details
      </h2>
      
      <div className="space-y-8">
        {/* PDF Upload */}
        <div>
          <label className="block text-sm font-medium text-blue-300 mb-4">
            Upload Resume (PDF only)
          </label>
          <div className="relative">
            <input
              type="file"
              accept=".pdf"
              onChange={handlePdfUpload}
              className="hidden"
              id="pdf-upload"
            />
            <label
              htmlFor="pdf-upload"
              className={`flex items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
                pdfFile 
                  ? 'border-green-400 bg-green-900/20' 
                  : 'border-blue-400/50 bg-blue-900/10 hover:border-blue-400 hover:bg-blue-900/20'
              }`}
            >
              <div className="text-center">
                {pdfFile ? (
                  <>
                    <FileText className="mx-auto h-8 w-8 text-green-400 mb-2" />
                    <p className="text-sm text-green-400 font-medium">{pdfFile.name}</p>
                    <p className="text-xs text-green-300 mt-1">PDF uploaded successfully</p>
                  </>
                ) : (
                  <>
                    <Upload className="mx-auto h-8 w-8 text-blue-400 mb-2" />
                    <p className="text-sm text-blue-300">Click to upload or drag and drop</p>
                    <p className="text-xs text-blue-400 mt-1">PDF files only</p>
                  </>
                )}
              </div>
            </label>
          </div>
          {errors.pdf && (
            <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
              <span className="w-1 h-1 bg-red-400 rounded-full"></span>
              {errors.pdf}
            </p>
          )}
        </div>

        {/* URL Input */}
        <div>
          <label className="block text-sm font-medium text-blue-300 mb-4 flex items-center gap-2">
            <Link className="h-4 w-4" />
            Job Listing URL (Naukri.com)
          </label>
          <input
            type="url"
            value={jobUrl}
            onChange={handleUrlChange}
            placeholder="https://www.naukri.com/job-listings-..."
            className="w-full px-4 py-3 bg-slate-700/50 border border-blue-900/30 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
          />
          {errors.url && (
            <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
              <span className="w-1 h-1 bg-red-400 rounded-full"></span>
              {errors.url}
            </p>
          )}
          {jobUrl && validateNaukriUrl(jobUrl) && (
            <p className="text-green-400 text-sm mt-2 flex items-center gap-2">
              <span className="w-1 h-1 bg-green-400 rounded-full"></span>
              Valid Naukri.com URL detected
            </p>
          )}
        </div>

        {/* Get Score Button */}
        <button
          onClick={onGetScore}
          disabled={!canGetScore || loading}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-3 ${
            canGetScore && !loading
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02] shadow-lg hover:shadow-blue-500/25'
              : 'bg-slate-600 cursor-not-allowed opacity-50'
          }`}
        >
          {loading ? (
            <>
              <Loader className="h-5 w-5 animate-spin" />
              Analyzing Resume...
            </>
          ) : (
            <>
              <span className="text-lg">🎯</span>
              Get Resume Score
            </>
          )}
        </button>
      </div>
    </div>
  );
};