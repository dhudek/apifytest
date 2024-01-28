    const axios = require("axios");

    const apiCall = async (url) => {
        const options = {
            method: "GET",
            url: `${url}`,
            headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "User-Agent": "apify home test"
            },
            // httpsAgent: new https.Agent({ rejectUnauthorized: false }) // if url is not secured by ssl
        };
        console.log(`api call to: ${options.url}.`)
        return await axios(options).then(async response => {
            const { status, statusText, data } = response;
            console.log(`api success responded with: ${statusText}.`)
            return {
                status,
                statusText,
                data
            };
        }).catch(error => {
            if (!error.response) {
                const  { code, syscall } = error;
                console.log(`api error ${code}. ${syscall}`)
                return {
                    code,
                    syscall,
                    error: JSON.stringify(error)
                }
            } else {
                const { status, statusText, data } = error.response;
                console.log(`api error responded with: ${statusText}.`)
                return {
                    status: status || "error status missing",
                    statusText: statusText || "error statusText missing",
                    data: data || "error data missing",
                    error: "api responded with error"
                }
            }
        })
    };

    const startScraping = async () => {
        let minPrice = 0;
        let maxPrice = 100000;
        let productsRunningLoop = true;
        let i = 0;
        const limit = 10;
        const products = [];
        while (productsRunningLoop) {
            i++; // iterate with limit being 10 of 
            if (i == limit) productsRunningLoop = false; // used to avoid infinite loop
            console.log(`iteration: ${i}`);
            console.log(`minPrice: ${minPrice}`);
            console.log(`maxPrice: ${maxPrice}`);
            const url = "https://api.ecommerce.com/products"
            /** 
             * api call 
             * @param url {string}
             * @returns {Promise<*>} 
            */
            const api = await apiCall(`${url}?minPrice=${minPrice}&maxPrice=${maxPrice}`);
            if (api.error) productsRunningLoop = false; // api error stop iterating
            if (api.total < 1000) { 
                // used if for some reason total is ever under 1000, since count is expected to always return 1000
                console.log(`total is smaller than 1000`);
                products.push(...api.data.products);
                productsRunningLoop = false;
            };
            
            if (api.count < 1000) {
                console.log(`count is smaller than 1000, starting to load products array`);
                products.push(...api.data.products);
                if (maxPrice > 100000) productsRunningLoop = false; // because maxPrice can only be 100000 so should have loaded everything by this time. 
                minPrice = maxPrice; // works as offset
                maxPrice = maxPrice*2; // works as limit
            } else {
                maxPrice = maxPrice/2
                console.log(`count is to big dividing maxPrice by 2`);        
            };
        }
    };
    startScraping();
