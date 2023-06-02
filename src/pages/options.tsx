import { type NextPage } from "next";
import { useRouter } from "next/router";
const Options: NextPage = () => {
  const router = useRouter();
  const data = router.query;

  return <div>Options</div>;
};

export default Options;
