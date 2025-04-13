import { useState } from "react";
import { Button } from "./components/ui/button";

function App() {
	const [count, setCount] = useState(0);

	return (
		<div className="flex flex-col items-center justify-center w-screen min-h-svh">
			<Button variant="secondary">Click me</Button>
		</div>
	);
}

export default App;
