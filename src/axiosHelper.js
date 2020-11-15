const axios = require('axios')

module.exports = function (baseUrl) {

    this.axiosInstance = axios.create({
        baseURL: baseUrl
    })
    
    this.doPost = async (endpoint, postBody) => {
        const result = await this.axiosInstance.post(endpoint, postBody)
        return result.data
    }

    this.doGetWithAuth = async (endpoint, token) => {
        const result = await this.axiosInstance.get(endpoint, getAuthConfig(token))
        return result.data
    }

    getAuthConfig = (token) => {
        return {
            headers: {
              'x-access-token': token,
              'cache-control': 'no-cache'
            }
        }
    }
}
