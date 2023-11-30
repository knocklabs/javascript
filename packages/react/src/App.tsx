import { Button, ButtonGroup, KnockFeedProvider } from ".";

// Test out components here by running yarn dev:local in the package
function App() {
  return (
    <KnockFeedProvider apiKey={""} feedId={""} userId={""}>
      <main>
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
      </main>
    </KnockFeedProvider>
  );
}

export default App;
