import { useState, useEffect } from 'react'

function JobModal({ job, onClose, onSave, onDelete }) {
  const [company, setCompany] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [status, setStatus] = useState('APPLIED')
  const [jobPostingUrl, setJobPostingUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [appliedDate, setAppliedDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [urlCopied, setUrlCopied] = useState(false)

  useEffect(() => {
    if (job) {
      setCompany(job.company)
      setJobTitle(job.jobTitle)
      setStatus(job.status)
      setJobPostingUrl(job.jobPostingUrl || '')
      setNotes(job.notes || '')
      setAppliedDate(job.appliedDate || '')
    } else {
      setCompany('')
      setJobTitle('')
      setStatus('APPLIED')
      setJobPostingUrl('')
      setNotes('')
      setAppliedDate('')
    }
    setConfirmingDelete(false)
  }, [job])

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    await onSave({ company, jobTitle, status, jobPostingUrl, notes, appliedDate: appliedDate || null }, job?.id)
    setSaving(false)
  }

  async function handleConfirmDelete() {
    setSaving(true)
    await onDelete(job.id)
    setSaving(false)
  }

  async function handleCopyUrl() {
    await navigator.clipboard.writeText(jobPostingUrl)
    setUrlCopied(true)
    setTimeout(() => setUrlCopied(false), 1500)
  }

  return (
    <div className="modal-overlay">
      <div className={`modal${confirmingDelete ? ' modal-blurred' : ''}`}>
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

          <label>
            Applied Date
            <input
              type="date"
              value={appliedDate}
              onChange={(e) => setAppliedDate(e.target.value)}
            />
          </label>

          <label>
            <span className="label-row">
              Job Posting URL
              <button
                type="button"
                className="copy-url-btn"
                onClick={handleCopyUrl}
                disabled={!jobPostingUrl}
              >
                {urlCopied ? 'Copied!' : 'Copy'}
              </button>
            </span>
            <input
              type="url"
              value={jobPostingUrl}
              onChange={(e) => setJobPostingUrl(e.target.value)}
              placeholder="https://..."
            />
          </label>

          <label>
            Notes
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>

          {job && (
            <div className="modal-dates">
              <span>Last updated: {job.lastUpdated}</span>
            </div>
          )}

          <div className="modal-actions">
            {job && (
              <button
                type="button"
                className="btn-danger"
                onClick={() => setConfirmingDelete(true)}
                disabled={saving}
              >
                Delete
              </button>
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

      {confirmingDelete && (
        <div className="confirm-modal">
          <p>Delete this application?</p>
          <div className="modal-actions">
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-danger"
              onClick={handleConfirmDelete}
              disabled={saving}
            >
              {saving ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default JobModal