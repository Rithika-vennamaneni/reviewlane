# Review Record (v0)

This document defines the structure of a single human review submission.

## Required fields

- item_id: string  
  The seed item or request being reviewed.

- batch_id: string  
  The batch this item belongs to (for drift comparisons).

- reviewer_id: string  
  Identifier for the human reviewer submitting the record.

- decision: enum  
  One of:
  - APPROVE
  - EDIT_APPROVE
  - REJECT

- reason_tags: array[string]
  Allowed tags:
  - grounded
  - missing_citation
  - ungrounded_claim
  - overconfident_tone
  - ambiguous_question
  - policy_unclear
  - policy_conflict
  - potential_harm
  - needs_escalation

- confidence: enum  
  One of:
  - low
  - medium
  - high

- created_at: timestamp  
  ISO timestamp of when the review was recorded.

## Optional fields

- edited_text: string (only if decision = EDIT_APPROVE)
- notes: string (1–2 sentences max)

## Design intent

- Review records are collected to make human oversight legible and auditable.
- Disagreement is treated as a signal of ambiguity or policy gray areas, not reviewer error.
- This schema is not intended for ranking reviewers.
