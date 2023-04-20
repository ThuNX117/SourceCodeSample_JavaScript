//config axios for HTTP request
import axios from "axios";
import simulationApiMap from "../service/apiMap";
const BASE_URL = process.env.VUE_APP_HOST_URL || "";
const request = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});
const config = (method, url, data, header) => {
  let obj = {
    method,
    url,
  };
  if (data) {
    if (method === "get") {
      obj["params"] = data;
    } else {
      obj["data"] = data;
    }
  }
  if (header) {
    obj["headers"] = header;
  }
  return obj;
};

const apiMap = { ...simulationApiMap(config) };

const api = async (apiName, apiParams) => {
  const config = apiMap[apiName](apiParams);
  try {
    const { data } = await request(config);
    return {
      success: true,
      data,
    };
  } catch (error) {
    if (error.response.status === 401 || error.response.status === 403) {
      location.reload();
      return;
    }
    return {
      success: false,
      data: error,
    };
  }
};

export default api;
