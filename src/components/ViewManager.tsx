"use client";

import { useEffect, useCallback } from "react";
import { type ViewState } from "~/lib/constants";

type ViewManagerProps = {
  viewState: ViewState;
  onViewChange: (newState: ViewState) => void;
  children: React.ReactNode;
};

export default function ViewManager({ viewState, onViewChange, children }: ViewManagerProps) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (['ArrowLeft', 'ArrowRight', 'Enter'].includes(event.key)) {
      event.preventDefault();
      event.stopPropagation();

      const newState: ViewState = { ...viewState, lastInteraction: Date.now() };

      switch (event.key) {
        case 'ArrowLeft':
          newState.currentView = 'main';
          newState.transitionDirection = 'back';
          break;
        case 'ArrowRight':
          newState.currentView = 'recent';
          newState.transitionDirection = 'forward';
          break;
        case 'Enter':
          if (viewState.currentView === 'main') {
            newState.currentView = 'detail';
            newState.transitionDirection = 'forward';
          }
          break;
      }

      onViewChange(newState);
    }
  }, [viewState, onViewChange]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div 
      className="relative overflow-hidden"
      role="region"
      aria-label="Link navigation"
      tabIndex={0}
    >
      {children}
    </div>
  );
}
