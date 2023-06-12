import { Box } from "@chakra-ui/react";
import { useAtom } from "jotai";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { payloadForL1 } from "~/context";
import { createPayload } from "~/pages/download/[format]";
import { functions } from "~/utils/appwrite";

export const JsonF = () => {
  const [selected] = useAtom(payloadForL1);
  const router = useRouter();

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
      console.log(payload);

      if (!payload) {
        return;
      }
      try {
        const { response } = await functions.createExecution(
          "6486b9ddaaf02f912d99",
          payload
        );

        const res = JSON.parse(response);
        const fileUrl = res.link;

        // Fetch the JSON file
        fetch(fileUrl)
          .then((response) => response.blob())
          .then((blob) => {
            // Create a temporary anchor element
            var downloadLink = document.createElement("a");
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = "file.json";
            downloadLink.click();
          })
          .catch((error) => console.log(error));
      } catch (error) {
        console.log(error);
      }
    };
    fn();
  }, []);

  return (
    <Box display={"flex"} justifyContent={"center"} p={10}>
      <p>JSON is being created</p>
    </Box>
  );
};
