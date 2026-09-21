import axios from 'axios'
import type { AuthResponse, CurrentUser } from '../types/auth'
import type { CreateServiceRequest, GitHubStatus, Service, TemplateResponse } from '../types/service'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8090',
  headers: { 'Content-Type': 'application/json' },
})

export async function login(email: string, password: string) {
  const response = await api.post<AuthResponse>('/api/auth/login', { email, password })
  return response.data
}

export async function register(email: string, displayName: string, password: string) {
  const response = await api.post<AuthResponse>('/api/auth/register', { email, displayName, password })
  return response.data
}

export async function getCurrentUser(token: string) {
  const response = await api.get<CurrentUser>('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

const authConfig = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } })

export async function getServices(token: string) {
  const response = await api.get<Service[]>('/api/services', authConfig(token))
  return response.data
}

export async function createService(token: string, request: CreateServiceRequest) {
  const response = await api.post<Service>('/api/services', request, authConfig(token))
  return response.data
}

export async function generateTemplate(token: string, serviceId: string) {
  const response = await api.get<TemplateResponse>(`/api/services/${serviceId}/template`, authConfig(token))
  return response.data
}

export async function getGitHubStatus(token: string) {
  const response = await api.get<GitHubStatus>('/api/repositories', authConfig(token))
  return response.data
}
