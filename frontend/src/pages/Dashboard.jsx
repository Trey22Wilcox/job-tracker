import { useState, useEffect, useMemo } from 'react'
import { getAllJobs, createJob, updateJob, deleteJob } from '../api/jobsApi'
import JobModal from '../components/JobModal'
import StatsBar from '../components/StatsBar'

const STATUS_ORDER = { OFFER: 0, PHONE_SCREEN: 1, INTERVIEW: 2, APPLIED: 3 }
const STALE_DAYS = 30

function byLastUpdatedDesc(a, b) {
  return (b.lastUpdated || '').localeCompare(a.lastUpdated || '')
}

function daysSince(dateStr) {
  if (!dateStr) return 0
  const diff = Date.now() - new Date(dateStr).getTime()
  return diff / (1000 * 60 * 60 * 24)
}

function bucketJobs(jobs) {
  const rejected = []
  const stale = []
  const active = []

  for (const job of jobs) {
    if (job.status === 'REJECTED') {
      rejected.push(job)
    } else if (daysSince(job.appliedDate) > STALE_DAYS) {
      stale.push(job)
    } else {
      active.push(job)
    }
  }

  rejected.sort(byLastUpdatedDesc)
  stale.sort(byLastUpdatedDesc)
  active.sort((a, b) => {
    const rank = (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99)
    return rank !== 0 ? rank : byLastUpdatedDesc(a, b)
  })

  return { active, stale, rejected }
}

function JobRow({ job, onClick }) {
  return (
    <li onClick={onClick}>
      <span className="job-info">
        {job.company} — {job.jobTitle}
        <span className={`status-badge ${job.status}`}>
          {job.status.replace('_', ' ')}
        </span>
      </span>
      <span className="job-updated">Updated {job.lastUpdated}</span>
    </li>
  )
}

function CollapsibleSection({ title, jobs, onSelect }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="job-section">
      <button
        type="button"
        className="job-section-toggle"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? '▾' : '▸'} {title} ({jobs.length})
      </button>
      {open && (
        <ul className="job-list">
          {jobs.map((job) => (
            <JobRow key={job.id} job={job} onClick={() => onSelect(job)} />
          ))}
        </ul>
      )}
    </div>
  )
}

function Dashboard() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [activeJob, setActiveJob] = useState(null)

  useEffect(() => {
    loadJobs()
  }, [])

  function loadJobs() {
    getAllJobs()
      .then((data) => {
        setJobs(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error(error)
        setLoading(false)
      })
  }

  const { active, stale, rejected } = useMemo(() => bucketJobs(jobs), [jobs])

  function openJob(job) {
    setActiveJob(job)
    setModalOpen(true)
  }

  async function handleSave(formData, id) {
    if (id) {
      await updateJob(id, formData)
    } else {
      await createJob(formData)
    }
    setModalOpen(false)
    loadJobs()
  }

  async function handleDelete(id) {
    await deleteJob(id)
    setModalOpen(false)
    loadJobs()
  }

  if (loading) return <p>Loading applications...</p>

  return (
    <div>
      <h1>Applications</h1>
      <StatsBar jobs={jobs} />
      <button className="add-application-btn" onClick={() => { setActiveJob(null); setModalOpen(true) }}>
        + Add Application
      </button>

      <ul className="job-list">
        {active.map((job) => (
          <JobRow key={job.id} job={job} onClick={() => openJob(job)} />
        ))}
      </ul>

      <CollapsibleSection
        title={`Older than ${STALE_DAYS} days`}
        jobs={stale}
        onSelect={openJob}
      />
      <CollapsibleSection title="Rejected" jobs={rejected} onSelect={openJob} />

      {modalOpen && (
        <JobModal
          job={activeJob}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}

export default Dashboard
