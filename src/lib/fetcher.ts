import { HttpMethods } from "@/types/server/request";
import { AuthenticationError } from "./errors";
import { authenticationErrorMessage } from "@/constants";

export const fetcher = async <BodyType>(
  url: string,
  method?: HttpMethods,
  body?: BodyType
) => {
  let response;

  // Handling the case where the body is missed by mistake
  if (method && method !== "GET" && !body) {
    throw new Error(`Req body is missing in ${method} method`);
  }

  if (method !== "GET") {
    response = await fetch(url, { method, body: JSON.stringify(body) });
  } else {
    response = await fetch(url);
  }

  if (!response.ok) {
    const responseData = await response.json();

    if (responseData.message === authenticationErrorMessage) {
      throw new AuthenticationError(responseData.message);
    } else {
      throw new Error(responseData.message || "Some error occured");
    }
  }

  return response.json();
};
