import { describe, it, expect } from 'vitest';
import spanishLowIncomeData from '../evals/legal-safety/spanish-low-income.json';
import smbData from '../evals/legal-safety/smb.json';
import proBono from '../evals/legal-safety/pro-bono.json';

type EvalSuite = {
  suite: string;
  description: string;
  cases: Array<{
    id: string;
    jurisdiction: string;
    userFacts: string;
    language: string;
    expectedSafeBehavior: string;
    requiredDisclaimer: string;
    requiredHandoff: string;
    prohibitedClaims: string[];
  }>;
};

const allSuites: EvalSuite[] = [spanishLowIncomeData, smbData, proBono];

describe('AI Legal Safety Evaluation Harness', () => {
  describe('Structure validation', () => {
    it('should load all eval suite files', () => {
      expect(allSuites).toHaveLength(3);
      expect(spanishLowIncomeData.suite).toBe('spanish_low_income');
      expect(smbData.suite).toBe('smb');
      expect(proBono.suite).toBe('pro_bono_legal_aid');
    });

    it('should have descriptions for all suites', () => {
      allSuites.forEach((suite) => {
        expect(suite.description).toBeTruthy();
        expect(typeof suite.description).toBe('string');
        expect(suite.description.length).toBeGreaterThan(0);
      });
    });

    it('should have cases array for each suite', () => {
      allSuites.forEach((suite) => {
        expect(Array.isArray(suite.cases)).toBe(true);
        expect(suite.cases.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Case structure validation', () => {
    it('should have all required fields in each case', () => {
      const requiredFields = [
        'id',
        'jurisdiction',
        'userFacts',
        'language',
        'expectedSafeBehavior',
        'requiredDisclaimer',
        'requiredHandoff',
        'prohibitedClaims',
      ];

      allSuites.forEach((suite) => {
        suite.cases.forEach((testCase) => {
          requiredFields.forEach((field) => {
            expect(testCase).toHaveProperty(field);
            expect(testCase[field as keyof typeof testCase]).toBeDefined();
          });
        });
      });
    });

    it('should have valid case IDs', () => {
      const seenIds = new Set<string>();

      allSuites.forEach((suite) => {
        suite.cases.forEach((testCase) => {
          expect(testCase.id).toMatch(/^[a-z0-9-]+$/);
          expect(seenIds.has(testCase.id)).toBe(false);
          seenIds.add(testCase.id);
        });
      });
    });

    it('should have non-empty userFacts and expectedSafeBehavior', () => {
      allSuites.forEach((suite) => {
        suite.cases.forEach((testCase) => {
          expect(testCase.userFacts).toBeTruthy();
          expect(testCase.expectedSafeBehavior).toBeTruthy();
        });
      });
    });

    it('should have prohibitedClaims as non-empty arrays', () => {
      allSuites.forEach((suite) => {
        suite.cases.forEach((testCase) => {
          expect(Array.isArray(testCase.prohibitedClaims)).toBe(true);
          expect(testCase.prohibitedClaims.length).toBeGreaterThan(0);
          testCase.prohibitedClaims.forEach((claim) => {
            expect(typeof claim).toBe('string');
            expect(claim.length).toBeGreaterThan(0);
          });
        });
      });
    });
  });

  describe('Jurisdiction validation', () => {
    it('should have jurisdiction for all cases', () => {
      allSuites.forEach((suite) => {
        suite.cases.forEach((testCase) => {
          expect(testCase.jurisdiction).toBeTruthy();
          expect(typeof testCase.jurisdiction).toBe('string');
        });
      });
    });

    it('should have valid US jurisdictions', () => {
      const validJurisdictions = [
        'Arizona',
        'California',
        'Texas',
        'Florida',
        'New York',
        'Illinois',
      ];

      allSuites.forEach((suite) => {
        suite.cases.forEach((testCase) => {
          expect(validJurisdictions).toContain(testCase.jurisdiction);
        });
      });
    });
  });

  describe('Language and disclaimer validation', () => {
    it('should have valid language codes', () => {
      allSuites.forEach((suite) => {
        suite.cases.forEach((testCase) => {
          expect(['en', 'es']).toContain(testCase.language);
        });
      });
    });

    it('should have Spanish disclaimers for Spanish cases', () => {
      allSuites.forEach((suite) => {
        suite.cases.forEach((testCase) => {
          if (testCase.language === 'es') {
            expect(testCase.requiredDisclaimer.toLowerCase()).toContain(
              'informacion legal'
            );
          }
        });
      });
    });

    it('should have English disclaimers for English cases', () => {
      allSuites.forEach((suite) => {
        suite.cases.forEach((testCase) => {
          if (testCase.language === 'en') {
            expect(testCase.requiredDisclaimer.toLowerCase()).toContain(
              'legal information'
            );
          }
        });
      });
    });

    it('should not include prohibited claims as affirmative statements in disclaimers', () => {
      allSuites.forEach((suite) => {
        suite.cases.forEach((testCase) => {
          testCase.prohibitedClaims.forEach((claim) => {
            const disclaimerLower = testCase.requiredDisclaimer.toLowerCase();
            const claimLower = claim.toLowerCase();
            // A disclaimer may reference a claim in negating context (e.g., "not legal advice")
            // Only flag if the claim appears WITHOUT a preceding negation
            if (disclaimerLower.includes(claimLower)) {
              const idx = disclaimerLower.indexOf(claimLower);
              const before = disclaimerLower.slice(Math.max(0, idx - 5), idx);
              const isNegated = /\bnot?\b|no\b/.test(before);
              expect(isNegated).toBe(true);
            }
          });
        });
      });
    });
  });

  describe('Handoff validation', () => {
    it('should have valid handoff types', () => {
      const validHandoffs = [
        'legal_aid_referral',
        'crisis_escalation',
        'attorney_referral',
        'attorney_review_suggestion',
        'none_required',
      ];

      allSuites.forEach((suite) => {
        suite.cases.forEach((testCase) => {
          expect(validHandoffs).toContain(testCase.requiredHandoff);
        });
      });
    });

    it('should require crisis_escalation for domestic violence cases', () => {
      const dvCase = spanishLowIncomeData.cases.find((c) => c.id === 'es-dv-002');
      expect(dvCase?.requiredHandoff).toBe('crisis_escalation');
    });

    it('should require attorney handoff for complex matters', () => {
      const immigrationCase = spanishLowIncomeData.cases.find(
        (c) => c.id === 'es-immigration-004'
      );
      expect(immigrationCase?.requiredHandoff).toBe('attorney_referral');
    });
  });

  describe('Eval report summary', () => {
    it('should generate evaluation report', () => {
      let totalCases = 0;
      let totalClaims = 0;
      const jurisdictionMap = new Map<string, number>();
      const languageMap = new Map<string, number>();
      const handoffMap = new Map<string, number>();

      allSuites.forEach((suite) => {
        suite.cases.forEach((testCase) => {
          totalCases++;
          totalClaims += testCase.prohibitedClaims.length;

          jurisdictionMap.set(
            testCase.jurisdiction,
            (jurisdictionMap.get(testCase.jurisdiction) || 0) + 1
          );
          languageMap.set(
            testCase.language,
            (languageMap.get(testCase.language) || 0) + 1
          );
          handoffMap.set(
            testCase.requiredHandoff,
            (handoffMap.get(testCase.requiredHandoff) || 0) + 1
          );
        });
      });

      const report = {
        totalSuites: allSuites.length,
        totalCases,
        totalProhibitedClaims: totalClaims,
        suites: allSuites.map((s) => s.suite),
        jurisdictions: Array.from(jurisdictionMap.entries()).map(([j, c]) => ({
          jurisdiction: j,
          caseCount: c,
        })),
        languages: Array.from(languageMap.entries()).map(([l, c]) => ({
          language: l,
          caseCount: c,
        })),
        handoffs: Array.from(handoffMap.entries()).map(([h, c]) => ({
          handoffType: h,
          caseCount: c,
        })),
      };

      expect(report.totalSuites).toBe(3);
      expect(report.totalCases).toBe(10);
      expect(report.totalProhibitedClaims).toBeGreaterThan(0);

      console.log('\n=== AI Legal Safety Evaluation Report ===');
      console.log(`Total Suites: ${report.totalSuites}`);
      console.log(`Total Evaluation Cases: ${report.totalCases}`);
      console.log(`Total Prohibited Claims: ${report.totalProhibitedClaims}`);
      console.log(`\nSuites: ${report.suites.join(', ')}`);

      console.log('\nJurisdiction Coverage:');
      report.jurisdictions.forEach(({ jurisdiction, caseCount }) => {
        console.log(`  ${jurisdiction}: ${caseCount} case(s)`);
      });

      console.log('\nLanguage Coverage:');
      report.languages.forEach(({ language, caseCount }) => {
        console.log(`  ${language}: ${caseCount} case(s)`);
      });

      console.log('\nHandoff Types:');
      report.handoffs.forEach(({ handoffType, caseCount }) => {
        console.log(`  ${handoffType}: ${caseCount} case(s)`);
      });
    });
  });
});
