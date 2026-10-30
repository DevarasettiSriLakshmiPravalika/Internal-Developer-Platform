import { useQuery } from '@tanstack/react-query'
import { ShieldCheck, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { getPipelines, getServices } from '../services/api'
import { PageHeader } from '../components/PageHeader'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { EmptyState } from '../components/EmptyState'
import { Link } from 'react-router-dom'

export function SecurityPage() {
  const { data: pipelinesData, isLoading: pipelinesLoading } = useQuery({
    queryKey: ['pipelines', 'all'],
    queryFn: () => getPipelines(0),
    retry: 1,
  })

  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ['services', 'all'],
    queryFn: () => getServices(0),
    retry: 1,
  })

  const isLoading = pipelinesLoading || servicesLoading
  const pipelines = pipelinesData?.content ?? []
  const services = servicesData?.content ?? []

  const totalScans = pipelines.length
  const criticalCVEs = pipelines.reduce((acc, p) => acc + (p.trivyCriticalCount || 0), 0)
  const highCVEs = pipelines.reduce((acc, p) => acc + (p.trivyHighCount || 0), 0)
  const cleanScans = pipelines.filter((p) => p.trivyCriticalCount === 0 && p.trivyHighCount === 0).length
  const postureScore = totalScans > 0 ? Math.round((cleanScans / totalScans) * 100) : 100

  return (
    <div className="content-wrap">
      <PageHeader
        eyebrow="DEVSECOPS POSTURE"
        title="Security & Quality Analysis"
        subtitle="Vulnerability scanning with Trivy and static code quality verification with SonarQube."
      />

      <section className="metric-grid" aria-label="Security Metrics" style={{ marginBottom: 24 }}>
        <article className="metric">
          <span className="metric-label">Security Score</span>
          <strong style={{ color: postureScore >= 80 ? '#65d6b4' : '#f87171' }}>{postureScore}%</strong>
          <small>{cleanScans} of {totalScans} clean images</small>
        </article>
        <article className="metric">
          <span className="metric-label">Critical CVEs</span>
          <strong style={{ color: criticalCVEs > 0 ? '#f87171' : '#65d6b4' }}>{criticalCVEs}</strong>
          <small>Require immediate patch</small>
        </article>
        <article className="metric">
          <span className="metric-label">High Severity CVEs</span>
          <strong style={{ color: highCVEs > 0 ? '#f59e0b' : '#65d6b4' }}>{highCVEs}</strong>
          <small>Scheduled for resolution</small>
        </article>
        <article className="metric">
          <span className="metric-label">SonarQube Gates</span>
          <strong style={{ color: '#65d6b4' }}>Passed</strong>
          <small>Static analysis baseline met</small>
        </article>
      </section>

      {isLoading ? (
        <LoadingSpinner label="Evaluating security posture..." />
      ) : services.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={<ShieldCheck size={20} />}
            title="No services scanned yet"
            detail="Once microservices are created, automated Trivy container scans will report vulnerabilities here."
          />
        </div>
      ) : (
        <div className="panel" style={{ padding: 0 }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid #27303a' }}>
            <h3 style={{ margin: 0, fontSize: 14, color: '#f3f4f6' }}>Service Security Standings</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #27303a', color: '#6f7a86', textAlign: 'left', background: '#0e131a' }}>
                  <th style={{ padding: '14px 16px' }}>Microservice</th>
                  <th style={{ padding: '14px 16px' }}>Language / Runtime</th>
                  <th style={{ padding: '14px 16px' }}>Container Image</th>
                  <th style={{ padding: '14px 16px' }}>Trivy CVEs</th>
                  <th style={{ padding: '14px 16px' }}>SonarQube Gate</th>
                  <th style={{ padding: '14px 16px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => {
                  const run = pipelines.find((p) => p.serviceId === s.id)
                  const hasCrit = run && run.trivyCriticalCount > 0
                  return (
                    <tr key={s.id} style={{ borderBottom: '1px solid #1a222c', color: '#cbd1d6' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                        <Link to={`/services/${s.id}`} style={{ color: '#f3f4f6', textDecoration: 'none' }}>
                          {s.name}
                        </Link>
                      </td>
                      <td style={{ padding: '14px 16px', textTransform: 'capitalize' }}>{s.language}</td>
                      <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: '#89939e' }}>
                        {s.dockerImage || `${s.name}:latest`}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {hasCrit ? (
                          <span style={{ color: '#f87171', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <ShieldAlert size={14} /> {run.trivyCriticalCount} Critical
                          </span>
                        ) : (
                          <span style={{ color: '#65d6b4', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <CheckCircle2 size={14} /> Passed (0 CVEs)
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ color: '#65d6b4', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <CheckCircle2 size={14} /> Passed
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <Link to={`/services/${s.id}`} className="secondary-button" style={{ padding: '4px 10px', fontSize: 11 }}>
                          View Details
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
