const AxiosHelper = require("./axiosHelper.js");

module.exports = function (baseURL) {
  this.axiosHelper = new AxiosHelper(baseURL);

  this.searchMovie = async (titleToSearch) => {
    const endpoint = this.getSearchEndpoint(titleToSearch);
    const response = await this.axiosHelper.doGet(endpoint);

    if (response.status === 200) {
      return this.processOkResponse(response);
    }

    return this.processErrorResponse(response);
  };

  this.getSearchEndpoint = (titleToSearch) => {
    return "?title=" + encodeURIComponent(titleToSearch);
  };

  this.processOkResponse = (response) => {
    const data = Array.isArray(response.data) ? response.data : [];

    if (data.length === 0) {
      return "No results found";
    }

    const result = [];
    result.push(`${data.length} found:`);

    data.forEach((item) => {
      result.push(`- ${item.Title} (${item.Location})`);
    });

    return result.join("\n");
  };

  this.processErrorResponse = (response) => {
    return `Response: [${response.status}] ${response.data}`;
  };
};
