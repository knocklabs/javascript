import "@knocklabs/react/dist/index.css";
import { NextSeo } from "next-seo";
import { AppProps } from "next/app";
import { Toaster } from "sonner";

import "../styles/example-specific-styles.css";
import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <NextSeo
        title="React in-app notifications example | Powered by Knock"
        description="In-app notification feed and toasts, powered by Knock"
        openGraph={{
          title: "React in-app notifications example | Powered by Knock",
          description: "In-app notification feed and toasts, powered by Knock",
          url: "https://knock-in-app-notifications-react.vercel.app",
        }}
        twitter={{
          handle: "@knocklabs",
          site: "@knocklabs",
          cardType: "summary_large_image",
        }}
      />
      <Component {...pageProps} />
      <Toaster position="bottom-right" />
    </>
  );
}

export default MyApp;
