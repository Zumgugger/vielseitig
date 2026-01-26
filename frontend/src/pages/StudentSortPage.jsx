import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Loading, Toast } from '../components';
import { analyticsApi, listsApi, shareApi } from '../api/client';
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
  const { theme } = useTheme();

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

  // Load adjectives on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        setLoading(true);

        // Determine which list to load
        let listId = null;
        if (token) {
          // Share link
          const response = await shareApi.getPublicList(token);
          listId = response.data.id;
        } else {
          // Default list
          listId = 'default';
        }

        // Get adjectives
        const adjResponse = token
          ? await shareApi.getPublicList(token)
          : await listsApi.getUserLists(); // TODO: Create GET /api/lists/default endpoint

        setAdjectives(adjResponse.data.adjectives || []);

        // Initialize session
        const sessionResponse = await analyticsApi.startSession(
          listId,
          null // user_id - anonymous for public sorting
        );

        setSessionState(prev => ({
          ...prev,
          sessionId: sessionResponse.data.session_id,
          listId,
          isDefault: !token,
          totalCount: adjResponse.data.adjectives?.length || 30,
        }));
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load adjectives');
        setToast({ message: 'Fehler beim Laden der Adjektive', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [token]);

  // Get current adjective
  const currentAdjective = adjectives[sessionState.currentIndex];

  // Handle assignment
  const handleAssign = async (bucket) => {
    if (!currentAdjective || !sessionState.sessionId) return;

    try {
      // Record assignment
      await analyticsApi.recordAssignment(
        sessionState.sessionId,
        currentAdjective.word,
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
      // TODO: Redirect to results view with hex visualization
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

      {/* Main Container */}
      <div className="max-w-2xl mx-auto">
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
              <h1 className="text-6xl font-bold text-blue-600 mb-2">
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
    </div>
  );
}
