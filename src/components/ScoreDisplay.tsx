import React from 'react';
import { Star, TrendingUp, Download, Loader } from 'lucide-react';

interface ScoreData {
  final_score: number;
  eligible: boolean;
  reason?: string;
}

interface ScoreDisplayProps {
  score: ScoreData | null;
  sessionId: string | null;
  onEnhance: () => void;
  loading: boolean;
  enhancing: boolean;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  score,
  sessionId,
  onEnhance,
  loading,
  enhancing
}) => {
  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-blue-900/20 shadow-2xl">
        <div className="flex flex-col items-center justify-center h-96">
          <Loader className="h-12 w-12 text-blue-400 animate-spin mb-4" />
          <p className="text-blue-300 text-lg">Analyzing your resume...</p>
          <p className="text-slate-400 text-sm mt-2">This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (!score) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-blue-900/20 shadow-2xl">
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-full flex items-center justify-center mb-6">
            <Star className="h-12 w-12 text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Ready to Score Your Resume</h3>
          <p className="text-slate-400">Upload your resume and job URL to get started</p>
        </div>
      </div>
    );
  }

  const CircularProgress = ({ percentage, size = 200 }: { percentage: number; size?: number }) => {
    const radius = (size - 20) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(71, 85, 105, 0.3)"
            strokeWidth="10"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={score.eligible ? '#10B981' : '#EF4444'}
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 8px ${score.eligible ? '#10B98140' : '#EF444440'})`
            }}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <div className={`text-4xl font-bold ${score.eligible ? 'text-green-400' : 'text-red-400'}`}>
            {percentage}%
          </div>
          <div className="text-slate-300 text-sm font-medium">Score</div>
        </div>
      </div>
    );
  };

  const percentage = Math.round((score.final_score / 100) * 100);

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-blue-900/20 shadow-2xl">
      <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
        <TrendingUp className="text-blue-400" />
        Resume Analysis Results
      </h2>

      <div className="flex flex-col items-center text-center">
        <CircularProgress percentage={percentage} />
        
        <div className="mt-8 space-y-4">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
            score.eligible 
              ? 'bg-green-900/30 text-green-300 border border-green-500/30' 
              : 'bg-red-900/30 text-red-300 border border-red-500/30'
          }`}>
            <span className={`w-2 h-2 rounded-full ${score.eligible ? 'bg-green-400' : 'bg-red-400'}`}></span>
            {score.eligible ? 'Eligible' : 'Not Eligible'}
          </div>

          <div className="bg-slate-700/30 rounded-xl p-6 max-w-md">
            <h4 className="text-lg font-semibold text-white mb-3">Analysis Summary</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Final Score:</span>
                <span className="text-white font-medium">{score.final_score}/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Percentage:</span>
                <span className="text-white font-medium">{percentage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className={`font-medium ${score.eligible ? 'text-green-400' : 'text-red-400'}`}>
                  {score.eligible ? 'Qualified' : 'Needs Improvement'}
                </span>
              </div>
            </div>
            
            {score.reason && (
              <div className="mt-4 p-4 bg-slate-800/50 rounded-lg">
                <p className="text-slate-300 text-sm leading-relaxed">{score.reason}</p>
              </div>
            )}
          </div>

          {score.eligible && (
            <button
              onClick={onEnhance}
              disabled={enhancing}
              className={`px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-3 ${
                enhancing
                  ? 'bg-slate-600 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transform hover:scale-[1.02] shadow-lg hover:shadow-green-500/25'
              }`}
            >
              {enhancing ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Enhancing Resume...
                </>
              ) : (
                <>
                  <span className="text-lg">✨</span>
                  Enhance Resume
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};