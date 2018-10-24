import Transaction from "./TransactionConnect";
import * as Formidable from "formidable";
import bodyParser from "body-parser";
import {isJSONObject, deepClone} from "./Utility.js";

var urlParser = require("url");
var ObjectID = require("mongodb").ObjectID;
var configure = async (
    app,
    config
) => {
    let {mailConfig, mongoConnect, context} = config;
    process.on("uncaughtException", function (err) {
        console.log(">>>>uncaughtException>>>>>>>>>>>>", err.stack);
    });

    app.use(bodyParser.json({limit: 2000 * 1024})); // 2000Kb
    app.use(bodyParser.urlencoded({extended: true, limit: 2000 * 1024}));

    app.options("*", (req, res) => {
        res.writeHead(200, {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "access-control-allow-origin, content-type, accept"
        });
        res.end();
    });
    app.all("/upload", async (req, resp) => {
        // to upload files in database defined in fileConnect
        return await uploadFiles(req, resp, fileConnect);
    });

    app.all("/download", async (req, resp) => {
        try {
            var {fileKey, download, inline, token} = getRequestParams(req);
            if (!token) {
                throw new Error("Token is mandatory to download");
            }
            let ip = getIp(req);
            const transactionConnect = new Transaction(mongoConnect, void 0, {port, mailConfig, context});
            const dbConnect = DbConnect(transactionConnect);
            await authenticateUser(token, {_dbConnect: dbConnect, req: getRequestInfo(req)});

            var {data, fileName, contentType} = await fileConnect.download(fileKey);
            var options = {ignoreGzip: true, ignoreWrap: true};
            if (download || inline) {
                var head = {};
                head["Content-Disposition"] = (download ? "attachment" : "inline") + '; filename="' + fileName + '"';
                head["Content-Type"] = getContentType(fileName) || contentType;
                options["head"] = head;
            }
            await writeJSONResponse(data, req, resp, options);
        } catch (err) {
            await writeJSONResponse(err, req, resp);
        }
    });

    app.all("/runningStatus", async (req, resp) => {
        let runningStatus = "Server running";
        await writeJSONResponse(runningStatus, req, resp);
    });

    app.all("/invoke", async (req, resp) => {
        try {
            var reqParams = getRequestParams(req, false);
            console.log("invoke called with params>>>>>>>", JSON.stringify(reqParams))
            let reqInfo = getRequestInfo(req);
            let result = await _invoke(reqParams, reqInfo, config);
            var {data, options} = parseResponseHeader(result);
            await writeJSONResponse(data, req, resp, options);
        } catch (err) {
            await writeJSONResponse(err, req, resp);
        }
    });
};

const uploadFiles = async (req, resp, nativeConnect) => {
    try {
        var {files, token} = await readFiles(req);
        if (!token) {
            throw new Error("Token is mandatory to upload");
        }
        let ip = getIp(req);
        const transactionConnect = new Transaction(mongoConnect, void 0, {port, mailConfig, context});
        const dbConnect = DbConnect(transactionConnect);
        await authenticateUser(token, {_dbConnect: dbConnect, req: getRequestInfo(req)});

        var mongoResult = await nativeConnect.upload(files);
        await writeJSONResponse(mongoResult, req, resp);
    } catch (err) {
        await writeJSONResponse(err, req, resp);
    }
};

const getRequestInfo = (req) => {
    if (!req) {
        return {};
    }
    return {
        ip: getIp(req),
        host: req.get("host") || req.headers["host"],
        origin: req.get("origin") || req.headers["origin"]
    }
}

const _invoke = async (params, reqInfo, config) => {
    console.log(">>>>/invoke called >>>>>>", JSON.stringify(params));
    let {mongoConnect, port, globalCache, context,openServices} = config || {};
    try {
        let {id, token, platform,isOpenService=false,user={}} = params;
        if (!id) {
            throw new Error("id is mandatory in invoke service");
        }
        if(openServices && openServices.length > 0){
           if(openServices.indexOf(id)>-1){
               isOpenService=true;
           }
        }
        if (!token && !isOpenService) {
            throw new Error(`token is mandatory in invoke service >>>> ${id}`);
        }

        const transactionConnect = new Transaction(mongoConnect);
        // const dbConnect = new DbConnect(transactionConnect);
        let args = {
            _dbConnect: transactionConnect,
            globalCache,
            platform
        }
        if(!isOpenService){
            user = await authenticateUser(token, args, id);
        }

        //used in mongo profiling
        let result = await invokeInternal(params, user, args, config);
        return result;
    } catch (err) {
        console.log("error in http", err)
        throw err;
    }
}

const invokeInternal = async (params, user, args, config) => {
    let {_dbConnect: dbConnect} = args;
    try {
        let {id, paramValue, timezoneOffset, globalParamValue} = params;
        if (paramValue && typeof paramValue === "string") {
            paramValue = JSON.parse(paramValue);
        }
        paramValue = {
            ...paramValue,
            user
        };
        let result = await dbConnect.invoke(id, paramValue, {
            user,
            timezoneOffset,
            globalParamValue,
            ...args
        })

        await dbConnect.commit();
        return result;
    } catch (err) {
        try {
            await dbConnect.rollback();
        } catch (rollbackError) {
            console.log("error called>>>>>")
        }
        throw err;
    }
}


const getIp = req => {
    let ip = req.headers["x-real-ip"] || req.headers["remoteip"] || req.ip || req.connection.remoteAddress;
    return ip;
};

var sendErrorMail = async () => {
    //mail send from here
};


var parseResponseHeader = response => {
    var responseInfo = {};
    if (response && response._headers) {
        var {_pipe, _data, _headers, _download, _inline, _fileName, _ignoreGzip, _ignoreWrap, _code} = response;
        responseInfo.data = _data;
        responseInfo.options = {
            head: {
                ..._headers
            },
            code: _code,
            _pipe
        };
        if (!_headers["Content-Disposition"] && (_download || _inline)) {
            responseInfo.options.head[
                "Content-Disposition"
                ] = `${_inline ? "inline" : "attachment"}; Filename="${_fileName || "File"}"`;
        }
        if (_fileName && !_headers["Content-Type"]) {
            responseInfo.options.head["Content-Type"] = getContentType(_fileName) || "text/plain";
        }
        responseInfo.options.ignoreGzip = _ignoreGzip !== undefined ? _ignoreGzip : true;
        responseInfo.options.ignoreWrap = _ignoreWrap !== undefined ? _ignoreWrap : true;
    } else {
        responseInfo.data = response;
    }
    return responseInfo;
};

var getContentType = fileName => {
    var extension = fileName.split(".").pop();
    var extensionTypes = {
        css: "text/css",
        gif: "image/gif",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        js: "application/javascript",
        png: "image/png",
        mp4: "video/mp4",
        mp3: "audio/mpeg",
        txt: "text/plain",
        pdf: "application/pdf",
        xls: "application/vnd.openxmlformats",
        xlsx: "application/vnd.openxmlformats",
        html: "text/html",
        htm: "text/html"
    };
    if (!extension) {
        return;
    }
    extension = extension.toLowerCase();
    return extensionTypes[extension];
};

const writeJSONResponse = async (result, req, resp, options = {}) => {
    var jsonResponseType = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
    };
    if (result instanceof Error) {
        var errorResponse = {
            status: "error",
            stack: result.stack
        };
        errorResponse.code = 500;
        errorResponse.response = {
            error: {
                message: result.message,
                code: result.code
            }
        };
        /*writeHead will produces error if writeHead is called second time.
         * case http response ok then writeHead ok after that error in res.write() caz invoke writeJsonResponse for sending error then error produce by writrHead did not catched*/
        try {
            resp.writeHead(errorResponse.code, jsonResponseType);
        } catch (err) {
            console.log("err in write error>>>>>>>>>>>>>", err);
        }
        resp.write(JSON.stringify(errorResponse));
        resp.end();
    } else if (options._pipe) {
        let request = require("request-promise");
        return await request(result).pipe(resp);
    } else {
        var customHeader = options.head;
        if (customHeader) {
            jsonResponseType = {
                ...jsonResponseType,
                ...customHeader
            };
        }
        if (!options.ignoreWrap) {
            if (result === undefined) {
                result = null;
            }
            const responseData = {
                response: result,
                status: "ok",
                code: 200
            };
            result = JSON.stringify(responseData);
        }
        var gzipProperty = false;
        if (
            !options.ignoreGzip &&
            req.headers &&
            req.headers["accept-encoding"] &&
            req.headers["accept-encoding"].indexOf("gzip") >= 0
        ) {
            gzipProperty = true;
        }
        let responseCode = options.code || 200;
        if (gzipProperty) {
            var gzipRequire = require("zlib");
            gzipRequire.gzip(result, function (err, buffer) {
                var mergeHeader = {
                    "Content-Encoding": "gzip"
                };
                if (buffer.byteLength) {
                    mergeHeader["Content-Length"] = buffer.byteLength;
                }
                resp.writeHead(responseCode, {
                    ...jsonResponseType,
                    ...mergeHeader
                });
                resp.write(buffer);
                resp.end();
            });
        } else {
            resp.writeHead(responseCode, jsonResponseType);
            resp.write(result);
            resp.end();
        }
    }
};

const getRequestParams = (req, decryptRequired) => {
    var allParams = {};
    var params = req.params || {};
    var body = req.body || {};
    var query = req.query || {};
    for (var key in params) {
        if (params.hasOwnProperty(key)) {
            allParams[key] = params[key];
        }
    }
    for (var key in body) {
        if (allParams[key] === undefined) {
            allParams[key] = body[key];
        }
    }
    for (var key in query) {
        if (allParams[key] === undefined) {
            allParams[key] = query[key];
        }
    }
    /*if (decryptRequired) {
        allParams = getDecryptedParams(allParams);
    }*/
    return allParams;
};

function readFiles(req) {
    return new Promise((resolve, reject) => {
        var files = [];
        var fields = req.query || {};
        var body = req.body || {};
        var form = new Formidable.IncomingForm();
        form.on("error", function (err) {
            reject(err);
        });

        form.on("field", function (name, val) {
            fields[name] = val;
        });

        form.onPart = function (part) {
            if (!part.filename) {
                form.handlePart(part);
                return;
            }
            var data = [];
            var fileName = part.filename;
            part.on("data", function (buffer) {
                data.push(buffer);
            });

            part.on("end", function () {
                files.push({filename: fileName, data: data, name: part.name});
            });
        };

        form.on("end", function () {
            if (fields.contents) {
                var contents = fields.contents.split(",").pop();
                var fileBuffer = new Buffer(contents, "base64");
                files.push({filename: fields.name, type: fields.type, data: [fileBuffer]});
            }
            const token = fields && fields.token ? fields.token : body && body.token;
            return resolve({files, token});
        });
        form.parse(req);
    });
}


const authenticateUser = async (token, args, service) => {
    console.log("authenticateUser called>>>>" + token)
    if (!token) {
        return;
    }
    let authenticatedUserInfo = await authenticatedUserData(args._dbConnect, {token, service});
    const user = authenticatedUserInfo && authenticatedUserInfo.result.length > 0 && authenticatedUserInfo.result[0];
    // console.log("user>>>>>",user)
    if (!user) {
        throw new Error("Invalid token >>>>>>>>>>>>", token);
    }
    // console.log("user  authenticateUser successfully>>>>" + JSON.stringify(user))
    return user;
};

let authenticatedUserData = async (db, data) => {
    let user = await db.find("Connection", {filter: {token: data.token}}, {limit: 1})
    return user;
}


module.exports = {
    configure,
    getRequestParams,
    parseResponseHeader,
    writeJSONResponse,
    getRequestInfo,
    _invoke
};
