import { atom, useAtom } from "jotai";
import { PhoneIcon, Search2Icon } from "@chakra-ui/icons";
import {
  InputGroup,
  InputLeftElement,
  Input,
  Box,
  Button,
} from "@chakra-ui/react";
import styles from "./index.module.css";
import { type NextPage } from "next";
import Link from "next/link";
import { api } from "~/utils/api";
import { functions } from "~/utils/appwrite";
import { useContext, useState } from "react";
import { UserContext, payloadForL1 } from "~/context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { CardBox } from "~/components/Card";

const Home: NextPage = () => {
  // const hello = api.example.hello.useQuery({ text: "from tRPC" });
  // const createCollection = api.appwrite.createCollection.useMutation();

  const [topic, setTopic] = useState<string>("");
  const [data, setData] = useState({
    chan_4: [],
    subreddits: [],
    pinterest: [],
    twitter: [],
  });

  // const { user } = useContext(UserContext);
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

        {
          <Link
            href={{
              pathname: "/options",
            }}
            style={{
              display: "flex",
              marginTop: "10px",
              justifyContent: "center",
            }}
          >
            <Button variant="ghost" colorScheme="blue">
              Next
            </Button>
          </Link>
        }

        <Box
          maxW={"container.lg"}
          mt={"20"}
          mx={"auto"}
          display={"flex"}
          gap={4}
          flexWrap={"wrap"}
          flexDirection={"row"}
        >
          {data.chan_4.map((item, idx) => {
            return (
              <CardBox
                title={item.board}
                discription={item.title}
                key={idx}
                source="chan_4"
              />
            );
          })}
          {data.subreddits.map((item, idx) => {
            return (
              <CardBox
                title={item.subreddit}
                discription={item.description}
                key={idx}
                source="subreddits"
              />
            );
          })}
          {data.twitter.map((item, idx) => {
            return <CardBox title={item.content} key={idx} source="twitter" />;
          })}
          {data.pinterest.map((item, idx) => {
            return <CardBox title={item} key={idx} source="pinterest" />;
          })}
        </Box>
      </main>
    </>
  );
};

export default Home;
