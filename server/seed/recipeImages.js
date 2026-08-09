/**
 * Dish-matched images.
 * - Prefer Wikimedia when the photo clearly shows that dish
 * - Otherwise use curated Unsplash food photos matched by dish type
 * - Fallbacks are by meal category — never a random unrelated dish
 */

const U = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;
const W = (path) => `https://upload.wikimedia.org/wikipedia/commons/thumb/${path}`;

// Category pools — every URL is a plated/cooked food shot of that type
const CAT = {
  curry: [
    U('photo-1585937421612-70a008296fbe'), // rich curry bowl
    U('photo-1603894584373-5ac82b2ae398'), // chicken curry
    U('photo-1565557623262-b51c2513a943'), // indian curry plate
    U('photo-1631452180519-c01422bd43d6'), // spicy curry
  ],
  rice: [
    U('photo-1563379091339-03b21ab4a4f8'), // biryani
    U('photo-1599043513900-ed6fe01d3833'), // rice dish
    U('photo-1512058564366-18510be2db19'), // rice bowl
  ],
  kebab: [
    U('photo-1555939594-58d7cb561ad1'), // grilled meat
    U('photo-1529042410759-befb1204b468'), // skewers
    U('photo-1603360946369-dc9bb6258143'), // kebab plate
  ],
  bread: [
    U('photo-1626700051175-6818013e1d4f'), // naan
    U('photo-1601050690597-df0568fa7098'), // flatbread
    U('photo-1509440159596-0249088772ff'), // bread
  ],
  snack: [
    U('photo-1601050690117-94f5f6f7b92f'), // fried snack
    U('photo-1606491956689-2ea866880f84'), // pakora-style
    U('photo-1626082927389-6cd097cdc6ec'), // street snack
  ],
  dessert: [
    U('photo-1488477181946-6428a0291777'), // sweet dessert
    U('photo-1551024506-0bccd828d307'), // dessert bowl
    U('photo-1571877227200-a0d98ea607e9'), // pudding-style
  ],
  drink: [
    U('photo-1571934811356-5cc061b6821a'), // chai tea
    U('photo-1623065424904-001c8d4ee0c5'), // lassi/yogurt drink
    U('photo-1572490122747-3968b75cc699'), // milkshake
    U('photo-1544145945-f90425340c7e'), // cold drink
  ],
  soup: [
    U('photo-1547592166-23ac45744acd'), // soup bowl
    U('photo-1476718406336-bb5a9690ee2a'), // warm soup
  ],
  veg: [
    U('photo-1540420773420-3366772f4999'), // vegetable dish
    U('photo-1512621771820-b8e1eb0b1b6b'), // fresh salad/veg
    U('photo-1576045057995-568f588f82fb'), // greens
  ],
  fish: [
    U('photo-1519704800-bf2d4d13ce1c'), // cooked fish
    U('photo-1559339352-11d035aa65de'), // fish plate
  ],
  egg: [
    U('photo-1482049016688-2d3e1b311543'), // egg dish
    U('photo-1525351484163-7529414344d8'), // eggs
  ],
  fries: [U('photo-1573080496219-bb080dd4f877')],
  burger: [U('photo-1568901346375-23c9450c58cd')],
  toast: [U('photo-1484723091739-30a097e8f929')],
  roast: [U('photo-1598103442097-8b74394b95c6')],
  prawn: [U('photo-1565680018434-b513d5ea0c2c')],
  mango: [U('photo-1553279768-865429fa0078')],
};

function pick(list, key) {
  let h = 0;
  for (let i = 0; i < key.length; i += 1) h = (h + key.charCodeAt(i) * (i + 1)) % list.length;
  return list[h];
}

/** Exact dish → photo (best available match) */
export const recipeImages = {
  // —— Accurate Wikimedia dish photos ——
  'Sarson da Saag': W('b/b2/Punjabi_Sarsoon_Ka_Saag.JPG/330px-Punjabi_Sarsoon_Ka_Saag.JPG'),
  Nihari: W('4/4b/Nalli_Nihari_India.jpg/330px-Nalli_Nihari_India.jpg'),
  'Beef Nihari': W('4/4b/Nalli_Nihari_India.jpg/330px-Nalli_Nihari_India.jpg'),
  'Chapli Kebab': W('3/33/Chapli_Kebab.jpg/330px-Chapli_Kebab.jpg'),
  Sajji: W('0/08/Sajji.JPG/330px-Sajji.JPG'),
  'Balochi Sajji Platter': W('0/08/Sajji.JPG/330px-Sajji.JPG'),
  Haleem: W('0/0f/Pakistani_Haleem_served_with_garnish.jpg/330px-Pakistani_Haleem_served_with_garnish.jpg'),
  Khichra: W('0/0f/Pakistani_Haleem_served_with_garnish.jpg/330px-Pakistani_Haleem_served_with_garnish.jpg'),
  'Sheer Khurma': W('e/ed/Sheer_Khurma.jpg/330px-Sheer_Khurma.jpg'),
  'Dahi Baray': W('2/2d/Dahi_bhalla_or_dahi_wada_or_dahi_bada.PNG/330px-Dahi_bhalla_or_dahi_wada_or_dahi_bada.PNG'),
  'Dahi Bhallay Plate': W('2/2d/Dahi_bhalla_or_dahi_wada_or_dahi_bada.PNG/330px-Dahi_bhalla_or_dahi_wada_or_dahi_bada.PNG'),
  'Aloo Gosht': W('8/83/Aaloo_Gosht_%28cropped%29.JPG/330px-Aaloo_Gosht_%28cropped%29.JPG'),
  'Kashmiri Chai': W('4/4e/The_Great_Kashmiri_Salt_tea.png/330px-The_Great_Kashmiri_Salt_tea.png'),
  Korma: W('a/a8/Chicken_Korma.JPG/330px-Chicken_Korma.JPG'),
  'Sai Bhaji': W('c/c6/Sindhi_Sai_Bhaji.JPG/330px-Sindhi_Sai_Bhaji.JPG'),
  'Sai Bhaji Rice': W('c/c6/Sindhi_Sai_Bhaji.JPG/330px-Sindhi_Sai_Bhaji.JPG'),
  Paya: W('8/88/Paya_Curry.JPG/330px-Paya_Curry.JPG'),
  Samosa: W('c/c4/Samosas%2C_snack_food_at_Wikipedia%27s_16th_Birthday_celebration_in_Chittagong_%2801%29.jpg/330px-Samosas%2C_snack_food_at_Wikipedia%27s_16th_Birthday_celebration_in_Chittagong_%2801%29.jpg'),
  'Keema Samosa': W('c/c4/Samosas%2C_snack_food_at_Wikipedia%27s_16th_Birthday_celebration_in_Chittagong_%2801%29.jpg/330px-Samosas%2C_snack_food_at_Wikipedia%27s_16th_Birthday_celebration_in_Chittagong_%2801%29.jpg'),
  'Vegetable Samosa': W('c/c4/Samosas%2C_snack_food_at_Wikipedia%27s_16th_Birthday_celebration_in_Chittagong_%2801%29.jpg/330px-Samosas%2C_snack_food_at_Wikipedia%27s_16th_Birthday_celebration_in_Chittagong_%2801%29.jpg'),
  Zarda: W('7/73/Coloured_Zarda_Chawal.JPG/330px-Coloured_Zarda_Chawal.JPG'),
  'Daal Makhani': W('6/69/Punjabi_style_Dal_Makhani.jpg/330px-Punjabi_style_Dal_Makhani.jpg'),
  Raita: W('7/78/Cucumber-raita.jpg/330px-Cucumber-raita.jpg'),
  Pakoras: W('c/cf/Onion_pakora_-_a.jpg/330px-Onion_pakora_-_a.jpg'),
  'Chicken Pakora': W('c/cf/Onion_pakora_-_a.jpg/330px-Onion_pakora_-_a.jpg'),
  'Aloo Paratha': W('1/1e/Triangle_paratha_%28cropped%29.JPG/330px-Triangle_paratha_%28cropped%29.JPG'),
  'Anda Paratha': W('1/1e/Triangle_paratha_%28cropped%29.JPG/330px-Triangle_paratha_%28cropped%29.JPG'),
  'Keema Paratha': W('1/1e/Triangle_paratha_%28cropped%29.JPG/330px-Triangle_paratha_%28cropped%29.JPG'),
  'Lachha Paratha': W('1/1e/Triangle_paratha_%28cropped%29.JPG/330px-Triangle_paratha_%28cropped%29.JPG'),
  Kheer: W('4/46/Kheer.jpg/330px-Kheer.jpg'),
  'Daighi Kheer': W('4/46/Kheer.jpg/330px-Kheer.jpg'),
  Firni: W('4/46/Kheer.jpg/330px-Kheer.jpg'),
  Jalebi: W('0/0c/Jalebiindia.jpg/330px-Jalebiindia.jpg'),
  'Tandoori Naan': W('4/4e/Annapurna_Naan.jpg/330px-Annapurna_Naan.jpg'),
  'Seekh Kebab': W('0/0c/Pakistani_Food_Beef_Kabobs.jpg/330px-Pakistani_Food_Beef_Kabobs.jpg'),
  'Halwa Puri': W('5/50/Fluffy_Poori_%28cropped%29.JPG/330px-Fluffy_Poori_%28cropped%29.JPG'),
  Chai: W('8/89/Chai_In_Sakora.jpg/330px-Chai_In_Sakora.jpg'),
  'Doodh Patti Special': W('8/89/Chai_In_Sakora.jpg/330px-Chai_In_Sakora.jpg'),
  Lassi: W('f/f1/Salt_lassi.jpg/330px-Salt_lassi.jpg'),
  'Mango Lassi': W('f/f1/Salt_lassi.jpg/330px-Salt_lassi.jpg'),
  'Gajar ka Halwa': W('c/cb/Cuisine_%28268%29_44.jpg/330px-Cuisine_%28268%29_44.jpg'),
  'Halwa Suji': W('c/cb/Cuisine_%28268%29_44.jpg/330px-Cuisine_%28268%29_44.jpg'),

  // —— Curated Unsplash: cooked food matching the dish type ——
  'Chicken Karahi': U('photo-1603894584373-5ac82b2ae398'),
  'White Chicken Karahi': U('photo-1603894584373-5ac82b2ae398'),
  'Peshawari Karahi': U('photo-1585937421612-70a008296fbe'),
  'Mutton Karahi': U('photo-1585937421612-70a008296fbe'),
  'Fish Karahi': U('photo-1519704800-bf2d4d13ce1c'),
  'Chicken Malai Karahi': U('photo-1603894584373-5ac82b2ae398'),
  'Chicken Handi': U('photo-1565557623262-b51c2513a943'),
  'Sindhi Biryani': U('photo-1563379091339-03b21ab4a4f8'),
  'Chicken Biryani': U('photo-1631452180519-c01422bd43d6'),
  'Beef Biryani': U('photo-1599043513900-ed6fe01d3833'),
  'Vegetable Biryani': U('photo-1512058564366-18510be2db19'),
  'Daal Chawal': U('photo-1546833999-b9f581a1996d'),
  'Mutton Pulao': U('photo-1599043513900-ed6fe01d3833'),
  Pulao: U('photo-1512058564366-18510be2db19'),
  'Beef Pulao': U('photo-1599043513900-ed6fe01d3833'),
  'Yakhni Pulao': U('photo-1563379091339-03b21ab4a4f8'),
  'Kabuli Pulao': U('photo-1631452180519-c01422bd43d6'),
  'Fruit Chaat': U('photo-1564093497595-5931221260e7'),
  'Chana Chaat': U('photo-1626082927389-6cd097cdc6ec'),
  'Papri Chaat': U('photo-1606491956689-2ea866880f84'),
  'Gol Gappay': U('photo-1601050690117-94f5f6f7b92f'),
  'BBQ Tikka': U('photo-1555939594-58d7cb561ad1'),
  'Chicken Malai Boti': U('photo-1529042410759-befb1204b468'),
  'Chicken Tikka Masala': U('photo-1565557623262-b51c2513a943'),
  'Shami Kebab': U('photo-1603360946369-dc9bb6258143'),
  'Beef Kabab Roll': U('photo-1529042410759-befb1204b468'),
  'Chapli Burger': U('photo-1568901346375-23c9450c58cd'),
  'Bun Kabab': U('photo-1568901346375-23c9450c58cd'),
  'Kaleji Fry': U('photo-1555939594-58d7cb561ad1'),
  'Aam Panna': U('photo-1553279768-865429fa0078'),
  'Bhindi Gosht': U('photo-1540420773420-3366772f4999'),
  'Okra Masala': U('photo-1540420773420-3366772f4999'),
  'Mixed Vegetable Curry': U('photo-1540420773420-3366772f4999'),
  'Palak Gosht': U('photo-1576045057995-568f588f82fb'),
  'Palak Paneer': U('photo-1576045057995-568f588f82fb'),
  'Methi Chicken': U('photo-1603894584373-5ac82b2ae398'),
  'Baingan Bharta': U('photo-1540420773420-3366772f4999'),
  'Egg Curry': U('photo-1482049016688-2d3e1b311543'),
  'Egg Bhurji': U('photo-1525351484163-7529414344d8'),
  'Bhuna Gosht': U('photo-1585937421612-70a008296fbe'),
  'Chicken Manchurian': U('photo-1603894584373-5ac82b2ae398'),
  'Kofta Curry': U('photo-1565557623262-b51c2513a943'),
  'Dum Pukht': U('photo-1585937421612-70a008296fbe'),
  'Chana Masala': U('photo-1546833999-b9f581a1996d'),
  'Aloo Keema': U('photo-1603894584373-5ac82b2ae398'),
  'Tinda Masala': U('photo-1540420773420-3366772f4999'),
  'Kaddu Salan': U('photo-1540420773420-3366772f4999'),
  'Arvi Gosht': U('photo-1585937421612-70a008296fbe'),
  'Chicken Soup': U('photo-1547592166-23ac45744acd'),
  'Tomato Soup': U('photo-1476718406336-bb5a9690ee2a'),
  'Chicken Corn Soup': U('photo-1547592166-23ac45744acd'),
  'Chicken Shawarma': U('photo-1529042410759-befb1204b468'),
  'Anda Shami': U('photo-1482049016688-2d3e1b311543'),
  'French Toast Desi': U('photo-1484723091739-30a097e8f929'),
  'Gulab Jamun': U('photo-1551024506-0bccd828d307'),
  'Ras Malai': U('photo-1488477181946-6428a0291777'),
  Sewaiyan: U('photo-1571877227200-a0d98ea607e9'),
  'Rooh Afza Milk': U('photo-1544145945-f90425340c7e'),
  'Kashmiri Kahwa': U('photo-1571934811356-5cc061b6821a'),
  'Daal Mash': U('photo-1546833999-b9f581a1996d'),
  'Daal Chana': U('photo-1546833999-b9f581a1996d'),
  Khichdi: U('photo-1512058564366-18510be2db19'),
  'Chicken Roast': U('photo-1598103442097-8b74394b95c6'),
  'Fish Fry': U('photo-1519704800-bf2d4d13ce1c'),
  'Prawn Masala': U('photo-1565680018434-b513d5ea0c2c'),
  'Naan Chany': U('photo-1626700051175-6818013e1d4f'),
  'Qeema Naan': U('photo-1626700051175-6818013e1d4f'),
  'Besan Chilla': U('photo-1525351484163-7529414344d8'),
  'Potato Cutlets': U('photo-1606491956689-2ea866880f84'),
  'Imli Chutney Chicken': U('photo-1603894584373-5ac82b2ae398'),
  'Achari Gosht': U('photo-1585937421612-70a008296fbe'),
  'Sindhi Curry': U('photo-1546833999-b9f581a1996d'),
  'Gilgit Apricot Curry': U('photo-1565557623262-b51c2513a943'),
  'Islamabad BBQ Platter': U('photo-1555939594-58d7cb561ad1'),
  'Fruit Custard': U('photo-1488477181946-6428a0291777'),
  'Chocolate Banana Shake': U('photo-1572490122747-3968b75cc699'),
  'Masala Fries': U('photo-1573080496219-bb080dd4f877'),
  'Murgh Cholay': U('photo-1603894584373-5ac82b2ae398'),
  'Khajoor Shake': U('photo-1572490122747-3968b75cc699'),
};

/** Keyword → category for unknown / new dishes */
const KEYWORD_CATEGORY = [
  [/biryani|pulao|pilaf|khichdi|rice|zarda|sewaiyan/i, 'rice'],
  [/kebab|kabab|tikka|boti|bbq|shawarma|seekh|shami|chapli|sajji|roast/i, 'kebab'],
  [/paratha|naan|roti|puri|toast|chilla/i, 'bread'],
  [/samosa|pakora|chaat|cutlet|fries|gol gapp|papri|roll|burger|bun /i, 'snack'],
  [/halwa|kheer|firni|jamun|ras malai|custard|jalebi|sheer|dessert/i, 'dessert'],
  [/lassi|chai|kahwa|shake|panna|rooh|drink|milk|soup/i, 'drink'],
  [/soup/i, 'soup'],
  [/fish|machli/i, 'fish'],
  [/prawn|shrimp|jhinga/i, 'prawn'],
  [/egg|anda|bhurji/i, 'egg'],
  [/palak|saag|sai bhaji|methi|spinach|veg|bhindi|okra|baingan|tinda|kaddu|chana|daal|dal|raita/i, 'veg'],
  [/karahi|korma|gosht|curry|handi|kofta|nihari|paya|haleem|salan|masala|manchurian|achari/i, 'curry'],
];

function categoryFor(nameEn) {
  for (const [re, cat] of KEYWORD_CATEGORY) {
    if (re.test(nameEn)) return cat;
  }
  return 'curry';
}

export function imageFor(nameEn) {
  if (recipeImages[nameEn]) return recipeImages[nameEn];
  const cat = categoryFor(nameEn);
  const pool = CAT[cat] || CAT.curry;
  return pick(pool, nameEn);
}
