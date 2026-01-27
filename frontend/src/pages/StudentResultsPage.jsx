import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, HexagonGrid, Loading } from '../components';
import { useTheme } from '../store/ThemeContext';

/**
 * Student Results Page
 * 
 * Displays the hexagonal visualization of sorted adjectives
 * with theme selection and "Anders anordnen" (re-shuffle) button
 * 
 * Section 15: Hexagon Rendering
 */
export default function StudentResultsPage() {
  const navigate = useNavigate();
  const { token } = useParams();
  const { currentTheme, switchTheme, allThemeNames } = useTheme();

  // Map theme names for hex visualization (simplified color mapping)
  const hexThemeMap = {
    default: 'blue',
    ocean: 'teal',
    sunset: 'orange',
    forest: 'green',
    purple: 'purple',
    dark: 'blue',
  };

  const hexTheme = hexThemeMap[currentTheme] || 'blue';

  // Get state from navigation (passed from StudentSortPage)
  const [sessionData, setSessionData] = useState(null);
  const [randomSeed, setRandomSeed] = useState(Date.now());

  useEffect(() => {
    // Get data from sessionStorage (more reliable than location.state)
    const savedData = sessionStorage.getItem('sortingResults');
    
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setSessionData(data);
      } catch (err) {
        console.error('Failed to parse session data:', err);
        // Redirect back to sorting if no valid data
        navigate(token ? `/l/${token}` : '/sort', { replace: true });
      }
    } else {
      // No data - redirect back to sorting
      navigate(token ? `/l/${token}` : '/sort', { replace: true });
    }
  }, [navigate, token]);

  // Extract oft and manchmal cards from assignments
  const { oftCards, manchmalCards } = useMemo(() => {
    if (!sessionData?.assignments || !sessionData?.adjectives) {
      return { oftCards: [], manchmalCards: [] };
    }

    const oft = [];
    const manchmal = [];

    sessionData.assignments.forEach(assignment => {
      const adjective = sessionData.adjectives.find(
        adj => adj.id === assignment.adjectiveId
      );

      if (!adjective) return;

      const card = {
        id: adjective.id,
        word: adjective.word,
      };

      if (assignment.bucket === 'oft') {
        oft.push(card);
      } else if (assignment.bucket === 'manchmal') {
        manchmal.push(card);
      }
      // 'selten' cards are not displayed
    });

    return { oftCards: oft, manchmalCards: manchmal };
  }, [sessionData]);

  const handleReshuffle = () => {
    // Change seed to trigger re-layout
    setRandomSeed(Date.now());
  };

  const handleNewSession = () => {
    // Clear session data and go back to sorting
    sessionStorage.removeItem('sortingResults');
    navigate(token ? `/l/${token}` : '/sort', { replace: true });
  };

  if (!sessionData) {
    return <Loading fullscreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Deine Persönlichkeit
          </h1>
          <p className="text-gray-600">
            So beschreibst du dich selbst
          </p>
        </div>

        {/* Controls */}
        <div className="card mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Theme Selector */}
            <div className="flex items-center gap-3">
              <label htmlFor="theme" className="text-sm font-medium text-gray-700">
                Farbschema:
              </label>
              <select
                id="theme"
                value={currentTheme}
                onChange={(e) => switchTheme(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {allThemeNames.map(themeName => (
                  <option key={themeName} value={themeName}>
                    {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={handleReshuffle}
                className="whitespace-nowrap"
              >
                🔄 Anders anordnen
              </Button>
              <Button
                variant="primary"
                onClick={handleNewSession}
                className="whitespace-nowrap"
              >
                ✨ Nochmal sortieren
              </Button>
            </div>
          </div>
        </div>

        {/* Hexagon Visualization */}
        <div className="card bg-white p-8">
          <HexagonGrid
            oftCards={oftCards}
            manchmalCards={manchmalCards}
            theme={hexTheme}
            hexSize={55}
            randomSeed={randomSeed}
            className="w-full"
          />
        </div>

        {/* Stats Summary */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card text-center">
            <div className="text-3xl font-bold text-blue-600">
              {oftCards.length}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Oft zutreffend
            </div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-gray-600">
              {manchmalCards.length}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Manchmal zutreffend
            </div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-gray-400">
              {sessionData.adjectives.length - oftCards.length - manchmalCards.length}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Selten zutreffend
            </div>
          </div>
        </div>

        {/* Info Text */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Die Anordnung ist zufällig. Nutze "Anders anordnen" für ein neues Layout.
          </p>
          <p className="mt-2">
            <strong>Fett</strong> markierte Eigenschaften sind jene, die du als "oft zutreffend" eingestuft hast.
          </p>
        </div>
      </div>
    </div>
  );
}
