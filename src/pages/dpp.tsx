import { Models, Query } from "appwrite";
import { useCallback, useState } from "react";
import { storage } from "~/utils/appwrite";
import JSZip from "jszip";

const Dpp = () => {
  const [data, setData] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);
  // should you use useCallback or useMemo

  const handleClick = async () => {
    const promise = storage.listFiles("647a67c994ffd21e0787", [
      Query.limit(100),
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

  const downloadFile = useCallback(async () => {
    console.log("here");
    try {
      const zip = new JSZip();
      const totalFiles = data.length;
      let filesDownloaded = 0;

      const res = data.map(async (fileId) => {
        const result = storage.getFileDownload("647a67c994ffd21e0787", fileId);
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
    } catch (error) {
      console.log(error);
    }
  }, [data]);

  return (
    <div>
      <h1>DPP</h1>
      <p>{progress}</p>
      <button onClick={handleClick}>Click</button>
      <button onClick={downloadFile}>Download</button>
      {data && data.map((d: any, idx) => <p key={idx}>{d}</p>)}
    </div>
  );
};

export default Dpp;
