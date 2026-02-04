# System Architecture (v0)
This document describes the architecture of the human-in-the-loop review quality layer.
The system is intentionally lightweight and modular, designed to sit on top of an existing LLM application without modifying the model itself.

## High-level Flow
1. A user query is answered by an LLM using provided context.
2. The system runs lightweight automated checks on the LLM output.
3. Based on risk signals, the output is either auto-approved or routed to human review.
4. Human reviewers submit structured review records.
5. Review records are logged and analyzed to surface agreement, disagreement, and drift.
6. Aggregated metrics inform policy clarification and oversight design.

## Core Components
### 1. LLM Application (External)
- Handles user input and answer generation.
- Treated as a black box by this system.
- May already include model-level safety measures (e.g. Constitutional AI).

### 2. Automated Evaluation Layer
- Performs first pass checks such as:
  - grounding vs context
  - missing citations
  - overconfident claims
- Produces a preliminary risk signal.
- Does not make final decisions.

### 3. Routing Logic
- Determines whether an output:
  - is auto-approved, or
  - requires human review
- Routing is conservative by design for sensitive or ambiguous cases.

### 4. Human Review Interface
- Presents reviewers with:
  - the original question
  - relevant context
  - the model output
  - automated evaluation signals
- Collects structured review records:
  - decision
  - reason tags
  - confidence
  - optional edits

### 5. Review Record Store
- Stores all human review submissions.
- Preserves disagreement by keeping multiple reviews per item.
- Acts as the source of truth for oversight analysis.

### 6. Metrics & Analysis Layer
- Computes system-level signals such as:
  - agreement rate
  - disagreement by tag
  - confidence vs disagreement
  - drift over time
- Metrics are used to guide governance and policy refinement, not to rank reviewers.

## Design Principles
- Human judgment is a first-class system component.
- Disagreement is treated as signal, not error.
- Oversight is selective and focused on high-impact cases.
- The system complements model-level alignment rather than replacing it.
