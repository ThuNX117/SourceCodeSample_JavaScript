/* create function 
function getData get data from api
getListCategoryAPI return a list of category
getCategoryAPI return a list of item 
asynchronously call api and return it into Map with mapping
*/
async function getListCategory() {
  // create array api call
  try {
    const { data: categories, success } = await api("getListCategoryAPI");
    if (!success) return false;
    let queue = [];
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
    return queue;
  } catch (error) {
    console.log("getListCategory ERROR(s) occurs", error);
  }
  return false;
}
async function getData() {
  try {
    const queue = await getListCategory();
    //executing  array of asynchronous
    const _queue = queue.map((item) => item.func);
    const arrayResponse = await Promise.all(_queue);
    let result = {};
    queue.forEach((item, index) => {
      result[item.id] = arrayResponse[index];
    });
    return result;
  } catch (error) {
    console.log("getData ERROR(s) occurs", error);
  }
  return false;
}
