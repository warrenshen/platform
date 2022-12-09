import { AxiosRequestConfig } from "axios";
import { CustomMutationResponse } from "lib/api";
import { useState } from "react";

type CustomMutationResult = {
  data: any;
  loading: boolean;
  error: string | null;
};

const useCustomQuery = (
  requestFunction: (
    config: AxiosRequestConfig
  ) => Promise<CustomMutationResponse>
): [
  (config: AxiosRequestConfig) => Promise<CustomMutationResponse>,
  CustomMutationResult
] => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSendRequest = async (config: AxiosRequestConfig) => {
    try {
      setIsLoading(true);
      const response = await requestFunction(config);
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
        data: response.data,
      };
    } catch (error: any) {
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
};

export default useCustomQuery;
