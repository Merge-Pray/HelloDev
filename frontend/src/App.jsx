import "./App.css";
import { Outlet } from "react-router";

function App() {
  return (
    <div>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default App;
