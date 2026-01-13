import React from "react";
import { Icon } from "./Icon";
import { MotionDiv } from "./Motion";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export const TaskListErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
}) => (
  <MotionDiv
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-8 text-center space-y-4 max-w-md mx-auto"
  >
    <div className="text-rose-500 flex justify-center">
      <Icon name="AlertTriangle" size={48} />
    </div>
    <div>
      <h3 className="font-bold text-lg text-slate-900">Something went wrong</h3>
      <p className="text-sm text-slate-600 mt-2 font-mono bg-slate-50 p-3 rounded border border-slate-200">
        {error.message}
      </p>
    </div>
    <button
      onClick={resetErrorBoundary}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
    >
      Try Again
    </button>
  </MotionDiv>
);

export const AIErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
}) => (
  <MotionDiv
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="p-4 bg-rose-50 border border-rose-200 rounded-lg mx-4 mb-4"
  >
    <div className="flex items-start gap-3">
      <div className="text-rose-600 mt-0.5">
        <Icon name="AlertCircle" size={20} />
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-rose-900 text-sm">
          AI Command Failed
        </h4>
        <p className="text-sm text-rose-700 mt-1">{error.message}</p>
        <button
          onClick={resetErrorBoundary}
          className="text-xs text-rose-600 underline mt-2 hover:text-rose-800"
        >
          Dismiss
        </button>
      </div>
    </div>
  </MotionDiv>
);

export const ModalErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
}) => (
  <div className="p-6 text-center space-y-4">
    <div className="text-rose-500 flex justify-center">
      <Icon name="XCircle" size={40} />
    </div>
    <div>
      <h3 className="font-bold text-base text-slate-900">
        Failed to load modal
      </h3>
      <p className="text-xs text-slate-600 mt-2 font-mono bg-slate-50 p-2 rounded border border-slate-200">
        {error.message}
      </p>
    </div>
    <button
      onClick={resetErrorBoundary}
      className="px-3 py-1.5 text-sm bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
    >
      Close
    </button>
  </div>
);
