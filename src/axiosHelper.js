const axios = require("axios");

module.exports = function (baseUrl) {
  this.axiosInstance = axios.create({
    baseURL: baseUrl,
  });

  this.doGet = async (endpoint) => {
    const options = {
      headers: {
        "cache-control": "no-cache",
      },
      validateStatus: (status) => {
        return status < 500;
      },
    };

    return await this.axiosInstance.get(endpoint, options);
  };
};
