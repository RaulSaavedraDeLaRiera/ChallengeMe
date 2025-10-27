//reusable http service to parse Api responses
const parse = async (res) => {
  //no content status = 204
  if(res.status === 204) return null;
  
  const text = await res.text()
  //empty response if not text
  if(!text) return null;

  try {
    return JSON.parse(text)
  } catch (err) {
    return text
  }
}

//reusable Api request service
export const http = async (path, { method='GET', body, token, headers }) => {
  //configure the request
  const res = await fetch(`http://localhost:3001${path}`,{
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {})
    },
    body: body ? JSON.stringify(body) : undefined
  })

  //handle response data
  const data = await parse(res)
  if(!res.ok) {
    const message = (data && (data.err || data.message) || `Error ${res.status}`)
    throw new Error(message);
  }

  //return parsed 
  return data
}
