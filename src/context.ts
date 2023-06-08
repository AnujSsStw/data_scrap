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

// type data = {
//   limit: number;
// };

// interface PreferencesContext {
//   data: data;
//   setData: Dispatch<
//     SetStateAction<Models.User<Models.Preferences> | undefined>
//   >;
// }
// export const PreferencesContext = createContext<PreferencesContext>({
//   data: {},
// });
export const uu = atom<Models.User<Models.Preferences> | undefined>(undefined);
