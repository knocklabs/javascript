import "@knocklabs/react/dist/index.css";
import "../styles/globals.css";
import { NextSeo } from "next-seo";
import { AppProps } from "next/app";
import { createSystem, defaultConfig, ChakraProvider } from "@chakra-ui/react"
import { Toaster } from "sonner";

const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      fonts: {
        heading: { value: `'Figtree', sans-serif` },
        body: { value: `'Figtree', sans-serif` },
      },
    },
  },
})

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider value={system}>
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
    </ChakraProvider>
  );
}

export default MyApp;
