import axios from 'axios';

export const sendCommand = async (url, endpoint, secret, data) => {
  try {
    // Ensure url has no trailing slash and endpoint has leading slash
    const cleanUrl = url.replace(/\/$/, '');
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const fullUrl = `${cleanUrl}${cleanEndpoint}`;

    const response = await axios.post(fullUrl, data, {
      headers: {
        'Authorization': `Bearer ${secret}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`Server error (${error.response.status}): ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      throw new Error(`Connection failed: No response from ${url}. Is the server running?`);
    } else {
      throw new Error(`Request error: ${error.message}`);
    }
  }
};
