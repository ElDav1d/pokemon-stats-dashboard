import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Detail } from "./pages/Detail";
import { paths } from "./lib/constants";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path={paths.BASE} element={<Home />} />
          <Route path={`${paths.BASE}${paths.DETAIL}`} element={<Detail />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
