"use client";

import { useRef, useState } from "react";
import { trackEvent, type ToolId } from "@/utils/analytics";

export default function useCalculation<Input, Result>({
  input, valid, calculate, toolId, validateResult,
}: {
  input: Input;
  valid: boolean;
  calculate: (input: Input) => Result;
  toolId: ToolId;
  validateResult?: (result: Result) => boolean;
}) {
  const [snapshot, setSnapshot] = useState(() => ({ input, result: calculate(input) }));
  const [calculationError, setCalculationError] = useState("");
  const lastTracked = useRef<string | null>(null);
  const signature = JSON.stringify(input);

  const runCalculation = () => {
    setCalculationError("");
    if (!valid) {
      trackEvent("simulation_error", { tool_id: toolId, error_code: "invalid_input" });
      return false;
    }
    const result = calculate(input);
    if (validateResult && !validateResult(result)) {
      setCalculationError("Não foi possível calcular um resultado finito. Revise os valores informados.");
      trackEvent("simulation_error", { tool_id: toolId, error_code: "non_finite_result" });
      return false;
    }
    setCalculationError("");
    setSnapshot({ input, result });
    if (lastTracked.current !== signature && trackEvent("simulation_complete", { tool_id: toolId })) {
      lastTracked.current = signature;
    }
    return true;
  };

  return { result: snapshot.result, calculatedInput: snapshot.input, calculationError, runCalculation };
}
