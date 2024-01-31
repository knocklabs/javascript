import {
  Button,
  ButtonGroup,
  ConnectToSlackButton,
  ConnectToSlackContainer,
  KnockFeedProvider,
  KnockProvider,
} from ".";

// Test out components here by running yarn dev:local in the package
function App() {
  return (
    <KnockProvider apiKey={""} userId={""}>
      <KnockFeedProvider feedId={""}>
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
    </KnockProvider>
  );
}

export default App;
