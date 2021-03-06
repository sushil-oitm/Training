import qs from "qs";
import { observable } from "mobx";

export default class WebConnect {
    config = null;
    constructor({ config }) {
        this.config = config;
        const { url } = this.config;
    }

    setUser(user) {
        this.user = user;
    }
    setToken(token) {
        this.token = token;
    }
    async setLocalStorage(...args) {
       await AsyncStorage.setItem(...args)
    }
 async removeLocalStorage(...args) {
       await AsyncStorage.removeItem(...args)
    }

    async find(param={}) {
          console.log("param in find>>>>>>"+JSON.stringify(param))
        let user=await AsyncStorage.getItem("user")
        // console.log("user in find>>",user)
        if (user) {
             user = JSON.parse(user);
        }
        let fields=param.fields || {};
        let filter=param.filter || {};
        let option={};

        if(param.limit){
            option.limit=param.limit
        }else{
            option.limit=20
        }
        if(param.skip){
            option.skip=param.skip
        }
        console.log("option>>>>>"+JSON.stringify(option))
        let queryInfo = {
                        id:"_find",
                        paramValue:{table:param.table,query:{fields,filter},option},
                        // token:"c72c43595459de9151151360a627891d9171e613"
                        token:user.token
                    };
        try{
            let  data=await  this.fetchData({uri: `/invoke`, body: queryInfo})
            if(data.meta){
                data.meta["query"]={fields,filter};
            }
            return data;
        }catch(e){
            console.log("Error is >>>>",e)
        }
    }
    async save(param) {
        let user=await AsyncStorage.getItem("user")
        if (user) {
            user = JSON.parse(user);
        }
        let queryInfo = {
                        id:"_save",
                        paramValue:param,
                        // token:"c72c43595459de9151151360a627891d9171e613"
                         token:user.token
                    };
        try{
            let  data=await  this.fetchData({uri: `/invoke`, body: queryInfo})
            return data;
        }catch(e){
           alert("Error is >>>>"+e.stack)
        }
    }
    async invoke({id,param}) {
         console.log("invoke called>>>>")
        let user=await AsyncStorage.getItem("user")
        if (user) {
            user = JSON.parse(user);
        }
        let queryInfo = {
                        id:id,
                        paramValue:param,
                    };
        if(user && user.token){
            queryInfo["token"]=user.token
        }
        try{
            let data=await  this.fetchData({uri: `/invoke`, body: queryInfo})
            return data;
        }catch(e){
            console.log("error on server>>>>",e)
            return e
            // alert("Error is >>>>",e)
        }
    }
    // upload(file, fileOptions) {
    //     let { multipart = true } = fileOptions || {};
    //     if (multipart) {
    //         /*by default multipart property is true , it is used to upload large size  of file @dipak*/
    //         let formData = new FormData();
    //         formData.append("", file);
    //         return this.fetchData({
    //             uri: `/upload?`,
    //             body: formData,
    //             multipart: true
    //         });
    //     } else {
    //         return new Promise((resolve, reject) => {
    //             try {
    //                 var fileReader = new FileReader();
    //                 fileReader.onload = event => {
    //                     this.fetchData({
    //                         uri: "/upload",
    //                         body: {
    //                             name: file.name,
    //                             type: file.type,
    //                             contents: event.target.result
    //                         }
    //                     })
    //                         .then(result => {
    //                             resolve(result);
    //                         })
    //                         .catch(err => {
    //                             reject(err);
    //                         });
    //                 };
    //                 fileReader.readAsDataURL(file);
    //             } catch (err) {
    //                 reject(err);
    //             }
    //         });
    //     }
    //
    //     //if(mobile){
    //     //  return this.fetchData({
    //     //    uri: "/upload",
    //     //    body: {
    //     //      name: file.fileName,
    //     //      type: file.type,
    //     //      contents: "data:image/jpeg;base64," + file.data,
    //     //      fileSize: file.fileSize
    //     //    }
    //     //  }).then(response => response.response && response.response.length && response.response[0]);
    //     //}
    // }

    async fetchData(props) {
        return this.fetch(this.config.url, props).then(result => {
            let { status, code, response } = result;
            if (status === "error" && code === 500) {
                response=response.error
                let error = new Error(response.message);
                error.code = response.code;
                // console.log("error in fetch>>>>>",error)
                throw error;
            } else {
                return response;
            }
        });
    }

    async fetch(url, { uri, body, multipart, method = "POST" }) {
        var url = `${url}${uri || ""}`;
        let fetchUrl = url;
        let parameters = void 0;
        if (method === "POST") {
            var headers = {
            }
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
        })
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
