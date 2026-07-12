import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the recipe tetrahedron shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /料理の四面体/);
  assert.match(html, /味の地図をひらいています/);
  assert.doesNotMatch(html, /Starter Project|Codex is working|react-loading-skeleton/);
});

test("keeps the product metadata and mobile entry points", async () => {
  const [page, layout, css, manifest, recipeData, tetraTest, roulette, heroTest, heroContent] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"),
    readFile(new URL("../app/recipe-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/tetra-test.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/roulette.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/home-hero-test.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/hero-content.ts", import.meta.url), "utf8"),
  ]);

  assert.match(page, /食材と気分から探す/);
  assert.match(page, /保存した料理|定番料理/);
  assert.match(page, /四面体ルーレット/);
  assert.match(page, /guide-door-roulette/);
  assert.match(roulette, /献立ルーレット/);
  assert.match(roulette, /四面体を回す/);
  assert.match(roulette, /もう一度回す/);
  assert.match(roulette, /料理をずらす/);
  assert.match(roulette, /もっと香ばしく/);
  assert.match(roulette, /30分以内/);
  assert.match(page, /今週のテーマ/);
  assert.match(page, /味覚マップに反映しました/);
  assert.match(page, /料理体験チャレンジ/);
  assert.match(page, /RYORI PRO/);
  assert.match(page, /screen === "tetra" && <TetraTestScreen variant="production"/);
  assert.match(page, /<TetraTestScreen variant="test" \/>/);
  assert.match(page, /home-v3/);
  assert.match(page, /<HomeHeroTest \/>/);
  assert.match(heroTest, /いつもの料理を、/);
  assert.match(heroTest, /どこまで動かす/);
  assert.match(heroTest, /料理の地図を見る/);
  assert.match(heroTest, /もう一歩動かす/);
  assert.match(heroTest, /味の変化/);
  assert.equal((heroContent.match(/^    id: /gm) ?? []).length, 5);
  assert.match(heroContent, /ポテトサラダ/);
  assert.match(heroContent, /もっと香ばしく/);
  assert.match(heroContent, /鶏むね肉の塩焼き/);
  assert.match(heroContent, /きのこのバター炒め/);
  assert.match(heroTest, /少し動かす/);
  assert.match(page, /tasteScoreFromLogs/);
  assert.match(tetraTest, /今日は何を/);
  assert.match(tetraTest, /いま決まっていることから探す/);
  assert.match(tetraTest, /食材から/);
  assert.match(tetraTest, /料理の種類から/);
  assert.match(tetraTest, /次に絞るなら/);
  assert.match(tetraTest, /検索: /);
  assert.match(tetraTest, /料理の地図/);
  assert.match(tetraTest, /2Dで見る/);
  assert.match(tetraTest, /立体で見る/);
  assert.match(tetraTest, /もっと香ばしく/);
  assert.match(tetraTest, /setPointerCapture/);
  assert.match(tetraTest, /料理の地図で見る/);
  assert.match(tetraTest, /flowStep === "choices"/);
  assert.match(tetraTest, /flowStep === "refine"/);
  assert.match(tetraTest, /入口を選び直す/);
  assert.match(tetraTest, /次の条件をひとつ選ぶ/);
  const coreDishes = recipeData.split("const coreDishes: Dish[] = [")[1].split("type SupplementalDishSeed")[0];
  const supplementalDishes = recipeData.split("const supplementalDishSeeds: SupplementalDishSeed[] = [")[1].split("function supplementalDishFromSeed")[0];
  assert.equal((coreDishes.match(/^    id: /gm) ?? []).length + (supplementalDishes.match(/^  \{ id:/gm) ?? []).length, 100);
  assert.match(recipeData, /Array\.from\(\{ length: 400 \}/);
  assert.match(recipeData, /const generatedDishes = generatedDishSeeds\.map\(supplementalDishFromSeed\)/);
  assert.match(recipeData, /\.\.\.generatedDishes/);
  assert.match(layout, /料理の四面体 — 食の博物誌/);
  assert.match(layout, /manifest:\s*"\/manifest\.webmanifest"/);
  assert.match(css, /position:\s*fixed/);
  assert.match(css, /bottom-nav/);
  assert.match(css, /\.edge-tl/);
  assert.match(css, /\.edge-rb/);
  assert.match(css, /\.home-hero-test-shell/);
  assert.match(css, /\.home-hero-direction-grid/);
  assert.match(manifest, /"display": "standalone"/);
});
