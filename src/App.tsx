import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home";
import { Detail } from "./pages/Detail";
import { paths } from "./lib/constants";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={paths.BASE} element={<Home />} />
        <Route path={`${paths.BASE}${paths.DETAIL}`} element={<Detail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
