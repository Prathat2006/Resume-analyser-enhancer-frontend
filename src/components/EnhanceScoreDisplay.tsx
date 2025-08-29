import React from 'react';
import { Star, TrendingUp, Loader } from 'lucide-react';

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

export const EnhanceScoreDisplay: React.FC<ScoreDisplayProps> = ({
  score,
  // sessionId,
  // onEnhance,
  loading,
  // enhancing
}) => {
  if (loading) {
    return (
      <div className="bg-slate-900/80 backdrop-blur-lg rounded-3xl p-8 border border-blue-500/30 shadow-2xl shadow-blue-500/10">
        <div className="flex flex-col items-center justify-center h-96">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-500/30 rounded-full animate-spin border-t-blue-500"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="text-blue-200 text-lg mt-6">Analyzing your resume...</p>
          <p className="text-slate-400 text-sm mt-2">This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (!score) {
    return (
      <div className="bg-slate-900/80 backdrop-blur-lg rounded-3xl p-8 border border-blue-500/30 shadow-2xl shadow-blue-500/10">
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
            <Star className="h-12 w-12 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Ready to Score Your Resume</h3>
          <p className="text-slate-300">Upload your resume and job URL to get started</p>
        </div>
      </div>
    );
  }

  const CircularProgress = ({ percentage, size = 200 }: { percentage: number; size?: number }) => {
    const radius = (size - 20) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;


    // Determine color based on percentage
    let progressColor = score.eligible ? '#10B981' : '#EF4444'; // Default colors
    let textColor = score.eligible ? 'text-emerald-400' : 'text-red-400';
    let shadowColor = score.eligible ? '#10B98160' : '#EF444460';

    if (percentage <= 35 ) {
      progressColor = '#EF4444'; // Red
      textColor = 'text-red-400';
      shadowColor = '#EF444460';
    } else if (percentage > 35 && percentage <= 50) {
      progressColor = '#F97316'; // Orange
      textColor = 'text-orange-400';
      shadowColor = '#F9731660';
    } else if (percentage > 50 && percentage <= 80) {
      progressColor = '#FACC15'; // Yellow
      textColor = 'text-yellow-400';
      shadowColor = '#FACC1560';
    } else if (percentage > 80) {
      progressColor = '#10B981'; // Green
      textColor = 'text-emerald-400';
      shadowColor = '#10B98160';
    }

    return (
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(51, 65, 85, 0.4)"
            strokeWidth="12"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={progressColor}
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 15px ${shadowColor})`
            }}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <div className={`text-5xl font-bold ${textColor}`}>
            {percentage}%
          </div>
          <div className="text-slate-200 text-sm font-medium">Score</div>
        </div>
      </div>
    );
  };

  const percentage = Math.round((score.final_score / 100) * 100);

  return (
    <div className="bg-slate-900/80 backdrop-blur-lg rounded-3xl p-8 border border-blue-500/30 shadow-2xl shadow-blue-500/10">
      <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
          <TrendingUp className="text-white h-6 w-6" />
        </div>
        Enhance Resume Analysis Results
      </h2>

      <div className="flex flex-col items-center text-center">
        <CircularProgress percentage={percentage} />
        
        <div className="mt-8 space-y-4">
          <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-medium ${
            score.eligible 
              ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/50 shadow-lg shadow-emerald-500/20' 
              : 'bg-red-500/20 text-red-200 border border-red-400/50 shadow-lg shadow-red-500/20'
          }`}>
            <span className={`w-3 h-3 rounded-full ${score.eligible ? 'bg-emerald-400' : 'bg-red-400'} shadow-sm`}></span>
            {score.eligible ? 'Eligible' : 'Not Eligible'}
          </div>

          <div className="bg-slate-800/50 rounded-2xl p-6 max-w-md border border-blue-500/20">
            <h4 className="text-lg font-semibold text-white mb-4">Analysis Summary</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center p-2 bg-slate-700/30 rounded-lg">
                <span className="text-slate-300">Final Score:</span>
                <span className="text-white font-bold">{score.final_score}/100</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-700/30 rounded-lg">
                <span className="text-slate-300">Percentage:</span>
                <span className="text-white font-bold">{percentage}%</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-700/30 rounded-lg">
                <span className="text-slate-300">Status:</span>
                <span className={`font-bold ${score.eligible ? 'text-emerald-400' : 'text-red-400'}`}>
                  {score.eligible ? 'Qualified' : 'Needs Improvement'}
                </span>
              </div>
            </div>
            
            {score.reason && (
              <div className="mt-4 p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                <p className="text-slate-200 text-sm leading-relaxed">{score.reason}</p>
              </div>
            )}
          </div>

          {/* {score.eligible && (
            <button
              onClick={onEnhance}
              disabled={enhancing}
              className={`px-8 py-4 rounded-2xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-3 ${
                enhancing
                  ? 'bg-slate-700 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 transform hover:scale-[1.02] shadow-xl hover:shadow-emerald-500/40'
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
          )} */}
        </div>
      </div>
    </div>
  );
};