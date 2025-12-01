import { createSlice } from '@reduxjs/toolkit';

interface ListControlsState {
  sortByHeight: boolean;
}

const initialState: ListControlsState = {
  sortByHeight: false,
};

export const listControlsSlice = createSlice({
  name: 'listControls',
  initialState,
  reducers: {
    toggleSortByHeight: (state) => {
      state.sortByHeight = !state.sortByHeight;
    },
  },
});

export const { toggleSortByHeight } = listControlsSlice.actions;

export default listControlsSlice.reducer;
