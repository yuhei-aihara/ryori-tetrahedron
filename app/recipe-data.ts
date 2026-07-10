export type ElementCategory = "food" | "method" | "seasoning" | "texture";

export type AdventureLevel = "定番" | "ちょっと冒険" | "意外";

export interface User {
  id: string;
  name: string;
  onboardingCompleted: boolean;
  streak: number;
  explorationLevel: number;
  isPro: boolean;
}

export interface CookingElement {
  id: string;
  category: ElementCategory;
  name: string;
  description: string;
  color: string;
}

export interface Dish {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  steps: string[];
  cookingTime: string;
  difficulty: string;
  foodElement: string;
  cookingMethodElement: string;
  seasoningElement: string;
  textureElement: string;
  adventureLevel: AdventureLevel;
  reasonWhyItWorks: string;
  origin: string;
  alternatives: string[];
}

export interface CookingLog {
  id: string;
  dishId: string;
  rating: number;
  wantToCookAgain: number;
  difficultyRating: number;
  familyReaction: string;
  memo: string;
  createdAt: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  completed: boolean;
  badge: string;
}

export const categoryLabels: Record<ElementCategory, string> = {
  food: "食材",
  method: "調理法",
  seasoning: "味付け",
  texture: "食感・香り",
};

export const categoryDescriptions: Record<ElementCategory, string> = {
  food: "料理の主役になる素材を選びます。",
  method: "熱や時間のかけ方で、同じ食材の表情を変えます。",
  seasoning: "味の方向性を決める軸です。",
  texture: "最後に記憶へ残る触感と香りを整えます。",
};

export const cookingElements: Record<ElementCategory, CookingElement[]> = {
  food: [
    {
      id: "chicken",
      category: "food",
      name: "鶏肉",
      description: "淡白で、香りや酸味を受け止めやすい。",
      color: "#b66a4a",
    },
    {
      id: "pork",
      category: "food",
      name: "豚肉",
      description: "脂の甘みがあり、甘辛や酸味と相性がいい。",
      color: "#a87558",
    },
    {
      id: "fish",
      category: "food",
      name: "魚",
      description: "うま味と軽さを両立し、蒸しや生仕上げに向く。",
      color: "#527f88",
    },
    {
      id: "tofu",
      category: "food",
      name: "豆腐",
      description: "やわらかく、味付けの個性を映しやすい。",
      color: "#cfc39d",
    },
    {
      id: "egg",
      category: "food",
      name: "卵",
      description: "ふわっとした食感と濃厚さを作りやすい。",
      color: "#c8a64a",
    },
    {
      id: "mushroom",
      category: "food",
      name: "きのこ",
      description: "香りとうま味を持ち、脇役から主役までこなせる。",
      color: "#7a6047",
    },
    {
      id: "eggplant",
      category: "food",
      name: "なす",
      description: "油やだしを吸い、濃厚にもさっぱりにも振れる。",
      color: "#66546d",
    },
    {
      id: "potato",
      category: "food",
      name: "じゃがいも",
      description: "ほくほく感とカリッと感を両方作れる。",
      color: "#b3915d",
    },
  ],
  method: [
    {
      id: "grill",
      category: "method",
      name: "焼く",
      description: "表面の香ばしさで輪郭を出す。",
      color: "#9b5c39",
    },
    {
      id: "simmer",
      category: "method",
      name: "煮る",
      description: "味をしみ込ませ、まとまりを作る。",
      color: "#6f7c58",
    },
    {
      id: "steam",
      category: "method",
      name: "蒸す",
      description: "素材の水分を残して、軽く仕上げる。",
      color: "#819b88",
    },
    {
      id: "fry",
      category: "method",
      name: "揚げる",
      description: "食感のコントラストを強く出す。",
      color: "#b8843f",
    },
    {
      id: "stir",
      category: "method",
      name: "炒める",
      description: "短時間で香りと火入れを合わせる。",
      color: "#9f7147",
    },
    {
      id: "raw",
      category: "method",
      name: "生で仕上げる",
      description: "火を入れすぎず、香りや酸味を生かす。",
      color: "#6d9a87",
    },
  ],
  seasoning: [
    {
      id: "salt",
      category: "seasoning",
      name: "塩味",
      description: "素材の輪郭をまっすぐ立てる。",
      color: "#87949c",
    },
    {
      id: "sweet-savory",
      category: "seasoning",
      name: "甘辛",
      description: "親しみやすく、ごはんに寄せやすい。",
      color: "#9d6641",
    },
    {
      id: "sour",
      category: "seasoning",
      name: "酸味",
      description: "脂や香ばしさを軽くする。",
      color: "#b4a64b",
    },
    {
      id: "spicy",
      category: "seasoning",
      name: "辛味",
      description: "熱さと刺激で食欲を引き上げる。",
      color: "#ad5b4d",
    },
    {
      id: "umami",
      category: "seasoning",
      name: "うま味",
      description: "奥行きを作り、満足感を増やす。",
      color: "#706a4d",
    },
    {
      id: "spice",
      category: "seasoning",
      name: "スパイス",
      description: "香りの層を足し、異国感を作る。",
      color: "#846f8b",
    },
  ],
  texture: [
    {
      id: "roasty",
      category: "texture",
      name: "香ばしい",
      description: "焼き目や焦げの香りで記憶に残る。",
      color: "#835a39",
    },
    {
      id: "fresh",
      category: "texture",
      name: "さっぱり",
      description: "軽さと余韻の短さで毎日食べやすい。",
      color: "#6d9a87",
    },
    {
      id: "rich",
      category: "texture",
      name: "濃厚",
      description: "口の中に残る厚みを作る。",
      color: "#96724d",
    },
    {
      id: "crunchy",
      category: "texture",
      name: "カリカリ",
      description: "音と歯触りで楽しさを作る。",
      color: "#b7893d",
    },
    {
      id: "fluffy",
      category: "texture",
      name: "ふわふわ",
      description: "軽い食感でやさしい印象にする。",
      color: "#cdb66e",
    },
    {
      id: "moist",
      category: "texture",
      name: "しっとり",
      description: "水分と油分を残し、落ち着いた満足感にする。",
      color: "#7d8c6d",
    },
  ],
};

export const dishes: Dish[] = [
  {
    id: "lemon-herb-grilled-chicken",
    name: "レモンとハーブのグリルチキン",
    description: "焼き目の香ばしさに、レモンの酸味を重ねた軽い主菜。",
    ingredients: ["鶏もも肉", "レモン", "ローズマリー", "塩", "オリーブオイル"],
    steps: ["鶏肉に塩とレモンをなじませる", "皮目から焼いて香ばしさを出す", "ハーブをのせて余熱で香りを移す"],
    cookingTime: "25分",
    difficulty: "ふつう",
    foodElement: "chicken",
    cookingMethodElement: "grill",
    seasoningElement: "sour",
    textureElement: "roasty",
    adventureLevel: "定番",
    reasonWhyItWorks: "鶏肉の脂を酸味が軽くし、焼き目の香りが満足感を足します。",
    origin: "洋食",
    alternatives: ["鶏むね肉", "ライム", "タイム", "白身魚"],
  },
  {
    id: "sweet-savory-pork-eggplant",
    name: "豚肉となすの甘辛炒め",
    description: "豚の脂をなすが受け止め、ごはんに合う甘辛さでまとめます。",
    ingredients: ["豚こま肉", "なす", "しょうゆ", "みりん", "しょうが"],
    steps: ["なすを油で軽く焼く", "豚肉を加えて炒める", "甘辛だれを絡めて照りを出す"],
    cookingTime: "18分",
    difficulty: "かんたん",
    foodElement: "pork",
    cookingMethodElement: "stir",
    seasoningElement: "sweet-savory",
    textureElement: "moist",
    adventureLevel: "定番",
    reasonWhyItWorks: "なすのしっとり感が豚肉の脂と合い、甘辛い味で一体感が出ます。",
    origin: "和食",
    alternatives: ["鶏ひき肉", "ピーマン", "豆板醤", "厚揚げ"],
  },
  {
    id: "steamed-aromatic-fish",
    name: "白身魚の香味蒸し",
    description: "蒸した魚に香味だれをかける、軽くて香りの立つ一皿。",
    ingredients: ["白身魚", "長ねぎ", "しょうが", "しょうゆ", "ごま油"],
    steps: ["魚に塩をして蒸す", "香味野菜を細く切る", "熱いごま油とたれをかける"],
    cookingTime: "20分",
    difficulty: "ふつう",
    foodElement: "fish",
    cookingMethodElement: "steam",
    seasoningElement: "umami",
    textureElement: "fresh",
    adventureLevel: "定番",
    reasonWhyItWorks: "蒸し調理で魚の水分を守り、うま味のあるたれが淡白さを支えます。",
    origin: "中華",
    alternatives: ["鮭", "豆腐", "ナンプラー", "パクチー"],
  },
  {
    id: "tofu-mushroom-spice-stew",
    name: "豆腐ときのこのスパイス煮込み",
    description: "豆腐のやわらかさに、きのことスパイスの香りを重ねる煮込み。",
    ingredients: ["木綿豆腐", "きのこ", "トマト", "クミン", "コリアンダー"],
    steps: ["スパイスを油で温める", "きのことトマトを煮る", "豆腐を入れて味を含ませる"],
    cookingTime: "30分",
    difficulty: "ふつう",
    foodElement: "tofu",
    cookingMethodElement: "simmer",
    seasoningElement: "spice",
    textureElement: "rich",
    adventureLevel: "ちょっと冒険",
    reasonWhyItWorks: "淡い豆腐がスパイスの香りを受け止め、きのこのうま味で厚みが出ます。",
    origin: "アジア",
    alternatives: ["厚揚げ", "ひよこ豆", "ココナッツミルク", "ほうれん草"],
  },
  {
    id: "fluffy-chili-egg",
    name: "ふわふわ卵のチリ炒め",
    description: "ふわっと焼いた卵に、辛味と酸味のあるソースを絡めます。",
    ingredients: ["卵", "トマト", "豆板醤", "長ねぎ", "片栗粉"],
    steps: ["卵を半熟に炒めて取り出す", "香味野菜と豆板醤を炒める", "卵を戻して軽く合わせる"],
    cookingTime: "15分",
    difficulty: "かんたん",
    foodElement: "egg",
    cookingMethodElement: "stir",
    seasoningElement: "spicy",
    textureElement: "fluffy",
    adventureLevel: "ちょっと冒険",
    reasonWhyItWorks: "卵のやさしさが辛味を丸くし、ふわふわ感で刺激が食べやすくなります。",
    origin: "中華",
    alternatives: ["豆腐", "えび", "ケチャップ", "黒酢"],
  },
  {
    id: "crispy-herb-potatoes",
    name: "じゃがいものカリカリ香草揚げ",
    description: "外はカリッと、中はほくっと。塩とハーブで食べ飽きない一皿。",
    ingredients: ["じゃがいも", "塩", "ローズマリー", "にんにく", "オリーブオイル"],
    steps: ["じゃがいもを下ゆでする", "表面を軽くつぶして揚げ焼きにする", "塩とハーブを絡める"],
    cookingTime: "28分",
    difficulty: "かんたん",
    foodElement: "potato",
    cookingMethodElement: "fry",
    seasoningElement: "salt",
    textureElement: "crunchy",
    adventureLevel: "定番",
    reasonWhyItWorks: "塩味がじゃがいもの甘みを引き出し、カリカリ食感が手を伸ばしたくさせます。",
    origin: "洋食",
    alternatives: ["さつまいも", "山椒塩", "パプリカパウダー", "粉チーズ"],
  },
  {
    id: "eggplant-sour-marinade",
    name: "なすの酸味マリネ",
    description: "焼いたなすを酸味で締める、冷やしてもおいしい副菜。",
    ingredients: ["なす", "酢", "しょうゆ", "大葉", "ごま"],
    steps: ["なすを焼いて火を通す", "酢じょうゆに浸す", "大葉とごまで香りを足す"],
    cookingTime: "16分",
    difficulty: "かんたん",
    foodElement: "eggplant",
    cookingMethodElement: "raw",
    seasoningElement: "sour",
    textureElement: "fresh",
    adventureLevel: "ちょっと冒険",
    reasonWhyItWorks: "なすの油分と甘みを酸味が引き締め、後味を軽くします。",
    origin: "和食",
    alternatives: ["ズッキーニ", "黒酢", "ミント", "トマト"],
  },
  {
    id: "mushroom-fish-umami-risotto",
    name: "魚ときのこのうま味リゾット",
    description: "魚のだしときのこの香りを、米の濃厚さに閉じ込めます。",
    ingredients: ["白身魚", "きのこ", "米", "チーズ", "だし"],
    steps: ["きのこを炒めて香りを出す", "米とだしを加えて煮る", "魚とチーズを加えて仕上げる"],
    cookingTime: "35分",
    difficulty: "ふつう",
    foodElement: "fish",
    cookingMethodElement: "simmer",
    seasoningElement: "umami",
    textureElement: "rich",
    adventureLevel: "ちょっと冒険",
    reasonWhyItWorks: "魚ときのこのうま味が重なり、米がそれを吸って濃厚な余韻になります。",
    origin: "洋食",
    alternatives: ["鶏肉", "麦", "豆乳", "青菜"],
  },
  {
    id: "coconut-spice-chicken",
    name: "鶏肉のココナッツスパイス煮",
    description: "スパイスの香りをココナッツで包む、やさしいアジア風煮込み。",
    ingredients: ["鶏肉", "ココナッツミルク", "カレー粉", "玉ねぎ", "ライム"],
    steps: ["玉ねぎとスパイスを炒める", "鶏肉を加えて煮る", "ライムで香りを整える"],
    cookingTime: "32分",
    difficulty: "ふつう",
    foodElement: "chicken",
    cookingMethodElement: "simmer",
    seasoningElement: "spice",
    textureElement: "rich",
    adventureLevel: "ちょっと冒険",
    reasonWhyItWorks: "鶏肉の淡さにスパイスが入り、ココナッツの濃厚さが全体をまとめます。",
    origin: "アジア",
    alternatives: ["豆腐", "魚", "ヨーグルト", "レモングラス"],
  },
  {
    id: "black-vinegar-crispy-pork",
    name: "黒酢のカリカリ豚焼き",
    description: "カリッと焼いた豚肉に、黒酢の酸味を絡める一皿。",
    ingredients: ["豚薄切り肉", "黒酢", "しょうゆ", "はちみつ", "ねぎ"],
    steps: ["豚肉を広げてカリッと焼く", "黒酢だれを煮詰める", "仕上げにねぎを散らす"],
    cookingTime: "22分",
    difficulty: "ふつう",
    foodElement: "pork",
    cookingMethodElement: "grill",
    seasoningElement: "sour",
    textureElement: "crunchy",
    adventureLevel: "意外",
    reasonWhyItWorks: "豚の脂を黒酢が切り、カリカリ食感が味の強さを軽快にします。",
    origin: "中華",
    alternatives: ["鶏皮", "バルサミコ酢", "れんこん", "唐辛子"],
  },
  {
    id: "sweet-savory-tofu-steak",
    name: "豆腐ステーキの香ばし甘辛だれ",
    description: "焼いた豆腐に甘辛だれを絡め、軽さと満足感を両立します。",
    ingredients: ["木綿豆腐", "しょうゆ", "みりん", "片栗粉", "ねぎ"],
    steps: ["豆腐の水切りをする", "片栗粉をまぶして焼く", "甘辛だれを絡める"],
    cookingTime: "20分",
    difficulty: "かんたん",
    foodElement: "tofu",
    cookingMethodElement: "grill",
    seasoningElement: "sweet-savory",
    textureElement: "roasty",
    adventureLevel: "定番",
    reasonWhyItWorks: "豆腐の淡さに焼き目を足すと、甘辛だれが主菜らしい輪郭を作ります。",
    origin: "和食",
    alternatives: ["厚揚げ", "きのこ", "柚子こしょう", "大根おろし"],
  },
  {
    id: "spiced-potato-omelet",
    name: "じゃがいもと卵のスパイスオムレツ",
    description: "ほくっとしたじゃがいもを、香る卵で包む朝昼向けの一皿。",
    ingredients: ["卵", "じゃがいも", "クミン", "玉ねぎ", "ヨーグルト"],
    steps: ["じゃがいもを薄切りにして焼く", "卵液にスパイスを混ぜる", "弱火でふわっとまとめる"],
    cookingTime: "24分",
    difficulty: "ふつう",
    foodElement: "egg",
    cookingMethodElement: "grill",
    seasoningElement: "spice",
    textureElement: "fluffy",
    adventureLevel: "ちょっと冒険",
    reasonWhyItWorks: "卵のふわっとした甘みに、じゃがいもとスパイスが奥行きを足します。",
    origin: "洋食",
    alternatives: ["さつまいも", "チーズ", "パプリカ", "豆腐"],
  },
  {
    id: "fresh-fish-spring-roll",
    name: "魚のさっぱり生春巻き風",
    description: "火を入れずに、魚と野菜を酸味のあるたれで軽くまとめます。",
    ingredients: ["刺身用の魚", "きゅうり", "ライスペーパー", "ライム", "ナンプラー"],
    steps: ["野菜を細く切る", "魚と野菜を巻く", "酸味のあるたれを添える"],
    cookingTime: "15分",
    difficulty: "かんたん",
    foodElement: "fish",
    cookingMethodElement: "raw",
    seasoningElement: "sour",
    textureElement: "fresh",
    adventureLevel: "意外",
    reasonWhyItWorks: "魚のうま味を酸味で軽くし、野菜の歯触りで食べ進めやすくします。",
    origin: "アジア",
    alternatives: ["蒸し鶏", "豆腐", "ミント", "スイートチリ"],
  },
  {
    id: "sansho-mushroom-fry",
    name: "きのこの唐揚げ山椒塩",
    description: "きのこの香りを閉じ込めて揚げ、山椒の辛味で引き締めます。",
    ingredients: ["きのこ", "片栗粉", "山椒", "塩", "レモン"],
    steps: ["きのこに下味をつける", "片栗粉をまぶして揚げる", "山椒塩とレモンで仕上げる"],
    cookingTime: "18分",
    difficulty: "かんたん",
    foodElement: "mushroom",
    cookingMethodElement: "fry",
    seasoningElement: "spicy",
    textureElement: "crunchy",
    adventureLevel: "意外",
    reasonWhyItWorks: "きのこのうま味を衣で閉じ込め、山椒の刺激が香りを立てます。",
    origin: "和食",
    alternatives: ["なす", "鶏肉", "花椒", "カレー塩"],
  },
];

export const initialChallenges: Challenge[] = [
  {
    id: "acid-week",
    title: "今週は酸味を3種類試す",
    description: "レモン、酢、発酵の酸味など、軽さの出し方を比べる。",
    progress: 1,
    target: 3,
    completed: false,
    badge: "酸味の探検家",
  },
  {
    id: "one-food-many-methods",
    title: "同じ食材を異なる調理法で作る",
    description: "一つの食材が、焼く・煮る・蒸すでどう変わるか観察する。",
    progress: 0,
    target: 2,
    completed: false,
    badge: "火入れ研究員",
  },
  {
    id: "unusual-texture",
    title: "いつも選ばない食感を試す",
    description: "濃厚、カリカリ、ふわふわなど、普段の好みから一歩ずらす。",
    progress: 0,
    target: 2,
    completed: false,
    badge: "食感コレクター",
  },
  {
    id: "world-dishes",
    title: "世界の料理を3つ探索する",
    description: "和食だけでなく、洋食・中華・アジアの方向へ広げる。",
    progress: 1,
    target: 3,
    completed: false,
    badge: "食卓の地図係",
  },
];

export const defaultUser: User = {
  id: "user-local-001",
  name: "悠平さん",
  onboardingCompleted: false,
  streak: 4,
  explorationLevel: 2,
  isPro: false,
};

export const defaultSelection: Record<ElementCategory, string> = {
  food: "chicken",
  method: "grill",
  seasoning: "sour",
  texture: "roasty",
};

export function findElement(category: ElementCategory, id: string) {
  return cookingElements[category].find((element) => element.id === id) ?? cookingElements[category][0];
}

export function getDishById(id: string) {
  return dishes.find((dish) => dish.id === id) ?? dishes[0];
}
