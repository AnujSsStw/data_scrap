import { atom, useAtom } from "jotai";
import { PhoneIcon, Search2Icon } from "@chakra-ui/icons";
import {
  InputGroup,
  InputLeftElement,
  Input,
  Box,
  Button,
  Skeleton,
  useDisclosure,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Tooltip,
  Radio,
  RadioGroup,
  Stack,
} from "@chakra-ui/react";
import styles from "./index.module.css";
import { type NextPage } from "next";
import Link from "next/link";
import { api } from "~/utils/api";
import { databases, functions } from "~/utils/appwrite";
import React, { Key, useContext, useState } from "react";
import { UserContext } from "~/context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { CardBox } from "~/components/Card";
import { ID } from "appwrite";
import { payloadForL1 } from "~/context";
import { InitialFocus } from "~/components/Next";

const Home: NextPage = () => {
  // const hello = api.example.hello.useQuery({ text: "from tRPC" });
  // const createCollection = api.appwrite.createCollection.useMutation();

  const [topic, setTopic] = useState<string>("");
  const [data, setData] = useState<any>({
    chan_4: [],
    subreddits: [],
    pinterest: [],
    twitter: [],
  });
  const [selected] = useAtom(payloadForL1);

  const { user } = useContext(UserContext);
  const queryClient = useQueryClient();
  const mutfn = async ({
    functionId,
    payload,
  }: {
    functionId: string;
    payload: string;
  }) => {
    return await functions.createExecution(functionId, payload);
  };

  const mutation = useMutation({
    mutationFn: mutfn,
    onSuccess: (data) => {
      console.log(data);
      queryClient.setQueryData(["search", {}], data.response);
    },
  });

  const handleSearch = async () => {
    try {
      const payload = JSON.stringify({ q: topic, limit: 10 });
      const { response } = await mutation.mutateAsync({
        functionId: "647ec5026b8a17bda432",
        payload,
      });
      // const { response } = await functions.createExecution(
      //   "64763af50eff7902e26b",
      //   payload
      // );

      const a = JSON.parse(response);
      setData({
        chan_4: a.chan_4,
        subreddits: a.subreddits,
        twitter: a.twitter,
        pinterest: a.pinterest,
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <main className={styles.main}>
        <Box maxW={"container.lg"} mt={"20"} mx={"auto"} display={"flex"}>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <Search2Icon color="gray.300" />
            </InputLeftElement>
            <Input
              type="text"
              placeholder="Topic"
              onChange={(e) => {
                setTopic(e.target.value);
              }}
            />
          </InputGroup>

          <Button colorScheme="teal" variant="outline" onClick={handleSearch}>
            serach
          </Button>
        </Box>

        {mutation.isSuccess && (
          <Box
            style={{
              display: "flex",
              marginTop: "10px",
              justifyContent: "center",
            }}
          >
            <InitialFocus q={topic} userId={user?.$id} />
          </Box>
        )}

        <Skeleton height="100vh" isLoaded={!mutation.isLoading}>
          <Box
            maxW={"container.lg"}
            mt={"20"}
            mx={"auto"}
            display={"flex"}
            gap={4}
            flexWrap={"wrap"}
            flexDirection={"row"}
          >
            {data.chan_4.map(
              (
                item: { board: string; title: string | undefined },
                idx: Key | null | undefined
              ) => {
                return (
                  <CardBox
                    title={item.board}
                    discription={item.title}
                    key={idx}
                    source="chan_4"
                  />
                );
              }
            )}
            {data.subreddits.map(
              (
                item: { subreddit: string; description: string | undefined },
                idx: Key | null | undefined
              ) => {
                return (
                  <CardBox
                    title={item.subreddit}
                    discription={item.description}
                    key={idx}
                    source="subreddits"
                  />
                );
              }
            )}
            {data.twitter.map(
              (item: { content: string }, idx: Key | null | undefined) => {
                return (
                  <CardBox title={item.content} key={idx} source="twitter" />
                );
              }
            )}
            {data.pinterest.map((item: string, idx: Key | null | undefined) => {
              return <CardBox title={item} key={idx} source="pinterest" />;
            })}
          </Box>
        </Skeleton>
      </main>
    </>
  );
};

export default Home;
