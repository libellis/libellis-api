/**
 *  Matches custom internal errors with http status codes
  */    

const statusMap = {
  DuplicateResource: 400,
  Unauthorized: 401,
  NotFound: 404,
  InvalidSchema: 422,
}

function assignStatusCode(error) {
  if (statusMap[error.type]) {
    error.status = statusMap[error.type];
  } else {
    error.status = 500;
  }
}

module.exports = assignStatusCode;
