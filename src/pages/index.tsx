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
import Head from "next/head";
import Link from "next/link";
import { api } from "~/utils/api";
import { functions } from "~/utils/appwrite";
import { useState } from "react";

const Home: NextPage = () => {
  // const hello = api.example.hello.useQuery({ text: "from tRPC" });
  const [topic, setTopic] = useState<string>("");

  const handleSearch = async () => {
    try {
      const res = await functions.createExecution("6476119d046b9e082a21");
      console.log(JSON.stringify(res.response, null, 2));
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <Head>
        <title>Data Scrapper</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
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
      </main>
    </>
  );
};

export default Home;
