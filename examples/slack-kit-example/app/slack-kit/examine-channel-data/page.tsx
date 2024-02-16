import Link from "next/link";

import AuthenticatedContent from "./authenticated-content";

export default async function Page() {
  return (
    <>
      {process.env.KNOCK_API_KEY ? (
        <AuthenticatedContent></AuthenticatedContent>
      ) : (
        <h2>Please define your API key</h2>
      )}
      <Link href="/slack-kit/choose-slack-channel">Previous</Link>
      <Link href="/slack-kit/trigger-workflow">Next</Link>
    </>
  );
}

export const dynamic = "force-dynamic";
