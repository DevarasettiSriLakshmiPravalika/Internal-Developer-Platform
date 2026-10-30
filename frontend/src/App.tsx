import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, NavLink, Outlet, Navigate, useNavigate } from 'react-router-dom'
import {
  Activity,
  Bell,
  Box,
  ChevronDown,
  CircleHelp,
  FolderGit2,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Search,
  Server,
  Settings,
  ShieldCheck,
  TerminalSquare,
} from 'lucide-react'
import { useState } from 'react'
import './App.css'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LoginPage } from './pages/LoginPage'
import { OverviewPage } from './pages/OverviewPage'
import { ServicesPage } from './pages/ServicesPage'
import { CreateServicePage } from './pages/CreateServicePage'
import { ServiceDetailPage } from './pages/ServiceDetailPage'
import { DeploymentsPage } from './pages/DeploymentsPage'
import { PipelinesPage } from './pages/PipelinesPage'
import { RepositoriesPage } from './pages/RepositoriesPage'
import { ObservabilityPage } from './pages/ObservabilityPage'
import { SecurityPage } from './pages/SecurityPage'
import { AuditLogsPage } from './pages/AuditLogsPage'
import { SettingsPage } from './pages/SettingsPage'
import { LoadingSpinner } from './components/LoadingSpinner'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      refetchOnWindowFocus: false,
    },
  },
})

const navigation = [
  { label: 'Overview', to: '/', icon: LayoutDashboard },
  { label: 'Services', to: '/services', icon: Box },
  { label: 'Deployments', to: '/deployments', icon: Server },
  { label: 'Repositories', to: '/repositories', icon: FolderGit2 },
  { label: 'Pipelines', to: '/pipelines', icon: Activity },
  { label: 'Observability', to: '/observability', icon: TerminalSquare },
  { label: 'Security', to: '/security', icon: ShieldCheck },
  { label: 'Audit Logs', to: '/audit-logs', icon: LockKeyhole },
]

function ProtectedLayout() {
  const { user, token, isLoading, logout } = useAuth()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div style={{ height: '100vh', display: 'grid', placeItems: 'center', background: '#0b0f14' }}>
        <LoadingSpinner label="Authenticating session..." />
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  const initials = user?.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'ID'

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <span className="brand-mark">F</span>
          <span>ForgeFlow</span>
        </div>

        <div className="workspace-selector">
          <span className="workspace-dot" />
          <span>Platform Engineering</span>
          <ChevronDown size={14} />
        </div>

        <nav className="nav-list" aria-label="Main navigation">
          {navigation.map(({ label, to, icon: Icon }) => (
            <NavLink
              to={to}
              key={label}
              end={to === '/'}
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            >
              <Icon size={16} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <NavLink
            to="/settings"
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            <Settings size={16} />
            <span>Settings</span>
          </NavLink>

          <div
            className="user-chip"
            style={{ position: 'relative', cursor: 'pointer' }}
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <span className="avatar">{initials}</span>
            <span style={{ overflow: 'hidden' }}>
              <strong style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.displayName || 'Developer'}
              </strong>
              <small>{user?.role || 'DEVELOPER'}</small>
            </span>
            <ChevronDown size={14} />

            {userMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: 0,
                  right: 0,
                  marginBottom: 8,
                  background: '#151c24',
                  border: '1px solid #27303a',
                  borderRadius: 4,
                  padding: 6,
                  zIndex: 100,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                }}
              >
                <div style={{ padding: '6px 10px', fontSize: 11, color: '#89939e', borderBottom: '1px solid #27303a' }}>
                  {user?.email}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    logout()
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    width: '100%',
                    padding: '8px 10px',
                    background: 'none',
                    border: 'none',
                    color: '#f87171',
                    fontSize: 12,
                    cursor: 'pointer',
                    borderRadius: 3,
                    textAlign: 'left',
                  }}
                >
                  <LogOut size={13} /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>Workspace</span>
            <span>/</span>
            <strong>IDP Core</strong>
          </div>
          <div className="topbar-actions">
            <div className="search">
              <Search size={15} />
              <span>Search platform</span>
              <kbd>/</kbd>
            </div>
            <button className="icon-button" aria-label="Help">
              <CircleHelp size={17} />
            </button>
            <button className="icon-button notification" aria-label="Notifications">
              <Bell size={17} />
              <span />
            </button>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  )
}

function RootApp() {
  const { token, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div style={{ height: '100vh', display: 'grid', placeItems: 'center', background: '#0b0f14' }}>
        <LoadingSpinner label="Initializing..." />
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={token ? <Navigate to="/" replace /> : <LoginPage />}
      />

      <Route element={<ProtectedLayout />}>
        <Route index element={<OverviewPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="services/new" element={<CreateServicePage />} />
        <Route path="services/:id" element={<ServiceDetailPage />} />
        <Route path="deployments" element={<DeploymentsPage />} />
        <Route path="repositories" element={<RepositoriesPage />} />
        <Route path="pipelines" element={<PipelinesPage />} />
        <Route path="observability" element={<ObservabilityPage />} />
        <Route path="security" element={<SecurityPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <RootApp />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
