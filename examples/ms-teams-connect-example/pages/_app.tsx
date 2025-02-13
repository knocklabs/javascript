import "@knocklabs/react/dist/index.css";
import { NextSeo } from "next-seo";
import { AppProps } from "next/app";

import "./styles.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <NextSeo
        title="MS Teams connector components example | Powered by Knock"
        description="MS Teams connector components, powered by Knock"
        openGraph={{
          title: "MS Teams connector components example | Powered by Knock",
          description: "MS Teams connector components, powered by Knock",
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
