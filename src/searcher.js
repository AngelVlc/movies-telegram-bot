const AxiosHelper = require("./axiosHelper.js");

module.exports = function (baseURL) {
  this.axiosHelper = new AxiosHelper(baseURL);

  this.searchMovie = async (titleToSearch) => {
    const endpoint = getSearchEndpoint(titleToSearch);
    const response = await this.axiosHelper.doGet(endpoint);

    if (response.status == 200) {
      return processOkResponse(response);
    }

    return processErrorResponse(response);
  };

  getSearchEndpoint = (titleToSearch) => {
    return "?title=" + encodeURIComponent(titleToSearch);
  };

  processOkResponse = (response) => {
    const data = response.data;
    const result = [];
    result.push(`${data.length} found:`);

    data.forEach((item) => {
      result.push(`- ${item.Title} (${item.Location})`);
    });

    return result.join("\n\n");
  };

  processErrorResponse = (response) => {
    return `Response: [${response.status}] ${response.data}`
  };
};
