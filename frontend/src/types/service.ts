export type ServiceStatus = 'PENDING' | 'PROVISIONING' | 'ACTIVE' | 'FAILED' | 'ARCHIVED'
export type DeploymentStatus = 'PENDING' | 'DEPLOYING' | 'RUNNING' | 'FAILED' | 'ROLLED_BACK'
export type PipelineStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED'

export interface Service {
  id: number
  name: string
  description: string
  language: string
  framework: string
  ownerEmail: string
  githubRepoUrl: string | null
  githubRepoName: string | null
  dockerImage: string | null
  status: ServiceStatus
  namespace: string
  port: number
  replicas: number
  createdAt: string
  updatedAt: string
}

export interface CreateServiceRequest {
  name: string
  description: string
  language: string
  framework: string
  namespace: string
  port: number
  replicas: number
}

export interface Deployment {
  id: number
  serviceId: number
  serviceName: string
  version: string
  environment: string
  status: DeploymentStatus
  imageTag: string | null
  deployedBy: string
  argocdAppUrl: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface PipelineRun {
  id: number
  serviceId: number
  serviceName: string
  runNumber: string
  status: PipelineStatus
  stage: string | null
  sonarqubeStatus: string | null
  sonarqubeUrl: string | null
  trivyStatus: string | null
  trivyCriticalCount: number
  trivyHighCount: number
  dockerImageTag: string | null
  logsUrl: string | null
  startedAt: string | null
  completedAt: string | null
  createdAt: string
}

export interface AuditLog {
  id: number
  actorEmail: string
  action: string
  resourceType: string
  resourceId: string | null
  detail: string | null
  ipAddress: string | null
  occurredAt: string
}

export interface PagedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  page: number
}

export interface DashboardMetrics {
  totalServices: number
  activeServices: number
  failedServices: number
  totalDeployments: number
  runningDeployments: number
  pipelineHealthPercent: number
  successPipelines: number
  failedPipelines: number
  recentActivity: { serviceName: string; status: string; timestamp: string }[]
}
