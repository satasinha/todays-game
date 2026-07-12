#!/usr/bin/env node
/**
 * Fetches live match results from football-data.org and writes
 * src/assets/data/scores.json for the Angular app to consume.
 *
 * Scores are published only after an 8 hour embargo (configurable via
 * SCORE_EMBARGO_HOURS). Standings-relevant status ("finished") is always
 * written so the standings table stays live; the score values are set
 * to null during the embargo window so the UI shows "–" instead of spoilers.
 *
 * Usage: FOOTBALL_DATA_API_KEY=<key> node scripts/update-scores.js
 */

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const API_KEY        = process.env.FOOTBALL_DATA_API_KEY;
const EMBARGO_HOURS  = parseInt(process.env.SCORE_EMBARGO_HOURS ?? '48', 10);
const OUT_FILE       = path.join(__dirname, '..', 'src', 'assets', 'data', 'scores.json');

if (!API_KEY) {
  console.error('Missing FOOTBALL_DATA_API_KEY env var');
  process.exit(1);
}

// ── Team name mapping (API → our naming) ─────────────────────────────────────
const TEAM_MAP = {
  'Korea Republic':        'South Korea',
  'Czechia':               'Czech Republic',
  'Türkiye':               'Turkey',
  'Côte d\'Ivoire':        'Ivory Coast',
  'Congo DR':              'DR Congo',
  'Bosnia-Herzegovina':    'Bosnia and Herzegovina',
  'Cape Verde Islands':    'Cape Verde',
};
function normaliseName(name) {
  return TEAM_MAP[name] ?? name;
}

// ── Match ID derivation ───────────────────────────────────────────────────────
// football-data.org doesn't expose our custom IDs, so we identify matches by
// matchday + home/away team names and map them to our IDs via the fixtures file.
const FIXTURES_JSON = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'src', 'assets', 'data', 'fixtures.json'),
  'utf8'
));
const fixtureIndex = {};
for (const f of FIXTURES_JSON.fixtures) {
  fixtureIndex[`${f.homeTeam}|${f.awayTeam}`] = f.id;
}

// ── HTTP helper ───────────────────────────────────────────────────────────────
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'X-Auth-Token': API_KEY } }, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch (e) { reject(new Error(`JSON parse error: ${e.message}\nBody: ${body.slice(0, 200)}`)); }
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Request timeout')); });
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Fetching WC 2026 matches from football-data.org …');
  const data = await fetchJson('https://api.football-data.org/v4/competitions/WC/matches');

  const now = Date.now();
  const embargoMs = EMBARGO_HOURS * 60 * 60 * 1000;

  const scores = [];

  for (const match of data.matches) {
    const apiStatus = match.status; // SCHEDULED | TIMED | IN_PLAY | PAUSED | FINISHED | CANCELLED
    const home = normaliseName(match.homeTeam?.name);
    const away = normaliseName(match.awayTeam?.name);
    const key  = `${home}|${away}`;
    const id   = fixtureIndex[key];

    if (!home || !away) continue;  // knockout placeholder with no teams yet

    if (!id) {
      console.warn(`  No fixture ID found for: ${home} vs ${away}`);
      continue;
    }

    let status, homeScore, awayScore;

    if (apiStatus === 'FINISHED') {
      const matchUtc = new Date(match.utcDate).getTime();
      const elapsed  = now - matchUtc;
      status    = 'finished';
      if (elapsed >= embargoMs) {
        homeScore = match.score.fullTime.home;
        awayScore = match.score.fullTime.away;
      } else {
        // Within embargo: omit scores to avoid spoilers
        homeScore = null;
        awayScore = null;
      }
    } else if (apiStatus === 'IN_PLAY' || apiStatus === 'PAUSED') {
      status    = 'live';
      homeScore = null;
      awayScore = null;
    } else {
      // SCHEDULED / TIMED / CANCELLED — skip (no data to store)
      continue;
    }

    scores.push({ id, homeScore, awayScore, status });
  }

  const output = {
    lastUpdated: new Date().toISOString(),
    scores,
  };

  fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2));
  console.log(`Written ${scores.length} score entries to ${OUT_FILE}`);
}

main().catch(err => {
  console.error('update-scores failed:', err.message);
  process.exit(1);
});
