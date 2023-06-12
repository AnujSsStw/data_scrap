import { type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import { ChakraProvider } from "@chakra-ui/react";
import { WithSubnavigation } from "~/components/Navbar";
import { useRouter } from "next/router";
import { UserContext } from "~/context";
import { useMemo, useState } from "react";
import { Models } from "appwrite";
import { Provider as JotaiProvider } from "jotai";
import Head from "next/head";

const MyApp: AppType = ({ Component, pageProps }) => {
  const router = useRouter();
  const [user, setUser] = useState<Models.User<Models.Preferences>>();

  const providerValue = useMemo(() => ({ user, setUser }), [user, setUser]);

  return (
    <>
      <Head>
        <title>Data Scrapper</title>
        <meta
          name="description"
          content="site to generate data on a certain topic"
        />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <ChakraProvider>
        <UserContext.Provider value={providerValue}>
          {router.pathname == "/error" ? "" : <WithSubnavigation />}
          <JotaiProvider>
            <Component {...pageProps} />
          </JotaiProvider>
        </UserContext.Provider>
      </ChakraProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
