import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, AlertCircle, Server, GitBranch } from 'lucide-react'
import { getHealth } from '../services/api'
import { PageHeader } from '../components/PageHeader'
import { LoadingSpinner } from '../components/LoadingSpinner'

export function SettingsPage() {
  const { data: health, isLoading } = useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
    retry: 1,
  })

  return (
    <div className="content-wrap">
      <PageHeader
        eyebrow="PLATFORM CONFIGURATION"
        title="Settings & Integrations"
        subtitle="Manage toolchain connectivity, container registries, GitOps engines, and observability endpoints."
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Core System Status */}
        <div className="panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Server size={16} style={{ color: '#65d6b4' }} />
            <h3 style={{ margin: 0, fontSize: 13, color: '#f3f4f6' }}>Core Platform Services</h3>
          </div>

          {isLoading ? (
            <LoadingSpinner label="Checking platform health..." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #1f2732' }}>
                <span style={{ color: '#c6ccd3' }}>Backend API (Spring Boot)</span>
                <span style={{ color: health?.status === 'UP' ? '#65d6b4' : '#f87171', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {health?.status === 'UP' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />} {health?.status || 'DOWN'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #1f2732' }}>
                <span style={{ color: '#c6ccd3' }}>MySQL 8.4 (Platform Metadata)</span>
                <span style={{ color: health?.database === 'UP' ? '#65d6b4' : '#f87171', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {health?.database === 'UP' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />} {health?.database || 'DISCONNECTED'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #1f2732' }}>
                <span style={{ color: '#c6ccd3' }}>Authentication Mode</span>
                <span style={{ color: '#cbd1d6', fontFamily: 'monospace' }}>JWT (HMAC-SHA256)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                <span style={{ color: '#c6ccd3' }}>Platform Version</span>
                <span style={{ color: '#65d6b4', fontFamily: 'monospace' }}>v1.0.0-GA</span>
              </div>
            </div>
          )}
        </div>

        {/* Third-Party Integrations */}
        <div className="panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <GitBranch size={16} style={{ color: '#60a5fa' }} />
            <h3 style={{ margin: 0, fontSize: 13, color: '#f3f4f6' }}>Toolchain & Infrastructure</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #1f2732' }}>
              <div>
                <strong style={{ display: 'block', color: '#f3f4f6' }}>GitHub API</strong>
                <small style={{ color: '#6f7a86' }}>Auto-provision repositories</small>
              </div>
              <span style={{ color: '#65d6b4' }}>Ready (via GITHUB_TOKEN)</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #1f2732' }}>
              <div>
                <strong style={{ display: 'block', color: '#f3f4f6' }}>Docker Hub</strong>
                <small style={{ color: '#6f7a86' }}>Container registry repository</small>
              </div>
              <span style={{ color: '#65d6b4' }}>Configured</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #1f2732' }}>
              <div>
                <strong style={{ display: 'block', color: '#f3f4f6' }}>ArgoCD GitOps</strong>
                <small style={{ color: '#6f7a86' }}>Declarative Kubernetes sync</small>
              </div>
              <span style={{ color: '#65d6b4' }}>Enabled</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
              <div>
                <strong style={{ display: 'block', color: '#f3f4f6' }}>SonarQube & Trivy</strong>
                <small style={{ color: '#6f7a86' }}>Automated code quality & CVE scans</small>
              </div>
              <span style={{ color: '#65d6b4' }}>Integrated</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
