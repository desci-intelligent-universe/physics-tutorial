// App.tsx - Main Application with All Modes Integration
/**
 * DIU Physics Interactive v15.4
 * 
 * An open-source educational platform for quantum physics visualization.
 * Built with respect for the scientific community and proper attribution.
 * 
 * "If I have seen further, it is by standing on the shoulders of giants"
 * — Isaac Newton, 1675
 * 
 * We welcome contributions from scientists, educators, and developers!
 * Contact: science@diu-os.dev
 * GitHub: https://github.com/desci-intelligent-universe
 * 
 * Modes:
 * - Demo: Simplified for curious minds
 * - Laboratory: Tasks and XP for students
 * - Research: Extended parameters for scientists
 * - Simulation: (Coming soon) Monte Carlo, batch runs
 * - Collaboration: (Coming soon) Shared sessions
 * - Sandbox: (Coming soon) Custom experiments
 */

import { useState, useCallback, useEffect, Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';

// Components
import { ModeSelector, ComingSoonModal, type AppMode } from './components/ModeSelector';
import { ControlsPanel } from './components/ControlsPanel';
import { ResearchPanel, DEFAULT_RESEARCH_PARAMS, type ResearchParams } from './components/ResearchPanel';
import { StatsPanel } from './components/StatsPanel';
import { TheorySection } from './components/TheorySection';
import { QuizPanel } from './components/QuizPanel';
import { LabTasks } from './components/LabTasks';
import { DataExport } from './components/DataExport';
import { ScreenDisplayMode, type ScreenMode } from './components/ScreenDisplayMode';
import { TheoryComparisonOverlay } from './components/TheoryComparisonOverlay';
import { ModeInfoPanel } from './components/ModeInfoPanel';
import { HeatmapSettings } from './components/HeatmapSettings';
import { ScientificCredits, CreditsButton } from './components/ScientificCredits';
import { FullscreenToggle, FullscreenOverlay, MinimalFullscreenControls } from './components/FullscreenToggle';

// Simulations
import DoubleSlit from './simulations/DoubleSlit';
import type { DoubleSlitParams, DoubleSlitStats } from './simulations/DoubleSlit';

// i18n
import { LanguageProvider, useLanguage, LanguageSwitcher } from './i18n/LanguageContext';

// Default parameters for each mode
const DEFAULT_DEMO_PARAMS: DoubleSlitParams = {
  wavelength: 550,
  slitDistance: 0.3,
  slitWidth: 0.05,
  barrierThickness: 0.1,  // Default thin barrier
  coherence: 100,
  intensity: 50,
  observerOn: false,
  slowMotion: false,
  showTrails: true,
  showHeatmap: true,
  soundEnabled: false,
  showDiscretePoints: false,
  showTheoryOverlay: false,
};

const DEFAULT_LAB_PARAMS: DoubleSlitParams = {
  ...DEFAULT_DEMO_PARAMS,
  barrierThickness: 0.1,  // Explicitly set for Lab mode
  showDiscretePoints: true,
  showTheoryOverlay: false,
};

// Extended parameters for Research mode
interface ExtendedParams extends DoubleSlitParams {
  // Source
  lineWidth: number;
  polarization: 'H' | 'V' | '45' | 'circular' | 'unpolarized';
  sourceType: 'laser' | 'led' | 'thermal' | 'single-photon';
  photonRate: number;
  
  // Geometry
  slitHeight: number;
  barrierThickness: number;
  screenDistance: number;
  incidenceAngle: number;
  slitCount: number;
  
  // Detector
  detectorType: 'ccd' | 'pmt' | 'spad' | 'emccd';
  pixelSize: number;
  quantumEfficiency: number;
  darkCounts: number;
  readNoise: number;
  exposureTime: number;
  
  // Environment
  medium: 'vacuum' | 'air' | 'nitrogen' | 'oxygen' | 'helium' | 'argon' | 'co2' | 'water';
  refractiveIndex: number;
  temperature: number;
  pressure: number;
  humidity: number;
  
  // Display
  screenMode: ScreenMode;
  heatmapOpacity: number;
  colorScheme: 'wavelength' | 'thermal' | 'grayscale' | 'scientific';
}

// Refractive indices for different media at STP (λ ≈ 589 nm)
const MEDIUM_REFRACTIVE_INDICES: Record<string, number> = {
  vacuum: 1.0,
  air: 1.000293,
  nitrogen: 1.000298,
  oxygen: 1.000271,
  helium: 1.000036,
  argon: 1.000281,
  hydrogen: 1.000132,
  co2: 1.000450,
  water: 1.333,
};

function AppContent() {
  const { t, language } = useLanguage();
  
  // App state
  const [currentMode, setCurrentMode] = useState<AppMode>('demo');
  const [showComingSoon, setShowComingSoon] = useState<AppMode | null>(null);
  
  // Parameters state
  const [params, setParams] = useState<DoubleSlitParams>(DEFAULT_DEMO_PARAMS);
  const [researchParams, setResearchParams] = useState<ResearchParams>(DEFAULT_RESEARCH_PARAMS);
  const [stats, setStats] = useState<DoubleSlitStats | null>(null);
  
  // Display state
  const [screenMode, setScreenMode] = useState<ScreenMode>('points');
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.6);
  const [showModeInfo, setShowModeInfo] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Refs
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  
  // Camera state - increased zoom range
  const [cameraDistance, setCameraDistance] = useState(20);
  const MIN_CAMERA_DISTANCE = 2;  // Even closer zoom for detail!
  const MAX_CAMERA_DISTANCE = 60;
  
  // Handle mode change
  const handleModeChange = useCallback((mode: AppMode) => {
    if (['simulation', 'collaboration', 'sandbox'].includes(mode)) {
      setShowComingSoon(mode);
      return;
    }
    
    setCurrentMode(mode);
    
    // Update default params based on mode
    switch (mode) {
      case 'demo':
        setParams(DEFAULT_DEMO_PARAMS);
        break;
      case 'lab':
        setParams(DEFAULT_LAB_PARAMS);
        break;
      case 'research':
        // Use research params
        setParams({
          ...DEFAULT_LAB_PARAMS,
          wavelength: researchParams.source.wavelength,
          slitDistance: researchParams.geometry.slitDistance,
          slitWidth: researchParams.geometry.slitWidth,
          coherence: researchParams.source.coherence,
          intensity: researchParams.source.intensity,
          showDiscretePoints: researchParams.display.screenMode === 'points' || researchParams.display.screenMode === 'hybrid',
          showHeatmap: researchParams.display.showHeatmap,
          showTheoryOverlay: researchParams.display.showTheoryCurve,
        });
        break;
    }
  }, [researchParams]);
  
  // Sync research params to main params
  useEffect(() => {
    if (currentMode === 'research') {
      setParams(prev => ({
        ...prev,
        wavelength: researchParams.source.wavelength,
        slitDistance: researchParams.geometry.slitDistance,
        slitWidth: researchParams.geometry.slitWidth,
        coherence: researchParams.source.coherence,
        intensity: researchParams.source.intensity,
      }));
    }
  }, [currentMode, researchParams]);
  
  // Reset counter to force re-mount of simulation
  const [resetKey, setResetKey] = useState(0);
  
  // Reset handler - resets params and forces simulation re-mount
  const handleReset = useCallback(() => {
    switch (currentMode) {
      case 'demo':
        setParams(DEFAULT_DEMO_PARAMS);
        break;
      case 'lab':
        setParams(DEFAULT_LAB_PARAMS);
        break;
      case 'research':
        setResearchParams(DEFAULT_RESEARCH_PARAMS);
        break;
    }
    // Increment key to force simulation reset
    setResetKey(prev => prev + 1);
  }, [currentMode]);
  
  // Export handler
  const handleExport = useCallback(() => {
    const data = {
      mode: currentMode,
      params: currentMode === 'research' ? researchParams : params,
      stats,
      timestamp: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diu-experiment-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [currentMode, params, researchParams, stats]);
  
  return (
    <div className="h-screen w-screen bg-slate-950 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-none px-4 py-2 bg-slate-900/80 backdrop-blur border-b border-slate-800 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          {/* Mode Selector */}
          <ModeSelector 
            currentMode={currentMode} 
            onModeChange={handleModeChange}
          />
        </div>
        
        {/* Title */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-3">
          <span className="text-3xl">🔬</span>
          <div>
            <h1 className="text-xl font-bold text-white">{t('title')}</h1>
            <p className="text-xs text-gray-400">{t('subtitle')} • DIU Platform</p>
          </div>
        </div>
        
        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Scientific Credits */}
          <CreditsButton onClick={() => setShowCredits(true)} />
          
          {/* Mode Info Button */}
          <button
            onClick={() => setShowModeInfo(true)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-gray-300 transition-colors"
          >
            ℹ️ {t('common.modeInfo') || 'Mode Info'}
          </button>
          
          {/* Language Switcher - All 8 languages */}
          <LanguageSwitcher />
        </div>
      </header>
      
      {/* Main Content - Hide sidebars in fullscreen */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel - Controls (hidden in fullscreen) */}
        {!isFullscreen && (
        <aside className="flex-none w-80 p-3 overflow-y-auto space-y-3 bg-slate-900/50">
          {/* Mode-specific Controls */}
          {currentMode === 'research' ? (
            <ResearchPanel
              params={researchParams}
              onParamsChange={setResearchParams}
              onExport={handleExport}
              onImport={setResearchParams}
            />
          ) : (
            <ControlsPanel
              params={params}
              setParams={setParams}
              onReset={handleReset}
              isLabMode={currentMode === 'lab'}
            />
          )}
          
          {/* Screen Display Mode */}
          {currentMode !== 'demo' && (
            <ScreenDisplayMode
              mode={screenMode}
              onModeChange={setScreenMode}
              showHeatmap={params.showHeatmap ?? true}
              onHeatmapChange={(show) => setParams(p => ({ ...p, showHeatmap: show }))}
              heatmapOpacity={heatmapOpacity}
              onOpacityChange={setHeatmapOpacity}
            />
          )}
          
          {/* Heatmap Settings (Research mode only) */}
          {currentMode === 'research' && (
            <HeatmapSettings
              opacity={heatmapOpacity}
              onOpacityChange={setHeatmapOpacity}
              colorScheme={researchParams.display.colorScheme}
              onColorSchemeChange={(scheme) => setResearchParams(p => ({
                ...p,
                display: { ...p.display, colorScheme: scheme }
              }))}
              showContours={false}
              onShowContoursChange={() => {}}
              interpolation="linear"
              onInterpolationChange={() => {}}
            />
          )}
          
          {/* Lab Tasks (Lab mode only) */}
          {currentMode === 'lab' && (
            <LabTasks
              params={params}
              stats={stats}
            />
          )}
        </aside>
        )}
        
        {/* Center - 3D Canvas */}
        <div className={`flex-1 relative ${isFullscreen ? 'w-full' : ''}`} ref={canvasContainerRef}>
          {/* Fullscreen Toggle */}
          <div className="absolute top-4 right-4 z-10">
            <FullscreenToggle 
              targetRef={canvasContainerRef}
              onFullscreenChange={setIsFullscreen}
            />
          </div>
          
          {/* Fullscreen Overlay */}
          <FullscreenOverlay
            isFullscreen={isFullscreen}
            onExit={() => {
              if (document.exitFullscreen) {
                document.exitFullscreen();
              }
            }}
          >
            <MinimalFullscreenControls
              wavelength={params.wavelength}
              slitDistance={params.slitDistance}
              intensity={params.intensity}
              observerOn={params.observerOn}
              totalParticles={stats?.totalParticles ?? 0}
              fringeCount={stats?.fringeCount ?? 0}
            />
          </FullscreenOverlay>
          
          <Canvas shadows>
            <PerspectiveCamera
              makeDefault
              position={[0, 8, cameraDistance]}
              fov={50}
            />
            <OrbitControls
              minDistance={MIN_CAMERA_DISTANCE}
              maxDistance={MAX_CAMERA_DISTANCE}
              maxPolarAngle={Math.PI / 2}
              enableDamping
              dampingFactor={0.05}
            />
            <Suspense fallback={null}>
              <DoubleSlit
                key={resetKey}
                params={{
                  ...params,
                  showDiscretePoints: screenMode === 'points' || screenMode === 'hybrid',
                  showHeatmap: screenMode === 'fringes' || screenMode === 'hybrid' || params.showHeatmap,
                }}
                onStatsUpdate={setStats}
              />
            </Suspense>
          </Canvas>
          
          {/* Overlay Info */}
          <div className="absolute bottom-4 left-4 flex items-center gap-4 text-sm">
            <div className="px-3 py-1.5 bg-slate-900/80 backdrop-blur rounded-lg flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: `hsl(${(params.wavelength - 380) / (780 - 380) * 270}, 100%, 50%)`,
                }}
              />
              <span className="text-white font-mono">{params.wavelength} nm</span>
            </div>
            <div className="px-3 py-1.5 bg-slate-900/80 backdrop-blur rounded-lg text-gray-300">
              d={params.slitDistance.toFixed(2)} mm
            </div>
            <div className="px-3 py-1.5 bg-slate-900/80 backdrop-blur rounded-lg text-gray-300">
              I={params.intensity}
            </div>
            {params.observerOn && (
              <div className="px-3 py-1.5 bg-red-600/80 backdrop-blur rounded-lg text-white flex items-center gap-1">
                👁️ {t('controls.detectorOn')}
              </div>
            )}
          </div>
          
          {/* Zoom indicator */}
          <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-slate-900/80 backdrop-blur rounded-lg text-gray-400 text-xs">
            🔍 Zoom: {Math.round((MAX_CAMERA_DISTANCE - cameraDistance) / (MAX_CAMERA_DISTANCE - MIN_CAMERA_DISTANCE) * 100)}%
          </div>
        </div>
        
        {/* Right Panel - Stats & Theory (hidden in fullscreen) */}
        {!isFullscreen && (
        <aside className="flex-none w-80 p-3 overflow-y-auto space-y-3 bg-slate-900/50">
          {/* Statistics */}
          <StatsPanel
            stats={stats}
            observerOn={params.observerOn}
            mode={currentMode}
          />
          
          {/* Theory Comparison (Research mode) */}
          {currentMode === 'research' && stats && researchParams.display.showTheoryCurve && (
            <TheoryComparisonOverlay
              histogram={stats.histogram}
              theoreticalCurve={stats.theoreticalCurve}
              wavelength={params.wavelength}
              slitDistance={params.slitDistance}
              slitWidth={params.slitWidth}
              coherence={params.coherence ?? 100}
              observerOn={params.observerOn}
              showTheory={true}
              showExperimental={true}
            />
          )}
          
          {/* Theory Section */}
          <TheorySection experiment="doubleSlit" />
          
          {/* Quiz (Demo and Lab modes) */}
          {(currentMode === 'demo' || currentMode === 'lab') && (
            <QuizPanel />
          )}
          
          {/* Data Export (Lab and Research modes) */}
          {(currentMode === 'lab' || currentMode === 'research') && (
            <DataExport
              stats={stats}
              params={params}
              onExport={handleExport}
            />
          )}
        </aside>
        )}
      </main>
      
      {/* Coming Soon Modal */}
      {showComingSoon && (
        <ComingSoonModal
          mode={showComingSoon}
          isOpen={true}
          onClose={() => setShowComingSoon(null)}
        />
      )}
      
      {/* Mode Info Modal */}
      {showModeInfo && (
        <ModeInfoPanel
          currentMode={currentMode}
          onClose={() => setShowModeInfo(false)}
        />
      )}
      
      {/* Scientific Credits Modal */}
      <ScientificCredits
        isOpen={showCredits}
        onClose={() => setShowCredits(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
