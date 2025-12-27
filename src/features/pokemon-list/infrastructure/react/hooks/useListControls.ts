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

  return {
    sortByHeight,
    handleToggleSortByHeight,
  };
};
