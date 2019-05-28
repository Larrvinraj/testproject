const axios = require('axios').default.create({
    baseURL: "http://api.openweathermap.org/data/2.5"
})

export const API = {
     getweather(params = {
        q,
        APPID
    }, cb) {
        axios.get("forecast", {
                params
            })
            .then(cb).catch(cb)
    },
}

export default API;