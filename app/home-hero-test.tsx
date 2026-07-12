"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { directionOptions, heroBases, type HeroDirection, type HeroDistance } from "./hero-content";
import { getDishById, type Dish } from "./recipe-data";
import TetraTestScreen from "./tetra-test";

type HomeHeroTestProps = {
  variant?: "test" | "production";
  onOpenMap?: (dish: Dish) => void;
  onOpenBrowse?: () => void;
};

function heroAccent(foodElement: string) {
  const colors: Record<string, string> = { potato: "#b08a58", tofu: "#b9a774", chicken: "#b66b4f", egg: "#c4a149", mushroom: "#806b58" };
  return colors[foodElement] ?? "#95775d";
}

function HeroDishArt({ dish, label, className = "" }: { dish: { name: string; origin: string; foodElement: string }; label: string; className?: string }) {
  return <div className={"hero-test-art " + className} style={{ "--hero-accent": heroAccent(dish.foodElement) } as CSSProperties}>
    <span className="hero-test-art-label">{label}</span>
    <div className="hero-test-art-shadow" />
    <div className="hero-test-plate"><i /><i /><i /></div>
    <span className="hero-test-art-origin">{dish.origin}</span>
    <span className="hero-test-art-name">{dish.name}</span>
  </div>;
}

export default function HomeHeroTest({ variant = "test", onOpenMap, onOpenBrowse }: HomeHeroTestProps) {
  const [baseIndex, setBaseIndex] = useState(0);
  const [direction, setDirection] = useState<HeroDirection>("roasty");
  const [distance, setDistance] = useState<HeroDistance>(1);
  const [searchOpen, setSearchOpen] = useState(false);
  const base = heroBases[baseIndex];
  const targetMeta = base.targets[direction][distance - 1];
  const target = useMemo(() => getDishById(targetMeta.dishId), [targetMeta.dishId]);
  const activeDirection = directionOptions.find((option) => option.id === direction) ?? directionOptions[0];
  const isProduction = variant === "production";

  if (searchOpen) return <TetraTestScreen variant="test" />;

  const chooseAnotherDish = () => {
    setBaseIndex((current) => (current + 1) % heroBases.length);
    setDirection("roasty");
    setDistance(1);
  };

  const nudgeDish = () => {
    if (distance < 3) {
      setDistance((current) => Math.min(3, current + 1) as HeroDistance);
      return;
    }
    const currentDirectionIndex = directionOptions.findIndex((option) => option.id === direction);
    setDirection(directionOptions[(currentDirectionIndex + 1) % directionOptions.length].id);
    setDistance(1);
  };

  const openMap = () => {
    if (onOpenMap) onOpenMap(target);
    else setSearchOpen(true);
  };

  const openBrowse = () => {
    if (onOpenBrowse) onOpenBrowse();
    else setSearchOpen(true);
  };

  return <main className="home-hero-test-shell"><div className="home-hero-test">
    <header className="home-hero-test-header"><span className="test-eyebrow">{isProduction ? "RYORI / TODAY" : "RYORI / HOME V3 · TEST"}</span><span className="home-hero-test-badge">{isProduction ? "FIRST RELEASE" : "70 POINT PROTOTYPE"}</span></header>
    <section className="home-hero-test-intro"><h1>いつもの料理を、<br /><em>少し動かす。</em></h1><p>食材はそのまま。方向を選ぶと、今日の一皿が変わります。</p></section>
    <section className="home-hero-current"><div className="home-hero-section-label"><span>現在地</span><b>{String(baseIndex + 1).padStart(2, "0")} / {String(heroBases.length).padStart(2, "0")}</b></div><HeroDishArt dish={base} label="BEFORE" className="hero-test-art-before" /><h2>{base.name}</h2><p>{base.description}</p><button className="home-hero-another" onClick={chooseAnotherDish}>別の料理を選ぶ <span>↗</span></button></section>
    <section className="home-hero-controls"><div className="home-hero-section-label"><span>どちらへ動かす？</span><b>{activeDirection.note}</b></div><div className="home-hero-direction-grid">{directionOptions.map((option) => <button key={option.id} className={direction === option.id ? "selected" : ""} onClick={() => { setDirection(option.id); setDistance(1); }}><strong>{option.label}</strong><small>{option.note}</small></button>)}</div><div className="home-hero-distance"><div><span>どこまで動かす？</span><b>{distance === 1 ? "ひと手間" : distance === 2 ? "別の一皿" : "冒険"}</b></div><input type="range" min="1" max="3" step="1" value={distance} onChange={(event) => setDistance(Number(event.target.value) as HeroDistance)} aria-label="料理を動かす距離" /><div className="home-hero-distance-labels"><span>いつものまま</span><span>冒険</span></div></div></section>
    <section className="home-hero-after"><div className="home-hero-section-label"><span>移動した先</span><b>{activeDirection.label}</b></div><div className="home-hero-route"><span>{base.name}</span><i>→</i><strong>{target.name}</strong></div><div className="home-hero-before-after"><HeroDishArt dish={base} label="BEFORE" className="hero-test-art-small" /><span>→</span><HeroDishArt dish={target} label="AFTER" className="hero-test-art-small" /></div><div className="home-hero-change-copy"><h2>{target.name}</h2><p>{targetMeta.description}</p><ul><li><b>変わったこと</b>{targetMeta.change}</li><li><b>追加するもの</b>{targetMeta.added}</li><li><b>味の変化</b>{targetMeta.taste}</li><li><b>調理時間</b>{target.cookingTime} / {target.difficulty}</li></ul></div><p className="home-hero-reason">{targetMeta.reason}</p><div className="home-hero-actions"><button className="button button-dark" onClick={openMap}>料理の地図を見る <span>→</span></button><button className="button button-outline" onClick={nudgeDish}>{distance < 3 ? "もう一歩動かす" : "別の方向にずらす"}</button></div></section>
    <section className="home-hero-secondary"><span className="test-eyebrow">別の方法で探す</span><button onClick={openBrowse}>{isProduction ? "食材・時間・国・作り方から探す" : "食材・料理名・国・作り方から探す"} <span>→</span></button></section>
    <footer className="home-hero-test-footer"><span>{isProduction ? "料理の発見を、少しずつ。" : "テスト版 / ホーム体験の検証用"}</span><span>四面体は料理の地図として表示</span></footer>
  </div></main>;
}
