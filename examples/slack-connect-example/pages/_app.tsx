import "@knocklabs/react/dist/index.css";
import { NextSeo } from "next-seo";
import { AppProps } from "next/app";

import "../components/toggleSwitchStyles.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <NextSeo
        title="Slack connector components example | Powered by Knock"
        description="Slack connector components, powered by Knock"
        openGraph={{
          title: "Slack connector components example | Powered by Knock",
          description: "Slack connector components, powered by Knock",
        }}
        twitter={{
          handle: "@knocklabs",
          site: "@knocklabs",
          cardType: "summary_large_image",
        }}
      />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
