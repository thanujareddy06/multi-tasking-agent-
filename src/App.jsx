import { useState } from 'react'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div style={styles.container}>
      {/* Sidebar - Agents Status */}
      <aside className="glass-panel" style={styles.sidebar}>
        <div style={styles.logoContainer}>
          <div style={styles.logoIcon}>⚡</div>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>TaskMaster <span className="text-gradient">AI</span></h2>
        </div>
        
        <nav style={styles.nav}>
          <div style={styles.navSection}>
            <h5 style={styles.navHeader}>SYSTEM AGENTS</h5>
            <ul style={styles.navList}>
              <li style={styles.navItemActive}>
                <span style={styles.agentIcon}>📅</span>
                <div>
                  <div style={styles.agentName}>Scheduler</div>
                  <div style={styles.agentStatus}>Online & Syncing</div>
                </div>
              </li>
              <li style={styles.navItem}>
                <span style={styles.agentIcon}>✅</span>
                <div>
                  <div style={styles.agentName}>Task Agent</div>
                  <div style={styles.agentStatus}>Tracking 12 items</div>
                </div>
              </li>
              <li style={styles.navItem}>
                <span style={styles.agentIcon}>🧠</span>
                <div>
                  <div style={styles.agentName}>Knowledge</div>
                  <div style={styles.agentStatus}>Indexing notes...</div>
                </div>
              </li>
              <li style={styles.navItem}>
                <span style={styles.agentIcon}>🔗</span>
                <div>
                  <div style={styles.agentName}>Integration</div>
                  <div style={styles.agentStatus}>3 APIs connected</div>
                </div>
              </li>
            </ul>
          </div>
        </nav>

        <div style={styles.sidebarBottom}>
          <button className="btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            ⚙️ Settings
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={styles.main}>
        <header style={styles.header}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Good morning, User</h1>
            <p style={{ color: 'var(--text-secondary)' }}>TaskMaster AI has optimized your schedule for maximum productivity today.</p>
          </div>
          <div>
            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>✨</span> Run Workflow
            </button>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div style={styles.grid}>
          {/* Chat / Interaction Area */}
          <div className="glass-panel" style={{ ...styles.card, gridColumn: '1 / -1' }}>
            <div style={styles.chatInteraction}>
              <div style={styles.chatBubble}>
                "Plan my week with all meetings, deadlines, and focus sessions. Suggest optimizations."
              </div>
              <div style={styles.chatResponse}>
                <div style={styles.agentIconSmall}>⚡</div>
                <div>
                  <p style={{ marginBottom: '0.5rem' }}><strong>TaskMaster AI</strong></p>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    I've analyzed your inputs and coordinated with my sub-agents. Your weekly schedule is now planned, high-priority tasks are prioritized, and I've added a few suggestions for uninterrupted focus time.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Component */}
          <div className="glass-panel" style={styles.card}>
            <div style={styles.cardHeader}>
              <h3>📅 Weekly Schedule</h3>
              <button style={styles.iconBtn}>⋮</button>
            </div>
            <div style={styles.scheduleList}>
              <div style={styles.scheduleItem}>
                <div style={styles.scheduleTime}>Mon 10 AM</div>
                <div style={styles.scheduleDetail}>
                  <strong>Project Meeting</strong>
                  <span style={styles.tagBlue}>Team</span>
                </div>
              </div>
              <div style={styles.scheduleItemFocus}>
                <div style={styles.scheduleTime}>Mon 2 PM</div>
                <div style={styles.scheduleDetail}>
                  <strong>Focus Session</strong>
                  <span style={styles.tagPurple}>Deep Work</span>
                </div>
              </div>
              <div style={styles.scheduleItem}>
                <div style={styles.scheduleTime}>Tue 11 AM</div>
                <div style={styles.scheduleDetail}>
                  <strong>Code Review</strong>
                  <span style={styles.tagBlue}>Team</span>
                </div>
              </div>
              <div style={styles.scheduleItem}>
                <div style={styles.scheduleTime}>Wed 3 PM</div>
                <div style={styles.scheduleDetail}>
                  <strong>Client Call</strong>
                  <span style={styles.tagGreen}>External</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tasks Component */}
          <div className="glass-panel" style={styles.card}>
            <div style={styles.cardHeader}>
              <h3>📝 High-Priority Tasks</h3>
              <button style={styles.iconBtn}>+</button>
            </div>
            <div style={styles.taskList}>
              <label style={styles.taskItem}>
                <input type="checkbox" style={styles.checkbox} />
                <div style={styles.taskContent}>
                  <div style={styles.taskTitle}>Finish Business Analytics Chatbot</div>
                  <div style={styles.taskDue}>Due Thu</div>
                </div>
                <div style={styles.urgencyHigh}></div>
              </label>
              <label style={styles.taskItem}>
                <input type="checkbox" style={styles.checkbox} />
                <div style={styles.taskContent}>
                  <div style={styles.taskTitle}>Submit Internship Report</div>
                  <div style={styles.taskDue}>Due Fri</div>
                </div>
                <div style={styles.urgencyMedium}></div>
              </label>
              <label style={styles.taskItem}>
                <input type="checkbox" style={styles.checkbox} />
                <div style={styles.taskContent}>
                  <div style={styles.taskTitle}>Prepare Presentation on IoT</div>
                  <div style={styles.taskDue}>Due Wed</div>
                </div>
                <div style={styles.urgencyHigh}></div>
              </label>
            </div>
          </div>

          {/* Suggestions and Actions */}
          <div style={{ ...styles.card, display: 'flex', flexDirection: 'column', gap: '1.5rem', gridColumn: '1 / -1' }}>
            
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{...styles.cardHeader, marginBottom: '1rem'}}>
                <h3>💡 AI Suggestions</h3>
              </div>
              <ul style={styles.suggestionList}>
                <li style={styles.suggestionItem}>
                  <span style={{ color: 'var(--success)' }}>✨</span>
                  <span>Move low-priority tasks to Friday for <strong>uninterrupted focus time</strong>.</span>
                </li>
                <li style={styles.suggestionItem}>
                  <span style={{ color: 'var(--success)' }}>✨</span>
                  <span>Schedule exactly <strong>1-hour buffer</strong> between client calls and deep work sessions.</span>
                </li>
                <li style={styles.suggestionItem}>
                  <span style={{ color: 'var(--success)' }}>✨</span>
                  <span>Review notes daily for optimized productivity.</span>
                </li>
              </ul>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ marginBottom: '0.25rem' }}>Ready to proceed?</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Accept the workflow to apply these changes across all agents.</p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  📌 Pin
                </button>
                <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  ⏰ Reschedule
                </button>
                <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  📝 Edit
                </button>
                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  ✅ Complete
                </button>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    width: '100vw',
    maxWidth: '1600px',
    margin: '0 auto',
  },
  sidebar: {
    width: '280px',
    margin: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    position: 'sticky',
    top: '1.5rem',
    height: 'calc(100vh - 3rem)',
    zIndex: 10,
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1.5rem',
    borderBottom: '1px solid var(--glass-border)'
  },
  logoIcon: {
    background: 'var(--accent-gradient)',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 'bold',
    boxShadow: '0 4px 10px rgba(99, 102, 241, 0.4)'
  },
  nav: {
    flex: 1,
    padding: '1.5rem 1rem',
    overflowY: 'auto'
  },
  navSection: {
    marginBottom: '2rem'
  },
  navHeader: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    letterSpacing: '0.05em',
    marginBottom: '1rem',
    paddingLeft: '0.5rem'
  },
  navList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    transition: 'background var(--transition-fast)'
  },
  navItemActive: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    background: 'var(--bg-surface-hover)',
    borderLeft: '2px solid var(--accent-primary)'
  },
  agentIcon: {
    fontSize: '1.25rem'
  },
  agentName: {
    fontWeight: 500,
    fontSize: '0.95rem'
  },
  agentStatus: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)'
  },
  sidebarBottom: {
    padding: '1.5rem',
    borderTop: '1px solid var(--glass-border)'
  },
  main: {
    flex: 1,
    padding: '1.5rem 2rem 1.5rem 0',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2.5rem',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '1.5rem',
    flex: 1,
    alignContent: 'start'
  },
  card: {
    display: 'flex',
    flexDirection: 'column'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid var(--glass-border)'
  },
  iconBtn: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    fontSize: '1.2rem',
    padding: '0.25rem 0.5rem',
    borderRadius: 'var(--radius-sm)'
  },
  chatInteraction: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  chatBubble: {
    background: 'var(--bg-surface-hover)',
    padding: '1rem 1.5rem',
    borderRadius: '1rem',
    borderBottomRightRadius: '0.25rem',
    alignSelf: 'flex-end',
    maxWidth: '80%',
    boxShadow: 'var(--shadow-sm)'
  },
  chatResponse: {
    display: 'flex',
    gap: '1rem',
    maxWidth: '85%'
  },
  agentIconSmall: {
    background: 'var(--accent-gradient)',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)',
    fontSize: '0.9rem'
  },
  scheduleList: {
    padding: '1rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  scheduleItem: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start',
    padding: '0.75rem',
    borderRadius: 'var(--radius-md)',
    transition: 'background var(--transition-fast)'
  },
  scheduleItemFocus: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start',
    padding: '0.75rem',
    borderRadius: 'var(--radius-md)',
    background: 'rgba(217, 70, 239, 0.05)',
    border: '1px solid rgba(217, 70, 239, 0.2)'
  },
  scheduleTime: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    minWidth: '80px',
    paddingTop: '0.2rem'
  },
  scheduleDetail: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },
  tagBlue: {
    fontSize: '0.7rem',
    padding: '0.15rem 0.5rem',
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#a5b4fc',
    borderRadius: 'var(--radius-full)',
    width: 'fit-content'
  },
  tagPurple: {
    fontSize: '0.7rem',
    padding: '0.15rem 0.5rem',
    background: 'rgba(217, 70, 239, 0.15)',
    color: '#f0abfc',
    borderRadius: 'var(--radius-full)',
    width: 'fit-content'
  },
  tagGreen: {
    fontSize: '0.7rem',
    padding: '0.15rem 0.5rem',
    background: 'rgba(16, 185, 129, 0.15)',
    color: '#6ee7b7',
    borderRadius: 'var(--radius-full)',
    width: 'fit-content'
  },
  taskList: {
    padding: '1rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  taskItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem',
    background: 'var(--bg-surface)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--glass-border)',
    cursor: 'pointer',
    transition: 'transform var(--transition-fast)'
  },
  checkbox: {
    width: '1.25rem',
    height: '1.25rem',
    accentColor: 'var(--accent-primary)',
    cursor: 'pointer'
  },
  taskContent: {
    flex: 1
  },
  taskTitle: {
    fontWeight: 500,
    fontSize: '0.95rem',
    marginBottom: '0.2rem'
  },
  taskDue: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)'
  },
  urgencyHigh: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'var(--danger)',
    boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)'
  },
  urgencyMedium: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'var(--warning)',
    boxShadow: '0 0 8px rgba(245, 158, 11, 0.6)'
  },
  suggestionList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  suggestionItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    background: 'var(--bg-surface)',
    padding: '1rem',
    borderRadius: 'var(--radius-md)',
    borderLeft: '2px solid var(--success)'
  }
}

export default App
