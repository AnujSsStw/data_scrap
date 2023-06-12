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

export interface Payload {
  chan_4: string[];
  subreddits: string[];
  pinterest: string[];
  twitter: string[];
}
export const payloadForL1 = atom<Payload>({
  chan_4: [],
  subreddits: [],
  pinterest: [],
  twitter: [],
});

export const preview_data = atom<{
  preview_data: any[];
}>({
  preview_data: [],
});

export const createdBucketId = atom("");

export const createdDocId = atom("");
