import "./styles.css";
import { Canvas } from "./components/canvas";
import { Help } from "./components/Help";

export default function App() {
  return (
    <div className="App">
      <Help />
      <Canvas />
    </div>
  );
}
