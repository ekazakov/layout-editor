import "./styles.css";
import { Canvas } from "./components/canvas";
import { useControls, Leva } from "leva";
import { useEffect } from "react";
import { globalSettingsStore } from "./stores";
import { Help } from "./components/Help";

export default function App() {
  const result = useControls({
    showNodesIds: {
      label: "Node IDs",
      value: false,
    },
    showSegmentsIds: {
      label: "Segments IDs",
      value: false,
    },
    showFixturesIds: {
      label: "Fixtures IDs",
      value: false,
    },
  });

  useEffect(() => {
    globalSettingsStore.update(result);
  }, [result]);

  return (
    <div className="App">
      <Help />
      <Leva flat={true} />
      <Canvas />
    </div>
  );
}
