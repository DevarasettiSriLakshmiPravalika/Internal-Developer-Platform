# 🚀 Internal Developer Platform (IDP) — ForgeFlow
> Automated Microservice Provisioning & Kubernetes Deployment Platform

ForgeFlow is an enterprise-grade Internal Developer Platform (IDP) that automates the entire lifecycle of microservice creation, containerization, security scanning, CI/CD pipeline setup, GitOps Kubernetes deployment, and observability.

---

## 📌 Features

- 🔐 **JWT-based Authentication & Role-Based Access Control (RBAC)** — Secure authentication with bcrypt password hashing, stateless signed JWT tokens, and role authorization (`ADMIN`, `DEVELOPER`, `VIEWER`).
- 📂 **Automatic GitHub Repository Creation** — One-click GitHub repository provisioning via the GitHub REST API with auto-generated code, `.gitignore`, and templates.
- 📄 **Polyglot Template Engine** — Automatic scaffolding for multiple runtimes:
  - **Java 21** (Spring Boot / Maven)
  - **Python 3.12** (Flask / FastAPI / Gunicorn)
  - **Node.js 22** (Express / TypeScript)
  - **Go 1.23** (Alpine multi-stage)
  - **.NET 8** (ASP.NET Core)
- 🐳 **Automatic Dockerfile Generation** — Hardened, non-root, multi-stage production Dockerfiles generated per runtime.
- ☸️ **Kubernetes Manifest Generation** — Cloud-native declarative manifests:
  - `Deployment` (with readiness & liveness probes, resource requests/limits)
  - `Service` (ClusterIP / LoadBalancer)
  - `Ingress` (NGINX ingress with TLS termination)
  - `HorizontalPodAutoscaler` (HPA with CPU & memory metrics)
- ⚓ **Helm Chart Generation** — Standard Helm v2/v3 charts (`Chart.yaml` & `values.yaml`) with configurable replicas, resources, and probes.
- 🔄 **Automated CI/CD Pipelines**:
  - **GitHub Actions** (`.github/workflows/ci-cd.yml` with multi-stage jobs)
  - **Jenkins** (`Jenkinsfile` declarative pipeline with quality gates)
- ✅ **Code Quality Analysis with SonarQube** — Automated static code analysis, quality gate verification, and defect detection.
- 🛡️ **Container Vulnerability Scanning with Trivy** — Automated container image scanning for CRITICAL and HIGH CVEs with SARIF reports and IDP callbacks.
- 📦 **Docker Image Build & Push** — Multi-architecture image builds and pushes to Docker Hub.
- 🚀 **GitOps Deployment with ArgoCD** — Declarative continuous delivery; automatic sync of Helm chart changes into Kubernetes namespaces.
- 📊 **Monitoring with Prometheus & Grafana** — Scrape configurations for service endpoints, JVM metrics, and pre-configured Grafana dashboards.
- 📜 **Centralized Logging with Fluent Bit & Loki** — Container log collection via Fluent Bit daemonset and indexing in Grafana Loki.
- 📋 **Audit Logging & Compliance** — Tamper-evident logging of service creations, deletions, deployment updates, and authentication events.
- 📈 **Real-time Metrics Dashboard** — Service counts, deployment health, pipeline success rate, and active telemetry.

---

## 🏗️ Architecture

```text
                +----------------------+
                |      Developer       |
                +----------+-----------+
                           |
                           v
                +----------------------+
                |   React Web Portal   |
                +----------+-----------+
                           |
                      REST API (JWT)
                           |
                           v
                +----------------------+
                | Spring Boot Backend  |
                +----------+-----------+
                           |
     ---------------------------------------------------------
     |        |         |         |          |              |
     v        v         v         v          v              v
 GitHub   Templates  Docker   Kubernetes   Helm          MySQL 8.4
  API      Engine    Builder   Generator  Generator     Metadata
     |
     v
 CI/CD Pipeline (Jenkins / GitHub Actions)
     |
     +----------------------------+
     |                            |
     v                            v
SonarQube                    Trivy Scan
(Code Quality)             (Security Scan)
     |
     v
Docker Build
     |
     v
Docker Image Scan
     |
     v
Push Image to Docker Hub
     |
     v
ArgoCD (GitOps)
     |
     v
Kubernetes Cluster
     |
     +-------------------------------+
     |                               |
     v                               v
 Prometheus                    Fluent Bit
     |                               |
     v                               v
 Grafana                          Loki
```

---

## ⚙️ Platform Workflow

1. **Service Registration**: Developer enters service specifications (name, language, framework, port, replicas, namespace) in the web portal.
2. **Repository Creation**: IDP calls GitHub API to provision a new Git repository.
3. **Artifact Generation**: The built-in template engine generates:
   - Polyglot `Dockerfile`
   - Kubernetes `deployment.yaml`, `service.yaml`, `ingress.yaml`, and `hpa.yaml`
   - Helm `Chart.yaml` and `values.yaml`
   - CI/CD workflow (`ci-cd.yml` / `Jenkinsfile`)
4. **CI/CD Execution**:
   - SonarQube analyzes code quality against gate rules.
   - Docker image is built with commit SHA tag.
   - Trivy scans the image for CVE vulnerabilities.
   - Image is pushed to Docker Hub.
5. **GitOps Sync**: Helm `values.yaml` image tag is automatically updated; ArgoCD detects the change and synchronizes the Kubernetes deployment.
6. **Telemetry**: Prometheus scrapes application metrics; Fluent Bit streams container stdout/stderr to Loki; Grafana provides real-time dashboards.

---

## 🛠️ Tech Stack

### Frontend
- **React 19** & **TypeScript**
- **Vite 8**
- **React Router DOM 7** (Client-side protected routing)
- **TanStack React Query 5** (Asynchronous cache & mutation state)
- **Recharts 3** (Interactive charts for telemetry & pipelines)
- **Lucide React** (Icons)
- **Tailwind CSS** (Design system)

### Backend
- **Spring Boot 3.5** & **Java 21**
- **Spring Security 6** with **Stateless JWT** (JJWT 0.12)
- **Spring Data JPA** & **Hibernate 6**
- **Flyway Database Migrations** (Schema versioning v1–v6)
- **Spring Web** & **Jakarta Bean Validation**
- **Spring Boot Actuator** (Health probes & Prometheus metric exposure)

### Persistence & Storage
- **MySQL 8.4** (Persistent metadata storage)
- **H2 in-memory DB** (Unit & slice testing)

### DevOps & GitOps
- **Docker** & **Docker Compose**
- **Kubernetes 1.28+**
- **Helm v3**
- **ArgoCD** (GitOps Operator)
- **Jenkins** & **GitHub Actions**
- **Docker Hub**

### DevSecOps
- **SonarQube 10 Community**
- **Aqua Security Trivy**

### Observability
- **Prometheus** (Metric collection & alerting rules)
- **Grafana 11** (Visualization)
- **Fluent Bit 3.2** (High performance log processor)
- **Grafana Loki 3.2** (Log aggregation engine)

---

## 📂 Project Structure

```text
Internal-Developer-Platform/
├── backend/
│   ├── src/main/java/com/forgeflow/
│   │   ├── api/                 # REST controllers (Health, Dashboard, Roles, ErrorHandler)
│   │   ├── audit/               # AuditLog entity, JPA repo, service, controller
│   │   ├── auth/                # JWT filter, JwtService, AuthService, UserEntity, SecurityConfig
│   │   ├── deployment/          # Deployment entity, JPA repo, controller
│   │   ├── github/              # GitHubService (REST API repository creation & file commits)
│   │   ├── pipeline/            # PipelineRun entity, JPA repo, controller
│   │   ├── service/             # ServiceEntity, ServiceRepository, ProvisioningService, Controller
│   │   ├── template/            # TemplateEngine (Dockerfiles, K8s, Helm, CI/CD generator)
│   │   └── ForgeFlowApplication.java
│   ├── src/main/resources/
│   │   ├── application.yml      # Configuration & datasource settings
│   │   └── db/migration/        # Flyway SQL migrations (V1 to V6)
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── components/          # Shared UI (PageHeader, StatusBadge, EmptyState, Pagination)
│   │   ├── context/             # AuthContext & useAuth hook
│   │   ├── pages/               # Overview, Services, CreateService, ServiceDetail,
│   │   │                        # Deployments, Repositories, Pipelines, Security, Observability,
│   │   │                        # AuditLogs, Settings, LoginPage
│   │   ├── services/            # api.ts (Axios HTTP client with JWT interceptor)
│   │   ├── types/               # TypeScript interfaces (Service, Deployment, Pipeline, Audit, Auth)
│   │   ├── App.css              # Dark developer-centric UI stylesheet
│   │   ├── App.tsx              # React Router v7 routes & ProtectedLayout
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── templates/
│   ├── dockerfile/              # Standard Dockerfiles (Java, Python, Node, Go)
│   ├── kubernetes/              # K8s templates (Deployment, Service, Ingress, HPA)
│   └── helm/chart/              # Base Helm Chart (Chart.yaml, values.yaml)
│
├── cicd/
│   ├── Jenkinsfile              # Declarative Jenkins pipeline with SonarQube & Trivy
│   └── github-actions/          # GitHub Actions workflow (ci-cd.yml)
│
├── monitoring/
│   ├── prometheus/              # prometheus.yml & alert rules
│   ├── grafana/dashboards/      # Pre-configured Grafana dashboards
│   ├── fluent-bit/              # fluent-bit.conf log collector
│   ├── loki/                    # loki.yml log storage configuration
│   └── argocd/                  # ArgoCD Application CRD manifests
│
├── docker-compose.yml           # Complete platform stack definition
├── .env.example                 # Environment variable templates
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Docker** and **Docker Compose** installed
- **Java 21+** (for local backend development)
- **Node.js 20+** and **npm** (for local frontend development)
- (Optional) A GitHub Personal Access Token with `repo` scope to enable real GitHub repo creation.

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Key environment variables:
- `JWT_SECRET`: Random string (at least 32 characters) for signing JWT tokens.
- `GITHUB_TOKEN`: GitHub Personal Access Token (PAT) for repo provisioning.
- `GITHUB_ORG`: Target GitHub organization (leave blank for personal account).
- `DOCKERHUB_USERNAME`: Your Docker Hub account or organization.

### 3. Run the Entire Platform with Docker Compose
To launch the full stack (MySQL, Backend, Frontend, SonarQube, Prometheus, Grafana, Loki, Fluent Bit):
```bash
docker compose up -d
```

### 4. Access the Platform
| Service | URL | Default Credentials |
| :--- | :--- | :--- |
| **IDP Web Portal** | `http://localhost:5173` | Register a new user in UI |
| **IDP REST API** | `http://localhost:8090` | JWT Bearer |
| **API Health Probe** | `http://localhost:8090/api/health` | Public |
| **Prometheus Metrics**| `http://localhost:8090/actuator/prometheus` | Public |
| **SonarQube** | `http://localhost:9000` | `admin` / `admin` |
| **Grafana** | `http://localhost:3000` | `admin` / `forgeflow` |
| **Prometheus UI** | `http://localhost:9090` | Public |

---

## 🔒 Security & Compliance

- **Stateless Authentication**: Signed HMAC-SHA256 JWT tokens with automatic expiry.
- **Role-Based Authorization**: Fine-grained RBAC on sensitive admin and provisioning routes.
- **Static Analysis**: Enforced quality gates with SonarQube prior to artifact packaging.
- **Container Vulnerability Gates**: Trivy checks preventing deployment of images containing critical CVEs.
- **Audit Trails**: Every lifecycle action (service created, pipeline run, status updated, deleted) is immutably logged with actor email, timestamp, and metadata.

---

## 🔮 Future Roadmap

- 🌐 **Multi-Cloud Provisioning** (AWS EKS, Azure AKS, Google Cloud GKE)
- 🤖 **AI-Assisted Template Recommendation**
- 🚦 **Canary & Blue-Green Progressive Delivery** via Argo Rollouts
- 🕸️ **Service Mesh Integration** (Istio / Linkerd)
- 🛡️ **Open Policy Agent (OPA) / Kyverno** Gatekeeper validation
- 💰 **FinOps Cloud Cost Optimization Dashboard** (Kubecost integration)
