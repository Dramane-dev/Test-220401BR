const axios = require("axios").default;
const clientId = "BankinClientId";
const clientSecret = "secret";
const auth = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;

let axiosInstance = axios.create({
    baseURL: "http://localhost:3000/"
});

const addUserTokenToHeader = (accessToken) => {
    return new Promise((resolve, reject) => {
        console.log(accessToken);
        if (accessToken.length > 0) {
            let headerRequest = `Bearer ${accessToken}`;
            resolve(headerRequest);
        } else {
            reject(false);
        }
    });
};

const start = async () => {
    let body = {
        user: "BankinUser",
        password: "12345678"
    };

    axiosInstance.post(`login`, body, {
        headers: {
            "Authorization": auth
        }
    })
     .then((res) => {
        let refreshToken = res.data["refresh_token"];
        console.log(`[ REFRESH TOKEN ] ${refreshToken}`);
        return refreshToken;
     })
     .then((refreshToken) => {
        const params = new URLSearchParams();
        params.append("grant_type",'refresh_token');
        params.append('refresh_token', refreshToken);
        
        axiosInstance.post(`token`, params, {
            headers: {
                "content-type": "application/x-www-form-urlencoded"
            },
        })
         .then((res) => {
            let accessToken = res.data["access_token"];
            console.log(`[ ACCESS TOKEN ] ${accessToken}`);
            return accessToken
         })
         .then((accessToken) => {
            axiosInstance.get(`accounts`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })
             .then(async (res) => {
                let accounts = res.data.account;
                let datasParsed = [];

                accounts = await accounts.map(async (account, index) => {
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
                    datasParsed.push(account);
                    console.log(datasParsed);
                    return datasParsed;
                });
                return accounts;
             })
             .then((accountsParsed) => {
                console.log(accountsParsed);
             })
             .catch((error) => {
                console.error(error);
             })
         })
         .catch((error) => {
            console.error(error);
         })
     })
     .catch((error) => {
        console.error(error);
     });
};

start();

// (async () => {
//     let body = {
//         user: "BankinUser",
//         password: "12345678"
//     };

//     axiosInstance.post(`login`, body, {
//         headers: {
//             "Authorization": auth
//         }
//     });

//     console.log(accessToken.data.accessToken);

//     axiosInstance.get(`accounts`, {
//         headers: `Bearer ${accessToken.data.accessToken}`
//     })
//      .then((res) => {
//         console.log(res.data);
//      })
//      .catch((error) => {
//         console.log(error);
//      })
// })();