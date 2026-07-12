"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { cookingElements, dishes, type Dish, type ElementCategory } from "./recipe-data";

type RouletteTime = "all" | "30" | "15";
type RouletteEffort = "all" | "easy" | "steady";

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

function RouletteTetra({ spinning, accent }: { spinning: boolean; accent: string }) {
  return <div className={`roulette-tetra-stage ${spinning ? "is-spinning" : ""}`} aria-hidden="true">
    <div className="roulette-orbit orbit-one" /><div className="roulette-orbit orbit-two" />
    <div className="roulette-tetra" style={{ "--roulette-accent": accent } as CSSProperties}>
      <span className="roulette-face roulette-face-front" /><span className="roulette-face roulette-face-left" /><span className="roulette-face roulette-face-right" /><span className="roulette-face roulette-face-bottom" />
      <span className="roulette-tetra-point point-top">火</span><span className="roulette-tetra-point point-left">水</span><span className="roulette-tetra-point point-right">油</span><span className="roulette-tetra-point point-center">空気</span>
    </div>
  </div>;
}

export default function RouletteModal({ onClose, onOpenDish }: { onClose: () => void; onOpenDish: (dish: Dish) => void }) {
  const [time, setTime] = useState<RouletteTime>("all");
  const [effort, setEffort] = useState<RouletteEffort>("all");
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Dish | null>(null);
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
    setSpinning(true);
    timerRef.current = window.setTimeout(() => {
      setResult(next);
      setSpinning(false);
    }, 1250);
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
      <div className={`roulette-result ${result ? "show" : ""}`} aria-live="polite">{result && <><span className="roulette-result-label">今日の献立</span><h2>{result.name}</h2><p>{result.description}</p><div className="roulette-result-meta"><span>{result.origin}</span><span>{result.cookingTime}</span><span>{result.difficulty}</span></div><div className="roulette-elements">{[result.foodElement, result.cookingMethodElement, result.seasoningElement, result.textureElement].map((element) => <span key={element}>{elementLabel(element)}</span>)}</div><div className="roulette-result-actions"><button onClick={openResult}>レシピを見る <span>→</span></button><button onClick={spin}>気に入らない</button></div></>}</div>
      <p className="roulette-footnote">偶然出会った料理も、保存や記録からあなたの味覚マップに残ります。</p>
    </div>
  </section>;
}
