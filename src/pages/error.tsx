import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import Link from "next/link";

const Error = () => {
  return (
    <div>
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>404</AlertTitle>
        <AlertDescription>
          Back to <Link href="/">home</Link>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default Error;
