# Case Study: Measuring Human Review Quality in LLM Safety Pipelines

## Background & Motivation

Recent work on scalable AI oversight argues that supervision should rely on a combination of automated methods and a small amount of focused, high-quality human judgment. Rather than collecting large volumes of human feedback, this approach emphasizes making human oversight more legible, intentional, and effective as AI systems become more capable.

Anthropic’s research on scalable supervision and Constitutional AI highlights the potential for AI systems to assist with supervision, allowing humans to focus on high-impact decisions while reducing labeling overhead. This framing assumes that human intervention becomes rarer but more consequential as model capability increases.

However, while significant attention has been given to scaling who supervises AI systems, less attention has been paid to how the remaining human judgments themselves are governed. In practice, human reviewers may disagree on ambiguous cases, apply policies inconsistently, or drift over time as norms and contexts change.

This project is motivated by the observation that as human oversight becomes a smaller but more critical part of AI safety pipelines, the quality, consistency, and auditability of human review decisions themselves become system-level safety concerns.


## Problem Statement

Modern LLM deployments increasingly rely on human-in-the-loop review to manage safety, correctness, and compliance in sensitive or ambiguous cases. As models become more capable, this human oversight becomes less frequent but more consequential, concentrating responsibility on a smaller set of high-impact decisions.

In practice, human review is often treated as a binary outcome approved or rejected without systematic visibility into how decisions are made, where reviewers disagree, or how interpretations of policy change over time. Disagreement, uncertainty, and judgment calls are typically collapsed into a single final action, leaving little trace for auditing, learning, or governance.

This creates a blind spot in AI safety pipelines: while model behavior and automated evaluations are increasingly instrumented and measured, the quality and consistency of human oversight itself remains largely opaque. Without tooling to make human judgment legible and measurable at the system level, organizations risk silently accumulating policy ambiguity, inconsistent enforcement, and governance gaps as AI deployments scale.

## Insight

As AI systems become more capable, human oversight becomes rarer but more high impact. In this setting, the human reviewer is part of the safety system, not just a last step approval button.

A key observation is that “human review” is often treated as a binary outcome (approved vs rejected), even though real oversight contains uncertainty and legitimate disagreement. Disagreement can reflect policy gray areas, missing context, or differences in risk tolerance and therefore provides useful signals about where the system (and policy) needs clarification.

This project treats human judgment as measurable system data (decision, reason tags, confidence) in order to make oversight more legible, auditable, and improvable over time, aligning with scalable supervision approaches that aim to concentrate human effort where it matters most.

## Early Results (Prototype)

To validate the premise, I simulated a small double review process on 3 items (2 reviewers per item) and measured agreement.

- Decision agreement rate: 33% (1/3)
- Disagreement drivers included: `missing_citation`, `policy_unclear`, and `ungrounded_claim`
- Disagreements occurred even when reviewers had similar confidence (e.g., medium/medium), suggesting that ambiguity and interpretation, not just reviewer certainty contributes to inconsistent outcomes.

This supports the need for tooling that surfaces disagreement patterns and treats them as governance signals rather than silently collapsing human oversight into a single binary outcome.

## References
- Anthropic. Scalable Oversight and Constitutional AI. 2022. https://arxiv.org/pdf/2212.08073
