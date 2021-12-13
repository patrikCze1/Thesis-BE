/**
 * Check if object has all fields given in array
 * @param {array} fieldsArray 
 * @param {Object} object 
 * @returns 
 */
const validateRequiredFields = (fieldsArray, object) => {
  const notValidFields = fieldsArray.filter(field => !object.hasOwnProperty(field) || object[field] == null);
  
  return { 
      valid: !notValidFields.length > 0,
      requiredFields: notValidFields,
    };
};

module.exports = {
  validateRequiredFields,
};
