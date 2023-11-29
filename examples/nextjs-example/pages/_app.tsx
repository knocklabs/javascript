import { ChakraProvider } from "@chakra-ui/react";
import { NextSeo } from "next-seo";
import { AppProps } from "next/app";

import "@knocklabs/react/dist/index.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
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
    </ChakraProvider>
  );
}

export default MyApp;
