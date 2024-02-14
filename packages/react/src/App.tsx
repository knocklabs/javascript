import {
  Button,
  ButtonGroup,
  ConnectToSlackButton,
  ConnectToSlackContainer,
  KnockFeedProvider,
  KnockProvider,
  KnockSlackProvider,
} from ".";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { SlackChannelCombobox } from "./modules/slack/components/SlackChannelCombobox";

const queryClient = new QueryClient();

// Test out components here by running yarn dev:local in the package
function App() {
  const tenant = "testing-tenant";
  const user = {
    id: "123",
    email: "",
    name: "",
    phone_number: "",
    avatar: "",
    updated_at: "",
    created_at: "",
  };
  const redirectUrl = "http://localhost:3001/";

  const connectionsObject = {
    objectId: "connections-object-test",
    collection: "projects2",
  };

  const host =
    "https://345b-2603-7000-873d-e800-109-3552-ed53-e6c3.ngrok-free.app";

  const apiKey = "pk_test_ycnlyijgxki6EdqIkkOkTQzm-vxXRwaC0QWInqitOOc";

  const slackClient = "316649739635.6044366967089";

  const knockSlackChannelId = "4fbc0e97-1df9-496c-9f82-0b2fc9825c05";

  const userToken =
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJpYXQiOjE3MDc5NDExMDAsImV4cCI6MTcwNzk0NDcwMCwiZ3JhbnRzIjp7Imh0dHBzOi8vYXBpLmtub2NrLmFwcC92MS9vYmplY3RzLyR0ZW5hbnRzL3Rlc3RpbmctdGVuYW50Ijp7InNsYWNrL2NoYW5uZWxzX3JlYWQiOlt7fV19LCJodHRwczovL2FwaS5rbm9jay5hcHAvdjEvb2JqZWN0cy9wcm9qZWN0czIvY29ubmVjdGlvbnMtb2JqZWN0LXRlc3QiOnsiY2hhbm5lbF9kYXRhL3JlYWQiOlt7fV0sImNoYW5uZWxfZGF0YS93cml0ZSI6W3t9XX19fQ.GMI4lwWxZ2FOeCv6p6RUHFkLhZuJ8hLL01zIKIL_voVVujEJRKcZvKzfEoIpT698DR-BHXnZNdJjPVsDD_vbsYdKm64sFK4mh0xJ0WIwcWpQIv6S7uaXQACtjMtENGIHqt8z1M8adSY9ktxZXJ-7sOTsGMtGnvE9N0R_6vmo76xG_ijDebXMNG3uvglcgjRQ1x3hitVAJlyJeWGOJCJUf7dWpOzlxEC-_B4MWhKcfzDh9lO7EEB3zKwTcZx4ephWqcNlIlYee8_7jhCE-1xGmudy2WSI5j5GmNG2ikDt7Ctiig7Hb4C9fvOFruv7baPDtk2fPA37-gUmTCvriSwTcsyLK7tJiXZrK9CSX4LiX5l7bq3eFuYdijqq63UGbpw4P2538fYPXMC-jRDV8KkrUT8InsS-ZzVIa3Hv-tMit71tGkakbWc90cX2AFEklNJAvX6wGclQbAcIw5eciiFnJxUqdN0l_DXBfr3q8sCbrEHJn2ZzBykxi5yPw5KJQVQEpH0igk6actR6kTrqA-Vw_PzScoQCFVbtxpwlSvW8bIaXS3d8t-tf7WvO75MYfLcqziNBW0jhdJqaN55YZjyjdiDEYAKWcKIULaHisOlnlw6ZrtCQR7VE6k7V0QSuxhxKaSqxgQ6YjsxG8KtPtDvjPgV6NDzJjIlrNj7QUeVf_Mg";

  return (
    <KnockProvider
      apiKey={apiKey}
      userId={user.id}
      host={host}
      userToken={userToken}
    >
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

          <KnockSlackProvider
            knockSlackChannelId={knockSlackChannelId}
            tenant={tenant}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div
                  style={{
                    marginBottom: "10px",
                    marginTop: "40px",
                    fontFamily: "monospace",
                    fontSize: "25px",
                    color: "gray",
                  }}
                >
                  Slack Combobox
                </div>
                <div style={{ margin: "10px", padding: "10px" }}>
                  <SlackChannelCombobox connectionsObject={connectionsObject} />
                </div>
              </div>
              <div>
                <div
                  style={{
                    marginBottom: "10px",
                    marginTop: "40px",
                    fontFamily: "monospace",
                    fontSize: "25px",
                    color: "gray",
                  }}
                >
                  Slack Connector options
                </div>

                <div>
                  <div
                    style={{
                      marginBottom: "10px",
                      marginTop: "40px",
                      fontFamily: "monospace",
                      fontSize: "18px",
                      color: "gray",
                    }}
                  >
                    Button
                  </div>
                  <div style={{ margin: "10px", padding: "10px" }}>
                    <ConnectToSlackButton
                      slackClientId={slackClient}
                      redirectUrl={redirectUrl}
                    />
                  </div>
                </div>

                <div
                  style={{
                    marginBottom: "10px",
                    marginTop: "40px",
                    fontFamily: "monospace",
                    fontSize: "18px",
                    color: "gray",
                  }}
                >
                  Container with button
                </div>
                <div style={{ margin: "10px", padding: "10px" }}>
                  <ConnectToSlackContainer
                    actionButton={
                      <ConnectToSlackButton
                        slackClientId={slackClient}
                        redirectUrl={redirectUrl}
                      />
                    }
                  />
                </div>
              </div>
            </div>
          </KnockSlackProvider>
        </main>
      </KnockFeedProvider>
    </KnockProvider>
  );
}

export default App;
