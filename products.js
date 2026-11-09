// Product catalogue. Prices = supplier cost x 2.5, rounded up to £x.99.
// costs = supplier price per length (from the listing). Where a product has no costs list, cost = colour price for the
// shortest length and step = estimated extra per 2" (confirm with supplier).
// Pack entries: [label, multiplier, {length: exact cost}] - exact costs override the multiplier.
const sell=c=>Math.ceil(c*2.5)-0.01;
// Shop categories. Add a product to a category by giving it category:"<id>".
const CATEGORIES=[
  {id:"extensions",name:"Hair Extensions",blurb:"Remy human hair in nano ring, tape-in and keratin U-tip methods."},
  {id:"accessories",name:"Accessories",blurb:"Tools, tape and care for fitting and looking after your extensions."}
];
const CATALOGUE={
  "nano-ring":{
    category:"extensions",
    name:"Nano Ring Tip Extensions",eyebrow:"100% virgin Remy human hair",type:"ext",
    supplier:"DIYOMO Official Store (AliExpress 1005012462195766)",
    lens:[14,16,18,20,22,24],costs:[26.71,28.85,30.99,33.13,34.73,38.46],wts:[["50g",1],["100g",1.81,{24:69.45}]],
    colours:[
      ["01","Jet black",26.71,"nano-ring-01"],["02","Darkest brown",26.71,"nano-ring-02"],["04","Warm chestnut brown",26.71,"nano-ring-04"],["07","Ash medium brown",26.71,"nano-ring-07"],
      ["1660","Ash blonde",26.71,"nano-ring-1660"],["18613","Golden blonde highlights",26.71,"nano-ring-18613"],["760","Honey brown highlights",26.71,"nano-ring-760"],
      ["99J","Burgundy",26.71,"nano-ring-99j"],["T416","Brown with blonde highlights",26.71,"nano-ring-t416"]],
    blurb:"Tiny nano rings hold each strand with no glue, heat or tape. They sit flat and hide easily, even in fine hair. Made from 100% virgin Remy hair with the cuticles aligned, so it stays smooth and tangle-free. With good care it lasts up to 12 months, and it can be straightened, curled or toned.",
    specs:[["Hair","100% virgin Remy human hair"],["Method","Nano ring / micro bead, straight tip"],["Texture","Silky straight"],["Lengths",'14" to 24"'],["Pack","50g or 100g"],["Lifespan","Up to 12 months with care"],["How many packs","1–2 for length, 3–4 for volume, 5+ for a full head"]],
    gallery:[["nano-ring-range","The full colour range"],["nano-ring-range-2","Solid shades"],["nano-ring-highlights","Highlight blend"]],
    guides:[["nano-ring-how-to-fit","How to fit nano ring extensions, step by step"],["nano-ring-guide","Texture, pack size and how many packs to choose"]]
  },
  "tape-in":{
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
    blurb:"Double-sided seamless skin wefts that lie completely flat against the scalp, so they look like your own roots. Each pack has 20 pieces of soft, shiny Remy human hair that can be straightened and curled. Quick to fit and remove, and reusable with fresh tape for up to 6 months.",
    specs:[["Hair","Remy human hair"],["Method","Double-sided tape-in, seamless skin weft"],["Texture","Silky straight"],["Lengths",'14" to 24"'],["Pack","20 pieces"],["Lifespan","Up to 6 months, re-taping as needed"],["Piece size","4cm × 2cm tab, 2.5g per piece"],["How many packs","1 pack for highlights, 2–3 packs for volume and length"]],
    gallery:[["tape-in-range","The colour range"],["tape-in-tape","Double-sided tape close-up"]],
    guides:[["tape-in-length-guide","Where each length falls, straight and curled"]]
  },
  "u-tip":{
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
    blurb:"Pre-bonded U-tips with Italian-style keratin, fused strand by strand for a natural, flexible finish that moves like your own hair. Each strand is 0.6g of soft Remy human hair that can be heat styled, curled and washed as normal. Lasts 3–4 months between refits.",
    specs:[["Hair","Remy human hair"],["Method","U-tip keratin fusion (hot fusion)"],["Texture","Silky straight"],["Lengths",'12" to 20" (30–50cm)'],["Pack","50 strands (30g) or 100 strands (60g)"],["Lifespan","3–4 months between refits"],["Full head","150–200 strands"]]
  }
,
  "nano-beads":{
    category:"accessories",
    name:"Nano Ring Beads · 1000 pack",eyebrow:"Copper nano rings for fitting and refitting",type:"acc",colourWord:"colours",
    supplier:"AliExpress 1005009176917186",
    lens:[0],step:0,wts:[["1000 beads",1]],
    colours:[
      ["Black","Black",1.71,"nano-beads-black"],["Dark brown","Dark brown",2.07,"nano-beads-dark-brown"],
      ["Brown","Brown",1.84,"nano-beads-brown"],["Light brown","Light brown",2.07,"nano-beads-light-brown"],
      ["Blonde","Blonde",2.07,"nano-beads-blonde"]],
    blurb:"Tiny copper nano rings used to fit nano ring tip extensions and to refit them when they grow out. Each pot holds 1000 beads, enough for several full heads. Pick the colour closest to your roots so the rings disappear into your hair.",
    specs:[["Material","Copper, coated colour finish"],["Size","2.5mm × 1.5mm × 2mm"],["Pack","1000 beads in a clear pot"],["Use with","Nano ring tip extensions"],["Colours","Black, dark brown, brown, light brown, blonde"]],
    gallery:[["nano-beads-range","All five colours"],["nano-beads-size","Bead size: 2.5mm × 1.5mm × 2mm"],["nano-beads-pots","Beads in their pots"]],
    guides:[["nano-beads-how-to","How to fit a ring extension, step by step"]]
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
