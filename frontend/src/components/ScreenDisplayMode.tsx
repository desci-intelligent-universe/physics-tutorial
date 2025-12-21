// components/ScreenDisplayMode.tsx
/**
 * Screen Display Mode Selector with full i18n support
 */

import { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { HelpCircle, X } from 'lucide-react';

export type ScreenMode = 'points' | 'fringes' | 'hybrid' | 'heatmap';

interface ScreenDisplayModeProps {
  mode: ScreenMode;
  onModeChange: (mode: ScreenMode) => void;
  showHeatmap: boolean;
  onHeatmapChange: (show: boolean) => void;
  heatmapOpacity: number;
  onOpacityChange: (opacity: number) => void;
}

// Multilingual mode info
const MODE_INFO: Record<ScreenMode, {
  icon: string;
  labels: Record<string, { title: string; short: string; description: string; help: string }>;
}> = {
  points: {
    icon: '⚬',
    labels: {
      en: { 
        title: 'Discrete Points', 
        short: 'Points',
        description: 'Each dot represents a single photon detection. Shows quantum nature of light.',
        help: 'Points mode shows individual particle hits on the detector screen. Each dot is one particle detection event. Over time, dots form the interference pattern. This demonstrates the fundamental quantum nature of light — photons always arrive as discrete "clicks" at specific locations, not as continuous waves.',
      },
      ru: { 
        title: 'Дискретные точки', 
        short: 'Точки',
        description: 'Каждая точка — детекция фотона. Показывает квантовую природу света.',
        help: 'Режим "Точки" показывает отдельные попадания частиц на экран детектора. Каждая точка — это регистрация одной частицы. Со временем точки формируют интерференционную картину. Это демонстрирует фундаментальную квантовую природу света — фотоны всегда приходят как дискретные "щелчки" в конкретных точках.',
      },
      es: { 
        title: 'Puntos Discretos', 
        short: 'Puntos',
        description: 'Cada punto es una detección de fotón. Muestra la naturaleza cuántica.',
        help: 'El modo Puntos muestra los impactos individuales de partículas en la pantalla del detector. Cada punto es un evento de detección. Con el tiempo, los puntos forman el patrón de interferencia.',
      },
      pt: { 
        title: 'Pontos Discretos', 
        short: 'Pontos',
        description: 'Cada ponto é uma detecção de fóton. Mostra a natureza quântica.',
        help: 'O modo Pontos mostra impactos individuais de partículas na tela do detector. Cada ponto é um evento de detecção. Com o tempo, os pontos formam o padrão de interferência.',
      },
      de: { 
        title: 'Diskrete Punkte', 
        short: 'Punkte',
        description: 'Jeder Punkt ist eine Photon-Detektion. Zeigt die Quantennatur.',
        help: 'Der Punktemodus zeigt einzelne Teilchentreffer auf dem Detektorschirm. Jeder Punkt ist ein Detektionsereignis. Mit der Zeit bilden die Punkte das Interferenzmuster.',
      },
      fr: { 
        title: 'Points Discrets', 
        short: 'Points',
        description: 'Chaque point est une détection de photon. Montre la nature quantique.',
        help: 'Le mode Points montre les impacts individuels des particules sur l\'écran du détecteur. Chaque point est un événement de détection. Avec le temps, les points forment le motif d\'interférence.',
      },
      zh: { 
        title: '离散点', 
        short: '点',
        description: '每个点代表一次光子检测。展示光的量子本性。',
        help: '点模式显示单个粒子撞击探测器屏幕。每个点代表一次粒子检测事件。随着时间推移，点形成干涉图样。这展示了光的基本量子本性。',
      },
      ar: { 
        title: 'نقاط منفصلة', 
        short: 'نقاط',
        description: 'كل نقطة هي كشف فوتون. يُظهر الطبيعة الكمية.',
        help: 'يُظهر وضع النقاط ضربات الجسيمات الفردية على شاشة الكاشف. كل نقطة هي حدث كشف جسيم واحد. مع الوقت، تشكل النقاط نمط التداخل.',
      },
    },
  },
  fringes: {
    icon: '▮',
    labels: {
      en: { 
        title: 'Interference Fringes', 
        short: 'Fringes',
        description: 'Classic wave pattern. Bright = constructive, dark = destructive interference.',
        help: 'Fringes mode shows the classic interference pattern as bright and dark bands. Bright bands are where waves from both slits arrive in phase (constructive interference). Dark bands are where they arrive out of phase (destructive interference). The pattern follows: I(θ) = I₀ cos²(πd·sinθ/λ)',
      },
      ru: { 
        title: 'Интерференционные полосы', 
        short: 'Полосы',
        description: 'Классическая волновая картина. Светлые = конструктивная, тёмные = деструктивная интерференция.',
        help: 'Режим "Полосы" показывает классическую интерференционную картину в виде светлых и тёмных полос. Светлые полосы — там, где волны от обеих щелей приходят в фазе (конструктивная интерференция). Тёмные — где в противофазе (деструктивная). Формула: I(θ) = I₀ cos²(πd·sinθ/λ)',
      },
      es: { 
        title: 'Franjas de Interferencia', 
        short: 'Franjas',
        description: 'Patrón de onda clásico. Claro = constructiva, oscuro = destructiva.',
        help: 'El modo Franjas muestra el patrón clásico de interferencia como bandas claras y oscuras. Las bandas claras son interferencia constructiva, las oscuras son interferencia destructiva.',
      },
      pt: { 
        title: 'Franjas de Interferência', 
        short: 'Franjas',
        description: 'Padrão de onda clássico. Claro = construtiva, escuro = destrutiva.',
        help: 'O modo Franjas mostra o padrão clássico de interferência como faixas claras e escuras. Faixas claras são interferência construtiva, escuras são destrutiva.',
      },
      de: { 
        title: 'Interferenzstreifen', 
        short: 'Streifen',
        description: 'Klassisches Wellenmuster. Hell = konstruktiv, dunkel = destruktiv.',
        help: 'Der Streifenmodus zeigt das klassische Interferenzmuster als helle und dunkle Bänder. Helle Bänder sind konstruktive, dunkle destruktive Interferenz.',
      },
      fr: { 
        title: 'Franges d\'Interférence', 
        short: 'Franges',
        description: 'Motif classique. Clair = constructif, sombre = destructif.',
        help: 'Le mode Franges montre le motif classique d\'interférence en bandes claires et sombres. Les bandes claires sont l\'interférence constructive, sombres destructive.',
      },
      zh: { 
        title: '干涉条纹', 
        short: '条纹',
        description: '经典波图样。亮 = 相长，暗 = 相消干涉。',
        help: '条纹模式以明暗条带显示经典干涉图样。明亮条带是相长干涉（波峰相遇），暗条带是相消干涉（波峰与波谷相遇）。公式：I(θ) = I₀ cos²(πd·sinθ/λ)',
      },
      ar: { 
        title: 'أهداب التداخل', 
        short: 'أهداب',
        description: 'نمط موجي كلاسيكي. فاتح = بناء، داكن = هدام.',
        help: 'يُظهر وضع الأهداب نمط التداخل الكلاسيكي كأشرطة فاتحة وداكنة. الأشرطة الفاتحة هي التداخل البناء، والداكنة هي الهدام.',
      },
    },
  },
  hybrid: {
    icon: '◐',
    labels: {
      en: { 
        title: 'Hybrid View', 
        short: 'Hybrid',
        description: 'Points overlaid on fringes. Shows quantum→classical transition.',
        help: 'Hybrid mode combines both visualizations: individual particle hits overlaid on the intensity distribution. This powerfully demonstrates wave-particle duality — each particle arrives at a single point, but the overall distribution follows the wave interference pattern. The wave function ψ = ψ₁ + ψ₂ determines probability P(x) = |ψ|²',
      },
      ru: { 
        title: 'Гибридный вид', 
        short: 'Гибрид',
        description: 'Точки поверх полос. Показывает квантово-классический переход.',
        help: 'Гибридный режим объединяет оба представления: точки попаданий накладываются на распределение интенсивности. Это наглядно демонстрирует корпускулярно-волновой дуализм — каждая частица приходит в одну точку, но общее распределение следует волновой интерференции. Волновая функция ψ = ψ₁ + ψ₂ определяет вероятность P(x) = |ψ|²',
      },
      es: { 
        title: 'Vista Híbrida', 
        short: 'Híbrido',
        description: 'Puntos sobre franjas. Muestra transición cuántico→clásico.',
        help: 'El modo Híbrido combina ambas visualizaciones: impactos individuales sobre la distribución de intensidad. Demuestra la dualidad onda-partícula.',
      },
      pt: { 
        title: 'Visualização Híbrida', 
        short: 'Híbrido',
        description: 'Pontos sobre franjas. Mostra transição quântico→clássico.',
        help: 'O modo Híbrido combina ambas as visualizações: impactos individuais sobre a distribuição de intensidade. Demonstra a dualidade onda-partícula.',
      },
      de: { 
        title: 'Hybrid-Ansicht', 
        short: 'Hybrid',
        description: 'Punkte über Streifen. Zeigt Quanten→Klassik-Übergang.',
        help: 'Der Hybridmodus kombiniert beide Visualisierungen: einzelne Treffer über der Intensitätsverteilung. Demonstriert den Welle-Teilchen-Dualismus.',
      },
      fr: { 
        title: 'Vue Hybride', 
        short: 'Hybride',
        description: 'Points sur franges. Montre transition quantique→classique.',
        help: 'Le mode Hybride combine les deux visualisations: impacts individuels sur la distribution d\'intensité. Démontre la dualité onde-particule.',
      },
      zh: { 
        title: '混合视图', 
        short: '混合',
        description: '点叠加在条纹上。展示量子→经典过渡。',
        help: '混合模式结合两种可视化：单个粒子撞击叠加在强度分布上。这有力地展示了波粒二象性——每个粒子到达单一点，但总体分布遵循波动干涉图样。',
      },
      ar: { 
        title: 'عرض هجين', 
        short: 'هجين',
        description: 'نقاط فوق الأهداب. يُظهر الانتقال الكمي→الكلاسيكي.',
        help: 'يجمع الوضع الهجين بين التصورين: ضربات الجسيمات الفردية فوق توزيع الشدة. يوضح ازدواجية الموجة والجسيم.',
      },
    },
  },
  heatmap: {
    icon: '🌡️',
    labels: {
      en: { 
        title: 'Heatmap Only', 
        short: 'Heat',
        description: 'Accumulated intensity distribution. Like a long-exposure camera.',
        help: 'Heatmap shows the accumulated intensity of the interference pattern — equivalent to a long exposure on a CCD camera. Bright areas are constructive interference maxima where many particles accumulate. Dark areas are destructive interference minima where few particles arrive. Color intensity represents detection probability |ψ|²',
      },
      ru: { 
        title: 'Только тепловая карта', 
        short: 'Тепло',
        description: 'Накопленное распределение интенсивности. Как долгая экспозиция.',
        help: 'Тепловая карта показывает накопленную интенсивность интерференционной картины — эквивалент долгой экспозиции на CCD-камере. Яркие области — максимумы конструктивной интерференции, где накапливается много частиц. Тёмные — минимумы деструктивной интерференции. Интенсивность цвета соответствует вероятности детекции |ψ|²',
      },
      es: { 
        title: 'Solo Mapa de Calor', 
        short: 'Calor',
        description: 'Distribución de intensidad acumulada. Como exposición larga.',
        help: 'El mapa de calor muestra la intensidad acumulada del patrón de interferencia — equivalente a una exposición larga en una cámara CCD. Las áreas brillantes son máximos de interferencia constructiva.',
      },
      pt: { 
        title: 'Apenas Mapa de Calor', 
        short: 'Calor',
        description: 'Distribuição de intensidade acumulada. Como exposição longa.',
        help: 'O mapa de calor mostra a intensidade acumulada do padrão de interferência — equivalente a uma exposição longa em uma câmera CCD. Áreas brilhantes são máximos de interferência construtiva.',
      },
      de: { 
        title: 'Nur Wärmebild', 
        short: 'Wärme',
        description: 'Akkumulierte Intensitätsverteilung. Wie Langzeitbelichtung.',
        help: 'Die Wärmekarte zeigt die akkumulierte Intensität des Interferenzmusters — äquivalent zur Langzeitbelichtung einer CCD-Kamera. Helle Bereiche sind konstruktive Maxima.',
      },
      fr: { 
        title: 'Carte Thermique Seule', 
        short: 'Chaleur',
        description: 'Distribution d\'intensité accumulée. Comme longue exposition.',
        help: 'La carte thermique montre l\'intensité accumulée du motif d\'interférence — équivalent à une longue exposition sur caméra CCD. Les zones claires sont des maxima constructifs.',
      },
      zh: { 
        title: '仅热图', 
        short: '热图',
        description: '累积强度分布。如同长曝光相机。',
        help: '热图显示干涉图样的累积强度——相当于CCD相机的长曝光。明亮区域是相长干涉极大值，许多粒子在此积累。暗区域是相消干涉极小值。',
      },
      ar: { 
        title: 'خريطة حرارية فقط', 
        short: 'حرارة',
        description: 'توزيع الشدة المتراكمة. مثل التعرض الطويل.',
        help: 'تُظهر خريطة الحرارة الشدة المتراكمة لنمط التداخل — ما يعادل التعرض الطويل على كاميرا CCD. المناطق الساطعة هي قمم التداخل البناء.',
      },
    },
  },
};

export function ScreenDisplayMode({
  mode,
  onModeChange,
  showHeatmap,
  onHeatmapChange,
  heatmapOpacity,
  onOpacityChange,
}: ScreenDisplayModeProps) {
  const { language, t } = useLanguage();
  const [showHelp, setShowHelp] = useState(false);

  const getLabel = (m: ScreenMode) => MODE_INFO[m].labels[language] || MODE_INFO[m].labels.en;
  const currentLabel = getLabel(mode);

  const texts: Record<string, { screenMode: string; heatmap: string; opacity: string; help: string; on: string; off: string }> = {
    en: { screenMode: 'Screen Mode', heatmap: 'Heatmap', opacity: 'Opacity', help: 'Help', on: 'ON', off: 'OFF' },
    ru: { screenMode: 'Режим экрана', heatmap: 'Тепловая карта', opacity: 'Прозрачность', help: 'Помощь', on: 'ВКЛ', off: 'ВЫКЛ' },
    es: { screenMode: 'Modo de Pantalla', heatmap: 'Mapa de Calor', opacity: 'Opacidad', help: 'Ayuda', on: 'ON', off: 'OFF' },
    pt: { screenMode: 'Modo de Tela', heatmap: 'Mapa de Calor', opacity: 'Opacidade', help: 'Ajuda', on: 'ON', off: 'OFF' },
    de: { screenMode: 'Bildschirmmodus', heatmap: 'Wärmebild', opacity: 'Deckkraft', help: 'Hilfe', on: 'AN', off: 'AUS' },
    fr: { screenMode: 'Mode d\'Écran', heatmap: 'Carte Thermique', opacity: 'Opacité', help: 'Aide', on: 'ON', off: 'OFF' },
    zh: { screenMode: '屏幕模式', heatmap: '热图', opacity: '不透明度', help: '帮助', on: '开', off: '关' },
    ar: { screenMode: 'وضع الشاشة', heatmap: 'خريطة حرارية', opacity: 'الشفافية', help: 'مساعدة', on: 'تشغيل', off: 'إيقاف' },
  };
  const txt = texts[language] || texts.en;

  return (
    <div className="bg-slate-900/95 backdrop-blur-md rounded-xl border border-indigo-500/20 p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
          🖥️ {txt.screenMode}
        </h4>
        <button
          onClick={() => setShowHelp(true)}
          className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded transition-colors flex items-center gap-1 text-gray-300"
        >
          <HelpCircle size={12} />
          {txt.help}
        </button>
      </div>
      
      {/* Mode Selector */}
      <div className="grid grid-cols-4 gap-1 mb-3">
        {(Object.keys(MODE_INFO) as ScreenMode[]).map((m) => {
          const label = getLabel(m);
          return (
            <button
              key={m}
              onClick={() => onModeChange(m)}
              className={`
                py-2 px-1 rounded-lg text-center transition-all
                ${mode === m 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                  : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                }
              `}
            >
              <span className="text-lg block">{MODE_INFO[m].icon}</span>
              <span className="text-[10px] block mt-0.5">{label.short}</span>
            </button>
          );
        })}
      </div>
      
      {/* Current Mode Description */}
      <div className="p-2 bg-slate-800/50 rounded-lg mb-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{MODE_INFO[mode].icon}</span>
          <span className="text-sm font-medium text-white">{currentLabel.title}</span>
        </div>
        <p className="text-xs text-gray-400">{currentLabel.description}</p>
      </div>
      
      {/* Heatmap Controls */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">{txt.heatmap}</span>
          <button
            onClick={() => onHeatmapChange(!showHeatmap)}
            className={`
              px-3 py-1 text-xs rounded-full transition-colors font-medium
              ${showHeatmap 
                ? 'bg-orange-600 text-white' 
                : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
              }
            `}
          >
            {showHeatmap ? txt.on : txt.off}
          </button>
        </div>
        
        {showHeatmap && (
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-500">{txt.opacity}</span>
              <span className="text-[10px] text-gray-400 font-mono">{Math.round(heatmapOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={heatmapOpacity}
              onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg cursor-pointer accent-orange-500 appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-500"
            />
          </div>
        )}
      </div>
      
      {/* Help Modal - Mode-specific */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-auto border border-slate-700">
            <div className="sticky top-0 bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                {MODE_INFO[mode].icon} {currentLabel.title}
              </h3>
              <button onClick={() => setShowHelp(false)} className="p-1 hover:bg-slate-700 rounded">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Mode-specific help */}
              <div className="p-4 bg-indigo-900/30 rounded-lg border border-indigo-500/20">
                <p className="text-sm text-gray-300 leading-relaxed">{currentLabel.help}</p>
              </div>
              
              {/* All modes overview */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-400">
                  {language === 'ru' ? 'Все режимы:' : 'All modes:'}
                </h4>
                {(Object.keys(MODE_INFO) as ScreenMode[]).map((m) => {
                  const label = getLabel(m);
                  return (
                    <button
                      key={m}
                      onClick={() => { onModeChange(m); }}
                      className={`w-full p-2 rounded-lg text-left transition-colors flex items-center gap-3 ${
                        mode === m ? 'bg-indigo-600/30 border border-indigo-500' : 'bg-slate-700/50 hover:bg-slate-700'
                      }`}
                    >
                      <span className="text-xl">{MODE_INFO[m].icon}</span>
                      <div>
                        <span className="text-sm font-medium text-white">{label.title}</span>
                        <p className="text-xs text-gray-400">{label.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ScreenDisplayModeCompact({ mode, onModeChange }: { mode: ScreenMode; onModeChange: (mode: ScreenMode) => void }) {
  return (
    <div className="flex gap-1 p-1 bg-slate-800/50 rounded-lg">
      {(Object.keys(MODE_INFO) as ScreenMode[]).map((m) => (
        <button
          key={m}
          onClick={() => onModeChange(m)}
          className={`p-1.5 rounded transition-all flex-1 ${mode === m ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <span className="text-sm">{MODE_INFO[m].icon}</span>
        </button>
      ))}
    </div>
  );
}
