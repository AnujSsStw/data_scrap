import { Models } from "appwrite";
import { Dispatch, SetStateAction, createContext } from "react";

interface UserContext {
  user: Models.User<Models.Preferences> | undefined;
  setUser: Dispatch<
    SetStateAction<Models.User<Models.Preferences> | undefined>
  >;
}
export const UserContext = createContext<UserContext>({
  user: undefined,
  setUser: () => {},
});
