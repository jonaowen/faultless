# Faultless French: handoff (11 Nov 2026)

For the next Claude session working with Jon Owen. (The copy in the dev bundle, `faultless-dev/HANDOFF.md`, is the
master: if the two differ, that one is right.) Read this first, then `dev/fieldtest/formats.md` (every teaching
rule), `dev/fieldtest/design_log.md` §9–11 (why), and `dev/fieldtest/learner_eval/README.md` (the learner loop).

## 1. What this is

**Faultless French** is a spoken-French course delivered as a phone web app, the first of a series ("Faultless").
It is a Direct Instruction programme modelled on DISE (Direct Instruction Spoken English, Engelmann). Jon is a NIFDI
trainer and DI consultant, the designer-owner and the first tester. He tests on Android 10 Chrome.

- **Live app:** https://jonaowen.github.io/faultless (repo `jonaowen/faultless`, branch `main`, GitHub Pages; PUBLIC).
- **Live version:** `2026-11-10.22`: Lessons 1–10, built from `dev/fieldtest/course_dise5b` (the course of record).
  New since .21: Lessons 5–10 playable (`dev/appconv/convert.py` tables + `VOCAB`/`SLOT` in `index.html`); every new
  question or instruction FORMAT is first shown at least twice with another voice answering (cause C8 rewritten around
  frames, design log §15; evidence: the artificial learner v3, `fieldtest/reports/learner_v3_findings.md`), which
  changed L1 Ex1, L3 Ex3, L3 Ex10 and L4 Ex8; a female "you" figure (`sex: S.learnerGender`); a 160 Hz low-cut on the
  microphone; a spoken warning when the microphone is swamped (`LISTENER.swamp()`, `FAULT MICROPHONE SWAMPED`).
  Checks on the shipped files: oracle Lessons 1–10 2113 of 2113 (`dev/harness/replay/oracle10.js`; `oracle404.js`
  cannot hold ten lessons of trace), selfjudge 0 right answers refused and 0 wrong accepted, real recordings 323 of 348
  with the Lesson 4 word list (324 on .19) and 316 with the Lesson 10 word list (lost: "Une chaussure." x3, "Deux." x4,
  "Un." x1). **Known weak listening in Lessons 5–10** (synthetic English voices, a poor predictor): "Deux clés.",
  "Une voiture.", "Dix.", "Bon.", "Un homme.", "Pierre et Sylvie."; "tu vas X" for "je vais X" and "un V" for
  "on/elle V" are accepted as `FAULT PERSON UNSURE` and must be ruled from the recording. Next: Lessons 11–20 into the
  app (pictures exist), Jon's sessions on Lessons 3–10.
  One pull request per version (branch `handoff-wip`, restarted from `main` after every merge).
- **Dev bundle:** the private repo `jonaowen/faultless-dev` (branch `main`). It holds the course generator, the
  artificial learner, listener training, voice scripts, harnesses, real recordings and research. It is private because
  it contains DISE materials Jon owns. Nothing from it may go into the public repo except generated lesson files,
  clips and this handoff.

## 2. Jon's standing rules (keep all of them)

**Teaching design**
- **DI must be gapless and efficient.** Exercises are made of parts, each a small expansion of the last. No long
  chains of one task form (build.py flags 6+). Follow the rubric (`dev/rubric.txt`).
- **Formats come from DISE; content and sequence come from the analysis of spoken French.** Read the DISE Teacher's
  Guide for every design decision. Written words: only name tags and numerals.
- **Natural everyday spoken French only.** **Only the intended response is correct.**
- **The people are Marie (teacher), Pierre and Sylvie (model learners)**: the commonest French names of their kind
  (Jon, 9 Nov). The code's internal keys stay `claire`, `paul`, `julie`; `gen/names.py` renames on output.
- **The learner types their first name once, at the start** (Jon, 9 Nov; rule 1q; this replaces "the learner types no
  name"). The teacher never says it. The listener cannot recognise it. The app uses it only to tell a course person's
  name said in its place ("Je m'appelle Marie." from someone not called Marie).
- **Own-name answers are shown by a model learner first** (rule 1k, extended after the first naive tester's run): in Lessons 1–5 every
  own-name test comes straight after a model learner's "Je m'appelle Pierre."; from Lesson 6, the first of each
  exercise. The teacher's name never comes straight after an own-name test. The app's correction of an own-name answer
  is a model learner's sentence, never the teacher pointing at herself.
- **The form of the last answer carries over** (rule 1p): no own-name test straight after a bare-name answer.
- **Every part of an answer must do work** (rule 1r): a part that never varies gets dropped ("Salut." for "Salut,
  Marie."). Greetings come from three greeters; the model learners greet in their own voices (`cue_by`).
- **Every naming task is cued by a spoken question** (rule 1n): *C'est quoi ?* / *C'est qui ?*; never a silent point.
- **The gender track** (rule 1o): each noun's front word is practised alone ("Un ou une ?" on the picture) for two
  lessons before the noun is said whole; Lesson 1 has gender only. A noun is always introduced with its front word.
- **Counting:** the numbers are said one at a time, 0.5 s apart; counting tasks include a single object.

**App behaviour**
- **The mic is never on in leads.** No tapping.
- **The green border means "respond"**: the instant the cue ends, and listening starts at the same moment. No gap
  before a test. After "Avec moi" there is 0.5 s before speaking together. No spoken "Écoute". As little time between
  tasks as possible: "every millisecond counts".
- **Right answer:** the teacher smiles, plus a ding. Nothing else.
- **No pointing at pictures.** A gold border marks what the teacher means; a green ring marks a model learner who is
  speaking a cue.
- **Every play screen** (app opened, every lesson start) says: speak clearly and loudly; put the phone on a flat
  surface and do not touch it or its microphone.
- **The app plays exactly the script that was field-tested** (rule 1m). `appconv/convert.py` changes format only.

**Process**
- **Fix whole classes of faults**, not the instance.
- **Work it out from the run file alone.** Jon sends a run file, often with no comment. Find every confusion and its
  cause, split them into **app faults** and **programme design faults**, fix all of them, ship. Do not ask him what he
  said: listen to the recording in the run file ("too long ago for me to remember"). The goal he set: every slight
  confusion of every tester diagnosed and fixed with little or no input from him.
- **The artificial learner is a model to be trained** (Jon, 9 Nov). Input: the course sequence. Output: where errors
  happen. Ground truth: real testers' errors. Every run file is fed to it (`learner_eval/`), then the course is run
  through it again. Missing a real error is punished heavily, most of all Jon's (he knows French, so an error of his
  is a severe programme fault: weight 3); a predicted error nobody made costs little (0.1).
- **The listening hill climb should always be running** (`dev/listener/start_climb.sh`). It can only run while a
  session is active: see §4.
- **Never stop and wait for Jon on long tasks** unless he says to pause.
- **The ElevenLabs key was deleted;** never reuse it.

## 3. The app (`index.html`, one file)

- **Course:** `course/lessonN.js`, generated by `dev/appconv/convert.py` from `dev/fieldtest/course/L001-L020.json`.
  Each item: `{kind: model|lead|test, teacher, answer, scene, at, voice, expect, noEcho, hold, cueVoice?, cueAt?}`.
  `cueVoice` + `cueAt`: the cue is spoken by that pictured model learner (their recordings, a green ring round them).
- **Engine:** `genItem`, `runParts` (part-firming, delayed tests, seven-trial limit over the exercise, at most 4 part
  repeats), `presentGenModel`, `leadSteps`, `presentTest`, `askAndListen`, `correction`.
- **Voices (Piper):** teacher `fr_FR-siwis-medium` (`audio/teacher/`, with phone timings for lip sync); Pierre
  `fr_FR-tom-medium` and Sylvie `fr_FR-upmc-medium` (`audio/learner/`, Sylvie's prefixed `julie_`); narrator
  `en_GB-jenny_dioco`. Lips follow the audio clock.
- **Listening:** Vosk small French (WASM) with a closed word list built per task by `courseGrammar(expect)`:
  - the course's answers plus `[unk]`; sound pieces ("ju") only when they are the answer, and then without `[unk]`;
  - *je m'appelle* only when the answer has it; greetings only from the first exercise that teaches one (they cost
    "C'est Marie." accuracy in Lessons 1–3);
  - the end of an answer: loudness above 300 Hz, and the turn ends once the whole right answer has stood for 0.45 s;
  - the teacher's own echo and sound with no words are ignored;
  - every answer is recorded and exported in the run file.
- **Judging** (`judge`): exact on the gender word; "only the start of the answer" is its own verdict. Own-name tests
  (`expect: ["jemappelle","REST"]`) pass on *je m'appelle* + any name, EXCEPT a course person's name when the typed
  name is not like it (`ownMaybe`: same word, same first sound, within two letters, or a like ending all count as
  "could be their own"). Fail-safe: the same course name heard three times running as the learner's own is accepted
  from then on and the trace says `FAULT OWN NAME UNSURE`.
- **Name screen** (`#who`, `askWho()`): shown once before the first lesson; Reset asks again; the tester panel has a
  name field. Stored as `S.learnerName` (first name only; it is in the run file).
- **Self-checks** in the trace, summarised in `session.faults`: `AV FAULT`, `SIGNAL LATE`, `LISTENING FAULT`,
  `PROGRESS RESET`, `FAULT OWN NAME UNSURE`.
- **Self-update:** `version.json` must equal `APP_VERSION` in `index.html`; bump both on every release.
- **Microphone:** echo cancellation OFF (with it on, Android goes into call mode and the lips lag). NEVER record in
  parallel with Chrome's recogniser (the fallback listener).

## 4. Where things stand

**Runs of 9 Nov** (raw files with audio: `dev/real_audio/runs_20261109/`; rulings: `learner_eval/labels.json`)

| Run | Who, what | What it showed | Fixed in |
|---|---|---|---|
| 14:18 | Jon, L2 | "Libra" accepted for "livre" | judge |
| 14:21 | Jon | pauses: too short after "Avec moi", needless elsewhere | .10 |
| 15:07 | Jon, L2 | long waits after answers; no single object in counting; bare "Jon" after a bare-name answer | .11, course |
| 15:15, 15:35 | Jon, L3 | sound pieces ("ju", "u") misheard | .12, .13 |
| 16:04 | Jon, L3 | genuine un/une errors: the gender track; a tapped mic: the device advice | .14, .15 |
| 16:42 | A second tester (knows no French), L1 | turns closed before they spoke; called themselves "Claire"; the correction pointed at the teacher | .15 |
| 20:49 | Jon, L4 | "Salut." for "Salut, Claire."; bare "Jon" again | .16 |
| 10 Nov 08:22 | Jon, L4 on .16 | the teacher's name asked with her tag hidden: "Claire" (her old name), "Jon", "Sylvie"; "how many" never about one thing | .17 |
| 10 Nov 15:36 | Jon himself (he knows no French; he met the rebuilt lesson cold), L1 on .19 | **said the question back**: "un ou une" for "Un." / "Une.", five times running (L1 Ex 2); one of the five passed as "un [unk]" | .20, course (cause C8) |
| 10 Nov 16:06 | Jon, rest of L1 | 66 of 66 right (28 of them "Un ou une ?"); Exercise 2 had been jumped over, and the lesson could then never end | .20 |
| 10 Nov 16:36 | Jon, L2 on .19 | **"Lève-toi", said right, heard as "lève trois" 14 times in 16** and marked wrong (seven-trial limit reached); the stand-up box also showed sitting down; whole figures look barrel-chested | .20 (listener, animation, lesson), figures: artist |
| 10 Nov 21:11 | Jon, rest of L2 on .20 | 46 of 47 right; **"Trois." for two shoes** shown beside one pen (three things on the screen; the question does not say what to count) | .21, course (cause C10: `gen/countalone.py`) |
| 10 Nov 21:33 | Jon, start of L3 on .20 | no learner error: the phone lay on his chest and a low rumble (heartbeat, breathing; 99 % of the energy under 300 Hz, at full scale) drowned his voice; one "Lève-toi" came out as "trois" and was marked wrong | .22 (low-cut filter, spoken warning) |

**Version .16** (10 Nov): the greeting redesign in Lesson 4 (three greeters, model learners greet in their own voices),
the name screen and the own-name check.

**Version .17** (10 Nov): course changes only, from the 08:22 run (`fieldtest/design_log.md` §12):
- **Rule 1s:** the teacher always wears her name tag (it was hidden on purpose in review frames; 1114 tasks).
- **Rule 1t:** "Il y en a combien ?" is asked about ONE thing from Lesson 1, of a finger or a masculine thing only
  ("Un."). "Une." for one feminine thing stays out until Lesson 21: on the artificial learner it made the answer
  depend on the kind of thing. Four variants were built and compared before this one was chosen (`gen/one.py`,
  switches `FF_ONE`, `FF_OUT`). **Do that for every change to a format.**
- `gen/looks.py`: people's looks now fit the person (no beard on a girl, no dress on Pierre).

Validation before a release is the table in `dev/harness/replay/README.md`: whole-lesson oracle, every real recording
replayed through the real listening path, own-name recordings, the name screen checks. A release that changes only
lesson files needs the oracle; one that touches listening needs the replays too.

**Artificial learner:** version 2.3 (`dev/fieldtest/learner_private/`, `learner_calibration.md` §0.6).
- Against the first eight real runs: score 0.290 (v2.1: 0.063, v2.2: 0.236), weighted recall 0.677, 15 real errors, 2
  missed. With the ninth run (10 Nov 08:22, held out): 0.163; it did not predict the hidden-tag error. v2.3 added the carry-over of the last answer's form ("Salut." for "Salut, Marie."; a bare name after a
  bare-name answer). Most of its gain is that one "Salut." answer: see "How far to trust the gain" in
  `learner_eval/README.md`, which also has the two misses left on purpose and the list for v2.4.
- Hesitations (`learner_eval/hes.py`, reported only): the learner ranks Jon's 39 late starts above his fluent answers
  only weakly (AUC 0.65) and is blind to the commonest cause, a change of question.
- On the course (L1–4, 8 learners, first-time correct): old course 67/64/67/57 %; now 74/79/78/68 %. Its greeting
  predictions are not yet checked against people: check them on the first real run of the new Lesson 4.
- Run: `cd dev/fieldtest && LEARNER_PROCS=2 python3 bin/learn.py --course course/L001-L020.json --upto L4 --runs 8 --seed 1 --out <report.json>`
- **Isolation rule:** the learner is maintained by a separate agent that never reads `gen/`, `design_log.md`,
  `formats.md`, course notes, `docs/` or `design/`. Brief it with `learner_eval/README.md`.

**Course:** `cd dev/fieldtest/gen && python3 build.py` writes `course/L001-L020` and `L021-L040` (.json and .md):
9619 tasks, 656 exercises. Known findings: Lesson 3 has 3 new-material exercises (limit 2); Lessons 28 and 29 have 11
tracks. Lessons 5–40 are built but not converted for the app or field-tested with people.

**Hill climb** (Whisper listener, not the shipping listener). **It produced nothing from 9 Nov 15:56 to 10 Nov 00:10.**
Cause: model weights are not in git, so in a fresh container `hc/champion_r026/` exists but holds no
`model.safetensors`; the code checked only that the folder was there. Every round that started from the champion
failed in 4 s and every other round crashed when the champion was re-scored (rounds 27–122 are all failures; the
champion's weights are lost). Fixed in `hillclimb.py` (10 Nov): it checks for the weights file, restarts from
`ft2/ck200` or `base600`, and after three failed rounds running writes `hc/BROKEN` and `HILL CLIMB BROKEN` in
`hc/events.log`. **Check `hc/BROKEN` and the last lines of `hc_run.log` at the start of every session.** It still
trains on the old names (Claire, Paul, Julie). The shipping listener is Vosk; its "hill climb" is the replay harness on
real recordings. **It could not climb even after that repair** (found 10 Nov 03:45): a candidate had to judge every
regression clip right to become champion, the base model it restarted from fails that gate itself, and round 123's
checkpoints (0.41 against 0.10) were all refused. Now a candidate must be no worse than the champion on the
regression clips to climb; shipping still needs all of them right. If `hc/events.log` shows round after round of "no
improvement" with scores above the champion's, look at the gate first. Confirmed working: round 124 (10 Nov 04:08)
made `hc/champion_r124`, score 0.47, and round 125 `hc/champion_r125`, score 0.81 with every regression clip right
(the lost champion had 0.81 after 26 rounds).

**The champion is now kept outside the container** (`dev/listener/champion_store.py`; Jon, 10 Nov: yes). The weights
in half precision (71 MB), the small files and `hc/state.json` are one commit on the branch **`hc-weights`** of this
repository; every save replaces the commit before, so the branch never grows and a clone of `main` never downloads
it. `hillclimb.py` saves on every new champion and pushes at most once every 3 hours; `rebuild_and_climb.sh` and
`hillclimb.py` restore it when the champion's weights are not on disk (a new container). Checked: a model restored
from the branch and transcribed afresh scored 0.4723, the same as the original. **Before ending a session:**
`cd dev/listener && python3 -I champion_store.py save && python3 -I champion_store.py push`.

**The container is stopped a few minutes after the session goes idle** (seen 10 Nov 00:34 and 04:26; processes die,
files stay). So the climb runs only while a session is active. What limits the loss:
- a round that was cut off is scored when the climb next starts (`cut_off_round` in `hillclimb.py`): that is how
  round 125's checkpoint, already at 0.81 when the container stopped, became champion four hours later;
- `dev/listener/start_climb.sh` starts the loop if it is not running. In the container of 10 Nov a SessionStart hook
  runs it (`/home/user/.claude/settings.json`, which is in no repository; not yet seen to fire). In a new container
  run `start_climb.sh` by hand and set the hook up again.

Stop it (`kill -STOP`) while `replay.js` or `ownpath.js` run, and continue it (`kill -CONT`) after.

**Run doctor** (`dev/qa/run_doctor.py`, extended 10 Nov): `python3 -I run_doctor.py <run.json> [--md out.md]
[--relisten PORT] [--relisten-all]`. From the run file alone it lists every error with its class, what came before
it and the class of fix, and every **hesitation** (speech began late: 1.8 times the tester's own median or 1 s,
whichever is more), with what changed at that task (new question, longer answer, delayed test) and a table of the
questions the tester is slow on as a rule. Classes added: PART OF THE ANSWER LEFT OUT (with whether the part had ever
varied, whether the answers before were shorter, and whether the turn was cut off) and ANSWER FORM CARRIED OVER (a
bare name after a bare-name answer). `--relisten` plays the recordings to Vosk again (free, and with only the run's
words) and marks a VERDICT IN DOUBT: this replaces asking Jon what he said. Reports: `dev/qa/doctor_*.md`.

## 5. Next steps

0000. **RUN OF 10 NOV 15:36 (first real learner on the rebuilt Lesson 1): the question said back.** Diagnosis and fix in
   `dev/fieldtest/design_log.md` §14. In short: "Un ou une ?" was the first either/or question of the course, met
   together with new content, modelled by one voice, never answered by the learner before its test, after 27 turns of
   saying the teacher's words back. Course: `gen/firstformats.py` (the format first on the three names, models in
   Pierre's and Sylvie's voices, leads that carry the question) and cause **C8** in `gen/causes.py`, also a build
   check: no question format is first tested without a model in another voice. App .20: the narrated explanation of
   questions plays (it had been dead since the lessons were generated); `repeatedCue` (the question is in the
   listener's list for that turn; an answer with all its words is "repeated the question", never right; the narrator
   says "Don't say the question again. Say only the answer."); `main()` runs every unfinished exercise. Tools:
   `harness/replay/cuecheck.js` (the five recordings), `repeatq.js` (a simulated learner who says the question back),
   `stuck.js` (a run file's saved place), `qa/run_doctor.py` class REPEATED THE QUESTION. Voices: Sylvie's cannot say
   "Trois." or "Non." (`dev/voice/retake_learner.py`); the generator gives those lines to Pierre.

000. **THE FIRST 20-LESSON BLOCK (Jon, 10 Nov, after .19's plan): "Usually DI programmes are field tested in 20-lesson
   blocks. So build the first 20 lessons, then I'll work through them, providing feedback after each session."** He
   does one lesson a day (spacing). Shipped in stages: .19 = Lessons 1–4; then 5–10, 11–15, 16–20.
   - Plan, exercise by exercise against DISE for Lessons 5–10, and the content of 11–20:
     `dev/docs/Lessons 5-20, the first field-test block.md`. Content and order from the skill map
     (`dev/analysis/skillmap/items.py`); rate and exercise counts from DISE (5–10: 15, 17, 17, 19, 17, 16).
   - My exercise record of DISE stops at Lesson 10. **Jon, 10 Nov: "I don't have the Lesson 11–20 scripts, use the
     Teacher's Guide"**: Lessons 11–20 are laid out on the Teacher's Guide tracks at 17 exercises each.
   - **The times (decided 10 Nov).** Jon first ruled "Keep the past at Lesson 9", then, after the check against the error
     reference showed the cost: "ignore my ruling because I don't know French. Do what's best in light of this new
     information". Decision: now (L4) → going to (*je vais danser*, L9–10) → did (*il a dansé* L14, *j'ai dansé* L15);
     avoir at L12; **no "was doing" past of action verbs in this block** (*je dansais* is one weak vowel from *j'ai dansé*
     and from the learner error *je dansé*); *c'était* (L10) and *il y avait* (L17) stay as states. Reasons in the plan,
     rule 6. The skill map (`dev/analysis/skillmap/items.py` and the published page) still shows the old placement and
     must be brought into line.
   - Generator for 5–10: `gen/v5_05_10.py` (written by a helper from the plan; check `reports/v5_05_10_needs.md` for
     what the app must support). Then: `appconv/convert.py`, pictures (`people.js`), recordings (`dev/voice`), the
     word list, and the tests of §4, as for .19.
   - Also in .19: the introduction's narrator is Piper `en_GB-cori-medium` (Jon: the first one was Irish; "a neutral,
     standard English voice"); `dev/voice/make_narrator.py` re-records every line and keeps only takes Whisper hears
     word for word. "Avec moi" is demonstrated twice, not three times (Jon). **Which lesson** (Jon: learners do one
     lesson a day and must know when the day's lesson is done): `lessonHead()` puts "Lesson N" on every start screen,
     "Lesson N finished. That is today's lesson done. Come back tomorrow for Lesson N+1." when the lesson was finished
     today (`S.doneDay`; the button stays, smaller and grey), and a small "Lesson N" in the corner while the lesson
     runs. Saved state version 12 (places in the .18 lessons are reset; the introduction plays again).
00. **REBUILD OF LESSONS 1–4 (Jon, 10 Nov, after seeing .18's plan; this comes before everything below).** His rulings:
   Lessons 1–4 are fixed first; a Faultless lesson matches the DISE lesson of the same number in content and in number
   of exercises (9, 11, 14, 16), whatever the length; practice is spaced over the following lessons, not bulked in one
   sitting; **actions are in** (the app assumes the learner does them: a "You:" box with an animation the first several
   times, a fair time, then on); the rules about where a learner errs come from the causes of REAL errors, not from the
   simulated learner. Plan and French choices: `dev/docs/Lessons 1-4 rebuilt from DISE, exercise for exercise.md`.
   - Generator: `gen/v5_dise.py` (`FF_RATE=dise5 FF_OUT=../course_dise5 python3 build.py`): 50 exercises, 853 tasks, no
     findings. New task kinds `show` (the teacher does the action) and `do` (the learner does it). Actions: Danse, Saute,
     Souris, Lève-toi, Assieds-toi, Marche. "I am a student / you are a teacher" is Je m'appelle … / Tu t'appelles Marie
     (cue "Et moi ?"; Pierre and Sylvie ask it too, so the name varies).
   - `gen/causes.py <course.json> [n]`: where the cause of each real error recurs (C1 front word before noun, C2 answer
     about oneself shown only by the teacher, C3 form carry-over, C4 a part that never varies, C6 answer not on screen,
     C7 taught then not asked). `gen/spacing.py`: share of each item's practice in its first lesson and after.
   - **Shipped as .19** from `/home/user/faultless20` (copies: `dev/appwork/index.19.html`, `people.19.js`): converter and
     `index.html` handle show/do (`presentAct`, `actBox`), the new words, `PICS.action` (animated figures,
     `people.js`). Tests on the exact files: whole-lesson run 449/449, no faults; `selfjudge.js` 449 own answers
     accepted, 0 of 11,924 other answers accepted (27 je/tu answers accepted and flagged); replay of 348 real
     recordings, no verdict changed. **Not checked by a person:** the new recordings and the narrator; the new words
     have never been said to the app by a real voice. **je / tu are not judged** (`FAULT PERSON UNSURE` in the trace:
     the listener cannot tell them apart on synthetic voices; remove the rule when real recordings show it can).
   - .18 was the interim (old exercises re-packed four to a lesson; no actions).
0. **The re-sequence at DISE's rate (Jon, 10 Nov; rule 1u in `fieldtest/formats.md`, `design_log.md` §13).** Jon: our
   Lessons 1–4 taught a small fraction of what DISE's teach; the rate of introduction must match DISE's. Cause: two
   new-material exercises a lesson from Lesson 1, then each lesson filled to DISE's exercise count with reviews.
   - `gen/v4_rate.py` (`cd dev/fieldtest/gen && FF_RATE=dise FF_OUT=../course_rate python3 build.py`) builds Lessons
     1–10 at DISE's rate from the compact lessons of the flat course (flat 1–36): 2,924 tasks, no check findings.
     `course/` still holds the flat course (`FF_RATE=flat`, the default of `build.py`), kept for comparison.
   - **App .18 plays new Lessons 1–4** (`appconv/convert.py ../fieldtest/course_rate/L001-L020.json L<n> ...`).
     New in the app: `people.js` (window.PICS: people eating, drinking, sleeping, walking, with looks; keys; dogs;
     cars; fingers and groups to ten), the words il/elle + mange/dort/boit, c'est, cinq to sept, oui, non, ça va, clé;
     a question with the same words as a statement has its own recording (`<key>_q`); the word list is gated from
     Lesson 3 (a phrase enters when its exercise is reached); saved state version 11 (old places are reset).
   - Listening for the new words was tuned on synthetic voices only (`harness/replay/mk510.py`, `test510.js`): no real
     person has yet said "il mange" to the app. The first real run of new Lessons 3–4 is the test; run the doctor
     with `--relisten` on it before anything else.
   - **To do, Lessons 5–10 in the app:** about 55 new answers (c'est pas …, tu/je + verb, … pas, huit to dix, chien,
     homme/femme, c'est bon, oui ça va et toi …) in `convert.py` EXPECT and `index.html` VOCAB/judge; pictures not yet
     drawn: speech bubbles, the teacher eating/drinking/walking and turned to a model learner, an eater smiling or
     pulling a face (cake, milk), things "on the table"; rows of 8–10 frames; clips (`dev/voice/clipcheck.py <app> 5 10`
     lists them). The picture helper's proposal for the hooks is in this session's notes (design_log §13).
   - **Nouns:** DISE has 26 by Lesson 10, this sequence 14. Add from the content analysis, each with a picture, a
     listening check and clips.
   - When Lessons 5–10 play in the app: make `dise` the default of `gen/rate.py`, move the flat course out of
     `course/`, and re-run the artificial learner over all ten.
1. **Jon's next run file** (most likely Lesson 4 on .17): run the doctor on it with `--relisten`, then diagnose as in
   §2. Check first: did the greeting tests go
   right first time, was any right answer refused (English voices saying "Pierre" were the weakest in synthetic tests),
   is there any `FAULT OWN NAME UNSURE`.
2. **Learner v2.4:** the list at the end of "Where it stands" in `learner_eval/README.md`.
3. **Hesitations as ground truth for the learner:** the run doctor now measures them; `learner_eval` scores errors
   only. A slow start on a right answer is a near-miss the learner should also predict (lower weight than an error).
4. **Lessons 5+** into the app: convert, record clips, oracle, ship. Rule 1k loosens at Lesson 6 (a model learner only
   before the first own-name test of each exercise): watch the first real runs there.
5. **Naive testers:** one so far (the 16:42 run); that run showed more than all of Jon's.

## 6. Open with Jon

- *Est-ce que* or rising intonation for yes/no questions (recommended: rising intonation).
- Old clips for Claire/Paul/Julie are still in `audio/` (unused; harmless).
- Hill climb: it stops when the session goes idle. Keeping a session awake for it is possible (a tracked background
  task keeps the container up for 2 hours at most, then one model turn is needed to start the next) but costs
  usage every 2 hours, day and night. Not done. Jon to decide: accept "runs during sessions", pay for keep-alive,
  or move the climb to a machine that stays on.
- The branch `learner-v23-wip` in `faultless-dev` is a superseded backup (the session could not delete it).

## 7. Bundle contents (`dev/`)

| Folder or file | What it is |
|---|---|
| `fieldtest/gen/` | The course generator: `build.py` (and its checks), lesson files, `names.py`, `selfmodels.py` (rule 1k), `greet.py` (greeters), `gender.py` (rule 1o) |
| `fieldtest/` | Course JSON and MD, `interface/course_schema.md`, `formats.md`, `design_log.md`, `learner_calibration.md`, `learner_private/`, `bin/learn.py` |
| `fieldtest/learner_eval/` | The learner scored against real testers: `ingest.py`, `labels.json`, `truth.py`, `score.py`, `courses/` (the course each app version played) |
| `appconv/convert.py` | `python3 convert.py ../fieldtest/course/L001-L020.json L4 <repo>/course/lesson4.js` |
| `voice/` | `make_teacher.py`, `compose_repete.py`, `make_narrator.py` (Piper; voices are not in git) |
| `harness/replay/` | Release checks on real recordings and synthetic voices; see its README |
| `harness/` | Older Playwright tests, listening checks, screenshot scripts |
| `qa/` | `run_doctor.py` (reads a run file and lists faults), `heard_regression.js` |
| `real_audio/` | Testers' run files with audio |
| `listener/` | Whisper hill climb |
| `design/`, `docs/` | Research and the two design documents |
