import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Loading, Toast, HexagonGrid } from '../components';
import { analyticsApi, studentApi, shareApi } from '../api';
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
  
  // Get listId from query params (e.g., ?listId=2)
  const searchParams = new URLSearchParams(window.location.search);
  const queryListId = searchParams.get('listId');

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
  
  // Session recovery state
  const [pendingRecovery, setPendingRecovery] = useState(null); // {adjectives, sessionState, progress}

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
              
              if (age < maxAge && parsed.sessionState.currentIndex > 0) {
                // Valid saved session found - show recovery dialog instead of auto-restoring
                const completedCount = parsed.sessionState.currentIndex;
                const totalCount = parsed.adjectives.length;
                const progress = Math.round((completedCount / totalCount) * 100);
                
                setPendingRecovery({
                  adjectives: parsed.adjectives,
                  sessionState: parsed.sessionState,
                  storageKey,
                  progress,
                  completedCount,
                  totalCount,
                });
                setLoading(false);
                console.log('[StudentSortPage] Found incomplete session, showing recovery dialog');
                return;
              } else if (age >= maxAge) {
                console.log('[StudentSortPage] Saved session expired, starting fresh');
                localStorage.removeItem(storageKey);
              }
            }
          } catch (err) {
            console.error('[StudentSortPage] Failed to parse saved session:', err);
            localStorage.removeItem(storageKey);
            // Continue to load fresh session
          }
        }

        // No valid saved state - load fresh
        // Determine which list to load and get adjectives
        let adjResponse;
        let listId;
        let isDefaultList = true;

        if (token) {
          // Share link - use token to get public list
          console.log('[StudentSortPage] Using share token:', token);
          adjResponse = await shareApi.getPublicList(token);
          listId = adjResponse.data.id;
          isDefaultList = false;
        } else if (queryListId) {
          // Custom list from query param (e.g., ?listId=2)
          console.log('[StudentSortPage] Loading custom list:', queryListId);
          adjResponse = await studentApi.getListAdjectives(queryListId);
          listId = parseInt(queryListId, 10);
          isDefaultList = false;
        } else {
          // Default list - fetch from /api/lists/default/adjectives
          console.log('[StudentSortPage] Fetching default adjectives');
          adjResponse = await studentApi.getDefaultAdjectives();
          listId = 'default';
          isDefaultList = true;
        }

        console.log('[StudentSortPage] Got adjectives:', adjResponse.data.adjectives?.length);
        setAdjectives(adjResponse.data.adjectives || []);

        // Initialize session with the correct list ID
        const sessionResponse = await analyticsApi.startSession(
          isDefaultList ? null : listId, // Pass actual listId for custom lists
          null // themeId - optional
        );

        setSessionState(prev => ({
          ...prev,
          sessionId: sessionResponse.data.session_id,
          listId,
          isDefault: isDefaultList,
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
  }, [token, queryListId]);

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
      console.error('[StudentSortPage] Assignment error:', err);
      
      // Check if it's a network error
      const isNetworkError = !err.response || err.code === 'ERR_NETWORK';
      
      if (isNetworkError) {
        // For network errors, save locally and continue (offline-friendly)
        setSessionState(prev => ({
          ...prev,
          assignments: [
            ...prev.assignments,
            { adjectiveId: currentAdjective.id, bucket },
          ],
          currentIndex: prev.currentIndex + 1,
        }));
        setShowExplanation(false);
        setToast({ 
          message: {
            title: '📴 Offline-Modus',
            detail: 'Deine Zuordnung wurde lokal gespeichert. Die Verbindung wird automatisch wiederhergestellt.'
          }, 
          type: 'warning' 
        });
      } else {
        setToast({ 
          message: {
            title: 'Speichern fehlgeschlagen',
            detail: err.response?.data?.detail || 'Bitte versuche es erneut.'
          }, 
          type: 'error',
          onRetry: () => handleAssign(bucket)
        });
      }
    }
  };

  // Handle undo - remove last assignment and go back one step
  const handleUndo = () => {
    if (sessionState.assignments.length === 0 || sessionState.currentIndex === 0) {
      setToast({ message: 'Nichts zum Rückgängigmachen', type: 'info' });
      return;
    }

    // Remove the last assignment
    setSessionState(prev => ({
      ...prev,
      assignments: prev.assignments.slice(0, -1),
      currentIndex: prev.currentIndex - 1,
    }));

    setShowExplanation(false);
    setToast({ message: '↩️ Letzte Zuordnung rückgängig gemacht', type: 'success' });
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
        case 'w':
        case 'arrowup':
          handleUndo();
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
  }, [currentAdjective, showExplanation, showInfo, sessionState.assignments.length]);

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
      console.error('[StudentSortPage] Finish error:', err);
      setToast({ 
        message: {
          title: 'Abschließen fehlgeschlagen',
          detail: 'Die Verbindung zum Server ist unterbrochen. Deine Sortierung ist aber gespeichert.'
        }, 
        type: 'error',
        onRetry: handleFinish
      });
    }
  };

  // Handle session recovery - continue previous session
  const handleContinueSession = async () => {
    if (!pendingRecovery) return;
    
    try {
      setLoading(true);
      console.log('[StudentSortPage] Continuing previous session');
      
      // Start a new analytics session on the server
      const sessionResponse = await analyticsApi.startSession(
        pendingRecovery.sessionState.listId === 'default' ? null : pendingRecovery.sessionState.listId,
        null // themeId
      );
      
      // Restore state with new session ID
      setAdjectives(pendingRecovery.adjectives);
      setSessionState({
        ...pendingRecovery.sessionState,
        sessionId: sessionResponse.data.session_id,
      });
      setPendingRecovery(null);
      setToast({ message: `Fortgesetzt: ${pendingRecovery.completedCount}/${pendingRecovery.totalCount} sortiert`, type: 'success' });
    } catch (err) {
      console.error('[StudentSortPage] Failed to continue session:', err);
      setToast({ message: 'Fehler beim Fortsetzen', type: 'error' });
      // Clear and start fresh
      localStorage.removeItem(pendingRecovery.storageKey);
      setPendingRecovery(null);
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  // Handle session recovery - start fresh
  const handleStartFresh = async () => {
    if (!pendingRecovery) return;
    
    console.log('[StudentSortPage] Starting fresh, clearing saved session');
    localStorage.removeItem(pendingRecovery.storageKey);
    setPendingRecovery(null);
    setLoading(true);
    // Reload the page to start fresh
    window.location.reload();
  };

  // Show recovery dialog if we have a pending session
  if (pendingRecovery && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4">
        <div className="card max-w-md text-center">
          <div className="text-6xl mb-4">🔄</div>
          <h1 className="text-2xl font-bold mb-2">Unvollständige Session gefunden</h1>
          <p className="text-gray-600 mb-4">
            Du hast eine nicht abgeschlossene Session. Möchtest du fortfahren?
          </p>
          
          {/* Progress visualization */}
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Fortschritt</span>
              <span className="text-sm text-gray-600">
                {pendingRecovery.completedCount} / {pendingRecovery.totalCount}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all"
                style={{ width: `${pendingRecovery.progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {pendingRecovery.progress}% sortiert
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button variant="primary" onClick={handleContinueSession} className="w-full">
              ▶️ Fortfahren
            </Button>
            <Button variant="secondary" onClick={handleStartFresh} className="w-full">
              🔄 Neu starten
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <Loading fullscreen />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="card max-w-md text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-2">Fehler</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            🔄 Seite neu laden
          </Button>
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
              <li><strong>W</strong> oder <strong>↑</strong> = Rückgängig</li>
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
              <div className="card text-center mb-6 sm:mb-8">
                {/* Adjective Display */}
                <div className="mb-6 sm:mb-8">
                  <p className="text-base sm:text-lg text-gray-600 mb-3 sm:mb-4">Das Adjektiv:</p>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-blue-600 mb-2 break-words">
                    {currentAdjective.word}
                  </h1>

                  {/* Explanation Toggle - Larger touch target on mobile */}
                  <button
                    onClick={() => setShowExplanation(!showExplanation)}
                    className="text-sm sm:text-base text-gray-500 hover:text-gray-700 mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition touch-manipulation"
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

                {/* Bucket Buttons - Touch-friendly sizing */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <Button
                    variant="danger"
                    size="xl"
                    onClick={() => handleAssign('selten')}
                    className="h-28 sm:h-24 text-base sm:text-lg font-semibold flex flex-col items-center justify-center touch-manipulation"
                  >
                    <span className="text-2xl sm:text-xl mb-1">😕</span>
                    <span>Selten</span>
                  </Button>
                  <Button
                    variant="secondary"
                    size="xl"
                    onClick={() => handleAssign('manchmal')}
                    className="h-28 sm:h-24 text-base sm:text-lg font-semibold flex flex-col items-center justify-center touch-manipulation"
                  >
                    <span className="text-2xl sm:text-xl mb-1">😐</span>
                    <span>Manchmal</span>
                  </Button>
                  <Button
                    variant="primary"
                    size="xl"
                    onClick={() => handleAssign('oft')}
                    className="h-28 sm:h-24 text-base sm:text-lg font-semibold flex flex-col items-center justify-center touch-manipulation"
                  >
                    <span className="text-2xl sm:text-xl mb-1">😊</span>
                    <span>Oft</span>
                  </Button>
                </div>

                {/* Undo Button */}
                {sessionState.assignments.length > 0 && (
                  <div className="mt-4">
                    <button
                      onClick={handleUndo}
                      className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-gray-100 transition"
                    >
                      ↩️ Rückgängig (W)
                    </button>
                  </div>
                )}

                {/* Keyboard Help */}
                <p className="text-xs text-gray-500 mt-4">
                  💡 Tipp: <strong>A</strong>/<strong>S</strong>/<strong>D</strong> oder Pfeiltasten | <strong>W</strong> = Rückgängig | <strong>Space</strong> = Erklärung
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
