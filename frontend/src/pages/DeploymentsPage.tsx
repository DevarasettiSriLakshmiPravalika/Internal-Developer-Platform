import { useQuery } from '@tanstack/react-query'
import { Server, ExternalLink, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getDeployments } from '../services/api'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/StatusBadge'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { EmptyState } from '../components/EmptyState'
import { Pagination } from '../components/Pagination'
import type { Deployment } from '../types/service'

export function DeploymentsPage() {
  const [page, setPage] = useState(0)

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['deployments', page],
    queryFn: () => getDeployments(page),
    retry: 1,
  })

  const deployments: Deployment[] = data?.content ?? []

  return (
    <div className="content-wrap">
      <PageHeader
        eyebrow="GITOPS WORKFLOW"
        title="Deployments"
        subtitle="Manage and inspect deployments synchronized through ArgoCD across Kubernetes clusters."
        action={
          <button className="secondary-button" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw size={14} className={isFetching ? 'spin' : ''} /> Refresh
          </button>
        }
      />

      {isLoading ? (
        <LoadingSpinner label="Loading deployments..." />
      ) : isError ? (
        <div style={{ color: '#f87171', fontSize: 12, padding: '24px 0' }}>
          Failed to load deployments. Check that the API is running.
        </div>
      ) : deployments.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={<Server size={20} />}
            title="No deployments found"
            detail="When services are provisioned and pushed to main, ArgoCD triggers deployments here."
          />
        </div>
      ) : (
        <div className="panel" style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #27303a', color: '#6f7a86', textAlign: 'left', background: '#0e131a' }}>
                  <th style={{ padding: '14px 16px' }}>Service</th>
                  <th style={{ padding: '14px 16px' }}>Version</th>
                  <th style={{ padding: '14px 16px' }}>Environment</th>
                  <th style={{ padding: '14px 16px' }}>Status</th>
                  <th style={{ padding: '14px 16px' }}>Docker Image Tag</th>
                  <th style={{ padding: '14px 16px' }}>Deployed By</th>
                  <th style={{ padding: '14px 16px' }}>GitOps / ArgoCD</th>
                  <th style={{ padding: '14px 16px' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {deployments.map((d) => (
                  <tr key={d.id} style={{ borderBottom: '1px solid #1a222c', color: '#cbd1d6' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                      <Link
                        to={`/services/${d.serviceId}`}
                        style={{ color: '#f3f4f6', textDecoration: 'none' }}
                      >
                        {d.serviceName}
                      </Link>
                    </td>
                    <td style={{ padding: '14px 16px' }}>v{d.version}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          background: d.environment === 'production' ? '#1f2937' : '#14272a',
                          padding: '3px 8px',
                          borderRadius: 4,
                          fontSize: 11,
                          textTransform: 'capitalize',
                        }}
                      >
                        {d.environment}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <StatusBadge status={d.status} />
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: '#65d6b4' }}>
                      {d.imageTag || 'latest'}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#89939e' }}>{d.deployedBy}</td>
                    <td style={{ padding: '14px 16px' }}>
                      {d.argocdAppUrl ? (
                        <a
                          href={d.argocdAppUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: '#60a5fa', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        >
                          ArgoCD App <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span style={{ color: '#6f7a86' }}>Synced</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#6f7a86' }}>
                      {new Date(d.createdAt).toLocaleString()}
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
