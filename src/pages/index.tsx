import { Search2Icon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Skeleton,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { type NextPage } from "next";
import { Key, useContext, useState } from "react";
import { CardBox } from "~/components/Card";
import { InitialFocus } from "~/components/Next";
import { UserContext, payloadForL1 } from "~/context";
import { functions } from "~/utils/appwrite";
import styles from "./index.module.css";

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
  const [_, setSelected] = useAtom(payloadForL1);

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
      queryClient.setQueryData(["search", {}], data.response);
    },
  });

  const toast = useToast();

  const handleSearch = async () => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please login to continue",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      return;
    } else if (topic === "") {
      toast({
        title: "No topic",
        description: "Please enter a topic",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      return;
    }

    setData({
      chan_4: [],
      subreddits: [],
      twitter: [],
      pinterest: [],
    });

    try {
      const payload = JSON.stringify({ q: topic, limit: 10 });

      const { response } = await mutation.mutateAsync({
        functionId: "647ec5026b8a17bda432",
        payload,
      });

      if (response === "") {
        alert("No data found");
        return;
      }

      const a = JSON.parse(response);
      setData({
        chan_4: a.chan_4,
        subreddits: a.subreddits,
        twitter: a.twitter,
        pinterest: a.pinterest,
      });
      setSelected({ chan_4: [], subreddits: [], twitter: [], pinterest: [] });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <main className={styles.main}>
        <Box
          maxW={"container.lg"}
          mt={"20"}
          mx={"auto"}
          display={"flex"}
          gap={5}
        >
          <InputGroup maxW={"4xl"}>
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
              // marginTop: "10px",
              justifyContent: "center",
              position: "fixed",
              bottom: "10px",
              left: "50%",
              transform: "translateX(-50%)",
              padding: "10px",
              zIndex: 100,
            }}
          >
            <InitialFocus q={topic} userId={user?.$id} />
          </Box>
        )}

        <Skeleton
          height="100vh"
          isLoaded={!mutation.isLoading}
          maxW={"container.lg"}
          mt={"20"}
          mx={"auto"}
          display={"flex"}
          gap={4}
          flexWrap={"wrap"}
          flexDirection={"row"}
          borderRadius={"md"}
        >
          {/* <Box> */}
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
          {data.pinterest.map((item: string, idx: Key | null | undefined) => {
            return (
              <Flex flexDir={"column"} gap={4} key={idx}>
                <Text>
                  Highly recommend it, especially if the topic is widely known
                  or popular &#9660;
                </Text>
                <CardBox title={item} source="pinterest" />
              </Flex>
            );
          })}
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
          {data.twitter.map(
            (
              item: { content: string; media: Object; likes: number },
              idx: Key | null | undefined
            ) => {
              return (
                <CardBox
                  title={item.content}
                  key={idx}
                  source="twitter"
                  media={item.media}
                  likes={item.likes}
                />
              );
            }
          )}
          {/* </Box> */}
        </Skeleton>
      </main>
    </>
  );
};

export default Home;
