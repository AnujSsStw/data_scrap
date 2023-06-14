import { Box, Button, Flex, Progress } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Query } from "appwrite";
import { useAtom } from "jotai";
import JSZip from "jszip";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";
import { JsonF } from "~/components/JsonF";
import {
  Payload,
  createdBucketId,
  createdDocId,
  cursor,
  payloadForL1,
} from "~/context";
import { databases, functions, storage } from "~/utils/appwrite";

const Format = () => {
  const router = useRouter();

  if (router.query.format === "json") {
    return <JsonF />;
  }

  const [preview, setPreview] = useState<{
    preview_data: any[];
  }>({
    preview_data: [],
  });
  const [bucketId, setBukId] = useAtom(createdBucketId);
  const [id, setId] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [docId] = useAtom(createdDocId);
  const [selected] = useAtom(payloadForL1);
  const [file_cursor] = useAtom(cursor);

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
      queryClient.setQueryData(["filesId", {}], data.response);
    },
  });

  const startL1 = async () => {
    const {
      limit: sliderValue,
      format: value,
      q,
    } = router.query as {
      limit: string;
      format: string;
      q: string;
    };

    try {
      const payload = createPayload(
        selected,
        parseInt(sliderValue),
        q as string,
        value as string
      );

      // check if preview data exists 6488481a124ee5bcb962 6488480242f3b85a5c4e
      const { total, documents } = await databases.listDocuments(
        "6488480242f3b85a5c4e",
        "6488481a124ee5bcb962",
        [Query.equal("topic", [q, selected.subreddits[0] as unknown as string])]
      );

      if (total == 0) {
        const { response } = await mutation.mutateAsync({
          functionId: "647c27ecc6e9a01b29a3",
          payload: payload,
        });

        const res = JSON.parse(response);

        setPreview({ preview_data: res["preview data"] });
      } else {
        // get the bucket id and file id
        if (documents[0]?.TotalCount >= sliderValue) {
          // seth the preview data
          const bucketId = documents[0]!.bucketId;
          setBukId(bucketId);

          const promise = storage.listFiles(bucketId, [
            Query.limit(parseInt(sliderValue)),
          ]);

          promise.then(
            async function (response) {
              response.files.forEach((file) => {
                const result = storage.getFilePreview(bucketId, file.$id);
                setPreview((prev) => ({
                  preview_data: [...prev.preview_data, result.toString()],
                }));
              });
            },
            function (error) {
              console.log(error); // Failure
            }
          );
        } else {
          // if the limit is higher than the total count
          // going to run the function again but with keeping in mind that the data is already there so we need to append the data
          // but going to give user a cursor of last file id (last file id from which the new data will be appended)
          // so when listing the files we can start from that file id and go to the end

          const { response } = await mutation.mutateAsync({
            functionId: "647c27ecc6e9a01b29a3",
            payload: payload,
          });

          const res = JSON.parse(response);

          setPreview({ preview_data: res["preview data"] });
        }
      }

      await handleClick();
    } catch (error) {
      console.log(error);
    }
  };

  const downloadFile = useCallback(async () => {
    try {
      const zip = new JSZip();
      const totalFiles = id.length;
      let filesDownloaded = 0;

      const res = id.map(async (fileId) => {
        const result = storage.getFileDownload(bucketId, fileId);
        const response = await fetch(result.toString());
        const fileData = await response.blob();
        zip.file(fileId, fileData, { base64: true });

        filesDownloaded++;
        const progress = ((filesDownloaded / totalFiles) * 100).toFixed(2);
        setProgress(Number(progress));
      });

      await Promise.all(res);

      const zipBlob = await zip.generateAsync({ type: "blob" });

      // Trigger the download
      const linkElement = document.createElement("a");
      linkElement.href = URL.createObjectURL(zipBlob);
      linkElement.download = "files.zip";
      linkElement.click();

      // Remove the temporary link element
      linkElement.remove();
    } catch (error) {
      console.log(error);
    }
  }, [id]);

  const handleClick = async () => {
    const promise = storage.listFiles(bucketId, [
      Query.limit(router.query.limit as unknown as number),
      file_cursor ? Query.cursorAfter(file_cursor) : Query.orderAsc("name"),
    ]);
    const data: any = [];
    promise.then(
      async function (response) {
        response.files.forEach((file) => {
          data.push(file.$id);
        });

        setId(data);
        try {
          // user doc
          const res = await databases.updateDocument(
            "648845ce0fe8f2d33b33",
            "648845d55f47e495074e",
            docId,
            {
              file_cursor: response.files[response.files.length - 1]?.$id,
            }
          );
        } catch (error) {
          console.log(error);
        }
      },
      function (error) {
        console.log(error); // Failure
      }
    );
  };

  return (
    <div>
      {progress > 0 && (
        <Box maxW={700} mx={"auto"}>
          <Progress value={progress} borderRadius={50} />
          {progress}%
        </Box>
      )}

      <Box display={"flex"} justifyContent={"center"} p={5}>
        <Button
          onClick={startL1}
          variant={"outline"}
          isLoading={mutation.isLoading}
        >
          Start Generating
        </Button>
      </Box>
      {id.length > 0 && (
        <Flex justifyContent={"center"}>
          <Button onClick={downloadFile}>Download {id.length} file</Button>
        </Flex>
      )}
      {/* <Stack spacing={8} display={"flex"} gap={4} flexDir={"row"}>
        {preview.preview_data.map((item, idx) => {
          return (
            <Box key={idx}>
              <Image alt="prev" src={item} width={200} height={200} />
            </Box>
          );
        })}
      </Stack> */}
    </div>
  );
};

export default Format;

export function createPayload(
  selected: Payload,
  sliderValue: number,
  q: string,
  value: string
) {
  const updatedArr = selected.subreddits.map((str: string) =>
    str.replace("/r/", "").replace(/\/$/, "")
  );

  const payload = JSON.stringify({
    gen1: {
      subreddits: updatedArr,
      limit: sliderValue,
    },
    gen2: {
      boards: selected.chan_4,
      limit: sliderValue,
    },
    gen3: {
      pin: selected.pinterest.length > 0 ? q : "",
      limit: sliderValue,
    },
    gen4: {
      query: selected.twitter.length > 0 ? q : "",
      limit: sliderValue,
      fromL1: true,
      dataType: value,
    },
    q: q,
    dataType: value,
  });

  return payload;
}
