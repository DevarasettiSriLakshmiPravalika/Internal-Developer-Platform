import { useQuery } from '@tanstack/react-query'
import { Box, ExternalLink, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { getServices } from '../services/api'
import { StatusBadge } from '../components/StatusBadge'
import { PageHeader } from '../components/PageHeader'
import { EmptyState } from '../components/EmptyState'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { Pagination } from '../components/Pagination'
import type { Service } from '../types/service'

function languageColor(lang: string): string {
  const map: Record<string, string> = {
    java: '#f59e0b',
    python: '#60a5fa',
    nodejs: '#65d6b4',
    go: '#34d399',
    dotnet: '#a78bfa',
  }
  return map[lang?.toLowerCase()] ?? '#89939e'
}

export function ServicesPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['services', page],
    queryFn: () => getServices(page, 20),
    retry: 1,
  })

  const services: Service[] = data?.content ?? []

  return (
    <div className="content-wrap">
      <PageHeader
        eyebrow="SERVICES"
        title="Your services"
        subtitle="All microservices registered in the platform."
        action={
          <button className="primary-button" onClick={() => navigate('/services/new')}>
            <Plus size={16} /> Create service
          </button>
        }
      />

      {isLoading ? (
        <LoadingSpinner label="Loading services…" />
      ) : isError ? (
        <div style={{ color: '#f87171', fontSize: 12, padding: '24px 0' }}>
          Failed to load services. Check that the API is reachable.
        </div>
      ) : services.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={<Box size={20} />}
            title="No services yet"
            detail="Create your first service to start provisioning workloads on the platform."
            action={
              <button className="secondary-button" onClick={() => navigate('/services/new')}>
                Create service
              </button>
            }
          />
        </div>
      ) : (
        <div className="panel" style={{ minHeight: 'unset', padding: 0 }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 12,
              color: '#c6ccd3',
            }}
          >
            <thead>
              <tr style={{ borderBottom: '1px solid #27303a' }}>
                {['Name', 'Language', 'Status', 'GitHub Repo', 'Namespace', 'Created', ''].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        padding: '13px 16px',
                        textAlign: 'left',
                        color: '#67727e',
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: '0.06em',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h.toUpperCase()}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {services.map((svc) => (
                <tr
                  key={svc.id}
                  style={{ borderBottom: '1px solid #1d252e', cursor: 'pointer' }}
                  onClick={() => navigate(`/services/${svc.id}`)}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLTableRowElement).style.background = '#141a22')
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLTableRowElement).style.background = '')
                  }
                >
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{ color: '#f3f4f6', fontWeight: 600 }}>{svc.name}</span>
                    {svc.description && (
                      <div
                        style={{
                          color: '#5c6875',
                          fontSize: 10,
                          marginTop: 2,
                          maxWidth: 260,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {svc.description}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <span
                      style={{
                        color: languageColor(svc.language),
                        fontFamily: 'ui-monospace, monospace',
                        fontSize: 11,
                      }}
                    >
                      {svc.language}
                    </span>
                    {svc.framework && (
                      <span style={{ color: '#5c6875', fontSize: 10 }}> / {svc.framework}</span>
                    )}
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <StatusBadge status={svc.status} />
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    {svc.githubRepoUrl ? (
                      <a
                        href={svc.githubRepoUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: '#65d6b4',
                          fontSize: 11,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          textDecoration: 'none',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {svc.githubRepoName ?? 'Repo'} <ExternalLink size={10} />
                      </a>
                    ) : (
                      <span style={{ color: '#3e4a55', fontSize: 11 }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <span
                      style={{
                        color: '#89939e',
                        fontFamily: 'ui-monospace, monospace',
                        fontSize: 11,
                      }}
                    >
                      {svc.namespace}
                    </span>
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{ color: '#5c6875', fontSize: 11 }}>
                      {new Date(svc.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <button
                      className="secondary-button"
                      style={{ padding: '4px 10px', fontSize: 10 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/services/${svc.id}`)
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: '0 16px 16px' }}>
            <Pagination
              page={page}
              totalPages={data?.totalPages ?? 1}
              totalElements={data?.totalElements ?? services.length}
              onPrev={() => setPage((p) => Math.max(0, p - 1))}
              onNext={() => setPage((p) => p + 1)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
