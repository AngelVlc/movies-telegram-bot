const AxiosHelper = require("./axiosHelper.js");
const axios = require("axios");

describe("AnxiosHelper", () => {
  const baseUrl = "baseUrl";

  describe("constructor", () => {
    it("should create an axios instance", () => {
      spyOn(axios, "create");
      new AxiosHelper("baseUrl");
      expect(axios.create).toHaveBeenCalledWith({ baseURL: baseUrl });
    });
  });

  describe("instance methods", () => {
    let axiosHelper;

    beforeEach(() => {
      axiosHelper = new AxiosHelper(baseUrl);
    });

    describe("doGet()", () => {
      const endPoint = "endPoint";

      it("should call axios get method with the expected options", async () => {
        const spy = spyOn(axiosHelper.axiosInstance, "get").and.returnValue(
          Promise.resolve({ data: "wadus" })
        );
        await axiosHelper.doGet(endPoint);
        expect(spy).toHaveBeenCalledWith(endPoint, jasmine.any(Object));
      });

      it("should return the request responsedata if the request is valid", async () => {
        spyOn(axiosHelper.axiosInstance, "get").and.returnValue(
          Promise.resolve({ status: 200, data: "wadus" })
        );
        const result = await axiosHelper.doGet(endPoint);
        expect(result).toEqual({ status: 200, data: "wadus" });
      });
    });
  });
});
