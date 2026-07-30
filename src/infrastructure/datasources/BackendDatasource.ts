'use server';

import { cookies } from 'next/headers';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

import { BackendResponseInterface } from '@/infrastructure/interfaces/BackendResponseInterface';

type BackendRequestConfig = AxiosRequestConfig & {
  token?: string;
};

const AUTH_COOKIE_NAME = 'auth_token';
const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export class BackendDataSource {
  private readonly url: string | undefined;
  private readonly client: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    this.url = process.env.EXPO_PUBLIC_BACKEND_URL;
    if (!this.url) {
      throw new Error('Backend URL not found in environment variables');
    }

    this.client = axios.create({
      baseURL: this.url,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  async setAuthTokenCookie(token: string): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);
  }

  async clearAuthTokenCookie(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_COOKIE_NAME);
  }

  async getAuthTokenCookie(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null;
  }
  
  async get<TResponse>(
    path: string,
    config?: BackendRequestConfig
  ): Promise<BackendResponseInterface<TResponse>> {
    try {
      const response = await this.client.get<BackendResponseInterface<TResponse>>(path, await this.buildConfig(config));
      return response.data;
    } catch (error) {
      throw this.toDatasourceError(error);
    }
  }

  async post<TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    config?: BackendRequestConfig
  ): Promise<TResponse> {
    try {
      const response = await this.client.post<BackendResponseInterface<TResponse>>(path, body, await this.buildConfig(config));
      return response.data.data;
    } catch (error) {
      throw this.toDatasourceError(error);
    }
  }

  async put<TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    config?: BackendRequestConfig
  ): Promise<TResponse> {
    try {
      const response = await this.client.put<BackendResponseInterface<TResponse>>(path, body, await this.buildConfig(config));
      return response.data.data;
    } catch (error) {
      throw this.toDatasourceError(error);
    }
  }

  async patch<TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    config?: BackendRequestConfig
  ): Promise<TResponse> {
    try {
      const response = await this.client.patch<BackendResponseInterface<TResponse>>(path, body, await this.buildConfig(config));
      return response.data.data;
    } catch (error) {
      throw this.toDatasourceError(error);
    }
  }

  private async buildConfig(config?: BackendRequestConfig): Promise<AxiosRequestConfig> {
    const requestToken = config?.token ?? this.authToken ?? await this.getAuthTokenCookie();
    const authorization = requestToken
      ? requestToken.startsWith('Bearer ')
        ? requestToken
        : `Bearer ${requestToken}`
      : null;

    const headers = {
      ...(config?.headers ?? {}),
      ...(authorization ? { Authorization: authorization } : {}),
    };

    const { token, ...axiosConfig } = config ?? {};
    void token;

    return {
      ...axiosConfig,
      headers,
    };
  }

  private toDatasourceError(error: unknown): Error {
    if (!axios.isAxiosError(error)) {
      return new Error('Unexpected error calling backend API');
    }

    const axiosError = error as AxiosError<{ message?: string }>;
    const status = axiosError.response?.status;
    const message =
      axiosError.response?.data?.message ??
      axiosError.message ??
      'Backend request failed';

    return new Error(status ? `[${status}] ${message}` : message);
  }

}

export const apiClient = new BackendDataSource();