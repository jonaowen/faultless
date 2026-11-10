/* people.js: pictures for Lessons 5-10 of Faultless French. Plain JavaScript, no dependencies. Defines window.PICS:

     PICS.person(spec, name)   a person, drawn in the app's 160 x 190 picture box, returned as an SVG <g>
        spec.person  "paul" | "julie"          Pierre or Sylvie (the same faces as portrait() in index.html) with a name
                                               tag that shows `name`
        spec.is      "man" | "woman" | "boy" | "girl"     somebody else: no name tag
        spec.doing   "eating" | "sleeping"     (optional)
        spec.looks   [ ... ]                   clothes, things carried, hair (see LOOKS below)
        spec.count   2-5 with the look "in a row": that many people standing side by side, to be counted
     PICS.key(spec)            a door key; looks gold / silver / red / black, old, big, small, plastic, on a ring;
                               spec.count > 1 gives that many keys laid out to be counted
     PICS.group(n, drawOne)    n copies of the <g> that drawOne() returns, laid out in the box so they can be counted
     PICS.fingers(n)           a hand (two hands from 6) holding up n fingers (to 10), in the style of fingerCard()
     PICS.dog(spec)            a dog: looks grey / golden / brown / black / white / spotted, puppy, big, small, running,
                               sitting, lying down; spec.doing "sleeping" | "eating"; spec.count > 1 lays several out
     PICS.action(act, who, opts)   an action shown in a loop: act "dance" | "jump" | "smile" | "stand up" | "sit down" | "walk";
                               who "you" (the learner: a neutral adult, no name tag) | "marie" (the teacher) | "paul" | "julie";
                               opts.still = true: one frozen frame; opts.name: the text of the name tag; opts.looks: as for a person.
                               PICS.person({person: "paul" | "julie", doing: "dancing" | "jumping" | "smiling" | "standing up" |
                               "sitting down" | "walking"}) gives the same (spec.still = true for the frozen frame)
     PICS.car(spec)            a car: looks red / black / green / blue, old, sports, small; spec.count > 1 lays several out
        (for a person, spec.doing may also be "drinking": a glass of water at the mouth, or "walking": a whole figure
        in mid-stride; looks may be written "in a coat", "with a hat", "wearing glasses")

   Added for Lessons 5-10 (things, readers, faces that tell, more actions). None of it changes a picture listed above.

     PICS.thing(spec)          one thing, or spec.count > 1 of them laid out to be counted (PICS.group). spec.is (any letter case) is one of
                               PICS.things; spec.looks is a list of look words. The first colour word in the looks (any name in COL, and
                               black, cream, silver, gold, golden, wooden, chocolate, ginger, brick) recolours the thing; words that a
                               kind does not know are ignored; an unknown kind gives an empty <g>. The looks each kind knows:
        cake        chocolate | with strawberries | with candles | small | a slice | round        (a colour word: the icing)
        coffee      in a white cup (any colour + "cup") | in a glass | in a red mug (any colour, or "mug") | small | with milk | in a paper cup
        banana      yellow | green | spotted | peeled | big | small
        pizza       round | a slice | with tomatoes | with mushrooms | small | in a box
        bus         red (any colour) | school | long | green (an old round bus) | double-decker | orange (faces left)
        table       wooden | round | square | small, low | long, dining | garden (with a parasol) | glass
        chair       wooden | plastic | folding | kitchen | office | garden
        bag         leather | backpack | shopping | handbag | sports | paper
        box         cardboard | gift | plastic | wooden | small, metal | big, open
        house       red roof ("roof": the colour is the roof's) | small | brick, tall | cottage | wooden | stone
        door        wooden | red (any colour: a panelled front door) | with a window | old | white | big (a double door)
        cat         black | ginger | white | grey | brown | cream; sitting | lying down | striped | spotted | small | kitten
        glass       empty | of water | tall (a long drink and a straw) | small | of juice | wine glass
        tree        green, big | with apples | pine | small, young | autumn | bare, winter
        bicycle     red (any colour) | child's | racing | old | with a basket | pink (faces left)
        window      open | closed | with curtains | round | big, shop (a wide picture window; also "wide") | shutters
        plate       empty: an empty plate with crumbs; spec.was = {is, looks}: a faint ghost of the thing that was on it, in a dashed outline
        face        feeling good | feeling so-so | feeling bad | hungry | thirsty | cold | hot | tired: a face card, a plain adult face
        French flag (or "flag")     the tricolour on a small flagpole
        picture card (or "card")    a white card with the learner's figure, frozen, doing spec.doing: dancing | jumping | walking |
                               smiling | eating | drinking | raising a hand (any act of PICS.action)
        newspaper   a folded newspaper               letter      a handwritten sheet and its envelope
        book, apple, pen, shoe      small plain versions of the app's own pictures (the app draws its own; these are for spec.holding);
                               book takes "open". key, dog, car: the same as PICS.key / PICS.dog / PICS.car
     PICS.things               the names (lower case) of the kinds above that the app has no picture of its own for: cake ... letter, without
                               book, apple, pen, shoe, key, dog, car (genPicture can test PICS.things.includes(String(e.is).toLowerCase()))
     PICS.person, more:
        spec.doing "reading"   an open book held in both hands, eyes down on it; spec.reading "book" (default) | "newspaper" | "letter".
                               Any person: paul, julie, man, woman, boy, girl, with any look
        spec.looks may hold ONE look that changes the face and not the person (the same stranger keeps the same features):
           "smiling" (or "likes it") / "pulling a face" (or "does not like it", "doesn't like it"): the eater's verdict. Eyes shut in
                               arches and a broad grin / eyes screwed up, brows knitted, the tongue out. With doing "eating" there is no
                               apple (the app shows the food beside the person): a fork held up with the next bite / an open hand
                               that pushes it away. With no doing (they have finished): the face alone
           "feeling good" (broad smile, thumb up) / "feeling so-so" (level mouth, the flat hand that rocks) /
           "feeling bad" (mouth turned down, brows up in the middle, eyes lowered, the head hung to one side)
        spec.holding {is, looks}   the person holds that thing up in one hand, big, beside them (any kind PICS.thing draws)
        spec.did "dancing" | "jumping" | "walking" (person "paul" | "julie" | "marie" | "you"): the person has just stopped: standing
                               still, arms down, the same whole figure at the same size as the action figure
        spec.doing "raising a hand" (the same four people): the action below (spec.still = true for the frozen frame)
     PICS.action, more acts:   "raise hand" (one arm goes up beside the head and stays up; then the figure fades and begins again), "stop" (no movement:
                               the figure stands still, arms by the sides, facing the viewer; opts.after "dance" | "jump" | "walk" |
                               ... gives it the size of that action's figure), "eat" (the hand brings an apple to the mouth for a bite,
                               lowers it, the mouth chews), "drink" (the glass comes up to the lips and tips, and comes away again).
                               "raising a hand", "eating", "drinking", "stopped" are understood too. who and opts.still as before.
     PICS.together(act, opts)  the learner ("you") and the teacher ("marie") side by side in one box, doing the same act in step:
                               any act of PICS.action (dance, jump, walk, smile, ...); opts as for PICS.action (opts.still works)

   Added for Lessons 11-20 (where things are, going places, having, states, weather, size, colour). Again nothing above changes, with
   one wanted exception: the window with the looks "big, shop" is now a wide picture window of a house (the shop front is the place "shop").

     PICS.place(spec, draw)    ONE box: a thing in a spatial relation to a ground. spec = {thing: {is, looks}, rel, ground: {is, looks}, was}
        rel "on" | "under"     ground "table" or "chair": the same table (chair) in the same spot, only the thing moves: on the top (seat),
                               or on the floor between the legs, behind the front legs
        rel "in"               ground "box" (an open box seen from above, the thing showing over the edge) or "bag" (an open bag);
                               "on" a "box": on top of a closed box
        rel "in front of" | "behind" | "next to"     ground "box" (closed), "house" (its door to the viewer) or "car": the car is drawn
                               from the FRONT (windscreen, two headlights, bumper; looks: its colour), so that in front of it is at its
                               nose. The ground keeps one spot and one size in all three. in front of = the whole thing before the middle
                               of the ground, overlapping it, on a floor line lower down (nearer); behind = behind the middle, about two
                               thirds hidden: only its top shows over the box or over the car's roof (of this file's cat or dog only the head,
                               eyes just over the edge, so that it is not taken to lie ON it); behind the house it looks out from
                               behind the left wall, higher up (further away); next to = whole, at the right, a clear gap, the same floor
                               line. (Table and chair are for on / under; another ground is treated like the box.)
        was: true              the same picture, the thing a faint ghost in a dashed outline ("there was a cat on the table")
                               For on / under / in the ground is this file's plain table, chair, box or bag; of ground.looks only the
                               colour is used. draw (optional): a function (entity) -> <g> used for the thing (and for a box or house as
                               ground of in front of / behind / next to), so that the app can pass its own pictures; default PICS.thing
     PICS.going(spec)          {who, to: {is, of}}: who walks (side view) toward a framed picture of the place at the right, a green arrow on
                               the ground between them. who: "you" | "marie" | a person spec ({person: "paul"}, {is: "man", looks: [...]}).
                               to.is: "park" | "beach" | "garden" | "shop" | "station" | "kitchen" | "cafe" | "house";
                               to.of: "Pierre" | "Sylvie" | any name (house only): that person's house, the name on a plate by the door
     PICS.at(spec)             {who, place: {is, of}}: who stands in the place, which fills the box (no arrow). A named person, "you" or
                               "marie" is the whole standing figure; a stranger (is: man ...) is head and shoulders in front of the place
     PICS.hand(spec, draw)     {who: "you" | "marie", holding: {is, looks} | null, was: {is, looks} | null}: an open hand seen from above with
                               the thing on the palm. "you": the hand comes up from the bottom, green sleeve; "marie": it comes down from
                               the top, her slate sleeve and skin. holding null: the empty hand; was: the empty hand and a ghost of the thing
     States, as ONE look on any person (PICS.person) and on the thing "face": "hungry" (mouth turned down, a hand on the stomach, a
                               thought bubble with a plate of hot food), "thirsty" (the tongue out, a thought bubble with a glass of water),
                               "cold" (blue cheeks, chattering teeth, arms hugged across the chest, shiver marks), "hot" (red cheeks, sweat
                               drops, a hand fanning the face), "tired" (heavy eyelids, a wide yawn). Also "feeling hungry" ... The face card
                               has no hands: the face, the bubble, the shiver marks and the sweat tell
     PICS.thing "weather"      looks "cold": snow, a snowman, a thermometer low and blue; "hot": a blazing sun, a thermometer high and red
     Size on things: "big" / "small" in the looks of ANY kind: the same picture at two sizes (small = 0.55 of big), standing on the same
                               line. Exception: the look lists of Lessons 5-10 in which big or small names a picture of its own keep that
                               picture exactly (cake "small, pink"; coffee "in a small black cup"; banana "big", "small"; pizza "small";
                               table "small, low"; box "small, metal", "big, open"; house "white, small"; door "black, big"; cat "white,
                               small"; glass "small"; tree "green, big", "small, young"; key and dog as before). With any other word beside
                               it (a colour, "empty", "round" ...) big / small only scales: glass "empty, big" / "empty, small"
     Size on people: looks "tall" / "short" on paul, julie, marie, you, man, woman, boy, girl: the same person as a whole standing figure
                               at two heights on the same floor, by a measuring post with a mark at the top of the head. (The two live strangers
                               of Lesson 6, man "tall, beard" and woman "tall, long hair", stay head and shoulders as they were.)
     Colour on things: ONE colour look recolours every kind and nothing else: house = the walls (slate roof), glass = coloured glass, plate,
                               cake = the icing, coffee = the mug, pizza = the crust, picture card = its border, newspaper = the paper,
                               letter = the envelope, face = the jumper; key and car also yellow and white. Four live pictures keep a shape
                               of their own: bus "green" and "orange", door "white", banana "green", key "red" / "black" (plastic head).
                               Add the look "plain" to get the standard shape in that colour: bus "green, plain", door "white, plain" ...
     About to do it: PICS.person({person: "paul" | "julie" | "marie" | "you", card: "dancing" | "jumping" | "walking" | "smiling" | "eating" |
                               "drinking" | "raising a hand"}) or PICS.action("stop", who, {card: ...}): the person standing still, holding
                               up the picture card of that action (the card as PICS.thing "picture card")


   The nouns of Lessons 11-20, as PICS.thing kinds (count, one colour look, "big" / "small" work on all of them; a single colour look only
   colours: the same shape in every colour; the other words pick the variant):
        ball        any colour (a ball with a seam band) | football | beach | basketball
        hat         any colour (a felt hat with a brim all round) | straw | top hat | with a feather | cowboy | sun
                               (no woolly hat and no cap: un bonnet, une casquette are other words)
        phone       any colour (a mobile phone) | old (a dial telephone) | toy
        bread       (a crusty loaf) | with seeds | round | brown (a tin loaf) | sliced | in a basket (round rolls); never a baguette
        flower      any colour (the petals) | in a pot
        lamp        any colour (the shade; a table lamp, lit) | desk | tall, floor | round (a globe) | old (a green-shaded desk lamp)
        shirt       any colour | checked | short-sleeved          trousers    any colour | striped (always long: no shorts)
        dress       any colour | long | short | with dots
        fish        any colour (a live fish, from the side) | striped | long
        cheese      any colour (a wedge with holes) | round (a white cheese, a piece cut out) | with holes (a block) | a slice (slices) |
                               blue-veined | in a box
        tomato      any colour | sliced | on the vine
        train       any colour (the nose of a streamlined locomotive and one carriage, three-quarters on, on rails and sleepers) | fast
                               (a longer nose) | old (a square-fronted railcar) | long (four short carriages) | steam
        plane       any colour (an airliner) | old (a biplane) | toy
        motorbike   any colour (the tank and mudguard) | old | police (no scooter: another word)
        park        with trees | with a pond | with benches | with a playground | in autumn | with flowers
        beach       sandy | with palm trees | with rocks | with a parasol | at sunset | with boats
        garden      with flowers | with a tree | with roses | with a fence | with a bench | with a lawn
        shop        red front, green front (a colour + "front": the wall) | with a blue awning (a colour + "awning", or a colour alone:
                               awning and sign) | corner | with windows | toy shop (no bakery: une boulangerie is another word)
        station     any colour (the building) | big | red brick | with a clock | modern | with a train | old
        kitchen     any colour (the cupboards) | wooden | modern | old
                               The six places are the scenes of PICS.going / PICS.at in a rounded frame; with no looks (or looks they do
                               not know) they are exactly those scenes. The station always has rails with sleepers, both platform edges
                               and a clock; in the usual picture (and "with a train") a long silver train stands at the platform, seen from the side
        boy, girl   a whole child standing: a big head on a short body, shorts (boy) or a skirt (girl); the looks are those of
                               PICS.person (cap, backpack, red jumper, glasses, short hair, scarf, ponytail, hat, long hair ...); a colour
                               look colours the jumper. (PICS.person {is: "boy"} is still the head and shoulders; PICS.things does not list
                               boy and girl, because the app already sends them to PICS.person)
        baby        in a blue romper (any colour) | with a rattle | sitting | in a pram | crawling | in a yellow hat (any colour + "hat")
     "small" is 0.55 of "big", except: the six places 0.72, train 0.7, cheese 0.68, plane, motorbike, boy, girl 0.62


   The whole figure (every picture of somebody from head to foot that PICS.action draws: dance, jump, walk, stand up, sit down, raise hand, stop;
   did; card; tall / short; PICS.together; the walkers of PICS.going and of PICS.person doing "walking"; the standing figures of PICS.at) has a
   body of its own, built like a person: only the head, hair, face and name tag are the portrait's (see BUILD). A man (Pierre, "you", is "man"),
   a woman (Marie, Sylvie, is "woman") and a child (is "boy" / "girl": smaller, a bigger head) have different builds. Looks drawn on it: coat,
   suit, scarf, backpack, bag, umbrella, red dress, and everything worn on the head. "stand up" and "sit down" show ONE movement: it is played
   once, the end is held, the figure fades out and is back in its first pose when the loop (2.6 s) begins again; the chair does not move.
   "raise hand" does the same instead of lowering the arm. dance, jump and walk are true loops (first pose = last pose).

   Nothing is random: the same spec always gives the same picture. Every gradient and clip path has its own id, so the
   same picture can be on the screen several times. No written words, except the name tags and the "z z Z" of sleep. */
(function(){
"use strict";
const NS = "http://www.w3.org/2000/svg";
let seq = 0;
const mk = html => { const g = document.createElementNS(NS, "g"); if (html) g.innerHTML = html; return g; };
const r2 = v => Math.round(v * 100) / 100;

/* ---------- colours ---------- */
const SKIN = {                      // [light, middle, shade]
  paul:  ["#efc4a0", "#dfa883", "#c48a66"],
  julie: ["#f3d0b4", "#e6b694", "#cc9674"],
  fair:  ["#f8dfca", "#eec8ab", "#d6a688"],
  light: ["#f0c8a4", "#e0ab85", "#c58c68"],
  tan:   ["#e3b58d", "#cd996d", "#ab7951"],
  brown: ["#c08b61", "#a37049", "#835534"],
  dark:  ["#966646", "#7a4f33", "#5d3923"]
};
const HAIR = {                      // [light, middle, dark]
  brown:   ["#7a5638", "#5a3d27", "#3f2a1a"],
  black:   ["#3a2a22", "#271b15", "#160f0b"],
  jet:     ["#34302f", "#201d1d", "#0f0e0e"],
  blond:   ["#efd592", "#d9b566", "#b38d42"],
  ginger:  ["#dd8a48", "#bb672d", "#8e481d"],
  dkbrown: ["#604635", "#473224", "#2f2116"],
  ltbrown: ["#b0865a", "#8e6843", "#6a4a2d"],
  grey:    ["#e6e6e3", "#c4c4bf", "#9a9a94"]
};
const COL = {                       // [light, dark] for clothes and things
  blue: ["#4d7fc4", "#3a64a3"], red: ["#d8483f", "#ad332c"], julieRed: ["#cf4a44", "#a8362f"],
  green: ["#5aa86d", "#3f8551"], teal: ["#3fa9a3", "#2b827d"], purple: ["#9076c8", "#6d55a1"],
  orange: ["#ee9a4a", "#cb782b"], yellow: ["#f0c648", "#cc9f26"], grey: ["#959daa", "#707885"],
  pink: ["#e88fb0", "#c56a8c"], navy: ["#4a5b84", "#324163"], lime: ["#a6c855", "#80a338"],
  brown: ["#a87e59", "#856140"], sky: ["#58a6e0", "#357fc0"],
  camel: ["#d2a76b", "#ab8149"], olive: ["#8a9863", "#667545"], plum: ["#9a6684", "#774863"],
  charcoal: ["#5b616d", "#3d424c"], straw: ["#ecd79f", "#ccb272"], felt: ["#8d919a", "#62666e"],
  brownfelt: ["#a07853", "#77563b"], mustard: ["#e3b53f", "#bb8e1f"], white: ["#fbfaf5", "#dedbd0"]
};
const WARM = { red: 1, julieRed: 1, orange: 1, pink: 1 };       // a red apple would not show against these: green apple

/* ---------- who is who: fixed looks for the people the lessons use; anybody else is derived from a hash ---------- */
const WHO = {
  // men
  "man|":            { s: "tan",   h: "dkbrown", st: "sidepart", t: "green" },
  "man|beard":       { s: "fair",  h: "ginger",  st: "sidepart", t: "teal" },
  "man|cap":         { s: "tan",   h: "jet",     st: "crew",     t: "grey",   a: "orange" },
  "man|backpack":    { s: "fair",  h: "blond",   st: "sidepart", t: "lime",   a: "purple" },
  "man|umbrella":    { s: "dark",  h: "jet",     st: "crew",     t: "yellow", a: "green" },
  "man|long hair":   { s: "light", h: "dkbrown", st: "longM",    t: "purple" },
  "man|suit":        { s: "brown", h: "jet",     st: "crew",     t: "navy",   a: "yellow" },
  "man|glasses":     { s: "light", h: "black",   st: "sidepart", t: "green" },
  "man|old":         { s: "fair",  h: "grey",    st: "old",      t: "brown" },
  "man|red jumper":  { s: "tan",   h: "ltbrown", st: "sidepart", t: "red" },
  "man|coat":        { s: "dark",  h: "jet",     st: "curly",    t: "yellow", a: "camel" },
  "man|bald":        { s: "light", h: "dkbrown", st: "bald",     t: "navy" },
  "man|short hair":  { s: "brown", h: "jet",     st: "crew",     t: "orange" },
  "man|hat":         { s: "brown", h: "black",   st: "sidepart", t: "teal",   a: "felt" },
  "man|scarf":       { s: "fair",  h: "dkbrown", st: "curly",    t: "grey",   a: "orange" },
  // women
  "woman|":            { s: "light", h: "ltbrown", st: "wavy",   t: "teal" },
  "woman|long hair":   { s: "fair",  h: "blond",   st: "xlong",  t: "teal" },
  "woman|glasses":     { s: "light", h: "ginger",  st: "wavy",   t: "green" },
  "woman|red dress":   { s: "brown", h: "jet",     st: "bun",    t: "red" },
  "woman|hat":         { s: "tan",   h: "dkbrown", st: "wavy",   t: "purple", a: "straw" },
  "woman|short hair":  { s: "tan",   h: "ltbrown", st: "bob",    t: "orange" },
  "woman|red jumper":  { s: "fair",  h: "dkbrown", st: "wavy",   t: "red" },
  "woman|cap":         { s: "light", h: "brown",   st: "long",   t: "yellow", a: "pink" },
  "woman|coat":        { s: "dark",  h: "jet",     st: "curlyF", t: "pink",   a: "plum" },
  "woman|ponytail":    { s: "light", h: "ltbrown", st: "pony",   t: "lime" },
  "woman|suit":        { s: "tan",   h: "black",   st: "bun",    t: "navy" },
  "woman|backpack":    { s: "fair",  h: "ginger",  st: "long",   t: "grey",   a: "sky" },
  "woman|umbrella":    { s: "brown", h: "black",   st: "wavy",   t: "pink",   a: "teal" },
  // boys
  "boy|":            { s: "tan",   h: "dkbrown", st: "kshort", t: "green" },
  "boy|glasses":     { s: "tan",   h: "jet",     st: "kshort", t: "orange" },
  "boy|backpack":    { s: "fair",  h: "blond",   st: "kshort", t: "teal",   a: "orange" },
  "boy|red jumper":  { s: "brown", h: "jet",     st: "kcurly", t: "red" },
  "boy|scarf":       { s: "fair",  h: "ginger",  st: "kshort", t: "navy",   a: "yellow" },
  "boy|cap":         { s: "tan",   h: "dkbrown", st: "kshort", t: "yellow", a: "sky" },
  "boy|hat":         { s: "light", h: "blond",   st: "kshort", t: "purple", a: "brownfelt" },
  "boy|coat":        { s: "light", h: "brown",   st: "kshort", t: "grey",   a: "mustard" },
  "boy|umbrella":    { s: "fair",  h: "dkbrown", st: "kshort", t: "lime",   a: "sky" },
  "boy|short hair":  { s: "tan",   h: "black",   st: "kcrew",  t: "teal" },
  // girls
  "girl|":           { s: "fair",  h: "ltbrown", st: "kbob",  t: "purple" },
  "girl|glasses":    { s: "brown", h: "jet",     st: "kbob",  t: "yellow" },
  "girl|pigtails":   { s: "light", h: "ginger",  st: "kpig",  t: "teal" },
  "girl|umbrella":   { s: "tan",   h: "black",   st: "kmid",  t: "orange", a: "purple" },
  "girl|cap":        { s: "fair",  h: "brown",   st: "kmid",  t: "green",  a: "pink" },
  "girl|ponytail":   { s: "dark",  h: "jet",     st: "kpony", t: "pink" },
  "girl|long hair":  { s: "light", h: "blond",   st: "klong", t: "lime" },
  "girl|backpack":   { s: "tan",   h: "dkbrown", st: "kbob",  t: "grey",   a: "pink" }
};
const SKINS = ["fair", "light", "tan", "brown", "dark"], HAIRS = ["dkbrown", "black", "blond", "ginger", "ltbrown", "jet", "brown"];
const TOPS = ["green", "teal", "purple", "orange", "yellow", "grey", "pink", "navy", "lime", "brown"];
const ACCS = ["orange", "sky", "green", "purple", "teal", "pink", "mustard"];
const DEF_STYLE = { man: ["sidepart", "crew", "curly"], woman: ["wavy", "long", "bun"], boy: ["kshort", "kcurly"], girl: ["kbob", "kmid"] };
function hashStr(s){ let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h; }

const SAME = { "book bag": "bag", "on a bicycle": "bicycle", "tie": "suit", "sun glasses": "sunglasses" };
const MOOD = { "smiling": "yum", "likes it": "yum", "pulling a face": "yuck", "pulling face": "yuck", "does not like it": "yuck", "doesn't like it": "yuck",
  "feeling good": "good", "feeling so-so": "soso", "feeling so so": "soso", "feeling bad": "bad",
  hungry: "hungry", thirsty: "thirsty", cold: "cold", hot: "hot", tired: "tired", "feeling hungry": "hungry", "feeling thirsty": "thirsty", "feeling cold": "cold", "feeling hot": "hot", "feeling tired": "tired" };      // looks that change the face, not the person
const HEIGHT = { tall: 1, short: 1 };                    // looks that change the size of the whole figure, not the person
/* two strangers of Lesson 6 are "tall" only by name (head and shoulders, the word just picks who they are): they stay as they were */
const liveTall = spec => !spec.person && { "man|beard+tall": 1, "woman|long hair+tall": 1 }[spec.is + "|" + (spec.looks || []).map(x => String(x).toLowerCase().trim()).sort().join("+")] === 1;
function lookName(x){
  let t = String(x).toLowerCase().trim().replace(/^(wearing|with|in)\s+/, "").replace(/^(a|an)\s+/, "");
  if (String(x).toLowerCase().trim() === "on a bicycle") t = "bicycle";
  return SAME[t] || t;
}
const doingOf = spec => String(spec && spec.doing || "").toLowerCase().split(/[ ,]/)[0];
function traits(spec, variant){
  const looks = (spec.looks || []).map(lookName).filter(x => x !== "in a row" && x !== "a row" && !MOOD[x] && (!HEIGHT[x] || liveTall(spec))), L = {}; looks.forEach(x => L[x] = 1);
  let c;
  if (spec.person === "marie" || spec.person === "you"){
    const M = spec.person === "marie";                     // Marie: the tutor of index.html (her skin, hair and jumper); you: a neutral adult
    c = { named: spec.person, kind: M ? "woman" : "man", skin: M ? ["#f3cfae", "#e8b892", "#cf9873"] : SKIN.tan, hair: M ? ["#5c4132", "#4a3326", "#3a271c"] : HAIR.jet,
      top: M ? ["#4a6b86", "#36536b"] : COL.green, topName: M ? "slate" : "green", iris: M ? "#5e3f27" : "#4a3524", style: M ? "marie" : "you", beard: false,
      brow: M ? "#4a3326" : "#2a2422", lip: M ? "#c4626a" : "#bf6660", cap: "orange", hat: "felt", band: "#2b2b30", pack: "orange", umb: "yellow", scarf: "mustard",
      coat: "camel", suit: "charcoal", tie: null, glasses: "#26262b", round: false, bag: "mustard" };
  } else if (spec.person){
    const P = spec.person !== "julie";
    c = { named: P ? "paul" : "julie", kind: P ? "man" : "woman", skin: SKIN[P ? "paul" : "julie"], hair: HAIR[P ? "brown" : "black"],
      top: P ? COL.blue : COL.julieRed, topName: P ? "blue" : "julieRed", iris: P ? "#4b6f8f" : "#5a3a22", style: P ? "paul" : "julie", beard: P,
      cap: P ? "green" : "yellow", hat: P ? "felt" : "straw", band: P ? "#2b2b30" : "#3fa9a3", pack: P ? "orange" : "green", umb: P ? "yellow" : "purple",
      scarf: P ? "mustard" : "teal", coat: P ? "olive" : "camel", suit: "charcoal", tie: P ? "blue" : null, glasses: "#26262b", round: !P, bag: "mustard" };
  } else {
    const kind = DEF_STYLE[spec.is] ? spec.is : "man";
    const key = kind + "|" + looks.slice().sort().join("+") + (variant ? "#" + variant : "");
    const known = looks.find(x => WHO[kind + "|" + x]);
    const h = hashStr(key), w = variant ? null : (WHO[key] || (known ? WHO[kind + "|" + known] : null));
    const t = w || { s: SKINS[h % 5], h: HAIRS[(h >>> 4) % HAIRS.length], st: DEF_STYLE[kind][(h >>> 9) % DEF_STYLE[kind].length], t: TOPS[(h >>> 13) % TOPS.length] };
    const a = t.a || ACCS[(h >>> 17) % ACCS.length], kid = kind === "boy" || kind === "girl", fem = kind === "woman" || kind === "girl";
    c = { named: null, kind, skin: SKIN[t.s], skinName: t.s, hair: HAIR[t.h], top: COL[t.t], topName: t.t, style: t.st,
      iris: ["#5a3a22", "#4b6f8f", "#5d7a4a", "#3b2a1e"][t.s === "dark" || t.s === "brown" ? 3 : (h >>> 21) % 3],
      cap: a, hat: t.a && (t.a === "felt" || t.a === "straw" || t.a === "brownfelt") ? t.a : (fem ? "straw" : "felt"),
      band: fem ? COL[ACCS[(h >>> 5) % ACCS.length]][0] : "#2b2b30", pack: a, umb: a, scarf: a,
      coat: t.a && COL[t.a] && L.coat ? t.a : ["camel", "olive", "plum"][h % 3], suit: ["navy", "charcoal"][h % 2],
      tie: kind === "man" ? (t.a && L.suit ? t.a : ["red", "green", "yellow"][(h >>> 6) % 3]) : null,
      glasses: ["#26262b", "#7a3b2a", "#1f4a7a"][(h >>> 8) % 3], round: (h >>> 10) % 2 === 1 || kid, bag: "mustard", bow: ["#e8548a", "#f0b429", "#3fa9a3"][(h >>> 12) % 3] };
  }
  const kid = c.kind === "boy" || c.kind === "girl", fem = c.kind === "woman" || c.kind === "girl";
  // looks that change the person
  if (L.old){ c.old = true; c.hair = HAIR.grey; if (!c.named && c.kind === "man"){ c.style = "old"; c.stache = true; } }
  if (L.bald && !c.named) c.style = "bald";
  if (L.beard) c.beard = true;
  if (L["long hair"] && !c.named) c.style = kid ? "klong" : fem ? "xlong" : "longM";
  if (L["short hair"] && !c.named) c.style = kid ? (fem ? "kbob" : "kcrew") : fem ? "bob" : "crew";
  if (L.ponytail && !c.named) c.style = kid ? "kpony" : "pony";
  if (L.pigtails && !c.named) c.style = kid ? "kpig" : "pig";
  if (c.style === "longM") c.beard = true;        // long hair on a man: a beard keeps him a man at 60 px
  if ((L.hat || L.cap) && !c.named){        // hair that fits under a hat
    if (c.style === "bun" || c.style === "curlyF") c.style = "wavy";
    if (c.style === "curly") c.style = "sidepart";
    if (c.style === "kcurly") c.style = "kshort";
  }
  if (spec._top && TINT[spec._top]){ c.top = TINT[spec._top]; c.topName = spec._top; }      // PICS.thing boy / girl with a colour look: the jumper
  if (L["red jumper"] || L["red dress"]){ c.top = COL.red; c.topName = "red"; }
  if (L["green jumper"]){ c.top = COL.green; c.topName = "green"; }
  if (L.jumper){ c.top = COL.mustard; c.topName = "mustard"; }
  c.jumper = !!(L["red jumper"] || L["green jumper"] || L.jumper);
  if (L.raincoat){ L.coat = 1; c.coat = "yellow"; c.hood = true; }
  if (L.sunglasses){ L.glasses = 1; c.shades = true; c.glasses = "#17181c"; }
  c.L = L; c.kid = kid; c.fem = fem; c.mood = MOOD[(spec.looks || []).map(lookName).find(x => MOOD[x])] || "";
  return c;
}

/* ---------- parts of a face ---------- */
function eye(u, cx, cy, o){
  let s;
  if (o.closed){
    s = `<path d="M${cx - 7} ${cy + 0.4} Q${cx} ${cy + 6.2} ${cx + 7} ${cy + 0.4}" stroke="#2a1c15" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <path d="M${cx - 4.8} ${cy + 3.6} l-1.3 2.5 M${cx} ${cy + 4.6} v2.8 M${cx + 4.8} ${cy + 3.6} l1.3 2.5" stroke="#2a1c15" stroke-width="1.1" fill="none" stroke-linecap="round"/>`;
  } else {
    s = `<path d="M${cx - 7} ${cy} Q${cx} ${cy - 6.4} ${cx + 7} ${cy - 0.4} Q${cx} ${cy + 5} ${cx - 7} ${cy} Z" fill="#fbf7f1"/>
      <clipPath id="${u}e${cx}"><path d="M${cx - 7} ${cy} Q${cx} ${cy - 6.4} ${cx + 7} ${cy - 0.4} Q${cx} ${cy + 5} ${cx - 7} ${cy} Z"/></clipPath>
      <g clip-path="url(#${u}e${cx})"><circle cx="${cx}" cy="${cy - 0.4 + (o.dy || 0)}" r="3.5" fill="${o.iris}"/><circle cx="${cx}" cy="${cy - 0.4 + (o.dy || 0)}" r="1.5" fill="#120d0a"/><circle cx="${cx + 1.1}" cy="${cy - 1.6 + (o.dy || 0)}" r="0.85" fill="#fff"/></g>
      <path d="M${cx - 7.4} ${cy} Q${cx} ${cy - 6.8} ${cx + 7.4} ${cy - 0.5}" stroke="#2a1c15" stroke-width="${o.lash ? 1.9 : 1.4}" fill="none" stroke-linecap="round"/>
      <path d="M${cx - 5.5} ${cy + 3.2} Q${cx} ${cy + 5.6} ${cx + 5.5} ${cy + 3}" stroke="${o.shade}" stroke-width="0.9" fill="none" opacity=".7"/>` +
      (o.lash ? `<path d="M${cx + o.lash * 7.2} ${cy - 0.6} l${o.lash * 3} -2.2 M${cx + o.lash * 5.4} ${cy - 2.6} l${o.lash * 2.4} -2.6" stroke="#2a1c15" stroke-width="1.1" fill="none" stroke-linecap="round"/>` : "");
  }
  if (o.half && !o.closed) s += `<path d="M${cx - 7.6} ${cy + 0.2} Q${cx} ${cy - 7.4} ${cx + 7.6} ${cy - 0.3} Q${cx} ${cy - 2.6} ${cx - 7.6} ${cy + 0.2} Z" fill="${o.half}"/>
      <path d="M${cx - 7.4} ${cy + 0.2} Q${cx} ${cy - 2.6} ${cx + 7.4} ${cy - 0.3}" stroke="#2a1c15" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
  return o.s && o.s !== 1 ? `<g transform="translate(${cx} ${cy}) scale(${o.s}) translate(${-cx} ${-cy})">${s}</g>` : `<g>${s}</g>`;
}
const zed = (x, y, s) => `<path d="M${x} ${y} h${s} l${-s} ${s} h${s}" fill="none" stroke="#fff" stroke-width="${r2(s * 0.3 + 3)}" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M${x} ${y} h${s} l${-s} ${s} h${s}" fill="none" stroke="#3b55b3" stroke-width="${r2(s * 0.3)}" stroke-linecap="round" stroke-linejoin="round"/>`;

/* ---------- hair: {back (behind the body), front (on the head), over (in front of the shoulders)} ---------- */
function hairOf(style, u, c){
  const H = `url(#${u}h)`, hl = c.hair[0], bow = c.bow || "#e8548a";
  const circles = a => a.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="${p[2]}" fill="${H}"/>`).join("");
  const strand = d => `<path d="${d}" stroke="${hl}" stroke-width="1.1" fill="none" opacity=".55"/>`;
  switch (style){
    case "paul": return { front: `<path d="M47 84 q-2-40 33-42 q35 2 33 42 q-4-14-12-20 q-12 4-24 2 q-12-2-18-6 q-8 8-12 24z" fill="${H}"/>
         <path d="M58 54 q8-6 22-6 M64 50 q10-4 22 0 M72 47 q10-2 20 2" stroke="#8c6545" stroke-width="1.1" fill="none" opacity=".6"/>` };
    case "marie": { const T = `transform="translate(80 48) scale(.744) translate(-200 -302)"`;   // the tutor's own hair paths, at the size of these heads
      return { back: `<path ${T} d="M153 352 q-3-58 47-60 q50 2 47 60 q2 36-5 58 q-10 4-20 0 h-44 q-10 4-20 0 q-7-22-5-58z" fill="${H}"/>`,
        front: `<path ${T} d="M156 354 q-2-58 44-60 q46 2 44 60 q-4-26-16-38 q-14-6-30-3 q-10 4-22 3 q-6 4-10 12 q-6 10-10 26z" fill="${H}"/>
          <path ${T} d="M188 297 q-14 8-22 26 M190 302 q-12 10-17 22 M214 299 q12 8 18 26 M222 302 q10 10 13 24" stroke="#6b4b39" stroke-width="1.6" fill="none" opacity=".5" stroke-linecap="round"/>` }; }
    case "you": return { back: `<path d="M44.5 92 Q40 39 80 36.5 Q120 39 115.5 92 Q117 104 111.5 113 L103 102 H57 L48.5 113 Q43 104 44.5 92Z" fill="${H}"/>`,
      front: `<path d="M47 86 q-3-45 33-47 q36 2 33 47 q-3-14-9-21 q-10 6-24 4 q-14-1-24-8 q-6 9-9 25z" fill="${H}"/>` + strand("M60 53 q12-8 28-6 M68 48 q10-3 20 1") };
    case "julie": return { back: `<path d="M40 98 q-2-64 40-66 q42 2 40 66 q2 50-8 78 q-32 8-64 0 q-10-28-8-78z" fill="${H}"/>`,
      front: `<path d="M47 90 q-3-46 33-48 q36 2 33 48 q-6-22-18-30 q-12 8-34 6 q-8 6-10 12 q-2 4-4 12z" fill="${H}"/>
         <path d="M78 44 q-14 6-22 24 M86 45 q12 8 18 26" stroke="#4a372d" stroke-width="1.1" fill="none" opacity=".6"/>` };
    /* men */
    case "sidepart": return { front: `<path d="M47 84 q-3-43 33-45 q36 2 33 45 q-3-13-9-20 q-20 6-38-2 q-5-2-8-6 q-8 9-11 28z" fill="${H}"/>` + strand("M60 52 q12-8 30-5 M66 47 q10-4 24 0") };
    case "crew": return { front: `<path d="M48 82 Q46 44 80 43 Q114 44 112 82 Q109 66 100 60 Q80 54 60 60 Q51 66 48 82 Z" fill="${H}"/>` };
    case "curly": return { front: `<path d="M47 84 Q45 44 80 42 Q115 44 113 84 Q108 66 98 61 Q80 56 62 61 Q52 66 47 84Z" fill="${H}"/>` +
      circles([[50, 72, 7], [52, 60, 8.5], [59, 50, 9], [69, 43.5, 9.5], [80, 41, 9.5], [91, 43.5, 9.5], [101, 50, 9], [108, 60, 8.5], [110, 72, 7], [64, 57, 7], [76, 54, 7], [88, 54, 7], [97, 58, 6.5]]) };
    case "old": return { front: `<path d="M47 88 q-3-42 33-45 q36 3 33 45 q-2-13-7-20 q-5-9-26-11 q-21 2-26 11 q-5 7-7 20z" fill="${H}" stroke="#8f8f89" stroke-width="1.2"/>` };
    case "bald": return { front: `<path d="M48.6 84 Q46.5 43.5 80 42.5 Q113.5 43.5 111.4 84 Z" fill="url(#${u}s)"/>
        <path d="M48.4 88 q-1.2-14 3-25 q0.6 12 0.4 22z M111.6 88 q1.2-14 -3-25 q-0.6 12 -0.4 22z" fill="${c.hair[1]}" opacity=".55"/>
        <ellipse cx="68" cy="56" rx="11" ry="5.5" fill="#fff" opacity=".28" transform="rotate(-18 68 56)"/>` };
    case "longM": return { back: `<path d="M42 98 Q38 36 80 34 Q122 36 118 98 Q121 118 116 136 L44 136 Q39 118 42 98Z" fill="${H}"/>`,
      front: `<path d="M47 92 q-4-49 33-51 q37 2 33 51 q-3-22-12-32 q-10-9-21-11 q-11 2-21 11 q-9 10-12 32z" fill="${H}"/>` + strand("M78 44 q-14 6-21 24 M82 44 q14 6 21 24") };
    /* women */
    case "long": return { back: `<path d="M40 98 q-2-64 40-66 q42 2 40 66 q2 50-8 78 q-32 8-64 0 q-10-28-8-78z" fill="${H}"/>`,
      front: `<path d="M47 92 q-4-49 33-51 q37 2 33 51 q-3-22-12-32 q-10-9-21-11 q-11 2-21 11 q-9 10-12 32z" fill="${H}"/>` + strand("M78 44 q-14 6-21 24 M82 44 q14 6 21 24") };
    case "wavy": return { back: `<path d="M41 96 Q36 34 80 32 Q124 34 119 96 Q125 108 119 120 Q125 132 117 141 Q108 146 104 136 L56 136 Q52 146 43 141 Q35 132 41 120 Q35 108 41 96Z" fill="${H}"/>`,
      front: `<path d="M47 92 q-4-49 33-51 q37 2 33 51 q-2-20-10-30 q-16 2-30-10 q-14 8-19 18 q-5 9-7 22z" fill="${H}"/>` + strand("M74 46 q-12 6-18 22 M84 45 q12 8 18 22") };
    case "bun": return { back: `<circle cx="80" cy="33" r="14" fill="${H}"/>`,
      front: `<path d="M48 84 q-3-40 32-42 q35 2 32 42 q-5-20-14-27 q-18-7-36 0 q-9 7-14 27z" fill="${H}"/>` + strand("M62 56 q8-8 18-9 M98 56 q-8-8-18-9") };
    case "bob": return { back: `<path d="M43 96 Q40 36 80 34 Q120 36 117 96 Q118 110 112 119 Q105 122 103 113 L57 113 Q55 122 48 119 Q42 110 43 96Z" fill="${H}"/>`,
      front: `<path d="M48 86 q-3-44 32-46 q35 2 32 46 q-3-14-9-22 q-14 8-30 6 q-10 0-16-6 q-6 8-9 22z" fill="${H}"/>` + strand("M62 52 q10-7 26-5") };
    case "pony": return { back: `<path d="M102 48 Q128 42 135 68 Q140 98 128 128 Q121 134 115 127 Q123 100 119 80 Q115 64 100 60 Z" fill="${H}"/>`,
      front: `<path d="M48 84 q-3-40 32-42 q35 2 32 42 q-5-20-14-27 q-18-7-36 0 q-9 7-14 27z" fill="${H}"/><circle cx="107" cy="53" r="5.5" fill="${bow}"/>` + strand("M62 56 q8-8 18-9 M98 56 q-8-8-18-9") };
    case "pig": return { back: `<path d="M48 80 Q28 74 22 92 Q18 112 26 132 Q34 138 40 130 Q38 108 50 94 Z M112 80 Q132 74 138 92 Q142 112 134 132 Q126 138 120 130 Q122 108 110 94 Z" fill="${H}"/>`,
      front: `<path d="M47 92 q-4-49 33-51 q37 2 33 51 q-3-22-12-32 q-10-9-21-11 q-11 2-21 11 q-9 10-12 32z" fill="${H}"/><circle cx="47" cy="86" r="5" fill="${bow}"/><circle cx="113" cy="86" r="5" fill="${bow}"/>` };
    case "xlong": return { back: `<path d="M37 100 q-2-68 43-70 q45 2 43 70 q2 46-4 90 h-78 q-6-44-4-90z" fill="${H}"/>`,
      front: `<path d="M47 92 q-4-49 33-51 q37 2 33 51 q-3-22-12-32 q-10-9-21-11 q-11 2-21 11 q-9 10-12 32z" fill="${H}"/>` + strand("M78 44 q-14 6-21 24 M82 44 q14 6 21 24"),
      over: `<path d="M40 100 q-5 38 2 80 q9 5 17-1 q-5-36-2-66 q-6-10-17-13z M120 100 q5 38-2 80 q-9 5-17-1 q5-36 2-66 q6-10 17-13z" fill="${H}"/>` };
    case "curlyF": return { back: `<ellipse cx="80" cy="78" rx="40" ry="42" fill="${H}"/>` +
        circles([[46, 104, 13], [40, 86, 13], [41, 67, 13], [49, 50, 13], [63, 39, 13], [80, 35, 13], [97, 39, 13], [111, 50, 13], [119, 67, 13], [120, 86, 13], [114, 104, 13], [52, 118, 11], [108, 118, 11]]),
      front: circles([[52, 70, 7.5], [58, 59, 8.5], [69, 53, 9], [80, 51, 9], [91, 53, 9], [102, 59, 8.5], [108, 70, 7.5]]) };
    /* children (rounder head: face 47..113, 54..124) */
    case "kshort": return { front: `<path d="M45.5 92 q-5-52 34.5-54 q39.5 2 34.5 54 q-2-12-7-19 q-7 5-13 0 q-7 6-15 1 q-7 5-15 0 q-6 5-12 0 q-5 7-7 18z" fill="${H}"/>
        <path d="M73 40 q3-12 15-10 q-7 3-6 11z" fill="${H}"/>` + strand("M60 52 q10-8 24-7 M70 47 q10-3 22 3") };
    case "kcrew": return { front: `<path d="M46 90 Q44 47 80 46 Q116 47 114 90 Q111 72 102 65 Q80 58 58 65 Q49 72 46 90Z" fill="${H}"/>` };
    case "kcurly": return { front: `<path d="M46 90 Q44 46 80 44 Q116 46 114 90 Q109 72 100 66 Q80 60 60 66 Q51 72 46 90Z" fill="${H}"/>` +
      circles([[49, 79, 7.5], [50, 66, 9], [57, 55, 9.5], [68, 47.5, 10], [80, 45, 10], [92, 47.5, 10], [103, 55, 9.5], [110, 66, 9], [111, 79, 7.5], [63, 62, 7.5], [75, 59, 7.5], [87, 59, 7.5], [98, 62, 7]]) };
    case "kbob": return { back: `<path d="M41 100 Q38 38 80 36 Q122 38 119 100 Q120 116 113 125 Q106 128 104 118 L56 118 Q54 128 47 125 Q40 116 41 100Z" fill="${H}"/>`,
      front: `<path d="M46 92 q-4-52 34-54 q38 2 34 54 q-3-12-8-19 q-26 7-52 0 q-5 7-8 19z" fill="${H}"/>
        <path d="M100 52 l-11 -7 v14z M100 52 l11 -7 v14z" fill="${bow}"/><circle cx="100" cy="52" r="3.4" fill="${bow}" stroke="#0002" stroke-width="1"/>` + strand("M62 54 q10-8 22-8") };
    case "kmid": return { back: `<path d="M40 100 Q37 38 80 36 Q123 38 120 100 Q124 124 118 142 L42 142 Q36 124 40 100Z" fill="${H}"/>`,
      front: `<path d="M46 92 q-4-52 34-54 q38 2 34 54 q-3-12-8-19 q-26 7-52 0 q-5 7-8 19z" fill="${H}"/>
        <path d="M49 66 Q80 44 111 66" stroke="${bow}" stroke-width="6" fill="none" stroke-linecap="round"/>` };
    case "kpig": return { back: `<path d="M48 76 Q28 66 20 84 Q14 104 22 126 Q30 133 37 125 Q35 104 50 90 Z M112 76 Q132 66 140 84 Q146 104 138 126 Q130 133 123 125 Q125 104 110 90 Z" fill="${H}"/>`,
      front: `<path d="M46 92 q-4-52 34-54 q38 2 34 54 q-4-22-13-31 q-10-9-21-11 q-11 2-21 11 q-9 9-13 31z" fill="${H}"/><circle cx="46.5" cy="82" r="5.5" fill="${bow}"/><circle cx="113.5" cy="82" r="5.5" fill="${bow}"/>` + strand("M80 40 v12") };
    case "kpony": return { back: `<path d="M102 46 Q130 38 138 64 Q143 92 132 118 Q125 124 119 117 Q126 92 121 76 Q116 62 100 58 Z" fill="${H}"/>`,
      front: `<path d="M46 92 q-4-52 34-54 q38 2 34 54 q-4-20-12-28 q-22-8-44 0 q-8 8-12 28z" fill="${H}"/><circle cx="108" cy="50" r="6" fill="${bow}"/>` };
    case "klong": return { back: `<path d="M37 102 q-2-66 43-68 q45 2 43 68 q2 44-4 88 h-78 q-6-44-4-88z" fill="${H}"/>`,
      front: `<path d="M46 92 q-4-52 34-54 q38 2 34 54 q-3-12-8-19 q-26 7-52 0 q-5 7-8 19z" fill="${H}"/>` + strand("M62 54 q10-8 22-8"),
      over: `<path d="M40 104 q-5 36 2 76 q8 5 16-1 q-5-34-2-62 q-6-10-16-13z M120 104 q5 36-2 76 q-8 5-16-1 q5-34 2-62 q6-10 16-13z" fill="${H}"/>` };
  }
  return {};
}

/* ---------- one person, head and shoulders ---------- */
function bust(spec, name, variant){
  const c = traits(spec, variant), L = c.L, u = "pk" + (seq++) + "_", kid = c.kid, fem = c.fem, P = c.named === "paul", J = c.named === "julie";
  const act = doingOf(spec), sleeping = act === "sleeping", eating = act === "eating", drinking = act === "drinking", reading = act === "reading";
  const mood = sleeping || drinking || reading ? "" : c.mood, anim = spec._act === "anim";      // a face that tells (MOOD); the loop of PICS.action "eat" / "drink"
  const tilt = mood === "bad" ? "translate(0 5) rotate(7 80 122)" : mood === "yuck" ? "rotate(-5 80 122)" : reading ? "translate(0 3)" : "";
  const skin = c.skin, top = c.top;
  const smile = spec._smile || "";                         // "anim" | "still": the mouth goes from neutral to a broad smile (PICS.action "smile")
  // body shape: Pierre and Sylvie keep the portrait's; other women are a little narrower; children much narrower
  const B = kid ? { x0: 36, x1: 124, yt: 133, cw: 28, drop: 30, neck: "M73 112 h14 v20 q-7 5-14 0z", vw: 10, vb: 168 }
    : (fem && !c.named) ? { x0: 27, x1: 133, yt: 132, cw: 31, drop: 36, neck: "M71 110 h18 v20 q-9 7-18 0z", vw: 13, vb: 174 }
    : { x0: 20, x1: 140, yt: 130, cw: 36, drop: 38, neck: "M70 110 h20 v18 q-10 8-20 0z", vw: 14, vb: 174 };
  const torso = (x0, x1, yt, cw, drop) => `M${x0} 190 v-${190 - yt - drop} q0-${drop - 6} ${cw}-${drop} h${x1 - x0 - 2 * cw} q${cw} 6 ${cw} ${drop} v${190 - yt - drop}z`;
  const TP = torso(B.x0, B.x1, B.yt, B.cw, B.drop), nx0 = B.x0 + B.cw, nx1 = B.x1 - B.cw, yt = B.yt;
  const outerName = L.coat ? c.coat : L.suit ? c.suit : null, outer = outerName ? COL[outerName] : null;
  const acc = n => COL[n] || COL.orange;
  const plain = c.named && !sleeping && !eating && !drinking && !smile && !reading && !mood && !Object.keys(L).length;
  const hair = hairOf(c.style, u, c);
  const browCol = c.old ? "#b9b9b4" : c.brow ? c.brow : P ? "#4f3622" : J ? "#2a1d17" : c.hair[2];
  const lip = c.lip ? c.lip : P ? "#b8645f" : J ? "#c75a64" : fem ? (c.skinName === "dark" || c.skinName === "brown" ? "#a8404e" : "#cf5266") : (c.skinName === "dark" || c.skinName === "brown" ? "#8a4a44" : "#b8645f");

  let defs = `<radialGradient id="${u}s" gradientUnits="userSpaceOnUse" cx="76" cy="${kid ? 82 : 78}" r="46"><stop offset="0" stop-color="${skin[0]}"/><stop offset=".65" stop-color="${skin[1]}"/><stop offset="1" stop-color="${skin[2]}"/></radialGradient>
      <linearGradient id="${u}h" x1="0" y1="0" x2=".3" y2="1"><stop offset="0" stop-color="${c.hair[0]}"/><stop offset=".55" stop-color="${c.hair[1]}"/><stop offset="1" stop-color="${c.hair[2]}"/></linearGradient>
      <linearGradient id="${u}t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top[0]}"/><stop offset="1" stop-color="${top[1]}"/></linearGradient>
      <radialGradient id="${u}b" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#e98a7a" stop-opacity="${kid ? ".5" : ".3"}"/><stop offset="1" stop-color="#e98a7a" stop-opacity="0"/></radialGradient>`;
  const grad = (id, pair) => `<linearGradient id="${u}${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${pair[0]}"/><stop offset="1" stop-color="${pair[1]}"/></linearGradient>`;
  if (outer) defs += grad("o", outer);

  /* --- behind the body --- */
  let behind = "";
  if (sleeping) behind += `<g transform="rotate(-18 54 79)"><rect x="8" y="48" width="92" height="62" rx="17" fill="#cddff8" stroke="#7b98cb" stroke-width="2.6"/>
      <path d="M16 58 q38 10 76 0 M16 100 q38-10 76 0" stroke="#9db6dd" stroke-width="1.8" fill="none"/></g>`;
  if (L.umbrella){
    const U = acc(c.umb);
    behind += `<path d="M26 34 Q28 5 88 4 Q148 5 150 34 Q134.5 25 119 34 Q103.5 25 88 34 Q72.5 25 57 34 Q41.5 25 26 34 Z" fill="${U[0]}"/>
      <path d="M88 4 Q28 5 26 34 Q41.5 25 57 34 Q62 12 88 4Z M88 4 Q112 12 119 34 Q103.5 25 88 34 Z" fill="${U[1]}"/>
      <path d="M26 34 Q28 5 88 4 Q148 5 150 34 Q134.5 25 119 34 Q103.5 25 88 34 Q72.5 25 57 34 Q41.5 25 26 34 Z" fill="none" stroke="${U[1]}" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M88 4.5 v-3" stroke="#4b4f57" stroke-width="2.6" stroke-linecap="round"/>`;
  }
  if (L.backpack){
    const K = acc(c.pack); defs += grad("k", K);
    const px0 = kid ? 28 : 22, px1 = kid ? 132 : 138, py = kid ? 104 : 98;
    behind += `<path d="M${px0} 190 V${py + 20} q0-20 20-20 h${px1 - px0 - 40} q20 0 20 20 V190z" fill="url(#${u}k)" stroke="${K[1]}" stroke-width="1.5"/>
      <path d="M${px0 + 5} ${py + 26} v40 M${px1 - 5} ${py + 26} v40" stroke="${K[1]}" stroke-width="2" opacity=".6" stroke-linecap="round"/>`;
  }
  if (c.hood){ const O = COL[c.coat]; behind += `<path d="M38 ${yt + 8} Q34 ${yt - 44} 80 ${yt - 48} Q126 ${yt - 44} 122 ${yt + 8} Z" fill="${O[1]}" stroke="#a37f18" stroke-width="1.4"/>`; }
  if (hair.back) behind += sleeping ? `<g transform="rotate(-16 80 122)">${hair.back}</g>` : drinking ? `<g transform="rotate(5 80 122)">${hair.back}</g>` : tilt ? `<g transform="${tilt}">${hair.back}</g>` : hair.back;

  /* --- body and clothes --- */
  let body = "";
  let sleeve = top;                                    // the colour of the arm that brings the apple up
  if (L["red dress"]){
    body += `<path d="${TP}" fill="${skin[1]}"/><path d="M${nx0 + 6} ${yt + 3} q${(nx1 - nx0 - 12) / 2} 9 ${nx1 - nx0 - 12} 0" stroke="${skin[2]}" stroke-width="1.2" fill="none" opacity=".6"/>
      <path d="M${B.x0 + 13} 190 V${yt + 31} Q${B.x0 + 20} ${yt + 17} ${nx0 + 2} ${yt + 14} L${nx0 - 3} ${yt + 0.6} h10 L${nx0 + 10} ${yt + 14} Q80 ${yt + 30} ${nx1 - 10} ${yt + 14} L${nx1 - 7} ${yt + 0.6} h10 L${nx1 - 2} ${yt + 14} Q${B.x1 - 20} ${yt + 17} ${B.x1 - 13} ${yt + 31} V190 Z" fill="url(#${u}t)"/>
      <path d="M${nx0 + 10} ${yt + 14} Q80 ${yt + 30} ${nx1 - 10} ${yt + 14}" stroke="${top[1]}" stroke-width="2" fill="none"/>`;
    sleeve = [skin[1], skin[2]];
  } else {
    body += `<path d="${TP}" fill="url(#${u}t)"/>`;
    if (c.jumper){
      body += `<path d="M${nx0 + 4} ${yt + 1.5} q${(nx1 - nx0 - 8) / 2} ${kid ? 12 : 15} ${nx1 - nx0 - 8} 0" stroke="${L["red jumper"] ? "#8f2620" : top[1]}" stroke-width="7.5" fill="none" stroke-linecap="round"/>
        <path d="M${nx0 + 4} ${yt + 1.5} q${(nx1 - nx0 - 8) / 2} ${kid ? 12 : 15} ${nx1 - nx0 - 8} 0" stroke="${L["red jumper"] ? "#e8756c" : "#fff"}" stroke-width="1.2" fill="none" stroke-dasharray="1.6 3" opacity=".9"/>
        <path d="M${B.x0 + 16} ${yt + 30} v${60 - 30} M${B.x1 - 16} ${yt + 30} v30" stroke="${L["red jumper"] ? "#8f2620" : top[1]}" stroke-width="1.6" opacity=".45"/>`;
    } else if (c.named){
      body += `<path d="M62 131 q18 ${P ? 10 : 14} 36 0" stroke="${P ? "#2f538a" : J ? "#8a2a25" : top[1]}" stroke-width="3.5" fill="none" opacity="${P || J ? ".55" : ".9"}" stroke-linecap="round"/>`;
    } else if (fem && !kid){                           // a scooped neck
      body += `<path d="M${nx0 + 5} ${yt + 0.4} q${(nx1 - nx0 - 10) / 2} 22 ${nx1 - nx0 - 10} 0z" fill="${skin[1]}"/>
        <path d="M${nx0 + 5} ${yt + 0.6} q${(nx1 - nx0 - 10) / 2} 22 ${nx1 - nx0 - 10} 0" stroke="${top[1]}" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/>`;
    } else {
      body += `<path d="M${nx0 + 5} ${yt + 1} q${(nx1 - nx0 - 10) / 2} ${kid ? 9 : 10} ${nx1 - nx0 - 10} 0" stroke="${top[1]}" stroke-width="3.5" fill="none" opacity=".8" stroke-linecap="round"/>`;
      if (kid && c.kind === "boy" && !outer) body += `<path d="M${B.x0} 170 H${B.x1} M${B.x0} 182 H${B.x1}" stroke="#fff" stroke-width="5" opacity=".5"/>`;
    }
  }
  if (L.coat){
    const O = outer, vw = B.vw, vb = B.vb; sleeve = O;
    body += `<path d="${torso(B.x0 - 4, B.x1 + 4, yt - 2, B.cw + 2, B.drop + 2)}" fill="url(#${u}o)"/>
      <path d="M${80 - vw} ${yt - 1} L${80 + vw} ${yt - 1} L80 ${vb} Z" fill="url(#${u}t)"/>
      <path d="M${80 - vw + 1} ${yt - 3} L${80 - vw - 15} ${yt + 2} L${80 - vw - 9} ${yt + 24} L80 ${vb + 5} L80 ${vb - 7} Z" fill="${O[0]}" stroke="${O[1]}" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M${80 + vw - 1} ${yt - 3} L${80 + vw + 15} ${yt + 2} L${80 + vw + 9} ${yt + 24} L80 ${vb + 5} L80 ${vb - 7} Z" fill="${O[0]}" stroke="${O[1]}" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M80 ${vb + 3} V190" stroke="${O[1]}" stroke-width="1.8"/>
      <circle cx="72" cy="${vb + 9}" r="3.6" fill="#4a3524"/><circle cx="88" cy="${vb + 9}" r="3.6" fill="#4a3524"/>
      <path d="M${B.x0 + 10} ${yt + 26} q-3 18 -1 34 M${B.x1 - 10} ${yt + 26} q3 18 1 34" stroke="${O[1]}" stroke-width="1.8" fill="none" opacity=".6"/>`;
  }
  if (L.suit){
    const O = outer, vw = B.vw, vb = B.vb + 2; sleeve = O;
    const shirt = J ? `url(#${u}t)` : "#f8f6f0";
    body += `<path d="${TP}" fill="url(#${u}o)"/>
      <path d="M${80 - vw} ${yt - 1} L${80 + vw} ${yt - 1} L80 ${vb} Z" fill="${shirt}"/>`;
    if (c.tie){ const T = acc(c.tie);
      body += `<path d="M${80 - vw} ${yt - 1} L80 ${yt + 8} L${80 - vw + 4} ${yt + 17} Z M${80 + vw} ${yt - 1} L80 ${yt + 8} L${80 + vw - 4} ${yt + 17} Z" fill="#fff" stroke="#cfccc2" stroke-width="1"/>
        <path d="M76 ${yt + 6} h8 l-1.6 7 h-4.8z" fill="${T[1]}"/><path d="M77.6 ${yt + 13} h4.8 l4 ${vb - yt - 22} l-6.4 8 l-6.4 -8z" fill="${T[0]}"/>`;
    } else body += `<path d="M${80 - vw} ${yt - 1} L${80 - 2} ${yt + 14} L${80 - vw + 2} ${yt + 20} Z M${80 + vw} ${yt - 1} L${80 + 2} ${yt + 14} L${80 + vw - 2} ${yt + 20} Z" fill="${J ? COL.julieRed[0] : "#fff"}" stroke="${J ? COL.julieRed[1] : "#cfccc2"}" stroke-width="1"/>`;
    body += `<path d="M${80 - vw} ${yt - 2} L${80 - vw - 13} ${yt + 4} L${80 - vw - 5} ${yt + 21} L${80 - vw - 10} ${yt + 26} L80 ${vb + 5} L80 ${vb - 8} Z" fill="${O[0]}" stroke="${O[1]}" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M${80 + vw} ${yt - 2} L${80 + vw + 13} ${yt + 4} L${80 + vw + 5} ${yt + 21} L${80 + vw + 10} ${yt + 26} L80 ${vb + 5} L80 ${vb - 8} Z" fill="${O[0]}" stroke="${O[1]}" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M80 ${vb + 3} V190" stroke="${O[1]}" stroke-width="1.8"/><circle cx="80" cy="${vb + 10}" r="2.8" fill="#23252b"/>
` + (c.named ? "" : `<path d="M${B.x1 - 34} ${yt + 28} h13 l-1 5 h-11z" fill="#fff" opacity=".95"/>`);
  }
  body += `<path d="${B.neck}" fill="${skin[2]}"/>`;
  if (L.scarf){
    const S = acc(c.scarf); defs += grad("a", S);
    body += kid
      ? `<path d="M103 134 q7-4 13 2 l5 30 q-8 5-16 1z" fill="url(#${u}a)" stroke="${S[1]}" stroke-width="1.2"/><path d="M106.5 152 l13.5 -1 M107.5 160 l13.5 -1" stroke="#fff" stroke-width="3" opacity=".6"/>
         <path d="M58 116 Q80 129 102 116 Q107 126 104 139 Q80 151 56 139 Q53 126 58 116Z" fill="url(#${u}a)" stroke="${S[1]}" stroke-width="1.2"/>
         <path d="M57 127 Q80 140 103 127" stroke="#fff" stroke-width="3.2" fill="none" opacity=".6"/><path d="M57 133 Q80 146 104 133" stroke="${S[1]}" stroke-width="1.4" fill="none" opacity=".7"/>`
      : `<path d="M108 133 q8-4 14 2 l6 34 q-9 5-17 1z" fill="url(#${u}a)" stroke="${S[1]}" stroke-width="1.2"/><path d="M111 152 l15 -1.4 M112 161 l15.5 -1.4" stroke="#fff" stroke-width="3.2" opacity=".6"/>
         <path d="M54 113 Q80 128 106 113 Q112 125 108 139 Q80 152 52 139 Q48 125 54 113 Z" fill="url(#${u}a)" stroke="${S[1]}" stroke-width="1.2"/>
         <path d="M52 126 Q80 141 108 126" stroke="#fff" stroke-width="3.4" fill="none" opacity=".6"/><path d="M52 133 Q80 147 108 133" stroke="${S[1]}" stroke-width="1.4" fill="none" opacity=".7"/>`;
  }
  if (L.backpack){
    const K = acc(c.pack), sx = kid ? 60 : 53, ex = kid ? 53 : 45;
    body += `<path d="M${sx} ${yt + 1} Q${ex} ${yt + 22} ${ex} 190 M${160 - sx} ${yt + 1} Q${160 - ex} ${yt + 22} ${160 - ex} 190" stroke="${K[1]}" stroke-width="11" fill="none"/>
      <path d="M${sx - 2} ${yt + 3} Q${ex - 2.5} ${yt + 22} ${ex - 2.5} 190 M${162 - sx} ${yt + 3} Q${162.5 - ex} ${yt + 22} ${162.5 - ex} 190" stroke="${K[0]}" stroke-width="3" fill="none" opacity=".9"/>
      <rect x="${ex - 6.5}" y="${yt + 33}" width="13" height="7" rx="2" fill="#e9e9e4" stroke="#8a8a84" stroke-width="1"/><rect x="${160 - ex - 6.5}" y="${yt + 33}" width="13" height="7" rx="2" fill="#e9e9e4" stroke="#8a8a84" stroke-width="1"/>
      <path d="M${ex} 181 H${160 - ex}" stroke="${K[1]}" stroke-width="4.5"/><rect x="74" y="177" width="12" height="8" rx="2" fill="#e9e9e4" stroke="#8a8a84" stroke-width="1"/>`;
  }
  if (L.bag){
    const G = acc(c.bag); defs += grad("g", G);
    body += `<path d="M117 ${yt + 4} Q128 ${yt + 12} 130 152" stroke="#6a4a2a" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M116 152 h30 q4 0 4 4 v24 q0 4-4 4 h-30 q-4 0-4-4 v-24 q0-4 4-4z" fill="url(#${u}g)" stroke="#8a6a1e" stroke-width="1.5"/>
      <path d="M112 157 q0-5 4-5 h30 q4 0 4 5 v5 q-19 12-38 0z" fill="${G[1]}"/><circle cx="131" cy="168" r="3.2" fill="#f6e7a8" stroke="#8a6a1e" stroke-width="1"/>`;
  }
  if (L.umbrella) body += `<path d="M120.5 152 L88 30" stroke="#4b4f57" stroke-width="3.2" stroke-linecap="round"/>`;

  /* --- the head: everything here tilts together when the person sleeps --- */
  const F = kid ? { face: "M80 54 C101 54 113 68 113 89 C113 108 100 123 80 124 C60 123 47 108 47 89 C47 68 59 54 80 54 Z", ex: [66, 94], ey: 93, es: 1.2, earx: [47.5, 112.5], eary: 93, my: 1, bl: [62, 98, 104] }
                : { face: "M80 48 C100 48 112 63 112 85 C112 106 101 122 80 125 C59 122 48 106 48 85 C48 63 60 48 80 48 Z", ex: [67, 93], ey: 87, es: 1, earx: [48.5, 111.5], eary: 90, my: 0, bl: [64, 96, 101] };
  let head = `<ellipse cx="${F.earx[0]}" cy="${F.eary}" rx="${kid ? 4.8 : 4.2}" ry="7.5" fill="${skin[2]}"/><ellipse cx="${F.earx[1]}" cy="${F.eary}" rx="${kid ? 4.8 : 4.2}" ry="7.5" fill="${skin[2]}"/>
     <path d="${F.face}" fill="url(#${u}s)"/>
     <ellipse cx="${F.bl[0]}" cy="${F.bl[2]}" rx="9" ry="${kid ? 6 : 5}" fill="url(#${u}b)"/><ellipse cx="${F.bl[1]}" cy="${F.bl[2]}" rx="9" ry="${kid ? 6 : 5}" fill="url(#${u}b)"/>`;
  if (fem && !c.named && !kid && (c.style === "bun" || c.style === "pony" || c.style === "bob"))
    head += `<circle cx="48.5" cy="99.5" r="2.6" fill="#f2cf5a" stroke="#b8922c" stroke-width=".8"/><circle cx="111.5" cy="99.5" r="2.6" fill="#f2cf5a" stroke="#b8922c" stroke-width=".8"/>`;
  if (c.old) head += `<path d="M66 65 q14-3.5 28 0 M68 70.5 q12-3 24 0" stroke="${skin[2]}" stroke-width="1.2" fill="none" opacity=".85"/>
     <path d="M55.5 85 l-4.5 -2.4 M55.5 88.5 l-4.6 1 M104.5 85 l4.5 -2.4 M104.5 88.5 l4.6 1" stroke="${skin[2]}" stroke-width="1.1" fill="none" opacity=".9"/>
     <path d="M69 99 q-5 7 -3.5 14 M91 99 q5 7 3.5 14" stroke="${skin[2]}" stroke-width="1.2" fill="none" opacity=".85"/>
     <path d="M60.5 93.5 q6.5 3.4 13 0 M86.5 93.5 q6.5 3.4 13 0" stroke="${skin[2]}" stroke-width="1" fill="none" opacity=".8"/>`;
  head += hair.front || "";
  if (c.beard){
    if (P) head += `<path d="M49 92 q2 28 31 33 q29-5 31-33 q-3 12-10 17 q-6-6-21-6 q-15 0-21 6 q-7-5-10-17z" fill="url(#${u}h)" opacity=".95"/>
         <path d="M66 105 q14-5 28 0 q-4 4-14 4 q-10 0-14-4z" fill="url(#${u}h)"/>`;
    else head += `<path d="M48.6 90 q0 34 31.4 43 q31.4-9 31.4-43 q-3 14-10.4 19 q-6-6-21-6 q-15 0-21 6 q-7.4-5-10.4-19z" fill="url(#${u}h)" opacity=".97"/>
         <path d="M65 105 q15-5.5 30 0 q-4 4.4-15 4.4 q-11 0-15-4.4z" fill="url(#${u}h)"/>`;
  }
  // brows
  if (mood){                                               // brows that go with the face: up (glad), level (so-so), inner ends up (sad), knitted (disgust)
    const BR = { good: [-5, -2.5], yum: [-5, -2.5], soso: [7, 1], bad: [-17, -1], yuck: [17, 3], hungry: [-15, -1], thirsty: [-13, -1], cold: [-16, 0], hot: [-9, 0.5], tired: [-7, 1] }[mood], bx = kid ? 58.5 : (P || (!fem && !c.named)) ? 59 : 60, by = kid ? 82.6 : 77;
    const one = kid ? `<path d="M58.5 82.6 q7.5-4.6 15-1.4" stroke="${browCol}" stroke-width="2.4" fill="none" stroke-linecap="round"/>` : `<path d="M${bx} 77 q8-5 16-1.5 q-8-1.6-16 3.4z" fill="${browCol}"/>`;
    head += [0, 1].map(i => `<g transform="${i ? "translate(160 0) scale(-1 1) " : ""}translate(0 ${BR[1]}) rotate(${BR[0]} ${bx + 8} ${by})">${one}</g>`).join("");
  } else if (kid) head += `<path d="M58.5 82.6 q7.5-4.6 15-1.4 M101.5 82.6 q-7.5-4.6 -15-1.4" stroke="${browCol}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".9"/>`;
  else { const bx = (P || (!fem && !c.named)) ? 59 : 60, bh = (P || (!fem && !c.named)) ? 4 : 5.5;
    head += `<path d="M${bx} 77 q8-${bh} 16-1.5 q-8-1.6-16 3z" fill="${browCol}"/><path d="M${160 - bx} 77 q-8-${bh} -16-1.5 q8-1.6 16 3z" fill="${browCol}"/>`; }
  // eyes
  const eo = { iris: c.iris, shade: skin[2], closed: sleeping, s: F.es, half: drinking || reading || mood === "bad" || mood === "tired" || mood === "hot" ? skin[1] : null, dy: reading ? 2.4 : mood === "bad" || mood === "tired" ? 1.8 : mood === "hungry" || mood === "thirsty" ? -1.2 : 0 };
  if (mood === "yum" || mood === "yuck") head += F.ex.map((cx, i) => { const cy = F.ey, f = i ? -1 : 1;      // eyes shut with pleasure: two arches; screwed up: > <
      return `<g transform="translate(${cx} ${cy}) scale(${F.es})"><path d="${mood === "yum" ? "M-7.4 2.6 Q0 -6.6 7.4 2.6" : `M${-6 * f} -4.6 L${5.6 * f} 0 L${-6 * f} 4.6`}" stroke="#2a1c15" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`; }).join("");
  else head += eye(u, F.ex[0], F.ey, Object.assign({ lash: fem && !c.named ? -1 : 0 }, eo)) + eye(u, F.ex[1], F.ey, Object.assign({ lash: fem && !c.named ? 1 : 0 }, eo));
  // nose
  head += kid ? `<path d="M77.6 102.4 q2.4 2.6 5 0.2" stroke="${skin[2]}" stroke-width="1.4" fill="none" opacity=".8" stroke-linecap="round"/>`
    : `<path d="M78 88 Q76.4 97 75.8 101.5 Q77.4 103.6 79.6 103.2" stroke="${skin[2]}" stroke-width="1.2" fill="none" opacity=".55"/>
     <ellipse cx="77" cy="103.4" rx="1.4" ry=".8" fill="#8f5c42" opacity=".5"/><ellipse cx="83" cy="103.4" rx="1.4" ry=".8" fill="#8f5c42" opacity=".5"/>`;
  // mouth
  const my = F.my;
  if (smile){
    /* neutral mouth -> broad smile and back: the corners go out and up, the teeth show, the cheeks lift and the eyes narrow */
    const an = smile === "anim", K = `keyTimes="0;0.14;0.4;0.8;1" dur="1.3s" repeatCount="indefinite" calcMode="spline" keySplines="0 0 1 1;0.4 0 0.6 1;0 0 1 1;0.4 0 0.6 1"`;
    const A = (attr, a, b) => an ? `<animate attributeName="${attr}" values="${a};${a};${b};${b};${a}" ${K}/>` : "";
    const V = (a, b) => an ? a : b;
    const m0 = "M70.5 109.6 Q80 110.8 89.5 109.6 Q80 112.4 70.5 109.6 Z", m1 = "M63.5 105.4 Q80 111.4 96.5 105.4 Q80 127 63.5 105.4 Z";
    const t0 = "M72 109.9 Q80 110.9 88 109.9 Q80 111.3 72 109.9 Z", t1 = "M66.4 107 Q80 112.2 93.6 107 Q80 118.4 66.4 107 Z";
    head += `<path d="${V(m0, m1)}" fill="#5a1b1d" stroke="${lip}" stroke-width="2.4" stroke-linejoin="round">${A("d", m0, m1)}</path>
      <path d="${V(t0, t1)}" fill="#fffdf8">${A("d", t0, t1)}</path>
      <g opacity="${V(0, 1)}">${A("opacity", 0, 1)}<ellipse cx="60.5" cy="99" rx="10" ry="6.4" fill="url(#${u}b)"/><ellipse cx="99.5" cy="99" rx="10" ry="6.4" fill="url(#${u}b)"/>
        <path d="M58.4 94.6 q8.6 -5.2 17.2 0 q-8.6 5.6 -17.2 0z M84.4 94.6 q8.6 -5.2 17.2 0 q-8.6 5.6 -17.2 0z" fill="${skin[1]}"/>
        <path d="M59 93.6 q8 -4.4 16 0 M85 93.6 q8 -4.4 16 0" stroke="${skin[2]}" stroke-width="1.3" fill="none" stroke-linecap="round"/></g>`;
  }
  else if (mood === "good" || mood === "yum") head += `<ellipse cx="60.5" cy="${99 + my}" rx="10" ry="6.4" fill="url(#${u}b)"/><ellipse cx="99.5" cy="${99 + my}" rx="10" ry="6.4" fill="url(#${u}b)"/>
     <path d="M63.5 ${105.4 + my} Q80 ${111.4 + my} 96.5 ${105.4 + my} Q80 ${128 + my} 63.5 ${105.4 + my} Z" fill="#5a1b1d" stroke="${lip}" stroke-width="2.4" stroke-linejoin="round"/>
     <path d="M66.4 ${107 + my} Q80 ${112.2 + my} 93.6 ${107 + my} Q80 ${118.4 + my} 66.4 ${107 + my} Z" fill="#fffdf8"/>`;
  else if (mood === "thirsty" || mood === "hot")           // the mouth open, the tongue out: a long dry tongue (thirsty), a short pant (hot)
    head += `<path d="M69 ${108.5 + my} Q80 ${104.5 + my} 91 ${108.5 + my} Q89 ${120 + my} 80 ${120 + my} Q71 ${120 + my} 69 ${108.5 + my} Z" fill="#5a1b1d" stroke="${lip}" stroke-width="2.2" stroke-linejoin="round"/>` +
      (mood === "thirsty" ? `<path d="M74 ${114 + my} Q73.4 ${129 + my} 80 ${130 + my} Q86.6 ${129 + my} 86 ${114 + my} Z" fill="#e36f7c" stroke="#b34d5a" stroke-width="1.1"/><path d="M80 ${116 + my} v9" stroke="#b34d5a" stroke-width="1.1" stroke-linecap="round"/>` : `<ellipse cx="80" cy="${117 + my}" rx="5" ry="2.6" fill="#e36f7c"/>`);
  else if (mood === "cold")                                // the teeth chatter
    head += `<rect x="69" y="${106.5 + my}" width="22" height="9.6" rx="3.4" fill="#fffdf8" stroke="${lip}" stroke-width="2.2"/><path d="M74.5 ${106.5 + my} v9.6 M80 ${106.5 + my} v9.6 M85.5 ${106.5 + my} v9.6 M69 ${111.3 + my} h22" stroke="#a9a9a3" stroke-width="1.1"/>`;
  else if (mood === "tired")                               // a wide yawn
    head += `<ellipse cx="80" cy="${113.5 + my}" rx="8.6" ry="10.6" fill="#5a1b1d" stroke="${lip}" stroke-width="2.2"/><path d="M73.4 ${108 + my} Q80 ${111 + my} 86.6 ${108 + my} Q80 ${104 + my} 73.4 ${108 + my} Z" fill="#fffdf8"/><path d="M74.6 ${119 + my} Q80 ${114 + my} 85.4 ${119 + my} Q80 ${124.5 + my} 74.6 ${119 + my} Z" fill="#d9706f"/>
      <path d="M${F.ex[0] - 6} ${F.ey + 7.5} q6 3 12 0 M${F.ex[1] - 6} ${F.ey + 7.5} q6 3 12 0" stroke="${skin[2]}" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
  else if (mood === "soso" || mood === "bad" || mood === "hungry"){             // a level mouth; a mouth turned down (on a beard, the lips on a patch of skin so that they show)
    const d = mood === "soso" ? `M67.5 ${111.6 + my} H92.5` : `M68 ${117 + my} Q80 ${106 + my} 92 ${117 + my}`;
    head += (c.beard ? `<path d="${d}" stroke="${skin[1]}" stroke-width="8.4" fill="none" stroke-linecap="round"/>` : "") + `<path d="${d}" stroke="${c.beard ? "#7a2f33" : lip}" stroke-width="3.8" fill="none" stroke-linecap="round"/>`;
  }
  else if (mood === "yuck") head += `<path d="M72.6 ${97 + my} l4 3 M87.4 ${97 + my} l-4 3" stroke="${skin[2]}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
     <path d="M66.5 ${116.5 + my} Q80 ${101.5 + my} 93.5 ${116.5 + my} Q80 ${110.5 + my} 66.5 ${116.5 + my} Z" fill="#5a1b1d" stroke="${lip}" stroke-width="2.4" stroke-linejoin="round"/>
     <path d="M73.6 ${111 + my} Q73 ${126.5 + my} 80 ${127.5 + my} Q87 ${126.5 + my} 86.4 ${111 + my} Z" fill="#e36f7c" stroke="#b34d5a" stroke-width="1.1"/><path d="M80 ${113 + my} v9" stroke="#b34d5a" stroke-width="1.1" stroke-linecap="round"/>`;
  else if (eating && anim) head += `<g opacity="0"><animate attributeName="opacity" values="0;1;0;0" keyTimes="0;0.2;0.56;1" calcMode="discrete" dur="2.2s" repeatCount="indefinite"/><ellipse cx="81.5" cy="${111.4 + my}" rx="8.4" ry="7.4" fill="#551a1a" stroke="${lip}" stroke-width="1.8"/>
     <path d="M74.6 ${108.2 + my} Q81.5 ${104.6 + my} 88.4 ${108.2 + my} Q88 ${110.6 + my} 81.5 ${109.6 + my} Q75 ${110.6 + my} 74.6 ${108.2 + my} Z" fill="#fff"/><ellipse cx="81.5" cy="${116 + my}" rx="4.6" ry="2.2" fill="#d9706f"/></g>
     <g><animate attributeName="opacity" values="1;0;1;1" keyTimes="0;0.2;0.56;1" calcMode="discrete" dur="2.2s" repeatCount="indefinite"/><ellipse cx="97" cy="${104 + my}" rx="7" ry="6" fill="url(#${u}b)"/>
     <path d="M71 ${110 + my} Q80 ${113 + my} 89 ${110 + my}" stroke="${lip}" stroke-width="3.2" fill="none" stroke-linecap="round"><animate attributeName="d" values="M71 ${110 + my} Q80 ${113 + my} 89 ${110 + my};M72.5 ${111.5 + my} Q80 ${108.5 + my} 87.5 ${111.5 + my};M71 ${110 + my} Q80 ${113 + my} 89 ${110 + my}" dur="0.44s" repeatCount="indefinite"/></path></g>`;
  else if (eating) head += `<ellipse cx="81.5" cy="${111.4 + my}" rx="8.4" ry="7.4" fill="#551a1a" stroke="${lip}" stroke-width="1.8"/>
     <path d="M74.6 ${108.2 + my} Q81.5 ${104.6 + my} 88.4 ${108.2 + my} Q88 ${110.6 + my} 81.5 ${109.6 + my} Q75 ${110.6 + my} 74.6 ${108.2 + my} Z" fill="#fff"/>
     <ellipse cx="81.5" cy="${116 + my}" rx="4.6" ry="2.2" fill="#d9706f"/>`;
  else if (drinking) head += `<path d="M73.5 ${112.6 + my} Q80 ${118.2 + my} 86.5 ${112.2 + my}" stroke="${lip}" stroke-width="3" fill="none" stroke-linecap="round"/>`;   // the lower lip, under the rim
  else if (sleeping) head += `<ellipse cx="80" cy="${111.6 + my}" rx="3.9" ry="3.3" fill="#6e2424" stroke="${lip}" stroke-width="1.5"/>`;
  else if (kid) head += `<path d="M71.5 ${109.6 + my} Q80 ${117.4 + my} 88.5 ${109.6 + my} Q80 ${112.4 + my} 71.5 ${109.6 + my} Z" fill="${lip}"/><path d="M72 ${109.8 + my} Q80 ${114.6 + my} 88 ${109.8 + my}" stroke="#8a3b3b" stroke-width="1.1" fill="none" stroke-linecap="round"/>`;
  else head += `<path d="M69.5 109.4 Q80 116.5 90.5 109.4 Q80 112.6 69.5 109.4 Z" fill="${lip}"/>
     <path d="M70 109.6 Q80 114.2 90 109.6" stroke="#8a3b3b" stroke-width="1.1" fill="none" stroke-linecap="round"/>
     <path d="M68 108 q-1.4 1.6 0 3.4 M92 108 q1.4 1.6 0 3.4" stroke="${skin[2]}" stroke-width="0.9" fill="none" opacity=".7"/>`;
  if (mood === "hungry") head += drop(92, 121 + my, 0.8);
  if (mood === "cold") head += `<ellipse cx="${F.bl[0]}" cy="${F.bl[2]}" rx="11" ry="7" fill="#6f9fe0" opacity=".55"/><ellipse cx="${F.bl[1]}" cy="${F.bl[2]}" rx="11" ry="7" fill="#6f9fe0" opacity=".55"/><ellipse cx="79" cy="${101 + my}" rx="5" ry="3.6" fill="#6f9fe0" opacity=".45"/>`;
  if (mood === "hot") head += `<ellipse cx="${F.bl[0]}" cy="${F.bl[2]}" rx="11.5" ry="7.5" fill="#e8402f" opacity=".5"/><ellipse cx="${F.bl[1]}" cy="${F.bl[2]}" rx="11.5" ry="7.5" fill="#e8402f" opacity=".5"/>` + drop(57, 70 + my, 1.05) + drop(104, 75 + my, 0.9) + drop(53, 104 + my, 0.8);
  if (false) head += "";
  if (!c.beard && c.stache) head += (c.old ? "" : `<path d="M49 92 q2 28 31 33 q29-5 31-33 q-3 12-10 17 q-6-6-21-6 q-15 0-21 6 q-7-5-10-17z" fill="${c.hair[1]}" opacity=".42"/>`) + `<path d="M63 ${106.4 - (eating ? 2.4 : 0)} q17-8.4 34 0 q-3 5.4-9.4 3.6 q-7.6-2.8-15.2 0 q-6.4 1.8-9.4-3.6z" fill="url(#${u}h)"${c.old ? ' stroke="#8f8f89" stroke-width="1"' : ""}/>` +
      (c.old ? "" : `<path d="M71 ${118.5 + (eating ? 2.5 : 0)} q9 4 18 0 q-1.5 7.5-9 8 q-7.5-.5-9-8z" fill="url(#${u}h)" opacity=".95"/>`);
  if (kid && !sleeping && (hashStr(c.kind + c.style + c.topName) % 2 === 0))
    head += `<g fill="${skin[2]}" opacity=".75"><circle cx="60" cy="101" r="1"/><circle cx="64.5" cy="103.4" r="1"/><circle cx="57" cy="104.6" r="1"/><circle cx="100" cy="101" r="1"/><circle cx="95.5" cy="103.4" r="1"/><circle cx="103" cy="104.6" r="1"/></g>`;
  if (L.glasses){
    const gc = c.glasses, ey = F.ey, x0 = F.ex[0], x1 = F.ex[1], lens = `fill="${c.shades ? "#23262d" : "#cfe6f5"}" fill-opacity="${c.shades ? ".93" : ".3"}" stroke="${gc}" stroke-width="${kid ? 3 : 2.8}"`;
    head += (c.round ? `<circle cx="${x0 - 0.5}" cy="${ey + 0.5}" r="${kid ? 12 : 11}" ${lens}/><circle cx="${x1 + 0.5}" cy="${ey + 0.5}" r="${kid ? 12 : 11}" ${lens}/>`
                     : `<rect x="${x0 - 12}" y="${ey - 8.5}" width="23.5" height="17.5" rx="6" ${lens}/><rect x="${x1 - 11.5}" y="${ey - 8.5}" width="23.5" height="17.5" rx="6" ${lens}/>`) +
      `<path d="M${x0 + (c.round ? (kid ? 11.5 : 10.5) : 11.5)} ${ey - 1} q${(x1 - x0) / 2 - (c.round ? (kid ? 11.5 : 10.5) : 11.5)} -3.4 ${(x1 - x0) - 2 * (c.round ? (kid ? 11.5 : 10.5) : 11.5)} 0 M${x0 - (c.round ? (kid ? 12.5 : 11.5) : 12)} ${ey - 1.5} L${F.earx[0] - 1} ${ey - 4} M${x1 + (c.round ? (kid ? 12.5 : 11.5) : 12)} ${ey - 1.5} L${F.earx[1] + 1} ${ey - 4}" stroke="${gc}" stroke-width="${kid ? 3 : 2.8}" fill="none" stroke-linecap="round"/>`;
  }
  if (L.hat){
    const Hc = acc(c.hat), wide = c.hat === "straw"; defs += grad("c", Hc);
    head += `<ellipse cx="80" cy="56" rx="${wide ? 57 : 51}" ry="${wide ? 11 : 9.5}" fill="${Hc[1]}"/>
      <ellipse cx="80" cy="54.6" rx="${wide ? 57 : 51}" ry="${wide ? 10.4 : 9}" fill="url(#${u}c)"/>
      <path d="M54 55 Q49 22 64 16 Q72 13 80 17 Q88 13 96 16 Q111 22 106 55 Q80 63 54 55Z" fill="url(#${u}c)"/>
      <path d="M53.6 46 Q80 54 106.4 46 L106 55 Q80 63 54 55 Z" fill="${c.band}"/>
      <path d="M61 24 Q70 19 80 22" stroke="#fff" stroke-width="2" fill="none" opacity=".3" stroke-linecap="round"/>`;
  }
  if (L.cap){
    const C = acc(c.cap); defs += grad("c", C);
    head += `<path d="M43.5 67 Q41 25 80 24 Q119 25 116.5 67 Q100 58 80 58 Q60 58 43.5 67 Z" fill="url(#${u}c)"/>
      <path d="M80 24 V57 M61 28.5 Q54 44 54.5 60 M99 28.5 Q106 44 105.5 60" stroke="${C[1]}" stroke-width="1.3" fill="none" opacity=".7"/>
      <circle cx="80" cy="24.6" r="3.4" fill="${C[1]}"/>
      <path d="M41 64 Q76 49 113 61 Q117 68 104 71 Q76 75 50 73 Q37 71 41 64Z" fill="${C[1]}"/>
      <path d="M45 66.5 Q76 55 109 64" stroke="#fff" stroke-width="1.6" fill="none" opacity=".3" stroke-linecap="round"/>`;
  }
  head = sleeping ? `<g transform="rotate(-16 80 122)">${head}</g>` : drinking ? `<g transform="rotate(5 80 122)">${head}</g>` : `<g${tilt ? ` transform="${tilt}"` : ""}>${head}</g>`;

  /* --- in front: long hair over the shoulders, name tag, arms and things held, z z Z --- */
  let front = hair.over ? (sleeping ? `<g transform="rotate(-6 80 122)">${hair.over}</g>` : tilt ? `<g transform="${tilt}">${hair.over}</g>` : hair.over) : "";
  if (c.named && name !== null && name !== undefined && name !== ""){
    const nm = String(name).replace(/[&<>]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[ch]));
    const tw = Math.max(J ? 56 : 50, nm.length * 7.6 + 4);
    front += `<g class="nametag"><rect x="${80 - tw / 2}" y="146" width="${tw}" height="24" rx="4" fill="#fffdf6" stroke="#b9ae98" stroke-width="1.5"/>
     <rect x="${80 - tw / 2}" y="146" width="${tw}" height="5" rx="2" fill="#c8453b"/>
     <text x="80" y="166" text-anchor="middle" font-family="system-ui,-apple-system,Segoe UI,Roboto,sans-serif" font-size="14" font-weight="700" fill="#2a2522">${nm}</text></g>`;
  }
  const headFront = front;                                 // hair over the shoulders and the name tag: what a whole figure takes from here, with the head
  const armStroke = (d, w) => `<path d="${d}" stroke="${sleeve[1]}" stroke-width="${w + 2.4}" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${sleeve[0]}" stroke-width="${w - 1}" fill="none" stroke-linecap="round" opacity=".85"/>`;
  if (L.umbrella){
    front += armStroke("M127 200 L123.5 165", 19) +
      `<path d="M120.5 152 L124.4 166 q2 8.6 -5.2 9 q-6 0 -6 -6" stroke="#8a5a36" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
       <ellipse cx="121.6" cy="155" rx="9.4" ry="9" fill="${skin[1]}" stroke="${skin[2]}" stroke-width="1.2"/>
       <path d="M114 152 q7 2.4 14.6 0.4 M113.4 156.4 q8 2.4 16 0.4 M114.6 160.6 q7 2 13.6 0.2" stroke="${skin[2]}" stroke-width="1.1" fill="none" opacity=".9"/>`;
  }
  const fing = (xs, y, h) => xs.map((x, i) => `<rect x="${x}" y="${y - (i === 1 || i === 2 ? 2.5 : 0)}" width="5.8" height="${h + (i === 1 || i === 2 ? 2.5 : 0)}" rx="2.9" fill="${skin[0]}" stroke="${skin[2]}" stroke-width="1"/>`).join("");
  if (eating && mood === "yum")                            // it is good: a fork with the next bite, held up
    front += armStroke("M33 200 L38 174", 19) + `<path d="M43 170 L48 106" stroke="#6d737c" stroke-width="4.4" stroke-linecap="round"/><path d="M43.4 106 l1.6 -17 M47.6 106.4 l1.6 -17 M51.8 106.8 l1.6 -17 M42 106 h11.6 l-1.6 8 h-8z" stroke="#6d737c" stroke-width="2.6" fill="#a9afb8" stroke-linecap="round" stroke-linejoin="round"/>
       <path d="M39.5 92 q1 -9 9 -8 q9 1 8 8.5 q-1 6 -9 5.5 q-8 -.5 -8 -6z" fill="#e2b06c" stroke="#a9763a" stroke-width="1.3"/>
       <g transform="translate(42 158) rotate(4)"><rect x="-12.5" y="-13" width="25" height="27" rx="9" fill="${skin[1]}" stroke="${skin[2]}" stroke-width="1.2"/><path d="M-8 -5.5 h17 M-8 0.5 h17 M-8 6.5 h16" stroke="${skin[2]}" stroke-width="1.1" stroke-linecap="round"/>
       <rect x="-3" y="-17" width="17" height="8.4" rx="4.2" fill="${skin[0]}" stroke="${skin[2]}" stroke-width="1.1" transform="rotate(-14 5 -13)"/></g>`;
  if (eating && mood === "yuck")                           // it is not good: the open hand that pushes the plate away
    front += armStroke("M131 200 L127 170", 18) + `<g transform="translate(125 150) rotate(8)">${fing([-12.6, -6.2, 0.2, 6.6], -27, 20)}<rect x="-20" y="-6" width="9" height="19" rx="4.5" fill="${skin[0]}" stroke="${skin[2]}" stroke-width="1" transform="rotate(-38 -15 4)"/>
       <rect x="-13.5" y="-10" width="27" height="27" rx="9" fill="${skin[1]}" stroke="${skin[2]}" stroke-width="1.2"/><path d="M-7 3 q7 5 14 0" stroke="${skin[2]}" stroke-width="1" fill="none" opacity=".7"/></g>
       <path d="M150 128 l6 -5 M152 140 h7 M146 118 l3 -7" stroke="#8b8f96" stroke-width="2.6" stroke-linecap="round"/>`;
  if (mood === "hungry")                                   // a hand on the stomach, and the thought of a hot meal
    front += armStroke("M136 204 Q120 186 96 182", 16) + `<rect x="64" y="173.5" width="36" height="15" rx="7.5" fill="${skin[1]}" stroke="${skin[2]}" stroke-width="1.2"/><path d="M66 178.5 h15 M66 183.5 h15" stroke="${skin[2]}" stroke-width="1.1" stroke-linecap="round"/>
       <path d="M52 172 q-5 8 -1 16 M108 172 q5 8 1 16" stroke="#8b8f96" stroke-width="2.6" fill="none" stroke-linecap="round"/>` + bubble(131, 33, 27, true);
  if (mood === "thirsty") front += bubble(131, 33, 27, false);
  if (mood === "cold")                                     // arms hugged across the chest, and shivering
    front += armStroke("M8 212 Q62 192 123 175", 16) + armStroke("M152 212 Q98 192 37 175", 16) + `<ellipse cx="126" cy="173" rx="9" ry="8" fill="${skin[1]}" stroke="${skin[2]}" stroke-width="1.2"/><ellipse cx="34" cy="173" rx="9" ry="8" fill="${skin[1]}" stroke="${skin[2]}" stroke-width="1.2"/>
       <path d="M28 169.5 q6 2.4 12 0 M28 174 q6 2.4 12 0 M120 169.5 q6 2.4 12 0 M120 174 q6 2.4 12 0" stroke="${skin[2]}" stroke-width="1.1" fill="none"/>` + shiver(10, 84, 1) + shiver(150, 84, -1) + shiver(6, 124, 1) + shiver(154, 124, -1);
  if (mood === "hot")                                      // fanning the face with a hand
    front += armStroke("M146 204 L140 142", 16) + `<g transform="translate(137 122) rotate(18)">${fing([-12.6, -6.2, 0.2, 6.6], -27, 20)}<rect x="-20" y="-6" width="9" height="19" rx="4.5" fill="${skin[0]}" stroke="${skin[2]}" stroke-width="1" transform="rotate(-38 -15 4)"/>
       <rect x="-13.5" y="-10" width="27" height="27" rx="9" fill="${skin[1]}" stroke="${skin[2]}" stroke-width="1.2"/></g><path d="M112 84 q-7 8 -4 18 M120 76 q-4 5 -4 10 M152 78 q6 8 3 18" stroke="#8b8f96" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
  if (mood === "good")                                     // thumb up
    front += armStroke("M131 200 L128 172", 18) + `<g transform="translate(126 156)"><rect x="-12.5" y="-25" width="10.5" height="27" rx="5.2" fill="${skin[0]}" stroke="${skin[2]}" stroke-width="1.1" transform="rotate(-10 -7 0)"/>
       <rect x="-12" y="-8" width="27" height="24" rx="8.5" fill="${skin[1]}" stroke="${skin[2]}" stroke-width="1.2"/><path d="M-1 -2 h15.5 M-1 4 h15.5 M-1 10 h15" stroke="${skin[2]}" stroke-width="1.1" stroke-linecap="round"/></g>`;
  if (mood === "soso")                                     // the flat hand that rocks: comme ci, comme ca
    front += armStroke("M133 200 L129 172", 18) + `<g transform="translate(130 160) rotate(-16)"><rect x="-4" y="2" width="9" height="14" rx="4.5" fill="${skin[1]}" stroke="${skin[2]}" stroke-width="1.1" transform="rotate(24 0 4)"/>
       <rect x="-18" y="-7" width="36" height="14" rx="7" fill="${skin[1]}" stroke="${skin[2]}" stroke-width="1.2"/><path d="M-17 -2.3 h14 M-17 2.3 h14" stroke="${skin[2]}" stroke-width="1.1" stroke-linecap="round"/></g>
       <path d="M111 172 q-5 7 -1 15 M152 138 q6 8 2 18" stroke="#8b8f96" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
  if (eating && !mood){
    const loopG = s => anim ? `<g transform="translate(-6 46)"><animateTransform attributeName="transform" type="translate" values="-6 46;0 0;0 0;-6 46;-6 46" keyTimes="0;0.26;0.52;0.8;1" dur="2.2s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0 0 1 1;0.4 0 0.6 1;0 0 1 1"/>${s}</g>` : s;
    const red = !WARM[outerName || c.topName], A = red ? { c: "#c9302c", d: "#8f1d1b", l: "#ef6a55" } : { c: "#7fb03a", d: "#4f7a1f", l: "#b6d86c" };
    defs += `<radialGradient id="${u}r" cx=".36" cy=".34" r=".78"><stop offset="0" stop-color="${A.l}"/><stop offset=".55" stop-color="${A.c}"/><stop offset="1" stop-color="${A.d}"/></radialGradient>`;
    const ay = 119 + my;
    front += loopG(armStroke("M33 200 L37.5 153", 19) +
      // the apple, a bite out of it on the side of the mouth
      `<path d="M62 ${ay - 14} C52 ${ay - 21} 43.5 ${ay - 12} 44 ${ay} C44.6 ${ay + 12} 53 ${ay + 18} 60 ${ay + 17} C61.4 ${ay + 16.6} 62 ${ay + 16} 63 ${ay + 16} C64 ${ay + 16} 64.6 ${ay + 16.6} 66 ${ay + 17} C73 ${ay + 18} 80.4 ${ay + 12} 81 ${ay} C81.2 ${ay - 4} 80.4 ${ay - 7.4} 78.8 ${ay - 10} Q73.4 ${ay - 8.4} 70.6 ${ay - 12.6} Q69 ${ay - 15.6} 70.4 ${ay - 17.4} C67.6 ${ay - 17.6} 64.6 ${ay - 16.2} 62 ${ay - 14} Z" fill="url(#${u}r)" stroke="${A.d}" stroke-width="1"/>
       <path d="M78.8 ${ay - 10} Q73.4 ${ay - 8.4} 70.6 ${ay - 12.6} Q69 ${ay - 15.6} 70.4 ${ay - 17.4}" stroke="#fbf0c9" stroke-width="3.4" fill="none" stroke-linecap="round"/>
       <path d="M62.4 ${ay - 13} C61.6 ${ay - 18} 62 ${ay - 21} 64.4 ${ay - 24}" stroke="#5a3a22" stroke-width="2.6" fill="none" stroke-linecap="round"/>
       <path d="M63.6 ${ay - 21} C58 ${ay - 28} 49 ${ay - 27} 46.6 ${ay - 24} C51 ${ay - 19} 58 ${ay - 18} 63.6 ${ay - 21} Z" fill="#5f9a3a" stroke="#3f6f24" stroke-width=".8"/>
       <ellipse cx="53.5" cy="${ay - 5}" rx="4" ry="6.4" fill="#fff" opacity=".28" transform="rotate(-20 53.5 ${ay - 5})"/>` +
      // the hand that holds it: fingers in front of the apple
      `<g transform="translate(37.5 ${151 + my}) rotate(-50)"><rect x="-6" y="-11.5" width="22" height="23" rx="9" fill="${skin[1]}" stroke="${skin[2]}" stroke-width="1.2"/>
         ${[-10.6, -5.2, 0.2, 5.6].map((y, i) => `<rect x="10" y="${y}" width="${[17, 20, 20, 17][i]}" height="5.6" rx="2.8" fill="${skin[0]}" stroke="${skin[2]}" stroke-width="1"/>`).join("")}
         <path d="M2 -11 q9 -6.5 15 -1.6 q-5 3 -9 4.4z" fill="${skin[1]}" stroke="${skin[2]}" stroke-width="1"/></g>`);
  }
  if (drinking && anim){
    /* the loop of PICS.action "drink": the glass comes up to the lips and tips, then comes away again and tips back; the water
       stays level (it is turned back against the glass), and the forearm follows the hand */
    const rx = 81, ry = 112.5 + my, glass = "M0 -11 L45 -8.8 Q48.4 -8.6 48.4 -6 L48.4 6 Q48.4 8.6 45 8.8 L0 11 Z", T = `translate(${rx} ${ry}) rotate(200)`;
    const K = `keyTimes="0;0.3;0.62;0.86;1" dur="2.4s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0 0 1 1;0.4 0 0.6 1;0 0 1 1"`;
    const an = (type, a, b) => `<animateTransform attributeName="transform" type="${type}" values="${a};${b};${b};${a};${a}" ${K}/>`;
    const a0 = `M31 200 L24 ${185 + my}`, a1 = `M31 200 L38.4 ${137 + my}`, arm = (col, w, op) => `<path d="${a0}" stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round"${op}><animate attributeName="d" values="${a0};${a1};${a1};${a0};${a0}" ${K}/></path>`;
    defs += `<clipPath id="${u}w"><path d="${glass}" transform="${T}"/></clipPath>`;
    front += arm(sleeve[1], 20.4, "") + arm(sleeve[0], 17, ` opacity=".85"`) + `<g transform="translate(-16 36)">${an("translate", "-16 36", "0 0")}<g transform="rotate(-36 ${rx} ${ry})">${an("rotate", `-36 ${rx} ${ry}`, `0 ${rx} ${ry}`)}
       <g transform="${T}"><rect x="21.5" y="-30" width="26.5" height="25" rx="10" fill="${skin[1]}" stroke="${skin[2]}" stroke-width="1.2"/><ellipse cx="16.5" cy="-11.8" rx="6.2" ry="4.2" fill="${skin[1]}" stroke="${skin[2]}" stroke-width="1.1"/><path d="${glass}" fill="#f6fbff" fill-opacity=".62"/></g>
       <g clip-path="url(#${u}w)"><g transform="rotate(36 ${rx} ${ry})">${an("rotate", `36 ${rx} ${ry}`, `0 ${rx} ${ry}`)}<g transform="translate(0 15)">${an("translate", "0 15", "0 0")}<rect x="-40" y="${ry - 5}" width="200" height="90" fill="#4fa9ee" fill-opacity=".9"/><path d="M-40 ${ry - 5} H160" stroke="#2f7fcc" stroke-width="1.6"/></g></g></g>
       <g transform="${T}"><path d="M42.6 -8.9 L45 -8.8 Q48.4 -8.6 48.4 -6 L48.4 6 Q48.4 8.6 45 8.8 L42.6 8.9 Z" fill="#9db9d6" fill-opacity=".8"/><path d="${glass}" fill="none" stroke="#3f6a98" stroke-width="2.3" stroke-linejoin="round"/>
         <ellipse cx="0" cy="0" rx="3.4" ry="11" fill="#ffffff" fill-opacity=".6" stroke="#4a7099" stroke-width="1.8"/><path d="M6 7.4 L19 6.8" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".95"/>
         ${[22.6, 28.6, 34.6, 40.6].map((x, i) => `<rect x="${x}" y="${[-16, -17.5, -17.5, -16][i]}" width="5.7" height="${[22.5, 25, 24.6, 22][i]}" rx="2.85" fill="${skin[0]}" stroke="${skin[2]}" stroke-width="1"/>`).join("")}</g></g></g>`;
  } else if (drinking){
    /* A glass of water being drunk, drawn from photographs and symbols of people drinking: the rim is on the lips and the
       glass is tipped up, its base out to the side and higher than the rim; the hand is wrapped round the side of the
       glass, fingers across the front; the forearm comes up from below; the water lies level and has run to the rim. */
    const rx = 81, ry = 112.5 + my, tilt = 200;            // rim centre, on the lower lip; 200 = the base points left and 20 degrees up
    const glass = "M0 -11 L45 -8.8 Q48.4 -8.6 48.4 -6 L48.4 6 Q48.4 8.6 45 8.8 L0 11 Z", T = `translate(${rx} ${ry}) rotate(${tilt})`;
    defs += `<clipPath id="${u}w"><path d="${glass}" transform="${T}"/></clipPath>`;
    front += armStroke(`M31 200 L38.4 ${137 + my}`, 18) +
      `<g transform="${T}">
         <rect x="21.5" y="-30" width="26.5" height="25" rx="10" fill="${skin[1]}" stroke="${skin[2]}" stroke-width="1.2"/>
         <ellipse cx="16.5" cy="-11.8" rx="6.2" ry="4.2" fill="${skin[1]}" stroke="${skin[2]}" stroke-width="1.1"/>
         <path d="${glass}" fill="#f6fbff" fill-opacity=".62"/></g>
       <rect x="20" y="${ry - 5}" width="70" height="40" fill="#4fa9ee" fill-opacity=".9" clip-path="url(#${u}w)"/>
       <path d="M22 ${ry - 5} H88" stroke="#2f7fcc" stroke-width="1.6" clip-path="url(#${u}w)"/>
       <g transform="${T}">
         <path d="M42.6 -8.9 L45 -8.8 Q48.4 -8.6 48.4 -6 L48.4 6 Q48.4 8.6 45 8.8 L42.6 8.9 Z" fill="#9db9d6" fill-opacity=".8"/>
         <path d="${glass}" fill="none" stroke="#3f6a98" stroke-width="2.3" stroke-linejoin="round"/>
         <ellipse cx="0" cy="0" rx="3.4" ry="11" fill="#ffffff" fill-opacity=".6" stroke="#4a7099" stroke-width="1.8"/>
         <path d="M6 7.4 L19 6.8" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".95"/>
         ${[22.6, 28.6, 34.6, 40.6].map((x, i) => `<rect x="${x}" y="${[-16, -17.5, -17.5, -16][i]}" width="5.7" height="${[22.5, 25, 24.6, 22][i]}" rx="2.85" fill="${skin[0]}" stroke="${skin[2]}" stroke-width="1"/>`).join("")}
       </g>`;
  }
  if (L.bicycle){                                          // handlebars held in both hands, under the name tag
    front += `<path d="M26 181 Q80 171 134 181" stroke="#7d828a" stroke-width="5.5" fill="none" stroke-linecap="round"/><path d="M26 180 Q80 170 134 180" stroke="#d9dde2" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <path d="M80 176 V190" stroke="#5f646b" stroke-width="7"/><circle cx="96" cy="172" r="6" fill="#e9e9e4" stroke="#8a8a84" stroke-width="1.4"/><circle cx="96" cy="172" r="1.8" fill="#8a8a84"/>
      <path d="M24 181.4 L42 178.4 M118 178.4 L136 181.4" stroke="#23252b" stroke-width="8.5" stroke-linecap="round"/>
      <ellipse cx="38" cy="178" rx="9.5" ry="8.6" fill="${skin[1]}" stroke="${skin[2]}" stroke-width="1.2"/><ellipse cx="122" cy="178" rx="9.5" ry="8.6" fill="${skin[1]}" stroke="${skin[2]}" stroke-width="1.2"/>
      <path d="M31 175 q7 2.4 14 0.4 M31 179.6 q7 2.4 14 0.4 M115 175.4 q7 2 14 -0.4 M115 180 q7 2 14 -0.4" stroke="${skin[2]}" stroke-width="1.1" fill="none"/>`;
  }
  if (sleeping) front += L.umbrella ? zed(127, 98, 8) + zed(135, 76, 11) + zed(141, 50, 14.5) : zed(113, 62, 10) + zed(122, 40, 14) + zed(131, 13, 19);

  if (spec._head) return mk(`<defs>${defs}</defs><g class="hb">${hair.back || ""}</g><g class="hd">${head}${headFront}</g>`);      // PICS.action draws its own body
  const all = behind + body + head + front;
  return mk(`<defs>${defs}${plain ? "" : `<clipPath id="${u}x"><rect x="0" y="0" width="160" height="190" rx="12"/></clipPath>`}</defs>` + (plain ? all : `<g clip-path="url(#${u}x)">${all}</g>`));
}

/* ---------- people standing in a row, to be counted: whole figures, the same heads ---------- */
const ROW = {
  man:   [{ s: "tan", h: "dkbrown", st: "sidepart", t: "green", leg: "navy" }, { s: "fair", h: "ginger", st: "crew", t: "orange", leg: "charcoal" }, { s: "dark", h: "jet", st: "curly", t: "yellow", leg: "brown" },
          { s: "light", h: "blond", st: "sidepart", t: "teal", leg: "charcoal" }, { s: "brown", h: "black", st: "crew", t: "purple", leg: "navy" }, { s: "fair", h: "brown", st: "curly", t: "lime", leg: "brown" }, { s: "tan", h: "black", st: "sidepart", t: "grey", leg: "navy" }],
  woman: [{ s: "light", h: "ltbrown", st: "long", t: "teal" }, { s: "brown", h: "jet", st: "bun", t: "yellow" }, { s: "fair", h: "blond", st: "long", t: "purple" },
          { s: "tan", h: "dkbrown", st: "pony", t: "orange" }, { s: "dark", h: "jet", st: "curlyF", t: "green" }, { s: "fair", h: "ginger", st: "wavy", t: "pink" }, { s: "light", h: "black", st: "bob", t: "lime" }]
};
const ROWKID = { boy: ["kshort", "kcrew", "kcurly", "kshort", "kcrew", "kcurly", "kshort"], girl: ["kmid", "kpig", "kbob", "kpony", "kmid", "kpig", "kbob"] };
function standing(kind, i){
  const kid = kind === "boy" || kind === "girl";
  const fem = kind === "woman" || kind === "girl", v = Object.assign({}, ROW[fem ? "woman" : "man"][i % 7], kid ? { st: ROWKID[kind][i % 7] } : {}), u = "pr" + (seq++) + "_";
  const skin = SKIN[v.s], hairC = HAIR[v.h], top = COL[v.t], c = { hair: hairC, skinName: v.s, bow: "#e8548a" }, hair = hairOf(v.st, u, c);
  const leg = COL[v.leg || "navy"], dk = v.s === "dark" || v.s === "brown";
  const defs = `<radialGradient id="${u}s" gradientUnits="userSpaceOnUse" cx="76" cy="78" r="46"><stop offset="0" stop-color="${skin[0]}"/><stop offset=".65" stop-color="${skin[1]}"/><stop offset="1" stop-color="${skin[2]}"/></radialGradient>
    <linearGradient id="${u}h" x1="0" y1="0" x2=".3" y2="1"><stop offset="0" stop-color="${hairC[0]}"/><stop offset=".55" stop-color="${hairC[1]}"/><stop offset="1" stop-color="${hairC[2]}"/></linearGradient>
    <linearGradient id="${u}t" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${top[1]}"/><stop offset=".35" stop-color="${top[0]}"/><stop offset="1" stop-color="${top[1]}"/></linearGradient>`;
  const eo = { iris: dk ? "#3b2a1e" : "#5a3a22", shade: skin[2] };
  const body = fem
    ? `<rect x="24" y="150" width="24" height="150" rx="12" fill="${top[1]}"/><rect x="112" y="150" width="24" height="150" rx="12" fill="${top[1]}"/>
       <ellipse cx="36" cy="308" rx="11" ry="13" fill="${skin[1]}"/><ellipse cx="124" cy="308" rx="11" ry="13" fill="${skin[1]}"/>
       <rect x="57" y="400" width="19" height="118" rx="8" fill="${skin[1]}"/><rect x="84" y="400" width="19" height="118" rx="8" fill="${skin[1]}"/>
       <path d="M50 512 h28 v12 q0 8-8 8 h-18 q-8 0-8-8 q0-8 6-12z M82 512 h28 q6 4 6 12 q0 8-8 8 h-18 q-8 0-8-8z" fill="#3a2f33"/>
       <path d="M44 270 H116 L138 420 H22 Z" fill="url(#${u}t)"/>
       <path d="M30 190 v-24 q0-30 30-36 h40 q30 6 30 36 v24 l-14 96 h-72z" fill="url(#${u}t)"/>
       <path d="M46 284 h68" stroke="${top[1]}" stroke-width="4" opacity=".7"/>`
    : `<rect x="18" y="150" width="27" height="156" rx="13" fill="${top[1]}"/><rect x="115" y="150" width="27" height="156" rx="13" fill="${top[1]}"/>
       <ellipse cx="31.5" cy="314" rx="12" ry="14" fill="${skin[1]}"/><ellipse cx="128.5" cy="314" rx="12" ry="14" fill="${skin[1]}"/>
       <path d="M42 290 H118 L121 518 H85 L80 350 L75 518 H39 Z" fill="${leg[1]}"/><path d="M48 300 L45 512 M112 300 L115 512" stroke="${leg[0]}" stroke-width="5" opacity=".6"/>
       <path d="M36 514 h42 v12 q0 9-9 9 h-32 q-9 0-9-9 q0-8 8-12z M82 514 h42 q8 4 8 12 q0 9-9 9 h-32 q-9 0-9-9z" fill="#2c2623"/>
       <path d="M22 190 v-22 q0-32 36-38 h44 q36 6 36 38 v22 l-18 114 h-80z" fill="url(#${u}t)"/>`;
  if (kid) return `<g><defs>${defs}</defs>${hair.back || ""}<g transform="translate(80 128) scale(.8 .6) translate(-80 -128)">${body}</g>
    <path d="M73 112 h14 v20 q-7 5-14 0z" fill="${skin[2]}"/>
    <ellipse cx="47.5" cy="93" rx="4.8" ry="7.5" fill="${skin[2]}"/><ellipse cx="112.5" cy="93" rx="4.8" ry="7.5" fill="${skin[2]}"/>
    <path d="M80 54 C101 54 113 68 113 89 C113 108 100 123 80 124 C60 123 47 108 47 89 C47 68 59 54 80 54 Z" fill="url(#${u}s)"/>${hair.front || ""}` +
    eye(u, 66, 93, Object.assign({ s: 1.2 }, eo)) + eye(u, 94, 93, Object.assign({ s: 1.2 }, eo)) +
    `<path d="M71.5 110.6 Q80 118.4 88.5 110.6 Q80 113.4 71.5 110.6 Z" fill="#c96a66"/>${hair.over || ""}</g>`;
  return `<g><defs>${defs}</defs>${hair.back || ""}${body}
    <path d="M70 110 h20 v20 q-10 8-20 0z" fill="${skin[2]}"/>
    <ellipse cx="48.5" cy="90" rx="4.2" ry="7.5" fill="${skin[2]}"/><ellipse cx="111.5" cy="90" rx="4.2" ry="7.5" fill="${skin[2]}"/>
    <path d="M80 48 C100 48 112 63 112 85 C112 106 101 122 80 125 C59 122 48 106 48 85 C48 63 60 48 80 48 Z" fill="url(#${u}s)"/>${hair.front || ""}
    <path d="M60 77 q8-4.5 16-1.5 q-8-1.6-16 3z M100 77 q-8-4.5 -16-1.5 q8-1.6 16 3z" fill="${hairC[2]}"/>` + eye(u, 67, 87, eo) + eye(u, 93, 87, eo) +
    `<path d="M78 88 Q76.4 97 75.8 101.5 Q77.4 103.6 79.6 103.2" stroke="${skin[2]}" stroke-width="1.4" fill="none" opacity=".6"/>
    <path d="M69.5 109.4 Q80 116.5 90.5 109.4 Q80 112.6 69.5 109.4 Z" fill="${fem ? "#cf5266" : "#b8645f"}"/>${hair.over || ""}</g>`;
}
function row(spec, n){
  n = Math.max(1, Math.min(7, n | 0));
  const kid = spec.is === "boy" || spec.is === "girl";
  const W = kid ? 112 : 128, top = 30, H = kid ? 345 : 508; // a figure fills x 16..144, y 30..538 of its own drawing (a child: y 30..375)
  const s = Math.min(170 / H, 150 / (n * W + (n - 1) * 8)), pitch = Math.min((W + 8) * s * 1.22, (156 - W * s) / Math.max(1, n - 1));
  const x0 = 80 - pitch * (n - 1) / 2, y0 = (190 - H * s) / 2 - top * s;
  let out = "";
  for (let i = 0; i < n; i++) out += `<g transform="translate(${r2(x0 + i * pitch - 80 * s)} ${r2(y0)}) scale(${r2(s * 1000) / 1000})">${standing(spec.is, i)}</g>`;
  return mk(out);
}
function person(spec, name){
  spec = spec || {};
  const looks = spec.looks || [], n = spec.count || 1;
  if (!spec.person && (n > 1 || looks.indexOf("in a row") >= 0)) return row(spec, n);
  const acted = ACT_OF[doingOf(spec)];
  if (acted && (spec.person === "paul" || spec.person === "julie" || spec.person === "marie" || spec.person === "you"))
    return action(acted, spec.person, { looks: spec.looks, name: name, still: !!spec.still });
  if (doingOf(spec) === "walking") return walker(spec, name);
  const high = liveTall(spec) ? null : looks.map(lookName).find(x => HEIGHT[x]);
  if (spec.card || high)                                   // about to do it: standing still with the picture card of the action; tall / short: the whole figure by a measuring post
    return action("stop", spec.person, { looks: looks.filter(x => !HEIGHT[lookName(x)]), name: name, card: spec.card, size: high, spec: spec });
  if (spec.did || doingOf(spec) === "raising" || doingOf(spec) === "stopped")      // just stopped (did: what they were doing), or a hand up: the action figure
    return action(spec.did ? "stop" : doingOf(spec), spec.person, { looks: spec.looks, name: name, still: !!spec.still, after: spec.did });
  if (spec.holding) return holder(spec, name);
  if (doingOf(spec) === "reading") return reader(spec, name);
  return bust(spec, name);
}
/* ---------- somebody reading: the head and shoulders a little smaller, eyes down, and in both hands an open book (its covers
   to the viewer, the pages showing along the top), a newspaper or a letter with its envelope; drawn from the Mulberry and
   ARASAAC symbols for "read" and photographs of readers: the thing is held up in front of the chest, fingers on the outside ---------- */
function reader(spec, name){
  const c = traits(spec), L = c.L, sk = c.skin, what = String(spec.reading || "book").toLowerCase(), k = 0.82;
  const col = L.coat ? COL[c.coat] : L.suit ? COL[c.suit] : c.top, x0 = 80 - (c.kid ? 44 : c.fem && !c.named ? 53 : 60) * k - (L.coat ? 3 : 0), B = pal(WARM[c.topName] || L["red dress"] ? COL.blue : COL.red);
  const hand = (x, y, f) => `<g transform="translate(${x} ${y}) scale(${f} 1)"><rect x="-12" y="-14" width="14" height="29" rx="7" fill="${sk[1]}" stroke="${sk[2]}" stroke-width="1.2"/>` +
    [-12.6, -6.2, 0.2, 6.6].map((y, i) => `<rect x="-6" y="${y}" width="${[17, 19, 19, 16][i]}" height="5.8" rx="2.9" fill="${sk[0]}" stroke="${sk[2]}" stroke-width="1"/>`).join("") + `</g>`;
  let s = `<path d="M${r2(x0)} 150 V190 H${r2(160 - x0)} V150Z" fill="${col[1]}"/>`;
  if (what === "newspaper") s += `<path d="M6 141 L80 150 V192 H6Z M154 141 L80 150 V192 H154Z" fill="#f6f3ea" stroke="#8a867a" stroke-width="1.6" stroke-linejoin="round"/><path d="M88 156.5 L146 149.5 V159.5 L88 166.500Z" fill="#33353b"/>
      <path d="M88 172 L146 165 M88 179 L130 174" stroke="#55585f" stroke-width="4"/><path d="M88 186 L146 179" stroke="#9a9a94" stroke-width="1.7"/><path d="M14 149 L46 153 V176 L14 172Z" fill="#a9c7de" stroke="#6d737c" stroke-width="1.1"/>
      <path d="M52 154.5 L72 157 M52 161.5 L72 164 M52 168.5 L72 171 M52 175.5 L72 178 M14 180 L72 187 M14 187 L60 192.5" stroke="#9a9a94" stroke-width="1.7" stroke-linecap="round"/>` + hand(8, 172, 1) + hand(152, 172, -1);
  else if (what === "letter") s += `<g transform="rotate(-14 30 170)"><rect x="2" y="152" width="50" height="34" rx="2" fill="#f4ecd8" stroke="#b9a87c" stroke-width="1.5"/><path d="M2 153 L27 171 L52 153" fill="none" stroke="#b9a87c" stroke-width="1.5"/><rect x="38" y="156" width="10" height="11" fill="#dc3b36" stroke="#fff" stroke-width="1.4"/></g>
      <path d="M50 140 H118 V192 H50Z" fill="#fffdf6" stroke="#8a867a" stroke-width="1.6" stroke-linejoin="round"/><path d="M50 158 H118 M50 177 H118" stroke="#e3ddcb" stroke-width="1.4"/>` +
      [148, 154, 165, 171, 184].map((y, i) => scrawl(58, y, [36, 48, 50, 42, 48][i], "#9fb0e0")).join("") + hand(48, 172, 1) + hand(120, 172, -1);
  else s += `<path d="M22 139 L80 150 L138 139 V146 L80 157 L22 146Z" fill="#fffdf6" stroke="#b9ad94" stroke-width="1.3" stroke-linejoin="round"/><path d="M24 142.5 L80 153.5 L136 142.5" stroke="#d6cbb2" stroke-width="1.1" fill="none"/>
      <path d="M19 145 L80 156.5 V192 H19Z" fill="${B.a}" stroke="${B.d}" stroke-width="1.7" stroke-linejoin="round"/><path d="M141 145 L80 156.5 V192 H141Z" fill="${B.b}" stroke="${B.d}" stroke-width="1.7" stroke-linejoin="round"/>
      <path d="M80 156.5 V192" stroke="${B.d}" stroke-width="3.4"/><path d="M92 163.5 L124 157.5 M92 171 L112 167.3" stroke="${B.h}" stroke-width="3.4" stroke-linecap="round" opacity=".8"/>` + hand(18, 174, 1) + hand(142, 174, -1);
  const g = mk(`<g class="bust" transform="translate(${r2(80 - 80 * k)} 0) scale(${k})"></g>${s}`);
  g.querySelector("g.bust").appendChild(bust(spec, name));
  return g;
}
/* ---------- somebody holding one thing up in one hand, to show it: the person smaller and to the right, the thing big at the
   left, the fingers round the foot of it (ARASAAC "hold", Mulberry "hold") ---------- */
function holder(spec, name){
  const c = traits(spec), L = c.L, sk = c.skin, k = 0.74, col = L.coat ? COL[c.coat] : L.suit ? COL[c.suit] : L["red dress"] ? [sk[1], sk[2]] : c.top, plainSpec = Object.assign({}, spec);
  delete plainSpec.holding;
  const t = oneThing(Object.assign({}, spec.holding, { count: 1 }));
  t.querySelectorAll('ellipse[fill="#000"]').forEach(e => e.remove());       // no shadow on the ground: it is in the hand
  const b = measure(t), f = Math.min(74 / b.w, 88 / b.h, 0.66), tx = 40 - (b.x + b.w / 2) * f, ty = Math.max(4, 113 - b.h * f) - b.y * f;
  let hx = 40;                                             // the hand goes under the lowest part of the thing (the bow of a key, the foot of a glass)
  try { const w = mk(""); w.appendChild(t); meter.appendChild(w); const m = meter.getBoundingClientRect(); let low = null;
    t.querySelectorAll("path,rect,circle,ellipse").forEach(e => { const r = e.getBoundingClientRect(); if (r.width > 3 && r.height > 3 && (!low || r.bottom > low.bottom + 1)) low = r; });
    meter.removeChild(w); w.removeChild(t);
    if (low) hx = Math.max(22, Math.min(58, tx + ((low.left + low.right) / 2 - m.left) * f)); } catch (e){}
  hx = r2(hx);
  const g = mk(`<g class="bust" transform="translate(46 ${r2(190 - 190 * k)}) scale(${k})"></g><path d="M74 188 Q${hx + 6} 172 ${hx} 126" stroke="${col[1]}" stroke-width="17" fill="none" stroke-linecap="round"/><path d="M74 188 Q${hx + 6} 172 ${hx} 126" stroke="${col[0]}" stroke-width="13.6" fill="none" stroke-linecap="round" opacity=".85"/>
    <g class="held" transform="translate(${r2(tx)} ${r2(ty)}) scale(${r2(f * 1000) / 1000})"></g><g transform="translate(${hx} 121)"><rect x="-13" y="-7" width="26" height="22" rx="9" fill="${sk[1]}" stroke="${sk[2]}" stroke-width="1.2"/>` +
    [-12.4, -6.2, 0, 6.2].map((x, i) => `<rect x="${x}" y="${[-21, -24, -24, -20][i]}" width="6" height="${[21, 24, 24, 20][i]}" rx="3" fill="${sk[0]}" stroke="${sk[2]}" stroke-width="1"/>`).join("") +
    `<rect x="-21" y="-9" width="9" height="19" rx="4.5" fill="${sk[0]}" stroke="${sk[2]}" stroke-width="1" transform="rotate(-24 -16 0)"/></g>`);
  g.querySelector("g.bust").appendChild(bust(plainSpec, name));
  g.querySelector("g.held").appendChild(t);
  return g;
}

/* ---------- keys ---------- */
const METAL = { gold: { c: "#d9b23c", d: "#9c7818", l: "#fbe89a" }, silver: { c: "#b4b9c0", d: "#6e737a", l: "#f2f4f7" }, oldgold: { c: "#c79c34", d: "#7c5c14", l: "#ecd27c" },
  red: { c: "#d63a32", d: "#8f1f1a", l: "#f58a7c" }, black: { c: "#34353b", d: "#131317", l: "#74757f" }, blue: { c: "#2f5d8c", d: "#1f3f60", l: "#6a9bd0" }, green: { c: "#3f8a4c", d: "#285436", l: "#86c46c" },
  yellow: { c: "#f2cf3a", d: "#a88a14", l: "#fdf0a0" }, white: { c: "#f6f5f0", d: "#77756c", l: "#ffffff" } };
function oneKey(spec){
  const L = spec.looks || [], has = x => L.indexOf(x) >= 0, u = "pkey" + (seq++) + "_";
  const colName = ["gold", "silver", "red", "black", "blue", "green", "yellow", "white"].find(has) || "silver";
  const old = has("old"), ring = has("on a ring"), plastic = has("plastic") || ((colName === "red" || colName === "black") && !has("plain"));
  const M = METAL[old && colName === "gold" ? "oldgold" : colName];
  const size = has("big") ? 1.12 : has("small") ? 0.62 : old ? 1 : ring ? 0.84 : 0.94;
  const rot = old ? -38 : ring ? 62 : has("big") ? 38 : has("small") ? -24 : plastic ? -52 : -40;
  const grad = `<linearGradient id="${u}m" gradientUnits="userSpaceOnUse" x1="0" y1="-26" x2="0" y2="26"><stop offset="0" stop-color="${M.l}"/><stop offset=".45" stop-color="${M.c}"/><stop offset="1" stop-color="${M.d}"/></linearGradient>
    <linearGradient id="${u}n" gradientUnits="userSpaceOnUse" x1="0" y1="-10" x2="0" y2="10"><stop offset="0" stop-color="${M.l}"/><stop offset=".5" stop-color="${M.c}"/><stop offset="1" stop-color="${M.d}"/></linearGradient>
    <linearGradient id="${u}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f5f7"/><stop offset=".5" stop-color="#a9adb3"/><stop offset="1" stop-color="#70747b"/></linearGradient>`;
  let k, cx;                                               // the key lies along x, its bow at the left; cx is its middle
  if (old){                                                // an old key: ring bow, collars, a long round stem, a bit with wards
    cx = 46;
    k = `<path d="M22 -4.6 H118 q5 0 5 4.6 q0 4.6 -5 4.6 H22z" fill="url(#${u}n)" stroke="${M.d}" stroke-width="1.2"/>
      <path d="M90 3 V28 H98 V19 H103 V28 H112 V15 H116 V3 Z" fill="url(#${u}m)" stroke="${M.d}" stroke-width="1.2" stroke-linejoin="round"/>
      <rect x="24" y="-8.5" width="7" height="17" rx="2.4" fill="url(#${u}n)" stroke="${M.d}" stroke-width="1.2"/><rect x="35" y="-7" width="4.5" height="14" rx="2" fill="url(#${u}n)" stroke="${M.d}" stroke-width="1.2"/>
      <path fill-rule="evenodd" d="M0 -26 a26 26 0 1 0 0.01 0z M0 -13.5 a13.5 13.5 0 1 1 -0.01 0z" fill="url(#${u}m)" stroke="${M.d}" stroke-width="1.3"/>
      <path d="M-18 -10 a21 21 0 0 1 22 -10.6" stroke="#fff" stroke-width="2.4" fill="none" opacity=".45" stroke-linecap="round"/>
      <g fill="#5c4210" opacity=".35"><ellipse cx="60" cy="2" rx="9" ry="2"/><ellipse cx="-14" cy="14" rx="6" ry="3"/><ellipse cx="103" cy="12" rx="5" ry="2.6"/><ellipse cx="84" cy="-2" rx="6" ry="1.6"/></g>`;
  } else {
    cx = 42;
    const blade = `<path d="M26 -8.5 H99 L111 -1 L104 5.5 L98 9.5 L92 3.5 L86 9.5 L80 5.5 L74 9.5 L68 2.5 L62 8.5 L56 4.5 L50 9.5 L44 4.5 L38 8.5 L26 8.5 Z" fill="url(#${u}n)" stroke="${M.d}" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M32 -2.6 H98" stroke="${M.d}" stroke-width="1.6" opacity=".55" stroke-linecap="round"/><path d="M30 -6 H96" stroke="#fff" stroke-width="1.4" opacity=".5" stroke-linecap="round"/>`;
    const bow = plastic
      ? `<path fill-rule="evenodd" d="M-18 -24 H14 Q30 -24 30 -10 V10 Q30 24 14 24 H-18 Q-30 24 -30 8 V-8 Q-30 -24 -18 -24 Z M-21 -8 h10 q4 0 4 4 v8 q0 4 -4 4 h-10 q-4 0 -4 -4 v-8 q0 -4 4 -4z" fill="url(#${u}m)" stroke="${M.d}" stroke-width="1.3"/>
         <path d="M-16 -18 H12 Q22 -18 24 -11" stroke="#fff" stroke-width="3" fill="none" opacity=".4" stroke-linecap="round"/>`
      : `<path fill-rule="evenodd" d="M-2 -26 Q16 -26 26 -13 L32 -8.5 V8.5 L26 13 Q16 26 -2 26 Q-28 26 -28 0 Q-28 -26 -2 -26 Z M-10 -7.5 a7.5 7.5 0 1 0 0.01 0z" fill="url(#${u}m)" stroke="${M.d}" stroke-width="1.3" stroke-linejoin="round"/>
         <path d="M-20 -12 Q-12 -21 2 -21" stroke="#fff" stroke-width="2.6" fill="none" opacity=".5" stroke-linecap="round"/>`;
    const hx = plastic ? -16 : -10;
    k = (ring ? `<circle cx="${hx - 19}" cy="-9" r="24" fill="none" stroke="#5f646b" stroke-width="5.2"/><circle cx="${hx - 19}" cy="-9" r="24" fill="none" stroke="url(#${u}g)" stroke-width="3"/>` : "") + blade + bow +
      (ring ? `<path d="M${hx - 3.4} -5.6 A24 24 0 0 0 ${hx - 7.5} -30.5" fill="none" stroke="#5f646b" stroke-width="5.2"/><path d="M${hx - 3.4} -5.6 A24 24 0 0 0 ${hx - 7.5} -30.5" fill="none" stroke="#dfe2e6" stroke-width="3"/>` : "");
  }
  const tx = ring ? 88 : 80, ty = ring ? 108 : 98;
  const ra = Math.abs(rot) * Math.PI / 180, hx = size * (70 * Math.cos(ra) + 26 * Math.sin(ra)), hy = size * (70 * Math.sin(ra) + 26 * Math.cos(ra));
  return mk(`<defs>${grad}</defs><ellipse cx="${tx + 2}" cy="${r2(Math.min(181, ty + hy + 5))}" rx="${r2(hx * 0.8)}" ry="${r2(Math.max(4, hx * 0.13))}" fill="#000" opacity=".12"/>
    <g transform="translate(${tx} ${ty}) rotate(${rot}) scale(${size}) translate(${-cx} 0)">${k}</g>`);
}
function key(spec){
  spec = spec || {};
  const n = spec.count || 1;
  return n > 1 ? group(n, () => oneKey(spec)) : oneKey(spec);
}

/* ---------- several of a thing, laid out to be counted ---------- */
let meter = null;
function measure(el){                                      // the drawn extent of a picture, in the 160 x 190 box
  try {
    if (!meter || !meter.isConnected){
      meter = document.createElementNS(NS, "svg");
      meter.setAttribute("width", "160"); meter.setAttribute("height", "190"); meter.setAttribute("aria-hidden", "true");
      meter.style.cssText = "position:absolute;left:-9999px;top:-9999px;visibility:hidden;pointer-events:none";
      (document.body || document.documentElement).appendChild(meter);
    }
    const wrap = document.createElementNS(NS, "g"); wrap.appendChild(el); meter.appendChild(wrap);
    const b = wrap.getBBox(); meter.removeChild(wrap); wrap.removeChild(el);
    if (b && b.width > 4 && b.height > 4){
      const x0 = Math.max(0, b.x), y0 = Math.max(0, b.y), x1 = Math.min(160, b.x + b.width), y1 = Math.min(190, b.y + b.height);
      if (x1 - x0 > 4 && y1 - y0 > 4) return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
    }
  } catch (e){}
  return { x: 22, y: 36, w: 116, h: 128 };
}
function group(n, drawOne){
  n = Math.max(1, n | 0);
  const g = document.createElementNS(NS, "g"), first = drawOne(), b = measure(first);
  const W = 150, H = 178, gap = 5;                         // the part of the box that is used, and the least space between things
  let best = null;
  for (let cols = 1; cols <= n; cols++){
    const rows = Math.ceil(n / cols);
    const s = Math.min((W - gap * (cols - 1)) / (cols * b.w), (H - gap * (rows - 1)) / (rows * b.h));
    if (!best || s > best.s * 1.04) best = { s, cols, rows };
  }
  const s = Math.min(best.s, n <= 4 ? 0.6 : 0.52), rows = best.rows, cols = best.cols;
  // how many in each row: as even as it goes, the fuller rows first (5 in two columns: 2, 1, 2)
  let per = [];
  if (n === 5 && cols === 2) per = [2, 1, 2];
  else if (n === 7 && cols === 3) per = [2, 3, 2];
  else if (n === 3 && cols === 2) per = [1, 2];
  else { let left = n; for (let r = 0; r < rows; r++){ const k = Math.ceil(left / (rows - r)); per.push(k); left -= k; } }
  const cw = Math.min((W + gap) / cols, b.w * s * 1.3 + gap), ch = Math.min((H + gap) / rows, b.h * s * 1.3 + gap);
  const y0 = 95 - ch * (rows - 1) / 2;
  let i = 0;
  per.forEach((k, r) => {
    const x0 = 80 - cw * (k - 1) / 2;
    for (let j = 0; j < k; j++, i++){
      const c = document.createElementNS(NS, "g"), px = x0 + j * cw, py = y0 + r * ch;
      c.setAttribute("transform", `translate(${r2(px - (b.x + b.w / 2) * s)} ${r2(py - (b.y + b.h / 2) * s)}) scale(${r2(s * 1000) / 1000})`);
      c.appendChild(i === 0 ? first : drawOne()); g.appendChild(c);
    }
  });
  return g;
}

/* ---------- fingers: 5 on one hand, 6 and 7 on two ---------- */
function hand(n, fold){                                          // fingerCard's hand, the fingers a little apart so each can be counted; n = 5 puts the thumb out too
  const X = [60.5, 75, 89.5, 104], A = [-7, -2.5, 2.5, 7];
  const fing = X.map((x, k) => { const up = k < n, h = up ? 62 : 22, y = up ? 44 : 84;
    return `<rect x="${x - 6}" y="${y}" width="12" height="${h}" rx="6" fill="#e9b893" stroke="#c48e6a" stroke-width="1"${up ? ` transform="rotate(${A[k]} ${x} 106)"` : ""}/>`; }).join("");
  const thumb = n >= 5
    ? `<rect x="-7" y="-46" width="14" height="52" rx="7" fill="#e9b893" stroke="#c48e6a" stroke-width="1" transform="translate(58 126) rotate(-58)"/>`
    : "";
  return thumb + `<path d="M52 98 Q50 150 70 166 L104 166 Q118 150 116 100 Z" fill="#edc29f" stroke="#c48e6a" stroke-width="1"/>${fing}` +
    (n >= 5 ? "" : fold ? `<path d="M53 124 Q52 110 64 109 L88 113 Q95 115 94 121 Q93 127 86 127 L66 131 Q55 133 53 124 Z" fill="#e9b893" stroke="#c48e6a" stroke-width="1"/>`
      : `<path d="M52 112 Q38 104 36 92 Q38 84 46 90 Q52 100 58 104" fill="#e9b893" stroke="#c48e6a" stroke-width="1"/>`) +
    `<rect x="58" y="160" width="52" height="24" rx="6" fill="#36536b"/>`;
}
function fingers(n){
  n = Math.max(0, Math.min(10, n | 0));
  if (n <= 5) return mk(`<g transform="translate(${n === 5 ? 9 : 0} 0)">${hand(n)}</g>`);
  const s = n === 10 ? 0.7 : 0.76, y = r2((190 - 140 * s) / 2 - 44 * s);
  // two hands as the learner sees their own: the left one with all five up, then the right one with the rest
  return mk(`<g transform="translate(${r2(4 - 12 * s)} ${y}) scale(${s})">${hand(5)}</g><g transform="translate(${r2(n === 10 ? 156 + 12 * s : 152 + 50 * s)} ${y}) scale(${-s} ${s})">${hand(n - 5, true)}</g>`);
}


/* ---------- somebody walking: the same head and shoulders, small, on a whole body in mid-stride ---------- */
function walker(spec, name){                               // anybody in mid-stride: the whole figure of PICS.action, frozen
  return action("walk", spec.person, { still: true, spec: spec, looks: spec.looks, name: name });
}

/* ---------- a dog, seen from the side: standing, running, sitting, lying down; sleeping; eating ---------- */
const DOG = { grey: { c: "#a0a6ae", d: "#6c727a", l: "#cdd2d8" }, golden: { c: "#e3ad4e", d: "#b17c24", l: "#f6d68c" }, brown: { c: "#8f5d38", d: "#5a3820", l: "#b98558" },
  black: { c: "#3c3c43", d: "#151518", l: "#63636e" }, white: { c: "#f6f3ea", d: "#8a8473", l: "#ffffff" }, spotted: { c: "#f6f3ea", d: "#8a8473", l: "#ffffff" } };
function oneDog(spec){
  const L = (spec.looks || []).map(x => String(x).toLowerCase()), has = x => L.indexOf(x) >= 0, act = doingOf(spec);
  const name = ["grey", "golden", "brown", "black", "white", "spotted"].find(has) || "brown", C = DOG[name], spotted = name === "spotted", dark = name === "black";
  const pose = act === "sleeping" ? "sleep" : act === "eating" ? "eat" : has("running") ? "run" : has("sitting") ? "sit" : has("lying down") ? "lie" : "stand";
  const puppy = has("puppy"), size = has("big") ? 1.1 : has("small") ? 0.72 : puppy ? 0.8 : 0.96, hr = puppy ? 24 : 21;
  const st = `stroke="${C.d}" stroke-width="${name === "white" || spotted ? 2.2 : 1.6}"`, ear = spotted ? "#2e2e33" : name === "white" ? "#d9d2bf" : C.d;
  const head = (hx, hy, closed, down) => `<g${down ? ` transform="rotate(${down} ${hx} ${hy})"` : ""}>
      <circle cx="${hx}" cy="${hy}" r="${hr}" fill="${C.c}" ${st}/>` + (spotted ? `<ellipse cx="${hx + 3}" cy="${hy - 6}" rx="9.5" ry="9" fill="#2e2e33"/>` : "") +
     `<ellipse cx="${hx + hr - 3}" cy="${hy + 8}" rx="13.5" ry="10" fill="${dark ? C.l : C.l}" ${st}/>
      <ellipse cx="${hx + hr + 8}" cy="${hy + 3}" rx="4.8" ry="4" fill="#1b1b1e"/>
      <path d="M${hx + hr - 4} ${hy + 14} q7 3.4 12 -2" stroke="${C.d}" stroke-width="1.6" fill="none" stroke-linecap="round"/>` +
     (closed ? `<path d="M${hx - 1} ${hy - 4} q4.5 4 9 0" stroke="${dark || spotted ? "#f2f2f2" : "#1b1b1e"}" stroke-width="2" fill="none" stroke-linecap="round"/>`
             : `<circle cx="${hx + 4}" cy="${hy - 5}" r="${dark || spotted ? 4.8 : 0}" fill="#fff"/><circle cx="${hx + 4}" cy="${hy - 5}" r="3.3" fill="#17171a"/><circle cx="${hx + 5.2}" cy="${hy - 6.2}" r="1.1" fill="#fff"/>`) +
     `<path d="M${hx - 11} ${hy - 17} Q${hx - 23} ${hy - 12} ${hx - 22} ${hy + 14} Q${hx - 13} ${hy + 22} ${hx - 6} ${hy + 8} Q${hx - 4} ${hy - 8} ${hx - 11} ${hy - 17}Z" fill="${ear}" stroke="${C.d}" stroke-width="1.2"/></g>`;
  const leg = (x, y0, y1, far) => `<rect x="${x - 6}" y="${y0}" width="12" height="${y1 - y0}" rx="6" fill="${far ? C.d : C.c}" ${st}/>`;
  const swing = (d, far) => `<path d="${d}" stroke="${C.d}" stroke-width="13.5" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${far ? C.d : C.c}" stroke-width="10.5" fill="none" stroke-linecap="round"/>`;
  const tail = d => `<path d="${d}" stroke="${C.d}" stroke-width="10" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${C.c}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  const collar = (x0, y0, x1, y1) => `<path d="M${x0} ${y0} L${x1} ${y1}" stroke="${name === "brown" || name === "golden" ? "#3a78bd" : "#d63a32"}" stroke-width="6" stroke-linecap="round"/><circle cx="${x1 + 1}" cy="${y1 + 4}" r="3.2" fill="#f2cf5a" stroke="#b8922c" stroke-width=".8"/>`;
  const spots = a => spotted ? a.map(p => `<ellipse cx="${p[0]}" cy="${p[1]}" rx="${p[2]}" ry="${p[3]}" fill="#2e2e33"/>`).join("") : "";
  let d, mid = [89, 110], extra = "";
  if (pose === "stand" || pose === "eat"){
    const eat = pose === "eat";
    d = `<ellipse cx="86" cy="164" rx="52" ry="5" fill="#000" opacity=".12"/>` + tail("M44 106 Q28 100 25 80") + leg(58, 118, 162, 1) + leg(102, 118, 162, 1) +
      `<ellipse cx="80" cy="112" rx="42" ry="22" fill="${C.c}" ${st}/>` + spots([[66, 104, 10, 7], [92, 118, 8, 6], [50, 116, 6, 5]]) + leg(46, 120, 162) + leg(114, 120, 162) +
      (eat ? `<path d="M104 100 L132 104 L136 128 L112 128 Z" fill="${C.c}"/>` + collar(110, 100, 116, 122) +
             `<path d="M122 150 h42 l-5 14 h-32z" fill="#3a78bd" stroke="#255a94" stroke-width="1.4"/><ellipse cx="143" cy="150" rx="19" ry="4.4" fill="#7a4a26"/>` + head(134, 124, false, 38)
           : `<path d="M102 104 L112 70 L138 92 L120 120 Z" fill="${C.c}"/>` + collar(107, 94, 123, 106) + head(126, 78));
    if (eat) mid = [93, 112];
  } else if (pose === "run"){
    d = `<ellipse cx="86" cy="166" rx="44" ry="4.4" fill="#000" opacity=".1"/><path d="M13 98 h13 M9 112 h15 M15 126 h11" stroke="#b9bec6" stroke-width="3" stroke-linecap="round"/>` +
      tail("M44 104 Q30 92 22 96") + swing("M60 118 Q46 132 34 148", 1) + swing("M104 116 Q120 128 128 144", 1) +
      `<ellipse cx="80" cy="110" rx="42" ry="20" fill="${C.c}" ${st} transform="rotate(-5 80 110)"/>` + swing("M54 116 Q34 122 20 136") + swing("M110 114 Q130 116 146 130") +
      `<path d="M102 100 L116 70 L138 92 L120 116 Z" fill="${C.c}"/>` + collar(108, 92, 124, 104) + head(128, 78);
  } else if (pose === "sit"){
    d = `<ellipse cx="84" cy="166" rx="46" ry="5" fill="#000" opacity=".12"/>` + tail("M46 158 Q28 160 22 146") + leg(104, 110, 163, 1) +
      `<ellipse cx="64" cy="138" rx="27" ry="25" fill="${C.c}" ${st}/><ellipse cx="84" cy="116" rx="23" ry="37" fill="${C.c}" ${st} transform="rotate(20 84 116)"/><ellipse cx="66" cy="140" rx="24" ry="21" fill="${C.c}"/>` +
      `<ellipse cx="76" cy="160" rx="17" ry="6.4" fill="${C.c}" ${st}/>` + leg(96, 112, 164) + collar(92, 86, 110, 94) + head(108, 66);
    mid = [84, 105];
  } else {                                                 // lying down, awake or asleep
    const sleep = pose === "sleep";
    d = `<ellipse cx="84" cy="165" rx="56" ry="5" fill="#000" opacity=".12"/>` + tail("M30 148 Q12 150 10 136") +
      `<ellipse cx="46" cy="138" rx="24" ry="21" fill="${C.c}" ${st}/><ellipse cx="76" cy="142" rx="46" ry="18" fill="${C.c}" ${st}/><ellipse cx="50" cy="140" rx="21" ry="17" fill="${C.c}"/>` +
      spots([[62, 134, 10, 6.5], [90, 146, 8, 5.5], [40, 132, 7, 6]]) + `<ellipse cx="54" cy="159" rx="15" ry="5.6" fill="${C.c}" ${st}/>` +
      `<rect x="98" y="144" width="50" height="11" rx="5.5" fill="${C.d}" ${st}/><rect x="102" y="150" width="50" height="11.5" rx="5.7" fill="${C.c}" ${st}/>` +
      (sleep ? head(122, 136, true, 12) : collar(100, 126, 112, 138) + head(120, 112));
    if (sleep) extra = zed(112, 74, 9) + zed(121, 53, 12.5) + zed(131, 27, 17);
    mid = [84, 130];
  }
  return mk(`<g transform="translate(80 ${pose === "lie" || pose === "sleep" ? 128 : 108}) scale(${size}) translate(${-mid[0]} ${-mid[1]})">${d}</g>${extra}`);
}
function dog(spec){
  spec = spec || {};
  const n = spec.count || 1;
  return n > 1 ? group(n, () => oneDog(spec)) : oneDog(spec);
}

/* ---------- a car, seen from the side ---------- */
function oneCar(spec){
  const L = (spec.looks || []).map(x => String(x).toLowerCase()), has = x => L.indexOf(x) >= 0, u = "pcar" + (seq++) + "_";
  const M = METAL[["red", "black", "green", "blue", "yellow", "white"].find(has) || "red"], old = has("old"), sports = has("sports"), small = has("small");
  const wheel = x => `<circle cx="${x}" cy="140" r="15.5" fill="#26272c"/><circle cx="${x}" cy="140" r="7.4" fill="#d5d8dc" stroke="#8b8f96" stroke-width="1.4"/>` + (old ? `<path d="M${x - 7} 140 h14 M${x} 133 v14" stroke="#8b8f96" stroke-width="1.4"/>` : "");
  const body = old
    ? `<path d="M22 138 V112 Q22 108 26 108 H50 V74 Q50 68 56 68 H106 Q112 68 113 74 L118 104 H142 Q150 104 150 112 V138 Z" fill="url(#${u}m)" stroke="${M.d}" stroke-width="1.6" stroke-linejoin="round"/>
       <path d="M58 76 H80 V102 H58Z M86 76 H104 L108 102 H86Z" fill="#cfe6f5" stroke="${M.d}" stroke-width="1.2"/><circle cx="150" cy="112" r="6" fill="#f6e08a" stroke="#8b8f96" stroke-width="1.4"/>
       <path d="M24 126 Q46 108 68 126 M96 126 Q118 108 140 126" stroke="${M.d}" stroke-width="5" fill="none"/><path d="M62 138 H102" stroke="${M.d}" stroke-width="4"/>`
    : `<path d="M12 128 Q12 110 30 108 L48 106 Q60 82 78 80 H104 Q118 82 128 104 L142 108 Q150 110 150 124 V134 Q150 139 146 139 H16 Q12 139 12 134 Z" fill="url(#${u}m)" stroke="${M.d}" stroke-width="1.6" stroke-linejoin="round"/>
       <path d="M55 105 Q64 88 78 86 H88 V105Z M94 86 H103 Q112 88 121 105 H94Z" fill="#cfe6f5" stroke="${M.d}" stroke-width="1.2"/>
       <path d="M91 108 V134 M30 116 H140" stroke="${M.d}" stroke-width="1.3" opacity=".55" fill="none"/><rect x="143" y="113" width="7" height="8" rx="2" fill="#f6e08a"/><rect x="12" y="114" width="5" height="8" rx="2" fill="#d63a32"/>
       <path d="M24 112 Q60 104 90 110" stroke="#fff" stroke-width="2.4" fill="none" opacity=".35" stroke-linecap="round"/>` + (sports ? `<path d="M12 106 h22 v5 h-6 v6 h-5 v-6 h-11z" fill="${M.d}"/>` : "");
  const sx = small ? 0.76 : sports ? 1 : old ? 0.94 : 0.98, sy = small ? 0.8 : sports ? 0.74 : old ? 1.06 : 0.98;
  return mk(`<defs><linearGradient id="${u}m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${M.l}"/><stop offset=".4" stop-color="${M.c}"/><stop offset="1" stop-color="${M.d}"/></linearGradient></defs>
    <ellipse cx="80" cy="${r2(110 + 47 * sy)}" rx="${r2(72 * sx)}" ry="5" fill="#000" opacity=".12"/>
    <g transform="translate(80 110) scale(${sx} ${sy}) translate(-81 -110)">${body}</g>
    <g transform="translate(80 110) scale(${sx}) translate(-81 ${r2(-110 + (sy - sx) * 30 / sx)})">${wheel(old ? 46 : 46)}${wheel(old ? 118 : 118)}</g>`);
}
function car(spec){
  spec = spec || {};
  const n = spec.count || 1;
  return n > 1 ? group(n, () => oneCar(spec)) : oneCar(spec);
}


/* ---------- actions that the learner does, the teacher shows and Pierre and Sylvie are pictured doing ----------
   PICS.action(act, who, opts): act "dance" | "jump" | "smile" | "stand up" | "sit down" | "walk" | "raise hand" | "stop" | "eat" | "drink";
   who "you" | "marie" | "paul" | "julie"; opts.still = true gives one frozen frame ("smile", "eat" and "drink" are the head and shoulders). The figure is the usual head and shoulders, half size, on a jointed body; the joints
   are turned by SMIL <animateTransform> (no script timers), so the picture loops by itself wherever it is put.
   The poses were drawn from the Mulberry symbols (dance, jump, sit, stand, walk, get out of chair, smile) and from photographs
   of people jumping and walking (Stanford 40 Actions): a jump is knees tucked, arms flung up and the ground left behind; a dance is
   one arm up, the other out, one leg kicked to the side, the body swaying; a walk is a scissor stride with the arms low. */
const ACT_OF = { dancing: "dance", dance: "dance", jumping: "jump", jump: "jump", smiling: "smile", smile: "smile", standing: "stand up", stand: "stand up",
  sitting: "sit down", sit: "sit down", walking: "walk", walk: "walk" };
const ACT2 = { raise: "raise hand", raising: "raise hand", raises: "raise hand", stop: "stop", stopped: "stop", stopping: "stop", eat: "eat", eating: "eat", drink: "drink", drinking: "drink" };
const WHO_NAME = { paul: "Pierre", julie: "Sylvie", marie: "Marie" };
const POSE0 = { rx: 0, ry: 0, bx: 0, by: 0, br: 0, aL: [0, 0], aR: [0, 0], lL: [0, 0], lR: [0, 0], sh: 1 };
const SEATED = { rx: 2, ry: 26, lL: [-90, 90], lR: [-90, 90], aL: [-4, -70], aR: [-8, -75] },
      RISING = { rx: 13, ry: 9, br: 14, lL: [-48, 58], lR: [-48, 58], aL: [-26, -30], aR: [-34, -28] },
      UPRIGHT = { rx: 28, ry: 0, lL: [0, 0], lR: [0, 0], aL: [3, 0], aR: [-3, 0] };
const D_A = { rx: -6, br: -11, aL: [158, -22], aR: [-108, -42], lL: [10, 0], lR: [-56, 34] }, D_M = { ry: 1, aL: [100, -70], aR: [-100, 70], lL: [12, -22], lR: [-12, 22] },
      D_B = { rx: 6, br: 11, aR: [-158, 22], aL: [108, 42], lR: [-10, 0], lL: [56, -34] };
const J_C = { ry: 5.3, lL: [28, -52], lR: [-28, 52], aL: [18, 10], aR: [-18, -10] }, J_UP = { ry: -22, lL: [42, -86], lR: [-42, 86], aL: [152, -12], aR: [-152, 12], sh: 0.5 };
const A_DOWN = { aL: [3, 0], aR: [-3, 0] }, A_UP = { aL: [3, 0], aR: [-168, -8] }, A_CARD = { aL: [3, 0], aR: [-38, -95] };
/* The build of a whole figure (half-widths, about the middle line x = 80; drawn after ARASAAC's man and woman and photographs): the head is
   kept large so that the face can be known on a phone, but the body is a person's: shoulders about one and a half head-widths, a chest that
   narrows to the waist, hips, arms a third as thick as the chest with the hands at the top of the thighs, legs longer than the trunk. The
   head, hair, face and name tag come from the portrait (bust, _head); its shoulders do not. sh: shoulder joint; aw, lw: arm and leg
   thickness; wa, hip: waist and hem; hx: hip joint; hs: size of the head; k: size of the whole (a child is smaller, with a bigger head). */
const BUILD = { man: { sh: 15.5, aw: 8.2, wa: 11.4, hip: 13.2, hx: 6.6, lw: 11.6, hs: 0.42, k: 1 }, woman: { sh: 13.2, aw: 6.8, wa: 8.8, hip: 12.4, hx: 6.2, lw: 10.6, hs: 0.42, k: 1 },
  kid: { sh: 11.6, aw: 6.4, wa: 9.2, hip: 10.8, hx: 5.4, lw: 9.2, hs: 0.5, k: 0.86 } };
const MOVES = {
  dance: { dur: 1.2, kt: [0, 0.25, 0.5, 0.75, 1], poses: [D_A, D_M, D_B, D_M, D_A], still: 0, scale: 1.1 },
  jump: { dur: 1.2, kt: [0, 0.2, 0.44, 0.58, 0.82, 1], poses: [J_C, { ry: -3, lL: [4, 0], lR: [-4, 0], aL: [100, 10], aR: [-100, -10] }, J_UP,
      Object.assign({}, J_UP, { ry: -20 }), { ry: 0, lL: [6, 0], lR: [-6, 0], aL: [70, 10], aR: [-70, -10] }, J_C], still: 2, scale: 1.04 },
  walk: { dur: 1.1, kt: [0, 0.25, 0.5, 0.75, 1], linear: true, side: true, scale: 1.1, still: 0, poses: [
      { ry: 4, lR: [-24, 2], lL: [24, 26], aL: [26, -4], aR: [-28, -18] }, { lR: [0, 0], lL: [-14, 60], aL: [10, -6], aR: [-10, -10] },
      { ry: 4, lL: [-24, 2], lR: [24, 26], aL: [-5, -12], aR: [6, -4] }, { lL: [0, 0], lR: [-14, 60], aL: [10, -6], aR: [-10, -10] },
      { ry: 4, lR: [-24, 2], lL: [24, 26], aL: [26, -4], aR: [-28, -18] }] },
  /* a hand put up: the arm goes straight up beside the head, the open hand above it, and stays there a moment (ARASAAC "raise hand", photographs of pupils) */
  "raise hand": { dur: 2.6, kt: [0, 0.12, 0.36, 1], poses: [A_DOWN, A_DOWN, A_UP, A_UP], still: 2, scale: 1.1, open: "aR", fade: true },
  stop: { dur: 1, kt: [0, 1], poses: [A_DOWN, A_DOWN], still: 0, scale: 1.1 },       // standing still, arms down: what is shown when an action has stopped
  /* one movement only, played once: the end pose is held, the figure fades out and comes back already in the starting pose (a loop that
     ran back to the start would show the opposite action as well). The chair stays. The raised hand does the same instead of coming down. */
  "stand up": { dur: 2.6, kt: [0, 0.12, 0.34, 0.54, 1], poses: [SEATED, SEATED, RISING, UPRIGHT, UPRIGHT], side: true, chair: true, still: 2, scale: 1.08, ox: -12, fade: true },
  "sit down": { dur: 2.6, kt: [0, 0.12, 0.34, 0.54, 1], poses: [UPRIGHT, UPRIGHT, RISING, SEATED, SEATED], side: true, chair: true, still: 2, scale: 1.08, ox: -12, fade: true }
};
function action(act, who, opts){
  opts = opts || {};
  const word = x => String(x || "").toLowerCase().trim().split(/[ ,]/)[0];
  act = ACT_OF[word(act)] || ACT2[word(act)] || "smile";
  who = who === "marie" || who === "paul" || who === "julie" ? who : "you";
  const still = !!opts.still, spec = opts.spec && !opts.spec.person && opts.spec.is ? { is: opts.spec.is } : { person: who }, name = who === "you" ? "" : (opts.name || WHO_NAME[who]);
  if (opts.looks && opts.looks.length) spec.looks = opts.looks;
  if (act === "smile"){ spec._smile = still ? "still" : "anim"; return bust(spec, name); }
  if (act === "eat" || act === "drink"){ spec.doing = act === "eat" ? "eating" : "drinking"; spec._act = still ? "still" : "anim"; return bust(spec, name); }
  const after = MOVES[ACT_OF[word(opts.after)]];           // "stop" after an action: the same size of figure as that action had
  const c = traits(spec), L = c.L, K = opts.card ? Object.assign({}, MOVES.stop, { poses: [A_CARD, A_CARD], scale: 0.8, ox: -36 }) : opts.size ? Object.assign({}, MOVES.stop, { scale: opts.size === "short" ? 0.8 : 1.22, ox: 12 })
    : act === "stop" && after ? Object.assign({}, MOVES.stop, { scale: after.scale }) : MOVES[act], u = "pa" + (seq++) + "_", skin = c.skin;
  const outerName = L.coat ? c.coat : L.suit ? c.suit : null, sleeve = outerName ? COL[outerName] : c.top, dress = !!L["red dress"], bare = [skin[1], skin[2]];
  const legs = L.suit ? COL[c.suit] : spec.is ? [COL.navy, COL.charcoal, COL.brown][hashStr(c.kind + c.topName + c.style) % 3] : who === "paul" ? COL.navy : who === "julie" ? COL.charcoal : who === "marie" ? ["#77614f", "#5a4738"] : ["#5a6272", "#3f4654"];
  const P = K.poses.map(p => Object.assign({}, POSE0, p, L.umbrella ? { aR: [-20, -125] } : null)), n = P.length, si = K.still;
  const SY = 97, UA = 21, FA = 20, HY = 126, TH = 26, SH = 26;                   // the skeleton: shoulders, elbows, hips, knees (the same for everybody: the poses turn these joints)
  const W = BUILD[c.kid ? "kid" : c.fem ? "woman" : "man"], q = K.side ? 0.86 : 1, AW = W.aw, LW = W.lw, sh = r2(W.sh * q), ch = r2(sh - AW / 2 + 1.5), wa = r2(W.wa * q), hip = r2(W.hip * q), xo = r2(sh + AW / 2 - 1.2);
  const lx = K.side ? [77, 84] : [r2(80 - W.hx), r2(80 + W.hx)], pc = (lx[0] + lx[1]) / 2, ph = r2((lx[1] - lx[0]) / 2 + LW / 2 + 1);
  const timing = `keyTimes="${K.kt.join(";")}" dur="${K.dur}s" repeatCount="indefinite"` + (K.linear ? "" : ` calcMode="spline" keySplines="${Array(n - 1).fill("0.4 0 0.6 1").join(";")}"`);
  const G = (type, vals, inner) => `<g transform="${type}(${vals[si]})">` + (still || vals.every(v => v === vals[0]) ? "" : `<animateTransform attributeName="transform" type="${type}" values="${vals.join(";")}" ${timing}/>`) + inner + `</g>`;
  const seg = (x, y, len, w, pair) => `<path d="M${x} ${y} v${len}" stroke="${pair[1]}" stroke-width="${r2(w + 2)}" stroke-linecap="round"/><path d="M${x} ${y} v${len}" stroke="${pair[0]}" stroke-width="${r2(w - 0.4)}" stroke-linecap="round"/>`;
  const leg = (hx, key, pair, toe) => G("rotate", P.map(p => `${p[key][0]} ${hx} ${HY}`), seg(hx, HY, TH, LW, pair) +
    G("rotate", P.map(p => `${p[key][1]} ${hx} ${HY + TH}`), `<ellipse cx="${r2(hx + toe)}" cy="${HY + TH + SH - 2.6}" rx="${r2(K.side ? LW * 0.8 : LW * 0.66)}" ry="4.5" fill="#2c2623"/>` + seg(hx, HY + TH, SH - 5, LW - 1.6, pair)));
  const hr = r2(AW * 0.6), armC = dress ? bare : sleeve;
  const arm = (sx, key) => G("rotate", P.map(p => `${p[key][0]} ${sx} ${SY}`), seg(sx, SY, UA, AW, armC) +
    G("rotate", P.map(p => `${p[key][1]} ${sx} ${SY + UA}`), (K.open === key ? [-4.5, -1.5, 1.5, 4.5].map((dx, i) => `<rect x="${r2(sx + dx - 1.4)}" y="${SY + UA + FA + 1}" width="2.8" height="${[7, 8.6, 8.6, 7][i]}" rx="1.4" fill="${skin[0]}" stroke="${skin[2]}" stroke-width=".8" transform="rotate(${-dx * 3.4} ${sx} ${SY + UA + FA})"/>`).join("") +
      `<rect x="${r2(sx - hr - 3)}" y="${SY + UA + FA - 2.6}" width="3" height="7" rx="1.5" fill="${skin[0]}" stroke="${skin[2]}" stroke-width=".8" transform="rotate(38 ${r2(sx - hr - 1.5)} ${SY + UA + FA})"/>` : "") +
    `<ellipse cx="${sx}" cy="${SY + UA + FA}" rx="${hr}" ry="${r2(hr * 1.12)}" fill="${skin[1]}" stroke="${skin[2]}" stroke-width="1"/>` + seg(sx, SY + UA, FA - 4, AW - 0.8, armC)));
  const far = dress ? bare : [legs[1], legs[1]], legC = dress ? bare : legs, T1 = `stroke="${sleeve[1]}" stroke-width="1.2" stroke-linejoin="round"`;
  /* the trunk: a neck, sloping shoulders that end under the tops of the arms, a chest that narrows to the waist, a hem on the hips */
  let trunk = `<rect x="${r2(80 - W.aw * 0.54)}" y="78" width="${r2(W.aw * 1.08)}" height="13" fill="${skin[2]}"/>
    <path d="M75 88 Q80 92 85 88 Q${r2(80 + xo)} 88.4 ${r2(80 + xo)} 96 L${r2(80 + ch)} 104 Q${r2(80 + wa)} 111 ${r2(80 + wa)} 119 Q${r2(80 + wa)} 124 ${r2(80 + hip)} 128 V131 Q80 134.6 ${r2(80 - hip)} 131 V128 Q${r2(80 - wa)} 124 ${r2(80 - wa)} 119 Q${r2(80 - wa)} 111 ${r2(80 - ch)} 104 L${r2(80 - xo)} 96 Q${r2(80 - xo)} 88.4 75 88Z" fill="${sleeve[0]}" ${T1}/>
    <path d="M75 88 Q80 92 85 88" stroke="${sleeve[1]}" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M${r2(80 + wa - 1.4)} 108 Q${r2(80 + wa - 2.6)} 118 ${r2(80 + hip - 2)} 129" stroke="${sleeve[1]}" stroke-width="2.4" fill="none" opacity=".35" stroke-linecap="round"/>`;
  if (L.suit) trunk += `<path d="M75.4 88.4 L80 112 L84.6 88.4 Q80 92 75.4 88.4Z" fill="${who === "julie" ? COL.julieRed[0] : "#f8f6f0"}"/>` + (c.tie ? `<path d="M78.6 91.4 h2.8 l1.5 13 l-2.9 4 l-2.9 -4z" fill="${(COL[c.tie] || COL.red)[0]}"/>` : "") +
      `<path d="M75.4 88.4 L80 112 L84.6 88.4" stroke="${sleeve[1]}" stroke-width="1.3" fill="none"/><path d="M80 112 V132" stroke="${sleeve[1]}" stroke-width="1.2"/><circle cx="80" cy="119" r="1.3" fill="#23252b"/>`;
  if (L.coat) trunk += `<path d="M80 92 V146" stroke="${sleeve[1]}" stroke-width="1.3"/><circle cx="77" cy="106" r="1.4" fill="#4a3524"/><circle cx="77" cy="118" r="1.4" fill="#4a3524"/><path d="M75.4 88.4 L80 98 L84.6 88.4" fill="${c.top[0]}" stroke="${sleeve[1]}" stroke-width="1.2"/>`;
  if (L.backpack){ const Kc = COL[c.pack] || COL.orange; trunk += `<path d="M${r2(80 - xo + 4)} 91 L${r2(80 - ch + 2.4)} 108 M${r2(80 + xo - 4)} 91 L${r2(80 + ch - 2.4)} 108" stroke="${Kc[1]}" stroke-width="4.6" stroke-linecap="round"/><path d="M${r2(80 - xo + 4)} 91 L${r2(80 - ch + 2.4)} 108 M${r2(80 + xo - 4)} 91 L${r2(80 + ch - 2.4)} 108" stroke="${Kc[0]}" stroke-width="2.2" stroke-linecap="round"/>`; }
  if (L.bag){ const Gc = COL[c.bag] || COL.mustard; trunk += `<path d="M${r2(80 + xo - 4)} 90 L${r2(80 - wa - 1)} 124" stroke="#6a4a2a" stroke-width="2.6" stroke-linecap="round"/><rect x="${r2(80 - wa - 11)}" y="121" width="14" height="13" rx="3" fill="${Gc[0]}" stroke="${Gc[1]}" stroke-width="1.3"/><path d="M${r2(80 - wa - 11)} 126 h14" stroke="${Gc[1]}" stroke-width="1.6"/>`; }
  if (L.scarf){ const Sc = COL[c.scarf] || COL.mustard; trunk += `<path d="M${r2(80 + ch - 4)} 92 l5 17 q-4 3 -8 1 l-3 -16z" fill="${Sc[0]}" stroke="${Sc[1]}" stroke-width="1"/><path d="M${r2(80 - ch + 1.5)} 86.5 Q80 94 ${r2(80 + ch - 1.5)} 86.5 Q${r2(80 + ch)} 91 ${r2(80 + ch - 2)} 94 Q80 100 ${r2(80 - ch + 2)} 94 Q${r2(80 - ch)} 91 ${r2(80 - ch + 1.5)} 86.500Z" fill="${Sc[0]}" stroke="${Sc[1]}" stroke-width="1"/>`; }
  const behindTrunk = (L.coat ? `<path d="M${r2(80 - hip - 0.6)} 124 H${r2(80 + hip + 0.6)} L${r2(80 + hip + 3)} 147 H${r2(80 - hip - 3)}Z" fill="${sleeve[0]}" ${T1}/>` : "") +
    (L.backpack ? `<rect x="${r2(80 - xo - 3)}" y="92" width="${r2(2 * xo + 6)}" height="34" rx="8" fill="${(COL[c.pack] || COL.orange)[0]}" stroke="${(COL[c.pack] || COL.orange)[1]}" stroke-width="1.3"/>` : "");
  const hT = `transform="translate(${r2(80 - 80 * W.hs)} ${r2(85 - (c.kid ? 124 : 125) * W.hs)}) scale(${W.hs})"`;
  let brolly = "";
  if (L.umbrella){ const U = COL[c.umb] || COL.yellow, hx0 = r2(80 + sh + UA * 0.342 + FA * 0.574), hy0 = r2(SY + UA * 0.94 - FA * 0.819);      // held up in the near hand, over the head
    brolly = `<path d="M${hx0} ${hy0 + 5} L86 24" stroke="#4b4f57" stroke-width="2.2" stroke-linecap="round"/><g transform="translate(33.2 21.6) scale(.6)"><path d="M26 34 Q28 5 88 4 Q148 5 150 34 Q134.5 25 119 34 Q103.5 25 88 34 Q72.5 25 57 34 Q41.5 25 26 34 Z" fill="${U[0]}" stroke="${U[1]}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M88 4 Q28 5 26 34 Q41.5 25 57 34 Q62 12 88 4Z M88 4 Q112 12 119 34 Q103.5 25 88 34 Z" fill="${U[1]}"/><path d="M88 4.5 v-4" stroke="#4b4f57" stroke-width="3" stroke-linecap="round"/></g>`; }
  const upper = (K.side ? arm(r2(80 - sh), "aL") : "") + `<g data-s="${u}b" ${hT}></g>` + behindTrunk + trunk + brolly + `<g data-s="${u}h" ${hT}></g>` + (K.side ? "" : arm(r2(80 - sh), "aL")) + arm(r2(80 + sh), "aR");
  const body = (K.side ? leg(lx[0], "lL", far, 4) + leg(lx[1], "lR", legC, 4) : leg(lx[0], "lL", legC, -2.4) + leg(lx[1], "lR", legC, 2.4)) +
    (dress ? `<path d="M${r2(80 - wa)} 118 H${r2(80 + wa)} L${r2(80 + hip + 8)} 151 Q80 156 ${r2(80 - hip - 8)} 151Z" fill="${sleeve[0]}" ${T1}/>`
      : `<path d="M${r2(pc - ph + 1)} 123 H${r2(pc + ph - 1)} L${r2(pc + ph)} ${HY + 3} Q${r2(pc + ph)} ${HY + 9.5} ${pc} ${HY + 9.5} Q${r2(pc - ph)} ${HY + 9.5} ${r2(pc - ph)} ${HY + 3}Z" fill="${legs[0]}"/>`) +
    G("translate", P.map(p => `${p.bx} ${p.by}`), G("rotate", P.map(p => `${p.br} 80 118`), upper));
  let back = "", front = "";
  const S = r2((K.scale || 1) * W.k);
  if (opts.card) back += `<g transform="translate(73.1 8.3) scale(.574)">${card(lookOf({}), { doing: opts.card })}</g>`;       // the picture card of what they are going to do, held up
  if (opts.size){ const y = r2(178 - (c.kid ? 138 : 131) * S);       // a measuring post behind, and a mark at the top of the head
    back += `<path d="M22 8 V180" stroke="#8f98a3" stroke-width="5" stroke-linecap="round"/><path d="${Array.from({ length: 10 }, (_, i) => `M22 ${178 - i * 17} h${i % 2 ? 7 : 11}`).join(" ")}" stroke="#8f98a3" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M22 ${y} H92" stroke="#d8483f" stroke-width="2.6" stroke-dasharray="5 4"/><path d="M22 ${y} l-11 -6 v12z" fill="#d8483f"/>`; }
  const loop = (attrs, dur, extra) => still ? "" : `<animateTransform attributeName="transform" ${attrs} dur="${dur}s" repeatCount="indefinite"${extra || ""}/>`;
  if (K.chair){
    back += `<ellipse cx="74" cy="181" rx="40" ry="4" fill="#000" opacity=".1"/>
      <path d="M49 161 L44 100 M57 161 L55 100" stroke="#6e5140" stroke-width="5" stroke-linecap="round"/><path d="M41 101 Q49 96 58 100 L57.4 111 Q49 108 42 112 Z" fill="#7f604c" stroke="#5e4535" stroke-width="1.2"/>
      <path d="M43 124 Q50 121 56.6 123 M44 138 Q50 135 56.8 137" stroke="#6e5140" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M50 164 L48 180 M94 164 L96 180" stroke="#5e4535" stroke-width="5" stroke-linecap="round"/><rect x="44" y="158.5" width="56" height="8" rx="3.5" fill="#8a6a52" stroke="#5e4535" stroke-width="1.2"/>`;
    if (still){ const up = act === "stand up", ax = 132, y0 = up ? 96 : 52, y1 = up ? 52 : 96, hd = up ? 1 : -1;      // which way: an arrow, only in the frozen frame
      front += `<path d="M${ax} ${y0} V${y1 + hd * 4}" stroke="#3fae5a" stroke-width="7" stroke-linecap="round"/><path d="M${ax - 11} ${y1 + hd * 12} L${ax} ${y1} L${ax + 11} ${y1 + hd * 12}" stroke="#3fae5a" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`; }
  } else {
    back += `<g transform="translate(80 181)">` + G("scale", P.map(p => `${p.sh}`), `<ellipse cx="0" cy="0" rx="24" ry="4" fill="#000" opacity=".13"/>`) + `</g>`;
  }
  if (act === "walk"){                                      // the ground slides back under the feet (walking on the spot); frozen: marks behind
    back += `<clipPath id="${u}g"><rect x="26" y="176" width="108" height="14"/></clipPath><g clip-path="url(#${u}g)"><g>` + loop(`type="translate" values="0 0;-26 0"`, 0.55) +
      [30, 56, 82, 108, 134, 160].map(x => `<path d="M${x} 186.5 h11" stroke="#b9bec6" stroke-width="3" stroke-linecap="round"/>`).join("") + `</g></g>`;
    if (still) front += `<path d="M22 112 h14 M16 126 h18 M22 140 h14" stroke="#b9bec6" stroke-width="3.4" stroke-linecap="round"/>`;
  }
  if (act === "jump" && still) front += `<path d="M62 160 Q80 169 98 160 M68 170 Q80 175.5 92 170" stroke="#b9bec6" stroke-width="3.4" fill="none" stroke-linecap="round"/>`;
  if (act === "dance"){                                     // music in the air: two notes that bob
    const note = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="6" ry="4.4" fill="#6a55b8" transform="rotate(-20)"/><path d="M5.4 -1 V-22 q9 2 11 10" stroke="#6a55b8" stroke-width="3" fill="none" stroke-linecap="round"/></g>`;
    front += `<g>` + loop(`type="translate" values="0 0;0 -5;0 0"`, 0.6) + note(24, 62, 1) + `</g><g>` + loop(`type="translate" values="0 -5;0 0;0 -5"`, 0.6) + note(128, 50, 0.85) + `</g>`;
  }
  /* the figure itself; for the movements that are played once (K.fade) it fades out at the end and is back, in its first pose, when the loop begins again */
  const fig = `<g>` + (K.fade && !still ? `<animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.82;0.93;1" dur="${K.dur}s" repeatCount="indefinite"/>` : "") + G("translate", P.map(p => `${p.rx} ${p.ry}`), body) + `</g>`;
  const g = mk((K.chair ? "" : back) + `<g transform="translate(${80 + (K.ox || 0)} 178) scale(${S}) translate(-80 -178)">` + (K.chair ? back : "") + fig + `</g>` + front);
  spec._head = true;
  const hd = bust(spec, name), slot = k => g.querySelector(`g[data-s="${u}${k}"]`);      // the head from the portrait: its hair behind the trunk, the rest in front
  slot("h").appendChild(hd.querySelector("defs")); slot("b").appendChild(hd.querySelector("g.hb")); slot("h").appendChild(hd.querySelector("g.hd"));
  return g;
}

/* ---------- things (Lessons 5-10): PICS.thing({is, looks, count}) ----------
   Each kind has a drawer that reads the look words and returns the SVG of one thing in the 160 x 190 box. The first colour
   word in the looks (any name in TINT, which holds all of COL) recolours the thing; words a drawer does not know are ignored.
   The shapes were drawn after looking at the Mulberry symbols, ARASAAC and OpenMoji for each kind (silhouette and the one
   or two features that name it at a glance: the steam of coffee, the handle of a door, the sill of a window, the ears and
   whiskers of a cat), and so that no two kinds share a silhouette: a cake stands up from a plate and a pizza lies flat;
   coffee steams and a glass is clear; a bag has handles and a box has corners; a bus is a long box with a row of windows. */
const TINT = Object.assign({ black: ["#5a5b65", "#2c2d33"], cream: ["#fdf4da", "#ecdcae"], silver: ["#e3e6ea", "#a7adb6"], gold: ["#f2d268", "#c99c28"],
  wooden: ["#d3a56e", "#a67a48"], chocolate: ["#8c5834", "#5e381e"], ginger: ["#eb9d52", "#c4722c"], brick: ["#c66f50", "#9a4e36"], golden: ["#e9b85a", "#bd872a"] }, COL);
const tone = (hex, f) => "#" + [1, 3, 5].map(i => { const v = parseInt(hex.substr(i, 2), 16);
  return Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f))).toString(16).padStart(2, "0"); }).join("");
const pal = p => ({ a: p[0], b: p[1], d: tone(p[1], p[0] === COL.white[0] ? -0.5 : -0.34), h: tone(p[0], 0.5) });     // light, dark, outline, highlight
const lgr = (id, a, b, h) => `<linearGradient id="${id}" x1="0" y1="0" x2="${h ? 1 : 0}" y2="${h ? 0 : 1}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
const shad = (cx, cy, rx) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${r2(Math.max(3.4, rx * 0.1))}" fill="#000" opacity=".12"/>`;
const at = (x, y, s, inner, rot) => `<g transform="translate(${r2(x)} ${r2(y)})${rot ? ` rotate(${rot})` : ""}${s === 1 ? "" : ` scale(${s})`}">${inner}</g>`;
const about = (cx, cy, s, inner, rot) => `<g transform="translate(${cx} ${cy})${rot ? ` rotate(${rot})` : ""} scale(${s}) translate(${-cx} ${-cy})">${inner}</g>`;
const WOOD = pal(TINT.wooden), KRAFT = pal(["#dcb682", "#b98d55"]), CHINA = { a: "#ffffff", b: "#dde2e8", d: "#8f98a3", h: "#ffffff" }, STEEL = { a: "#e6e9ed", b: "#a9afb8", d: "#6d737c", h: "#ffffff" };
const GLASS = `fill="#e3f1fb" fill-opacity=".55" stroke="#557fa8" stroke-width="2.2" stroke-linejoin="round"`;
function lookOf(spec){
  const S = " " + (spec.looks || []).join(" ").toLowerCase().replace(/[^a-z'\- ]+/g, " ").replace(/\s+/g, " ").trim() + " ";
  const cn = S.trim().split(" ").find(x => TINT[x]);
  return { S, cn, sig: S.trim().split(" ").sort().join(" "), u: "pt" + (seq++) + "_", has: (...w) => w.some(x => S.indexOf(" " + x + " ") >= 0), tint: def => pal(TINT[cn] || TINT[def] || def) };
}
/* --- food and drink --- */
const dish = (cx, cy, rx, f) => `<ellipse cx="${cx}" cy="${cy + 3}" rx="${rx}" ry="${r2(rx * (f || 0.2))}" fill="#c3c7cd"/><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${r2(rx * (f || 0.2))}" fill="#fcfcfa" stroke="#a4aab2" stroke-width="1.5"/>`;
const berry = (x, y, s) => at(x, y, s, `<path d="M0 -7 C8 -10 12 -2 8 5 C5 10 2 12 0 13 C-2 12 -5 10 -8 5 C-12 -2 -8 -10 0 -7Z" fill="#dc3431" stroke="#9c1c1b" stroke-width="1.2"/><path d="M-7 -7 L0 -11.5 L7 -7 L3 -5 L0 -2.5 L-3 -5Z" fill="#4f9a3d"/><g fill="#f9dc92"><circle cx="-3" cy="1" r="1"/><circle cx="3" cy="2" r="1"/><circle cx="0" cy="7" r="1"/></g>`);
const cherry = (x, y, s) => at(x, y, s, `<path d="M0 -5 q2 -10 10 -12" stroke="#5a3a22" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle r="6.5" fill="#d1202b" stroke="#8f1218" stroke-width="1.2"/><circle cx="-2" cy="-2.2" r="1.7" fill="#fff" opacity=".65"/>`);
function cake(k){
  const u = k.u, has = k.has, choc = has("chocolate"), straw = has("strawberries", "strawberry"), cand = has("candles", "candle"), small = has("small"), high = has("round");
  const I = k.tint(choc ? "chocolate" : cand || small ? "pink" : "cream"), S = choc ? pal(["#a66a3d", "#84502b"]) : pal(["#f6d98e", "#e2ba60"]);
  const defs = `<defs>${lgr(u + "i", I.a, I.b)}${lgr(u + "s", S.a, S.b)}</defs>`;
  if (has("slice")){                                       // a wedge on a plate: the cut side shows the layers
    const fill = choc ? "#f3e2c0" : "#d8544f";
    return defs + dish(80, 142, 66, 0.22) + `<path d="M24 104 L138 98 V136 L24 141 Z" fill="url(#${u}s)" stroke="${S.d}" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M24 121 L138 115 V121 L24 127 Z" fill="${fill}"/><path d="M24 104 L138 98 V106 L24 112 Z" fill="${I.b}"/>
      <path d="M24 104 L116 62 Q134 76 138 98 Z" fill="url(#${u}i)" stroke="${I.d}" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M40 100 L112 68" stroke="#fff" stroke-width="3" opacity=".4" stroke-linecap="round"/>` + (choc ? cherry(108, 80, 1.15) : berry(106, 78, 1.15));
  }
  const R = 52, ry = high ? 22 : 15, H = high ? 34 : 46, yT = high ? 84 : 76, yB = yT + H, full = choc || straw || high;
  const e = x => ry * Math.sqrt(Math.max(0, 1 - x * x / (R * R))), on = (a, f) => [80 + R * f * Math.cos(a), yT + ry * f * Math.sin(a)];
  let s = dish(80, yB + ry - 3, R + 17) + `<path d="M${80 - R} ${yT} V${yB} A${R} ${ry} 0 0 0 ${80 + R} ${yB} V${yT}Z" fill="url(#${u}${full ? "i" : "s"})" stroke="${full ? I.d : S.d}" stroke-width="1.6"/>`;
  if (full) s += `<path d="M${80 - R} ${yT + H * 0.52} A${R} ${ry} 0 0 0 ${80 + R} ${yT + H * 0.52}" stroke="${choc ? "#f3e2c0" : straw ? "#e58a9a" : I.d}" stroke-width="${high ? 1.6 : 4.5}" fill="none" opacity="${high ? ".7" : "1"}"/>`;
  else {                                                   // icing that has run down the side
    let d = `M${80 - R} ${yT} v6`;
    for (let i = 0; i < 8; i++){ const x0 = -R + R * i / 4, x1 = x0 + R / 4; d += ` Q${r2(80 + x0 + R / 8)} ${r2(yT + e(x0 + R / 8) + (i % 2 ? 14 : 27))} ${r2(80 + x1)} ${r2(yT + e(x1) + 6)}`; }
    s += `<path d="${d} V${yT}Z" fill="${I.a}" stroke="${I.d}" stroke-width="1.4" stroke-linejoin="round"/>`;
  }
  s += `<ellipse cx="80" cy="${yT}" rx="${R}" ry="${ry}" fill="${full && !choc ? I.h : I.a}" stroke="${I.d}" stroke-width="1.6"/>`;
  const ring = (n, f, a0, draw) => Array.from({ length: n }, (_, i) => [a0 + i * 2 * Math.PI / n, i]).sort((p, q) => Math.sin(p[0]) - Math.sin(q[0])).map(p => draw(on(p[0], f), p[1])).join("");
  if (choc) s += ring(8, 0.76, 0.4, p => `<circle cx="${r2(p[0])}" cy="${r2(p[1] - 2)}" r="5.2" fill="${I.b}" stroke="${I.d}" stroke-width="1.2"/><circle cx="${r2(p[0] - 1.4)}" cy="${r2(p[1] - 3.6)}" r="1.5" fill="${I.h}" opacity=".6"/>`) + cherry(80, yT - 5, 1.2);
  else if (straw) s += ring(6, 0.66, 0.52, p => berry(p[0], p[1] - 8, 1.05)) + berry(80, yT - 9, 1.15);
  else if (cand) s += [-30, -15, 0, 15, 30].map((x, i) => { const y = yT + (i % 2 ? 4 : -2) + Math.abs(x) * 0.04, c = ["#3f8fd0", "#f0b429", "#5aa86d", "#e0574c", "#9076c8"][i];
      return `<rect x="${80 + x - 2.6}" y="${y - 25}" width="5.2" height="25" rx="1.6" fill="${c}" stroke="${tone(c, -0.35)}" stroke-width="1"/><path d="M${80 + x - 2.6} ${y - 17} l5.2 -3 M${80 + x - 2.6} ${y - 9} l5.2 -3" stroke="#fff" stroke-width="1.6" opacity=".8"/>
        <path d="M${80 + x} ${y - 39} c5 6 4 11 0 12 c-4 -1 -5 -6 0 -12z" fill="#f79a1e" stroke="#d96a12" stroke-width=".8"/><path d="M${80 + x} ${y - 33} c2 3 2 5 0 5.6 c-2 -.6 -2 -2.6 0 -5.6z" fill="#ffe98a"/>`; }).join("");
  else if (high) s += ring(10, 0.8, 0.31, (p, i) => `<circle cx="${r2(p[0])}" cy="${r2(p[1] - 2)}" r="6" fill="${I.a}" stroke="${I.d}" stroke-width="1.2"/><path d="M${r2(p[0] - 3)} ${r2(p[1] - 2)} q3 -4 6 0" stroke="${I.d}" stroke-width="1" fill="none"/>` + (i % 2 ? "" : `<circle cx="${r2(p[0])}" cy="${r2(p[1] - 6)}" r="2.6" fill="#d1202b"/>`)) +
      `<path d="M72 ${yT} q8 -9 16 0 q-8 7 -16 0z" fill="${I.a}" stroke="${I.d}" stroke-width="1.2"/>`;
  else s += cherry(80, yT - 5, 1.3);
  return defs + (small ? about(80, 150, 0.64, s) : s);
}
function pizza(k){
  const u = k.u, has = k.has, kind = has("tomatoes", "tomato") ? 1 : has("mushrooms", "mushroom") ? 2 : 0, C = k.tint(["#edbb6e", "#cf9440"]);
  const bit = (x, y, s) => at(x, y, s, [
    `<circle r="8.5" fill="#c8452f" stroke="#8f2a1c" stroke-width="1.3"/><g fill="#8f2a1c" opacity=".7"><circle cx="-3" cy="-2" r="1.3"/><circle cx="3" cy="-1" r="1.1"/><circle cx="0" cy="4" r="1.3"/></g>`,
    `<circle r="10" fill="#e3463a" stroke="#ab2a22" stroke-width="1.3"/><circle r="6.6" fill="#f17a66"/><g fill="#f9d7a8"><ellipse cx="-3.2" cy="-3.2" rx="2" ry="1.4"/><ellipse cx="3.2" cy="-3.2" rx="2" ry="1.4"/><ellipse cx="-3.2" cy="3.2" rx="2" ry="1.4"/><ellipse cx="3.2" cy="3.2" rx="2" ry="1.4"/></g>`,
    `<path d="M-10 0 A10 9 0 0 1 10 0 Q6 3.4 3.4 2.4 V8.5 Q0 10.5 -3.4 8.5 V2.4 Q-6 3.4 -10 0Z" fill="#f1e6d2" stroke="#86694f" stroke-width="1.4" stroke-linejoin="round"/><path d="M-6 -1.5 Q0 -6 6 -1.5" stroke="#86694f" stroke-width="1" fill="none" opacity=".7"/>`][kind]);
  const leaf = (x, y, r) => at(x, y, 1, kind === 1 ? `<path d="M-7 0 Q0 -6 7 0 Q0 6 -7 0Z" fill="#4f9a3d" stroke="#2f6f24" stroke-width="1"/>` : `<circle r="3.6" fill="none" stroke="${kind ? "#4f9a3d" : "#2b2b30"}" stroke-width="2.6"/>`, r);
  const tops = (R, n) => Array.from({ length: n }, (_, i) => { const a = 0.35 + i * 2 * Math.PI / n; return bit(R * 0.58 * Math.cos(a), R * 0.58 * Math.sin(a), R / 56) + leaf(R * 0.3 * Math.cos(a + 0.9), R * 0.3 * Math.sin(a + 0.9), i * 50); }).join("") + (n > 5 ? bit(0, 0, R / 56) : "");
  const pie = (cx, cy, R, sy, n) => `<g transform="translate(${cx} ${cy}) scale(1 ${sy})"><circle r="${R}" fill="url(#${u}c)" stroke="${C.d}" stroke-width="1.8"/><circle r="${R - 8}" fill="#d6452f"/><circle r="${R - 10.5}" fill="#f8d977"/>
      <g fill="#fcebb0"><ellipse cx="${-R * 0.3}" cy="${-R * 0.42}" rx="${R * 0.2}" ry="${R * 0.1}"/><ellipse cx="${R * 0.34}" cy="${R * 0.3}" rx="${R * 0.17}" ry="${R * 0.1}"/><ellipse cx="${-R * 0.36}" cy="${R * 0.4}" rx="${R * 0.14}" ry="${R * 0.08}"/></g>
      <path d="M${-R + 9} 0 H${R - 9} M0 ${-R + 9} V${R - 9}" stroke="#d39a3c" stroke-width="1.4" opacity=".75"/>${tops(R, n)}</g>`;
  const defs = `<defs><radialGradient id="${u}c" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="${C.a}"/><stop offset="1" stop-color="${C.b}"/></radialGradient></defs>`;
  if (has("slice")) return defs + shad(84, 170, 36) + `<g transform="rotate(-10 80 100)"><path d="M80 172 L22 62 Q80 28 138 62 Z" fill="url(#${u}c)" stroke="${C.d}" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M80 158 L33 70 Q80 45 127 70 Z" fill="#d6452f"/><path d="M80 152 L38 72 Q80 50 122 72 Z" fill="#f8d977"/><ellipse cx="70" cy="74" rx="14" ry="5" fill="#fcebb0"/>` +
      bit(62, 86, 1.15) + bit(98, 88, 1.15) + bit(80, 120, 1.15) + leaf(82, 68, 20) + leaf(72, 104, 80) + leaf(92, 108, 10) + `</g>`;
  if (has("box")) return defs + shad(80, 170, 70) + `<path d="M20 98 L30 26 H130 L140 98 Z" fill="${KRAFT.a}" stroke="${KRAFT.d}" stroke-width="1.8" stroke-linejoin="round"/><path d="M34 38 H126 M31 60 H129" stroke="${KRAFT.b}" stroke-width="1.6" opacity=".7"/>
      <path d="M20 98 H140 L154 150 H6 Z" fill="${KRAFT.b}" stroke="${KRAFT.d}" stroke-width="1.8" stroke-linejoin="round"/>` + pie(80, 123, 54, 0.4, 6) +
      `<path d="M6 150 H154 V165 Q154 168 151 168 H9 Q6 168 6 165 Z" fill="${KRAFT.a}" stroke="${KRAFT.d}" stroke-width="1.8" stroke-linejoin="round"/><path d="M70 150 v7 h20 v-7" fill="none" stroke="${KRAFT.d}" stroke-width="1.5"/>`;
  const R = has("small") ? 36 : 62;
  return defs + shad(82, 100 + R + 4, R * 0.9) + pie(80, 100, R, 1, R < 50 ? 4 : 6);
}
const steam = (x, y, s) => at(x, y, s || 1, [-12, 1, 13].map((dx, i) => `<path d="M${dx} ${i === 1 ? -6 : 0} q-6 -7 0 -14 q6 -7 0 -14" stroke="#aeb4bd" stroke-width="3.2" fill="none" stroke-linecap="round"/>`).join(""));
const saucer = (cx, cy, rx, P) => `<ellipse cx="${cx}" cy="${cy + 3}" rx="${rx}" ry="${r2(rx * 0.24)}" fill="${P.d}" opacity=".55"/><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${r2(rx * 0.24)}" fill="${P.a}" stroke="${P.d}" stroke-width="1.5"/><ellipse cx="${cx}" cy="${cy - 1}" rx="${r2(rx * 0.55)}" ry="${r2(rx * 0.12)}" fill="${P.b}" opacity=".7"/>`;
/* a drinking glass: cx, the y of the rim, half-widths at rim and base, height; liquid colour and how far down from the rim it starts (0-1) */
function tumbler(cx, yT, wT, wB, H, liq, lev, T){              // T: a palette for coloured glass
  const yB = yT + H, wAt = y => wT + (wB - wT) * (y - yT) / H, yl = yT + H * (lev || 0), wl = wAt(yl) - 2;
  const body = `M${cx - wT} ${yT} L${cx - wB} ${yB - 3} Q${cx - wB} ${yB + 3} ${cx - wB + 6} ${yB + 3} H${cx + wB - 6} Q${cx + wB} ${yB + 3} ${cx + wB} ${yB - 3} L${cx + wT} ${yT}`;
  if (T) return `<path d="${body}Z" fill="${T.a}" fill-opacity=".6" stroke="${T.d}" stroke-width="2.4" stroke-linejoin="round"/><path d="M${cx - wB + 1} ${yB - 5} H${cx + wB - 1}" stroke="${T.d}" stroke-width="1.6" opacity=".7"/>
     <ellipse cx="${cx}" cy="${yT}" rx="${wT}" ry="${r2(wT * 0.2)}" fill="${T.h}" fill-opacity=".7" stroke="${T.d}" stroke-width="2.2"/><path d="M${r2(cx - wAt(yT + H * 0.2) + 6)} ${r2(yT + H * 0.2)} L${r2(cx - wAt(yT + H * 0.75) + 6)} ${r2(yT + H * 0.75)}" stroke="#fff" stroke-width="3.4" stroke-linecap="round" opacity=".8"/>`;
  return `<path d="${body}Z" fill="#e3f1fb" fill-opacity=".55"/>` +
    (liq ? `<path d="M${r2(cx - wl)} ${yl} L${cx - wB + 2.5} ${yB - 5} H${cx + wB - 2.5} L${r2(cx + wl)} ${yl} Z" fill="${liq}" fill-opacity=".93"/><ellipse cx="${cx}" cy="${yl}" rx="${r2(wl)}" ry="${r2(wl * 0.2)}" fill="${tone(liq, 0.28)}" stroke="${tone(liq, -0.2)}" stroke-width="1"/>` : "") +
    `<path d="${body}Z" fill="none" stroke="#557fa8" stroke-width="2.2" stroke-linejoin="round"/><path d="M${cx - wB + 1} ${yB - 5} H${cx + wB - 1}" stroke="#557fa8" stroke-width="1.4" opacity=".6"/>
     <ellipse cx="${cx}" cy="${yT}" rx="${wT}" ry="${r2(wT * 0.2)}" fill="#fff" fill-opacity=".35" stroke="#557fa8" stroke-width="2"/>
     <path d="M${r2(cx - wAt(yT + H * 0.2) + 6)} ${r2(yT + H * 0.2)} L${r2(cx - wAt(yT + H * 0.75) + 6)} ${r2(yT + H * 0.75)}" stroke="#fff" stroke-width="3.4" stroke-linecap="round" opacity=".9"/>`;
}
function coffee(k){
  const u = k.u, has = k.has, small = has("small"), milk = has("milk"), brew = milk ? "#c79a6b" : "#4f2f1a";
  const P = k.cn ? k.tint() : has("mug") ? pal(COL.red) : CHINA, W0 = has("white") || !k.cn;
  const defs = `<defs><linearGradient id="${u}c" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${P.a}"/><stop offset=".45" stop-color="${W0 ? "#f1f3f6" : P.a}"/><stop offset="1" stop-color="${P.b}"/></linearGradient></defs>`, F = `fill="url(#${u}c)" stroke="${P.d}" stroke-width="1.7" stroke-linejoin="round"`;
  const top = (cx, y, W) => `<ellipse cx="${cx}" cy="${y}" rx="${W}" ry="${r2(W * 0.26)}" fill="${P.h}" stroke="${P.d}" stroke-width="1.7"/><ellipse cx="${cx}" cy="${y + 1.5}" rx="${W - 4.5}" ry="${r2(W * 0.26 - 3)}" fill="${brew}" stroke="${tone(brew, -0.3)}" stroke-width="1"/>` +
    (milk ? `<path d="M${cx - 8} ${y + 1} q4 -5 8 0 q4 -5 8 0 q-2 6 -8 7 q-6 -1 -8 -7z" fill="#fff8ea"/>` : `<ellipse cx="${cx - W * 0.3}" cy="${y}" rx="${W * 0.22}" ry="${W * 0.05}" fill="#fff" opacity=".3"/>`);
  const loop = (d, w) => `<path d="${d}" stroke="${P.d}" stroke-width="${w + 3}" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${P.a}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;
  const bowl = (cx, y, W, H) => loop(`M${cx + W - 3} ${y + H * 0.24} q${W * 0.72} -3 ${W * 0.66} ${H * 0.26} q-2 ${H * 0.28} ${-W * 0.6} ${H * 0.3}`, 5) +
    `<path d="M${cx - W} ${y} Q${cx - W} ${y + H * 0.78} ${cx - W * 0.46} ${y + H * 0.96} Q${cx} ${y + H * 1.05} ${cx + W * 0.46} ${y + H * 0.96} Q${cx + W} ${y + H * 0.78} ${cx + W} ${y} Z" ${F}/>` + top(cx, y, W);
  if (has("paper")){                                       // a take-away cup: lid, sleeve, steam from the hole
    const S = k.cn ? P : KRAFT;
    return defs + shad(80, 170, 30) + `<path d="M48 62 L56 164 Q80 172 104 164 L112 62 Z" fill="#fbfbf8" stroke="#8f98a3" stroke-width="1.7" stroke-linejoin="round"/>
      <path d="M50.4 92 L54.4 140 Q80 148 105.6 140 L109.6 92 Q80 100 50.4 92Z" fill="${S.a}" stroke="${S.d}" stroke-width="1.5" stroke-linejoin="round"/>
      <g transform="translate(80 121) rotate(-28)"><ellipse rx="10.5" ry="7.5" fill="#5e381e"/><path d="M-9 1.5 Q0 -5 9 -1.5" stroke="${S.a}" stroke-width="1.8" fill="none"/></g>
      <rect x="43" y="53" width="74" height="11" rx="4" fill="#f1f2f0" stroke="#8f98a3" stroke-width="1.7"/><path d="M50 53 q2 -11 12 -11 h36 q10 0 12 11z" fill="#fbfbf8" stroke="#8f98a3" stroke-width="1.7" stroke-linejoin="round"/>
      <ellipse cx="96" cy="46" rx="6" ry="2" fill="#4a4f57"/>` + steam(94, 38, 0.9);
  }
  if (has("glass")) return defs + shad(80, 168, 48) + saucer(80, 160, 50, CHINA) + `<path d="M108 158 l30 -9" stroke="#8f98a3" stroke-width="3.4" stroke-linecap="round"/><ellipse cx="141" cy="148" rx="7" ry="4.2" fill="#d9dde2" stroke="#8f98a3" stroke-width="1.4" transform="rotate(-17 141 148)"/>` +
      tumbler(80, 64, 29, 23, 92, brew, 0.16).replace(`<path d="M51`, `<path d="M54.4 79 L55.2 90 H104.8 L105.6 79Z" fill="${milk ? "#fff8ea" : "#c79a6b"}"/><path d="M51`) + steam(80, 52);
  if (has("mug") || (k.cn && !has("cup"))) return defs + shad(80, 168, 42) + loop("M108 82 h8 q17 0 17 17 v10 q0 17 -17 17 h-8", 8) +
      `<path d="M46 70 V152 Q46 164 80 164 Q114 164 114 152 V70 Z" ${F}/><path d="M54 84 V146" stroke="#fff" stroke-width="4" opacity=".3" stroke-linecap="round"/>` + top(80, 70, 34) + steam(80, 56);
  const W = small ? 25 : milk ? 40 : 36, H = small ? 30 : milk ? 40 : 44, y = small ? 96 : 84;
  return defs + shad(80, y + H + 14, W * 1.5) + saucer(80, y + H + 4, W * 1.55, P) + bowl(80, y, W, H) + steam(80, y - 12, small ? 0.8 : 1) +
    (milk ? `<path d="M124 106 l4 44 q9 4 18 0 l4 -44 l-7 -4 h-12 z" fill="#fff" stroke="#8f98a3" stroke-width="1.6" stroke-linejoin="round"/><ellipse cx="137" cy="107" rx="10.5" ry="3.4" fill="#fffdf4" stroke="#8f98a3" stroke-width="1.2"/><path d="M150 114 q8 2 7 12 q-1 9 -9 10" stroke="#8f98a3" stroke-width="2.6" fill="none"/>` : "");
}
function glass(k){
  const u = k.u, has = k.has;
  if (has("wine")){
    const bowl = "M54 30 Q46 86 80 94 Q114 86 106 30";
    return `<defs><clipPath id="${u}w"><path d="${bowl}Z"/></clipPath></defs>` + shad(80, 166, 30) + `<path d="${bowl}Z" fill="#e3f1fb" fill-opacity=".55"/><rect x="40" y="56" width="80" height="40" fill="${k.cn ? k.tint().a : "#a3213f"}" clip-path="url(#${u}w)"/>
      <ellipse cx="80" cy="56" rx="27.5" ry="5" fill="${k.cn ? k.tint().h : "#c4405e"}" clip-path="url(#${u}w)"/><path d="${bowl}" fill="none" stroke="#557fa8" stroke-width="2.2"/><ellipse cx="80" cy="30" rx="26" ry="5" fill="#fff" fill-opacity=".35" stroke="#557fa8" stroke-width="2"/>
      <path d="M80 94 V156" stroke="#557fa8" stroke-width="5.5"/><path d="M80 94 V156" stroke="#e3f1fb" stroke-width="2"/><ellipse cx="80" cy="158" rx="26" ry="6.5" ${GLASS}/><path d="M60 40 Q57 62 64 78" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round" opacity=".9"/>`;
  }
  if (has("tall")) return shad(80, 172, 26) + `<path d="M84 150 L110 14" stroke="#d8483f" stroke-width="5" stroke-linecap="round"/><path d="M84 150 L110 14" stroke="#fff" stroke-width="5" stroke-dasharray="6 8"/>` +
      tumbler(80, 34, 24, 20, 132, k.cn ? k.tint().a : "#ece27c", 0.14) + `<g fill="#fff" opacity=".8"><circle cx="72" cy="120" r="2.4"/><circle cx="88" cy="98" r="2"/><circle cx="74" cy="80" r="1.8"/><circle cx="90" cy="136" r="2.2"/><circle cx="70" cy="148" r="1.8"/></g>
      <rect x="64" y="56" width="15" height="15" rx="3" fill="#fff" opacity=".55" stroke="#9db9d6" stroke-width="1" transform="rotate(-12 71 63)"/><rect x="80" y="60" width="14" height="14" rx="3" fill="#fff" opacity=".55" stroke="#9db9d6" stroke-width="1" transform="rotate(14 87 67)"/>`;
  if (has("small")) return shad(80, 156, 26) + tumbler(80, 98, 24, 19, 52, k.cn ? k.tint().a : "#e8607d", 0.3);
  const juice = has("juice"), water = has("water"), liq = k.cn ? k.tint().a : juice ? "#f39a2b" : water ? "#58a8ea" : null;
  if (k.cn && !juice && !water) return shad(80, 164, 34) + tumbler(80, 54, 34, 27, 104, null, 0, k.tint());      // a glass of that colour, empty
  return shad(80, 164, 34) + tumbler(80, 54, 34, 27, 104, liq, juice ? 0.14 : 0.24) + (juice ? `<circle cx="113" cy="50" r="15" fill="#f7a93a" stroke="#d9791a" stroke-width="1.6"/><circle cx="113" cy="50" r="11.5" fill="#fcc869"/>
      <path d="M113 38.5 V61.5 M101.5 50 H124.5 M105 42 L121 58 M121 42 L105 58" stroke="#f7a93a" stroke-width="1.5"/>` : "");
}
function banana(k){
  const u = k.u, has = k.has, green = k.cn === "green", P = green ? pal(["#b7d05c", "#84a63a"]) : !k.cn || k.cn === "yellow" ? pal(["#fadf52", "#e8b624"]) : k.tint(), spot = has("spotted"), big = has("big"), small = has("small");
  const defs = `<defs><linearGradient id="${u}b" x1="0" y1="0" x2=".3" y2="1"><stop offset="0" stop-color="${P.h}"/><stop offset=".4" stop-color="${P.a}"/><stop offset="1" stop-color="${P.b}"/></linearGradient></defs>`;
  if (has("peeled")) return defs + shad(80, 172, 34) + `<path d="M66 100 Q62 50 70 30 Q78 16 88 28 Q98 50 94 100 Z" fill="#fdf6d8" stroke="#cdbb78" stroke-width="1.6" stroke-linejoin="round"/><path d="M76 34 Q72 60 75 94" stroke="#e9dca6" stroke-width="2" fill="none"/>
      <path d="M62 96 Q26 96 14 130 Q30 118 46 124 Q54 142 66 150 Z" fill="${P.h}" stroke="${P.d}" stroke-width="1.6" stroke-linejoin="round"/><path d="M98 96 Q134 96 146 130 Q130 118 114 124 Q106 142 94 150 Z" fill="${P.h}" stroke="${P.d}" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M62 94 Q80 104 98 94 Q104 130 90 160 L88 170 H74 L70 160 Q56 130 62 94 Z" fill="url(#${u}b)" stroke="${P.d}" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M68 100 Q80 132 80 150 Q80 132 92 100" fill="${P.b}" opacity=".5"/><rect x="74" y="166" width="14" height="7" rx="2" fill="#6b5a2e"/>`;
  const b = `<path d="M50 -40 L58 -37 C62 -8 40 30 -6 36 C-34 39 -54 24 -62 4 L-65 -5 C-44 6 -22 8 0 3 C24 -4 40 -18 44 -34 Z" fill="url(#${u}b)" stroke="${P.d}" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M52 -30 C50 -6 30 16 -4 21 C-28 24 -46 16 -58 4" stroke="${P.b}" stroke-width="2" fill="none" opacity=".8"/>
    <path d="M49 -47 L59 -44 L58 -36 L50 -39Z" fill="${green ? "#55702a" : "#6b5a2e"}" stroke="${P.d}" stroke-width="1"/><path d="M-66 -7 L-61 5 L-56 0 Z" fill="#4a3a1c"/>` +
    (spot ? `<g fill="#6b4a1e" opacity=".85"><ellipse cx="30" cy="2" rx="4" ry="3"/><ellipse cx="10" cy="18" rx="5" ry="3.4"/><ellipse cx="-18" cy="22" rx="4" ry="3"/><ellipse cx="-40" cy="14" rx="3.4" ry="2.6"/><ellipse cx="44" cy="-18" rx="3" ry="4"/><circle cx="-4" cy="12" r="2"/><circle cx="22" cy="14" r="1.8"/><circle cx="-30" cy="24" r="1.8"/><circle cx="50" cy="-4" r="1.6"/></g>` : "");
  const sc = big ? 1.16 : small ? 0.62 : 1, rot = big ? -14 : small ? 24 : k.sig === "green" ? -32 : spot ? 12 : 0, flip = small || spot;
  return defs + shad(80, r2(102 + 50 * sc), r2(56 * sc)) + `<g transform="translate(80 100) rotate(${rot}) scale(${flip ? -sc : sc} ${sc})">${b}</g>`;
}
const CRUMB = { cake: "#8c5834", pizza: "#cf9440", banana: "#e9c85a" };
function plate(k, spec){
  const was = spec && spec.was, c = CRUMB[was && was.is] || "#9a6a3c";
  const T = k.cn ? k.tint() : null;
  let s = shad(80, 150, 66) + (T ? `<ellipse cx="80" cy="112" rx="70" ry="40" fill="${T.d}"/><ellipse cx="80" cy="108" rx="70" ry="40" fill="${T.a}" stroke="${T.d}" stroke-width="1.8"/><ellipse cx="80" cy="109" rx="47" ry="25" fill="${T.h}" stroke="${T.b}" stroke-width="1.4"/>`
    : `<ellipse cx="80" cy="112" rx="70" ry="40" fill="#c3c7cd"/><ellipse cx="80" cy="108" rx="70" ry="40" fill="#fcfcfa" stroke="#a4aab2" stroke-width="1.8"/><ellipse cx="80" cy="109" rx="47" ry="25" fill="#f1f3f5" stroke="#c9cdd3" stroke-width="1.4"/>`);
  if (was){ const g = document.createElementNS(NS, "g"); let b = null;
    try { const t = oneThing(Object.assign({}, was, { count: 1 })); b = measure(t); g.appendChild(t); } catch (e){}
    if (b){ const f = Math.min(92 / b.w, 84 / b.h), bx = 80 - (b.x + b.w / 2) * f, by = 118 - (b.y + b.h) * f;
      s += `<g opacity=".28" transform="translate(${r2(bx)} ${r2(by)}) scale(${r2(f)})">${g.innerHTML}</g>
        <rect x="${r2(77 - b.w * f / 2)}" y="${r2(115 - b.h * f)}" width="${r2(b.w * f + 6)}" height="${r2(b.h * f + 6)}" rx="16" fill="none" stroke="#7d848e" stroke-width="1.8" stroke-dasharray="5 5" opacity=".75"/>`; }
  }
  return s + `<g fill="${c}">` + [[58, 104, 3], [70, 116, 2.2], [88, 100, 2.6], [98, 114, 3.2], [80, 108, 1.8], [64, 96, 1.6], [106, 104, 2], [90, 120, 1.8], [50, 112, 1.8], [76, 98, 1.4], [112, 112, 1.5], [84, 114, 2.4]]
    .map((p, i) => `<ellipse cx="${p[0]}" cy="${p[1]}" rx="${p[2]}" ry="${r2(p[2] * 0.7)}" transform="rotate(${i * 40} ${p[0]} ${p[1]})"/>`).join("") + `</g>`;
}
/* --- a bus, seen from the side: a long box with a row of windows (a car has a cabin on a bonnet and a boot) --- */
function bus(k){
  const u = k.u, has = k.has, school = has("school"), dd = has("double-decker", "double"), long = has("long"), cn = k.cn;
  const P = k.tint(school ? "yellow" : "red"), retro = k.sig === "green", flip = k.sig === "orange";      // the live look lists ["green"] and ["orange"]; with any other word the colour only colours
  const defs = `<defs>${lgr(u + "b", P.a, P.b)}</defs>`, F = `fill="url(#${u}b)" stroke="${P.d}" stroke-width="1.8" stroke-linejoin="round"`;
  const wheel = (x, y) => `<circle cx="${x}" cy="${y}" r="12.5" fill="#26272c"/><circle cx="${x}" cy="${y}" r="5.6" fill="#d5d8dc" stroke="#8b8f96" stroke-width="1.4"/>`;
  const pane = (x, y, w, h) => `<rect x="${r2(x)}" y="${y}" width="${r2(w)}" height="${h}" rx="2.6" fill="#cfe6f5" stroke="${P.d}" stroke-width="1.3"/><path d="M${r2(x + 2.5)} ${y + h - 3} L${r2(x + Math.min(w, h) * 0.5)} ${y + 3}" stroke="#fff" stroke-width="1.6" opacity=".7" stroke-linecap="round"/>`;
  const row = (x0, x1, y, h, n) => Array.from({ length: n }, (_, i) => pane(x0 + (x1 - x0 + 4) * i / n, y, (x1 - x0 + 4) / n - 4, h)).join("");
  const door = (x, y0, y1) => `<rect x="${x}" y="${y0}" width="18" height="${y1 - y0}" rx="2" fill="${P.b}" stroke="${P.d}" stroke-width="1.3"/>` + pane(x + 2, y0 + 3, 6, y1 - y0 - 14) + pane(x + 10, y0 + 3, 6, y1 - y0 - 14);
  const lamp = (x, y) => `<rect x="${x - 4}" y="${y - 4}" width="6" height="8" rx="2" fill="#f6e08a" stroke="#8b8f96" stroke-width="1"/>`, tail = (x, y) => `<rect x="${x}" y="${y - 4}" width="4" height="8" rx="1.6" fill="#d63a32"/>`;
  let s;
  if (school) s = shad(80, 156, 72) + `<path d="M12 140 V66 Q12 58 20 58 H112 Q118 58 119 64 L124 100 H142 Q150 100 150 110 V140 Z" ${F}/>` + row(18, 98, 68, 21, 5) +
      `<path d="M104 68 H114 L118 96 H104Z" fill="#cfe6f5" stroke="${P.d}" stroke-width="1.3"/><path d="M12 100 H122 M12 112 H150" stroke="#2b2b30" stroke-width="2.6"/><rect x="10" y="134" width="142" height="7" rx="3" fill="#2b2b30"/>
       <path d="M56 113 l5 -5 h7 l5 5 v7 l-5 5 h-7 l-5 -5z" fill="#d63a32" stroke="#fff" stroke-width="1.5"/><circle cx="22" cy="62" r="3" fill="#d63a32"/><circle cx="108" cy="62" r="3" fill="#f0a020"/>` + lamp(150, 116) + wheel(40, 142) + wheel(128, 142);
  else if (dd) s = shad(80, 156, 68) + `<path d="M14 140 V40 Q14 30 24 30 H134 Q146 30 146 42 V140 Z" ${F}/>` + row(20, 140, 40, 24, 5) + row(20, 94, 84, 24, 3) + door(100, 82, 136) + pane(124, 84, 18, 26) +
      `<path d="M14 72 H146" stroke="${cn === "white" || !cn ? "#d8483f" : "#fff"}" stroke-width="6"/><path d="M14 118 H98" stroke="${P.d}" stroke-width="1.4" opacity=".5"/><rect x="12" y="134" width="136" height="7" rx="3" fill="#3d424c"/>` + lamp(146, 122) + tail(14, 122) + wheel(40, 142) + wheel(84, 142);
  else if (long) s = shad(80, 150, 76) + `<path d="M6 134 V84 Q6 76 14 76 H136 Q146 76 150 88 L154 104 V134 Z" ${F}/>` + row(12, 126, 84, 18, 7) + `<path d="M132 84 H140 Q144 86 147 96 L148 102 H132Z" fill="#cfe6f5" stroke="${P.d}" stroke-width="1.3"/>
       <path d="M6 112 Q60 104 154 116" stroke="#fff" stroke-width="3.4" fill="none" opacity=".85"/><rect x="4" y="129" width="152" height="6" rx="3" fill="#3d424c"/>` + lamp(154, 118) + tail(6, 116) + wheel(28, 136) + wheel(54, 136) + wheel(128, 136);
  else if (retro) s = shad(80, 154, 62) + `<path d="M22 138 V92 Q22 60 54 60 H112 Q138 60 140 92 V138 Z" ${F}/><path d="M26 78 Q32 62 54 62 H112 Q132 62 136 78 Z" fill="${TINT.cream[0]}" stroke="${P.d}" stroke-width="1.3"/>` + row(30, 106, 82, 24, 3) + pane(112, 82, 24, 24) +
      `<path d="M22 114 H140" stroke="${TINT.cream[0]}" stroke-width="4"/><circle cx="136" cy="124" r="5" fill="#f6e08a" stroke="#8b8f96" stroke-width="1.2"/><rect x="18" y="133" width="126" height="6" rx="3" fill="#d5d8dc" stroke="#8b8f96" stroke-width="1"/>` + tail(22, 122) + wheel(46, 140) + wheel(114, 140);
  else s = shad(80, 156, 72) + `<path d="M10 140 V68 Q10 58 20 58 H140 Q150 58 150 68 V140 Z" ${F}/><path d="M12 62 H148" stroke="#fff" stroke-width="3" opacity=".45" stroke-linecap="round"/>` + row(16, flip ? 82 : 104, 70, 26, flip ? 3 : 4) + (flip ? door(86, 68, 136) : "") + door(110, 68, 136) + pane(132, 70, 14, 34) +
      `<path d="M10 110 H${flip ? 84 : 108}" stroke="#fff" stroke-width="3.4" opacity=".85"/><rect x="8" y="134" width="144" height="7" rx="3" fill="#3d424c"/>` + lamp(150, 122) + tail(10, 122) + wheel(flip ? 34 : 42, 142) + wheel(flip ? 66 : 96, 142);
  return defs + (flip ? `<g transform="translate(160 0) scale(-1 1)">${s}</g>` : s);
}
/* --- furniture --- */
const stick = (x0, y0, x1, y1, w, P, far) => `<path d="M${x0} ${y0} L${x1} ${y1}" stroke="${P.d}" stroke-width="${w + 2.6}" stroke-linecap="round"/><path d="M${x0} ${y0} L${x1} ${y1}" stroke="${far ? P.b : P.a}" stroke-width="${w - 0.4}" stroke-linecap="round"/>`;
function table(k){
  const u = k.u, has = k.has, gl = has("glass"), garden = has("garden"), low = has("low"), long = has("long", "dining"), round = has("round") || garden;
  const P = gl ? STEEL : k.tint(garden ? "green" : low ? ["#a8774c", "#7c5230"] : k.cn ? "wooden" : "wooden"), defs = `<defs>${lgr(u + "t", P.h, P.a)}</defs>`, T = `fill="url(#${u}t)" stroke="${P.d}" stroke-width="1.8" stroke-linejoin="round"`;
  const leg = (x, y0, y1, far) => stick(x, y0, x, y1, 7, P, far);
  if (garden) return defs + shad(80, 172, 50) + stick(80, 96, 80, 150, 6, P, 1) + stick(80, 150, 44, 168, 6, P) + stick(80, 150, 116, 168, 6, P) + stick(80, 150, 84, 172, 6, P) +
      `<path d="M24 92 v6 A56 18 0 0 0 136 98 v-6Z" fill="${P.b}" stroke="${P.d}" stroke-width="1.8"/><ellipse cx="80" cy="92" rx="56" ry="18" ${T}/><path d="M32 84 H128 M25 92 H135 M32 100 H128" stroke="${P.d}" stroke-width="1.2" opacity=".55"/>
       <path d="M80 92 V20" stroke="#8b8f96" stroke-width="4.6"/><path d="M80 92 V20" stroke="#e6e9ed" stroke-width="1.6"/>
       <path d="M18 52 Q26 8 80 6 Q134 8 142 52 Q126.5 44 111 52 Q95.5 44 80 52 Q64.5 44 49 52 Q33.5 44 18 52 Z" fill="#fbfaf5" stroke="${P.d}" stroke-width="1.6" stroke-linejoin="round"/>
       <path d="M80 6 Q26 8 18 52 Q33.5 44 49 52 Q54 20 80 6Z M80 6 Q106 20 111 52 Q95.5 44 80 52 Z" fill="${P.a}"/><circle cx="80" cy="6" r="3" fill="${P.d}"/>`;
  if (round) return defs + shad(80, 170, 58) + leg(54, 98, 150, 1) + leg(106, 98, 150, 1) + leg(38, 100, 166) + leg(122, 100, 166) +
      `<path d="M16 84 v8 A64 21 0 0 0 144 92 v-8Z" fill="${P.b}" stroke="${P.d}" stroke-width="1.8"/><ellipse cx="80" cy="84" rx="64" ry="21" ${T}/><path d="M36 80 Q80 68 124 80 M30 90 Q80 78 130 90" stroke="${P.b}" stroke-width="1.3" fill="none" opacity=".6"/>`;
  const G = long ? { b: [30, 130, 76], f: [4, 156, 100], th: 8, fl: [11, 149, 168], bl: [36, 124, 148] } : low ? { b: [48, 112, 104], f: [26, 134, 124], th: 7, fl: [32, 128, 156], bl: [52, 108, 146] }
    : gl ? { b: [40, 120, 76], f: [12, 148, 102], th: 5, fl: [20, 140, 166], bl: [46, 114, 146] } : { b: [44, 116, 72], f: [18, 142, 98], th: 8, fl: [25, 135, 166], bl: [49, 111, 146] };
  const top = `M${G.f[0]} ${G.f[2]} L${G.b[0]} ${G.b[2]} H${G.b[1]} L${G.f[1]} ${G.f[2]} Z`, y = G.f[2];
  const legs = leg(G.bl[0], G.b[2] + 6, G.bl[2], 1) + leg(G.bl[1], G.b[2] + 6, G.bl[2], 1) + (k.under || "") + leg(G.fl[0], y + G.th, G.fl[2]) + leg(G.fl[1], y + G.th, G.fl[2]);
  if (gl) return defs + shad(80, 170, 66) + legs + `<path d="M${G.f[0]} ${y} v${G.th} H${G.f[1]} v-${G.th}Z" fill="#8fc0dd" stroke="#557fa8" stroke-width="1.6"/><path d="${top}" fill="#bfe2f5" fill-opacity=".72" stroke="#557fa8" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M40 96 L62 80 M52 96 L70 83 M96 96 L116 80" stroke="#fff" stroke-width="3.6" stroke-linecap="round" opacity=".9"/>`;
  return defs + shad(80, G.fl[2] + 4, (G.f[1] - G.f[0]) * 0.46) + legs + (low ? `<path d="M36 142 H124 L110 134 H50Z" fill="${P.b}" stroke="${P.d}" stroke-width="1.5" stroke-linejoin="round"/>` : "") +
    `<path d="M${G.f[0]} ${y} v${G.th} H${G.f[1]} v-${G.th}Z" fill="${P.b}" stroke="${P.d}" stroke-width="1.8" stroke-linejoin="round"/><path d="${top}" ${T}/>` +
    (long ? [40, 80, 120].map(x => `<ellipse cx="${x}" cy="88" rx="14" ry="5" fill="#fcfcfa" stroke="#a4aab2" stroke-width="1.3"/><ellipse cx="${x}" cy="88" rx="8.5" ry="2.8" fill="none" stroke="#c9cdd3" stroke-width="1"/>`).join("") : "");
}
function chair(k){
  const u = k.u, has = k.has, office = has("office"), fold = has("folding"), plastic = has("plastic"), kitchen = has("kitchen"), garden = has("garden");
  const P = k.tint(office ? "black" : plastic ? "red" : fold ? "blue" : garden ? "green" : kitchen ? "white" : "wooden"), defs = `<defs>${lgr(u + "c", P.h, P.a)}${lgr(u + "d", P.a, P.b)}</defs>`, st = `stroke="${P.d}" stroke-width="1.7" stroke-linejoin="round"`;
  const S = (x0, y0, x1, y1, far, w) => stick(x0, y0, x1, y1, w || 6, P, far), M = (x0, y0, x1, y1, far) => stick(x0, y0, x1, y1, 4, STEEL, far);
  if (office) return defs + shad(80, 178, 50) + [[44, 172], [116, 172], [62, 178], [98, 178]].map(p => M(80, 160, p[0], p[1]) + `<circle cx="${p[0]}" cy="${p[1] + 3}" r="4.6" fill="#26272c"/>`).join("") + M(80, 128, 80, 160) +
      `<path d="M74 104 Q70 118 76 126 H88 Q94 118 90 104Z" fill="${P.b}" ${st}/><path d="M52 44 Q80 32 108 44 Q116 76 108 102 Q80 110 52 102 Q44 76 52 44Z" fill="url(#${u}d)" ${st}/><path d="M60 52 Q80 44 100 52" stroke="${P.h}" stroke-width="3" fill="none" opacity=".35" stroke-linecap="round"/>
       <path d="M42 120 Q42 112 52 112 H108 Q118 112 118 120 Q118 132 106 132 H54 Q42 132 42 120Z" fill="url(#${u}c)" ${st}/>` + [36, 124].map(x => `<path d="M${x} 98 V122" stroke="${P.d}" stroke-width="4.6" stroke-linecap="round"/><rect x="${x - 9}" y="90" width="18" height="8" rx="4" fill="${P.a}" ${st}/>`).join("");
  if (fold) return defs + shad(84, 180, 58) + M(54, 164, 122, 28, 1) + M(136, 164, 68, 96, 1) + `<path d="M44 108 L68 96 H126 L102 108Z" fill="url(#${u}c)" ${st}/><path d="M44 108 H102 v6 H44Z" fill="${P.b}" ${st}/>
       <path d="M95 46 L119 34 L106 60 L82 72Z" fill="url(#${u}d)" ${st}/>` + M(30, 176, 98, 40) + M(112, 176, 44, 110);
  if (plastic) return defs + shad(82, 178, 48) + M(64, 110, 60, 150, 1) + M(120, 112, 126, 158, 1) + M(42, 126, 34, 176) + M(98, 132, 102, 180) +
      `<path d="M62 104 Q54 66 60 44 Q62 32 76 33 L112 38 Q124 40 124 54 Q126 84 122 110 Z" fill="url(#${u}d)" ${st}/><rect x="80" y="44" width="26" height="8" rx="4" fill="#fff" stroke="${P.d}" stroke-width="1.4" transform="rotate(6 93 48)"/>
       <path d="M36 122 Q34 114 46 110 L64 102 L122 108 Q126 118 116 124 L100 134 Q94 138 84 136 L42 130 Q36 128 36 122Z" fill="url(#${u}c)" ${st}/>`;
  // a chair with four legs and two posts: wooden (spindles), kitchen (ladder back, rush seat), garden (slats and arms)
  let s = shad(82, 180, 50) + S(64, 104, 64, 150, 1) + S(122, 108, 122, 158, 1) + S(64, 104, 60, 36, 0, 6.5) + S(122, 108, 118, 42, 0, 6.5);
  if (garden) s += [48, 62, 76, 90].map(y => `<path d="M60.5 ${y - 6} L118.5 ${y} v9 L60.5 ${y + 3}Z" fill="url(#${u}c)" ${st}/>`).join("");
  else if (kitchen) s += [46, 64, 82].map(y => `<path d="M61 ${y} Q90 ${y - 3} 119 ${y + 6} v8 Q90 ${y + 5} 61 ${y + 8}Z" fill="url(#${u}c)" ${st}/>`).join("");
  else s += S(74, 44, 76, 100, 1, 3.6) + S(90, 46, 92, 102, 1, 3.6) + S(105, 47, 107, 104, 1, 3.6) + `<path d="M56 34 Q90 28 122 40 v11 Q90 39 56 45Z" fill="url(#${u}c)" ${st}/>`;
  s += (k.under || "") + S(40, 128, 40, 176) + S(98, 134, 98, 182) + (garden ? "" : S(40, 158, 98, 164, 0, 3.6)) + `<path d="M40 124 L64 102 L122 108 L98 130Z" fill="${kitchen ? "#e8cf96" : `url(#${u}c)`}" ${st}/><path d="M40 124 L98 130 L122 108 v7 L98 137 L40 131Z" fill="${P.b}" ${st}/>`;
  if (kitchen) s += `<path d="M52 113 L110 119 M46 119 L104 125 M58 108 L116 114 M69 103 L46 126 M98 107 L72 129 M118 110 L94 131" stroke="#b9975a" stroke-width="1.2" opacity=".8"/>`;
  if (garden) s += `<path d="M48 117 L106 123 M56 110 L114 116" stroke="${P.d}" stroke-width="1.4" opacity=".6"/>` + S(40, 128, 40, 98) + S(98, 134, 98, 104) + S(36, 97, 64, 80, 0, 5) + S(94, 103, 122, 86, 0, 5);
  return defs + s;
}
/* --- bags have handles and soft sides; boxes have corners and three faces --- */
function bag(k){
  const u = k.u, has = k.has, pack = has("backpack"), shop = has("shopping"), hand = has("handbag"), sport = has("sports", "sport"), paper = has("paper");
  const P = paper && !k.cn ? KRAFT : k.tint(pack ? "red" : shop ? "blue" : hand ? "black" : sport ? "green" : "brown"), defs = `<defs>${lgr(u + "g", P.a, P.b)}</defs>`, F = `fill="url(#${u}g)" stroke="${P.d}" stroke-width="1.8" stroke-linejoin="round"`;
  const loop = (d, w, far) => `<path d="${d}" stroke="${P.d}" stroke-width="${w + 3}" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${far ? P.b : P.a}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`, GOLD = `fill="#f2d268" stroke="#a07c1c" stroke-width="1.2"`;
  if (paper) return defs + shad(84, 168, 46) + loop("M70 62 Q70 38 88 38 Q106 38 106 62", 2.4, 1) + `<path d="M40 70 L58 60 H130 L112 70Z" fill="${P.d}"/><path d="M112 70 L130 60 V154 L112 164Z" fill="${P.b}" stroke="${P.d}" stroke-width="1.8" stroke-linejoin="round"/>
       <path d="M121 65 V159 M112 110 L121 100 L130 108" stroke="${P.d}" stroke-width="1.2" fill="none" opacity=".7"/><path d="M40 70 l6 -4 l6 4 l6 -4 l6 4 l6 -4 l6 4 l6 -4 l6 4 l6 -4 l6 4 l6 -4 l6 4 V164 H40Z" ${F}/>
       <path d="M40 150 H112" stroke="${P.d}" stroke-width="1.2" opacity=".5"/>` + loop("M56 70 Q56 44 76 44 Q96 44 96 70", 2.4);
  if (pack) return defs + shad(80, 172, 46) + loop("M46 60 Q26 100 36 152", 6, 1) + loop("M114 60 Q134 100 124 152", 6, 1) + loop("M70 38 q0 -16 10 -16 q10 0 10 16", 3.4) +
      `<path d="M40 160 V78 Q40 34 80 34 Q120 34 120 78 V160 Q120 168 112 168 H48 Q40 168 40 160Z" ${F}/><path d="M48 86 Q80 54 112 86" stroke="${P.d}" stroke-width="2" fill="none" stroke-dasharray="3 3"/><rect x="108" y="82" width="5" height="11" rx="2" fill="#d5d8dc" stroke="#6d737c" stroke-width="1"/>
       <rect x="52" y="104" width="56" height="54" rx="10" fill="${P.b}" stroke="${P.d}" stroke-width="1.6"/><path d="M58 118 H102" stroke="${P.d}" stroke-width="2" stroke-dasharray="3 3"/><rect x="60" y="114" width="5" height="11" rx="2" fill="#d5d8dc" stroke="#6d737c" stroke-width="1"/>
       <path d="M52 50 Q62 40 76 38" stroke="#fff" stroke-width="3.4" fill="none" opacity=".35" stroke-linecap="round"/><rect x="66" y="134" width="28" height="6" rx="3" fill="#e9e9e4" opacity=".85"/>`;
  if (shop) return defs + shad(80, 172, 48) + loop("M58 80 Q58 34 84 34 Q110 34 110 80", 4, 1) +
      `<path d="M92 84 L112 22 Q118 14 124 22 L112 88Z" fill="#e2b06c" stroke="#a9763a" stroke-width="1.5" stroke-linejoin="round"/><path d="M106 44 l10 3 M103 56 l10 3 M100 68 l10 3" stroke="#a9763a" stroke-width="1.6" stroke-linecap="round"/>
       <path d="M62 84 Q50 50 40 38 Q56 42 66 60 Q64 36 70 22 Q80 44 76 84Z" fill="#5aa86d" stroke="#3f8551" stroke-width="1.4" stroke-linejoin="round"/><circle cx="86" cy="72" r="11" fill="#e0574c" stroke="#ad332c" stroke-width="1.4"/>
       <path d="M28 76 H132 L123 162 Q80 172 37 162 Z" ${F}/><path d="M28 76 H132 l-1 9 H29Z" fill="${P.b}" opacity=".7"/>` + loop("M50 80 Q50 40 76 40 Q102 40 102 80", 4) + `<path d="M40 92 L46 156" stroke="#fff" stroke-width="3.4" opacity=".3" stroke-linecap="round"/>`;
  if (hand) return defs + shad(80, 166, 52) + loop("M54 98 Q54 44 80 44 Q106 44 106 98", 4.4) + `<path d="M34 96 Q80 86 126 96 L134 150 Q134 160 124 160 H36 Q26 160 26 150 Z" ${F}/><path d="M34 96 Q80 86 126 96 L124 116 Q80 138 36 116 Z" fill="${P.b}" stroke="${P.d}" stroke-width="1.6" stroke-linejoin="round"/>
       <circle cx="80" cy="127" r="6.5" ${GOLD}/><circle cx="54" cy="96" r="4" ${GOLD}/><circle cx="106" cy="96" r="4" ${GOLD}/><path d="M36 128 L32 150" stroke="${P.h}" stroke-width="3" opacity=".3" stroke-linecap="round"/>`;
  if (sport) return defs + shad(80, 160, 62) + loop("M50 100 Q52 54 82 54 Q112 54 112 100", 4.4, 1) + `<rect x="14" y="82" width="132" height="68" rx="30" ${F}/><path d="M124 86 Q146 90 146 116 Q146 142 124 146 Q112 116 124 86Z" fill="${P.b}" stroke="${P.d}" stroke-width="1.5"/>
       <path d="M30 94 H116" stroke="${P.d}" stroke-width="2" stroke-dasharray="3 3"/><path d="M42 96 V148 M100 96 V148" stroke="#fbfaf5" stroke-width="7"/>` + loop("M42 104 Q44 62 71 62 Q98 62 100 104", 4.4) + `<rect x="60" y="56" width="22" height="11" rx="5" fill="#3d424c"/>`;
  // a leather satchel: flap, two straps with buckles, a handle
  return defs + shad(80, 166, 54) + loop("M62 78 q0 -24 18 -24 q18 0 18 24", 4.4) + `<rect x="26" y="74" width="108" height="86" rx="11" ${F}/><path d="M26 86 Q26 74 38 74 H122 Q134 74 134 86 V110 Q80 132 26 110Z" fill="${P.a}" stroke="${P.d}" stroke-width="1.8" stroke-linejoin="round"/>
     <path d="M31 107 Q80 126 129 107" stroke="${P.h}" stroke-width="1.3" fill="none" stroke-dasharray="3 3" opacity=".8"/>` + [48, 102].map(x => `<rect x="${x}" y="74" width="10" height="64" rx="2" fill="${P.b}" stroke="${P.d}" stroke-width="1.3"/><rect x="${x - 2.5}" y="118" width="15" height="12" rx="2.5" fill="none" stroke="#e3c04e" stroke-width="3"/>`).join("") +
    `<path d="M34 142 Q34 152 44 152" stroke="${P.h}" stroke-width="2.4" fill="none" opacity=".4" stroke-linecap="round"/>`;
}
const cub = (x, y, w, h, dx, dy) => [`M${x} ${y} h${w} v${h} h${-w}Z`, `M${x} ${y} l${dx} ${-dy} h${w} l${-dx} ${dy}Z`, `M${x + w} ${y} l${dx} ${-dy} v${h} l${-dx} ${dy}Z`];
function box(k){
  const u = k.u, has = k.has, gift = has("gift"), plastic = has("plastic"), wood = has("wooden"), metal = has("metal"), open = has("open");
  const P = metal && !k.cn ? STEEL : (wood || !(gift || plastic)) && !k.cn ? (wood ? WOOD : KRAFT) : k.tint(gift ? "red" : "blue"), st = `stroke="${P.d}" stroke-width="1.8" stroke-linejoin="round"`;
  const defs = `<defs>${lgr(u + "f", P.a, tone(P.a, -0.1))}</defs>`, faces = (c, top) => `<path d="${c[2]}" fill="${P.b}" ${st}/><path d="${c[0]}" fill="url(#${u}f)" ${st}/><path d="${c[1]}" fill="${top || P.h}" ${st}/>`;
  if (gift){ const R = k.cn === "yellow" || k.cn === "gold" ? pal(COL.red) : pal(TINT.gold), rb = `fill="${R.a}" stroke="${R.d}" stroke-width="1.2" stroke-linejoin="round"`;
    return defs + shad(84, 162, 54) + faces(cub(36, 96, 72, 62, 24, 18)) + `<path d="M65 96 h14 v62 h-14z M118 81.5 l8.4 -6.3 v62 l-8.4 6.300z" ${rb}/>` + faces(cub(31, 82, 82, 16, 27, 20)) +
      `<path d="M65 82 l27 -20 h14 l-27 20z M43 73 l13.5 -6 h82 l-13.5 6z M65 82 h14 v16 h-14z" ${rb}/>
       <path d="M86 68 C70 40 44 46 52 60 C58 70 76 70 86 68Z M86 68 C102 40 128 46 120 60 C114 70 96 70 86 68Z" ${rb}/><path d="M86 68 l-14 18 l10 -2 l4 -8z M86 68 l14 18 l-10 -2 l-4 -8z" ${rb}/><circle cx="86" cy="67" r="6" ${rb}/>`; }
  if (plastic) return defs + shad(84, 164, 56) + `<path d="M116 86 L140 70 L134 142 L110 158Z" fill="${P.b}" fill-opacity=".85" ${st}/><path d="M30 86 H116 L110 158 H36Z" fill="${P.a}" fill-opacity=".8" ${st}/>
      <path d="M44 96 L48 150 M60 96 L62 150" stroke="#fff" stroke-width="3" opacity=".45" stroke-linecap="round"/><path d="M34 122 H113" stroke="${P.d}" stroke-width="1.2" opacity=".5"/>` + faces(cub(25, 76, 96, 11, 26, 17), P.a) +
      `<rect x="62" y="74" width="22" height="16" rx="3" fill="${P.b}" ${st}/><path d="M124 71 l12 -8 v12 l-12 8z" fill="${P.d}"/>`;
  if (wood){ const c = cub(30, 84, 82, 72, 28, 20); let s = defs + shad(84, 162, 56) + `<path d="${c[1]}" fill="#5c4027" ${st}/><path d="M58 64 h82 v14 h-98z" fill="${P.b}" opacity=".8"/>`;
    for (let i = 0; i < 4; i++){ const y = 84 + i * 18.7; s += `<path d="M112 ${y} l28 -20 v15 l-28 20z" fill="${P.b}" ${st}/><path d="M30 ${y} h82 v15 h-82z" fill="url(#${u}f)" ${st}/><path d="M36 ${y + 5} h60 M44 ${y + 10} h62" stroke="${P.b}" stroke-width="1" opacity=".7"/>`; }
    return s + `<path d="M30 84 h10 v72 h-10z M102 84 h10 v72 h-10z" fill="${P.a}" ${st}/><g fill="${P.d}"><circle cx="35" cy="92" r="1.5"/><circle cx="35" cy="148" r="1.5"/><circle cx="107" cy="92" r="1.5"/><circle cx="107" cy="148" r="1.5"/><circle cx="35" cy="120" r="1.5"/><circle cx="107" cy="120" r="1.5"/></g>`; }
  if (metal) return defs + shad(84, 160, 44) + faces(cub(44, 112, 66, 40, 22, 15)) + faces(cub(44, 100, 66, 12, 22, 15)) + `<path d="M70 92 q0 -12 18 -12 q18 0 18 12" stroke="${P.d}" stroke-width="4.6" fill="none" stroke-linecap="round"/>
      <rect x="70" y="106" width="14" height="14" rx="3" fill="${P.b}" ${st}/><circle cx="77" cy="112" r="2" fill="#2b2b30"/><path d="M77 112 v5" stroke="#2b2b30" stroke-width="1.6"/><path d="M50 122 V146" stroke="#fff" stroke-width="3" opacity=".7" stroke-linecap="round"/>`;
  if (open){ const c = cub(20, 96, 96, 66, 34, 26);
    return defs + shad(84, 168, 66) + `<path d="M54 70 h96 l4 -30 h-96z" fill="${P.a}" ${st}/><path d="${c[1]}" fill="#8a6a3c" ${st}/><path d="M54 70 h96 v14 h-114z" fill="#6f5430" opacity=".6"/><path d="M20 96 L54 70 L32 58 L2 82Z" fill="${P.h}" ${st}/>${k.inside || ""}
      <path d="${c[2]}" fill="${P.b}" ${st}/><path d="M116 96 L150 70 L158 92 L128 116Z" fill="${P.a}" ${st}/><path d="${c[0]}" fill="url(#${u}f)" ${st}/><path d="M20 96 h96 l6 22 h-108z" fill="${P.h}" ${st}/>`; }
  const c = cub(26, 88, 84, 68, 30, 22);
  return defs + shad(84, 162, 58) + faces(c) + `<path d="M41 77 h84" stroke="${P.d}" stroke-width="1.4"/><path d="M61 88 l30 -22 h13 l-30 22z M61 88 h13 v24 h-13z" fill="#f1e2b4" stroke="#b9a468" stroke-width="1.2" stroke-linejoin="round"/>
    <path d="M32 146 h20 M32 140 h12" stroke="${P.d}" stroke-width="1.6" opacity=".5"/>`;
}
/* --- a house (the whole building on its grass), a door (tall, to the floor, with a handle and a step), a window (glass, a sill) --- */
const paneRect = (x, y, w, h, F, nx, ny) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.5" fill="#bfe0f2" stroke="${F.a}" stroke-width="3.4"/><rect x="${x - 1.7}" y="${y - 1.7}" width="${w + 3.4}" height="${h + 3.4}" rx="2.5" fill="none" stroke="${F.d}" stroke-width="1.2"/>` +
  `<path d="M${x + 2} ${y + h * 0.7} L${x + w * 0.45} ${y + 2}" stroke="#fff" stroke-width="${r2(Math.min(w, h) * 0.12)}" opacity=".75" stroke-linecap="round"/>` +
  Array.from({ length: (nx || 1) - 1 }, (_, i) => `<path d="M${r2(x + w * (i + 1) / nx)} ${y} v${h}" stroke="${F.a}" stroke-width="2.6"/>`).join("") + Array.from({ length: (ny || 1) - 1 }, (_, i) => `<path d="M${x} ${r2(y + h * (i + 1) / ny)} h${w}" stroke="${F.a}" stroke-width="2.6"/>`).join("");
const WHITE = pal(COL.white), SLATE = pal(["#74808f", "#4c5563"]), STONE = { a: "#e4e0d6", b: "#c9c5bb", d: "#8f8b82", h: "#f4f2ec" };
function house(k){
  const u = k.u, has = k.has, small = has("small"), tall = has("tall"), cottage = has("cottage"), wooden = has("wooden"), stone = has("stone"), brick = has("brick"), roofWord = has("roof");
  const W = roofWord ? pal(TINT.cream) : k.tint(brick ? "brick" : cottage ? "yellow" : wooden ? "blue" : stone ? "grey" : small ? "white" : "cream");
  const R = roofWord ? k.tint("red") : cottage ? pal(["#d2ab66", "#a37c3c"]) : stone || wooden || small || brick || k.cn ? SLATE : pal(COL.red);      // a coloured house: the walls are that colour, the roof slate
  const defs = `<defs>${lgr(u + "w", W.a, tone(W.a, -0.08))}${lgr(u + "r", R.a, R.b)}</defs>`, wf = `fill="url(#${u}w)" stroke="${W.d}" stroke-width="1.7" stroke-linejoin="round"`, rf = `fill="url(#${u}r)" stroke="${R.d}" stroke-width="1.7" stroke-linejoin="round"`;
  const grass = `<path d="M6 164 Q80 150 154 164 Q154 172 80 172 Q6 172 6 164Z" fill="#9ccf7a"/>`, D = (x, y, w, h, c, arch) => { const p = pal(c); return `<path d="M${x} ${y + h} V${y + (arch ? w / 2 : 0)} ${arch ? `A${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + w / 2}` : `H${x + w}`} V${y + h}Z" fill="${p.a}" stroke="${p.d}" stroke-width="1.5"/><circle cx="${x + w - 4}" cy="${y + h * 0.55}" r="1.8" fill="#f2d268"/>`; };
  const win = (x, y, w, h) => paneRect(x, y, w, h, WHITE, 2, 2), chim = (x, y, h) => `<rect x="${x}" y="${y}" width="13" height="${h}" fill="${TINT.brick[0]}" stroke="${TINT.brick[1]}" stroke-width="1.5"/><rect x="${x - 2}" y="${y - 4}" width="17" height="6" rx="1.5" fill="${TINT.brick[1]}"/>`;
  if (tall){ let rows = ""; for (let i = 0; i < 13; i++) rows += `<path d="M50 ${59 + i * 8} H110" stroke="${W.a}" stroke-width="6" stroke-dasharray="11 1.6" stroke-dashoffset="${i % 2 ? 6 : 0}"/>`;
    return defs + grass + chim(92, 22, 24) + `<rect x="50" y="54" width="60" height="108" fill="${brick || !k.cn ? "#e6cdbb" : W.h}" stroke="${W.d}" stroke-width="1.7"/>${rows}<rect x="50" y="54" width="60" height="108" fill="none" stroke="${W.d}" stroke-width="1.7"/>
      <path d="M42 56 L80 24 L118 56Z" ${rf}/>` + win(58, 64, 15, 18) + win(87, 64, 15, 18) + win(58, 94, 15, 18) + win(87, 94, 15, 18) + win(87, 126, 15, 20) + D(57, 128, 17, 34, COL.navy) + `<rect x="53" y="160" width="25" height="5" fill="${STONE.b}" stroke="${STONE.d}" stroke-width="1"/>`; }
  if (cottage) return defs + grass + chim(104, 44, 26) + `<g fill="#c3c7cd" opacity=".8"><circle cx="112" cy="32" r="6"/><circle cx="120" cy="20" r="8"/><circle cx="132" cy="9" r="6"/></g><rect x="30" y="102" width="100" height="60" ${wf}/>` + D(71, 122, 18, 40, COL.green, 1) + win(40, 120, 19, 18) + win(101, 120, 19, 18) +
      `<path d="M16 112 Q18 62 80 50 Q142 62 144 112 Q128 100 112 108 Q96 98 80 106 Q64 98 48 108 Q32 100 16 112Z" ${rf}/><path d="M36 92 Q40 74 56 66 M62 96 Q64 76 74 62 M98 96 Q96 76 86 62 M124 92 Q120 74 104 66 M80 98 V60" stroke="${R.d}" stroke-width="1.2" fill="none" opacity=".55"/>` +
      [36, 48, 60, 100, 112, 124].map((x, i) => `<path d="M${x} 163 v-7" stroke="#3f8551" stroke-width="2"/><circle cx="${x}" cy="155" r="3.6" fill="${["#e0574c", "#f0c648", "#e88fb0"][i % 3]}"/>`).join("");
  if (small) return defs + grass + chim(98, 78, 20) + `<rect x="44" y="110" width="72" height="52" ${wf}/><path d="M34 112 L54 82 H106 L126 112Z" ${rf}/>` + D(54, 128, 17, 34, COL.red) + win(84, 124, 21, 19);
  let wall = `<rect x="34" y="92" width="92" height="70" ${wf}/>`, roof = `<path d="M22 96 L80 42 L138 96 Z" ${rf}/>`, front = D(70, 124, 20, 38, [WOOD.b, WOOD.d]) + win(42, 106, 20, 22) + win(98, 106, 20, 22) + `<circle cx="80" cy="76" r="7.5" fill="#bfe0f2" stroke="#fff" stroke-width="2.6"/><circle cx="80" cy="76" r="8.8" fill="none" stroke="${R.d}" stroke-width="1.2"/>`;
  if (wooden){ for (let y = 101; y < 160; y += 9) wall += `<path d="M34 ${y} H126" stroke="${W.d}" stroke-width="1.2" opacity=".5"/>`;
    wall += `<path d="M34 92 h5 v70 h-5z M121 92 h5 v70 h-5z" fill="#fbfaf5" stroke="${W.d}" stroke-width="1"/>`; roof += `<path d="M22 96 L80 42 L138 96" fill="none" stroke="#fbfaf5" stroke-width="4" stroke-linejoin="round"/><path d="M22 96 L80 42 L138 96" fill="none" stroke="${R.d}" stroke-width="1" stroke-linejoin="round" transform="translate(0 -2.5)"/>`;
    front = `<path d="M60 124 L64 114 H96 L100 124Z" fill="#fbfaf5" stroke="${W.d}" stroke-width="1.3"/><path d="M63 124 V162 M97 124 V162" stroke="#fbfaf5" stroke-width="4"/><path d="M61 124 V162 M65 124 V162 M95 124 V162 M99 124 V162" stroke="${W.d}" stroke-width=".8"/>` + D(71, 128, 18, 34, COL.white) + win(42, 108, 16, 22) + win(102, 108, 16, 22) + `<rect x="58" y="160" width="44" height="5" fill="#fbfaf5" stroke="${W.d}" stroke-width="1"/>`; }
  if (stone){ wall += [[38, 96, 16, 9], [58, 95, 20, 10], [82, 96, 15, 9], [101, 95, 21, 10], [36, 138, 14, 10], [54, 150, 14, 9], [96, 150, 14, 9], [110, 138, 14, 10], [36, 152, 14, 8], [112, 151, 12, 9], [64, 108, 8, 12], [88, 110, 8, 10], [38, 128, 6, 8], [118, 128, 6, 8]]
      .map((r, i) => `<rect x="${r[0]}" y="${r[1]}" width="${r[2]}" height="${r[3]}" rx="3.5" fill="${i % 2 ? W.b : W.h}" stroke="${W.d}" stroke-width="1" opacity=".8"/>`).join("");
    roof = chim(40, 40, 20) + chim(107, 40, 20) + `<path d="M22 94 L46 50 H114 L138 94Z" ${rf}/><path d="M38 64 H122 M30 79 H130" stroke="${R.d}" stroke-width="1.1" opacity=".6"/>`; front = D(70, 122, 20, 40, [WOOD.b, WOOD.d], 1) + win(42, 108, 19, 22) + win(99, 108, 19, 22); }
  return defs + grass + (stone ? "" : chim(102, 50, 30)) + wall + roof + front;
}
function door(k){
  const u = k.u, has = k.has, big = has("big"), old = has("old"), glazed = has("window"), wooden = has("wooden"), white = k.sig === "white", red = !big && !old && !glazed && !wooden && !white;
  const P = k.tint(wooden ? "brown" : "red"), defs = `<defs>${lgr(u + "d", P.a, P.b, 1)}</defs>`, F = `fill="url(#${u}d)" stroke="${P.d}" stroke-width="1.7" stroke-linejoin="round"`, FR = white ? { a: "#cfc8ba", b: "#b3ab9b", d: "#7e7768" } : STONE;
  const pan = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.5" fill="${P.b}" stroke="${P.d}" stroke-width="1.2"/><path d="M${x + 1.5} ${y + h - 1.5} V${y + 1.5} H${x + w - 1.5}" stroke="${P.h}" stroke-width="1.2" fill="none" opacity=".5"/>`;
  const GOLD = `fill="#f2d268" stroke="#a07c1c" stroke-width="1.1"`, step = (x0, x1) => shad(80, 178, (x1 - x0) / 2 + 4) + `<rect x="${x0}" y="166" width="${x1 - x0}" height="9" rx="1.5" fill="${STONE.b}" stroke="${STONE.d}" stroke-width="1.4"/>`;
  const frame = (x, y, w) => `<rect x="${x}" y="${y}" width="${w}" height="${166 - y}" fill="${FR.a}" stroke="${FR.d}" stroke-width="1.6"/><rect x="${x + 6}" y="${y + 6}" width="${w - 12}" height="${160 - y}" ${F}/>`;
  if (big) return defs + step(18, 142) + frame(26, 22, 108) + `<path d="M80 28 V166" stroke="${P.d}" stroke-width="2"/>` + [36, 85].map(x => pan(x, 36, 39, 50) + pan(x, 96, 39, 60)).join("") +
      `<circle cx="74" cy="100" r="4" ${GOLD}/><circle cx="86" cy="100" r="4" ${GOLD}/><path d="M26 22 h108" stroke="${FR.d}" stroke-width="5"/>`;
  if (old) return defs + step(34, 126) + `<path d="M44 166 V70 Q44 28 80 28 Q116 28 116 70 V166Z" fill="${STONE.a}" stroke="${STONE.d}" stroke-width="1.6"/><path d="M44 96 h8 M44 130 h8 M108 96 h8 M108 130 h8 M52 50 l6 6 M108 50 l-6 6 M80 28 v8" stroke="${STONE.d}" stroke-width="1.2"/>
      <path d="M52 166 V72 Q52 37 80 37 Q108 37 108 72 V166Z" ${F}/><path d="M66 41 V166 M80 37 V166 M94 41 V166" stroke="${P.d}" stroke-width="1.3" opacity=".7"/>
      <path d="M52 80 H92 l5 3 l-5 3 H52Z M52 136 H92 l5 3 l-5 3 H52Z" fill="#33353b"/><circle cx="99" cy="110" r="5.5" fill="none" stroke="#33353b" stroke-width="2.6"/>
      <path d="M58 150 l4 -9 l3 6 l3 -10 M88 60 l3 8 l-4 5 M70 96 l2 9" stroke="${P.d}" stroke-width="1.3" fill="none"/><g fill="${P.h}" opacity=".45"><ellipse cx="72" cy="62" rx="5" ry="8"/><ellipse cx="100" cy="150" rx="5" ry="7"/><ellipse cx="60" cy="118" rx="3" ry="6"/></g>`;
  if (red) return defs + step(34, 126) + `<path d="M46 46 A34 30 0 0 1 114 46Z" fill="#bfe0f2" stroke="${FR.d}" stroke-width="1.6"/><path d="M80 46 V16 M80 46 L56 26 M80 46 L104 26" stroke="${FR.a}" stroke-width="3"/>` + frame(46, 44, 68) +
      pan(57, 56, 19, 22) + pan(84, 56, 19, 22) + pan(57, 84, 19, 34) + pan(84, 84, 19, 34) + pan(57, 126, 19, 30) + pan(84, 126, 19, 30) + `<rect x="68" y="119.5" width="24" height="5" rx="1.5" ${GOLD}/><circle cx="103" cy="112" r="3.6" ${GOLD}/><circle cx="80" cy="70" r="4" fill="none" stroke="#c99c28" stroke-width="2.4"/>`;
  let s = defs + step(34, 126) + frame(44, 26, 72);
  if (glazed) s += paneRect(58, 42, 44, 52, P, 2, 2) + pan(58, 108, 44, 44) + `<rect x="55" y="98" width="14" height="4.4" rx="2.2" fill="#e6e9ed" stroke="#6d737c" stroke-width="1"/>`;
  else if (white) s += pan(58, 40, 18, 112) + pan(84, 40, 18, 112) + `<path d="M105 86 V116" stroke="#6d737c" stroke-width="4.4" stroke-linecap="round"/><path d="M105 86 V116" stroke="#e6e9ed" stroke-width="1.8" stroke-linecap="round"/>`;
  else s += `<path d="M62 32 V166 M74 32 V166 M86 32 V166 M98 32 V166" stroke="${P.d}" stroke-width="1.3" opacity=".7"/><path d="M50 50 H110 v9 H50Z M50 134 H110 v9 H50Z M50 134 L101 59 h9 L59 134Z" fill="${P.a}" stroke="${P.d}" stroke-width="1.3" stroke-linejoin="round"/><circle cx="103" cy="100" r="4" fill="#33353b"/>`;
  return s;
}
function windowPic(k){
  const u = k.u, has = k.has, round = has("round"), shop = has("shop", "wide", "picture"), shut = has("shutters", "shutter"), curt = has("curtains", "curtain"), open = has("open");
  const P = k.tint(shut ? "green" : curt || round ? "wooden" : open || shop ? "white" : "blue"), FR = shut ? WHITE : P;
  const sill = (x0, x1, y) => `<rect x="${x0}" y="${y}" width="${x1 - x0}" height="9" rx="2" fill="${STONE.a}" stroke="${STONE.d}" stroke-width="1.4"/>`, glint = `stroke="#fff" stroke-linecap="round" opacity=".8"`;
  const fr = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${FR.a}" stroke="${FR.d}" stroke-width="1.7"/>`;
  if (round) return `<rect x="14" y="28" width="132" height="132" rx="4" fill="${STONE.h}" stroke="${STONE.d}" stroke-width="1.4"/><path d="M14 50 h30 M116 50 h30 M14 138 h30 M116 138 h30 M30 28 v22 M130 28 v22 M30 138 v22 M130 138 v22 M14 72 h12 M134 72 h12 M14 116 h12 M134 116 h12" stroke="${STONE.d}" stroke-width="1.1" opacity=".6"/><circle cx="80" cy="94" r="54" fill="${P.a}" stroke="${P.d}" stroke-width="1.8"/><circle cx="80" cy="94" r="42" fill="#bfe0f2" stroke="${P.d}" stroke-width="1.6"/><path d="M58 104 L84 64 M70 116 L88 90" ${glint} stroke-width="5"/>
      <path d="M80 52 V136 M38 94 H122" stroke="${P.d}" stroke-width="7.5"/><path d="M80 52 V136 M38 94 H122" stroke="${P.a}" stroke-width="4.6"/><g stroke="${P.d}" stroke-width="1.2" opacity=".6">` + Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6 + 0.26; return `<path d="M${r2(80 + 43 * Math.cos(a))} ${r2(94 + 43 * Math.sin(a))} L${r2(80 + 53 * Math.cos(a))} ${r2(94 + 53 * Math.sin(a))}"/>`; }).join("") + `</g>`;
  if (shop) return shad(80, 164, 72) + fr(6, 50, 148, 96) + paneRect(15, 59, 130, 78, P, 3, 2) + sill(2, 158, 146);      // "big, shop" of Lessons 5-10: now a wide picture window of a house
  if (open) return shad(80, 162, 60) + fr(34, 42, 92, 100) + `<rect x="40" y="48" width="80" height="88" fill="#a9d6f5" stroke="${FR.d}" stroke-width="1.2"/><path d="M40 136 V116 Q60 100 80 112 Q100 98 120 110 V136Z" fill="#9ccf7a"/>
      <g fill="#fff"><ellipse cx="66" cy="72" rx="13" ry="6"/><ellipse cx="76" cy="66" rx="9" ry="6"/><ellipse cx="98" cy="88" rx="10" ry="4.5"/></g>` +
      [[34, 8], [126, 152]].map(p => `<path d="M${p[0]} 42 L${p[1]} 30 V156 L${p[0]} 142Z" fill="${FR.a}" stroke="${FR.d}" stroke-width="1.7" stroke-linejoin="round"/><path d="M${p[0] + (p[1] - p[0]) * 0.2} 51 L${p[1] + (p[0] - p[1]) * 0.2} 43 V143 L${p[0] + (p[1] - p[0]) * 0.2} 133Z" fill="#cfe8f6" stroke="${FR.d}" stroke-width="1.1"/>
        <path d="M${p[0] + (p[1] - p[0]) * 0.3} 118 L${p[0] + (p[1] - p[0]) * 0.7} 70" ${glint} stroke-width="3"/>`).join("") + sill(26, 134, 142);
  if (shut){ const lv = x => `<rect x="${x}" y="46" width="26" height="94" rx="1.5" fill="${P.a}" stroke="${P.d}" stroke-width="1.6"/>` + Array.from({ length: 11 }, (_, i) => `<path d="M${x + 3} ${53 + i * 8} h20" stroke="${P.d}" stroke-width="1.6" opacity=".75"/>`).join("");
    return shad(80, 168, 58) + lv(22) + lv(112) + fr(48, 46, 64, 94) + paneRect(55, 53, 50, 80, WHITE, 2, 3) + sill(42, 118, 140) + `<path d="M46 150 H114 L110 164 H50Z" fill="${TINT.brick[0]}" stroke="${TINT.brick[1]}" stroke-width="1.4"/>` +
      [54, 66, 80, 94, 106].map((x, i) => `<path d="M${x - 6} 151 q6 -8 12 0z" fill="#5aa86d"/><circle cx="${x}" cy="${145 - (i % 2) * 2}" r="4.2" fill="${i % 2 ? "#f0c648" : "#e0574c"}" stroke="#0002" stroke-width="1"/>`).join(""); }
  if (curt){ const C = pal(k.cn === "red" ? COL.blue : COL.red), cu = f => `<path d="M${80 - f * 40} 50 H${80 - f * 4} Q${80 - f * 8} 84 ${80 - f * 30} 100 Q${80 - f * 34} 104 ${80 - f * 32} 112 Q${80 - f * 26} 126 ${80 - f * 26} 138 H${80 - f * 40}Z" fill="${C.a}" stroke="${C.d}" stroke-width="1.4" stroke-linejoin="round"/>
        <path d="M${80 - f * 28} 52 Q${80 - f * 30} 80 ${80 - f * 37} 98 M${80 - f * 16} 52 Q${80 - f * 20} 80 ${80 - f * 34} 100" stroke="${C.d}" stroke-width="1.1" fill="none" opacity=".7"/><path d="M${80 - f * 40} 101 Q${80 - f * 34} 106 ${80 - f * 28} 101" stroke="#f2d268" stroke-width="3.4" fill="none"/>`;
    return shad(80, 162, 58) + fr(34, 44, 92, 98) + paneRect(41, 51, 78, 84, P, 2, 2) + cu(1) + cu(-1) + sill(26, 134, 142) + `<path d="M24 40 H136" stroke="${WOOD.d}" stroke-width="4.6" stroke-linecap="round"/><circle cx="24" cy="40" r="4" fill="${WOOD.b}"/><circle cx="136" cy="40" r="4" fill="${WOOD.b}"/>`; }
  return shad(80, 162, 58) + fr(32, 40, 96, 104) + paneRect(41, 49, 78, 86, P, 2, 2) + `<rect x="76" y="88" width="8" height="8" rx="2" fill="${P.d}"/>` + sill(24, 136, 144);
}
/* --- a cat: always the face to the viewer (pointed ears, whiskers, slit eyes), a long tail; never the dog's side-on head and snout --- */
const CAT = { black: ["#50515b", "#292a30"], ginger: TINT.ginger, white: ["#fdfcf8", "#dcd8cc"], grey: ["#b0b6bf", "#7d838d"], brown: ["#a2714a", "#74492b"], cream: ["#f6ecd6", "#d9c9a4"] };
function cat(k){
  const u = k.u, has = k.has, sit = has("sitting") || has("kitten"), lie = has("lying down", "lying"), kit = has("kitten"), striped = has("striped"), spotted = has("spotted"), small = has("small");
  const cn = k.cn || (spotted ? "cream" : striped ? "grey" : "ginger"), P = pal(CAT[cn] || TINT[cn]), dark = cn === "black", ink = dark ? "#0f1013" : cn === "white" ? "#6b665a" : P.d, mk2 = dark ? "#8b8c96" : spotted ? "#6b4a2a" : P.d;
  const st = `stroke="${ink}" stroke-width="${cn === "white" ? 2.1 : 1.7}" stroke-linejoin="round"`, f = `fill="${P.a}" ${st}`;
  const head = (x, y, s) => at(x, y, s, `<path d="M-21 -6 L-18 -31 L-3 -17Z M21 -6 L18 -31 L3 -17Z" ${f}/><path d="M-17 -12 L-16 -25 L-8 -17Z M17 -12 L16 -25 L8 -17Z" fill="#e9a3ae"/><ellipse rx="23" ry="19" ${f}/>` +
    (striped ? `<path d="M0 -18 V-10 M-7 -17 L-6 -10 M7 -17 L6 -10 M-22 0 h7 M22 0 h-7" stroke="${mk2}" stroke-width="2" stroke-linecap="round"/>` : spotted ? `<ellipse cx="-11" cy="-11" rx="6" ry="4.5" fill="${mk2}"/>` : "") +
    `<ellipse cx="0" cy="8" rx="9.5" ry="7" fill="${dark ? "#6a6b76" : "#fffdf8"}" opacity="${dark ? ".5" : ".7"}"/><ellipse cx="-9.5" cy="-2" rx="4.8" ry="5.6" fill="#c3dc4c" stroke="#1b1b1e" stroke-width="1.1"/><ellipse cx="9.5" cy="-2" rx="4.8" ry="5.6" fill="#c3dc4c" stroke="#1b1b1e" stroke-width="1.1"/>
     <ellipse cx="-9.5" cy="-2" rx="${kit ? 2.6 : 1.6}" ry="4.4" fill="#101013"/><ellipse cx="9.5" cy="-2" rx="${kit ? 2.6 : 1.6}" ry="4.4" fill="#101013"/><circle cx="-8.4" cy="-4" r="1" fill="#fff"/><circle cx="10.6" cy="-4" r="1" fill="#fff"/>
     <path d="M-3 4.5 h6 l-3 3.600z" fill="#e58a9a" stroke="${dark ? "#101013" : "#b9606e"}" stroke-width=".8"/><path d="M0 8 v2.4 q-3.5 3.6 -7 .6 M0 10.4 q3.5 3.6 7 .6" stroke="${dark ? "#d9d9de" : "#5a4a42"}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
     <path d="M-12 7 L-34 2 M-12 9.5 L-35 10 M-12 12 L-33 18 M12 7 L34 2 M12 9.5 L35 10 M12 12 L33 18" stroke="${dark ? "#c9c9d0" : "#7d848e"}" stroke-width="1.1" stroke-linecap="round"/>`);
  const tail = d => `<path d="${d}" stroke="${ink}" stroke-width="10.5" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${P.a}" stroke-width="7.4" fill="none" stroke-linecap="round"/>`;
  const leg = (d, far) => `<path d="${d}" stroke="${ink}" stroke-width="11.4" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${far ? P.b : P.a}" stroke-width="8.4" fill="none" stroke-linecap="round"/>`;
  const marks = a => striped ? a.map(p => `<path d="M${p[0]} ${p[1]} q${p[2] || 3} ${p[3] / 2} 0 ${p[3]}" stroke="${mk2}" stroke-width="3" fill="none" stroke-linecap="round"/>`).join("") : spotted ? a.map((p, i) => `<ellipse cx="${p[0]}" cy="${p[1] + p[3] / 2}" rx="${5.5 - i % 2}" ry="${4.4 - i % 2}" fill="${mk2}"/>`).join("") : "";
  let d, sc = small ? 0.78 : kit ? 0.86 : 1, flip = small;
  if (sit){ const hs = kit ? 1.5 : 1.2, by = kit ? 104 : 86;                 // seen from the front: a pear of a body, two front legs, the tail curled round
    d = shad(82, 164, 44) + tail(kit ? "M100 152 Q124 150 122 132" : "M104 152 Q138 152 134 122 Q132 112 124 112") + `<path d="M80 ${by} Q${kit ? 104 : 110} ${by + 6} ${kit ? 106 : 112} 134 Q${kit ? 108 : 114} 161 80 161 Q${kit ? 52 : 46} 161 ${kit ? 54 : 48} 134 Q${kit ? 56 : 50} ${by + 6} 80 ${by}Z" ${f}/>` +
      marks([[54, 122, -3, 12], [106, 122, 3, 12], [56, 140, -3, 10], [104, 140, 3, 10]]) + `<ellipse cx="80" cy="${kit ? 126 : 116}" rx="13" ry="${kit ? 12 : 18}" fill="${dark ? "#6a6b76" : "#fffdf8"}" opacity="${dark ? ".4" : ".65"}"/>
       <ellipse cx="60" cy="158" rx="12" ry="6" ${f}/><ellipse cx="100" cy="158" rx="12" ry="6" ${f}/><path d="M68 ${kit ? 134 : 118} V155 Q68 161 73.5 161 Q79 161 79 155 V${kit ? 134 : 118} M81 ${kit ? 134 : 118} V155 Q81 161 86.5 161 Q92 161 92 155 V${kit ? 134 : 118}" fill="${P.a}" ${st}/>` + head(80, kit ? 82 : 66, hs);
  } else if (lie){
    d = shad(82, 164, 60) + tail("M34 152 Q8 156 10 138 Q12 128 22 130") + `<ellipse cx="46" cy="136" rx="25" ry="22" ${f}/><ellipse cx="76" cy="140" rx="46" ry="19" ${f}/><ellipse cx="50" cy="138" rx="22" ry="18" fill="${P.a}"/>` +
      marks([[44, 122, 3, 12], [62, 124, 3, 12], [80, 124, 3, 12], [96, 128, 3, 10], [34, 134, 3, 10]]) + `<ellipse cx="54" cy="158" rx="15" ry="5.6" ${f}/><ellipse cx="112" cy="157" rx="13" ry="5.6" ${f}/><ellipse cx="134" cy="158" rx="13" ry="5.6" ${f}/>` + head(112, 118, 1.1);
  } else {
    const walk = striped;
    d = shad(80, 166, 54) + tail(walk ? "M42 110 Q20 104 14 84 Q12 74 20 70" : "M42 112 Q22 108 24 82 Q26 62 40 56") + (walk ? leg("M58 120 Q50 140 42 160", 1) + leg("M104 120 Q110 140 104 160", 1) : leg("M58 120 V160", 1) + leg("M106 120 V160", 1)) +
      `<ellipse cx="78" cy="114" rx="41" ry="19.5" ${f}/>` + marks([[52, 98, 3, 16], [66, 96, 3, 18], [80, 96, 3, 18], [94, 98, 3, 14], [42, 106, 3, 10]]) + (walk ? leg("M50 122 Q54 142 62 160") + leg("M112 122 Q122 140 128 158") : leg("M48 122 V161") + leg("M114 122 V161")) + head(118, 90, 1.08);
  }
  return `<g transform="translate(80 ${lie ? 150 : 162}) scale(${flip ? -sc : sc} ${sc}) translate(-80 ${lie ? -150 : -162})">${d}</g>`;
}
function tree(k){
  const u = k.u, has = k.has, pine = has("pine"), bare = has("bare", "winter"), young = has("young"), apples = has("apples", "apple"), autumn = has("autumn");
  const P = !k.cn || k.cn === "green" ? pal(pine ? ["#4f9a62", "#2f7044"] : ["#74ba5c", "#479546"]) : k.tint(), B = pal(["#a2714a", "#74492b"]);
  const trunk = (x, y0, y1, w) => `<path d="M${x - w / 2} ${y0} Q${x - w / 2} ${y1 - 10} ${x - w} ${y1} H${x + w} Q${x + w / 2} ${y1 - 10} ${x + w / 2} ${y0}Z" fill="${B.a}" stroke="${B.d}" stroke-width="1.7" stroke-linejoin="round"/><path d="M${x + w * 0.15} ${y0 + 4} V${y1 - 4}" stroke="${B.b}" stroke-width="${r2(w * 0.3)}" opacity=".6" stroke-linecap="round"/>`;
  const blobs = [[0, -0.5, 0.6], [-0.56, -0.16, 0.52], [0.56, -0.16, 0.52], [-0.36, 0.3, 0.5], [0.38, 0.3, 0.5], [0, 0.1, 0.62]];
  const crown = (cx, cy, r, Q) => blobs.map(b => `<circle cx="${r2(cx + b[0] * r)}" cy="${r2(cy + b[1] * r)}" r="${r2(b[2] * r + 1.6)}" fill="${Q.d}"/>`).join("") + blobs.map(b => `<circle cx="${r2(cx + b[0] * r)}" cy="${r2(cy + b[1] * r)}" r="${r2(b[2] * r)}" fill="${Q.a}"/>`).join("") +
    `<g fill="${Q.h}" opacity=".5"><circle cx="${r2(cx - r * 0.3)}" cy="${r2(cy - r * 0.6)}" r="${r2(r * 0.2)}"/><circle cx="${r2(cx - r * 0.66)}" cy="${r2(cy - r * 0.2)}" r="${r2(r * 0.14)}"/></g><g fill="${Q.b}" opacity=".55"><circle cx="${r2(cx + r * 0.42)}" cy="${r2(cy + r * 0.36)}" r="${r2(r * 0.24)}"/><circle cx="${r2(cx - r * 0.2)}" cy="${r2(cy + r * 0.44)}" r="${r2(r * 0.16)}"/></g>`;
  const leafA = (x, y, r, c) => `<path d="M-5 0 Q0 -5 6 0 Q0 5 -5 0Z" fill="${c}" stroke="#0002" stroke-width="1" transform="translate(${x} ${y}) rotate(${r})"/>`;
  if (pine) return shad(80, 174, 40) + trunk(80, 146, 172, 11) + [[80, 150, 56, 76], [46, 108, 46, 66], [14, 68, 34, 56]].map(t => { const n = 6, w = t[2]; let d = `M80 ${t[0]} L${80 + w} ${t[1]}`; for (let i = 1; i <= n; i++) d += ` L${r2(80 + w - (2 * w) * (i - 0.5) / n)} ${t[1] - 7} L${r2(80 + w - (2 * w) * i / n)} ${t[1]}`;
      return `<path d="${d}Z" fill="${P.a}" stroke="${P.d}" stroke-width="1.7" stroke-linejoin="round"/><path d="M80 ${t[0] + 8} L${80 - w * 0.45} ${t[1] - 12}" stroke="${P.h}" stroke-width="3" opacity=".35" stroke-linecap="round"/>`; }).join("");
  if (bare){ const br = (d, w) => `<path d="${d}" stroke="${B.d}" stroke-width="${w + 2.6}" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${B.a}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`, sn = d => `<path d="${d}" stroke="#b9c9dd" stroke-width="5" fill="none" stroke-linecap="round" transform="translate(0 -2.5)"/><path d="${d}" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" transform="translate(0 -2.5)"/>`;
    return `<ellipse cx="80" cy="170" rx="68" ry="10" fill="#edf2f8" stroke="#b9c9dd" stroke-width="1.6"/>` + br("M80 100 Q56 84 44 52", 6) + br("M56 80 Q40 78 28 64", 3.6) + br("M52 68 Q54 50 62 40", 3) + br("M80 104 Q106 86 120 50", 6) + br("M106 80 Q124 80 136 68", 3.6) + br("M112 66 Q108 48 100 38", 3) +
      br("M80 110 Q78 70 84 28", 5) + br("M82 60 Q72 46 70 30", 3) + trunk(80, 96, 170, 14) + sn("M44 49 Q50 66 62 82") + sn("M120 47 Q112 68 100 84") + sn("M28 61 Q38 74 52 77") + sn("M136 65 Q124 77 110 77") + sn("M84 25 Q80 44 80 62") +
      `<g fill="#b9c9dd"><circle cx="20" cy="30" r="2.4"/><circle cx="142" cy="28" r="2.4"/><circle cx="34" cy="108" r="2.4"/><circle cx="130" cy="112" r="2.4"/><circle cx="16" cy="76" r="2"/><circle cx="148" cy="84" r="2"/><circle cx="60" cy="16" r="2"/><circle cx="108" cy="14" r="2"/><circle cx="46" cy="140" r="2"/><circle cx="118" cy="144" r="2"/></g>`; }
  if (young) return shad(80, 172, 34) + `<ellipse cx="80" cy="168" rx="30" ry="7" fill="#8a6a4a" stroke="#5c4027" stroke-width="1.4"/><path d="M64 168 V92" stroke="#b9975a" stroke-width="4.6" stroke-linecap="round"/><path d="M80 168 Q78 130 80 96" stroke="${B.d}" stroke-width="6.6" fill="none" stroke-linecap="round"/><path d="M80 168 Q78 130 80 96" stroke="${B.a}" stroke-width="3.6" fill="none" stroke-linecap="round"/>
      <path d="M62 126 H82" stroke="#3d424c" stroke-width="2.4"/>` + crown(80, 84, 30, P);
  let s = shad(80, 174, 50) + trunk(80, 104, 172, 15);
  if (autumn) s += crown(80, 72, 54, P) + `<g opacity=".9"><circle cx="58" cy="52" r="15" fill="#e0574c"/><circle cx="104" cy="82" r="17" fill="#f0c648"/><circle cx="72" cy="96" r="12" fill="#cb782b"/><circle cx="100" cy="42" r="11" fill="#d8483f"/></g>` +
      leafA(26, 118, 30, "#e0574c") + leafA(136, 128, -40, "#f0c648") + leafA(40, 146, 70, "#ee9a4a") + leafA(124, 156, 20, "#e0574c") + leafA(50, 170, 0, "#f0c648") + leafA(106, 172, 160, "#ee9a4a") + leafA(30, 168, -20, "#d8483f") + leafA(128, 172, 40, "#cb782b");
  else if (apples) s += crown(80, 74, 52, P) + [[56, 50], [92, 40], [112, 70], [44, 82], [76, 78], [100, 100], [62, 106]].map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="6.2" fill="#dc3431" stroke="#9c1c1b" stroke-width="1.2"/><circle cx="${p[0] - 2}" cy="${p[1] - 2}" r="1.6" fill="#fff" opacity=".7"/>`).join("") +
      `<circle cx="42" cy="168" r="6" fill="#dc3431" stroke="#9c1c1b" stroke-width="1.2"/><circle cx="118" cy="170" r="6" fill="#dc3431" stroke="#9c1c1b" stroke-width="1.2"/>`;
  else s += crown(80, 70, 58, P);
  return s;
}
/* --- a bicycle, seen from the side --- */
function bicycle(k){
  const has = k.has, child = has("child's", "childs", "child"), race = has("racing"), old = has("old"), basket = has("basket"), pink = k.sig === "pink";
  const P = k.tint("red"), step = old || basket || pink, r = child ? 19 : 27, wy = 158 - r, xr = child ? 50 : 40, xf = child ? 110 : 120, tyre = pink ? "#fbfaf5" : "#2b2b30";
  const bb = [(xr + xf) / 2 - 4, wy + 2], S = [bb[0] - 9, wy - r * (race ? 1.55 : 1.3)], H = [xf - 15, wy - r * (race ? 1.4 : 1.45)], hb = [H[0] - 3, H[1] - (race ? 8 : 14)];
  const T = (a, b, w, far) => stick(r2(a[0]), r2(a[1]), r2(b[0]), r2(b[1]), w || 4, P, far), ST = (a, b, w) => stick(a[0], a[1], b[0], b[1], w || 2.4, STEEL);
  const wheel = x => `<circle cx="${x}" cy="${wy}" r="${r - 2}" fill="none" stroke="${tyre}" stroke-width="${race ? 3 : 4.6}"/>` + (pink ? `<circle cx="${x}" cy="${wy}" r="${r + 0.3}" fill="none" stroke="#8a8473" stroke-width="1"/>` : "") + `<circle cx="${x}" cy="${wy}" r="${r - 5.5}" fill="none" stroke="#b9bec6" stroke-width="1.3"/>` +
    [0, 30, 60, 90, 120, 150].map(a => `<path d="M${x - r + 5.5} ${wy} h${2 * r - 11}" stroke="#b9bec6" stroke-width="1" transform="rotate(${a} ${x} ${wy})"/>`).join("") + `<circle cx="${x}" cy="${wy}" r="3.2" fill="#6d737c"/>`;
  const guard = x => `<path d="M${x - r - 3} ${wy + 4} A${r + 3} ${r + 3} 0 0 1 ${x + r + 3} ${wy + 4}" fill="none" stroke="${P.d}" stroke-width="4"/><path d="M${x - r - 3} ${wy + 4} A${r + 3} ${r + 3} 0 0 1 ${x + r + 3} ${wy + 4}" fill="none" stroke="${P.a}" stroke-width="2"/>`;
  let s = shad(80, 162, 62) + wheel(xr) + wheel(xf) + (step || child ? guard(xr) + guard(xf) : "");
  if (child) s += [xr - 9, xr + 9].map(x => ST([xr, wy], [x, 150], 2.4) + `<circle cx="${x}" cy="152" r="6" fill="#fbfaf5" stroke="#2b2b30" stroke-width="2.6"/>`).join("");
  if (old) s += ST([xr, wy], [xr - 4, wy - r - 9]) + ST([xr - 16, wy - r - 9], [xr + 18, wy - r - 9]) + ST([xr + 18, wy - r - 9], [S[0] + 2, S[1] + 16]);
  s += T([xr, wy], bb, 3.4, 1) + T([xr, wy], [S[0] + 1, S[1] + 8], 3, 1) + T(H, [xf, wy], 3.6) + T(bb, [S[0] - 2, S[1] - 6]) +
    (step ? `<path d="M${H[0]} ${H[1] + 4} Q${bb[0] + 14} ${wy - 4} ${bb[0] - 4} ${wy - 12}" stroke="${P.d}" stroke-width="6.6" fill="none" stroke-linecap="round"/><path d="M${H[0]} ${H[1] + 4} Q${bb[0] + 14} ${wy - 4} ${bb[0] - 4} ${wy - 12}" stroke="${P.a}" stroke-width="3.6" fill="none" stroke-linecap="round"/>` : T([S[0], S[1] + 4], [H[0], H[1] + 2])) +
    T(bb, [H[0] + 1, H[1] + 8]) + T(H, hb, 3.6);
  s += `<circle cx="${bb[0]}" cy="${bb[1]}" r="${child ? 6 : 7.5}" fill="#d5d8dc" stroke="#6d737c" stroke-width="1.6"/><path d="M${bb[0]} ${bb[1]} l7 10" stroke="#3d424c" stroke-width="3" stroke-linecap="round"/><rect x="${bb[0] + 2}" y="${bb[1] + 9}" width="12" height="4.4" rx="2" fill="#2b2b30"/>` +
    `<path d="M${S[0] - 13} ${S[1] - 7} q12 -6 24 -1 q-2 6 -11 5 q-8 1 -13 -4z" fill="${old ? "#7c5230" : "#2b2b30"}" stroke="#17181c" stroke-width="1"/>` +
    (race ? `<path d="M${hb[0] - 2} ${hb[1]} h10 q9 1 8 9 q-1 7 -9 6" stroke="#2b2b30" stroke-width="4" fill="none" stroke-linecap="round"/><rect x="${r2(bb[0] + 10)}" y="${r2(bb[1] - 26)}" width="7" height="16" rx="3" fill="#58a6e0" stroke="#357fc0" stroke-width="1" transform="rotate(38 ${r2(bb[0] + 13)} ${r2(bb[1] - 18)})"/>`
      : step ? `<path d="M${hb[0] + 2} ${hb[1] + 2} q-4 -6 -12 -5 q-7 1 -10 5" stroke="#8b8f96" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M${hb[0] - 20} ${hb[1] + 2} l-7 3" stroke="#2b2b30" stroke-width="5" stroke-linecap="round"/>`
      : `<path d="M${hb[0] + 4} ${hb[1]} l-14 -3" stroke="#8b8f96" stroke-width="3.4" stroke-linecap="round"/><path d="M${hb[0] - 10} ${hb[1] - 3} l-7 -1.5" stroke="#2b2b30" stroke-width="5" stroke-linecap="round"/>`);
  if (basket) s += `<path d="M${H[0] + 2} ${H[1] - 14} h30 l-4 22 h-22z" fill="#d9a85c" stroke="#8a5f24" stroke-width="1.6" stroke-linejoin="round"/><path d="M${H[0] + 3} ${H[1] - 8} h28 M${H[0] + 4} ${H[1] - 1} h26 M${H[0] + 10} ${H[1] - 14} l2 22 M${H[0] + 17} ${H[1] - 14} v22 M${H[0] + 24} ${H[1] - 14} l-2 22" stroke="#8a5f24" stroke-width="1.1"/>`;
  if (old) s += `<circle cx="${H[0] + 8}" cy="${H[1] + 2}" r="5" fill="#f6e08a" stroke="#6d737c" stroke-width="1.6"/><g fill="#8a4a22" opacity=".8"><circle cx="${bb[0] + 12}" cy="${wy - 14}" r="2"/><circle cx="${H[0] - 4}" cy="${H[1] + 22}" r="1.8"/><circle cx="${xr + 14}" cy="${wy - 16}" r="1.8"/><circle cx="${S[0]}" cy="${S[1] + 22}" r="1.6"/></g>`;
  if (pink) s += `<path d="M${hb[0] - 26} ${hb[1] + 5} l-5 12 M${hb[0] - 26} ${hb[1] + 5} l-1 13 M${hb[0] - 26} ${hb[1] + 5} l3 12" stroke="#9076c8" stroke-width="1.6" stroke-linecap="round"/><circle cx="${hb[0] - 6}" cy="${hb[1] - 6}" r="3.6" fill="#e6e9ed" stroke="#6d737c" stroke-width="1.2"/>`;
  if (child) s += `<path d="M${hb[0] - 12} ${hb[1] - 3} l-6 10 M${hb[0] - 12} ${hb[1] - 3} l-9 6" stroke="#f0c648" stroke-width="1.6" stroke-linecap="round"/><path d="M${bb[0] - 14} ${bb[1] - 6} h22 v9 h-22z" fill="${P.b}" stroke="${P.d}" stroke-width="1.2"/>`;
  return pink ? `<g transform="translate(160 0) scale(-1 1)">${s}</g>` : s;
}
/* --- cards and paper: a face that says how somebody feels, the French flag, a newspaper, a letter; small plain versions of
       the app's own book, apple, pen and shoe (for PICS.person spec.holding) --- */
/* a thought bubble, up and to the right of a head: a plate of hot food (hungry) or a glass of water (thirsty) */
const bubble = (x, y, r, food) => `<g transform="translate(${x} ${y}) scale(${r2(r / 28)})"><circle cx="-36" cy="37" r="3.6" fill="#fff" stroke="#7d848e" stroke-width="2"/><circle cx="-28" cy="27" r="6" fill="#fff" stroke="#7d848e" stroke-width="2"/><circle r="28" fill="#fff" stroke="#7d848e" stroke-width="2.4"/>` +
  (food ? `<path d="M-7 -10 q-4 -5 0 -10 M4 -11 q-4 -5 0 -10" stroke="#aeb4bd" stroke-width="2.6" fill="none" stroke-linecap="round"/><ellipse cx="0" cy="12" rx="22" ry="7.5" fill="#fcfcfa" stroke="#8f98a3" stroke-width="1.8"/><path d="M-14 10 Q-15 -8 0 -8 Q15 -8 14 10 Q0 15 -14 10Z" fill="#c9823a" stroke="#86521c" stroke-width="1.8" stroke-linejoin="round"/><circle cx="-5" cy="1" r="2.4" fill="#5aa86d"/><circle cx="4" cy="-1" r="2.4" fill="#e0574c"/><circle cx="7" cy="5" r="2.2" fill="#f0c648"/>`
    : `<path d="M-12 -18 L-9 17 H9 L12 -18Z" fill="#eef6fc" stroke="#557fa8" stroke-width="2.4" stroke-linejoin="round"/><path d="M-11 -7 L-9 16 H9 L11 -7Z" fill="#4fa9ee"/><path d="M-11 -7 H11" stroke="#2f7fcc" stroke-width="1.6"/><path d="M-6 -3 L-5 11" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".8"/>`) + `</g>`;
const drop = (x, y, s) => `<path d="M0 -7 C4.6 0 5.6 3 0 6.6 C-5.6 3 -4.6 0 0 -7Z" fill="#8fd0f5" stroke="#3f8fd0" stroke-width="1.2" transform="translate(${x} ${y}) scale(${s || 1})"/>`;
const shiver = (x, y, f) => `<path d="M${x} ${y} l${5 * f} 7 l${-5 * f} 7 l${5 * f} 7 M${x + 9 * f} ${y + 5} l${5 * f} 7 l${-5 * f} 7" stroke="#6f9fd8" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
function faceCard(k){
  const u = k.u, has = k.has, st = has("hungry") ? 4 : has("thirsty") ? 5 : has("cold") ? 6 : has("hot") ? 7 : has("tired") ? 8 : 0;
  const mood = st || (has("feeling good", "good") ? 1 : has("feeling so-so", "so-so") ? 2 : has("feeling bad", "bad") ? 3 : 0), sk = SKIN.tan, T = k.tint("teal"), ink = "#2a1c15";
  const lids = st === 7 || st === 8 ? `<path d="M49 ${st === 8 ? 90 : 86} Q59 ${st === 8 ? 72 : 70} 69 ${st === 8 ? 90 : 86} Q59 ${st === 8 ? 88 : 82} 49 ${st === 8 ? 90 : 86}Z M91 ${st === 8 ? 90 : 86} Q101 ${st === 8 ? 72 : 70} 111 ${st === 8 ? 90 : 86} Q101 ${st === 8 ? 88 : 82} 91 ${st === 8 ? 90 : 86}Z" fill="${sk[1]}" stroke="${ink}" stroke-width="2.4" stroke-linejoin="round"/>` +
      (st === 8 ? `<path d="M50 99 Q59 104 68 99 M92 99 Q101 104 110 99" stroke="${sk[2]}" stroke-width="2.6" fill="none" stroke-linecap="round"/>` : "") : "";
  const eyes = mood === 1 ? `<path d="M48 88 Q59 74 70 88 M90 88 Q101 74 112 88" stroke="${ink}" stroke-width="5" fill="none" stroke-linecap="round"/>`
    : [59, 101].map(x => `<ellipse cx="${x}" cy="${mood === 3 ? 90 : 87}" rx="6.5" ry="${mood === 3 ? 6.5 : 8.5}" fill="${ink}"/><circle cx="${x + 2}" cy="${mood === 3 ? 87.5 : 83.5}" r="2.2" fill="#fff"/>`).join("") +
      (mood === 3 ? `<path d="M49 85 Q59 80 69 86 M91 86 Q101 80 111 85" stroke="${sk[2]}" stroke-width="3" fill="none" stroke-linecap="round"/>` : "") + lids;
  const sad = `M46 74 L71 62 M89 62 L114 74`;
  const brows = [`M46 70 Q59 62 72 68 M88 68 Q101 62 114 70`, `M46 64 Q59 54 72 62 M88 62 Q101 54 114 64`, `M47 68 H71 M89 68 H113`, sad, sad, sad, sad, `M46 70 L71 64 M89 64 L114 70`, `M46 66 Q59 60 72 66 M88 66 Q101 60 114 66`][mood];
  const tongue = `<path d="M62 121 Q80 114 98 121 Q95 140 80 140 Q65 140 62 121Z" fill="#5a1b1d" stroke="#8a3b3b" stroke-width="3" stroke-linejoin="round"/>`;
  const mouth = [`<path d="M62 122 Q80 134 98 122" stroke="#8a3b3b" stroke-width="4.6" fill="none" stroke-linecap="round"/>`,
    `<path d="M50 112 Q80 124 110 112 Q104 150 80 150 Q56 150 50 112Z" fill="#5a1b1d" stroke="#8a3b3b" stroke-width="3" stroke-linejoin="round"/><path d="M54.5 116 Q80 127 105.5 116 Q104 124 102 127 Q80 134 58 127 Q56 124 54.5 116Z" fill="#fffdf8"/><path d="M66 143 Q80 134 94 143 Q80 151 66 143Z" fill="#d9706f"/>`,
    `<path d="M58 127 H102" stroke="#8a3b3b" stroke-width="5.6" fill="none" stroke-linecap="round"/>`,
    `<path d="M56 137 Q80 112 104 137" stroke="#8a3b3b" stroke-width="5.6" fill="none" stroke-linecap="round"/><path d="M73 143 Q80 139 87 143" stroke="${sk[2]}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    `<path d="M60 132 Q80 118 100 132" stroke="#8a3b3b" stroke-width="5.6" fill="none" stroke-linecap="round"/>` + drop(101, 142, 1.2),
    tongue + `<path d="M70 131 Q69 154 80 155 Q91 154 90 131Z" fill="#e36f7c" stroke="#b34d5a" stroke-width="1.6"/><path d="M80 134 v13" stroke="#b34d5a" stroke-width="1.6" stroke-linecap="round"/>`,
    `<rect x="59" y="119" width="42" height="16" rx="5" fill="#fffdf8" stroke="#8a3b3b" stroke-width="3"/><path d="M69.5 119 v16 M80 119 v16 M90.5 119 v16 M59 127 h42" stroke="#9a9a94" stroke-width="1.6"/>`,
    `<ellipse cx="80" cy="130" rx="13" ry="10" fill="#5a1b1d" stroke="#8a3b3b" stroke-width="3"/><path d="M71 134 Q80 128 89 134 Q80 141 71 134Z" fill="#d9706f"/>`,
    `<ellipse cx="80" cy="131" rx="15" ry="19" fill="#5a1b1d" stroke="#8a3b3b" stroke-width="3"/><path d="M68 121 Q80 126 92 121 Q80 114 68 121Z" fill="#fffdf8"/><path d="M70 140 Q80 131 90 140 Q80 151 70 140Z" fill="#d9706f"/>`][mood];
  const cheeks = mood === 1 || st === 7 ? `<ellipse cx="46" cy="110" rx="${st ? 15 : 12}" ry="${st ? 10 : 8}" fill="${st ? "#e8402f" : "#e98a7a"}" opacity="${st ? ".5" : ".45"}"/><ellipse cx="114" cy="110" rx="${st ? 15 : 12}" ry="${st ? 10 : 8}" fill="${st ? "#e8402f" : "#e98a7a"}" opacity="${st ? ".5" : ".45"}"/>`
    : st === 6 ? `<ellipse cx="46" cy="110" rx="15" ry="10" fill="#6f9fe0" opacity=".55"/><ellipse cx="114" cy="110" rx="15" ry="10" fill="#6f9fe0" opacity=".55"/><ellipse cx="79" cy="109" rx="8" ry="6" fill="#6f9fe0" opacity=".45"/>` : "";
  const head = `<defs><radialGradient id="${u}s" cx=".42" cy=".38" r=".7"><stop offset="0" stop-color="${sk[0]}"/><stop offset=".7" stop-color="${sk[1]}"/><stop offset="1" stop-color="${sk[2]}"/></radialGradient></defs>
    <path d="M28 190 Q30 164 56 160 H104 Q130 164 132 190Z" fill="${T.a}" stroke="${T.d}" stroke-width="1.6"/><path d="M66 146 h28 v16 q-14 10 -28 0z" fill="${sk[2]}"/>
    <ellipse cx="27" cy="98" rx="7" ry="12" fill="${sk[2]}"/><ellipse cx="133" cy="98" rx="7" ry="12" fill="${sk[2]}"/><path d="M80 24 C114 24 132 50 132 92 C132 130 112 160 80 162 C48 160 28 130 28 92 C28 50 46 24 80 24Z" fill="url(#${u}s)"/>
    <path d="M27 92 Q20 22 80 16 Q140 22 133 92 Q128 66 116 54 Q96 62 72 56 Q54 52 46 46 Q32 62 27 92Z" fill="${HAIR.dkbrown[1]}"/>` + cheeks +
    `<path d="${brows}" stroke="${HAIR.dkbrown[2]}" stroke-width="5" fill="none" stroke-linecap="round"/>${eyes}<path d="M80 92 Q76 106 75 110 Q78 114 83 113" stroke="${sk[2]}" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".8"/>${mouth}`;
  if (st === 4 || st === 5) return `<g transform="translate(-6 34) scale(.82)">${head}</g>` + bubble(126, 36, 31, st === 4);
  if (st === 6) return `<g transform="translate(9.6 23) scale(.88)">${head}</g>` + shiver(8, 70, 1) + shiver(152, 70, -1) + shiver(10, 122, 1) + shiver(150, 122, -1);
  if (st === 7) return head + drop(40, 62, 1.7) + drop(122, 72, 1.5) + drop(132, 118, 1.3) + drop(30, 128, 1.2);
  return head;
}
function flag(k){
  const u = k.u, wave = "M38 34 Q63 22 88 32 Q113 42 140 30 V98 Q113 110 88 100 Q63 90 38 102Z";
  return `<defs><clipPath id="${u}f"><path d="${wave}"/></clipPath><linearGradient id="${u}g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset=".3" stop-color="#000" stop-opacity=".12"/><stop offset=".55" stop-color="#fff" stop-opacity=".14"/><stop offset=".8" stop-color="#000" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient></defs>` +
    shad(40, 176, 26) + `<ellipse cx="36" cy="172" rx="20" ry="6" fill="#a9afb8" stroke="#6d737c" stroke-width="1.4"/><path d="M36 172 V22" stroke="#6d737c" stroke-width="6.5" stroke-linecap="round"/><path d="M35 170 V24" stroke="#e6e9ed" stroke-width="2.2" stroke-linecap="round"/><circle cx="36" cy="19" r="6" fill="#f2d268" stroke="#a07c1c" stroke-width="1.3"/>
    <g clip-path="url(#${u}f)"><rect x="38" y="14" width="34" height="100" fill="#2f55a8"/><rect x="72" y="14" width="34" height="100" fill="#fdfdfb"/><rect x="106" y="14" width="36" height="100" fill="#dc3b36"/><rect x="38" y="14" width="104" height="100" fill="url(#${u}g)"/></g>
    <path d="${wave}" fill="none" stroke="#4a4f57" stroke-width="1.8" stroke-linejoin="round"/>`;
}
const scrawl = (x, y, w, c) => { let d = `M${x} ${y}`; for (let i = 0; i < w / 6; i++) d += ` q1.5 ${i % 2 ? 3.4 : -3.4} 3 0 t3 0`; return `<path d="${d}" stroke="${c || "#3b55b3"}" stroke-width="1.5" fill="none" stroke-linecap="round"/>`; };
const lines = (x, y, w, n, gap) => `<path d="${Array.from({ length: n }, (_, i) => `M${x} ${y + i * gap} h${i === n - 1 ? r2(w * 0.6) : w}`).join(" ")}" stroke="#9a9a94" stroke-width="1.7" stroke-linecap="round"/>`;
function newspaper(k){
  const P = k.cn ? k.tint().h : "#f6f3ea", st = `stroke="#8a867a" stroke-width="1.6" stroke-linejoin="round"`;
  return shad(82, 170, 60) + `<g transform="rotate(-5 80 100)"><path d="M26 44 H138 V166 H26Z" fill="#dedacd" ${st} transform="translate(5 5)"/><path d="M22 38 H134 V160 H22Z" fill="${P}" ${st}/>
    <rect x="30" y="45" width="96" height="14" rx="1.5" fill="#33353b"/><path d="M30 64 H126" stroke="#33353b" stroke-width="1.6"/><path d="M30 73 H126 M30 81 H104" stroke="#55585f" stroke-width="5"/>
    <rect x="30" y="90" width="46" height="34" fill="#a9c7de" stroke="#6d737c" stroke-width="1.2"/><path d="M30 124 L46 104 L56 114 L64 106 L76 124Z" fill="#6f8f6a"/><circle cx="66" cy="99" r="4" fill="#f6e08a"/>` +
    lines(82, 92, 44, 5, 7.5) + lines(30, 132, 28, 4, 7) + lines(64, 132, 28, 4, 7) + lines(98, 132, 28, 4, 7) + `<path d="M22 160 H134" stroke="#c9c5b8" stroke-width="3" transform="translate(0 -1.5)"/></g>`;
}
function letter(k){
  const st = `stroke="#8a867a" stroke-width="1.6" stroke-linejoin="round"`, E = k.tint(["#f4ecd8", "#dccfae"]);
  return shad(84, 174, 60) + `<g transform="rotate(9 106 138)"><rect x="62" y="110" width="88" height="56" rx="2" fill="${E.a}" stroke="${E.d}" stroke-width="1.6"/><path d="M62 111 L106 142 L150 111" fill="none" stroke="${E.d}" stroke-width="1.6" stroke-linejoin="round"/>
    <rect x="128" y="116" width="15" height="17" fill="#dc3b36" stroke="#fff" stroke-width="2" stroke-dasharray="2 1.5"/><path d="M70 150 h34 M70 157 h24" stroke="${E.d}" stroke-width="2"/></g>
    <g transform="rotate(-7 60 90)"><path d="M16 22 H104 V140 H16Z" fill="#fffdf6" ${st}/><path d="M16 62 H104 M16 101 H104" stroke="#e3ddcb" stroke-width="1.4"/>` +
    scrawl(26, 36, 30) + [50, 60, 72, 82, 92, 112].map((y, i) => scrawl(26, y, [66, 60, 68, 54, 64, 40][i])).join("") + scrawl(64, 128, 28, "#1d2f73") + `</g>`;
}
function bookS(k){
  const P = k.tint("red"), st = `stroke="${P.d}" stroke-width="1.7" stroke-linejoin="round"`;
  if (k.has("open")) return shad(80, 150, 64) + `<path d="M14 128 Q46 116 80 128 Q114 116 146 128 V140 Q114 128 80 140 Q46 128 14 140Z" fill="${P.b}" ${st}/><path d="M18 76 Q48 64 80 78 V132 Q48 120 18 130Z M142 76 Q112 64 80 78 V132 Q112 120 142 130Z" fill="#fffdf7" stroke="#b9ad94" stroke-width="1.4" stroke-linejoin="round"/>` +
    [0, 1, 2, 3, 4].map(i => `<path d="M28 ${88 + i * 8} Q50 ${80 + i * 8} 72 ${90 + i * 8} M88 ${90 + i * 8} Q110 ${80 + i * 8} 132 ${88 + i * 8}" stroke="#a9a08c" stroke-width="1.6" fill="none"/>`).join("");
  return shad(84, 160, 46) + `<g transform="rotate(-8 80 100)"><path d="M48 46 H118 Q122 46 122 50 V154 H48Z" fill="#fffdf6" stroke="#b9ad94" stroke-width="1.4" transform="translate(5 5)"/><path d="M42 40 H112 Q116 40 116 44 V150 H42Z" fill="${P.a}" ${st}/><path d="M42 40 h11 v110 h-11z" fill="${P.b}" ${st}/>
    <path d="M64 62 h40 M64 72 h28" stroke="${P.h}" stroke-width="4" stroke-linecap="round" opacity=".85"/></g>`;
}
function appleS(k){
  const u = k.u, P = k.tint("red");
  return `<defs><radialGradient id="${u}r" cx=".36" cy=".34" r=".78"><stop offset="0" stop-color="${P.h}"/><stop offset=".5" stop-color="${P.a}"/><stop offset="1" stop-color="${P.d}"/></radialGradient></defs>` + shad(80, 156, 46) +
    `<path d="M80 66 C62 52 30 58 30 96 C30 132 54 156 72 154 C76 153 78 151 80 151 C82 151 84 153 88 154 C106 156 130 132 130 96 C130 58 98 52 80 66Z" fill="url(#${u}r)" stroke="${P.d}" stroke-width="1.6"/>
     <path d="M80 68 C78 58 79 50 84 42" stroke="#5a3a22" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M84 50 C92 36 110 36 116 42 C108 52 94 56 84 50Z" fill="#5f9a3a" stroke="#3f6f24" stroke-width="1"/><ellipse cx="58" cy="86" rx="9" ry="14" fill="#fff" opacity=".25" transform="rotate(-20 58 86)"/>`;
}
function penS(k){
  const u = k.u, P = k.tint("blue");
  return `<defs>${lgr(u + "p", P.a, P.b)}</defs>` + shad(82, 150, 54) + `<g transform="rotate(-32 80 104)"><path d="M22 98 L9 104 L22 110Z" fill="#d5d8dc" stroke="#6d737c" stroke-width="1.2"/><rect x="22" y="97" width="118" height="14" rx="5" fill="url(#${u}p)" stroke="${P.d}" stroke-width="1.6"/>
    <rect x="96" y="96" width="46" height="16" rx="6" fill="${P.b}" stroke="${P.d}" stroke-width="1.4"/><path d="M100 94 h34 q4 0 4 3 h-38z" fill="#d5d8dc" stroke="#6d737c" stroke-width="1"/><path d="M30 100.5 h60" stroke="#fff" stroke-width="2.4" opacity=".45" stroke-linecap="round"/></g>`;
}
function shoeS(k){
  const u = k.u, P = k.tint("blue");
  return `<defs>${lgr(u + "s", P.a, P.b)}</defs>` + shad(82, 154, 66) + `<path d="M18 136 Q16 150 30 152 H136 Q148 150 146 138Z" fill="#fbfaf5" stroke="#a9a498" stroke-width="1.5"/><path d="M22 138 Q20 108 34 92 Q44 84 56 88 Q66 100 84 104 Q110 106 128 116 Q146 124 146 138Z" fill="url(#${u}s)" stroke="${P.d}" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M34 92 Q40 86 50 88 Q48 104 40 118" fill="${P.d}" opacity=".6"/><path d="M60 96 L96 112 M64 92 L72 104 M74 98 L82 108 M84 101 L92 112" stroke="#f4f1ea" stroke-width="2.6" stroke-linecap="round"/><path d="M100 120 Q122 122 140 132" stroke="#fff" stroke-width="5" fill="none" opacity=".9" stroke-linecap="round"/>`;
}
/* a picture card: a white card with the learner's figure doing spec.doing, frozen: it tells which action to command */
function card(k, spec){
  const u = k.u, w = String(spec && spec.doing || "").toLowerCase().trim().split(/[ ,]/)[0], a = ACT_OF[w] || ACT2[w] || "smile", face = a === "smile" || a === "eat" || a === "drink", s = face ? 0.86 : 0.84;
  return `<g transform="rotate(-3 80 95)"><rect x="15" y="14" width="136" height="170" rx="9" fill="#000" opacity=".14"/><rect x="12" y="10" width="136" height="170" rx="9" fill="#fff" stroke="${k.cn ? k.tint().b : "#7d848e"}" stroke-width="${k.cn ? 6 : 2.4}"/>
    <clipPath id="${u}c"><rect x="14" y="12" width="132" height="166" rx="7"/></clipPath><g clip-path="url(#${u}c)"><g transform="translate(${r2(80 - 80 * s)} ${face ? r2(181 - 190 * s) : r2(172 - 186 * s)}) scale(${s})">${action(a, "you", { still: true }).outerHTML}</g></g></g>`;
}
/* --- the weather: a snowy scene and a thermometer low and blue (cold); a blazing sun and a thermometer high and red (hot) --- */
function weather(k){
  const u = k.u, hot = k.has("hot"), cold = k.has("cold") || !hot, c = hot ? "#e03a30" : "#3f7fd0", top = hot ? 44 : 118;
  const thermo = `<rect x="127" y="22" width="18" height="128" rx="9" fill="#fff" stroke="#6d737c" stroke-width="2.2"/><circle cx="136" cy="156" r="16" fill="#fff" stroke="#6d737c" stroke-width="2.2"/><circle cx="136" cy="156" r="11" fill="${c}"/><path d="M136 150 V${top}" stroke="${c}" stroke-width="8" stroke-linecap="round"/>
    <path d="M149 38 h7 M149 56 h5 M149 74 h7 M149 92 h5 M149 110 h7 M149 128 h5" stroke="#6d737c" stroke-width="2" stroke-linecap="round"/>`;
  const frame = `<defs><clipPath id="${u}c"><rect x="6" y="14" width="110" height="164" rx="10"/></clipPath></defs>`, edge = `<rect x="6" y="14" width="110" height="164" rx="10" fill="none" stroke="#8f98a3" stroke-width="1.6"/>`;
  if (hot) return frame + `<g clip-path="url(#${u}c)"><rect x="6" y="14" width="110" height="164" fill="#ffe7a3"/><path d="M6 140 Q60 124 116 142 V178 H6Z" fill="#e8c06a"/><path d="M6 156 Q50 146 116 160" stroke="#cfa24a" stroke-width="2" fill="none"/>` +
      Array.from({ length: 12 }, (_, i) => `<path d="M61 68 L61 ${i % 2 ? 22 : 14}" stroke="#f39a1e" stroke-width="6" stroke-linecap="round" transform="rotate(${i * 30} 61 68)"/>`).join("") + `<circle cx="61" cy="68" r="27" fill="#ffd23c" stroke="#f39a1e" stroke-width="3"/>
      <path d="M22 128 q5 -7 0 -14 q-5 -7 0 -14 M98 132 q5 -7 0 -14 q-5 -7 0 -14" stroke="#e8553f" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M58 172 V140 q0 -8 6 -8 q6 0 6 8 V172Z M70 156 h8 q5 0 5 -6 v-8 M58 160 h-7 q-5 0 -5 -6 v-6" fill="#5aa86d" stroke="#3f8551" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/></g>` + edge + thermo;
  return frame + `<g clip-path="url(#${u}c)"><rect x="6" y="14" width="110" height="164" fill="#cfe0f2"/><path d="M6 132 Q40 112 74 130 Q98 142 116 124 V178 H6Z" fill="#fff" stroke="#9db6d6" stroke-width="1.6"/>
      <path d="M74 150 V132" stroke="#74492b" stroke-width="7"/><path d="M74 62 L96 100 H52Z M74 84 L102 134 H46Z" fill="#4f9a62" stroke="#2f7044" stroke-width="1.6" stroke-linejoin="round"/><path d="M74 62 L84 80 Q74 86 64 80Z M56 116 Q74 126 92 116 L98 128 Q74 138 50 128Z" fill="#fff"/>
      <circle cx="30" cy="150" r="13" fill="#fff" stroke="#9db6d6" stroke-width="1.6"/><circle cx="30" cy="130" r="9" fill="#fff" stroke="#9db6d6" stroke-width="1.6"/><circle cx="27" cy="128" r="1.4" fill="#2b2b30"/><circle cx="33" cy="128" r="1.4" fill="#2b2b30"/><path d="M30 131 l7 2 l-7 2z" fill="#ee9a4a"/>
      <g fill="#fff" stroke="#9db6d6" stroke-width="1">` + [[20, 34], [44, 24], [66, 40], [92, 28], [104, 58], [28, 70], [50, 56], [14, 100], [100, 92], [84, 52], [36, 96], [108, 112]].map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="3.4"/>`).join("") + `</g></g>` + edge + thermo;
}
/* --- helpers to put a thing somewhere at a size, whole or as a faint ghost in a dashed outline (it was there) --- */
function fitted(el, cx, yb, mw, mh, ghost, maxF){
  const b = measure(el), f = Math.min(mw / b.w, mh / b.h, maxF || 9), x = cx - (b.x + b.w / 2) * f, y = yb - (b.y + b.h) * f;
  const inner = `<g transform="translate(${r2(x)} ${r2(y)}) scale(${r2(f * 1000) / 1000})">${el.outerHTML}</g>`;
  return { w: b.w * f, h: b.h * f, s: ghost ? `<g opacity=".3">${inner}</g><rect x="${r2(cx - b.w * f / 2 - 3)}" y="${r2(yb - b.h * f - 3)}" width="${r2(b.w * f + 6)}" height="${r2(b.h * f + 6)}" rx="12" fill="none" stroke="#7d848e" stroke-width="2" stroke-dasharray="5 5" opacity=".8"/>` : inner };
}
const bare = el => { el.querySelectorAll('ellipse[fill="#000"]').forEach(e => e.remove()); return el; };      // without its shadow on the ground
/* --- PICS.hand: an open hand seen from above, palm up, and what lies on it. The learner's own hand comes up from the bottom of the
   picture (green sleeve); the teacher's comes down from the top (her slate sleeve): "I have" / "you have" differ at a glance --- */
function handCard(spec, draw){
  spec = spec || {};
  const M = spec.who === "marie", sk = M ? ["#f3cfae", "#e8b892", "#cf9873"] : SKIN.tan, sl = M ? ["#4a6b86", "#36536b"] : COL.green, st = `stroke="${sk[2]}" stroke-width="1.6" stroke-linejoin="round"`;
  const h = [[50, 92, 17, 58, -9], [69.5, 90, 17, 66, -3], [89, 90, 17, 62, 3], [108, 94, 15, 48, 10]].map(p => `<rect x="${p[0] - p[2] / 2}" y="${p[1] - p[3]}" width="${p[2]}" height="${p[3] + 14}" rx="${p[2] / 2}" fill="${sk[0]}" ${st} transform="rotate(${p[4]} ${p[0]} ${p[1]})"/>`).join("") +
    `<rect x="118" y="78" width="18" height="58" rx="9" fill="${sk[0]}" ${st} transform="rotate(38 127 132)"/><path d="M58 150 h44 v22 h-44z" fill="${sk[1]}" ${st}/><rect x="38" y="84" width="84" height="74" rx="27" fill="${sk[1]}" ${st}/>
     <path d="M52 118 Q76 104 104 112 M56 134 Q80 124 108 132 M96 100 Q106 124 92 146" stroke="${sk[2]}" stroke-width="1.5" fill="none" opacity=".65" stroke-linecap="round"/>
     <path d="M44 196 L48 166 Q80 158 112 166 L116 196Z" fill="${sl[0]}" stroke="${sl[1]}" stroke-width="2" stroke-linejoin="round"/><path d="M48 172 Q80 164 112 172" stroke="${sl[1]}" stroke-width="3" fill="none"/>`;
  const e = spec.holding || spec.was; let t = "";
  if (e){ const el = bare((draw || oneThing)(Object.assign({}, e, { count: 1 }))), cy = M ? 72 : 118, hh = fitted(el, 80, 0, 98, 100, false, 0.8).h; t = fitted(el, 80, cy + hh / 2, 98, 100, !spec.holding, 0.8).s; }
  return mk(`<g${M ? ' transform="rotate(180 80 95)"' : ""}>${h}</g>` + t);
}
/* --- a car seen from the front (for PICS.place: in front of the car is at its nose): windscreen, two headlights, grille, bumper --- */
function carFront(k){
  const u = k.u, M = METAL[["red", "black", "green", "blue", "yellow", "white"].find(c => k.has(c)) || "red"], st = `stroke="${M.d}" stroke-width="1.8" stroke-linejoin="round"`;
  return `<defs><linearGradient id="${u}m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${M.l}"/><stop offset=".45" stop-color="${M.c}"/><stop offset="1" stop-color="${M.d}"/></linearGradient></defs>` + shad(80, 152, 62) +
    `<rect x="28" y="126" width="20" height="26" rx="6" fill="#26272c"/><rect x="112" y="126" width="20" height="26" rx="6" fill="#26272c"/><ellipse cx="31" cy="92" rx="8" ry="5.5" fill="${M.c}" ${st}/><ellipse cx="129" cy="92" rx="8" ry="5.5" fill="${M.c}" ${st}/>
     <path d="M38 100 L49 64 Q52 55 62 55 H98 Q108 55 111 64 L122 100Z" fill="url(#${u}m)" ${st}/><path d="M46 98 L55 67 Q56.5 62 62 62 H98 Q103.5 62 105 67 L114 98Z" fill="#cfe6f5" stroke="${M.d}" stroke-width="1.4" stroke-linejoin="round"/><path d="M56 92 L64 68 M64 94 L70 76" stroke="#fff" stroke-width="3.4" opacity=".7" stroke-linecap="round"/>
     <path d="M20 138 V112 Q20 100 34 98 H126 Q140 100 140 112 V138 Q140 143 135 143 H25 Q20 143 20 138Z" fill="url(#${u}m)" ${st}/><rect x="56" y="107" width="48" height="17" rx="4" fill="#33353b"/><path d="M60 112.5 H100 M60 118.5 H100" stroke="#8b8f96" stroke-width="1.6"/>
     <circle cx="38" cy="115" r="9.5" fill="#fbf3c4" stroke="#6d737c" stroke-width="1.8"/><circle cx="122" cy="115" r="9.5" fill="#fbf3c4" stroke="#6d737c" stroke-width="1.8"/><circle cx="36" cy="113" r="3" fill="#fff"/><circle cx="120" cy="113" r="3" fill="#fff"/>
     <rect x="16" y="129" width="128" height="11" rx="5" fill="#d5d8dc" stroke="#6d737c" stroke-width="1.5"/><rect x="66" y="130.5" width="28" height="8" rx="1.5" fill="#fffdf6" stroke="#6d737c" stroke-width="1"/>`;
}
/* the head alone of this file's cat or dog (the last group of the drawing), for looking over a box or a car from behind: with the back showing
   too the animal would seem to lie ON it */
function headOnly(T){
  const c = T.cloneNode(true), main = c.firstElementChild;
  if (!main || main.tagName !== "g") return null;
  const gs = Array.from(main.children).filter(e => e.tagName === "g"), head = gs[gs.length - 1];
  if (!head) return null;
  Array.from(main.children).forEach(e => { if (e !== head) e.remove(); });
  Array.from(c.children).forEach(e => { if (e !== main) e.remove(); });
  return c;
}
/* --- PICS.place: one thing on / in / under / in front of / behind / next to a ground. on and under: the same table or chair, only the
   thing moves; in front of and behind: the same ground in the same spot, the thing low and whole in front, or higher and half hidden --- */
function placePic(spec, draw){
  spec = spec || {};
  const D = draw || oneThing, rel = String(spec.rel || "on").toLowerCase().replace(/[^a-z]+/g, " ").trim(), G = spec.ground || {}, gk = String(G.is || "table").toLowerCase().trim(), ghost = !!spec.was;
  const T = bare(D(Object.assign({}, spec.thing, { count: 1 }))), put = (cx, yb, mw, mh) => fitted(T, cx, yb, mw, mh, ghost, 0.8);
  const gl = lookOf({ looks: G.looks }), gc = gl.cn ? [gl.cn] : [], own = (kind, more, hook) => { const k = lookOf({ looks: gc.concat(more || []) }); Object.assign(k, hook); return THING[kind](k, {}); };
  const lay = (cx, cy, s, inner) => `<g transform="translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})">${inner}</g>`;
  if (gk === "table" && (rel === "on" || rel === "under"))
    return mk(rel === "on" ? lay(80, 172, 0.9, own("table")) + put(80, 97, 86, 80).s : lay(80, 172, 0.9, own("table", [], { under: put(80, 161, 66, 44).s })));
  if (gk === "chair" && (rel === "on" || rel === "under"))
    return mk(rel === "on" ? own("chair") + put(82, 124, 64, 74).s : own("chair", [], { under: put(79, 178, 58, 37).s }));
  if (gk === "box" && rel === "in") return mk(lay(84, 170, 0.92, own("box", ["open"], { inside: put(82, 97 + Math.min(20, put(82, 0, 66, 76).h * 0.35), 66, 76).s })));
  if (gk === "box" && rel === "on") return mk(lay(84, 164, 0.8, own("box")) + put(84, 99, 76, 82).s);
  if (gk === "bag" && rel === "in"){ const P = pal(TINT[gl.cn] || COL.blue), st = `stroke="${P.d}" stroke-width="1.8" stroke-linejoin="round"`;
    return mk(shad(80, 176, 50) + `<path d="M56 96 Q56 46 80 46 Q104 46 104 96" stroke="${P.d}" stroke-width="7.4" fill="none"/><path d="M56 96 Q56 46 80 46 Q104 46 104 96" stroke="${P.b}" stroke-width="4.4" fill="none"/>
      <ellipse cx="80" cy="98" rx="52" ry="15" fill="${P.d}" ${st}/>` + put(80, 109 + Math.min(16, put(80, 0, 70, 96).h * 0.3), 70, 96).s + `<path d="M28 98 Q80 126 132 98 L124 166 Q80 178 36 166Z" fill="${P.a}" ${st}/><path d="M38 110 L44 160" stroke="#fff" stroke-width="3.4" opacity=".3" stroke-linecap="round"/>
      <path d="M58 112 Q60 146 80 146 Q100 146 102 112" stroke="${P.d}" stroke-width="7.4" fill="none" stroke-linecap="round"/><path d="M58 112 Q60 146 80 146 Q100 146 102 112" stroke="${P.h}" stroke-width="4.4" fill="none" stroke-linecap="round"/>`); }
  /* in front of / behind / next to. Grounds: a closed box, a house (its door to the viewer) and a car seen from the FRONT (so that "in front of
     the car" is at its nose). The ground stays in one spot at one size. In front: the whole thing before the middle of the ground, on a floor
     line lower down (nearer). Behind: behind the middle, only its top third showing over the box or the car's roof; behind the house, where
     nothing shows over the roof, it looks out from behind the left wall, a third of it, higher up (further away). Next to: whole, at the
     right, a clear gap, the same floor line. */
  const g = gk === "car" ? mk(carFront(gl)) : D(Object.assign({}, G, { count: 1 })), gb = measure(g), f = Math.min(96 / gb.w, 112 / gb.h, 1), gx = 56 - gb.w * f / 2, top = 150 - gb.h * f;
  const gs = `<g transform="translate(${r2(56 - (gb.x + gb.w / 2) * f)} ${r2(150 - (gb.y + gb.h) * f)}) scale(${r2(f * 1000) / 1000})">${g.outerHTML}</g>`, sh = (cx, y, w) => ghost ? "" : shad(r2(cx), y, r2(w * 0.42));
  if (rel === "next to" || rel === "beside"){ const t = put(133, 147, 46, 78); return mk(gs + sh(133, 148, t.w) + t.s); }
  if (rel === "behind" || rel === "under"){
    if (gk === "house"){ const w = put(0, 0, 58, 62).w, cx = gx + gb.w * f * 0.19 + w * 0.07; return mk(`<g transform="translate(${r2(2 * cx)} 0) scale(-1 1)">${put(cx, 138, 58, 62).s}</g>` + gs); }
    const head = /^(cat|dog)$/.test(String(spec.thing && spec.thing.is).toLowerCase().trim()) ? headOnly(T) : null;
    if (head){ const cx = gk === "box" ? 68 : 56, h = fitted(head, cx, 0, 70, 58, ghost, 1.15).h; return mk(fitted(head, cx, top + h * 0.42, 70, 58, ghost, 1.15).s + gs); }      // an animal: only the head looks over the far edge
    const t = put(0, 0, 66, 66); return mk(put(gk === "box" ? 62 : 56, top + t.h * 0.63, 66, 66).s + gs);
  }
  if (rel === "on") return mk(gs + put(56, top + 10, 80, top - 4).s);
  const t = put(56, 180, 62, 56); return mk(gs + sh(56, 181, t.w) + t.s);
}
/* --- eight places, each a scene that fills the box, the telling things up and to the right so that somebody can stand at the left
   (ARASAAC and Mulberry: beach = parasol, sea, sand; station = platform, train, clock; cafe = tables with cups outside) --- */
const picket = (x, y) => `<path d="M${x} ${y + 34} V${y + 6} l5 -6 l5 6 V${y + 34}Z" fill="#fbfaf5" stroke="#a9a498" stroke-width="1.2" stroke-linejoin="round"/>`;
const awning = (x0, x1, y, P) => { const n = Math.round((x1 - x0) / 20), w = (x1 - x0) / n; let d = `M${x0 + 4} ${y} H${x1 - 4} L${x1} ${y + 22}`; for (let i = n; i > 0; i--) d += ` Q${r2(x0 + w * (i - 0.5))} ${y + 30} ${r2(x0 + w * (i - 1))} ${y + 22}`;
  return `<path d="${d}Z" fill="#fbfaf5" stroke="${P.d}" stroke-width="1.6" stroke-linejoin="round"/>` + Array.from({ length: Math.ceil(n / 2) }, (_, j) => { const i = j * 2; return `<path d="M${r2(x0 + 4 + (x1 - x0 - 8) * i / n)} ${y} h${r2((x1 - x0 - 8) / n)} L${r2(x0 + w * (i + 1))} ${y + 22} q${r2(-w / 2)} 8 ${r2(-w)} 0z" fill="${P.a}"/>`; }).join(""); };
const cup = (x, y) => `<ellipse cx="${x}" cy="${y + 5}" rx="8" ry="2.4" fill="#fff" stroke="#8f98a3" stroke-width="1"/><path d="M${x - 5} ${y - 3} h10 l-1.5 7 h-7z" fill="#fff" stroke="#8f98a3" stroke-width="1.2"/><path d="M${x - 1.5} ${y - 6} q-3 -4 0 -7 M${x + 2.5} ${y - 6} q-3 -4 0 -7" stroke="#aeb4bd" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
function scene(is, of, u, k){
  const grass = "#9ccf7a", RED = pal(COL.red), GRN = pal(COL.green);
  if (k && VARIANT[is] && k.sig){ const v = VARIANT[is](k, u); if (v) return v; }      // the place as a thing, with looks: one of its variants
  switch (is){
    case "park": return `<rect width="160" height="190" fill="#e4f3fb"/><path d="M0 128 Q44 104 96 118 Q134 128 160 110 V190 H0Z" fill="${grass}"/><path d="M108 190 Q84 160 110 144 Q130 132 120 116 L130 114 Q146 134 122 152 Q104 166 138 190Z" fill="#ecdcb2" stroke="#cdb98a" stroke-width="1.2"/>
      <g transform="translate(62 -2) scale(.62)">${tree(lookOf({}))}</g><g transform="translate(-14 34) scale(.42)">${tree(lookOf({}))}</g>
      <path d="M46 150 v16 M88 150 v16" stroke="#3d424c" stroke-width="4" stroke-linecap="round"/><path d="M40 130 h54 v6 h-54z M40 140 h54 v6 h-54z M36 150 h62 v7 h-62z" fill="#b98558" stroke="#74492b" stroke-width="1.3"/><path d="M44 130 v20 M90 130 v20" stroke="#74492b" stroke-width="3"/>
      <g fill="#e0574c"><circle cx="20" cy="172" r="3"/><circle cx="150" cy="170" r="3"/></g><g fill="#f0c648"><circle cx="30" cy="180" r="3"/><circle cx="142" cy="182" r="3"/></g>`;
    case "beach": return `<rect width="160" height="80" fill="#dff1fb"/><rect y="74" width="160" height="50" fill="#4fa3e6"/><path d="M0 86 q10 -6 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 M-10 102 q10 -6 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" stroke="#fff" stroke-width="2.4" fill="none" opacity=".85"/>
      <path d="M0 122 Q40 110 84 120 Q124 128 160 116 V190 H0Z" fill="#f5df9e"/><circle cx="34" cy="34" r="16" fill="#ffd23c" stroke="#f39a1e" stroke-width="2.4"/>
      <path d="M112 164 L98 70" stroke="#8b8f96" stroke-width="4" stroke-linecap="round"/><g transform="rotate(-8 98 70)"><path d="M52 74 Q56 30 98 28 Q140 30 144 74 Q132.5 66 121 74 Q109.5 66 98 74 Q86.5 66 75 74 Q63.5 66 52 74Z" fill="#fbfaf5" stroke="${RED.d}" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M98 28 Q56 30 52 74 Q63.5 66 75 74 Q78 44 98 28Z M98 28 Q116 44 121 74 Q109.5 66 98 74Z" fill="${RED.a}"/></g>
      <path d="M92 166 l48 -8 l8 14 l-48 8z" fill="#58a6e0" stroke="#357fc0" stroke-width="1.4" stroke-linejoin="round"/><path d="M104 164 l8 14 M120 161 l8 14" stroke="#fff" stroke-width="3"/><circle cx="62" cy="168" r="10" fill="#fff" stroke="#8f98a3" stroke-width="1.4"/><path d="M62 158 q8 10 0 20 M52 168 q10 -6 20 0" stroke="${RED.a}" stroke-width="3" fill="none"/>`;
    case "garden": return `<rect width="160" height="112" fill="${TINT.cream[0]}"/><path d="M0 20 H160 M0 40 H160 M0 60 H160 M0 80 H160" stroke="${TINT.cream[1]}" stroke-width="1.4"/>` + paneRect(98, 30, 44, 46, WHITE, 2, 2) + `<rect x="92" y="78" width="56" height="7" rx="2" fill="${STONE.a}" stroke="${STONE.d}" stroke-width="1.2"/>
      <rect y="112" width="160" height="78" fill="${grass}"/><path d="M0 98 H160 M0 114 H160" stroke="#fbfaf5" stroke-width="5"/><path d="M0 98 H160 M0 114 H160" stroke="#a9a498" stroke-width=".8" transform="translate(0 2.5)"/>` + [2, 18, 34, 50, 66, 82, 98, 114, 130, 146].map(x => picket(x, 88)).join("") +
      `<ellipse cx="112" cy="150" rx="44" ry="13" fill="#8a6a4a" stroke="#5c4027" stroke-width="1.3"/><ellipse cx="46" cy="176" rx="40" ry="10" fill="#8a6a4a" stroke="#5c4027" stroke-width="1.3"/>` +
      [[80, 146], [96, 140], [112, 148], [128, 140], [144, 148], [22, 174], [40, 168], [58, 176], [74, 170], [104, 154], [136, 154]].map((p, i) => `<path d="M${p[0]} ${p[1]} v-13 M${p[0]} ${p[1] - 5} l5 -4" stroke="#3f8551" stroke-width="2.2" stroke-linecap="round"/><circle cx="${p[0]}" cy="${p[1] - 16}" r="5.4" fill="${["#e0574c", "#f0c648", "#e88fb0", "#9076c8"][i % 4]}" stroke="#0002" stroke-width="1"/><circle cx="${p[0]}" cy="${p[1] - 16}" r="1.8" fill="#fff8d6"/>`).join("");
    case "shop": return `<rect width="160" height="190" fill="${TINT.cream[0]}"/><rect y="170" width="160" height="20" fill="${STONE.b}"/><rect x="18" y="8" width="124" height="18" rx="3" fill="${RED.a}" stroke="${RED.d}" stroke-width="1.4"/>
      <rect x="10" y="60" width="96" height="92" fill="#cfe8f6" stroke="#3d424c" stroke-width="3.4"/><rect x="10" y="152" width="96" height="18" fill="${STONE.a}" stroke="${STONE.d}" stroke-width="1.2"/><path d="M12 138 H104 V150 H12Z" fill="#e9dcc0"/>
      <path d="M30 138 l3 -34 q-9 -5 -6 -15 l6 -3 l5 5 l5 -5 l6 3 q3 10 -6 15 l3 34z" fill="${RED.a}" stroke="${RED.d}" stroke-width="1.2" stroke-linejoin="round"/><path d="M62 138 v-20 M56 138 h12" stroke="#8b8f96" stroke-width="2"/><ellipse cx="62" cy="116" rx="14" ry="4" fill="#ecd79f" stroke="#ccb272" stroke-width="1.2"/><path d="M54 115 q8 -14 16 0z" fill="#ecd79f" stroke="#ccb272" stroke-width="1.2"/>
      <path d="M80 138 v-9 q0 -5 5 -5 h10 q5 0 5 5 v9z" fill="#4d7fc4" stroke="#3a64a3" stroke-width="1.2"/><path d="M84 125 q6 -11 12 0" stroke="#3a64a3" stroke-width="2.2" fill="none"/><path d="M18 128 L44 76 M30 130 L50 92" stroke="#fff" stroke-width="4.4" stroke-linecap="round" opacity=".7"/>
      <rect x="114" y="62" width="36" height="108" fill="${GRN.a}" stroke="${GRN.d}" stroke-width="1.6"/><rect x="120" y="70" width="24" height="50" fill="#cfe8f6" stroke="${GRN.d}" stroke-width="1.2"/><circle cx="121" cy="128" r="2.6" fill="#f2d268"/>` + awning(4, 156, 34, RED);
    case "station": return station(k, u);
    case "kitchen": return `<rect width="160" height="168" fill="#f3ecdc"/><rect y="168" width="160" height="22" fill="#d9d2c0"/><path d="M0 179 H160 M20 168 V190 M60 168 V190 M100 168 V190 M140 168 V190" stroke="#b9b09a" stroke-width="1.2"/>` +
      [4, 44, 84, 124].map(x => `<rect x="${x}" y="8" width="36" height="44" rx="2" fill="${WOOD.a}" stroke="${WOOD.d}" stroke-width="1.4"/><circle cx="${x + 30}" cy="44" r="2" fill="${WOOD.d}"/>`).join("") + `<rect y="100" width="160" height="8" fill="#8f98a3"/><rect y="108" width="92" height="60" fill="${WOOD.a}" stroke="${WOOD.d}" stroke-width="1.4"/><path d="M46 108 V168" stroke="${WOOD.d}" stroke-width="1.4"/><circle cx="40" cy="120" r="2" fill="${WOOD.d}"/><circle cx="52" cy="120" r="2" fill="${WOOD.d}"/>
      <path d="M22 100 q0 -26 14 -26 q10 0 10 10" stroke="#8b8f96" stroke-width="5" fill="none" stroke-linecap="round"/><rect x="8" y="96" width="50" height="8" rx="3" fill="#d5d8dc" stroke="#6d737c" stroke-width="1.3"/><path d="M46 88 v8" stroke="#58a8ea" stroke-width="3" stroke-linecap="round"/>
      <rect x="92" y="98" width="62" height="70" rx="3" fill="#fbfaf5" stroke="#6d737c" stroke-width="1.8"/><rect x="100" y="124" width="46" height="34" rx="3" fill="#3d424c" stroke="#26272c" stroke-width="1.4"/><path d="M104 118 H142" stroke="#6d737c" stroke-width="3" stroke-linecap="round"/><g fill="#3d424c"><circle cx="104" cy="108" r="2.6"/><circle cx="116" cy="108" r="2.6"/><circle cx="130" cy="108" r="2.6"/><circle cx="142" cy="108" r="2.6"/></g>
      <path d="M100 98 h28 l-3 -16 h-22z" fill="#d8483f" stroke="#ad332c" stroke-width="1.5" stroke-linejoin="round"/><path d="M128 86 h16" stroke="#2b2b30" stroke-width="4" stroke-linecap="round"/><path d="M108 76 q-4 -6 0 -12 q4 -6 0 -12 M120 76 q-4 -6 0 -12 q4 -6 0 -12" stroke="#aeb4bd" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    case "cafe": return `<rect width="160" height="190" fill="#f3e6cf"/><rect y="150" width="160" height="40" fill="${STONE.b}"/><rect x="14" y="52" width="132" height="98" fill="#cfe8f6" stroke="#5c4027" stroke-width="3.4"/><path d="M80 52 V150 M14 100 H146" stroke="#5c4027" stroke-width="2.6"/><path d="M24 92 L46 60 M92 92 L110 62" stroke="#fff" stroke-width="4.4" stroke-linecap="round" opacity=".7"/>` + awning(4, 156, 18, GRN) +
      [[58, 150], [118, 162]].map(p => `<path d="M${p[0]} ${p[1]} v26 M${p[0] - 12} ${p[1] + 28} h24" stroke="#3d424c" stroke-width="3.4" stroke-linecap="round"/><ellipse cx="${p[0]}" cy="${p[1]}" rx="24" ry="7" fill="#fbfaf5" stroke="#6d737c" stroke-width="1.6"/>` + cup(p[0] - 9, p[1] - 6) + cup(p[0] + 10, p[1] - 4)).join("") +
      `<path d="M84 178 v-22 q0 -8 8 -8 M84 164 h14 v14" stroke="#5c4027" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M146 188 v-22 q0 -8 8 -8 M146 174 h12" stroke="#5c4027" stroke-width="3.4" fill="none" stroke-linecap="round"/>`;
  }
  // a house; with a name: that person's house, the name on a plate by the door
  const nm = of ? String(of).replace(/[&<>]/g, "") : "", tw = Math.max(30, nm.length * 5.4 + 8);
  return `<rect width="160" height="190" fill="#e4f3fb"/><g transform="translate(-8 -24) scale(1.12)">${house(lookOf({}))}</g>` + (nm ? `<rect x="${r2(117 - tw / 2)}" y="121" width="${r2(tw)}" height="15" rx="3" fill="#fffdf6" stroke="#8a867a" stroke-width="1.4"/><text x="117" y="132.5" text-anchor="middle" font-family="system-ui,-apple-system,Segoe UI,Roboto,sans-serif" font-size="10" font-weight="700" fill="#2a2522">${nm}</text>` : "");
}
/* who goes or is somewhere: "you" | "marie" | a person spec. A named person is the whole action figure; a stranger is the walker (going) or head and shoulders (at) */
function figure(who, walking){
  const s = typeof who === "string" ? { person: who } : (who || { person: "you" }), named = s.person === "paul" || s.person === "julie" || s.person === "marie" || s.person === "you";
  if (named) return { full: 1, g: action(walking ? "walk" : "stop", s.person, { still: true, looks: s.looks, name: s.name }) };
  return walking ? { full: 1, g: walker(s) } : { full: 0, g: bust(s) };
}
const placeOf = p => { p = typeof p === "string" ? { is: p } : (p || {}); return [String(p.is || "house").toLowerCase().trim().replace(/^(the|a) /, ""), p.of]; };
function goingPic(spec){
  spec = spec || {};
  const u = "pg" + (seq++) + "_", p = placeOf(spec.to), f = figure(spec.who, true);
  const g = mk(`<defs><clipPath id="${u}c"><rect x="0" y="0" width="160" height="190" rx="16"/></clipPath></defs><g transform="translate(60 44) scale(.61)"><g clip-path="url(#${u}c)">${scene(p[0], p[1], u)}</g><rect width="160" height="190" rx="16" fill="none" stroke="#8f98a3" stroke-width="2.6"/></g>
    <path d="M30 181 H60" stroke="#fff" stroke-width="11" stroke-linecap="round"/><path d="M30 181 H58" stroke="#3fae5a" stroke-width="6.5" stroke-linecap="round"/><path d="M50 171.5 L61 181 L50 190.5" stroke="#3fae5a" stroke-width="6.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <g class="who" transform="translate(-13 80) scale(.52)"></g>`);
  g.querySelector("g.who").appendChild(f.g);
  return g;
}
function atPic(spec){
  spec = spec || {};
  const u = "pg" + (seq++) + "_", p = placeOf(spec.place), f = figure(spec.who, false);
  const g = mk(`<defs><clipPath id="${u}c"><rect x="0" y="0" width="160" height="190" rx="13"/></clipPath></defs><g clip-path="url(#${u}c)">${scene(p[0], p[1], u)}<g class="who" transform="${f.full ? "translate(-14 62) scale(.68)" : "translate(-6 84) scale(.56)"}"></g></g>`);
  g.querySelector("g.who").appendChild(f.g);
  return g;
}
/* --- a train, seen from the side on its rails: a streamlined nose, linked carriages, a dark band of small windows, bogies (a bus is one tall box
   with big light windows on two road wheels). kind "" (the usual one) | "fast" | "old" | "steam"; drawn nose to the right, the rail at y = 0,
   40 high; returns [svg, length]. The same train stands in the station. --- */
function trainSet(P, kind, n, noRails){
  const st = `stroke="${P.d}" stroke-width="1.5" stroke-linejoin="round"`, DK = "#2f3b52", bogie = x => `<rect x="${x}" y="-8.5" width="17" height="5.5" rx="2" fill="#3d424c"/><circle cx="${x + 3.5}" cy="-4" r="4" fill="#26272c"/><circle cx="${x + 13.5}" cy="-4" r="4" fill="#26272c"/><circle cx="${x + 3.5}" cy="-4" r="1.4" fill="#b9bec6"/><circle cx="${x + 13.5}" cy="-4" r="1.4" fill="#b9bec6"/>`;
  const old = kind === "old" || kind === "steam", cw = 50, lw = kind === "fast" ? 72 : kind === "steam" ? 74 : 58, L = lw + n * (cw + 3);
  const car = x => bogie(x + 4) + bogie(x + cw - 21) + (old ? `<rect x="${x}" y="-37" width="${cw}" height="30" rx="3" fill="${P.a}" ${st}/><path d="M${x} -37 q${cw / 2} -7 ${cw} 0z" fill="#8f98a3" ${st}/><rect x="${x + 1}" y="-34" width="${cw - 2}" height="13" fill="#fdf4da"/>` +
      [0, 1, 2, 3].map(i => `<rect x="${x + 4 + i * 11.2}" y="-32.5" width="8" height="10" rx="1.5" fill="${DK}"/>`).join("")
    : `<rect x="${x}" y="-40" width="${cw}" height="33" rx="5" fill="${P.a}" ${st}/><rect x="${x + 3}" y="-33.5" width="${cw - 6}" height="11" rx="3" fill="${DK}"/><path d="M${x + 12} -33.5 v11 M${x + 21} -33.5 v11 M${x + 29} -33.5 v11 M${x + 38} -33.5 v11" stroke="${P.a}" stroke-width="1.6"/><path d="M${x + 2} -15.5 h${cw - 4}" stroke="#fff" stroke-width="3" opacity=".85"/>`) +
    `<rect x="${x + cw}" y="-22" width="3" height="6" fill="#3d424c"/>`;
  let s = noRails ? "" : `<path d="M-4 1.5 H${L + 6}" stroke="#6d737c" stroke-width="3" stroke-linecap="round"/><path d="${Array.from({ length: Math.ceil((L + 8) / 9) }, (_, i) => `M${-2 + i * 9} 3 v4.5`).join(" ")}" stroke="#8a6a4a" stroke-width="3.4"/>`;
  for (let i = 0; i < n; i++) s += car(i * (cw + 3));
  const x = n * (cw + 3);
  if (kind === "steam") s += `<g fill="#c9ccd1" stroke="#8f98a3" stroke-width="1"><circle cx="${x + 46}" cy="-66" r="7"/><circle cx="${x + 34}" cy="-76" r="9"/><circle cx="${x + 18}" cy="-84" r="11"/></g>
      <path d="M${x} -31 h20 v24 h-20z" fill="${P.b}" ${st}/><path d="M${x + 2} -31 q8 -7 16 0z" fill="#33353b"/><rect x="${x + 21}" y="-48" width="19" height="41" rx="2" fill="${P.a}" ${st}/><rect x="${x + 25}" y="-43" width="11" height="11" rx="1.5" fill="#cfe6f5" stroke="${P.d}" stroke-width="1.2"/><path d="M${x + 19} -50 h23" stroke="${P.d}" stroke-width="4" stroke-linecap="round"/>
      <rect x="${x + 40}" y="-36" width="26" height="22" rx="9" fill="${P.a}" ${st}/><rect x="${x + 62}" y="-38" width="7" height="26" rx="2" fill="${P.b}" ${st}/><path d="M${x + 54} -36 v-13 h-3 l2 -5 h8 l2 5 h-3 v13z" fill="${P.b}" ${st}/><path d="M${x + 44} -36 q0 -7 5 -7 q5 0 5 7z" fill="#f2d268" stroke="#a07c1c" stroke-width="1"/>
      <path d="M${x + 66} -9 l8 5 h-12z" fill="#d8483f" stroke="#8f1f1a" stroke-width="1"/><rect x="${x + 22}" y="-14" width="46" height="5" fill="#d8483f"/>` + [28, 43, 58].map(d => `<circle cx="${x + d}" cy="-7" r="7" fill="#26272c"/><circle cx="${x + d}" cy="-7" r="4.2" fill="none" stroke="#d8483f" stroke-width="1.6"/><circle cx="${x + d}" cy="-7" r="1.5" fill="#d5d8dc"/>`).join("") +
      `<path d="M${x + 28} -5 H${x + 58}" stroke="#b9bec6" stroke-width="2.6" stroke-linecap="round"/>` + bogie(x + 2).replace(/r="4"/g, 'r="3.4"');
  else if (kind === "old") s += bogie(x + 5) + bogie(x + lw - 24) + `<path d="M${x} -38 H${x + lw - 12} Q${x + lw} -38 ${x + lw} -26 V-7 H${x}Z" fill="${P.a}" ${st}/><path d="M${x} -38 h${lw - 10} q4 -6 -4 -7 h-${lw - 16}z" fill="#8f98a3" ${st}/><rect x="${x + 5}" y="-33" width="12" height="11" rx="1.5" fill="${DK}"/><rect x="${x + lw - 22}" y="-33" width="16" height="11" rx="1.5" fill="${DK}"/>
      <path d="M${x + 22} -32 v20 M${x + 26} -32 v20 M${x + 30} -32 v20 M${x + 34} -32 v20" stroke="${P.d}" stroke-width="1.5"/><path d="M${x + 2} -16 h${lw - 4}" stroke="#fdf4da" stroke-width="3"/><circle cx="${x + lw - 3}" cy="-13" r="2.8" fill="#f6e08a" stroke="#6d737c" stroke-width="1"/><rect x="${x + lw}" y="-13" width="4" height="5" fill="#3d424c"/>`;
  else { const f = kind === "fast" ? 0.5 : 0.62;
    s += bogie(x + 5) + bogie(x + lw * f - 8) + `<path d="M${x} -40 H${r2(x + lw * (f - 0.1))} Q${r2(x + lw * (f + 0.22))} -40 ${x + lw} ${kind === "fast" ? -13 : -17} Q${x + lw + 1.5} -8 ${x + lw - 5} -7 H${x}Z" fill="${P.a}" ${st}/>
      <path d="M${r2(x + lw * f)} -35 Q${r2(x + lw * (f + 0.2))} -34 ${r2(x + lw * (f + 0.33))} ${kind === "fast" ? -20 : -22} L${r2(x + lw * (f + 0.05))} ${kind === "fast" ? -22 : -24}Z" fill="${DK}"/><rect x="${x + 3}" y="-33.5" width="${r2(lw * (f - 0.12))}" height="11" rx="3" fill="${DK}"/>
      <path d="M${x + 2} -15.5 H${r2(x + lw * 0.86)}" stroke="#fff" stroke-width="3" opacity=".85" stroke-linecap="round"/><path d="M${r2(x + lw * 0.8)} -9 Q${x + lw - 1} -10 ${x + lw} -15 L${r2(x + lw * 0.86)} -16Z" fill="#f2cf3a"/><circle cx="${r2(x + lw * 0.9)}" cy="-13" r="2.2" fill="#fffbe0" stroke="#6d737c" stroke-width=".8"/>
      <path d="M${x + 14} -40 l5 -7 l-5 -5 h13" stroke="#3d424c" stroke-width="1.6" fill="none" stroke-linejoin="round"/>` + (kind === "fast" ? `<path d="M${x + lw + 6} -30 h14 M${x + lw + 9} -22 h16" stroke="#aeb4bd" stroke-width="3" stroke-linecap="round"/>` : ""); }
  return [s, L + (kind === "fast" ? 24 : 0)];
}
const SILVER = pal(["#dfe3e8", "#aab0b9"]);
/* the noun "train": the nose of the locomotive and ONE carriage, seen three-quarters on, coming towards the viewer along its rails, as big in
   the box as a bus but nothing like one: a rounded or pointed nose, no doors, a dark band of small windows, bogies, rails and sleepers */
function train(k){
  const u = k.u, has = k.has, steam = has("steam"), old = has("old") && !steam, fast = has("fast"), long = has("long");
  const P = k.cn ? k.tint() : steam ? pal(TINT.black) : old ? pal(COL.green) : SILVER, st = `stroke="${P.d}" stroke-width="1.7" stroke-linejoin="round"`, DK = "#2f3b52", HH = 86;
  const X = t => 112 - 106 * t, YG = t => 154 - 32 * t, S = t => 1 - 0.52 * t, pt = (t, h, dx) => `${r2(X(t) + (dx || 0) * S(t))} ${r2(YG(t) - h * HH * S(t) - (dx || 0) * 0.15 * S(t))}`;      // t: 0 at the nose end, 1 far away; h: 0 the rail, 1 the roof
  const quad = (t0, t1, h0, h1) => `M${pt(t0, h1)} L${pt(t1, h1)} L${pt(t1, h0)} L${pt(t0, h0)}Z`, wheel = t => `<circle cx="${r2(X(t))}" cy="${r2(YG(t) - 6.5 * S(t))}" r="${r2(7.5 * S(t))}" fill="#26272c"/><circle cx="${r2(X(t))}" cy="${r2(YG(t) - 6.5 * S(t))}" r="${r2(2.8 * S(t))}" fill="#b9bec6"/>`;
  const cars = long ? [[0, 0.3], [0.33, 0.55], [0.58, 0.78], [0.81, 1]] : [[0, 0.48], [0.52, 1]];
  let s = `<defs>${lgr(u + "t", P.h, P.a)}<clipPath id="${u}x"><rect x="2" y="0" width="156" height="190"/></clipPath></defs><g clip-path="url(#${u}x)"><path d="${Array.from({ length: 16 }, (_, i) => { const t = -0.34 + i * 0.09; return `M${pt(t, 0, -9)} L${pt(t, 0, 46)}`; }).join(" ")}" stroke="#8a6a4a" stroke-width="4.4" stroke-linecap="round"/>
    <path d="M${pt(-0.36, 0)} L${pt(1.04, 0)} M${pt(-0.36, 0, 36)} L${pt(1.04, 0, 36)}" stroke="#5b616d" stroke-width="3" stroke-linecap="round"/>`;
  for (let i = cars.length - 1; i >= 0; i--){ const c = cars[i], t0 = c[0], t1 = c[1], loco = i === 0, m = (t1 - t0) * 0.07;
    if (i < cars.length - 1) s += `<path d="${quad(t1, cars[i + 1][0], 0.2, 0.42)}" fill="#3d424c"/>`;
    if (steam && loco){                                    // the boiler, the cab behind it, the funnel and the big driving wheels
      s += `<path d="${quad(t0 + 0.3, t1, 0.12, 1.06)}" fill="${P.a}" ${st}/><path d="${quad(t0 + 0.34, t1 - 0.03, 0.62, 0.92)}" fill="#cfe6f5" stroke="${P.d}" stroke-width="1.4"/><path d="${quad(t0, t0 + 0.3, 0.2, 0.86)}" fill="url(#${u}t)" ${st}/>
        <path d="${quad(t0 + 0.03, t0 + 0.09, 0.86, 1.3)}" fill="${P.b}" ${st}/><path d="${quad(t0 + 0.015, t0 + 0.105, 1.3, 1.4)}" fill="${P.b}" ${st}/><path d="M${pt(t0 + 0.16, 0.86)} Q${pt(t0 + 0.19, 1.12)} ${pt(t0 + 0.22, 0.86)}Z" fill="#f2d268" stroke="#a07c1c" stroke-width="1.2"/><path d="${quad(t0, t1, 0.12, 0.22)}" fill="#d8483f"/>` +
        [0.07, 0.17, 0.27].map(t => `<circle cx="${r2(X(t))}" cy="${r2(YG(t) - 12 * S(t))}" r="${r2(12.5 * S(t))}" fill="#26272c"/><circle cx="${r2(X(t))}" cy="${r2(YG(t) - 12 * S(t))}" r="${r2(7.6 * S(t))}" fill="none" stroke="#d8483f" stroke-width="2.2"/><circle cx="${r2(X(t))}" cy="${r2(YG(t) - 12 * S(t))}" r="2.4" fill="#d5d8dc"/>`).join("") +
        `<path d="M${r2(X(0.07))} ${r2(YG(0.07) - 9 * S(0.07))} L${r2(X(0.27))} ${r2(YG(0.27) - 9 * S(0.27))}" stroke="#b9bec6" stroke-width="3.4" stroke-linecap="round"/>` + wheel(t0 + 0.36) + wheel(t0 + 0.44);
      continue; }
    s += wheel(t0 + m * 1.6) + wheel(t0 + m * 3.6) + wheel(t1 - m * 3.6) + wheel(t1 - m * 1.6) + `<path d="${quad(t0, t1, 0.03, 0.14)}" fill="#3d424c"/><path d="${quad(t0, t1, 0.12, 1)}" fill="url(#${u}t)" ${st}/><path d="${quad(t0, t1, 1, 1.06)}" fill="#8f98a3" stroke="#6d737c" stroke-width="1.2" stroke-linejoin="round"/>` +
      (old ? `<path d="${quad(t0, t1, 0.56, 0.86)}" fill="#fdf4da"/>` + Array.from({ length: loco ? 2 : 5 }, (_, j) => { const a = t0 + m + (t1 - t0 - 2 * m) * (j + 0.12) / (loco ? 2 : 5), b = t0 + m + (t1 - t0 - 2 * m) * (j + 0.88) / (loco ? 2 : 5); return `<path d="${quad(a, b, 0.6, 0.82)}" fill="${DK}"/>`; }).join("")
        : `<path d="${quad(t0 + m, t1 - m, 0.58, 0.82)}" fill="${DK}"/><path d="${Array.from({ length: 5 }, (_, j) => { const t = t0 + m + (t1 - t0 - 2 * m) * (j + 1) / 6; return `M${pt(t, 0.58)} L${pt(t, 0.82)}`; }).join(" ")}" stroke="${P.a}" stroke-width="2"/>`) +
      `<path d="${quad(t0, t1, 0.36, 0.43)}" fill="#fff" opacity=".85"/>`;
  }
  const A = [X(0), YG(0) - 0.12 * HH], B = [X(0), YG(0) - HH];                 // the near end of the locomotive: the foot and the top of its corner
  if (steam) s += `<g fill="#c9ccd1" stroke="#8f98a3" stroke-width="1.2"><circle cx="118" cy="26" r="9"/><circle cx="102" cy="16" r="12"/><circle cx="80" cy="12" r="14"/></g><ellipse cx="${A[0] + 17}" cy="${A[1] - 37}" rx="19" ry="31" fill="${P.b}" ${st}/><ellipse cx="${A[0] + 17}" cy="${A[1] - 37}" rx="12" ry="21" fill="none" stroke="#8b8f96" stroke-width="1.8"/><circle cx="${A[0] + 17}" cy="${A[1] - 37}" r="3" fill="#d5d8dc"/>
      <path d="M${A[0] - 4} ${A[1] + 1} L${A[0] + 40} ${A[1] - 5} L${A[0] + 46} ${A[1] + 9} L${A[0] + 2} ${A[1] + 15}Z" fill="#d8483f" stroke="#8f1f1a" stroke-width="1.4" stroke-linejoin="round"/><path d="M${A[0] + 8} ${A[1]} l4 13 M${A[0] + 20} ${A[1] - 2} l4 13 M${A[0] + 32} ${A[1] - 3} l4 13" stroke="#8f1f1a" stroke-width="1.4"/><circle cx="${A[0] + 17}" cy="${A[1] - 74}" r="5" fill="#fbf3c4" stroke="#6d737c" stroke-width="1.4"/>`;
  else if (old) s += `<path d="M${B[0]} ${B[1]} L${B[0] + 36} ${B[1] - 5} V${A[1] - 6} L${A[0]} ${A[1]}Z" fill="${P.a}" ${st}/><path d="M${B[0]} ${B[1]} l36 -5 l-2 -5 l-36 5z" fill="#8f98a3" stroke="#6d737c" stroke-width="1.2" stroke-linejoin="round"/><path d="M${B[0] + 4} ${B[1] + 12} l12 -1.8 v19 l-12 1.800z M${B[0] + 20} ${B[1] + 9.6} l12 -1.8 v19 l-12 1.800z" fill="${DK}"/>
      <path d="M${B[0]} ${B[1] + 37} l36 -5.4 v7 l-36 5.400z" fill="#fdf4da"/><circle cx="${A[0] + 8}" cy="${A[1] - 16}" r="4.4" fill="#fbf3c4" stroke="#6d737c" stroke-width="1.3"/><circle cx="${A[0] + 28}" cy="${A[1] - 19}" r="4.4" fill="#fbf3c4" stroke="#6d737c" stroke-width="1.3"/><path d="M${A[0] + 2} ${A[1] - 3} h9 v7 h-9z M${A[0] + 25} ${A[1] - 6.5} h9 v7 h-9z" fill="#3d424c"/>`;
  else { const nx = fast ? 48 : 38, ny = fast ? 46 : 28;        // a streamlined nose: the windscreen slopes back to the roof
    s += `<path d="M${B[0]} ${B[1]} Q${B[0] + nx * 0.6} ${B[1] - 2} ${B[0] + nx} ${B[1] + ny} Q${B[0] + nx + 5} ${A[1] - 22} ${B[0] + nx - 3} ${A[1] - 7} L${A[0]} ${A[1]}Z" fill="url(#${u}t)" ${st}/>
      <path d="M${B[0] + 4} ${B[1] + 7} Q${B[0] + nx * 0.55} ${B[1] + 5} ${B[0] + nx - 5} ${B[1] + ny + 2} L${B[0] + 5} ${B[1] + ny + 9}Z" fill="${DK}"/><path d="M${B[0] + 8} ${B[1] + ny + 2} L${B[0] + nx * 0.4} ${B[1] + 10}" stroke="#fff" stroke-width="3" opacity=".3" stroke-linecap="round"/>
      <path d="M${A[0] + 1} ${A[1] - 26} L${B[0] + nx + 1.5} ${A[1] - 31} Q${B[0] + nx + 3} ${A[1] - 18} ${B[0] + nx - 3} ${A[1] - 8} L${A[0] + 1} ${A[1] - 2}Z" fill="#f2cf3a" stroke="#a88a14" stroke-width="1.2" stroke-linejoin="round"/><circle cx="${A[0] + 8}" cy="${A[1] - 15}" r="3.8" fill="#fffbe0" stroke="#6d737c" stroke-width="1.1"/><circle cx="${B[0] + nx - 9}" cy="${A[1] - 19}" r="3.8" fill="#fffbe0" stroke="#6d737c" stroke-width="1.1"/>
      <path d="M${pt(0.14, 1.06)} l5 -9 l-6 -6 h15" stroke="#3d424c" stroke-width="2" fill="none" stroke-linejoin="round"/>` + (fast ? `<path d="M118 34 h22 M126 46 h26" stroke="#aeb4bd" stroke-width="3.4" stroke-linecap="round"/>` : ""); }
  return s + `</g>`;                                       // the track runs off the picture at the right: cut at the edge of the box
}
/* --- a railway station: the far platform with the building, its roof and a clock; the track with rails and sleepers; the near platform with its
   yellow line along the edge; in the usual picture a train stands at the platform, nose and two carriages, the rest off the picture --- */
function station(k, u){
  const has = k ? k.has : () => false, any = k && k.sig, modern = has("modern"), old = has("old"), big = has("big", "clock"), withTrain = !any || has("train") || !(modern || old || big || has("brick") || (k && k.cn));
  const W = any && k.cn && !has("brick") ? k.tint() : has("brick") ? pal(TINT.brick) : pal(TINT.cream), R = modern ? STEEL : pal(["#8f6a52", "#6b4c38"]), st = `stroke="${W.d}" stroke-width="1.5" stroke-linejoin="round"`;
  const clock = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="#3d424c" stroke-width="${r2(r * 0.2)}"/><path d="M${x} ${y} V${r2(y - r * 0.62)} M${x} ${y} l${r2(r * 0.45)} ${r2(r * 0.28)}" stroke="#2b2b30" stroke-width="${r2(r * 0.16)}" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="${r2(r * 0.1)}" fill="#2b2b30"/>`;
  const arch = (x, y, w, h) => `<path d="M${x} ${y + h} V${y + w / 2} A${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + w / 2} V${y + h}Z" fill="#cfe6f5" stroke="${W.d}" stroke-width="1.4"/>`;
  let b;                                                   // the building, on the far platform
  if (modern) b = `<path d="M-4 64 Q80 2 164 64 V120 H-4Z" fill="#cfe6f5" stroke="${STEEL.d}" stroke-width="2"/><path d="M-4 64 Q80 2 164 64" fill="none" stroke="${W.a}" stroke-width="9"/><path d="M-4 64 Q80 2 164 64" fill="none" stroke="${W.d}" stroke-width="1.5" transform="translate(0 -4.5)"/>
      <path d="M20 53 V120 M50 39 V120 M80 34 V120 M110 39 V120 M140 53 V120 M-4 88 H164" stroke="${STEEL.d}" stroke-width="2"/><path d="M26 108 L44 60 M58 110 L74 56" stroke="#fff" stroke-width="4.4" opacity=".7" stroke-linecap="round"/>` + clock(110, 76, 13);
  else if (big) b = `<rect x="2" y="50" width="156" height="70" fill="${W.a}" ${st}/><path d="M-2 52 H162 L154 36 H6Z" fill="${R.a}" stroke="${R.d}" stroke-width="1.5"/><path d="M58 52 V20 L80 6 L102 20 V52Z" fill="${W.a}" ${st}/><path d="M54 22 L80 4 L106 22" fill="none" stroke="${R.d}" stroke-width="4" stroke-linejoin="round"/>` + clock(80, 33, has("clock") ? 15 : 12) +
      arch(10, 66, 22, 54) + arch(40, 66, 22, 54) + arch(98, 66, 22, 54) + arch(128, 66, 22, 54) + `<path d="M68 120 V78 A12 12 0 0 1 92 78 V120Z" fill="${WOOD.b}" stroke="${WOOD.d}" stroke-width="1.4"/><path d="M2 60 H158" stroke="${W.d}" stroke-width="1.2" opacity=".6"/>`;
  else b = `<rect x="${old ? 14 : 8}" y="58" width="${old ? 116 : 104}" height="62" fill="${W.a}" ${st}/>` + (old ? `<path d="M6 60 L72 22 L138 60Z" fill="${R.a}" stroke="${R.d}" stroke-width="1.5" stroke-linejoin="round"/>` + clock(72, 46, 10) + `<path d="M146 120 V44 M146 48 h-14 v8 h14" stroke="#3d424c" stroke-width="3.4" fill="#d8483f" stroke-linejoin="round"/>`
      : `<path d="M0 60 H120 L112 42 H8Z" fill="${R.a}" stroke="${R.d}" stroke-width="1.5" stroke-linejoin="round"/><path d="M96 30 H164 V38 H96Z" fill="${R.b}" stroke="${R.d}" stroke-width="1.4"/><path d="M150 38 V120" stroke="#6d737c" stroke-width="4.4"/><path d="M128 38 v10" stroke="#3d424c" stroke-width="2.6"/>` + clock(128, 62, 14)) +
      arch(old ? 26 : 18, 74, 20, 46) + arch(old ? 96 : 84, 74, 20, 46) + `<path d="M${old ? 60 : 50} 120 V84 A12 12 0 0 1 ${old ? 84 : 74} 84 V120Z" fill="${WOOD.b}" stroke="${WOOD.d}" stroke-width="1.4"/>` +
      (has("brick") ? `<path d="M10 68 h100 M10 78 h8 M40 78 h8 M106 78 h4 M10 100 h6 M40 100 h8 M106 100 h4 M10 110 h6" stroke="${W.d}" stroke-width="1" opacity=".5"/>` : "");
  const t = trainSet(any && k.cn && has("train") ? k.tint() : SILVER, "", 3, true);
  return `<rect width="160" height="190" fill="#e4f3fb"/>${b}<path d="M0 120 H160 V130 H0Z" fill="#c9cdd3" stroke="#8f98a3" stroke-width="1.3"/><rect y="130" width="160" height="26" fill="#a99c8a"/>
    <path d="${Array.from({ length: 14 }, (_, i) => `M${4 + i * 12} 138 v14`).join(" ")}" stroke="#74563a" stroke-width="5"/><path d="M0 141 H160 M0 150 H160" stroke="#5b616d" stroke-width="2.6"/>` +
    (withTrain ? `<g transform="translate(${r2(153 - t[1] * 1.12)} 151) scale(1.12)">${t[0]}</g>` : "") +
    `<path d="M0 156 H160 V190 H0Z" fill="#d9dce0"/><path d="M0 156 H160" stroke="#8f98a3" stroke-width="1.6"/><path d="M0 163 H160" stroke="#f0c648" stroke-width="5"/><path d="M40 172 V190 M100 172 V190 M0 172 H160" stroke="#b9bec6" stroke-width="1.2"/>`;
}
/* --- the nouns of Lessons 11-20. A single colour look only colours (the same shape in every colour); the other look words pick the variant. --- */
const rgr = (id, P) => `<radialGradient id="${id}" cx=".36" cy=".32" r=".8"><stop offset="0" stop-color="${P.h}"/><stop offset=".5" stop-color="${P.a}"/><stop offset="1" stop-color="${P.b}"/></radialGradient>`;
/* a ball: a plain circle with a seam band (no stalk, no leaf: not an apple or a tomato); football, beach ball, basketball */
function ball(k){
  const u = k.u, has = k.has, foot = has("football"), basket = has("basketball"), beach = has("beach"), P = foot && !k.cn ? pal(COL.white) : k.tint(basket ? "orange" : beach ? "green" : "red"), st = `stroke="${P.d}" stroke-width="2"`;
  let s = `<defs>${rgr(u + "b", P)}<clipPath id="${u}c"><circle cx="80" cy="100" r="58"/></clipPath></defs>` + shad(82, 162, 46) + `<circle cx="80" cy="100" r="58" fill="url(#${u}b)" ${st}/><g clip-path="url(#${u}c)">`;
  if (foot) s += `<path d="M80 76 L103 93 L94 120 H66 L57 93Z M80 76 V48 M103 93 L130 84 M94 120 L110 144 M66 120 L50 144 M57 93 L30 84" fill="#2b2b30" stroke="#2b2b30" stroke-width="2.6" stroke-linejoin="round"/><path d="M80 48 L58 38 L62 20 H98 L102 38Z M130 84 L138 62 L160 70 V112 L140 106Z M30 84 L22 62 L0 70 V112 L20 106Z M110 144 L132 140 L140 166 H104 L98 160Z M50 144 L28 140 L20 166 H56 L62 160Z" fill="#2b2b30"/>`;
  else if (basket) s += `<path d="M80 40 V160 M22 100 H138 M40 54 Q66 100 40 146 M120 54 Q94 100 120 146" stroke="#2b2b30" stroke-width="3" fill="none"/>`;
  else if (beach) s += [[-58, -36, 0], [-36, -12, 1], [-12, 12, 2], [12, 36, 1], [36, 58, 0]].map(g => `<path d="M80 42 A${Math.abs(g[0])} 58 0 0 ${g[0] < 0 ? 0 : 1} 80 158 A${Math.abs(g[1])} 58 0 0 ${g[1] < 0 ? 1 : 0} 80 42Z" fill="${[P.a, "#fbfaf5", k.cn === "yellow" ? "#e0574c" : "#f0c648"][g[2]]}" stroke="${P.d}" stroke-width="1.3"/>`).join("") + `<circle cx="80" cy="45" r="7" fill="#fbfaf5" stroke="${P.d}" stroke-width="1.3"/>`;
  else s += `<path d="M22 84 Q80 118 138 84 M22 110 Q80 144 138 110" stroke="#fff" stroke-width="5" fill="none" opacity=".85"/><path d="M22 97 Q80 131 138 97" stroke="${P.d}" stroke-width="1.6" fill="none" stroke-dasharray="4 4" opacity=".6"/>`;
  return s + `</g><circle cx="80" cy="100" r="58" fill="none" ${st}/><ellipse cx="58" cy="72" rx="13" ry="8" fill="#fff" opacity=".45" transform="rotate(-30 58 72)"/>`;
}
/* a hat (un chapeau): a crown and a brim all round. No woolly hat and no cap: those are other words (un bonnet, une casquette) */
function hat(k){
  const u = k.u, has = k.has, straw = has("straw"), top = has("top hat", "top"), cow = has("cowboy"), sun = has("sun"), feather = has("feather");
  const P = straw && !k.cn ? pal(COL.straw) : k.tint(cow ? "brown" : sun ? "white" : feather ? "green" : "black"), defs = `<defs>${lgr(u + "h", P.a, P.b)}</defs>`, F = `fill="url(#${u}h)" stroke="${P.d}" stroke-width="1.8" stroke-linejoin="round"`, band = k.cn === "red" ? "#2b2b30" : "#d8483f";
  if (top) return defs + shad(80, 158, 58) + `<ellipse cx="80" cy="136" rx="62" ry="13" ${F}/><path d="M46 134 L41 42 Q80 30 119 42 L114 134 Q80 146 46 134Z" ${F}/><ellipse cx="80" cy="42" rx="39" ry="9.5" fill="${P.a}" stroke="${P.d}" stroke-width="1.8"/>
      <path d="M45.2 118 Q80 130 114.8 118 L114 134 Q80 146 46 134Z" fill="${k.cn === "black" || !k.cn ? "#d8483f" : "#2b2b30"}"/><path d="M54 56 L57 108" stroke="${P.h}" stroke-width="5" opacity=".35" stroke-linecap="round"/>`;
  if (cow) return defs + shad(80, 152, 62) + `<path d="M6 104 Q20 150 80 136 Q140 150 154 104 Q138 126 110 126 H50 Q22 126 6 104Z" ${F}/><path d="M46 128 Q40 66 62 58 Q72 54 80 64 Q88 54 98 58 Q120 66 114 128 Q80 138 46 128Z" ${F}/><path d="M46 116 Q80 128 114 116 L114 128 Q80 138 46 128Z" fill="${tone(P.b, -0.3)}"/><path d="M80 64 V86" stroke="${P.d}" stroke-width="1.6" opacity=".6"/><circle cx="80" cy="127" r="3.6" fill="#f2d268" stroke="#a07c1c" stroke-width="1"/>`;
  if (sun || straw) return defs + shad(80, 152, 64) + `<path d="M6 122 Q10 100 46 102 H114 Q150 100 154 122 Q${sun ? "132 150 108 136 Q80 150 52 136 Q28 150" : "120 146 80 146 Q40 146"} 6 122Z" ${F}/><path d="M44 112 Q42 64 80 62 Q118 64 116 112 Q80 124 44 112Z" ${F}/><path d="M44 100 Q80 112 116 100 L116 112 Q80 124 44 112Z" fill="${sun ? "#4d7fc4" : band}"/>` +
      (straw ? `<path d="M18 118 Q80 138 142 118 M28 128 Q80 144 132 128 M52 74 Q80 66 108 74 M48 86 Q80 78 112 86" stroke="${P.d}" stroke-width="1.1" fill="none" opacity=".6"/><path d="M112 106 l14 -6 l-2 14z M112 106 l12 10 l-12 4z" fill="${band}"/>` : `<path d="M112 106 q14 -10 16 6 q-8 6 -16 -6z M112 106 q10 12 2 20 q-8 -6 -2 -20z" fill="#4d7fc4" stroke="#3a64a3" stroke-width="1"/>`);
  return defs + shad(80, 152, 62) + `<ellipse cx="80" cy="128" rx="68" ry="15" ${F}/><path d="M40 126 Q36 76 56 66 Q70 58 80 68 Q90 58 104 66 Q124 76 120 126 Q80 140 40 126Z" ${F}/><path d="M40 112 Q80 126 120 112 L120 126 Q80 140 40 126Z" fill="${k.cn === "black" || !k.cn ? "#8b8f96" : tone(P.b, -0.35)}"/><path d="M80 68 V88" stroke="${P.d}" stroke-width="1.6" opacity=".6"/><path d="M52 78 Q60 70 70 70" stroke="${P.h}" stroke-width="3" fill="none" opacity=".4" stroke-linecap="round"/>` +
    (feather ? `<path d="M44 122 Q20 96 30 52 Q52 80 50 120Z" fill="${k.cn === "red" ? "#f0c648" : "#e0574c"}" stroke="${k.cn === "red" ? "#cc9f26" : "#ad332c"}" stroke-width="1.5" stroke-linejoin="round"/><path d="M46 120 Q34 92 33 60 M40 100 l-8 -4 M42 108 l8 -8 M37 86 l-7 -2 M38 90 l8 -8" stroke="${k.cn === "red" ? "#cc9f26" : "#ad332c"}" stroke-width="1.2" fill="none"/>` : "");
}
function phone(k){
  const u = k.u, has = k.has, P = k.tint(has("old") ? "red" : has("toy") ? "green" : "black"), defs = `<defs>${lgr(u + "p", P.a, P.b)}</defs>`, F = `fill="url(#${u}p)" stroke="${P.d}" stroke-width="1.8" stroke-linejoin="round"`;
  if (has("old")) return defs + shad(80, 164, 62) + `<path d="M118 150 q24 6 20 -14 q-4 -14 -16 -8" stroke="#3d424c" stroke-width="3" fill="none"/><path d="M28 160 Q30 104 50 96 H110 Q130 104 132 160 Q80 170 28 160Z" ${F}/><circle cx="80" cy="128" r="25" fill="#fbfaf5" stroke="${P.d}" stroke-width="1.8"/><circle cx="80" cy="128" r="9" fill="${P.a}" stroke="${P.d}" stroke-width="1.2"/>` +
      Array.from({ length: 9 }, (_, i) => { const a = (i * 34 - 40) * Math.PI / 180; return `<circle cx="${r2(80 + 17 * Math.cos(a))}" cy="${r2(128 + 17 * Math.sin(a))}" r="3.2" fill="#3d424c"/>`; }).join("") +
      `<path d="M54 96 v-10 M106 96 v-10" stroke="${P.d}" stroke-width="7" stroke-linecap="round"/><path d="M22 84 Q20 60 44 62 Q80 54 116 62 Q140 60 138 84 Q138 92 126 90 L112 86 Q112 76 80 76 Q48 76 48 86 L34 90 Q22 92 22 84Z" ${F}/>`;
  if (has("toy")) return defs + shad(80, 172, 56) + `<circle cx="46" cy="164" r="11" fill="#e0574c" stroke="#ad332c" stroke-width="1.6"/><circle cx="114" cy="164" r="11" fill="#e0574c" stroke="#ad332c" stroke-width="1.6"/><path d="M118 62 V30" stroke="#3d424c" stroke-width="3.4"/><circle cx="118" cy="26" r="6" fill="#f0c648" stroke="#cc9f26" stroke-width="1.3"/>
      <rect x="30" y="58" width="100" height="104" rx="22" ${F}/><rect x="42" y="68" width="76" height="24" rx="8" fill="#fbfaf5" stroke="${P.d}" stroke-width="1.4"/><circle cx="66" cy="80" r="5" fill="#2b2b30"/><circle cx="94" cy="80" r="5" fill="#2b2b30"/><path d="M72 86 q8 6 16 0" stroke="#2b2b30" stroke-width="2" fill="none" stroke-linecap="round"/>` +
      [0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => `<circle cx="${56 + (i % 3) * 24}" cy="${108 + Math.floor(i / 3) * 18}" r="7.4" fill="${["#e0574c", "#f0c648", "#58a6e0", "#e88fb0", "#fbfaf5", "#ee9a4a", "#9076c8", "#f0c648", "#e0574c"][i]}" stroke="#0003" stroke-width="1"/>`).join("");
  return defs + shad(82, 174, 40) + `<rect x="44" y="22" width="72" height="150" rx="13" ${F}/><rect x="50" y="38" width="60" height="112" rx="3" fill="#1f2a38" stroke="${P.d}" stroke-width="1.2"/><rect x="70" y="28" width="20" height="4" rx="2" fill="${P.d}"/><circle cx="80" cy="161" r="5.5" fill="none" stroke="${P.d}" stroke-width="1.8"/>` +
    Array.from({ length: 12 }, (_, i) => `<rect x="${56 + (i % 3) * 17.5}" y="${46 + Math.floor(i / 3) * 25}" width="13" height="13" rx="3.5" fill="${["#58a6e0", "#5aa86d", "#f0c648", "#e0574c", "#9076c8", "#ee9a4a", "#3fa9a3", "#e88fb0", "#fbfaf5", "#5aa86d", "#58a6e0", "#e0574c"][i]}"/>`).join("") + `<path d="M54 142 L74 42" stroke="#fff" stroke-width="5" opacity=".1"/>`;
}
/* bread (un pain): a crusty loaf, no icing and no plate (a cake), no holes (a cheese); never a long thin stick (that is une baguette) */
function bread(k){
  const u = k.u, has = k.has, brown = has("brown", "sliced"), P = k.cn && k.cn !== "brown" ? k.tint() : pal(brown ? ["#b9813a", "#8a5a22"] : ["#e9bb72", "#c48a3c"]), defs = `<defs>${lgr(u + "c", P.h, P.a)}${lgr(u + "d", P.a, P.b)}</defs>`, st = `stroke="${P.d}" stroke-width="1.8" stroke-linejoin="round"`, CR = "#fbeecb";
  const slice = (x, y, r) => `<path d="M-16 18 V-6 Q-22 -8 -20 -15 Q-16 -22 0 -22 Q16 -22 20 -15 Q22 -8 16 -6 V18Z" fill="${CR}" stroke="${P.b}" stroke-width="3.4" stroke-linejoin="round" transform="translate(${x} ${y}) rotate(${r})"/>`;
  const roll = (x, y, r) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r2(r * 0.72)}" fill="url(#${u}c)" ${st}/><path d="M${x - r * 0.4} ${r2(y - r * 0.3)} q${r2(r * 0.4)} ${r2(r * 0.3)} ${r2(r * 0.8)} 0" stroke="${P.h}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`;
  if (has("basket")) return defs + shad(80, 170, 60) + roll(52, 84, 26) + roll(108, 86, 26) + roll(80, 70, 28) + roll(40, 104, 20) + roll(120, 106, 20) + roll(80, 100, 24) +
      `<path d="M16 104 H144 L130 160 Q80 172 30 160Z" fill="#d9a85c" stroke="#8a5f24" stroke-width="1.8" stroke-linejoin="round"/><path d="M18 114 H142 M21 126 H139 M24 138 H136 M27 150 H133 M40 104 l8 62 M64 104 l4 66 M96 104 l-4 66 M120 104 l-8 62" stroke="#8a5f24" stroke-width="1.3" opacity=".8"/><rect x="12" y="98" width="136" height="10" rx="5" fill="#e3b86e" stroke="#8a5f24" stroke-width="1.6"/>`;
  if (has("seeds", "seeded", "seed")) return defs + shad(80, 144, 62) + `<path d="M16 112 Q14 82 50 78 H110 Q146 82 144 112 Q142 136 110 138 H50 Q18 136 16 112Z" fill="url(#${u}c)" ${st}/><path d="M36 100 Q80 86 124 100" stroke="${P.h}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M28 126 Q80 142 132 126" stroke="${P.b}" stroke-width="2" fill="none" opacity=".6"/>` +
      Array.from({ length: 34 }, (_, i) => { const q = Math.sqrt((i + 0.6) / 34), x = r2(80 + 52 * q * Math.cos(i * 2.4)), y = r2(107 + 23 * q * Math.sin(i * 2.4)); return `<ellipse cx="${x}" cy="${y}" rx="3.4" ry="1.9" fill="${i % 3 ? "#fff6d8" : "#3d2c1c"}" stroke="#8a5a22" stroke-width=".6" transform="rotate(${(i * 50) % 180} ${x} ${y})"/>`; }).join("");
  if (has("round")) return defs + shad(80, 148, 60) + `<path d="M22 126 Q18 66 80 62 Q142 66 138 126 Q80 150 22 126Z" fill="url(#${u}c)" ${st}/><path d="M52 84 L108 118 M108 84 L52 118" stroke="${P.h}" stroke-width="5" stroke-linecap="round"/><path d="M40 120 Q80 138 120 120" stroke="${P.b}" stroke-width="2" fill="none" opacity=".6"/>`;
  if (brown) return defs + shad(84, 158, 62) + `<path d="M40 150 V96 Q30 92 34 80 Q42 66 70 66 H118 Q146 66 150 84 Q152 92 144 96 V136 L112 152Z" fill="url(#${u}d)" ${st}/><path d="M22 152 V100 Q12 96 16 84 Q24 70 54 70 Q84 70 92 84 Q96 96 86 100 V152Z" fill="${has("sliced") ? CR : `url(#${u}c)`}" stroke="${P.d}" stroke-width="${has("sliced") ? 3.4 : 1.8}" stroke-linejoin="round"/>` +
      (has("sliced") ? `<path d="M100 70 V140 M112 68 V146 M126 68 V140" stroke="${P.d}" stroke-width="1.4" opacity=".6"/>` + slice(50, 160, -76) + slice(28, 166, -84) : `<path d="M34 86 Q54 78 76 86" stroke="${P.h}" stroke-width="3" fill="none" stroke-linecap="round"/>`);
  return defs + shad(80, 144, 62) + `<path d="M16 112 Q14 82 50 78 H110 Q146 82 144 112 Q142 136 110 138 H50 Q18 136 16 112Z" fill="url(#${u}c)" ${st}/><path d="M46 92 l12 26 M72 90 l12 30 M98 92 l12 26" stroke="${P.h}" stroke-width="6" stroke-linecap="round"/><path d="M28 126 Q80 142 132 126" stroke="${P.b}" stroke-width="2" fill="none" opacity=".6"/>`;
}
function flower(k){
  const u = k.u, has = k.has, pot = has("pot"), P = k.tint("red"), C = k.cn === "yellow" || k.cn === "orange" ? pal(["#8a5a36", "#5c3a22"]) : pal(COL.yellow), G = pal(COL.green);
  const bloom = (cx, cy, s) => `<g transform="translate(${cx} ${cy}) scale(${s})">` + Array.from({ length: 8 }, (_, i) => `<ellipse cx="0" cy="-22" rx="10.5" ry="16" fill="${i % 2 ? P.a : P.h}" stroke="${P.d}" stroke-width="1.5" transform="rotate(${i * 45})"/>`).join("") + `<circle r="11.5" fill="${C.a}" stroke="${C.d}" stroke-width="1.6"/><g fill="${C.d}" opacity=".7"><circle cx="-3" cy="-2" r="1.4"/><circle cx="3" cy="-3" r="1.4"/><circle cx="0" cy="4" r="1.4"/></g></g>`;
  const stem = (x, y0, y1) => `<path d="M${x} ${y0} Q${x - 6} ${(y0 + y1) / 2} ${x} ${y1}" stroke="${G.d}" stroke-width="6.4" fill="none" stroke-linecap="round"/><path d="M${x} ${y0} Q${x - 6} ${(y0 + y1) / 2} ${x} ${y1}" stroke="${G.a}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`;
  const leaf = (x, y, f) => `<path d="M${x} ${y} Q${x + 12 * f} ${y - 26} ${x + 36 * f} ${y - 24} Q${x + 30 * f} ${y + 2} ${x} ${y}Z" fill="${G.a}" stroke="${G.d}" stroke-width="1.5" stroke-linejoin="round"/><path d="M${x + 2 * f} ${y - 1} Q${x + 16 * f} ${y - 14} ${x + 32 * f} ${y - 22}" stroke="${G.d}" stroke-width="1" fill="none" opacity=".7"/>`;
  if (pot) return shad(80, 178, 40) + stem(80, 132, 70) + leaf(79, 118, 1) + leaf(79, 126, -1) + bloom(80, 56, 0.92) + `<path d="M52 136 H108 L100 176 H60Z" fill="${TINT.brick[0]}" stroke="${TINT.brick[1]}" stroke-width="1.8" stroke-linejoin="round"/><rect x="46" y="126" width="68" height="13" rx="3" fill="${tone(TINT.brick[0], 0.12)}" stroke="${TINT.brick[1]}" stroke-width="1.8"/><ellipse cx="80" cy="127" rx="30" ry="3" fill="#5c4027"/>`;
  return shad(80, 180, 26) + stem(80, 178, 84) + leaf(79, 150, 1) + leaf(79, 162, -1) + bloom(80, 62, 1.12);
}
function lamp(k){
  const u = k.u, has = k.has, desk = has("desk"), floor = has("floor", "tall"), globe = has("round"), old = has("old"), P = k.tint(old ? "green" : globe ? "white" : "yellow"), B = pal(["#c9a25e", "#96712c"]), st = `stroke="${P.d}" stroke-width="1.8" stroke-linejoin="round"`, bs = `stroke="${B.d}" stroke-width="1.6" stroke-linejoin="round"`;
  const defs = `<defs>${lgr(u + "s", P.h, P.a)}</defs>`, glow = (x, y, w, h) => `<path d="M${x - w * 0.42} ${y} L${x - w} ${y + h} H${x + w} L${x + w * 0.42} ${y}Z" fill="#ffe98a" opacity=".45"/>`, shade = (x, y, w, h) => `<path d="M${x - w * 0.56} ${y} H${x + w * 0.56} L${x + w} ${y + h} H${x - w}Z" fill="url(#${u}s)" ${st}/><path d="M${x - w * 0.36} ${y + 5} L${x - w * 0.66} ${y + h - 5}" stroke="#fff" stroke-width="3" opacity=".4" stroke-linecap="round"/>`;
  if (desk) return defs + shad(74, 174, 46) + glow(46, 92, 34, 60) + `<ellipse cx="96" cy="168" rx="34" ry="8" fill="${P.b}" ${st}/>` + stick(96, 164, 118, 104, 5, P) + stick(118, 104, 66, 56, 5, P) + `<circle cx="118" cy="104" r="6" fill="#d5d8dc" stroke="#6d737c" stroke-width="1.5"/><path d="M70 42 L88 64 L60 96 Q36 92 26 72Z" fill="url(#${u}s)" ${st}/><ellipse cx="43" cy="84" rx="19" ry="8" fill="#fff6c4" stroke="${P.d}" stroke-width="1.4" transform="rotate(34 43 84)"/>`;
  if (old) return defs + shad(80, 174, 50) + glow(80, 74, 50, 70) + `<ellipse cx="80" cy="166" rx="40" ry="9" fill="${B.a}" ${bs}/><path d="M74 164 Q72 110 78 96 h4 Q88 110 86 164Z" fill="${B.a}" ${bs}/><path d="M22 76 Q22 52 46 50 H114 Q138 52 138 76 Q80 86 22 76Z" fill="url(#${u}s)" ${st}/><path d="M34 62 Q80 54 126 62" stroke="#fff" stroke-width="3.4" fill="none" opacity=".4" stroke-linecap="round"/><path d="M106 80 v22" stroke="${B.d}" stroke-width="1.6"/><circle cx="106" cy="105" r="3.2" fill="${B.a}" ${bs}/><path d="M70 96 h20" stroke="${B.d}" stroke-width="5" stroke-linecap="round"/>`;
  if (globe) return defs + shad(80, 176, 40) + `<circle cx="80" cy="84" r="60" fill="#ffe98a" opacity=".3"/><path d="M60 170 h40 l-6 -34 h-28z" fill="${B.a}" ${bs}/><circle cx="80" cy="88" r="48" fill="${k.cn && k.cn !== "white" ? P.h : "#fffbe6"}" stroke="${P.d}" stroke-width="2"/><ellipse cx="64" cy="68" rx="13" ry="9" fill="#fff" opacity=".8" transform="rotate(-30 64 68)"/><rect x="62" y="128" width="36" height="9" rx="3" fill="${B.b}" ${bs}/>`;
  if (floor) return defs + shad(80, 180, 36) + glow(80, 58, 44, 46) + `<ellipse cx="80" cy="176" rx="30" ry="6.5" fill="${B.a}" ${bs}/><path d="M80 174 V56" stroke="${B.d}" stroke-width="6.4"/><path d="M80 174 V56" stroke="${B.a}" stroke-width="3.4"/>` + shade(80, 14, 40, 46);
  return defs + shad(80, 176, 44) + glow(80, 86, 52, 50) + `<path d="M58 172 Q52 150 66 132 Q72 124 72 108 h16 Q88 124 94 132 Q108 150 102 172Z" fill="${B.a}" ${bs}/><path d="M68 150 Q72 138 76 132" stroke="#fff" stroke-width="3" fill="none" opacity=".4" stroke-linecap="round"/><rect x="74" y="92" width="12" height="18" fill="${B.b}" ${bs}/>` + shade(80, 36, 52, 58);
}
/* clothes, laid flat: a shirt has a collar, buttons and sleeves; a dress has a waist and a skirt; trousers have two legs */
function shirt(k){
  const u = k.u, has = k.has, shortS = has("short-sleeved", "short"), P = k.tint("white"), st = `stroke="${P.d}" stroke-width="1.8" stroke-linejoin="round"`;
  const body = "M52 44 L108 44 L116 60 L112 170 Q80 176 48 170 L44 60Z", sl = shortS ? "M48 46 L18 84 L38 98 L56 78Z" : "M48 46 L10 132 L30 142 L58 84Z", sr = shortS ? "M112 46 L142 84 L122 98 L104 78Z" : "M112 46 L150 132 L130 142 L102 84Z";
  return `<defs>${lgr(u + "s", P.h, P.a)}<clipPath id="${u}c"><path d="${body} ${sl} ${sr}"/></clipPath></defs>` + shad(80, 178, 44) + `<path d="${sl}" fill="${P.a}" ${st}/><path d="${sr}" fill="${P.a}" ${st}/><path d="${body}" fill="url(#${u}s)" ${st}/>` +
    (has("checked") ? `<g clip-path="url(#${u}c)" opacity=".85"><path d="${Array.from({ length: 9 }, (_, i) => `M${8 + i * 18} 30 V180`).join(" ")}" stroke="${P.d}" stroke-width="5" opacity=".55"/><path d="${Array.from({ length: 9 }, (_, i) => `M0 ${48 + i * 16} H160`).join(" ")}" stroke="${P.d}" stroke-width="5" opacity=".55"/><path d="${Array.from({ length: 9 }, (_, i) => `M${17 + i * 18} 30 V180 M0 ${56 + i * 16} H160`).join(" ")}" stroke="#fff" stroke-width="1.4" opacity=".8"/></g><path d="${body}" fill="none" ${st}/>` : "") +
    (shortS ? "" : `<path d="M10 132 L30 142 L27 149 L7 139Z M150 132 L130 142 L133 149 L153 139Z" fill="${P.h}" ${st}/>`) +
    `<path d="M80 60 V172" stroke="${P.d}" stroke-width="1.4" opacity=".7"/><g fill="${k.cn === "white" || !k.cn ? "#8f98a3" : "#fbfaf5"}" stroke="${P.d}" stroke-width=".8">` + [74, 96, 118, 140, 160].map(y => `<circle cx="80" cy="${y}" r="2.6"/>`).join("") + `</g>
     <path d="M60 44 L80 62 L68 74 L52 50Z M100 44 L80 62 L92 74 L108 50Z" fill="${P.h}" ${st}/><path d="M60 44 Q80 54 100 44" fill="none" ${st}/><rect x="92" y="88" width="16" height="17" rx="2" fill="none" stroke="${P.d}" stroke-width="1.3" opacity=".8"/>`;
}
function trousers(k){
  const u = k.u, striped = k.has("striped", "stripes"), P = k.tint("blue"), st = `stroke="${P.d}" stroke-width="1.8" stroke-linejoin="round"`, yb = 172, legs = "M44 38 H116 L122 170 L88 172 L80 76 L72 172 L38 170Z";
  return `<defs>${lgr(u + "t", P.h, P.a)}${striped ? `<clipPath id="${u}c"><path d="${legs}"/></clipPath>` : ""}</defs>` + shad(80, yb + 6, 46) + `<path d="${legs}" fill="url(#${u}t)" ${st}/>` +
    (striped ? `<g clip-path="url(#${u}c)"><path d="${[0, 1, 2, 3, 4].map(i => `M${50 + i * 7} 40 L${43 + i * 7} 174 M${82 + i * 7} 40 L${89 + i * 7} 174`).join(" ")}" stroke="${k.cn === "white" ? "#8f98a3" : "#fbfaf5"}" stroke-width="2.4" opacity=".9"/></g><path d="${legs}" fill="none" ${st}/>` : "") + `
    <rect x="42" y="28" width="76" height="13" rx="2" fill="${P.a}" ${st}/><path d="M56 28 v13 M80 28 v13 M104 28 v13" stroke="${P.d}" stroke-width="2.6"/><circle cx="85" cy="34.5" r="2.6" fill="#f2d268" stroke="#a07c1c" stroke-width=".8"/>
    <path d="M80 42 V70 M80 46 q-8 14 -2 24 M46 44 q8 12 20 12 M114 44 q-8 12 -20 12" stroke="${P.d}" stroke-width="1.4" fill="none" opacity=".75"/>` + `<path d="M58 74 L54 168 M102 74 L106 168" stroke="${P.d}" stroke-width="1.3" opacity=".45"/>`;
}
function dress(k){
  const u = k.u, has = k.has, long = has("long"), short = has("short"), P = k.tint("red"), st = `stroke="${P.d}" stroke-width="1.8" stroke-linejoin="round"`, y0 = long ? 12 : short ? 40 : 28, yw = y0 + (long ? 46 : 50), yh = long ? 180 : short ? 136 : 162, w = long ? 46 : short ? 50 : 58;
  const body = `M62 ${y0} Q80 ${y0 + 16} 98 ${y0} L112 ${y0 + 8} L126 ${y0 + 26} L110 ${y0 + 34} L104 ${y0 + 26} Q102 ${yw - 8} 98 ${yw} L${80 + w} ${yh - 6} Q${80 + w * 0.5} ${yh + 6} 80 ${yh - 2} Q${80 - w * 0.5} ${yh + 6} ${80 - w} ${yh - 6} L62 ${yw} Q58 ${yw - 8} 56 ${y0 + 26} L50 ${y0 + 34} L34 ${y0 + 26} L48 ${y0 + 8}Z`;
  return `<defs>${lgr(u + "d", P.h, P.a)}<clipPath id="${u}c"><path d="${body}"/></clipPath></defs>` + shad(80, yh + 6, w * 0.8) + `<path d="${body}" fill="url(#${u}d)" ${st}/>` +
    (has("dots", "dot") ? `<g clip-path="url(#${u}c)" fill="${k.cn === "white" ? "#d8483f" : "#fbfaf5"}">` + Array.from({ length: 60 }, (_, i) => `<circle cx="${22 + (i % 6) * 22 + (Math.floor(i / 6) % 2) * 11}" cy="${y0 + 8 + Math.floor(i / 6) * 16}" r="4"/>`).join("") + `</g><path d="${body}" fill="none" ${st}/>` : "") +
    `<path d="M62 ${yw} Q80 ${yw + 6} 98 ${yw}" stroke="${P.d}" stroke-width="4.4" fill="none" stroke-linecap="round"/><path d="M70 ${yw + 8} L${80 - w * 0.55} ${yh - 12} M90 ${yw + 8} L${80 + w * 0.55} ${yh - 12} M80 ${yw + 8} V${yh - 10}" stroke="${P.d}" stroke-width="1.3" opacity=".5"/>`;
}
/* a fish: alive, seen from the side, an eye, fins, a forked tail, bubbles */
function fish(k){
  const u = k.u, has = k.has, long = has("long"), P = k.tint("orange"), st = `stroke="${P.d}" stroke-width="1.8" stroke-linejoin="round"`, h = long ? 19 : 38;
  const body = `M26 100 Q${long ? 70 : 60} ${100 - h * 1.25} ${long ? 120 : 112} ${100 - h * 0.62} Q${long ? 142 : 136} ${100 - h * 0.3} ${long ? 150 : 142} 100 Q${long ? 142 : 136} ${100 + h * 0.3} ${long ? 120 : 112} ${100 + h * 0.62} Q${long ? 70 : 60} ${100 + h * 1.25} 26 100Z`;
  return `<defs>${lgr(u + "f", P.h, P.b)}<clipPath id="${u}c"><path d="${body}"/></clipPath></defs>` + shad(80, 100 + h + 26, 50) + `<path d="M30 100 L4 ${100 - h * 0.8} Q14 100 4 ${100 + h * 0.8}Z" fill="${P.a}" ${st}/><path d="M${long ? 50 : 56} ${100 - h * 0.7} Q${long ? 76 : 80} ${100 - h * 1.6} ${long ? 112 : 104} ${100 - h * 0.6}Z" fill="${P.a}" ${st}/><path d="M72 ${100 + h * 0.7} q4 ${h * 0.5} 18 ${h * 0.4} l-4 -${h * 0.5}z" fill="${P.a}" ${st}/>
    <path d="${body}" fill="url(#${u}f)" ${st}/>` + (has("striped") ? `<g clip-path="url(#${u}c)"><path d="M50 50 q-8 50 0 100 M70 50 q-8 50 0 100 M90 50 q-8 50 0 100" stroke="#fbfaf5" stroke-width="8" fill="none"/><path d="M50 50 q-8 50 0 100 M70 50 q-8 50 0 100 M90 50 q-8 50 0 100" stroke="#2b2b30" stroke-width="2" fill="none" transform="translate(6 0)"/></g>`
      : `<path d="M46 ${100 - h * 0.3} q6 ${h * 0.3} 0 ${h * 0.6} M60 ${100 - h * 0.5} q8 ${h * 0.5} 0 ${h} M76 ${100 - h * 0.5} q8 ${h * 0.5} 0 ${h}" stroke="${P.d}" stroke-width="1.4" fill="none" opacity=".5"/>`) +
    `<path d="M${long ? 126 : 114} ${100 - h * 0.5} q-9 ${h * 0.5} 0 ${h}" stroke="${P.d}" stroke-width="1.8" fill="none"/><path d="M${long ? 104 : 96} ${100 + h * 0.05} q-12 ${h * 0.34} -2 ${h * 0.5} q8 -2 10 -${h * 0.3}z" fill="${P.a}" ${st}/><circle cx="${long ? 136 : 126}" cy="${100 - h * 0.22}" r="${long ? 4.6 : 6}" fill="#fff" stroke="#2b2b30" stroke-width="1.4"/><circle cx="${long ? 137 : 127}" cy="${100 - h * 0.22}" r="${long ? 2 : 2.8}" fill="#17171a"/>
     <path d="M${long ? 150 : 142} 100 q-6 2 -8 6" stroke="${P.d}" stroke-width="1.8" fill="none" stroke-linecap="round"/><g fill="none" stroke="#7cb8e6" stroke-width="1.8"><circle cx="150" cy="${82 - h * 0.5}" r="4"/><circle cx="144" cy="${68 - h * 0.5}" r="3"/><circle cx="152" cy="${56 - h * 0.5}" r="5"/></g>`;
}
/* cheese: a wedge with holes and a rind, no crust slashes (bread), no icing or plate (cake) */
function cheese(k){
  const u = k.u, has = k.has, veined = has("blue-veined", "veined"), P = veined && !k.cn ? pal(["#f6efd2", "#e3d6a4"]) : k.tint(has("slice") ? "orange" : "yellow"), st = `stroke="${P.d}" stroke-width="1.8" stroke-linejoin="round"`, defs = `<defs>${lgr(u + "c", P.h, P.a)}</defs>`;
  const hole = (x, y, r) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r2(r * 0.8)}" fill="${P.b}" stroke="${P.d}" stroke-width="1.2"/>`;
  if (has("box")) return defs + shad(80, 164, 66) + `<ellipse cx="112" cy="70" rx="40" ry="14" fill="${WOOD.a}" stroke="${WOOD.d}" stroke-width="1.8" transform="rotate(-24 112 70)"/><ellipse cx="110" cy="66" rx="34" ry="10.5" fill="${WOOD.h}" stroke="${WOOD.d}" stroke-width="1.2" transform="rotate(-24 110 66)"/>
      <path d="M14 122 v26 A58 20 0 0 0 130 148 v-26Z" fill="${WOOD.a}" stroke="${WOOD.d}" stroke-width="1.8"/><ellipse cx="72" cy="122" rx="58" ry="20" fill="${WOOD.b}" stroke="${WOOD.d}" stroke-width="1.8"/><ellipse cx="72" cy="121" rx="50" ry="16" fill="#fffdf4" stroke="#b9ad94" stroke-width="1.6"/><path d="M72 121 L114 112 M72 121 L104 133 M72 121 V137" stroke="#d6cbb2" stroke-width="1.6"/><path d="M20 138 A58 20 0 0 0 124 138" stroke="${WOOD.d}" stroke-width="1.2" fill="none" opacity=".6"/>`;
  if (has("round")) return defs + shad(80, 150, 66) + `<path d="M14 100 v26 A66 24 0 0 0 146 126 v-26Z" fill="${P.a}" ${st}/><ellipse cx="80" cy="100" rx="66" ry="24" fill="url(#${u}c)" ${st}/><path d="M80 100 L140 88 L146 100 V126 L80 124Z" fill="#fff3c4" stroke="${P.d}" stroke-width="1.6" stroke-linejoin="round"/><path d="M80 100 L146 100 M80 100 V124" stroke="${P.d}" stroke-width="1.6"/>`;
  if (has("slice")) return defs + shad(84, 156, 58) + [[0, 14], [10, 0], [22, -14]].map((d, i) => `<path d="M${22 + d[0]} ${110 + d[1]} L${86 + d[0]} ${84 + d[1]} L${132 + d[0]} ${116 + d[1]} L${68 + d[0]} ${144 + d[1]}Z" fill="${i === 2 ? `url(#${u}c)` : P.a}" ${st}/>`).join("") + hole(100, 100, 7) + hole(74, 110, 5) + hole(118, 108, 4.4) + `<path d="M22 124 l46 34" stroke="${P.d}" stroke-width="1" opacity=".5"/>`;
  if (has("holes")) return defs + shad(84, 160, 62) + `<path d="M24 74 L62 54 H138 L100 74Z" fill="${P.h}" ${st}/><path d="M100 74 L138 54 V132 L100 152Z" fill="${P.b}" ${st}/><path d="M24 74 H100 V152 H24Z" fill="url(#${u}c)" ${st}/>` + hole(44, 96, 10) + hole(76, 88, 6) + hole(80, 124, 11) + hole(46, 134, 7) + hole(62, 112, 4.4) + hole(88, 104, 4) + hole(34, 116, 4) + hole(70, 64, 6) + hole(106, 62, 5) + `<ellipse cx="120" cy="96" rx="5" ry="8" fill="${P.d}" opacity=".5"/><ellipse cx="114" cy="126" rx="4" ry="7" fill="${P.d}" opacity=".5"/>`;
  return defs + shad(84, 152, 64) + `<path d="M18 80 L66 56 L146 104Z" fill="${P.h}" ${st}/><path d="M18 80 L146 104 V134 L18 138Z" fill="url(#${u}c)" ${st}/>` +
    (veined ? `<path d="M30 96 q10 8 6 20 q10 -4 14 8 M60 98 q-4 12 8 16 q-2 10 8 14 M92 104 q8 6 2 14 q10 2 10 10 M120 108 q-6 8 4 14 M44 78 q10 2 12 -8 M80 74 q6 8 18 4" stroke="#4f7fa8" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".85"/><path d="M18 80 L146 104" stroke="#cfc8a4" stroke-width="3"/>`
      : hole(48, 108, 9) + hole(84, 118, 6) + hole(112, 114, 4.4) + hole(66, 126, 4) + hole(70, 76, 6) + hole(100, 88, 4));
}
/* a tomato: squat and round, a green star of leaves on top (an apple has a brown stalk and one leaf; a ball has a seam and neither) */
function tomato(k){
  const u = k.u, has = k.has, P = k.cn === "green" ? pal(["#a9cf5c", "#7fa838"]) : k.tint("red"), G = pal(k.cn === "green" ? ["#4f8a3a", "#356226"] : COL.green), st = `stroke="${P.d}" stroke-width="1.8"`;
  const one = (cx, cy, s) => `<g transform="translate(${cx} ${cy}) scale(${s})"><path d="M0 -40 C30 -46 58 -28 58 4 C58 36 30 50 0 50 C-30 50 -58 36 -58 4 C-58 -28 -30 -46 0 -40Z" fill="url(#${u}t)" ${st}/><path d="M0 -40 Q-4 -20 0 -6 M0 -40 Q-24 -30 -30 -14 M0 -40 Q24 -30 30 -14" stroke="${P.d}" stroke-width="1.2" fill="none" opacity=".35"/>
    <path d="M0 -38 L-10 -30 L-30 -34 L-18 -44 L-26 -58 L-8 -50 L0 -64 L8 -50 L26 -58 L18 -44 L30 -34 L10 -30Z" fill="${G.a}" stroke="${G.d}" stroke-width="1.6" stroke-linejoin="round"/><path d="M0 -44 v-16" stroke="${G.d}" stroke-width="4.4" stroke-linecap="round"/><ellipse cx="-26" cy="-8" rx="10" ry="15" fill="#fff" opacity=".3" transform="rotate(-24 -26 -8)"/></g>`;
  const cut = (cx, cy, s) => `<g transform="translate(${cx} ${cy}) scale(${s})"><ellipse rx="44" ry="34" fill="${P.a}" ${st}/><ellipse rx="37" ry="27.5" fill="${P.h}"/><path d="M0 -27 V27 M-37 0 H37" stroke="${P.a}" stroke-width="5"/>` + [[-18, -13], [18, -13], [-18, 13], [18, 13]].map(p => `<ellipse cx="${p[0]}" cy="${p[1]}" rx="11" ry="8" fill="${tone(P.a, -0.12)}"/><g fill="#f9e2a8"><ellipse cx="${p[0] - 5}" cy="${p[1]}" rx="2.4" ry="1.6"/><ellipse cx="${p[0] + 4}" cy="${p[1] - 2}" rx="2.4" ry="1.6"/><ellipse cx="${p[0] + 2}" cy="${p[1] + 3}" rx="2.4" ry="1.6"/></g>`).join("") + `</g>`;
  const defs = `<defs>${rgr(u + "t", P)}</defs>`;
  if (has("sliced")) return defs + shad(80, 156, 62) + one(104, 86, 0.78) + cut(52, 124, 0.9) + cut(100, 136, 0.7);
  if (has("vine")) return defs + shad(80, 164, 60) + `<path d="M24 30 Q60 22 82 44 Q100 60 132 52" stroke="${G.d}" stroke-width="7.4" fill="none" stroke-linecap="round"/><path d="M24 30 Q60 22 82 44 Q100 60 132 52" stroke="${G.a}" stroke-width="4.4" fill="none" stroke-linecap="round"/><path d="M48 28 V58 M84 46 V96 M118 54 V80" stroke="${G.d}" stroke-width="4.4" stroke-linecap="round"/>` + one(46, 92, 0.56) + one(118, 112, 0.56) + one(80, 130, 0.62);
  return defs + shad(80, 158, 50) + one(80, 104, 1);
}
/* a plane: seen from the side, climbing: a long body, swept wings, a tail fin, a row of windows; old = a biplane with a propeller */
function plane(k){
  const u = k.u, has = k.has, old = has("old"), toy = has("toy"), P = k.tint(old ? "yellow" : toy ? "green" : "white"), st = `stroke="${P.d}" stroke-width="1.8" stroke-linejoin="round"`, defs = `<defs>${lgr(u + "p", P.h, P.a)}</defs>`, A = k.cn === "blue" ? pal(COL.red) : pal(COL.blue);
  const prop = (x, y, r) => `<ellipse cx="${x}" cy="${y}" rx="4" ry="${r}" fill="#d5d8dc" stroke="#6d737c" stroke-width="1.4" opacity=".9"/><circle cx="${x - 3}" cy="${y}" r="5" fill="#3d424c"/>`;
  if (old) return defs + shad(80, 168, 58) + `<path d="M52 152 l-8 -22 M84 152 l8 -22" stroke="#6d737c" stroke-width="3"/><circle cx="50" cy="154" r="10" fill="#26272c"/><circle cx="50" cy="154" r="4" fill="#d5d8dc"/><circle cx="86" cy="154" r="10" fill="#26272c"/><circle cx="86" cy="154" r="4" fill="#d5d8dc"/>
      <path d="M14 96 L6 66 Q18 62 28 84 L40 100Z" fill="${P.a}" ${st}/><path d="M16 104 Q60 92 122 96 Q140 100 140 112 Q138 126 118 130 Q60 134 20 116Z" fill="url(#${u}p)" ${st}/><path d="M48 60 v52 M96 60 v52 M48 62 L96 110 M96 62 L48 110" stroke="#8a6a4a" stroke-width="2.6"/>
      <rect x="26" y="52" width="104" height="13" rx="6" fill="${P.a}" ${st}/><rect x="30" y="108" width="96" height="12" rx="6" fill="${P.b}" ${st}/><path d="M74 96 q10 -12 20 0" fill="#cfe6f5" stroke="${P.d}" stroke-width="1.5"/><circle cx="84" cy="90" r="6" fill="${SKIN.light[1]}" stroke="${SKIN.light[2]}" stroke-width="1"/><path d="M78 88 q6 -8 12 0" stroke="#74492b" stroke-width="4" fill="none" stroke-linecap="round"/>` + prop(146, 112, 26);
  if (toy) return defs + shad(80, 166, 54) + `<circle cx="62" cy="152" r="10" fill="#e0574c" stroke="#ad332c" stroke-width="1.6"/><circle cx="104" cy="152" r="10" fill="#e0574c" stroke="#ad332c" stroke-width="1.6"/><path d="M22 96 L12 60 Q30 58 40 86Z" fill="#e0574c" stroke="#ad332c" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M18 106 Q20 78 70 76 H104 Q140 78 142 108 Q140 140 104 142 H60 Q20 140 18 106Z" fill="url(#${u}p)" ${st}/><ellipse cx="74" cy="118" rx="44" ry="11" fill="#e0574c" stroke="#ad332c" stroke-width="1.8"/><circle cx="62" cy="96" r="7.5" fill="#cfe6f5" stroke="${P.d}" stroke-width="1.5"/><circle cx="84" cy="96" r="7.5" fill="#cfe6f5" stroke="${P.d}" stroke-width="1.5"/><circle cx="106" cy="96" r="7.5" fill="#cfe6f5" stroke="${P.d}" stroke-width="1.5"/>
      <path d="M118 118 q8 6 16 0" stroke="${P.d}" stroke-width="2.4" fill="none" stroke-linecap="round"/>` + prop(150, 108, 22).replace("#d5d8dc", "#f0c648");
  return defs + shad(80, 164, 60) + `<g transform="rotate(-9 80 100)"><path d="M70 96 L40 54 H56 L96 94Z" fill="${P.b}" ${st}/><path d="M22 96 L8 58 H24 L46 92Z" fill="${A.a}" stroke="${A.d}" stroke-width="1.8" stroke-linejoin="round"/><path d="M10 104 L4 92 H30 L34 102Z" fill="${P.b}" ${st}/>
    <path d="M12 104 Q10 92 30 90 H118 Q144 90 154 104 Q146 116 118 116 H34 Q14 116 12 104Z" fill="url(#${u}p)" ${st}/><path d="M16 106 H150" stroke="${A.a}" stroke-width="4"/><path d="M130 94 Q142 94 148 101 H132Z" fill="#2f3b52"/>` +
    [40, 52, 64, 76, 88, 100, 112].map(x => `<rect x="${x}" y="95" width="6.4" height="6.4" rx="2" fill="#2f3b52"/>`).join("") + `<path d="M62 108 L30 152 H50 L98 110Z" fill="${P.a}" ${st}/><rect x="56" y="122" width="24" height="12" rx="6" fill="#d5d8dc" stroke="#6d737c" stroke-width="1.5"/><ellipse cx="80" cy="128" rx="3" ry="6" fill="#3d424c"/></g>`;
}
/* a motorbike: two fat tyres, an engine, a fuel tank, a seat and an exhaust pipe; no pedals and no thin frame (a bicycle) */
function motorbike(k){
  const u = k.u, has = k.has, old = has("old"), police = has("police"), P = k.tint(old ? "green" : police ? "white" : "red"), st = `stroke="${P.d}" stroke-width="1.8" stroke-linejoin="round"`, defs = `<defs>${lgr(u + "m", P.h, P.a)}</defs>`;
  const wheel = (x, y, r, spokes) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#26272c"/><circle cx="${x}" cy="${y}" r="${r - 8}" fill="#e6e9ed" stroke="#8b8f96" stroke-width="1.6"/>` + (spokes ? [0, 45, 90, 135].map(a => `<path d="M${x - r + 8} ${y} h${2 * r - 16}" stroke="#8b8f96" stroke-width="1.3" transform="rotate(${a} ${x} ${y})"/>`).join("") : "") + `<circle cx="${x}" cy="${y}" r="4" fill="#6d737c"/>`;
  const M = (x0, y0, x1, y1, w) => stick(x0, y0, x1, y1, w || 4, STEEL);
  let s = defs + shad(80, 164, 64) + wheel(36, 136, 25, old) + wheel(124, 136, 25, old) + M(124, 136, 104, 78, 5) + `<path d="M14 132 h40 v-7 h-34 q-6 0 -6 7z" fill="#d5d8dc" stroke="#6d737c" stroke-width="1.5"/>` + M(36, 136, 62, 104, 4) + M(36, 136, 70, 126, 4) +
    `<path d="M58 104 h34 l6 26 h-36z" fill="#b9bec6" stroke="#6d737c" stroke-width="1.6" stroke-linejoin="round"/><path d="M62 110 h28 M63 116 h29 M64 122 h30" stroke="#6d737c" stroke-width="1.4"/><circle cx="80" cy="130" r="9" fill="#8b8f96" stroke="#55585f" stroke-width="1.6"/>
     <path d="M62 86 Q66 76 84 76 Q102 76 106 92 Q104 102 92 102 H64 Q58 96 62 86Z" fill="url(#${u}m)" ${st}/><path d="M68 84 Q76 79 88 80" stroke="#fff" stroke-width="3" fill="none" opacity=".45" stroke-linecap="round"/>` +
    (old ? `<path d="M30 92 q4 -12 20 -10 q10 2 14 8 q-10 8 -34 2z" fill="#8a5a36" stroke="#5c3a22" stroke-width="1.6"/><path d="M36 96 v8 M50 98 v6" stroke="#6d737c" stroke-width="2.4"/><path d="M8 126 A30 30 0 0 1 62 118 M98 122 A30 30 0 0 1 152 132" fill="none" stroke="${P.d}" stroke-width="6.4"/><path d="M8 126 A30 30 0 0 1 62 118 M98 122 A30 30 0 0 1 152 132" fill="none" stroke="${P.a}" stroke-width="3.6"/>`
      : `<path d="M22 92 Q26 84 44 86 H64 Q70 90 66 98 H30 Q22 98 22 92Z" fill="#33353b" stroke="#17181c" stroke-width="1.5"/><path d="M14 104 Q24 94 44 100 L36 110Z" fill="url(#${u}m)" ${st}/>`) +
    (old ? "" : `<path d="M98 120 A27 27 0 0 1 146 118" fill="none" stroke="${P.d}" stroke-width="7"/><path d="M98 120 A27 27 0 0 1 146 118" fill="none" stroke="${P.a}" stroke-width="4"/><path d="M92 104 l14 -6 l6 22 h-14z" fill="url(#${u}m)" ${st}/>`) +
    `<path d="M88 66 h22" stroke="#2b2b30" stroke-width="6" stroke-linecap="round"/>` + M(104, 78, 100, 66, 4) + `<circle cx="114" cy="${old ? 84 : 86}" r="${old ? 9 : 7.5}" fill="#fbf3c4" stroke="#6d737c" stroke-width="1.8"/>`;
  if (police) s += `<path d="M106 78 L112 42 L122 44 L120 80Z" fill="#cfe6f5" fill-opacity=".7" stroke="#557fa8" stroke-width="1.6" stroke-linejoin="round"/><rect x="12" y="98" width="34" height="24" rx="5" fill="url(#${u}m)" ${st}/><path d="M12 110 h34 M62 92 h40" stroke="#2f55a8" stroke-width="5"/><path d="M24 98 V70" stroke="#6d737c" stroke-width="2.6"/><rect x="18" y="58" width="12" height="13" rx="5" fill="#3f8fd0" stroke="#2f55a8" stroke-width="1.4"/>`;
  return s;
}
/* --- a boy, a girl (whole figures: a big head on a short body, shorts or a skirt: plainly children) and a baby --- */
function kid(k, spec){
  const is = String(spec.is).toLowerCase() === "girl" ? "girl" : "boy", looks = (spec.looks || []).filter(x => !/^(big|small)$/i.test(String(x).trim()) && !(TINT[String(x).toLowerCase().trim()] && (spec.looks || []).length < 3)), ps = { is, looks };
  if (k.cn && !k.has("jumper")) ps._top = k.cn;
  const c = traits(ps), L = c.L, sk = c.skin, girl = is === "girl", q = 0.6, col = L.coat ? COL[c.coat] : L.suit ? COL[c.suit] : c.top, xl = 32 + q * 36, xr = 160 - xl, h = hashStr(c.topName + c.style);
  const low = girl ? COL[["navy", "plum", "teal", "charcoal"][h % 4]] : COL[["navy", "charcoal", "brown"][h % 3]], limb = (d, w, p) => `<path d="${d}" stroke="${p[1]}" stroke-width="${w + 2}" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${p[0]}" stroke-width="${w - 1.5}" fill="none" stroke-linecap="round" opacity=".85"/>`, bare = [sk[1], sk[2]];
  const g = mk(shad(80, 176, 36) + limb("M70 136 V164", 9, bare) + limb("M90 136 V164", 9, bare) + `<ellipse cx="67" cy="169" rx="11" ry="5.6" fill="#2c2623"/><ellipse cx="93" cy="169" rx="11" ry="5.6" fill="#2c2623"/><path d="M62 160 h14 M84 160 h14" stroke="#fbfaf5" stroke-width="5"/>` +
    (girl ? `<path d="M${xl + 5} 124 H${xr - 5} L${xr + 8} 150 Q80 156 ${xl - 8} 150Z" fill="${low[0]}" stroke="${low[1]}" stroke-width="1.6" stroke-linejoin="round"/><path d="M68 130 L64 150 M80 130 V152 M92 130 L96 150" stroke="${low[1]}" stroke-width="1.2" opacity=".6"/>`
      : `<path d="M${xl + 5} 124 H${xr - 5} L${xr - 3} 148 H83 L80 136 L77 148 H${xl + 3}Z" fill="${low[0]}" stroke="${low[1]}" stroke-width="1.6" stroke-linejoin="round"/>`) +
    limb(`M${xl + 5} 104 Q${xl - 3} 118 ${xl - 5} 132`, 10, col) + limb(`M${xr - 5} 104 Q${xr + 3} 118 ${xr + 5} 132`, 10, col) + `<circle cx="${xl - 5.5}" cy="136" r="5.6" fill="${sk[1]}" stroke="${sk[2]}" stroke-width="1"/><circle cx="${xr + 5.5}" cy="136" r="5.6" fill="${sk[1]}" stroke="${sk[2]}" stroke-width="1"/>
     <path d="M${xl + 1} 110 H${xr - 1} L${xr - 5} 128 H${xl + 5}Z" fill="${col[1]}"/><g class="bust" transform="translate(32 2) scale(${q})"></g>`);
  g.querySelector("g.bust").appendChild(bust(ps));
  return g.innerHTML;
}
function baby(k){
  const u = k.u, has = k.has, hatOn = has("hat", "bonnet"), P = hatOn && !has("romper") ? pal(COL.sky) : k.tint("sky"), H = hatOn ? k.tint("yellow") : null, sk = SKIN.fair, st = `stroke="${P.d}" stroke-width="1.7" stroke-linejoin="round"`, ss = `stroke="${sk[2]}" stroke-width="1.5" stroke-linejoin="round"`;
  const defs = `<defs><radialGradient id="${u}s" cx=".42" cy=".4" r=".7"><stop offset="0" stop-color="${sk[0]}"/><stop offset=".75" stop-color="${sk[1]}"/><stop offset="1" stop-color="${sk[2]}"/></radialGradient></defs>`;
  const head = (x, y, r, side) => `<circle cx="${x - r * 0.96 * (side ? -0.2 : 1)}" cy="${y + 2}" r="${r * 0.2}" fill="${sk[2]}"/>` + (side ? "" : `<circle cx="${x + r * 0.96}" cy="${y + 2}" r="${r * 0.2}" fill="${sk[2]}"/>`) + `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${u}s)" stroke="${sk[2]}" stroke-width="1.5"/>` +
    (H ? `<path d="M${x - r * 1.05} ${y - r * 0.2} Q${x - r} ${y - r * 1.25} ${x} ${y - r * 1.2} Q${x + r} ${y - r * 1.25} ${x + r * 1.05} ${y - r * 0.2} Q${x} ${y - r * 0.62} ${x - r * 1.05} ${y - r * 0.2}Z" fill="${H.a}" stroke="${H.d}" stroke-width="1.7" stroke-linejoin="round"/><path d="M${x - r * 1.3} ${y - r * 0.12} Q${x} ${y - r * 0.7} ${x + r * 1.3} ${y - r * 0.12}" stroke="${H.d}" stroke-width="5.6" fill="none" stroke-linecap="round"/><path d="M${x - r * 1.3} ${y - r * 0.12} Q${x} ${y - r * 0.7} ${x + r * 1.3} ${y - r * 0.12}" stroke="${H.a}" stroke-width="3" fill="none" stroke-linecap="round"/>`
      : `<path d="M${x - 2} ${y - r + 1} q-2 -12 8 -11 q-6 4 -2 10" fill="none" stroke="#8e6843" stroke-width="2.6" stroke-linecap="round"/>`) +
    `<ellipse cx="${x - r * 0.52 + (side ? r * 0.2 : 0)}" cy="${y + r * 0.34}" rx="${r * 0.2}" ry="${r * 0.13}" fill="#e98a7a" opacity=".5"/><ellipse cx="${x + r * 0.52 + (side ? r * 0.16 : 0)}" cy="${y + r * 0.34}" rx="${r * 0.2}" ry="${r * 0.13}" fill="#e98a7a" opacity=".5"/>
     <circle cx="${x - r * 0.34 + (side ? r * 0.2 : 0)}" cy="${y + r * 0.06}" r="${r * 0.1}" fill="#2a1c15"/><circle cx="${x + r * 0.34 + (side ? r * 0.2 : 0)}" cy="${y + r * 0.06}" r="${r * 0.1}" fill="#2a1c15"/><path d="M${x - r * 0.2 + (side ? r * 0.2 : 0)} ${y + r * 0.42} q${r * 0.2} ${r * 0.2} ${r * 0.4} 0" stroke="#b8645f" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
  const foot = (x, y, r) => `<ellipse cx="${x}" cy="${y}" rx="9" ry="11" fill="${sk[1]}" ${ss} transform="rotate(${r} ${x} ${y})"/>`, fist = (x, y) => `<circle cx="${x}" cy="${y}" r="7.5" fill="${sk[1]}" ${ss}/>`;
  if (has("pram")){ const C = k.cn ? P : pal(COL.navy), cs = `stroke="${C.d}" stroke-width="1.8" stroke-linejoin="round"`, wh = x => `<circle cx="${x}" cy="150" r="17" fill="none" stroke="#26272c" stroke-width="4.6"/><path d="M${x - 15} 150 h30 M${x} 135 v30 M${x - 11} 139 l22 22 M${x + 11} 139 l-22 22" stroke="#8b8f96" stroke-width="1.3"/><circle cx="${x}" cy="150" r="3.4" fill="#6d737c"/>`;
    return defs + shad(80, 170, 62) + wh(46) + wh(112) + `<path d="M46 150 L60 122 M112 150 L98 122" stroke="#8b8f96" stroke-width="3.4"/><path d="M134 70 q14 -2 16 -14" stroke="#3d424c" stroke-width="4.4" fill="none" stroke-linecap="round"/>` + head(92, 70, 19) +
      `<path d="M24 82 H136 Q136 122 100 124 H60 Q24 122 24 82Z" fill="${C.a}" ${cs}/><path d="M24 82 Q22 30 72 30 L72 82Z" fill="${C.b}" ${cs}/><path d="M36 76 Q38 46 68 40 M50 80 Q52 56 70 50" stroke="${C.d}" stroke-width="1.2" fill="none" opacity=".7"/><path d="M24 92 H136" stroke="#fbfaf5" stroke-width="5"/>`; }
  if (has("crawling", "crawls")) return defs + shad(80, 164, 62) + `<path d="M44 124 Q26 128 24 152 H44 Q46 140 56 138Z" fill="${P.a}" ${st}/>` + foot(20, 148, 70) + `<path d="M34 104 Q30 78 62 78 H100 Q116 82 114 110 Q112 130 92 130 H56 Q36 130 34 104Z" fill="${P.a}" ${st}/><path d="M36 100 q14 -8 26 2" stroke="${P.d}" stroke-width="1.2" fill="none" opacity=".6"/>
      <path d="M92 118 L98 150 H112 L110 112Z" fill="${P.a}" ${st}/>` + fist(104, 154) + `<path d="M62 122 L60 152 H78 L80 126Z" fill="${P.b}" ${st}/>` + head(118, 76, 27, 1);
  const rattle = has("rattle");
  return defs + shad(80, 172, 56) + `<path d="M56 132 Q28 136 22 158 Q30 170 46 162 Q54 148 70 148Z M104 132 Q132 136 138 158 Q130 170 114 162 Q106 148 90 148Z" fill="${P.a}" ${st}/>` + foot(26, 160, -30) + foot(134, 160, 30) +
    `<path d="M52 104 Q50 90 64 86 H96 Q110 90 108 104 L112 146 Q80 162 48 146Z" fill="${P.a}" ${st}/><path d="M80 96 V150" stroke="${P.d}" stroke-width="1.2" opacity=".6"/><circle cx="80" cy="108" r="2.2" fill="${P.d}"/><circle cx="80" cy="122" r="2.2" fill="${P.d}"/><circle cx="80" cy="136" r="2.2" fill="${P.d}"/>
     <path d="M54 96 Q34 100 30 120 L42 126 Q46 112 58 110Z" fill="${P.a}" ${st}/>` + fist(34, 126) + (rattle ? `<path d="M106 96 Q122 90 126 72 L138 78 Q132 102 110 110Z" fill="${P.a}" ${st}/><path d="M133 70 L138 46" stroke="#8b8f96" stroke-width="4.4" stroke-linecap="round"/><circle cx="139" cy="35" r="12" fill="#f0c648" stroke="#cc9f26" stroke-width="1.8"/><circle cx="135" cy="31" r="2.4" fill="#e0574c"/><circle cx="143" cy="37" r="2.4" fill="#4d7fc4"/><circle cx="137" cy="41" r="2" fill="#5aa86d"/>
       <path d="M118 22 q-6 8 -2 16 M154 56 q-8 4 -14 0" stroke="#8b8f96" stroke-width="2.6" fill="none" stroke-linecap="round"/>` + fist(132, 73) : `<path d="M106 96 Q126 100 130 120 L118 126 Q114 112 102 110Z" fill="${P.a}" ${st}/>` + fist(126, 126)) + head(80, 56, 33);
}
/* --- the six places as things to be named: the same scenes, each with variants told by its looks (a park is open: trees, a path, no house;
   a garden is by a house wall, behind a picket fence; a shop is a front with an awning and goods; a kitchen is a room: cupboards, sink, cooker) --- */
const SKY = `<rect width="160" height="190" fill="#e4f3fb"/>`;
const trAt = (x, y, s, looks) => `<g transform="translate(${x} ${y}) scale(${s})">${tree(lookOf({ looks: looks || [] }))}</g>`;
const benchAt = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M6 20 v16 M48 20 v16" stroke="#3d424c" stroke-width="4" stroke-linecap="round"/><path d="M0 0 h54 v6 h-54z M0 10 h54 v6 h-54z M-4 20 h62 v7 h-62z" fill="#b98558" stroke="#74492b" stroke-width="1.3"/><path d="M4 0 v20 M50 0 v20" stroke="#74492b" stroke-width="3"/></g>`;
const blooms = pts => pts.map((p, i) => `<path d="M${p[0]} ${p[1]} v-13 M${p[0]} ${p[1] - 5} l5 -4" stroke="#3f8551" stroke-width="2.2" stroke-linecap="round"/><circle cx="${p[0]}" cy="${p[1] - 16}" r="5.4" fill="${["#e0574c", "#f0c648", "#e88fb0", "#9076c8"][i % 4]}" stroke="#0002" stroke-width="1"/><circle cx="${p[0]}" cy="${p[1] - 16}" r="1.8" fill="#fff8d6"/>`).join("");
const soil = (cx, cy, rx, ry) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#8a6a4a" stroke="#5c4027" stroke-width="1.3"/>`;
const VARIANT = {
  station: (k, u) => station(k, u),
  park(k){
    const has = k.has, autumn = has("autumn"), lawn = `<path d="M0 128 Q44 104 96 118 Q134 128 160 110 V190 H0Z" fill="${autumn ? "#c8cc74" : "#9ccf7a"}"/>`, way = `<path d="M108 190 Q84 160 110 144 Q130 132 120 116 L130 114 Q146 134 122 152 Q104 166 138 190Z" fill="#ecdcb2" stroke="#cdb98a" stroke-width="1.2"/>`;
    if (has("pond")) return SKY + lawn + trAt(78, -4, 0.52) + trAt(-12, 30, 0.4) + `<ellipse cx="82" cy="152" rx="62" ry="24" fill="#6fb6ea" stroke="#3f8fd0" stroke-width="1.8"/><path d="M44 148 q8 -4 16 0 M88 162 q8 -4 16 0 M100 144 q7 -3.5 14 0" stroke="#fff" stroke-width="2" fill="none" opacity=".8"/>` +
        [[62, 156, 1], [112, 152, -1]].map(d => `<g transform="translate(${d[0]} ${d[1]}) scale(${d[2]} 1)"><ellipse rx="10" ry="6" fill="#fff" stroke="#8f98a3" stroke-width="1.2"/><circle cx="9" cy="-7" r="5" fill="#fff" stroke="#8f98a3" stroke-width="1.2"/><path d="M13 -7 l7 2 l-7 2z" fill="#ee9a4a"/><circle cx="10" cy="-8" r="1" fill="#2b2b30"/></g>`).join("") +
        `<path d="M22 150 v-18 M27 152 v-22 M32 150 v-16 M140 160 v-20 M146 162 v-16" stroke="#3f8551" stroke-width="2.6" stroke-linecap="round"/>`;
    if (has("playground")) return SKY + lawn + trAt(-14, 24, 0.44) + `<ellipse cx="118" cy="170" rx="34" ry="10" fill="#f3dc9a" stroke="#cdb98a" stroke-width="1.2"/><path d="M16 172 V112 M30 172 V112 M16 124 h14 M16 138 h14 M16 152 h14" stroke="#6d737c" stroke-width="3.4" stroke-linecap="round"/><path d="M30 114 Q52 118 60 146 Q64 166 84 170" stroke="#cc9f26" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M30 114 Q52 118 60 146 Q64 166 84 170" stroke="#f0c648" stroke-width="8" fill="none" stroke-linecap="round"/>
        <path d="M84 158 L100 92 L116 158 M100 92 H150 M134 158 L150 92 L160 134" stroke="#d8483f" stroke-width="4.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M114 92 V136 M134 92 V136" stroke="#3d424c" stroke-width="2"/><rect x="110" y="134" width="28" height="6" rx="2" fill="#4d7fc4" stroke="#3a64a3" stroke-width="1"/>`;
    if (has("benches", "bench")) return SKY + lawn + way + trAt(72, -8, 0.58) + `<path d="M22 168 V104" stroke="#3d424c" stroke-width="4"/><circle cx="22" cy="98" r="8" fill="#f6e08a" stroke="#3d424c" stroke-width="2.4"/>` + benchAt(34, 122, 0.82) + benchAt(18, 150, 1.05) + benchAt(116, 150, 0.7);
    if (autumn) return SKY + lawn + way + trAt(60, -4, 0.64, ["autumn", "orange"]) + trAt(-16, 30, 0.46, ["autumn", "yellow"]) + benchAt(40, 132, 0.8) + [[16, 170, 20], [34, 182, 80], [70, 176, 0], [148, 178, 40], [96, 184, 120], [58, 162, -30]].map((p, i) => `<path d="M-5 0 Q0 -5 6 0 Q0 5 -5 0Z" fill="${["#e0574c", "#f0c648", "#ee9a4a"][i % 3]}" transform="translate(${p[0]} ${p[1]}) rotate(${p[2]})"/>`).join("");
    if (has("flowers", "flower")) return SKY + lawn + way + trAt(84, 6, 0.46) + benchAt(100, 122, 0.6) + soil(44, 150, 40, 12) + soil(40, 178, 36, 9) + blooms([[14, 148], [28, 142], [44, 150], [60, 142], [74, 150], [16, 176], [34, 170], [52, 178], [66, 172], [150, 176], [140, 164]]);
    if (!has("trees", "tree")) return null;                 // only a colour, or words it does not know: the usual park
    return SKY + lawn + way + trAt(66, -6, 0.6) + trAt(-16, 22, 0.5) + trAt(28, 60, 0.36) + trAt(108, 64, 0.3) + `<g fill="#e0574c"><circle cx="20" cy="176" r="3"/><circle cx="150" cy="172" r="3"/></g>`;
  },
  beach(k, u){
    const has = k.has, dusk = has("sunset");
    if (!dusk && !has("sandy", "palm", "palms", "rocks", "boats", "boat", "trees")) return null;
    const RED = pal(COL.red), palm = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0 Q-10 -40 4 -78" stroke="#74492b" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M0 0 Q-10 -40 4 -78" stroke="#a2714a" stroke-width="5.6" fill="none" stroke-linecap="round"/>` +
      [[-38, -6], [-30, -30], [0, -40], [30, -30], [38, -6]].map(p => `<path d="M4 -78 Q${4 + p[0] * 0.5} ${-90 + p[1] * 0.6} ${4 + p[0]} ${-74 + p[1]} Q${4 + p[0] * 0.4} ${-80 + p[1] * 0.3} 4 -78Z" fill="#5aa86d" stroke="#3f8551" stroke-width="1.4" stroke-linejoin="round"/>`).join("") + `<circle cx="2" cy="-74" r="4" fill="#74492b"/></g>`;
    let s = (dusk ? `<defs><linearGradient id="${u}sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7b267"/><stop offset="1" stop-color="#f48a6a"/></linearGradient></defs><rect width="160" height="80" fill="url(#${u}sk)"/><circle cx="80" cy="76" r="27" fill="#ffd23c" stroke="#f39a1e" stroke-width="2.4"/>` : `<rect width="160" height="80" fill="#dff1fb"/><circle cx="34" cy="34" r="16" fill="#ffd23c" stroke="#f39a1e" stroke-width="2.4"/>`) +
      `<rect y="74" width="160" height="50" fill="${dusk ? "#5f6fb0" : "#4fa3e6"}"/>` + (dusk ? `<path d="M62 84 h36 M56 94 h48 M66 104 h28 M60 114 h40" stroke="#ffd23c" stroke-width="3" stroke-linecap="round" opacity=".85"/>` : "") +
      `<path d="M0 86 q10 -6 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 M-10 102 q10 -6 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" stroke="#fff" stroke-width="2.4" fill="none" opacity="${dusk ? ".4" : ".85"}"/><path d="M0 122 Q40 110 84 120 Q124 128 160 116 V190 H0Z" fill="${dusk ? "#e8c98e" : "#f5df9e"}"/>`;
    if (has("palm", "palms", "trees")) s += palm(120, 172, 1.05) + palm(40, 150, 0.7);
    if (has("rocks")) s += `<path d="M96 126 L104 92 L122 80 L140 96 L150 126Z M10 108 L20 88 L36 92 L42 110Z" fill="#8f98a3" stroke="#5b616d" stroke-width="1.6" stroke-linejoin="round"/><path d="M104 92 L118 104 L122 80 M118 104 L128 126" stroke="#5b616d" stroke-width="1.2" fill="none"/><path d="M40 168 l8 -14 l14 -4 l10 10 l4 12z M112 178 l6 -10 l12 0 l6 10z" fill="#a9afb8" stroke="#5b616d" stroke-width="1.5" stroke-linejoin="round"/>`;
    if (has("boats", "boat")) s += `<path d="M96 96 h44 l-8 12 h-28z" fill="#fbfaf5" stroke="#5b616d" stroke-width="1.5" stroke-linejoin="round"/><path d="M116 96 V58 L138 92Z" fill="#fff" stroke="#5b616d" stroke-width="1.4" stroke-linejoin="round"/><path d="M113 96 V64 L98 92Z" fill="${RED.a}" stroke="${RED.d}" stroke-width="1.2" stroke-linejoin="round"/>
        <path d="M20 150 Q50 176 96 152 L88 172 Q54 184 28 170Z" fill="#4d7fc4" stroke="#3a64a3" stroke-width="1.6" stroke-linejoin="round"/><path d="M26 154 Q54 170 90 156" stroke="#fff" stroke-width="2.6" fill="none"/><path d="M44 146 L78 176 M70 144 L40 178" stroke="#a2714a" stroke-width="3" stroke-linecap="round"/>`;
    if (has("sandy") || (dusk && !has("palm", "rocks", "boats"))) s += `<path d="M84 172 V146 h8 v-8 h6 v8 h8 v-14 h8 v14 h8 v-8 h6 v8 h8 v26Z" fill="#e9c877" stroke="#b9975a" stroke-width="1.5" stroke-linejoin="round"/><path d="M110 132 v-12 l9 4 l-9 4" fill="${RED.a}" stroke="${RED.d}" stroke-width="1.2"/><path d="M102 172 v-10 q0 -6 6 -6 q6 0 6 6 v10" fill="#b9975a"/>
        <path d="M34 176 l3 -22 h22 l3 22z" fill="${RED.a}" stroke="${RED.d}" stroke-width="1.5" stroke-linejoin="round"/><path d="M36 156 q12 -16 24 0" stroke="${RED.d}" stroke-width="2.4" fill="none"/><path d="M68 178 L78 150" stroke="#f0c648" stroke-width="3.4" stroke-linecap="round"/><ellipse cx="66" cy="180" rx="6" ry="4" fill="#f0c648" stroke="#cc9f26" stroke-width="1"/>`;
    return s;
  },
  garden(k){
    const has = k.has, grass = "#9ccf7a";
    if (!has("tree", "roses", "rose", "fence", "bench", "lawn")) return null;
    let s = `<rect width="160" height="112" fill="${TINT.cream[0]}"/><path d="M0 20 H160 M0 40 H160 M0 60 H160 M0 80 H160" stroke="${TINT.cream[1]}" stroke-width="1.4"/>` + paneRect(98, 30, 44, 46, WHITE, 2, 2) + `<rect x="92" y="78" width="56" height="7" rx="2" fill="${STONE.a}" stroke="${STONE.d}" stroke-width="1.2"/>
      <rect y="112" width="160" height="78" fill="${grass}"/><path d="M0 98 H160 M0 114 H160" stroke="#fbfaf5" stroke-width="5"/>` + [2, 18, 34, 50, 66, 82, 98, 114, 130, 146].map(x => picket(x, 88)).join("");
    if (has("tree")) s += trAt(18, 6, 0.74, ["with apples"]) + blooms([[22, 182], [140, 178], [128, 166]]);
    else if (has("roses", "rose")) s += [[28, 150], [80, 142], [132, 150], [54, 176], [108, 176]].map((p, j) => `<path d="M${p[0]} ${p[1] + 12} v-10" stroke="#74492b" stroke-width="4"/><ellipse cx="${p[0]}" cy="${p[1] - 8}" rx="24" ry="19" fill="#4f9a3d" stroke="#2f6f24" stroke-width="1.5"/>` +
        [[-12, -12], [4, -18], [14, -6], [-4, -4], [-14, 2], [8, 6]].map((d, i) => `<circle cx="${p[0] + d[0]}" cy="${p[1] + d[1]}" r="5.6" fill="${(i + j) % 3 ? "#dc3431" : "#e88fb0"}" stroke="#9c1c1b" stroke-width="1"/><path d="M${p[0] + d[0] - 2.5} ${p[1] + d[1]} q2.5 -3.6 5 0 q-2.5 2.4 -3.6 -.6" stroke="#9c1c1b" stroke-width="1" fill="none"/>`).join("")).join("");
    else if (has("bench")) s += benchAt(46, 124, 1.15) + soil(26, 178, 24, 8) + soil(134, 178, 24, 8) + blooms([[12, 176], [26, 172], [40, 178], [120, 176], [134, 172], [148, 178]]);
    else if (has("lawn")) s += `<path d="M0 132 H160 M0 152 H160 M0 172 H160" stroke="#86bd62" stroke-width="10"/>` + soil(134, 126, 22, 6) + blooms([[122, 126], [134, 122], [146, 126]]) + `<path d="M20 150 l30 -26" stroke="#3d424c" stroke-width="3.4" stroke-linecap="round"/><rect x="42" y="150" width="38" height="16" rx="4" fill="#d8483f" stroke="#ad332c" stroke-width="1.5"/><circle cx="48" cy="168" r="6" fill="#26272c"/><circle cx="74" cy="168" r="6" fill="#26272c"/>`;
    else s += soil(80, 148, 60, 12) + blooms([[30, 146], [48, 140], [66, 148], [84, 140], [102, 148], [120, 140], [132, 148]]);
    if (has("fence")) s += `<path d="M0 166 H160 M0 182 H160" stroke="#fbfaf5" stroke-width="5"/>` + [2, 18, 34, 50, 66, 82, 98, 114, 130, 146].map(x => picket(x, 156)).join("");
    return s;
  },
  shop(k){
    const has = k.has, big = has("windows", "big"), toys = has("toy", "toys"), front = has("front"), A = pal(has("awning") && k.cn ? TINT[k.cn] : toys ? COL.yellow : front && k.cn ? COL.white : k.cn ? TINT[k.cn] : COL.red);
    const F = front && k.cn ? k.tint() : pal(TINT.cream), GL = "#cfe8f6", DR = pal(front && k.cn === "green" ? COL.red : COL.green), door = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${DR.a}" stroke="${DR.d}" stroke-width="1.6"/><rect x="${x + 5}" y="${y + 7}" width="${w - 10}" height="${h * 0.46}" fill="${GL}" stroke="${DR.d}" stroke-width="1.2"/><circle cx="${x + 6}" cy="${y + h * 0.62}" r="2.4" fill="#f2d268"/>`;
    const goods = (x0, x1, y) => toys ? `<circle cx="${x0 + 18}" cy="${y - 12}" r="11" fill="#b98558" stroke="#74492b" stroke-width="1.3"/><circle cx="${x0 + 18}" cy="${y - 28}" r="8" fill="#b98558" stroke="#74492b" stroke-width="1.3"/><circle cx="${x0 + 11}" cy="${y - 35}" r="3.4" fill="#b98558" stroke="#74492b" stroke-width="1.2"/><circle cx="${x0 + 25}" cy="${y - 35}" r="3.4" fill="#b98558" stroke="#74492b" stroke-width="1.2"/><circle cx="${x0 + 15}" cy="${y - 29}" r="1.1" fill="#2b2b30"/><circle cx="${x0 + 21}" cy="${y - 29}" r="1.1" fill="#2b2b30"/>
          <circle cx="${x0 + 46}" cy="${y - 10}" r="10" fill="#e0574c" stroke="#ad332c" stroke-width="1.3"/><path d="M${x0 + 37} ${y - 13} q9 6 18 0" stroke="#fff" stroke-width="2.6" fill="none"/><rect x="${x1 - 34}" y="${y - 14}" width="12" height="12" fill="#4d7fc4" stroke="#3a64a3" stroke-width="1.2"/><rect x="${x1 - 22}" y="${y - 14}" width="12" height="12" fill="#f0c648" stroke="#cc9f26" stroke-width="1.2"/><rect x="${x1 - 28}" y="${y - 26}" width="12" height="12" fill="#5aa86d" stroke="#3f8551" stroke-width="1.2"/>`
      : `<path d="M${x0 + 18} ${y} l3 -34 q-9 -5 -6 -15 l6 -3 l5 5 l5 -5 l6 3 q3 10 -6 15 l3 34z" fill="#d8483f" stroke="#ad332c" stroke-width="1.2" stroke-linejoin="round"/><path d="M${x0 + 50} ${y} v-20 M${x0 + 44} ${y} h12" stroke="#8b8f96" stroke-width="2"/><ellipse cx="${x0 + 50}" cy="${y - 22}" rx="14" ry="4" fill="#ecd79f" stroke="#ccb272" stroke-width="1.2"/><path d="M${x0 + 42} ${y - 23} q8 -14 16 0z" fill="#ecd79f" stroke="#ccb272" stroke-width="1.2"/>
          <path d="M${x1 - 26} ${y} v-9 q0 -5 5 -5 h10 q5 0 5 5 v9z" fill="#4d7fc4" stroke="#3a64a3" stroke-width="1.2"/><path d="M${x1 - 22} ${y - 13} q6 -11 12 0" stroke="#3a64a3" stroke-width="2.2" fill="none"/>`;
    const pane = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${GL}" stroke="#3d424c" stroke-width="3.4"/><path d="M${x + 2} ${y + h - 14} H${x + w - 2} V${y + h - 2} H${x + 2}Z" fill="#e9dcc0"/>` + goods(x, x + w, y + h - 14) + `<path d="M${x + 8} ${y + h - 24} L${x + 30} ${y + 12}" stroke="#fff" stroke-width="4.4" stroke-linecap="round" opacity=".6"/>`;
    const base = `<rect width="160" height="190" fill="${F.a}"/><rect y="170" width="160" height="20" fill="${STONE.b}"/>`, sign = `<rect x="18" y="8" width="124" height="18" rx="3" fill="${A.a}" stroke="${A.d}" stroke-width="1.4"/>`;
    if (big) return base + [8, 60, 112].map(x => `<rect x="${x}" y="8" width="40" height="34" fill="${GL}" stroke="#3d424c" stroke-width="2.6"/><path d="M${x + 20} 8 v34" stroke="#3d424c" stroke-width="2"/>`).join("") + `<rect y="46" width="160" height="12" fill="${A.a}" stroke="${A.d}" stroke-width="1.3"/>` + pane(6, 64, 60, 88).replace(goods(6, 66, 138), goods(6, 66, 138)) + pane(94, 64, 60, 88) + door(68, 72, 24, 98) + `<rect x="6" y="152" width="60" height="18" fill="${STONE.a}" stroke="${STONE.d}" stroke-width="1.2"/><rect x="94" y="152" width="60" height="18" fill="${STONE.a}" stroke="${STONE.d}" stroke-width="1.2"/>`;
    if (has("corner")) return `<rect width="160" height="190" fill="#e4f3fb"/><rect y="170" width="160" height="20" fill="${STONE.b}"/><path d="M14 170 V40 L80 22 L146 40 V170Z" fill="${F.a}" stroke="${F.d}" stroke-width="1.6" stroke-linejoin="round"/><path d="M80 22 V170" stroke="${F.d}" stroke-width="1.4"/><path d="M8 42 L80 20 L152 42" fill="none" stroke="#6b4c38" stroke-width="5" stroke-linejoin="round"/>` +
        paneRect(28, 52, 22, 26, WHITE, 2, 2) + paneRect(112, 52, 22, 26, WHITE, 2, 2) + pane(20, 110, 54, 44).replace(/<path d="M28[^>]*>$/, "") + door(92, 104, 30, 66) + awning(12, 82, 88, A) + awning(84, 132, 88, A) + `<rect x="20" y="154" width="54" height="16" fill="${STONE.a}" stroke="${STONE.d}" stroke-width="1.2"/>`;
    return base + sign + pane(10, 60, 96, 92) + `<rect x="10" y="152" width="96" height="18" fill="${STONE.a}" stroke="${STONE.d}" stroke-width="1.2"/>` + door(114, 62, 36, 108) + awning(4, 156, 34, A);
  },
  kitchen(k){
    const has = k.has, modern = has("modern"), old = has("old"), P = has("wooden") || !k.cn ? WOOD : k.tint(), st = `stroke="${P.d}" stroke-width="1.4"`, knob = (x, y) => modern ? `<path d="M${x - 5} ${y} h10" stroke="#6d737c" stroke-width="2.6" stroke-linecap="round"/>` : `<circle cx="${x}" cy="${y}" r="2" fill="${P.d}"/>`;
    let s = `<rect width="160" height="168" fill="${old ? "#efe2c6" : "#f3ecdc"}"/><rect y="168" width="160" height="22" fill="${old ? "#b98558" : "#d9d2c0"}"/><path d="M0 179 H160 M20 168 V190 M60 168 V190 M100 168 V190 M140 168 V190" stroke="${old ? "#8a5a36" : "#b9b09a"}" stroke-width="1.2"/>`;
    s += old ? `<path d="M2 44 H90" stroke="${P.d}" stroke-width="5" stroke-linecap="round"/><path d="M14 44 v10 M40 44 v10 M66 44 v10" stroke="#3d424c" stroke-width="2"/><circle cx="14" cy="62" r="9" fill="#b9bec6" stroke="#6d737c" stroke-width="1.5"/><circle cx="40" cy="64" r="11" fill="#a9763a" stroke="#74492b" stroke-width="1.5"/><circle cx="66" cy="61" r="8" fill="#b9bec6" stroke="#6d737c" stroke-width="1.5"/>
        <rect x="4" y="8" width="84" height="6" fill="${P.a}" ${st}/><rect x="10" y="-6" width="12" height="14" rx="2" fill="#e0574c"/><rect x="28" y="-4" width="12" height="12" rx="2" fill="#f0c648"/><rect x="46" y="-8" width="12" height="16" rx="2" fill="#5aa86d"/><rect x="64" y="-4" width="12" height="12" rx="2" fill="#58a6e0"/>`
      : [4, 44, 84, 124].slice(0, modern ? 2 : 4).map(x => `<rect x="${x}" y="8" width="36" height="44" rx="2" fill="${P.a}" ${st}/>` + knob(x + 28, 44)).join("") + (modern ? `<path d="M96 52 L104 26 H140 L148 52Z" fill="#d5d8dc" stroke="#6d737c" stroke-width="1.5" stroke-linejoin="round"/><rect x="112" y="0" width="20" height="26" fill="#d5d8dc" stroke="#6d737c" stroke-width="1.5"/>` : "");
    s += `<rect y="100" width="160" height="8" fill="${modern ? "#3d424c" : "#8f98a3"}"/><rect y="108" width="92" height="60" fill="${P.a}" ${st}/><path d="M46 108 V168" ${st}/>` + knob(38, 120) + knob(54, 120) +
      `<path d="M22 100 q0 -26 14 -26 q10 0 10 10" stroke="#8b8f96" stroke-width="5" fill="none" stroke-linecap="round"/><rect x="8" y="96" width="50" height="8" rx="3" fill="#d5d8dc" stroke="#6d737c" stroke-width="1.3"/><path d="M46 88 v8" stroke="#58a8ea" stroke-width="3" stroke-linecap="round"/>`;
    s += old ? `<path d="M124 100 V20" stroke="#3d424c" stroke-width="9"/><rect x="94" y="98" width="62" height="70" rx="4" fill="#33353b" stroke="#17181c" stroke-width="1.8"/><rect x="102" y="120" width="22" height="26" rx="2" fill="#55585f" stroke="#17181c" stroke-width="1.4"/><rect x="128" y="120" width="22" height="26" rx="2" fill="#55585f" stroke="#17181c" stroke-width="1.4"/><path d="M106 132 h14 M132 132 h14" stroke="#b9bec6" stroke-width="2.6" stroke-linecap="round"/><path d="M110 154 h30" stroke="#ee9a4a" stroke-width="5" stroke-linecap="round"/>`
      : `<rect x="92" y="98" width="62" height="70" rx="3" fill="${modern ? "#d5d8dc" : "#fbfaf5"}" stroke="#6d737c" stroke-width="1.8"/><rect x="100" y="124" width="46" height="34" rx="3" fill="#3d424c" stroke="#26272c" stroke-width="1.4"/><path d="M104 118 H142" stroke="#6d737c" stroke-width="3" stroke-linecap="round"/>` + (modern ? `<rect x="94" y="96" width="58" height="5" fill="#17181c"/>` : `<g fill="#3d424c"><circle cx="104" cy="108" r="2.6"/><circle cx="116" cy="108" r="2.6"/><circle cx="130" cy="108" r="2.6"/><circle cx="142" cy="108" r="2.6"/></g>`);
    return s + `<path d="M100 98 h28 l-3 -16 h-22z" fill="#d8483f" stroke="#ad332c" stroke-width="1.5" stroke-linejoin="round"/><path d="M128 86 h16" stroke="#2b2b30" stroke-width="4" stroke-linecap="round"/>` + (old ? "" : `<path d="M108 76 q-4 -6 0 -12 q4 -6 0 -12 M120 76 q-4 -6 0 -12 q4 -6 0 -12" stroke="#aeb4bd" stroke-width="3" fill="none" stroke-linecap="round"/>`);
  }
};
const placeThing = is => (k, spec) => `<defs><clipPath id="${k.u}c"><rect x="0" y="0" width="160" height="190" rx="15"/></clipPath></defs><g transform="translate(5.6 6.6) scale(.93)"><g clip-path="url(#${k.u}c)">${scene(is, spec && spec.of, k.u, k)}</g><rect width="160" height="190" rx="15" fill="none" stroke="#8f98a3" stroke-width="2.6"/></g>`;
/* --- every kind of thing, by name --- */
const THING = { cake, pizza, coffee, glass, banana, plate, bus, table, chair, bag, box, house, door, window: windowPic, cat, tree, bicycle,
  face: faceCard, "french flag": flag, flag, "picture card": card, card, newspaper, letter, weather, book: bookS, apple: appleS, pen: penS, shoe: shoeS,
  ball, hat, phone, bread, flower, lamp, shirt, trousers, dress, fish, cheese, tomato, plane, motorbike, boy: kid, girl: kid, baby,
  train, park: placeThing("park"), beach: placeThing("beach"), garden: placeThing("garden"), shop: placeThing("shop"), station: placeThing("station"), kitchen: placeThing("kitchen") };
/* "big" and "small" on any kind: the same picture at two sizes, standing on the same line. The look lists of Lessons 5-10 in which
   big or small names a picture of its own keep that picture (SIZED: the look words of each, sorted). */
const SIZED = { cake: ["pink small"], coffee: ["a black cup in small"], banana: ["big", "small"], pizza: ["small"], table: ["low small"], box: ["metal small", "big open"], house: ["small white"],
  door: ["big black"], cat: ["small white"], glass: ["small"], tree: ["big green", "small young"], window: ["big shop"] };
const SMALL = { park: 0.72, beach: 0.72, garden: 0.72, shop: 0.72, station: 0.72, kitchen: 0.72, train: 0.7, plane: 0.62, motorbike: 0.62, cheese: 0.68, boy: 0.62, girl: 0.62 };       // how small "small" is (0.55 of big unless said here)
function sized(el, big, is){
  const b = measure(el), f = Math.min(150 / b.w, 168 / b.h, 1.3) * (big ? 1 : SMALL[is] || 0.55), g = mk(""), o = mk("");
  g.setAttribute("transform", `translate(${r2(80 - (b.x + b.w / 2) * f)} ${r2(180 - (b.y + b.h) * f)}) scale(${r2(f * 1000) / 1000})`);
  g.appendChild(el); o.appendChild(g);
  return o;
}
function oneThing(spec){
  spec = spec || {};
  const is = String(spec.is || "").toLowerCase().trim();
  if (is === "key") return oneKey(spec);
  if (is === "dog") return oneDog(spec);
  if (is === "car") return /\bbig\b/i.test((spec.looks || []).join(" ")) ? sized(oneCar(spec), true) : oneCar(spec);
  const f = THING[is];
  if (!f) return mk("");
  const k = lookOf(spec), size = (SIZED[is] || []).indexOf(k.sig) >= 0 ? 0 : k.has("big") ? 1 : k.has("small") ? -1 : 0;
  return size ? sized(mk(f(lookOf({ looks: [k.S.replace(/ (big|small)(?= )/g, "")] }), spec)), size > 0, is) : mk(f(k, spec));
}
function thing(spec){
  spec = spec || {};
  const n = spec.count || 1;
  return n > 1 ? group(n, () => oneThing(spec)) : oneThing(spec);
}

/* ---------- the learner and the teacher side by side, doing the same thing in step (the loops share the clock of the picture) ---------- */
function together(act, opts){
  const w = String(act || "").toLowerCase().trim().split(/[ ,]/)[0], a = ACT_OF[w] || ACT2[w] || "smile", face = a === "smile" || a === "eat" || a === "drink", s = face ? 0.66 : 0.62, g = mk("");
  ["you", "marie"].forEach((who, i) => {
    const c = mk("");
    c.setAttribute("transform", `translate(${r2((i ? 120 : 40) + (face ? (i ? -1 : 1) : 0) - 80 * s)} ${r2(face ? 190 - 190 * s : 108 - 110 * s)}) scale(${s})`);
    c.appendChild(action(act, who, opts)); g.appendChild(c);
  });
  return g;
}
window.PICS = { person, key, group, fingers, dog, car, action, thing, together, place: placePic, going: goingPic, at: atPic, hand: handCard,
  things: Object.keys(THING).filter(k => !/^(book|apple|pen|shoe|flag|card|boy|girl)$/.test(k)) };
})();
