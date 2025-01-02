function getQuerystring(request) {
  const results = [];
  const querystring = request.querystring;

  for (const key in querystring) {
    const eachQuerystring = querystring[key];
    const multiValue = eachQuerystring.multiValue;
    if (!multiValue) {
      results.push(key + "=" + eachQuerystring.value);
    } else {
      multiValue.forEach((eachValue) => {
        results.push(key + "=" + eachValue.value);
      });
    }
  }

  return results.sort().join("&");
}

function getRedirectUri(request) {
  const baseUri = request.uri;
  const querystring = getQuerystring(request);

  if (querystring.length === 0) {
    return baseUri;
  }

  return [baseUri, querystring].join("?");
}

function encodeBase64(string) {
  return btoa(string);
}

function handler(event) {
  const request = event.request;
  const redirectPath = encodeBase64(getRedirectUri(request));

  return {
    statusCode: 302,
    statusDescription: "Found",
    headers: {
      location: { value: `/?redirect_path=${redirectPath}` },
    },
  };
}
