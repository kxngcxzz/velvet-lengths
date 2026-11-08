// Product catalogue. Prices = supplier cost x 2.5, rounded up to £x.99.
// cost = supplier price for the shortest length; step = extra per 2" of length (estimate, confirm with supplier).
const sell=c=>Math.ceil(c*2.5)-0.01;
const CATALOGUE={
  "nano-ring":{
    name:"Nano Ring Tip Extensions",eyebrow:"100% virgin Remy human hair",type:"ext",
    supplier:"DIYOMO Official Store (AliExpress 1005012462195766)",
    lens:[14,16,18,20,22,24],step:10,wts:[["50g",1],["100g",1.9]],
    colours:[
      ["01","Jet black",26.71],["02","Darkest brown",26.71],["04","Chestnut brown",26.71,"nano-ring-04"],["07","Light brown",26.71],
      ["1660","Brown balayage",26.71],["18613","Ash and bleach blonde",26.71],["760","Ash blonde balayage",26.71,"nano-ring-760"],
      ["99J","Burgundy",26.71,"nano-ring-99j"],["T416","Brown with honey highlights",26.71,"nano-ring-t416"]],
    blurb:"Tiny nano rings hold each strand with no glue, heat or tape. They sit flat and hide easily, even in fine hair. Made from 100% virgin Remy hair with the cuticles aligned, so it stays smooth and tangle-free. With good care it lasts up to 12 months, and it can be straightened, curled or toned.",
    specs:[["Hair","100% virgin Remy human hair"],["Method","Nano ring / micro bead, straight tip"],["Texture","Silky straight"],["Lengths",'14" to 24"'],["Pack","50g or 100g"],["Lifespan","Up to 12 months with care"],["Full head","150–200g (3–4 packs of 50g)"]]
  },
  "tape-in":{
    name:"Seamless Tape-In Extensions",eyebrow:"Remy human hair · skin weft",type:"ext",
    supplier:"VeSunny Official Store (AliExpress 4001270122877)",
    lens:[14,16,18,20,22,24],step:8,wts:[["20 pieces",1]],
    colours:[
      ["1","Jet black",20.70,"tape-in-1"],["1b","Natural black",22.26,"tape-in-1b"],["2","Darkest brown",22.26,"tape-in-2"],
      ["33","Auburn",23.30,"tape-in-33"],["350","Copper",23.30,"tape-in-350"],["2-2-6","Dark brown to chestnut balayage",23.40],
      ["1B-4-18","Black to ash brown ombre",23.55,"tape-in-1b-4-18"],["P4-27","Brown with honey highlights",22.51,"tape-in-p4-27"],
      ["6-60-6","Light brown with platinum balayage",23.30,"tape-in-6-60-6"],["P18-613","Ash and bleach blonde mix",24.08,"tape-in-p18-613"],
      ["1b-silver-1b","Black with silver streak",24.23,"tape-in-1b-silver-1b"],["Ba8A-60","Ash brown to platinum balayage",25.39]],
    blurb:"Double-sided seamless skin wefts that lie completely flat against the scalp, so they look like your own roots. Each pack has 20 pieces of soft, shiny Remy human hair that can be straightened and curled. Quick to fit and remove, and reusable with fresh tape for up to 6 months.",
    specs:[["Hair","Remy human hair"],["Method","Double-sided tape-in, seamless skin weft"],["Texture","Silky straight"],["Lengths",'14" to 24"'],["Pack","20 pieces"],["Lifespan","Up to 6 months, re-taping as needed"],["Full head","40–60 pieces (2–3 packs)"]]
  }
};
