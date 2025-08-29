import React, { useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { 
  Download, 
  Edit3, 
  Type, 
  Square, 
  Circle, 
  Minus, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  Save,
  Undo,
  Redo,
  FileText,
  Palette
} from 'lucide-react';

// Fix: Use CDN worker instead of local file
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js`;
interface PDFEditorProps {
  pdfUrl: string;
  onDownload: () => void;
  originalPdfFile?: File;
}

interface Annotation {
  id: string;
  type: 'text' | 'rectangle' | 'circle' | 'line';
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  color: string;
  fontSize?: number;
  pageNumber: number;
}

export const PDFEditor: React.FC<PDFEditorProps> = ({ 
  pdfUrl, 
  onDownload, 
  originalPdfFile 
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedTool, setSelectedTool] = useState<string>('text');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>('#3B82F6');
  const [fontSize, setFontSize] = useState<number>(12);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentAnnotation, setCurrentAnnotation] = useState<Annotation | null>(null);
  const [history, setHistory] = useState<Annotation[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ];

  const tools = [
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'line', icon: Minus, label: 'Line' }
  ];

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3.0));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, numPages)));
  };

  const saveToHistory = (newAnnotations: Annotation[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newAnnotations]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setAnnotations([...history[historyIndex - 1]]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setAnnotations([...history[historyIndex + 1]]);
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditing) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (selectedTool === 'text') {
      const text = prompt('Enter text:');
      if (text) {
        const newAnnotation: Annotation = {
          id: Date.now().toString(),
          type: 'text',
          x,
          y,
          text,
          color: selectedColor,
          fontSize,
          pageNumber: currentPage
        };
        const newAnnotations = [...annotations, newAnnotation];
        setAnnotations(newAnnotations);
        saveToHistory(newAnnotations);
      }
    } else {
      setIsDrawing(true);
      const newAnnotation: Annotation = {
        id: Date.now().toString(),
        type: selectedTool as 'rectangle' | 'circle' | 'line',
        x,
        y,
        width: 0,
        height: 0,
        color: selectedColor,
        pageNumber: currentPage
      };
      setCurrentAnnotation(newAnnotation);
    }
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !currentAnnotation) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setCurrentAnnotation({
      ...currentAnnotation,
      width: x - currentAnnotation.x,
      height: y - currentAnnotation.y
    });
  };

  const handleCanvasMouseUp = () => {
    if (isDrawing && currentAnnotation) {
      const newAnnotations = [...annotations, currentAnnotation];
      setAnnotations(newAnnotations);
      saveToHistory(newAnnotations);
      setIsDrawing(false);
      setCurrentAnnotation(null);
    }
  };

  const handleSaveAnnotations = async () => {
    try {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = 'edited-resume.pdf';
      link.click();
    } catch (error) {
      console.error('Error saving PDF:', error);
      alert('Error saving PDF. Please try again.');
    }
  };

  const currentPageAnnotations = annotations.filter(ann => ann.pageNumber === currentPage);
  const displayAnnotations = currentAnnotation ? [...currentPageAnnotations, currentAnnotation] : currentPageAnnotations;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-blue-900/20 shadow-2xl h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          <FileText className="text-green-400" />
          Enhanced Resume
        </h2>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
              isEditing 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
                : 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-300'
            }`}
          >
            <Edit3 className="h-4 w-4" />
            {isEditing ? 'Exit Edit' : 'Edit'}
          </button>
          
          <button
            onClick={onDownload}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-green-500/25"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
        </div>
      </div>

      {/* Toolbar */}
      {isEditing && (
        <div className="p-4 border-b border-slate-700/50 bg-slate-700/20">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Tools */}
            <div className="flex items-center gap-2">
              {tools.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool.id)}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    selectedTool === tool.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-slate-600/50 hover:bg-slate-600 text-slate-300'
                  }`}
                  title={tool.label}
                >
                  <tool.icon className="h-4 w-4" />
                </button>
              ))}
            </div>

            {/* Colors */}
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-slate-400" />
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                    selectedColor === color ? 'border-white scale-110' : 'border-slate-600'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            {/* Font Size */}
            {selectedTool === 'text' && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">Size:</span>
                <input
                  type="range"
                  min="8"
                  max="24"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-20"
                />
                <span className="text-sm text-white w-8">{fontSize}</span>
              </div>
            )}

            {/* History Controls */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="p-2 rounded-lg bg-slate-600/50 hover:bg-slate-600 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                title="Undo"
              >
                <Undo className="h-4 w-4" />
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="p-2 rounded-lg bg-slate-600/50 hover:bg-slate-600 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                title="Redo"
              >
                <Redo className="h-4 w-4" />
              </button>
              <button
                onClick={handleSaveAnnotations}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg"
              >
                <Save className="h-4 w-4" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Viewer */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Controls */}
        <div className="flex items-center justify-between p-4 bg-slate-700/20">
          <div className="flex items-center gap-4">
            <button
              onClick={handleZoomOut}
              className="p-2 rounded-lg bg-slate-600/50 hover:bg-slate-600 text-slate-300 transition-all duration-200"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-sm text-slate-300 min-w-16 text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-2 rounded-lg bg-slate-600/50 hover:bg-slate-600 text-slate-300 transition-all duration-200"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={handleRotate}
              className="p-2 rounded-lg bg-slate-600/50 hover:bg-slate-600 text-slate-300 transition-all duration-200"
              title="Rotate"
            >
              <RotateCw className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-3 py-1 rounded bg-slate-600/50 hover:bg-slate-600 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Previous
            </button>
            <span className="text-sm text-slate-300">
              Page {currentPage} of {numPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= numPages}
              className="px-3 py-1 rounded bg-slate-600/50 hover:bg-slate-600 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Next
            </button>
          </div>
        </div>

        {/* PDF Content */}
        <div className="flex-1 overflow-auto bg-slate-900/50 p-4">
          <div className="flex justify-center">
            <div 
              className="relative inline-block bg-white shadow-2xl"
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
            >
              <Document
                key={pdfUrl}
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex items-center justify-center h-96 bg-slate-100">
                    <div className="text-slate-600">Loading PDF...</div>
                  </div>
                }
                error={
                  <div className="flex items-center justify-center h-96 bg-slate-100">
                    <div className="text-red-600">Error loading PDF</div>
                  </div>
                }
              >
                <Page
                  pageNumber={currentPage}
                  scale={scale}
                  rotate={rotation}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>

              {/* Annotations Overlay */}
              {isEditing && (
                <div className="absolute inset-0 pointer-events-none">
                  {displayAnnotations.map(annotation => (
                    <div
                      key={annotation.id}
                      className="absolute pointer-events-none"
                      style={{
                        left: annotation.x,
                        top: annotation.y,
                        width: annotation.width || 'auto',
                        height: annotation.height || 'auto',
                        color: annotation.color,
                        fontSize: annotation.fontSize || 12,
                        border: annotation.type !== 'text' ? `2px solid ${annotation.color}` : 'none',
                        borderRadius: annotation.type === 'circle' ? '50%' : '0'
                      }}
                    >
                      {annotation.type === 'text' && annotation.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhancement Info */}
      <div className="p-4 bg-slate-700/30 border-t border-slate-700/50">
        <h4 className="text-sm font-medium text-blue-300 mb-2">Enhancement Features Applied:</h4>
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-1 h-1 bg-green-400 rounded-full"></span>
            Keyword optimization
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1 h-1 bg-green-400 rounded-full"></span>
            Format improvements
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1 h-1 bg-green-400 rounded-full"></span>
            Content enhancement
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1 h-1 bg-green-400 rounded-full"></span>
            ATS optimization
          </div>
        </div>
      </div>
    </div>
  );
};