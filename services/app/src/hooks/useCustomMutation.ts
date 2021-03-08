import { CustomMutationResponse } from "lib/api";
import { useState } from "react";

type CustomMutationResult = {
  data: any;
  loading: boolean;
  error: string | null;
};

export default function useCustomMutation(
  requestFunction: ({
    variables,
  }: {
    variables: any;
  }) => Promise<CustomMutationResponse>
): [
  ({ variables }: { variables: any }) => Promise<CustomMutationResponse>,
  CustomMutationResult
] {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSendRequest = async ({ variables }: { variables: any }) => {
    try {
      setIsLoading(true);
      const response = await requestFunction({ variables });
      if (response.status !== "OK") {
        setError(response.msg);
      } else {
        setData(response.msg);
      }
      setIsLoading(false);
      return {
        status: response.status,
        msg: response.msg,
        errors: response.errors,
      };
    } catch (error) {
      setError(error);
      setIsLoading(false);
      return {
        status: "ERROR",
        msg: `Unknown error thrown in useCustomMutation hook! Error: ${error}`,
      };
    }
  };

  return [
    handleSendRequest,
    {
      data: data,
      loading: isLoading,
      error: error,
    },
  ];
}
