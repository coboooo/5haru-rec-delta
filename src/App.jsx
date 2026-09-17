import { useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { onValue, push, ref, remove } from 'firebase/database'
import './App.css'
import { auth, database, googleProvider } from './firebase'

const tabs = [
  { id: 'past', label: '과거' },
  { id: 'now', label: '지금' },
  { id: 'future', label: '미래' },
]

function App() {
  const [activeTab, setActiveTab] = useState('now')
  const [user, setUser] = useState(null)
  const [message, setMessage] = useState('')
  const [items, setItems] = useState([])
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [loadedUid, setLoadedUid] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const isLoading = Boolean(user && loadedUid !== user.uid)

  useEffect(() => {
    return onAuthStateChanged(auth, (nextUser) => {
      setItems([])
      setLoadedUid(null)
      setUser(nextUser)
      setIsAuthLoading(false)
      setError('')
    })
  }, [])

  useEffect(() => {
    if (!user) {
      return undefined
    }

    const messagesRef = ref(database, `users/${user.uid}/messages`)

    return onValue(
      messagesRef,
      (snapshot) => {
        const data = snapshot.val() ?? {}
        const nextItems = Object.entries(data)
          .filter(([, value]) => typeof value === 'string')
          .map(([id, value]) => ({ id, value }))

        setItems(nextItems)
        setLoadedUid(user.uid)
        setError('')
      },
      () => {
        setItems([])
        setLoadedUid(user.uid)
        setError('데이터를 불러오지 못했어. 잠시 후 다시 시도해 줘.')
      },
    )
  }, [user])

  async function handleSignIn() {
    if (isSigningIn) return

    setIsSigningIn(true)
    setError('')

    try {
      await signInWithPopup(auth, googleProvider)
    } catch (signInError) {
      if (signInError.code === 'auth/popup-closed-by-user') {
        setError('로그인이 취소됐어.')
      } else if (signInError.code === 'auth/popup-blocked') {
        setError('로그인 팝업이 차단됐어. 팝업을 허용하고 다시 시도해 줘.')
      } else if (signInError.code === 'auth/operation-not-allowed') {
        setError('Firebase에서 Google 로그인을 먼저 활성화해야 해.')
      } else if (signInError.code === 'auth/unauthorized-domain') {
        setError('현재 주소가 Firebase 로그인 허용 도메인에 등록되지 않았어.')
      } else {
        setError('Google 로그인에 실패했어. 잠시 후 다시 시도해 줘.')
      }
    } finally {
      setIsSigningIn(false)
    }
  }

  async function handleSignOut() {
    setError('')

    try {
      await signOut(auth)
    } catch {
      setError('로그아웃하지 못했어. 다시 시도해 줘.')
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const value = message.trim()

    if (!user || !value || isSaving) return

    setIsSaving(true)
    setError('')

    try {
      await push(ref(database, `users/${user.uid}/messages`), value)
      setMessage('')
    } catch {
      setError('기록을 저장하지 못했어. 다시 시도해 줘.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!user) return

    setError('')

    try {
      await remove(ref(database, `users/${user.uid}/messages/${id}`))
    } catch {
      setError('기록을 삭제하지 못했어. 다시 시도해 줘.')
    }
  }

  return (
    <main className="app">
      <section className="screen" aria-labelledby={`${activeTab}-title`}>
        <div className="screen-content">
          <p className="build-badge" aria-label="델타 버전 0.1.0, React JS">
            DELTA <span>·</span> v0.1.0 <span>·</span> React JS
          </p>

          <div className="account-area">
            {isAuthLoading ? (
              <p className="auth-status">로그인 상태 확인 중...</p>
            ) : user ? (
              <div className="account-card">
                {user.photoURL ? (
                  <img
                    className="profile-image"
                    src={user.photoURL}
                    alt=""
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="profile-fallback" aria-hidden="true">
                    {(user.displayName || user.email || '?').slice(0, 1).toUpperCase()}
                  </span>
                )}
                <span className="account-copy">
                  <strong>{user.displayName || 'Google 사용자'}</strong>
                  <small>{user.email}</small>
                </span>
                <button className="sign-out-button" type="button" onClick={handleSignOut}>
                  로그아웃
                </button>
              </div>
            ) : (
              <button
                className="google-sign-in-button"
                type="button"
                onClick={handleSignIn}
                disabled={isSigningIn}
              >
                <span className="google-mark" aria-hidden="true">G</span>
                {isSigningIn ? '로그인 중...' : 'Google로 로그인'}
              </button>
            )}
          </div>

          <h1 id={`${activeTab}-title`}>
            {tabs.find((tab) => tab.id === activeTab)?.label}
          </h1>

          {activeTab === 'now' && (
            <>
              <p className="subtitle">오늘의 기록을 보는 화면</p>
              <details className="drawer-card" open={Boolean(user)}>
                <summary>
                  <span>내 기록</span>
                  {user && <span className="live-indicator">실시간</span>}
                </summary>
                <div className="drawer-card-body">
                  {!user ? (
                    <div className="signed-out-state">
                      <p>Google로 로그인하면 내 기록을 안전하게 저장할 수 있어.</p>
                      <button type="button" onClick={handleSignIn} disabled={isSigningIn}>
                        {isSigningIn ? '로그인 중...' : '로그인하고 시작하기'}
                      </button>
                    </div>
                  ) : (
                    <>
                      <form className="message-form" onSubmit={handleSubmit}>
                        <label className="sr-only" htmlFor="firebase-message">새 기록</label>
                        <input
                          id="firebase-message"
                          type="text"
                          value={message}
                          onChange={(event) => setMessage(event.target.value)}
                          placeholder="새 기록을 입력해 줘"
                          maxLength={200}
                          autoComplete="off"
                        />
                        <button type="submit" disabled={!message.trim() || isSaving}>
                          {isSaving ? '저장 중' : '전송'}
                        </button>
                      </form>

                      <div className="message-list" aria-live="polite">
                        {isLoading && <p className="status-message">불러오는 중...</p>}
                        {!isLoading && !error && items.length === 0 && (
                          <p className="status-message">첫 번째 기록을 남겨 봐.</p>
                        )}
                        {items.map((item) => (
                          <div className="message-item" key={item.id}>
                            <p>{item.value}</p>
                            <button
                              className="delete-button"
                              type="button"
                              aria-label={`${item.value} 삭제`}
                              onClick={() => handleDelete(item.id)}
                            >
                              삭제
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </details>
            </>
          )}

          {error && <p className="status-message error page-error" role="alert">{error}</p>}
        </div>
      </section>

      <nav className="bottom-nav" aria-label="하단 탭" role="tablist">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              className={`tab${isActive ? ' active' : ''}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`${tab.id}-title`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          )
        })}
      </nav>
    </main>
  )
}

export default App
