# Faultless French: handoff (10 Nov 2026)

For the next Claude session working with Jon Owen. (The copy in the dev bundle, `faultless-dev/HANDOFF.md`, is the
master: if the two differ, that one is right.) Read this first, then `dev/fieldtest/formats.md` (every teaching
rule), `dev/fieldtest/design_log.md` §9–11 (why), and `dev/fieldtest/learner_eval/README.md` (the learner loop).

## 1. What this is

**Faultless French** is a spoken-French course delivered as a phone web app, the first of a series ("Faultless").
It is a Direct Instruction programme modelled on DISE (Direct Instruction Spoken English, Engelmann). Jon is a NIFDI
trainer and DI consultant, the designer-owner and the first tester. He tests on Android 10 Chrome.

- **Live app:** https://jonaowen.github.io/faultless (repo `jonaowen/faultless`, branch `main`, GitHub Pages; PUBLIC).
- **Live version:** `2026-11-09.16`, Lessons 1–4. Versions .9 to .16 shipped on 9–10 Nov, one pull request each
  (branch `handoff-wip`, restarted from `main` after every merge).
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
- **The listening hill climb should always be running** (`dev/listener/rebuild_and_climb.sh`).
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

**Version .16** (10 Nov): the greeting redesign in Lesson 4 (three greeters, model learners greet in their own voices),
the name screen and the own-name check. Validation before release is the table in `dev/harness/replay/README.md`:
whole-lesson oracle, every real recording replayed through the real listening path, own-name recordings, the name
screen checks.

**Artificial learner:** version 2.3 (`dev/fieldtest/learner_private/`, `learner_calibration.md` §0.6).
- Against the eight real runs: score 0.290 (v2.1: 0.063, v2.2: 0.236), weighted recall 0.677, 15 real errors, 2
  missed. v2.3 added the carry-over of the last answer's form ("Salut." for "Salut, Marie."; a bare name after a
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
improvement" with scores above the champion's, look at the gate first. **A container restart kills it** (it happened on 10 Nov at 00:34, in the middle of round 123, the
first round after the repair). Start it again, detached, at the start of every session if `ps aux | grep hillclimb`
shows nothing: `cd dev/listener && (setsid nohup nice -n 10 ./rebuild_and_climb.sh >> rebuild.log 2>&1 < /dev/null &)`.
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

1. **Jon's next run file** (most likely Lesson 4 on .16): run the doctor on it with `--relisten`, then diagnose as in
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
