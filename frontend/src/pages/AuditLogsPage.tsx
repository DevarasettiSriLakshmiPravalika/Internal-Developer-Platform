import { useQuery } from '@tanstack/react-query'
import { LockKeyhole, Search, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { getAuditLogs } from '../services/api'
import { PageHeader } from '../components/PageHeader'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { EmptyState } from '../components/EmptyState'
import { Pagination } from '../components/Pagination'
import type { AuditLog } from '../types/service'

export function AuditLogsPage() {
  const [page, setPage] = useState(0)
  const [actorFilter, setActorFilter] = useState('')
  const [submittedActor, setSubmittedActor] = useState('')

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['audit-logs', page, submittedActor],
    queryFn: () => getAuditLogs(page, submittedActor || undefined),
    retry: 1,
  })

  const logs: AuditLog[] = data?.content ?? []

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(0)
    setSubmittedActor(actorFilter.trim())
  }

  return (
    <div className="content-wrap">
      <PageHeader
        eyebrow="COMPLIANCE & GOVERNANCE"
        title="Audit Logs"
        subtitle="Immutable records of provisioning, deployment updates, security events, and user actions."
        action={
          <button className="secondary-button" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw size={14} className={isFetching ? 'spin' : ''} /> Refresh
          </button>
        }
      />

      {/* Filter Bar */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <div style={{ position: 'relative', width: 320 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: 12, color: '#65717e' }} />
          <input
            type="text"
            placeholder="Filter by actor email..."
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 34px',
              border: '1px solid #27303a',
              borderRadius: 4,
              background: '#11161d',
              color: '#f3f4f6',
              fontSize: 12,
              outline: 'none',
            }}
          />
        </div>
        <button type="submit" className="secondary-button">
          Filter
        </button>
        {submittedActor && (
          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              setActorFilter('')
              setSubmittedActor('')
              setPage(0)
            }}
          >
            Clear
          </button>
        )}
      </form>

      {isLoading ? (
        <LoadingSpinner label="Retrieving audit records..." />
      ) : isError ? (
        <div style={{ color: '#f87171', fontSize: 12, padding: '24px 0' }}>
          Failed to load audit logs. Check that the API is running.
        </div>
      ) : logs.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={<LockKeyhole size={20} />}
            title="No audit events found"
            detail="Platform actions and lifecycle changes will be logged here with timestamps and actor details."
          />
        </div>
      ) : (
        <div className="panel" style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #27303a', color: '#6f7a86', textAlign: 'left', background: '#0e131a' }}>
                  <th style={{ padding: '14px 16px' }}>Timestamp</th>
                  <th style={{ padding: '14px 16px' }}>Actor</th>
                  <th style={{ padding: '14px 16px' }}>Action</th>
                  <th style={{ padding: '14px 16px' }}>Resource Type</th>
                  <th style={{ padding: '14px 16px' }}>Resource ID</th>
                  <th style={{ padding: '14px 16px' }}>Detail</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #1a222c', color: '#cbd1d6' }}>
                    <td style={{ padding: '14px 16px', color: '#89939e', whiteSpace: 'nowrap' }}>
                      {new Date(log.occurredAt).toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#65d6b4' }}>{log.actorEmail}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          background: '#1a2928',
                          color: '#65d6b4',
                          padding: '3px 7px',
                          borderRadius: 3,
                          fontSize: 11,
                          fontFamily: 'monospace',
                        }}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textTransform: 'uppercase', fontSize: 11, color: '#9ca3af' }}>
                      {log.resourceType}
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: 'monospace' }}>
                      {log.resourceId || '—'}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#89939e' }}>{log.detail || '—'}</td>
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
