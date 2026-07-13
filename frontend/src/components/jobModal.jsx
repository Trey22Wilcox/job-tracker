import { useState, useEffect } from 'react'

function JobModal({ job, onClose, onSave, onDelete }) {
  const [company, setCompany] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [status, setStatus] = useState('APPLIED')

  useEffect(() => {
    if (job) {
      setCompany(job.company)
      setJobTitle(job.jobTitle)
      setStatus(job.status)
    }
  }, [job])

const [saving, setSaving] = useState(false)

async function handleSubmit(e) {
  e.preventDefault()
  setSaving(true)
  await onSave({ company, jobTitle, status }, job?.id)
  setSaving(false)
}

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{job ? 'Edit Application' : 'Add Application'}</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Company
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </label>

          <label>
            Job Title
            <input
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </label>

          <label>
            Status
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="APPLIED">Applied</option>
              <option value="PHONE_SCREEN">Phone Screen</option>
              <option value="INTERVIEW">Interview</option>
              <option value="OFFER">Offer</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </label>

          <div className="modal-actions">
            {job && (
              <button type="button" onClick={() => onDelete(job.id)}>
                Delete
              </button>
            )}
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default JobModal