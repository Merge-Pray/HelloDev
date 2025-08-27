import Avatar from "./Avatar.jsx";

export default function App() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Avatar-Generator (32×32)</h1>
      <Avatar sizePx={512} gridSize={32} />
    </div>
  );
}