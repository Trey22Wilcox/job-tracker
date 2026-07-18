import { useState } from 'react'
import { analyzeResume } from '../api/resumeApi'

const RESUME_URL = `${import.meta.env.VITE_API_URL}/resume.pdf`

export default function Resume() {
  const [jobDescription, setJobDescription] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleAnalyze(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await analyzeResume(jobDescription)
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="resume-page">
      <h1>Resume</h1>

      <div className="resume-layout">
        <div className="resume-preview">
          <iframe src={RESUME_URL} title="Resume" />
        </div>

        <div className="resume-analysis">
          <form onSubmit={handleAnalyze}>
            <label>
              Job Description
              <textarea
                rows={5}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste a job description to see how well the resume matches..."
              />
            </label>
            <button type="submit" disabled={loading || !jobDescription.trim()}>
              {loading ? 'Analyzing...' : 'Analyze Match'}
            </button>
          </form>

          {error && <p className="analysis-error">{error}</p>}

          {result && (
            <div className="analysis-result">
              <div className="match-score">
                <span className="match-score-value">{result.matchScore}%</span>
                <span className="match-score-label">Match Score</span>
              </div>

              <div className="analysis-columns">
                <div className="analysis-section">
                  <h3>Strengths</h3>
                  <ul>
                    {result.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="analysis-section">
                  <h3>Gaps</h3>
                  <ul>
                    {result.gaps.map((g, i) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="analysis-section">
                <h3>Suggestion</h3>
                <p>{result.suggestion}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
