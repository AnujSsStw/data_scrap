import { Models, Query } from "appwrite";
import { useState } from "react";
import { storage } from "~/utils/appwrite";
import JSZip from "jszip";

const Dpp = () => {
  const [data, setData] = useState<any[]>([]);

  const handleClick = async () => {
    const promise = storage.listFiles("647a67c994ffd21e0787", [
      Query.limit(25),
    ]);
    const d: any = [];
    promise.then(
      function (response) {
        // console.log(response); // Success
        response.files.forEach((file) => {
          d.push(file.$id);
        });
        setData(d);
      },
      function (error) {
        console.log(error); // Failure
      }
    );
  };

  const downloadFile = async () => {
    try {
      const zip = new JSZip();
      for (const fileId of data) {
        const result = storage.getFileDownload("647a67c994ffd21e0787", fileId);
        const response = await fetch(result.toString());
        const fileData = await response.blob();
        zip.file(fileId, fileData, { base64: true });
      }

      zip.generateAsync({ type: "blob" }).then(function (content) {
        // see FileSaver.js
        const linkElement = document.createElement("a");
        linkElement.href = URL.createObjectURL(content);
        linkElement.download = "files.zip";
        linkElement.click();
      });
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div>
      <h1>DPP</h1>
      <button onClick={handleClick}>Click</button>
      <button onClick={downloadFile}>Download</button>
      {data && data.map((d: any, idx) => <p key={idx}>{d}</p>)}
    </div>
  );
};

export default Dpp;
