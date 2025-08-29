import React, { useState, useEffect } from 'react';

import { FileUploader } from './components/FileUploader';
import { ScoreDisplay } from './components/ScoreDisplay';
import { EnhanceScoreDisplay } from './components/EnhanceScoreDisplay';
import { PDFEditor } from './components/PDFeditor';
import { Star } from 'lucide-react';

interface ScoreData {
  final_score: number;
  eligible: boolean;
  reason?: string;
}

interface ApiResponse {
  score: ScoreData;
  session_id: string;
}

function App() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [jobUrl, setJobUrl] = useState('');
  const [score, setScore] = useState<ScoreData | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [enhancedPdfUrl, setEnhancedPdfUrl] = useState<string | null>(null);

  const handleFilesUploaded = (pdf: File | null, url: string) => {
    setPdfFile(pdf);
    setJobUrl(url);
  };

  const handleGetScore = async () => {
    if (!pdfFile || !jobUrl) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('resume', pdfFile);
      formData.append('job_url', jobUrl);

      const response = await fetch('http://127.0.0.1:8000/evaluate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to evaluate resume');
      }

      const data: ApiResponse = await response.json();
      setScore(data.score);
      setSessionId(data.session_id);
    } catch (error) {
      console.error('Error evaluating resume:', error);
      // Set a demo score for testing UI
      setScore({
        final_score: 85,
        eligible: true,
        reason: "Your resume shows strong technical skills and relevant experience for this position. Key strengths include matching programming languages and frameworks mentioned in the job description."
      });
      setSessionId('demo-session-id');
    } finally {
      setLoading(false);
    }
  };

  const handleEnhance = async () => {
    if (!sessionId) return;

    setEnhancing(true);
    try {
      const formData = new FormData();
      formData.append("session_id", sessionId);

      const response = await fetch("http://127.0.0.1:8000/enhance", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to enhance resume");
      }

            // Parse the x-score header
      const xScoreHeader = response.headers.get("X-score");
      console.log("X-Score Header:", xScoreHeader);
      if (xScoreHeader) {
        try {
          let enhancedScore: ScoreData;
        
          // If it's JSON string → parse
          if (typeof xScoreHeader === "string") {
            enhancedScore = JSON.parse(xScoreHeader);
          } else {
            // If backend magically sent it as object
            enhancedScore = xScoreHeader as unknown as ScoreData;
          }
        
          setScore(enhancedScore);
          console.log("Enhanced score parsed:", enhancedScore);
          setScore(enhancedScore);

// Watch for changes
useEffect(() => {
  if (score) {
    console.log("Updated score state:", score);
  }
}, [score]);

        } catch (parseError) {
          console.error("Error parsing x-score header:", parseError, xScoreHeader);
        }
      }
      console.log("Enhanced score:", score);

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setEnhancedPdfUrl(url);
    } catch (error) {
      console.error("Error enhancing resume:", error);
      // Set a demo URL and score for testing UI
      setEnhancedPdfUrl("demo-pdf-url");
      setScore({
        final_score: 99.69,
        eligible: true,
        reason: "Enhanced resume with improved technical keywords and formatting."
      });
    } finally {
      setEnhancing(false);
    }
  };

  const handleDownload = () => {
    if (enhancedPdfUrl && enhancedPdfUrl !== 'demo-pdf-url') {
      const link = document.createElement('a');
      link.href = enhancedPdfUrl;
      link.download = 'enhanced-resume.pdf';
      link.click();
    } else {
      // Demo download action
      alert('Demo: Enhanced resume would be downloaded here');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      {/* Header */}
      <header className="py-10 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-white mb-4">
            Resume{' '}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Scorer
            </span>{' '}
            & Enhancer
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Analyze your resume against job requirements and enhance it with AI-powered insights
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {enhancedPdfUrl ? (
            /* Enhanced PDF View */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="order-2 lg:order-1">
                <EnhanceScoreDisplay
                  score={score}
                  sessionId={sessionId}
                  onEnhance={handleEnhance}
                  loading={loading}
                  enhancing={enhancing}
                />
              </div>
              <div className="order-1 lg:order-2">
                <PDFEditor 
                  pdfUrl={enhancedPdfUrl} 
                  onDownload={handleDownload}
                  originalPdfFile={pdfFile}
                />
              </div>
            </div>
          ) : (
            /* Initial Upload and Score View */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <FileUploader
                  onFilesUploaded={handleFilesUploaded}
                  onGetScore={handleGetScore}
                  loading={loading}
                />
              </div>
              <div>
                <ScoreDisplay
                  score={score}
                  sessionId={sessionId}
                  onEnhance={handleEnhance}
                  loading={loading}
                  enhancing={enhancing}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-blue-500/20 bg-slate-950/50">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center items-center gap-4 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Star className="h-4 w-4 text-white" />
            </div>
            <p className="text-slate-300 font-medium">Resume Scorer & Enhancer</p>
          </div>
          <p className="text-slate-400 text-sm">
            © 2025 Powered by AI for better career opportunities
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;