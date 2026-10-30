import { useQuery } from '@tanstack/react-query'
import { GitBranch, ExternalLink, RefreshCw, FolderGit2 } from 'lucide-react'
import { getServices } from '../services/api'
import { PageHeader } from '../components/PageHeader'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { EmptyState } from '../components/EmptyState'
import { Link } from 'react-router-dom'
import type { Service } from '../types/service'

export function RepositoriesPage() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['services', 'repos'],
    queryFn: () => getServices(0, 100),
    retry: 1,
  })

  const services: Service[] = data?.content ?? []

  return (
    <div className="content-wrap">
      <PageHeader
        eyebrow="SOURCE CONTROL"
        title="Repositories"
        subtitle="Git repositories provisioned automatically with starter templates, Dockerfiles, and Helm charts."
        action={
          <button className="secondary-button" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw size={14} className={isFetching ? 'spin' : ''} /> Refresh
          </button>
        }
      />

      {isLoading ? (
        <LoadingSpinner label="Loading repositories..." />
      ) : isError ? (
        <div style={{ color: '#f87171', fontSize: 12, padding: '24px 0' }}>
          Failed to load repositories.
        </div>
      ) : services.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={<FolderGit2 size={20} />}
            title="No repositories created yet"
            detail="When you create a microservice, ForgeFlow automatically provisions a GitHub repo with your CI/CD and Helm setup."
          />
        </div>
      ) : (
        <div className="panel" style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #27303a', color: '#6f7a86', textAlign: 'left', background: '#0e131a' }}>
                  <th style={{ padding: '14px 16px' }}>Service</th>
                  <th style={{ padding: '14px 16px' }}>Repository</th>
                  <th style={{ padding: '14px 16px' }}>Language</th>
                  <th style={{ padding: '14px 16px' }}>Container Registry</th>
                  <th style={{ padding: '14px 16px' }}>GitHub Link</th>
                  <th style={{ padding: '14px 16px' }}>Created</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #1a222c', color: '#cbd1d6' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                      <Link to={`/services/${s.id}`} style={{ color: '#f3f4f6', textDecoration: 'none' }}>
                        {s.name}
                      </Link>
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: 'monospace' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <GitBranch size={13} style={{ color: '#65d6b4' }} />
                        {s.githubRepoName || `forgeflow/${s.name}`}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textTransform: 'capitalize' }}>{s.language}</td>
                    <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: '#89939e' }}>
                      {s.dockerImage || `forgeflow/${s.name}:latest`}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {s.githubRepoUrl ? (
                        <a
                          href={s.githubRepoUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: '#60a5fa', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        >
                          Open on GitHub <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span style={{ color: '#6f7a86' }}>Local scaffold</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#6f7a86' }}>
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
