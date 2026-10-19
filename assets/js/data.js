/**
 * KoreFlame - Mock Datasets and Constants
 * Single source of truth for menu, interactive grill cuts, packages, blogs, and initial state.
 */

const KF_DATA = {
  // 1. Meat Cuts for Home 1 Interactive Grill Simulator
  grillCuts: [
    {
      id: "galbi",
      nameEn: "Marinated Short Rib",
      nameKr: "Sweet Pear & Tamari Glaze",
      cutType: "Prime USDA Beef",
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop",
      cookingTime: "3 - 4 mins per side",
      estTotalMinutes: 7,
      grillSurfaceTemp: "400°F - 450°F (204°C - 232°C)",
      internalTargetTemp: "145°F (63°C) with 3-min rest (Medium)",
      doneness: "Medium / Medium-Well (caramelizes soy-pear glaze)",
      saucePairing: "House Savory Chili Dip & Roasted Sesame Salt Oil",
      suggestedBanchan: "Napa Cabbage Kimchi, Pickled Radish Wraps, Scallion Salad",
      foodSafety: "USDA Beef Standard: Sear over 400°F–450°F surface heat to caramelize marinade, then verify meat reaches at least 145°F (63°C) internal temperature with a 3-minute rest before cutting with shears.",
      servingSize: "250g bone-in cut",
      price: 38.00,
      description: "Hand-butterflied bone-in short rib marinated for 48 hours in Asian pear, fresh garlic, tamari, and wild honey."
    },
    {
      id: "samgyeopsal",
      nameEn: "Thick-Cut Pork Belly",
      nameKr: "Crisp Berkshire Pork Belly",
      cutType: "Berkshire Heritage Pork",
      image: "https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?q=80&w=800&auto=format&fit=crop",
      cookingTime: "4 - 5 mins per side until crisp gold",
      estTotalMinutes: 9,
      grillSurfaceTemp: "375°F - 400°F (190°C - 204°C)",
      internalTargetTemp: "145°F (63°C) min + 3-min rest (or 160°F for extra crisp)",
      doneness: "Crispy exterior, melt-in-mouth fat",
      saucePairing: "Fermented Soybean Dip and Maldon Salt with Toasted Sesame Oil",
      suggestedBanchan: "Aged 3-Year Napa Cabbage Kimchi, Grilled Garlic Cloves, Fragrant Perilla Leaves",
      foodSafety: "USDA Pork Standard: Pork requires a minimum internal temperature of 145°F (63°C) plus a 3-minute rest. Surface grilling at 375°F–400°F renders out excess fat and delivers safe, golden crisp crackling.",
      servingSize: "220g thick slab",
      price: 29.00,
      description: "Premium heirloom Berkshire pork belly, sliced to optimal 12mm thickness to achieve golden crisp edges and succulent bite."
    },
    {
      id: "wagyu",
      nameEn: "A5 Wagyu Ribeye",
      nameKr: "Snowflake Marbling BMS 9+",
      cutType: "Miyazaki Prefecture BMS 9+",
      image: "https://images.unsplash.com/photo-1558030006-450675393462?q=80&w=800&auto=format&fit=crop",
      cookingTime: "60 - 90 seconds per side",
      estTotalMinutes: 3,
      grillSurfaceTemp: "450°F - 500°F (232°C - 260°C)",
      internalTargetTemp: "130°F - 135°F (54°C - 57°C) (Chef's Medium-Rare)",
      doneness: "Medium-Rare (delicate fat render)",
      saucePairing: "Pure Wasabi Root & Flaky Sea Salt only (preserves unadulterated marbling)",
      suggestedBanchan: "Lightly Pickled Onions in Soy Vinegar, Mild Chilled Radish Kimchi",
      foodSafety: "High BMS marbling renders swiftly. Flash-sear on high surface heat (450°F+) to pasteurize surfaces while maintaining 130°F–135°F core temperature. Rest 2 minutes before serving.",
      servingSize: "180g center-cut steak",
      price: 68.00,
      description: "Intricately marbled Japanese Black Cattle ribeye with snowflake dispersion that melts at body temperature."
    },
    {
      id: "bulgogi",
      nameEn: "Marinated Beef Bulgogi",
      nameKr: "Sweet Soy Marinated Beef",
      cutType: "Thinly Sliced Prime Rib",
      image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?q=80&w=800&auto=format&fit=crop",
      cookingTime: "2 - 3 mins quick toss on dome grill",
      estTotalMinutes: 3,
      grillSurfaceTemp: "375°F (190°C) Medium Dome Heat",
      internalTargetTemp: "145°F (63°C) minimum",
      doneness: "Tender and fully browned with glaze",
      saucePairing: "Chili-Garlic Dip & Soybean Dip wrapped in fresh Red Leaf Lettuce",
      suggestedBanchan: "Sweet Soy Glazed Potatoes, Crisp Seasoned Bean Sprouts",
      foodSafety: "USDA Beef Standard: Thin wafer ribbons cook very quickly. Toss continuously on the 375°F grill plate to ensure all slices reach 145°F (63°C) without scorching the natural honey sugars.",
      servingSize: "200g sliced portion",
      price: 28.00,
      description: "Paper-thin prime beef tenderized with sweet pear, scallions, sesame oil, and charred garlic."
    },
    {
      id: "chicken-bulgogi",
      nameEn: "Spicy Chicken Bulgogi",
      nameKr: "Spicy Chili Marinated Thigh",
      cutType: "Cage-Free Boneless Thigh",
      image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=800&auto=format&fit=crop",
      cookingTime: "4 - 5 mins per side with constant flipping",
      estTotalMinutes: 9,
      grillSurfaceTemp: "325°F - 350°F (163°C - 177°C) Gentle Heat",
      internalTargetTemp: "165°F (74°C) strictly measured internally",
      doneness: "Fully cooked through (Juicy & Tender)",
      saucePairing: "Cooling Chive Mayo Dip & Pickled Daikon",
      suggestedBanchan: "Cucumber Kimchi, Steamed Rice, Sweet Corn with Cheese",
      foodSafety: "USDA Poultry Mandate: Chicken must always reach a verified internal temperature of 165°F (74°C). Grill over moderate 325°F–350°F surface heat and turn frequently to avoid burning chili paste before center is safe.",
      servingSize: "240g marinated thigh",
      price: 26.00,
      description: "Tender chicken thighs immersed in sun-dried red chili paste, fresh ginger, and charred scallion essence."
    }
  ],

  // 2. Chef's Combos & Sets
  combos: [
    {
      id: "combo-butcher",
      title: "The Butcher's Platter",
      titleKr: "Chef's Special Butcher Selection",
      serves: "Serves 2 - 3 Guests",
      price: 98.00,
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop",
      tag: "Best Seller",
      badgeClass: "badge-popular",
      cuts: ["Prime Galbi (Short Rib)", "Berkshire Pork Belly", "Beef Brisket", "Marinated Bulgogi"],
      inclusions: "Unlimited 8-side Banchan refill, Volcanic Steamed Egg Soufflé, choice of Soybean or Kimchi Stew, 2 Steamed Rices.",
      description: "Our signature meat board featuring 800 grams of our most coveted beef and pork cuts, curated by Master Butcher Min-Jun."
    },
    {
      id: "combo-pork",
      title: "Pork Lover's Heritage Set",
      titleKr: "Berkshire Heritage Pork Platter",
      serves: "Serves 2 Guests",
      price: 76.00,
      image: "https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?q=80&w=800&auto=format&fit=crop",
      tag: "Heritage Breed",
      badgeClass: "badge-prime",
      cuts: ["Thick Berkshire Belly", "Marinated Pork Collar", "Crisp Pork Jowl", "Spicy Pork Slices"],
      inclusions: "Unlimited Banchan, Fresh Lettuce Basket, Spicy Scallion Salad, Soybean Paste Stew.",
      description: "A celebration of Korean heritage pork cuts known for intense marbling, crunchy crackling, and rich umami finish."
    },
    {
      id: "combo-wagyu",
      title: "Grand Wagyu Tasting Flight",
      titleKr: "Ultra Luxury Wagyu Tasting Flight",
      serves: "Serves 2 - 4 Guests",
      price: 165.00,
      image: "https://images.unsplash.com/photo-1558030006-450675393462?q=80&w=800&auto=format&fit=crop",
      tag: "Ultra Luxury",
      badgeClass: "badge-prime",
      cuts: ["A5 Miyazaki Wagyu Ribeye", "Australian Wagyu BMS 8+ Zabuton", "Prime Wagyu Short Rib", "Chilled Wagyu Tartare"],
      inclusions: "Fresh Shaved Truffle Dip, Fresh Grated Shizuoka Wasabi, Reserve Banchan, Cold Buckwheat Noodles.",
      description: "An extraordinary journey through Japanese and Australian Wagyu, paired with gourmet salts and rare accoutrements."
    },
    {
      id: "combo-family",
      title: "Korean Family Feast",
      titleKr: "Grand Family Feast Platter",
      serves: "Serves 4 - 6 Guests",
      price: 189.00,
      image: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?q=80&w=800&auto=format&fit=crop",
      tag: "Family Value",
      badgeClass: "badge-popular",
      cuts: ["Prime Galbi (450g)", "Thick Pork Belly (350g)", "Spicy Chicken Bulgogi (300g)", "Jumbo Tiger Prawns (4pcs)"],
      inclusions: "Crispy Seafood Scallion Pancake, Sweet & Spicy Rice Cakes, 2 Big Stews, Unlimited Rice & Banchan, 1 Pitcher of Plum Iced Tea.",
      description: "Generous hospitality at its finest. Designed to fill the entire table with vibrant sizzling platters and comforting sides."
    }
  ],

  // 3. Menu Items by Category
  menuItems: [
  {
    "id": "item-101",
    "category": "beef-bbq",
    "nameEn": "Beef Bulgogi",
    "nameKr": "Sweet Pear & Tamari Thin Beef Ribbons",
    "price": 28,
    "portion": "220g Marinated Slices",
    "spice": 0,
    "dietary": [
      "Halal Certified Beef",
      "Chef Recommended"
    ],
    "popular": true,
    "image": "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?q=80&w=800&auto=format&fit=crop",
    "description": "Tender prime beef ribbons marinated for 24 hours in Korean pear, aged tamari, sesame oil, and charred garlic."
  },
  {
    "id": "item-102",
    "category": "beef-bbq",
    "nameEn": "LA Galbi (Korean Short Ribs)",
    "nameKr": "Flanken-Cut Caramelized Short Ribs",
    "price": 36,
    "portion": "250g Bone-in Slices",
    "spice": 0,
    "dietary": [
      "Prime Beef",
      "Best Seller"
    ],
    "popular": true,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop",
    "description": "Triple bone-in flanken-cut short ribs glazed with wild honey, ginger, and garlic, sizzling to a sweet caramel crust."
  },
  {
    "id": "item-103",
    "category": "beef-bbq",
    "nameEn": "Beef Brisket",
    "nameKr": "Ultra-Thin Sliced Prime Brisket",
    "price": 30,
    "portion": "200g Thin Ribbons",
    "spice": 0,
    "dietary": [
      "Quick Sear",
      "Gluten-Free Pure Cut"
    ],
    "popular": false,
    "image": "https://images.unsplash.com/photo-1558030006-450675393462?q=80&w=800&auto=format&fit=crop",
    "description": "Paper-thin prime brisket ribbons that flash-sear on the grill in seconds. Served with toasted sesame oil and roasted sea salt."
  },
  {
    "id": "beef-garlic-butter",
    "category": "beef-bbq",
    "nameEn": "Garlic Butter Beef",
    "nameKr": "Roasted Garlic & Herb Butter Prime Ribeye",
    "price": 34,
    "portion": "220g Cubed Ribeye",
    "spice": 0,
    "dietary": [
      "Rich & Savory"
    ],
    "popular": true,
    "image": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop",
    "description": "Prime beef cubes basted with cultured honey-garlic butter and fresh herbs directly over high charcoal heat."
  },
  {
    "id": "beef-spicy-korean",
    "category": "beef-bbq",
    "nameEn": "Spicy Korean Beef",
    "nameKr": "Red Chili & Gochujang Seared Beef",
    "price": 31,
    "portion": "220g Marinated Strips",
    "spice": 2,
    "dietary": [
      "Spicy Favorite",
      "Halal Beef"
    ],
    "popular": false,
    "image": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=800&auto=format&fit=crop",
    "description": "Tender beef slices infused with fiery sun-dried chili paste, cracked red pepper flakes, scallions, and roasted sesame."
  },
  {
    "id": "item-201",
    "category": "pork-bbq",
    "nameEn": "Samgyeopsal (Pork Belly)",
    "nameKr": "Thick-Cut Berkshire Pork Belly",
    "price": 27,
    "portion": "220g Thick Slab",
    "spice": 0,
    "dietary": [
      "Heritage Berkshire",
      "Signature"
    ],
    "popular": true,
    "image": "https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?q=80&w=800&auto=format&fit=crop",
    "description": "Heirloom Berkshire pork belly cut to optimal 12mm thickness for crisp crackling edges and succulent melt-in-mouth texture."
  },
  {
    "id": "pork-spicy-bulgogi",
    "category": "pork-bbq",
    "nameEn": "Spicy Pork Bulgogi",
    "nameKr": "Fiery Gochujang Marinated Pork Shoulder",
    "price": 26,
    "portion": "220g Slices",
    "spice": 3,
    "dietary": [
      "Extra Spicy"
    ],
    "popular": true,
    "image": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=800&auto=format&fit=crop",
    "description": "Thinly sliced tender pork shoulder tossed in fiery fermented red pepper paste, sweet onion ribbons, and sesame."
  },
  {
    "id": "pork-garlic-belly",
    "category": "pork-bbq",
    "nameEn": "Garlic Pork Belly",
    "nameKr": "Roasted Garlic & Herb Infused Belly",
    "price": 28,
    "portion": "220g Slices",
    "spice": 0,
    "dietary": [
      "Aromatic Garlic"
    ],
    "popular": false,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop",
    "description": "Pork belly steeped in crushed roasted garlic, shallot oil, and ginger brine before caramelizing on the cast-iron grill."
  },
  {
    "id": "pork-gochujang",
    "category": "pork-bbq",
    "nameEn": "Gochujang Pork",
    "nameKr": "Smoky Sweet Chili Pork Collar",
    "price": 27,
    "portion": "200g Pork Collar",
    "spice": 2,
    "dietary": [
      "Smoky Sweet Spice"
    ],
    "popular": false,
    "image": "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?q=80&w=800&auto=format&fit=crop",
    "description": "Tender pork collar steaks richly lacquered in aged gochujang and blossom honey for an authentic street-grill char."
  },
  {
    "id": "chicken-korean-bulgogi",
    "category": "chicken-bbq",
    "nameEn": "Korean Chicken Bulgogi",
    "nameKr": "Sweet Soy & Apple Pear Marinated Thigh",
    "price": 24,
    "portion": "240g Boneless Thigh",
    "spice": 0,
    "dietary": [
      "Cage-Free",
      "Halal Friendly"
    ],
    "popular": true,
    "image": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=800&auto=format&fit=crop",
    "description": "Boneless chicken thighs tenderized with apple-pear puree, dark soy, and fragrant sesame. Juicy and golden."
  },
  {
    "id": "chicken-spicy-gochujang",
    "category": "chicken-bbq",
    "nameEn": "Spicy Gochujang Chicken",
    "nameKr": "Fiery Korean Chili Flame Grilled Chicken",
    "price": 25,
    "portion": "240g Boneless Thigh",
    "spice": 2,
    "dietary": [
      "Spicy Favorite",
      "Cage-Free"
    ],
    "popular": true,
    "image": "https://images.unsplash.com/photo-1587385789097-0197a7fbd179?q=80&w=800&auto=format&fit=crop",
    "description": "Dark chicken meat bathed in fermented red chili pepper sauce, fresh ginger, garlic, and scallion essence."
  },
  {
    "id": "chicken-soy-garlic",
    "category": "chicken-bbq",
    "nameEn": "Soy Garlic Chicken",
    "nameKr": "Crisp Glazed Garlic Soy Chicken",
    "price": 24,
    "portion": "240g Thigh Cuts",
    "spice": 0,
    "dietary": [
      "Savory Sweet",
      "Kid-Friendly"
    ],
    "popular": false,
    "image": "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?q=80&w=800&auto=format&fit=crop",
    "description": "Tossed in aged soy sauce simmered with 20 cloves of roasted garlic, rice syrup, and toasted sesame oil."
  },
  {
    "id": "chicken-honey-sesame",
    "category": "chicken-bbq",
    "nameEn": "Honey Sesame Chicken",
    "nameKr": "Wild Honey & Toasted Sesame Glaze",
    "price": 24.5,
    "portion": "240g Thigh Cuts",
    "spice": 0,
    "dietary": [
      "Sweet Glazed"
    ],
    "popular": false,
    "image": "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?q=80&w=800&auto=format&fit=crop",
    "description": "Glazed with wild wildflower honey, golden sesame oil, and toasted white sesame seeds for a luscious sweet crunch."
  },
  {
    "id": "seafood-garlic-butter-prawns",
    "category": "seafood-bbq",
    "nameEn": "Garlic Butter Prawns",
    "nameKr": "Jumbo Tiger Prawns with Herb Butter",
    "price": 32,
    "portion": "6 Jumbo Prawns",
    "spice": 0,
    "dietary": [
      "Fresh Seafood",
      "Chef Choice"
    ],
    "popular": true,
    "image": "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?q=80&w=800&auto=format&fit=crop",
    "description": "Jumbo tiger prawns butterflied and brushed with sizzling roasted garlic herb butter over the charcoal grate."
  },
  {
    "id": "seafood-grilled-squid",
    "category": "seafood-bbq",
    "nameEn": "Grilled Squid",
    "nameKr": "Whole Calamari with Sweet Gochujang Glaze",
    "price": 26,
    "portion": "Whole Squid",
    "spice": 1,
    "dietary": [
      "Charcoal Grilled"
    ],
    "popular": true,
    "image": "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?q=80&w=800&auto=format&fit=crop",
    "description": "Tender whole squid scored and charred over high coals, glazed with sweet-savory chili tare and scallions."
  },
  {
    "id": "seafood-salmon-bbq",
    "category": "seafood-bbq",
    "nameEn": "Salmon BBQ",
    "nameKr": "Atlantic Salmon Fillet with Sweet Soy Glaze",
    "price": 29,
    "portion": "200g Fillet",
    "spice": 0,
    "dietary": [
      "Omega-3 Rich",
      "Gluten-Free Option"
    ],
    "popular": false,
    "image": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=800&auto=format&fit=crop",
    "description": "Fresh Atlantic salmon fillet marinated with ginger soy reduction, crisped skin-down for a buttery finish."
  },
  {
    "id": "seafood-spicy-mix",
    "category": "seafood-bbq",
    "nameEn": "Spicy Seafood Mix",
    "nameKr": "Prawns, Squid & Scallops in Chili Marinade",
    "price": 35,
    "portion": "300g Seafood Platter",
    "spice": 2,
    "dietary": [
      "Shellfish Delight"
    ],
    "popular": true,
    "image": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=800&auto=format&fit=crop",
    "description": "Combination of tiger prawns, baby octopus, squid rings, and sea scallops tossed in zesty Korean chili oil."
  },
  {
    "id": "veg-grilled-king-oyster",
    "category": "vegetarian-bbq",
    "nameEn": "Grilled King Oyster Mushrooms",
    "nameKr": "Thick Cut Sesame Glazed King Oysters",
    "price": 18,
    "portion": "250g Slices",
    "spice": 0,
    "dietary": [
      "100% Vegan",
      "Gluten-Free"
    ],
    "popular": true,
    "image": "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=800&auto=format&fit=crop",
    "description": "Meaty King Oyster mushroom steaks scored and brushed with sesame oil and coarse sea salt, searing juicy and golden."
  },
  {
    "id": "veg-garlic-butter-corn",
    "category": "vegetarian-bbq",
    "nameEn": "Garlic Butter Corn",
    "nameKr": "Charred Sweet Corn with Garlic Butter & Cheese",
    "price": 12,
    "portion": "Cast-Iron Skillet",
    "spice": 0,
    "dietary": [
      "Vegetarian",
      "Crowd Favorite"
    ],
    "popular": true,
    "image": "https://images.unsplash.com/photo-1551754655-cd27e38d2076?q=80&w=800&auto=format&fit=crop",
    "description": "Sweet corn kernels tossed with roasted garlic butter, sweet cream, and melted mozzarella cheese on the grill."
  },
  {
    "id": "veg-korean-bbq-tofu",
    "category": "vegetarian-bbq",
    "nameEn": "Korean BBQ Tofu",
    "nameKr": "Firm Pressed Tofu with Sweet Soy Glaze",
    "price": 16,
    "portion": "250g Slabs",
    "spice": 0,
    "dietary": [
      "100% Vegan",
      "High Protein"
    ],
    "popular": false,
    "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop",
    "description": "Thick slabs of organic firm tofu marinated in sweet ginger-soy glaze and grilled until crisp on all sides."
  },
  {
    "id": "veg-zucchini-bell-peppers",
    "category": "vegetarian-bbq",
    "nameEn": "Grilled Zucchini and Bell Peppers",
    "nameKr": "Market Fresh Summer Vegetables with Sesame",
    "price": 14,
    "portion": "Platter",
    "spice": 0,
    "dietary": [
      "100% Vegan",
      "Gluten-Free"
    ],
    "popular": false,
    "image": "https://images.unsplash.com/photo-1592417817098-8f3d6910985b?q=80&w=800&auto=format&fit=crop",
    "description": "Fresh green zucchini, sweet bell peppers, red onions, and scallions grilled with cold-pressed sesame oil."
  },
  {
    "id": "veg-gochujang-cauliflower",
    "category": "vegetarian-bbq",
    "nameEn": "Gochujang Cauliflower",
    "nameKr": "Spicy Glazed Roasted Cauliflower Florets",
    "price": 15,
    "portion": "Bowl",
    "spice": 2,
    "dietary": [
      "100% Vegan",
      "Spicy"
    ],
    "popular": true,
    "image": "https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?q=80&w=800&auto=format&fit=crop",
    "description": "Char-roasted cauliflower florets tossed in a sticky, sweet, and pungent gochujang chili glaze with toasted seeds."
  },
  {
    "id": "item-401",
    "category": "side-dishes",
    "nameEn": "Kimchi",
    "nameKr": "3-Year Aged Napa Cabbage Kimchi",
    "price": 7,
    "portion": "Artisan Jar / Bowl",
    "spice": 2,
    "dietary": [
      "Probiotic",
      "Refillable Option"
    ],
    "popular": true,
    "image": "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?q=80&w=800&auto=format&fit=crop",
    "description": "House-fermented napa cabbage matured with sun-dried red chili, ginger, garlic, and pear. Naturally probiotic."
  },
  {
    "id": "side-pickled-radish",
    "category": "side-dishes",
    "nameEn": "Pickled Radish",
    "nameKr": "Crisp Sweet Vinegar Daikon Paper",
    "price": 6,
    "portion": "Chilled Plate",
    "spice": 0,
    "dietary": [
      "100% Vegan",
      "Gluten-Free"
    ],
    "popular": false,
    "image": "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=800&auto=format&fit=crop",
    "description": "Thin paper-like discs of crunchy daikon radish pickled in sweet apple cider vinegar. Perfect meat wrap."
  },
  {
    "id": "side-korean-cucumber-salad",
    "category": "side-dishes",
    "nameEn": "Korean Cucumber Salad",
    "nameKr": "Chilled Spicy Sesame Cucumber Salad",
    "price": 7.5,
    "portion": "Bowl",
    "spice": 1,
    "dietary": [
      "100% Vegan",
      "Refreshing"
    ],
    "popular": true,
    "image": "https://images.unsplash.com/photo-1552611052-33e04de081de?q=80&w=800&auto=format&fit=crop",
    "description": "Cracked Persian cucumbers tossed with toasted sesame oil, rice vinegar, garlic, and coarse red chili flakes."
  },
  {
    "id": "side-steamed-rice",
    "category": "side-dishes",
    "nameEn": "Steamed Rice",
    "nameKr": "Fluffy Short-Grain Pearl Rice",
    "price": 3.5,
    "portion": "Bowl",
    "spice": 0,
    "dietary": [
      "100% Vegan",
      "Gluten-Free"
    ],
    "popular": false,
    "image": "https://images.unsplash.com/photo-1516684732162-798a0062be99?q=80&w=800&auto=format&fit=crop",
    "description": "Steamed premium Korean short-grain sticky rice. Fluffy, glossy, and subtly sweet."
  },
  {
    "id": "side-lettuce-wraps-ssam",
    "category": "side-dishes",
    "nameEn": "Lettuce Wraps (Ssam)",
    "nameKr": "Farm Fresh Red Leaf & Perilla Leaf Basket",
    "price": 6,
    "portion": "Plentiful Basket",
    "spice": 0,
    "dietary": [
      "100% Vegan",
      "Fresh Greens"
    ],
    "popular": true,
    "image": "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=800&auto=format&fit=crop",
    "description": "Crisp red leaf lettuce, aromatic Korean perilla leaves, and garlic cloves for the ultimate BBQ table wrap."
  },
  {
    "id": "side-ssamjang-gochujang-sauces",
    "category": "side-dishes",
    "nameEn": "Ssamjang and Gochujang Sauces",
    "nameKr": "Fermented Soybean Dip & Red Chili Paste Duo",
    "price": 4.5,
    "portion": "Trio Sauce Dish",
    "spice": 1,
    "dietary": [
      "House-Made Artisan Dips"
    ],
    "popular": false,
    "image": "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=80&w=800&auto=format&fit=crop",
    "description": "Pairing of seasoned fermented soybean wrap sauce (ssamjang) and sweet pungent fermented chili paste (gochujang)."
  },
  {
    "id": "combo-solo-grill-box",
    "category": "bbq-combos",
    "nameEn": "Solo Grill Box",
    "nameKr": "Personal BBQ Feast with Bulgogi & Sides",
    "price": 32,
    "portion": "Single Diner Set",
    "spice": 1,
    "dietary": [
      "Complete Meal"
    ],
    "popular": true,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop",
    "description": "Prime beef bulgogi, 3 artisan banchan sides, steamed rice, fresh lettuce wraps, and hot soybean broth."
  },
  {
    "id": "combo-couples-bbq-set",
    "category": "bbq-combos",
    "nameEn": "Couple's BBQ Set",
    "nameKr": "Prime Galbi & Berkshire Belly for Two",
    "price": 78,
    "portion": "Serves 2 Guests",
    "spice": 0,
    "dietary": [
      "Most Popular Set"
    ],
    "popular": true,
    "image": "https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?q=80&w=800&auto=format&fit=crop",
    "description": "USDA Prime Marinated Galbi, Thick-cut Berkshire Pork Belly, Steamed Egg Soufflé, refillable banchan, and two rices."
  },
  {
    "id": "combo-family-feast",
    "category": "bbq-combos",
    "nameEn": "Family Feast",
    "nameKr": "Grand Communal BBQ with Beef, Pork & Prawns",
    "price": 145,
    "portion": "Serves 4 - 5 Guests",
    "spice": 1,
    "dietary": [
      "Best Value Platter"
    ],
    "popular": true,
    "image": "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?q=80&w=800&auto=format&fit=crop",
    "description": "Prime Galbi (400g), Berkshire Belly (350g), Chicken Bulgogi (250g), Tiger Prawns, Seafood Pancake, Kimchi Stew, and unlimited sides."
  },
  {
    "id": "combo-premium-meat-platter",
    "category": "bbq-combos",
    "nameEn": "Premium Meat Platter",
    "nameKr": "Butcher's Reserve Cuts: Ribeye, Brisket & Short Rib",
    "price": 110,
    "portion": "Serves 3 Guests",
    "spice": 0,
    "dietary": [
      "Butcher's Reserve"
    ],
    "popular": false,
    "image": "https://images.unsplash.com/photo-1558030006-450675393462?q=80&w=800&auto=format&fit=crop",
    "description": "Curated board of A5 Wagyu Ribeye ribbons, thin-sliced brisket, and marinated prime bone-in short rib with rare sea salts."
  },
  {
    "id": "combo-ultimate-korean-feast",
    "category": "bbq-combos",
    "nameEn": "Ultimate Korean BBQ Feast",
    "nameKr": "The Complete Seoul Grill Experience",
    "price": 185,
    "portion": "Serves 5 - 6 Guests",
    "spice": 1,
    "dietary": [
      "Chef's Grand Tasting"
    ],
    "popular": true,
    "image": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop",
    "description": "Everything KoreFlame has to offer: 5 prime meat cuts, jumbo garlic prawns, pancake, stews, volcano egg, and strawberry ades."
  },
  {
    "id": "rice-bibimbap",
    "category": "rice-noodles",
    "nameEn": "Bibimbap",
    "nameKr": "Sizzling Crispy Stone Pot Rice Bowl",
    "price": 18.5,
    "portion": "Hot Stone Bowl",
    "spice": 1,
    "dietary": [
      "Vegetarian Option",
      "Signature"
    ],
    "popular": true,
    "image": "https://images.unsplash.com/photo-1553163147-622ab57be1c7?q=80&w=800&auto=format&fit=crop",
    "description": "Sizzling rice with crispy golden crust, seasoned fernbrake, spinach, bean sprouts, beef bulgogi, and sunny farm egg."
  },
  {
    "id": "rice-kimchi-fried-rice",
    "category": "rice-noodles",
    "nameEn": "Kimchi Fried Rice",
    "nameKr": "Wok-Seared Aged Kimchi Rice with Fried Egg",
    "price": 16.5,
    "portion": "Large Skillet",
    "spice": 2,
    "dietary": [
      "Comfort Classic"
    ],
    "popular": true,
    "image": "https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=800&auto=format&fit=crop",
    "description": "Wok-charred pearl rice with aged 3-year kimchi, smoked pork ribbons, toasted seaweed flakes, and runny egg."
  },
  {
    "id": "noodle-japchae-glass",
    "category": "rice-noodles",
    "nameEn": "Japchae Glass Noodles",
    "nameKr": "Sweet Potato Glass Noodles with Vegetables",
    "price": 17,
    "portion": "Warm Platter",
    "spice": 0,
    "dietary": [
      "Gluten-Free Sweet Potato",
      "Vegetarian Option"
    ],
    "popular": true,
    "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=800&auto=format&fit=crop",
    "description": "Chewy sweet potato glass noodles wok-tossed with shiitake mushrooms, bell peppers, spinach, sweet soy, and sesame."
  },
  {
    "id": "noodle-korean-ramen",
    "category": "rice-noodles",
    "nameEn": "Korean Ramen",
    "nameKr": "Spicy Broth Ramen with Egg & Scallions",
    "price": 14.5,
    "portion": "Claypot Bowl",
    "spice": 2,
    "dietary": [
      "Hot & Comforting"
    ],
    "popular": false,
    "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=800&auto=format&fit=crop",
    "description": "Springy noodles in spicy aromatic beef-mushroom broth with poached farm egg, scallions, and toasted nori."
  },
  {
    "id": "noodle-cold-buckwheat",
    "category": "rice-noodles",
    "nameEn": "Cold Buckwheat Noodles (Naengmyeon)",
    "nameKr": "Icy Beef Radish Broth Buckwheat Noodles",
    "price": 16.5,
    "portion": "Chilled Stainless Bowl",
    "spice": 0,
    "dietary": [
      "Refreshing BBQ Cleanser"
    ],
    "popular": true,
    "image": "https://images.unsplash.com/photo-1552611052-33e04de081de?q=80&w=800&auto=format&fit=crop",
    "description": "Silky buckwheat noodles served in an icy chilled beef-radish broth with sliced Asian pear, cucumber, and pickled daikon."
  },
  {
    "id": "dessert-bingsu",
    "category": "desserts",
    "nameEn": "Bingsu (Korean Shaved Ice)",
    "nameKr": "Snow Milk Shaved Ice with Sweet Red Bean",
    "price": 13,
    "portion": "Sharing Bowl",
    "spice": 0,
    "dietary": [
      "Sweet Indulgence"
    ],
    "popular": true,
    "image": "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?q=80&w=800&auto=format&fit=crop",
    "description": "Micro-shaved frozen milk snow topped with sweet red bean paste, chewy injeolmi rice cakes, roasted soybean powder, and condensed milk."
  },
  {
    "id": "dessert-hotteok",
    "category": "desserts",
    "nameEn": "Hotteok (Sweet Korean Pancakes)",
    "nameKr": "Crisp Griddle Cakes with Brown Sugar & Cinnamon",
    "price": 9.5,
    "portion": "2 Warm Pancakes",
    "spice": 0,
    "dietary": [
      "Street Food Legend"
    ],
    "popular": true,
    "image": "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop",
    "description": "Golden griddled yeasted dough filled with molten dark brown sugar, roasted peanuts, cinnamon, and walnuts."
  },
  {
    "id": "dessert-mochi-ice-cream",
    "category": "desserts",
    "nameEn": "Mochi Ice Cream",
    "nameKr": "Trio of Green Tea, Mango & Strawberry Mochi",
    "price": 9,
    "portion": "Trio (3 Pieces)",
    "spice": 0,
    "dietary": [
      "Gluten-Free Sweet"
    ],
    "popular": false,
    "image": "https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=800&auto=format&fit=crop",
    "description": "Chewy sweet rice dough spheres enveloping premium artisan matcha, ripe mango, and strawberry ice creams."
  },
  {
    "id": "dessert-matcha-cheesecake",
    "category": "desserts",
    "nameEn": "Matcha Cheesecake",
    "nameKr": "Ceremonial Grade Uji Matcha Basque Cheesecake",
    "price": 11.5,
    "portion": "Generous Slice",
    "spice": 0,
    "dietary": [
      "Vegetarian"
    ],
    "popular": true,
    "image": "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=800&auto=format&fit=crop",
    "description": "Creamy Basque-style burnt cheesecake infused with premium ceremonial green tea and light honey cream."
  },
  {
    "id": "drink-strawberry-ade",
    "category": "drinks",
    "nameEn": "Korean Strawberry Ade",
    "nameKr": "Fresh Strawberry Puree with Sparkling Soda",
    "price": 7.5,
    "portion": "500ml Chilled Glass",
    "spice": 0,
    "dietary": [
      "Non-Alcoholic",
      "House Favorite"
    ],
    "popular": true,
    "image": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800&auto=format&fit=crop",
    "description": "Hand-crushed fresh strawberry puree shaken with ice, tart lime, sparkling soda, and fresh mint sprig."
  },
  {
    "id": "drink-yuzu-lemon-tea",
    "category": "drinks",
    "nameEn": "Yuzu Lemon Tea",
    "nameKr": "Honey Citron Citrus Iced Tea",
    "price": 6.5,
    "portion": "Chilled or Warm Cup",
    "spice": 0,
    "dietary": [
      "Vitamin C Rich"
    ],
    "popular": false,
    "image": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=800&auto=format&fit=crop",
    "description": "Fragrant sweet yuzu citron marmalade brewed with wild honey, lemon slices, and mountain tea leaves."
  },
  {
    "id": "drink-dalgona-coffee",
    "category": "drinks",
    "nameEn": "Iced Dalgona Coffee",
    "nameKr": "Whipped Golden Toffee Coffee over Cold Milk",
    "price": 7,
    "portion": "Tall Glass",
    "spice": 0,
    "dietary": [
      "Creamy & Bold"
    ],
    "popular": true,
    "image": "https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=800&auto=format&fit=crop",
    "description": "Velvety whipped coffee toffee foam poured gracefully over chilled whole milk and ice cubes."
  },
  {
    "id": "drink-korean-milk",
    "category": "drinks",
    "nameEn": "Korean Milk Drinks",
    "nameKr": "Sweet Banana & Melon Chilled Milk Duo",
    "price": 6,
    "portion": "Chilled Bottle",
    "spice": 0,
    "dietary": [
      "Seoul Classic"
    ],
    "popular": false,
    "image": "https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=800&auto=format&fit=crop",
    "description": "Iconic Korean sweet banana and honeydew melon flavored creamy milks served ice-cold."
  },
  {
    "id": "drink-soft-drinks-mocktails",
    "category": "drinks",
    "nameEn": "Soft Drinks and Mocktails",
    "nameKr": "Artisan Plum Fizz & Korean Sodas",
    "price": 5.5,
    "portion": "Chilled Glass",
    "spice": 0,
    "dietary": [
      "Refreshing",
      "Non-Alcoholic"
    ],
    "popular": false,
    "image": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800&auto=format&fit=crop",
    "description": "Choice of green plum sparkling cooler, Korean grape juice with real pulp, or classic soft drinks."
  }
],

  // 4. Dining Packages for pricing.html
  diningPackages: [
    {
      id: "pkg-bronze",
      title: "Seoul Street Experience",
      price: 45.00,
      cadence: "per person (min 2 guests)",
      recommended: false,
      features: [
        "Choice of 2 Signature Cuts (Pork Belly / Bulgogi)",
        "Refillable House Banchan (5 types)",
        "Unlimited Steamed Rice & Ssam Leaves",
        "Kimchi Jjigae or Soybean Stew to share",
        "Korean Barley Tea service",
        "Standard Downdraft Table Grill"
      ],
      notIncluded: [
        "USDA Prime Galbi or Wagyu cuts",
        "Alcoholic beverages",
        "Private VIP dining room"
      ]
    },
    {
      id: "pkg-silver",
      title: "Master Butcher's Feast",
      price: 68.00,
      cadence: "per person (min 2 guests)",
      recommended: true,
      tag: "Most Popular",
      features: [
        "USDA Prime Marinated Galbi + Berkshire Pork Belly",
        "Spicy Dak-Bulgogi or Chadolbaegi Beef Brisket",
        "Full 8-dish Grand Banchan Refills",
        "Volcano Steamed Egg (Gyeran-jjim)",
        "Choice of Stew + Cold Buckwheat Naengmyeon",
        "1 Glass of House Draft or Yuzu Citron Ade",
        "Priority Window Grill Booth Seating"
      ],
      notIncluded: [
        "A5 Miyazaki Wagyu tier",
        "Private Dining Room exclusivity"
      ]
    },
    {
      id: "pkg-gold",
      title: "Imperial Sura Dining",
      price: 115.00,
      cadence: "per person (min 4 guests)",
      recommended: false,
      tag: "VIP Luxury",
      features: [
        "A5 Miyazaki Wagyu BMS 9+ Ribeye",
        "Prime Butterflied Short Rib + Rare Pork Jowl",
        "Korean Beef Tartare (Yukhoe) starter",
        "Full Artisan Banchan + Seafood Scallion Pancake",
        "Table-side Dedicated Grillmaster service",
        "1 Bottle of Premium Soju or Bokbunjaju per pair",
        "Private VIP Room booking with smokeless downdraft",
        "Custom Commemorative Menu & Chef's Dessert"
      ],
      notIncluded: []
    }
  ],

  // 5. Blog Posts for blog.html and blog-details.html
  blogPosts: [
    {
      id: "post-1",
      slug: "art-of-the-perfect-ssam",
      title: "The Art of the Perfect Ssam: How Koreans Wrap and Savor Grilled Meat",
      category: "Korean Dining Culture",
      author: "Chef Min-Jun Kang",
      date: "October 14, 2026",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop",
      excerpt: "Eating Korean BBQ is an interactive ritual. Learn the golden layering technique: lettuce, perilla, sizzling meat, grilled garlic, and artisanal ssamjang.",
      content: `
        <p>In Korea, barbecue is far more than a meal—it is a communal performance where everyone participates. At the center of this social communion lies the <em>ssam</em>, literally meaning 'wrap'.</p>
        <h4>The Golden Order of the Wrap</h4>
        <p>A proper wrap requires structural balance and intentional flavor pairing:</p>
        <ol>
          <li><strong>The Foundation:</strong> Lay down a tender red leaf lettuce leaf as your outer vessel.</li>
          <li><strong>The Herbal Note:</strong> Place an aromatic perilla leaf face-up in the center for its peppery, minty bite.</li>
          <li><strong>The Protein:</strong> Dip your hot, freshly grilled cut (whether fatty pork belly or juicy galbi) lightly in roasted sesame oil.</li>
          <li><strong>The Punch:</strong> Add a dab of savory dipping paste and a toasted slice of whole garlic.</li>
          <li><strong>The Crunch:</strong> Top with a pinch of dressed scallion salad or pickled radish.</li>
        </ol>
        <p>Most importantly: the wrap must be eaten in a single, unhesitant bite. Biting through spills juices and unravels the carefully calibrated balance of textures.</p>
      `
    },
    {
      id: "post-2",
      slug: "binchotan-charcoal-difference",
      title: "Why Binchotan Charcoal Makes Korean BBQ Taste So Immensely Better",
      category: "Grill Techniques",
      author: "Master Griller Jin-Woo",
      date: "September 28, 2026",
      readTime: "6 min read",
      image: "https://images.unsplash.com/photo-1558030006-450675393462?q=80&w=800&auto=format&fit=crop",
      excerpt: "Explore how ultra-pure oak binchotan emits pure far-infrared heat without acrid smoke, sealing juices into marbled beef instantly.",
      content: `
        <p>The difference between mediocre barbecue and a transcendental dining experience begins beneath the grates. Standard briquettes burn irregularly and release chemical binder fumes that ruin pristine cuts.</p>
        <p>At KoreFlame, every table features genuine white oak Binchotan charcoal fired at over 1,000°C. This creates steady infrared energy that penetrates meat deeply without charring the sweet natural sugars.</p>
      `
    },
    {
      id: "post-3",
      slug: "guide-to-probiotic-banchan",
      title: "Beyond Kimchi: The Fascinating World of Korean Banchan and Gut Health",
      category: "Side Dishes & Health",
      author: "Nutritionist So-Yeon Park",
      date: "September 12, 2026",
      readTime: "4 min read",
      image: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?q=80&w=800&auto=format&fit=crop",
      excerpt: "Discover the lacto-fermented history of side dishes that balance high-protein grilling with natural digestive enzymes.",
      content: `
        <p>Korean banchan is not a garnish; it is nutritional architecture designed across centuries to harmonize rich grilled proteins with active probiotic cultures and alkaline roots.</p>
      `
    }
  ],

  // 6. Loyalty Rewards
  loyaltyRewards: [
    { id: "rew-1", name: "Free Volcanic Steamed Egg", points: 300, icon: "egg" },
    { id: "rew-2", name: "House Pitcher of Sparkling Yuzu Ade", points: 450, icon: "cup-soda" },
    { id: "rew-3", name: "Complimentary Crispy Seafood Pajeon", points: 800, icon: "utensils" },
    { id: "rew-4", name: "Free Premium USDA Prime Galbi Cut", points: 1500, icon: "flame" },
    { id: "rew-5", name: "$50 Dining Voucher on Imperial Sets", points: 2200, icon: "award" }
  ]
};

// Expose globally
window.KF_DATA = KF_DATA;
