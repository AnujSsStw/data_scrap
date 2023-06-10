import { useRouter } from "next/router";

const Format = () => {
  const router = useRouter();

  console.log(router.query);
  return (
    <div>
      <p>Format</p>
    </div>
  );
};

export default Format;
