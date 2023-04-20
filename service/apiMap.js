const URL_PATH = "";
const api = (config) => ({
  //reference data
  getCategoryAPI: (params) =>
    config("get", `${URL_PATH}api/getCategoryAPI`, params),
  getListCategoryAPI: (params) =>
    config("get", `${URL_PATH}api/getListCategoryAPI`, params),
});

export default api;
