/*
those are functions that filter employees by conditions


*/
const CONDITION_KEY = {
  GENDER: "gender",
  JOB_POS: "jobPos",
  NAME: "name",
};
/**
 * object contain helper function that filter employee
 * @param {object} categoryConditions is object of conditions
 * @param {object} employees is list of employee need to be match with condition
 * @return  {array} array of employee that meet the condition
 */
const filterHrFlagHelper = {
  /**
   * object contain helper function that filter employee
   * @param {object} categoryConditions is object of conditions
   * @param {object} employees is list of employee need to be match with condition
   * @return  {array} array of employee that meet the condition
   */
  filterGender(categoryConditions, employees) {
    // filter employee by gender
    const gender = categoryConditions[CONDITION_KEY.GENDER]
      .filter((item) => item.value)
      .map((item) => item.id);
    return employees
      .filter((item) => gender.includes(item.gender))
      .map((item) => item.uuId);
  },
  /**
   * object contain helper function that filter employee
   * @param {object} categoryConditions is object of conditions
   * @param {object} employees is list of employee need to be match with condition
   * @return  {array} array of employee that meet the condition
   */
  filterJobPos(categoryConditions, employees) {
    // filter employee by job position
    const jobPos = categoryConditions[CONDITION_KEY.JOB_POS].map(
      (item) => item.id
    );
    return employees
      .filter((item) => jobPos.includes(String(item.jobPosCdkey)))
      .map((item) => item.uuId);
  },
  /**
   * object contain helper function that filter employee
   * @param {object} categoryConditions is object of conditions
   * @param {object} employees is list of employee need to be match with condition
   * @return  {array} array of employee that meet the condition
   */
  filterUuid(categoryConditions, employees) {
    // filter employee by uuid
    const uuid = categoryConditions[CONDITION_KEY.NAME].map((item) => item.id);
    return employees
      .filter((item) => uuid.includes(item.uuId))
      .map((item) => item.uuId);
  },
  /**
   * object contain helper function that filter employee
   * @param {object} categoryConditions is object of conditions
   * @param {object} employees is list of employee need to be match with condition
   * @return  {array} array of employee that meet the condition
   */
  filterCategory(categoryConditions, employees) {
    // filter employee by job Category
    let result = [];
    if (categoryConditions.length == 0) {
      result = employees.map((item) => item.uuId);
    } else {
      result = filterHrFlag(employees, categoryConditions);
    }
    return result;
  },
};
/**
 * filter employees by condition, return employees that match
 *
 * @param {object} condition is list of condition that user input
 * @param {object} employees is list of employee reference that need to be filter
 * @returns {object} originalList is list of employee that is filtered
 */
export function filterHrFlagByCondition({ condition, employees }) {
  // this is secondary function to filter employees that meet set of condition,
  // there are 4 main conditions: gender, name, jobPosition, tag categories,
  // and 1 condition with unknown number of sub conditions
  let categoriesItems = createCategoryItem(condition);
  let originalList = employees.map((item) => item.uuId);
  if (hasCondition(condition, CONDITION_KEY.NAME)) {
    // filter name
    originalList = findIntersection(
      originalList,
      filterHrFlagHelper.filterUuid(condition, employees)
    );
  }
  if (hasCondition(condition, CONDITION_KEY.JOB_POS)) {
    //filter job pos
    originalList = findIntersection(
      originalList,
      filterHrFlagHelper.filterJobPos(condition, employees)
    );
  }
  if (hasCondition(condition, CONDITION_KEY.GENDER)) {
    //filter gender
    originalList = findIntersection(
      originalList,
      filterHrFlagHelper.filterGender(condition, employees)
    );
  }
  if (categoriesItems.length > 0) {
    //filter category
    const filteredUuId = filterHrFlagHelper.filterCategory(
      categoriesItems,
      employees
    );
    originalList = findIntersection(originalList, filteredUuId);
  }
  return originalList;
}
/**
 * sort and validate HR flag
 * @param {array} hrFlags is object of conditions
 * @return  {object} object of HR flag has been sort
 */
function sortHrFlag(hrFlags) {
  // create HRFlag mapping for filter category
  const result = {};
  hrFlags.forEach((item) => {
    if (!result[item.categoryId]) {
      result[item.categoryId] = [];
    }
    result[item.categoryId].push(item.id);
  });
  return result;
}
/**
 * matching employee with hr flag they have
 * @param {array} employeeRefs  employee reference that need to be filed with hr FLag information
 * @returns {array} list of employee that has hr Flag information
 */
function filterHrData(employeeRefs) {
  // mapping employeeReference
  const data = employeeRefs.map((employee) => {
    return {
      uuId: employee.uuId,
      hrFlag: sortHrFlag(employee.hrFlags), //Object mapped
    };
  });
  return data;
}
/**
 * Filter employee by category condition
 * @param {object} category  an object of condition is use to filter employee
 * @param {array} employeeRefs  list of employee need to be filtered
 * @returns {array} list of employee that meet category conditions
 */
function filterPrototype(category, employeeRefs) {
  //filter employee with category
  const { id: categoryId, items } = category;
  const categoriesItemsID = items.map((item) => item.id);
  if (categoriesItemsID.length == 0) {
    return employeeRefs.map((item) => item.uuId);
  }
  let result = [];
  employeeRefs.forEach((employee) => {
    if (checkMatchCategories(categoryId, categoriesItemsID, employee)) {
      result.push(employee.uuId);
    }
  });
  return result;
}
/**
 *
 * @param {string} categoryId category id
 * @param {array} categoriesItemsID  set of category condition that need to be match
 * @param {object} employee employee information
 * @returns {boolean} return true of match, false if not match
 */
function checkMatchCategories(categoryId, categoriesItemsID, employee) {
  // check if match category , OR logic
  if (employee.hrFlag.hasOwnProperty(categoryId)) {
    return isMatchIntersection(employee.hrFlag[categoryId], categoriesItemsID);
  }
  return false;
}
/**
 * filter intersection between 2 set A and B
 * @param {array} setA set of element need to be intersect
 * @param {array} setB set of element need to be intersect
 * @returns {array} intersection of 2 set
 */
export function findIntersection(setA, setB) {
  // filter intersection between 2 set A and B
  // return set of item that meet condition
  return setA.filter((id) => setB.includes(id));
}
/**
 * check if employee has match condition given
 *
 * @param {array} employeeHrFlag employee's hr tag
 * @param {array} hrFlagSelected hr tag is used for filtered
 * @returns {boolean} true if match, false if not match
 */
function isMatchIntersection(employeeHrFlag, hrFlagSelected) {
  // check if match, OR logic
  return employeeHrFlag.some((id) => hrFlagSelected.includes(id));
}

/**
 *  check if condition has sub-condition, and check if sub-condition is not empty
 * @param {object} condition an object of data need to be checked
 * @param {string} key a key string need to be check if that object has it
 * @return {boolean} true of has, false if not
 */
export function hasCondition(condition, key) {
  //check if condition has [key] property
  return key in condition && condition[key].length > 0;
}

/**
 * mapping condition to form object to array
 * @param {object} categoryConditions condition that need to be mapping
 * @returns {array} array of condition
 */
function createCategoryItem(categoryConditions) {
  // validate and creating pattern of condition that meet requirement
  let notCategoryKey = ["gender", "name", "jobPos"];
  let categoriesItems = [];
  Object.entries(categoryConditions).forEach(([key, value]) => {
    if (!notCategoryKey.includes(key)) {
      categoriesItems.push({
        id: key,
        items: value,
      });
    }
  });
  return categoriesItems;
}

/**
 * filter employees by condition, return employees that match
 * this is main function,
 * employeesData is list of employee, categoriesItems is conditions input
 * output is list of employee id that meet those conditions
 * this is simple version of filterHrFlagByCondition function
 * @param {object} condition is list of condition that user input
 * @param {array} employees is list of employee reference that need to be filter
 * @returns {array} originalList is list of employee that is filtered
 */
function filterHrFlag(employeesData, categoriesItems) {
  const employeeHrFlags = filterHrData(employeesData);
  let mappingUuid = [];
  categoriesItems.forEach((categoriesItem) => {
    const res = filterPrototype(categoriesItem, employeeHrFlags);
    mappingUuid.push(res);
  });
  let dataResult = mappingUuid[0];
  for (let index = 1; index < mappingUuid.length; index++) {
    dataResult = findIntersection(dataResult, mappingUuid[index]);
  }
  return dataResult;
}
export default filterHrFlagByCondition;
