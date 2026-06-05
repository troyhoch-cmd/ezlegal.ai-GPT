import { describe, it, expect } from 'vitest';

// Inline the pure function for testing since edge functions can't be imported directly
function stripUnsafeReasoningBlocks(response: string): string {
  if (!response) return response;
  let cleaned = response.replace(
    /---ANSWER_BASIS---[\s\S]*?---END_ANSWER_BASIS---\n*/g,
    ""
  );
  cleaned = cleaned.replace(
    /---ANSWER_BASIS---[\s\S]*/g,
    ""
  );
  cleaned = cleaned.replace(
    /---THINKING_DETAILS---[\s\S]*?---END_THINKING_DETAILS---\n*/g,
    ""
  );
  cleaned = cleaned.replace(
    /---THINKING_DETAILS---[\s\S]*/g,
    ""
  );
  cleaned = cleaned.replace(
    /^(?:STEP|CONSIDERATION|KEY_ISSUE|CONFIDENCE|STATUTE|RISK|LEGAL_AREA|JURISDICTION):.*\n?/gm,
    ""
  );
  return cleaned.trim();
}

describe('stripUnsafeReasoningBlocks', () => {
  it('removes a complete THINKING_DETAILS block', () => {
    const input = `---THINKING_DETAILS---
LEGAL_AREA: Landlord-Tenant
JURISDICTION: Arizona
KEY_ISSUE: Eviction notice validity
CONFIDENCE: high
STEP: Analyzing relevant statutes
---END_THINKING_DETAILS---

Here is your answer about eviction.`;

    const result = stripUnsafeReasoningBlocks(input);
    expect(result).toBe('Here is your answer about eviction.');
    expect(result).not.toContain('THINKING_DETAILS');
    expect(result).not.toContain('LEGAL_AREA');
  });

  it('removes an unclosed THINKING_DETAILS block (model forgot to close)', () => {
    const input = `---THINKING_DETAILS---
LEGAL_AREA: Employment
STEP: Reviewing the situation
Here is the rest of the response that leaked.`;

    const result = stripUnsafeReasoningBlocks(input);
    expect(result).toBe('');
  });

  it('removes stray chain-of-thought lines without block markers', () => {
    const input = `STEP: First I need to analyze
CONSIDERATION: The user might be at risk
CONFIDENCE: medium

Here is your actual answer.`;

    const result = stripUnsafeReasoningBlocks(input);
    expect(result).toBe('Here is your actual answer.');
  });

  it('preserves normal response content untouched', () => {
    const input = `**How I'm looking at this:**
- Legal area: Contract dispute
- Jurisdiction: Arizona

Here is your answer with steps to consider.`;

    const result = stripUnsafeReasoningBlocks(input);
    expect(result).toBe(input);
  });

  it('handles empty string', () => {
    expect(stripUnsafeReasoningBlocks('')).toBe('');
  });

  it('handles response with no reasoning blocks', () => {
    const input = 'A simple response with no reasoning blocks.';
    expect(stripUnsafeReasoningBlocks(input)).toBe(input);
  });

  it('removes multiple KEY_ISSUE and STATUTE lines', () => {
    const input = `KEY_ISSUE: First issue
KEY_ISSUE: Second issue
STATUTE: A.R.S. 33-1368
RISK: Deadline approaching

Your landlord must provide written notice.`;

    const result = stripUnsafeReasoningBlocks(input);
    expect(result).toBe('Your landlord must provide written notice.');
  });

  it('does not strip lines that merely contain the keywords in normal text', () => {
    const input = 'The CONFIDENCE level of the court was high in this ruling.';
    const result = stripUnsafeReasoningBlocks(input);
    expect(result).toBe(input);
  });

  it('removes a complete ANSWER_BASIS block', () => {
    const input = `---ANSWER_BASIS---
LEGAL_AREA: Family Law
JURISDICTION: California
KEY_ISSUE: Child custody modification
CONFIDENCE: high
STEP: Reviewing best-interest factors
---END_ANSWER_BASIS---

Here is the custody information.`;

    const result = stripUnsafeReasoningBlocks(input);
    expect(result).toBe('Here is the custody information.');
    expect(result).not.toContain('ANSWER_BASIS');
    expect(result).not.toContain('LEGAL_AREA');
  });

  it('removes an unclosed ANSWER_BASIS block', () => {
    const input = `---ANSWER_BASIS---
LEGAL_AREA: Immigration
STEP: Checking visa requirements
This leaked content should not appear.`;

    const result = stripUnsafeReasoningBlocks(input);
    expect(result).toBe('');
  });

  it('removes ANSWER_BASIS before THINKING_DETAILS when both present', () => {
    const input = `---ANSWER_BASIS---
LEGAL_AREA: Tax
---END_ANSWER_BASIS---
---THINKING_DETAILS---
STEP: extra reasoning
---END_THINKING_DETAILS---

Clean response here.`;

    const result = stripUnsafeReasoningBlocks(input);
    expect(result).toBe('Clean response here.');
  });
});

