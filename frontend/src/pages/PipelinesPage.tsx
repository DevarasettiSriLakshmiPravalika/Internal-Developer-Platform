import { useQuery } from '@tanstack/react-query'
import { Activity, CheckCircle2, ExternalLink, RefreshCw, ShieldAlert } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getPipelines } from '../services/api'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/StatusBadge'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { EmptyState } from '../components/EmptyState'
import { Pagination } from '../components/Pagination'
import type { PipelineRun } from '../types/service'

export function PipelinesPage() {
  const [page, setPage] = useState(0)

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['pipelines', page],
    queryFn: () => getPipelines(page),
    retry: 1,
  })

  const pipelines: PipelineRun[] = data?.content ?? []

  return (
    <div className="content-wrap">
      <PageHeader
        eyebrow="CONTINUOUS INTEGRATION"
        title="CI/CD Pipelines"
        subtitle="Live automated pipelines orchestrating SonarQube checks, Docker builds, and Trivy security scans."
        action={
          <button className="secondary-button" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw size={14} className={isFetching ? 'spin' : ''} /> Refresh
          </button>
        }
      />

      {isLoading ? (
        <LoadingSpinner label="Loading pipeline runs..." />
      ) : isError ? (
        <div style={{ color: '#f87171', fontSize: 12, padding: '24px 0' }}>
          Failed to load pipelines. Check that the backend is active.
        </div>
      ) : pipelines.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={<Activity size={20} />}
            title="No pipeline runs recorded"
            detail="Pipeline runs triggered by Jenkins or GitHub Actions will report here."
          />
        </div>
      ) : (
        <div className="panel" style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #27303a', color: '#6f7a86', textAlign: 'left', background: '#0e131a' }}>
                  <th style={{ padding: '14px 16px' }}>Run</th>
                  <th style={{ padding: '14px 16px' }}>Service</th>
                  <th style={{ padding: '14px 16px' }}>Status</th>
                  <th style={{ padding: '14px 16px' }}>Stage</th>
                  <th style={{ padding: '14px 16px' }}>SonarQube</th>
                  <th style={{ padding: '14px 16px' }}>Trivy Vulnerabilities</th>
                  <th style={{ padding: '14px 16px' }}>Docker Image Tag</th>
                  <th style={{ padding: '14px 16px' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {pipelines.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #1a222c', color: '#cbd1d6' }}>
                    <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontWeight: 600 }}>
                      #{p.runNumber}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <Link
                        to={`/services/${p.serviceId}`}
                        style={{ color: '#f3f4f6', textDecoration: 'none', fontWeight: 500 }}
                      >
                        {p.serviceName}
                      </Link>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <StatusBadge status={p.status} />
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ background: '#1c2430', padding: '3px 7px', borderRadius: 3, fontSize: 11 }}>
                        {p.stage || 'EXECUTION'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {p.sonarqubeUrl ? (
                        <a
                          href={p.sonarqubeUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: '#65d6b4', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        >
                          {p.sonarqubeStatus || 'Passed'} <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span style={{ color: p.sonarqubeStatus === 'FAILED' ? '#f87171' : '#65d6b4' }}>
                          {p.sonarqubeStatus || 'Passed'}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {p.trivyCriticalCount > 0 ? (
                        <span style={{ color: '#f87171', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <ShieldAlert size={14} /> {p.trivyCriticalCount} Critical, {p.trivyHighCount} High
                        </span>
                      ) : (
                        <span style={{ color: '#65d6b4', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <CheckCircle2 size={14} /> 0 Vulnerabilities
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: '#89939e' }}>
                      {p.dockerImageTag || '—'}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#6f7a86' }}>
                      {new Date(p.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data && data.totalPages > 1 && (
            <div style={{ padding: 14 }}>
              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                totalElements={data.totalElements}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
