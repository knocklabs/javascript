import Link from "next/link";

export default function Page() {
  const envVars = [
    { name: "Slack Client Id", value: process.env.NEXT_PUBLIC_SLACK_CLIENT_ID },
    {
      name: "Knock Slack Channel Id",
      value: process.env.NEXT_PUBLIC_KNOCK_SLACK_CHANNEL_ID,
    },
    {
      name: "Knock Public API Key",
      value: process.env.NEXT_PUBLIC_KNOCK_CLIENT_ID,
    },
    {
      name: "Knock Private API Key",
      value: process.env.KNOCK_API_KEY,
    },
  ];

  return (
    <>
      <h2>Welcome to the SlackKit example app</h2>
      <p>
        Using this app, you'll learn how to use Knock's SlackKit components to
        make working with Slack apps easy. In this step, we'll check to make
        sure you have the right environment variables declared to work with the
        Knock SDK and Slack.
      </p>
      {envVars.map((envVar) => {
        return (
          <p>
            {envVar.value ? "✅" : "❌"}&nbsp;
            {envVar.name}
          </p>
        );
      })}
      <Link href="/slack-kit/confirm-knock-resources">Next</Link>
    </>
  );
}
