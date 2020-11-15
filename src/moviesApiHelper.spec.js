const MoviesApiHelper  = require('./moviesApiHelper.js')

describe('MoviesApiHelper', () => {
  const baseUrl = 'baseUrl'
  const userName = 'user'
  const password = 'pass'
  const token = 'theToken'

  describe('constructor', () => {
    it('should create an axios helper instance', () => {
      const helper = new MoviesApiHelper(baseUrl, userName, password)
      expect(helper.userName).toEqual(userName)
      expect(helper.password).toEqual(password)
      expect(helper.axiosHelper).toBeDefined()
      expect(helper.axiosHelper.axiosInstance.defaults.baseURL).toEqual(baseUrl)
    })
  })

  describe('instance methods', () => {
    let helper

    beforeEach(() => {
      helper = new MoviesApiHelper(baseUrl, userName, password)
    })

    describe('searchMovie()', () => {
      it('should get a token if the token is undefined', async () => {
        const spyDoPost = spyOn(helper.axiosHelper, 'doPost').and.returnValue({ token: token })
        const spyDoGetWithAuth = spyOn(helper.axiosHelper, 'doGetWithAuth').and.returnValue([])
        await helper.searchMovie('title')
        expect(spyDoPost).toHaveBeenCalledWith('/api/authenticate', {name: userName, password: password})
        expect(spyDoGetWithAuth).toHaveBeenCalledWith('/api/films?title=title', token)
      })

      it('should not get a new token if the token is NOT undefined', async () => {
        helper.token = 'theToken'
        const spyDoPost = spyOn(helper.axiosHelper, 'doPost').and.returnValue({ token: token })
        const spyDoGetWithAuth = spyOn(helper.axiosHelper, 'doGetWithAuth').and.returnValue([])
        await helper.searchMovie('title')
        expect(spyDoPost).not.toHaveBeenCalled()
        expect(spyDoGetWithAuth).toHaveBeenCalledWith('/api/films?title=title', token)
      })

      it('should set token to undefined when axiosHelper.doGetWithAuth() throws a 401', async () => {
        helper.token = 'theToken'
        spyOn(helper.axiosHelper, 'doGetWithAuth').and.returnValue(Promise.reject({ response: { status: 401, statusText: 'wadus' } }))
        try {
          await helper.searchMovie('title')
        } catch (error) {
        }
        expect(helper.token).toEqual(undefined)
      })

      it('should return the list when the token is valid', async () => {
        helper.token = 'theToken'
        const apiResult = [
          { title: 'title1', locationName: 'loc1'},
          { title: 'title2', locationName: 'loc2'}
        ]
        const spyDoGetWithAuth = spyOn(helper.axiosHelper, 'doGetWithAuth').and.returnValue(apiResult)
        const result = await helper.searchMovie('title')
        expect(result).toContain('title1 (loc1)')
        expect(result).toContain('title2 (loc2)')
      })
    })
  })
})

