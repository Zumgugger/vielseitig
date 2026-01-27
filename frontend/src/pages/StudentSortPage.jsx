import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Loading, Toast, HexagonGrid } from '../components';
import { analyticsApi, studentApi, shareApi } from '../api/client';
import { useTheme } from '../store/ThemeContext';

/**
 * Section 13.3: Sortieransicht Page (/sort or /l/{token})
 * 
 * Core student sorting experience:
 * - Display one adjective at a time
 * - Three buckets: selten, manchmal, oft
 * - Keyboard controls (A/S/D or arrows)
 * - Progress tracking
 * - Keyboard shortcuts overlay
 */
export default function StudentSortPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { currentTheme } = useTheme();

  // Map theme names for hex visualization
  const hexThemeMap = {
    default: 'blue',
    ocean: 'teal',
    sunset: 'orange',
    forest: 'green',
    purple: 'purple',
    dark: 'blue',
  };

  const hexTheme = hexThemeMap[currentTheme] || 'blue';

  // State Management
  const [sessionState, setSessionState] = useState({
    sessionId: null,
    listId: null,
    isDefault: true,
    assignments: [], // {adjectiveId, bucket}
    currentIndex: 0,
    totalCount: 0,
  });
  const [adjectives, setAdjectives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [showInfo, setShowInfo] = useState(true);
  const [showExplanation, setShowExplanation] = useState(false);
  const [previewCollapsed, setPreviewCollapsed] = useState(true);

  // Calculate live preview cards (oft/manchmal only)
  const { oftCards, manchmalCards } = useMemo(() => {
    const oft = [];
    const manchmal = [];

    sessionState.assignments.forEach(assignment => {
      const adjective = adjectives.find(adj => adj.id === assignment.adjectiveId);
      if (!adjective) return;

      const card = { id: adjective.id, word: adjective.word };

      if (assignment.bucket === 'oft') {
        oft.push(card);
      } else if (assignment.bucket === 'manchmal') {
        manchmal.push(card);
      }
    });

    return { oftCards: oft, manchmalCards: manchmal };
  }, [sessionState.assignments, adjectives]);

  // Load adjectives on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        setLoading(true);
        console.log('[StudentSortPage] Loading session, token:', token);

        // Generate storage key based on token (or 'default')
        const storageKey = `vielseitig_session_${token || 'default'}`;
        
        // Try to restore from localStorage first
        const savedState = localStorage.getItem(storageKey);
        if (savedState) {
          try {
            const parsed = JSON.parse(savedState);
            console.log('[StudentSortPage] Found saved session:', parsed);
            
            // Validate saved data
            if (parsed.adjectives && parsed.sessionState && parsed.timestamp) {
              const age = Date.now() - parsed.timestamp;
              const maxAge = 24 * 60 * 60 * 1000; // 24 hours
              
              if (age < maxAge) {
                // Restore state
                setAdjectives(parsed.adjectives);
                setSessionState(parsed.sessionState);
                setLoading(false);
                console.log('[StudentSortPage] Restored session from localStorage');
                return;
              } else {
                console.log('[StudentSortPage] Saved session expired, starting fresh');
                localStorage.removeItem(storageKey);
              }
            }
          } catch (err) {
            console.error('[StudentSortPage] Failed to parse saved session:', err);
            localStorage.removeItem(storageKey);
          }
        }

        // No valid saved state - load fresh
        // Determine which list to load and get adjectives
        let adjResponse;
        let listId;

        if (token) {
          // Share link - use token to get public list
          console.log('[StudentSortPage] Using share token:', token);
          adjResponse = await shareApi.getPublicList(token);
          listId = adjResponse.data.id;
        } else {
          // Default list - fetch from /student/default/adjectives
          console.log('[StudentSortPage] Fetching default adjectives');
          adjResponse = await studentApi.getDefaultAdjectives();
          listId = 'default';
        }

        console.log('[StudentSortPage] Got adjectives:', adjResponse.data.adjectives?.length);
        setAdjectives(adjResponse.data.adjectives || []);

        // Initialize session
        const sessionResponse = await analyticsApi.startSession(
          null, // listId - will use default
          null // themeId - optional
        );

        setSessionState(prev => ({
          ...prev,
          sessionId: sessionResponse.data.session_id,
          listId,
          isDefault: !token,
          totalCount: adjResponse.data.adjectives?.length || 30,
        }));
      } catch (err) {
        console.error('[StudentSortPage] Error:', err);
        let errorMsg = 'Failed to load adjectives';
        
        if (err.response?.data?.detail) {
          const detail = err.response.data.detail;
          if (typeof detail === 'string') {
            errorMsg = detail;
          } else if (Array.isArray(detail)) {
            errorMsg = detail[0]?.msg || 'Validation error';
          } else if (typeof detail === 'object') {
            errorMsg = detail.msg || 'Validation error';
          }
        }
        
        setError(errorMsg);
        setToast({ message: 'Fehler beim Laden der Adjektive', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [token]);

  // Save session state to localStorage whenever it changes
  useEffect(() => {
    if (!loading && sessionState.sessionId && adjectives.length > 0) {
      const storageKey = `vielseitig_session_${token || 'default'}`;
      const stateToSave = {
        sessionState,
        adjectives,
        timestamp: Date.now(),
      };
      
      try {
        localStorage.setItem(storageKey, JSON.stringify(stateToSave));
        console.log('[StudentSortPage] Saved session to localStorage');
      } catch (err) {
        console.error('[StudentSortPage] Failed to save to localStorage:', err);
      }
    }
  }, [sessionState, adjectives, loading, token]);

  // Get current adjective
  const currentAdjective = adjectives[sessionState.currentIndex];

  // Handle assignment
  const handleAssign = async (bucket) => {
    if (!currentAdjective || !sessionState.sessionId) return;

    try {
      // Record assignment
      await analyticsApi.recordAssignment(
        sessionState.sessionId,
        currentAdjective.id,
        bucket
      );

      // Update local state
      setSessionState(prev => ({
        ...prev,
        assignments: [
          ...prev.assignments,
          { adjectiveId: currentAdjective.id, bucket },
        ],
        currentIndex: prev.currentIndex + 1,
      }));

      setShowExplanation(false);

      // Check if finished
      if (sessionState.currentIndex + 1 >= adjectives.length) {
        // Move to results
        setTimeout(() => handleFinish(), 500);
      }
    } catch (err) {
      setToast({ message: 'Fehler beim Speichern', type: 'error' });
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!currentAdjective) return;

      switch (e.key.toLowerCase()) {
        case 'a':
        case 'arrowleft':
          handleAssign('selten');
          break;
        case 's':
        case 'arrowdown':
          handleAssign('manchmal');
          break;
        case 'd':
        case 'arrowright':
          handleAssign('oft');
          break;
        case ' ':
          e.preventDefault();
          setShowExplanation(!showExplanation);
          break;
        case 'i':
          setShowInfo(!showInfo);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentAdjective, showExplanation, showInfo]);

  const handleFinish = async () => {
    try {
      await analyticsApi.finishSession(sessionState.sessionId);
      
      // Clear localStorage for this session (no longer needed)
      const storageKey = `vielseitig_session_${token || 'default'}`;
      localStorage.removeItem(storageKey);
      console.log('[StudentSortPage] Cleared session from localStorage');
      
      // Save results to sessionStorage for results page
      const resultsData = {
        assignments: sessionState.assignments,
        adjectives,
        sessionId: sessionState.sessionId,
        listId: sessionState.listId,
        isDefault: sessionState.isDefault,
      };
      sessionStorage.setItem('sortingResults', JSON.stringify(resultsData));
      
      // Navigate to results page
      navigate(token ? `/results/${token}` : '/results', { replace: true });
    } catch (err) {
      setToast({ message: 'Fehler beim Abschließen', type: 'error' });
    }
  };

  if (loading) return <Loading fullscreen />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="card max-w-md text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-2">Fehler</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const progress = sessionState.currentIndex + 1;
  const progressPercent = (progress / sessionState.totalCount) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Info Overlay */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="card max-w-md">
            <h2 className="text-2xl font-bold mb-4">Tastenkürzel</h2>
            <ul className="space-y-2 text-sm mb-6">
              <li><strong>A</strong> oder <strong>←</strong> = Selten</li>
              <li><strong>S</strong> oder <strong>↓</strong> = Manchmal</li>
              <li><strong>D</strong> oder <strong>→</strong> = Oft</li>
              <li><strong>Space</strong> = Erklärung anzeigen</li>
              <li><strong>I</strong> = Diesen Hinweis ausblenden</li>
            </ul>
            <Button variant="primary" onClick={() => setShowInfo(false)} className="w-full">
              Verstanden!
            </Button>
          </div>
        </div>
      )}

      {/* Main Container - Split Layout on Desktop */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Sorting Interface */}
          <div>
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Fortschritt
                </span>
                <span className="text-sm text-gray-600">
                  {progress}/{sessionState.totalCount}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Adjective Card - Main */}
            {currentAdjective ? (
              <div className="card text-center mb-8">
                {/* Adjective Display */}
                <div className="mb-8">
                  <p className="text-lg text-gray-600 mb-4">Das Adjektiv:</p>
                  <h1 className="text-5xl lg:text-6xl font-bold text-blue-600 mb-2">
                    {currentAdjective.word}
                  </h1>

                  {/* Explanation Toggle */}
                  <button
                    onClick={() => setShowExplanation(!showExplanation)}
                    className="text-sm text-gray-500 hover:text-gray-700 mt-4 inline-flex items-center gap-1"
                  >
                    <span>ℹ️ Erklärung</span>
                    <span>{showExplanation ? '▼' : '▶'}</span>
                  </button>

                  {/* Explanation & Example */}
                  {showExplanation && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg text-left">
                      <p className="text-sm">
                        <strong>Erklärung:</strong> {currentAdjective.explanation}
                      </p>
                      <p className="text-sm mt-3">
                        <strong>Beispiel:</strong> {currentAdjective.example}
                      </p>
                    </div>
                  )}
                </div>

                {/* Bucket Buttons */}
                <div className="grid grid-cols-3 gap-4">
                  <Button
                    variant="danger"
                    size="lg"
                    onClick={() => handleAssign('selten')}
                    className="h-24 text-lg font-semibold"
                  >
                    😕<br />Selten
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => handleAssign('manchmal')}
                    className="h-24 text-lg font-semibold"
                  >
                    😐<br />Manchmal
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => handleAssign('oft')}
                    className="h-24 text-lg font-semibold"
                  >
                    😊<br />Oft
                  </Button>
                </div>

                {/* Keyboard Help */}
                <p className="text-xs text-gray-500 mt-6">
                  💡 Tipp: Nutze <strong>A</strong>, <strong>S</strong>, <strong>D</strong> oder Pfeiltasten | <strong>Space</strong> für Erklärung
                </p>
              </div>
            ) : (
              <div className="card text-center">
                <div className="text-4xl mb-4">✅</div>
                <h2 className="text-2xl font-bold mb-4">Fertig!</h2>
                <p className="text-gray-600 mb-6">
                  Sie haben alle {sessionState.totalCount} Adjektive sortiert.
                </p>
                <Button variant="primary" onClick={handleFinish}>
                  Ergebnisse anschauen →
                </Button>
              </div>
            )}
          </div>

          {/* Right Column - Live Preview (Desktop) / Collapsible (Mobile) */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            {/* Mobile Toggle Button */}
            <button
              onClick={() => setPreviewCollapsed(!previewCollapsed)}
              className="lg:hidden w-full mb-4 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-between hover:bg-gray-50 transition"
            >
              <span className="text-sm font-medium text-gray-700">
                Live-Vorschau
              </span>
              <span className="text-gray-500">
                {previewCollapsed ? '▼' : '▲'}
              </span>
            </button>

            {/* Preview Container */}
            <div className={`card ${previewCollapsed ? 'hidden lg:block' : 'block'}`}>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                Deine Persönlichkeit
              </h3>
              
              {oftCards.length === 0 && manchmalCards.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-2">🔷</div>
                  <p className="text-sm">
                    Wähle "Manchmal" oder "Oft"<br />
                    um die Vorschau zu sehen
                  </p>
                </div>
              ) : (
                <HexagonGrid
                  oftCards={oftCards}
                  manchmalCards={manchmalCards}
                  theme={hexTheme}
                  hexSize={45}
                  randomSeed={42} // Fixed seed during sorting for consistency
                  className="w-full"
                />
              )}
              
              <div className="mt-4 text-center text-xs text-gray-500">
                <p>
                  Live-Vorschau • <strong>Fett</strong> = Oft
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
