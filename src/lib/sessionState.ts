import type { ViewState } from '~/lib/constants';

const SESSION_STORAGE_KEY = 'viewState';

export function saveViewState(state: ViewState): void {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save view state:', error);
  }
}

export function loadViewState(): ViewState | null {
  try {
    const data = sessionStorage.getItem(SESSION_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load view state:', error);
    return null;
  }
}

export function clearViewState(): void {
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear view state:', error);
  }
}

export function useSessionState(initialState: ViewState) {
  const [state, setState] = useState<ViewState>(() => {
    const saved = loadViewState();
    return saved || initialState;
  });

  useEffect(() => {
    saveViewState(state);
  }, [state]);

  return [state, setState] as const;
}
