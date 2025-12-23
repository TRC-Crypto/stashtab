/**
 * API Service for Mobile App
 *
 * Handles communication with the Stashtab API
 */

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8787';

interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };

      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: {
            message: data.error?.message || 'Request failed',
            code: data.error?.code,
          },
        };
      }

      return { data };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Network error',
        },
      };
    }
  }

  // Account endpoints
  async getAccount() {
    return this.request<{
      userId: string;
      safeAddress: string;
      ownerAddress: string;
      balance: {
        safeBalance: string;
        aaveBalance: string;
        totalBalance: string;
        totalDeposited: string;
        yieldEarned: string;
      };
      yieldRate: {
        apyPercent: number;
        liquidityRate: string;
        lastUpdated: number;
      };
    }>('/account');
  }

  async getBalance() {
    return this.request<{
      balance: {
        safeBalance: string;
        aaveBalance: string;
        totalBalance: string;
        totalDeposited: string;
        yieldEarned: string;
      };
      yieldRate: {
        apyPercent: number;
        liquidityRate: string;
        lastUpdated: number;
      };
    }>('/account/balance');
  }

  async send(to: string, amount: string) {
    return this.request<{
      message: string;
      status: string;
      to: string;
      amount: string;
    }>('/account/send', {
      method: 'POST',
      body: JSON.stringify({ to, amount }),
    });
  }

  async withdraw(to: string, amount: string) {
    return this.request<{
      message: string;
      status: string;
      to: string;
      amount: string;
    }>('/account/withdraw', {
      method: 'POST',
      body: JSON.stringify({ to, amount }),
    });
  }

  // Yield endpoints
  async getYieldRate() {
    return this.request<{
      apyPercent: number;
      liquidityRate: string;
      lastUpdated: number;
    }>('/yield/rate');
  }

  // KYC endpoints
  async getKYCStatus() {
    return this.request<{
      enabled: boolean;
      required: boolean;
      status: string;
      level: string;
      canTransact: boolean;
    }>('/kyc/status');
  }

  async startKYC(level: 'basic' | 'standard' | 'enhanced' = 'standard') {
    return this.request<{
      session: {
        id: string;
        verificationUrl: string;
        expiresAt: string;
      };
    }>('/kyc/start', {
      method: 'POST',
      body: JSON.stringify({ level }),
    });
  }

  // Notifications endpoints
  async registerPushToken(token: string, platform: 'ios' | 'android') {
    return this.request<{ success: boolean }>('/notifications/push-token', {
      method: 'POST',
      body: JSON.stringify({ token, platform }),
    });
  }
}

export const api = new ApiService();
export default api;
