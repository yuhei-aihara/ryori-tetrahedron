"use client";

import { useMemo, useRef, useState, type CSSProperties, type FormEvent, type PointerEvent as ReactPointerEvent } from "react";
import {
  cookingElements,
  dishes,
  type Dish,
} from "./recipe-data";

type EntranceId = "food" | "method" | "type" | "region" | "mood" | "occasion";
type MapMode = "2d" | "3d";
type TetraFlowStep = "entrances" | "choices" | "refine";
type TetraScreenVariant = "test" | "production";
type TestCondition = {
  id: string;
  kind: EntranceId | "query";
  label: string;
  matches: (dish: Dish) => boolean;
};
type TestChoice = TestCondition & {
  note: string;
};

const entranceDefinitions: Array<{ id: EntranceId; label: string; note: string; icon: string }> = [
  { id: "food", label: "食材から", note: "冷蔵庫にあるもの", icon: "素材" },
  { id: "method", label: "作り方から", note: "火入れと手ざわり", icon: "火" },
  { id: "type", label: "料理の種類から", note: "主菜・副菜・一皿", icon: "皿" },
  { id: "region", label: "国・地域から", note: "世界の味を旅する", icon: "地" },
  { id: "mood", label: "気分・食感から", note: "今日の口あたり", icon: "香" },
  { id: "occasion", label: "時間・場面から", note: "平日・休日・食卓", icon: "時" },
];

const methodLabel: Record<string, string> = Object.fromEntries(cookingElements.method.map((item) => [item.id, item.name]));
const foodLabel: Record<string, string> = Object.fromEntries(cookingElements.food.map((item) => [item.id, item.name]));
const textureLabel: Record<string, string> = Object.fromEntries(cookingElements.texture.map((item) => [item.id, item.name]));
const seasoningLabel: Record<string, string> = Object.fromEntries(cookingElements.seasoning.map((item) => [item.id, item.name]));

function dishMinutes(dish: Dish) {
  const match = dish.cookingTime.match(/\d+/);
  return match ? Number(match[0]) : 99;
}

function dishTypes(dish: Dish) {
  const text = `${dish.name} ${dish.description}`;
  const types: string[] = [];
  if (/(スープ|煮込み|煮|カレー)/.test(text)) types.push("soup");
  if (/(サラダ|ガレット|フリット|焼き|蒸し|和え|炒め|冷菜)/.test(text) || ["potato", "eggplant", "mushroom", "tofu"].includes(dish.foodElement)) types.push("side");
  if (["chicken", "pork", "fish"].includes(dish.foodElement) && !types.includes("soup")) types.push("main");
  if (/(リゾット|パスタ|オムレツ|ガレット|焼き皿|カレー)/.test(text)) types.push("one-plate");
  return types.length ? types : ["side"];
}

function dishSearchText(dish: Dish) {
  return [
    dish.name,
    dish.description,
    dish.origin,
    dish.ingredients.join(" "),
    foodLabel[dish.foodElement],
    methodLabel[dish.cookingMethodElement],
    seasoningLabel[dish.seasoningElement],
    textureLabel[dish.textureElement],
  ].join(" ").toLocaleLowerCase();
}

const typeChoices: TestChoice[] = [
  { id: "side", kind: "type", label: "副菜", note: "食卓に添える一皿", matches: (dish) => dishTypes(dish).includes("side") },
  { id: "main", kind: "type", label: "主菜", note: "食事の中心になる料理", matches: (dish) => dishTypes(dish).includes("main") },
  { id: "one-plate", kind: "type", label: "一皿料理", note: "これだけで満足できる", matches: (dish) => dishTypes(dish).includes("one-plate") },
  { id: "soup", kind: "type", label: "汁物・煮込み", note: "温かさを食卓へ", matches: (dish) => dishTypes(dish).includes("soup") },
];

const regionChoices: TestChoice[] = [
  { id: "和食", kind: "region", label: "和食", note: "だし・米・季節の味", matches: (dish) => dish.origin === "和食" },
  { id: "洋食", kind: "region", label: "洋食", note: "焼き目・ハーブ・乳製品", matches: (dish) => dish.origin === "洋食" },
  { id: "中華", kind: "region", label: "中華", note: "香り・熱・うま味", matches: (dish) => dish.origin === "中華" },
  { id: "アジア", kind: "region", label: "アジア", note: "スパイス・酸味・香草", matches: (dish) => dish.origin === "アジア" },
];

const moodChoices: TestChoice[] = [
  { id: "light", kind: "mood", label: "軽く", note: "さっぱり、後味短く", matches: (dish) => dish.textureElement === "fresh" || dish.seasoningElement === "sour" },
  { id: "roasty", kind: "mood", label: "香ばしく", note: "焼き目と香りを足す", matches: (dish) => dish.textureElement === "roasty" },
  { id: "moist", kind: "mood", label: "しっとり", note: "水分を残してやさしく", matches: (dish) => dish.textureElement === "moist" },
  { id: "rich", kind: "mood", label: "コクを出す", note: "厚みとうま味を足す", matches: (dish) => dish.textureElement === "rich" },
  { id: "crunchy", kind: "mood", label: "カリッと", note: "音と歯ざわりを楽しむ", matches: (dish) => dish.textureElement === "crunchy" },
];

const occasionChoices: TestChoice[] = [
  { id: "15", kind: "occasion", label: "15分以内", note: "平日の短い時間で", matches: (dish) => dishMinutes(dish) <= 15 },
  { id: "30", kind: "occasion", label: "30分以内", note: "夕食にちょうどいい", matches: (dish) => dishMinutes(dish) <= 30 },
  { id: "easy", kind: "occasion", label: "かんたんに", note: "工程を少なく", matches: (dish) => dish.difficulty === "かんたん" },
  { id: "weekend", kind: "occasion", label: "休日にゆっくり", note: "少し時間をかけて", matches: (dish) => dishMinutes(dish) > 30 || dish.difficulty === "ふつう" },
];

const entranceChoices: Record<EntranceId, TestChoice[]> = {
  food: cookingElements.food.map((item) => ({ id: item.id, kind: "food", label: item.name, note: item.description, matches: (dish) => dish.foodElement === item.id })),
  method: cookingElements.method.map((item) => ({ id: item.id, kind: "method", label: item.name, note: item.description, matches: (dish) => dish.cookingMethodElement === item.id })),
  type: typeChoices,
  region: regionChoices,
  mood: moodChoices,
  occasion: occasionChoices,
};

const allChoices = [
  ...typeChoices,
  ...moodChoices,
  ...occasionChoices,
  ...regionChoices,
  ...entranceChoices.method,
  ...entranceChoices.food,
];

function conditionForQuery(query: string): TestCondition | null {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return null;
  return {
    id: `query:${normalized}`,
    kind: "query",
    label: `検索: ${query.trim()}`,
    matches: (dish) => normalized.split(/\s+/).every((term) => dishSearchText(dish).includes(term)),
  };
}

function ingredientSummary(dish: Dish) {
  return dish.ingredients.slice(0, 3).join("・");
}

function reasonForDish(dish: Dish, conditions: TestCondition[]) {
  const matched = conditions.filter((condition) => condition.kind !== "query" && condition.matches(dish)).map((condition) => `「${condition.label}」`);
  if (matched.length) return `${matched.join("と")}に近く、${dish.origin}らしい${textureLabel[dish.textureElement]}料理だから。`;
  return `${dish.origin}の${methodLabel[dish.cookingMethodElement]}料理。今の探索点から近い方向にあります。`;
}

function featureDistance(a: Dish, b: Dish) {
  return (a.foodElement === b.foodElement ? 0 : 2)
    + (a.cookingMethodElement === b.cookingMethodElement ? 0 : 1)
    + (a.seasoningElement === b.seasoningElement ? 0 : 1)
    + (a.textureElement === b.textureElement ? 0 : 1)
    + Math.abs(dishMinutes(a) - dishMinutes(b)) / 50;
}

function dishAccent(dish: Dish) {
  const accents: Record<string, string> = {
    chicken: "#b66b4f",
    pork: "#9b6e58",
    fish: "#658b91",
    tofu: "#b9a774",
    egg: "#c4a149",
    mushroom: "#80664f",
    eggplant: "#66546d",
    potato: "#b08a58",
  };
  return accents[dish.foodElement] ?? "#95775d";
}

function TestDishVisual({ dish, index }: { dish: Dish; index: number }) {
  return <div className={`test-dish-visual test-dish-visual-${index % 6}`} style={{ "--dish-accent": dishAccent(dish) } as CSSProperties}>
    <span className="test-dish-origin">{dish.origin}</span>
    <div className="test-dish-shadow" />
    <div className="test-dish-plate"><i /><i /><i /></div>
    <span className="test-dish-code">RY / {dish.id.slice(0, 2).toUpperCase()}</span>
  </div>;
}

function TestMap2D({ dishesToShow, selectedDishId, onSelect }: { dishesToShow: Dish[]; selectedDishId: string | null; onSelect: (dish: Dish) => void }) {
  const textureX: Record<string, number> = { fresh: 19, fluffy: 32, moist: 47, rich: 65, roasty: 78, crunchy: 88 };
  const methodY: Record<string, number> = { raw: 57, steam: 49, simmer: 42, stir: 34, grill: 26, fry: 19 };
  const positionFor = (dish: Dish) => ({ x: textureX[dish.textureElement] ?? 50, y: methodY[dish.cookingMethodElement] ?? 40 });
  const selected = dishesToShow.find((dish) => dish.id === selectedDishId) ?? dishesToShow[0];
  const selectedPosition = selected ? positionFor(selected) : null;
  return <div className="test-map-2d">
    <div className="test-map-axis-label axis-left">軽い</div><div className="test-map-axis-label axis-right">コクがある</div>
    <div className="test-map-axis-label axis-top">しっとり</div><div className="test-map-axis-label axis-bottom">香ばしい</div>
    <svg viewBox="0 0 100 70" role="img" aria-label="料理の特徴を表す2D料理地図">
      <line x1="8" y1="38" x2="92" y2="38" className="map-grid-line" /><line x1="50" y1="9" x2="50" y2="63" className="map-grid-line" />
      {selectedPosition && dishesToShow.filter((dish) => dish.id !== selected?.id).map((dish) => { const point = positionFor(dish); return <line key={`line-${dish.id}`} x1={selectedPosition.x} y1={selectedPosition.y} x2={point.x} y2={point.y} className="map-link-line" />; })}
      {dishesToShow.map((dish, index) => { const point = positionFor(dish); const isSelected = dish.id === selected?.id; return <g key={dish.id} className={`test-map-point ${isSelected ? "selected" : ""}`} transform={`translate(${point.x} ${point.y})`} onClick={() => onSelect(dish)} role="button" tabIndex={0}>
        <circle r={isSelected ? 4.4 : 3.1} style={{ fill: dishAccent(dish) }} /><circle r={isSelected ? 7.5 : 5.4} className="map-point-ring" />
        <text x={isSelected ? 6 : 5} y={index % 2 ? -5 : 10}>{dish.name.slice(0, 8)}</text>
      </g>; })}
    </svg>
    <div className="test-map-legend"><span><i className="map-legend-current" />選択中の料理</span><span><i className="map-legend-near" />近い料理</span></div>
  </div>;
}

type TestPoint3D = { x: number; y: number; z: number };
const testTetraVertices: TestPoint3D[] = [{ x: 1, y: 1, z: 1 }, { x: 1, y: -1, z: -1 }, { x: -1, y: 1, z: -1 }, { x: -1, y: -1, z: 1 }];
const testTetraEdges = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]];
const testTetraNames = ["火", "水", "空気", "油"];

function testDishTetraPoint(dish: Dish): TestPoint3D {
  const method: Record<string, number[]> = { grill: [0.78, 0.02, 0.04, 0.16], simmer: [0.12, 0.72, 0.03, 0.13], steam: [0.08, 0.76, 0.1, 0.06], fry: [0.12, 0.02, 0.05, 0.81], stir: [0.58, 0.03, 0.07, 0.32], raw: [0.02, 0.1, 0.74, 0.14] };
  const texture: Record<string, number[]> = { fresh: [0.02, 0.12, 0.7, 0.16], moist: [0.08, 0.54, 0.08, 0.3], rich: [0.12, 0.34, 0.04, 0.5], roasty: [0.68, 0.02, 0.08, 0.22], crunchy: [0.18, 0.02, 0.1, 0.7], fluffy: [0.3, 0.08, 0.5, 0.12] };
  const values = [0, 0, 0, 0];
  [method[dish.cookingMethodElement] ?? [0.34, 0.28, 0.18, 0.2], texture[dish.textureElement] ?? [0.34, 0.28, 0.18, 0.2]].forEach((profile, profileIndex) => profile.forEach((value, index) => { values[index] += value * (profileIndex ? 0.28 : 0.72); }));
  const total = values.reduce((sum, value) => sum + value, 0) || 1;
  return values.reduce((point, value, index) => ({ x: point.x + testTetraVertices[index].x * (value / total), y: point.y + testTetraVertices[index].y * (value / total), z: point.z + testTetraVertices[index].z * (value / total) }), { x: 0, y: 0, z: 0 });
}

function TestMap3D({ selected, related, onSelect }: { selected: Dish; related: Dish[]; onSelect: (dish: Dish) => void }) {
  const [rotation, setRotation] = useState({ x: 22, y: -8 });
  const drag = useRef<{ x: number; y: number; rotationX: number; rotationY: number } | null>(null);
  const rotate = (point: TestPoint3D) => {
    const yaw = (rotation.x * Math.PI) / 180;
    const pitch = (rotation.y * Math.PI) / 180;
    const x = point.x * Math.cos(yaw) + point.z * Math.sin(yaw);
    const z = -point.x * Math.sin(yaw) + point.z * Math.cos(yaw);
    return { x, y: point.y * Math.cos(pitch) - z * Math.sin(pitch), z: point.y * Math.sin(pitch) + z * Math.cos(pitch) };
  };
  const project = (point: TestPoint3D) => { const rotated = rotate(point); return { x: 160 + rotated.x * 72, y: 118 - rotated.y * 72, z: rotated.z }; };
  const vertices = testTetraVertices.map(project);
  const selectedPoint = project(testDishTetraPoint(selected));
  const relatedPoints = related.map((dish) => ({ dish, point: project(testDishTetraPoint(dish)) }));
  const handleDown = (event: ReactPointerEvent<SVGSVGElement>) => { event.currentTarget.setPointerCapture(event.pointerId); drag.current = { x: event.clientX, y: event.clientY, rotationX: rotation.x, rotationY: rotation.y }; };
  const handleMove = (event: ReactPointerEvent<SVGSVGElement>) => { if (!drag.current) return; setRotation({ x: drag.current.rotationX + (event.clientX - drag.current.x) * 0.55, y: Math.max(-48, Math.min(48, drag.current.rotationY - (event.clientY - drag.current.y) * 0.45)) }); };
  const handleUp = (event: ReactPointerEvent<SVGSVGElement>) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); drag.current = null; };
  return <div className="test-map-3d"><div className="test-3d-note">現在の料理と、地図上のご近所だけを表示しています。ドラッグで回転できます。</div><svg viewBox="0 0 320 245" role="img" aria-label="選択した料理と関連料理の3D四面体" onPointerDown={handleDown} onPointerMove={handleMove} onPointerUp={handleUp} onPointerCancel={handleUp}>
    <g className="test-tetra-faces"><polygon points={[0, 1, 2].map((index) => `${vertices[index].x},${vertices[index].y}`).join(" ")} /><polygon points={[0, 1, 3].map((index) => `${vertices[index].x},${vertices[index].y}`).join(" ")} /><polygon points={[0, 2, 3].map((index) => `${vertices[index].x},${vertices[index].y}`).join(" ")} /><polygon points={[1, 2, 3].map((index) => `${vertices[index].x},${vertices[index].y}`).join(" ")} /></g>
    <g className="test-tetra-edges">{testTetraEdges.map(([from, to]) => <line key={`${from}-${to}`} x1={vertices[from].x} y1={vertices[from].y} x2={vertices[to].x} y2={vertices[to].y} />)}</g>
    <g className="test-tetra-vertices">{vertices.map((point, index) => <g key={testTetraNames[index]}><circle cx={point.x} cy={point.y} r="5" /><text x={point.x + 8} y={point.y - 6}>{testTetraNames[index]}</text></g>)}</g>
    {relatedPoints.map(({ dish, point }) => <g key={dish.id} className="test-3d-related-point" transform={`translate(${point.x} ${point.y})`} onClick={() => onSelect(dish)} role="button" tabIndex={0}><circle r="7" /><circle r="3" /><text x="9" y="3">{dish.name.slice(0, 9)}</text></g>)}
    <g className="test-3d-selected-point" transform={`translate(${selectedPoint.x} ${selectedPoint.y})`}><circle r="12" /><circle r="5" /><text x="12" y="4">{selected.name.slice(0, 10)}</text></g>
  </svg><div className="test-3d-legend"><span>火・水・空気・油</span><span>選択料理 1皿 + 関連料理 {related.length}皿</span></div></div>;
}

function TestRecipePanel({ dish, onClose, saved, onSave, onCook }: { dish: Dish; onClose: () => void; saved: boolean; onSave?: () => void; onCook?: () => void }) {
  return <div className="test-recipe-panel" role="dialog" aria-label={`${dish.name}のレシピ`}><div className="test-recipe-panel-heading"><div><span className="test-eyebrow">レシピを見る</span><h2>{dish.name}</h2></div><button className="test-close-button" onClick={onClose}>閉じる</button></div><p>{dish.description}</p><div className="test-recipe-meta"><span>{dish.cookingTime}</span><span>{dish.difficulty}</span><span>{dish.origin}</span></div><div className="test-recipe-grid"><div><b>材料</b><p>{dish.ingredients.join("・")}</p></div><div><b>手順</b><ol>{dish.steps.slice(0, 3).map((step) => <li key={step}>{step}</li>)}</ol></div></div>{(onSave || onCook) && <div className="test-recipe-actions">{onCook && <button className="test-recipe-cook" onClick={onCook}>作ってみる</button>}{onSave && <button className="test-recipe-save" onClick={onSave}>{saved ? "保存済み" : "保存する"}</button>}</div>}</div>;
}

export default function TetraTestScreen({ variant = "production", savedDishIds = [], onSave, onCook }: { variant?: TetraScreenVariant; savedDishIds?: string[]; onSave?: (dish: Dish) => void; onCook?: (dish: Dish) => void }) {
  const [query, setQuery] = useState("");
  const [conditions, setConditions] = useState<TestCondition[]>([]);
  const [activeEntrance, setActiveEntrance] = useState<EntranceId>("food");
  const [flowStep, setFlowStep] = useState<TetraFlowStep>("entrances");
  const [selectedDishId, setSelectedDishId] = useState<string | null>(null);
  const [mapMode, setMapMode] = useState<MapMode>("2d");
  const [recipeDish, setRecipeDish] = useState<Dish | null>(null);

  const exactMatches = useMemo(() => dishes.filter((dish) => conditions.every((condition) => condition.matches(dish))), [conditions]);
  const rankedMatches = useMemo(() => dishes.map((dish, index) => {
    const matched = conditions.filter((condition) => condition.matches(dish)).length;
    const searchBoost = conditions.some((condition) => condition.kind === "query" && condition.matches(dish)) ? 2 : 0;
    return { dish, score: matched * 10 + searchBoost - index / 1000 };
  }).sort((a, b) => b.score - a.score).map(({ dish }) => dish), [conditions]);
  const resultDishes = useMemo(() => {
    const exact = exactMatches.slice(0, 3);
    if (exact.length >= 3 || conditions.length === 0) return exact.length ? exact : rankedMatches.slice(0, 3);
    return [...exact, ...rankedMatches.filter((dish) => !exact.some((item) => item.id === dish.id))].slice(0, 3);
  }, [conditions.length, exactMatches, rankedMatches]);
  const relaxed = conditions.length > 0 && exactMatches.length === 0;
  const selectedDish = dishes.find((dish) => dish.id === selectedDishId) ?? resultDishes[0] ?? dishes[0];

  const relatedDishes = useMemo(() => {
    if (!selectedDish) return [];
    return dishes.filter((dish) => dish.id !== selectedDish.id).sort((a, b) => featureDistance(selectedDish, a) - featureDistance(selectedDish, b)).slice(0, 2);
  }, [selectedDish]);
  const mapDishes = selectedDish ? [selectedDish, ...relatedDishes] : resultDishes;

  const nextChoices = useMemo(() => {
    const usedKinds = new Set(conditions.filter((condition) => condition.kind !== "query").map((condition) => condition.kind));
    return allChoices.filter((choice, index, choices) => !usedKinds.has(choice.kind) && choices.findIndex((item) => item.id === choice.id && item.kind === choice.kind) === index).map((choice) => ({ choice, count: dishes.filter((dish) => [...conditions.filter((condition) => condition.kind !== choice.kind), choice].every((condition) => condition.matches(dish))).length })).sort((a, b) => b.count - a.count).slice(0, 4);
  }, [conditions]);

  const addCondition = (condition: TestCondition, nextStep: TetraFlowStep = "refine") => {
    setConditions((current) => [...current.filter((item) => item.kind !== condition.kind), condition]);
    setSelectedDishId(null);
    if (condition.kind !== "query") {
      setActiveEntrance(condition.kind);
      setFlowStep(nextStep);
    } else {
      setFlowStep(nextStep);
    }
  };
  const submitQuery = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const condition = conditionForQuery(query);
    if (condition) addCondition(condition, "entrances");
  };
  const removeCondition = (condition: TestCondition) => {
    setConditions((current) => current.filter((item) => item.id !== condition.id));
    if (condition.kind === "query") setQuery("");
    if (condition.kind !== "query") {
      setActiveEntrance(condition.kind);
      setFlowStep("choices");
    }
  };
  const openEntrance = (entrance: EntranceId) => {
    setActiveEntrance(entrance);
    setFlowStep("choices");
  };
  const goBackInFlow = () => setFlowStep((current) => current === "refine" ? "choices" : "entrances");
  const focusMap = (dish: Dish) => {
    setSelectedDishId(dish.id);
    window.setTimeout(() => document.getElementById("test-map")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };
  const pathItems = [...conditions.filter((condition) => condition.kind !== "query").map((condition) => condition.label), ...(selectedDish ? [selectedDish.name] : [])];

  return <main className="tetra-test-shell"><div className="tetra-test-page">
    <header className="tetra-test-header"><div><span className="test-eyebrow">{variant === "test" ? "RYORI / TETRA V2 · TEST" : "RYORI / 料理の地図"}</span>{variant === "test" && <a className="test-back-link" href={typeof window === "undefined" ? "/" : window.location.pathname}>現行版へ戻る</a>}</div><h1>今日は何を<br /><em>作りたいですか？</em></h1><p>料理名でも、食材でも、国でも、食感でも。決まっているところから歩きはじめます。</p><form className="test-search-form" onSubmit={submitQuery}><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="例：じゃがいも、ガレット、韓国、香ばしい" aria-label="料理を検索" /><button type="submit">探す</button></form><div className="test-header-conditions"><span className="test-eyebrow">CURRENT SEARCH</span><div className="test-condition-chips">{conditions.length ? conditions.map((condition) => <button key={condition.id} className="test-condition-chip" onClick={() => removeCondition(condition)}>{condition.label} <b>×</b></button>) : <span className="test-empty-condition">条件はあとから追加できます</span>}</div></div></header>

    <section className="test-section test-entrance-section"><div className="test-section-heading"><div><span className="test-eyebrow">SEARCH FROM HERE</span><h2>いま決まっていることから探す</h2></div><span className="test-result-count">{conditions.length ? `${exactMatches.length || resultDishes.length}件` : `${dishes.length}皿`}</span></div>{flowStep === "entrances" && <div className="test-entrance-grid">{entranceDefinitions.map((entrance) => <button key={entrance.id} className={`test-entrance-button ${activeEntrance === entrance.id ? "active" : ""}`} onClick={() => openEntrance(entrance.id)}><span className="test-entrance-icon">{entrance.icon}</span><span><strong>{entrance.label}</strong><small>{entrance.note}</small></span><b>＋</b></button>)}</div>}{flowStep === "choices" && <div className="test-choice-drawer test-flow-drawer"><div className="test-flow-current"><span>入口を選択中</span><button className="test-flow-back" onClick={goBackInFlow}>← 入口を選び直す</button></div><div className="test-choice-heading"><span>{entranceDefinitions.find((item) => item.id === activeEntrance)?.label}</span><small>ここからひとつ選びます</small></div><div className="test-choice-list">{entranceChoices[activeEntrance].map((choice) => <button key={`${choice.kind}-${choice.id}`} className={conditions.some((condition) => condition.kind === choice.kind && condition.id === choice.id) ? "selected" : ""} onClick={() => addCondition(choice)}><span><strong>{choice.label}</strong><small>{choice.note}</small></span><b>→</b></button>)}</div></div>}{flowStep === "refine" && <div className="test-choice-drawer test-flow-drawer"><div className="test-flow-current"><span>次の条件をひとつ選ぶ</span><button className="test-flow-back" onClick={goBackInFlow}>← {entranceDefinitions.find((item) => item.id === activeEntrance)?.label}に戻る</button></div><div className="test-choice-heading"><span>次に絞るなら</span><small>選ぶと何件になるか</small></div><div className="test-next-list">{nextChoices.map(({ choice, count }) => <button key={`${choice.kind}-${choice.id}`} onClick={() => addCondition(choice)}><span>{choice.label}</span><small>{count}件</small><b>＋</b></button>)}</div></div>}</section>

    <section className="test-section test-discovery-section"><div className="test-path"><span className="test-eyebrow">SEARCH PATH</span><div>{pathItems.length ? pathItems.map((item, index) => <span key={`${item}-${index}`}><b>{item}</b>{index < pathItems.length - 1 && <i>→</i>}</span>) : <span><b>料理を探しはじめる</b></span>}</div></div></section>

    <section className="test-section test-results-section"><div className="test-results-heading"><div><span className="test-eyebrow">RECIPES AROUND HERE</span><h2>{relaxed ? "近い方向の料理" : "料理候補"} <em>{exactMatches.length || resultDishes.length}</em></h2></div><p>{relaxed ? "条件が重なりすぎたので、一つだけゆるめた近い候補です。" : "条件は全部決めなくて大丈夫。今の地図から近い順に並べています。"}</p></div><div className="test-dish-list">{resultDishes.map((dish, index) => <article className={`test-dish-card ${selectedDish?.id === dish.id ? "selected" : ""}`} key={dish.id}><TestDishVisual dish={dish} index={index} /><div className="test-dish-copy"><div className="test-dish-meta"><span>{dish.origin}</span><span>{dish.cookingTime}</span><span>{dish.difficulty}</span></div><h3>{dish.name}</h3><p>{dish.description}</p><dl><div><dt>主な食材</dt><dd>{ingredientSummary(dish)}</dd></div><div><dt>作り方</dt><dd>{methodLabel[dish.cookingMethodElement]}</dd></div></dl><p className="test-reason"><b>推薦理由</b>{reasonForDish(dish, conditions)}</p><div className="test-card-actions"><button className="test-recipe-button" onClick={() => setRecipeDish(dish)}>レシピを見る <span>→</span></button><button className="test-map-button" onClick={() => focusMap(dish)}>料理の地図で見る <span>◇</span></button>{onSave && <button className="test-save-card-button" onClick={() => onSave(dish)}>{savedDishIds.includes(dish.id) ? "保存済み" : "保存"}</button>}</div></div></article>)}</div></section>

    {selectedDish && <section className="test-section test-map-section" id="test-map"><div className="test-map-heading"><div><span className="test-eyebrow">THE COOKING MAP</span><h2>料理の地図</h2><p>{selectedDish.name}から、近い料理の方向を見てみる</p></div><div className="test-map-mode"><button className={mapMode === "2d" ? "active" : ""} onClick={() => setMapMode("2d")}>2Dで見る</button><button className={mapMode === "3d" ? "active" : ""} onClick={() => setMapMode("3d")}>立体で見る</button></div></div>{mapMode === "2d" ? <TestMap2D dishesToShow={mapDishes} selectedDishId={selectedDish.id} onSelect={(dish) => setSelectedDishId(dish.id)} /> : <TestMap3D selected={selectedDish} related={relatedDishes} onSelect={(dish) => setSelectedDishId(dish.id)} />}<div className="test-map-shift"><span className="test-eyebrow">この料理から動く</span><div><button onClick={() => addCondition(moodChoices[1])}>もっと香ばしく</button><button onClick={() => addCondition(moodChoices[2])}>もっとしっとり</button><button onClick={() => addCondition(moodChoices[0])}>もっと軽く</button><button onClick={() => addCondition(moodChoices[3])}>もっとコクを出す</button></div></div></section>}

    {recipeDish && <TestRecipePanel dish={recipeDish} saved={savedDishIds.includes(recipeDish.id)} onSave={onSave ? () => onSave(recipeDish) : undefined} onCook={onCook ? () => onCook(recipeDish) : undefined} onClose={() => setRecipeDish(null)} />}
    <footer className="tetra-test-footer"><span>{variant === "test" ? "テスト版 / 検索体験と料理の地図の検証用" : "料理の地図 / 発見の入口"}</span><span>{dishes.length}皿の料理データ</span></footer>
  </div></main>;
}
