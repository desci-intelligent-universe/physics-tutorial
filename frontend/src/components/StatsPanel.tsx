// components/StatsPanel.tsx
import { useMemo, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Info } from 'lucide-react';
import type { DoubleSlitStats } from '../simulations/DoubleSlit';
import type { AppMode } from './ModeSelector';

interface StatsPanelProps {
  stats: DoubleSlitStats | null;
  observerOn: boolean;
  mode?: AppMode;
}

// Multilingual texts
const TEXTS = {
  title: {
    en: '📊 Statistics', ru: '📊 Статистика', es: '📊 Estadísticas',
    pt: '📊 Estatísticas', de: '📊 Statistik', fr: '📊 Statistiques',
    zh: '📊 统计', ar: '📊 الإحصائيات',
  },
  loading: {
    en: '⏳ Loading...', ru: '⏳ Загрузка...', es: '⏳ Cargando...',
    pt: '⏳ Carregando...', de: '⏳ Laden...', fr: '⏳ Chargement...',
    zh: '⏳ 加载中...', ar: '⏳ جاري التحميل...',
  },
  distribution: {
    en: 'Screen Distribution', ru: 'Распределение на экране', es: 'Distribución en Pantalla',
    pt: 'Distribuição na Tela', de: 'Schirmverteilung', fr: 'Distribution sur Écran',
    zh: '屏幕分布', ar: 'التوزيع على الشاشة',
  },
  particles: {
    en: 'Particles', ru: 'Частиц', es: 'Partículas',
    pt: 'Partículas', de: 'Teilchen', fr: 'Particules',
    zh: '粒子数', ar: 'الجسيمات',
  },
  lost: {
    en: 'Lost', ru: 'Потеряно', es: 'Perdidas',
    pt: 'Perdidas', de: 'Verloren', fr: 'Perdues',
    zh: '丢失', ar: 'مفقود',
  },
  fringes: {
    en: 'Fringes', ru: 'Полос', es: 'Franjas',
    pt: 'Franjas', de: 'Streifen', fr: 'Franges',
    zh: '条纹数', ar: 'الأهداب',
  },
  contrast: {
    en: 'Contrast', ru: 'Контраст', es: 'Contraste',
    pt: 'Contraste', de: 'Kontrast', fr: 'Contraste',
    zh: '对比度', ar: 'التباين',
  },
  pattern: {
    en: 'Pattern', ru: 'Паттерн', es: 'Patrón',
    pt: 'Padrão', de: 'Muster', fr: 'Motif',
    zh: '图样', ar: 'النمط',
  },
  tooltips: {
    distribution: {
      en: 'Histogram shows how many particles hit each screen zone. Bar height = hit count. This is cumulative data.',
      ru: 'Гистограмма показывает, сколько частиц попало в каждую зону экрана. Высота столбца = количество попаданий.',
      es: 'El histograma muestra cuántas partículas impactaron en cada zona. Altura = número de impactos.',
      pt: 'O histograma mostra quantas partículas atingiram cada zona. Altura = número de impactos.',
      de: 'Das Histogramm zeigt, wie viele Teilchen jeden Bereich trafen. Höhe = Trefferanzahl.',
      fr: 'L\'histogramme montre combien de particules ont touché chaque zone. Hauteur = nombre d\'impacts.',
      zh: '直方图显示每个屏幕区域的粒子撞击数量。高度=命中次数。',
      ar: 'يوضح المدرج التكراري عدد الجسيمات التي أصابت كل منطقة. الارتفاع = عدد الإصابات.',
    },
    particles: {
      en: 'Total particles that reached the screen since start or reset.',
      ru: 'Общее количество частиц, долетевших до экрана с момента запуска или сброса.',
      es: 'Partículas totales que llegaron a la pantalla desde el inicio.',
      pt: 'Partículas totais que atingiram a tela desde o início.',
      de: 'Gesamtzahl der Teilchen, die den Schirm seit Start erreicht haben.',
      fr: 'Particules totales ayant atteint l\'écran depuis le début.',
      zh: '自启动以来到达屏幕的粒子总数。',
      ar: 'إجمالي الجسيمات التي وصلت إلى الشاشة منذ البدء.',
    },
    fringes: {
      en: 'Number of peaks (maxima) in histogram. A peak is a high-hit zone surrounded by lower-hit zones.',
      ru: 'Количество пиков (максимумов) в гистограмме. Пик — это зона с большим количеством попаданий.',
      es: 'Número de picos (máximos) en el histograma. Un pico es una zona de muchos impactos.',
      pt: 'Número de picos (máximos) no histograma. Um pico é uma zona de muitos impactos.',
      de: 'Anzahl der Peaks (Maxima) im Histogramm. Ein Peak ist eine Zone mit vielen Treffern.',
      fr: 'Nombre de pics (maxima) dans l\'histogramme. Un pic est une zone de nombreux impacts.',
      zh: '直方图中峰值（最大值）的数量。峰值是被较低区域包围的高命中区域。',
      ar: 'عدد القمم (الحد الأقصى) في المدرج التكراري. القمة هي منطقة ذات إصابات عالية.',
    },
    contrast: {
      en: 'Contrast = (max - min) / (max + min). Shows how clearly bright and dark bands are separated. 100% = perfect interference.',
      ru: 'Контраст = (макс - мин) / (макс + мин). Показывает, насколько чётко разделены полосы. 100% = идеальная интерференция.',
      es: 'Contraste = (máx - mín) / (máx + mín). Muestra la separación entre bandas. 100% = interferencia perfecta.',
      pt: 'Contraste = (máx - mín) / (máx + mín). Mostra a separação entre faixas. 100% = interferência perfeita.',
      de: 'Kontrast = (max - min) / (max + min). Zeigt die Trennung der Streifen. 100% = perfekte Interferenz.',
      fr: 'Contraste = (max - min) / (max + min). Montre la séparation des bandes. 100% = interférence parfaite.',
      zh: '对比度 = (最大 - 最小) / (最大 + 最小)。显示明暗条带的分离程度。100% = 完美干涉。',
      ar: 'التباين = (الحد الأقصى - الحد الأدنى) / (الحد الأقصى + الحد الأدنى). 100% = تداخل مثالي.',
    },
  },
  patternQuality: {
    waiting: {
      label: { en: '⏳ Waiting for data...', ru: '⏳ Ожидание данных...', es: '⏳ Esperando datos...', pt: '⏳ Aguardando dados...', de: '⏳ Warten auf Daten...', fr: '⏳ En attente...', zh: '⏳ 等待数据...', ar: '⏳ في انتظار البيانات...' },
      description: { en: 'Need more particles to analyze (min. 30)', ru: 'Нужно больше частиц для анализа (мин. 30)', es: 'Necesita más partículas (mín. 30)', pt: 'Precisa mais partículas (mín. 30)', de: 'Mehr Teilchen nötig (min. 30)', fr: 'Plus de particules nécessaires (min. 30)', zh: '需要更多粒子来分析（最少30个）', ar: 'تحتاج المزيد من الجسيمات (الحد الأدنى 30)' },
    },
    collecting: {
      label: { en: '📊 Collecting statistics', ru: '📊 Накопление статистики', es: '📊 Recopilando estadísticas', pt: '📊 Coletando estatísticas', de: '📊 Statistik sammeln', fr: '📊 Collecte de statistiques', zh: '📊 收集统计数据', ar: '📊 جمع الإحصائيات' },
      description: { en: 'Pattern is forming, continue observation', ru: 'Паттерн формируется, продолжайте наблюдение', es: 'El patrón se está formando, continúe observando', pt: 'O padrão está se formando, continue observando', de: 'Muster bildet sich, weiter beobachten', fr: 'Le motif se forme, continuez l\'observation', zh: '图样正在形成，继续观察', ar: 'النمط يتشكل، استمر في المراقبة' },
    },
    classical: {
      label: { en: '📍 Classical pattern', ru: '📍 Классический паттерн', es: '📍 Patrón clásico', pt: '📍 Padrão clássico', de: '📍 Klassisches Muster', fr: '📍 Motif classique', zh: '📍 经典图样', ar: '📍 نمط كلاسيكي' },
      description: { en: 'Detector ON — particles behave as balls, no interference', ru: 'Детектор включён — частицы ведут себя как шарики, интерференции нет', es: 'Detector ON — las partículas se comportan como bolas, sin interferencia', pt: 'Detector LIGADO — partículas se comportam como bolas, sem interferência', de: 'Detektor AN — Teilchen verhalten sich wie Kugeln, keine Interferenz', fr: 'Détecteur ON — les particules se comportent comme des billes, pas d\'interférence', zh: '探测器开启——粒子表现为球体，无干涉', ar: 'الكاشف مفعّل — الجسيمات تتصرف كالكرات، لا يوجد تداخل' },
    },
    excellent: {
      label: { en: '🌟 Excellent interference!', ru: '🌟 Отличная интерференция!', es: '🌟 ¡Excelente interferencia!', pt: '🌟 Interferência excelente!', de: '🌟 Ausgezeichnete Interferenz!', fr: '🌟 Excellente interférence!', zh: '🌟 出色的干涉！', ar: '🌟 تداخل ممتاز!' },
      description: { en: 'Clear quantum pattern', ru: 'Чёткий квантовый паттерн', es: 'Patrón cuántico claro', pt: 'Padrão quântico claro', de: 'Klares Quantenmuster', fr: 'Motif quantique clair', zh: '清晰的量子图样', ar: 'نمط كمي واضح' },
    },
    good: {
      label: { en: '✓ Good interference', ru: '✓ Хорошая интерференция', es: '✓ Buena interferencia', pt: '✓ Boa interferência', de: '✓ Gute Interferenz', fr: '✓ Bonne interférence', zh: '✓ 良好的干涉', ar: '✓ تداخل جيد' },
      description: { en: 'Interference pattern visible. Try adjusting parameters', ru: 'Интерференционная картина видна. Попробуйте настроить параметры', es: 'Patrón de interferencia visible. Intente ajustar parámetros', pt: 'Padrão de interferência visível. Tente ajustar parâmetros', de: 'Interferenzmuster sichtbar. Versuchen Sie Parameter anzupassen', fr: 'Motif d\'interférence visible. Essayez d\'ajuster les paramètres', zh: '可见干涉图样。尝试调整参数', ar: 'نمط التداخل مرئي. حاول ضبط المعلمات' },
    },
    forming: {
      label: { en: '🔄 Pattern forming', ru: '🔄 Формирование паттерна', es: '🔄 Formando patrón', pt: '🔄 Formando padrão', de: '🔄 Muster bildet sich', fr: '🔄 Formation du motif', zh: '🔄 图样形成中', ar: '🔄 تشكيل النمط' },
      description: { en: 'Weak interference. Collect more particles or adjust parameters', ru: 'Слабая интерференция. Соберите больше частиц или настройте параметры', es: 'Interferencia débil. Recoja más partículas o ajuste parámetros', pt: 'Interferência fraca. Colete mais partículas ou ajuste parâmetros', de: 'Schwache Interferenz. Mehr Teilchen sammeln oder Parameter anpassen', fr: 'Interférence faible. Collectez plus de particules ou ajustez les paramètres', zh: '干涉较弱。收集更多粒子或调整参数', ar: 'تداخل ضعيف. اجمع المزيد من الجسيمات أو اضبط المعلمات' },
    },
  },
  modeDescription: {
    quantum: {
      en: '🌊 Quantum Mode: Photons pass through BOTH slits simultaneously as probability waves, creating interference pattern.',
      ru: '🌊 Квантовый режим: Фотоны проходят через ОБЕ щели одновременно как волны вероятности, создавая интерференционную картину.',
      es: '🌊 Modo Cuántico: Los fotones pasan por AMBAS rendijas simultáneamente como ondas de probabilidad.',
      pt: '🌊 Modo Quântico: Os fótons passam por AMBAS as fendas simultaneamente como ondas de probabilidade.',
      de: '🌊 Quantenmodus: Photonen passieren BEIDE Spalte gleichzeitig als Wahrscheinlichkeitswellen.',
      fr: '🌊 Mode Quantique: Les photons passent par LES DEUX fentes simultanément comme ondes de probabilité.',
      zh: '🌊 量子模式：光子同时以概率波的形式通过两条狭缝，产生干涉图样。',
      ar: '🌊 الوضع الكمي: تمر الفوتونات عبر كلا الشقين في وقت واحد كموجات احتمالية.',
    },
    observer: {
      en: '👁️ Observer Mode: Measurement collapses the wave function. Each photon goes through ONE slit only — no interference.',
      ru: '👁️ Режим наблюдателя: Измерение коллапсирует волновую функцию. Каждый фотон проходит через ОДНУ щель — интерференции нет.',
      es: '👁️ Modo Observador: La medición colapsa la función de onda. Cada fotón pasa por UNA sola rendija.',
      pt: '👁️ Modo Observador: A medição colapsa a função de onda. Cada fóton passa por UMA fenda apenas.',
      de: '👁️ Beobachtermodus: Die Messung kollabiert die Wellenfunktion. Jedes Photon geht durch EINEN Spalt.',
      fr: '👁️ Mode Observateur: La mesure effondre la fonction d\'onde. Chaque photon passe par UNE seule fente.',
      zh: '👁️ 观察者模式：测量导致波函数坍缩。每个光子只通过一条狭缝——无干涉。',
      ar: '👁️ وضع المراقب: القياس يُسقط دالة الموجة. كل فوتون يمر عبر شق واحد فقط — لا يوجد تداخل.',
    },
  },
  // Quantum statistics section
  quantumStats: {
    title: {
      en: '🎲 Statistical Confidence', ru: '🎲 Статистическая достоверность', 
      es: '🎲 Confianza Estadística', pt: '🎲 Confiança Estatística',
      de: '🎲 Statistische Konfidenz', fr: '🎲 Confiance Statistique',
      zh: '🎲 统计置信度', ar: '🎲 الثقة الإحصائية',
    },
    confidence: {
      en: 'Confidence', ru: 'Достоверность', es: 'Confianza', pt: 'Confiança',
      de: 'Konfidenz', fr: 'Confiance', zh: '置信度', ar: 'الثقة',
    },
    errorMargin: {
      en: 'Error margin', ru: 'Погрешность', es: 'Margen de error', pt: 'Margem de erro',
      de: 'Fehlermarge', fr: 'Marge d\'erreur', zh: '误差幅度', ar: 'هامش الخطأ',
    },
    stdError: {
      en: 'σ/√N', ru: 'σ/√N', es: 'σ/√N', pt: 'σ/√N',
      de: 'σ/√N', fr: 'σ/√N', zh: 'σ/√N', ar: 'σ/√N',
    },
    quantumNote: {
      en: '📐 Quantum statistics: Pattern forms probabilistically. Wave function |Ψ|² gives probability density. Low N → high variance is normal!',
      ru: '📐 Квантовая статистика: Паттерн формируется вероятностно. |Ψ|² — плотность вероятности. Малое N → высокая дисперсия — это нормально!',
      es: '📐 Estadística cuántica: El patrón se forma probabilísticamente. |Ψ|² = densidad de probabilidad. N bajo → alta varianza es normal.',
      pt: '📐 Estatística quântica: O padrão se forma probabilisticamente. |Ψ|² = densidade de probabilidade. N baixo → alta variância é normal.',
      de: '📐 Quantenstatistik: Muster bildet sich probabilistisch. |Ψ|² = Wahrscheinlichkeitsdichte. Niedriges N → hohe Varianz ist normal!',
      fr: '📐 Statistique quantique: Le motif se forme de manière probabiliste. |Ψ|² = densité de probabilité. N faible → variance élevée est normal!',
      zh: '📐 量子统计：图样概率性形成。|Ψ|² 给出概率密度。N小 → 高方差是正常的！',
      ar: '📐 إحصائيات كمية: النمط يتشكل احتماليًا. |Ψ|² = كثافة الاحتمال. N منخفض ← التباين العالي طبيعي!',
    },
    tooltipConfidence: {
      en: 'Statistical confidence based on particle count. Formula: 1 - 1/√N. More particles = more reliable pattern. At N=100: 90%, at N=1000: 97%.',
      ru: 'Статистическая достоверность на основе числа частиц. Формула: 1 - 1/√N. Больше частиц = надёжнее паттерн. При N=100: 90%, при N=1000: 97%.',
      es: 'Confianza estadística basada en el conteo de partículas. Fórmula: 1 - 1/√N. Más partículas = patrón más confiable.',
      pt: 'Confiança estatística baseada na contagem de partículas. Fórmula: 1 - 1/√N. Mais partículas = padrão mais confiável.',
      de: 'Statistische Konfidenz basierend auf Teilchenzahl. Formel: 1 - 1/√N. Mehr Teilchen = zuverlässigeres Muster.',
      fr: 'Confiance statistique basée sur le nombre de particules. Formule: 1 - 1/√N. Plus de particules = motif plus fiable.',
      zh: '基于粒子数的统计置信度。公式：1 - 1/√N。更多粒子 = 更可靠的图样。',
      ar: 'الثقة الإحصائية بناءً على عدد الجسيمات. الصيغة: 1 - 1/√N. المزيد من الجسيمات = نمط أكثر موثوقية.',
    },
  },
};

// Tooltip component
function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  
  return (
    <div className="relative inline-block">
      <div 
        onMouseEnter={() => setShow(true)} 
        onMouseLeave={() => setShow(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 border border-slate-600 rounded-lg text-xs text-slate-200 shadow-xl z-50">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800" />
        </div>
      )}
    </div>
  );
}

export function StatsPanel({ stats, observerOn, mode }: StatsPanelProps) {
  const { language } = useLanguage();
  
  const getText = (obj: Record<string, string>) => obj[language] || obj.en;
  
  // Handle null stats
  if (!stats) {
    return (
      <div className="bg-slate-800/90 backdrop-blur rounded-xl p-3 border border-slate-700">
        <h3 className="text-sm font-medium text-white mb-2">{getText(TEXTS.title)}</h3>
        <p className="text-xs text-gray-400">{getText(TEXTS.loading)}</p>
      </div>
    );
  }
  
  const { totalParticles, lostParticles = 0, fringeCount, contrast, histogram } = stats;

  const histogramBars = useMemo(() => {
    const maxVal = Math.max(...histogram, 1);
    return histogram.map((val, i) => ({
      height: (val / maxVal) * 100,
      key: i,
    }));
  }, [histogram]);

  const contrastPercent = Math.round(contrast * 100);
  
  const patternQuality = useMemo(() => {
    if (totalParticles < 30) {
      return { 
        label: getText(TEXTS.patternQuality.waiting.label),
        description: getText(TEXTS.patternQuality.waiting.description),
        color: 'text-indigo-400' 
      };
    }
    if (totalParticles < 100) {
      return { 
        label: getText(TEXTS.patternQuality.collecting.label),
        description: getText(TEXTS.patternQuality.collecting.description),
        color: 'text-yellow-400' 
      };
    }
    if (observerOn) {
      return { 
        label: getText(TEXTS.patternQuality.classical.label),
        description: getText(TEXTS.patternQuality.classical.description),
        color: 'text-orange-400' 
      };
    }
    if (fringeCount >= 5 && contrast > 0.5) {
      return { 
        label: getText(TEXTS.patternQuality.excellent.label),
        description: `${getText(TEXTS.patternQuality.excellent.description)}: ${fringeCount} @ ${contrastPercent}%`,
        color: 'text-green-400' 
      };
    }
    if (fringeCount >= 3 && contrast > 0.3) {
      return { 
        label: getText(TEXTS.patternQuality.good.label),
        description: getText(TEXTS.patternQuality.good.description),
        color: 'text-cyan-400' 
      };
    }
    return { 
      label: getText(TEXTS.patternQuality.forming.label),
      description: getText(TEXTS.patternQuality.forming.description),
      color: 'text-blue-400' 
    };
  }, [totalParticles, fringeCount, contrast, observerOn, language, contrastPercent]);

  return (
    <div className="bg-indigo-900/60 backdrop-blur-md rounded-xl p-4 space-y-4 shadow-lg border border-indigo-500/30">
      <h3 className="text-lg font-semibold text-white">{getText(TEXTS.title)}</h3>

      {/* Histogram */}
      <div className="bg-indigo-800/40 rounded-lg p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-xs text-indigo-300">{getText(TEXTS.distribution)}</span>
          <Tooltip text={getText(TEXTS.tooltips.distribution)}>
            <Info size={12} className="text-indigo-400 hover:text-indigo-200" />
          </Tooltip>
        </div>
        <div className="flex items-end gap-px h-16 bg-indigo-950/50 rounded p-1">
          {histogramBars.map(({ height, key }) => (
            <div
              key={key}
              className={`flex-1 rounded-t transition-all duration-150 ${
                observerOn ? 'bg-orange-400/80' : 'bg-cyan-400/80'
              }`}
              style={{ height: `${Math.max(2, height)}%` }}
            />
          ))}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-indigo-800/40 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-white">{totalParticles}</div>
          <div className="flex items-center justify-center gap-1">
            <span className="text-xs text-indigo-300">{getText(TEXTS.particles)}</span>
            <Tooltip text={getText(TEXTS.tooltips.particles)}>
              <Info size={10} className="text-indigo-400 hover:text-indigo-200" />
            </Tooltip>
          </div>
          {/* Lost particles indicator */}
          {lostParticles > 0 && (
            <div className="text-[10px] text-rose-400 mt-1">
              -{lostParticles} {getText(TEXTS.lost)}
            </div>
          )}
        </div>
        
        <div className="bg-indigo-800/40 rounded-lg p-3 text-center">
          <div className={`text-2xl font-bold ${observerOn ? 'text-orange-400' : 'text-cyan-400'}`}>
            {fringeCount}
          </div>
          <div className="flex items-center justify-center gap-1">
            <span className="text-xs text-indigo-300">{getText(TEXTS.fringes)}</span>
            <Tooltip text={getText(TEXTS.tooltips.fringes)}>
              <Info size={10} className="text-indigo-400 hover:text-indigo-200" />
            </Tooltip>
          </div>
        </div>
        
        <div className="bg-indigo-800/40 rounded-lg p-3 text-center col-span-2">
          <div className="flex items-center justify-center gap-2">
            <div className="text-xl font-bold text-white">{contrastPercent}%</div>
            <div className="flex-1 bg-indigo-700 rounded-full h-2.5 max-w-24">
              <div 
                className={`h-full rounded-full transition-all ${
                  observerOn ? 'bg-orange-500' : 'bg-cyan-500'
                }`}
                style={{ width: `${contrastPercent}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-center gap-1">
            <span className="text-xs text-indigo-300">{getText(TEXTS.contrast)}</span>
            <Tooltip text={getText(TEXTS.tooltips.contrast)}>
              <Info size={10} className="text-indigo-400 hover:text-indigo-200" />
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Pattern quality */}
      <div className="bg-indigo-800/30 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm text-indigo-300">{getText(TEXTS.pattern)}:</span>
          <span className={`text-sm font-medium ${patternQuality.color}`}>
            {patternQuality.label}
          </span>
        </div>
        <p className="text-xs text-indigo-400 leading-relaxed">
          {patternQuality.description}
        </p>
      </div>

      {/* Statistical Confidence Section */}
      <div className="bg-purple-900/30 rounded-lg p-3 border border-purple-500/20">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-xs font-medium text-purple-300">{getText(TEXTS.quantumStats.title)}</span>
          <Tooltip text={getText(TEXTS.quantumStats.tooltipConfidence)}>
            <Info size={12} className="text-purple-400 hover:text-purple-200" />
          </Tooltip>
        </div>
        
        {/* Confidence meter */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-purple-400">{getText(TEXTS.quantumStats.confidence)}:</span>
          <div className="flex-1 bg-purple-950/50 rounded-full h-2">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                totalParticles < 30 ? 'bg-red-500' :
                totalParticles < 100 ? 'bg-yellow-500' :
                totalParticles < 500 ? 'bg-green-500' : 'bg-cyan-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, (1 - 1/Math.sqrt(Math.max(1, totalParticles))) * 100))}%` }}
            />
          </div>
          <span className="text-sm font-mono text-purple-200">
            {totalParticles > 0 ? `${Math.round((1 - 1/Math.sqrt(totalParticles)) * 100)}%` : '0%'}
          </span>
        </div>
        
        {/* Error margin */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-purple-400">{getText(TEXTS.quantumStats.errorMargin)} ({getText(TEXTS.quantumStats.stdError)}):</span>
          <span className="font-mono text-purple-200">
            ±{totalParticles > 0 ? (100 / Math.sqrt(totalParticles)).toFixed(1) : '∞'}%
          </span>
        </div>
        
        {/* Quantum note - show when few particles */}
        {totalParticles < 200 && (
          <div className="mt-2 p-2 bg-purple-950/50 rounded text-[10px] text-purple-300 leading-relaxed">
            {getText(TEXTS.quantumStats.quantumNote)}
          </div>
        )}
      </div>

      {/* Mode description */}
      <div className={`text-xs p-3 rounded-lg ${
        observerOn 
          ? 'bg-orange-500/20 text-orange-200 border border-orange-500/30' 
          : 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/30'
      }`}>
        {observerOn ? getText(TEXTS.modeDescription.observer) : getText(TEXTS.modeDescription.quantum)}
      </div>
    </div>
  );
}
