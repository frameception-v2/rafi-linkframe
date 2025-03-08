"use client";

import { createContext, useContext, useReducer } from "react";
import { type LinkData } from "~/lib/constants";

type LinkState = {
  links: LinkData[];
  currentView: 'main' | 'recent';
};

const LinkContext = createContext<{
  state: LinkState;
  dispatch: React.Dispatch<any>;
}>({
  state: { links: [], currentView: 'main' },
  dispatch: () => null
});

export function LinkProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(
    (state: LinkState, action: any) => state,
    { links: [], currentView: 'main' }
  );

  return (
    <LinkContext.Provider value={{ state, dispatch }}>
      {children}
    </LinkContext.Provider>
  );
}

export const useLinks = () => useContext(LinkContext);
