import {
  Button,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Stack,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import { ID, Query } from "appwrite";
import { useAtom } from "jotai";
import { useRouter } from "next/router";
import React from "react";
import { createdBucketId, createdDocId, cursor, payloadForL1 } from "~/context";
import { databases } from "~/utils/appwrite";

export function InitialFocus({
  q,
  userId,
}: {
  q: string;
  userId: string | undefined;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const initialRef = React.useRef(null);
  const finalRef = React.useRef(null);

  const [sliderValue, setSliderValue] = React.useState(10);
  const [showTooltip, setShowTooltip] = React.useState(false);
  const [value, setValue] = React.useState("json");

  const [selected] = useAtom(payloadForL1);

  const router = useRouter();
  const [, setBukId] = useAtom(createdBucketId);
  const [, setDocId] = useAtom(createdDocId);
  const [, setCursor] = useAtom(cursor);

  async function userDocCheck() {
    try {
      const { documents } = await databases.listDocuments(
        "648845ce0fe8f2d33b33",
        "648845d55f47e495074e",
        [
          Query.equal("q", q),
          Query.equal("userId", userId as string),
          Query.equal("format", value.toUpperCase()),
        ]
      );

      if (documents.length > 0 && documents[0]?.$id) {
        console.log("updating doc");
        const res = await databases.updateDocument(
          "648845ce0fe8f2d33b33",
          "648845d55f47e495074e",
          documents[0]?.$id as string,
          {
            last_limit: sliderValue + documents[0]!.last_limit,
          }
        );
        setDocId(res.$id);
        setCursor(documents[0]!.file_cursor);
      } else {
        console.log("no doc");
        const res = await databases.createDocument(
          "648845ce0fe8f2d33b33",
          "648845d55f47e495074e",
          ID.unique(),
          {
            last_limit: sliderValue,
            q: q,
            format: value.toUpperCase(),
            userId: userId,
          }
        );
        setDocId(res.$id);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const handleClick = async () => {
    await userDocCheck();

    if (selected.subreddits.length == 0) {
      setBukId(q);
    } else {
      setBukId(
        // @ts-ignore
        selected!.subreddits[0].replace("/r/", "").replace(/\/$/, "")
      );
    }

    switch (value) {
      case "json":
        router.push(
          `/download/[format]?q=${q}&limit=${sliderValue}`,
          `/download/json?q=${q}&limit=${sliderValue}`
        );
        break;
      case "raw":
        router.push(
          `/download/[format]?q=${q}&limit=${sliderValue}`,
          `/download/raw?q=${q}&limit=${sliderValue}`
        );
        break;
      default:
        break;
    }
  };

  return (
    <>
      <Button onClick={onOpen} bg={"ActiveBorder"}>
        Next
      </Button>

      <Modal
        initialFocusRef={initialRef}
        finalFocusRef={finalRef}
        isOpen={isOpen}
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Options</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>
                Limit (100% is 100 for now because of cloud v1.1.2 max limit on
                queries)
              </FormLabel>
              <Slider
                id="slider"
                defaultValue={5}
                min={0}
                max={100}
                colorScheme="teal"
                onChange={(v) => setSliderValue(v)}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <SliderMark value={25} mt="1" ml="-2.5" fontSize="sm">
                  25%
                </SliderMark>
                <SliderMark value={50} mt="1" ml="-2.5" fontSize="sm">
                  50%
                </SliderMark>
                <SliderMark value={75} mt="1" ml="-2.5" fontSize="sm">
                  75%
                </SliderMark>
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <Tooltip
                  hasArrow
                  bg="teal.500"
                  color="white"
                  placement="top"
                  isOpen={showTooltip}
                  label={`${sliderValue}%`}
                >
                  <SliderThumb />
                </Tooltip>
              </Slider>
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Format</FormLabel>
              <RadioGroup onChange={setValue} value={value}>
                <Stack direction="row">
                  <Radio value="json">Json</Radio>
                  <Radio value="raw">Raw</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={handleClick}
              isDisabled={sliderValue === 0}
            >
              Save
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
