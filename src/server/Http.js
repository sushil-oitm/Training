import Transaction from "./TransactionConnect";
import * as Formidable from "formidable";
import bodyParser from "body-parser";
import { invoke } from "./DBConnect";
import { runCron } from "./cron";
import { isJSONObject, deepClone } from "Utility";
import { getDecryptedParams } from "./decryption/Decryption";
import {Pipeline} from "../../../../manaze-store/src/rhs-common";
var urlParser = require("url");
var ObjectID = require("mongodb").ObjectID;
const { isJSONObject, deepClone } = PureFunctions;
var configure = async (
    app,
    config
) => {
    let { mailConfig, dbConnect, mongoConnect, fileConnect, resourceConnect, crons, rhsCrons, context, port } = config;
    process.on("uncaughtException", function (err) {
        console.log(">>>>uncaughtException>>>>>>>>>>>>", err.stack);
    });

    app.use(bodyParser.json({ limit: 2000 * 1024 })); // 2000Kb
    app.use(bodyParser.urlencoded({ extended: true, limit: 2000 * 1024 }));

    app.options("*", (req, res) => {
        res.writeHead(200, {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "access-control-allow-origin, content-type, accept"
        });
        res.end();
    });

const uploadFiles = async (req, resp, nativeConnect) => {
        try {
            var { files, token } = await readFiles(req);
            if (!token) {
                throw new Error("Token is mandatory to upload");
            }
            let ip = getIp(req);
            const transactionConnect = new Transaction(mongoConnect, void 0, { port, mailConfig, context });
            const dbConnect = DbConnect(transactionConnect);
            await authenticateUser(token, { _dbConnect: dbConnect, req: getRequestInfo(req) });

            var mongoResult = await nativeConnect.upload(files);
            await writeJSONResponse(mongoResult, req, resp);
        } catch (err) {
            await writeJSONResponse(err, req, resp);
        }
    };

    app.all("/upload", async (req, resp) => {
        // to upload files in database defined in fileConnect
        return await uploadFiles(req, resp, fileConnect);
    });

    app.all("/download", async (req, resp) => {
        try {
            var { fileKey, download, inline, token } = getRequestParams(req);
            if (!token) {
                throw new Error("Token is mandatory to download");
            }
            let ip = getIp(req);
            const transactionConnect = new Transaction(mongoConnect, void 0, { port, mailConfig, context });
            const dbConnect = DbConnect(transactionConnect);
            await authenticateUser(token, { _dbConnect: dbConnect, req: getRequestInfo(req) });

            var { data, fileName, contentType } = await fileConnect.download(fileKey);
            var options = { ignoreGzip: true, ignoreWrap: true };
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
            var reqParams = getRequestParams(req, true);
            let reqInfo = getRequestInfo(req);
            let result = await _invoke(reqParams, reqInfo, config);
            var { data, options } = parseResponseHeader(result);
            await writeJSONResponse(data, req, resp, options);
        } catch (err) {
            await writeJSONResponse(err, req, resp);
        }
    });
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

const isServiceLogEnabled = (context) => {
    let enableServiceLogs = true;
    if (context && context.MODE) {
        //to disable service logs in development mode -Khurshid 16/May/2018
        enableServiceLogs = context.MODE === "dev" ? false : true;
    }
    return enableServiceLogs;
}

const _invoke = async (params, reqInfo, config) => {
    console.log(">>>>/invoke called >>>>>>", JSON.stringify(params));
    let logs, logger, user, endHttpRequestLogging;
    let { mongoConnect, port, globalCache, context, systemProfiler,logger, mailConfig } = config || {};
    try {
        await modifyInvokeParams(params, config);
        let {id, token, appVersion, platform, deleteToken} = params;
        if (!id) {
            throw new Error("id is mandatory in invoke service");
        }
        if (!token) {
            throw new Error(`token is mandatory in invoke service >>>> ${id}`);
        }

        const transactionConnect = new Transaction(mongoConnect, void 0, { logger, port, mailConfig, context });
        const dbConnect = DbConnect(transactionConnect);
        let args = {
            _dbConnect: dbConnect,
            logger,
            req : reqInfo,
            globalCache,
            appVersion,
            platform
        }
        user = await authenticateUser(token, args, id);
        //used in mongo profiling
        let result = await invokeInternal(params, user, args, config);
        return result;
    } catch (err) {
        console.log("error in http", err)
        throw err;
    }
}

const modifyInvokeParams = async (params, config) => {
    let { id, paramValue, token } = params;
    /*
     * used in case of form submit - Md. Khurshid Khan
     * */
    if (!id && !paramValue && token) {
        const invokeData = await getServiceByToken({ ...params }, token, config.mongoConnect);
        params.id = invokeData.id;
        params.paramValue = invokeData.paramValue;
        params.deleteToken = true;
    }
}

const invokeInternal = async (params, user, args, config) => {
    let { _dbConnect: dbConnect } = args;
    try {
        let { id, paramValue, timezoneOffset, globalParamValue } = params;
        if (paramValue && typeof paramValue === "string") {
            paramValue = JSON.parse(paramValue);
        }
        paramValue = {
            ...paramValue,
            user
        };
        let result = await dbConnect(
            invoke(id, paramValue, {
                user,
                timezoneOffset,
                globalParamValue,
                ...args
            })
        );
        await dbConnect(commit());
        return result;
    } catch (err) {
        const mailConfig = config && config["mailConfig"];
        try {
            await dbConnect(rollback(dbConnect));
        } catch (rollbackError) {

            sendErrorMail(
                mailConfig && mailConfig.frameworkDeveloper,
                rollbackError,
                "Rollback Error",
                dbConnect,
                params,
                config
            );
        }
        let developers = mailConfig && mailConfig.applicationDeveloper;
        sendErrorMail(developers, err, "Service Log Error", dbConnect, params, config);
        throw err;
    }
}

const insertServiceLogs = (params, reqInfo, args, enableServiceLogs) => {
    if (!enableServiceLogs) {
        return;
    }
    let { logConnectNative } = args;
    let _id = new ObjectID();
    let {id, paramValue, token, appVersion, platform} = params;
    let logs = {
        startTime: new Date(),
        status: "InProgress",
        token,
        appVersion,
        platform
    };
    logs = modifyLogs(logs, id, paramValue, reqInfo);
    logs && logConnectNative.findAndModify("AppServiceLogs", { _id }, { $set: logs }, void 0, { upsert: true });
    logs._id = _id;
    return logs;
}

const updateServiceLogs = (logs, user, error, args, enableServiceLogs) => {
    if (!enableServiceLogs || !logs) {
        return;
    }
    let { logConnectNative, logger } = args;
    let updateLogs = {};
    if (user) {
        updateLogs.user = { _id: user._id, email: user.email, mobile: user.mobile };
    }
    if (error) {
        updateLogs.status = "Error";
        updateLogs.errorTrace = error.stack;
        updateLogs.errorMessage = error.message;
    } else {
        updateLogs.status = "Done";
    }
    updateLogs.endTime = new Date();
    updateLogs.totalTime = updateLogs.endTime.getTime() - logs.startTime.getTime();
    if (logger) {
        try {
            updateLogs.logs = JSON.stringify(logger.endLogging());
        } catch (err){
            updateLogs.logs = String(logger.endLogging());
        }
    }
    logConnectNative.findAndModify("AppServiceLogs", { _id: logs._id }, { $set: updateLogs });
}

const getIp = req => {
    let ip = req.headers["x-real-ip"] || req.headers["remoteip"] || req.ip || req.connection.remoteAddress;
    return ip;
};

var sendErrorMail = async (to, error, subject, dbConnect, params, config) => {
    console.log("Error in http: ", error);
    const mode = config && config.context && config.context.MODE;
    if(mode!=="dev"){
        console.log("Sending mail",to);
        if (!to) {
            to = "rohit.bansal@daffodilsw.com";
        }
        let mailOptions = {
            to,
            from: "developer@daffodilsw.com",
            subject,
            text: `Error: ${error.message}, Stack: ${error.stack}, params : ${params ? JSON.stringify(params) : ""} `
        };
        // await dbConnect(invoke("_sendMail", mailOptions, { _dbConnect: dbConnect }));
    }

};

var modifyLogs = (logs, id, paramValue, reqInfo) => {
    reqInfo = reqInfo || {};
    let isJSON = false;
    let newParamValue = paramValue;
    let paramRequired = id === "_authenticateUser" || id === "resetPassword" || id === "changePassword";
    if (!paramRequired && typeof paramValue === "string") {
        try {
            newParamValue = JSON.parse(paramValue);
            isJSON = true;
        } catch (error) { }
    }
    if (isJSONObject(newParamValue)) {
        isJSON = true;
    }
    logs.id = id;
    logs.ip_address = reqInfo.ip;
    logs.req_origin = reqInfo.origin;
    logs.req_host = reqInfo.host;
    if (!paramRequired) {
        logs.param = typeof newParamValue === "string" ? newParamValue : JSON.stringify(newParamValue);
    }
    if (isJSON && newParamValue._route) {
        logs.route = newParamValue._route;
    }
    if (isJSON && id == "_find") {
        logs.model = newParamValue.model;
        logs.query = newParamValue.query && newParamValue.query.id;
        if (newParamValue.query && newParamValue.query.relationValue) {
            logs.relationValue = newParamValue.query.relationValue;
        }
    } else if (isJSON && id == "_save") {
        logs.model = newParamValue.model;
        if (newParamValue.updates && newParamValue.updates._updates) {
            if (newParamValue.updates._updates.update) {
                logs.op = "update";
                logs.opId = newParamValue.updates._updates.update._id;
            } else if (newParamValue.updates._updates.remove) {
                logs.op = "remove";
                logs.opId = newParamValue.updates._updates.remove._id;
            }
            // TODO upsert case = pending - Saurav Suman - April 30th, 2018
        }
    }
    return logs;
};

var parseResponseHeader = response => {
    /*
     * to send html response value to be returned in below format
     * (example is present in file "demoMethods.js" in function "demoService()")
     *   const result = {
     *    _headers: {
     *        "Content-Type": "text/html",
     *     },
     *    _data: htmlData,
     * };
     * */
    var responseInfo = {};
    if (response && response._headers) {
        var { _pipe, _data, _headers, _download, _inline, _fileName, _ignoreGzip, _ignoreWrap, _code } = response;
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
    } else if(options._pipe){
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
    if (decryptRequired) {
        allParams = getDecryptedParams(allParams);
    }
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
                files.push({ filename: fileName, data: data, name: part.name });
            });
        };

        form.on("end", function () {
            if (fields.contents) {
                var contents = fields.contents.split(",").pop();
                var fileBuffer = new Buffer(contents, "base64");
                files.push({ filename: fields.name, type: fields.type, data: [fileBuffer] });
            }
            const token = fields && fields.token ? fields.token : body && body.token;
            return resolve({ files, token });
        });
        form.parse(req);
    });
}

const getServiceByToken = async (reqParams, token, mongoConnect) => {
    const result = await mongoConnect.find("Connection", { filter: { token }, fields: { service: 1, one_time_use: 1 } });
    const connectionData = result.result && result.result.length && result.result[0];
    const { one_time_use, service } = connectionData;

    if (!one_time_use) {
        throw new Error("Token is expired.");
    }

    let paramValue = {
        ...reqParams
    };
    delete paramValue.token;
    const returnValue = {
        id: service,
        paramValue
    };
    return returnValue;
};


//Authenticate user form token
const authenticateUser = async (token, args, service) => {
    if (!token) {
        return;
    }
    let authenticatedUserInfo = await args._dbConnect(invoke("_getAuthenticatedUser", { token, service }, args));
    const user = authenticatedUserInfo && authenticatedUserInfo.result;
    if (!user) {
        throw new Error("Invalid token >>>>>>>>>>>>", token);
    }
    return user;
};

const DbConnect = nativeDB => {
    return (fn, data) => {
        return fn(nativeDB, data);
    };
};


module.exports = {
    configure,
    getRequestParams,
    parseResponseHeader,
    writeJSONResponse,
    getRequestInfo,
    _invoke
};
