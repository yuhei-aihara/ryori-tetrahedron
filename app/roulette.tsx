"use client";

import { useEffect, useRef, useState } from "react";
import { cookingElements, dishes, type Dish, type ElementCategory } from "./recipe-data";

type RouletteTime = "all" | "30" | "15";
type RouletteEffort = "all" | "easy" | "steady";
type ShiftDirection = "roasty" | "light" | "moist" | "rich";

function dishMinutes(dish: Dish) {
  const match = dish.cookingTime.match(/\d+/);
  return match ? Number(match[0]) : 99;
}

function filteredDishes(time: RouletteTime, effort: RouletteEffort) {
  return dishes.filter((dish) => {
    const withinTime = time === "all" || dishMinutes(dish) <= Number(time);
    const withinEffort = effort === "all" || (effort === "easy" ? dish.difficulty === "かんたん" : dish.difficulty === "ふつう");
    return withinTime && withinEffort;
  });
}

function rouletteAccent(dish: Dish) {
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

function elementLabel(id: string) {
  return (Object.keys(cookingElements) as ElementCategory[]).flatMap((category) => cookingElements[category]).find((element) => element.id === id)?.name ?? id;
}

type Point3D = { x: number; y: number; z: number };
type ProjectedPoint = Point3D & { depth: number };

const tetraVertices: Point3D[] = [
  { x: 0, y: -1, z: 0 },
  { x: -0.943, y: 0.333, z: 0 },
  { x: 0.471, y: 0.333, z: 0.816 },
  { x: 0.471, y: 0.333, z: -0.816 },
];
const tetraFaces = [[0, 1, 2], [0, 2, 3], [0, 3, 1], [1, 3, 2]];
const tetraEdges = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]];
const tetraVertexLabels = ["火", "水", "油", "空気"];

function rotatePoint(point: Point3D, rotation: { x: number; y: number }) {
  const cosY = Math.cos(rotation.y);
  const sinY = Math.sin(rotation.y);
  const yawX = point.x * cosY + point.z * sinY;
  const yawZ = -point.x * sinY + point.z * cosY;
  const cosX = Math.cos(rotation.x);
  const sinX = Math.sin(rotation.x);
  return { x: yawX, y: point.y * cosX - yawZ * sinX, z: point.y * sinX + yawZ * cosX };
}

function projectPoint(point: Point3D, rotation: { x: number; y: number }): ProjectedPoint {
  const rotated = rotatePoint(point, rotation);
  const perspective = 1 / Math.max(.62, 1 + rotated.z * .12);
  return { x: 132 + rotated.x * 83 * perspective, y: 106 + rotated.y * 83 * perspective, z: rotated.z, depth: rotated.z };
}

function shadeColor(hex: string, amount: number) {
  const value = Number.parseInt(hex.slice(1), 16);
  const channels = [value >> 16, (value >> 8) & 255, value & 255].map((channel) => Math.round(amount >= 0 ? channel + (255 - channel) * amount : channel * (1 + amount)));
  return "rgb(" + channels.join(",") + ")";
}

function shiftScore(base: Dish, candidate: Dish, direction: ShiftDirection) {
  const target = {
    roasty: { texture: "roasty", method: "grill" },
    light: { texture: "fresh", method: "steam" },
    moist: { texture: "moist", method: "simmer" },
    rich: { texture: "rich", method: "simmer" },
  }[direction];
  return (candidate.id === base.id ? -100 : 0)
    + (candidate.foodElement === base.foodElement ? 4 : 0)
    + (candidate.cookingMethodElement === target.method ? 8 : 0)
    + (candidate.textureElement === target.texture ? 10 : 0)
    + (candidate.seasoningElement === base.seasoningElement ? 2 : 0)
    - Math.abs(dishMinutes(candidate) - dishMinutes(base)) / 35;
}

function shiftedDish(base: Dish, direction: ShiftDirection) {
  const nearby = dishes.filter((dish) => dish.id !== base.id).map((dish) => ({ dish, score: shiftScore(base, dish, direction) })).sort((a, b) => b.score - a.score).slice(0, 6);
  return nearby[Math.floor(Math.random() * nearby.length)]?.dish ?? base;
}

function RouletteTetra({ spinning, accent }: { spinning: boolean; accent: string }) {
  const [rotation, setRotation] = useState({ x: -.45, y: .15 });
  const rotationRef = useRef(rotation);

  useEffect(() => {
    let frame = 0;
    let previous = 0;
    const animate = (time: number) => {
      const delta = previous ? Math.min(32, time - previous) : 16;
      previous = time;
      rotationRef.current = { x: rotationRef.current.x, y: rotationRef.current.y + (spinning ? .028 : .0028) * delta };
      setRotation(rotationRef.current);
      frame = window.requestAnimationFrame(animate);
    };
    frame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
  }, [spinning]);

  const projected = tetraVertices.map((point) => projectPoint(point, rotation));
  const visibleFaces = tetraFaces.map((face, index) => ({ face, index, depth: face.reduce((sum, vertex) => sum + projected[vertex].depth, 0) / face.length })).sort((a, b) => a.depth - b.depth);
  const colors = [shadeColor(accent, .2), accent, shadeColor(accent, -.22), shadeColor(accent, -.42)];

  return <div className={"roulette-tetra-stage " + (spinning ? "is-spinning" : "")} aria-hidden="true">
    <div className="roulette-orbit orbit-one" /><div className="roulette-orbit orbit-two" />
    <svg className="roulette-tetra-3d" viewBox="0 0 264 212">
      <g className="roulette-tetra-faces">{visibleFaces.map(({ face, index }) => <polygon key={"face-" + index} points={face.map((vertex) => String(projected[vertex].x) + "," + String(projected[vertex].y)).join(" ")} fill={colors[index]} />)}</g>
      <g className="roulette-tetra-edges">{tetraEdges.map(([from, to]) => <line key={from + "-" + to} x1={projected[from].x} y1={projected[from].y} x2={projected[to].x} y2={projected[to].y} />)}</g>
      <g className="roulette-tetra-vertices">{projected.map((point, index) => <g key={tetraVertexLabels[index]}><circle cx={point.x} cy={point.y} r={index === 3 ? 5 : 6} /><text x={point.x + (index === 1 ? -27 : 9)} y={point.y - 8}>{tetraVertexLabels[index]}</text></g>)}</g>
    </svg>
  </div>;
}

export default function RouletteModal({ onClose, onOpenDish }: { onClose: () => void; onOpenDish: (dish: Dish) => void }) {
  const [time, setTime] = useState<RouletteTime>("all");
  const [effort, setEffort] = useState<RouletteEffort>("all");
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Dish | null>(null);
  const [shiftDirection, setShiftDirection] = useState<ShiftDirection | null>(null);
  const timerRef = useRef<number | null>(null);
  const candidates = filteredDishes(time, effort);

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);

  const spin = () => {
    if (spinning) return;
    const pool = candidates.length ? candidates : dishes;
    const next = pool[Math.floor(Math.random() * pool.length)];
    setResult(null);
    setShiftDirection(null);
    setSpinning(true);
    timerRef.current = window.setTimeout(() => {
      setResult(next);
      setSpinning(false);
    }, 1250);
  };

  const shiftResult = (direction: ShiftDirection) => {
    if (!result) return;
    setResult(shiftedDish(result, direction));
    setShiftDirection(direction);
  };

  const openResult = () => {
    if (!result) return;
    onClose();
    onOpenDish(result);
  };

  return <section className="roulette-overlay" role="dialog" aria-modal="true" aria-label="献立ルーレット">
    <div className="roulette-sheet">
      <header className="roulette-header"><div><span className="eyebrow">HOME / 03</span><h1>献立<br /><em>ルーレット</em></h1></div><button className="roulette-close" onClick={onClose}>閉じる <span>×</span></button></header>
      <p className="roulette-lead">今日の献立は、四面体に決めてもらう。条件を少しだけ絞って、勢いよく回してください。</p>
      <div className="roulette-conditions"><div className="roulette-condition"><span>時間</span><div>{([ ["all", "時間はある"], ["30", "30分以内"], ["15", "15分以内"] ] as [RouletteTime, string][]).map(([value, label]) => <button key={value} className={time === value ? "selected" : ""} onClick={() => setTime(value)}>{label}</button>)}</div></div><div className="roulette-condition"><span>手間</span><div>{([ ["all", "気にしない"], ["easy", "かんたん"], ["steady", "じっくり"] ] as [RouletteEffort, string][]).map(([value, label]) => <button key={value} className={effort === value ? "selected" : ""} onClick={() => setEffort(value)}>{label}</button>)}</div></div></div>
      <div className="roulette-count"><span>標本箱の中身</span><strong>{candidates.length || dishes.length}皿</strong></div>
      <RouletteTetra spinning={spinning} accent={rouletteAccent(result ?? dishes[0])} />
      <button className="roulette-spin-button" onClick={spin} disabled={spinning}>{spinning ? "四面体を回しています…" : result ? "もう一度回す" : "四面体を回す"}<span>↻</span></button>
      <div className={"roulette-result " + (result ? "show" : "")} aria-live="polite">{result && <>
        <span className="roulette-result-label">今日の献立</span><h2>{result.name}</h2><p>{result.description}</p>
        <div className="roulette-result-meta"><span>{result.origin}</span><span>{result.cookingTime}</span><span>{result.difficulty}</span></div>
        <div className="roulette-elements">{[result.foodElement, result.cookingMethodElement, result.seasoningElement, result.textureElement].map((element) => <span key={element}>{elementLabel(element)}</span>)}</div>
        <div className="roulette-shift"><div><b>料理をずらす</b><small>この料理から、別の方向へ</small></div><div>{([ ["roasty", "もっと香ばしく"], ["light", "もっと軽く"], ["moist", "もっとしっとり"], ["rich", "もっとコクを出す"] ] as [ShiftDirection, string][]).map(([direction, label]) => <button key={direction} className={shiftDirection === direction ? "selected" : ""} onClick={() => shiftResult(direction)}>{label}</button>)}</div>{shiftDirection && <p>「{([["roasty", "香ばしさ"], ["light", "軽さ"], ["moist", "しっとり"], ["rich", "コク"]] as [ShiftDirection, string][]).find(([direction]) => direction === shiftDirection)?.[1]}」の方向へずらしました。</p>}</div>
        <div className="roulette-result-actions"><button onClick={openResult}>レシピを見る <span>→</span></button><button onClick={spin}>気に入らない</button></div>
      </>}</div>
      <p className="roulette-footnote">偶然出会った料理も、保存や記録からあなたの味覚マップに残ります。</p>
    </div>
  </section>;
}
