import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import { ArrowLeft, ExternalLink, GitBranch, Server, Terminal, Trash2, CheckCircle2, ShieldAlert } from 'lucide-react'
import { getService, deleteService, getDeployments, getPipelines } from '../services/api'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/StatusBadge'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { EmptyState } from '../components/EmptyState'

export function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const serviceId = Number(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'overview' | 'deployments' | 'pipelines'>('overview')

  const { data: service, isLoading, isError } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: () => getService(serviceId),
    enabled: !isNaN(serviceId),
    retry: 1,
  })

  const { data: deploymentsData } = useQuery({
    queryKey: ['deployments', serviceId],
    queryFn: () => getDeployments(0, serviceId),
    enabled: !isNaN(serviceId) && activeTab === 'deployments',
    retry: 1,
  })

  const { data: pipelinesData } = useQuery({
    queryKey: ['pipelines', serviceId],
    queryFn: () => getPipelines(0, serviceId),
    enabled: !isNaN(serviceId) && activeTab === 'pipelines',
    retry: 1,
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteService(serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      navigate('/services')
    },
  })

  if (isLoading) {
    return (
      <div className="content-wrap">
        <LoadingSpinner label="Loading service details..." />
      </div>
    )
  }

  if (isError || !service) {
    return (
      <div className="content-wrap">
        <div style={{ color: '#f87171', padding: '24px 0' }}>Service not found or failed to load.</div>
        <button className="secondary-button" onClick={() => navigate('/services')}>
          <ArrowLeft size={14} /> Back to services
        </button>
      </div>
    )
  }

  const deployments = deploymentsData?.content ?? []
  const pipelines = pipelinesData?.content ?? []

  return (
    <div className="content-wrap">
      <div style={{ marginBottom: 16 }}>
        <Link to="/services" style={{ color: '#89939e', textDecoration: 'none', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft size={14} /> Back to services
        </Link>
      </div>

      <PageHeader
        eyebrow="SERVICE DETAILS"
        title={service.name}
        subtitle={service.description || 'No description provided.'}
        action={
          <div style={{ display: 'flex', gap: 10 }}>
            {service.githubRepoUrl && (
              <a
                href={service.githubRepoUrl}
                target="_blank"
                rel="noreferrer"
                className="secondary-button"
                style={{ textDecoration: 'none' }}
              >
                <GitBranch size={14} /> Repository <ExternalLink size={12} />
              </a>
            )}
            <button
              className="secondary-button"
              style={{ color: '#f87171', borderColor: '#4a2528' }}
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete ${service.name}?`)) {
                  deleteMutation.mutate()
                }
              }}
              disabled={deleteMutation.isPending}
            >
              <Trash2 size={14} /> {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        }
      />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid #27303a', marginBottom: 24 }}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'overview' ? '2px solid #65d6b4' : '2px solid transparent',
            color: activeTab === 'overview' ? '#f3f4f6' : '#89939e',
            padding: '10px 4px',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Overview & Manifests
        </button>
        <button
          onClick={() => setActiveTab('deployments')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'deployments' ? '2px solid #65d6b4' : '2px solid transparent',
            color: activeTab === 'deployments' ? '#f3f4f6' : '#89939e',
            padding: '10px 4px',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Deployments
        </button>
        <button
          onClick={() => setActiveTab('pipelines')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'pipelines' ? '2px solid #65d6b4' : '2px solid transparent',
            color: activeTab === 'pipelines' ? '#f3f4f6' : '#89939e',
            padding: '10px 4px',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Pipelines & Scans
        </button>
      </div>

      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(280px, 0.8fr)', gap: 16 }}>
          {/* Metadata Specs */}
          <div className="panel">
            <h3 style={{ margin: '0 0 16px', fontSize: 14, color: '#f3f4f6' }}>Service Configuration</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px', fontSize: 12 }}>
              <div>
                <span style={{ color: '#6f7a86', display: 'block', marginBottom: 4 }}>Status</span>
                <StatusBadge status={service.status} />
              </div>
              <div>
                <span style={{ color: '#6f7a86', display: 'block', marginBottom: 4 }}>Language / Runtime</span>
                <span style={{ color: '#cbd1d6', textTransform: 'capitalize' }}>
                  {service.language} {service.framework ? `(${service.framework})` : ''}
                </span>
              </div>
              <div>
                <span style={{ color: '#6f7a86', display: 'block', marginBottom: 4 }}>Kubernetes Namespace</span>
                <span style={{ color: '#cbd1d6', fontFamily: 'monospace' }}>{service.namespace}</span>
              </div>
              <div>
                <span style={{ color: '#6f7a86', display: 'block', marginBottom: 4 }}>Port</span>
                <span style={{ color: '#cbd1d6', fontFamily: 'monospace' }}>{service.port}</span>
              </div>
              <div>
                <span style={{ color: '#6f7a86', display: 'block', marginBottom: 4 }}>Replicas</span>
                <span style={{ color: '#cbd1d6', fontFamily: 'monospace' }}>{service.replicas} pods</span>
              </div>
              <div>
                <span style={{ color: '#6f7a86', display: 'block', marginBottom: 4 }}>Owner</span>
                <span style={{ color: '#cbd1d6' }}>{service.ownerEmail}</span>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: '#6f7a86', display: 'block', marginBottom: 4 }}>Docker Image</span>
                <span style={{ color: '#65d6b4', fontFamily: 'monospace' }}>
                  {service.dockerImage || `${service.name}:latest`}
                </span>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: '#6f7a86', display: 'block', marginBottom: 4 }}>GitHub Repository</span>
                {service.githubRepoUrl ? (
                  <a
                    href={service.githubRepoUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#60a5fa', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    {service.githubRepoName || service.githubRepoUrl} <ExternalLink size={12} />
                  </a>
                ) : (
                  <span style={{ color: '#89939e' }}>Repository generated locally (GitHub token not configured)</span>
                )}
              </div>
            </div>
          </div>

          {/* GitOps & Manifests Preview */}
          <div className="panel">
            <h3 style={{ margin: '0 0 12px', fontSize: 14, color: '#f3f4f6' }}>GitOps & Artifacts</h3>
            <p style={{ fontSize: 12, color: '#89939e', margin: '0 0 16px', lineHeight: 1.5 }}>
              ForgeFlow generated the following standard infrastructure artifacts for this service:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
              <div style={{ padding: '10px 12px', background: '#0b0f14', border: '1px solid #27303a', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Dockerfile ({service.language})</span>
                <span style={{ color: '#65d6b4' }}>Generated</span>
              </div>
              <div style={{ padding: '10px 12px', background: '#0b0f14', border: '1px solid #27303a', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>k8s/deployment.yaml</span>
                <span style={{ color: '#65d6b4' }}>Generated</span>
              </div>
              <div style={{ padding: '10px 12px', background: '#0b0f14', border: '1px solid #27303a', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>k8s/service.yaml & ingress.yaml</span>
                <span style={{ color: '#65d6b4' }}>Generated</span>
              </div>
              <div style={{ padding: '10px 12px', background: '#0b0f14', border: '1px solid #27303a', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>helm/{service.name}/Chart.yaml</span>
                <span style={{ color: '#65d6b4' }}>Generated</span>
              </div>
              <div style={{ padding: '10px 12px', background: '#0b0f14', border: '1px solid #27303a', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>.github/workflows/ci-cd.yml</span>
                <span style={{ color: '#65d6b4' }}>Generated</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'deployments' && (
        <div className="panel">
          <h3 style={{ margin: '0 0 16px', fontSize: 14, color: '#f3f4f6' }}>Service Deployments</h3>
          {deployments.length === 0 ? (
            <EmptyState
              icon={<Server size={20} />}
              title="No deployments found"
              detail="Deployments for this service will appear here once triggered."
            />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #27303a', color: '#6f7a86', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px' }}>Version</th>
                    <th style={{ padding: '10px 12px' }}>Environment</th>
                    <th style={{ padding: '10px 12px' }}>Status</th>
                    <th style={{ padding: '10px 12px' }}>Image Tag</th>
                    <th style={{ padding: '10px 12px' }}>Deployed By</th>
                    <th style={{ padding: '10px 12px' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {deployments.map((d) => (
                    <tr key={d.id} style={{ borderBottom: '1px solid #1a222c', color: '#cbd1d6' }}>
                      <td style={{ padding: '12px' }}>v{d.version}</td>
                      <td style={{ padding: '12px', textTransform: 'capitalize' }}>{d.environment}</td>
                      <td style={{ padding: '12px' }}>
                        <StatusBadge status={d.status} />
                      </td>
                      <td style={{ padding: '12px', fontFamily: 'monospace', color: '#89939e' }}>
                        {d.imageTag || '—'}
                      </td>
                      <td style={{ padding: '12px' }}>{d.deployedBy}</td>
                      <td style={{ padding: '12px', color: '#6f7a86' }}>{new Date(d.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'pipelines' && (
        <div className="panel">
          <h3 style={{ margin: '0 0 16px', fontSize: 14, color: '#f3f4f6' }}>Pipeline Runs</h3>
          {pipelines.length === 0 ? (
            <EmptyState
              icon={<Terminal size={20} />}
              title="No pipeline runs recorded"
              detail="Pipeline runs for this service will be listed here."
            />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #27303a', color: '#6f7a86', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px' }}>Run #</th>
                    <th style={{ padding: '10px 12px' }}>Status</th>
                    <th style={{ padding: '10px 12px' }}>Stage</th>
                    <th style={{ padding: '10px 12px' }}>SonarQube</th>
                    <th style={{ padding: '10px 12px' }}>Trivy Security</th>
                    <th style={{ padding: '10px 12px' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {pipelines.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #1a222c', color: '#cbd1d6' }}>
                      <td style={{ padding: '12px', fontFamily: 'monospace' }}>#{p.runNumber}</td>
                      <td style={{ padding: '12px' }}>
                        <StatusBadge status={p.status} />
                      </td>
                      <td style={{ padding: '12px' }}>{p.stage || 'COMPLETED'}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ color: p.sonarqubeStatus === 'PASSED' ? '#65d6b4' : '#f59e0b' }}>
                          {p.sonarqubeStatus || 'Passed'}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        {p.trivyCriticalCount > 0 ? (
                          <span style={{ color: '#f87171', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <ShieldAlert size={13} /> {p.trivyCriticalCount} Critical
                          </span>
                        ) : (
                          <span style={{ color: '#65d6b4', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <CheckCircle2 size={13} /> Clean
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px', color: '#6f7a86' }}>{new Date(p.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
