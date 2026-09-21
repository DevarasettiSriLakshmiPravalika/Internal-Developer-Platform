export type Service = {
  id: string
  serviceName: string
  description: string
  language: 'spring-boot' | 'node' | 'python'
  framework: string
  port: number
  ownerEmail: string
  status: 'REGISTERED'
  createdAt: string
  updatedAt: string
}

export type CreateServiceRequest = Pick<Service, 'serviceName' | 'description' | 'language' | 'framework' | 'port'>
export type TemplateResponse = {
  serviceName: string
  language: Service['language']
  files: Array<{ path: string; content: string }>
}

export type GitHubStatus = {
  status: 'CONNECTED' | 'NOT_CONNECTED'
  message: string
  repositories: Array<{ name: string; url: string; isPrivate: boolean; defaultBranch: string }>
}
