import { useState, useEffect, useCallback, useRef } from 'react'
import {
  PASS_SCORE, TEST_LENGTH, ADMIN_PASS,
  DOMAINS, buildTest, getStudyRecs, fmt, ALL_QUESTIONS
} from './questions'

const STORAGE_KEY = 'cc_scores_v4'

/* ── helpers ───────────────────────────────────────────────────────────────── */
function loadScores() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
function saveScores(arr) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)) } catch {}
}

/* ── Ring SVG ───────────────────────────────────────────────────────────────── */
function Ring({ pct, passed }) {
  const r = 70
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  const col = passed ? '#D9F52B' : '#DC2626'
  return (
    <div style={{ width: 156, height: 156, position: 'relative', margin: '0 auto 22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }} viewBox="0 0 156 156" width="156" height="156">
        <circle cx="78" cy="78" r={r} fill="none" stroke="#1C2333" strokeWidth="10" />
        <circle cx="78" cy="78" r={r} fill="none" stroke={col} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ - dash}`}
          style={{ transition: 'stroke-dasharray 1s ease' }} />
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
        <span style={{ fontSize: 44, fontWeight: 700, lineHeight: 1, letterSpacing: -2, color: col }}>
          {pct}<span style={{ fontSize: 18 }}>%</span>
        </span>
        <span style={{ fontSize: 11, color: 'var(--mid)', fontWeight: 500, marginTop: 2 }}>score</span>
      </div>
    </div>
  )
}

/* ── Phase: COVER ───────────────────────────────────────────────────────────── */
function Cover({ onStart, onAdmin }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [err, setErr] = useState('')

  const validate = () => {
    if (!form.name.trim()) { setErr('Please enter your full name.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setErr('Please enter a valid email address.'); return }
    if (form.password.length < 6) { setErr('Password must be at least 6 characters.'); return }
    setErr('')
    onStart(form.name.trim(), form.email.trim())
  }

  const ready = form.name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && form.password.length >= 6

  return (
    <div className="cover">
      {/* Header */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, borderBottom: '1px solid var(--bdr)', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <CompassIcon />
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: 'var(--off)', textTransform: 'uppercase' }}>Conscious Compass</span>
        </div>
        <span style={{ fontSize: 10, color: 'var(--mid)', letterSpacing: 1, textTransform: 'uppercase' }}>Antenna Group</span>
      </div>

      {/* Hero */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <div className="eyebrow" style={{ marginBottom: 20 }}>Assessor Accreditation</div>

        <h1 style={{ fontSize: 'clamp(32px,5vw,56px)', fontWeight: 700, lineHeight: 1.08, letterSpacing: -2, color: 'var(--off)', textAlign: 'center', maxWidth: 580, marginBottom: 16 }}>
          Prove you're ready<br />
          <span style={{ color: 'var(--cy)' }}>to assess.</span>
        </h1>

        <p style={{ fontSize: 15, color: 'var(--mid)', maxWidth: 420, textAlign: 'center', lineHeight: 1.8, fontWeight: 300, marginBottom: 36 }}>
          Complete this accreditation test before conducting any client assessment.
          {' '}{TEST_LENGTH} questions from a bank of {ALL_QUESTIONS.length}. Pass mark is {PASS_SCORE}%.
        </p>

        {/* Stats */}
        <div style={{ display: 'flex', background: 'var(--panel)', border: '1px solid var(--bdr)', borderRadius: 12, overflow: 'hidden', marginBottom: 36 }}>
          {[
            { value: TEST_LENGTH, label: 'Questions' },
            { value: `${PASS_SCORE}%`, label: 'Pass mark' },
            { value: 7, label: 'Domains' },
            { value: '~30m', label: 'Duration' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '18px 28px', borderRight: i < 3 ? '1px solid var(--bdr)' : 'none', textAlign: 'center', minWidth: 90 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--cy)', letterSpacing: -1, lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 10, color: 'var(--mid)', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="card" style={{ padding: '28px 32px', width: '100%', maxWidth: 480, textAlign: 'left' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--off)', marginBottom: 20 }}>Register to begin</div>
          {err && <div className="err" style={{ marginBottom: 16 }}>{err}</div>}

          <label className="fl">Full name</label>
          <input className="fi" style={{ marginBottom: 14 }} placeholder="Your name"
            value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label className="fl">Email</label>
              <input className="fi" type="email" placeholder="you@antenna.com"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="fl">Password</label>
              <input className="fi" type="password" placeholder="Min. 6 chars"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && ready && validate()} />
            </div>
          </div>

          <button className="btn btn-cy" style={{ width: '100%' }} onClick={validate} disabled={!ready}>
            Begin Test →
          </button>
        </div>
      </div>

      {/* Admin link */}
      <button onClick={onAdmin} style={{
        position: 'fixed', bottom: 20, right: 24,
        background: 'none', border: 'none', cursor: 'pointer',
        fontSize: 11, color: 'var(--bdr)', fontFamily: 'Inter, sans-serif',
        letterSpacing: 1, transition: 'color 0.2s',
      }}
        onMouseEnter={e => e.target.style.color = 'var(--mid)'}
        onMouseLeave={e => e.target.style.color = 'var(--bdr)'}
      >
        admin
      </button>
    </div>
  )
}

/* ── Phase: QUIZ ────────────────────────────────────────────────────────────── */
function Quiz({ questions, onComplete }) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answers, setAnswers] = useState([])
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const timerCls = elapsed > 1800 ? 'rd' : elapsed > 1350 ? 'am' : ''
  const q = questions[current]
  const progress = Math.round((current / questions.length) * 100)
  const correctSoFar = answers.filter(a => a.correct).length

  const confirm = () => {
    if (selected === null) return
    const correct = selected === q.answer
    const newAnswers = [...answers, { qId: q.id, domain: q.domain, correct, selectedIdx: selected, question: q }]
    setAnswers(newAnswers)
    if (current < questions.length - 1) {
      setCurrent(c => c + 1)
      setSelected(null)
    } else {
      onComplete(newAnswers, elapsed)
    }
  }

  const keys = ['A', 'B', 'C', 'D']

  return (
    <div>
      {/* Sticky header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: 'rgba(15,17,23,0.97)', borderBottom: '1px solid var(--bdr)',
        padding: '13px 28px', display: 'flex', alignItems: 'center', gap: 24,
        backdropFilter: 'blur(8px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CompassIcon size={18} />
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, color: 'var(--cy)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            Compass · Accreditation
          </span>
        </div>

        <div style={{ flex: 1, maxWidth: 380 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--mid)', marginBottom: 5, fontWeight: 500 }}>
            <span>Q{current + 1} of {questions.length}</span>
            <span>{correctSoFar} correct</span>
          </div>
          <div style={{ height: 3, background: 'var(--bdr)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'var(--cy)', borderRadius: 2, transition: 'width 0.4s ease' }} />
          </div>
        </div>

        <div className={`timer${timerCls ? ' ' + timerCls : ''}`}>{fmt(elapsed)}</div>
      </header>

      {/* Question body */}
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '48px 24px 80px', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--mid)', letterSpacing: 1.5, textTransform: 'uppercase' }}>Q{current + 1}</span>
          <span className="tag">{DOMAINS[q.domain]}</span>
        </div>

        <p style={{ fontSize: 'clamp(17px,2.4vw,21px)', fontWeight: 600, lineHeight: 1.5, color: 'var(--off)', marginBottom: 28, letterSpacing: -0.3 }}>
          {q.q}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 28 }}>
          {q.options.map((opt, i) => {
            const isSel = selected === i
            return (
              <button key={i}
                onClick={() => setSelected(i)}
                style={{
                  background: isSel ? 'rgba(217,245,43,0.08)' : 'var(--panel)',
                  border: `1px solid ${isSel ? 'var(--cy)' : 'var(--bdr)'}`,
                  borderRadius: 10, padding: '15px 17px', cursor: 'pointer',
                  display: 'flex', alignItems: 'flex-start', gap: 13, textAlign: 'left',
                  color: 'var(--off)', fontSize: 14, lineHeight: 1.55,
                  fontFamily: 'Inter, sans-serif', fontWeight: 400, width: '100%',
                  transition: 'border-color 0.12s, background 0.12s',
                }}
                onMouseEnter={e => { if (!isSel) { e.currentTarget.style.borderColor = 'rgba(217,245,43,0.22)'; e.currentTarget.style.background = 'var(--panel2)' } }}
                onMouseLeave={e => { if (!isSel) { e.currentTarget.style.borderColor = 'var(--bdr)'; e.currentTarget.style.background = 'var(--panel)' } }}
              >
                <span style={{
                  flexShrink: 0, width: 25, height: 25, borderRadius: 6,
                  background: isSel ? 'var(--cy)' : 'var(--panel2)',
                  border: `1px solid ${isSel ? 'var(--cy)' : 'var(--bdr)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700,
                  color: isSel ? 'var(--black)' : 'var(--mid)',
                  marginTop: 1, transition: 'all 0.12s', fontFamily: 'Inter, sans-serif',
                }}>
                  {keys[i]}
                </span>
                {opt}
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-cy" style={{ minWidth: 160 }} onClick={confirm} disabled={selected === null}>
            {current < questions.length - 1 ? 'Confirm & continue' : 'Finish test'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Phase: RESULTS ─────────────────────────────────────────────────────────── */
function Results({ entry, onRetake }) {
  const recs = getStudyRecs(entry.answers)
  const incorrect = entry.answers.filter(a => !a.correct)

  const domainStats = Object.entries(DOMAINS).map(([key, label]) => {
    const qs = entry.answers.filter(a => a.domain === key)
    const c = qs.filter(a => a.correct).length
    return { key, label, pct: qs.length ? Math.round((c / qs.length) * 100) : null, total: qs.length }
  }).filter(d => d.total > 0)

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '56px 24px 80px' }}>

      {/* Score ring */}
      <div style={{ textAlign: 'center', marginBottom: 44 }}>
        <Ring pct={entry.score} passed={entry.passed} />
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.8, marginBottom: 7, color: entry.passed ? 'var(--cy)' : 'var(--red)' }}>
          {entry.passed ? 'Accreditation Passed' : 'Not Yet Accredited'}
        </div>
        <div style={{ fontSize: 13, color: 'var(--mid)' }}>
          {entry.correct} correct out of {entry.total}&nbsp;·&nbsp;{fmt(entry.time)}
        </div>
      </div>

      {/* Verdict block */}
      {entry.passed ? (
        <StudyBlock ok>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: 'var(--cy)', textTransform: 'uppercase', marginBottom: 10 }}>You're cleared to assess</div>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.75 }}>
            Well done, {entry.name.split(' ')[0]}. You've demonstrated the knowledge required to conduct Conscious Compass assessments for clients. Keep the AI-assisted human intelligence principles front of mind — the Compass is only as good as the expertise and integrity you bring to it.
          </p>
        </StudyBlock>
      ) : (
        <StudyBlock>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: 'var(--amber)', textTransform: 'uppercase', marginBottom: 10 }}>Before you retake this test</div>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.75, marginBottom: recs.length ? 16 : 0 }}>
            You scored {entry.score}% against a pass mark of {PASS_SCORE}%. Review the incorrect questions below, then revisit the material for each flagged domain. Start with The Assessor's Role if it appears — it's the most critical part of the framework.
          </p>
          {recs.map((r, i) => (
            <div key={i} style={{ paddingTop: 14, marginTop: 14, borderTop: '1px solid var(--bdr)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: 'var(--amber)', textTransform: 'uppercase', marginBottom: 4 }}>{r.domain}</div>
              <div style={{ fontSize: 13, color: 'var(--mid)', lineHeight: 1.65 }}>{r.guidance}</div>
            </div>
          ))}
        </StudyBlock>
      )}

      {/* Incorrect review */}
      {incorrect.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 10, fontWeight: 700, letterSpacing: 2, color: 'var(--mid)', textTransform: 'uppercase', marginBottom: 16 }}>
            Questions answered incorrectly
            <span style={{ background: 'rgba(220,38,38,0.15)', color: '#F87171', border: '1px solid rgba(220,38,38,0.3)', fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 20, letterSpacing: 0 }}>{incorrect.length}</span>
          </div>
          {incorrect.map((a, idx) => {
            const qd = a.question
            return (
              <div key={idx} className="card" style={{ marginBottom: 10, overflow: 'hidden' }}>
                <div style={{ padding: '16px 18px 14px', borderBottom: '1px solid var(--bdr)' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--cy)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>{DOMAINS[a.domain]}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--off)', lineHeight: 1.5, letterSpacing: -0.2 }}>{qd.q}</div>
                </div>
                <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {qd.options.map((opt, i) => {
                    const isYours = i === a.selectedIdx
                    const isCorrect = i === qd.answer
                    const bg = isCorrect ? 'rgba(61,138,101,0.1)' : isYours ? 'rgba(220,38,38,0.07)' : 'var(--panel2)'
                    const bdr = isCorrect ? '#3D8A65' : isYours ? 'var(--red)' : 'var(--bdr)'
                    const textCol = (isCorrect || isYours) ? 'var(--off)' : 'var(--mid)'
                    const keyBg = isCorrect ? '#3D8A65' : isYours ? 'var(--red)' : 'var(--bdr)'
                    const keyCol = (isCorrect || isYours) ? '#fff' : 'var(--mid)'
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 8, fontSize: 13, lineHeight: 1.5, color: textCol, background: bg, border: `1px solid ${bdr}` }}>
                        <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: 5, background: keyBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: keyCol, marginTop: 1, fontFamily: 'Inter, sans-serif' }}>
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span style={{ flex: 1 }}>{opt}</span>
                        {isYours && !isCorrect && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, marginLeft: 'auto', flexShrink: 0, background: 'rgba(220,38,38,0.15)', color: '#F87171', letterSpacing: 0.5, textTransform: 'uppercase' }}>Your answer</span>}
                        {isCorrect && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, marginLeft: 'auto', flexShrink: 0, background: 'rgba(61,138,101,0.15)', color: '#5BAF87', letterSpacing: 0.5, textTransform: 'uppercase' }}>Correct</span>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Domain breakdown */}
      <div className="card" style={{ overflow: 'hidden', marginBottom: 28 }}>
        <div className="card-hdr">Score by domain</div>
        {domainStats.map(d => {
          const col = d.pct >= 80 ? 'var(--green)' : d.pct >= 60 ? 'var(--amber)' : 'var(--red)'
          return (
            <div key={d.key} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '11px 18px', borderBottom: '1px solid var(--bdr)' }}>
              <span style={{ fontSize: 12, color: 'var(--muted)', minWidth: 200, fontWeight: 500 }}>{d.label}</span>
              <div style={{ flex: 1, height: 5, background: 'var(--panel2)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${d.pct}%`, background: col, borderRadius: 3 }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, minWidth: 36, textAlign: 'right', color: col }}>{d.pct}%</span>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button className="btn btn-ghost" onClick={onRetake}>Retake test</button>
      </div>
    </div>
  )
}

/* ── Phase: ADMIN ────────────────────────────────────────────────────────────── */
function Admin({ onBack }) {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [authed, setAuthed] = useState(false)
  const scores = loadScores()

  const tryAuth = () => {
    if (pw === ADMIN_PASS) setAuthed(true)
    else { setErr('Incorrect password.'); setPw('') }
  }

  const passed = scores.filter(s => s.passed).length
  const failed = scores.filter(s => !s.passed).length
  const avg = scores.length ? Math.round(scores.reduce((a, s) => a + s.score, 0) / scores.length) : 0

  if (!authed) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="card" style={{ padding: '32px', width: '100%', maxWidth: 400, textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <CompassIcon />
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: 'var(--off)', textTransform: 'uppercase' }}>Admin Access</span>
        </div>
        {err && <div className="err" style={{ marginBottom: 16 }}>{err}</div>}
        <label className="fl">Password</label>
        <input className="fi" type="password" placeholder="Enter admin password"
          value={pw} onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && tryAuth()}
          autoFocus style={{ marginBottom: 14 }} />
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-cy" style={{ flex: 1 }} onClick={tryAuth}>Enter</button>
          <button className="btn btn-ghost btn-sm" style={{ flexShrink: 0 }} onClick={onBack}>Cancel</button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', padding: '48px 24px' }}>
      {/* Top bar */}
      <div style={{ maxWidth: 1040, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <CompassIcon />
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, color: 'var(--cy)', textTransform: 'uppercase' }}>Accreditation Results</div>
            <div style={{ fontSize: 12, color: 'var(--mid)', marginTop: 2 }}>All test attempts</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <StatPill label="Total" value={scores.length} />
          <StatPill label="Passed" value={passed} color="var(--green)" />
          <StatPill label="Failed" value={failed} color="var(--red)" />
          <StatPill label="Avg score" value={`${avg}%`} color="var(--cy)" />
          <button className="btn btn-ghost btn-sm" onClick={onBack}>Exit</button>
        </div>
      </div>

      <div style={{ maxWidth: 1040, margin: '0 auto' }}>
        {scores.length === 0 ? (
          <div className="card" style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--mid)', fontSize: 14 }}>
            No results yet.
          </div>
        ) : (
          <div className="card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {['#', 'Name', 'Email', 'Score', 'Result', 'Correct', 'Time', 'Date'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--mid)', borderBottom: '1px solid var(--bdr)', background: 'var(--panel2)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scores.map((s, i) => (
                  <tr key={i} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--bdr)', color: 'var(--mid)', fontSize: 11 }}>{i + 1}</td>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--bdr)', color: 'var(--off)', fontWeight: 500 }}>{s.name}</td>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--bdr)', color: 'var(--mid)', fontSize: 12 }}>{s.email}</td>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--bdr)', fontWeight: 700, color: s.passed ? 'var(--cy)' : 'var(--red)', fontVariantNumeric: 'tabular-nums' }}>{s.score}%</td>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--bdr)' }}><span className={`badge ${s.passed ? 'badge-pass' : 'badge-fail'}`}>{s.passed ? 'Pass' : 'Fail'}</span></td>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--bdr)', color: 'var(--muted)', fontVariantNumeric: 'tabular-nums', fontSize: 12 }}>{s.correct}/{s.total}</td>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--bdr)', color: 'var(--muted)', fontVariantNumeric: 'tabular-nums', fontSize: 12 }}>{fmt(s.time)}</td>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--bdr)', color: 'var(--mid)', fontSize: 11 }}>{new Date(s.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Shared sub-components ──────────────────────────────────────────────────── */
function StudyBlock({ children, ok }) {
  return (
    <div style={{
      borderLeft: `3px solid ${ok ? 'var(--cy)' : 'var(--amber)'}`,
      borderRadius: '0 10px 10px 0',
      background: 'var(--panel)',
      border: `1px solid var(--bdr)`,
      borderLeftColor: ok ? 'var(--cy)' : 'var(--amber)',
      borderLeftWidth: 3,
      padding: '22px 24px',
      marginBottom: 24,
    }}>
      {children}
    </div>
  )
}

function StatPill({ label, value, color }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: color || 'var(--off)', letterSpacing: -0.5, lineHeight: 1, marginBottom: 2 }}>{value}</div>
      <div style={{ fontSize: 10, color: 'var(--mid)', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 500 }}>{label}</div>
    </div>
  )
}

function CompassIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="15" stroke="#252D3D" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="11" stroke="#252D3D" strokeWidth="1" />
      <polygon points="16,7 17.6,16 16,15.2 14.4,16" fill="#D9F52B" />
      <polygon points="16,25 14.4,16 16,16.8 17.6,16" fill="#6B7280" />
      <circle cx="16" cy="16" r="1.8" fill="#F0EFE8" />
    </svg>
  )
}

/* ── Root App ───────────────────────────────────────────────────────────────── */
export default function App() {
  const [phase, setPhase] = useState('cover')   // cover | quiz | results | admin
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [questions, setQuestions] = useState([])
  const [entry, setEntry] = useState(null)

  const handleStart = (name, email) => {
    setUserName(name)
    setUserEmail(email)
    setQuestions(buildTest())
    setPhase('quiz')
  }

  const handleComplete = (answers, elapsed) => {
    const cor = answers.filter(a => a.correct).length
    const pct = Math.round((cor / answers.length) * 100)
    const passed = pct >= PASS_SCORE
    const rec = {
      name: userName, email: userEmail,
      score: pct, correct: cor, total: answers.length,
      time: elapsed, passed, date: new Date().toISOString(),
      answers,
    }
    setEntry(rec)

    const existing = loadScores()
    const updated = [...existing, rec].sort((a, b) => b.score - a.score).slice(0, 50)
    saveScores(updated)

    setPhase('results')
  }

  const handleRetake = () => {
    setEntry(null)
    setPhase('cover')
  }

  return (
    <>
      {phase === 'cover'   && <Cover onStart={handleStart} onAdmin={() => setPhase('admin')} />}
      {phase === 'quiz'    && <Quiz questions={questions} onComplete={handleComplete} />}
      {phase === 'results' && entry && <Results entry={entry} onRetake={handleRetake} />}
      {phase === 'admin'   && <Admin onBack={() => setPhase('cover')} />}
    </>
  )
}
