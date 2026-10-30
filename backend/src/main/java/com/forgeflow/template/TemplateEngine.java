package com.forgeflow.template;

import org.springframework.stereotype.Service;

/**
 * Generates project files (Dockerfile, K8s manifests, Helm charts, CI/CD pipelines)
 * from service metadata.
 */
@Service
public class TemplateEngine {

    public String generateDockerfile(String language, String framework, int port) {
        return switch (language.toLowerCase()) {
            case "java" -> javaDockerfile(port);
            case "python" -> pythonDockerfile(port);
            case "nodejs" -> nodeDockerfile(port);
            case "go" -> goDockerfile(port);
            case "dotnet" -> dotnetDockerfile(port);
            default -> javaDockerfile(port);
        };
    }

    public String generateKubernetesDeployment(String name, String image, String namespace, int port, int replicas) {
        return """
                apiVersion: apps/v1
                kind: Deployment
                metadata:
                  name: %s
                  namespace: %s
                  labels:
                    app: %s
                    managed-by: forgeflow
                spec:
                  replicas: %d
                  selector:
                    matchLabels:
                      app: %s
                  template:
                    metadata:
                      labels:
                        app: %s
                        version: latest
                    spec:
                      containers:
                        - name: %s
                          image: %s
                          ports:
                            - containerPort: %d
                          resources:
                            requests:
                              cpu: "100m"
                              memory: "128Mi"
                            limits:
                              cpu: "500m"
                              memory: "512Mi"
                          readinessProbe:
                            httpGet:
                              path: /health
                              port: %d
                            initialDelaySeconds: 15
                            periodSeconds: 10
                          livenessProbe:
                            httpGet:
                              path: /health
                              port: %d
                            initialDelaySeconds: 30
                            periodSeconds: 20
                          env:
                            - name: APP_PORT
                              value: "%d"
                            - name: JAVA_OPTS
                              value: "-Xms128m -Xmx512m"
                """.formatted(name, namespace, name, replicas, name, name, name, image, port, port, port, port);
    }

    public String generateKubernetesService(String name, String namespace, int port) {
        return """
                apiVersion: v1
                kind: Service
                metadata:
                  name: %s
                  namespace: %s
                  labels:
                    app: %s
                    managed-by: forgeflow
                spec:
                  selector:
                    app: %s
                  ports:
                    - protocol: TCP
                      port: 80
                      targetPort: %d
                  type: ClusterIP
                """.formatted(name, namespace, name, name, port);
    }

    public String generateKubernetesIngress(String name, String namespace, String host) {
        return """
                apiVersion: networking.k8s.io/v1
                kind: Ingress
                metadata:
                  name: %s
                  namespace: %s
                  annotations:
                    nginx.ingress.kubernetes.io/rewrite-target: /
                  labels:
                    app: %s
                    managed-by: forgeflow
                spec:
                  rules:
                    - host: %s
                      http:
                        paths:
                          - path: /
                            pathType: Prefix
                            backend:
                              service:
                                name: %s
                                port:
                                  number: 80
                """.formatted(name, namespace, name, host, name);
    }

    public String generateHelmChart(String name, String description) {
        return """
                apiVersion: v2
                name: %s
                description: %s
                type: application
                version: 0.1.0
                appVersion: "1.0.0"
                """.formatted(name, description != null ? description : "A Helm chart for " + name);
    }

    public String generateHelmValues(String name, String image, int port, int replicas) {
        return """
                replicaCount: %d

                image:
                  repository: %s
                  pullPolicy: IfNotPresent
                  tag: "latest"

                service:
                  type: ClusterIP
                  port: %d

                ingress:
                  enabled: true
                  annotations: {}
                  hosts:
                    - host: %s.local
                      paths:
                        - path: /
                          pathType: Prefix

                resources:
                  limits:
                    cpu: 500m
                    memory: 512Mi
                  requests:
                    cpu: 100m
                    memory: 128Mi

                autoscaling:
                  enabled: false
                  minReplicas: 1
                  maxReplicas: 10
                  targetCPUUtilizationPercentage: 80

                nodeSelector: {}
                tolerations: []
                affinity: {}
                """.formatted(replicas, image, port, name);
    }

    public String generateGithubActionsWorkflow(String name, String language, String dockerHubUsername) {
        return """
                name: CI/CD Pipeline — %s

                on:
                  push:
                    branches: [ main, develop ]
                  pull_request:
                    branches: [ main ]

                env:
                  DOCKER_IMAGE: %s/%s
                  IMAGE_TAG: ${{ github.sha }}

                jobs:
                  code-quality:
                    name: SonarQube Analysis
                    runs-on: ubuntu-latest
                    steps:
                      - uses: actions/checkout@v4
                        with:
                          fetch-depth: 0
                      - name: Set up JDK 21
                        uses: actions/setup-java@v4
                        with:
                          java-version: '21'
                          distribution: 'temurin'
                      - name: SonarQube Scan
                        uses: SonarSource/sonarcloud-github-action@master
                        env:
                          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
                          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

                  build-and-push:
                    name: Build & Push Docker Image
                    runs-on: ubuntu-latest
                    needs: code-quality
                    steps:
                      - uses: actions/checkout@v4
                      - name: Set up Docker Buildx
                        uses: docker/setup-buildx-action@v3
                      - name: Login to Docker Hub
                        uses: docker/login-action@v3
                        with:
                          username: ${{ secrets.DOCKERHUB_USERNAME }}
                          password: ${{ secrets.DOCKERHUB_TOKEN }}
                      - name: Build and push
                        uses: docker/build-push-action@v5
                        with:
                          context: .
                          push: true
                          tags: |
                            ${{ env.DOCKER_IMAGE }}:${{ env.IMAGE_TAG }}
                            ${{ env.DOCKER_IMAGE }}:latest

                  security-scan:
                    name: Trivy Vulnerability Scan
                    runs-on: ubuntu-latest
                    needs: build-and-push
                    steps:
                      - name: Run Trivy vulnerability scanner
                        uses: aquasecurity/trivy-action@master
                        with:
                          image-ref: '${{ env.DOCKER_IMAGE }}:${{ env.IMAGE_TAG }}'
                          format: 'sarif'
                          output: 'trivy-results.sarif'
                          severity: 'CRITICAL,HIGH'
                      - name: Upload Trivy scan results to GitHub Security tab
                        uses: github/codeql-action/upload-sarif@v3
                        with:
                          sarif_file: 'trivy-results.sarif'

                  deploy:
                    name: Deploy via ArgoCD
                    runs-on: ubuntu-latest
                    needs: security-scan
                    if: github.ref == 'refs/heads/main'
                    steps:
                      - uses: actions/checkout@v4
                      - name: Update image tag in Helm values
                        run: |
                          sed -i "s/tag: .*/tag: \\"${{ env.IMAGE_TAG }}\\"/" helm/%s/values.yaml
                          git config user.email "forgeflow-bot@forgeflow.io"
                          git config user.name "ForgeFlow Bot"
                          git add helm/%s/values.yaml
                          git commit -m "chore: update image tag to ${{ env.IMAGE_TAG }}"
                          git push
                """.formatted(name, dockerHubUsername, name, name, name);
    }

    public String generateJenkinsfile(String name, String dockerHubUsername) {
        return """
                pipeline {
                    agent any

                    environment {
                        APP_NAME = '%s'
                        DOCKER_IMAGE = '%s/%s'
                        SONARQUBE_SERVER = 'SonarQube'
                        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
                    }

                    stages {
                        stage('Checkout') {
                            steps {
                                checkout scm
                            }
                        }

                        stage('Code Quality - SonarQube') {
                            steps {
                                withSonarQubeEnv("${SONARQUBE_SERVER}") {
                                    sh 'mvn sonar:sonar -Dsonar.projectKey=${APP_NAME}'
                                }
                            }
                        }

                        stage('Quality Gate') {
                            steps {
                                timeout(time: 2, unit: 'MINUTES') {
                                    waitForQualityGate abortPipeline: true
                                }
                            }
                        }

                        stage('Build Docker Image') {
                            steps {
                                sh 'docker build -t ${DOCKER_IMAGE}:${BUILD_NUMBER} .'
                            }
                        }

                        stage('Security Scan - Trivy') {
                            steps {
                                sh 'trivy image --exit-code 1 --severity CRITICAL ${DOCKER_IMAGE}:${BUILD_NUMBER}'
                            }
                        }

                        stage('Push to Docker Hub') {
                            steps {
                                sh 'echo ${DOCKERHUB_CREDENTIALS_PSW} | docker login -u ${DOCKERHUB_CREDENTIALS_USR} --password-stdin'
                                sh 'docker push ${DOCKER_IMAGE}:${BUILD_NUMBER}'
                                sh 'docker tag ${DOCKER_IMAGE}:${BUILD_NUMBER} ${DOCKER_IMAGE}:latest'
                                sh 'docker push ${DOCKER_IMAGE}:latest'
                            }
                        }

                        stage('GitOps - Update Helm Values') {
                            steps {
                                sh 'git config user.email "jenkins@forgeflow.io"'
                                sh 'git config user.name "Jenkins"'
                                sh 'sed -i "s/tag: .*/tag: \\"${BUILD_NUMBER}\\"/" helm/%s/values.yaml'
                                sh 'git add helm/%s/values.yaml'
                                sh 'git commit -m "chore: deploy build ${BUILD_NUMBER}"'
                                sh 'git push origin main'
                            }
                        }
                    }

                    post {
                        always {
                            cleanWs()
                        }
                        success {
                            echo "Pipeline succeeded for ${APP_NAME}"
                        }
                        failure {
                            echo "Pipeline FAILED for ${APP_NAME}"
                        }
                    }
                }
                """.formatted(name, dockerHubUsername, name, name, name);
    }

    // --- Private dockerfile generators ---

    private String javaDockerfile(int port) {
        return """
                # ---- Build Stage ----
                FROM eclipse-temurin:21-jdk-alpine AS build
                WORKDIR /app
                COPY pom.xml .
                COPY src ./src
                RUN apk add --no-cache maven && mvn package -DskipTests

                # ---- Runtime Stage ----
                FROM eclipse-temurin:21-jre-alpine
                WORKDIR /app
                RUN addgroup -S appgroup && adduser -S appuser -G appgroup
                COPY --from=build /app/target/*.jar app.jar
                USER appuser
                EXPOSE %d
                ENTRYPOINT ["java", "-jar", "app.jar"]
                """.formatted(port);
    }

    private String pythonDockerfile(int port) {
        return """
                FROM python:3.12-slim
                WORKDIR /app
                RUN groupadd -r appgroup && useradd -r -g appgroup appuser
                COPY requirements.txt .
                RUN pip install --no-cache-dir -r requirements.txt
                COPY . .
                USER appuser
                EXPOSE %d
                CMD ["python", "app.py"]
                """.formatted(port);
    }

    private String nodeDockerfile(int port) {
        return """
                FROM node:22-alpine AS build
                WORKDIR /app
                COPY package*.json ./
                RUN npm ci --only=production

                FROM node:22-alpine
                WORKDIR /app
                RUN addgroup -S appgroup && adduser -S appuser -G appgroup
                COPY --from=build /app/node_modules ./node_modules
                COPY . .
                USER appuser
                EXPOSE %d
                CMD ["node", "index.js"]
                """.formatted(port);
    }

    private String goDockerfile(int port) {
        return """
                FROM golang:1.23-alpine AS build
                WORKDIR /app
                COPY go.mod go.sum ./
                RUN go mod download
                COPY . .
                RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o app .

                FROM alpine:3.20
                WORKDIR /app
                RUN addgroup -S appgroup && adduser -S appuser -G appgroup
                COPY --from=build /app/app .
                USER appuser
                EXPOSE %d
                CMD ["./app"]
                """.formatted(port);
    }

    private String dotnetDockerfile(int port) {
        return """
                FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
                WORKDIR /app
                COPY *.csproj ./
                RUN dotnet restore
                COPY . .
                RUN dotnet publish -c Release -o out

                FROM mcr.microsoft.com/dotnet/aspnet:8.0
                WORKDIR /app
                RUN adduser --disabled-password appuser
                COPY --from=build /app/out .
                USER appuser
                EXPOSE %d
                ENTRYPOINT ["dotnet", "app.dll"]
                """.formatted(port);
    }
}
