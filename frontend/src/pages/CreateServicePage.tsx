import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { ArrowRight, ChevronLeft, Check, Box, Server, FileText } from 'lucide-react'
import { createService } from '../services/api'
import type { CreateServiceRequest } from '../types/service'
import { PageHeader } from '../components/PageHeader'

const LANGUAGES = ['java', 'python', 'nodejs', 'go', 'dotnet'] as const

const FRAMEWORK_SUGGESTIONS: Record<string, string[]> = {
  java: ['Spring Boot', 'Quarkus', 'Micronaut'],
  python: ['FastAPI', 'Django', 'Flask'],
  nodejs: ['Express', 'NestJS', 'Fastify'],
  go: ['Gin', 'Echo', 'Fiber'],
  dotnet: ['ASP.NET Core', 'Minimal API'],
}

interface StepIndicatorProps {
  steps: string[]
  current: number
}

function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 36 }}>
      {steps.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : undefined }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  background: done ? '#65d6b4' : active ? '#1b2930' : '#11161d',
                  border: `1px solid ${done ? '#65d6b4' : active ? '#65d6b4' : '#27303a'}`,
                  color: done ? '#0b0f14' : active ? '#65d6b4' : '#5c6875',
                  fontSize: 11,
                  fontWeight: 700,
                  transition: 'all 0.2s',
                }}
              >
                {done ? <Check size={13} /> : i + 1}
              </div>
              <span
                style={{
                  fontSize: 10,
                  color: active ? '#c6ccd3' : done ? '#65d6b4' : '#5c6875',
                  whiteSpace: 'nowrap',
                  fontWeight: active ? 600 : 400,
                }}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: done ? '#65d6b4' : '#27303a',
                  marginBottom: 20,
                  marginInline: 8,
                  transition: 'background 0.2s',
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

function Field({
  label,
  required,
  children,
  error,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
  error?: string
}) {
  return (
    <label style={{ display: 'grid', gap: 7, color: '#c6ccd3', fontSize: 11 }}>
      {label} {required && <span style={{ color: '#f87171' }}>*</span>}
      {children}
      {error && <span style={{ color: '#f87171', fontSize: 10 }}>{error}</span>}
    </label>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 11px',
  border: '1px solid #34404b',
  borderRadius: 4,
  outline: 'none',
  color: '#f3f4f6',
  background: '#0b0f14',
  fontSize: 12,
  boxSizing: 'border-box',
}

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none',
}

export function CreateServicePage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [language, setLanguage] = useState('java')
  const [framework, setFramework] = useState('Spring Boot')
  const [namespace, setNamespace] = useState('default')
  const [port, setPort] = useState(8080)
  const [replicas, setReplicas] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const mutation = useMutation({
    mutationFn: (req: CreateServiceRequest) => createService(req),
    onSuccess: (svc) => {
      navigate(`/services/${svc.id}`)
    },
  })

  function validateStep1() {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Name is required'
    else if (!/^[a-z][a-z0-9-]*$/.test(name.trim()))
      e.name = 'Must start with a lowercase letter (a-z) and contain only lowercase letters, numbers and hyphens'
    if (!framework.trim()) e.framework = 'Framework is required'
    return e
  }

  function validateStep2() {
    const e: Record<string, string> = {}
    if (!namespace.trim()) e.namespace = 'Namespace is required'
    if (port < 1 || port > 65535) e.port = 'Port must be 1–65535'
    if (replicas < 1 || replicas > 50) e.replicas = 'Replicas must be 1–50'
    return e
  }

  function nextStep() {
    const errs = step === 0 ? validateStep1() : step === 1 ? validateStep2() : {}
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    setErrors({})
    setStep((s) => s + 1)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const step2Errs = validateStep2()
    if (Object.keys(step2Errs).length) {
      setErrors(step2Errs)
      return
    }
    mutation.mutate({ name: name.trim(), description: description.trim(), language, framework, namespace: namespace.trim(), port, replicas })
  }

  const frameworkSuggestions = FRAMEWORK_SUGGESTIONS[language] ?? []

  return (
    <div className="content-wrap">
      <PageHeader
        eyebrow="SERVICES"
        title="Create a new service"
        subtitle="Provision a new microservice on the platform."
        action={
          <button className="secondary-button" onClick={() => navigate('/services')}>
            <ChevronLeft size={14} /> Back to services
          </button>
        }
      />

      <div
        className="panel"
        style={{ maxWidth: 640, minHeight: 'unset', padding: '32px 36px' }}
      >
        <StepIndicator steps={['Basic Info', 'Infrastructure', 'Review']} current={step} />

        {step === 0 && (
          <div style={{ display: 'grid', gap: 18 }}>
            <Field label="Service name" required error={errors.name}>
              <input
                style={inputStyle}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="my-service"
                autoFocus
              />
              <span style={{ color: '#5c6875', fontSize: 10 }}>
                Lowercase letters, numbers and hyphens only.
              </span>
            </Field>
            <Field label="Description">
              <textarea
                style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this service do?"
              />
            </Field>
            <Field label="Language" required>
              <select
                style={selectStyle}
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value)
                  setFramework(FRAMEWORK_SUGGESTIONS[e.target.value]?.[0] ?? '')
                }}
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Framework" required error={errors.framework}>
              <input
                style={inputStyle}
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
                placeholder="e.g. Spring Boot"
                list="fw-suggestions"
              />
              <datalist id="fw-suggestions">
                {frameworkSuggestions.map((f) => (
                  <option key={f} value={f} />
                ))}
              </datalist>
            </Field>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="primary-button" type="button" onClick={nextStep}>
                Next <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div style={{ display: 'grid', gap: 18 }}>
            <Field label="Kubernetes namespace" required error={errors.namespace}>
              <input
                style={inputStyle}
                value={namespace}
                onChange={(e) => setNamespace(e.target.value)}
                placeholder="default"
              />
            </Field>
            <Field label="Port" required error={errors.port}>
              <input
                style={inputStyle}
                type="number"
                value={port}
                min={1}
                max={65535}
                onChange={(e) => setPort(Number(e.target.value))}
              />
            </Field>
            <Field label="Replicas" required error={errors.replicas}>
              <input
                style={inputStyle}
                type="number"
                value={replicas}
                min={1}
                max={50}
                onChange={(e) => setReplicas(Number(e.target.value))}
              />
            </Field>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="secondary-button" type="button" onClick={() => setStep(0)}>
                <ChevronLeft size={14} /> Back
              </button>
              <button className="primary-button" type="button" onClick={nextStep}>
                Review <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: 'grid',
                gap: 1,
                background: '#1d252e',
                border: '1px solid #27303a',
                borderRadius: 5,
                overflow: 'hidden',
                marginBottom: 24,
              }}
            >
              {[
                { icon: <Box size={14} />, label: 'Name', value: name },
                { icon: <FileText size={14} />, label: 'Description', value: description || '—' },
                { icon: <Box size={14} />, label: 'Language', value: language },
                { icon: <Box size={14} />, label: 'Framework', value: framework },
                { icon: <Server size={14} />, label: 'Namespace', value: namespace },
                { icon: <Server size={14} />, label: 'Port', value: String(port) },
                { icon: <Server size={14} />, label: 'Replicas', value: String(replicas) },
              ].map(({ icon, label, value }) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '12px 16px',
                    background: '#11161d',
                    fontSize: 12,
                  }}
                >
                  <span style={{ color: '#65d6b4' }}>{icon}</span>
                  <span style={{ color: '#67727e', minWidth: 100 }}>{label}</span>
                  <span
                    style={{
                      color: '#f3f4f6',
                      fontFamily: 'ui-monospace, monospace',
                      fontSize: 12,
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {mutation.isError && (
              <p className="auth-error" style={{ marginBottom: 16 }}>
                {(mutation.error as { response?: { data?: { message?: string } } })?.response?.data
                  ?.message ?? 'Failed to create service. Please try again.'}
              </p>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                className="secondary-button"
                type="button"
                onClick={() => setStep(1)}
                disabled={mutation.isPending}
              >
                <ChevronLeft size={14} /> Back
              </button>
              <button
                className="primary-button"
                type="submit"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? 'Creating…' : 'Create service'} <ArrowRight size={15} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
