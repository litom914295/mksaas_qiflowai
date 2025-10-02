'use client'

// Demo mode authentication mock
import { 
  AuthenticatedUser, 
  AuthError,
  GuestSession,
  CreateGuestSessionParams,
  LoginCredentials,
  RegisterData 
} from './types';

class DemoAuthClient {
  private static instance: DemoAuthClient;
  private localGuests: Map<string, GuestSession> = new Map();
  private localUsers: Map<string, AuthenticatedUser> = new Map();

  public static getInstance(): DemoAuthClient {
    if (!DemoAuthClient.instance) {
      DemoAuthClient.instance = new DemoAuthClient();
    }
    return DemoAuthClient.instance;
  }

  // Demo guest session creation
  public async createGuestSession(params?: CreateGuestSessionParams): Promise<{
    session: GuestSession | null;
    error: AuthError | null;
  }> {
    const sessionId = 'guest_' + Math.random().toString(36).substr(2, 9);
    const sessionToken = 'demo_token_' + sessionId;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const session: GuestSession = {
      id: sessionId,
      sessionToken,
      tempBirthDate: params?.tempBirthDate,
      tempBirthTime: params?.tempBirthTime,
      tempBirthLocation: params?.tempBirthLocation,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString(),
      analysisCount: 0,
      maxAnalyses: params?.maxAnalyses || 3,
    };

    this.localGuests.set(sessionToken, session);

    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('qiflow_demo_guest_token', sessionToken);
    }

    return { session, error: null };
  }

  // Get guest session
  public async getGuestSession(token: string): Promise<{
    session: GuestSession | null;
    error: AuthError | null;
  }> {
    const session = this.localGuests.get(token);
    if (!session) {
      return { session: null, error: 'GUEST_SESSION_EXPIRED' };
    }

    if (new Date(session.expiresAt) < new Date()) {
      this.localGuests.delete(token);
      return { session: null, error: 'GUEST_SESSION_EXPIRED' };
    }

    return { session, error: null };
  }

  // Demo user registration
  public async signUp(data: RegisterData): Promise<{
    user: any | null;
    error: AuthError | null;
  }> {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const userId = 'user_' + Math.random().toString(36).substr(2, 9);
    const user = {
      id: userId,
      email: data.email,
      aud: 'authenticated',
      app_metadata: {},
      user_metadata: {
        display_name: data.displayName
      },
      created_at: new Date().toISOString()
    };

    const authenticatedUser: AuthenticatedUser = {
      id: userId,
      email: data.email,
      displayName: data.displayName,
      role: 'user',
      preferredLocale: data.preferredLocale || 'zh-CN',
      timezone: data.timezone || 'Asia/Shanghai',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };

    this.localUsers.set(data.email, authenticatedUser);

    return { user, error: null };
  }

  // Demo user login
  public async signIn(credentials: LoginCredentials): Promise<{
    user: any | null;
    error: AuthError | null;
  }> {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = this.localUsers.get(credentials.email);
    if (!user) {
      return { user: null, error: 'INVALID_CREDENTIALS' };
    }

    // For demo, accept any password
    const demoUser = {
      id: user.id,
      email: user.email,
      aud: 'authenticated',
      app_metadata: {},
      user_metadata: {
        display_name: user.displayName
      },
      created_at: user.createdAt
    };

    return { user: demoUser, error: null };
  }

  // Get current session (demo)
  public async getCurrentSession(): Promise<any> {
    // For demo, return null (no persistent session)
    return null;
  }

  // Get user profile
  public async getUserProfile(userId: string): Promise<{
    user: AuthenticatedUser | null;
    error: AuthError | null;
  }> {
    const user = Array.from(this.localUsers.values()).find(u => u.id === userId);
    return { user: user || null, error: user ? null : 'USER_NOT_FOUND' };
  }

  // Placeholder methods
  public async signOut() { return { error: null }; }
  public async updateGuestSession() { return { error: null }; }
  public async updateUserProfile() { return { error: null }; }
  public async updateSensitiveData() { return { error: null }; }
  public async resetPassword() { return { error: null }; }
  public onAuthStateChange() { 
    return { 
      data: { subscription: { unsubscribe: () => {} } }
    }; 
  }
}

// Check if we're in demo mode
const isDemoMode = process.env.DEMO_MODE === 'true' || 
                   process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://demo.supabase.co';

export const getDemoAuth = () => DemoAuthClient.getInstance();
export const getSupabaseAuth = isDemoMode ? getDemoAuth : () => {
  throw new Error('Real Supabase not configured. Please set up your environment variables or use demo mode.');
};