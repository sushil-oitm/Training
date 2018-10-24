import qs from "qs";
import { observable } from "mobx";
// var io = require("socket.io-client");

export default class WebConnect {
    config = null;
    constructor({ config }) {
        this.config = config;
        const { url } = this.config;
    }

    setUser(user) {
        this.user = user;
    }

    find(model, query) {
        if (typeof model === "function") {
            model = model();
        }
        console.log("web find called>>>>")
        return new Promise((resolve, reject) => {
            AsyncStorage.getItem("user").then(user => {
                if (user) {
                    user = JSON.parse(user);
                }
                if (typeof query == "string") {
                    query = { id: query };
                }
                let queryInfo = {
                    query: query,
                    model: model._id,
                    user
                };
                this.socket.emit("load", queryInfo, (errMessage, data) => {
                    if (errMessage) {
                        window.alert(`Err in loading data>>>>>${errMessage}`);
                        reject(errMessage);
                    } else {
                        resolve(data);
                    }
                });
            });
        });
    }

    save(updates, model) {
        if (typeof model === "function") {
            model = model();
        }
        return new Promise((resolve, reject) => {
            AsyncStorage.getItem("user").then(user => {
                if (user) {
                    user = JSON.parse(user);
                }
                this.socket.emit(
                    "save",
                    {
                        updates,
                        model: model._id,
                        user
                    },
                    (errMessage, data) => {
                        if (errMessage) {
                            window.alert(`Err in save data>>>>>>>>>>${errMessage}`);
                            reject(errMessage);
                        } else {
                            console.log("data>>>>>>>>>>>>>", data);
                            resolve(data);
                        }
                    }
                );
            });
        });
    }

    upload(file, fileOptions) {
        let { multipart = true } = fileOptions || {};
        if (multipart) {
            /*by default multipart property is true , it is used to upload large size  of file @dipak*/
            let formData = new FormData();
            formData.append("", file);
            return this.fetchData({
                uri: `/upload?`,
                body: formData,
                multipart: true
            });
        } else {
            return new Promise((resolve, reject) => {
                try {
                    var fileReader = new FileReader();
                    fileReader.onload = event => {
                        this.fetchData({
                            uri: "/upload",
                            body: {
                                name: file.name,
                                type: file.type,
                                contents: event.target.result
                            }
                        })
                            .then(result => {
                                resolve(result);
                            })
                            .catch(err => {
                                reject(err);
                            });
                    };
                    fileReader.readAsDataURL(file);
                } catch (err) {
                    reject(err);
                }
            });
        }

        //if(mobile){
        //  return this.fetchData({
        //    uri: "/upload",
        //    body: {
        //      name: file.fileName,
        //      type: file.type,
        //      contents: "data:image/jpeg;base64," + file.data,
        //      fileSize: file.fileSize
        //    }
        //  }).then(response => response.response && response.response.length && response.response[0]);
        //}
    }

    fetchData(props) {
        return this.fetch(this.config.url, props).then(result => {
            let { status, code, response } = result;
            if (status === "error" && code === 500) {
                let error = new Error(response.message);
                error.code = response.code;
                throw error;
            } else {
                return response;
            }
        });
    }

    fetch(url, { uri, body, multipart, method = "POST" }) {
        var url = `${url}${uri || ""}`;
        let fetchUrl = url;
        let parameters = void 0;
        if (method === "POST") {
            var headers = {};
            /*if uploading a  multipart file then do not make headers and modify body @Dipak   */
            if (!multipart) {
                headers = {
                    Accept: "application/json",
                    "Content-Type": "application/x-www-form-urlencoded"
                };
                if (typeof body !== "string") {
                    /*in web case urlencoded is used and requires stringify of parameters*/
                    if (headers && headers["Content-Type"] === "application/x-www-form-urlencoded") {
                        body = qs.stringify(body);
                    } else {
                        body = JSON.stringify(body);
                    }
                }
            }
            parameters = {
                headers,
                body,
                method
            };
        } else {
            const encodedQuery = qs.stringify(body);
            fetchUrl += `?${encodedQuery}`;
        }
        return fetch(fetchUrl, parameters).then(_res => {
            return _res.json();
        });
    }
}

const AsyncStorage = {
    setItem(...args) {
        return Promise.resolve(localStorage.setItem(...args));
    },
    getItem(...args) {
        return Promise.resolve(localStorage.getItem(...args));
    },
    removeItem(...args) {
        return Promise.resolve(localStorage.removeItem(...args));
    }
};

export const loadUser= () => {
    return AsyncStorage.getItem("user").then(user => {
        if (user) {
            user = JSON.parse(user);
        }
        return user;
    });
};
