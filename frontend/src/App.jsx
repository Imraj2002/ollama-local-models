import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  Send, Shield, ShieldAlert, MessageSquare, Loader2, Sparkles,
  UserCheck, AlertTriangle, CheckCircle2, RefreshCw, FileText
} from 'lucide-react';
import './index.css';

const API_BASE = 'http://localhost:5000/api';

const SAMPLE_PROFILE = {
  profileFor: 'Self',
  name: 'lead lead',
  gender: 'Female',
  dob: '2008-02-13T00:00:00.000Z',
  maritalStatus: 'Never Married',
  height: '5 - 2',
  anyDisability: 'No',
  caste: 'Mughal',
  motherTongue: 'Urdu',
  state: 'UP',
  city: 'Lucknow',
  country: 'IN',
  education: "Bachelor's",
  fieldOfStudy: 'English',
  occupation: 'Developer',
  annualIncome: '₹2 – 3 Lakhs',
  employmentType: 'Private',
  fatherOccupation: 'Test',
  motherOccupation: 'Housewife',
  familyStatus: 'Lower Middle Class',
  familyType: 'Nuclear',
  diet: 'Vegetarian',
  smoker: 'Yes',
  hobbies: ['Photography'],
  religiousBeliefs: '',
  lookingFor: '',
  aboutMe: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ut porta sem, sit amet imperdiet arcu. Proin id est nec lorem iaculis interdum. Integer sit amet nisi vehicula, efficitur nisi in, iaculis purus.',
  email: 'lead1@gmail.com',
  phone: '919876767890'
};

function App() {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'profile'
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Profile State
  const [profileInput, setProfileInput] = useState(JSON.stringify(SAMPLE_PROFILE, null, 2));
  const [profileResult, setProfileResult] = useState(null);

  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, profileResult]);

  const handleSendChat = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      text: input,
      type: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/validate`, { text: input });
      const { status, censoredText, abusiveWords } = response.data;

      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        status,
        // text: status === 'accepted' ? 'Content look good! No abusive language detected.' : 'Content flagged! Please see validation results below.',
        censoredText,
        abusiveWords,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('API Error:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'ai',
        status: 'error',
        text: 'Connection error. Is the backend running?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  const [auditStep, setAuditStep] = useState('');
  const [lastAuditTime, setLastAuditTime] = useState(null);

  const handleValidateProfile = async () => {
    setLoading(true);
    setProfileResult(null);
    setAuditStep('Initializing security audit...');
    setLastAuditTime(null);

    const startTime = performance.now();

    try {
      const data = JSON.parse(profileInput);

      setTimeout(() => setAuditStep('Scanning for placeholder patterns...'), 500);
      setTimeout(() => setAuditStep('Analyzing biographical consistency...'), 1500);
      setTimeout(() => setAuditStep('Finalizing authenticity report...'), 3500);

      const response = await axios.post(`${API_BASE}/validate-profile`, { profile: data });

      const endTime = performance.now();
      setLastAuditTime(((endTime - startTime) / 1000).toFixed(2));
      setProfileResult(response.data);
    } catch (error) {
      console.error('[Frontend] Validation failed:', error);
      let errorMessage = error.message;
      if (error.response?.data?.error) errorMessage = error.response.data.error;
      alert(`Validation Error: ${errorMessage}`);
    } finally {
      setLoading(false);
      setAuditStep('');
    }
  };

  return (
    <div className="app-container">
      <header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Sparkles color="#58a6ff" size={24} />
          <h1>LlamaSafe Validator</h1>
        </div>
        <div className="tab-switcher">
          <button
            className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <MessageSquare size={16} /> Chat
          </button>
          <button
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <UserCheck size={16} /> Profile
          </button>
        </div>
      </header>

      {activeTab === 'chat' ? (
        <>
          <div className="chat-messages" ref={scrollRef}>
            {messages.length === 0 && (
              <div className="empty-state">
                <MessageSquare />
                <p>Ready to validate your text. Try sending a message!</p>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.type}`}>
                <div className="message-content">{msg.text}</div>
                {msg.type === 'ai' && msg.status && msg.status !== 'error' && (
                  <div className={`validation-results ${msg.status}`}>
                    <div className="result-header">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {msg.status === 'accepted' ? <Shield size={14} color="#3fb950" /> : <ShieldAlert size={14} color="#f85149" />}
                        {msg.status.toUpperCase()}
                      </span>
                    </div>
                    {msg.abusiveWords?.length > 0 && (
                      <div className="abusive-words-list">
                        {msg.abusiveWords.map((word, i) => <span key={i} className="word-tag">{word}</span>)}
                      </div>
                    )}
                    {msg.status === 'rejected' && <div className="censored-text">{msg.censoredText}</div>}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="chat-input-container">
            <form onSubmit={handleSendChat} className="input-wrapper">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Check text for abuse..."
              />
              <button type="submit" disabled={loading}><Send size={20} /></button>
            </form>
          </div>
        </>
      ) : (
        <div className="profile-container">
          <div className="profile-grid">
            <div className="profile-input-section">
              <div className="section-header">
                <FileText size={18} />
                <h3>Profile JSON</h3>
                <button className="load-btn" onClick={() => setProfileInput(JSON.stringify(SAMPLE_PROFILE, null, 2))}>
                  <RefreshCw size={14} /> Load Sample
                </button>
              </div>
              <textarea
                value={profileInput}
                onChange={e => setProfileInput(e.target.value)}
                placeholder="Paste User Details JSON here..."
              />
              <button className="analyze-btn" onClick={handleValidateProfile} disabled={loading}>
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Loader2 className="loader" size={20} />
                    <span>{auditStep}</span>
                  </div>
                ) : 'Analyze Genuineness'}
              </button>
              {lastAuditTime && (
                <div className="performance-tag">
                  Last audit took {lastAuditTime}s
                </div>
              )}
            </div>

            <div className="profile-output-section">
              {profileResult ? (
                <div className="analysis-card">
                  <div className={`analysis-header ${profileResult.status.toLowerCase()}`}>
                    {profileResult.status === 'Genuine' ? <CheckCircle2 size={32} /> : <AlertTriangle size={32} />}
                    <div>
                      <h2>{profileResult.status}</h2>
                      <div className="score-bar">
                        <div className="score-fill" style={{ width: `${profileResult.authenticityScore}%` }}></div>
                      </div>
                      <span className="score-text">Authenticity Score: {profileResult.authenticityScore}%</span>
                    </div>
                  </div>

                  <p className="summary-text">{profileResult.summary}</p>

                  <div className="reasoning-list">
                    <h4>Flags & Reasoning</h4>
                    {profileResult.reasoning.map((item, i) => (
                      <div key={i} className={`reasoning-item ${(item.severity || 'Low').toLowerCase()}`}>
                        <div className="reason-field">{item.field}</div>
                        <div className="reason-issue">{item.issue}</div>
                        <div className="severity-badge">{item.severity}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <UserCheck />
                  <p>Load a profile and click analyze to check for consistency.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
