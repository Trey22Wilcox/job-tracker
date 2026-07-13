import { useState, useEffect } from 'react'
import { getAllJobs, createJob, updateJob, deleteJob } from '../api/jobsApi'
import JobModal from '../components/JobModal'
import StatsBar from '../components/StatsBar'

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
    <button onClick={() => { setActiveJob(null); setModalOpen(true) }}>
        + Add Application
    </button>
      <ul>
        {jobs.map((job) => (
          <li key={job.id} onClick={() => { setActiveJob(job); setModalOpen(true) }}>
            {job.company} — {job.jobTitle} ({job.status})
          </li>
        ))}
      </ul>

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