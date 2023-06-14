import { Box, Flex, Spinner, useToast } from "@chakra-ui/react";
import { useAtom } from "jotai";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { payloadForL1 } from "~/context";
import { createPayload } from "~/pages/download/[format]";
import { functions, storage } from "~/utils/appwrite";

export const JsonF = () => {
  const [selected] = useAtom(payloadForL1);
  const [isDownloading, setIsDownloading] = useState(true);
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    const fn = async () => {
      const {
        limit: sliderValue,
        format,
        q,
      } = router.query as {
        limit: string;
        format: string;
        q: string;
      };

      // technically, dataType and q is not required for json
      const payload = createPayload(selected, parseInt(sliderValue), q, format);

      if (!payload) {
        return;
      }
      try {
        const { response } = await functions.createExecution(
          "6486b9ddaaf02f912d99",
          payload
        );

        if (response.length === 0) {
          toast({
            title: "No data found",
            description: "Please try again",
            status: "error",
            duration: 9000,
            isClosable: true,
          });
          return;
        }

        const res = JSON.parse(response) as any;

        const result = storage.getFileDownload(
          res.result.bucketId,
          res.result.$id
        );

        // Create a temporary anchor element
        const downloadLink = document.createElement("a");
        downloadLink.href = result.href;
        downloadLink.download = "file.json";
        downloadLink.click();

        downloadLink.remove();
      } catch (error) {
        console.log(error);
      }
    };
    fn().then(() => {
      setIsDownloading(false);
    });
  }, []);

  return (
    <Box display={"flex"} justifyContent={"center"} p={10}>
      {isDownloading ? (
        <Flex>
          JSON is being created
          <Spinner />
        </Flex>
      ) : (
        <p>JSON is ready for download</p>
      )}
    </Box>
  );
};
