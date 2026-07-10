"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type PointerEvent as ReactPointerEvent } from "react";
import {
  categoryDescriptions,
  categoryLabels,
  cookingElements,
  defaultSelection,
  defaultUser,
  dishes,
  findElement,
  getDishById,
  initialChallenges,
  type AdventureLevel,
  type CookingLog,
  type Dish,
  type ElementCategory,
  type User,
} from "./recipe-data";

type Screen = "home" | "tetra" | "explore" | "record" | "taste";
type Overlay = "detail" | "record" | "pro" | null;
type RecordDraft = Pick<CookingLog, "rating" | "wantToCookAgain" | "difficultyRating" | "familyReaction" | "memo">;

const categoryOrder: ElementCategory[] = ["food", "method", "seasoning", "texture"];

const onboardingSlides = [
  {
    eyebrow: "RYORI / 01",
    title: "料理は、\n組み合わせから生まれる",
    body: "いつもの食材も、火入れや味の軸を変えるだけで、まだ知らない一皿になります。",
    visual: "orbit",
  },
  {
    eyebrow: "RYORI / 02",
    title: "4つの頂点を、\n触って動かそう",
    body: "食材・調理法・味付け・食感。4つの要素を選ぶと、料理の可能性が広がります。",
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

function rankDishes(selection: Record<ElementCategory, string>, level?: AdventureLevel) {
  return dishes
    .map((dish) => {
      const score = categoryOrder.reduce(
        (total, category) =>
          total +
          (dish[`${category === "food" ? "food" : category === "method" ? "cookingMethod" : category === "seasoning" ? "seasoning" : "texture"}Element`] as string) === selection[category]
            ? 1
            : 0,
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
  const [activeDish, setActiveDish] = useState<Dish | null>(null);
  const [whyOpen, setWhyOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [recordSaved, setRecordSaved] = useState(false);
  const [rotation, setRotation] = useState(0);
  const dragStart = useRef<number | null>(null);

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

  const homeCandidates = useMemo(() => rankDishes(defaultSelection, dailyLevel), [dailyLevel]);
  const suggestions = useMemo(() => rankDishes(selection).slice(0, 3), [selection]);
  const savedDishes = useMemo(() => savedDishIds.map(getDishById), [savedDishIds]);
  const mapGrowth = Math.min(92, 22 + logs.length * 14 + savedDishIds.length * 3);
  const currentHomeDish = homeCandidates[0];

  if (!hydrated) {
    return <div className="boot-screen"><span className="boot-mark">R</span><span>味の地図をひらいています</span></div>;
  }

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

  const showMain = overlay === null;

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
            onSelect={updateSelection}
            rotation={rotation}
            onPointerDown={(event: ReactPointerEvent<HTMLDivElement>) => { dragStart.current = event.clientX; }}
            onPointerMove={(event: ReactPointerEvent<HTMLDivElement>) => {
              if (dragStart.current === null) return;
              setRotation((current) => current + (event.clientX - dragStart.current!) * 0.2);
              dragStart.current = event.clientX;
            }}
            onPointerUp={() => { dragStart.current = null; }}
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
          <TasteScreen user={user} logs={logs} mapGrowth={mapGrowth} challenges={challenges} onOpenPro={() => setOverlay("pro")} />
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
  user, dailyLevel, setDailyLevel, dish, whyOpen, setWhyOpen, savedDishes, mapGrowth, onExplore, onOpenDish, onSave, savedDishIds,
}: {
  user: User; dailyLevel: AdventureLevel; setDailyLevel: (level: AdventureLevel) => void; dish: Dish; whyOpen: boolean; setWhyOpen: (open: boolean) => void; savedDishes: Dish[]; mapGrowth: number; onExplore: () => void; onOpenDish: (dish: Dish) => void; onSave: (dish: Dish) => void; savedDishIds: string[];
}) {
  return <section className="screen home-screen">
    <TopBar eyebrow="土曜日 / 07月11日" title={`おかえりなさい、${user.name}`} note="4日連続" />
    <div className="home-intro"><span className="home-kicker">TODAY&apos;S TASTE STUDY</span><p>今日は、ひとつだけ<br /><em>いつもと違う軸</em>を選ぶ日。</p></div>
    <section className="idea-section">
      <div className="section-heading"><div><span className="eyebrow">今日の料理アイデア</span><h2>気分に合わせて、ひと皿。</h2></div><span className="section-index">01 / 03</span></div>
      <div className="level-tabs">{(["定番", "ちょっと冒険", "意外"] as AdventureLevel[]).map((level) => <button key={level} className={dailyLevel === level ? "selected" : ""} onClick={() => setDailyLevel(level)}>{level}</button>)}</div>
      <DishFeature dish={dish} whyOpen={whyOpen} setWhyOpen={setWhyOpen} saved={savedDishIds.includes(dish.id)} onOpen={() => onOpenDish(dish)} onSave={() => onSave(dish)} />
    </section>
    <button className="button button-dark button-wide explore-cta" onClick={onExplore}><span className="cta-orbit">◇</span>四面体を動かしてみる<span>→</span></button>
    <section className="home-lower">
      <div className="section-heading"><div><span className="eyebrow">最近の記録</span><h2>保存した料理</h2></div><span className="small-link">{savedDishes.length}件</span></div>
      {savedDishes.length === 0 ? <div className="empty-note"><span>○</span><p>気になる組み合わせを保存すると、<br />ここに並びます。</p></div> : <div className="saved-list">{savedDishes.slice(0, 2).map((saved) => <DishRow key={saved.id} dish={saved} onOpen={() => onOpenDish(saved)} />)}</div>}
    </section>
    <section className="stats-strip"><div><span>探索レベル</span><strong>Lv.{user.explorationLevel}</strong></div><div><span>味覚マップ</span><strong>{mapGrowth}%</strong></div><div><span>連続利用</span><strong>{user.streak}日</strong></div></section>
  </section>;
}

function DishFeature({ dish, whyOpen, setWhyOpen, saved, onOpen, onSave }: { dish: Dish; whyOpen: boolean; setWhyOpen: (open: boolean) => void; saved: boolean; onOpen: () => void; onSave: () => void }) {
  return <article className="dish-feature" onClick={onOpen}>
    <div className="dish-illustration"><span className="illustration-label">{dish.origin}</span><div className="plate"><div className="plate-food food-{dish.foodElement}" /><div className="plate-garnish" /></div><span className="dish-number">A / 01</span></div>
    <div className="dish-feature-copy"><div className="dish-meta"><span className="level-badge">{dish.adventureLevel}</span><span>{dish.cookingTime} · {dish.difficulty}</span></div><h3>{dish.name}</h3><p>{dish.description}</p><div className="tetra-mini-tags">{[dish.foodElement, dish.cookingMethodElement, dish.seasoningElement, dish.textureElement].map((id) => <span key={id}>{labelForId(id)}</span>)}</div><div className="dish-actions"><button className="why-button" onClick={(event) => { event.stopPropagation(); setWhyOpen(!whyOpen); }}>なぜ合う？ <span>⌄</span></button><button className={`save-button ${saved ? "saved" : ""}`} aria-label="保存" onClick={(event) => { event.stopPropagation(); onSave(); }}>{saved ? "保存済み" : "＋ 保存"}</button></div>{whyOpen && <div className="why-box" onClick={(event) => event.stopPropagation()}><span>相性メモ</span>{dish.reasonWhyItWorks}</div>}</div>
  </article>;
}

function DishRow({ dish, onOpen }: { dish: Dish; onOpen: () => void }) {
  return <button className="dish-row" onClick={onOpen}><span className={`row-mark mark-${dish.foodElement}`} /><span><strong>{dish.name}</strong><small>{dish.origin} · {dish.cookingTime}</small></span><span className="row-arrow">↗</span></button>;
}

function TetraScreen({ selection, activeCategory, setActiveCategory, onSelect, rotation, onPointerDown, onPointerMove, onPointerUp, onRandomize, onNudge, onSearch, suggestions, onOpenDish, onSave, savedDishIds }: {
  selection: Record<ElementCategory, string>; activeCategory: ElementCategory; setActiveCategory: (category: ElementCategory) => void; onSelect: (category: ElementCategory, id: string) => void; rotation: number; onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void; onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void; onPointerUp: () => void; onRandomize: () => void; onNudge: () => void; onSearch: () => void; suggestions: Dish[]; onOpenDish: (dish: Dish) => void; onSave: (dish: Dish) => void; savedDishIds: string[];
}) {
  const labels = activeElementsFor(selection);
  return <section className="screen tetra-screen">
    <TopBar eyebrow="発見 / 01" title="四面体を動かす" note="ドラッグできます" />
    <p className="screen-lead">4つの頂点を選ぶと、<br />料理の可能性がリアルタイムに変わります。</p>
    <div className="tetra-stage-wrap"><div className="drag-hint">← スワイプして回転 →</div><div className="tetra-stage" style={{ transform: `rotate(${rotation * 0.08}deg)` }} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
      <div className="edge edge-tl" /><div className="edge edge-tr" /><div className="edge edge-tb" /><div className="edge edge-lr" /><div className="edge edge-lb" /><div className="edge edge-rb" />
      {labels.map(({ category, element }, index) => <button key={category} className={`vertex vertex-${index} vertex-${category} ${activeCategory === category ? "active" : ""}`} onClick={() => setActiveCategory(category)}><span className="vertex-dot" /><span className="vertex-tag"><small>{categoryLabels[category]}</small>{element.name}</span></button>)}
      <div className="tetra-center"><span>味の<br />関係図</span></div>
    </div></div>
    <div className="selected-axis"><span className="eyebrow">選択中の頂点</span><strong>{categoryLabels[activeCategory]}</strong><span>{categoryDescriptions[activeCategory]}</span></div>
    <div className="choice-scroller">{cookingElements[activeCategory].map((item) => <button key={item.id} className={selection[activeCategory] === item.id ? "selected" : ""} onClick={() => onSelect(activeCategory, item.id)}><i style={{ backgroundColor: item.color }} />{item.name}</button>)}</div>
    <div className="tetra-actions"><button className="button button-outline" onClick={onRandomize}>おまかせ <span>↻</span></button><button className="button button-outline" onClick={onNudge}>少し変える <span>↗</span></button></div><button className="button button-dark button-wide search-combination" onClick={onSearch}>この組み合わせで探す <span>→</span></button>
    <div className="result-header"><div><span className="eyebrow">この組み合わせから</span><h2>料理候補 <em>03</em></h2></div><button className="text-button result-link">一覧を見る</button></div>
    <div className="suggestion-stack">{suggestions.map((dish, index) => <SuggestionCard key={dish.id} dish={dish} index={index} onOpen={() => onOpenDish(dish)} onSave={() => onSave(dish)} saved={savedDishIds.includes(dish.id)} />)}</div>
  </section>;
}

function activeElementsFor(selection: Record<ElementCategory, string>) {
  return categoryOrder.map((category) => ({ category, element: findElement(category, selection[category]) }));
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

function TasteScreen({ user, logs, mapGrowth, challenges, onOpenPro }: { user: User; logs: CookingLog[]; mapGrowth: number; challenges: typeof initialChallenges; onOpenPro: () => void }) {
  const completed = challenges.filter((item) => item.completed).length;
  return <section className="screen taste-screen"><TopBar eyebrow="マイ味覚 / 05" title="味の地図" note={`Lv.${user.explorationLevel}`} /><div className="taste-intro"><span className="eyebrow">あなたの傾向</span><h2>香ばしい焼き料理を<br /><em>好む傾向があります。</em></h2><p>保存と記録が増えるほど、あなたの地図は細やかになります。</p></div><div className="radar-panel"><div className="radar-chart"><div className="radar-grid grid-one" /><div className="radar-grid grid-two" /><div className="radar-grid grid-three" /><div className="radar-fill" /><span className="radar-label radar-top">味付け</span><span className="radar-label radar-right">食感</span><span className="radar-label radar-bottom">食材</span><span className="radar-label radar-left">調理法</span></div><div className="radar-caption"><span>味覚マップ / 現在地</span><strong>{mapGrowth}%</strong><small>{logs.length ? `${logs.length}件の記録から分析` : "まずは1皿、記録してみましょう"}</small></div></div><div className="taste-facts"><div><span>好きな味付け</span><strong>酸味・うま味</strong></div><div><span>好きな調理法</span><strong>焼く・蒸す</strong></div><div><span>よく使う食材</span><strong>鶏肉・きのこ</strong></div><div><span>好きな食感</span><strong>香ばしい</strong></div></div><section className="unknown-area"><div className="section-heading"><div><span className="eyebrow">まだ白い領域</span><h2>次に開ける場所</h2></div><span className="section-index">04 AXIS</span></div><div className="unknown-map"><span className="unknown-dot dot-a" /><span className="unknown-dot dot-b" /><span className="unknown-dot dot-c" /><p>辛味 × 生で仕上げる<br />ふわふわ × 魚</p><small>未知の組み合わせが、2つ残っています</small></div></section><section className="discovery-note"><span className="eyebrow">今月の新しい発見</span><strong>{completed + 1}つ</strong><p>普段選ばない方向へ動いた回数</p></section><button className="pro-inline" onClick={onOpenPro}><span><b>PRO</b> 詳細な味覚分析</span><span>→</span></button></section>;
}

function DishDetail({ dish, saved, onBack, onSave, onCook, onTasteChange }: { dish: Dish; saved: boolean; onBack: () => void; onSave: () => void; onCook: () => void; onTasteChange: (category: ElementCategory) => void }) {
  const [changeOpen, setChangeOpen] = useState(false);
  return <section className="overlay-screen detail-screen"><button className="back-button" onClick={onBack}>← <span>戻る</span></button><div className="detail-hero"><div className="dish-illustration large"><span className="illustration-label">{dish.origin}</span><div className="plate"><div className={`plate-food food-${dish.foodElement}`} /><div className="plate-garnish" /></div><span className="dish-number">RY / {dish.id.slice(0, 2).toUpperCase()}</span></div><div className="detail-kicker"><span className="level-badge">{dish.adventureLevel}</span><span>{dish.cookingTime} · {dish.difficulty}</span></div><h1>{dish.name}</h1><p>{dish.description}</p></div><section className="detail-section"><div className="section-heading"><div><span className="eyebrow">この料理の四面体</span><h2>4つの要素</h2></div></div><div className="element-grid">{categoryOrder.map((category) => <div key={category}><span>{categoryLabels[category]}</span><strong>{labelForId(dish[`${category === "food" ? "food" : category === "method" ? "cookingMethod" : category === "seasoning" ? "seasoning" : "texture"}Element`] as string)}</strong></div>)}</div></section><section className="reason-panel"><span className="eyebrow">WHY IT WORKS</span><h2>この組み合わせが<br />おいしい理由</h2><p>{dish.reasonWhyItWorks}</p></section><section className="detail-section ingredient-section"><div className="section-heading"><div><span className="eyebrow">台所にあるもの</span><h2>材料</h2></div></div><div className="ingredient-lines">{dish.ingredients.map((ingredient) => <span key={ingredient}>{ingredient}</span>)}</div></section><section className="detail-section steps-section"><div className="section-heading"><div><span className="eyebrow">ゆっくり、順番に</span><h2>調理手順</h2></div></div><ol>{dish.steps.map((step, index) => <li key={step}><span>0{index + 1}</span><p>{step}</p></li>)}</ol></section><section className="change-section"><button className="change-toggle" onClick={() => setChangeOpen(!changeOpen)}><span><span className="eyebrow">FLAVOR SHIFT</span><strong>味を変える</strong></span><span>{changeOpen ? "−" : "+"}</span></button>{changeOpen && <div className="change-options">{([ ["さっぱり", "texture"], ["香ばしく", "method"], ["辛さを加える", "seasoning"], ["食感を変える", "texture"] ] as [string, ElementCategory][]).map(([label, category]) => <button key={`${label}-${category}`} onClick={() => onTasteChange(category)}><span>{label}</span><small>→ {categoryLabels[category]}の頂点が動く</small></button>)}</div>}</section><section className="alternative-section"><span className="eyebrow">替えてもいいもの</span><div>{dish.alternatives.map((item) => <span key={item}>{item}</span>)}</div></section><div className="detail-actions"><button className="button button-outline" onClick={onSave}>{saved ? "保存済み" : "保存する"}</button><button className="button button-dark" onClick={onCook}>作ってみる <span>→</span></button></div></section>;
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
