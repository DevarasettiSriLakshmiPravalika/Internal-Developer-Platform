import axios from 'axios'
import type { AuthResponse, CurrentUser } from '../types/auth'
import type {
  DashboardMetrics,
  PagedResponse,
  Service,
  CreateServiceRequest,
  Deployment,
  PipelineRun,
  AuditLog,
} from '../types/service'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8090',
  headers: { 'Content-Type': 'application/json' },
})

// Auth interceptor — attach JWT if present
api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem('forgeflow.accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Health ────────────────────────────────────────────────────────────────────

export type HealthStatus = {
  status: string
  database: string
  message: string
}

export async function getHealth() {
  const response = await api.get<HealthStatus>('/api/health')
  return response.data
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function login(email: string, password: string) {
  const response = await api.post<AuthResponse>('/api/auth/login', { email, password })
  return response.data
}

export async function register(email: string, displayName: string, password: string) {
  const response = await api.post<AuthResponse>('/api/auth/register', { email, displayName, password })
  return response.data
}

export async function getCurrentUser(token?: string) {
  const response = await api.get<CurrentUser>('/api/auth/me', {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
  return response.data
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export async function getDashboard() {
  const response = await api.get<DashboardMetrics>('/api/dashboard')
  return response.data
}

// ── Services ──────────────────────────────────────────────────────────────────

export async function getServices(page = 0, size = 20) {
  const response = await api.get<PagedResponse<Service>>('/api/services', {
    params: { page, size },
  })
  return response.data
}

export async function createService(req: CreateServiceRequest) {
  const response = await api.post<Service>('/api/services', req)
  return response.data
}

export async function getService(id: number) {
  const response = await api.get<Service>(`/api/services/${id}`)
  return response.data
}

export async function deleteService(id: number) {
  await api.delete(`/api/services/${id}`)
}

// ── Deployments ───────────────────────────────────────────────────────────────

export async function getDeployments(page = 0, serviceId?: number) {
  const response = await api.get<PagedResponse<Deployment>>('/api/deployments', {
    params: { page, size: 20, ...(serviceId !== undefined ? { serviceId } : {}) },
  })
  return response.data
}

// ── Pipelines ─────────────────────────────────────────────────────────────────

export async function getPipelines(page = 0, serviceId?: number) {
  const response = await api.get<PagedResponse<PipelineRun>>('/api/pipelines', {
    params: { page, size: 20, ...(serviceId !== undefined ? { serviceId } : {}) },
  })
  return response.data
}

// ── Audit Logs ────────────────────────────────────────────────────────────────

export async function getAuditLogs(page = 0, actor?: string, resourceType?: string) {
  const response = await api.get<PagedResponse<AuditLog>>('/api/audit-logs', {
    params: {
      page,
      size: 20,
      ...(actor ? { actor } : {}),
      ...(resourceType ? { resourceType } : {}),
    },
  })
  return response.data
}
