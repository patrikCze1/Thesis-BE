const { ValidationError } = require("sequelize");
const ResponseError = require("../models/common/ResponseError");

/**
 *
 * @returns {string}
 */
const getFeUrl = () => {
  return process.env.FE_URI;
};

/**
 *
 * @param {Task} task
 * @returns {string} url
 */
const getFeTaskUrl = (task) => {
  if (task.archived) {
    return `${getFeUrl()}/projekty/${task.projectId}/archiv?ukol=${task.id}`;
  } else if (!task.stageId) {
    return `${getFeUrl()}/projekty/${task.projectId}/nevyrizene?ukol=${
      task.id
    }`;
  } else {
    return `${getFeUrl()}/projekty/${task.projectId}/nastenky/${
      task.boardId
    }?ukol=${task.id}`;
  }
};

/**
 *
 * @param {string} string
 * @param {number} length
 * @returns {string}
 */
const trimString = (string = "", length = 100) => {
  return string.length > length ? string.substring(0, length) + "..." : string;
};

/**
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Error} error
 */
const responseError = (req, res, error) => {
  if (error instanceof ValidationError) {
    console.log("errors", error.errors);
    res.status(400).json({
      message: req.t(error.errors[0].message, {
        field: req.t(`field.${error.errors[0].path}`),
      }),
    });
  } else if (error instanceof ResponseError)
    res.status(error.status).json({ message: error.message });
  else res.status(500).json({ message: error.message });
};

module.exports = {
  getFeUrl,
  getFeTaskUrl,
  trimString,
  responseError,
};
