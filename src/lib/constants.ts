export interface LinkData {
  url: string;
  title: string;
  timestamp: number;
  pinned?: boolean;
}

export type ViewState = {
  currentView: 'main' | 'recent' | 'detail'
  previousView?: 'main' | 'recent' | 'detail'
  transitionDirection?: 'forward' | 'back'
  lastInteraction: number
};

export const PROJECT_ID = 'farcaster-frames-template';
export const PROJECT_TITLE = "Farcaster Frames Template";
export const PROJECT_DESCRIPTION = "A Farcaster Frames v2 Template by hellno";
