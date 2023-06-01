import { type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import { ChakraProvider } from "@chakra-ui/react";
import { WithSubnavigation } from "~/components/Navbar";
import { useRouter } from "next/router";
import { UserContext } from "~/context";
import { useMemo, useState } from "react";
import { Models } from "appwrite";

const MyApp: AppType = ({ Component, pageProps }) => {
  const router = useRouter();
  const [user, setUser] = useState<Models.User<Models.Preferences>>();

  const providerValue = useMemo(() => ({ user, setUser }), [user, setUser]);

  return (
    <ChakraProvider>
      <UserContext.Provider value={providerValue}>
        {router.pathname == "/error" ? "" : <WithSubnavigation />}
        <Component {...pageProps} />
      </UserContext.Provider>
    </ChakraProvider>
  );
};

export default api.withTRPC(MyApp);
