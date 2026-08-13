import { describe, expect, it } from 'vitest';
import { parseChatResponse } from '../../src/lib/chat-response-parser';

describe('parseChatResponse', () => {
  it('keeps ordinary headings out of action steps and extracts action lists', () => {
    const parsed = parseChatResponse(`## Direct Answer
Your landlord generally must return the deposit.

## Legal Background
The deadline depends on the type of tenancy.

## What You Can Do
1. **Save evidence:** Keep the lease and photos.
2. **Send a demand:** Ask for an itemized statement.

## Watch Out
- Do not miss a filing deadline.`);

    expect(parsed.actionSteps).toHaveLength(2);
    expect(parsed.actionSteps[0]).toMatchObject({ title: 'Save evidence', description: 'Keep the lease and photos.' });
    expect(parsed.summary).toContain('Your landlord');
  });

  it('extracts and deduplicates authoritative links wherever they appear', () => {
    const parsed = parseChatResponse(`See [A.R.S. Section 33-1321](https://www.azleg.gov/ars/33/01321.htm).

## Sources
- [A.R.S. Section 33-1321](https://www.azleg.gov/ars/33/01321.htm)
- [HUD tenant resources](https://www.hud.gov/states/arizona/renting)`);

    expect(parsed.sources).toHaveLength(2);
    expect(parsed.sources[0].url).toBe('https://www.azleg.gov/ars/33/01321.htm');
  });

  it('recognizes Spanish response section headings', () => {
    const parsed = parseChatResponse(`Respuesta directa: no cambie las cerraduras.

## Pasos a seguir
1. Guarde el mensaje.

## Fuentes
- [A.R.S. 33-1367](https://www.azleg.gov/ars/33/01367.htm)`);

    expect(parsed.actionSteps).toHaveLength(1);
    expect(parsed.sources).toHaveLength(1);
  });
});
