"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { getDishById } from "./recipe-data";
import TetraTestScreen from "./tetra-test";

type HeroDirection = "roasty" | "light" | "warm" | "rich";
type HeroDistance = 1 | 2 | 3;

type HeroBase = {
  id: string;
  name: string;
  description: string;
  foodElement: string;
  origin: string;
  cookingTime: string;
  directionCopy: Record<HeroDirection, string>;
  targets: Record<HeroDirection, Array<{ dishId: string; change: string; added: string; reason: string }>>;
};

const heroBases: HeroBase[] = [
  {
    id: "potato-salad",
    name: "ポテトサラダ",
    description: "茹でたじゃがいもを、しっとり和えるいつもの一皿。",
    foodElement: "potato",
    origin: "いつもの料理",
    cookingTime: "15分",
    directionCopy: { roasty: "水分を減らし、表面に焼き目をつける", light: "酸味と香りを足し、後味を軽くする", warm: "温度と火入れを足し、主菜に近づける", rich: "油分とうま味を重ね、満足感を増す" },
    targets: {
      roasty: [
        { dishId: "potato-cheese-grill", change: "和える → チーズをのせて焼く", added: "チーズ、黒こしょう", reason: "表面を焼くことで、じゃがいもの甘みと香ばしさが立ちます。" },
        { dishId: "potato-rosemary-grill", change: "茹でる → ローズマリーと焼く", added: "ローズマリー、オリーブ油", reason: "乾いた熱とハーブで、同じ食材を香りの強い一皿へ動かします。" },
        { dishId: "potato-galette", change: "和える → 薄く広げて焼く", added: "小麦粉、チーズ", reason: "薄く広げて水分を逃がすと、外側がカリッとしたガレットになります。" },
      ],
      light: [
        { dishId: "potato-herb-steam", change: "マヨネーズで和える → ハーブで蒸す", added: "ハーブ、レモン", reason: "油分を抑え、香りと酸味を足すと、同じじゃがいもでも軽くなります。" },
        { dishId: "potato-sour-steam", change: "和える → 酢で蒸す", added: "酢、ねぎ", reason: "酸味を先に入れることで、ほくほく感を残しながら後味を短くします。" },
        { dishId: "potato-tomato-simmer", change: "冷たい副菜 → トマトで煮る", added: "トマト、香草", reason: "水分と酸味をまとわせると、軽い煮込みとして食べられます。" },
      ],
      warm: [
        { dishId: "potato-tomato-simmer", change: "冷たい副菜 → トマトで煮る", added: "トマト、香草", reason: "火を入れて水分を含ませると、いつもの副菜が温かい一皿になります。" },
        { dishId: "potato-coconut-simmer", change: "和える → ココナッツで煮る", added: "ココナッツミルク、スパイス", reason: "煮汁を含ませることで、じゃがいものほくほく感が濃厚な方向へ変わります。" },
        { dishId: "potato-cheese-grill", change: "和える → チーズをのせて焼く", added: "チーズ、黒こしょう", reason: "熱と油分を重ねると、食卓の中心になる温かい料理になります。" },
      ],
      rich: [
        { dishId: "potato-cheese-grill", change: "和える → チーズをのせて焼く", added: "チーズ、黒こしょう", reason: "チーズのうま味と焼き目で、少ない材料でも厚みが出ます。" },
        { dishId: "potato-coconut-simmer", change: "和える → ココナッツで煮る", added: "ココナッツミルク、スパイス", reason: "油分とスパイスを含ませると、じゃがいもの味が濃く感じられます。" },
        { dishId: "potato-spice-fry", change: "和える → スパイスで揚げる", added: "スパイス、油", reason: "揚げ油をまとわせることで、香りと満足感を一気に足します。" },
      ],
    },
  },
  {
    id: "tofu-cold-dish",
    name: "冷ややっこ",
    description: "豆腐に薬味をのせて、すぐ食べられるいつもの一皿。",
    foodElement: "tofu",
    origin: "いつもの料理",
    cookingTime: "5分",
    directionCopy: { roasty: "表面に焼き目をつけ、香りを重ねる", light: "柑橘と香味野菜で、さらに軽くする", warm: "火を入れて、食卓の中心にする", rich: "味噌と油分で、うま味を深くする" },
    targets: {
      roasty: [
        { dishId: "tofu-tomato-grill", change: "冷たいまま → トマトと焼く", added: "トマト、オリーブ油", reason: "表面を焼くと、豆腐の淡い味に香ばしい輪郭が生まれます。" },
        { dishId: "tofu-maple-grill", change: "冷たいまま → 味噌だれを塗って焼く", added: "味噌、メープル", reason: "甘い味噌だれを焼きつけると、豆腐が主菜らしい一皿になります。" },
        { dishId: "tofu-coconut-fry", change: "冷たいまま → 衣をつけて揚げる", added: "ココナッツ、衣", reason: "衣で水分を包んで揚げると、外はカリッと中はやわらかく仕上がります。" },
      ],
      light: [
        { dishId: "tofu-lime-raw", change: "しょうゆで食べる → ライムで和える", added: "ライム、香味野菜", reason: "柑橘の酸味と香りを足すと、豆腐の軽さがより際立ちます。" },
        { dishId: "tofu-herb-raw", change: "薬味をのせる → ハーブで和える", added: "ハーブ、オリーブ油", reason: "香りの方向を変えるだけで、冷たい豆腐が洋食の前菜になります。" },
        { dishId: "tofu-sesame-stir", change: "冷たいまま → 青菜と炒める", added: "青菜、ごま", reason: "青菜の水分とごまの香りで、軽いまま満足感を足せます。" },
      ],
      warm: [
        { dishId: "tofu-miso-steam", change: "冷たいまま → 味噌だれで蒸す", added: "味噌、ねぎ", reason: "蒸して温度を上げると、豆腐の水分が味噌だれをやさしく抱えます。" },
        { dishId: "tofu-spicy-simmer", change: "冷たいまま → 麻辣だれで煮る", added: "花椒、唐辛子", reason: "温かい煮汁と刺激をまとわせると、豆腐がごはんの主役になります。" },
        { dishId: "tofu-sweet-simmer", change: "冷たいまま → 甘辛く煮る", added: "しょうゆ、みりん", reason: "煮汁を含ませることで、淡い豆腐に温かいコクが生まれます。" },
      ],
      rich: [
        { dishId: "tofu-maple-grill", change: "薬味をのせる → 味噌だれを焼く", added: "味噌、メープル", reason: "味噌のうま味と焼き目が重なり、豆腐の淡さが厚みに変わります。" },
        { dishId: "tofu-spicy-simmer", change: "冷たいまま → 麻辣煮にする", added: "花椒、唐辛子", reason: "油と香辛料を煮汁に含ませると、豆腐に奥行きが出ます。" },
        { dishId: "tofu-sesame-stir", change: "薬味をのせる → ごまと青菜で炒める", added: "ごま、青菜", reason: "炒めたごまの香りと青菜のうま味で、短時間でも満足感が増します。" },
      ],
    },
  },
];

const directionOptions: Array<{ id: HeroDirection; label: string; note: string }> = [
  { id: "roasty", label: "もっと香ばしく", note: "焼き目と香りを足す" },
  { id: "light", label: "もっと軽く", note: "酸味と香りで整える" },
  { id: "warm", label: "温かい料理に", note: "火入れと水分を足す" },
  { id: "rich", label: "もっとコクを出す", note: "うま味と厚みを足す" },
];

function heroAccent(foodElement: string) {
  const colors: Record<string, string> = { potato: "#b08a58", tofu: "#b9a774", chicken: "#b66b4f", egg: "#c4a149" };
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

export default function HomeHeroTest() {
  const [baseIndex, setBaseIndex] = useState(0);
  const [direction, setDirection] = useState<HeroDirection>("roasty");
  const [distance, setDistance] = useState<HeroDistance>(1);
  const [searchOpen, setSearchOpen] = useState(false);
  const base = heroBases[baseIndex];
  const targetMeta = base.targets[direction][distance - 1];
  const target = useMemo(() => getDishById(targetMeta.dishId), [targetMeta.dishId]);
  const activeDirection = directionOptions.find((option) => option.id === direction) ?? directionOptions[0];

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

  return <main className="home-hero-test-shell"><div className="home-hero-test">
    <header className="home-hero-test-header"><span className="test-eyebrow">RYORI / HOME V3 · TEST</span><span className="home-hero-test-badge">70 POINT PROTOTYPE</span></header>
    <section className="home-hero-test-intro"><h1>いつもの料理を、<br /><em>少し動かす。</em></h1><p>食材はそのまま。方向を選ぶと、今日の一皿が変わります。</p></section>
    <section className="home-hero-current"><div className="home-hero-section-label"><span>現在地</span><b>01 / 03</b></div><HeroDishArt dish={base} label="BEFORE" className="hero-test-art-before" /><h2>{base.name}</h2><p>{base.description}</p><button className="home-hero-another" onClick={chooseAnotherDish}>別の料理を選ぶ <span>↗</span></button></section>
    <section className="home-hero-controls"><div className="home-hero-section-label"><span>どちらへ動かす？</span><b>{activeDirection.note}</b></div><div className="home-hero-direction-grid">{directionOptions.map((option) => <button key={option.id} className={direction === option.id ? "selected" : ""} onClick={() => setDirection(option.id)}><strong>{option.label}</strong><small>{option.note}</small></button>)}</div><div className="home-hero-distance"><div><span>どこまで動かす？</span><b>{distance === 1 ? "ひと手間" : distance === 2 ? "別の一皿" : "冒険"}</b></div><input type="range" min="1" max="3" step="1" value={distance} onChange={(event) => setDistance(Number(event.target.value) as HeroDistance)} aria-label="料理を動かす距離" /><div className="home-hero-distance-labels"><span>いつものまま</span><span>冒険</span></div></div></section>
    <section className="home-hero-after"><div className="home-hero-section-label"><span>移動した先</span><b>{activeDirection.label}</b></div><div className="home-hero-route"><span>{base.name}</span><i>→</i><strong>{target.name}</strong></div><div className="home-hero-before-after"><HeroDishArt dish={base} label="BEFORE" className="hero-test-art-small" /><span>→</span><HeroDishArt dish={target} label="AFTER" className="hero-test-art-small" /></div><div className="home-hero-change-copy"><h2>{target.name}</h2><p>{base.directionCopy[direction]}。</p><ul><li><b>変わったこと</b>{targetMeta.change}</li><li><b>追加するもの</b>{targetMeta.added}</li><li><b>調理時間</b>{target.cookingTime} / {target.difficulty}</li></ul></div><p className="home-hero-reason">{targetMeta.reason}</p><div className="home-hero-actions"><button className="button button-dark" onClick={() => setSearchOpen(true)}>料理の地図を見る <span>→</span></button><button className="button button-outline" onClick={nudgeDish}>{distance < 3 ? "もう一歩動かす" : "別の方向にずらす"}</button></div></section>
    <section className="home-hero-secondary"><span className="test-eyebrow">別の方法で探す</span><button onClick={() => setSearchOpen(true)}>食材・料理名・国・作り方から探す <span>→</span></button></section>
    <footer className="home-hero-test-footer"><span>テスト版 / ホーム体験の検証用</span><span>四面体は移動の地図として表示</span></footer>
  </div></main>;
}
