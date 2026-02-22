import { useState } from "react";
import {
  useAppDispatch,
  useAppSelector,
} from "../../../../../shared/infrastructure/redux/hooks";
import { toggleSortByHeight } from "../../redux/slices/listControlsSlice";
import { RootState } from "../../../../../shared/infrastructure/redux/store";

export const useListControls = () => {
  const dispatch = useAppDispatch();
  const sortByHeight = useAppSelector(
    (state: RootState) => state.listControls.sortByHeight
  );

  const handleToggleSortByHeight = () => {
    dispatch(toggleSortByHeight());
  };

  const [filterByName, setFilterByName] = useState("");
  const [filterByMinHeight, setFilterByMinHeight] = useState(0);
  const [filterByMaxHeight, setFilterByMaxHeight] = useState(0);

  const isInvalidHeightRange =
    filterByMinHeight > 0 && filterByMaxHeight > 0 && filterByMinHeight > filterByMaxHeight;

  return {
    sortByHeight,
    handleToggleSortByHeight,
    filterByName,
    setFilterByName,
    filterByMinHeight,
    setFilterByMinHeight,
    filterByMaxHeight,
    setFilterByMaxHeight,
    isInvalidHeightRange,
  };
};
