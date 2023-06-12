import { Box } from "@chakra-ui/react";
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
      "646a0f5d434c20bf1963",
      "64870ec24c6273d923c1",
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
          "646a0f5d434c20bf1963",
          "64870ec24c6273d923c1",
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

    // Upload file to bucket
    const response = await uploadMutation.mutateAsync({ fileId, fileData });
    const uu = storage.getFileView("6481776513aa5b20149d", response.$id);
    await docMutation.mutateAsync({ bucketUrl: uu.href, file_name: file.name });
  };

  return (
    <Box>
      <h1>Upload</h1>
      <Box>
        <h3>Files</h3>
        <ul>
          {fileList.map((file) => (
            <li key={file.$id}>
              <p>{file.file_name}</p>
            </li>
          ))}
        </ul>
      </Box>

      <div {...getRootProps()}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag 'n' drop some files here, or click to select files</p>
        )}
      </div>

      {/* uploading files */}
      {uploadMutation.isLoading && <p>Uploading files...</p>}

      <Box display={"flex"} gap={"4"}>
        <button
          type="button"
          onClick={() => {
            setFiles([]);
            setRejected([]);
          }}
        >
          Remove all files
        </button>
        <button type="submit" onClick={handleUpload}>
          Upload to bucket
        </button>
      </Box>

      {/* Accepted files */}
      <h3>Accepted Files</h3>
      <ul>
        {files.map((file: any) => (
          <li key={file.name}>
            {/* <Image
              src={file.preview}
              alt={file.name}
              width={100}
              height={100}
              onLoad={() => {
                URL.revokeObjectURL(file.preview);
              }}
            /> */}
            <p>{file.name}</p>
          </li>
        ))}
      </ul>
    </Box>
  );
};

export default UploadPage;
