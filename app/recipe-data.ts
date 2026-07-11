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

const coreDishes: Dish[] = [
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
  {
    id: "yogurt-spice-chicken",
    name: "鶏肉のヨーグルトスパイス炒め",
    description: "ヨーグルトの酸味で鶏肉をやわらかくし、香るスパイスで仕上げます。",
    ingredients: ["鶏もも肉", "ヨーグルト", "カレー粉", "にんにく", "玉ねぎ"],
    steps: ["鶏肉をヨーグルトとスパイスに漬ける", "玉ねぎと鶏肉を炒める", "水分を飛ばして香りを立てる"],
    cookingTime: "26分",
    difficulty: "ふつう",
    foodElement: "chicken",
    cookingMethodElement: "stir",
    seasoningElement: "spice",
    textureElement: "rich",
    adventureLevel: "ちょっと冒険",
    reasonWhyItWorks: "ヨーグルトの酸味が鶏肉を軽くし、スパイスの香りが淡白さに奥行きを足します。",
    origin: "アジア",
    alternatives: ["鶏むね肉", "豆腐", "ターメリック", "レモン"],
  },
  {
    id: "steamed-pork-cabbage",
    name: "豚肉と白菜の重ね蒸し",
    description: "豚のうま味を白菜に含ませる、鍋ひとつのしっとりした料理。",
    ingredients: ["豚バラ肉", "白菜", "しょうが", "だし", "ポン酢"],
    steps: ["白菜と豚肉を交互に重ねる", "だしを加えて蒸し煮にする", "ポン酢と薬味で仕上げる"],
    cookingTime: "22分",
    difficulty: "かんたん",
    foodElement: "pork",
    cookingMethodElement: "steam",
    seasoningElement: "umami",
    textureElement: "moist",
    adventureLevel: "定番",
    reasonWhyItWorks: "白菜の水分が豚の脂を受け止め、蒸すことで味が穏やかにまとまります。",
    origin: "中華",
    alternatives: ["鶏ひき肉", "キャベツ", "昆布だし", "黒酢"],
  },
  {
    id: "herb-fried-white-fish",
    name: "白身魚のハーブフライ",
    description: "淡白な魚を薄衣で揚げ、レモンとハーブで軽く食べます。",
    ingredients: ["白身魚", "パン粉", "パセリ", "レモン", "塩"],
    steps: ["魚に塩とハーブをなじませる", "薄く衣をつける", "少ない油で両面をカリッと揚げる"],
    cookingTime: "20分",
    difficulty: "ふつう",
    foodElement: "fish",
    cookingMethodElement: "fry",
    seasoningElement: "salt",
    textureElement: "crunchy",
    adventureLevel: "定番",
    reasonWhyItWorks: "魚の水分を衣で包み、カリッとした表面とレモンで軽快な対比をつくります。",
    origin: "洋食",
    alternatives: ["鮭", "米粉", "タイム", "ヨーグルトソース"],
  },
  {
    id: "tofu-tomato-cold-salad",
    name: "豆腐とトマトの冷たい香味サラダ",
    description: "豆腐のやわらかさに、トマトと香味油のさっぱりした酸味を重ねます。",
    ingredients: ["絹ごし豆腐", "トマト", "酢", "ごま油", "青ねぎ"],
    steps: ["豆腐の水気を軽く切る", "トマトと香味野菜を切る", "酢と油のたれをかけて冷やす"],
    cookingTime: "12分",
    difficulty: "かんたん",
    foodElement: "tofu",
    cookingMethodElement: "raw",
    seasoningElement: "sour",
    textureElement: "fresh",
    adventureLevel: "ちょっと冒険",
    reasonWhyItWorks: "豆腐の淡さをトマトの酸味が引き締め、油の香りが短い余韻をつくります。",
    origin: "アジア",
    alternatives: ["アボカド", "大葉", "黒酢", "ナンプラー"],
  },
  {
    id: "butter-mushroom-egg",
    name: "きのこと卵のバター炒め",
    description: "きのこの香りをバターに移し、卵でふわっと包む朝食にもなる一皿。",
    ingredients: ["卵", "きのこ", "バター", "塩", "黒こしょう"],
    steps: ["きのこをバターで炒める", "溶き卵を流し入れる", "半熟で火を止めて余熱でまとめる"],
    cookingTime: "15分",
    difficulty: "かんたん",
    foodElement: "egg",
    cookingMethodElement: "stir",
    seasoningElement: "umami",
    textureElement: "rich",
    adventureLevel: "定番",
    reasonWhyItWorks: "きのこのうま味とバターの香りを卵がまとめ、ふわふわと濃厚な余韻が残ります。",
    origin: "洋食",
    alternatives: ["豆腐", "チーズ", "オリーブオイル", "ハーブ"],
  },
  {
    id: "miso-grilled-eggplant",
    name: "なすの味噌焼き",
    description: "油を吸ったなすに味噌だれをのせ、焼き目で香りを引き出します。",
    ingredients: ["なす", "味噌", "みりん", "ごま", "青ねぎ"],
    steps: ["なすを縦に切る", "切り口に油を塗って焼く", "味噌だれをのせて再び焼く"],
    cookingTime: "15分",
    difficulty: "かんたん",
    foodElement: "eggplant",
    cookingMethodElement: "grill",
    seasoningElement: "sweet-savory",
    textureElement: "roasty",
    adventureLevel: "定番",
    reasonWhyItWorks: "なすのとろりとした水分と味噌の甘辛さが、焼き目の香ばしさで一つになります。",
    origin: "和食",
    alternatives: ["ズッキーニ", "赤味噌", "チーズ", "山椒"],
  },
  {
    id: "potato-galette",
    name: "じゃがいもの薄焼きガレット",
    description: "細切りのじゃがいもを一枚にまとめ、外側を香ばしく焼きます。",
    ingredients: ["じゃがいも", "塩", "オリーブオイル", "チーズ", "黒こしょう"],
    steps: ["じゃがいもを細切りにする", "フライパンで円形に広げる", "両面を押さえながら焼く"],
    cookingTime: "25分",
    difficulty: "ふつう",
    foodElement: "potato",
    cookingMethodElement: "grill",
    seasoningElement: "salt",
    textureElement: "crunchy",
    adventureLevel: "ちょっと冒険",
    reasonWhyItWorks: "じゃがいもの甘みを塩で立て、薄い表面積を焼くことでカリカリ感をつくります。",
    origin: "洋食",
    alternatives: ["さつまいも", "片栗粉", "ローズマリー", "ベーコン"],
  },
  {
    id: "agedashi-crispy-tofu",
    name: "豆腐のサクサク揚げ出し",
    description: "衣をつけた豆腐に、だしのうま味を少しだけ含ませます。",
    ingredients: ["木綿豆腐", "片栗粉", "だし", "しょうゆ", "大根おろし"],
    steps: ["豆腐の水切りをする", "片栗粉をまぶして揚げる", "温かいだしと薬味を添える"],
    cookingTime: "22分",
    difficulty: "ふつう",
    foodElement: "tofu",
    cookingMethodElement: "fry",
    seasoningElement: "umami",
    textureElement: "crunchy",
    adventureLevel: "定番",
    reasonWhyItWorks: "外側のサクサク感と中のやわらかさに、だしの水分が対比をつくります。",
    origin: "和食",
    alternatives: ["厚揚げ", "きのこ", "白だし", "しょうが"],
  },
  {
    id: "lemon-mushroom-pasta",
    name: "きのこのレモンパスタ",
    description: "きのこの香りを炒め、レモンの酸味で軽いパスタに仕上げます。",
    ingredients: ["きのこ", "スパゲッティ", "レモン", "にんにく", "オリーブオイル"],
    steps: ["パスタをゆでる", "きのことにんにくを炒める", "ゆで汁とレモンでソースにする"],
    cookingTime: "20分",
    difficulty: "かんたん",
    foodElement: "mushroom",
    cookingMethodElement: "stir",
    seasoningElement: "sour",
    textureElement: "fresh",
    adventureLevel: "ちょっと冒険",
    reasonWhyItWorks: "きのこのうま味にレモンの酸味を合わせると、油を使っても後味が軽くなります。",
    origin: "洋食",
    alternatives: ["しめじ", "うどん", "ライム", "粉チーズ"],
  },
  {
    id: "pork-satay-skewers",
    name: "豚肉のサテ風串焼き",
    description: "甘いスパイスだれを絡めた豚肉を、香ばしい串焼きにします。",
    ingredients: ["豚こま肉", "ピーナッツバター", "カレー粉", "しょうゆ", "ライム"],
    steps: ["豚肉をたれに漬ける", "串に刺してフライパンで焼く", "ライムとたれを添える"],
    cookingTime: "28分",
    difficulty: "ふつう",
    foodElement: "pork",
    cookingMethodElement: "grill",
    seasoningElement: "spice",
    textureElement: "roasty",
    adventureLevel: "意外",
    reasonWhyItWorks: "豚の脂にスパイスとナッツのコクを重ね、焼き目で甘い香りを引き出します。",
    origin: "アジア",
    alternatives: ["鶏肉", "味噌", "ココナッツミルク", "レモン"],
  },
  {
    id: "tomato-egg-soup",
    name: "トマトと卵のふわふわスープ",
    description: "酸味のあるトマトのスープに卵を流し、ふわっと仕上げます。",
    ingredients: ["卵", "トマト", "鶏がらスープ", "長ねぎ", "ごま油"],
    steps: ["トマトをスープで煮る", "溶き卵を細く流し入れる", "ねぎとごま油で仕上げる"],
    cookingTime: "18分",
    difficulty: "かんたん",
    foodElement: "egg",
    cookingMethodElement: "simmer",
    seasoningElement: "sour",
    textureElement: "fluffy",
    adventureLevel: "定番",
    reasonWhyItWorks: "トマトの酸味を卵が丸く包み、水分のある料理でも満足感が残ります。",
    origin: "中華",
    alternatives: ["豆腐", "わかめ", "黒酢", "春雨"],
  },
  {
    id: "eggplant-chickpea-curry",
    name: "なすとひよこ豆のスパイスカレー",
    description: "なすにスパイスと豆のうま味を含ませる、植物性の濃厚な煮込み。",
    ingredients: ["なす", "ひよこ豆", "トマト", "クミン", "ココナッツミルク"],
    steps: ["スパイスを油で温める", "なすとトマトを炒める", "ひよこ豆とココナッツを煮込む"],
    cookingTime: "35分",
    difficulty: "ふつう",
    foodElement: "eggplant",
    cookingMethodElement: "simmer",
    seasoningElement: "spice",
    textureElement: "rich",
    adventureLevel: "意外",
    reasonWhyItWorks: "なすが油とスパイスを吸い、豆のうま味とココナッツの厚みを受け止めます。",
    origin: "アジア",
    alternatives: ["豆腐", "レンズ豆", "ヨーグルト", "ほうれん草"],
  },
];

type SupplementalDishSeed = {
  id: string;
  name: string;
  foodElement: string;
  cookingMethodElement: string;
  seasoningElement: string;
  textureElement: string;
  adventureLevel: AdventureLevel;
  origin: string;
  cookingTime: string;
  difficulty: string;
};

const supplementalDishSeeds: SupplementalDishSeed[] = [
  { id: "chicken-rosemary-pan", name: "鶏肉のローズマリー焼き", foodElement: "chicken", cookingMethodElement: "grill", seasoningElement: "salt", textureElement: "roasty", adventureLevel: "定番", origin: "洋食", cookingTime: "22分", difficulty: "かんたん" },
  { id: "chicken-tomato-soup", name: "鶏肉とトマトの煮込み", foodElement: "chicken", cookingMethodElement: "simmer", seasoningElement: "umami", textureElement: "moist", adventureLevel: "定番", origin: "洋食", cookingTime: "30分", difficulty: "ふつう" },
  { id: "chicken-ginger-steam", name: "鶏肉のしょうが蒸し", foodElement: "chicken", cookingMethodElement: "steam", seasoningElement: "salt", textureElement: "fresh", adventureLevel: "定番", origin: "和食", cookingTime: "20分", difficulty: "かんたん" },
  { id: "chicken-five-spice", name: "五香粉チキン", foodElement: "chicken", cookingMethodElement: "fry", seasoningElement: "spice", textureElement: "crunchy", adventureLevel: "意外", origin: "中華", cookingTime: "24分", difficulty: "ふつう" },
  { id: "chicken-citrus-salad", name: "鶏肉と柑橘のサラダ", foodElement: "chicken", cookingMethodElement: "raw", seasoningElement: "sour", textureElement: "fresh", adventureLevel: "ちょっと冒険", origin: "洋食", cookingTime: "18分", difficulty: "かんたん" },
  { id: "chicken-tandoori-roast", name: "簡単タンドリーチキン", foodElement: "chicken", cookingMethodElement: "grill", seasoningElement: "spice", textureElement: "rich", adventureLevel: "ちょっと冒険", origin: "アジア", cookingTime: "35分", difficulty: "ふつう" },
  { id: "chicken-sichuan-stir", name: "鶏肉の花椒炒め", foodElement: "chicken", cookingMethodElement: "stir", seasoningElement: "spicy", textureElement: "roasty", adventureLevel: "意外", origin: "中華", cookingTime: "18分", difficulty: "かんたん" },
  { id: "chicken-herb-poach", name: "鶏むね肉のハーブゆで", foodElement: "chicken", cookingMethodElement: "simmer", seasoningElement: "sour", textureElement: "moist", adventureLevel: "定番", origin: "洋食", cookingTime: "25分", difficulty: "かんたん" },
  { id: "chicken-coconut-grill", name: "鶏肉のココナッツ焼き", foodElement: "chicken", cookingMethodElement: "grill", seasoningElement: "spice", textureElement: "roasty", adventureLevel: "意外", origin: "アジア", cookingTime: "28分", difficulty: "ふつう" },
  { id: "chicken-olive-simmer", name: "鶏肉とオリーブの白ワイン煮", foodElement: "chicken", cookingMethodElement: "simmer", seasoningElement: "salt", textureElement: "rich", adventureLevel: "ちょっと冒険", origin: "洋食", cookingTime: "35分", difficulty: "ふつう" },
  { id: "pork-kimchi-stew", name: "豚肉とキムチの煮込み", foodElement: "pork", cookingMethodElement: "simmer", seasoningElement: "spicy", textureElement: "rich", adventureLevel: "ちょっと冒険", origin: "アジア", cookingTime: "30分", difficulty: "かんたん" },
  { id: "pork-apple-roast", name: "豚肉とりんごのロースト", foodElement: "pork", cookingMethodElement: "grill", seasoningElement: "sweet-savory", textureElement: "roasty", adventureLevel: "意外", origin: "洋食", cookingTime: "32分", difficulty: "ふつう" },
  { id: "pork-cabbage-stir", name: "豚肉とキャベツの塩炒め", foodElement: "pork", cookingMethodElement: "stir", seasoningElement: "salt", textureElement: "crunchy", adventureLevel: "定番", origin: "中華", cookingTime: "15分", difficulty: "かんたん" },
  { id: "pork-herb-steam", name: "豚肉の香草蒸し", foodElement: "pork", cookingMethodElement: "steam", seasoningElement: "umami", textureElement: "moist", adventureLevel: "ちょっと冒険", origin: "洋食", cookingTime: "24分", difficulty: "ふつう" },
  { id: "pork-spicy-fry", name: "豚肉のスパイシー唐揚げ", foodElement: "pork", cookingMethodElement: "fry", seasoningElement: "spicy", textureElement: "crunchy", adventureLevel: "意外", origin: "中華", cookingTime: "26分", difficulty: "ふつう" },
  { id: "pork-orange-simmer", name: "豚肉のオレンジ煮", foodElement: "pork", cookingMethodElement: "simmer", seasoningElement: "sour", textureElement: "moist", adventureLevel: "意外", origin: "洋食", cookingTime: "32分", difficulty: "ふつう" },
  { id: "pork-pepper-grill", name: "豚肉の黒こしょう焼き", foodElement: "pork", cookingMethodElement: "grill", seasoningElement: "salt", textureElement: "roasty", adventureLevel: "定番", origin: "洋食", cookingTime: "18分", difficulty: "かんたん" },
  { id: "pork-miso-simmer", name: "豚肉と大根の味噌煮", foodElement: "pork", cookingMethodElement: "simmer", seasoningElement: "sweet-savory", textureElement: "rich", adventureLevel: "定番", origin: "和食", cookingTime: "40分", difficulty: "ふつう" },
  { id: "pork-larb-stir", name: "豚ひき肉のラープ風", foodElement: "pork", cookingMethodElement: "stir", seasoningElement: "sour", textureElement: "fresh", adventureLevel: "意外", origin: "アジア", cookingTime: "20分", difficulty: "かんたん" },
  { id: "fish-tomato-braise", name: "魚のトマト蒸し煮", foodElement: "fish", cookingMethodElement: "simmer", seasoningElement: "sour", textureElement: "moist", adventureLevel: "定番", origin: "洋食", cookingTime: "25分", difficulty: "ふつう" },
  { id: "fish-coconut-steam", name: "白身魚のココナッツ蒸し", foodElement: "fish", cookingMethodElement: "steam", seasoningElement: "spice", textureElement: "fresh", adventureLevel: "意外", origin: "アジア", cookingTime: "22分", difficulty: "ふつう" },
  { id: "fish-citrus-raw", name: "魚の柑橘セビーチェ", foodElement: "fish", cookingMethodElement: "raw", seasoningElement: "sour", textureElement: "fresh", adventureLevel: "意外", origin: "洋食", cookingTime: "15分", difficulty: "かんたん" },
  { id: "fish-spice-fry", name: "魚のスパイスフライ", foodElement: "fish", cookingMethodElement: "fry", seasoningElement: "spice", textureElement: "crunchy", adventureLevel: "ちょっと冒険", origin: "アジア", cookingTime: "25分", difficulty: "ふつう" },
  { id: "fish-herb-grill", name: "魚のハーブ塩焼き", foodElement: "fish", cookingMethodElement: "grill", seasoningElement: "salt", textureElement: "roasty", adventureLevel: "定番", origin: "洋食", cookingTime: "20分", difficulty: "かんたん" },
  { id: "fish-miso-simmer", name: "魚の味噌煮", foodElement: "fish", cookingMethodElement: "simmer", seasoningElement: "sweet-savory", textureElement: "moist", adventureLevel: "定番", origin: "和食", cookingTime: "30分", difficulty: "ふつう" },
  { id: "fish-salsa-raw", name: "魚のサルサ仕立て", foodElement: "fish", cookingMethodElement: "raw", seasoningElement: "sour", textureElement: "fresh", adventureLevel: "意外", origin: "洋食", cookingTime: "15分", difficulty: "かんたん" },
  { id: "fish-blackpepper-stir", name: "魚と野菜の黒こしょう炒め", foodElement: "fish", cookingMethodElement: "stir", seasoningElement: "spicy", textureElement: "roasty", adventureLevel: "ちょっと冒険", origin: "中華", cookingTime: "18分", difficulty: "かんたん" },
  { id: "fish-ginger-steam", name: "魚のしょうがねぎ蒸し", foodElement: "fish", cookingMethodElement: "steam", seasoningElement: "umami", textureElement: "moist", adventureLevel: "定番", origin: "中華", cookingTime: "20分", difficulty: "かんたん" },
  { id: "fish-curry-simmer", name: "魚のココナッツカレー", foodElement: "fish", cookingMethodElement: "simmer", seasoningElement: "spice", textureElement: "rich", adventureLevel: "ちょっと冒険", origin: "アジア", cookingTime: "35分", difficulty: "ふつう" },
  { id: "tofu-maple-grill", name: "豆腐のメープル味噌焼き", foodElement: "tofu", cookingMethodElement: "grill", seasoningElement: "sweet-savory", textureElement: "roasty", adventureLevel: "意外", origin: "洋食", cookingTime: "20分", difficulty: "かんたん" },
  { id: "tofu-spicy-simmer", name: "豆腐の麻辣煮", foodElement: "tofu", cookingMethodElement: "simmer", seasoningElement: "spicy", textureElement: "rich", adventureLevel: "意外", origin: "中華", cookingTime: "25分", difficulty: "ふつう" },
  { id: "tofu-herb-raw", name: "豆腐のハーブ冷菜", foodElement: "tofu", cookingMethodElement: "raw", seasoningElement: "salt", textureElement: "fresh", adventureLevel: "ちょっと冒険", origin: "洋食", cookingTime: "10分", difficulty: "かんたん" },
  { id: "tofu-coconut-fry", name: "豆腐のココナッツ衣揚げ", foodElement: "tofu", cookingMethodElement: "fry", seasoningElement: "spice", textureElement: "crunchy", adventureLevel: "意外", origin: "アジア", cookingTime: "24分", difficulty: "ふつう" },
  { id: "tofu-miso-steam", name: "豆腐の味噌だれ蒸し", foodElement: "tofu", cookingMethodElement: "steam", seasoningElement: "umami", textureElement: "moist", adventureLevel: "定番", origin: "和食", cookingTime: "18分", difficulty: "かんたん" },
  { id: "tofu-sesame-stir", name: "豆腐と青菜のごま炒め", foodElement: "tofu", cookingMethodElement: "stir", seasoningElement: "umami", textureElement: "fresh", adventureLevel: "定番", origin: "中華", cookingTime: "15分", difficulty: "かんたん" },
  { id: "tofu-tomato-grill", name: "豆腐とトマトの焼き皿", foodElement: "tofu", cookingMethodElement: "grill", seasoningElement: "sour", textureElement: "roasty", adventureLevel: "ちょっと冒険", origin: "洋食", cookingTime: "22分", difficulty: "かんたん" },
  { id: "tofu-sweet-simmer", name: "豆腐の甘辛そぼろ煮", foodElement: "tofu", cookingMethodElement: "simmer", seasoningElement: "sweet-savory", textureElement: "moist", adventureLevel: "定番", origin: "和食", cookingTime: "25分", difficulty: "かんたん" },
  { id: "tofu-lime-raw", name: "豆腐のライム香味和え", foodElement: "tofu", cookingMethodElement: "raw", seasoningElement: "sour", textureElement: "fresh", adventureLevel: "意外", origin: "アジア", cookingTime: "10分", difficulty: "かんたん" },
  { id: "egg-spinach-stir", name: "卵とほうれん草の炒めもの", foodElement: "egg", cookingMethodElement: "stir", seasoningElement: "salt", textureElement: "fluffy", adventureLevel: "定番", origin: "中華", cookingTime: "12分", difficulty: "かんたん" },
  { id: "egg-curry-fry", name: "卵のカレー衣フライ", foodElement: "egg", cookingMethodElement: "fry", seasoningElement: "spice", textureElement: "crunchy", adventureLevel: "意外", origin: "洋食", cookingTime: "20分", difficulty: "ふつう" },
  { id: "egg-herb-steam", name: "卵のハーブ蒸し", foodElement: "egg", cookingMethodElement: "steam", seasoningElement: "umami", textureElement: "fluffy", adventureLevel: "ちょっと冒険", origin: "洋食", cookingTime: "18分", difficulty: "かんたん" },
  { id: "egg-mushroom-simmer", name: "卵ときのこのだし煮", foodElement: "egg", cookingMethodElement: "simmer", seasoningElement: "umami", textureElement: "moist", adventureLevel: "定番", origin: "和食", cookingTime: "20分", difficulty: "かんたん" },
  { id: "egg-salsa-grill", name: "卵のサルサ焼き", foodElement: "egg", cookingMethodElement: "grill", seasoningElement: "sour", textureElement: "roasty", adventureLevel: "意外", origin: "洋食", cookingTime: "17分", difficulty: "かんたん" },
  { id: "egg-sweet-stir", name: "卵の甘辛照り炒め", foodElement: "egg", cookingMethodElement: "stir", seasoningElement: "sweet-savory", textureElement: "fluffy", adventureLevel: "定番", origin: "和食", cookingTime: "14分", difficulty: "かんたん" },
  { id: "egg-spicy-simmer", name: "卵のチリスープ煮", foodElement: "egg", cookingMethodElement: "simmer", seasoningElement: "spicy", textureElement: "moist", adventureLevel: "ちょっと冒険", origin: "中華", cookingTime: "20分", difficulty: "かんたん" },
  { id: "egg-cheese-grill", name: "卵とチーズの香ばし焼き", foodElement: "egg", cookingMethodElement: "grill", seasoningElement: "salt", textureElement: "rich", adventureLevel: "定番", origin: "洋食", cookingTime: "20分", difficulty: "かんたん" },
  { id: "mushroom-teriyaki-grill", name: "きのこの照り焼き", foodElement: "mushroom", cookingMethodElement: "grill", seasoningElement: "sweet-savory", textureElement: "roasty", adventureLevel: "定番", origin: "和食", cookingTime: "15分", difficulty: "かんたん" },
  { id: "mushroom-coconut-simmer", name: "きのこのココナッツ煮", foodElement: "mushroom", cookingMethodElement: "simmer", seasoningElement: "spice", textureElement: "rich", adventureLevel: "意外", origin: "アジア", cookingTime: "25分", difficulty: "かんたん" },
  { id: "mushroom-lemon-steam", name: "きのこのレモン蒸し", foodElement: "mushroom", cookingMethodElement: "steam", seasoningElement: "sour", textureElement: "fresh", adventureLevel: "ちょっと冒険", origin: "洋食", cookingTime: "15分", difficulty: "かんたん" },
  { id: "mushroom-spice-fry", name: "きのこのスパイスフリット", foodElement: "mushroom", cookingMethodElement: "fry", seasoningElement: "spice", textureElement: "crunchy", adventureLevel: "意外", origin: "洋食", cookingTime: "20分", difficulty: "ふつう" },
  { id: "mushroom-garlic-stir", name: "きのこのにんにく炒め", foodElement: "mushroom", cookingMethodElement: "stir", seasoningElement: "salt", textureElement: "roasty", adventureLevel: "定番", origin: "洋食", cookingTime: "12分", difficulty: "かんたん" },
  { id: "mushroom-miso-grill", name: "きのこの味噌焼き", foodElement: "mushroom", cookingMethodElement: "grill", seasoningElement: "umami", textureElement: "moist", adventureLevel: "定番", origin: "和食", cookingTime: "18分", difficulty: "かんたん" },
  { id: "mushroom-herb-steam", name: "きのこのハーブ蒸し", foodElement: "mushroom", cookingMethodElement: "steam", seasoningElement: "salt", textureElement: "moist", adventureLevel: "ちょっと冒険", origin: "洋食", cookingTime: "16分", difficulty: "かんたん" },
  { id: "mushroom-vinegar-simmer", name: "きのこの黒酢煮", foodElement: "mushroom", cookingMethodElement: "simmer", seasoningElement: "sour", textureElement: "rich", adventureLevel: "意外", origin: "中華", cookingTime: "22分", difficulty: "かんたん" },
  { id: "mushroom-curry-fry", name: "きのこのカレー揚げ", foodElement: "mushroom", cookingMethodElement: "fry", seasoningElement: "spicy", textureElement: "crunchy", adventureLevel: "意外", origin: "洋食", cookingTime: "20分", difficulty: "かんたん" },
  { id: "eggplant-tomato-simmer", name: "なすとトマトの煮込み", foodElement: "eggplant", cookingMethodElement: "simmer", seasoningElement: "umami", textureElement: "rich", adventureLevel: "定番", origin: "洋食", cookingTime: "30分", difficulty: "かんたん" },
  { id: "eggplant-spice-grill", name: "なすのスパイス焼き", foodElement: "eggplant", cookingMethodElement: "grill", seasoningElement: "spice", textureElement: "roasty", adventureLevel: "ちょっと冒険", origin: "アジア", cookingTime: "22分", difficulty: "かんたん" },
  { id: "eggplant-lemon-fry", name: "なすのレモンフリット", foodElement: "eggplant", cookingMethodElement: "fry", seasoningElement: "sour", textureElement: "crunchy", adventureLevel: "意外", origin: "洋食", cookingTime: "24分", difficulty: "ふつう" },
  { id: "eggplant-miso-steam", name: "なすの味噌蒸し", foodElement: "eggplant", cookingMethodElement: "steam", seasoningElement: "sweet-savory", textureElement: "moist", adventureLevel: "定番", origin: "和食", cookingTime: "18分", difficulty: "かんたん" },
  { id: "eggplant-yogurt-simmer", name: "なすのヨーグルト煮", foodElement: "eggplant", cookingMethodElement: "simmer", seasoningElement: "sour", textureElement: "rich", adventureLevel: "意外", origin: "アジア", cookingTime: "28分", difficulty: "ふつう" },
  { id: "eggplant-garlic-stir", name: "なすのにんにく炒め", foodElement: "eggplant", cookingMethodElement: "stir", seasoningElement: "spicy", textureElement: "moist", adventureLevel: "定番", origin: "中華", cookingTime: "15分", difficulty: "かんたん" },
  { id: "eggplant-coconut-simmer", name: "なすのココナッツカレー煮", foodElement: "eggplant", cookingMethodElement: "simmer", seasoningElement: "spice", textureElement: "rich", adventureLevel: "意外", origin: "アジア", cookingTime: "32分", difficulty: "ふつう" },
  { id: "eggplant-salsa-grill", name: "なすの焼きサルサ", foodElement: "eggplant", cookingMethodElement: "grill", seasoningElement: "sour", textureElement: "fresh", adventureLevel: "ちょっと冒険", origin: "洋食", cookingTime: "20分", difficulty: "かんたん" },
  { id: "eggplant-panko-fry", name: "なすのパン粉焼き", foodElement: "eggplant", cookingMethodElement: "fry", seasoningElement: "salt", textureElement: "crunchy", adventureLevel: "定番", origin: "洋食", cookingTime: "25分", difficulty: "ふつう" },
  { id: "potato-tomato-simmer", name: "じゃがいものトマト煮", foodElement: "potato", cookingMethodElement: "simmer", seasoningElement: "sour", textureElement: "moist", adventureLevel: "定番", origin: "洋食", cookingTime: "30分", difficulty: "かんたん" },
  { id: "potato-rosemary-grill", name: "じゃがいものローズマリー焼き", foodElement: "potato", cookingMethodElement: "grill", seasoningElement: "salt", textureElement: "roasty", adventureLevel: "定番", origin: "洋食", cookingTime: "28分", difficulty: "かんたん" },
  { id: "potato-spice-fry", name: "じゃがいものスパイスフライ", foodElement: "potato", cookingMethodElement: "fry", seasoningElement: "spice", textureElement: "crunchy", adventureLevel: "意外", origin: "アジア", cookingTime: "25分", difficulty: "かんたん" },
  { id: "potato-sour-steam", name: "じゃがいもの酢蒸し", foodElement: "potato", cookingMethodElement: "steam", seasoningElement: "sour", textureElement: "fresh", adventureLevel: "意外", origin: "中華", cookingTime: "22分", difficulty: "かんたん" },
  { id: "potato-cheese-grill", name: "じゃがいものチーズ焼き", foodElement: "potato", cookingMethodElement: "grill", seasoningElement: "umami", textureElement: "rich", adventureLevel: "定番", origin: "洋食", cookingTime: "30分", difficulty: "かんたん" },
  { id: "potato-coconut-simmer", name: "じゃがいものココナッツ煮", foodElement: "potato", cookingMethodElement: "simmer", seasoningElement: "spice", textureElement: "moist", adventureLevel: "意外", origin: "アジア", cookingTime: "30分", difficulty: "かんたん" },
  { id: "potato-cumin-stir", name: "じゃがいものクミン炒め", foodElement: "potato", cookingMethodElement: "stir", seasoningElement: "spice", textureElement: "roasty", adventureLevel: "ちょっと冒険", origin: "アジア", cookingTime: "20分", difficulty: "かんたん" },
  { id: "potato-herb-steam", name: "じゃがいものハーブ蒸し", foodElement: "potato", cookingMethodElement: "steam", seasoningElement: "salt", textureElement: "moist", adventureLevel: "定番", origin: "洋食", cookingTime: "22分", difficulty: "かんたん" },
  { id: "potato-sesame-fry", name: "じゃがいものごま揚げ", foodElement: "potato", cookingMethodElement: "fry", seasoningElement: "sweet-savory", textureElement: "crunchy", adventureLevel: "意外", origin: "和食", cookingTime: "25分", difficulty: "かんたん" },
  { id: "potato-chili-grill", name: "じゃがいものチリ焼き", foodElement: "potato", cookingMethodElement: "grill", seasoningElement: "spicy", textureElement: "roasty", adventureLevel: "ちょっと冒険", origin: "洋食", cookingTime: "26分", difficulty: "かんたん" },
];

const generatedDishStyles = ["香味仕立て", "野菜添え", "温かい一皿", "ハーブ風味", "スパイスの皿", "家庭風", "季節の小皿", "食堂仕立て"];
const generatedOrigins = ["和食", "洋食", "中華", "アジア"];
const generatedDishSeeds: SupplementalDishSeed[] = Array.from({ length: 400 }, (_, index) => {
  const food = cookingElements.food[index % cookingElements.food.length];
  const method = cookingElements.method[(index * 3 + 1) % cookingElements.method.length];
  const seasoning = cookingElements.seasoning[(index * 5 + 2) % cookingElements.seasoning.length];
  const texture = cookingElements.texture[(index * 7 + 3) % cookingElements.texture.length];
  const adventureLevel: AdventureLevel = index % 9 === 0 ? "意外" : index % 3 === 0 ? "ちょっと冒険" : "定番";
  return {
    id: `generated-${String(index + 1).padStart(3, "0")}`,
    name: `${food.name}の${method.name}${generatedDishStyles[index % generatedDishStyles.length]}`,
    foodElement: food.id,
    cookingMethodElement: method.id,
    seasoningElement: seasoning.id,
    textureElement: texture.id,
    adventureLevel,
    origin: generatedOrigins[(index + Math.floor(index / 8)) % generatedOrigins.length],
    cookingTime: `${12 + ((index * 7) % 29)}分`,
    difficulty: index % 5 === 0 ? "ふつう" : "かんたん",
  };
});

function supplementalDishFromSeed(seed: SupplementalDishSeed): Dish {
  const elementName = (category: ElementCategory, id: string) => cookingElements[category].find((element) => element.id === id)?.name ?? id;
  const food = elementName("food", seed.foodElement);
  const method = elementName("method", seed.cookingMethodElement);
  const seasoning = elementName("seasoning", seed.seasoningElement);
  const texture = elementName("texture", seed.textureElement);
  return {
    ...seed,
    description: `${food}を${method}で仕上げ、${seasoning}と${texture}を重ねた${seed.origin}の一皿。`,
    ingredients: [food, seasoning, "香味野菜", "油またはだし"],
    steps: [`${food}を食べやすく下ごしらえする`, `${method}で素材の表情をつくる`, `${seasoning}で味を整え、${texture}に仕上げる`],
    reasonWhyItWorks: `${food}の持ち味に${seasoning}を合わせ、${method}が${texture}を引き出します。`,
    alternatives: ["鶏肉", "豆腐", "きのこ", "旬の野菜"],
  };
}

const supplementalDishes = supplementalDishSeeds.map(supplementalDishFromSeed);
const generatedDishes = generatedDishSeeds.map(supplementalDishFromSeed);

export const dishes: Dish[] = [...coreDishes, ...supplementalDishes, ...generatedDishes];

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
