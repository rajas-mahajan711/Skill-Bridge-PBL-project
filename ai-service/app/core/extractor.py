"""
SkillBridge AI Service — Skill Extractor
=========================================
Implements genuine, text-based skill detection from evidence supplied by a
student (resume text, project description, GitHub README, certificate, etc.).

Algorithm Overview
------------------
1. Normalise input text (lowercase, collapse whitespace).
2. For each skill in the taxonomy:
     a. Check for any *alias* hit using word-boundary regex.
     b. Check for any *keyword* hit using word-boundary regex.
3. A skill is only included when at least one hit is found.
4. For each detected skill, locate the best evidence snippet — the sentence
   (or phrase) in the *original* text that contains the match.
5. Compute a heuristic confidence score (0 < score <= 0.98):
       base      = 0.72 (alias hit) | 0.52 (keyword-only hit)
       freq_bonus = min(0.20, (hit_count - 1) × 0.05)
       src_factor = source weight (resume/github=1.0, project=0.92, others=0.82)
       raw        = (base + freq_bonus) × src_factor
       confidence = min(0.98, round(raw, 2))
6. Sort results by confidence descending, then alphabetically as a tiebreaker.

Design Decisions
----------------
- Word-boundary matching (\\b) prevents substring false positives, e.g. the
  word "flux" will not trigger "SQL".
- The alias "C" (single letter) is NEVER matched on its own; "C programming"
  and "C language" are the only aliases — this prevents false positives when
  "C" appears as an article at a sentence boundary.
- "Go" and "R" are similarly handled: only their unambiguous forms
  ("golang", "r programming", etc.) act as aliases.
- Evidence snippets are always extracted verbatim from the original text; they
  are never fabricated or templated.
- The source weight only adjusts the confidence magnitude — it does not
  gate detection.  A skill mentioned in a plain text note is still detected
  but with lower confidence than the same skill mentioned in a resume.
"""

import re
from typing import List, Tuple

from app.core.taxonomy import SKILLS_TAXONOMY


# ── Source weight table ────────────────────────────────────────────────────
_SOURCE_WEIGHTS: dict[str, float] = {
    "resume":   1.00,
    "github":   1.00,
    "project":  0.92,
    "leetcode": 0.85,
    "text":     0.82,
}

_DEFAULT_WEIGHT = 0.82          # Applied when source is unrecognised
_MAX_SNIPPET_LEN = 120          # Characters; longer snippets are truncated


# ── Helpers ────────────────────────────────────────────────────────────────

def _build_pattern(term: str) -> re.Pattern:
    """
    Compile a word-boundary pattern for *term*.
    Handles trailing or leading punctuation like 'c++', 'c#', '.net' where standard \\b
    fails because '+' or '#' are non-word characters.
    """
    escaped = re.escape(term)
    prefix = r"\b" if re.match(r"^\w", term) else r"(?<!\w)"
    suffix = r"\b" if re.search(r"\w$", term) else r"(?!\w)"
    return re.compile(prefix + escaped + suffix, re.IGNORECASE)


def _source_weight(source: str | None) -> float:
    """Return the confidence multiplier for a given evidence source."""
    return _SOURCE_WEIGHTS.get((source or "text").lower(), _DEFAULT_WEIGHT)


def _extract_snippet(original_text: str, match_term: str) -> str:
    """
    Find the sentence (or 120-char window) in *original_text* that contains
    *match_term* and return it as the evidence snippet.

    The returned text is always from the original (non-lowercased) input so
    that it reads naturally in the response.
    """
    pattern = _build_pattern(match_term)
    m = pattern.search(original_text)
    if not m:
        return ""

    # Attempt to find the enclosing sentence
    start_pos = m.start()
    end_pos   = m.end()

    # Look backward for a sentence-starting boundary (period followed by whitespace, or newline, or ? !)
    sentence_starts = [0]
    for i in range(start_pos):
        ch = original_text[i]
        if ch in "?!\n":
            sentence_starts.append(i + 1)
        elif ch == '.' and (i + 1 < len(original_text) and original_text[i + 1].isspace()):
            sentence_starts.append(i + 1)
    sent_start = sentence_starts[-1]

    # Look forward for a sentence-ending boundary (. followed by space/end, or ! ?, or newline)
    tail = original_text[end_pos:]
    end_match = re.search(r"(?:[.!?](?:\s|$))|\n", tail)
    sent_end = end_pos + (end_match.start() + 1 if end_match else len(tail))

    snippet = original_text[sent_start:sent_end].strip()

    # Truncate if too long
    if len(snippet) > _MAX_SNIPPET_LEN:
        # Try to keep the matched term visible near the start
        rel = start_pos - sent_start
        if rel < _MAX_SNIPPET_LEN - 30:
            snippet = snippet[:_MAX_SNIPPET_LEN] + "..."
        else:
            win_start = max(0, rel - 40)
            snippet   = "..." + snippet[win_start: win_start + _MAX_SNIPPET_LEN] + "..."

    return snippet


def _count_hits(normalised_text: str, terms: list[str]) -> Tuple[int, str]:
    """
    Count the total number of regex hits for a list of terms and return the
    first matching term (for snippet extraction).

    Returns (hit_count, first_matched_term).
    """
    total = 0
    first_term = ""
    for term in terms:
        matches = _build_pattern(term).findall(normalised_text)
        if matches:
            if not first_term:
                first_term = term
            total += len(matches)
    return total, first_term


# ── Public API ─────────────────────────────────────────────────────────────

class ExtractedSkillResult:
    """Lightweight data class — converted to Pydantic model in the router."""
    __slots__ = ("name", "confidence", "evidence_snippet")

    def __init__(self, name: str, confidence: float, evidence_snippet: str):
        self.name             = name
        self.confidence       = confidence
        self.evidence_snippet = evidence_snippet


def extract_skills(
    text: str,
    source: str | None = "text",
) -> List[ExtractedSkillResult]:
    """
    Main extraction function.

    Parameters
    ----------
    text   : Raw evidence text (resume, project description, README, etc.)
    source : Origin of the text — affects confidence weighting.
             Accepted values: "resume", "github", "project", "leetcode", "text"

    Returns
    -------
    List of ExtractedSkillResult sorted by confidence (highest first).
    An empty list is returned when no skills are detected — never fabricated
    results.
    """
    if not text or not text.strip():
        return []

    normalised = text.lower()
    src_weight = _source_weight(source)
    results: List[ExtractedSkillResult] = []

    for skill_name, entry in SKILLS_TAXONOMY.items():
        aliases  = entry.get("aliases", [])
        keywords = entry.get("keywords", [])

        # ── Step 1: check aliases ──────────────────────────────────────────
        alias_hits, alias_term = _count_hits(normalised, aliases)

        # ── Step 2: check keywords ─────────────────────────────────────────
        kw_hits, kw_term = _count_hits(normalised, keywords)

        total_hits = alias_hits + kw_hits
        if total_hits == 0:
            continue  # skill not mentioned — skip entirely

        # ── Step 3: compute confidence ─────────────────────────────────────
        if alias_hits > 0:
            base = 0.72
            # If the skill also has keyword evidence, bump base slightly
            if kw_hits > 0:
                base = 0.76
        else:
            base = 0.52  # keyword-only hit — weaker signal

        freq_bonus = min(0.20, (total_hits - 1) * 0.05)
        raw        = (base + freq_bonus) * src_weight
        confidence = min(0.98, round(raw, 2))

        # ── Step 4: extract evidence snippet from original text ────────────
        # Prefer to anchor the snippet on an alias hit; fall back to keyword.
        snippet_term = alias_term if alias_term else kw_term
        snippet      = _extract_snippet(text, snippet_term)

        results.append(ExtractedSkillResult(
            name             = skill_name,
            confidence       = confidence,
            evidence_snippet = snippet,
        ))

    # Sort by confidence descending; alphabetical as a stable tiebreaker
    results.sort(key=lambda r: (-r.confidence, r.name))
    return results

