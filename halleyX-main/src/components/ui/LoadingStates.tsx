import React from 'react';

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500">Loading data...</p>
      </div>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-slate-500 text-sm text-center">{message}</p>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="text-rose-500 text-sm mb-2">⚠️ Error</div>
        <p className="text-slate-600 text-sm">{message}</p>
      </div>
    </div>
  );
}
