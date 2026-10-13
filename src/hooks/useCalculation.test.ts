// @vitest-environment-options {"url":"https://lemohr.com.br/"}
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { advertisingConfig } from "@/config/advertising";
import useCalculation from "./useCalculation";

beforeEach(() => {
  localStorage.setItem(advertisingConfig.consentStorageKey, "granted");
  window.gtag = vi.fn();
});
afterEach(() => {
  localStorage.clear();
  delete window.gtag;
});

describe("useCalculation", () => {
  it("preserves the initial example until explicit calculation and deduplicates unchanged confirmations", () => {
    const calculate = vi.fn((input: number) => input * 2);
    const { result, rerender } = renderHook(({ input }) => useCalculation({
      input, valid: true, calculate, toolId: "juros-compostos",
    }), { initialProps: { input: 1 } });
    expect(result.current.result).toBe(2);
    expect(window.gtag).not.toHaveBeenCalled();
    rerender({ input: 3 });
    expect(result.current.result).toBe(2);
    expect(calculate).toHaveBeenCalledTimes(1);
    act(() => result.current.runCalculation());
    expect(result.current.result).toBe(6);
    act(() => result.current.runCalculation());
    expect(window.gtag).toHaveBeenCalledExactlyOnceWith("event", "simulation_complete", {
      tool_id: "juros-compostos", page_path: "/",
    });
  });

  it("rejects invalid submissions without recomputing or overwriting the previous result", () => {
    const calculate = vi.fn((input: number) => input * 2);
    const { result, rerender } = renderHook(({ input, valid }) => useCalculation({
      input, valid, calculate, toolId: "juros-compostos",
    }), { initialProps: { input: 1, valid: true } });
    rerender({ input: -1, valid: false });
    act(() => result.current.runCalculation());
    expect(result.current.result).toBe(2);
    expect(calculate).toHaveBeenCalledTimes(1);
    expect(window.gtag).toHaveBeenCalledExactlyOnceWith("event", "simulation_error", {
      tool_id: "juros-compostos", error_code: "invalid_input", page_path: "/",
    });
  });

  it("surfaces non-finite results and never reports them as completion", () => {
    const { result, rerender } = renderHook(({ input }) => useCalculation({
      input, valid: true, calculate: (value: number) => value * 2,
      validateResult: Number.isFinite, toolId: "conversor-de-taxas",
    }), { initialProps: { input: 1 } });
    rerender({ input: Number.MAX_VALUE });
    act(() => result.current.runCalculation());
    expect(result.current.result).toBe(2);
    expect(result.current.calculationError).toContain("resultado finito");
    expect(window.gtag).toHaveBeenCalledExactlyOnceWith("event", "simulation_error", {
      tool_id: "conversor-de-taxas", error_code: "non_finite_result", page_path: "/",
    });
  });

  it("keeps calculation available without consent and can track a later confirmation after acceptance", () => {
    localStorage.setItem(advertisingConfig.consentStorageKey, "denied");
    const { result } = renderHook(() => useCalculation({
      input: 1, valid: true, calculate: (input: number) => input * 2, toolId: "primeiro-milhao",
    }));
    act(() => result.current.runCalculation());
    expect(result.current.result).toBe(2);
    expect(window.gtag).not.toHaveBeenCalled();
    localStorage.setItem(advertisingConfig.consentStorageKey, "granted");
    act(() => result.current.runCalculation());
    expect(window.gtag).toHaveBeenCalledTimes(1);
  });
});
