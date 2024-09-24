import Knock, {
  InAppChannelClient,
  InAppMessageClient,
} from "@knocklabs/client";
import { GenericData } from "@knocklabs/types";
import { useEffect, useState } from "react";

const knockClient = new Knock(import.meta.env.VITE_KNOCK_API_KEY!, {
  host: import.meta.env.VITE_KNOCK_HOST,
});

knockClient.authenticate(import.meta.env.VITE_KNOCK_USER_ID!);

const inAppChannelClient = new InAppChannelClient(
  knockClient,
  import.meta.env.VITE_KNOCK_CHANNEL_ID,
);

const inAppMessageClient = new InAppMessageClient(
  inAppChannelClient,
  "banner",
  {},
);

function App() {
  const [response, setResponse] = useState<GenericData>({});

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      const response = await inAppMessageClient.fetch();
      setResponse(response as GenericData);
    }, 500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <>
      <h1>Knock In-App Message Example</h1>
      <hr />
      <h2>Env</h2>
      <pre>{JSON.stringify(import.meta.env, null, 2)}</pre>
      <hr />
      <h2>Banner</h2>
      <pre>{JSON.stringify(response, null, 2)}</pre>
      <hr />
      <h2>State</h2>
      <pre>{JSON.stringify(inAppChannelClient.store.state, null, 2)}</pre>
    </>
  );
}

export default App;
