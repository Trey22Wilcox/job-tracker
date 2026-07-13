import { useState, useEffect } from 'react'

function JobModal({ job, onClose, onSave, onDelete }) {
  const [company, setCompany] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [status, setStatus] = useState('APPLIED')
  const [saving, setSaving] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  useEffect(() => {
    if (job) {
      setCompany(job.company)
      setJobTitle(job.jobTitle)
      setStatus(job.status)
    }
    setConfirmingDelete(false)
  }, [job])

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    await onSave({ company, jobTitle, status }, job?.id)
    setSaving(false)
  }

  async function handleConfirmDelete() {
    setSaving(true)
    await onDelete(job.id)
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
              confirmingDelete ? (
                <>
                  <span>Delete this application?</span>
                  <button type="button" onClick={handleConfirmDelete} disabled={saving}>
                    Confirm Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(false)}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  disabled={saving}
                >
                  Delete
                </button>
              )
            )}

            <button type="button" onClick={onClose} disabled={saving}>
              Cancel
            </button>
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