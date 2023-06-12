import {
  Box,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { Models, Query } from "appwrite";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { set } from "zod";
import { UserContext } from "~/context";
import { databases } from "~/utils/appwrite";

const History = () => {
  const { user } = useContext(UserContext);
  const [history, setHistory] = useState<Models.Document[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const history = async () => {
      if (user) {
        try {
          const { documents, total } = await databases.listDocuments(
            "646a0f5d434c20bf1963",
            "6484461de416c5178e30",
            [Query.equal("userId", user.$id), Query.orderAsc("q")]
          );

          console.log(documents);

          setHistory(documents);
          setLoading(false);
          if (total === 0) {
            console.log("No history");
          }
        } catch (error) {
          console.log(error);
        }
      }
    };
    history();
  }, [user]);

  return (
    <Box display={"flex"} justifyContent={"center"} pt={10}>
      {!loading ? (
        history.length > 0 ? (
          <TableContainer w={500}>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>q</Th>
                  <Th>format</Th>
                  <Th isNumeric>limit</Th>
                </Tr>
              </Thead>
              <Tbody>
                {history.map((item) => {
                  return (
                    <Tr>
                      <Td>{item.q}</Td>
                      <Td>{item.format}</Td>
                      <Td isNumeric>{item.last_limit}</Td>
                    </Tr>
                  );
                })}
              </Tbody>
              <TableCaption>History of previews searches</TableCaption>
            </Table>
          </TableContainer>
        ) : (
          <Box
            display={"flex"}
            flexDir={"column"}
            alignItems={"center"}
            gap={10}
          >
            <Text fontSize={"4xl"}>No history</Text>
            <Image
              src="/no.jpg"
              alt="no history found"
              width={500}
              height={500}
            />
          </Box>
        )
      ) : (
        <Text fontSize={"4xl"}>Loading...</Text>
      )}
    </Box>
  );
};

export default History;
