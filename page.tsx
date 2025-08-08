
'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

function classNames(...c: Array<string | false | null | undefined>) { return c.filter(Boolean).join(' ') }

const MAX_THUMBS = 3
const MAX_TITLES = 3

export default function Page() {
  const [session, setSession] = useState<any>(null)
  const [showSignup, setShowSignup] = useState(false)
  const [step, setStep] = useState<'landing'|'form'>('landing')

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data }) => mounted && setSession(data.session ?? null))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => {
      setSession(sess)
      if (sess) { setShowSignup(false); setStep('form') }
    })
    return () => sub?.subscription.unsubscribe()
  }, [])

  const onCreateClick = () => {
    if (!session) setShowSignup(true); else setStep('form')
  }

  return (
    <div className="min-h-screen text-[#e6e8ef] bg-[#0a0c12]">
      <header className="border-b border-white/5">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="text-xl font-semibold tracking-tight">HookPick</div>
          <div className="flex items-center gap-2">
            {session ? (
              <>
                <span className="hidden md:inline text-sm text-white/60">{session?.user?.email}</span>
                <button onClick={async () => { await supabase.auth.signOut(); setStep('landing') }} className="rounded-xl px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10">Sign out</button>
              </>
            ) : (
              <button onClick={() => setShowSignup(true)} className="rounded-xl px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10">Sign in</button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 md:py-16 space-y-8">
        {step === 'landing' ? <Landing onCreate={onCreateClick} /> : <CreateTestForm email={session?.user?.email || ''} />}
      </main>

      {showSignup && <SignupModal onClose={() => setShowSignup(false)} />}
    </div>
  )
}

function Landing({ onCreate }: { onCreate: () => void }) {
  return (
    <section className="mx-auto max-w-3xl text-center space-y-6">
      <h1 className="text-4xl md:text-5xl font-semibold leading-tight">Test thumbnails and titles before you publish</h1>
      <p className="text-lg text-white/70">Share a unique link with your team or community. Collect quick votes to learn which combo wins attention.</p>
      <div className="pt-2">
        <button onClick={onCreate} className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium bg-gradient-to-br from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-900/20 ring-1 ring-white/10">
          Create test
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="opacity-90"><path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
    </section>
  )
}

function SignupModal({ onClose }: { onClose: () => void }) {
  const signInGoogle = async () => {
    const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })
    if (error) alert(error.message)
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-3xl bg-[#0d1018] ring-1 ring-white/10 shadow-2xl overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-white/5 flex items-center justify-between">
          <div className="text-lg font-semibold">Sign in to continue</div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
          </button>
        </div>
        <div className="p-5 sm:p-6 space-y-4">
          <button onClick={signInGoogle} className="w-full rounded-xl bg-white text-black px-4 py-2.5 text-sm font-medium hover:opacity-90 transition">Continue with Google</button>
          <p className="text-xs text-white/50">We use Google only to save your tests.</p>
        </div>
      </div>
    </div>
  )
}

function CreateTestForm({ email }: { email: string }) {
  const [name, setName] = useState('')
  const [titles, setTitles] = useState(Array.from({ length: MAX_TITLES }, () => ''))
  const [thumbs, setThumbs] = useState<{ id: string; name: string; url: string }[]>([])
  const fileRef = useRef<HTMLInputElement | null>(null)

  const addFiles = async (files: File[]) => {
    const remaining = MAX_THUMBS - thumbs.length
    const slice = files.slice(0, Math.max(0, remaining))
    const out: { id: string; name: string; url: string }[] = []
    for (let i = 0; i < slice.length; i++) {
      const f = slice[i]
      const url = await fileToDataURL(f)
      out.push({ id: `${Date.now()}-${i}`, name: f.name, url })
    }
    setThumbs(prev => [...prev, ...out])
  }

  const onFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    await addFiles(files)
    if (fileRef.current) fileRef.current.value = ''
  }

  const removeThumb = (id: string) => setThumbs(prev => prev.filter(t => t.id !== id))
  const canPublish = thumbs.length > 0 && titles.some(t => t.trim())

  const createTest = async () => {
    if (!canPublish) return
    alert('This will call your API to create a test in Supabase (next step).')
  }

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h2 className="text-3xl font-semibold">Create a test</h2>
        <p className="text-white/60 text-sm">Signed in as <span className="text-white/80 font-medium">{email || 'guest'}</span></p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="rounded-3xl p-5 sm:p-6 bg-white/[0.03] ring-1 ring-white/10 backdrop-blur-xl shadow-xl space-y-5">
          <div className="space-y-2">
            <label className="text-sm text-white/70">Test name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Episode 12 pre publish test" className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-600" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-white/70">Titles</label>
              <span className="text-xs text-white/50">Add up to {MAX_TITLES}</span>
            </div>
            <div className="grid gap-3">
              {titles.map((t, i) => (
                <div key={i} className="relative">
                  <input
                    value={t}
                    onChange={e => {
                      const copy = [...titles]; copy[i] = e.target.value; setTitles(copy)
                    }}
                    placeholder={`Title ${i + 1}`}
                    maxLength={100}
                    className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 pr-14 outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-white/40">{t.length}/100</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl p-5 sm:p-6 bg-white/[0.03] ring-1 ring-white/10 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm text-white/70">Thumbnails</label>
            <span className="text-xs text-white/50">Add up to {MAX_THUMBS}</span>
          </div>

          <label className={classNames(
            'block w-full cursor-pointer rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-4 text-center hover:bg-white/[0.04] transition',
            thumbs.length >= MAX_THUMBS && 'opacity-50 cursor-not-allowed'
          )}>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onFiles} disabled={thumbs.length >= MAX_THUMBS} />
            <div className="text-sm">
              {thumbs.length < MAX_THUMBS ? (
                <>
                  <div className="text-white/80">Click to upload</div>
                  <div className="text-white/50">PNG or JPG, up to {MAX_THUMBS - thumbs.length} more</div>
                </>
              ) : (
                <div className="text-white/60">Limit reached</div>
              )}
            </div>
          </label>

          {thumbs.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {thumbs.map((th) => (
                <div key={th.id} className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02]">
                  <img src={th.url} alt={th.name} className="w-full aspect-video object-cover" />
                  <button onClick={() => removeThumb(th.id)} className="absolute top-2 right-2 rounded-lg bg-black/50 p-1 text-white/80 hover:bg-black/70">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button onClick={createTest} disabled={!canPublish} className={classNames(
          'rounded-2xl px-5 py-3 text-sm font-medium ring-1 ring-white/10 shadow-lg',
          canPublish ? 'bg-gradient-to-br from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500' : 'bg-white/5 text-white/60 cursor-not-allowed'
        )}>
          Create test
        </button>
        {!canPublish && <span className="text-sm text-white/60">Add at least one title and one thumbnail</span>}
      </div>
    </div>
  )
}

async function fileToDataURL(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result))
    r.onerror = reject
    r.readAsDataURL(file)
  })
}
