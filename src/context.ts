import { Models } from "appwrite";
import { atom } from "jotai";
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

export const payloadForL1 = atom({
  chan_4: [],
  subreddits: [],
  pinterest: [],
  twitter: [],
});
