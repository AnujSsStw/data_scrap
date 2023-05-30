import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";

const Error = () => {
  return (
    <div>
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>404</AlertTitle>
        <AlertDescription>
          Back to <a href="/">home</a>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default Error;
