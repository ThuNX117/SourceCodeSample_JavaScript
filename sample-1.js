/* create function 
function getData get data from api
getListCategoryAPI return a list of category
getCategoryAPI return a list of item 
asynchronously call api and return it into Map with mapping
*/
import api from "./service/api";
/**
 * @returns {array} array of asynchronous function calling api of category item
 * getListCategoryAPI  is api get Category List
 * getCategoryAPI is api get category item
 */

async function getListCategory() {
  // create array api call get category item
  let queue = [];
  try {
    const { data: categories, success } = await api("getListCategoryAPI");
    if (!success) return false;
    if (categories) {
      //mapping function to an array of function
      queue = categories.map((item) => {
        return queue.push({
          id: item.id,
          func: api("getCategoryAPI", {
            categoryId: item.id,
          }),
        });
      });
    }
  } catch (error) {
    console.log("getListCategory ERROR(s) occurs", error);
  }
  return queue;
}
/**
 * get category data and return it into object
 * @returns {object} object of categories data
 */
async function getData() {
  let result = {};
  try {
    const queue = await getListCategory();
    //executing  array of asynchronous
    const _queue = queue.map((item) => item.func);
    const arrayResponse = await Promise.all(_queue);
    let result = {};
    queue.forEach((item, index) => {
      result[item.id] = arrayResponse[index].success ? arrayResponse[data] : [];
    });
  } catch (error) {
    console.log("getData ERROR(s) occurs", error);
  }
  return result;
}
export default getData;
