import { it, expect } from 'vitest';
import listControlsReducer, { toggleSortByHeight } from '../listControlsSlice';

const initialState = {
  sortByHeight: false,
};

it('should return initial state when reducer receives unknown action', () => {
  expect(listControlsReducer(undefined, { type: 'unknown' })).toEqual(
    initialState
  );
});

it('should toggle sortByHeight from false to true', () => {
  const result = listControlsReducer(initialState, toggleSortByHeight());
  expect(result.sortByHeight).toBe(true);
});

it('should toggle sortByHeight from true to false', () => {
  const previousState = { sortByHeight: true };
  const result = listControlsReducer(previousState, toggleSortByHeight());
  expect(result.sortByHeight).toBe(false);
});

it('should handle multiple toggle operations correctly', () => {
  let state = initialState;

  state = listControlsReducer(state, toggleSortByHeight()); // true
  expect(state.sortByHeight).toBe(true);

  state = listControlsReducer(state, toggleSortByHeight()); // false
  expect(state.sortByHeight).toBe(false);

  state = listControlsReducer(state, toggleSortByHeight()); // true
  expect(state.sortByHeight).toBe(true);
});
