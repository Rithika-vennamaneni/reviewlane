# Evaluation Framework (v0)

## Goal
These signals are intended to help concentrate human oversight on high-impact, ambiguous cases, aligning with scalable supervision approaches that prioritize small amounts of focused, high-quality human judgment(not replace it).
- agreement / disagreement
- confidence
- drift over time
- common failure reasons

## Non-goals
- Ranking or punishing reviewers
- Automating final decisions

## Purpose

The evaluation framework is designed to selectively involve humans in sensitive or ambiguous cases, making human judgment a visible and accountable part of the AI system rather than an opaque fallback.
Ambiguous cases are intentionally included in the evaluation dataset, as disagreement among reviewers is treated as a signal of policy uncertainty rather than reviewer error.

## Review Form (what a reviewer must submit)

### 1) Decision (required)
One of:
- APPROVE
- EDIT_APPROVE
- REJECT

### 2) Reason tags
- grounded
- missing_citation
- ungrounded_claim
- overconfident_tone
- ambiguous_question
- policy_unclear
- potential_harm
- needs_escalation
- policy_conflict

### 3) Reviewer confidence (required)
Choose one:
- low
- medium
- high

### 4) Notes (optional)
Short explanation (1–2 sentences max)


## System Metrics (computed later)
Metrics are analyzed at the system level to surface ambiguity, training needs, and policy gray areas, not to evaluate individual reviewer performance.

### A) Agreement
- decision_agreement_rate = % of double-reviewed items with the same decision

### B) Disagreement drivers
- disagreement_by_tag = which tags most correlate with disagreement

### C) Calibration
- do low-confidence reviews correlate with disagreements?

### D) Drift
- does the distribution of decisions/tags change week to week?
