import { Button, ButtonGroup } from ".";

// Test out components here by running yarn dev:local in the package
function App() {
  return (
    <div>
      <h1>@knocklabs/react playground</h1>
      <ButtonGroup>
        <Button
          variant="primary"
          onClick={() => {
            console.log("Clicked!");
          }}
        >
          Primary
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            console.log("Clicked!");
          }}
        >
          Secondary
        </Button>
      </ButtonGroup>
    </div>
  );
}

export default App;
