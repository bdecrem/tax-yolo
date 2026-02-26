import { useCallback } from 'react';
import { useTaxStore } from '../store/taxStore';
import { computeFederalTax } from '../computations/federal/pipeline';
import { computeCaliforniaTax } from '../computations/california/pipeline';

export function useComputation() {
  const { input, setResults, federalResult, californiaResult } = useTaxStore();

  const compute = useCallback(() => {
    try {
      const priorYearTax = 0; // Set to prior year total if known

      const federal = computeFederalTax(input, priorYearTax);
      const california = computeCaliforniaTax(
        input,
        federal.income.agi,
        federal.scheduleA
      );
      setResults(federal, california);
      return { federal, california, error: null };
    } catch (error) {
      return { federal: null, california: null, error: String(error) };
    }
  }, [input, setResults]);

  return { compute, federalResult, californiaResult };
}
