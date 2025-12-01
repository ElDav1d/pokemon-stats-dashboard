import { renderHook } from "@testing-library/react";
import { vi, it, expect, beforeEach } from "vitest";
import { useListControls } from "../useListControls";
import * as reduxHooks from "../../../../../../infrastructure/redux/hooks";

beforeEach(() => {
  vi.clearAllMocks();
});

it("returns sortByHeight state", () => {
  vi.spyOn(reduxHooks, "useAppSelector").mockReturnValue(false);
  vi.spyOn(reduxHooks, "useAppDispatch").mockReturnValue(vi.fn());

  const { result } = renderHook(() => useListControls());

  expect(result.current.sortByHeight).toBe(false);
});

it("provides handleToggleSortByHeight function", () => {
  const mockDispatch = vi.fn();
  vi.spyOn(reduxHooks, "useAppSelector").mockReturnValue(false);
  vi.spyOn(reduxHooks, "useAppDispatch").mockReturnValue(mockDispatch);

  const { result } = renderHook(() => useListControls());

  expect(typeof result.current.handleToggleSortByHeight).toBe("function");
});

it("dispatches toggleSortByHeight action when handleToggleSortByHeight is called", () => {
  const mockDispatch = vi.fn();
  vi.spyOn(reduxHooks, "useAppSelector").mockReturnValue(false);
  vi.spyOn(reduxHooks, "useAppDispatch").mockReturnValue(mockDispatch);

  const { result } = renderHook(() => useListControls());

  result.current.handleToggleSortByHeight();

  expect(mockDispatch).toHaveBeenCalled();
});
