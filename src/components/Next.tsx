import {
  useDisclosure,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  FormControl,
  FormLabel,
  Slider,
  SliderMark,
  SliderTrack,
  SliderFilledTrack,
  Tooltip,
  SliderThumb,
  RadioGroup,
  Stack,
  Radio,
  ModalFooter,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { ID } from "appwrite";
import React from "react";
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

  const router = useRouter();

  const handleClick = async () => {
    try {
      const { $createdAt } = await databases.createDocument(
        "646a0f5d434c20bf1963",
        "6484461de416c5178e30",
        ID.unique(),
        {
          last_limit: sliderValue * 10,
          q: q,
          format: value.toUpperCase(),
          userId: userId,
        }
      );

      console.log($createdAt);
    } catch (error) {
      console.log(error);
    }
    switch (value) {
      case "json":
        router.push(
          `/download/[format]?limit=${sliderValue}`,
          `/download/json?limit=${sliderValue}`
        );
        break;
      case "csv":
        router.push(
          `/download/[format]?limit=${sliderValue}`,
          `/download/csv?limit=${sliderValue}`
        );
        break;
      case "raw":
        router.push(
          `/download/[raw]?limit=${sliderValue}`,
          `/download/raw?limit=${sliderValue}`
        );
        break;
      default:
        break;
    }
  };

  return (
    <>
      <Button onClick={onOpen}>Next</Button>

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
              <FormLabel>Limit (100% is 1000 for now)</FormLabel>
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
                  <Radio value="csv">Csv</Radio>
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
