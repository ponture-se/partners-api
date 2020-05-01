const axios = require("axios");
const queryString = require("query-string");
const _ = require('lodash');

exports.getPartnerProducts = function(req, res, next) {
  var accessToken = req.access_token;
  var apiRoot =
    process.env.SALESFORCE_API_ROOT ||
    "https://crmdev-ponture-crmdev.cs84.force.com"; // for prod set to https://api.zignsec.com/v2
  var config = {
    url: "/services/apexrest/pCommunity/getProductsMaster",
    baseURL: apiRoot,
    method: "get",
    params: {
      partnerId: req.partnerId
    },
    headers: {
      Authorization: "Bearer " + accessToken
    }
  };
  console.log(config);
  axios(config)
    .then(function(response) {
      if (response.data.success) res.send(response.data);
      else res.status(response.data.statusCode).send(response.data);
    })
    .catch(function(error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
        res.status(error.response.status).send(error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request);
        res.status(204).send("No response from server");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log("Error", error.message);
        res.status(500).send(error.message);
      }
      console.log(error.config);
      res.status(400).send(error.config);
    });
};

exports.getPartnerOfferColumns = function(req, res, next) {
  var accessToken = req.access_token;
  let version = req.params.version;
  if (version) {
    req.query.version = version;
  } else {
    req.query.version = 'v1';
  }

  var apiRoot =
    process.env.SALESFORCE_API_ROOT ||
    "https://crmdev-ponture-crmdev.cs84.force.com"; // for prod set to https://api.zignsec.com/v2
  var config = {
    url: "/services/apexrest/getLoanOutline",
    baseURL: apiRoot,
    method: "get",
    params: req.query,
    headers: {
      Authorization: "Bearer " + accessToken
    }
  };
  console.log(config);
  axios(config)
    .then(function(response) {
      if (response.data.success) res.send(response.data);
      else res.status(response.data.statusCode).send(response.data);
    })
    .catch(function(error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
        res.status(error.response.status).send(error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request);
        res.status(204).send("No response from server");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log("Error", error.message);
        res.status(500).send(error.message);
      }
      console.log(error.config);
      res.status(400).send(error.config);
    });
};
exports.issueOffer = function(req, res, next) {
  var accessToken = req.access_token;
  var apiRoot =
    process.env.SALESFORCE_API_ROOT ||
    "https://crmdev-ponture-crmdev.cs84.force.com"; // for prod set to https://api.zignsec.com/v2
  var config = {
    url: "/services/apexrest/issueOffer",
    baseURL: apiRoot,
    method: "post",
    data: req.body,
    headers: {
      Authorization: "Bearer " + accessToken
    }
  };
  console.log(config);
  axios(config)
    .then(function(response) {
      if (response.data.success) res.send(response.data);
      else res.status(response.data.statusCode).send(response.data);
    })
    .catch(function(error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
        res.status(error.response.status).send(error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request);
        res.status(204).send("No response from server");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log("Error", error.message);
        res.status(500).send(error.message);
      }
      console.log(error.config);
      res.status(400).send(error.config);
    });
};

exports.editOffer = function(req, res, next) {
  var accessToken = req.access_token;
  var apiRoot =
    process.env.SALESFORCE_API_ROOT ||
    "https://crmdev-ponture-crmdev.cs84.force.com"; // for prod set to https://api.zignsec.com/v2
  var config = {
    url: "/services/apexrest/editOffer",
    baseURL: apiRoot,
    method: "put",
    data: req.body,
    headers: {
      Authorization: "Bearer " + accessToken
    }
  };
  console.log(config);
  axios(config)
    .then(function(response) {
      if (response.data.success) res.send(response.data);
      else res.status(response.data.statusCode).send(response.data);
    })
    .catch(function(error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
        res.status(error.response.status).send(error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request);
        res.status(204).send("No response from server");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log("Error", error.message);
        res.status(500).send(error.message);
      }
      console.log(error.config);
      res.status(400).send(error.config);
    });
};
exports.getoffers = function(req, res, next) {
  var accessToken = req.access_token;
  var apiRoot =
    process.env.SALESFORCE_API_ROOT ||
    "https://crmdev-ponture-crmdev.cs84.force.com"; // for prod set to https://api.zignsec.com/v2
  var config = {
    url: "/services/apexrest/spSingleOffer",
    baseURL: apiRoot,
    method: "get",
    params: {
      partnerId: req.partnerId,
      stage: "offer issued"
    },
    headers: {
      Authorization: "Bearer " + accessToken
    }
  };
  console.log(config);
  axios(config)
    .then(function(response) {
      if (response.data.success) res.send(response.data);
      else res.status(response.data.statusCode).send(response.data);
    })
    .catch(function(error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
        res.status(error.response.status).send(error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request);
        res.status(204).send("No response from server");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log("Error", error.message);
        res.status(500).send(error.message);
      }
      console.log(error.config);
      res.status(400).send(error.config);
    });
};

exports.acceptedoffers = function(req, res, next) {
  var accessToken = req.access_token;
  var apiRoot =
    process.env.SALESFORCE_API_ROOT ||
    "https://crmdev-ponture-crmdev.cs84.force.com"; // for prod set to https://api.zignsec.com/v2
  var config = {
    url: "/services/apexrest/spSingleOffer",
    baseURL: apiRoot,
    method: "get",
    params: {
      partnerId: req.partnerId,
      stage: "offer accepted"
    },
    headers: {
      Authorization: "Bearer " + accessToken
    }
  };
  console.log(config);
  axios(config)
    .then(function(response) {
      if (response.data.success) res.send(response.data);
      else res.status(response.data.statusCode).send(response.data);
    })
    .catch(function(error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
        res.status(error.response.status).send(error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request);
        res.status(204).send("No response from server");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log("Error", error.message);
        res.status(500).send(error.message);
      }
      console.log(error.config);
      res.status(400).send(error.config);
    });
};

exports.lostapplications = function(req, res, next) {
  var accessToken = req.access_token;
  var apiRoot =
    process.env.SALESFORCE_API_ROOT ||
    "https://crmdev-ponture-crmdev.cs84.force.com"; // for prod set to https://api.zignsec.com/v2
  var config = {
    url: "/services/apexrest/spSingleOffer",
    baseURL: apiRoot,
    method: "get",
    params: {
      partnerId: req.partnerId,
      stage: "offer lost"
    },
    headers: {
      Authorization: "Bearer " + accessToken
    }
  };
  console.log(config);
  axios(config)
    .then(function(response) {
      if (response.data.success) res.send(response.data);
      else res.status(response.data.statusCode).send(response.data);
    })
    .catch(function(error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
        res.status(error.response.status).send(error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request);
        res.status(204).send("No response from server");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log("Error", error.message);
        res.status(500).send(error.message);
      }
      console.log(error.config);
      res.status(400).send(error.config);
    });
};

exports.fundedapplications = function(req, res, next) {
  var accessToken = req.access_token;
  var apiRoot =
    process.env.SALESFORCE_API_ROOT ||
    "https://crmdev-ponture-crmdev.cs84.force.com"; // for prod set to https://api.zignsec.com/v2
  var config = {
    url: "/services/apexrest/spSingleOffer",
    baseURL: apiRoot,
    method: "get",
    params: {
      partnerId: req.partnerId,
      stage: "offer won"
    },
    headers: {
      Authorization: "Bearer " + accessToken
    }
  };
  console.log(config);
  axios(config)
    .then(function(response) {
      if (response.data.success) res.send(response.data);
      else res.status(response.data.statusCode).send(response.data);
    })
    .catch(function(error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
        res.status(error.response.status).send(error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request);
        res.status(204).send("No response from server");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log("Error", error.message);
        res.status(500).send(error.message);
      }
      console.log(error.config);
      res.status(400).send(error.config);
    });
};

exports.cancelOffer = function(req, res, next) {
  var accessToken = req.access_token;
  var apiRoot =
    process.env.SALESFORCE_API_ROOT ||
    "https://crmdev-ponture-crmdev.cs84.force.com"; // for prod set to https://api.zignsec.com/v2
  var config = {
    url: "/services/apexrest/cancelOffer",
    baseURL: apiRoot,
    method: "put",
    // params: req.query,
    data: req.body,
    headers: {
      Authorization: "Bearer " + accessToken
    }
  };
  console.log(config);
  axios(config)
    .then(function(response) {
      if (response.data.success) res.send(response.data);
      else res.status(response.data.statusCode).send(response.data);
    })
    .catch(function(error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
        res.status(error.response.status).send(error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request);
        res.status(204).send("No response from server");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log("Error", error.message);
        res.status(500).send(error.message);
      }
      console.log(error.config);
      res.status(400).send(error.config);
    });
};

exports.acceptOffer = function(req, res, next) {
  var accessToken = req.access_token;
  var apiRoot =
    process.env.SALESFORCE_API_ROOT ||
    "https://crmdev-ponture-crmdev.cs84.force.com"; // for prod set to https://api.zignsec.com/v2
  var config = {
    url: "/services/apexrest/pCommunity/creditReport",
    baseURL: apiRoot,
    method: "get",
    params: req.query,
    headers: {
      Authorization: "Bearer " + accessToken
    }
  };
  console.log(config);
  axios(config)
    .then(function(response) {
      if (response.data.success) res.send(response.data);
      else res.status(response.data.statusCode).send(response.data);
    })
    .catch(function(error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
        res.status(error.response.status).send(error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request);
        res.status(204).send("No response from server");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log("Error", error.message);
        res.status(500).send(error.message);
      }
      console.log(error.config);
      res.status(400).send(error.config);
    });
};

async function fundAppController (sfConn, offerId, partnerId, loanAmount, loanPeriod) {
  
  let params = {
    offerId: offerId,
    partnerId: partnerId,
    loanAmount: loanAmount,
    loanPeriod: loanPeriod
  }

  params = _.pickBy(params, _.identity);

  let qs = "?" + queryString.stringify(params);
  
	// Error handeled in parent
	let result = await sfConn.apex.put('/fundApp' + qs);

	return result;
}
exports.fundAppController = fundAppController;