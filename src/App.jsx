import { useState, useEffect } from 'react'
import {
  PASS_SCORE, TEST_LENGTH, ADMIN_PASS,
  DOMAINS, buildTest, getStudyRecs, fmt,
  ALL_QUESTIONS, loadUsers, saveUser, loadScores, saveResult, deleteResult,
  MAX_DAILY_ATTEMPTS, attemptsToday, ALLOWED_EMAILS
} from './questions'

const APP_VERSION = 'v1.0.4'

/* ── Compass SVG icon ───────────────────────────────────────────────── */
function CompassIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="14" stroke="#1A1A1A" strokeWidth="1.5"/>
      <circle cx="16" cy="16" r="9"  stroke="#1A1A1A" strokeWidth="1"/>
      <polygon points="16,8 17.5,16 16,15.2 14.5,16"  fill="#E53935"/>
      <polygon points="16,24 14.5,16 16,16.8 17.5,16" fill="#666666"/>
      <circle cx="16" cy="16" r="1.8" fill="#1A1A1A"/>
    </svg>
  )
}

/* ── Site header ────────────────────────────────────────────────────── */
function Header({ right }) {
  return (
    <header className="site-header">
      <div className="brand">
        <CompassIcon size={22}/>
        <div>
          <div className="brand-name">Conscious Compass</div>
          <div className="brand-tag">Antenna Group</div>
        </div>
      </div>
      {right && <div>{right}</div>}
    </header>
  )
}

/* ── Score ring ─────────────────────────────────────────────────────── */
function Ring({ pct, passed }) {
  const r = 68
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  const col = passed ? '#059669' : '#DC2626'
  return (
    <div className="ring-wrap">
      <svg style={{ position:'absolute', inset:0, transform:'rotate(-90deg)' }}
           viewBox="0 0 160 160" width="160" height="160">
        <circle cx="80" cy="80" r={r} fill="none" stroke="#E8E6E1" strokeWidth="10"/>
        <circle cx="80" cy="80" r={r} fill="none" stroke={col} strokeWidth="10"
          strokeLinecap="butt"
          strokeDasharray={`${dash} ${circ - dash}`}
          style={{ transition:'stroke-dasharray 1s ease' }}/>
      </svg>
      <div className="ring-inner">
        <span className="ring-num" style={{ color: col }}>
          {pct}<span style={{ fontSize:20 }}>%</span>
        </span>
        <span className="ring-unit">score</span>
      </div>
    </div>
  )
}

/* ── COVER ──────────────────────────────────────────────────────────── */
function Cover({ onStart, onAdmin }) {
  const [form, setForm] = useState({ name:'', email:'' })
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))
  const ready = form.name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)

  const go = async () => {
    if (!form.name.trim()) { setErr('Please enter your full name.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setErr('Please enter a valid email.'); return }
    if (!ALLOWED_EMAILS.includes(form.email.trim().toLowerCase())) {
      setErr('This email address is not authorised for beta access. Please contact your Antenna administrator.')
      return
    }
    setLoading(true)
    const attempts = await attemptsToday(form.email.trim())
    if (attempts >= MAX_DAILY_ATTEMPTS) {
      setErr(`You've reached the limit of ${MAX_DAILY_ATTEMPTS} attempts for today. Please try again tomorrow.`)
      setLoading(false)
      return
    }
    await saveUser(form.name.trim(), form.email.trim())
    setLoading(false)
    setErr('')
    onStart(form.name.trim(), form.email.trim())
  }

  return (
    <div className="page fade-in">
      <Header right={
        <button className="admin-btn" onClick={onAdmin}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          Admin
        </button>
      }/>

      <div className="cover-hero">
        <div className="eyebrow" style={{ marginBottom:18 }}>Assessor Accreditation</div>
        <h1 style={{ fontSize:'clamp(26px,4.5vw,44px)', fontWeight:700, lineHeight:1.1, letterSpacing:-1.5, color:'#1A1A1A', marginBottom:14 }}>
          Let's become a<br/>
          <span style={{ color:'#E53935' }}>conscious assessor.</span>
        </h1>
        <p style={{ fontSize:15, color:'#666666', lineHeight:1.8, fontWeight:400, marginBottom:36, maxWidth:460, margin:'0 auto 36px' }}>
          Complete this test and then be able to complete assessments for brands. Passmark 80%.
        </p>
        <div style={{ fontSize:11, color:'#AAAAAA', letterSpacing:'0.08em', marginBottom:24 }}>{APP_VERSION}</div>

        {/* Form */}
        <div className="card" style={{ maxWidth:440, margin:'0 auto', textAlign:'left' }}>
          <div className="card-header">
            <span className="card-header-label">Register to begin</span>
          </div>
          <div style={{ padding:'24px' }}>
            {err && (
              <div style={{ background:'rgba(220,38,38,0.08)', border:'1px solid rgba(220,38,38,0.2)', padding:'10px 14px', fontSize:13, color:'#DC2626', marginBottom:16 }}>
                {err}
              </div>
            )}

            <div className="fi-group">
              <label className="fl">Full name</label>
              <input className="fi" placeholder="Your full name" value={form.name} onChange={f('name')}/>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
              <div>
                <label className="fl">Work email</label>
                <input className="fi" type="email" placeholder="you@antenna.com" value={form.email} onChange={f('email')}
                  onKeyDown={e => e.key==='Enter' && ready && go()}/>
              </div>
            </div>

            <button className="btn btn-primary btn-full" onClick={go} disabled={!ready || loading}>
              {loading ? 'Checking…' : 'Begin Accreditation Test →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── QUIZ ────────────────────────────────────────────────────────────── */
function Quiz({ questions, onComplete }) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answers, setAnswers] = useState([])
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const q = questions[current]
  const progress = Math.round((current / questions.length) * 100)
  const timerCls = elapsed > 1800 ? 'danger' : elapsed > 1350 ? 'warning' : ''
  const keys = ['A','B','C','D']

  const confirm = () => {
    if (selected === null) return
    const correct = selected === q.answer
    const newAnswers = [...answers, { qId:q.id, domain:q.domain, correct, selectedIdx:selected, question:q }]
    setAnswers(newAnswers)
    if (current < questions.length - 1) {
      setCurrent(c => c + 1)
      setSelected(null)
    } else {
      onComplete(newAnswers, elapsed)
    }
  }

  return (
    <div className="page">
      {/* Sticky quiz header */}
      <div className="quiz-header">
        <div className="brand">
          <CompassIcon size={18}/>
          <span style={{ fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'#1A1A1A', whiteSpace:'nowrap' }}>
            Compass · Test
          </span>
        </div>
        <div className="prog-wrap">
          <div className="prog-meta">
            <span>Q{current+1} of {questions.length}</span>
          </div>
          <div className="prog-track">
            <div className="prog-fill" style={{ width:`${progress}%` }}/>
          </div>
        </div>
        <div className={`timer ${timerCls}`}>{fmt(elapsed)}</div>
      </div>

      {/* Question */}
      <div className="q-body fade-in" key={current}>
        <div className="q-meta">
          <span className="q-num">Q{current+1}</span>
          <span className="tag">{DOMAINS[q.domain]}</span>
        </div>

        <p className="q-text">{q.q}</p>

        <div className="opts">
          {q.options.map((opt, i) => {
            const sel = selected === i
            return (
              <button key={i} className={`opt ${sel ? 'selected' : ''}`} onClick={() => setSelected(i)}>
                <span className="opt-key">{keys[i]}</span>
                <span>{opt}</span>
              </button>
            )
          })}
        </div>

        <div className="q-nav">
          <button className="btn btn-primary" style={{ minWidth:180 }} onClick={confirm} disabled={selected === null}>
            {current < questions.length - 1 ? 'Confirm & Continue →' : 'Finish Test →'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── RESULTS ──────────────────────────────────────────────────────────── */
function Results({ entry, onRetake }) {
  const recs = getStudyRecs(entry.answers)
  const incorrect = entry.answers.filter(a => !a.correct)
  const keys = ['A','B','C','D']

  const domainStats = Object.entries(DOMAINS).map(([key, label]) => {
    const qs = entry.answers.filter(a => a.domain === key)
    const c = qs.filter(a => a.correct).length
    return { key, label, pct: qs.length ? Math.round((c/qs.length)*100) : null, total: qs.length }
  }).filter(d => d.total > 0)

  return (
    <div className="page fade-in">
      <Header/>
      <div className="r-page">

        {/* Score hero */}
        <div className="r-hero" style={{ marginBottom:2 }}>
          <Ring pct={entry.score} passed={entry.passed}/>
          <div className="r-verdict" style={{ color: entry.passed ? '#059669' : '#DC2626' }}>
            {entry.passed ? '✓ Accreditation Passed' : '✗ Not Yet Accredited'}
          </div>
          <div className="r-meta">
            {entry.correct} correct out of {entry.total} · {fmt(entry.time)} · {new Date(entry.date).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}
          </div>
        </div>

        {/* Verdict study block */}
        <div className={`study-block ${entry.passed ? 'ok' : ''}`} style={{ marginBottom:2 }}>
          <div className={`study-label ${entry.passed ? 'ok' : ''}`}>
            {entry.passed ? 'You\'re cleared to assess' : 'Before you retake'}
          </div>
          {entry.passed ? (
            <p className="study-text">
              Well done, {entry.name.split(' ')[0]}. You've demonstrated the knowledge required to conduct Conscious Compass assessments.
              Keep the four assessor responsibilities front of mind — Input Integrity, Score Validation, Brand Expertise and Actionable Insight.
              The Compass is only as good as the expertise and integrity you bring to it.
            </p>
          ) : (
            <>
              <p className="study-text" style={{ marginBottom: recs.length ? 14 : 0 }}>
                You scored {entry.score}% against a pass mark of {PASS_SCORE}%. Review the incorrect questions below,
                then revisit the material for each flagged domain. Start with The Assessor's Role if it appears — it is the most critical part of the framework.
              </p>
              {recs.map((r,i) => (
                <div className="study-item" key={i}>
                  <div className="study-item-d">{r.domain}</div>
                  <div className="study-item-t">{r.guidance}</div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Incorrect questions */}
        {incorrect.length > 0 && (
          <div style={{ marginBottom:2 }}>
            <div style={{ background:'white', border:'1px solid var(--sand)', padding:'14px 20px', borderBottom:'none' }}>
              <div className="review-hdr" style={{ margin:0 }}>
                Questions answered incorrectly
                <span className="review-count">{incorrect.length}</span>
              </div>
            </div>
            <div style={{ marginBottom:2 }}>
              {incorrect.map((a, idx) => {
                const qd = a.question
                return (
                  <div className="review-card" key={idx}>
                    <div className="review-q-top">
                      <div className="review-domain">{DOMAINS[a.domain]}</div>
                      <div className="review-q-text">{qd.q}</div>
                    </div>
                    <div className="review-opts">
                      {qd.options.map((opt, i) => {
                        const isYours   = i === a.selectedIdx
                        const isCorrect = i === qd.answer
                        const cls = isCorrect ? 'correct' : isYours ? 'yours' : ''
                        return (
                          <div className={`review-opt ${cls}`} key={i}>
                            <span className="review-opt-key">{keys[i]}</span>
                            <span style={{ flex:1 }}>{opt}</span>
                            {isYours && !isCorrect && <span className="review-label yours">Your answer</span>}
                            {isCorrect && <span className="review-label correct">Correct</span>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Domain breakdown */}
        <div className="card" style={{ marginBottom:2, overflow:'hidden' }}>
          <div className="card-header">
            <span className="card-header-label">Score by domain</span>
          </div>
          {domainStats.map(d => {
            const col = d.pct >= 80 ? '#059669' : d.pct >= 60 ? '#F59E0B' : '#DC2626'
            return (
              <div className="d-row" key={d.key}>
                <span className="d-label">{d.label}</span>
                <div className="d-track">
                  <div className="d-fill" style={{ width:`${d.pct}%`, background:col }}/>
                </div>
                <span className="d-pct" style={{ color:col }}>{d.pct}%</span>
              </div>
            )
          })}
        </div>

        <div style={{ display:'flex', justifyContent:'center', paddingTop:16 }}>
          <button className="btn btn-outline" onClick={onRetake}>Retake Test</button>
        </div>
      </div>
    </div>
  )
}

/* ── ADMIN ────────────────────────────────────────────────────────────── */
function Admin({ onBack }) {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [authed, setAuthed] = useState(false)
  const [activeTab, setActiveTab] = useState('results')
  const [scores, setScores] = useState([])
  const [users, setUsers] = useState([])
  const [loadingData, setLoadingData] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  // Load data when admin authenticates
  useEffect(() => {
    if (!authed) return
    setLoadingData(true)
    Promise.all([loadScores(), loadUsers()])
      .then(([s, u]) => { setScores(s); setUsers(u) })
      .finally(() => setLoadingData(false))
  }, [authed])

  const deleteScore = async (id) => {
    await deleteResult(id)
    setScores(prev => prev.filter(s => s.id !== id))
    setConfirmDelete(null)
  }

  const tryAuth = () => {
    if (pw === ADMIN_PASS) { setAuthed(true) }
    else { setErr('Incorrect password.'); setPw('') }
  }

  if (!authed) return (
    <div className="page fade-in">
      <Header right={<button className="btn btn-ghost btn-sm" onClick={onBack}>← Back</button>}/>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'calc(100vh - 65px)', padding:24 }}>
        <div className="card" style={{ width:'100%', maxWidth:380 }}>
          <div className="card-header">
            <span className="card-header-label">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display:'inline',marginRight:6,verticalAlign:'middle' }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Admin Access
            </span>
          </div>
          <div style={{ padding:'24px' }}>
            {err && (
              <div style={{ background:'rgba(220,38,38,0.08)', border:'1px solid rgba(220,38,38,0.2)', padding:'10px 14px', fontSize:13, color:'#DC2626', marginBottom:16 }}>
                {err}
              </div>
            )}
            <div className="fi-group">
              <label className="fl">Password</label>
              <input className="fi" type="password" placeholder="Enter admin password" value={pw}
                onChange={e => setPw(e.target.value)} onKeyDown={e => e.key==='Enter' && tryAuth()} autoFocus/>
            </div>
            <button className="btn btn-primary btn-full" onClick={tryAuth}>Authenticate →</button>
          </div>
        </div>
      </div>
    </div>
  )

  const passed = scores.filter(s => s.passed).length
  const failed = scores.filter(s => !s.passed).length
  const avg = scores.length ? Math.round(scores.reduce((a,s) => a + s.score, 0) / scores.length) : 0

  return (
    <div className="page fade-in">
      <Header right={<button className="btn btn-ghost btn-sm" onClick={onBack}>← Exit Admin</button>}/>
      <div style={{ maxWidth:1080, margin:'0 auto', padding:'36px 24px 80px' }}>

        {/* Summary stats */}
        <div style={{ marginBottom:24 }}>
          <div className="eyebrow" style={{ marginBottom:14 }}>Admin Dashboard</div>
          <div className="stat-strip">
            <div className="stat-cell">
              <div className="stat-val">{scores.length}</div>
              <div className="stat-lbl">Total attempts</div>
            </div>
            <div className="stat-cell">
              <div className="stat-val" style={{ color:'#059669' }}>{passed}</div>
              <div className="stat-lbl">Passed</div>
            </div>
            <div className="stat-cell">
              <div className="stat-val" style={{ color:'#DC2626' }}>{failed}</div>
              <div className="stat-lbl">Failed</div>
            </div>
            <div className="stat-cell">
              <div className="stat-val">{avg}%</div>
              <div className="stat-lbl">Average score</div>
            </div>
            <div className="stat-cell">
              <div className="stat-val">{users.length}</div>
              <div className="stat-lbl">Registered users</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tab-bar">
          <button className={`tab ${activeTab==='results' ? 'active' : ''}`} onClick={() => setActiveTab('results')}>
            Test Results
          </button>
          <button className={`tab ${activeTab==='users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            Registered Users
          </button>
        </div>

        {/* Results table */}
        {activeTab === 'results' && (
          loadingData ? (
            <div className="card" style={{ padding:'48px 24px', textAlign:'center', color:'#666666', fontSize:14 }}>
              Loading results…
            </div>
          ) : scores.length === 0 ? (
            <div className="card" style={{ padding:'48px 24px', textAlign:'center', color:'#666666', fontSize:14 }}>
              No results yet. Share the test link with your team to get started.
            </div>
          ) : (
            <div style={{ border:'1px solid var(--sand)', overflow:'hidden' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    {['#','Name','Email','Score','Result','Correct','Time','Date',''].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {scores.map((s, i) => (
                    <tr key={i}>
                      <td style={{ color:'#999', fontSize:11 }}>{i+1}</td>
                      <td style={{ color:'#1A1A1A', fontWeight:600 }}>{s.name}</td>
                      <td style={{ color:'#666', fontSize:12 }}>{s.email}</td>
                      <td style={{ fontWeight:700, color: s.passed ? '#059669' : '#DC2626', fontVariantNumeric:'tabular-nums' }}>{s.score}%</td>
                      <td><span className={`badge ${s.passed ? 'badge-pass' : 'badge-fail'}`}>{s.passed ? 'Pass' : 'Fail'}</span></td>
                      <td style={{ fontVariantNumeric:'tabular-nums', fontSize:12 }}>{s.correct}/{s.total}</td>
                      <td style={{ fontVariantNumeric:'tabular-nums', fontSize:12, color:'#666' }}>{fmt(s.time)}</td>
                      <td style={{ fontSize:11, color:'#999', whiteSpace:'nowrap' }}>
                        {new Date(s.date).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}
                        <div style={{ fontSize:10, marginTop:1, color:'#bbb' }}>
                          {new Date(s.date).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}
                        </div>
                      </td>
                      <td style={{ textAlign:'right', paddingRight:16 }}>
                        {confirmDelete === s.id ? (
                          <div style={{ display:'flex', gap:6, justifyContent:'flex-end', alignItems:'center' }}>
                            <span style={{ fontSize:11, color:'#666', whiteSpace:'nowrap' }}>Sure?</span>
                            <button onClick={() => deleteScore(s.id)} style={{ fontSize:11, fontWeight:700, padding:'4px 10px', background:'#DC2626', color:'white', border:'none', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>Yes</button>
                            <button onClick={() => setConfirmDelete(null)} style={{ fontSize:11, fontWeight:600, padding:'4px 10px', background:'#F0EEEA', color:'#666', border:'1px solid #D9D6D0', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>No</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmDelete(s.id)} title="Delete result"
                            style={{ background:'none', border:'none', cursor:'pointer', color:'#CCC', padding:'4px 6px', lineHeight:1, fontSize:15, fontFamily:'Inter,sans-serif' }}
                            onMouseEnter={e => e.target.style.color='#DC2626'}
                            onMouseLeave={e => e.target.style.color='#CCC'}>
                            ✕
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* Users table */}
        {activeTab === 'users' && (
          loadingData ? (
            <div className="card" style={{ padding:'48px 24px', textAlign:'center', color:'#666666', fontSize:14 }}>
              Loading users…
            </div>
          ) : users.length === 0 ? (
            <div className="card" style={{ padding:'48px 24px', textAlign:'center', color:'#666666', fontSize:14 }}>
              No registered users yet.
            </div>
          ) : (
            <div style={{ border:'1px solid var(--sand)', overflow:'hidden' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    {['#','Name','Email','Registered'].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={i}>
                      <td style={{ color:'#999', fontSize:11 }}>{i+1}</td>
                      <td style={{ color:'#1A1A1A', fontWeight:600 }}>{u.name}</td>
                      <td style={{ color:'#666', fontSize:12 }}>{u.email}</td>
                      <td style={{ fontSize:11, color:'#999', whiteSpace:'nowrap' }}>
                        {new Date(u.createdAt).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}
                        <div style={{ fontSize:10, marginTop:1, color:'#bbb' }}>
                          {new Date(u.createdAt).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  )
}

/* ── Root ─────────────────────────────────────────────────────────────── */
export default function App() {
  const [phase, setPhase] = useState('cover')
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [questions, setQuestions] = useState([])
  const [entry, setEntry] = useState(null)

  const handleStart = (name, email) => {
    setUserName(name); setUserEmail(email)
    setQuestions(buildTest())
    setPhase('quiz')
  }

  const handleComplete = async (answers, elapsed) => {
    const cor = answers.filter(a => a.correct).length
    const pct = Math.round((cor / answers.length) * 100)
    const passed = pct >= PASS_SCORE
    const rec = {
      name: userName, email: userEmail,
      score: pct, correct: cor, total: answers.length,
      time: elapsed, passed, date: new Date().toISOString(), answers,
    }
    setEntry(rec)
    await saveResult(rec)
    setPhase('results')
  }

  const handleRetake = () => { setEntry(null); setPhase('cover') }

  return (
    <>
      {phase==='cover'   && <Cover onStart={handleStart} onAdmin={() => setPhase('admin')}/>}
      {phase==='quiz'    && <Quiz questions={questions} onComplete={handleComplete}/>}
      {phase==='results' && entry && <Results entry={entry} onRetake={handleRetake}/>}
      {phase==='admin'   && <Admin onBack={() => setPhase('cover')}/>}
    </>
  )
}
