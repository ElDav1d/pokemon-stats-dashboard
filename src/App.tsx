import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import { paths } from "./lib/constants";
import { lazy, Suspense } from "react";
import { store } from "./shared/infrastructure/redux/store";

// React's lazy() expects the imported module to have a default export
const Home = lazy(() => import("./pages/Home/Home"));
const Detail = lazy(() => import("./pages/Detail/Detail"));

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Suspense fallback={<h1>Loading...</h1>}>
          <Routes>
            <Route path={paths.BASE} element={<Home />} />
            <Route path={`${paths.BASE}${paths.DETAIL}`} element={<Detail />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
