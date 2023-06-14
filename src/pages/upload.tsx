import {
  Box,
  Button,
  Heading,
  Highlight,
  Select,
  useToast,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { ID, Models, Query } from "appwrite";
import { useCallback, useContext, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UserContext } from "~/context";
import { databases, storage } from "~/utils/appwrite";

const UploadPage = () => {
  const [files, setFiles] = useState<any>([]);
  const [rejected, setRejected] = useState<any>([]);
  const { user } = useContext(UserContext);
  const [fileList, setFileList] = useState<Models.Document[]>([]);
  const toast = useToast();

  const mutfn = async ({
    fileData,
    fileId,
  }: {
    fileId: string;
    fileData: File;
  }) => {
    return await storage.createFile("6481776513aa5b20149d", fileId, fileData);
  };

  const uploadMutation = useMutation({
    mutationFn: mutfn,
    onSuccess: (data) => {
      console.log(data);
    },
  });

  const mutfn2 = async ({
    bucketUrl,
    file_name,
  }: {
    bucketUrl: string;
    file_name: string;
  }) => {
    return await databases.createDocument(
      "648845ce0fe8f2d33b33",
      "648846382bc3ae6edefb",
      ID.unique(),
      {
        userId: user?.$id,
        bucketUrl,
        file_name,
      }
    );
  };

  const docMutation = useMutation({
    mutationFn: mutfn2,
    onSuccess: (data) => {
      console.log(data);
    },
  });
  const onDrop = useCallback(
    (acceptedFiles: any[], rejectedFiles: string | any[]) => {
      if (acceptedFiles?.length) {
        setFiles((previousFiles: any) => [
          // If allowing multiple files
          // ...previousFiles,
          ...acceptedFiles.map((file: Blob | MediaSource) =>
            Object.assign(file, { preview: URL.createObjectURL(file) })
          ),
        ]);
      }

      if (rejectedFiles?.length) {
        setRejected((previousFiles: any) => [
          ...previousFiles,
          ...rejectedFiles,
        ]);
      }
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
    useDropzone({
      onDrop,
      accept: {
        "application/zip": [],
      },
      maxFiles: 1,
    });

  useEffect(() => {
    // Revoke the data uris to avoid memory leaks
    return () =>
      files.forEach((file: any) => URL.revokeObjectURL(file.preview));
  }, [files]);

  useEffect(() => {
    async function getFiles() {
      try {
        console.log("wrkin");

        const response = await databases.listDocuments(
          "648845ce0fe8f2d33b33",
          "648846382bc3ae6edefb",
          [Query.equal("userId", user?.$id as unknown as string)]
        );
        console.log(response);
        setFileList(response.documents);
      } catch (error) {
        console.error(error);
      }
    }
    if (user?.$id) {
      getFiles();
    }
  }, [user, docMutation.isSuccess]);

  const handleUpload = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (!files?.length) return;

    const file = files[0];
    const fileData = file as File;
    const fileId = ID.unique();
    console.log(fileData, fileId);

    // Upload file to bucket
    const response = await uploadMutation.mutateAsync({ fileId, fileData });
    const uu = storage.getFileView("6481776513aa5b20149d", response.$id);
    await docMutation.mutateAsync({ bucketUrl: uu.href, file_name: file.name });

    setFiles([]);
  };

  useEffect(() => {
    if (uploadMutation.isSuccess) {
      toast({
        title: "File uploaded.",
        description: "We've successfully uploaded your file.",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
    }
  }, [uploadMutation.isSuccess]);

  return (
    <Box>
      <Box
        {...getRootProps()}
        display={"flex"}
        justifyContent={"center"}
        p={10}
        border={"2px dashed"}
        maxW={"xl"}
        mx={"auto"}
        borderRadius={"md"}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <Heading>Drop the files here ...</Heading>
        ) : (
          <Heading>
            Drag 'n' drop some files here, or click to select files
          </Heading>
        )}
      </Box>

      {/* uploading files */}
      {uploadMutation.isLoading && (
        <Box display={"flex"} justifyContent={"center"} gap={10} p={4}>
          <p>Uploading files...</p>
        </Box>
      )}

      <Box display={"flex"} justifyContent={"center"} gap={10} p={4}>
        <Button
          type="button"
          onClick={() => {
            setFiles([]);
            setRejected([]);
          }}
          _hover={{ bg: "red.500" }}
        >
          Remove files
        </Button>
        <Button
          type="submit"
          onClick={handleUpload}
          _hover={{
            bg: "green.500",
          }}
        >
          Upload to bucket
        </Button>
      </Box>

      {/* Accepted files */}
      <Box display={"flex"} justifyContent={"center"} pb={5}>
        {files.map((file: any, key: number) => (
          <Highlight
            key={key}
            query={file.name}
            styles={{ px: "2", py: "1", rounded: "full", bg: "teal.100" }}
          >
            {file.name}
          </Highlight>
        ))}
      </Box>

      <Box display={"flex"} justifyContent={"center"} maxW={600} mx={"auto"}>
        <Select
          placeholder="Previous Uploads And Files to Download"
          onChange={(s) => {
            fetch(s.target.value)
              .then((response) => response.blob())
              .then((blob) => {
                // Create a temporary anchor element
                var downloadLink = document.createElement("a");
                downloadLink.href = URL.createObjectURL(blob);
                downloadLink.download = "file.json";
                downloadLink.click();
              })
              .catch((error) => console.log(error));
          }}
        >
          {fileList.map((file, idx) => (
            <option value={file.bucketUrl} key={idx}>
              {file.file_name} - {new Date(file.$createdAt).toLocaleString()}
            </option>
          ))}
        </Select>
      </Box>
    </Box>
  );
};

export default UploadPage;
