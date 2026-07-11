"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type PointerEvent as ReactPointerEvent } from "react";
import {
  categoryLabels,
  cookingElements,
  defaultSelection,
  defaultUser,
  dishes,
  getDishById,
  initialChallenges,
  type AdventureLevel,
  type CookingLog,
  type Dish,
  type ElementCategory,
  type User,
} from "./recipe-data";
import TetraTestScreen from "./tetra-test";

type Screen = "home" | "tetra" | "explore" | "record" | "taste";
type Overlay = "detail" | "record" | "pro" | null;
type RecordDraft = Pick<CookingLog, "rating" | "wantToCookAgain" | "difficultyRating" | "familyReaction" | "memo">;

const categoryOrder: ElementCategory[] = ["food", "method", "seasoning", "texture"];
type CanonicalVertex = "fire" | "water" | "air" | "oil";

const canonicalOrder: CanonicalVertex[] = ["fire", "water", "air", "oil"];
const canonicalVertexLabels: Record<CanonicalVertex, string> = {
  fire: "火",
  water: "水",
  air: "空気",
  oil: "油",
};
const canonicalVertexDescriptions: Record<CanonicalVertex, string> = {
  fire: "焼く・炒める。乾いた熱で香ばしさをつくる軸",
  water: "煮る・蒸す・浸す。水分で味をなじませる軸",
  air: "生・乾かす・泡立てる。軽さと余白をつくる軸",
  oil: "揚げる・乳化する・香りを運ぶ。油脂の軸",
};
const canonicalLensByVertex: Record<CanonicalVertex, ElementCategory> = {
  fire: "method",
  water: "method",
  air: "texture",
  oil: "seasoning",
};

type TetraScore = Record<CanonicalVertex, number>;

const defaultTetraScore: TetraScore = { fire: 0.34, water: 0.28, air: 0.18, oil: 0.2 };
const methodTetraProfiles: Record<string, TetraScore> = {
  grill: { fire: 0.78, water: 0.02, air: 0.04, oil: 0.16 },
  stir: { fire: 0.58, water: 0.03, air: 0.07, oil: 0.32 },
  simmer: { fire: 0.12, water: 0.72, air: 0.03, oil: 0.13 },
  steam: { fire: 0.08, water: 0.76, air: 0.1, oil: 0.06 },
  fry: { fire: 0.12, water: 0.02, air: 0.05, oil: 0.81 },
  raw: { fire: 0, water: 0.1, air: 0.75, oil: 0.15 },
};
const textureTetraProfiles: Record<string, TetraScore> = {
  roasty: { fire: 0.68, water: 0.02, air: 0.08, oil: 0.22 },
  fresh: { fire: 0.02, water: 0.12, air: 0.7, oil: 0.16 },
  rich: { fire: 0.12, water: 0.34, air: 0.04, oil: 0.5 },
  crunchy: { fire: 0.18, water: 0.02, air: 0.1, oil: 0.7 },
  fluffy: { fire: 0.3, water: 0.08, air: 0.5, oil: 0.12 },
  moist: { fire: 0.08, water: 0.54, air: 0.08, oil: 0.3 },
};
const seasoningTetraProfiles: Record<string, TetraScore> = {
  salt: { fire: 0.2, water: 0.34, air: 0.24, oil: 0.22 },
  "sweet-savory": { fire: 0.28, water: 0.24, air: 0.04, oil: 0.44 },
  sour: { fire: 0.08, water: 0.18, air: 0.54, oil: 0.2 },
  spicy: { fire: 0.3, water: 0.16, air: 0.08, oil: 0.46 },
  umami: { fire: 0.18, water: 0.42, air: 0.12, oil: 0.28 },
  spice: { fire: 0.3, water: 0.1, air: 0.14, oil: 0.46 },
};
const foodTetraProfiles: Record<string, TetraScore> = {
  chicken: { fire: 0.4, water: 0.22, air: 0.08, oil: 0.3 },
  pork: { fire: 0.3, water: 0.1, air: 0.04, oil: 0.56 },
  fish: { fire: 0.12, water: 0.3, air: 0.42, oil: 0.16 },
  tofu: { fire: 0.06, water: 0.46, air: 0.34, oil: 0.14 },
  egg: { fire: 0.2, water: 0.2, air: 0.46, oil: 0.14 },
  mushroom: { fire: 0.18, water: 0.38, air: 0.24, oil: 0.2 },
  eggplant: { fire: 0.16, water: 0.28, air: 0.08, oil: 0.48 },
  potato: { fire: 0.28, water: 0.36, air: 0.08, oil: 0.28 },
};

function normalizeTetraScore(score: TetraScore): TetraScore {
  const total = canonicalOrder.reduce((sum, vertex) => sum + score[vertex], 0) || 1;
  return canonicalOrder.reduce((normalized, vertex) => {
    normalized[vertex] = score[vertex] / total;
    return normalized;
  }, {} as TetraScore);
}

function blendTetraProfiles(profiles: Array<[TetraScore, number]>): TetraScore {
  const score: TetraScore = { fire: 0, water: 0, air: 0, oil: 0 };
  profiles.forEach(([profile, weight]) => {
    canonicalOrder.forEach((vertex) => { score[vertex] += profile[vertex] * weight; });
  });
  return normalizeTetraScore(score);
}

function tetraScoreForDish(dish: Dish): TetraScore {
  return blendTetraProfiles([
    [methodTetraProfiles[dish.cookingMethodElement] ?? defaultTetraScore, 0.58],
    [textureTetraProfiles[dish.textureElement] ?? defaultTetraScore, 0.18],
    [seasoningTetraProfiles[dish.seasoningElement] ?? defaultTetraScore, 0.16],
    [foodTetraProfiles[dish.foodElement] ?? defaultTetraScore, 0.08],
  ]);
}

function averageTetraScores(scores: TetraScore[]): TetraScore | null {
  if (scores.length === 0) return null;
  const total: TetraScore = { fire: 0, water: 0, air: 0, oil: 0 };
  scores.forEach((score) => canonicalOrder.forEach((vertex) => { total[vertex] += score[vertex]; }));
  return normalizeTetraScore(total);
}

function tasteScoreFromLogs(logs: CookingLog[]): TetraScore | null {
  if (logs.length === 0) return null;
  const weighted: TetraScore = { fire: 0, water: 0, air: 0, oil: 0 };
  let weightTotal = 0;
  logs.forEach((log) => {
    const dish = getDishById(log.dishId);
    const weight = Math.max(1, log.rating) + (log.wantToCookAgain >= 4 ? 0.75 : 0);
    const score = tetraScoreForDish(dish);
    canonicalOrder.forEach((vertex) => { weighted[vertex] += score[vertex] * weight; });
    weightTotal += weight;
  });
  return normalizeTetraScore(weightTotal ? weighted : defaultTetraScore);
}

function tetraPositionSummary(score: TetraScore): string {
  const ranked = [...canonicalOrder].sort((a, b) => score[b] - score[a]);
  const top = ranked[0];
  const second = ranked[1];
  if (score[top] >= 0.62) return `ほぼ${canonicalVertexLabels[top]}の頂点に近い、純度の高い料理。`;
  if (score[top] - score[second] < 0.13) return `${canonicalVertexLabels[top]}と${canonicalVertexLabels[second]}の間で釣り合う、混合の料理。`;
  return `${canonicalVertexLabels[top]}を主軸に、${canonicalVertexLabels[second]}が支える構図。`;
}

function tetraScoreToPoint(score: TetraScore): TetraPoint {
  return canonicalOrder.reduce((point, vertex, index) => ({
    x: point.x + tetraPoints[index].x * score[vertex],
    y: point.y + tetraPoints[index].y * score[vertex],
    z: point.z + tetraPoints[index].z * score[vertex],
  }), { x: 0, y: 0, z: 0 });
}

function mixTetraColor(score: TetraScore): string {
  const rgb: Record<CanonicalVertex, [number, number, number]> = {
    fire: [181, 74, 47],
    water: [53, 96, 143],
    air: [78, 122, 63],
    oil: [168, 120, 28],
  };
  const mixed = canonicalOrder.reduce((result, vertex) => {
    result[0] += rgb[vertex][0] * score[vertex];
    result[1] += rgb[vertex][1] * score[vertex];
    result[2] += rgb[vertex][2] * score[vertex];
    return result;
  }, [0, 0, 0]);
  return `rgb(${mixed.map((value) => Math.round(value)).join(",")})`;
}

function radarClipPath(score: TetraScore): string {
  const values = [score.fire, score.water, score.air, score.oil];
  const points = values.map((value, index) => {
    const radius = 11 + value * 38;
    if (index === 0) return `50% ${50 - radius}%`;
    if (index === 1) return `${50 + radius}% 50%`;
    if (index === 2) return `50% ${50 + radius}%`;
    return `${50 - radius}% 50%`;
  });
  return `polygon(${points.join(", ")})`;
}

const onboardingSlides = [
  {
    eyebrow: "RYORI / 01",
    title: "料理は、\n組み合わせから生まれる",
    body: "冷蔵庫にある食材と、今日の気分を選ぶだけ。いつもの食材から、まだ知らない一皿を見つけます。",
    visual: "orbit",
  },
  {
    eyebrow: "RYORI / 02",
    title: "まず目的を選び、\n必要なら地図を見る",
    body: "食材や気分から料理を探せます。候補が出たあと、四面体で料理同士の近さや、味が変わる方向を見られます。",
    visual: "tetra",
  },
  {
    eyebrow: "RYORI / 03",
    title: "作るほど、\n味覚マップが育つ",
    body: "保存や記録が、あなたの好きな方向を発見する小さな手がかりになります。",
    visual: "map",
  },
];

const adventureDescriptions: Record<AdventureLevel, string> = {
  定番: "いつもの食卓に、安心のひらめき",
  "ちょっと冒険": "少しだけ遠くへ、味の軸をずらす",
  意外: "まだ知らない相性を、試してみる",
};

type GuideMode = "ingredient" | "transform";

type GuideFeeling = {
  id: string;
  label: string;
  description: string;
  target: Partial<Record<ElementCategory, string>>;
};

type GuideShift = {
  id: string;
  label: string;
  description: string;
  target: Partial<Record<ElementCategory, string>>;
};

const guideFeelings: GuideFeeling[] = [
  { id: "light", label: "軽く食べたい", description: "水分を残し、酸味や香りで後味を軽く", target: { method: "steam", seasoning: "sour", texture: "fresh" } },
  { id: "roasty", label: "香ばしくしたい", description: "乾いた熱で焼き目と香りをつくる", target: { method: "grill", texture: "roasty" } },
  { id: "warm", label: "温かいものがいい", description: "煮る・蒸すで、ほっとする一皿に", target: { method: "simmer", seasoning: "umami", texture: "moist" } },
  { id: "adventurous", label: "少し冒険したい", description: "スパイスや辛味で、いつもと違う方向へ", target: { seasoning: "spice", texture: "rich" } },
];

const guideTimes = ["15分以内", "30分以内", "時間は気にしない"] as const;

const familiarDishOptions = [
  { id: "potato-salad", name: "ポテトサラダ", food: "potato", description: "じゃがいもがある日の定番" },
  { id: "ginger-pork", name: "豚の生姜焼き", food: "pork", description: "ごはんに合う、いつもの主菜" },
  { id: "cold-tofu", name: "冷ややっこ", food: "tofu", description: "豆腐をそのまま食べる定番" },
  { id: "salt-grilled-fish", name: "魚の塩焼き", food: "fish", description: "魚をシンプルに焼く一皿" },
];

const guideShifts: GuideShift[] = [
  { id: "roasty", label: "もっと香ばしく", description: "焼き目や乾いた熱を足す", target: { method: "grill", texture: "roasty" } },
  { id: "light", label: "もっと軽く", description: "水分と酸味で後味を整える", target: { method: "steam", seasoning: "sour", texture: "fresh" } },
  { id: "warm", label: "もっと温かく", description: "煮る方向へ動かして、汁気を足す", target: { method: "simmer", seasoning: "umami", texture: "moist" } },
  { id: "rich", label: "もっとコクを出す", description: "油分とうま味で満足感を足す", target: { seasoning: "umami", texture: "rich" } },
  { id: "spicy", label: "辛さを加える", description: "刺激と香りを一段重ねる", target: { seasoning: "spicy", texture: "roasty" } },
  { id: "soup", label: "汁物にする", description: "水分を中心に、別の形へ変える", target: { method: "simmer", seasoning: "umami", texture: "moist" } },
];

type ExplorationTheme = {
  id: string;
  period: string;
  title: string;
  prompt: string;
  description: string;
  focus: CanonicalVertex;
  selection: Record<ElementCategory, string>;
};

const explorationThemes: ExplorationTheme[] = [
  {
    id: "same-food-different-heat",
    period: "今週のテーマ",
    title: "同じ食材を、熱のかけ方で変える",
    prompt: "鶏肉を、蒸す料理から焼く料理へ。",
    description: "水分を残す方向と、香ばしさを足す方向を比べてみます。",
    focus: "fire",
    selection: { food: "chicken", method: "grill", seasoning: "sour", texture: "roasty" },
  },
  {
    id: "one-food-three-textures",
    period: "次のテーマ",
    title: "ひとつの食材で、食感を3つ試す",
    prompt: "じゃがいもを、ほくほく・しっとり・カリカリに。",
    description: "同じ素材でも、最後の食感が料理の印象を変えます。",
    focus: "air",
    selection: { food: "potato", method: "fry", seasoning: "salt", texture: "crunchy" },
  },
];

function minutesFromLabel(value: string) {
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : Infinity;
}

function guideIngredientResults(food: string, feelingId: string, time: typeof guideTimes[number]) {
  const feeling = guideFeelings.find((item) => item.id === feelingId) ?? guideFeelings[0];
  const target = { ...defaultSelection, food, ...feeling.target };
  const ranked = rankDishes(target);
  if (time === "時間は気にしない") return ranked.slice(0, 3);
  const limit = time === "15分以内" ? 15 : 30;
  const withinTime = ranked.filter((dish) => minutesFromLabel(dish.cookingTime) <= limit);
  return (withinTime.length >= 3 ? withinTime : ranked).slice(0, 3);
}

function guideTransformResults(food: string, shiftId: string) {
  const shift = guideShifts.find((item) => item.id === shiftId) ?? guideShifts[0];
  return rankDishes({ ...defaultSelection, food, ...shift.target }).slice(0, 3);
}

function rankDishes(selection: Record<ElementCategory, string>, level?: AdventureLevel) {
  return dishes
    .map((dish) => {
      const score = categoryOrder.reduce(
        (total, category) =>
          total + ((dish[`${category === "food" ? "food" : category === "method" ? "cookingMethod" : category === "seasoning" ? "seasoning" : "texture"}Element`] as string) === selection[category] ? 1 : 0),
        0,
      );
      return {
        dish,
        score: score + (level && dish.adventureLevel === level ? 1.5 : 0),
      };
    })
    .sort((a, b) => b.score - a.score)
    .map(({ dish }) => dish);
}

function storageRead<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function Home() {
  const hydrated = useSyncExternalStore(() => () => undefined, () => true, () => false);
  const [screen, setScreen] = useState<Screen>("home");
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [user, setUser] = useState<User>(() => typeof window === "undefined" ? defaultUser : storageRead("ryori-user", defaultUser));
  const [selection, setSelection] = useState(() => typeof window === "undefined" ? defaultSelection : storageRead("ryori-selection", defaultSelection));
  const [dailyLevel, setDailyLevel] = useState<AdventureLevel>("定番");
  const [savedDishIds, setSavedDishIds] = useState<string[]>(() => typeof window === "undefined" ? [] : storageRead("ryori-saved", []));
  const [logs, setLogs] = useState<CookingLog[]>(() => typeof window === "undefined" ? [] : storageRead("ryori-logs", []));
  const [challenges, setChallenges] = useState(() => typeof window === "undefined" ? initialChallenges : storageRead("ryori-challenges", initialChallenges));
  const [activeCategory, setActiveCategory] = useState<ElementCategory>("food");
  const [activeCanonicalVertex, setActiveCanonicalVertex] = useState<CanonicalVertex>("fire");
  const [selectedPlotDishId, setSelectedPlotDishId] = useState<string | null>(null);
  const [activeDish, setActiveDish] = useState<Dish | null>(null);
  const [whyOpen, setWhyOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [recordSaved, setRecordSaved] = useState(false);
  const [guideMode, setGuideMode] = useState<GuideMode | null>(null);
  const [rotation, setRotation] = useState({ x: 18, y: 0 });
  const [tetraAutoRotate, setTetraAutoRotate] = useState(true);
  const dragStart = useRef<{ x: number; y: number; rotationX: number; rotationY: number } | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem("ryori-user", JSON.stringify(user));
    window.localStorage.setItem("ryori-selection", JSON.stringify(selection));
    window.localStorage.setItem("ryori-saved", JSON.stringify(savedDishIds));
    window.localStorage.setItem("ryori-logs", JSON.stringify(logs));
    window.localStorage.setItem("ryori-challenges", JSON.stringify(challenges));
  }, [hydrated, user, selection, savedDishIds, logs, challenges]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    if (screen !== "tetra" || !tetraAutoRotate) return;
    const interval = window.setInterval(() => {
      setRotation((current) => ({ ...current, x: current.x + 0.32 }));
    }, 90);
    return () => window.clearInterval(interval);
  }, [screen, tetraAutoRotate]);

  const homeCandidates = useMemo(() => rankDishes(defaultSelection, dailyLevel), [dailyLevel]);
  const suggestions = useMemo(() => rankDishes(selection).slice(0, 3), [selection]);
  const savedDishes = useMemo(() => savedDishIds.map(getDishById), [savedDishIds]);
  const mapGrowth = Math.min(92, 22 + logs.length * 14 + savedDishIds.length * 3);
  const currentHomeDish = homeCandidates[0];
  const tasteScore = useMemo(() => tasteScoreFromLogs(logs), [logs]);
  const activeTheme = explorationThemes[0];

  if (!hydrated) {
    return <div className="boot-screen"><span className="boot-mark">R</span><span>味の地図をひらいています</span></div>;
  }

  const tetraTestMode = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("test") === "tetra-v2";
  if (tetraTestMode) return <TetraTestScreen />;

  if (!user.onboardingCompleted) {
    return (
      <Onboarding
        step={onboardingStep}
        onNext={() => {
          if (onboardingStep === onboardingSlides.length - 1) {
            setUser((current) => ({ ...current, onboardingCompleted: true }));
          } else {
            setOnboardingStep((current) => current + 1);
          }
        }}
        onSkip={() => setUser((current) => ({ ...current, onboardingCompleted: true }))}
      />
    );
  }

  const openDish = (dish: Dish) => {
    setActiveDish(dish);
    setOverlay("detail");
    setRecordSaved(false);
  };

  const openGuideDish = (dish: Dish) => {
    setGuideMode(null);
    openDish(dish);
  };

  const openGuideMap = (dish: Dish) => {
    setSelection({
      food: dish.foodElement,
      method: dish.cookingMethodElement,
      seasoning: dish.seasoningElement,
      texture: dish.textureElement,
    });
    setSelectedPlotDishId(dish.id);
    setGuideMode(null);
    setScreen("tetra");
    setToast("料理の地図に、今回の候補を置きました");
  };

  const applyTheme = () => {
    setSelection(activeTheme.selection);
    setActiveCanonicalVertex(activeTheme.focus);
    setActiveCategory(canonicalLensByVertex[activeTheme.focus]);
    setSelectedPlotDishId(null);
    setTetraAutoRotate(true);
    setScreen("tetra");
    setToast(`${activeTheme.period}を四面体に置きました`);
  };

  const saveDish = (dish: Dish) => {
    setSavedDishIds((current) => {
      if (current.includes(dish.id)) return current.filter((id) => id !== dish.id);
      return [...current, dish.id];
    });
    setToast(savedDishIds.includes(dish.id) ? "保存から外しました" : "料理を保存しました");
  };

  const startRecord = (dish: Dish) => {
    setActiveDish(dish);
    setOverlay("record");
    setRecordSaved(false);
  };

  const updateSelection = (category: ElementCategory, id: string) => {
    setSelection((current) => ({ ...current, [category]: id }));
    setActiveCategory(category);
    const nudgeByCategory: Record<ElementCategory, { x: number; y: number }> = {
      food: { x: 5, y: 1 },
      method: { x: 8, y: -2 },
      seasoning: { x: -4, y: 3 },
      texture: { x: 2, y: -4 },
    };
    setRotation((current) => ({
      x: current.x + nudgeByCategory[category].x,
      y: Math.max(-55, Math.min(55, current.y + nudgeByCategory[category].y)),
    }));
  };

  const randomize = (oneOnly = false) => {
    const category = oneOnly ? categoryOrder[Math.floor(Math.random() * categoryOrder.length)] : null;
    setSelection((current) => {
      const next = { ...current };
      const categories = category ? [category] : categoryOrder;
      categories.forEach((key) => {
        const options = cookingElements[key];
        const currentIndex = options.findIndex((item) => item.id === current[key]);
        const offset = oneOnly ? 1 + Math.floor(Math.random() * Math.max(1, options.length - 1)) : 1 + Math.floor(Math.random() * (options.length - 1));
        next[key] = options[(currentIndex + offset) % options.length].id;
      });
      return next;
    });
    setScreen("tetra");
    setToast(oneOnly ? "ひとつの頂点だけ、少し変えました" : "新しい組み合わせをひらきました");
  };

  const navigate = (next: Screen) => {
    setScreen(next);
    setOverlay(null);
    setWhyOpen(false);
  };

  const recordCooking = (log: Omit<CookingLog, "id" | "createdAt">) => {
    const newLog: CookingLog = {
      ...log,
      id: `log-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setLogs((current) => [newLog, ...current]);
    setUser((current) => ({
      ...current,
      explorationLevel: Math.min(10, current.explorationLevel + 1),
    }));
    setChallenges((current) =>
      current.map((challenge, index) => {
        if (challenge.completed) return challenge;
        const progress = Math.min(challenge.target, challenge.progress + (index === 0 || index === 3 ? 1 : 0));
        return { ...challenge, progress, completed: progress >= challenge.target };
      }),
    );
    setRecordSaved(true);
    setToast("味覚マップに反映しました");
  };

  const showMain = overlay === null && guideMode === null;

  return (
    <main className="app-shell">
      <div className="app-scroll">
        {showMain && screen === "home" && (
          <HomeScreen
            user={user}
            dailyLevel={dailyLevel}
            setDailyLevel={setDailyLevel}
            dish={currentHomeDish}
            whyOpen={whyOpen}
            setWhyOpen={setWhyOpen}
            savedDishes={savedDishes}
            mapGrowth={mapGrowth}
            onExplore={() => navigate("tetra")}
            onStartGuide={(mode) => setGuideMode(mode)}
            theme={activeTheme}
            onOpenTheme={applyTheme}
            onOpenDish={openDish}
            onSave={saveDish}
            savedDishIds={savedDishIds}
          />
        )}
        {showMain && screen === "tetra" && (
          <TetraScreen
            selection={selection}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            activeCanonicalVertex={activeCanonicalVertex}
            setActiveCanonicalVertex={setActiveCanonicalVertex}
            theme={activeTheme}
            themeApplied={categoryOrder.every((category) => selection[category] === activeTheme.selection[category])}
            onApplyTheme={applyTheme}
            tasteScore={tasteScore}
            selectedPlotDishId={selectedPlotDishId}
            setSelectedPlotDishId={setSelectedPlotDishId}
            onSelect={updateSelection}
            rotation={rotation}
            onPointerDown={(event: ReactPointerEvent<HTMLDivElement>) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              setTetraAutoRotate(false);
              dragStart.current = { x: event.clientX, y: event.clientY, rotationX: rotation.x, rotationY: rotation.y };
            }}
            onPointerMove={(event: ReactPointerEvent<HTMLDivElement>) => {
              if (dragStart.current === null) return;
              const deltaX = event.clientX - dragStart.current.x;
              const deltaY = event.clientY - dragStart.current.y;
              setRotation({
                x: dragStart.current.rotationX + deltaX * 0.55,
                y: Math.max(-55, Math.min(55, dragStart.current.rotationY - deltaY * 0.45)),
              });
            }}
            onPointerUp={(event: ReactPointerEvent<HTMLDivElement>) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
              dragStart.current = null;
              setTetraAutoRotate(true);
            }}
            autoRotate={tetraAutoRotate}
            onToggleAutoRotate={() => setTetraAutoRotate((current) => !current)}
            onRandomize={() => randomize(false)}
            onNudge={() => randomize(true)}
            onSearch={() => setToast("この4要素から、料理候補を並べました")}
            suggestions={suggestions}
            onOpenDish={openDish}
            onSave={saveDish}
            savedDishIds={savedDishIds}
          />
        )}
        {showMain && screen === "explore" && (
          <ExploreScreen
            challenges={challenges}
            onOpenPro={() => setOverlay("pro")}
            onOpenDish={openDish}
            suggestions={suggestions}
            user={user}
          />
        )}
        {showMain && screen === "record" && (
          <RecordListScreen logs={logs} savedDishes={savedDishes} onOpenDish={openDish} />
        )}
        {showMain && screen === "taste" && (
          <TasteScreen user={user} logs={logs} mapGrowth={mapGrowth} challenges={challenges} tasteScore={tasteScore} onOpenPro={() => setOverlay("pro")} />
        )}

        {overlay === "detail" && activeDish && (
          <DishDetail
            dish={activeDish}
            saved={savedDishIds.includes(activeDish.id)}
            onBack={() => setOverlay(null)}
            onSave={() => saveDish(activeDish)}
            onCook={() => startRecord(activeDish)}
            onTasteChange={(category) => {
              const next = cookingElements[category].find((item) => item.id !== selection[category]) ?? cookingElements[category][0];
              updateSelection(category, next.id);
              setToast(`${categoryLabels[category]}の頂点を動かしました`);
            }}
          />
        )}
        {overlay === "record" && activeDish && (
          <RecordForm
            dish={activeDish}
            saved={recordSaved}
            onBack={() => setOverlay(null)}
            onSave={(log) => recordCooking({ ...log, dishId: activeDish.id })}
          />
        )}
        {overlay === "pro" && <ProModal onClose={() => setOverlay(null)} />}
      </div>

      {guideMode && <GuidedDiscovery mode={guideMode} savedDishes={savedDishes} onClose={() => setGuideMode(null)} onOpenDish={openGuideDish} onOpenMap={openGuideMap} onSave={saveDish} savedDishIds={savedDishIds} />}

      {showMain && <BottomNav screen={screen} onNavigate={navigate} onOpenTetra={() => navigate("tetra")} />}
      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}

function Onboarding({ step, onNext, onSkip }: { step: number; onNext: () => void; onSkip: () => void }) {
  const slide = onboardingSlides[step];
  return (
    <main className="onboarding-shell">
      <div className={`onboarding-visual visual-${slide.visual}`}>
        <div className="visual-caption">{slide.eyebrow}</div>
        <div className="onboarding-orbit orbit-one" />
        <div className="onboarding-orbit orbit-two" />
        <div className="onboarding-core">
          {slide.visual === "orbit" && <><span>食材</span><span>香り</span><span>火</span></>}
          {slide.visual === "tetra" && <div className="mini-tetra"><i /><i /><i /><i /></div>}
          {slide.visual === "map" && <div className="mini-map"><b /><b /><b /><b /><b /></div>}
        </div>
      </div>
      <div className="onboarding-copy">
        <div className="step-count">0{step + 1} / 03</div>
        <h1>{slide.title.split("\n").map((line) => <span key={line}>{line}</span>)}</h1>
        <p>{slide.body}</p>
      </div>
      <div className="onboarding-actions">
        <div className="progress-dots">{onboardingSlides.map((_, index) => <span key={index} className={index === step ? "active" : ""} />)}</div>
        <button className="button button-dark button-wide" onClick={onNext}>{step === 2 ? "四面体をはじめる" : "次へ"}<span>→</span></button>
        <button className="text-button" onClick={onSkip}>スキップ</button>
      </div>
    </main>
  );
}

function TopBar({ eyebrow, title, note }: { eyebrow: string; title: string; note?: string }) {
  return <header className="topbar"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1></div>{note && <span className="topbar-note">{note}</span>}</header>;
}

function HomeScreen({
  user, dailyLevel, setDailyLevel, dish, whyOpen, setWhyOpen, savedDishes, mapGrowth, onExplore, onStartGuide, theme, onOpenTheme, onOpenDish, onSave, savedDishIds,
}: {
  user: User; dailyLevel: AdventureLevel; setDailyLevel: (level: AdventureLevel) => void; dish: Dish; whyOpen: boolean; setWhyOpen: (open: boolean) => void; savedDishes: Dish[]; mapGrowth: number; onExplore: () => void; onStartGuide: (mode: GuideMode) => void; theme: ExplorationTheme; onOpenTheme: () => void; onOpenDish: (dish: Dish) => void; onSave: (dish: Dish) => void; savedDishIds: string[];
}) {
  return <section className="screen home-screen">
    <TopBar eyebrow="土曜日 / 07月11日" title={`おかえりなさい、${user.name}`} note={`${user.streak}日連続`} />
    <div className="home-intro"><span className="home-kicker">TODAY&apos;S COOKING IDEA</span><p>いつもの食材を、<br /><em>いつもと違う料理</em>に。</p><small>食材や今の気分を選ぶと、料理の方向から候補を見つけます。</small></div>
    <div className="home-journey" aria-label="このアプリでできること"><span><b>1</b> 条件を選ぶ</span><i>→</i><span><b>2</b> 候補を見る</span><i>→</i><span><b>3</b> 地図で深掘り</span></div>
    <section className="home-doors">
      <div className="section-heading"><div><span className="eyebrow">料理を見つける</span><h2>どちらから始めますか？</h2></div><span className="section-index">START</span></div>
      <button className="guide-door guide-door-primary" onClick={() => onStartGuide("ingredient")}><span className="guide-door-mark">冷</span><span><strong>食材と気分から探す</strong><small>食材・時間・テイストを選ぶと、候補が3皿出ます</small></span><b>→</b></button>
      <button className="guide-door" onClick={() => onStartGuide("transform")}><span className="guide-door-mark">変</span><span><strong>{savedDishes.length ? "保存した料理を変える" : "定番料理を変える"}</strong><small>{savedDishes.length ? "保存した料理を選び、変えたい方向を決めます" : "ポテトサラダなどの定番から、変えたい方向を決めます"}</small></span><b>→</b></button>
      <button className="home-map-link" onClick={onExplore}><span><strong>料理の地図を見る</strong><small>四面体は、候補同士の近さを見る地図です</small></span><b>◇</b></button>
    </section>
    <section className="home-theme-card"><div><span className="eyebrow">{theme.period}</span><h2>{theme.title}</h2><p>{theme.prompt}</p></div><button className="button button-outline" onClick={onOpenTheme}>テーマで探す →</button><small>{theme.description} · 現在の料理標本 {dishes.length}皿</small></section>
    <section className="idea-section">
      <div className="section-heading"><div><span className="eyebrow">今日の料理アイデア</span><h2>迷ったら、まずこの一皿。</h2></div><span className="section-index">TODAY</span></div>
      <div className="level-tabs">{(["定番", "ちょっと冒険", "意外"] as AdventureLevel[]).map((level) => <button key={level} className={dailyLevel === level ? "selected" : ""} onClick={() => setDailyLevel(level)}>{level}</button>)}</div>
      <DishFeature dish={dish} whyOpen={whyOpen} setWhyOpen={setWhyOpen} saved={savedDishIds.includes(dish.id)} onOpen={() => onOpenDish(dish)} onSave={() => onSave(dish)} />
    </section>
    <section className="home-lower">
      <div className="section-heading"><div><span className="eyebrow">最近の記録</span><h2>保存した料理</h2></div><span className="small-link">{savedDishes.length}件</span></div>
      {savedDishes.length === 0 ? <div className="empty-note"><span>○</span><p>気になる組み合わせを保存すると、<br />ここに並びます。</p></div> : <div className="saved-list">{savedDishes.slice(0, 2).map((saved) => <DishRow key={saved.id} dish={saved} onOpen={() => onOpenDish(saved)} />)}</div>}
    </section>
    <section className="stats-strip"><div><span>探索レベル</span><strong>Lv.{user.explorationLevel}</strong></div><div><span>味覚マップ</span><strong>{mapGrowth}%</strong></div><div><span>連続利用</span><strong>{user.streak}日</strong></div></section>
  </section>;
}

function DishFeature({ dish, whyOpen, setWhyOpen, saved, onOpen, onSave }: { dish: Dish; whyOpen: boolean; setWhyOpen: (open: boolean) => void; saved: boolean; onOpen: () => void; onSave: () => void }) {
  return <article className="dish-feature" onClick={onOpen}>
    <div className="dish-illustration"><span className="illustration-label">{dish.origin}</span><div className="plate"><div className={`plate-food food-${dish.foodElement}`} /><div className="plate-garnish" /></div><span className="dish-number">A / 01</span></div>
    <div className="dish-feature-copy"><div className="dish-meta"><span className="level-badge">{dish.adventureLevel}</span><span>{dish.cookingTime} · {dish.difficulty}</span></div><h3>{dish.name}</h3><p>{dish.description}</p><div className="tetra-mini-tags">{[dish.foodElement, dish.cookingMethodElement, dish.seasoningElement, dish.textureElement].map((id) => <span key={id}>{labelForId(id)}</span>)}</div><div className="dish-actions"><button className="why-button" onClick={(event) => { event.stopPropagation(); setWhyOpen(!whyOpen); }}>なぜ合う？ <span>⌄</span></button><button className={`save-button ${saved ? "saved" : ""}`} aria-label="保存" onClick={(event) => { event.stopPropagation(); onSave(); }}>{saved ? "保存済み" : "＋ 保存"}</button></div>{whyOpen && <div className="why-box" onClick={(event) => event.stopPropagation()}><span>相性メモ</span>{dish.reasonWhyItWorks}</div>}</div>
  </article>;
}

function DishRow({ dish, onOpen }: { dish: Dish; onOpen: () => void }) {
  return <button className="dish-row" onClick={onOpen}><span className={`row-mark mark-${dish.foodElement}`} /><span><strong>{dish.name}</strong><small>{dish.origin} · {dish.cookingTime}</small></span><span className="row-arrow">↗</span></button>;
}

function GuidedDiscovery({ mode, savedDishes, onClose, onOpenDish, onOpenMap, onSave, savedDishIds }: {
  mode: GuideMode;
  savedDishes: Dish[];
  onClose: () => void;
  onOpenDish: (dish: Dish) => void;
  onOpenMap: (dish: Dish) => void;
  onSave: (dish: Dish) => void;
  savedDishIds: string[];
}) {
  const [step, setStep] = useState(0);
  const [foodId, setFoodId] = useState("chicken");
  const [time, setTime] = useState<typeof guideTimes[number]>("30分以内");
  const [feelingId, setFeelingId] = useState("light");
  const [baseDishId, setBaseDishId] = useState(savedDishes[0]?.id ?? "potato-salad");
  const [shiftId, setShiftId] = useState("roasty");
  const availableFamiliarDishes = [
    ...savedDishes.map((dish) => ({ id: dish.id, name: dish.name, food: dish.foodElement, description: `保存済み · ${dish.description}` })),
    ...familiarDishOptions.filter((option) => !savedDishes.some((dish) => dish.name === option.name)),
  ];
  const ingredient = cookingElements.food.find((item) => item.id === foodId) ?? cookingElements.food[0];
  const familiarDish = availableFamiliarDishes.find((item) => item.id === baseDishId) ?? availableFamiliarDishes[0];
  const feeling = guideFeelings.find((item) => item.id === feelingId) ?? guideFeelings[0];
  const shift = guideShifts.find((item) => item.id === shiftId) ?? guideShifts[0];
  const results = mode === "ingredient"
    ? guideIngredientResults(foodId, feelingId, time)
    : guideTransformResults(familiarDish.food, shiftId);
  const resultStep = mode === "ingredient" ? 1 : 2;
  const isResult = step === resultStep;

  const goBack = () => {
    if (step === 0) onClose();
    else setStep((current) => current - 1);
  };

  return <section className="guide-screen" aria-label="料理を探す">
    <header className="guide-header"><button className="back-button" onClick={goBack}>← <span>{step === 0 ? "ホーム" : "戻る"}</span></button><span className="guide-step">{isResult ? "RESULT" : `STEP 0${step + 1}`}</span></header>
    {!isResult && <><div className="guide-heading"><span className="eyebrow">目的から探す</span><h1>{mode === "ingredient" ? <>冷蔵庫の食材から、<br /><em>今日の一皿</em>を決める。</> : <>{savedDishes.length ? "保存した料理" : "定番料理"}を、<br /><em>別の方向</em>へ動かす。</>}</h1><p>{mode === "ingredient" ? "食材と今の気分を選ぶと、作りやすい候補を3つ出します。" : savedDishes.length ? "保存した料理をひとつ選び、変えたい方向を決めると、別の候補が見つかります。" : "ポテトサラダなどの定番をひとつ選び、変えたい方向を決めます。"}</p></div><div className="guide-live-status"><span>いま選んでいる条件</span><strong>{mode === "ingredient" ? `${ingredient.name} × ${time} × ${feeling.label}` : `${familiarDish.name} → ${shift.label}`}</strong><small>{mode === "ingredient" ? "この条件を料理の4要素に置き換えて、候補を出します" : "料理の熱・水分・油・空気の方向を変えて、候補を出します"}</small></div></>}

    {mode === "ingredient" && step === 0 && <div className="guide-form">
      <div className="guide-field"><div className="guide-field-heading"><span>01</span><strong>使いたい食材</strong><small>ひとつ選ぶ</small></div><div className="guide-choice-grid">{cookingElements.food.map((item) => <button key={item.id} className={foodId === item.id ? "selected" : ""} onClick={() => setFoodId(item.id)}><i style={{ backgroundColor: item.color }} />{item.name}</button>)}</div></div>
      <div className="guide-field"><div className="guide-field-heading"><span>02</span><strong>使える時間</strong><small>目安でOK</small></div><div className="guide-choice-row">{guideTimes.map((item) => <button key={item} className={time === item ? "selected" : ""} onClick={() => setTime(item)}>{item}</button>)}</div></div>
      <div className="guide-field"><div className="guide-field-heading"><span>03</span><strong>今日はどうしたい？</strong><small>ひとつ選ぶ</small></div><div className="guide-option-list">{guideFeelings.map((item) => <button key={item.id} className={feelingId === item.id ? "selected" : ""} onClick={() => setFeelingId(item.id)}><span><strong>{item.label}</strong><small>{item.description}</small></span><b>→</b></button>)}</div></div>
      <div className="guide-summary"><span>あなたの条件</span><strong>{ingredient.name} × {feeling.label}</strong><small>{time} · この条件から3皿を提案します</small></div>
      <button className="button button-dark button-wide guide-submit" onClick={() => setStep(1)}>料理を見つける <span>→</span></button>
    </div>}

    {mode === "transform" && step === 0 && <div className="guide-form">
      <div className="guide-field"><div className="guide-field-heading"><span>01</span><strong>{savedDishes.length ? "変えたい料理" : "いつもの料理"}</strong><small>ひとつ選ぶ</small></div><div className="familiar-list">{availableFamiliarDishes.map((item) => <button key={item.id} className={baseDishId === item.id ? "selected" : ""} onClick={() => setBaseDishId(item.id)}><span className="familiar-mark">{item.name.slice(0, 1)}</span><span><strong>{item.name}</strong><small>{item.description}</small></span><b>→</b></button>)}</div></div>
      <div className="guide-summary"><span>いまの定番</span><strong>{familiarDish.name}</strong><small>{familiarDish.description} · ここから料理を変えます</small></div>
      <button className="button button-dark button-wide guide-submit" onClick={() => setStep(1)}>変え方を選ぶ <span>→</span></button>
    </div>}

    {mode === "transform" && step === 1 && <div className="guide-form"><div className="guide-field"><div className="guide-field-heading"><span>02</span><strong>今日はどう変えたい？</strong><small>{familiarDish.name}から</small></div><div className="shift-grid">{guideShifts.map((item) => <button key={item.id} className={shiftId === item.id ? "selected" : ""} onClick={() => setShiftId(item.id)}><strong>{item.label}</strong><small>{item.description}</small><b>→</b></button>)}</div></div><div className="guide-summary"><span>料理の向き</span><strong>{familiarDish.name} → {shift.label}</strong><small>調理の軸を変えて、別の候補を探します</small></div><button className="button button-dark button-wide guide-submit" onClick={() => setStep(2)}>変わった料理を見る <span>→</span></button></div>}

    {isResult && <div className="guide-results"><div className="guide-result-heading"><span className="eyebrow">{mode === "ingredient" ? "あなたの条件から" : "料理の向きを変えると"}</span><h1>{mode === "ingredient" ? <>{ingredient.name}で、<em>{feeling.label}</em></> : <>{familiarDish.name}から、<br /><em>{shift.label}</em></>}</h1><p>{mode === "ingredient" ? `${time}で作りやすい候補です。気になる料理を開いて、理由や代替食材も見られます。` : "同じ食材のままでも、熱や水分のかけ方を変えると別の料理になります。"}</p></div><div className="guide-results-list">{results.map((dish, index) => <GuideResultCard key={dish.id} dish={dish} index={index} saved={savedDishIds.includes(dish.id)} onOpen={() => onOpenDish(dish)} onOpenMap={() => onOpenMap(dish)} onSave={() => onSave(dish)} />)}</div><div className="guide-map-explain"><span className="guide-door-mark">◇</span><span><strong>料理の地図で、近さを見る</strong><small>この候補を四面体に置くと、似た料理や別の方向が見えてきます。</small></span><button onClick={() => onOpenMap(results[0])}>地図へ →</button></div><button className="guide-reset" onClick={() => setStep(mode === "ingredient" ? 0 : 1)}>条件を変えて探し直す</button></div>}
  </section>;
}

function GuideResultCard({ dish, index, saved, onOpen, onOpenMap, onSave }: { dish: Dish; index: number; saved: boolean; onOpen: () => void; onOpenMap: () => void; onSave: () => void }) {
  return <article className="guide-result-card"><button className="guide-result-main" onClick={onOpen}><div className={`suggestion-art art-${index}`}><span>{dish.origin}</span><b>{String(index + 1).padStart(2, "0")}</b></div><div className="guide-result-copy"><div className="dish-meta"><span className="level-badge">{dish.adventureLevel}</span><span>{dish.cookingTime} · {dish.difficulty}</span></div><h2>{dish.name}</h2><p>{dish.description}</p><small>{dish.reasonWhyItWorks}</small></div></button><div className="guide-result-actions"><button onClick={onOpenMap}>料理の地図で見る</button><button onClick={onSave}>{saved ? "保存済み" : "保存"}</button></div></article>;
}

type GeometryFocus = { kind: "頂点" | "線分" | "面"; label: string; description: string };
type TetraEntrance = "food" | "mood" | "method" | "texture" | "theme" | "random";

const tetraEntranceLabels: Record<TetraEntrance, string> = {
  food: "食材から",
  mood: "味わいから",
  method: "調理法から",
  texture: "食感から",
  theme: "テーマから",
  random: "おまかせ",
};
const tetraEntranceCategory: Partial<Record<TetraEntrance, ElementCategory>> = {
  food: "food",
  mood: "seasoning",
  method: "method",
  texture: "texture",
};
const tetraEntranceForCategory: Record<ElementCategory, TetraEntrance> = {
  food: "food",
  method: "method",
  seasoning: "mood",
  texture: "texture",
};

const edgeFocus: GeometryFocus[] = [
  { kind: "線分", label: "火 × 水", description: "乾いた熱と水分の境目。焼き煮・蒸し焼きの方向です。" },
  { kind: "線分", label: "火 × 空気", description: "香ばしさと軽さの境目。焼いて、最後に空気を残す方向です。" },
  { kind: "線分", label: "火 × 油", description: "熱と油が重なる境目。揚げ焼きやカリッとした料理の方向です。" },
  { kind: "線分", label: "水 × 空気", description: "水分と軽さが重なる境目。蒸す・生で仕上げる方向です。" },
  { kind: "線分", label: "水 × 油", description: "水分と油が重なる境目。煮込みや乳化した料理の方向です。" },
  { kind: "線分", label: "空気 × 油", description: "軽さと油が重なる境目。揚げる・泡立てる方向です。" },
];

const faceFocus: GeometryFocus[] = [
  { kind: "面", label: "火・水・空気", description: "素材の水分と熱を中心に、油を控えて仕上げる面です。" },
  { kind: "面", label: "火・水・油", description: "熱・水分・油を重ね、満足感のある料理をつくる面です。" },
  { kind: "面", label: "火・空気・油", description: "焼き目や揚げ目、香りを中心に組み立てる面です。" },
  { kind: "面", label: "水・空気・油", description: "煮る・蒸す・生の仕上げで、質感を探る面です。" },
];

function TetraScreen({ selection, activeCategory, setActiveCategory, activeCanonicalVertex, setActiveCanonicalVertex, theme, themeApplied, onApplyTheme, autoRotate, onToggleAutoRotate, tasteScore, selectedPlotDishId, setSelectedPlotDishId, onSelect, rotation, onPointerDown, onPointerMove, onPointerUp, onRandomize, onNudge, onSearch, suggestions, onOpenDish, onSave, savedDishIds }: {
  selection: Record<ElementCategory, string>; activeCategory: ElementCategory; setActiveCategory: (category: ElementCategory) => void; activeCanonicalVertex: CanonicalVertex; setActiveCanonicalVertex: (vertex: CanonicalVertex) => void; theme: ExplorationTheme; themeApplied: boolean; onApplyTheme: () => void; autoRotate: boolean; onToggleAutoRotate: () => void; tasteScore: TetraScore | null; selectedPlotDishId: string | null; setSelectedPlotDishId: (id: string | null) => void; onSelect: (category: ElementCategory, id: string) => void; rotation: { x: number; y: number }; onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void; onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void; onPointerUp: (event: React.PointerEvent<HTMLDivElement>) => void; onRandomize: () => void; onNudge: () => void; onSearch: () => void; suggestions: Dish[]; onOpenDish: (dish: Dish) => void; onSave: (dish: Dish) => void; savedDishIds: string[];
}) {
  const [geometryFocus, setGeometryFocus] = useState<GeometryFocus>({ kind: "頂点", label: "火", description: canonicalVertexDescriptions.fire });
  const [helpOpen, setHelpOpen] = useState(false);
  const [activeEntrance, setActiveEntrance] = useState<TetraEntrance>("food");
  const labels = canonicalOrder.map((category) => ({ category, element: { name: canonicalVertexDescriptions[category].split("。")[0] } }));
  const targetScore = averageTetraScores(suggestions.map(tetraScoreForDish));
  const selectedPlotDish = selectedPlotDishId ? getDishById(selectedPlotDishId) : null;
  const selectedPlotScore = selectedPlotDish ? tetraScoreForDish(selectedPlotDish) : null;
  const nearbyDishes = selectedPlotDish && selectedPlotScore
    ? dishes
      .filter((dish) => dish.id !== selectedPlotDish.id)
      .map((dish) => ({ dish, distance: tetraDistance(selectedPlotScore, tetraScoreForDish(dish)) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 2)
    : [];
  const selectCanonicalVertex = (vertex: CanonicalVertex) => {
    setActiveCanonicalVertex(vertex);
    const category = canonicalLensByVertex[vertex];
    setActiveCategory(category);
    setActiveEntrance(tetraEntranceForCategory[category]);
    setGeometryFocus({ kind: "頂点", label: canonicalVertexLabels[vertex], description: canonicalVertexDescriptions[vertex] });
  };
  const selectEdge = (edgeIndex: number) => setGeometryFocus(edgeFocus[edgeIndex]);
  const selectFace = (faceIndex: number) => setGeometryFocus(faceFocus[faceIndex]);
  const chooseEntrance = (entrance: TetraEntrance) => {
    setActiveEntrance(entrance);
    if (entrance === "theme") {
      onApplyTheme();
      return;
    }
    if (entrance === "random") {
      onRandomize();
      return;
    }
    const category = tetraEntranceCategory[entrance];
    if (category) setActiveCategory(category);
  };
  return <section className="screen tetra-screen">
    <TopBar eyebrow="発見 / 01" title="料理の地図" note="ドラッグできます" />
    <p className="screen-lead">四面体は、料理を探すための地図です。<br />まず候補を選ぶと、似た料理と次の方向が見えてきます。</p>
    <section className="theme-panel"><div><span className="eyebrow">{theme.period}</span><h2>{theme.title}</h2><p>{theme.prompt}</p></div>{themeApplied ? <span className="theme-applied">テーマを探索中</span> : <button className="button button-dark" onClick={onApplyTheme}>このテーマで探す →</button>}<small>{theme.description}</small></section>
    <div className="tetra-guide-note"><div><span className="guide-sequence">目的</span><b>→</b><span className="guide-sequence">候補</span><b>→</b><span className="guide-sequence guide-sequence-active">地図</span></div><p>点をタップすると、その料理がなぜそこにいるのか、近くに何があるのかを読めます。</p></div>
    <div className="tetra-stage-wrap"><div className="drag-hint">← スワイプして回転 →</div><div className="tetra-stage" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
      <TetraCanvas labels={labels} rotation={rotation} activeCategory={activeCanonicalVertex} onVertexSelect={selectCanonicalVertex} onEdgeSelect={selectEdge} onFaceSelect={selectFace} dishes={dishes} highlightedDishIds={suggestions.map((dish) => dish.id)} selectedDishId={selectedPlotDishId} onDishSelect={setSelectedPlotDishId} targetScore={targetScore} tasteScore={tasteScore} />
    </div><div className="tetra-stage-toolbar"><span className="geometry-hint">{selectedPlotDish ? `選択中：${selectedPlotDish.name}` : "頂点・線分・面・料理点をタップ"}</span><div className="tetra-toolbar-actions"><button className="tetra-help-button" onClick={() => setHelpOpen((current) => !current)} aria-expanded={helpOpen}>？ 見方</button><button className={`rotation-toggle ${autoRotate ? "" : "paused"}`} onClick={onToggleAutoRotate}><i />{autoRotate ? "ゆっくり回転中" : "回転を止める"}</button></div></div>{helpOpen && <div className="tetra-help-popover"><div><span className="eyebrow">四面体の見方</span><p>料理点をタップすると、その料理と近い方向が開きます。頂点・線分・面は、料理のつくり方を読むための補助線です。</p></div><div className="tetra-help-list"><span><b>頂点</b>火・水・空気・油</span><span><b>線分</b>2つの軸の混ざり方</span><span><b>面</b>3つの軸の領域</span><span><b>点</b>料理そのもの</span></div></div>}<div className="tetra-stage-legend"><span><i className="legend-dot specimen" />料理標本 {dishes.length}皿</span><span><i className="legend-dot target" />今回の探索点</span>{tasteScore ? <span><i className="legend-dot taste" />あなたの味覚点</span> : <span>記録すると味覚点が現れます</span>}</div></div>
    <div className="tetra-insight">{selectedPlotDish && selectedPlotScore ? <><div className="insight-heading"><span className="eyebrow">四面体上の標本</span><button className="text-button" onClick={() => setSelectedPlotDishId(null)}>閉じる</button></div><h3>{selectedPlotDish.name}</h3><p>{tetraPositionSummary(selectedPlotScore)}</p><div className="tetra-score-bars">{canonicalOrder.map((vertex) => <div key={vertex}><span>{canonicalVertexLabels[vertex]}</span><div><i style={{ width: `${Math.round(selectedPlotScore[vertex] * 100)}%`, backgroundColor: tetraColors[canonicalOrder.indexOf(vertex)] }} /></div><small>{Math.round(selectedPlotScore[vertex] * 100)}</small></div>)}</div><div className="nearby-dishes"><span className="eyebrow">四面体上のご近所</span>{nearbyDishes.map(({ dish, distance }) => <button key={dish.id} onClick={() => setSelectedPlotDishId(dish.id)}><span>{dish.name}</span><small>距離 {distance.toFixed(2)}</small></button>)}</div><button className="button button-outline button-wide" onClick={() => onOpenDish(selectedPlotDish)}>料理の詳細を見る <span>→</span></button></> : <><span className="eyebrow">点で読む料理</span><h3>四面体は、料理の標本箱です。</h3><p>近い点ほど、調理の考え方が似ています。点をタップすると、なぜそこにいるのかと、四面体上のご近所が見えてきます。</p><small>{suggestions.length}つの強調された点は、いまの補助レイヤーから選ばれた候補です。</small></>}</div>
    <section className="tetra-explorer-dock"><div className="tetra-dock-heading"><div><span className="eyebrow">料理の世界を歩く</span><h2>{tetraEntranceLabels[activeEntrance]}</h2></div><span className="section-index">入口 ↔ 地図</span></div><p className="tetra-dock-copy">食材からでも、好きな食感からでも、テーマからでも入れます。入口を変えると、同じ地図の中で別の料理と好みが見えてきます。</p><div className="tetra-entry-rail" aria-label="料理を探す入口">{(Object.keys(tetraEntranceLabels) as TetraEntrance[]).map((entrance) => <button key={entrance} className={activeEntrance === entrance ? "active" : ""} onClick={() => chooseEntrance(entrance)}>{tetraEntranceLabels[entrance]}</button>)}</div><div className="tetra-controls"><div className="exploration-pointer"><span className="eyebrow">いまの地図</span><strong>{targetScore ? tetraPositionSummary(targetScore) : "候補を選ぶと、地図上に現在地が現れます。"}</strong><small>下で選んだ組み合わせが、上の地図の探索点になります。</small></div><div className="selected-axis"><span className="eyebrow">いま触れている{geometryFocus.kind}</span><strong>{geometryFocus.label}</strong><span>{geometryFocus.description}</span><small className="support-layer">補助レイヤー：{categoryLabels[activeCategory]}</small></div><div className="secondary-layer-nav" aria-label="料理の補助レイヤー">{categoryOrder.map((category) => <button key={category} className={activeCategory === category ? "active" : ""} onClick={() => { setActiveCategory(category); setActiveEntrance(tetraEntranceForCategory[category]); }}>{categoryLabels[category]}</button>)}</div><div className="choice-scroller">{cookingElements[activeCategory].map((item) => <button key={item.id} className={selection[activeCategory] === item.id ? "selected" : ""} onClick={() => onSelect(activeCategory, item.id)}><i style={{ backgroundColor: item.color }} />{item.name}</button>)}</div><div className="tetra-actions"><button className="button button-outline" onClick={onRandomize}>おまかせ <span>↻</span></button><button className="button button-outline" onClick={onNudge}>少し変える <span>↗</span></button></div><button className="button button-dark button-wide search-combination" onClick={onSearch}>この組み合わせで探す <span>→</span></button></div><div className="tetra-results"><div className="result-header"><div><span className="eyebrow">この地図の近くから</span><h2>料理候補 <em>03</em></h2></div></div><p className="tetra-section-note">赤い探索点の近くにある料理です。料理点をタップすると、四面体上の位置と近い料理が開きます。</p><div className="suggestion-stack">{suggestions.map((dish, index) => <SuggestionCard key={dish.id} dish={dish} index={index} onOpen={() => onOpenDish(dish)} onSave={() => onSave(dish)} saved={savedDishIds.includes(dish.id)} />)}</div></div></section>
  </section>;
}

type TetraPoint = { x: number; y: number; z: number };

const tetraPoints: TetraPoint[] = [
  { x: 1, y: 1, z: 1 },
  { x: 1, y: -1, z: -1 },
  { x: -1, y: 1, z: -1 },
  { x: -1, y: -1, z: 1 },
];

const tetraEdges = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]];
const tetraFaces = [[0, 1, 2], [0, 1, 3], [0, 2, 3], [1, 2, 3]];
const tetraColors = ["#b54a2f", "#35608f", "#4e7a3f", "#a8781c"];

function rotateTetraPoint(point: TetraPoint, rotation: { x: number; y: number }) {
  const yaw = (rotation.x * Math.PI) / 180;
  const pitch = (rotation.y * Math.PI) / 180;
  const cosYaw = Math.cos(yaw);
  const sinYaw = Math.sin(yaw);
  const x = point.x * cosYaw + point.z * sinYaw;
  const zAfterYaw = -point.x * sinYaw + point.z * cosYaw;
  const cosPitch = Math.cos(pitch);
  const sinPitch = Math.sin(pitch);
  return {
    x,
    y: point.y * cosPitch - zAfterYaw * sinPitch,
    z: point.y * sinPitch + zAfterYaw * cosPitch,
  };
}

function projectTetraPoint(point: TetraPoint, rotation: { x: number; y: number }) {
  const rotated = rotateTetraPoint(point, rotation);
  const cameraDistance = 5.2;
  const perspective = cameraDistance / (cameraDistance - rotated.z);
  return {
    x: 150 + rotated.x * 57 * perspective,
    y: 122 - rotated.y * 57 * perspective,
    z: rotated.z,
  };
}

function tetraDistance(a: TetraScore, b: TetraScore) {
  return Math.sqrt(canonicalOrder.reduce((sum, vertex) => sum + (a[vertex] - b[vertex]) ** 2, 0));
}

function TetraCanvas({ labels, rotation, activeCategory, onVertexSelect, onEdgeSelect, onFaceSelect, dishes, highlightedDishIds, selectedDishId, onDishSelect, targetScore, tasteScore }: { labels: Array<{ category: CanonicalVertex; element: { name: string } }>; rotation: { x: number; y: number }; activeCategory: CanonicalVertex; onVertexSelect: (category: CanonicalVertex) => void; onEdgeSelect: (edgeIndex: number) => void; onFaceSelect: (faceIndex: number) => void; dishes: Dish[]; highlightedDishIds: string[]; selectedDishId: string | null; onDishSelect: (id: string) => void; targetScore: TetraScore | null; tasteScore: TetraScore | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const projected = tetraPoints.map((point) => projectTetraPoint(point, rotation));
  const plotted = dishes.map((dish) => ({ dish, score: tetraScoreForDish(dish), point: projectTetraPoint(tetraScoreToPoint(tetraScoreForDish(dish)), rotation) }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const width = 300;
    const height = 245;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, width, height);

    const faceColors = ["rgba(181, 74, 47, .13)", "rgba(53, 96, 143, .13)", "rgba(78, 122, 63, .13)", "rgba(168, 120, 28, .13)"];
    tetraFaces
      .map((face, index) => ({ face, index, depth: face.reduce((sum, pointIndex) => sum + projected[pointIndex].z, 0) / 3 }))
      .sort((a, b) => a.depth - b.depth)
      .forEach(({ face, index }) => {
        context.beginPath();
        face.forEach((pointIndex, pointPosition) => {
          const point = projected[pointIndex];
          if (pointPosition === 0) context.moveTo(point.x, point.y);
          else context.lineTo(point.x, point.y);
        });
        context.closePath();
        context.fillStyle = faceColors[index];
        context.fill();
        context.strokeStyle = "rgba(72, 67, 57, .22)";
        context.lineWidth = 1;
        context.stroke();
      });

    context.lineCap = "round";
    tetraEdges.forEach(([start, end]) => {
      context.beginPath();
      context.moveTo(projected[start].x, projected[start].y);
      context.lineTo(projected[end].x, projected[end].y);
      context.strokeStyle = "rgba(41, 39, 35, .78)";
      context.lineWidth = 2;
      context.stroke();
    });

    const highlighted = new Set(highlightedDishIds);
    plotted.slice().sort((a, b) => a.point.z - b.point.z).forEach(({ dish, score, point }) => {
      const candidate = highlighted.has(dish.id);
      const selected = selectedDishId === dish.id;
      const depth = Math.max(0, Math.min(1, (point.z + 1) / 2));
      const radius = (candidate ? 4.7 : 3.1) * (0.9 + depth * 0.18);
      context.beginPath();
      context.arc(point.x, point.y, radius, 0, Math.PI * 2);
      context.globalAlpha = selected ? 1 : candidate ? 0.94 : 0.34 + depth * 0.22;
      context.fillStyle = mixTetraColor(score);
      context.fill();
      context.strokeStyle = candidate ? "#292723" : "rgba(41, 39, 35, .42)";
      context.lineWidth = candidate ? 1.2 : 0.7;
      context.stroke();
      if (selected) {
        context.globalAlpha = 0.9;
        context.beginPath();
        context.arc(point.x, point.y, radius + 5, 0, Math.PI * 2);
        context.strokeStyle = "#292723";
        context.lineWidth = 1.4;
        context.stroke();
      }
    });

    const drawMarker = (score: TetraScore | null, color: string, shape: "diamond" | "circle") => {
      if (!score) return;
      const point = projectTetraPoint(tetraScoreToPoint(score), rotation);
      context.save();
      context.globalAlpha = 0.95;
      context.strokeStyle = color;
      context.lineWidth = 1.5;
      context.setLineDash([3, 2]);
      if (shape === "diamond") {
        context.beginPath();
        context.moveTo(point.x, point.y - 9);
        context.lineTo(point.x + 9, point.y);
        context.lineTo(point.x, point.y + 9);
        context.lineTo(point.x - 9, point.y);
        context.closePath();
        context.stroke();
      } else {
        context.beginPath();
        context.arc(point.x, point.y, 9, 0, Math.PI * 2);
        context.stroke();
      }
      context.restore();
    };
    drawMarker(targetScore, "#b54a2f", "diamond");
    drawMarker(tasteScore, "#292723", "circle");
    context.globalAlpha = 1;

    projected.forEach((point, index) => {
      const isActive = canonicalOrder[index] === activeCategory;
      context.beginPath();
      context.arc(point.x, point.y, isActive ? 11 : 9, 0, Math.PI * 2);
      context.fillStyle = "#eee8dd";
      context.fill();
      context.strokeStyle = isActive ? "#292723" : tetraColors[index];
      context.lineWidth = isActive ? 2 : 1.5;
      context.stroke();
      context.beginPath();
      context.arc(point.x, point.y, 5.5, 0, Math.PI * 2);
      context.fillStyle = tetraColors[index];
      context.fill();
    });
  }, [activeCategory, highlightedDishIds, plotted, projected, rotation, selectedDishId, targetScore, tasteScore]);

  return <div className="tetra-canvas-layer"><canvas ref={canvasRef} className="tetra-canvas" width={300} height={245} aria-label="料理標本と火・水・空気・油を立体的に回転できる四面体" /><svg className="tetra-hotspots" viewBox="0 0 300 245" aria-label="四面体の線分と面"><g className="face-hotspots">{tetraFaces.map((face, index) => <polygon key={`face-${index}`} points={face.map((pointIndex) => `${projected[pointIndex].x},${projected[pointIndex].y}`).join(" ")} onClick={() => onFaceSelect(index)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onFaceSelect(index); }} role="button" tabIndex={0} aria-label={`${faceFocus[index].label}の面`} />)}</g><g className="edge-hotspots">{tetraEdges.map(([start, end], index) => <line key={`edge-${index}`} x1={projected[start].x} y1={projected[start].y} x2={projected[end].x} y2={projected[end].y} onClick={() => onEdgeSelect(index)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onEdgeSelect(index); }} role="button" tabIndex={0} aria-label={`${edgeFocus[index].label}の線分`} />)}</g></svg>{plotted.map(({ dish, point }) => <button key={dish.id} className={`plot-point ${highlightedDishIds.includes(dish.id) ? "candidate" : ""} ${selectedDishId === dish.id ? "selected" : ""}`} style={{ left: point.x, top: point.y, zIndex: Math.round(4 + point.z * 3) }} aria-label={`${dish.name} / 四面体上の標本点`} onPointerDown={(event) => event.stopPropagation()} onClick={() => onDishSelect(dish.id)} />)}{labels.map(({ category, element }, index) => { const point = projected[index]; return <button key={category} className={`vertex vertex-3d vertex-${index} vertex-${category} ${activeCategory === category ? "active" : ""}`} style={{ left: point.x, top: point.y }} onClick={() => onVertexSelect(category)}><span className="vertex-dot" /><span className="vertex-tag"><small>{canonicalVertexLabels[category]}</small>{element.name}</span></button>; })}</div>;
}

function SuggestionCard({ dish, index, onOpen, onSave, saved }: { dish: Dish; index: number; onOpen: () => void; onSave: () => void; saved: boolean }) {
  return <article className="suggestion-card"><button className="suggestion-main" onClick={onOpen}><div className={`suggestion-art art-${index}`}><span>{dish.origin}</span><b>{String(index + 1).padStart(2, "0")}</b></div><div className="suggestion-copy"><div className="dish-meta"><span className="level-badge">{dish.adventureLevel}</span><span>{dish.cookingTime} · {dish.difficulty}</span></div><h3>{dish.name}</h3><p>{dish.description}</p><small>主な材料：{dish.ingredients.slice(0, 3).join("・")}</small></div></button><div className="suggestion-footer"><div className="tetra-mini-tags">{[dish.foodElement, dish.cookingMethodElement, dish.seasoningElement, dish.textureElement].map((id) => <span key={id}>{labelForId(id)}</span>)}</div><button className={`save-button ${saved ? "saved" : ""}`} onClick={onSave}>{saved ? "保存済み" : "保存"}</button><button className="make-button" onClick={onOpen}>作ってみる →</button></div></article>;
}

function labelForId(id: string) {
  const hit = categoryOrder.flatMap((category) => cookingElements[category]).find((element) => element.id === id);
  return hit?.name ?? id;
}

function ExploreScreen({ challenges, onOpenPro, onOpenDish, suggestions, user }: { challenges: typeof initialChallenges; onOpenPro: () => void; onOpenDish: (dish: Dish) => void; suggestions: Dish[]; user: User }) {
  const completed = challenges.filter((challenge) => challenge.completed).length;
  return <section className="screen explore-screen"><TopBar eyebrow="探索 / 04" title="ひらめきの余白" note={`${completed}/${challenges.length} 達成`} /><div className="explore-intro"><span className="eyebrow">今週のテーマ</span><h2>ひとつ先の味を、<br /><em>小さく試す。</em></h2><p>連続日数より、食卓で起きた発見を記録していきます。</p></div><section className="challenge-section"><div className="section-heading"><div><span className="eyebrow">料理体験チャレンジ</span><h2>今週の観察テーマ</h2></div><span className="section-index">{completed} DONE</span></div><div className="challenge-list">{challenges.map((challenge) => <article className={`challenge ${challenge.completed ? "completed" : ""}`} key={challenge.id}><div className="challenge-badge">{challenge.completed ? "✓" : "R"}</div><div className="challenge-body"><div><span className="challenge-progress">{challenge.progress} / {challenge.target}</span><h3>{challenge.title}</h3></div><p>{challenge.description}</p><div className="progress-track"><span style={{ width: `${(challenge.progress / challenge.target) * 100}%` }} /></div>{challenge.completed && <small className="badge-copy">バッジ獲得：{challenge.badge}</small>}</div></article>)}</div></section><section className="explore-pick"><div><span className="eyebrow">あなた向けの小さな一歩</span><h2>{suggestions[1]?.name ?? "新しい組み合わせ"}</h2><p>{adventureCopy(suggestions[1]?.adventureLevel ?? "ちょっと冒険")}</p></div><button className="button button-outline" onClick={() => onOpenDish(suggestions[1] ?? suggestions[0])}>見る →</button></section><section className="pro-banner"><div><span className="eyebrow">RYORI PRO</span><h2>味の地図を、もう少し深く。</h2><p>冷蔵庫や家族の好みまで含めた探索はProで。</p></div><button className="button button-dark" onClick={onOpenPro}>詳しく見る</button></section><p className="explore-footnote">現在の探索レベル Lv.{user.explorationLevel} · 料理体験を重ねるほど、提案があなたに近づきます。</p></section>;
}

function adventureCopy(level: AdventureLevel) { return adventureDescriptions[level]; }

function RecordListScreen({ logs, savedDishes, onOpenDish }: { logs: CookingLog[]; savedDishes: Dish[]; onOpenDish: (dish: Dish) => void }) {
  return <section className="screen record-list-screen"><TopBar eyebrow="記録 / 03" title="食卓のノート" note={`${logs.length}皿`} /><div className="record-intro"><span className="eyebrow">つくった料理</span><h2>味の記憶を、<br /><em>短く残す。</em></h2><p>ひとことの評価が、次のおすすめの精度を育てます。</p></div>{logs.length === 0 ? <div className="empty-record"><div className="notebook-mark">＋</div><h3>まだ記録はありません</h3><p>四面体から料理を選び、<br />「作ってみる」で30秒の記録を残せます。</p></div> : <div className="log-list">{logs.map((log) => { const dish = getDishById(log.dishId); return <button className="log-row" key={log.id} onClick={() => onOpenDish(dish)}><span className={`row-mark mark-${dish.foodElement}`} /><span><strong>{dish.name}</strong><small>{new Date(log.createdAt).toLocaleDateString("ja-JP")} · おいしさ {log.rating}/5</small></span><span className="rating-dots">{"●".repeat(log.rating)}<i>{"●".repeat(5 - log.rating)}</i></span></button>; })}</div>}<section className="saved-section"><div className="section-heading"><div><span className="eyebrow">保存済み</span><h2>あとで作りたい</h2></div><span className="section-index">{savedDishes.length}</span></div>{savedDishes.length ? savedDishes.map((dish) => <DishRow key={dish.id} dish={dish} onOpen={() => onOpenDish(dish)} />) : <p className="muted-line">気になる料理の「保存」から追加できます。</p>}</section></section>;
}

function TasteScreen({ user, logs, mapGrowth, challenges, tasteScore, onOpenPro }: { user: User; logs: CookingLog[]; mapGrowth: number; challenges: typeof initialChallenges; tasteScore: TetraScore | null; onOpenPro: () => void }) {
  const completed = challenges.filter((item) => item.completed).length;
  const score = tasteScore ?? defaultTetraScore;
  const ranked = [...canonicalOrder].sort((a, b) => score[b] - score[a]);
  const lead = canonicalVertexLabels[ranked[0]];
  const second = canonicalVertexLabels[ranked[1]];
  const unexplored = canonicalVertexLabels[ranked[ranked.length - 1]];
  return <section className="screen taste-screen"><TopBar eyebrow="マイ味覚 / 05" title="味の地図" note={`Lv.${user.explorationLevel}`} /><div className="taste-intro"><span className="eyebrow">あなたの傾向</span><h2>{lead}と{second}の料理を<br /><em>好む傾向があります。</em></h2><p>料理の点が増えるほど、あなたの好きな方向が四面体上に現れます。</p></div><div className="radar-panel"><div className="radar-chart"><div className="radar-grid grid-one" /><div className="radar-grid grid-two" /><div className="radar-grid grid-three" /><div className="radar-fill" style={{ clipPath: radarClipPath(score) }} /><span className="radar-label radar-top">火</span><span className="radar-label radar-right">水</span><span className="radar-label radar-bottom">空気</span><span className="radar-label radar-left">油</span></div><div className="radar-caption"><span>四面体マップ / 現在地</span><strong>{mapGrowth}%</strong><small>{logs.length ? `${logs.length}件の記録から分析` : "まずは1皿、記録してみましょう"}</small></div></div><div className="taste-facts"><div><span>好きな領域</span><strong>{lead}・{second}</strong></div><div><span>よく通る辺</span><strong>{lead} × {second}</strong></div><div><span>補助レイヤー</span><strong>焼く・香ばしい</strong></div><div><span>まだ白い頂点</span><strong>{unexplored}</strong></div></div><section className="unknown-area"><div className="section-heading"><div><span className="eyebrow">まだ白い領域</span><h2>次に開ける場所</h2></div><span className="section-index">04 VERTICES</span></div><div className="unknown-map"><span className="unknown-dot dot-a" /><span className="unknown-dot dot-b" /><span className="unknown-dot dot-c" /><p>{unexplored} × 油の料理<br />火 × {unexplored}の混合</p><small>未知の組み合わせが、2つ残っています</small></div></section><section className="discovery-note"><span className="eyebrow">今月の新しい発見</span><strong>{completed + 1}つ</strong><p>普段選ばない方向へ動いた回数</p></section><button className="pro-inline" onClick={onOpenPro}><span><b>PRO</b> 詳細な味覚分析</span><span>→</span></button></section>;
}

function DishDetail({ dish, saved, onBack, onSave, onCook, onTasteChange }: { dish: Dish; saved: boolean; onBack: () => void; onSave: () => void; onCook: () => void; onTasteChange: (category: ElementCategory) => void }) {
  const [changeOpen, setChangeOpen] = useState(false);
  return <section className="overlay-screen detail-screen"><button className="back-button" onClick={onBack}>← <span>戻る</span></button><div className="detail-hero"><div className="dish-illustration large"><span className="illustration-label">{dish.origin}</span><div className="plate"><div className={`plate-food food-${dish.foodElement}`} /><div className="plate-garnish" /></div><span className="dish-number">RY / {dish.id.slice(0, 2).toUpperCase()}</span></div><div className="detail-kicker"><span className="level-badge">{dish.adventureLevel}</span><span>{dish.cookingTime} · {dish.difficulty}</span></div><h1>{dish.name}</h1><p>{dish.description}</p></div><section className="detail-section"><div className="section-heading"><div><span className="eyebrow">料理の補助レイヤー</span><h2>4つの要素</h2></div></div><div className="element-grid">{categoryOrder.map((category) => <div key={category}><span>{categoryLabels[category]}</span><strong>{labelForId(dish[`${category === "food" ? "food" : category === "method" ? "cookingMethod" : category === "seasoning" ? "seasoning" : "texture"}Element`] as string)}</strong></div>)}</div></section><section className="reason-panel"><span className="eyebrow">WHY IT WORKS</span><h2>この組み合わせが<br />おいしい理由</h2><p>{dish.reasonWhyItWorks}</p></section><section className="detail-section ingredient-section"><div className="section-heading"><div><span className="eyebrow">台所にあるもの</span><h2>材料</h2></div></div><div className="ingredient-lines">{dish.ingredients.map((ingredient) => <span key={ingredient}>{ingredient}</span>)}</div></section><section className="detail-section steps-section"><div className="section-heading"><div><span className="eyebrow">ゆっくり、順番に</span><h2>調理手順</h2></div></div><ol>{dish.steps.map((step, index) => <li key={step}><span>0{index + 1}</span><p>{step}</p></li>)}</ol></section><section className="change-section"><button className="change-toggle" onClick={() => setChangeOpen(!changeOpen)}><span><span className="eyebrow">FLAVOR SHIFT</span><strong>味を変える</strong></span><span>{changeOpen ? "−" : "+"}</span></button>{changeOpen && <div className="change-options">{([ ["さっぱり", "texture"], ["香ばしく", "method"], ["辛さを加える", "seasoning"], ["食感を変える", "texture"] ] as [string, ElementCategory][]).map(([label, category]) => <button key={`${label}-${category}`} onClick={() => onTasteChange(category)}><span>{label}</span><small>→ {categoryLabels[category]}の頂点が動く</small></button>)}</div>}</section><section className="alternative-section"><span className="eyebrow">替えてもいいもの</span><div>{dish.alternatives.map((item) => <span key={item}>{item}</span>)}</div></section><div className="detail-actions"><button className="button button-outline" onClick={onSave}>{saved ? "保存済み" : "保存する"}</button><button className="button button-dark" onClick={onCook}>作ってみる <span>→</span></button></div></section>;
}

function RecordForm({ dish, saved, onBack, onSave }: { dish: Dish; saved: boolean; onBack: () => void; onSave: (log: RecordDraft) => void }) {
  const [rating, setRating] = useState(4);
  const [wantToCookAgain, setWantToCookAgain] = useState(4);
  const [difficultyRating, setDifficultyRating] = useState(3);
  const [familyReaction, setFamilyReaction] = useState("好評");
  const [memo, setMemo] = useState("");
  if (saved) return <section className="overlay-screen record-success"><div className="success-ring"><span>✓</span></div><span className="eyebrow">TASTE MAP UPDATED</span><h1>味覚マップに<br /><em>反映しました。</em></h1><p>あなたの料理の記憶が、<br />次の組み合わせのヒントになります。</p><div className="success-dots"><i /><i /><i /></div><button className="button button-dark button-wide" onClick={onBack}>記録を閉じる</button></section>;
  return <section className="overlay-screen record-form"><button className="back-button" onClick={onBack}>← <span>料理に戻る</span></button><div className="record-heading"><span className="eyebrow">30秒の料理記録</span><h1>{dish.name}</h1><p>短くても、次の提案を育てる記憶になります。</p></div><RatingField label="おいしかった度" value={rating} setValue={setRating} labels={["うーん", "普通", "また作る"]} /><RatingField label="また作りたい度" value={wantToCookAgain} setValue={setWantToCookAgain} labels={["一度でOK", "迷う", "ぜひ"]} /><div className="form-field"><span>簡単だった？</span><div className="segmented">{[1, 2, 3, 4, 5].map((value) => <button key={value} className={difficultyRating === value ? "selected" : ""} onClick={() => setDifficultyRating(value)}>{value}</button>)}</div></div><div className="form-field"><span>家族や同居人の反応</span><div className="reaction-row">{["好評", "ふつう", "次は工夫"].map((reaction) => <button key={reaction} className={familyReaction === reaction ? "selected" : ""} onClick={() => setFamilyReaction(reaction)}>{reaction}</button>)}</div></div><div className="form-field"><span>ひとことメモ <small>任意</small></span><textarea value={memo} onChange={(event) => setMemo(event.target.value)} placeholder="香り、食感、次に変えたいこと…" rows={3} /></div><div className="photo-placeholder"><span>＋</span><p>写真を追加 <small>今は後でOK</small></p></div><button className="button button-dark button-wide record-submit" onClick={() => onSave({ rating, wantToCookAgain, difficultyRating, familyReaction, memo })}>記録を保存する <span>→</span></button></section>;
}

function RatingField({ label, value, setValue, labels }: { label: string; value: number; setValue: (value: number) => void; labels: string[] }) {
  return <div className="form-field rating-field"><div className="form-label"><span>{label}</span><strong>{value} / 5</strong></div><div className="rating-row">{[1, 2, 3, 4, 5].map((item) => <button key={item} className={value >= item ? "filled" : ""} onClick={() => setValue(item)} aria-label={`${item}点`}>●</button>)}</div><div className="rating-labels"><span>{labels[0]}</span><span>{labels[1]}</span><span>{labels[2]}</span></div></div>;
}

function ProModal({ onClose }: { onClose: () => void }) {
  return <section className="pro-overlay"><button className="back-button" onClick={onClose}>× <span>あとで</span></button><div className="pro-emblem">PRO<br /><span>RYORI</span></div><span className="eyebrow">RYORI PRO</span><h1>味の地図を、<br /><em>もっと深く。</em></h1><p>あなたの冷蔵庫、家族の好み、まだ見ぬ味の領域まで。探索を、個人研究に。</p><div className="pro-list"><div><span>FREE</span><strong>無料版</strong><p>1日1件のパーソナル提案<br />基本的な四面体探索<br />料理保存20件まで<br />基本的な味覚マップ</p></div><div className="pro-plus"><span>PRO</span><strong>Pro版</strong><p>食材や調味料に応じた無制限提案<br />冷蔵庫の在庫を考慮した提案<br />家族ごとの味覚設定<br />詳細な味覚分析<br />専門家監修の探索コース<br />保存数無制限・広告なし</p></div></div><button className="button button-dark button-wide" onClick={onClose}>Proの詳細をあとで見る</button><small className="pro-note">決済はまだ始まりません。探索が育ったときにご案内します。</small></section>;
}

function BottomNav({ screen, onNavigate, onOpenTetra }: { screen: Screen; onNavigate: (screen: Screen) => void; onOpenTetra: () => void }) {
  return <nav className="bottom-nav" aria-label="メインナビゲーション"><button className={screen === "home" ? "active" : ""} onClick={() => onNavigate("home")}><span className="nav-glyph">⌂</span><small>ホーム</small></button><button className={screen === "tetra" ? "center active" : "center"} onClick={onOpenTetra}><span className="tetra-nav-glyph">◇</span><small>四面体</small></button><button className={screen === "explore" ? "active" : ""} onClick={() => onNavigate("explore")}><span className="nav-glyph">✦</span><small>探索</small></button><button className={screen === "record" ? "active" : ""} onClick={() => onNavigate("record")}><span className="nav-glyph">▤</span><small>記録</small></button><button className={screen === "taste" ? "active" : ""} onClick={() => onNavigate("taste")}><span className="nav-glyph">◈</span><small>マイ味覚</small></button></nav>;
}
