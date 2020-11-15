const AxiosHelper = require('./axiosHelper.js')

module.exports = function(baseURL, userName, password) {
    this.axiosHelper = new AxiosHelper(baseURL)
    this.userName = userName
    this.password = password

    setToken = async () => {
        const tokenBody = {
            name: this.userName,
            password: this.password
        }

        const result = await this.axiosHelper.doPost('/api/authenticate', tokenBody)
        this.token = result.token
    }

    this.searchMovie = async (titleToSearch) => {
        if (this.token === undefined) {
            await setToken()
        }

        try {
            const endpoint = getSearchEndpoint(titleToSearch)
            const result = await this.axiosHelper.doGetWithAuth(endpoint, this.token)
            return processSearchResult(result)
        } catch (error) {
            console.log(error)
            if (error.response.status === 401) {
                this.token = undefined
            }
            throw error
        }
    }

    getSearchEndpoint = (titleToSearch) => {
        return '/api/films?title=' + encodeURIComponent(titleToSearch)
    }
    
    processSearchResult = (apiResult) => {
        const result = []
        result.push(`${apiResult.length} found:`)

        apiResult.forEach(element => {
            result.push(`- ${element.title} (${element.locationName})`)
        });
            
        return result.join('\n\n');
    }
}
