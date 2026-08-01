'use server'

// Infrastructure
import { apiClient } from '@/infrastructure/datasources/BackendDatasource';

interface LoginRequestInterface {
	cellphone: string;
	password: string;
}

export async function login(cellphone: string, password: string): Promise<string|null> {
  const body: LoginRequestInterface = {
    cellphone: cellphone,
    password: password
  }

  try {
    const access_token = await apiClient.post<string|undefined>(
      '/security/login',
      body
    );

    if (typeof access_token === "string") apiClient.setAuthTokenCookie(access_token);

    return access_token ? access_token : null;
  } catch {
    return null;
  }
}