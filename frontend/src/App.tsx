import { useEffect, useState, type ReactNode, type FormEvent } from 'react'
import { Activity, Bell, Box, ChevronDown, CircleHelp, GitBranch, LayoutDashboard, LockKeyhole, Plus, Search, Server, Settings, ShieldCheck, TerminalSquare } from 'lucide-react'
import './App.css'
import { LoginPage } from './pages/LoginPage'
import { createService, generateTemplate, getGitHubStatus, getServices } from './services/api'
import type { AuthResponse } from './types/auth'
import type { CreateServiceRequest, GitHubStatus, Service, TemplateResponse } from './types/service'

const navigation = [
  { label: 'Overview', icon: LayoutDashboard, active: true },
  { label: 'Services', icon: Box },
  { label: 'Deployments', icon: Server },
  { label: 'Repositories', icon: GitBranch },
  { label: 'Pipelines', icon: Activity },
  { label: 'Infrastructure', icon: TerminalSquare },
  { label: 'Observability', icon: Activity },
  { label: 'Security', icon: ShieldCheck },
  { label: 'Audit Logs', icon: LockKeyhole },
]

function App() {
  const [authResponse, setAuthResponse] = useState<AuthResponse | null>(() => {
    const accessToken = window.localStorage.getItem('forgeflow.accessToken')
    return accessToken ? { accessToken, tokenType: 'Bearer', expiresInSeconds: 3600 } : null
  })

  function handleAuthenticated(response: AuthResponse) {
    window.localStorage.setItem('forgeflow.accessToken', response.accessToken)
    setAuthResponse(response)
  }

  if (!authResponse) {
    return <LoginPage onAuthenticated={handleAuthenticated} />
  }

  return <Dashboard token={authResponse.accessToken} onLogout={() => { window.localStorage.removeItem('forgeflow.accessToken'); setAuthResponse(null) }} />
}

function Dashboard({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [github, setGithub] = useState<GitHubStatus | null>(null)
  const [template, setTemplate] = useState<TemplateResponse | null>(null)

  useEffect(() => {
    getServices(token).then(setServices).catch((requestError: unknown) => {
      const status = requestError && typeof requestError === 'object' && 'response' in requestError
        ? (requestError as { response?: { status?: number } }).response?.status : undefined
      if (status === 401) onLogout()
      else setError('Services could not be loaded. Check that the API is available.')
    }).finally(() => setLoading(false))
  }, [token, onLogout])

  useEffect(() => {
    getGitHubStatus(token).then(setGithub).catch(() => setGithub({ status: 'NOT_CONNECTED', message: 'GitHub status unavailable', repositories: [] }))
  }, [token])

  async function handleCreate(request: CreateServiceRequest) {
    try {
      const service = await createService(token, request)
      setServices((current) => [service, ...current])
      setShowCreate(false)
      setError('')
    } catch (requestError) {
      const message = requestError && typeof requestError === 'object' && 'response' in requestError
        ? (requestError as { response?: { data?: { message?: string } } }).response?.data?.message : undefined
      setError(message ?? 'Service could not be created.')
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">F</span><span>ForgeFlow</span></div>
        <div className="workspace-selector"><span className="workspace-dot" /> Platform team <ChevronDown size={14} /></div>
        <nav className="nav-list" aria-label="Main navigation">
          {navigation.map(({ label, icon: Icon, active }) => (
            <a className={active ? 'nav-item active' : 'nav-item'} href={`#${label.toLowerCase().replace(' ', '-')}`} key={label}>
              <Icon size={16} /> {label}
            </a>
          ))}
        </nav>
        <div className="sidebar-footer">
          <a className="nav-item" href="#settings"><Settings size={16} /> Settings</a>
          <button className="user-chip user-button" type="button" onClick={onLogout}><span className="avatar">JD</span><span><strong>Sign out</strong><small>Developer</small></span><ChevronDown size={14} /></button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumbs"><span>Workspace</span><span>/</span><strong>Overview</strong></div>
          <div className="topbar-actions"><div className="search"><Search size={15} /><span>Search</span><kbd>/</kbd></div><button className="icon-button" aria-label="Help"><CircleHelp size={17} /></button><button className="icon-button notification" aria-label="Notifications"><Bell size={17} /><span /></button></div>
        </header>

        <div className="content-wrap">
          <section className="page-heading"><div><p className="eyebrow">PLATFORM OVERVIEW</p><h1>Good morning, Jordan</h1><p className="subtitle">A clear view of your services, deployments, and platform health.</p></div><button className="primary-button" onClick={() => setShowCreate(true)}><Plus size={16} /> Create service</button></section>
          <section className="metric-grid" aria-label="Platform metrics">
            <Metric label="Services" value={String(services.length)} detail={services.length ? 'Registered services' : 'No services registered'} />
            <Metric label="Active deployments" value="0" detail="No deployments yet" />
            <Metric label="Pipeline health" value="--" detail="No pipeline runs" />
            <Metric label="Security posture" value="--" detail="No scans available" />
          </section>
          <section className="overview-grid">
            <div className="panel service-panel"><div className="panel-heading"><div><h2>Services</h2><p>Your registered microservices appear here.</p></div><button className="panel-action" onClick={() => setShowCreate(true)}><Plus size={14} /> Add service</button></div>{error && <p className="inline-error" role="alert">{error}</p>}{loading ? <div className="loading-state">Loading services...</div> : services.length ? <ServiceList services={services} onGenerate={async (id) => setTemplate(await generateTemplate(token, id))} /> : <EmptyState icon={<Box size={20} />} title="No services yet" detail="Create a service to begin provisioning your first workload." action="Create service" onAction={() => setShowCreate(true)} />}</div>
            <div className="panel status-panel"><div className="panel-heading"><div><h2>Platform connections</h2><p>Configured integrations and their availability.</p></div><a href="#settings">Manage</a></div><Connection name="GitHub" status={github?.status === 'CONNECTED' ? 'Connected' : 'Not connected'} tone={github?.status === 'CONNECTED' ? 'success' : 'neutral'} /><Connection name="Kubernetes" status="Unavailable" tone="warning" /><Connection name="Metrics" status="Unavailable" tone="warning" /></div>
          </section>
        </div>
      </main>
      {showCreate && <CreateServiceModal onClose={() => setShowCreate(false)} onSubmit={handleCreate} />}
      {template && <TemplateModal template={template} onClose={() => setTemplate(null)} />}
    </div>
  )
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <article className="metric"><span className="metric-label">{label}</span><strong>{value}</strong><small>{detail}</small></article>
}

function EmptyState({ icon, title, detail, action, onAction }: { icon: ReactNode; title: string; detail: string; action: string; onAction?: () => void }) {
  return <div className="empty-state"><span className="empty-icon">{icon}</span><h3>{title}</h3><p>{detail}</p><button className="secondary-button" onClick={onAction}>{action}</button></div>
}

function ServiceList({ services, onGenerate }: { services: Service[]; onGenerate: (id: string) => Promise<void> }) {
  return <div className="service-list">{services.map((service) => <div className="service-row" key={service.id}><span className="service-icon"><Box size={15} /></span><span className="service-details"><strong>{service.serviceName}</strong><small>{service.framework} · port {service.port}</small></span><span className="service-status"><span className="status-dot" /> {service.status}</span><button className="row-action" onClick={() => void onGenerate(service.id)}>Generate template</button></div>)}</div>
}

function TemplateModal({ template, onClose }: { template: TemplateResponse; onClose: () => void }) {
  return <div className="modal-backdrop"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="template-title"><div className="modal-heading"><div><p className="eyebrow">GENERATED ARTIFACTS</p><h2 id="template-title">{template.serviceName}</h2></div><button className="modal-close" type="button" onClick={onClose} aria-label="Close">×</button></div><div className="template-files">{template.files.map((file) => <div className="template-file" key={file.path}><strong>{file.path}</strong><pre>{file.content}</pre></div>)}</div></section></div>
}

function CreateServiceModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (request: CreateServiceRequest) => Promise<void> }) {
  const [form, setForm] = useState<CreateServiceRequest>({ serviceName: '', description: '', language: 'spring-boot', framework: 'Spring Boot 3', port: 8080 })
  const [submitting, setSubmitting] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSubmitting(true); await onSubmit(form); setSubmitting(false) }
  return <div className="modal-backdrop"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="create-service-title"><div className="modal-heading"><div><p className="eyebrow">SERVICE CATALOG</p><h2 id="create-service-title">Create service</h2></div><button className="modal-close" type="button" onClick={onClose} aria-label="Close">×</button></div><form className="service-form" onSubmit={submit}><label>Service name<input required pattern="[a-z0-9]([a-z0-9-]*[a-z0-9])?" maxLength={50} value={form.serviceName} onChange={(event) => setForm({ ...form, serviceName: event.target.value })} placeholder="orders-api" /></label><label>Description<textarea maxLength={500} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label><div className="form-grid"><label>Language<select value={form.language} onChange={(event) => setForm({ ...form, language: event.target.value as CreateServiceRequest['language'], framework: event.target.value === 'spring-boot' ? 'Spring Boot 3' : event.target.value === 'node' ? 'Node.js' : 'FastAPI' })}><option value="spring-boot">Spring Boot</option><option value="node">Node.js</option><option value="python">Python</option></select></label><label>Port<input type="number" min="1" max="65535" required value={form.port} onChange={(event) => setForm({ ...form, port: Number(event.target.value) })} /></label></div><div className="modal-actions"><button className="secondary-button" type="button" onClick={onClose}>Cancel</button><button className="primary-button" disabled={submitting}>{submitting ? 'Creating...' : 'Create service'}</button></div></form></section></div>
}

function Connection({ name, status, tone }: { name: string; status: string; tone: 'neutral' | 'warning' | 'success' }) {
  return <div className="connection"><span className={`status-dot ${tone}`} /><span className="connection-name">{name}</span><span className={`status-label ${tone}`}>{status}</span></div>
}

export default App
