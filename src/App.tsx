import React, { useState } from 'react';
import { FileUploader } from './components/FileUploader';
import { ScoreDisplay } from './components/ScoreDisplay';
import { PDFEditor } from './components/PDFeditor';

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
        final_score: 75,
        eligible: true,
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

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    setEnhancedPdfUrl(url);
  } catch (error) {
    console.error("Error enhancing resume:", error);
    // Set a demo URL for testing UI
    setEnhancedPdfUrl("demo-pdf-url");
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-800">
      {/* Header */}
      <header className="py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white text-center mb-2">
            Resume <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Scorer</span> & Enhancer
          </h1>
          <p className="text-slate-300 text-center">
            Analyze your resume against job requirements and enhance it with AI
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {enhancedPdfUrl ? (
            /* Enhanced PDF View */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="order-2 lg:order-1">
                <ScoreDisplay
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
      <footer className="py-6 px-6 border-t border-blue-900/20">
        <div className="max-w-7xl mx-auto text-center text-slate-400 text-sm">
          <p>© 2025 Resume Scorer & Enhancer. Powered by AI for better career opportunities.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;