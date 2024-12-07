export const fetcher = async <BodyType>(
  url: string,
  // Method type can be centralized while building a monorepo
  method?: "GET" | "POST" | "PUT" | "DELETE",
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

    throw new Error(responseData.message || "Some error occured");
  }

  return response.json();
};
