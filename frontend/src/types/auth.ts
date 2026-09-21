export type Role = 'ADMIN' | 'DEVELOPER' | 'VIEWER'

export type AuthResponse = {
  accessToken: string
  tokenType: string
  expiresInSeconds: number
}

export type CurrentUser = {
  email: string
  displayName: string
  role: Role
}
