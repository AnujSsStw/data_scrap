import { Box } from "@chakra-ui/react";
import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { client, storage } from "~/utils/appwrite";
import { ID } from "appwrite";

const UploadPage = () => {
  const [files, setFiles] = useState<any>([]);
  const [rejected, setRejected] = useState<any>([]);

  const onDrop = useCallback((acceptedFiles: any, rejectedFiles: any) => {
    if (acceptedFiles?.length) {
      setFiles((previousFiles: any) => [
        ...previousFiles,
        ...acceptedFiles.map((file: Blob | MediaSource) =>
          Object.assign(file, { preview: URL.createObjectURL(file) })
        ),
      ]);
    }

    if (rejectedFiles?.length) {
      setRejected((previousFiles: any) => [...previousFiles, ...rejectedFiles]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
    useDropzone({
      onDrop,
      accept: {
        "image/*": [],
      },
    });

  useEffect(() => {
    // Revoke the data uris to avoid memory leaks
    return () =>
      files.forEach((file: any) => URL.revokeObjectURL(file.preview));
  }, [files]);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!files?.length) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileData = file;
      const fileId = ID.unique();

      // Upload file to bucket
      const response = await storage.createFile(
        "6481776513aa5b20149d",
        fileId,
        fileData
      );

      client.subscribe("files", (response) => {
        if (
          response.events.includes(
            `buckets.6481776513aa5b20149d.files.${fileId}.create`
          )
        ) {
          // Log when a new file is uploaded
          console.log(response.payload);
        }
        console.log(response);
      });
    }

    // Subscribe to files channel
  };
  return (
    <Box>
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag 'n' drop some files here, or click to select files</p>
        )}
      </div>

      {/* Preview */}
      <Box display={"flex"} gap={"4"}>
        <button
          type="button"
          onClick={() => {
            setFiles([]);
            setRejected([]);
          }}
          className="mt-1 text-[12px] uppercase tracking-wider font-bold text-neutral-500 border border-secondary-400 rounded-md px-3 hover:bg-secondary-400 hover:text-white transition-colors"
        >
          Remove all files
        </button>
        <button
          type="submit"
          className="ml-auto mt-1 text-[12px] uppercase tracking-wider font-bold text-neutral-500 border border-purple-400 rounded-md px-3 hover:bg-purple-400 hover:text-white transition-colors"
          onClick={handleUpload}
        >
          Upload to bucket
        </button>
      </Box>

      {/* Accepted files */}
      <h3 className="title text-lg font-semibold text-neutral-600 mt-10 border-b pb-3">
        Accepted Files
      </h3>
      <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-10">
        {files.map((file: any) => (
          <li key={file.name} className="relative h-32 rounded-md shadow-lg">
            <Image
              src={file.preview}
              alt={file.name}
              width={100}
              height={100}
              onLoad={() => {
                URL.revokeObjectURL(file.preview);
              }}
              className="h-full w-full object-contain rounded-md"
            />
            <p className="mt-2 text-neutral-500 text-[12px] font-medium">
              {file.name}
            </p>
          </li>
        ))}
      </ul>
    </Box>
  );
};

export default UploadPage;
