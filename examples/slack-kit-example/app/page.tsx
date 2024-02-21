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
    {
      name: "Redirect URL (your application URL)",
      value: process.env.NEXT_PUBLIC_REDIRECT_URL,
    },
  ];

  return (
    <>
      <h2 className="text-xl font-bold my-4">
        Confirm your environment variables
      </h2>
      <p className="mb-4">
        Using this app, you&apos;ll learn how to use Knock&apos;s SlackKit
        components to make working with Slack apps easy. In this step,
        we&apos;ll check to make sure you have the right environment variables
        declared to work with the Knock SDK and Slack.
      </p>
      {envVars.map((envVar) => {
        return (
          <p key={envVar.name} className="mt-2 font-medium">
            {envVar.value ? "✅" : "❌"}&nbsp;
            {envVar.name}
          </p>
        );
      })}
      <Link
        className="mt-6 inline-block bg-[#E95744] text-white p-2 rounded-md hover:bg-[#E64733]"
        href="/confirm-knock-resources"
      >
        Next
      </Link>
    </>
  );
}

export const dynamic = "force-dynamic";
