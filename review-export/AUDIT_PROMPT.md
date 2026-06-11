# GPT Legaltech Audit Prompt — ezLegal.ai

Audit the exported ezLegal.ai source for three ICPs:
1. Spanish-speaking individuals who cannot afford a lawyer
2. SMBs
3. Pro bono and legal service organizations

For each ICP, evaluate:
- Product quality and whether it is best-in-class
- Cognitive overload and plain-language usability
- Conversion optimization and completion flow
- Ethical AI, legal-information-not-advice guardrails, privacy, and A2J alignment
- Partnership and revenue model potential

Evidence rules:
- Base claims only on exported source files, manifests, migrations, and cited external standards.
- Mark missing or ambiguous evidence as [blocked] or [evidence unavailable].
- Distinguish fact from inference.
- Do not infer AI vendor practices, training data, data retention, or legal accuracy unless the export proves them.
- Treat Spanish parity, accessibility, save/resume, progress indicators, content provenance, and human escalation as required review points.

Output:
- Executive summary
- Route-level findings
- Component-level findings
- ICP matrix
- Highest-risk legal/ethical gaps
- Redesign backlog with acceptance criteria
