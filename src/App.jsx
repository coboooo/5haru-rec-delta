import { useState } from 'react'
import './App.css'

const tabs = [
  { id: 'past', label: '과거' },
  { id: 'now', label: '지금' },
  { id: 'future', label: '미래' },
]

function App() {
  const [activeTab, setActiveTab] = useState('now')

  return (
    <main className="app">
      <section className="screen" aria-labelledby={`${activeTab}-title`}>
        <div className="screen-content">
          <h1 id={`${activeTab}-title`}>
            {tabs.find((tab) => tab.id === activeTab)?.label}
          </h1>

          {activeTab === 'now' && (
            <>
              <p className="subtitle">오늘의 기록을 보는 화면</p>
              <details className="drawer-card">
                <summary>Sample 카드</summary>
                <div className="drawer-card-body">
                  <p>Sample 카드 내용</p>
                </div>
              </details>
            </>
          )}
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
