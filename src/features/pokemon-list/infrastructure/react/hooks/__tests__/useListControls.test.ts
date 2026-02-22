import { renderHook, act } from "@testing-library/react";
import { vi, it, expect, beforeEach } from "vitest";
import { useListControls } from "../useListControls";
import * as reduxHooks from "../../../../../../shared/infrastructure/redux/hooks";

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

it("returns filterByName as empty string initially", () => {
  vi.spyOn(reduxHooks, "useAppSelector").mockReturnValue(false);
  vi.spyOn(reduxHooks, "useAppDispatch").mockReturnValue(vi.fn());

  const { result } = renderHook(() => useListControls());

  expect(result.current.filterByName).toBe("");
});

it("updates filterByName when setFilterByName is called", () => {
  vi.spyOn(reduxHooks, "useAppSelector").mockReturnValue(false);
  vi.spyOn(reduxHooks, "useAppDispatch").mockReturnValue(vi.fn());

  const { result } = renderHook(() => useListControls());

  act(() => {
    result.current.setFilterByName("char");
  });

  expect(result.current.filterByName).toBe("char");
});

it("returns filterByMinHeight as 0 initially", () => {
  vi.spyOn(reduxHooks, "useAppSelector").mockReturnValue(false);
  vi.spyOn(reduxHooks, "useAppDispatch").mockReturnValue(vi.fn());

  const { result } = renderHook(() => useListControls());

  expect(result.current.filterByMinHeight).toBe(0);
});

it("updates filterByMinHeight when setFilterByMinHeight is called", () => {
  vi.spyOn(reduxHooks, "useAppSelector").mockReturnValue(false);
  vi.spyOn(reduxHooks, "useAppDispatch").mockReturnValue(vi.fn());

  const { result } = renderHook(() => useListControls());

  act(() => {
    result.current.setFilterByMinHeight(10);
  });

  expect(result.current.filterByMinHeight).toBe(10);
});

it("returns filterByMaxHeight as 0 initially", () => {
  vi.spyOn(reduxHooks, "useAppSelector").mockReturnValue(false);
  vi.spyOn(reduxHooks, "useAppDispatch").mockReturnValue(vi.fn());

  const { result } = renderHook(() => useListControls());

  expect(result.current.filterByMaxHeight).toBe(0);
});

it("updates filterByMaxHeight when setFilterByMaxHeight is called", () => {
  vi.spyOn(reduxHooks, "useAppSelector").mockReturnValue(false);
  vi.spyOn(reduxHooks, "useAppDispatch").mockReturnValue(vi.fn());

  const { result } = renderHook(() => useListControls());

  act(() => {
    result.current.setFilterByMaxHeight(20);
  });

  expect(result.current.filterByMaxHeight).toBe(20);
});

it("returns isInvalidHeightRange as false when only min is set", () => {
  vi.spyOn(reduxHooks, "useAppSelector").mockReturnValue(false);
  vi.spyOn(reduxHooks, "useAppDispatch").mockReturnValue(vi.fn());

  const { result } = renderHook(() => useListControls());

  act(() => {
    result.current.setFilterByMinHeight(10);
  });

  expect(result.current.isInvalidHeightRange).toBe(false);
});

it("returns isInvalidHeightRange as true when min is greater than max", () => {
  vi.spyOn(reduxHooks, "useAppSelector").mockReturnValue(false);
  vi.spyOn(reduxHooks, "useAppDispatch").mockReturnValue(vi.fn());

  const { result } = renderHook(() => useListControls());

  act(() => {
    result.current.setFilterByMinHeight(15);
    result.current.setFilterByMaxHeight(5);
  });

  expect(result.current.isInvalidHeightRange).toBe(true);
});

it("returns isInvalidHeightRange as false when min equals max", () => {
  vi.spyOn(reduxHooks, "useAppSelector").mockReturnValue(false);
  vi.spyOn(reduxHooks, "useAppDispatch").mockReturnValue(vi.fn());

  const { result } = renderHook(() => useListControls());

  act(() => {
    result.current.setFilterByMinHeight(10);
    result.current.setFilterByMaxHeight(10);
  });

  expect(result.current.isInvalidHeightRange).toBe(false);
});
