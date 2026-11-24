// Job-title writer for "Weirdest Job Title: Blind Judge Showdown" (make.fun).
// Writes one job title, 1 to 60 characters, to $MAKEFUN_OUTPUT_DIR/entry.txt.
// Deterministic: no clock, no randomness, no network, no unordered
// iteration. Node 22, zero dependencies, erasable TypeScript only.
//
// The judge (a deadpan comedy scout who has hired for every odd job on
// earth) weighs, most important first:
//   1. is a weird job title, a few words naming an odd job, and loses to
//      any weirder job title;
//   2. is stranger than ordinary work, a job nobody has heard of or one
//      with a gloriously odd twist;
//   3. is funny, with a twist that lands on the first read;
//   4. sounds like a real job rather than a random word salad, specific
//      enough to picture the person doing it;
//   5. reads instantly, short enough to take in at a glance.
//
// The scorer below mirrors that brief in the same order. Each candidate
// carries its rubric sub-scores (weird /20, funny /20, real-job /20,
// specific /20, instant /20), scored by hand against the brief; the
// program picks the winner by deterministic argmax: highest score, then
// shortest, then lexicographic.
//
// Flooded angles left out entirely: the professional queue stander /
// line stander, the pet food taster, the professional mourner, the
// professional cuddler, the snake milker, the ostrich babysitter, the
// iceberg mover, the gum buster, the fortune cookie writer, the
// underwater basket weaving instructor, the professional sleeper, and
// any title that is just a random odd noun with no job in it
// ("Chief of Chaos", "Minister of Vibes"). A title needs a desk, a
// duty, and a person doing it — otherwise it is a word, not a job. The strongest
// titles share one shape: a real corporate or civil-service title
// structure (Senior Vice President, Director, Head of, Certified) bolted
// onto one hilariously specific duty nobody would hire for — so the
// reader pictures a person, in an office, doing it, on a salary.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

interface Rubric {
  weird: number; // /20 — stranger than ordinary work, odd twist
  funny: number; // /20 — twist lands on the first read
  realJob: number; // /20 — sounds like a real job, not word salad
  specific: number; // /20 — specific enough to picture the person
  instant: number; // /20 — reads instantly, at a glance
}

interface Scored {
  text: string;
  rubric: Rubric;
}

const CANDIDATES: Scored[] = [
  // The winner: a C-suite title, an apology, and geese — the most
  // famously unappeasable audience. The reader pictures the office, the
  // tie, the goose, and the meeting that went wrong.
  {
    text: "Senior Vice President of Apologising to Geese",
    rubric: { weird: 19, funny: 19, realJob: 19, specific: 19, instant: 19 },
  },
  // A professional apologiser, but for other people's dogs: the duty is
  // specific and the client is never the one at fault.
  {
    text: "Professional Apologiser for Other People's Dogs",
    rubric: { weird: 18, funny: 18, realJob: 18, specific: 18, instant: 18 },
  },
  // One negotiator, one species, no stated terms. Short and instantly
  // picturable, but the duty is thinner than the geese apology.
  {
    text: "Senior Pigeon Negotiator",
    rubric: { weird: 18, funny: 18, realJob: 18, specific: 17, instant: 19 },
  },
  // The department that exists to be redundant. Clever, but the joke
  // needs half a second of assembly, and the job itself is vague.
  {
    text: "Head of the Department of Redundant Departments",
    rubric: { weird: 18, funny: 19, realJob: 17, specific: 17, instant: 18 },
  },
  // The whole prize is in the last two words: who loses socks, and why
  // does finding them need a department?
  {
    text: "Chief Executive of the Department of Lost Socks",
    rubric: { weird: 18, funny: 18, realJob: 18, specific: 18, instant: 17 },
  },
  // Napping, but strategic, and only in the afternoon: the bureaucracy
  // of a nap.
  {
    text: "Director of Strategic Napping, Afternoon Division",
    rubric: { weird: 17, funny: 17, realJob: 18, specific: 18, instant: 18 },
  },
  // A junior assistantship with no human in charge: the plant is the boss.
  {
    text: "Junior Assistant to the Office Plant",
    rubric: { weird: 17, funny: 18, realJob: 17, specific: 17, instant: 19 },
  },
  // Lost umbrellas, managed at senior level. Real-sounding, but the
  // image is one object repeated, not a scene.
  {
    text: "Senior Manager of Lost Umbrellas",
    rubric: { weird: 16, funny: 16, realJob: 18, specific: 16, instant: 19 },
  },
  // The magazines in the waiting room have a rotation schedule, and
  // someone owns it.
  {
    text: "Professional Waiting-Room Magazine Rotator",
    rubric: { weird: 17, funny: 17, realJob: 17, specific: 18, instant: 17 },
  },
  // Queue etiquette, theme park division: a real problem, a real uniform,
  // and nobody thanked.
  {
    text: "Head of Queue Etiquette, Theme Park Division",
    rubric: { weird: 16, funny: 16, realJob: 18, specific: 18, instant: 17 },
  },
  // One sock, matched, certified. The certification is doing the comedy.
  {
    text: "Certified Left Sock Matcher",
    rubric: { weird: 17, funny: 17, realJob: 16, specific: 17, instant: 19 },
  },
  // The lead optimist, but only on Monday mornings: the hardest shift in
  // the building.
  {
    text: "Lead Optimist, Monday Mornings Only",
    rubric: { weird: 16, funny: 17, realJob: 16, specific: 17, instant: 18 },
  },
  // The third wheel, professionalised, weekends only. Funny, but it is a
  // social role rather than a job with a desk.
  {
    text: "Professional Third Wheel, Weekends Only",
    rubric: { weird: 16, funny: 17, realJob: 15, specific: 16, instant: 18 },
  },
  // The biscuit tin has a manager, and the manager has opinions.
  {
    text: "Manager of the Office Biscuit Tin",
    rubric: { weird: 16, funny: 16, realJob: 17, specific: 17, instant: 19 },
  },
  // Excuses, written professionally, presumably for other people.
  {
    text: "Certified Professional Excuse Writer",
    rubric: { weird: 15, funny: 16, realJob: 17, specific: 16, instant: 18 },
  },
  // Compliments, quality-controlled. The audit trail is the joke.
  {
    text: "Head of Compliment Quality Control",
    rubric: { weird: 16, funny: 16, realJob: 17, specific: 16, instant: 18 },
  },
  // Cones, placed, engineered. The seniority is doing the comedy.
  {
    text: "Senior Traffic Cone Placement Engineer",
    rubric: { weird: 16, funny: 16, realJob: 18, specific: 17, instant: 17 },
  },
  // Elevator music, composed professionally. Real job, odd brief.
  {
    text: "Professional Elevator Music Composer",
    rubric: { weird: 15, funny: 15, realJob: 18, specific: 16, instant: 18 },
  },
  // Unfinished jigsaws, under a chief. The pile is the office.
  {
    text: "Chief of Unfinished Jigsaw Puzzles",
    rubric: { weird: 16, funny: 16, realJob: 16, specific: 16, instant: 18 },
  },
  // Accidents, invented, at deputy-director level.
  {
    text: "Deputy Director of Accidental Inventions",
    rubric: { weird: 17, funny: 16, realJob: 17, specific: 15, instant: 17 },
  },
  // The snooze button, tested, professionally. The tester never gets up.
  {
    text: "Professional Snooze Button Tester",
    rubric: { weird: 15, funny: 16, realJob: 16, specific: 16, instant: 18 },
  },
  // Sighing, loudly, at senior vice-president level.
  {
    text: "Senior Vice President of Sighing Loudly",
    rubric: { weird: 16, funny: 17, realJob: 16, specific: 15, instant: 18 },
  },
  // Penguins, counted, southern hemisphere. Specific, but counting is a
  // real job; the weirdness is only the subject.
  {
    text: "Lead Penguin Counter, Southern Hemisphere",
    rubric: { weird: 15, funny: 15, realJob: 18, specific: 17, instant: 17 },
  },
  // Bubble wrap, quality-inspected, certified. The pop is the perk.
  {
    text: "Certified Bubble Wrap Quality Inspector",
    rubric: { weird: 15, funny: 15, realJob: 17, specific: 17, instant: 17 },
  },
  // Things nobody asked for, managed at senior level.
  {
    text: "Senior Manager of Things Nobody Asked For",
    rubric: { weird: 16, funny: 16, realJob: 15, specific: 14, instant: 18 },
  },
];

function total(r: Rubric): number {
  return r.weird + r.funny + r.realJob + r.specific + r.instant;
}

function validate(text: string): void {
  if (text.length < 1 || text.length > 60) {
    throw new Error(`entry must be 1-60 characters, got ${text.length}`);
  }
  if (text.trim() !== text || text.includes("\n")) {
    throw new Error("entry must be one title with no padding");
  }
}

const scored = CANDIDATES.map((c) => ({ ...c, score: total(c.rubric) }));
for (const c of scored) validate(c.text);

const winner = scored.sort(
  (a, b) => b.score - a.score || a.text.length - b.text.length || (a.text < b.text ? -1 : 1),
)[0];

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "output";
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "entry.txt"), winner.text, "utf8");
console.log(`winner (${winner.text.length} chars, score ${winner.score}): ${winner.text}`);
