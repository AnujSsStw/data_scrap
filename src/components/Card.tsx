import {
  Card,
  Stack,
  CardBody,
  CardFooter,
  Text,
  Heading,
  Button,
} from "@chakra-ui/react";
import { useAtom } from "jotai";
import { payloadForL1 } from "~/context";

export const CardBox = ({
  title,
  discription,
  source,
}: {
  title: string;
  discription?: string;
  source: "chan_4" | "subreddits" | "pinterest" | "twitter";
}) => {
  const [selected, setSelected] = useAtom(payloadForL1);
  const handleSelect = () => {
    if (selected[source].includes(title as never)) {
      setSelected((prev) => {
        return {
          ...prev,
          [source]: prev[source].filter((item) => item !== title),
        };
      });
    } else {
      setSelected((prev) => {
        return {
          ...prev,
          [source]: [...prev[source], title],
        };
      });
    }
  };

  return (
    <Card
      direction={{ base: "row", sm: "row" }}
      overflow="hidden"
      variant="outline"
      bg={selected[source].includes(title as never) ? "green.600" : ""}
    >
      <Stack>
        <CardBody>
          <Heading size="md">{title}</Heading>

          {discription && <Text py="2">{discription}</Text>}
        </CardBody>

        <CardFooter>
          <Button variant="solid" colorScheme="blue" onClick={handleSelect}>
            Select
          </Button>
        </CardFooter>
      </Stack>
    </Card>
  );
};
