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
  const [page, layout, css, manifest, recipeData, tetraTest] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"),
    readFile(new URL("../app/recipe-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/tetra-test.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(page, /食材と気分から探す/);
  assert.match(page, /保存した料理|定番料理/);
  assert.match(page, /料理の地図を見る/);
  assert.match(page, /今週のテーマ/);
  assert.match(page, /四面体の見方/);
  assert.match(page, /料理そのもの/);
  assert.match(page, /料理の世界を歩く/);
  assert.match(page, /入口 ↔ 地図/);
  assert.match(page, /食材から/);
  assert.match(page, /線分/);
  assert.match(page, /ゆっくり回転中/);
  assert.match(page, /味覚マップに反映しました/);
  assert.match(page, /料理体験チャレンジ/);
  assert.match(page, /RYORI PRO/);
  assert.match(page, /setPointerCapture/);
  assert.match(page, /tetra-canvas/);
  assert.match(page, /projectTetraPoint/);
  assert.match(page, /火・水・空気・油/);
  assert.match(page, /補助レイヤー/);
  assert.match(page, /tetraScoreForDish/);
  assert.match(page, /plot-point/);
  assert.match(page, /四面体上のご近所/);
  assert.match(page, /今回の探索点/);
  assert.match(page, /tasteScoreFromLogs/);
  assert.match(tetraTest, /今日は何を/);
  assert.match(tetraTest, /いま決まっていることから探す/);
  assert.match(tetraTest, /次に絞るなら/);
  assert.match(tetraTest, /検索: /);
  assert.match(tetraTest, /料理の地図/);
  assert.match(tetraTest, /立体で見る/);
  assert.match(tetraTest, /もっと香ばしく/);
  const coreDishes = recipeData.split("const coreDishes: Dish[] = [")[1].split("type SupplementalDishSeed")[0];
  const supplementalDishes = recipeData.split("const supplementalDishSeeds: SupplementalDishSeed[] = [")[1].split("function supplementalDishFromSeed")[0];
  assert.equal((coreDishes.match(/^    id: /gm) ?? []).length + (supplementalDishes.match(/^  \{ id:/gm) ?? []).length, 100);
  assert.match(layout, /料理の四面体 — 食の博物誌/);
  assert.match(layout, /manifest:\s*"\/manifest\.webmanifest"/);
  assert.match(css, /position:\s*fixed/);
  assert.match(css, /bottom-nav/);
  assert.match(css, /\.edge-tl/);
  assert.match(css, /\.edge-rb/);
  assert.match(manifest, /"display": "standalone"/);
});
