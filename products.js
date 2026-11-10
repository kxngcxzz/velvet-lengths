// Product catalogue. Prices = supplier cost x 2.5, rounded up to £x.99.
// costs = supplier price per length (from the listing). Where a product has no costs list, cost = colour price for the
// shortest length and step = estimated extra per 2" (confirm with supplier).
// Pack entries: [label, multiplier, {length: exact cost}] - exact costs override the multiplier.
const sell=c=>Math.ceil(c*2.5)-0.01;
// Shop categories. Add a product to a category by giving it category:"<id>".
const CATEGORIES=[
  {id:"extensions",slug:"hair-extensions",seoTitle:"Human Hair Extensions UK | Velvet Lengths",seoDesc:"Silky straight Remy human hair extensions for European and Asian hair: nano ring, tape-in and keratin U-tip, 12–24 inches. Free tracked UK delivery.",name:"Hair Extensions",blurb:"Silky straight Remy human hair for European and Asian hair types, in nano ring, tape-in and keratin U-tip."},
  {id:"accessories",slug:"accessories",seoTitle:"Hair Extension Tools & Accessories | Velvet Lengths",seoDesc:"Tools for fitting and caring for hair extensions: nano ring beads, sectioning clips, salon combs, a vent brush and a mist spray bottle. Free UK delivery.",name:"Accessories",blurb:"Rings, clips, combs, a brush and a spray bottle for fitting and looking after extensions."}
];
const CATALOGUE={
  "nano-ring":{
    menu:"Nano Ring", // short name used in the menus
    // Upsell: accessories suggested with this product (id, reason). match: hair colour -> accessory colour.
    pairsWith:[["nano-beads","Rings to fit your tips, matched to your shade"],["section-clips","Hold sections out of the way while fitting"],["comb-set","Tail combs for neat, even partings"],["vent-brush","Brushes gently without catching the rings"]],
    match:{"nano-beads":{"01":"Black","02":"Dark brown","04":"Brown","07":"Light brown","1660":"Blonde","18613":"Blonde","760":"Light brown","99J":"Dark brown","T416":"Brown"}},
    slug:"nano-ring-hair-extensions",seoTitle:"Nano Ring Hair Extensions | Remy Human Hair | Velvet Lengths",seoDesc:"Nano ring tip hair extensions in Remy human hair. 9 shades, 14–24 inches, 50g or 100g packs. No glue, heat or tape. Free tracked UK delivery.",
    category:"extensions",
    name:"Nano Ring Tip Extensions",eyebrow:"100% virgin Remy human hair",type:"ext",
    supplier:"DIYOMO Official Store (AliExpress 1005012462195766)",
    lens:[14,16,18,20,22,24],costs:[26.71,28.85,30.99,33.13,34.73,38.46],wts:[["50g",1],["100g",1.81,{24:69.45}]],
    colours:[
      ["01","Jet black",26.71,"nano-ring-01"],["02","Darkest brown",26.71,"nano-ring-02"],["04","Warm chestnut brown",26.71,"nano-ring-04"],["07","Ash medium brown",26.71,"nano-ring-07"],
      ["1660","Ash blonde",26.71,"nano-ring-1660"],["18613","Golden blonde highlights",26.71,"nano-ring-18613"],["760","Honey brown highlights",26.71,"nano-ring-760"],
      ["99J","Burgundy",26.71,"nano-ring-99j"],["T416","Brown with blonde highlights",26.71,"nano-ring-t416"]],
    blurb:"Each strand has a small tip that is fixed to your own hair with a nano ring, so there's no glue, heat or tape. The rings are small enough to hide in fine hair. The hair is 100% virgin Remy, can be straightened, curled or toned, and lasts up to 12 months with care.",
    specs:[["Hair","100% virgin Remy human hair"],["Method","Nano ring / micro bead, straight tip"],["Texture","Silky straight"],["Lengths",'14" to 24"'],["Pack","50g or 100g"],["Lifespan","Up to 12 months with care"],["How many packs","1–2 for length, 3–4 for volume, 5+ for a full head"]],
    gallery:[["nano-ring-range","The full colour range"],["nano-ring-range-2","Solid shades"],["nano-ring-highlights","Highlight blend"]],
    guides:[["nano-ring-how-to-fit","How to fit nano ring extensions, step by step"],["nano-ring-guide","Texture, pack size and how many packs to choose"]]
  },
  "tape-in":{
    menu:"Tape-In", // short name used in the menus
    pairsWith:[["comb-set","Tail combs for neat partings when fitting"],["section-clips","Hold sections flat while you tape"],["vent-brush","Brushes without pulling on the tape"],["mist-bottle","Refresh lengths without soaking the tape"]],
    slug:"tape-in-hair-extensions",seoTitle:"Seamless Tape-In Hair Extensions | Velvet Lengths",seoDesc:"Seamless tape-in hair extensions in Remy human hair. 19 shades from black to platinum, 14–24 inches, 20 pieces per pack. Free tracked UK delivery.",
    category:"extensions",
    name:"Seamless Tape-In Extensions",eyebrow:"Remy human hair · skin weft",type:"ext",
    supplier:"VeSunny Official Store (AliExpress 4001270122877)",
    lens:[14,16,18,20,22,24],
    // two price tiers from the listing (highest cost seen per length in each tier, so every colour keeps its margin)
    costs:{solid:[22.26,24.13,27.03,31.73,36.30,42.03],blend:[25.39,30.79,36.82,43.06,46.71,53.68]},
    wts:[["20 pieces",1]],
    colours:[
      ["1","Jet black","solid","tape-in-1"],["1b","Soft natural black","solid","tape-in-1b"],["2","Espresso brown","solid","tape-in-2"],
      ["4","Chocolate brown","solid","tape-in-4"],["33","Rich auburn","blend","tape-in-33"],["350","Bright copper","blend","tape-in-350"],
      ["2-2-6","Dark root, caramel highlights","blend","tape-in-2-2-6"],["1B-4-18","Black to light brown ombre","blend","tape-in-1b-4-18"],
      ["P4-27","Chocolate with honey highlights","blend","tape-in-p4-27"],["4-27-4","Dark root, honey balayage","blend","tape-in-4-27-4"],
      ["6-60-6","Light brown, ash blonde highlights","blend","tape-in-6-60-6"],["3-8-22","Brown root to golden blonde","blend","tape-in-3-8-22"],
      ["4-14-60","Brown root to ash platinum","blend","tape-in-4-14-60"],["60","Platinum blonde","blend","tape-in-60"],
      ["P18-613","Ash and pale blonde mix","blend","tape-in-p18-613"],["P16-22","Sandy blonde highlights","blend","tape-in-p16-22"],
      ["18-22-60","Ash root to light blonde","blend","tape-in-18-22-60"],["1b-silver-1b","Black with silver highlights","blend","tape-in-1b-silver-1b"],
      ["Ba8A-60","Dark root to ash blonde","blend","tape-in-ba8a-60"]],
    blurb:"Thin, double-sided tape wefts that sit flat against the scalp. Each pack has 20 pieces of Remy human hair that you can straighten and curl. They're quick to fit and remove, and can be re-taped and reused for up to 6 months.",
    specs:[["Hair","Remy human hair"],["Method","Double-sided tape-in, skin weft"],["Texture","Silky straight"],["Lengths",'14" to 24"'],["Pack","20 pieces"],["Lifespan","Up to 6 months, re-taping as needed"],["Piece size","4cm × 2cm tab, 2.5g per piece"],["How many packs","1 pack for highlights, 2–3 packs for volume and length"]],
    gallery:[["tape-in-range","The colour range"],["tape-in-tape","Double-sided tape close-up"]],
    guides:[["tape-in-length-guide","Where each length falls, straight and curled"]]
  },
  "u-tip":{
    menu:"U-Tip Keratin", // short name used in the menus
    pairsWith:[["section-clips","Hold sections out of the way while fusing"],["butterfly-clips","Keep thick hair clear of the bonds"],["comb-set","Tail combs for neat partings"],["vent-brush","Brushes gently around the bonds"]],
    slug:"u-tip-hair-extensions",seoTitle:"U-Tip Keratin Fusion Hair Extensions | Velvet Lengths",seoDesc:"U-tip keratin fusion hair extensions in Remy human hair. 9 shades, 12–20 inches, 50 or 100 strands. Free tracked UK delivery on every order.",
    category:"extensions",
    name:"U-Tip Keratin Fusion Extensions",eyebrow:"Remy human hair · keratin bond",type:"ext",
    supplier:"AliExpress 1005009243151539",
    lens:[12,14,16,18,20],
    // two price tiers on the listing: solid shades vs highlight/blonde shades
    costs:{base:[9.66,11.53,13.81,16.32,19.93],premium:[10.93,13.81,16.21,19.37,22.86]},
    wts:[["50 strands (30g)",1],["100 strands (60g)",2.15,{base:{14:25.15,18:34.74,20:41.95},premium:{20:47.81}}]],
    colours:[
      ["1","Jet black","base","u-tip-1"],["1B","Natural black","base","u-tip-1b"],["2","Darkest brown","base","u-tip-2"],
      ["4","Medium brown","base","u-tip-4"],["6","Chestnut brown","base","u-tip-6"],["99J","Burgundy","base","u-tip-99j"],
      ["60","Platinum blonde","premium","u-tip-60"],["P4/27","Brown with honey highlights","premium","u-tip-p4-27"],
      ["P27/613","Honey and bleach blonde mix","premium","u-tip-p27-613"]],
    blurb:"Pre-bonded keratin U-tip strands, each 0.6g, fused to your own hair one at a time with a heat connector. The Remy hair can be washed, curled and heat styled as normal. Expect 3–4 months between refits.",
    specs:[["Hair","Remy human hair"],["Method","U-tip keratin fusion (hot fusion)"],["Texture","Silky straight"],["Lengths",'12" to 20" (30–50cm)'],["Pack","50 strands (30g) or 100 strands (60g)"],["Lifespan","3–4 months between refits"],["Full head","150–200 strands"]]
  }
,
  "nano-beads":{
    menu:"Nano Ring Beads", // short name used in the menus
    slug:"nano-ring-beads",seoTitle:"Nano Rings for Hair Extensions (1000 Pack) | Velvet Lengths",seoDesc:"Copper nano rings for fitting nano ring hair extensions. 1000 beads per pot, 2.5mm, in black, browns and blonde. Free tracked UK delivery.",
    category:"accessories",
    name:"Nano Ring Beads · 1000 pack",eyebrow:"Copper nano rings for fitting and refitting",type:"acc",colourWord:"colours",
    supplier:"AliExpress 1005009176917186",
    lens:[0],step:0,wts:[["1000 beads",1]],
    colours:[
      ["Black","Black",1.71,"nano-beads-black"],["Dark brown","Dark brown",2.07,"nano-beads-dark-brown"],
      ["Brown","Brown",1.84,"nano-beads-brown"],["Light brown","Light brown",2.07,"nano-beads-light-brown"],
      ["Blonde","Blonde",2.07,"nano-beads-blonde"]],
    blurb:"Copper nano rings for fitting nano ring tip extensions and for refitting them as your hair grows. Each pot holds 1000 rings, enough for several full heads. Choose the colour closest to your roots so the rings blend in.",
    specs:[["Material","Copper, coated colour finish"],["Size","2.5mm × 1.5mm × 2mm"],["Pack","1000 beads in a clear pot"],["Use with","Nano ring tip extensions"],["Colours","Black, dark brown, brown, light brown, blonde"]],
    gallery:[["nano-beads-range","All five colours"],["nano-beads-size","Bead size: 2.5mm × 1.5mm × 2mm"],["nano-beads-pots","Beads in their pots"]],
    guides:[["nano-beads-how-to","How to fit a ring extension, step by step"]]
  },
  "comb-set":{
    menu:"10-Piece Comb Set", // short name used in the menus
    slug:"salon-comb-set",seoTitle:"10-Piece Salon Comb Set for Extensions | Velvet Lengths",seoDesc:"10-piece salon comb set for sectioning, parting and detangling hair extensions. Tail, pin and wide-tooth combs in anti-static plastic. Free UK delivery.",
    category:"accessories",
    name:"10-Piece Salon Comb Set",eyebrow:"Sectioning, parting and styling combs",type:"acc",colourWord:"set",
    supplier:"AliExpress 1005012311616407",
    lens:[0],step:0,wts:[["10 combs",1]],
    colours:[["Black","Black",2.20,"comb-set-main"]],
    blurb:"Ten combs for sectioning, parting and styling. Tail and needle-tail combs give neat partings when fitting, pick combs lift at the root, and wide-tooth combs detangle extensions without pulling on the bonds.",
    specs:[["Material","Durable PP plastic, anti-static"],["In the set","10 combs"],["Includes","Needle-tail, pointed-tail, wide-tooth tail, metal and plastic five-pin, wide-tooth rake, double-sided, large wide-tooth and multipurpose combs"],["Colour","Black"],["Good for","Sectioning when fitting, detangling extensions, everyday styling"]],
    gallery:[["comb-set-labelled","What each comb is for"],["comb-set-flatlay","All 10 combs"]],
    guides:[["comb-set-uses","Picking up, sectioning and colouring with the tail combs"]]
  },
  "section-clips":{
    menu:"Steel Sectioning Clips", // short name used in the menus
    slug:"steel-sectioning-clips",seoTitle:"Steel Sectioning Hair Clips (10 or 20) | Velvet Lengths",seoDesc:"Stainless steel duckbill sectioning clips for fitting extensions, colouring and styling. Packs of 10 or 20 strong salon clips. Free tracked UK delivery.",
    category:"accessories",
    name:"Steel Sectioning Clips",eyebrow:"Salon clips for fitting and styling",type:"acc",colourWord:"pack sizes",
    supplier:"AliExpress 1005007037881713",
    lens:[0],step:0,wts:[["10 clips",1],["20 clips",1.333]],
    colours:[["Silver","Silver",1.20,"clips-main"]],
    blurb:"Stainless steel duckbill clips for holding hair out of the way while you fit, colour or style. Useful for keeping neat rows when fitting extensions.",
    specs:[["Material","Stainless steel alloy"],["Colour","Silver"],["Pack","10 or 20 clips"],["Good for","Sectioning when fitting extensions, colouring, cutting and styling"]],
    gallery:[["clips-row","Clips laid out"],["clips-box","Clips in storage box"]],
    guides:[["clips-uses","Clips in use for colouring, styling and braiding"]]
  },
  "butterfly-clips":{
    menu:"Butterfly Clips", // short name used in the menus
    slug:"butterfly-sectioning-clips",seoTitle:"Butterfly Hair Sectioning Clips (12 Pack) | Velvet Lengths",seoDesc:"Large butterfly hair clips with toothed jaws for holding thick sections while fitting extensions, drying and styling. Pack of 12. Free UK delivery.",
    category:"accessories",
    name:"Butterfly Sectioning Clips · 12 pack",eyebrow:"Large clips for holding thick sections",type:"acc",colourWord:"pack",
    supplier:"AliExpress 1005010256124143",
    lens:[0],step:0,wts:[["12 clips",1]],
    colours:[["Black","Black",1.40,"butterfly-clips-main"]],
    blurb:"Large butterfly clips with toothed jaws and a strong spring, for holding thick sections out of the way while you fit, blow-dry or style.",
    specs:[["Material","Plastic with metal spring"],["Size","8cm × 4.4cm"],["Pack","12 clips"],["Colour","Black"],["Good for","Holding thick sections while fitting, drying and styling"]],
    gallery:[["butterfly-clips-size","Size: 8cm × 4.4cm"],["butterfly-clips-open","Toothed jaws for a firm grip"],["butterfly-clips-spring","Strong metal spring"]]
  },
  "metal-comb":{
    menu:"Aluminium Comb", // short name used in the menus
    slug:"aluminium-cutting-comb",seoTitle:"Aluminium Cutting Comb | Velvet Lengths",seoDesc:"Lightweight aluminium cutting comb for partings and sectioning. Fine and wide teeth, 5 metallic finishes, small or large size. Free tracked UK delivery.",
    // cost set to an assumed £2.00 (AliExpress showed a £0.99 new-shopper price); update with real logged-in cost
    category:"accessories",
    name:"Aluminium Cutting Comb",eyebrow:"Lightweight salon comb with fine and wide teeth",type:"acc",colourWord:"finishes",
    supplier:"AliExpress 1005007264441773",
    lens:[0],step:0,wts:[["Small · 17.8cm",1],["Large · 21.5cm",1]],
    colours:[["Gold","Gold",2.00,"metal-comb-gold"],["Rose gold","Rose gold",2.00,"metal-comb-rose-gold"],["Silver","Silver",2.00,"metal-comb-silver"],["Black","Black",2.00,"metal-comb-black"],["Bronze","Bronze",2.00,"metal-comb-bronze"]],
    blurb:"A light aluminium comb with fine teeth at one end and wider teeth at the other. Use it for clean partings and neat sections when fitting extensions, then for everyday styling. It wipes clean easily.",
    specs:[["Material","Aluminium alloy"],["Small","17.8 × 2.4 × 2cm"],["Large","21.5 × 2.6 × 2.4cm"],["Finishes","Gold, rose gold, silver, black, bronze"],["Good for","Parting, sectioning, cutting and styling"]],
    gallery:[["metal-comb-large","Large size in gold: 21.5cm"],["metal-comb-large-rose-gold","Large size in rose gold"],["metal-comb-large-silver","Large size in silver"],["metal-comb-large-black","Large size in black"]]
  },
  "vent-brush":{
    menu:"Vent Brush", // short name used in the menus
    slug:"curved-vent-detangling-brush",seoTitle:"Curved Vent Brush for Hair Extensions | Velvet Lengths",seoDesc:"CALIYI curved vented detangling brush with ball-tipped bristles, gentle on tape, rings and bonds. Black, white or a pair. Free tracked UK delivery.",brand:"CALIYI",
    // costs assumed (£2.00 single, £3.60 pair); AliExpress showed new-shopper prices £0.99 / £1.68
    category:"accessories",
    name:"CALIYI Curved Vent Detangling Brush",eyebrow:"Gentle brushing for extensions, wet or dry",type:"acc",colourWord:"options",
    supplier:"AliExpress 1005007992616835",
    lens:[0],step:0,wts:[["1 brush",1]],
    colours:[["Black","Black",2.00,"vent-brush-black"],["White","White",2.00,"vent-brush-white"],["Pair","Black and white pair",3.60,"vent-brush-pair"]],
    blurb:"A curved paddle brush with vents and ball-tipped bristles. The vents let air through when you blow-dry, and the curve fits the shape of your head. Gentle enough to use around tape, rings and bonds, on wet or dry hair.",
    specs:[["Brand","CALIYI"],["Size","24.5cm long, 8cm wide head"],["Bristles","Ball-tipped nylon"],["Options","Black, white, or a black and white pair"],["Good for","Detangling extensions, blow-drying, everyday brushing"]],
    gallery:[["vent-brush-size","Size: 24.5cm × 8cm"]]
  },
  "mist-bottle":{
    menu:"Mist Spray Bottle", // short name used in the menus
    slug:"continuous-mist-spray-bottle",seoTitle:"Continuous Mist Spray Bottle 200ml | Velvet Lengths",seoDesc:"200ml continuous mist spray bottle for dampening and refreshing hair extensions and wigs. Ultra-fine mist in 7 colours. Free tracked UK delivery.",
    // cost assumed £2.00 (AliExpress showed a £0.99 new-shopper price)
    category:"accessories",
    name:"Continuous Mist Spray Bottle · 200ml",eyebrow:"Ultra-fine mist for extensions and wigs",type:"acc",colourWord:"colours",
    supplier:"AliExpress 1005007660366428",
    lens:[0],step:0,wts:[["1 bottle",1]],
    colours:[["White","White",2.00,"mist-white"],["Lilac","Lilac",2.00,"mist-lilac"],["Pink","Pink",2.00,"mist-pink"],["Black","Black",2.00,"mist-black",["#0d0d0d","#1c1c1c","#333"]],
      ["Black and clear","Black top, clear bottle",2.00,"mist-black-clear"],["White and clear","White top, clear bottle",2.00,"mist-white-clear",["#f4f4f4","#fafafa","#e6eef0"]],["Pink and aqua","White top, pink to aqua bottle",2.00,"mist-pink-aqua",["#f2a9bf","#d9c6d6","#8fd3d6"]]],
    blurb:"Hold the trigger and it keeps spraying a fine mist, so you can dampen hair evenly without soaking it. Use it to dampen extensions before styling, refresh curls or mist in leave-in conditioner.",
    specs:[["Capacity","200ml"],["Size","19.9cm × 7.4cm"],["Spray","Continuous ultra-fine mist"],["Material","Plastic"],["Colours","White, lilac, pink, black, black and clear, white and clear, pink and aqua"],["Good for","Dampening, refreshing and conditioning extensions and wigs"]],
    gallery:[["mist-all","All seven colours"],["mist-all-2","Side by side"],["mist-size","Size: 19.9cm tall, 7.4cm wide"]]
  }
};

function costFor(P,c,l,w){
  const pack=P.wts[w],len=P.lens[l];
  const tier=P.colours[c][2],ex=pack[2]&&(pack[2][tier]||pack[2]);
  if(ex&&typeof ex[len]==="number") return ex[len];
  const list=P.costs&&(Array.isArray(P.costs)?P.costs:P.costs[tier]);
  const base=list?list[l]:P.colours[c][2];
  return base*pack[1];
}
function priceFor(P,c,l,w){
  const v=P.costs?sell(costFor(P,c,l,w)):Math.ceil((sell(P.colours[c][2])+l*P.step)*P.wts[w][1])-0.01;
  return +v.toFixed(2);
}
