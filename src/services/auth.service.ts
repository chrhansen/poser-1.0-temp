import type { User } from "@/lib/types";
import { mockUser } from "./mock-data";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// In-memory auth state for mock mode
let _currentUser: User | null = null;
let _authListeners: Array<(user: User | null) => void> = [];

function notifyListeners() {
  _authListeners.forEach((fn) => fn(_currentUser));
}

// TODO_BACKEND_HOOKUP: Replace all methods with real Supabase auth calls
export const authService = {
  getCurrentUser: async (): Promise<User | null> => {
    await delay(200);
    return _currentUser;
  },

  signInWithEmail: async (email: string, _password: string): Promise<User> => {
    // TODO_BACKEND_HOOKUP
    await delay(600);
    _currentUser = { ...mockUser, email };
    notifyListeners();
    return _currentUser;
  },

  signUpWithEmail: async (email: string, _password: string): Promise<{ needsConfirmation: boolean }> => {
    // TODO_BACKEND_HOOKUP
    await delay(600);
    return { needsConfirmation: true };
  },

  signOut: async (): Promise<void> => {
    // TODO_BACKEND_HOOKUP
    await delay(200);
    _currentUser = null;
    notifyListeners();
  },

  confirmEmail: async (_token: string): Promise<boolean> => {
    // TODO_BACKEND_HOOKUP
    await delay(500);
    _currentUser = { ...mockUser };
    notifyListeners();
    return true;
  },

  onAuthStateChange: (listener: (user: User | null) => void) => {
    _authListeners.push(listener);
    return () => {
      _authListeners = _authListeners.filter((fn) => fn !== listener);
    };
  },

  /** Mock helper: instantly set signed-in state for dev */
  _mockSignIn: () => {
    _currentUser = { ...mockUser };
    notifyListeners();
  },
};
