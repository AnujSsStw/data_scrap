import { Box, Radio, RadioGroup, Stack } from "@chakra-ui/react";
import { type NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import {
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Tooltip,
} from "@chakra-ui/react";
import Link from "next/link";
import { functions } from "~/utils/appwrite";
import { atom, useAtom } from "jotai";

// const p = atom((get) => get(payload));

export const createdBucketId = atom("");

const Options: NextPage = () => {
  const [sliderValue, setSliderValue] = React.useState(10);
  const [showTooltip, setShowTooltip] = React.useState(false);
  const [value, setValue] = React.useState("json");
  // const [selected] = useAtom(p);

  const [bukID, setBukId] = useAtom(createdBucketId);

  const router = useRouter();

  return (
    <div>
      Options
      <Box display={"flex"} flexDir={"column"} gap={4}>
        select the limit
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
        selec the format you want your data
        <RadioGroup onChange={setValue} value={value}>
          <Stack direction="row">
            <Radio value="json">Json</Radio>
            <Radio value="csv">Csv</Radio>
            <Radio value="raw">Raw</Radio>
          </Stack>
        </RadioGroup>
      </Box>
      <Link
        href={{
          pathname: `/${value}`,
          // query: { selected: selected },
        }}
      >
        {/* <Box
          onClick={async () => {
            const updatedArr = selected.subreddits.map((str: string) =>
              str.replace("/r/", "").replace(/\/$/, "")
            );
            setBukId(updatedArr[0] as string);

            const a = JSON.stringify({
              gen1: {
                subreddits: updatedArr,
                limit: 10,
              },
              gen2: {
                boards: selected.chan_4,
                limit: 10,
              },
            });

            await functions.createExecution("647c27ecc6e9a01b29a3", a, true);
          }}
        >
          Next -
        </Box> */}
      </Link>
    </div>
  );
};

export default Options;
