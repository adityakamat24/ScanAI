// src/App.js

import React, {
    useState,
    useRef,
    useEffect,
    createContext,
    useContext,
} from 'react';
import {
    Camera,
    User,
    Shield,
    AlertTriangle,
    Star,
    Zap,
    Heart,
    Moon,
    Sun,
    Trash2,
    Edit2,
    CloudOff,
    CheckSquare,
    ChevronDown,
    ChevronUp,
    Home as HomeIcon,
    Settings as SettingsIcon,
    X,
    Plus,
} from 'lucide-react';
import './index.css'; // Tailwind CSS

/** =================================================================================
 * 1) Helper Hooks: useLocalStorage, useDebounce, useNotifications
 * =================================================================================**/

function useLocalStorage(key, defaultValue) {
    const [state, setState] = useState(() => {
        try {
            const stored = window.localStorage.getItem(key);
            return stored !== null ? JSON.parse(stored) : defaultValue;
        } catch {
            return defaultValue;
        }
    });

    const setLocalStorage = (val) => {
        try {
            const valueToStore = val instanceof Function ? val(state) : val;
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
            setState(valueToStore);
        } catch {
            console.warn(`Unable to write to localStorage: ${key}`);
        }
    };

    return [state, setLocalStorage];
}

function useDebounce(fn, delay = 300) {
    const timeoutRef = useRef(null);
    const debounced = (...args) => {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            fn(...args);
        }, delay);
    };
    useEffect(() => {
        return () => clearTimeout(timeoutRef.current);
    }, []);
    return debounced;
}

function useNotifications() {
    const requestPermission = async () => {
        if (!('Notification' in window)) return false;
        if (Notification.permission === 'granted') return true;
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    };

    const sendNotification = (title, options) => {
        if (Notification.permission === 'granted') {
            new Notification(title, options);
        }
    };

    return { requestPermission, sendNotification };
}

/** =================================================================================
 * 2) Theme (Dark Mode) Context
 * =================================================================================**/

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [isDark, setIsDark] = useLocalStorage('app-dark-mode', false);

    useEffect(() => {
        if (isDark) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, [isDark]);

    const toggleTheme = () => setIsDark((prev) => !prev);

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}

/** =================================================================================
 * 3) Utility: downscaleImage (Canvas) for max 800×800
 * =================================================================================**/

async function downscaleImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxDim = 800;
            let { width, height } = img;

            if (width > height && width > maxDim) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
            } else if (height > width && height > maxDim) {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
                (blob) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        resolve(reader.result); // dataURL
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                },
                'image/jpeg',
                0.8
            );
        };
        img.onerror = () => reject(new Error('Image load error'));
        img.src = url;
    });
}

/** =================================================================================
 * 4) Fake “Fuzzy Ingredient Matching” Preprocessor
 * =================================================================================**/

const ALLERGEN_SYNONYMS = {
    lime: ['lime zest', 'lime extract', 'citrus (lime)'],
    nuts: ['almond', 'cashew', 'walnut', 'peanut'],
    dairy: ['milk', 'butter', 'cream', 'cheese', 'yogurt'],
};

function expandAllergyList(allergies) {
    const expanded = new Set();
    allergies.forEach((allergy) => {
        expanded.add(allergy.toLowerCase());
        if (ALLERGEN_SYNONYMS[allergy.toLowerCase()]) {
            ALLERGEN_SYNONYMS[allergy.toLowerCase()].forEach((syn) =>
                expanded.add(syn.toLowerCase())
            );
        }
    });
    return Array.from(expanded);
}

/** =================================================================================
 * 5) Main App Component
 * =================================================================================**/

export default function App() {
    const [currentPage, setCurrentPage] = useState('home');

    // Profiles
    const [profiles, setProfiles] = useLocalStorage('app-profiles', []);
    const [selectedProfileId, setSelectedProfileId] = useLocalStorage(
        'app-selected-profile',
        null
    );

    // Families
    const [families, setFamilies] = useLocalStorage('app-families', []);
    const [activeFamilyId, setActiveFamilyId] = useLocalStorage(
        'app-active-family',
        null
    );

    // History & Favorites
    const [imageHistory, setImageHistory] = useLocalStorage(
        'app-image-history',
        []
    );
    const [favorites, setFavorites] = useLocalStorage('app-favorites', []);

    // API Key (for now)
    const [apiKey, setApiKey] = useLocalStorage('app-api-key', '');

    const { isDark, toggleTheme } = useTheme();
    const { requestPermission, sendNotification } = useNotifications();

    const selectedProfile =
        profiles.find((p) => p.id === selectedProfileId) || null;

    useEffect(() => {
        if (selectedProfile?.allergies?.length) {
            requestPermission().then((granted) => {
                if (granted) {
                    sendNotification('SafeCheck Reminder', {
                        body: `Remember to check new products for: ${selectedProfile.allergies.join(
                            ', '
                        )}.`,
                        icon: '/logo192.png',
                    });
                }
            });
        }
    }, [selectedProfile?.allergies.length]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300">
            <div className="max-w-md mx-auto px-4">
                <Header
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    isDark={isDark}
                    toggleTheme={toggleTheme}
                />

                {/* Render whichever “page” is active */}
                <div className="py-6 space-y-6">
                    {currentPage === 'home' && (
                        <HomePage
                            profiles={profiles}
                            families={families}
                            selectedProfileId={selectedProfileId}
                            setSelectedProfileId={setSelectedProfileId}
                            activeFamilyId={activeFamilyId}
                            setActiveFamilyId={setActiveFamilyId}
                            imageHistory={imageHistory}
                            setImageHistory={setImageHistory}
                            apiKey={apiKey}
                            favorites={favorites}
                            setFavorites={setFavorites}
                        />
                    )}
                    {currentPage === 'profile' && (
                        <ProfilePage
                            profiles={profiles}
                            setProfiles={setProfiles}
                            selectedProfileId={selectedProfileId}
                            setSelectedProfileId={setSelectedProfileId}
                        />
                    )}
                    {currentPage === 'family' && (
                        <FamilyPage
                            profiles={profiles}
                            setProfiles={setProfiles}
                            families={families}
                            setFamilies={setFamilies}
                        />
                    )}
                    {currentPage === 'settings' && (
                        <SettingsPage apiKey={apiKey} setApiKey={setApiKey} />
                    )}
                </div>

                <NavBar currentPage={currentPage} setCurrentPage={setCurrentPage} />
            </div>
        </div>
    );
}

/** =================================================================================
 * 6) HEADER (with Dark Mode Toggle + Branding + Offline Banner)
 * =================================================================================**/

function Header({ currentPage, setCurrentPage, isDark, toggleTheme }) {
    const [online, setOnline] = useState(navigator.onLine);

    useEffect(() => {
        const onOnline = () => setOnline(true);
        const onOffline = () => setOnline(false);
        window.addEventListener('online', onOnline);
        window.addEventListener('offline', onOffline);
        return () => {
            window.removeEventListener('online', onOnline);
            window.removeEventListener('offline', onOffline);
        };
    }, []);

    return (
        <header className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-2">
                <Shield className="w-8 h-8 text-indigo-500" aria-hidden="true" />
                <h1 className="text-3xl font-bold font-sans">SafeCheck</h1>
            </div>

            <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                aria-label="Toggle Dark Mode"
            >
                {isDark ? (
                    <Sun className="w-6 h-6 text-yellow-400" />
                ) : (
                    <Moon className="w-6 h-6 text-gray-700" />
                )}
            </button>

            {!online && (
                <div className="absolute top-[68px] left-0 right-0 bg-red-500 text-white text-center py-2">
                    <CloudOff className="inline-block w-5 h-5 mr-1 align-middle" />
                    You are offline. Some features may not work.
                </div>
            )}
        </header>
    );
}

/** =================================================================================
 * 7) NAV BAR (Bottom Navigation) — includes “Family” tab
 * =================================================================================**/

function NavBar({ currentPage, setCurrentPage }) {
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-2">
            <div className="flex justify-around max-w-md mx-auto">
                {[
                    { name: 'home', icon: <HomeIcon />, label: 'Home' },
                    { name: 'profile', icon: <User />, label: 'Profile' },
                    { name: 'family', icon: <User />, label: 'Family' },
                    { name: 'settings', icon: <SettingsIcon />, label: 'Settings' },
                ].map((tab) => {
                    const active = currentPage === tab.name;
                    return (
                        <button
                            key={tab.name}
                            onClick={() => setCurrentPage(tab.name)}
                            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors duration-200 ${active
                                    ? 'text-indigo-600 dark:text-indigo-300'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400'
                                }`}
                            aria-label={tab.label}
                        >
                            {React.cloneElement(tab.icon, { className: 'w-6 h-6' })}
                            <span className="text-xs font-medium">{tab.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}

/** =================================================================================
 * 8) HOME PAGE (Camera/Upload + Analysis + “Modern” Profile/Family Chips + Collapsible History)
 * =================================================================================**/

function HomePage({
    profiles,
    families,
    selectedProfileId,
    setSelectedProfileId,
    activeFamilyId,
    setActiveFamilyId,
    imageHistory,
    setImageHistory,
    apiKey,
    favorites,
    setFavorites,
}) {
    const fileInputRef = useRef(null);
    const [rawImage, setRawImage] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorBanner, setErrorBanner] = useState('');
    const [showSkeleton, setShowSkeleton] = useState(false);

    // Track which history items are expanded
    const [expandedItems, setExpandedItems] = useState({});

    // Build contextProfiles based on selectedProfileId OR activeFamilyId
    let contextProfiles = [];
    if (activeFamilyId) {
        const fam = families.find((f) => f.id === activeFamilyId);
        if (fam) {
            contextProfiles = profiles.filter((p) => fam.memberIds.includes(p.id));
        }
    } else if (selectedProfileId) {
        const single = profiles.find((p) => p.id === selectedProfileId);
        if (single) contextProfiles = [single];
    }

    // Combine allergies and age groups
    const combinedAllergiesSet = new Set();
    const ageGroups = { babies: false, children: false, adults: false, elderly: false };

    contextProfiles.forEach((p) => {
        p.allergies.forEach((a) => combinedAllergiesSet.add(a.toLowerCase()));
        const ageNum = parseInt(p.age, 10);
        if (!isNaN(ageNum)) {
            if (ageNum <= 2) ageGroups.babies = true;
            else if (ageNum <= 12) ageGroups.children = true;
            else if (ageNum <= 60) ageGroups.adults = true;
            else ageGroups.elderly = true;
        }
    });

    const allergyArray = Array.from(combinedAllergiesSet);

    const ageSpecificContextLines = [];
    if (ageGroups.babies) ageSpecificContextLines.push('- babies');
    if (ageGroups.children) ageSpecificContextLines.push('- children');
    if (ageGroups.adults) ageSpecificContextLines.push('- adults');
    if (ageGroups.elderly) ageSpecificContextLines.push('- elderly');

    const ageSpecificContext = ageSpecificContextLines.join('\n');

    // Handle image capture
    const handleImageCapture = async (event) => {
        setErrorBanner('');
        const file = event.target.files[0];
        if (file) {
            try {
                setShowSkeleton(true);
                const dataURL = await downscaleImage(file);
                setRawImage(dataURL);
            } catch (err) {
                console.error('Downscale error:', err);
                setErrorBanner('Failed to process image. Try a different image.');
            } finally {
                setShowSkeleton(false);
            }
        }
    };

    // Analyze product (merging family/profile context)
    const analyzeProduct = async () => {
        setErrorBanner('');
        if (!rawImage) {
            setErrorBanner('Please upload or capture an image first.');
            return;
        }
        if (!apiKey) {
            setErrorBanner('Please configure your OpenAI API key in Settings.');
            return;
        }
        setLoading(true);
        setAnalysis(null);

        // Build prompt context
        let profileContext = '';
        if (contextProfiles.length > 0) {
            profileContext = `IMPORTANT PROFILES IN CONTEXT:
${contextProfiles
                    .map(
                        (p) =>
                            `- Name: ${p.name} | Age: ${p.age} | Allergies: ${p.allergies.join(', ') || 'None'}`
                    )
                    .join('\n')}

COMBINED ALLERGIES: ${allergyArray.join(', ') || 'None'}

AGE GROUPS IN FAMILY:
${ageSpecificContext}

CRITICAL: If this product contains any ingredients matching any of the combined allergies (${allergyArray.join(', ') || 'none'
                }) OR is unsafe for any of the age groups listed above, you MUST:
1. Highlight it as a safety concern for those members.
2. Lower the safety rating accordingly.
3. Include a "familyWarnings" entry specifying which profile(s) or age group(s) are at risk.
4. Repeat under "personalizedWarnings."`;
        } else {
            profileContext = `No profile or family selected—provide general safety analysis.`;
        }

        try {
            const response = await fetch(
                'https://api.openai.com/v1/chat/completions',
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model: 'gpt-4o',
                        messages: [
                            {
                                role: 'user',
                                content: [
                                    {
                                        type: 'text',
                                        text: `
Analyze this product image and provide detailed safety information with special attention to user allergies and family context.

${profileContext}

Please respond in strict JSON format, using exactly this structure:

\`\`\`
{
  "productName": "Product name from the image",
  "safetyRating": 1-5 (1 = very unsafe, 5 = very safe),
  "overallSafety": "Short overall assessment",
  "generalSafety": "General safety description",
  "harmfulIngredients": ["List harmful ingredients with brief explanations"],
  "allergyWarnings": ["CRITICAL: List any ingredients matching user's allergies"],
  "familyWarnings": ["List any issues for specific family members or age groups"],
  "ageSpecificWarnings": {
    "babies": "Safety info for babies/infants",
    "children": "Safety info for children",
    "adults": "Safety info for adults",
    "elderly": "Safety info for elderly"
  },
  "compoundInteractions": ["List dangerous compound interactions"],
  "recommendations": ["List safety recommendations"],
  "personalizedWarnings": ["Specific warnings based on user profile, especially allergies"]
}
\`\`\`

IMPORTANT:
- Always include every key exactly as shown.
- If there’s nothing to report for a field, return:
  • an empty string ("") for string values,
  • an empty array ([]) for array values,
  • and an object with empty strings for nested objects (e.g. "ageSpecificWarnings": { "babies": "", "children": "", "adults": "", "elderly": "" }).
- Do NOT omit any field under any circumstances.
- Do not include any extra fields—only that exact JSON.

Focus on ingredients visible in the image. Be as thorough as possible.
                  `,
                                    },
                                    {
                                        type: 'image_url',
                                        image_url: { url: rawImage },
                                    },
                                ],
                            },
                        ],
                        max_tokens: 1500,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            const content = data.choices[0].message.content;
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('Could not parse analysis results');

            let analysisData = JSON.parse(jsonMatch[0]);
            const normalize = (arr) =>
                Array.isArray(arr)
                    ? arr.map((item) =>
                        typeof item === 'string'
                            ? item
                            : `${item.ingredient || item.name || 'Unknown'}: ${item.explanation || item.description || item.warning || ''
                            }`
                    )
                    : [];

            analysisData.harmfulIngredients = normalize(analysisData.harmfulIngredients);
            analysisData.allergyWarnings = normalize(analysisData.allergyWarnings);
            analysisData.familyWarnings = normalize(analysisData.familyWarnings);
            analysisData.compoundInteractions = normalize(
                analysisData.compoundInteractions
            );
            analysisData.recommendations = normalize(analysisData.recommendations);
            analysisData.personalizedWarnings = normalize(
                analysisData.personalizedWarnings
            );

            setAnalysis(analysisData);

            // Save only if analysisData exists (filter out older formats)
            setImageHistory((prev) => [
                {
                    id: Date.now(),
                    dataURL: rawImage,
                    timestamp: new Date().toISOString(),
                    analysis: analysisData,
                },
                ...prev.filter((item) => item.analysis),
            ]);
        } catch (err) {
            console.error(err);
            setErrorBanner(
                'Failed to analyze product. Check your internet or API key and try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const toggleFavorite = () => {
        if (!analysis) return;
        const fid = analysis.productName + (analysis.timestamp || '');
        const existing = favorites.find((f) => f.id === fid);
        if (existing) {
            setFavorites((prev) => prev.filter((f) => f.id !== fid));
        } else {
            setFavorites((prev) => [
                ...prev,
                {
                    id: fid,
                    productName: analysis.productName,
                    safetyRating: analysis.safetyRating,
                    timestamp: new Date().toISOString(),
                },
            ]);
        }
    };

    // Toggle expanded/collapsed state for a given item ID
    const toggleExpand = (id) => {
        setExpandedItems((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    return (
        <div className="space-y-6 pb-32">
            {/* PROFILE / FAMILY SELECTOR: Modern “Chips” */}
            <div className="space-y-4">
                {/* Profile Chips */}
                <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select Profile:
                    </p>
                    <div className="flex flex-wrap gap-2 overflow-x-auto">
                        {/* “None” chip */}
                        <button
                            onClick={() => setSelectedProfileId(null)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-colors duration-200 ${selectedProfileId === null
                                    ? 'bg-indigo-500 text-white border-transparent'
                                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                                }`}
                        >
                            <span className="text-sm font-medium">None</span>
                        </button>

                        {profiles.map((p) => {
                            const isActive = p.id === selectedProfileId;
                            const initials = p.name
                                .split(' ')
                                .map((word) => word[0])
                                .join('')
                                .toUpperCase();

                            return (
                                <button
                                    key={p.id}
                                    onClick={() => setSelectedProfileId(p.id)}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-colors duration-200 ${isActive
                                            ? 'bg-indigo-500 text-white border-transparent'
                                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    <div
                                        className="w-6 h-6 flex items-center justify-center rounded-full text-white text-sm font-semibold"
                                        style={{ backgroundColor: p.color }}
                                    >
                                        {initials}
                                    </div>
                                    <span className="text-sm font-medium">{p.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Family Chips */}
                <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select Family:
                    </p>
                    <div className="flex flex-wrap gap-2 overflow-x-auto">
                        {/* “None” chip */}
                        <button
                            onClick={() => setActiveFamilyId(null)}
                            className={`flex items-center px-4 py-2 rounded-full border transition-colors duration-200 ${activeFamilyId === null
                                    ? 'bg-indigo-500 text-white border-transparent'
                                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                                }`}
                        >
                            <span className="text-sm font-medium">None</span>
                        </button>

                        {families.map((f) => {
                            const isActive = f.id === activeFamilyId;
                            return (
                                <button
                                    key={f.id}
                                    onClick={() => setActiveFamilyId(f.id)}
                                    className={`flex items-center px-4 py-2 rounded-full border transition-colors duration-200 ${isActive
                                            ? 'bg-indigo-500 text-white border-transparent'
                                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    <span className="text-sm font-medium">{f.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* UPLOAD + ANALYZE CARD */}
            <div className="relative bg-gray-50 dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-800 dark:to-blue-800 opacity-10"></div>
                <div className="relative p-6 space-y-4">
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                        Capture / Upload Product
                    </h2>

                    {/* ERROR BANNER */}
                    {errorBanner && (
                        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 px-4">
                            <div className="flex items-center">
                                <AlertTriangle className="w-5 h-5 mr-2 animate-pulse" />
                                {errorBanner}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col space-y-4">
                        <div className="flex space-x-4">
                            <button
                                onClick={() => fileInputRef.current.click()}
                                className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-colors duration-200"
                                aria-label="Take Photo or Upload"
                            >
                                <Camera className="w-5 h-5" />
                                <span>Capture</span>
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handleImageCapture}
                                className="hidden"
                            />
                            <button
                                onClick={analyzeProduct}
                                disabled={loading}
                                className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg shadow-md transition-colors duration-200 font-semibold ${loading
                                        ? 'bg-indigo-300 cursor-not-allowed text-white'
                                        : 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white'
                                    }`}
                                aria-label="Analyze Safety"
                            >
                                {loading ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Analyzing</span>
                                    </div>
                                ) : (
                                    <>
                                        <Zap className="w-5 h-5" />
                                        <span>Analyze</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* SKELETON WHILE RESIZING IMAGE */}
                        {showSkeleton && (
                            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                        )}

                        {/* DISPLAY SELECTED IMAGE PREVIEW */}
                        {rawImage && (
                            <div className="w-full h-48 rounded-lg overflow-hidden border-2 border-indigo-500 shadow-sm">
                                <img
                                    src={rawImage}
                                    alt="Product Preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        {/* ANALYSIS RESULTS */}
                        {analysis && (
                            <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-6 space-y-6 border border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                                        {analysis.productName}
                                    </h3>
                                    <button
                                        onClick={toggleFavorite}
                                        className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                                        aria-label="Toggle Favorite"
                                    >
                                        {favorites.some(
                                            (f) => f.id === analysis.productName + (analysis.timestamp || '')
                                        ) ? (
                                            <CheckSquare className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <Heart className="w-5 h-5 text-red-500" />
                                        )}
                                    </button>
                                </div>

                                {/* Safety Rating */}
                                <div className="flex items-center">
                                    <SafetyRating rating={analysis.safetyRating} />
                                </div>

                                {/* 1) Overall Safety */}
                                <div>
                                    <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                                        Overall Safety
                                    </h4>
                                    <p className="mt-1 text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {analysis.overallSafety || 'N/A'}
                                    </p>
                                </div>

                                <div className="border-t border-gray-200 dark:border-gray-700"></div>

                                {/* 2) General Safety */}
                                <div>
                                    <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                                        General Safety
                                    </h4>
                                    <p className="mt-1 text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {analysis.generalSafety || 'N/A'}
                                    </p>
                                </div>

                                <div className="border-t border-gray-200 dark:border-gray-700"></div>

                                {/* 3) Harmful Ingredients */}
                                <div>
                                    <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                                        Harmful Ingredients
                                    </h4>
                                    {analysis.harmfulIngredients?.length > 0 ? (
                                        <ul className="mt-1 space-y-2">
                                            {(analysis.harmfulIngredients || []).map((item, i) => (
                                                <li
                                                    key={i}
                                                    className="px-3 py-2 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-lg"
                                                >
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="mt-1 text-gray-600 dark:text-gray-400">None</p>
                                    )}
                                </div>

                                <div className="border-t border-gray-200 dark:border-gray-700"></div>

                                {/* 4) Allergy Warnings */}
                                <div>
                                    <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                                        Allergy Warnings
                                    </h4>
                                    {analysis.allergyWarnings?.length > 0 ? (
                                        <ul className="mt-1 space-y-2">
                                            {(analysis.allergyWarnings || []).map((item, i) => (
                                                <li
                                                    key={i}
                                                    className="px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg"
                                                >
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="mt-1 text-gray-600 dark:text-gray-400">None</p>
                                    )}
                                </div>

                                <div className="border-t border-gray-200 dark:border-gray-700"></div>

                                {/* 5) Family Warnings */}
                                <div>
                                    <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                                        Family Warnings
                                    </h4>
                                    {analysis.familyWarnings?.length > 0 ? (
                                        <ul className="mt-1 space-y-2">
                                            {(analysis.familyWarnings || []).map((item, i) => (
                                                <li
                                                    key={i}
                                                    className="px-3 py-2 bg-red-100 dark:bg-red-800/20 text-red-600 dark:text-red-400 rounded-lg"
                                                >
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="mt-1 text-gray-600 dark:text-gray-400">None</p>
                                    )}
                                </div>

                                <div className="border-t border-gray-200 dark:border-gray-700"></div>

                                {/* 6) Age-Specific Warnings */}
                                <div>
                                    <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                                        Age-Specific Warnings
                                    </h4>
                                    <div className="mt-2 space-y-2">
                                        {['babies', 'children', 'adults', 'elderly'].map((group) => (
                                            <div
                                                key={group}
                                                className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
                                            >
                                                <strong className="capitalize text-gray-700 dark:text-gray-300">
                                                    {group.charAt(0).toUpperCase() + group.slice(1)}:
                                                </strong>{' '}
                                                <span className="text-gray-700 dark:text-gray-300">
                                                    {analysis.ageSpecificWarnings?.[group] || 'N/A'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 dark:border-gray-700"></div>

                                {/* 7) Compound Interactions */}
                                <div>
                                    <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                                        Compound Interactions
                                    </h4>
                                    {analysis.compoundInteractions?.length > 0 ? (
                                        <ul className="mt-1 space-y-2">
                                            {(analysis.compoundInteractions || []).map((item, i) => (
                                                <li
                                                    key={i}
                                                    className="px-3 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg"
                                                >
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="mt-1 text-gray-600 dark:text-gray-400">None</p>
                                    )}
                                </div>

                                <div className="border-t border-gray-200 dark:border-gray-700"></div>

                                {/* 8) Recommendations */}
                                <div>
                                    <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                                        Recommendations
                                    </h4>
                                    {analysis.recommendations?.length > 0 ? (
                                        <ul className="mt-1 space-y-2">
                                            {(analysis.recommendations || []).map((item, i) => (
                                                <li
                                                    key={i}
                                                    className="px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg"
                                                >
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="mt-1 text-gray-600 dark:text-gray-400">None</p>
                                    )}
                                </div>

                                <div className="border-t border-gray-200 dark:border-gray-700"></div>

                                {/* 9) Personalized Warnings */}
                                <div>
                                    <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                                        Personalized Warnings
                                    </h4>
                                    {analysis.personalizedWarnings?.length > 0 ? (
                                        <ul className="mt-1 space-y-2">
                                            {(analysis.personalizedWarnings || []).map((item, i) => (
                                                <li
                                                    key={i}
                                                    className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg"
                                                >
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="mt-1 text-gray-600 dark:text-gray-400">None</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* IMAGE HISTORY + FAVORITES */}
            <div className="relative bg-gray-50 dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-800 dark:to-blue-800 opacity-10"></div>
                <div className="relative p-6">
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                        Recent Scans
                    </h2>

                    {/* Filter out any items without analysis */}
                    {imageHistory.filter((item) => item.analysis)?.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                                <Camera className="w-8 h-8 text-gray-400 dark:text-gray-300" />
                            </div>
                            <p>No images analyzed yet.</p>
                            <p className="text-sm mt-1">Start by capturing a product image above!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {imageHistory
                                .filter((item) => item.analysis)
                                .map((item) => {
                                    const isExpanded = !!expandedItems[item.id];

                                    return (
                                        <div
                                            key={item.id}
                                            className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600"
                                        >
                                            {/* Header (always visible) */}
                                            <button
                                                onClick={() => toggleExpand(item.id)}
                                                className="w-full flex items-center space-x-4 p-4 border-b border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 cursor-pointer"
                                            >
                                                <img
                                                    src={item.dataURL}
                                                    alt={item.analysis.productName}
                                                    className="w-12 h-12 object-cover rounded-full border-2 border-indigo-500 shadow-sm"
                                                />
                                                <div className="flex-1 text-left">
                                                    <p className="font-medium text-gray-800 dark:text-gray-100 text-lg">
                                                        {item.analysis.productName}
                                                    </p>
                                                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                                                        {new Date(item.timestamp).toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="text-gray-600 dark:text-gray-400 text-sm font-semibold">
                                                    {item.analysis.safetyRating}/5
                                                </div>
                                                {isExpanded ? (
                                                    <ChevronUp className="w-5 h-5 text-gray-500" />
                                                ) : (
                                                    <ChevronDown className="w-5 h-5 text-gray-500" />
                                                )}
                                            </button>

                                            {/* Collapsible details */}
                                            {isExpanded && (
                                                <div className="p-4 bg-white dark:bg-gray-900 space-y-4">
                                                    {/* Overall Safety */}
                                                    <div>
                                                        <h4 className="text-base font-medium text-gray-800 dark:text-gray-200">
                                                            Overall Safety
                                                        </h4>
                                                        <p className="mt-1 text-gray-700 dark:text-gray-300 leading-relaxed">
                                                            {item.analysis.overallSafety || 'N/A'}
                                                        </p>
                                                    </div>

                                                    <div className="border-t border-gray-200 dark:border-gray-700"></div>

                                                    {/* General Safety */}
                                                    <div>
                                                        <h4 className="text-base font-medium text-gray-800 dark:text-gray-200">
                                                            General Safety
                                                        </h4>
                                                        <p className="mt-1 text-gray-700 dark:text-gray-300 leading-relaxed">
                                                            {item.analysis.generalSafety || 'N/A'}
                                                        </p>
                                                    </div>

                                                    <div className="border-t border-gray-200 dark:border-gray-700"></div>

                                                    {/* Harmful Ingredients */}
                                                    <div>
                                                        <h4 className="text-base font-medium text-gray-800 dark:text-gray-200">
                                                            Harmful Ingredients
                                                        </h4>
                                                        {(item.analysis.harmfulIngredients || []).length > 0 ? (
                                                            <ul className="mt-2 space-y-2">
                                                                {(item.analysis.harmfulIngredients || []).map(
                                                                    (i, idx) => (
                                                                        <li
                                                                            key={idx}
                                                                            className="px-3 py-2 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-lg"
                                                                        >
                                                                            {i}
                                                                        </li>
                                                                    )
                                                                )}
                                                            </ul>
                                                        ) : (
                                                            <p className="mt-1 text-gray-600 dark:text-gray-400">None</p>
                                                        )}
                                                    </div>

                                                    <div className="border-t border-gray-200 dark:border-gray-700"></div>

                                                    {/* Allergy Warnings */}
                                                    <div>
                                                        <h4 className="text-base font-medium text-gray-800 dark:text-gray-200">
                                                            Allergy Warnings
                                                        </h4>
                                                        {(item.analysis.allergyWarnings || []).length > 0 ? (
                                                            <ul className="mt-2 space-y-2">
                                                                {(item.analysis.allergyWarnings || []).map(
                                                                    (i, idx) => (
                                                                        <li
                                                                            key={idx}
                                                                            className="px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg"
                                                                        >
                                                                            {i}
                                                                        </li>
                                                                    )
                                                                )}
                                                            </ul>
                                                        ) : (
                                                            <p className="mt-1 text-gray-600 dark:text-gray-400">None</p>
                                                        )}
                                                    </div>

                                                    <div className="border-t border-gray-200 dark:border-gray-700"></div>

                                                    {/* Family Warnings */}
                                                    <div>
                                                        <h4 className="text-base font-medium text-gray-800 dark:text-gray-200">
                                                            Family Warnings
                                                        </h4>
                                                        {(item.analysis.familyWarnings || []).length > 0 ? (
                                                            <ul className="mt-2 space-y-2">
                                                                {(item.analysis.familyWarnings || []).map(
                                                                    (i, idx) => (
                                                                        <li
                                                                            key={idx}
                                                                            className="px-3 py-2 bg-red-100 dark:bg-red-800/20 text-red-600 dark:text-red-400 rounded-lg"
                                                                        >
                                                                            {i}
                                                                        </li>
                                                                    )
                                                                )}
                                                            </ul>
                                                        ) : (
                                                            <p className="mt-1 text-gray-600 dark:text-gray-400">None</p>
                                                        )}
                                                    </div>

                                                    <div className="border-t border-gray-200 dark:border-gray-700"></div>

                                                    {/* Age‐Specific Warnings */}
                                                    <div>
                                                        <h4 className="text-base font-medium text-gray-800 dark:text-gray-200">
                                                            Age‐Specific Warnings
                                                        </h4>
                                                        <div className="mt-2 space-y-2">
                                                            {['babies', 'children', 'adults', 'elderly'].map(
                                                                (grp) => (
                                                                    <div
                                                                        key={grp}
                                                                        className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
                                                                    >
                                                                        <strong className="capitalize text-gray-700 dark:text-gray-300">
                                                                            {grp.charAt(0).toUpperCase() + grp.slice(1)}:
                                                                        </strong>{' '}
                                                                        <span className="text-gray-700 dark:text-gray-300">
                                                                            {item.analysis.ageSpecificWarnings?.[grp] ||
                                                                                'N/A'}
                                                                        </span>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="border-t border-gray-200 dark:border-gray-700"></div>

                                                    {/* Compound Interactions */}
                                                    <div>
                                                        <h4 className="text-base font-medium text-gray-800 dark:text-gray-200">
                                                            Compound Interactions
                                                        </h4>
                                                        {(item.analysis.compoundInteractions || []).length > 0 ? (
                                                            <ul className="mt-2 space-y-2">
                                                                {(item.analysis.compoundInteractions || []).map(
                                                                    (i, idx) => (
                                                                        <li
                                                                            key={idx}
                                                                            className="px-3 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg"
                                                                        >
                                                                            {i}
                                                                        </li>
                                                                    )
                                                                )}
                                                            </ul>
                                                        ) : (
                                                            <p className="mt-1 text-gray-600 dark:text-gray-400">None</p>
                                                        )}
                                                    </div>

                                                    <div className="border-t border-gray-200 dark:border-gray-700"></div>

                                                    {/* Recommendations */}
                                                    <div>
                                                        <h4 className="text-base font-medium text-gray-800 dark:text-gray-200">
                                                            Recommendations
                                                        </h4>
                                                        {(item.analysis.recommendations || []).length > 0 ? (
                                                            <ul className="mt-2 space-y-2">
                                                                {(item.analysis.recommendations || []).map(
                                                                    (i, idx) => (
                                                                        <li
                                                                            key={idx}
                                                                            className="px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg"
                                                                        >
                                                                            {i}
                                                                        </li>
                                                                    )
                                                                )}
                                                            </ul>
                                                        ) : (
                                                            <p className="mt-1 text-gray-600 dark:text-gray-400">None</p>
                                                        )}
                                                    </div>

                                                    <div className="border-t border-gray-200 dark:border-gray-700"></div>

                                                    {/* Personalized Warnings */}
                                                    <div>
                                                        <h4 className="text-base font-medium text-gray-800 dark:text-gray-200">
                                                            Personalized Warnings
                                                        </h4>
                                                        {(item.analysis.personalizedWarnings || []).length > 0 ? (
                                                            <ul className="mt-2 space-y-2">
                                                                {(
                                                                    item.analysis.personalizedWarnings || []
                                                                ).map((i, idx) => (
                                                                    <li
                                                                        key={idx}
                                                                        className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg"
                                                                    >
                                                                        {i}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <p className="mt-1 text-gray-600 dark:text-gray-400">None</p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                        </div>
                    )}

                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mt-8 mb-4">
                        Favorites
                    </h2>
                    {favorites.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            No favorites yet.
                        </p>
                    ) : (
                        <ul className="space-y-2">
                            {favorites.map((fav) => (
                                <li
                                    key={fav.id}
                                    className="flex justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
                                >
                                    <span className="text-gray-800 dark:text-gray-200">
                                        {fav.productName}
                                    </span>
                                    <span className="text-gray-600 dark:text-gray-400">
                                        {fav.safetyRating}/5 ({new Date(fav.timestamp).toLocaleDateString()})
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}

/** =================================================================================
 * 9) SafetyRating component
 * =================================================================================**/

function SafetyRating({ rating }) {
    const colors = {
        1: 'text-red-500',
        2: 'text-orange-500',
        3: 'text-yellow-500',
        4: 'text-lime-500',
        5: 'text-green-600',
    };
    const bgColors = {
        1: 'bg-red-50 dark:bg-red-900/20',
        2: 'bg-orange-50 dark:bg-orange-900/20',
        3: 'bg-yellow-50 dark:bg-yellow-900/20',
        4: 'bg-lime-50 dark:bg-lime-900/20',
        5: 'bg-green-50 dark:bg-green-900/20',
    };

    return (
        <div
            className={`flex items-center space-x-1 px-3 py-1 rounded-lg ${bgColors[rating]
                }`}
            aria-label={`Safety rating: ${rating} out of 5`}
        >
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`w-5 h-5 ${star <= rating
                            ? `${colors[rating]} fill-current`
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                />
            ))}
            <span className="ml-2 font-semibold text-gray-700 dark:text-gray-200">
                {rating}/5
            </span>
        </div>
    );
}

/** =================================================================================
 * 10) PROFILE PAGE
 * =================================================================================**/

function ProfilePage({
    profiles,
    setProfiles,
    selectedProfileId,
    setSelectedProfileId,
}) {
    const [localName, setLocalName] = useState('');
    const [localAge, setLocalAge] = useState('');
    const [localAllergies, setLocalAllergies] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [allergyInput, setAllergyInput] = useState('');

    useEffect(() => {
        if (editingId !== null) {
            const p = profiles.find((x) => x.id === editingId);
            if (p) {
                setLocalName(p.name);
                setLocalAge(p.age);
                setLocalAllergies(p.allergies);
            }
        } else {
            setLocalName('');
            setLocalAge('');
            setLocalAllergies([]);
        }
    }, [editingId, profiles]);

    const addAllergy = () => {
        const trimmed = allergyInput.trim().toLowerCase();
        if (!trimmed) return;
        if (!localAllergies.includes(trimmed)) {
            setLocalAllergies((prev) => [...prev, trimmed]);
        }
        setAllergyInput('');
    };

    const removeAllergy = (allergy) => {
        setLocalAllergies((prev) => prev.filter((a) => a !== allergy));
    };

    const saveLocalProfile = () => {
        if (!localName || !localAge) return;
        if (editingId !== null) {
            setProfiles((prev) =>
                prev.map((p) =>
                    p.id === editingId
                        ? { ...p, name: localName, age: localAge, allergies: localAllergies }
                        : p
                )
            );
            setEditingId(null);
        } else {
            const newProfile = {
                id: Date.now(),
                name: localName,
                age: localAge,
                allergies: localAllergies,
                color: randomPastelColor(),
                familyId: null,
            };
            setProfiles((prev) => [...prev, newProfile]);
            setSelectedProfileId(newProfile.id);
            setLocalName('');
            setLocalAge('');
            setLocalAllergies([]);
        }
    };

    const deleteProfile = (id) => {
        setProfiles((prev) => prev.filter((p) => p.id !== id));
        if (selectedProfileId === id) setSelectedProfileId(null);
        setDeleteConfirmId(null);
    };

    return (
        <div className="space-y-6 pb-32">
            {/* CREATE / EDIT Form */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-4">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                    {editingId === null ? 'Create New Profile' : 'Edit Profile'}
                </h2>
                <div className="space-y-4">
                    {/* FULL NAME */}
                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={localName}
                            onChange={(e) => setLocalName(e.target.value)}
                            placeholder="Enter full name"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                            aria-label="Full Name"
                        />
                    </div>

                    {/* AGE */}
                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                            Age
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={localAge}
                            onChange={(e) => setLocalAge(e.target.value)}
                            placeholder="Enter age"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                            aria-label="Age"
                        />
                    </div>

                    {/* ALLERGIES */}
                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                            Allergies
                        </label>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {localAllergies.map((allergy, i) => (
                                <span
                                    key={i}
                                    className="flex items-center bg-red-100 dark:bg-red-800/20 text-red-700 dark:text-red-300 px-3 py-1 rounded-full cursor-pointer hover:bg-red-200 dark:hover:bg-red-700 transition-colors duration-200"
                                    onClick={() => removeAllergy(allergy)}
                                >
                                    {allergy}
                                    <X className="w-4 h-4 ml-1" aria-hidden="true" />
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={allergyInput}
                                onChange={(e) => setAllergyInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addAllergy();
                                    }
                                }}
                                placeholder="Add allergy (e.g., lime)"
                                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                                aria-label="Add Allergy"
                            />
                            <button
                                onClick={addAllergy}
                                className="p-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors duration-200"
                                aria-label="Add Allergy"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* SAVE / CANCEL Buttons */}
                    <div className="flex justify-end space-x-3">
                        {editingId !== null && (
                            <button
                                onClick={() => setEditingId(null)}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                                aria-label="Cancel Editing"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            onClick={saveLocalProfile}
                            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors duration-200"
                            aria-label={editingId !== null ? 'Save Changes' : 'Save Profile'}
                        >
                            {editingId !== null ? 'Save Changes' : 'Save Profile'}
                        </button>
                    </div>
                </div>
            </div>

            {/* PROFILE LIST */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl shadow-md p-4">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                    Saved Profiles
                </h2>
                {profiles.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <p>No profiles yet. Create one above.</p>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {profiles.map((p) => {
                            const isActive = p.id === selectedProfileId;
                            return (
                                <li
                                    key={p.id}
                                    className={`relative flex items-center justify-between p-3 rounded-lg transition-colors duration-200 ${isActive
                                            ? 'bg-indigo-100 dark:bg-indigo-900/30'
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <button
                                        onClick={() => setSelectedProfileId(p.id)}
                                        className="flex items-center space-x-3 w-full text-left"
                                        aria-label={`Select profile ${p.name}`}
                                    >
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                                            style={{ backgroundColor: p.color }}
                                            aria-hidden="true"
                                        >
                                            {p.name
                                                .split(' ')
                                                .map((n) => n[0])
                                                .join('')
                                                .toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-800 dark:text-gray-100">
                                                {p.name}
                                            </p>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                                Age: {p.age}
                                                {p.allergies.length > 0
                                                    ? ` | Allergies: ${p.allergies.join(', ')}`
                                                    : ' | No allergies set'}
                                            </p>
                                        </div>
                                        {isActive && (
                                            <CheckSquare
                                                className="w-6 h-6 text-green-500"
                                                aria-hidden="true"
                                            />
                                        )}
                                    </button>

                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setEditingId(p.id)}
                                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                                            aria-label={`Edit ${p.name}`}
                                        >
                                            <Edit2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirmId(p.id)}
                                            className="p-2 hover:bg-red-100 dark:hover:bg-red-700 rounded-lg transition-colors duration-200"
                                            aria-label={`Delete ${p.name}`}
                                        >
                                            <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                                        </button>
                                    </div>

                                    {deleteConfirmId === p.id && (
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-md space-y-3">
                                                <p className="text-gray-800 dark:text-gray-200">
                                                    Delete <strong>{p.name}</strong>?
                                                </p>
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        onClick={() => setDeleteConfirmId(null)}
                                                        className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => deleteProfile(p.id)}
                                                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}

/** =================================================================================
 * 11) FAMILY PAGE
 * =================================================================================**/

function FamilyPage({ profiles, setProfiles, families, setFamilies }) {
    const [localFamilyName, setLocalFamilyName] = useState('');
    const [editingFamilyId, setEditingFamilyId] = useState(null);

    useEffect(() => {
        if (editingFamilyId !== null) {
            const fam = families.find((f) => f.id === editingFamilyId);
            if (fam) setLocalFamilyName(fam.name);
        } else {
            setLocalFamilyName('');
        }
    }, [editingFamilyId, families]);

    const saveFamily = () => {
        if (!localFamilyName.trim()) return;
        if (editingFamilyId) {
            setFamilies((prev) =>
                prev.map((f) =>
                    f.id === editingFamilyId ? { ...f, name: localFamilyName } : f
                )
            );
            setEditingFamilyId(null);
        } else {
            const newId = Date.now().toString();
            setFamilies((prev) => [
                ...prev,
                { id: newId, name: localFamilyName, memberIds: [] },
            ]);
        }
        setLocalFamilyName('');
    };

    const deleteFamily = (famId) => {
        setFamilies((prev) => prev.filter((f) => f.id !== famId));
        setProfiles((prev) =>
            prev.map((p) => (p.familyId === famId ? { ...p, familyId: null } : p))
        );
    };

    const toggleMember = (familyId, profileId) => {
        setFamilies((prev) =>
            prev.map((f) => {
                if (f.id !== familyId) return f;
                const already = f.memberIds.includes(profileId);
                return {
                    ...f,
                    memberIds: already
                        ? f.memberIds.filter((id) => id !== profileId)
                        : [...f.memberIds, profileId],
                };
            })
        );
        setProfiles((prev) =>
            prev.map((p) =>
                p.id === profileId
                    ? { ...p, familyId: p.familyId === familyId ? null : familyId }
                    : p
            )
        );
    };

    return (
        <div className="space-y-6 pb-32">
            {/* CREATE / RENAME FAMILY */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-4">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                    {editingFamilyId ? 'Rename Family' : 'Create New Family'}
                </h2>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={localFamilyName}
                        onChange={(e) => setLocalFamilyName(e.target.value)}
                        placeholder="Family name (e.g. Smith Family)"
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                        aria-label="Family Name"
                    />
                    <button
                        onClick={saveFamily}
                        className="px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors duration-200"
                        aria-label={editingFamilyId ? 'Save Family Name' : 'Create Family'}
                    >
                        {editingFamilyId ? 'Save' : 'Create'}
                    </button>
                </div>
            </div>

            {/* LIST OF FAMILIES */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl shadow-md p-4">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                    Saved Families
                </h2>
                {families.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <p>No families yet. Create one above.</p>
                    </div>
                ) : (
                    <ul className="space-y-4">
                        {families.map((fam) => (
                            <li
                                key={fam.id}
                                className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 shadow hover:shadow-lg transition-shadow duration-200"
                            >
                                {/* Family Header */}
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-lg font-medium text-gray-800 dark:text-gray-100">
                                            {fam.name}
                                        </p>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                                            {fam.memberIds.length} member
                                            {fam.memberIds.length === 1 ? '' : 's'}
                                        </p>
                                    </div>

                                    {/* Edit / Delete Buttons */}
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setEditingFamilyId(fam.id)}
                                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                                            aria-label={`Rename ${fam.name}`}
                                        >
                                            <Edit2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                        </button>
                                        <button
                                            onClick={() => deleteFamily(fam.id)}
                                            className="p-2 hover:bg-red-100 dark:hover:bg-red-700 rounded-lg transition-colors duration-200"
                                            aria-label={`Delete ${fam.name}`}
                                        >
                                            <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                                        </button>
                                    </div>
                                </div>

                                {/* Member Assignment */}
                                <div className="mt-4">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Members:
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {profiles.map((p) => {
                                            const isMember = fam.memberIds.includes(p.id);
                                            return (
                                                <button
                                                    key={p.id}
                                                    onClick={() => toggleMember(fam.id, p.id)}
                                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${isMember
                                                            ? 'bg-indigo-500 text-white'
                                                            : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                                                        }`}
                                                    aria-label={`${isMember ? 'Remove' : 'Add'} ${p.name
                                                        } from ${fam.name}`}
                                                >
                                                    {p.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

/** =================================================================================
 * 12) SETTINGS PAGE
 * =================================================================================**/

function SettingsPage({ apiKey, setApiKey }) {
    const [showPrivacy, setShowPrivacy] = useState(false);

    return (
        <div className="px-4 py-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Settings
            </h2>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-6">
                {/* API KEY */}
                <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                        OpenAI API Key
                    </label>
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="sk-..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                        aria-label="OpenAI API Key"
                    />
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                        🔒 Stored locally in your browser; never shared. Refresh to re-enter.
                    </p>
                </div>

                {/* Privacy Notice Toggle */}
                <button
                    onClick={() => setShowPrivacy((prev) => !prev)}
                    className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-300 hover:underline"
                    aria-label="Toggle Privacy Notice"
                >
                    <SettingsIcon className="w-5 h-5" />
                    <span>Privacy Notice</span>
                </button>
                {showPrivacy && (
                    <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg text-gray-700 dark:text-gray-200 text-sm space-y-2">
                        <p>
                            • Images you upload are sent directly to OpenAI’s API for analysis.
                            We do not store images on any server.
                        </p>
                        <p>
                            • Your allergy/profile data remains in your browser's local
                            storage and does not leave your device.
                        </p>
                        <p>
                            • We recommend not sharing any personally identifiable info as
                            part of your profile.
                        </p>
                    </div>
                )}

                {/* PWA Install Instruction */}
                <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg text-gray-700 dark:text-gray-200 text-sm">
                    <p>
                        You can install SafeCheck as a PWA: open browser menu →
                        “Install App.” On mobile, tap “Add to Home Screen.”
                    </p>
                </div>
            </div>
        </div>
    );
}

/** =================================================================================
 * 13) Utility: randomPastelColor
 * =================================================================================**/

function randomPastelColor() {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 60%, 80%)`;
}
