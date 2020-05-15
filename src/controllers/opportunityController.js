const axios = require("axios");

var error_result = {
  success: false,
  errorCode: null,
  message: null,
  data: undefined,
  statusCode: 400
};

exports.getCloseReasons = function (req, res, next) {
  if (!req.partnerId) {
    var err = error_result;
    err.message = "PartnerID is invalid";
    res.status(400).send(err);
  } else {
    console.log(req.query);
    var accessToken = req.access_token;
    var apiRoot =
      process.env.SALESFORCE_API_ROOT ||
      "https://crmdev-ponture-crmdev.cs84.force.com"; // for prod set to https://api.zignsec.com/v2
    var config = {
      url: "/services/apexrest/spoCloseReason",
      baseURL: apiRoot,
      method: "get",
      params: {
        lang: "en"
      },
      headers: {
        Authorization: "Bearer " + accessToken
      }
    };
    console.log(config);
    axios(config)
      .then(function (response) {
        if (response.data.success) res.send(response.data);
        else
          res
          .status(response.data.statusCode ? response.data.statusCode : 200)
          .send(response.data);
      })
      .catch(function (error) {
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
        // res.status(400).send(error.config);
      });
  }
};


exports.getNewApplications = function (req, res, next) {
  if (!req.partnerId) {
    var err = error_result;
    err.message = "PartnerID is invalid";
    res.status(400).send(err);
  } else {
    console.log(req.query);
    var accessToken = req.access_token;
    var apiRoot =
      process.env.SALESFORCE_API_ROOT ||
      "https://crmdev-ponture-crmdev.cs84.force.com"; // for prod set to https://api.zignsec.com/v2
    var config = {
      url: "/services/apexrest/pCommunity/getSPO",
      baseURL: apiRoot,
      method: "get",
      params: {
        action: "new",
        partnerId: req.partnerId
      },
      headers: {
        Authorization: "Bearer " + accessToken
      }
    };
    console.log(config);
    axios(config)
      .then(function (response) {
        if (response.data.success) res.send(response.data);
        else
          res
          .status(response.data.statusCode ? response.data.statusCode : 200)
          .send(response.data);
      })
      .catch(function (error) {
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
        // res.status(400).send(error.config);
      });
  }
};

exports.getOpenedApplications = function (req, res, next) {
  if (!req.partnerId) {
    var err = error_result;
    err.message = "PartnerID is invalid";
    res.status(400).send(err);
  } else {
    console.log(req.query);
    var accessToken = req.access_token;
    var apiRoot =
      process.env.SALESFORCE_API_ROOT ||
      "https://crmdev-ponture-crmdev.cs84.force.com"; // for prod set to https://api.zignsec.com/v2
    var config = {
      url: "/services/apexrest/pCommunity/getSPO",
      baseURL: apiRoot,
      method: "get",
      params: {
        action: "open",
        partnerId: req.partnerId
      },
      headers: {
        Authorization: "Bearer " + accessToken
      }
    };
    console.log(config);
    axios(config)
      .then(function (response) {
        if (response.data.success) res.send(response.data);
        else
          res
          .status(response.data.statusCode ? response.data.statusCode : 200)
          .send(response.data);
      })
      .catch(function (error) {
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
        // res.status(400).send(error.config);
      });
  }
};

exports.openApplication = function (req, res, next) {
  if (!req.partnerId) {
    var err = error_result;
    err.message = "PartnerID is invalid";
    res.status(400).send(err);
  }
  // if (!req.body.oppID) {
  //   var err = error_result;
  //   err.message = "Opportunity is invalid";
  //   res.status(400).send(err);
  // }
  else if (!req.body.spoId) {
    var err = error_result;
    err.message = "spoId is invalid";
    res.status(400).send(err);
  } else {
    var accessToken = req.access_token;
    var apiRoot =
      process.env.SALESFORCE_API_ROOT ||
      "https://crmdev-ponture-crmdev.cs84.force.com"; // for prod set to https://api.zignsec.com/v2
    var config = {
      url: "/services/apexrest/openOpp",
      baseURL: apiRoot,
      method: "put",
      params: {
        partnerId: req.partnerId,
        spoId: req.body.spoId
      },
      headers: {
        Authorization: "Bearer " + accessToken
      }
    };
    console.log(config);
    axios(config)
      .then(function(response) {
        if (response.data.success) res.send(response.data);
        else
          res
            .status(response.data.statusCode ? response.data.statusCode : 200)
            .send(response.data);
        })
        .catch(function (error) {
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
          // res.status(400).send(error.config);
        });
    }
};

exports.rejectApplication = function (req, res, next) {
  if (!req.partnerId) {
    var err = error_result;
    err.message = "PartnerID is invalid";
    res.status(400).send(err);
  }
  // if (!req.body.oppId) {
  //   var err = error_result;
  //   err.message = "Opportunity is invalid";
  //   res.status(400).send(err);
  // }
  else if (!req.body.spoId) {
    var err = error_result;
    err.message = "spoId is invalid";
    res.status(400).send(err);
  } else {
    var accessToken = req.access_token;
    var apiRoot =
      process.env.SALESFORCE_API_ROOT ||
      "https://crmdev-ponture-crmdev.cs84.force.com"; // for prod set to https://api.zignsec.com/v2
    var config = {
      url: "/services/apexrest/pCommunity/reject",
      baseURL: apiRoot,
      method: "put",
      data: req.body,
      headers: {
        Authorization: "Bearer " + accessToken
      }
    };
    console.log(config);
    axios(config)
      .then(function (response) {
        if (response.data.success) res.send(response.data);
        else
          res
          .status(response.data.statusCode ? response.data.statusCode : 200)
          .send(response.data);
      })
      .catch(function (error) {
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
        // res.status(400).send(error.config);
      });
  }
};

exports.getCreditReport = function (req, res, next) {
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
    .then(function (response) {
      if (response.data.success) res.send(response.data);
      else
        res
        .status(response.data.statusCode ? response.data.statusCode : 200)
        .send(response.data);
    })
    .catch(function (error) {
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
      // res.status(400).send(error.config);
    });
};