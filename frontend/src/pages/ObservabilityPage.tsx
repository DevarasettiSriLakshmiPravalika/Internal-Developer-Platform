import { ExternalLink, Terminal } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'

const mockMetricsData = [
  { time: '12:00', requests: 120, latency: 42, cpu: 28 },
  { time: '13:00', requests: 190, latency: 48, cpu: 34 },
  { time: '14:00', requests: 300, latency: 65, cpu: 52 },
  { time: '15:00', requests: 280, latency: 58, cpu: 46 },
  { time: '16:00', requests: 420, latency: 72, cpu: 65 },
  { time: '17:00', requests: 380, latency: 60, cpu: 58 },
  { time: '18:00', requests: 450, latency: 55, cpu: 62 },
]

const mockPipelineHealthData = [
  { service: 'auth-svc', success: 18, failed: 1 },
  { service: 'payment-svc', success: 24, failed: 0 },
  { service: 'order-svc', success: 15, failed: 2 },
  { service: 'inventory-svc', success: 12, failed: 0 },
  { service: 'notification-svc', success: 30, failed: 1 },
]

export function ObservabilityPage() {
  const grafanaUrl = import.meta.env.VITE_GRAFANA_URL || 'http://localhost:3000'
  const prometheusUrl = import.meta.env.VITE_PROMETHEUS_URL || 'http://localhost:9090'

  return (
    <div className="content-wrap">
      <PageHeader
        eyebrow="SYSTEM TELEMETRY"
        title="Observability & Centralized Logs"
        subtitle="Distributed metrics gathered via Prometheus, dashboards rendered in Grafana, and logs shipped by Fluent Bit into Loki."
        action={
          <div style={{ display: 'flex', gap: 10 }}>
            <a
              href={grafanaUrl}
              target="_blank"
              rel="noreferrer"
              className="secondary-button"
              style={{ textDecoration: 'none' }}
            >
              Open Grafana <ExternalLink size={12} />
            </a>
            <a
              href={prometheusUrl}
              target="_blank"
              rel="noreferrer"
              className="secondary-button"
              style={{ textDecoration: 'none' }}
            >
              Prometheus Targets <ExternalLink size={12} />
            </a>
          </div>
        }
      />

      {/* Metrics Row */}
      <section className="metric-grid" aria-label="Observability Highlights" style={{ marginBottom: 24 }}>
        <article className="metric">
          <span className="metric-label">Aggregated RPS</span>
          <strong>450 req/s</strong>
          <small>Cluster ingress throughput</small>
        </article>
        <article className="metric">
          <span className="metric-label">P95 Response Latency</span>
          <strong>55 ms</strong>
          <small>Within &lt;100ms SLO</small>
        </article>
        <article className="metric">
          <span className="metric-label">Active Pods Scraped</span>
          <strong>14</strong>
          <small>Annotated with prometheus.io/scrape</small>
        </article>
        <article className="metric">
          <span className="metric-label">Log Ingestion Rate</span>
          <strong>1.2 MB/s</strong>
          <small>Collected via Fluent Bit to Loki</small>
        </article>
      </section>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div className="panel" style={{ height: 320, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 13, color: '#f3f4f6' }}>HTTP Ingress Throughput & Latency</h3>
            <span style={{ fontSize: 11, color: '#65d6b4' }}>Prometheus Live</span>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockMetricsData}>
                <defs>
                  <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#65d6b4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#65d6b4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#526071" fontSize={11} />
                <YAxis stroke="#526071" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: '#11161d', border: '1px solid #27303a', borderRadius: 4, fontSize: 11 }}
                />
                <Area type="monotone" dataKey="requests" stroke="#65d6b4" fillOpacity={1} fill="url(#reqGrad)" name="Requests/s" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel" style={{ height: 320, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 13, color: '#f3f4f6' }}>Service Deployments & Builds</h3>
            <span style={{ fontSize: 11, color: '#60a5fa' }}>Historical</span>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockPipelineHealthData}>
                <XAxis dataKey="service" stroke="#526071" fontSize={10} />
                <YAxis stroke="#526071" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: '#11161d', border: '1px solid #27303a', borderRadius: 4, fontSize: 11 }}
                />
                <Bar dataKey="success" fill="#65d6b4" name="Successful Runs" radius={[4, 4, 0, 0]} />
                <Bar dataKey="failed" fill="#f87171" name="Failures" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Centralized Log Viewer */}
      <div className="panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Terminal size={16} style={{ color: '#65d6b4' }} />
            <h3 style={{ margin: 0, fontSize: 13, color: '#f3f4f6' }}>Loki Log Stream (via Fluent Bit DaemonSet)</h3>
          </div>
          <span style={{ fontSize: 11, color: '#6f7a86' }}>Live tailing namespace: default</span>
        </div>
        <div
          style={{
            background: '#070a0e',
            border: '1px solid #27303a',
            borderRadius: 4,
            padding: 14,
            fontFamily: 'Consolas, monospace',
            fontSize: 11,
            color: '#a3b1c2',
            lineHeight: 1.6,
            maxHeight: 200,
            overflowY: 'auto',
          }}
        >
          <div><span style={{ color: '#65d6b4' }}>[2026-10-30 18:30:02]</span> <span style={{ color: '#60a5fa' }}>INFO</span> [forgeflow-api] Provisioning completed for microservice: auth-service</div>
          <div><span style={{ color: '#65d6b4' }}>[2026-10-30 18:30:15]</span> <span style={{ color: '#60a5fa' }}>INFO</span> [fluent-bit] Tag kube.var.log.containers matched pattern; forwarded 12 records to loki:3100</div>
          <div><span style={{ color: '#65d6b4' }}>[2026-10-30 18:31:40]</span> <span style={{ color: '#60a5fa' }}>INFO</span> [argocd] Sync operation started for application payment-service target revision HEAD</div>
          <div><span style={{ color: '#65d6b4' }}>[2026-10-30 18:32:05]</span> <span style={{ color: '#34d399' }}>SUCCESS</span> [argocd] Application payment-service synced successfully to cluster https://kubernetes.default.svc</div>
          <div><span style={{ color: '#65d6b4' }}>[2026-10-30 18:33:12]</span> <span style={{ color: '#60a5fa' }}>INFO</span> [prometheus] Scraped 14 endpoints from job kubernetes-pods in 38ms</div>
        </div>
      </div>
    </div>
  )
}
