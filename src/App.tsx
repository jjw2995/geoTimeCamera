import { useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";

function App() {
	const [count, setCount] = useState(0);
	window.navigator.geolocation.getCurrentPosition((geo) => {
		const [lat, lon] = [geo.coords.latitude, geo.coords.longitude];
		fetch(
			// `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`
			`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
		).then((r) => {
			r.json().then((r) => {
				console.log(r);
			});
		});
	});

	return (
		<div className="App">
			<div>
				<a href="https://vitejs.dev" target="_blank">
					<img src="/vite.svg" className="logo" alt="Vite logo" />
				</a>
				<a href="https://reactjs.org" target="_blank">
					<img src={reactLogo} className="logo react" alt="React logo" />
				</a>
			</div>
			<h1>Vite + React</h1>
			<div className="card">
				<button
					onClick={() => {
						navigator.mediaDevices.getUserMedia({ video: true }).then((s) => {
							document.querySelector("video")!.srcObject = s;
						});
					}}
				></button>
				<button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
				<video autoPlay></video>
				<p>
					Edit <code>src/App.tsx</code> and save to test HMR
				</p>
			</div>
			<p className="read-the-docs">Click on the Vite and React logos to learn more</p>
		</div>
	);
}

export default App;
