const axios = require("axios").default;
const clientId = "BankinClientId";
const clientSecret = "secret";
const auth = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;

let axiosInstance = axios.create({
    baseURL: "http://localhost:3000/"
});

(async () => {
    try {
        let body = {
            user: "BankinUser",
            password: "12345678"
        };
        let refreshToken = (await axiosInstance.post(`login`, body, {
            headers: {
                "Authorization": auth
            }
        })).data["refresh_token"];
        const params = new URLSearchParams();
        params.append("grant_type",'refresh_token');
        params.append('refresh_token', refreshToken);
        let accessToken = (await axiosInstance.post(`token`, params, {
            headers: {
                "content-type": "application/x-www-form-urlencoded"
            },
        })).data["access_token"];
        let accounts = (await axiosInstance.get(`accounts`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })).data.account;
        let datasParsed = [];
        let index = 0;
    
        for await (let account of accounts) {
            let accountNumber = account['acc_number'];
            let result = await axiosInstance.get(`accounts/${accountNumber}/transactions`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            const { transactions } = result.data;
            account.transactions = [{
                label: transactions.length > 0 ? transactions[index].label : "",
                amount: transactions.length > 0 ? transactions[index].amount : "",
                currency: transactions.length > 0 ? transactions[index].currency : ""
            }];
            datasParsed.push(JSON.stringify(account));
            index++;
        }
    
        console.log(datasParsed);
    } catch (error) {
        console.log(error);
    }
})();