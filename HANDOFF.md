# Faultless French: handoff (12 Nov 2026)

For the next Claude session working with Jon Owen. (The copy in the dev bundle, `faultless-dev/HANDOFF.md`, is the
master: if the two differ, that one is right.) Read this first, then `dev/fieldtest/formats.md` (every teaching
rule), `dev/fieldtest/design_log.md` §9–11 (why), and `dev/fieldtest/learner_eval/README.md` (the learner loop).

## 0. Start here (12 Nov 2026, 13:00 UTC — the previous session ended to connect Google Drive)

**Where things stand**
- **Live:** `2026-11-14.46` (https://jonaowen.github.io/faultless). Lessons 1–10 have DISE boards and Jon's latest fixes; every error is said ("Non, écoute."), never shown; the gold border is seen to move with each model. Read "Live version" in §1 for each version's contents and checks.
- **Course of record:** `dev/fieldtest/course_dise6` (Lessons 1–20; 1–10 revised; build with
  `cd dev/fieldtest/gen && FF_RATE=dise6 FF_OUT=../course_dise6 python3 build.py`; 0 findings; the rule that the older builds dise5, dise5c, dise and flat must stay
  byte-identical was dropped by Jon on 13 Nov 2026: they are superseded and need not be rebuilt or kept in step). Design log §17–§48 has every ruling and change since 11 Nov.
- **.28 shipped 12 Nov ~13:55** (state notes in `dev/appwork/wip28/STATUS.md`); was in progress: Lessons 3–5 with boards, plus
  the fixes from Jon's runs of 12 Nov 11:40 and 11:50 (§4 table): halve the figure animation; play the counting
  narration before the first "À toi." of the course (models included); L1E7 f three men must be drawn doing their
  three actions; the model learner's figure acted off screen after Pierre's tap; the board stayed into the next
  exercise; "un" still has a slight /v/ (all clips with "un", inside phrases too); Pierre's "m'appelle" has a final
  schwa. Rebuild the working copy from live (`/home/user/faultless` = public repo checkout) plus `wip28`.
- **First mastery test** designed: gate after Lesson 13 (exercise L13E18), threshold and reasons in
  `dev/docs/Mastery tests.md` and design log §38. The app does not play a mastery test yet; the artificial learner
  has not been run on it. **Jon is providing DISE's test forms on Google Drive** (that is why this session ended):
  read them first and check the gate, the threshold and the test items against DISE's real tests.

**Next steps, in order**
1. Read the DISE test forms from Drive into `dev/source/dise_tests/` (private; never into the public repo) and check
   the first mastery test against them; report to Jon.
2. Shipped through .32 (Lessons 6–10 with boards); was .30 =
   Lessons 6–10 with boards (silent count as `say`; des/deux picture test). Ship lesson batches as soon as they pass
   (Jon, 12 Nov: never hold a release; human testing comes first).
3. App support for the mastery test before any tester reaches Lesson 13.
4. Then: Lessons 11–20 revision under all the rulings (DISE pages for L20 and L30 are in `dev/source/`; design log
   notes at its end), and the next gate.

**How the previous session worked** (keep it): one coordinating session; course work by a generator agent, app work
by an app agent, the artificial learner by its own agent; each lesson batch shipped by PR → merge → check
`version.json` on Pages → restart `handoff-wip` from `main`. Every run Jon sends: save it under
`dev/real_audio/runs_<date>/`, run `dev/qa/run_doctor.py`, rule the errors from the recordings (Whisper), add a row
to the §4 table, fix. A `QUIET` flag file in the scratchpad pauses heavy jobs during timing-sensitive checks; never
leave it up for long. The public HANDOFF is this file with tester names removed.

## 0. RESUME HERE (13 Nov 2026, ~21:00)

Live app: `2026-11-14.46` (checks in §1). The dev repository's `main` has this session's work up to 20:50 (pull request 1,
merged); what came after is on the branch `claude/nice-euler-5hhtcv` (pull request 2). Jon's rulings of 13 Nov are in §2:
the whole programme designed backwards from its terminal skills on a complete DISE analysis; the artificial learner
paused and a run log in its place; the hill climb stopped; Claude may merge; a lighter release routine; the
byte-identity rule dropped.

**1. DISE analysis (design: `dev/source/dise_full/analysis/ANNOTATE.md`, `REAUDIT_hand_annotations.md`, `REVISE.md`).**
- All 48 chunks of hand annotation are written and merged into the ten workbooks (`tools/apply_annotations.py`: 65,443
  cells). Re-audit of 460 cells: task cells 96.7 % at grade 2 (bar met), part cells 90 % (not met); older hand labels and
  early terse texts were the weak areas.
- The revision (`REVISE.md`; sets in `annotations/cells/ZR-*.tsv`; check with `tools/annotation_revision.py`): DONE and
  verified: ZR-AC1 to ZR-AC5 (all of actions) and ZR-VO1. Running when this was written: ZR-ID1, ZR-TE1, ZR-SP1, ZR-LO1,
  ZR-PR1, ZR-MI1 with ZR-VO2, ZR-L21 with ZR-LS1. A set is finished only when the tool prints DONE; a stopped agent is
  resumed with a message, its file kept. Reviewing one chunk's part cells claim by claim (VO-07) found 22 % with a small
  false "new" or "first": more than the re-audit's sample showed.
- When every set is DONE: `python3 -I tools/apply_annotations.py` (the ZR files are applied last), then a second re-audit
  with `tools/reaudit_sample.py` under a new seed, sampling the revised cells as their own strata (older hand task cells,
  older hand part cells, rewritten terse texts, reviewed part cells), bar 95 % at grade 2. Method: `reaudit/README.md`;
  five auditors, two workbooks each; tally from the graded files yourself.
- How to run agents on this: one per chunk or set, about 8 at a time; they never run git (the coordinator commits);
  verify every "done" with the coverage tool before treating it as done.
- Known faults in the workbooks themselves, not fixed by any merge: `REAUDIT_hand_annotations.md`, last section but one.

**2. Next after the analysis (Jon's order, §2): the terminal skills of the programme, and the curriculum designed
backwards from them.** Not started. Inputs: the ten workbooks, `analysis/formats/*.md`, `analysis/tg/*.md`,
`workbooks/DISE_programme.xlsx`, the Teacher's Guides.

**3. Course.** Lessons 1–10 are revised in `dev/fieldtest/course_next` (design log §54–§57): every exercise under a
minute by `gen/extime.py`, two new things at a time, no lesson over DISE's response count; the build has 4 findings.
`.43` holds only §54 (Lesson 1 Exercise 1, word pieces) and was converted from `course_dise6`.
- **.44 (live) is Lessons 2–5 from `course_next`.** Still to ship from `course_next`: Lessons 6–10 (no recordings needed:
  `reports/v45_needs.md`, `v46_needs.md`). `course_dise6` is now behind the app for Lessons 2–5.
- **In hand after Jon's run of 13 Nov 21:17 and his two messages (`dev/qa/notes_jon_2117.md`):** (a) app only: an error is
  said ("Non, écoute." pause, the answer, pause, "Vas-y.") and no icon marks a correction step; (b) the gold border during
  Marie's runs of models, and Sylvie's and Pierre's recordings (an agent was investigating on a copy of .43); (c) course,
  built into `dev/fieldtest/course_fix`: slow pass first in every gender introduction, a person asked about is a card of
  the row, a model student gives each new answer to a question first, "M'appelle." to Pierre (design log §58 when
  written).
- For Jon to rule (each is in the design log section named): what counts as "a new thing" and Lesson 1's exercises that
  have three or four (§55); "il, elle" taught on danse / saute and not mange (§55); whether the form after vais / vas is
  one new thing (§57; going-to is four short exercises without that); 19 to 25 exercises a lesson against DISE's 15 to
  19 (§55–§57); review words no longer said in Lessons 8–10 (garçon, fille, chien, moi, toi, "Bois.") (§57); the
  either/or question placed with "Un ou une ?" in L1E2 (§54).
- Measured in .43's quiet run: L1E1 58 s, but L1E2 67.8 s and L1E3 64.7 s with their first-time narration.

**4. Run log (`dev/runlog/`, its README).** Being built from the 27 run files in `dev/real_audio/` when this was written: check its counts
against the raw files before relying on it. Every run file Jon sends goes into it first (§2).

**5. This environment.** The cloud environment "faultless" allows Hugging Face, the CPU torch download and the Pages
site. A new container needs: `pip install piper-tts==1.8.0 faster-whisper vosk onnx scipy` and the Piper voices in
`dev/vosk/voices` (list and download loop in `dev/README.md` §1). torch is no longer needed (hill climb stopped).

**Timing runs:** pause any learner run or calibration (`learn.py`, `calibrate.py`: kill -STOP / -CONT by PID) and don't
run agents' heavy scripts at the same time; the 8 AV faults in .42's error run came from four calibrate.py processes.
`dev/harness/replay/quietrun.sh` (.43) does this for one run and undoes it however the run ends. The hill climb no longer
runs (§2).

## 1. What this is

**Faultless French** is a spoken-French course delivered as a phone web app, the first of a series ("Faultless").
It is a Direct Instruction programme modelled on DISE (Direct Instruction Spoken English, Engelmann). Jon is a NIFDI
trainer and DI consultant, the designer-owner and the first tester. He tests on Android 10 Chrome.

- **Live app:** https://jonaowen.github.io/faultless (repo `jonaowen/faultless`, branch `main`, GitHub Pages; PUBLIC).
- **Live version:** `2026-11-14.46`: the gold border is seen to move with each model (Jon's run of 13 Nov 21:17, item 3: "a book is highlighted and she says un and une"; `dev/qa/notes_jon_2117.md`). App only: no lesson, clip or course change. The list pace (0.5 s) now holds from the end of every model: between the last model of one part and the first of the next, and before a test about another picture or place, with the border off in between (on .45, L1E6 put "Une." on a shoe and then "Un." on a book drawn in the same place 0.17 s apart, and "Un." on a book and then "Répète : une." on a shoe 0.22 s apart, the border never going off). A border that comes back to a place with a different picture in it blinks off for 0.25 s first. A model's `pause_after_ms` (course_fix, design log §58) is honoured; no lesson has one yet. A retest cued by "Vas-y." is not delayed: .45's correction frame is unchanged. Checks (lighter routine, machine quiet, final files): L1E6 a–c and L1E8 a–b measured frame by frame and looked at in frame sheets: every model on its own card, 613–759 ms between words with the border off each time, where .45 had 166, 219 and 167 ms with the border on throughout; Lesson 1 scripted run 103 right, 0 faults, 8.3 min (.45: 8.1; the added pauses); Lessons 1 and 2 with an error every 7th answer, 0 faults, the same 73 corrections, steps 3 and 5 and delayed tests as .45; the correction pauses 489–505 ms before and after the model but one (521 ms, while a measurement ran beside it); the green border and microphone at most 7 ms after "Vas-y." ends; no symbol shown; the class check of every model and junction in Lessons 1–10 met every criterion but one paint stall at an exercise change (L1E4-a1, not this change); gate Lessons 1–10 passed (499 clips, 0 fail); no missing clip in Lessons 1–10; load check clean. Not checked: on a phone or by anyone watching; Lessons 3–10 not run whole (no lesson file changed). Notes: `dev/appwork/v46/RELEASE.md`, `dev/appwork/v46/STATUS.md`. Earlier: `2026-11-13.45`: every error is said, never shown (Jon, 13 Nov evening; `dev/qa/notes_jon_2117.md`). On every error Marie says "Non, écoute." (new recording, her hand at her ear), half a second, the model, half a second, "Vas-y.", and the learner's turn opens as "Vas-y." ends (the question is not asked again). The model is the task's own: the answer said; for "Répète : X." the words "X."; for a tap her hand taps the right picture while she says the cue; for a sound pair the pair slowly; for the learner's own name their own earlier answer or the lit name tag. At the seven-trial limit: "Non, écoute.", the same model, and on. No symbol at any step of the correction procedure (the circular arrow at steps 3 and 5 and the bookmark before a delayed test are deleted from the page), and no smile after a right answer that follows a correction. Right answers otherwise unchanged; a silence (first time), an echo and a listening fault are handled as before. Checks (lighter routine, machine quiet, final files): Lesson 1 scripted run 103 right, 0 faults, 8.1 min; Lessons 1 and 2 with an error every 7th answer, 0 faults, 73 corrections (spoken answer, Répète, tap, own name), pauses measured on the audio clock 480–503 ms before the model and 442–504 ms after (all but two 487–505); the green border and microphone 0–3 ms after "Vas-y." ends; no symbol shown; the seven-trial limit, a sound pair and a model learner's cue run once each; Whisper hears the new clip word for word 24 of 24; gate Lessons 1–10 passed (499 clips, 0 fail); no missing clip in Lessons 1–10; load check clean. Not checked: nobody has listened to "Non, écoute."; the own-recording correction (scripted runs record nothing). Notes: `dev/appwork/v45_STATUS.md`. Earlier: `2026-11-13.44`: Lessons 2–5 from the revised course (design log §55): every exercise under a minute, two new things at a time; introductions of four new things are split into pairs, so Lesson 3 has 15 exercises, Lesson 4 has 17 and Lesson 5 has 19. Lesson 2's boards are put right (since .39 "Quatre" had carried the un / une board, "Un ou une ?" the assieds-toi board, and "Assieds-toi" none). A state saved before .44 is carried over to the renumbered exercises of Lessons 3–5 (tested on made-up states only). Six recordings in Lesson 5: Marie's "Il danse, elle danse." and "Il saute, elle saute." at the usual rate and slowly, her line of three, and Sylvie's count to seven (Marie's two count lines of the needs note were not recorded: she counts number by number). Checks, lighter routine (Jon, 13 Nov), on the final files with the machine quiet: scripted runs of Lessons 2, 3, 4, 5: 120, 155, 218, 280 right, 0 faults, 7.4, 10.2, 12.7, 16.5 min; Lesson 2 with an error every 7th answer, 0 faults; no exercise over 60 s except with its one-off narration (the longest 77 s, L5E3; without narration the longest is 58.4 s); gate Lessons 2–5 passed (226 clips); no missing clip in Lessons 1–10; Lesson 1 byte-identical to .43; load check clean. Not checked: nobody has listened to the new recordings; Lessons 6–10 were not run (their files are .43's and name no Lesson 2–5 exercise). Notes: `dev/appwork/v44_STATUS.md`. Earlier: `2026-11-13.43`: Lesson 1 Exercise 1 back under a minute, and word pieces by rule (design log §54). L1E1 loses Marie's second "Je m'appelle." model and the second "Et toi ?" round; "Pierre ou Sylvie ?" opens Exercise 2 (the order of tasks is the same). No pause inside a word or where French joins two words (Lessons 3, 8, 10): "Chaussure.", "Banane.", café and table whole; "de deux à cinq" built from the right. Recordings: Banane., Deux à cinq. (joined: deux‿à), Répète : deux à cinq.; Chaussure. recorded again (the old take was heard as "choussière"). A saved delayed test keeps what each task asks, so a lesson file made again cannot make it ask for another task. The narrator's board lines play when a board is first on the screen (since .37 they had played before "Répète : Marie.", with nothing written). Checks, on the final files with the machine quiet: Lesson 1 scripted run 103 right, 42 taps, 0 faults, 8.1 min, L1E1 58 s (L1E2 67.8 s and L1E3 64.7 s with first-time narration); with an error every 7th answer, 0 faults; Lessons 3, 8, 10: 156, 418, 434 right, 0 faults, no missing clip; gate Lessons 1–10 passed (505 clips); Lessons 2, 4–7, 9 byte-identical to .42; smoke clean. Not checked: nobody has listened to the new recordings; the own-recording model in L1E5 (scripted runs record nothing). Notes: `dev/appwork/v43_STATUS.md`. Earlier: `2026-11-13.42`: two new things at a time in Lesson 1's gender track (Jon, 13 Nov; design log §53): Exercise 2 teaches a pen and an apple only, two cards in every picture (blocks of three, then slowly side by side, each word on its own thing; Marie's 'Un, une.' on one book is gone); Exercise 6 the book and the shoe, then the four mixed; Exercise 8's naming parts show only the two things named. New recordings un_slow, une_slow. Checks: Lesson 1 scripted run 104 right, 0 faults, 8.3 min; with an error every 7th answer, 0 faults of the app's logic and 8 frame delays (0.14-0.39 s) from machine load (four calibration processes ran; the same code ran clean before); smoke clean. Earlier: `2026-11-13.41`: the learner's male figure has a short men's cut (Jon, 13 Nov: "the male figure doesn't really look like a male. The hair goes down to the bottom of the neck"); the word times of the 44 new model-learner recordings. Smoke clean. Earlier: `2026-11-13.40`: a naive tester's run of 13 Nov 15:24 and the owner's notes on it (design log §51–§52). The green border comes on for tap turns too. The smile plays at half speed and is shown twice as long. Every animation starts at its first frame (the page's one SVG clock had them start part-way through). Models in a row go at the counting pace (500 ms). In Lessons 1–5 a model student (Pierre or Sylvie) gives each new answer before the learner is first asked for it: 76 models, 44 new recordings. Lesson 1: no word pieces of Pierre, no pause inside souris, no spoken 'Un ou une ?' in the hearing-only tap parts, and Marie's 'Je m'appelle Marie.' before any 'Et toi ?' that would come cold. Checks (training paused): release gate Lessons 1–10 passed after one take of Sylvie's 'C'est pas une clé.' was re-recorded; Lesson 1 scripted run 98 right, 42 taps, 0 faults, 8.0 min; with an error every 7th answer, 0 faults; smoke clean. Earlier: `2026-11-13.39`: the counting exercise (L1E4) under a minute (design log §49): 92 → 49 s in the quiet run. The one-off question narration plays only before the learner's first question (it had drifted to L1E4, after six questions answered), and the narrator's second count line is dropped (Pierre shows the turn first). Sylvie's count of two goes. "Quatre" is its own exercise in Lesson 2 (L2E9, 23 s), as "cinq" is in Lesson 3. The delayed tests of four before it ask about two instead; the inventory records the reason (kind F). Checks: clips Lessons 1–3, 0 missing; quiet scripted run Lessons 1–3: 385 right, 112 taps, 0 faults; Lesson 1 in 6.4 min, Lesson 2 5.9, Lesson 3 8.5 (every exercise 59 s or less, except L1E1 at 65 s); run with an error every 7th answer, Lessons 1–2, 0 faults; smoke clean. Earlier: `2026-11-13.38`: every exercise of Lessons 1–3 cut towards a minute (Jon, 13 Nov; design log §48): the
  automatic one-minute trim plus Lessons 1–3 by hand (counting, names, L2 "how many" of one thing, L3 "C'est quoi ?", L3
  pronunciation). Quiet scripted run Lessons 1–3: 381 right, 112 taps, 0 faults; Lesson 1 in 6.8 min, Lesson 2 5.3, Lesson 3
  7.7. Counting was still 92 s in the run (fixed in .39). Earlier: `2026-11-12.37`: the rulings of 12 Nov evening (design log §44–§47). Formats are whole again (the split is
  withdrawn). No scripted delayed tests. Repeats are trimmed to DISE's count, counted strictly with no individual turns
  (Lesson 1: 123 responses against DISE's 83; the rest of the gap is content, see §47). Corrections: step 3 goes back two
  tasks; steps 5 and 7 give only the task with the error. No ding, smile or pause after a right answer. Animations are 2×
  faster, with waits halved. The board shows only on items that use its words. The count turn is "À toi. Compte.".
  Checks: gate Lessons 1–5 passed; quiet scripted run Lessons 1–2, 249 right, 0 faults (Lesson 1 in 7.9 min, was 13.5);
  run with an error every 7th answer, 0 faults; smoke clean. Earlier: `2026-11-12.36`: .35 with no exercise over 18 responses (Jon, run 17:53; design log §42). Long exercises
  are split between parts, with the continuations after the next exercise. Lessons 1–10 go from 151 exercises to 290 with
  the same items, checked item for item. A learner's "Un, deux …" is also accepted on a count of feminine things (both are
  French; corpus evidence in the §41 addendum). Checks: quiet scripted run Lessons 1–3, 611 right, 164 taps, 0 faults;
  judge un/une; smoke clean. Lessons 4–10 quiet run after shipping. Earlier: `2026-11-12.35`: from Jon's runs of 17:53 and 18:01. One agrees with the thing in a count too: a count of
  feminine things starts "Une" (14 tasks, 7 new clips), and the judge is strict both ways. There is no ring tail towards the
  learner when a model learner asks them. The figure introduction gets an example line, and each question type about the
  figure (now: L4E8; before: L15) gets a reminder line just before its first test. Design log §41. Checks: gate Lessons 1–10
  passed (470 clips); his own count recordings re-heard right; judge un/une both ways; touches follow the new counts;
  smoke clean. Earlier: `2026-11-12.34`: .33 with the figure introduction's English examples of French questions and answers
  removed (Jon, 12 Nov: no English about French; option A). `you_do_b` reworded to say only what the app will do
  ("Later, Marie will ask about your actions, now and before. You will answer as if you had done them yourself.");
  `you_do_c` deleted. Checks: the new line heard word for word (Whisper); the intro played in a browser; smoke
  clean. Earlier: `2026-11-12.33`: .32 plus Marie's confirmation of each model answer in L2E6 part a ("Oui, une." /
  "Oui, un."; the owner, 16:30: he took Pierre's and Sylvie's "Une." for a speech-generation fault). Two new teacher
  clips. Checks: gate Lessons 1–3 passed; played in a browser (Marie names, asks, Pierre answers, Marie confirms);
  smoke clean. Earlier: `2026-11-12.32`: .31 plus Lessons 6–10 with DISE boards (from course_dise6); the silent count ("Compte
  dans ta tête.": the hand touches each thing at a steady pace, nobody speaks) and the des/deux picture test. Checks:
  quiet whole-lesson runs L6–7 885/885, L8 502/502, L9–10 1039/1039 (one 648 ms frame stall, no wrong answer); gate
  Lessons 6–10 passed; selfjudge 0 refused; tapcards 0 failures over 322 taps; smoke clean. Earlier: `2026-11-12.31`: .30 plus L2E6 "one thing's number is its front word" shown in the cue (Marie names
  the thing, "Une pomme.", then asks how many; design log §40); L3E6 reviews regenerated from it. Checks: gate
  Lessons 1–3 passed; smoke clean; the new items played in a browser. Earlier: `2026-11-12.30`: .29 plus audio-stall recovery (Jon's run of 12 Nov 16:01: the phone's sound output
  once fell 6.5 s behind, and Marie's "Un ou une ?" came 6 s late. Before every clip the app reads the browser's
  output delay; over 1 s it starts a new audio context, traced "AUDIO STALL"). Checks: simulated 6.5 s stall
  recovered (the clip played in 1.0 s); gate Lessons 1–2 passed; smoke clean. Earlier: `2026-11-12.29`: .28 plus one Lesson 1 change from Jon's run of 12 Nov 14:58 (L1E4: a new part
  "two or three at a glance": Sylvie "Deux." and Pierre "Trois." on the same apples, then the learner on the same
  things in the same look, only the number differing, before the expansion; design log §39). Checks: gate Lesson 1
  passed; smoke load clean; screens of the new part looked at. Earlier: `2026-11-12.28`: .27 plus the fixes from Jon's runs of 12 Nov 11:40 and 11:50 (L1E7 f men drawn
  doing their actions; the model learner's figure acts on screen after a model tap; board cleared at each exercise;
  figure animation halved; both counting narration lines before the first "À toi." of the course, models included;
  "asker" narration on models too; Pierre's "Je m'appelle, Pierre." without the schwa) and Lessons 3–5 with DISE
  boards. Checks: Lessons 1–2 oracle clean; Lessons 3–5 quiet oracle 730/730 to L5 Ex 8 at ship time (shipped then,
  per Jon: never hold Lesson 1 fixes for later lessons); gate Lessons 1–5 passed; selfjudge 0 refused; taptouch
  21/21; tapcards 0 failures (live .27 had 91). Not fixed: a /v/ Jon hears after "un" inside phrases — the spectrum
  shows nothing to cut; needs the exact lines from him. App state: `dev/appwork/wip28/STATUS.md`.
  .27 for reference: `2026-11-12.27`: .26 plus the fixes from Jon's run of 12 Nov 10:59: the touch-count MODEL hand
  moves to and touches each thing at each number's onset (it had depended on the removed per-task text); taps register
  first time (invisible overlays — the end tick, the hidden model hand, the tap-signal hands — took touches; all are now
  see-through to touches, tap areas cover the whole card and sit on top, a touch during the cue is kept; every touch is
  in the trace; harness `taptouch.js` 21/21); the figure narration split in two with "What are you doing?" / "What
  were you doing?" said as questions; "Un." clips trimmed of a breathy tail heard as /v/ (`dev/voice/trim_tail.py`);
  Lessons 1–2 without the model before "Répète" of the same words (design log §37); wider board padding. Lessons 3–10
  are still .25's. Checks: Lessons 1–2 oracle 346/346, gate passed, selfjudge 0 refused.
  .26 for reference: `2026-11-12.26`: .25 plus fixed DISE boards in Lessons 1–2 (from `course_dise6` of 12 Nov 09:59;
  design log §35–§36): one board per exercise only where DISE has one, blanks where the learner supplies the word,
  outline moving with the voice (`board_point`) and off on the learner's turn except where DISE points to the answer
  (`board_point_learner`); no other print, no written-word taps (the un/une hearing test is on pictures). Lessons 3–10
  are still .25's and follow in batches (3–5, then 6–10). Checks: Lessons 1–2 oracle 346/346, selfjudge 0 refused,
  gate passed (Lessons 1–2). New clips: teacher "Répète : je.", narrator "underline" re-recorded. Known cosmetic: the
  board text sits tight against the board's left edge.
  .25 for reference: `2026-11-12.25`: Lessons 1–10 from the revised course `dev/fieldtest/course_dise6` (design log
  §17–§34): written words with the outline moving with the audio and the RMT marks (blue = silent, straight underline =
  one sound, wavy = irregular), part by part first; touch-counting; tap responses with their own signal (red border +
  tapping hand on every tappable picture); commands answered by a tap, then the learner's figure acts; the le/les, la/les,
  il/elle, des/deux sound formats and ear tests; "Je m'appelle comment ?" from Lesson 3 with its discrimination format;
  own-name playback model; no leads; one model per correction; narrator lines just in time. Spoken answers on le/les,
  la/les and deux/des are never marked wrong on the pair word: accepted with `FAULT SOUND UNSURE` and ruled from the
  recording (the listener cannot separate them for English-accented voices); taps judge hearing. Checks (Jon, 12 Nov:
  ship when the next lessons pass): Lessons 1–4 oracle 900/900 (incl. 232 taps, 20 touch-counts), Lessons 5–6 780/780;
  release gate passed for Lessons 1–10 (468 answer clips, 0 fail); selfjudge 0 refused (1 accepted: "Ça." for "Sept.",
  never in one place); real recordings 323/348 (L4 list), 314/348 (L10 list). **Not yet checked:** quiet oracle for
  Lessons 7–10, the screen fixes of Lessons 8–10, onemodel/ownfix on Lessons 5–10: fixes go out as .26.
  .24 for reference: `2026-11-11.24` (interim, from the first naive tester's run of 11 Nov 21:12): Lessons 1–10 from
  `dev/fieldtest/course_dise5c` (= `course_dise5b` with no leads, "do" tasks turned into "figure" tasks, and in
  Lessons 1–2 the own-name units with the lit tag and no "Je m'appelle comment ?" beside own-name tests;
  `reports/dise5c_changes.md`). Own-name errors are never corrected by another person's own-name sentence: the app plays
  the learner's own earlier right answer ("own-name correction: own recording", clip id in the log's `modelClip` and in
  the run file) or lights the learner's name tag ("own-name correction: name tag"); after an own-name seven-trial limit
  the app goes on to the next part. A learner card with the typed name sits beside Pierre and Sylvie on every own-name
  item, and the tag of whoever must say their name is lit. Corrections give one model, then the learner (no repeated
  models, no extra retests, no app-made leads). Commands are acted by the learner's own named figure with nothing
  asked, introduced once by the narrator (`you_do`, `you_do_b`). Count answers are heard against number words only.
  Checks: oracle 1–10 2265/2265; selfjudge 0 refused / 0 wrongly accepted; real recordings 323/348 (L4 list), 313/348
  (L10 list; the 3 fewer than .23 are machine-load variation, the lists are identical except counts); release gate
  passed (teacher "Tu manges." re-recorded); new harness tests `ownfix.js`, `onemodel.py`, `figshots.js`.
  **The revised course `course_dise6` is next (.25), not in the app yet;** see design log §17–§34.
  .23 for reference: `2026-11-10.23`: Lessons 1–10, built from `dev/fieldtest/course_dise5b` (the course of record).
  New since .22 (all from the run of 11 Nov 08:28): (1) every model and learner clip that the automatic check did not
  hear was re-recorded (Sylvie's "Une." was unintelligible and cost a real error), and a **release gate** now fails the
  build on any answer clip the app's own listener does not hear as its line
  (`python3 -I dev/voice/clipcheck.py <app> 1 10 --gate <port>`; allow-list `dev/voice/clip_allow.json`; rerun the whole
  gate after any re-recording); (2) the **new-asker rule** (design log §16): before anyone but the teacher asks a
  question about themselves, two models show a model learner asking and another answering; on screen the asker has a
  green ring, a tail pointing at whoever must answer, and a hand on their own name tag; 17 exercises changed in
  Lessons 1–4 and 7–10; (3) **user profiles** (tester panel: drop-down, Add, Remove; `frDI.users` + one state per user
  under `frDI.u.<id>`; switching reloads and resumes where that user was; person badge with the name top right; run
  files carry `user`; about 25 users fit in storage).
  Checks on the shipped files: whole-lesson run of Lessons 1–10 2138 of 2138 (`dev/harness/replay/oracle10.js`),
  selfjudge 0 right answers refused and 0 wrong accepted, real recordings 323 of 348 with the Lesson 4 word list and
  316 with the Lesson 10 list, release gate passed (299 answer clips, 0 fail, 8 allow-listed teacher word-pieces, 1
  unsteady: the teacher's "Tu manges."), `profiles.js` all OK. **Known weak listening in Lessons 5–10** is as in .22:
  "Deux clés.", "Une voiture.", "Dix.", "Bon.", "Un homme.", "Pierre et Sylvie."; "tu vas X" for "je vais X" and
  "un V" for "on/elle V" are accepted as `FAULT PERSON UNSURE` and must be ruled from the recording.
  **Next version is a course revision, not yet in the app:** `dev/fieldtest/course_dise6` (Lessons 1–10 revised on
  11 Nov: touch-counting, tap responses, written words with outlined parts and blue silent letters, every French
  complication taught explicitly, DISE compared item by item). Read design log §17–§22, `fieldtest/complications.md`,
  `fieldtest/dise_inventory.md` and `docs/Lessons 1-10, the revision of 11 November (dise6).md` before touching it. It
  needs about 180 recordings and new app capabilities, and the artificial learner has not yet been re-run on it.
  One pull request per version (branch `handoff-wip`, restarted from `main` after every merge).
- **Dev bundle:** the private repo `jonaowen/faultless-dev` (branch `main`). It holds the course generator, the
  artificial learner, listener training, voice scripts, harnesses, real recordings and research. It is private because
  it contains DISE materials Jon owns. Nothing from it may go into the public repo except generated lesson files,
  clips and this handoff.

## 2. Jon's standing rules (keep all of them)

**Teaching design**
- **The whole programme is designed at once, backwards from its terminal skills, on a complete understanding of DISE
  (Jon, 13 Nov 2026).** "The pressure on the design of the programme comes from two directions": testers' runs show what
  does not work, and the early lessons are revised from them; and "the design of the app needs to be cohesive. We can't
  just design the app linearly … The way you design a programme is that you look at the terminal skills that the learner
  is supposed to have and you design backwards from those terminal skills." The order: (1) "a full and complete
  understanding of DISE: every single task, every part, every format, every track, not only recorded in the database,
  along with the teacher's guide, but fully analysed and understood"; (2) the terminal skills, and the curriculum
  designed backwards from them with that understanding; (3) from that, the early lessons, which are then revised on
  real users' runs. "If you don't understand the whole programme and what the whole programme is going to look like,
  you're never going to design those early lessons correctly. Those early lessons do not know what they're leading
  into." So the DISE analysis is finished for both levels before it is narrowed, later lessons are designed and revised
  ahead of the testers, and revising them again after early-lesson changes is expected, not waste.
- **No feedback for a right answer; step 3 goes back two tasks (Jon, 12 Nov 21:00).** No ding, no smile, no pause after a
  right answer: the absence of a correction is the feedback. After a correction the app goes back two tasks (to the
  part's start when the error was in its first two). The board stays while parts of its sentences are said.
- **Formats whole, in line with DISE; corrections repeat only the task (Jon, 12 Nov 2026 20:00).** Never split an exercise
  into pieces placed elsewhere. No lesson or track has more responses than DISE's (`v6.trim_to_dise`); fewer is fine (Jon, 21:00: "deliberately design the programme to be leaner than we think is needed"; no refill to DISE's count; what is taught, the progression, the variety and the repeats per lesson stay like DISE's). No scripted
  delayed tests: the app gives a delayed test of only the task that had an error. Correction steps 5 and 7 repeat only
  that task, not the exercise or the part. Long, uniform lessons tire the learner: Lesson 1 must be about as short as
  DISE's (about 7 minutes, perfect learner).
- **No English about French, ever (Jon, 12 Nov 2026 16:45).** English may explain how the app works, never a French
  rule: that breaks teaching wholly in the target language and invites translating into and out of English. The
  programme begins inductively, from examples only. Once learners have enough French to follow a rule stated in
  French, rules may be taught deductively, in French. (The proposed English line "for one thing, the number is its
  front word" is withdrawn.)
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
- **Own-name answers are shown first** (rule 1k; superseded in part by C29, 11 Nov, design log §33): each own-name
  test has Marie's held frame ("Je m'appelle…") or the learner's own earlier answer straight before it (no longer a
  model learner's "Je m'appelle Pierre." before every one). The teacher's name never comes straight after an own-name test. The app's correction of an own-name answer
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
- **An error is said, never shown (Jon, 13 Nov 2026 evening).** "Whenever the learner makes a mistake, Marie should say
  'no' in French and then she should say 'listen' and then she should say the answer … She says 'non, écoute' [pause]. She
  says the answer [pause]. Then she says 'vas-y.'" The pauses are half a second, so that the answer stands out. "Knowing
  that they've made a mistake is really useful information because it makes them attend to the presentation more
  closely." And no icon for any step of the correction procedure (the circular arrow at steps 3 and 5 and the bookmark
  before a delayed test are removed: a tester took them for praise): "There shouldn't be any indication that the learner
  is in error correction. It should just seem like the lesson is continuing normally." His words in full:
  `dev/qa/notes_jon_2117.md`. (The older line below is superseded since .37: nothing is shown or played for a right
  answer.)
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
- **The artificial learner is paused (Jon, 13 Nov 2026).** "With the artificial learner I'm quite happy that we need a
  rethink on that … At some point we will design an artificial learner but we need to do it more cleverly." Do not run
  it, feed it run files or maintain it, and do not compare course variants on it. Its code and scores stay as they are
  (`dev/fieldtest/learner_private/`, `learner_eval/`; v3.3 scores 0.137, and its whole gain over v3.2 rests on the one
  run it was fitted to). This replaces the rule of 9 Nov that every run file is fed to it.
- **The run log replaces it: every use of the app, kept for good (Jon, 13 Nov 2026).** "Make sure that we have a clear log
  of every single time the app has been used: every single question, every single response (correct or incorrect), and
  the user who used the app. Make sure that the log is linear in time … We must not lose that data. That data is
  precious … Make sure that every single run, when I feed it to you, is automatically saved by being appended to the
  file that already exists so we can have one file that has all the data." The log is `dev/runlog/` (its README has the
  commands): one central file of every event in time order, one workbook with a sheet for each user and that user's
  runs in date order, and the raw run files in `dev/real_audio/` untouched. **Every run file Jon sends: add it to the
  log first** (`dev/runlog/add_run.py`), commit and push the same hour, then the run doctor.
- **The listening hill climb is stopped (Jon, 13 Nov 2026: "The voice recognition seems to work fine as it is").** Do not
  restart it. The app judges every answer with Vosk; nothing the climb produced was ever in the app (267 rounds, no
  champion validated for a single phrase). This replaces the rule of 9 Nov that it should always be running. Restart it
  only if Jon decides to move judging to Whisper. The app still downloads the unused Whisper model (about 46 MB) when the
  page opens: removing that is a possible later change to the listening path, not yet asked for.
- **Never stop and wait for Jon on long tasks** unless he says to pause.
- **The ElevenLabs key was deleted;** never reuse it.

- **Merging and the release routine (Jon, 13 Nov 2026).** "You have authorisation to merge whatever you want to", and a
  lighter routine is approved "if you think it will speed things up and you don't need to wait for me". So: merge a
  release pull request yourself as soon as its checks pass, then check `version.json` on Pages; merge the dev
  repository's pull request whenever `main` should carry the session's work. For a small release, run the real-time
  whole-lesson check only on the lessons that changed, once, on the final files; keep the clip gate and the load check;
  give the release a time limit and ship what passes, leaving side findings for the next version.
- **Speed of release (Jon, 12 Nov 2026): human testing comes first.** "It doesn't make sense to delay human testing
  because the development is too slow. Real human testing is the most valuable information we have." Ship as soon as
  the lessons testers will reach next pass their checks (oracle, selfjudge, release gate for those lessons); the full
  checks for later lessons run after shipping, and fixes go out in the next version. Keep rounds short; never hold a
  release for polish, for the artificial learner, or for later lessons.
- **Rulings of 11 Nov 2026 (design log §17 on; they govern the revision `course_dise6`):**
  - *Priority order.* The content analysis, English speakers' common errors, the big ideas with the single
    interpretation principle, and not confusing the artificial learner all win over emulating DISE. DISE is compared
    last, task by task: an item later than DISE stays only for a specific reason in the French; an item with no reason
    ("not ambitious enough") moves, and only that item.
  - *Nothing assumed.* Every French complication (no article, gendered form, elision, liaison…) is taught explicitly
    with plenty of practice before it is relied on (`fieldtest/complications.md`).
  - *Responses.* At or above DISE's count per lesson and track; lessons may be as long as needed.
  - *Written words follow DISE closely* (Jon, 12 Nov; replaces the 11 Nov "whenever a word is said" wording). Print
    only in exercises where DISE has a board (a new word or sentence frame; none in review and mixed tests; none by
    Lesson 10). The board is FIXED for the exercise, with blanks where DISE has blanks ("Je m'appelle ____"): the
    learner chooses what to say; print that changes with each answer is spoon-feeding. The outline moves over a board
    word only as Marie or a model learner says it, never onto the answer on the learner's turn. RMT marks stay on board
    words.
  - *Copy DISE's support exactly where DISE gives it* (Jon, 12 Nov): where DISE's teacher points to the answer on the
    students' turn (a sentence repeated straight after her model; the greeting bubbles in Lessons 8–9), the app does
    the same (a paced outline over the answer, `board_point_learner`), because DISE has a reason, such as a task
    learners usually fail without it. Only there: never generalised.
  - *Mastery tests are gates* (Jon, 12 Nov): placed where a core set of skills is mastered and the next lessons
    integrate or move up, not at a fixed lesson (DISE's 15 / 30 / 60 / 100 are DISE's gates, not ours). Each item's
    skills must have had the teaching and practice DISE gives its own test items before the test. The LEARNER's
    pass mark and remedy follow DISE exactly; separately, every wrong item, even in a pass, is a design fault to
    diagnose, because in an app every aspect of the presentation is controlled (Jon, 12 Nov).
  - *Speaking and listening only* (Jon, 12 Nov): no test where the learner hears French and taps a written word, and no
    written cards as tap targets or picture content. The DISE boards are the one exception, as a support. "Once the
    student is fluent at speaking French, learning to read and write French will be easy."
  - *Natural French in what is only heard.* Teacher speech uses the natural wording even with a form not yet taught
    ("Touche le livre."), where the response does not depend on it. It builds receptive French.
  - *Receptive before expressive,* programmed deliberately, as DISE does: a stage of hearing and showing understanding
    (tap, action, yes/no) before a form must be said.
  - *The 10% rule, defined.* "New" means a new FORMAT: a new track, or a new format within a track that teaches a
    genuinely new response pattern or grammar construction. From about Lesson 5 only about 10% of a lesson is new
    formats; the rest is old formats. New nouns or other words slotted into an old format are not "new" and may run
    well above 10%. Measured on DISE Lessons 5–8 this is four or five new-format exercises a lesson (about 24% of
    responses); Jon ruled (11 Nov) that the limit is DISE's measured level, not a strict 10%, and accepted the
    classification of DISE's formats (design log §26; audit C17).
  - *ASSUME NOTHING: the level of specificity (Jon's acid test, le / les).* Choosing examples is not enough. Where the
    learner must tell two forms apart by ear that a naive English ear merges (le / les, un / une, …), a purpose-built
    format makes them attend to the difference before it is relied on: the two forms said adjacent on a single card
    and a group ("Le livre, les livres"), examples built up one at a time, the differing piece said alone for each
    highlighted card, a slow version first and then normal rate, Pierre and Sylvie lead, then the learner, half and
    half in unpredictable order. Every teaching step is designed for what it makes the learner attend to, and written
    at that level of detail (`fieldtest/component_analysis.md`, sound-pair inventory in `fieldtest/complications.md`).
  - *Every test discriminates every component* (Jon's "Touche les trois livres" check): for each word that matters
    there is a minimally different alternative on screen (two books beside three books; three pens beside three
    books), and the guess rate is known.
  - *No lead steps* (Jon, 11 Nov evening): nothing where the learner speaks at the same time as the teacher or a model
    learner ("Avec moi"). In an app the learner always comes in late or not at all. A first production is model, then
    "Répète".
  - *One model, then the learner.* A correction gives the right answer once and then asks; no repeated models and no
    run of immediate retests. In the course, never two identical models in a row.
  - *The learner never performs actions* (Jon, 11 Nov evening: no user will stand, dance or smile; the first naive tester said the word
    instead, because the green border and the ding always meant "speak"). The learner's own figure on screen, with a
    name tag reading their name, stands in for them: a command is answered by tapping the action picture, then the
    figure does it; "je / tu" and the tenses are about the figure. Speaking and tapping have different signals, and a
    tap format comes by Lesson 1 Exercise 2 so the learner never decides that every answer is spoken. The narration
    before the first figure task (Jon's content, 11 Nov): "This is you. When Marie tells you to do something, [tap the
    picture of it, and] you'll see yourself do it. Imagine it's really you. Later, Marie will ask you what you are
    doing, and what you were doing, and you'll answer as if you had done it yourself. For example, if she asks 'What
    are you doing?', you answer 'I am dancing.' If she asks 'What were you doing?', you answer 'I was dancing.'"
  - *Written prompts follow RMT Grade K Reading* (TG pp. 57–58, screenshots in `dev/source/rmt/`): **blue** = a letter
    that makes no sound (in RMT it also signals that another letter's sound changes: final E, the second letter of
    ea / ai); **underline** = letters that go together and make one sound; **wavy underline** = letters that do not make
    the sounds the learner has been taught. Prompts are non-specific (they direct a strategy), each is taught before it
    is relied on, and they are faded later. For French: blue for every silent letter (the s of "les", the e of "une");
    underline for one-sound groups (ou, oi, ch, eau, au, ai, eu, qu, gn, -er / -ez, and nasals an / en / on / un / in);
    wavy for irregular letters (the e of "femme").
  - *Touch-counting* in Jon's format; *tap responses* on pictures.
  - "I am / you are" with professions stays at Lesson 20.

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
| 11 Nov 08:28 | Jon, L3 on .22 | 174 of 177 right. (1) **Sylvie's model "Une." was unintelligible** (he could not tell un from une; said "un" for the key). (2) Pierre's "Et moi ?" and (3) Marie's "Je m'appelle comment ?" at the start of Ex 13 both answered "Je m'appelle Jon." after 2+ s: a question about the asker answered about himself (only Marie had ever asked it) | .23: clips re-recorded with a release gate; new-asker rule in the generator (design log §16) |
| 11 Nov 21:12 | the first naive tester, L1 Ex 1–5 on .23 | 134 answers, 15 real errors: 12 own-name answers with the name the model learner had just said (the own-name correction supplies it; she worked out "what is your name?" aloud in English and was right from then on); "Je m'appelle [own name]." ×2 for "Je m'appelle comment ?" (the question opens with her own answer); "Marie." for "Et toi ?" after three corrected "Marie."; one listener error ("trois" heard as "lève-toi" in a count). the run's doctor file in the dev bundle (`dev/qa/`) | next |
| 12 Nov 10:59 | Jon, L1 on .26 | 62 answers, 0 errors. App faults he reported: the touch-count MODEL hand does not move from thing to thing (the learner's turn does); taps need several touches to register; the narrator's "what you are doing" / "what you were doing" sound alike; "Un." / "un" has a slight /v/ tail; "Un. Répète : un." is two identical models. `dev/qa/doctor_jon_1059.md` | .27 |
| 12 Nov 11:40 | Jon, L1 on .26 | the learner's figure animation is too long (halve it); the counting narration played after the learner had already heard "À toi." in the counting models: every narrator line must play before the first task of any kind that uses its convention | .28 |
| 12 Nov 11:50 | Jon, L1 on .27 | L1E7 f: the three men the course gives as smiling / jumping / dancing were drawn identical, so "Danse." was unanswerable; after Pierre's model tap his figure acted in a slot not on screen (nothing visible); a board stayed on screen into the next exercise; "un" still has a slight /v/ (determiner and number); Pierre says "m'appelle" with a final schwa | .28 |
| 12 Nov 14:58 | Jon, L1 on .28 | 154 answers, 2 errors, both "trois" for two (two apples straight after three shoes; two red shoes): the first two-thing pictures of OBJECTS answered without counting (two at a glance had been fingers only; every object pair had been counted aloud first). Recognition re-checked: he did say "trois". 8 hesitations (3 on "C'est qui ?" in L1E5). `dev/qa/doctor_jon_1458.md`; design log §39 | .29 |
| 12 Nov 16:01 | Jon, L1 E8–9 on .29 | 0 errors. Glitch: the phone's sound output fell 6.5 s behind before Marie's "Un ou une ?" (L1E8-b3): she seemed to wait in silence (the touch he remembers was on the task before, a spoken "Un ou une ?" with the book pointed at). `dev/qa/doctor_jon_1601.md` | .30 (audio restarted when the delay is over 1 s) |
| 12 Nov 16:08 | Jon, L1E8–L2E6 on .29 | 3 errors in L2E6: "un" for one apple and one shoe, "une" for one book. He asked whether numbers really have gender. Cause: Lesson 1 taught one = "Un." and L2E6 changed it with six bare models and no link to the thing. `dev/qa/doctor_jon_1608.md`; design log §40 | .31 |
| 13 Nov 09:13 | Jon, L1 on .37 | Lesson 1 complete in 8 min 05 s (09:05:41 to 09:13:46), 123 answers, 0 errors, 2 slow starts (the 4.8 s one is him opening and closing the settings panel, not confusion). First run on the lean lesson. `dev/qa/doctor_jon_0913.md` | none needed |
| 13 Nov 15:24 | tester R (naive), L1 on .39 | 201 scored answers, 39 errors in 17 min: 20 on "Un ou une ?" asked about one picture of six just after taps; word pieces met with silence; "Et toi ?" answered with the name alone; "souris" said as Marie. design log §51–§52 | .40 |
| 13 Nov 21:17 | Jon, L1 on .43 | 108 scored answers, 1 error ("trois" for two fingers, L1E4-h3: "how many" first answered "Deux." with no model student before it; his third time), 3 slow starts. His notes: Sylvie cannot say "M'appelle."; the gender introduction is fast first and slow after, the wrong way round, and still too fast; a book highlighted while Marie says "un" then "une"; "C'est qui ?" asked about Pierre while he is only a small side card (L1E9 part b), the frame an earlier tester failed on. `dev/qa/notes_jon_2117.md`, `doctor_jon_2117.md` | .45 (in hand) |

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

**Stopped on 13 Nov 2026 (Jon; see §2). What follows is its history, kept in case judging ever moves to Whisper.**

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
5. **Naive testers:** one so far (the 16:42 run); it showed more in one run than all of Jon's.

## 6. Open with Jon

- *Est-ce que* or rising intonation for yes/no questions (recommended: rising intonation).
- Old clips for Claire/Paul/Julie are still in `audio/` (unused; harmless).
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
