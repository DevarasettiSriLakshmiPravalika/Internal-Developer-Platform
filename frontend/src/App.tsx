import type { ReactNode } from 'react'
import { Activity, Bell, Box, ChevronDown, CircleHelp, GitBranch, LayoutDashboard, LockKeyhole, Search, Server, Settings, ShieldCheck, TerminalSquare } from 'lucide-react'
import './App.css'

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
          <div className="user-chip"><span className="avatar">JD</span><span><strong>Jordan Davis</strong><small>Developer</small></span><ChevronDown size={14} /></div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumbs"><span>Workspace</span><span>/</span><strong>Overview</strong></div>
          <div className="topbar-actions"><div className="search"><Search size={15} /><span>Search</span><kbd>/</kbd></div><button className="icon-button" aria-label="Help"><CircleHelp size={17} /></button><button className="icon-button notification" aria-label="Notifications"><Bell size={17} /><span /></button></div>
        </header>

        <div className="content-wrap">
          <section className="page-heading"><div><p className="eyebrow">PLATFORM OVERVIEW</p><h1>Good morning, Jordan</h1><p className="subtitle">A clear view of your services, deployments, and platform health.</p></div><button className="primary-button"><Box size={16} /> Create service</button></section>
          <section className="metric-grid" aria-label="Platform metrics">
            <Metric label="Services" value="0" detail="No services registered" />
            <Metric label="Active deployments" value="0" detail="No deployments yet" />
            <Metric label="Pipeline health" value="--" detail="No pipeline runs" />
            <Metric label="Security posture" value="--" detail="No scans available" />
          </section>
          <section className="overview-grid">
            <div className="panel service-panel"><div className="panel-heading"><div><h2>Services</h2><p>Your registered microservices appear here.</p></div><a href="#services">View all</a></div><EmptyState icon={<Box size={20} />} title="No services yet" detail="Create a service to begin provisioning your first workload." action="Create service" /></div>
            <div className="panel status-panel"><div className="panel-heading"><div><h2>Platform connections</h2><p>Configured integrations and their availability.</p></div><a href="#settings">Manage</a></div><Connection name="GitHub" status="Not connected" tone="neutral" /><Connection name="Kubernetes" status="Unavailable" tone="warning" /><Connection name="Metrics" status="Unavailable" tone="warning" /></div>
          </section>
        </div>
      </main>
    </div>
  )
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <article className="metric"><span className="metric-label">{label}</span><strong>{value}</strong><small>{detail}</small></article>
}

function EmptyState({ icon, title, detail, action }: { icon: ReactNode; title: string; detail: string; action: string }) {
  return <div className="empty-state"><span className="empty-icon">{icon}</span><h3>{title}</h3><p>{detail}</p><button className="secondary-button">{action}</button></div>
}

function Connection({ name, status, tone }: { name: string; status: string; tone: 'neutral' | 'warning' }) {
  return <div className="connection"><span className={`status-dot ${tone}`} /><span className="connection-name">{name}</span><span className={`status-label ${tone}`}>{status}</span></div>
}

export default App
