function StatsBar({ jobs }) {
  const total = jobs.length

  const interviews = jobs.filter(
    (job) => job.status === 'PHONE_SCREEN' || job.status === 'INTERVIEW'
  ).length

  const offers = jobs.filter((job) => job.status === 'OFFER').length

  const responded = jobs.filter((job) => job.status !== 'APPLIED').length
  const responseRate = total === 0 ? 0 : Math.round((responded / total) * 100)

  return (
    <div className="stats-bar">
      <div className="stat">
        <div className="stat-value">{total}</div>
        <div className="stat-label">Total Applications</div>
      </div>
      <div className="stat">
        <div className="stat-value">{interviews}</div>
        <div className="stat-label">Interviews</div>
      </div>
      <div className="stat">
        <div className="stat-value">{offers}</div>
        <div className="stat-label">Offers</div>
      </div>
      <div className="stat">
        <div className="stat-value">{responseRate}%</div>
        <div className="stat-label">Response Rate</div>
      </div>
    </div>
  )
}

export default StatsBar