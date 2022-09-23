const Searcher = require("./searcher.js");

describe("Searcher", () => {
  const baseUrl = "baseUrl";

  describe("constructor", () => {
    it("should create an axios helper instance", () => {
      const helper = new Searcher(baseUrl);
      expect(helper.axiosHelper).toBeDefined();
      expect(helper.axiosHelper.axiosInstance.defaults.baseURL).toEqual(
        baseUrl
      );
    });
  });

  describe("instance methods", () => {
    let helper;

    beforeEach(() => {
      helper = new Searcher(baseUrl);
    });

    describe("searchMovie()", () => {
      it("should return the list when the lambda response is a 200", async () => {
        const lambdaResult = {
          data: [
            { Title: "title1", Location: "loc1" },
            { Title: "title2", Location: "loc2" },
          ],
          status: 200,
        };
        const spyDoGet = spyOn(helper.axiosHelper, "doGet").and.returnValue(
          lambdaResult
        );
        const result = await helper.searchMovie("title to search");
        expect(spyDoGet).toHaveBeenCalledWith("?title=title%20to%20search");
        expect(result).toContain("title1 (loc1)");
        expect(result).toContain("title2 (loc2)");
      });

      it ("should return the response status text when the lambda response is not a 200", async () => {
        const lambdaResult = {
          data: "message",
          status: 400,
        };
        const spyDoGet = spyOn(helper.axiosHelper, "doGet").and.returnValue(
          lambdaResult
        );
        const result = await helper.searchMovie("title to search");
        expect(result).toEqual("Response: [400] message");
      });
    });
  });
});
