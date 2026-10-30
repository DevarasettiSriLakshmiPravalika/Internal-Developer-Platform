import { useQuery } from '@tanstack/react-query'
import { Box } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getDashboard, getHealth } from '../services/api'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { PageHeader } from '../components/PageHeader'
import { useAuth } from '../context/AuthContext'

function MetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <article className="metric">
      <span className="metric-label">{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  )
}

function Connection({
  name,
  status,
  tone,
}: {
  name: string
  status: string
  tone: 'neutral' | 'warning' | 'success'
}) {
  return (
    <div className="connection">
      <span className={`status-dot ${tone}`} />
      <span className="connection-name">{name}</span>
      <span className={`status-label ${tone}`}>{status}</span>
    </div>
  )
}

export function OverviewPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
    retry: 1,
  })

  const { data: health } = useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
    retry: 1,
    refetchInterval: 30_000,
  })

  const firstName = user?.displayName?.split(' ')[0] ?? 'there'

  const pipelineHealthLabel =
    metrics !== undefined
      ? `${metrics.pipelineHealthPercent.toFixed(0)}%`
      : '--'

  const securityLabel =
    metrics !== undefined
      ? metrics.failedPipelines === 0
        ? 'Clean'
        : `${metrics.failedPipelines} issue${metrics.failedPipelines > 1 ? 's' : ''}`
      : '--'

  return (
    <div className="content-wrap">
      <PageHeader
        eyebrow="PLATFORM OVERVIEW"
        title={`Good morning, ${firstName}`}
        subtitle="A clear view of your services, deployments, and platform health."
        action={
          <button className="primary-button" onClick={() => navigate('/services/new')}>
            <Box size={16} /> Create service
          </button>
        }
      />

      {metricsLoading ? (
        <LoadingSpinner label="Fetching metrics…" />
      ) : (
        <>
          <section className="metric-grid" aria-label="Platform metrics">
            <MetricCard
              label="Services"
              value={String(metrics?.totalServices ?? 0)}
              detail={
                metrics?.totalServices
                  ? `${metrics.activeServices} active`
                  : 'No services registered'
              }
            />
            <MetricCard
              label="Active deployments"
              value={String(metrics?.runningDeployments ?? 0)}
              detail={
                metrics?.totalDeployments
                  ? `${metrics.totalDeployments} total`
                  : 'No deployments yet'
              }
            />
            <MetricCard
              label="Pipeline health"
              value={pipelineHealthLabel}
              detail={
                metrics
                  ? `${metrics.successPipelines} passed / ${metrics.failedPipelines} failed`
                  : 'No pipeline runs'
              }
            />
            <MetricCard
              label="Security posture"
              value={securityLabel}
              detail={metrics ? 'Based on latest Trivy scans' : 'No scans available'}
            />
          </section>

          <section className="overview-grid">
            {/* Recent Activity */}
            <div className="panel service-panel">
              <div className="panel-heading">
                <div>
                  <h2>Recent activity</h2>
                  <p>Latest service and deployment events across the platform.</p>
                </div>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    navigate('/services')
                  }}
                >
                  View services
                </a>
              </div>
              {!metrics?.recentActivity?.length ? (
                <div className="empty-state">
                  <span className="empty-icon">
                    <Box size={20} />
                  </span>
                  <h3>No recent activity</h3>
                  <p>Create a service to begin provisioning your first workload.</p>
                  <button className="secondary-button" onClick={() => navigate('/services/new')}>
                    Create service
                  </button>
                </div>
              ) : (
                <div style={{ paddingTop: 8 }}>
                  {metrics.recentActivity.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 2px',
                        borderBottom: '1px solid #1d252e',
                        fontSize: 12,
                      }}
                    >
                      <span style={{ color: '#c6ccd3', fontWeight: 500 }}>{item.serviceName}</span>
                      <span
                        style={{
                          color:
                            item.status === 'ACTIVE' || item.status === 'RUNNING'
                              ? '#65d6b4'
                              : item.status === 'FAILED'
                                ? '#f87171'
                                : '#f59e0b',
                          fontSize: 11,
                          fontFamily: 'ui-monospace, monospace',
                        }}
                      >
                        {item.status}
                      </span>
                      <span style={{ color: '#5c6875', fontSize: 10 }}>
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Platform Connections */}
            <div className="panel status-panel">
              <div className="panel-heading">
                <div>
                  <h2>Platform connections</h2>
                  <p>Configured integrations and their availability.</p>
                </div>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    navigate('/settings')
                  }}
                >
                  Manage
                </a>
              </div>
              <Connection
                name="ForgeFlow API"
                status={health?.status === 'UP' ? 'Connected' : 'Unavailable'}
                tone={health?.status === 'UP' ? 'success' : 'warning'}
              />
              <Connection
                name="Database"
                status={
                  health?.database === 'UP'
                    ? 'Connected'
                    : health
                      ? 'Unavailable'
                      : 'Not connected'
                }
                tone={health?.database === 'UP' ? 'success' : 'warning'}
              />
              <Connection name="GitHub" status="Not connected" tone="neutral" />
              <Connection name="Kubernetes" status="Unavailable" tone="warning" />
              <Connection name="Metrics (Prometheus)" status="Unavailable" tone="warning" />
            </div>
          </section>
        </>
      )}
    </div>
  )
}
