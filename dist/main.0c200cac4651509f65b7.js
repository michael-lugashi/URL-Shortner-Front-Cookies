/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/axios/index.js":
/*!*************************************!*\
  !*** ./node_modules/axios/index.js ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! ./lib/axios */ "./node_modules/axios/lib/axios.js");

/***/ }),

/***/ "./node_modules/axios/lib/adapters/xhr.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/adapters/xhr.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var settle = __webpack_require__(/*! ./../core/settle */ "./node_modules/axios/lib/core/settle.js");
var cookies = __webpack_require__(/*! ./../helpers/cookies */ "./node_modules/axios/lib/helpers/cookies.js");
var buildURL = __webpack_require__(/*! ./../helpers/buildURL */ "./node_modules/axios/lib/helpers/buildURL.js");
var buildFullPath = __webpack_require__(/*! ../core/buildFullPath */ "./node_modules/axios/lib/core/buildFullPath.js");
var parseHeaders = __webpack_require__(/*! ./../helpers/parseHeaders */ "./node_modules/axios/lib/helpers/parseHeaders.js");
var isURLSameOrigin = __webpack_require__(/*! ./../helpers/isURLSameOrigin */ "./node_modules/axios/lib/helpers/isURLSameOrigin.js");
var createError = __webpack_require__(/*! ../core/createError */ "./node_modules/axios/lib/core/createError.js");
var defaults = __webpack_require__(/*! ../defaults */ "./node_modules/axios/lib/defaults.js");
var Cancel = __webpack_require__(/*! ../cancel/Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;
    var responseType = config.responseType;
    var onCanceled;
    function done() {
      if (config.cancelToken) {
        config.cancelToken.unsubscribe(onCanceled);
      }

      if (config.signal) {
        config.signal.removeEventListener('abort', onCanceled);
      }
    }

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    var fullPath = buildFullPath(config.baseURL, config.url);
    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    function onloadend() {
      if (!request) {
        return;
      }
      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
        request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(function _resolve(value) {
        resolve(value);
        done();
      }, function _reject(err) {
        reject(err);
        done();
      }, response);

      // Clean up request
      request = null;
    }

    if ('onloadend' in request) {
      // Use onloadend if available
      request.onloadend = onloadend;
    } else {
      // Listen for ready state to emulate onloadend
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }

        // The request errored out and we didn't get a response, this will be
        // handled by onerror instead
        // With one exception: request that using file: protocol, most browsers
        // will return status as 0 even though it's a successful request
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
          return;
        }
        // readystate handler is calling before onerror or ontimeout handlers,
        // so we should call onloadend on the next 'tick'
        setTimeout(onloadend);
      };
    }

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(createError('Request aborted', config, 'ECONNABORTED', request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded';
      var transitional = config.transitional || defaults.transitional;
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(createError(
        timeoutErrorMessage,
        config,
        transitional.clarifyTimeoutError ? 'ETIMEDOUT' : 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (responseType && responseType !== 'json') {
      request.responseType = config.responseType;
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken || config.signal) {
      // Handle cancellation
      // eslint-disable-next-line func-names
      onCanceled = function(cancel) {
        if (!request) {
          return;
        }
        reject(!cancel || (cancel && cancel.type) ? new Cancel('canceled') : cancel);
        request.abort();
        request = null;
      };

      config.cancelToken && config.cancelToken.subscribe(onCanceled);
      if (config.signal) {
        config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
      }
    }

    if (!requestData) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/axios.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/axios.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "./node_modules/axios/lib/utils.js");
var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");
var Axios = __webpack_require__(/*! ./core/Axios */ "./node_modules/axios/lib/core/Axios.js");
var mergeConfig = __webpack_require__(/*! ./core/mergeConfig */ "./node_modules/axios/lib/core/mergeConfig.js");
var defaults = __webpack_require__(/*! ./defaults */ "./node_modules/axios/lib/defaults.js");

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  // Factory for creating new instances
  instance.create = function create(instanceConfig) {
    return createInstance(mergeConfig(defaultConfig, instanceConfig));
  };

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Expose Cancel & CancelToken
axios.Cancel = __webpack_require__(/*! ./cancel/Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");
axios.CancelToken = __webpack_require__(/*! ./cancel/CancelToken */ "./node_modules/axios/lib/cancel/CancelToken.js");
axios.isCancel = __webpack_require__(/*! ./cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");
axios.VERSION = __webpack_require__(/*! ./env/data */ "./node_modules/axios/lib/env/data.js").version;

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = __webpack_require__(/*! ./helpers/spread */ "./node_modules/axios/lib/helpers/spread.js");

// Expose isAxiosError
axios.isAxiosError = __webpack_require__(/*! ./helpers/isAxiosError */ "./node_modules/axios/lib/helpers/isAxiosError.js");

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports["default"] = axios;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/Cancel.js":
/*!*************************************************!*\
  !*** ./node_modules/axios/lib/cancel/Cancel.js ***!
  \*************************************************/
/***/ ((module) => {

"use strict";


/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/CancelToken.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/cancel/CancelToken.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Cancel = __webpack_require__(/*! ./Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;

  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;

  // eslint-disable-next-line func-names
  this.promise.then(function(cancel) {
    if (!token._listeners) return;

    var i;
    var l = token._listeners.length;

    for (i = 0; i < l; i++) {
      token._listeners[i](cancel);
    }
    token._listeners = null;
  });

  // eslint-disable-next-line func-names
  this.promise.then = function(onfulfilled) {
    var _resolve;
    // eslint-disable-next-line func-names
    var promise = new Promise(function(resolve) {
      token.subscribe(resolve);
      _resolve = resolve;
    }).then(onfulfilled);

    promise.cancel = function reject() {
      token.unsubscribe(_resolve);
    };

    return promise;
  };

  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Subscribe to the cancel signal
 */

CancelToken.prototype.subscribe = function subscribe(listener) {
  if (this.reason) {
    listener(this.reason);
    return;
  }

  if (this._listeners) {
    this._listeners.push(listener);
  } else {
    this._listeners = [listener];
  }
};

/**
 * Unsubscribe from the cancel signal
 */

CancelToken.prototype.unsubscribe = function unsubscribe(listener) {
  if (!this._listeners) {
    return;
  }
  var index = this._listeners.indexOf(listener);
  if (index !== -1) {
    this._listeners.splice(index, 1);
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/isCancel.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/cancel/isCancel.js ***!
  \***************************************************/
/***/ ((module) => {

"use strict";


module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/Axios.js":
/*!**********************************************!*\
  !*** ./node_modules/axios/lib/core/Axios.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var buildURL = __webpack_require__(/*! ../helpers/buildURL */ "./node_modules/axios/lib/helpers/buildURL.js");
var InterceptorManager = __webpack_require__(/*! ./InterceptorManager */ "./node_modules/axios/lib/core/InterceptorManager.js");
var dispatchRequest = __webpack_require__(/*! ./dispatchRequest */ "./node_modules/axios/lib/core/dispatchRequest.js");
var mergeConfig = __webpack_require__(/*! ./mergeConfig */ "./node_modules/axios/lib/core/mergeConfig.js");
var validator = __webpack_require__(/*! ../helpers/validator */ "./node_modules/axios/lib/helpers/validator.js");

var validators = validator.validators;
/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = arguments[1] || {};
    config.url = arguments[0];
  } else {
    config = config || {};
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  var transitional = config.transitional;

  if (transitional !== undefined) {
    validator.assertOptions(transitional, {
      silentJSONParsing: validators.transitional(validators.boolean),
      forcedJSONParsing: validators.transitional(validators.boolean),
      clarifyTimeoutError: validators.transitional(validators.boolean)
    }, false);
  }

  // filter out skipped interceptors
  var requestInterceptorChain = [];
  var synchronousRequestInterceptors = true;
  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
      return;
    }

    synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

    requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  var responseInterceptorChain = [];
  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
  });

  var promise;

  if (!synchronousRequestInterceptors) {
    var chain = [dispatchRequest, undefined];

    Array.prototype.unshift.apply(chain, requestInterceptorChain);
    chain = chain.concat(responseInterceptorChain);

    promise = Promise.resolve(config);
    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }

    return promise;
  }


  var newConfig = config;
  while (requestInterceptorChain.length) {
    var onFulfilled = requestInterceptorChain.shift();
    var onRejected = requestInterceptorChain.shift();
    try {
      newConfig = onFulfilled(newConfig);
    } catch (error) {
      onRejected(error);
      break;
    }
  }

  try {
    promise = dispatchRequest(newConfig);
  } catch (error) {
    return Promise.reject(error);
  }

  while (responseInterceptorChain.length) {
    promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: (config || {}).data
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;


/***/ }),

/***/ "./node_modules/axios/lib/core/InterceptorManager.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/core/InterceptorManager.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected,
    synchronous: options ? options.synchronous : false,
    runWhen: options ? options.runWhen : null
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;


/***/ }),

/***/ "./node_modules/axios/lib/core/buildFullPath.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/buildFullPath.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var isAbsoluteURL = __webpack_require__(/*! ../helpers/isAbsoluteURL */ "./node_modules/axios/lib/helpers/isAbsoluteURL.js");
var combineURLs = __webpack_require__(/*! ../helpers/combineURLs */ "./node_modules/axios/lib/helpers/combineURLs.js");

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
module.exports = function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/createError.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/createError.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var enhanceError = __webpack_require__(/*! ./enhanceError */ "./node_modules/axios/lib/core/enhanceError.js");

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/dispatchRequest.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/core/dispatchRequest.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var transformData = __webpack_require__(/*! ./transformData */ "./node_modules/axios/lib/core/transformData.js");
var isCancel = __webpack_require__(/*! ../cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");
var defaults = __webpack_require__(/*! ../defaults */ "./node_modules/axios/lib/defaults.js");
var Cancel = __webpack_require__(/*! ../cancel/Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }

  if (config.signal && config.signal.aborted) {
    throw new Cancel('canceled');
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData.call(
    config,
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData.call(
      config,
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData.call(
          config,
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/core/enhanceError.js":
/*!*****************************************************!*\
  !*** ./node_modules/axios/lib/core/enhanceError.js ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";


/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;
  error.isAxiosError = true;

  error.toJSON = function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code,
      status: this.response && this.response.status ? this.response.status : null
    };
  };
  return error;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/mergeConfig.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/mergeConfig.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
module.exports = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  var config = {};

  function getMergedValue(target, source) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return utils.merge(target, source);
    } else if (utils.isPlainObject(source)) {
      return utils.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  // eslint-disable-next-line consistent-return
  function mergeDeepProperties(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function valueFromConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(undefined, config2[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function defaultToConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(undefined, config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function mergeDirectKeys(prop) {
    if (prop in config2) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (prop in config1) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  var mergeMap = {
    'url': valueFromConfig2,
    'method': valueFromConfig2,
    'data': valueFromConfig2,
    'baseURL': defaultToConfig2,
    'transformRequest': defaultToConfig2,
    'transformResponse': defaultToConfig2,
    'paramsSerializer': defaultToConfig2,
    'timeout': defaultToConfig2,
    'timeoutMessage': defaultToConfig2,
    'withCredentials': defaultToConfig2,
    'adapter': defaultToConfig2,
    'responseType': defaultToConfig2,
    'xsrfCookieName': defaultToConfig2,
    'xsrfHeaderName': defaultToConfig2,
    'onUploadProgress': defaultToConfig2,
    'onDownloadProgress': defaultToConfig2,
    'decompress': defaultToConfig2,
    'maxContentLength': defaultToConfig2,
    'maxBodyLength': defaultToConfig2,
    'transport': defaultToConfig2,
    'httpAgent': defaultToConfig2,
    'httpsAgent': defaultToConfig2,
    'cancelToken': defaultToConfig2,
    'socketPath': defaultToConfig2,
    'responseEncoding': defaultToConfig2,
    'validateStatus': mergeDirectKeys
  };

  utils.forEach(Object.keys(config1).concat(Object.keys(config2)), function computeConfigValue(prop) {
    var merge = mergeMap[prop] || mergeDeepProperties;
    var configValue = merge(prop);
    (utils.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
  });

  return config;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/settle.js":
/*!***********************************************!*\
  !*** ./node_modules/axios/lib/core/settle.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var createError = __webpack_require__(/*! ./createError */ "./node_modules/axios/lib/core/createError.js");

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};


/***/ }),

/***/ "./node_modules/axios/lib/core/transformData.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/transformData.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var defaults = __webpack_require__(/*! ./../defaults */ "./node_modules/axios/lib/defaults.js");

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  var context = this || defaults;
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn.call(context, data, headers);
  });

  return data;
};


/***/ }),

/***/ "./node_modules/axios/lib/defaults.js":
/*!********************************************!*\
  !*** ./node_modules/axios/lib/defaults.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "./node_modules/axios/lib/utils.js");
var normalizeHeaderName = __webpack_require__(/*! ./helpers/normalizeHeaderName */ "./node_modules/axios/lib/helpers/normalizeHeaderName.js");
var enhanceError = __webpack_require__(/*! ./core/enhanceError */ "./node_modules/axios/lib/core/enhanceError.js");

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = __webpack_require__(/*! ./adapters/xhr */ "./node_modules/axios/lib/adapters/xhr.js");
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = __webpack_require__(/*! ./adapters/http */ "./node_modules/axios/lib/adapters/xhr.js");
  }
  return adapter;
}

function stringifySafely(rawValue, parser, encoder) {
  if (utils.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils.trim(rawValue);
    } catch (e) {
      if (e.name !== 'SyntaxError') {
        throw e;
      }
    }
  }

  return (encoder || JSON.stringify)(rawValue);
}

var defaults = {

  transitional: {
    silentJSONParsing: true,
    forcedJSONParsing: true,
    clarifyTimeoutError: false
  },

  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');

    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data) || (headers && headers['Content-Type'] === 'application/json')) {
      setContentTypeIfUnset(headers, 'application/json');
      return stringifySafely(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    var transitional = this.transitional || defaults.transitional;
    var silentJSONParsing = transitional && transitional.silentJSONParsing;
    var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
    var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';

    if (strictJSONParsing || (forcedJSONParsing && utils.isString(data) && data.length)) {
      try {
        return JSON.parse(data);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === 'SyntaxError') {
            throw enhanceError(e, this, 'E_JSON_PARSE');
          }
          throw e;
        }
      }
    }

    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  },

  headers: {
    common: {
      'Accept': 'application/json, text/plain, */*'
    }
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;


/***/ }),

/***/ "./node_modules/axios/lib/env/data.js":
/*!********************************************!*\
  !*** ./node_modules/axios/lib/env/data.js ***!
  \********************************************/
/***/ ((module) => {

module.exports = {
  "version": "0.24.0"
};

/***/ }),

/***/ "./node_modules/axios/lib/helpers/bind.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/helpers/bind.js ***!
  \************************************************/
/***/ ((module) => {

"use strict";


module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/buildURL.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/helpers/buildURL.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/combineURLs.js":
/*!*******************************************************!*\
  !*** ./node_modules/axios/lib/helpers/combineURLs.js ***!
  \*******************************************************/
/***/ ((module) => {

"use strict";


/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/cookies.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/helpers/cookies.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

  // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isAbsoluteURL.js":
/*!*********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isAbsoluteURL.js ***!
  \*********************************************************/
/***/ ((module) => {

"use strict";


/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isAxiosError.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isAxiosError.js ***!
  \********************************************************/
/***/ ((module) => {

"use strict";


/**
 * Determines whether the payload is an error thrown by Axios
 *
 * @param {*} payload The value to test
 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
 */
module.exports = function isAxiosError(payload) {
  return (typeof payload === 'object') && (payload.isAxiosError === true);
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isURLSameOrigin.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isURLSameOrigin.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
      function resolveURL(url) {
        var href = url;

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/normalizeHeaderName.js":
/*!***************************************************************!*\
  !*** ./node_modules/axios/lib/helpers/normalizeHeaderName.js ***!
  \***************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/parseHeaders.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/parseHeaders.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/spread.js":
/*!**************************************************!*\
  !*** ./node_modules/axios/lib/helpers/spread.js ***!
  \**************************************************/
/***/ ((module) => {

"use strict";


/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/validator.js":
/*!*****************************************************!*\
  !*** ./node_modules/axios/lib/helpers/validator.js ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var VERSION = __webpack_require__(/*! ../env/data */ "./node_modules/axios/lib/env/data.js").version;

var validators = {};

// eslint-disable-next-line func-names
['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function(type, i) {
  validators[type] = function validator(thing) {
    return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
  };
});

var deprecatedWarnings = {};

/**
 * Transitional option validator
 * @param {function|boolean?} validator - set to false if the transitional option has been removed
 * @param {string?} version - deprecated version / removed since version
 * @param {string?} message - some message with additional info
 * @returns {function}
 */
validators.transitional = function transitional(validator, version, message) {
  function formatMessage(opt, desc) {
    return '[Axios v' + VERSION + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
  }

  // eslint-disable-next-line func-names
  return function(value, opt, opts) {
    if (validator === false) {
      throw new Error(formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')));
    }

    if (version && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      // eslint-disable-next-line no-console
      console.warn(
        formatMessage(
          opt,
          ' has been deprecated since v' + version + ' and will be removed in the near future'
        )
      );
    }

    return validator ? validator(value, opt, opts) : true;
  };
};

/**
 * Assert object's properties type
 * @param {object} options
 * @param {object} schema
 * @param {boolean?} allowUnknown
 */

function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== 'object') {
    throw new TypeError('options must be an object');
  }
  var keys = Object.keys(options);
  var i = keys.length;
  while (i-- > 0) {
    var opt = keys[i];
    var validator = schema[opt];
    if (validator) {
      var value = options[opt];
      var result = value === undefined || validator(value, opt, options);
      if (result !== true) {
        throw new TypeError('option ' + opt + ' must be ' + result);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw Error('Unknown option ' + opt);
    }
  }
}

module.exports = {
  assertOptions: assertOptions,
  validators: validators
};


/***/ }),

/***/ "./node_modules/axios/lib/utils.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/utils.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
function isPlainObject(val) {
  if (toString.call(val) !== '[object Object]') {
    return false;
  }

  var prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 * @return {string} content value without BOM
 */
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim,
  stripBOM: stripBOM
};


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/style.css":
/*!*************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/style.css ***!
  \*************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, "body {\r\n  background-color: aqua;\r\n}\r\nh1 {\r\n  color: rgb(34, 141, 48);\r\n  text-align: center;\r\n  margin-top: 20px;\r\n}\r\n#table {\r\n  margin: auto;\r\n  width: 80vw !important;\r\n}\r\n\r\n.table .borderCorner1 {\r\n  border-top-left-radius: 20px;\r\n}\r\n.table .borderCorner2 {\r\n  border-top-right-radius: 20px;\r\n}\r\n.form-floating {\r\n  display: flex;\r\n  margin: auto;\r\n  max-width: 80vw;\r\n}\r\n.btn {\r\n  font-size: 20px;\r\n  border-radius: 0px 10px 10px 0px;\r\n  background-color: rgb(34, 141, 48);\r\n}\r\n.display {\r\n  margin: auto;\r\n  display: flex;\r\n  width: 80vw;\r\n}\r\n.shortendLabel {\r\n  display: flex;\r\n  background-color: rgb(34, 141, 48);\r\n  border-radius: 10px 0px 0px 10px;\r\n  color: white;\r\n  height: 60px;\r\n  font-size: 20px;\r\n  width: 160px;\r\n  align-items: center;\r\n  justify-content: center;\r\n}\r\n#shortendUrl {\r\n  background-color: white;\r\n  width: 80vw;\r\n  display: flex;\r\n  align-items: center;\r\n  font-size: 20px;\r\n  border-radius: 0px 10px 10px 0px;\r\n  height: 60px;\r\n  padding-left: 10px;\r\n}\r\n#originalUrlInput {\r\n  border-radius: 10px 0px 0px 10px;\r\n}\r\n.tableHeading {\r\n  color: rgb(34, 141, 48);\r\n  text-align: center;\r\n  margin-bottom: 15px;\r\n}\r\nth {\r\n  text-align: center;\r\n}\r\n.lengthControl {\r\n  word-break: break-all;\r\n  max-width: 28vw;\r\n  min-width: 200px !important;\r\n}\r\n", "",{"version":3,"sources":["webpack://./src/style.css"],"names":[],"mappings":"AAAA;EACE,sBAAsB;AACxB;AACA;EACE,uBAAuB;EACvB,kBAAkB;EAClB,gBAAgB;AAClB;AACA;EACE,YAAY;EACZ,sBAAsB;AACxB;;AAEA;EACE,4BAA4B;AAC9B;AACA;EACE,6BAA6B;AAC/B;AACA;EACE,aAAa;EACb,YAAY;EACZ,eAAe;AACjB;AACA;EACE,eAAe;EACf,gCAAgC;EAChC,kCAAkC;AACpC;AACA;EACE,YAAY;EACZ,aAAa;EACb,WAAW;AACb;AACA;EACE,aAAa;EACb,kCAAkC;EAClC,gCAAgC;EAChC,YAAY;EACZ,YAAY;EACZ,eAAe;EACf,YAAY;EACZ,mBAAmB;EACnB,uBAAuB;AACzB;AACA;EACE,uBAAuB;EACvB,WAAW;EACX,aAAa;EACb,mBAAmB;EACnB,eAAe;EACf,gCAAgC;EAChC,YAAY;EACZ,kBAAkB;AACpB;AACA;EACE,gCAAgC;AAClC;AACA;EACE,uBAAuB;EACvB,kBAAkB;EAClB,mBAAmB;AACrB;AACA;EACE,kBAAkB;AACpB;AACA;EACE,qBAAqB;EACrB,eAAe;EACf,2BAA2B;AAC7B","sourcesContent":["body {\r\n  background-color: aqua;\r\n}\r\nh1 {\r\n  color: rgb(34, 141, 48);\r\n  text-align: center;\r\n  margin-top: 20px;\r\n}\r\n#table {\r\n  margin: auto;\r\n  width: 80vw !important;\r\n}\r\n\r\n.table .borderCorner1 {\r\n  border-top-left-radius: 20px;\r\n}\r\n.table .borderCorner2 {\r\n  border-top-right-radius: 20px;\r\n}\r\n.form-floating {\r\n  display: flex;\r\n  margin: auto;\r\n  max-width: 80vw;\r\n}\r\n.btn {\r\n  font-size: 20px;\r\n  border-radius: 0px 10px 10px 0px;\r\n  background-color: rgb(34, 141, 48);\r\n}\r\n.display {\r\n  margin: auto;\r\n  display: flex;\r\n  width: 80vw;\r\n}\r\n.shortendLabel {\r\n  display: flex;\r\n  background-color: rgb(34, 141, 48);\r\n  border-radius: 10px 0px 0px 10px;\r\n  color: white;\r\n  height: 60px;\r\n  font-size: 20px;\r\n  width: 160px;\r\n  align-items: center;\r\n  justify-content: center;\r\n}\r\n#shortendUrl {\r\n  background-color: white;\r\n  width: 80vw;\r\n  display: flex;\r\n  align-items: center;\r\n  font-size: 20px;\r\n  border-radius: 0px 10px 10px 0px;\r\n  height: 60px;\r\n  padding-left: 10px;\r\n}\r\n#originalUrlInput {\r\n  border-radius: 10px 0px 0px 10px;\r\n}\r\n.tableHeading {\r\n  color: rgb(34, 141, 48);\r\n  text-align: center;\r\n  margin-bottom: 15px;\r\n}\r\nth {\r\n  text-align: center;\r\n}\r\n.lengthControl {\r\n  word-break: break-all;\r\n  max-width: 28vw;\r\n  min-width: 200px !important;\r\n}\r\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";

      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }

      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }

      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }

      content += cssWithMappingToString(item);

      if (needLayer) {
        content += "}";
      }

      if (item[2]) {
        content += "}";
      }

      if (item[4]) {
        content += "}";
      }

      return content;
    }).join("");
  }; // import a list of modules into the list


  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }

    var alreadyImportedModules = {};

    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];

        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }

    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);

      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }

      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }

      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }

      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }

      list.push(item);
    }
  };

  return list;
};

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/sourceMaps.js":
/*!************************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/sourceMaps.js ***!
  \************************************************************/
/***/ ((module) => {

"use strict";


module.exports = function (item) {
  var content = item[1];
  var cssMapping = item[3];

  if (!cssMapping) {
    return content;
  }

  if (typeof btoa === "function") {
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
    var sourceMapping = "/*# ".concat(data, " */");
    var sourceURLs = cssMapping.sources.map(function (source) {
      return "/*# sourceURL=".concat(cssMapping.sourceRoot || "").concat(source, " */");
    });
    return [content].concat(sourceURLs).concat([sourceMapping]).join("\n");
  }

  return [content].join("\n");
};

/***/ }),

/***/ "./src/style.css":
/*!***********************!*\
  !*** ./src/style.css ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../node_modules/css-loader/dist/cjs.js!./style.css */ "./node_modules/css-loader/dist/cjs.js!./src/style.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/***/ ((module) => {

"use strict";


var stylesInDOM = [];

function getIndexByIdentifier(identifier) {
  var result = -1;

  for (var i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
      result = i;
      break;
    }
  }

  return result;
}

function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var indexByIdentifier = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5]
    };

    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      var updater = addElementStyle(obj, options);
      options.byIndex = i;
      stylesInDOM.splice(i, 0, {
        identifier: identifier,
        updater: updater,
        references: 1
      });
    }

    identifiers.push(identifier);
  }

  return identifiers;
}

function addElementStyle(obj, options) {
  var api = options.domAPI(options);
  api.update(obj);

  var updater = function updater(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {
        return;
      }

      api.update(obj = newObj);
    } else {
      api.remove();
    }
  };

  return updater;
}

module.exports = function (list, options) {
  options = options || {};
  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];

    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDOM[index].references--;
    }

    var newLastIdentifiers = modulesToDom(newList, options);

    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];

      var _index = getIndexByIdentifier(_identifier);

      if (stylesInDOM[_index].references === 0) {
        stylesInDOM[_index].updater();

        stylesInDOM.splice(_index, 1);
      }
    }

    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertBySelector.js":
/*!********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertBySelector.js ***!
  \********************************************************************/
/***/ ((module) => {

"use strict";


var memo = {};
/* istanbul ignore next  */

function getTarget(target) {
  if (typeof memo[target] === "undefined") {
    var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself

    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
      try {
        // This will throw an exception if access to iframe is blocked
        // due to cross-origin restrictions
        styleTarget = styleTarget.contentDocument.head;
      } catch (e) {
        // istanbul ignore next
        styleTarget = null;
      }
    }

    memo[target] = styleTarget;
  }

  return memo[target];
}
/* istanbul ignore next  */


function insertBySelector(insert, style) {
  var target = getTarget(insert);

  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
  }

  target.appendChild(style);
}

module.exports = insertBySelector;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertStyleElement.js":
/*!**********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertStyleElement.js ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function insertStyleElement(options) {
  var element = document.createElement("style");
  options.setAttributes(element, options.attributes);
  options.insert(element, options.options);
  return element;
}

module.exports = insertStyleElement;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js ***!
  \**********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement) {
  var nonce =  true ? __webpack_require__.nc : 0;

  if (nonce) {
    styleElement.setAttribute("nonce", nonce);
  }
}

module.exports = setAttributesWithoutAttributes;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleDomAPI.js":
/*!***************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleDomAPI.js ***!
  \***************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function apply(styleElement, options, obj) {
  var css = "";

  if (obj.supports) {
    css += "@supports (".concat(obj.supports, ") {");
  }

  if (obj.media) {
    css += "@media ".concat(obj.media, " {");
  }

  var needLayer = typeof obj.layer !== "undefined";

  if (needLayer) {
    css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
  }

  css += obj.css;

  if (needLayer) {
    css += "}";
  }

  if (obj.media) {
    css += "}";
  }

  if (obj.supports) {
    css += "}";
  }

  var sourceMap = obj.sourceMap;

  if (sourceMap && typeof btoa !== "undefined") {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  } // For old IE

  /* istanbul ignore if  */


  options.styleTagTransform(css, styleElement, options.options);
}

function removeStyleElement(styleElement) {
  // istanbul ignore if
  if (styleElement.parentNode === null) {
    return false;
  }

  styleElement.parentNode.removeChild(styleElement);
}
/* istanbul ignore next  */


function domAPI(options) {
  var styleElement = options.insertStyleElement(options);
  return {
    update: function update(obj) {
      apply(styleElement, options, obj);
    },
    remove: function remove() {
      removeStyleElement(styleElement);
    }
  };
}

module.exports = domAPI;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleTagTransform.js":
/*!*********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleTagTransform.js ***!
  \*********************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function styleTagTransform(css, styleElement) {
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }

    styleElement.appendChild(document.createTextNode(css));
  }
}

module.exports = styleTagTransform;

/***/ }),

/***/ "./node_modules/sweetalert/dist/sweetalert.min.js":
/*!********************************************************!*\
  !*** ./node_modules/sweetalert/dist/sweetalert.min.js ***!
  \********************************************************/
/***/ (function(module) {

!function(t,e){ true?module.exports=e():0}(this,function(){return function(t){function e(o){if(n[o])return n[o].exports;var r=n[o]={i:o,l:!1,exports:{}};return t[o].call(r.exports,r,r.exports,e),r.l=!0,r.exports}var n={};return e.m=t,e.c=n,e.d=function(t,n,o){e.o(t,n)||Object.defineProperty(t,n,{configurable:!1,enumerable:!0,get:o})},e.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(n,"a",n),n},e.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},e.p="",e(e.s=8)}([function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o="swal-button";e.CLASS_NAMES={MODAL:"swal-modal",OVERLAY:"swal-overlay",SHOW_MODAL:"swal-overlay--show-modal",MODAL_TITLE:"swal-title",MODAL_TEXT:"swal-text",ICON:"swal-icon",ICON_CUSTOM:"swal-icon--custom",CONTENT:"swal-content",FOOTER:"swal-footer",BUTTON_CONTAINER:"swal-button-container",BUTTON:o,CONFIRM_BUTTON:o+"--confirm",CANCEL_BUTTON:o+"--cancel",DANGER_BUTTON:o+"--danger",BUTTON_LOADING:o+"--loading",BUTTON_LOADER:o+"__loader"},e.default=e.CLASS_NAMES},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.getNode=function(t){var e="."+t;return document.querySelector(e)},e.stringToNode=function(t){var e=document.createElement("div");return e.innerHTML=t.trim(),e.firstChild},e.insertAfter=function(t,e){var n=e.nextSibling;e.parentNode.insertBefore(t,n)},e.removeNode=function(t){t.parentElement.removeChild(t)},e.throwErr=function(t){throw t=t.replace(/ +(?= )/g,""),"SweetAlert: "+(t=t.trim())},e.isPlainObject=function(t){if("[object Object]"!==Object.prototype.toString.call(t))return!1;var e=Object.getPrototypeOf(t);return null===e||e===Object.prototype},e.ordinalSuffixOf=function(t){var e=t%10,n=t%100;return 1===e&&11!==n?t+"st":2===e&&12!==n?t+"nd":3===e&&13!==n?t+"rd":t+"th"}},function(t,e,n){"use strict";function o(t){for(var n in t)e.hasOwnProperty(n)||(e[n]=t[n])}Object.defineProperty(e,"__esModule",{value:!0}),o(n(25));var r=n(26);e.overlayMarkup=r.default,o(n(27)),o(n(28)),o(n(29));var i=n(0),a=i.default.MODAL_TITLE,s=i.default.MODAL_TEXT,c=i.default.ICON,l=i.default.FOOTER;e.iconMarkup='\n  <div class="'+c+'"></div>',e.titleMarkup='\n  <div class="'+a+'"></div>\n',e.textMarkup='\n  <div class="'+s+'"></div>',e.footerMarkup='\n  <div class="'+l+'"></div>\n'},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(1);e.CONFIRM_KEY="confirm",e.CANCEL_KEY="cancel";var r={visible:!0,text:null,value:null,className:"",closeModal:!0},i=Object.assign({},r,{visible:!1,text:"Cancel",value:null}),a=Object.assign({},r,{text:"OK",value:!0});e.defaultButtonList={cancel:i,confirm:a};var s=function(t){switch(t){case e.CONFIRM_KEY:return a;case e.CANCEL_KEY:return i;default:var n=t.charAt(0).toUpperCase()+t.slice(1);return Object.assign({},r,{text:n,value:t})}},c=function(t,e){var n=s(t);return!0===e?Object.assign({},n,{visible:!0}):"string"==typeof e?Object.assign({},n,{visible:!0,text:e}):o.isPlainObject(e)?Object.assign({visible:!0},n,e):Object.assign({},n,{visible:!1})},l=function(t){for(var e={},n=0,o=Object.keys(t);n<o.length;n++){var r=o[n],a=t[r],s=c(r,a);e[r]=s}return e.cancel||(e.cancel=i),e},u=function(t){var n={};switch(t.length){case 1:n[e.CANCEL_KEY]=Object.assign({},i,{visible:!1});break;case 2:n[e.CANCEL_KEY]=c(e.CANCEL_KEY,t[0]),n[e.CONFIRM_KEY]=c(e.CONFIRM_KEY,t[1]);break;default:o.throwErr("Invalid number of 'buttons' in array ("+t.length+").\n      If you want more than 2 buttons, you need to use an object!")}return n};e.getButtonListOpts=function(t){var n=e.defaultButtonList;return"string"==typeof t?n[e.CONFIRM_KEY]=c(e.CONFIRM_KEY,t):Array.isArray(t)?n=u(t):o.isPlainObject(t)?n=l(t):!0===t?n=u([!0,!0]):!1===t?n=u([!1,!1]):void 0===t&&(n=e.defaultButtonList),n}},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(1),r=n(2),i=n(0),a=i.default.MODAL,s=i.default.OVERLAY,c=n(30),l=n(31),u=n(32),f=n(33);e.injectElIntoModal=function(t){var e=o.getNode(a),n=o.stringToNode(t);return e.appendChild(n),n};var d=function(t){t.className=a,t.textContent=""},p=function(t,e){d(t);var n=e.className;n&&t.classList.add(n)};e.initModalContent=function(t){var e=o.getNode(a);p(e,t),c.default(t.icon),l.initTitle(t.title),l.initText(t.text),f.default(t.content),u.default(t.buttons,t.dangerMode)};var m=function(){var t=o.getNode(s),e=o.stringToNode(r.modalMarkup);t.appendChild(e)};e.default=m},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(3),r={isOpen:!1,promise:null,actions:{},timer:null},i=Object.assign({},r);e.resetState=function(){i=Object.assign({},r)},e.setActionValue=function(t){if("string"==typeof t)return a(o.CONFIRM_KEY,t);for(var e in t)a(e,t[e])};var a=function(t,e){i.actions[t]||(i.actions[t]={}),Object.assign(i.actions[t],{value:e})};e.setActionOptionsFor=function(t,e){var n=(void 0===e?{}:e).closeModal,o=void 0===n||n;Object.assign(i.actions[t],{closeModal:o})},e.default=i},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(1),r=n(3),i=n(0),a=i.default.OVERLAY,s=i.default.SHOW_MODAL,c=i.default.BUTTON,l=i.default.BUTTON_LOADING,u=n(5);e.openModal=function(){o.getNode(a).classList.add(s),u.default.isOpen=!0};var f=function(){o.getNode(a).classList.remove(s),u.default.isOpen=!1};e.onAction=function(t){void 0===t&&(t=r.CANCEL_KEY);var e=u.default.actions[t],n=e.value;if(!1===e.closeModal){var i=c+"--"+t;o.getNode(i).classList.add(l)}else f();u.default.promise.resolve(n)},e.getState=function(){var t=Object.assign({},u.default);return delete t.promise,delete t.timer,t},e.stopLoading=function(){for(var t=document.querySelectorAll("."+c),e=0;e<t.length;e++){t[e].classList.remove(l)}}},function(t,e){var n;n=function(){return this}();try{n=n||Function("return this")()||(0,eval)("this")}catch(t){"object"==typeof window&&(n=window)}t.exports=n},function(t,e,n){(function(e){t.exports=e.sweetAlert=n(9)}).call(e,n(7))},function(t,e,n){(function(e){t.exports=e.swal=n(10)}).call(e,n(7))},function(t,e,n){"undefined"!=typeof window&&n(11),n(16);var o=n(23).default;t.exports=o},function(t,e,n){var o=n(12);"string"==typeof o&&(o=[[t.i,o,""]]);var r={insertAt:"top"};r.transform=void 0;n(14)(o,r);o.locals&&(t.exports=o.locals)},function(t,e,n){e=t.exports=n(13)(void 0),e.push([t.i,'.swal-icon--error{border-color:#f27474;-webkit-animation:animateErrorIcon .5s;animation:animateErrorIcon .5s}.swal-icon--error__x-mark{position:relative;display:block;-webkit-animation:animateXMark .5s;animation:animateXMark .5s}.swal-icon--error__line{position:absolute;height:5px;width:47px;background-color:#f27474;display:block;top:37px;border-radius:2px}.swal-icon--error__line--left{-webkit-transform:rotate(45deg);transform:rotate(45deg);left:17px}.swal-icon--error__line--right{-webkit-transform:rotate(-45deg);transform:rotate(-45deg);right:16px}@-webkit-keyframes animateErrorIcon{0%{-webkit-transform:rotateX(100deg);transform:rotateX(100deg);opacity:0}to{-webkit-transform:rotateX(0deg);transform:rotateX(0deg);opacity:1}}@keyframes animateErrorIcon{0%{-webkit-transform:rotateX(100deg);transform:rotateX(100deg);opacity:0}to{-webkit-transform:rotateX(0deg);transform:rotateX(0deg);opacity:1}}@-webkit-keyframes animateXMark{0%{-webkit-transform:scale(.4);transform:scale(.4);margin-top:26px;opacity:0}50%{-webkit-transform:scale(.4);transform:scale(.4);margin-top:26px;opacity:0}80%{-webkit-transform:scale(1.15);transform:scale(1.15);margin-top:-6px}to{-webkit-transform:scale(1);transform:scale(1);margin-top:0;opacity:1}}@keyframes animateXMark{0%{-webkit-transform:scale(.4);transform:scale(.4);margin-top:26px;opacity:0}50%{-webkit-transform:scale(.4);transform:scale(.4);margin-top:26px;opacity:0}80%{-webkit-transform:scale(1.15);transform:scale(1.15);margin-top:-6px}to{-webkit-transform:scale(1);transform:scale(1);margin-top:0;opacity:1}}.swal-icon--warning{border-color:#f8bb86;-webkit-animation:pulseWarning .75s infinite alternate;animation:pulseWarning .75s infinite alternate}.swal-icon--warning__body{width:5px;height:47px;top:10px;border-radius:2px;margin-left:-2px}.swal-icon--warning__body,.swal-icon--warning__dot{position:absolute;left:50%;background-color:#f8bb86}.swal-icon--warning__dot{width:7px;height:7px;border-radius:50%;margin-left:-4px;bottom:-11px}@-webkit-keyframes pulseWarning{0%{border-color:#f8d486}to{border-color:#f8bb86}}@keyframes pulseWarning{0%{border-color:#f8d486}to{border-color:#f8bb86}}.swal-icon--success{border-color:#a5dc86}.swal-icon--success:after,.swal-icon--success:before{content:"";border-radius:50%;position:absolute;width:60px;height:120px;background:#fff;-webkit-transform:rotate(45deg);transform:rotate(45deg)}.swal-icon--success:before{border-radius:120px 0 0 120px;top:-7px;left:-33px;-webkit-transform:rotate(-45deg);transform:rotate(-45deg);-webkit-transform-origin:60px 60px;transform-origin:60px 60px}.swal-icon--success:after{border-radius:0 120px 120px 0;top:-11px;left:30px;-webkit-transform:rotate(-45deg);transform:rotate(-45deg);-webkit-transform-origin:0 60px;transform-origin:0 60px;-webkit-animation:rotatePlaceholder 4.25s ease-in;animation:rotatePlaceholder 4.25s ease-in}.swal-icon--success__ring{width:80px;height:80px;border:4px solid hsla(98,55%,69%,.2);border-radius:50%;box-sizing:content-box;position:absolute;left:-4px;top:-4px;z-index:2}.swal-icon--success__hide-corners{width:5px;height:90px;background-color:#fff;padding:1px;position:absolute;left:28px;top:8px;z-index:1;-webkit-transform:rotate(-45deg);transform:rotate(-45deg)}.swal-icon--success__line{height:5px;background-color:#a5dc86;display:block;border-radius:2px;position:absolute;z-index:2}.swal-icon--success__line--tip{width:25px;left:14px;top:46px;-webkit-transform:rotate(45deg);transform:rotate(45deg);-webkit-animation:animateSuccessTip .75s;animation:animateSuccessTip .75s}.swal-icon--success__line--long{width:47px;right:8px;top:38px;-webkit-transform:rotate(-45deg);transform:rotate(-45deg);-webkit-animation:animateSuccessLong .75s;animation:animateSuccessLong .75s}@-webkit-keyframes rotatePlaceholder{0%{-webkit-transform:rotate(-45deg);transform:rotate(-45deg)}5%{-webkit-transform:rotate(-45deg);transform:rotate(-45deg)}12%{-webkit-transform:rotate(-405deg);transform:rotate(-405deg)}to{-webkit-transform:rotate(-405deg);transform:rotate(-405deg)}}@keyframes rotatePlaceholder{0%{-webkit-transform:rotate(-45deg);transform:rotate(-45deg)}5%{-webkit-transform:rotate(-45deg);transform:rotate(-45deg)}12%{-webkit-transform:rotate(-405deg);transform:rotate(-405deg)}to{-webkit-transform:rotate(-405deg);transform:rotate(-405deg)}}@-webkit-keyframes animateSuccessTip{0%{width:0;left:1px;top:19px}54%{width:0;left:1px;top:19px}70%{width:50px;left:-8px;top:37px}84%{width:17px;left:21px;top:48px}to{width:25px;left:14px;top:45px}}@keyframes animateSuccessTip{0%{width:0;left:1px;top:19px}54%{width:0;left:1px;top:19px}70%{width:50px;left:-8px;top:37px}84%{width:17px;left:21px;top:48px}to{width:25px;left:14px;top:45px}}@-webkit-keyframes animateSuccessLong{0%{width:0;right:46px;top:54px}65%{width:0;right:46px;top:54px}84%{width:55px;right:0;top:35px}to{width:47px;right:8px;top:38px}}@keyframes animateSuccessLong{0%{width:0;right:46px;top:54px}65%{width:0;right:46px;top:54px}84%{width:55px;right:0;top:35px}to{width:47px;right:8px;top:38px}}.swal-icon--info{border-color:#c9dae1}.swal-icon--info:before{width:5px;height:29px;bottom:17px;border-radius:2px;margin-left:-2px}.swal-icon--info:after,.swal-icon--info:before{content:"";position:absolute;left:50%;background-color:#c9dae1}.swal-icon--info:after{width:7px;height:7px;border-radius:50%;margin-left:-3px;top:19px}.swal-icon{width:80px;height:80px;border-width:4px;border-style:solid;border-radius:50%;padding:0;position:relative;box-sizing:content-box;margin:20px auto}.swal-icon:first-child{margin-top:32px}.swal-icon--custom{width:auto;height:auto;max-width:100%;border:none;border-radius:0}.swal-icon img{max-width:100%;max-height:100%}.swal-title{color:rgba(0,0,0,.65);font-weight:600;text-transform:none;position:relative;display:block;padding:13px 16px;font-size:27px;line-height:normal;text-align:center;margin-bottom:0}.swal-title:first-child{margin-top:26px}.swal-title:not(:first-child){padding-bottom:0}.swal-title:not(:last-child){margin-bottom:13px}.swal-text{font-size:16px;position:relative;float:none;line-height:normal;vertical-align:top;text-align:left;display:inline-block;margin:0;padding:0 10px;font-weight:400;color:rgba(0,0,0,.64);max-width:calc(100% - 20px);overflow-wrap:break-word;box-sizing:border-box}.swal-text:first-child{margin-top:45px}.swal-text:last-child{margin-bottom:45px}.swal-footer{text-align:right;padding-top:13px;margin-top:13px;padding:13px 16px;border-radius:inherit;border-top-left-radius:0;border-top-right-radius:0}.swal-button-container{margin:5px;display:inline-block;position:relative}.swal-button{background-color:#7cd1f9;color:#fff;border:none;box-shadow:none;border-radius:5px;font-weight:600;font-size:14px;padding:10px 24px;margin:0;cursor:pointer}.swal-button:not([disabled]):hover{background-color:#78cbf2}.swal-button:active{background-color:#70bce0}.swal-button:focus{outline:none;box-shadow:0 0 0 1px #fff,0 0 0 3px rgba(43,114,165,.29)}.swal-button[disabled]{opacity:.5;cursor:default}.swal-button::-moz-focus-inner{border:0}.swal-button--cancel{color:#555;background-color:#efefef}.swal-button--cancel:not([disabled]):hover{background-color:#e8e8e8}.swal-button--cancel:active{background-color:#d7d7d7}.swal-button--cancel:focus{box-shadow:0 0 0 1px #fff,0 0 0 3px rgba(116,136,150,.29)}.swal-button--danger{background-color:#e64942}.swal-button--danger:not([disabled]):hover{background-color:#df4740}.swal-button--danger:active{background-color:#cf423b}.swal-button--danger:focus{box-shadow:0 0 0 1px #fff,0 0 0 3px rgba(165,43,43,.29)}.swal-content{padding:0 20px;margin-top:20px;font-size:medium}.swal-content:last-child{margin-bottom:20px}.swal-content__input,.swal-content__textarea{-webkit-appearance:none;background-color:#fff;border:none;font-size:14px;display:block;box-sizing:border-box;width:100%;border:1px solid rgba(0,0,0,.14);padding:10px 13px;border-radius:2px;transition:border-color .2s}.swal-content__input:focus,.swal-content__textarea:focus{outline:none;border-color:#6db8ff}.swal-content__textarea{resize:vertical}.swal-button--loading{color:transparent}.swal-button--loading~.swal-button__loader{opacity:1}.swal-button__loader{position:absolute;height:auto;width:43px;z-index:2;left:50%;top:50%;-webkit-transform:translateX(-50%) translateY(-50%);transform:translateX(-50%) translateY(-50%);text-align:center;pointer-events:none;opacity:0}.swal-button__loader div{display:inline-block;float:none;vertical-align:baseline;width:9px;height:9px;padding:0;border:none;margin:2px;opacity:.4;border-radius:7px;background-color:hsla(0,0%,100%,.9);transition:background .2s;-webkit-animation:swal-loading-anim 1s infinite;animation:swal-loading-anim 1s infinite}.swal-button__loader div:nth-child(3n+2){-webkit-animation-delay:.15s;animation-delay:.15s}.swal-button__loader div:nth-child(3n+3){-webkit-animation-delay:.3s;animation-delay:.3s}@-webkit-keyframes swal-loading-anim{0%{opacity:.4}20%{opacity:.4}50%{opacity:1}to{opacity:.4}}@keyframes swal-loading-anim{0%{opacity:.4}20%{opacity:.4}50%{opacity:1}to{opacity:.4}}.swal-overlay{position:fixed;top:0;bottom:0;left:0;right:0;text-align:center;font-size:0;overflow-y:auto;background-color:rgba(0,0,0,.4);z-index:10000;pointer-events:none;opacity:0;transition:opacity .3s}.swal-overlay:before{content:" ";display:inline-block;vertical-align:middle;height:100%}.swal-overlay--show-modal{opacity:1;pointer-events:auto}.swal-overlay--show-modal .swal-modal{opacity:1;pointer-events:auto;box-sizing:border-box;-webkit-animation:showSweetAlert .3s;animation:showSweetAlert .3s;will-change:transform}.swal-modal{width:478px;opacity:0;pointer-events:none;background-color:#fff;text-align:center;border-radius:5px;position:static;margin:20px auto;display:inline-block;vertical-align:middle;-webkit-transform:scale(1);transform:scale(1);-webkit-transform-origin:50% 50%;transform-origin:50% 50%;z-index:10001;transition:opacity .2s,-webkit-transform .3s;transition:transform .3s,opacity .2s;transition:transform .3s,opacity .2s,-webkit-transform .3s}@media (max-width:500px){.swal-modal{width:calc(100% - 20px)}}@-webkit-keyframes showSweetAlert{0%{-webkit-transform:scale(1);transform:scale(1)}1%{-webkit-transform:scale(.5);transform:scale(.5)}45%{-webkit-transform:scale(1.05);transform:scale(1.05)}80%{-webkit-transform:scale(.95);transform:scale(.95)}to{-webkit-transform:scale(1);transform:scale(1)}}@keyframes showSweetAlert{0%{-webkit-transform:scale(1);transform:scale(1)}1%{-webkit-transform:scale(.5);transform:scale(.5)}45%{-webkit-transform:scale(1.05);transform:scale(1.05)}80%{-webkit-transform:scale(.95);transform:scale(.95)}to{-webkit-transform:scale(1);transform:scale(1)}}',""])},function(t,e){function n(t,e){var n=t[1]||"",r=t[3];if(!r)return n;if(e&&"function"==typeof btoa){var i=o(r);return[n].concat(r.sources.map(function(t){return"/*# sourceURL="+r.sourceRoot+t+" */"})).concat([i]).join("\n")}return[n].join("\n")}function o(t){return"/*# sourceMappingURL=data:application/json;charset=utf-8;base64,"+btoa(unescape(encodeURIComponent(JSON.stringify(t))))+" */"}t.exports=function(t){var e=[];return e.toString=function(){return this.map(function(e){var o=n(e,t);return e[2]?"@media "+e[2]+"{"+o+"}":o}).join("")},e.i=function(t,n){"string"==typeof t&&(t=[[null,t,""]]);for(var o={},r=0;r<this.length;r++){var i=this[r][0];"number"==typeof i&&(o[i]=!0)}for(r=0;r<t.length;r++){var a=t[r];"number"==typeof a[0]&&o[a[0]]||(n&&!a[2]?a[2]=n:n&&(a[2]="("+a[2]+") and ("+n+")"),e.push(a))}},e}},function(t,e,n){function o(t,e){for(var n=0;n<t.length;n++){var o=t[n],r=m[o.id];if(r){r.refs++;for(var i=0;i<r.parts.length;i++)r.parts[i](o.parts[i]);for(;i<o.parts.length;i++)r.parts.push(u(o.parts[i],e))}else{for(var a=[],i=0;i<o.parts.length;i++)a.push(u(o.parts[i],e));m[o.id]={id:o.id,refs:1,parts:a}}}}function r(t,e){for(var n=[],o={},r=0;r<t.length;r++){var i=t[r],a=e.base?i[0]+e.base:i[0],s=i[1],c=i[2],l=i[3],u={css:s,media:c,sourceMap:l};o[a]?o[a].parts.push(u):n.push(o[a]={id:a,parts:[u]})}return n}function i(t,e){var n=v(t.insertInto);if(!n)throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");var o=w[w.length-1];if("top"===t.insertAt)o?o.nextSibling?n.insertBefore(e,o.nextSibling):n.appendChild(e):n.insertBefore(e,n.firstChild),w.push(e);else{if("bottom"!==t.insertAt)throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");n.appendChild(e)}}function a(t){if(null===t.parentNode)return!1;t.parentNode.removeChild(t);var e=w.indexOf(t);e>=0&&w.splice(e,1)}function s(t){var e=document.createElement("style");return t.attrs.type="text/css",l(e,t.attrs),i(t,e),e}function c(t){var e=document.createElement("link");return t.attrs.type="text/css",t.attrs.rel="stylesheet",l(e,t.attrs),i(t,e),e}function l(t,e){Object.keys(e).forEach(function(n){t.setAttribute(n,e[n])})}function u(t,e){var n,o,r,i;if(e.transform&&t.css){if(!(i=e.transform(t.css)))return function(){};t.css=i}if(e.singleton){var l=h++;n=g||(g=s(e)),o=f.bind(null,n,l,!1),r=f.bind(null,n,l,!0)}else t.sourceMap&&"function"==typeof URL&&"function"==typeof URL.createObjectURL&&"function"==typeof URL.revokeObjectURL&&"function"==typeof Blob&&"function"==typeof btoa?(n=c(e),o=p.bind(null,n,e),r=function(){a(n),n.href&&URL.revokeObjectURL(n.href)}):(n=s(e),o=d.bind(null,n),r=function(){a(n)});return o(t),function(e){if(e){if(e.css===t.css&&e.media===t.media&&e.sourceMap===t.sourceMap)return;o(t=e)}else r()}}function f(t,e,n,o){var r=n?"":o.css;if(t.styleSheet)t.styleSheet.cssText=x(e,r);else{var i=document.createTextNode(r),a=t.childNodes;a[e]&&t.removeChild(a[e]),a.length?t.insertBefore(i,a[e]):t.appendChild(i)}}function d(t,e){var n=e.css,o=e.media;if(o&&t.setAttribute("media",o),t.styleSheet)t.styleSheet.cssText=n;else{for(;t.firstChild;)t.removeChild(t.firstChild);t.appendChild(document.createTextNode(n))}}function p(t,e,n){var o=n.css,r=n.sourceMap,i=void 0===e.convertToAbsoluteUrls&&r;(e.convertToAbsoluteUrls||i)&&(o=y(o)),r&&(o+="\n/*# sourceMappingURL=data:application/json;base64,"+btoa(unescape(encodeURIComponent(JSON.stringify(r))))+" */");var a=new Blob([o],{type:"text/css"}),s=t.href;t.href=URL.createObjectURL(a),s&&URL.revokeObjectURL(s)}var m={},b=function(t){var e;return function(){return void 0===e&&(e=t.apply(this,arguments)),e}}(function(){return window&&document&&document.all&&!window.atob}),v=function(t){var e={};return function(n){return void 0===e[n]&&(e[n]=t.call(this,n)),e[n]}}(function(t){return document.querySelector(t)}),g=null,h=0,w=[],y=n(15);t.exports=function(t,e){if("undefined"!=typeof DEBUG&&DEBUG&&"object"!=typeof document)throw new Error("The style-loader cannot be used in a non-browser environment");e=e||{},e.attrs="object"==typeof e.attrs?e.attrs:{},e.singleton||(e.singleton=b()),e.insertInto||(e.insertInto="head"),e.insertAt||(e.insertAt="bottom");var n=r(t,e);return o(n,e),function(t){for(var i=[],a=0;a<n.length;a++){var s=n[a],c=m[s.id];c.refs--,i.push(c)}if(t){o(r(t,e),e)}for(var a=0;a<i.length;a++){var c=i[a];if(0===c.refs){for(var l=0;l<c.parts.length;l++)c.parts[l]();delete m[c.id]}}}};var x=function(){var t=[];return function(e,n){return t[e]=n,t.filter(Boolean).join("\n")}}()},function(t,e){t.exports=function(t){var e="undefined"!=typeof window&&window.location;if(!e)throw new Error("fixUrls requires window.location");if(!t||"string"!=typeof t)return t;var n=e.protocol+"//"+e.host,o=n+e.pathname.replace(/\/[^\/]*$/,"/");return t.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi,function(t,e){var r=e.trim().replace(/^"(.*)"$/,function(t,e){return e}).replace(/^'(.*)'$/,function(t,e){return e});if(/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(r))return t;var i;return i=0===r.indexOf("//")?r:0===r.indexOf("/")?n+r:o+r.replace(/^\.\//,""),"url("+JSON.stringify(i)+")"})}},function(t,e,n){var o=n(17);"undefined"==typeof window||window.Promise||(window.Promise=o),n(21),String.prototype.includes||(String.prototype.includes=function(t,e){"use strict";return"number"!=typeof e&&(e=0),!(e+t.length>this.length)&&-1!==this.indexOf(t,e)}),Array.prototype.includes||Object.defineProperty(Array.prototype,"includes",{value:function(t,e){if(null==this)throw new TypeError('"this" is null or not defined');var n=Object(this),o=n.length>>>0;if(0===o)return!1;for(var r=0|e,i=Math.max(r>=0?r:o-Math.abs(r),0);i<o;){if(function(t,e){return t===e||"number"==typeof t&&"number"==typeof e&&isNaN(t)&&isNaN(e)}(n[i],t))return!0;i++}return!1}}),"undefined"!=typeof window&&function(t){t.forEach(function(t){t.hasOwnProperty("remove")||Object.defineProperty(t,"remove",{configurable:!0,enumerable:!0,writable:!0,value:function(){this.parentNode.removeChild(this)}})})}([Element.prototype,CharacterData.prototype,DocumentType.prototype])},function(t,e,n){(function(e){!function(n){function o(){}function r(t,e){return function(){t.apply(e,arguments)}}function i(t){if("object"!=typeof this)throw new TypeError("Promises must be constructed via new");if("function"!=typeof t)throw new TypeError("not a function");this._state=0,this._handled=!1,this._value=void 0,this._deferreds=[],f(t,this)}function a(t,e){for(;3===t._state;)t=t._value;if(0===t._state)return void t._deferreds.push(e);t._handled=!0,i._immediateFn(function(){var n=1===t._state?e.onFulfilled:e.onRejected;if(null===n)return void(1===t._state?s:c)(e.promise,t._value);var o;try{o=n(t._value)}catch(t){return void c(e.promise,t)}s(e.promise,o)})}function s(t,e){try{if(e===t)throw new TypeError("A promise cannot be resolved with itself.");if(e&&("object"==typeof e||"function"==typeof e)){var n=e.then;if(e instanceof i)return t._state=3,t._value=e,void l(t);if("function"==typeof n)return void f(r(n,e),t)}t._state=1,t._value=e,l(t)}catch(e){c(t,e)}}function c(t,e){t._state=2,t._value=e,l(t)}function l(t){2===t._state&&0===t._deferreds.length&&i._immediateFn(function(){t._handled||i._unhandledRejectionFn(t._value)});for(var e=0,n=t._deferreds.length;e<n;e++)a(t,t._deferreds[e]);t._deferreds=null}function u(t,e,n){this.onFulfilled="function"==typeof t?t:null,this.onRejected="function"==typeof e?e:null,this.promise=n}function f(t,e){var n=!1;try{t(function(t){n||(n=!0,s(e,t))},function(t){n||(n=!0,c(e,t))})}catch(t){if(n)return;n=!0,c(e,t)}}var d=setTimeout;i.prototype.catch=function(t){return this.then(null,t)},i.prototype.then=function(t,e){var n=new this.constructor(o);return a(this,new u(t,e,n)),n},i.all=function(t){var e=Array.prototype.slice.call(t);return new i(function(t,n){function o(i,a){try{if(a&&("object"==typeof a||"function"==typeof a)){var s=a.then;if("function"==typeof s)return void s.call(a,function(t){o(i,t)},n)}e[i]=a,0==--r&&t(e)}catch(t){n(t)}}if(0===e.length)return t([]);for(var r=e.length,i=0;i<e.length;i++)o(i,e[i])})},i.resolve=function(t){return t&&"object"==typeof t&&t.constructor===i?t:new i(function(e){e(t)})},i.reject=function(t){return new i(function(e,n){n(t)})},i.race=function(t){return new i(function(e,n){for(var o=0,r=t.length;o<r;o++)t[o].then(e,n)})},i._immediateFn="function"==typeof e&&function(t){e(t)}||function(t){d(t,0)},i._unhandledRejectionFn=function(t){"undefined"!=typeof console&&console&&console.warn("Possible Unhandled Promise Rejection:",t)},i._setImmediateFn=function(t){i._immediateFn=t},i._setUnhandledRejectionFn=function(t){i._unhandledRejectionFn=t},void 0!==t&&t.exports?t.exports=i:n.Promise||(n.Promise=i)}(this)}).call(e,n(18).setImmediate)},function(t,e,n){function o(t,e){this._id=t,this._clearFn=e}var r=Function.prototype.apply;e.setTimeout=function(){return new o(r.call(setTimeout,window,arguments),clearTimeout)},e.setInterval=function(){return new o(r.call(setInterval,window,arguments),clearInterval)},e.clearTimeout=e.clearInterval=function(t){t&&t.close()},o.prototype.unref=o.prototype.ref=function(){},o.prototype.close=function(){this._clearFn.call(window,this._id)},e.enroll=function(t,e){clearTimeout(t._idleTimeoutId),t._idleTimeout=e},e.unenroll=function(t){clearTimeout(t._idleTimeoutId),t._idleTimeout=-1},e._unrefActive=e.active=function(t){clearTimeout(t._idleTimeoutId);var e=t._idleTimeout;e>=0&&(t._idleTimeoutId=setTimeout(function(){t._onTimeout&&t._onTimeout()},e))},n(19),e.setImmediate=setImmediate,e.clearImmediate=clearImmediate},function(t,e,n){(function(t,e){!function(t,n){"use strict";function o(t){"function"!=typeof t&&(t=new Function(""+t));for(var e=new Array(arguments.length-1),n=0;n<e.length;n++)e[n]=arguments[n+1];var o={callback:t,args:e};return l[c]=o,s(c),c++}function r(t){delete l[t]}function i(t){var e=t.callback,o=t.args;switch(o.length){case 0:e();break;case 1:e(o[0]);break;case 2:e(o[0],o[1]);break;case 3:e(o[0],o[1],o[2]);break;default:e.apply(n,o)}}function a(t){if(u)setTimeout(a,0,t);else{var e=l[t];if(e){u=!0;try{i(e)}finally{r(t),u=!1}}}}if(!t.setImmediate){var s,c=1,l={},u=!1,f=t.document,d=Object.getPrototypeOf&&Object.getPrototypeOf(t);d=d&&d.setTimeout?d:t,"[object process]"==={}.toString.call(t.process)?function(){s=function(t){e.nextTick(function(){a(t)})}}():function(){if(t.postMessage&&!t.importScripts){var e=!0,n=t.onmessage;return t.onmessage=function(){e=!1},t.postMessage("","*"),t.onmessage=n,e}}()?function(){var e="setImmediate$"+Math.random()+"$",n=function(n){n.source===t&&"string"==typeof n.data&&0===n.data.indexOf(e)&&a(+n.data.slice(e.length))};t.addEventListener?t.addEventListener("message",n,!1):t.attachEvent("onmessage",n),s=function(n){t.postMessage(e+n,"*")}}():t.MessageChannel?function(){var t=new MessageChannel;t.port1.onmessage=function(t){a(t.data)},s=function(e){t.port2.postMessage(e)}}():f&&"onreadystatechange"in f.createElement("script")?function(){var t=f.documentElement;s=function(e){var n=f.createElement("script");n.onreadystatechange=function(){a(e),n.onreadystatechange=null,t.removeChild(n),n=null},t.appendChild(n)}}():function(){s=function(t){setTimeout(a,0,t)}}(),d.setImmediate=o,d.clearImmediate=r}}("undefined"==typeof self?void 0===t?this:t:self)}).call(e,n(7),n(20))},function(t,e){function n(){throw new Error("setTimeout has not been defined")}function o(){throw new Error("clearTimeout has not been defined")}function r(t){if(u===setTimeout)return setTimeout(t,0);if((u===n||!u)&&setTimeout)return u=setTimeout,setTimeout(t,0);try{return u(t,0)}catch(e){try{return u.call(null,t,0)}catch(e){return u.call(this,t,0)}}}function i(t){if(f===clearTimeout)return clearTimeout(t);if((f===o||!f)&&clearTimeout)return f=clearTimeout,clearTimeout(t);try{return f(t)}catch(e){try{return f.call(null,t)}catch(e){return f.call(this,t)}}}function a(){b&&p&&(b=!1,p.length?m=p.concat(m):v=-1,m.length&&s())}function s(){if(!b){var t=r(a);b=!0;for(var e=m.length;e;){for(p=m,m=[];++v<e;)p&&p[v].run();v=-1,e=m.length}p=null,b=!1,i(t)}}function c(t,e){this.fun=t,this.array=e}function l(){}var u,f,d=t.exports={};!function(){try{u="function"==typeof setTimeout?setTimeout:n}catch(t){u=n}try{f="function"==typeof clearTimeout?clearTimeout:o}catch(t){f=o}}();var p,m=[],b=!1,v=-1;d.nextTick=function(t){var e=new Array(arguments.length-1);if(arguments.length>1)for(var n=1;n<arguments.length;n++)e[n-1]=arguments[n];m.push(new c(t,e)),1!==m.length||b||r(s)},c.prototype.run=function(){this.fun.apply(null,this.array)},d.title="browser",d.browser=!0,d.env={},d.argv=[],d.version="",d.versions={},d.on=l,d.addListener=l,d.once=l,d.off=l,d.removeListener=l,d.removeAllListeners=l,d.emit=l,d.prependListener=l,d.prependOnceListener=l,d.listeners=function(t){return[]},d.binding=function(t){throw new Error("process.binding is not supported")},d.cwd=function(){return"/"},d.chdir=function(t){throw new Error("process.chdir is not supported")},d.umask=function(){return 0}},function(t,e,n){"use strict";n(22).polyfill()},function(t,e,n){"use strict";function o(t,e){if(void 0===t||null===t)throw new TypeError("Cannot convert first argument to object");for(var n=Object(t),o=1;o<arguments.length;o++){var r=arguments[o];if(void 0!==r&&null!==r)for(var i=Object.keys(Object(r)),a=0,s=i.length;a<s;a++){var c=i[a],l=Object.getOwnPropertyDescriptor(r,c);void 0!==l&&l.enumerable&&(n[c]=r[c])}}return n}function r(){Object.assign||Object.defineProperty(Object,"assign",{enumerable:!1,configurable:!0,writable:!0,value:o})}t.exports={assign:o,polyfill:r}},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(24),r=n(6),i=n(5),a=n(36),s=function(){for(var t=[],e=0;e<arguments.length;e++)t[e]=arguments[e];if("undefined"!=typeof window){var n=a.getOpts.apply(void 0,t);return new Promise(function(t,e){i.default.promise={resolve:t,reject:e},o.default(n),setTimeout(function(){r.openModal()})})}};s.close=r.onAction,s.getState=r.getState,s.setActionValue=i.setActionValue,s.stopLoading=r.stopLoading,s.setDefaults=a.setDefaults,e.default=s},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(1),r=n(0),i=r.default.MODAL,a=n(4),s=n(34),c=n(35),l=n(1);e.init=function(t){o.getNode(i)||(document.body||l.throwErr("You can only use SweetAlert AFTER the DOM has loaded!"),s.default(),a.default()),a.initModalContent(t),c.default(t)},e.default=e.init},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(0),r=o.default.MODAL;e.modalMarkup='\n  <div class="'+r+'" role="dialog" aria-modal="true"></div>',e.default=e.modalMarkup},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(0),r=o.default.OVERLAY,i='<div \n    class="'+r+'"\n    tabIndex="-1">\n  </div>';e.default=i},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(0),r=o.default.ICON;e.errorIconMarkup=function(){var t=r+"--error",e=t+"__line";return'\n    <div class="'+t+'__x-mark">\n      <span class="'+e+" "+e+'--left"></span>\n      <span class="'+e+" "+e+'--right"></span>\n    </div>\n  '},e.warningIconMarkup=function(){var t=r+"--warning";return'\n    <span class="'+t+'__body">\n      <span class="'+t+'__dot"></span>\n    </span>\n  '},e.successIconMarkup=function(){var t=r+"--success";return'\n    <span class="'+t+"__line "+t+'__line--long"></span>\n    <span class="'+t+"__line "+t+'__line--tip"></span>\n\n    <div class="'+t+'__ring"></div>\n    <div class="'+t+'__hide-corners"></div>\n  '}},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(0),r=o.default.CONTENT;e.contentMarkup='\n  <div class="'+r+'">\n\n  </div>\n'},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(0),r=o.default.BUTTON_CONTAINER,i=o.default.BUTTON,a=o.default.BUTTON_LOADER;e.buttonMarkup='\n  <div class="'+r+'">\n\n    <button\n      class="'+i+'"\n    ></button>\n\n    <div class="'+a+'">\n      <div></div>\n      <div></div>\n      <div></div>\n    </div>\n\n  </div>\n'},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(4),r=n(2),i=n(0),a=i.default.ICON,s=i.default.ICON_CUSTOM,c=["error","warning","success","info"],l={error:r.errorIconMarkup(),warning:r.warningIconMarkup(),success:r.successIconMarkup()},u=function(t,e){var n=a+"--"+t;e.classList.add(n);var o=l[t];o&&(e.innerHTML=o)},f=function(t,e){e.classList.add(s);var n=document.createElement("img");n.src=t,e.appendChild(n)},d=function(t){if(t){var e=o.injectElIntoModal(r.iconMarkup);c.includes(t)?u(t,e):f(t,e)}};e.default=d},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(2),r=n(4),i=function(t){navigator.userAgent.includes("AppleWebKit")&&(t.style.display="none",t.offsetHeight,t.style.display="")};e.initTitle=function(t){if(t){var e=r.injectElIntoModal(o.titleMarkup);e.textContent=t,i(e)}},e.initText=function(t){if(t){var e=document.createDocumentFragment();t.split("\n").forEach(function(t,n,o){e.appendChild(document.createTextNode(t)),n<o.length-1&&e.appendChild(document.createElement("br"))});var n=r.injectElIntoModal(o.textMarkup);n.appendChild(e),i(n)}}},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(1),r=n(4),i=n(0),a=i.default.BUTTON,s=i.default.DANGER_BUTTON,c=n(3),l=n(2),u=n(6),f=n(5),d=function(t,e,n){var r=e.text,i=e.value,d=e.className,p=e.closeModal,m=o.stringToNode(l.buttonMarkup),b=m.querySelector("."+a),v=a+"--"+t;if(b.classList.add(v),d){(Array.isArray(d)?d:d.split(" ")).filter(function(t){return t.length>0}).forEach(function(t){b.classList.add(t)})}n&&t===c.CONFIRM_KEY&&b.classList.add(s),b.textContent=r;var g={};return g[t]=i,f.setActionValue(g),f.setActionOptionsFor(t,{closeModal:p}),b.addEventListener("click",function(){return u.onAction(t)}),m},p=function(t,e){var n=r.injectElIntoModal(l.footerMarkup);for(var o in t){var i=t[o],a=d(o,i,e);i.visible&&n.appendChild(a)}0===n.children.length&&n.remove()};e.default=p},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(3),r=n(4),i=n(2),a=n(5),s=n(6),c=n(0),l=c.default.CONTENT,u=function(t){t.addEventListener("input",function(t){var e=t.target,n=e.value;a.setActionValue(n)}),t.addEventListener("keyup",function(t){if("Enter"===t.key)return s.onAction(o.CONFIRM_KEY)}),setTimeout(function(){t.focus(),a.setActionValue("")},0)},f=function(t,e,n){var o=document.createElement(e),r=l+"__"+e;o.classList.add(r);for(var i in n){var a=n[i];o[i]=a}"input"===e&&u(o),t.appendChild(o)},d=function(t){if(t){var e=r.injectElIntoModal(i.contentMarkup),n=t.element,o=t.attributes;"string"==typeof n?f(e,n,o):e.appendChild(n)}};e.default=d},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(1),r=n(2),i=function(){var t=o.stringToNode(r.overlayMarkup);document.body.appendChild(t)};e.default=i},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(5),r=n(6),i=n(1),a=n(3),s=n(0),c=s.default.MODAL,l=s.default.BUTTON,u=s.default.OVERLAY,f=function(t){t.preventDefault(),v()},d=function(t){t.preventDefault(),g()},p=function(t){if(o.default.isOpen)switch(t.key){case"Escape":return r.onAction(a.CANCEL_KEY)}},m=function(t){if(o.default.isOpen)switch(t.key){case"Tab":return f(t)}},b=function(t){if(o.default.isOpen)return"Tab"===t.key&&t.shiftKey?d(t):void 0},v=function(){var t=i.getNode(l);t&&(t.tabIndex=0,t.focus())},g=function(){var t=i.getNode(c),e=t.querySelectorAll("."+l),n=e.length-1,o=e[n];o&&o.focus()},h=function(t){t[t.length-1].addEventListener("keydown",m)},w=function(t){t[0].addEventListener("keydown",b)},y=function(){var t=i.getNode(c),e=t.querySelectorAll("."+l);e.length&&(h(e),w(e))},x=function(t){if(i.getNode(u)===t.target)return r.onAction(a.CANCEL_KEY)},_=function(t){var e=i.getNode(u);e.removeEventListener("click",x),t&&e.addEventListener("click",x)},k=function(t){o.default.timer&&clearTimeout(o.default.timer),t&&(o.default.timer=window.setTimeout(function(){return r.onAction(a.CANCEL_KEY)},t))},O=function(t){t.closeOnEsc?document.addEventListener("keyup",p):document.removeEventListener("keyup",p),t.dangerMode?v():g(),y(),_(t.closeOnClickOutside),k(t.timer)};e.default=O},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(1),r=n(3),i=n(37),a=n(38),s={title:null,text:null,icon:null,buttons:r.defaultButtonList,content:null,className:null,closeOnClickOutside:!0,closeOnEsc:!0,dangerMode:!1,timer:null},c=Object.assign({},s);e.setDefaults=function(t){c=Object.assign({},s,t)};var l=function(t){var e=t&&t.button,n=t&&t.buttons;return void 0!==e&&void 0!==n&&o.throwErr("Cannot set both 'button' and 'buttons' options!"),void 0!==e?{confirm:e}:n},u=function(t){return o.ordinalSuffixOf(t+1)},f=function(t,e){o.throwErr(u(e)+" argument ('"+t+"') is invalid")},d=function(t,e){var n=t+1,r=e[n];o.isPlainObject(r)||void 0===r||o.throwErr("Expected "+u(n)+" argument ('"+r+"') to be a plain object")},p=function(t,e){var n=t+1,r=e[n];void 0!==r&&o.throwErr("Unexpected "+u(n)+" argument ("+r+")")},m=function(t,e,n,r){var i=typeof e,a="string"===i,s=e instanceof Element;if(a){if(0===n)return{text:e};if(1===n)return{text:e,title:r[0]};if(2===n)return d(n,r),{icon:e};f(e,n)}else{if(s&&0===n)return d(n,r),{content:e};if(o.isPlainObject(e))return p(n,r),e;f(e,n)}};e.getOpts=function(){for(var t=[],e=0;e<arguments.length;e++)t[e]=arguments[e];var n={};t.forEach(function(e,o){var r=m(0,e,o,t);Object.assign(n,r)});var o=l(n);n.buttons=r.getButtonListOpts(o),delete n.button,n.content=i.getContentOpts(n.content);var u=Object.assign({},s,c,n);return Object.keys(u).forEach(function(t){a.DEPRECATED_OPTS[t]&&a.logDeprecation(t)}),u}},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(1),r={element:"input",attributes:{placeholder:""}};e.getContentOpts=function(t){var e={};return o.isPlainObject(t)?Object.assign(e,t):t instanceof Element?{element:t}:"input"===t?r:null}},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.logDeprecation=function(t){var n=e.DEPRECATED_OPTS[t],o=n.onlyRename,r=n.replacement,i=n.subOption,a=n.link,s=o?"renamed":"deprecated",c='SweetAlert warning: "'+t+'" option has been '+s+".";if(r){c+=" Please use"+(i?' "'+i+'" in ':" ")+'"'+r+'" instead.'}var l="https://sweetalert.js.org";c+=a?" More details: "+l+a:" More details: "+l+"/guides/#upgrading-from-1x",console.warn(c)},e.DEPRECATED_OPTS={type:{replacement:"icon",link:"/docs/#icon"},imageUrl:{replacement:"icon",link:"/docs/#icon"},customClass:{replacement:"className",onlyRename:!0,link:"/docs/#classname"},imageSize:{},showCancelButton:{replacement:"buttons",link:"/docs/#buttons"},showConfirmButton:{replacement:"button",link:"/docs/#button"},confirmButtonText:{replacement:"button",link:"/docs/#button"},confirmButtonColor:{},cancelButtonText:{replacement:"buttons",link:"/docs/#buttons"},closeOnConfirm:{replacement:"button",subOption:"closeModal",link:"/docs/#button"},closeOnCancel:{replacement:"buttons",subOption:"closeModal",link:"/docs/#buttons"},showLoaderOnConfirm:{replacement:"buttons"},animation:{},inputType:{replacement:"content",link:"/docs/#content"},inputValue:{replacement:"content",link:"/docs/#content"},inputPlaceholder:{replacement:"content",link:"/docs/#content"},html:{replacement:"content",link:"/docs/#content"},allowEscapeKey:{replacement:"closeOnEsc",onlyRename:!0,link:"/docs/#closeonesc"},allowClickOutside:{replacement:"closeOnClickOutside",onlyRename:!0,link:"/docs/#closeonclickoutside"}}}])});

/***/ }),

/***/ "./src/modules/createFunctions.js":
/*!****************************************!*\
  !*** ./src/modules/createFunctions.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "createTableRowHeader": () => (/* binding */ createTableRowHeader),
/* harmony export */   "createOriginalUrlTableElement": () => (/* binding */ createOriginalUrlTableElement),
/* harmony export */   "createTableElement": () => (/* binding */ createTableElement),
/* harmony export */   "createShortUrlTableElement": () => (/* binding */ createShortUrlTableElement)
/* harmony export */ });


const shortUrlBase = 'http://localhost:3000/redirect/'
function createTableRowHeader(rowNum) {
  const rowHeader = document.createElement('th');
  rowHeader.textContent = rowNum;
  return rowHeader;
}

// here If I check if the url is is the one the user just entered to so I can readily show him
function createOriginalUrlTableElement(urlInfo) {
  if (urlInfo.originalUrl === originalUrlInput.value) {
    displayShortUrl(urlInfo.shortUrlId);
  }
  const _originalUrl = document.createElement('td');
  _originalUrl.textContent = urlInfo.originalUrl;
  _originalUrl.classList.add('lengthControl');
  return _originalUrl;
}

function createTableElement(text) {
  const tableElement = document.createElement('td');
  tableElement.textContent = text;
  return tableElement;
}

function createShortUrlTableElement(shortUrlId) {
  const tableElement = document.createElement('td');
  tableElement.append(createLink(shortUrlBase + shortUrlId));
  return tableElement;
}

function displayShortUrl(shortUrlId) {
  shortendUrl.textContent = '';
  shortendUrl.append(createLink(shortUrlBase + shortUrlId));
}
function createLink(shortUrl) {
  const link = document.createElement('a');
  link.textContent = shortUrl;
  link.href = shortUrl;
  return link;
}


/***/ }),

/***/ "./src/modules/displayData.js":
/*!************************************!*\
  !*** ./src/modules/displayData.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "displayData": () => (/* binding */ displayData)
/* harmony export */ });
/* harmony import */ var _createFunctions_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./createFunctions.js */ "./src/modules/createFunctions.js");



// this function displays all the data
function displayData(data) {
  let i = 0;
  displayUrlInfo.textContent = '';
  for (const urlInfo in data) {
    const tableRow = document.createElement('tr');
    tableRow.append((0,_createFunctions_js__WEBPACK_IMPORTED_MODULE_0__.createTableRowHeader)(++i));
    tableRow.append((0,_createFunctions_js__WEBPACK_IMPORTED_MODULE_0__.createOriginalUrlTableElement)(data[urlInfo]));
    tableRow.append((0,_createFunctions_js__WEBPACK_IMPORTED_MODULE_0__.createTableElement)(data[urlInfo].redirectCount));
    tableRow.append((0,_createFunctions_js__WEBPACK_IMPORTED_MODULE_0__.createTableElement)(data[urlInfo].creationDate));
    tableRow.append((0,_createFunctions_js__WEBPACK_IMPORTED_MODULE_0__.createShortUrlTableElement)(data[urlInfo].shortUrlId));
    displayUrlInfo.append(tableRow);
  }
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "baseUrl": () => (/* binding */ baseUrl)
/* harmony export */ });
/* harmony import */ var _style_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./style.css */ "./src/style.css");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! axios */ "./node_modules/axios/index.js");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(axios__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var sweetalert__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! sweetalert */ "./node_modules/sweetalert/dist/sweetalert.min.js");
/* harmony import */ var sweetalert__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(sweetalert__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _modules_displayData_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./modules/displayData.js */ "./src/modules/displayData.js");






const baseUrl = 'http://localhost:3000/';

shorten.addEventListener('click', shorteningUrl);
window.addEventListener('load', getTableData);

// loads the information for the table everytime you open the page
function getTableData() {
  axios__WEBPACK_IMPORTED_MODULE_1___default().get(`${baseUrl}shortend/list`).then((response) => {
    (0,_modules_displayData_js__WEBPACK_IMPORTED_MODULE_3__.displayData)(response.data);
  });
}

// sends request to shorten Url and responds accordingly
function shorteningUrl(event) {
  axios__WEBPACK_IMPORTED_MODULE_1___default().post(`${baseUrl}shorten`, {
      originalUrl: originalUrlInput.value,
    })
    .then((response) => {
      (0,_modules_displayData_js__WEBPACK_IMPORTED_MODULE_3__.displayData)(response.data);
      originalUrlInput.value = '';
    })
    .catch((err) => {
      // this is an extention I use instead of using alert
      sweetalert__WEBPACK_IMPORTED_MODULE_2___default()(`Error: ${err.response.status}`, err.response.data, 'error')
    });
}

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxpQ0FBaUMsV0FBVztXQUM1QztXQUNBOzs7OztXQ1BBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNOYTtBQUNRO0FBQ0s7QUFDSTtBQUNzQjtBQUNwRDtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRSxnREFBUyxJQUFJLFFBQVE7QUFDdkIsSUFBSSxvRUFBVztBQUNmLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUUsaURBQ08sSUFBSSxRQUFRO0FBQ3JCO0FBQ0EsS0FBSztBQUNMO0FBQ0EsTUFBTSxvRUFBVztBQUNqQjtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsTUFBTSxpREFBSSxXQUFXLG9CQUFvQjtBQUN6QyxLQUFLO0FBQ0wiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9VUkwtU2hvcnRuZXItRnJvbnQvLi9ub2RlX21vZHVsZXMvYXhpb3MvaW5kZXguanMiLCJ3ZWJwYWNrOi8vVVJMLVNob3J0bmVyLUZyb250Ly4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9hZGFwdGVycy94aHIuanMiLCJ3ZWJwYWNrOi8vVVJMLVNob3J0bmVyLUZyb250Ly4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9heGlvcy5qcyIsIndlYnBhY2s6Ly9VUkwtU2hvcnRuZXItRnJvbnQvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9DYW5jZWwuanMiLCJ3ZWJwYWNrOi8vVVJMLVNob3J0bmVyLUZyb250Ly4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jYW5jZWwvQ2FuY2VsVG9rZW4uanMiLCJ3ZWJwYWNrOi8vVVJMLVNob3J0bmVyLUZyb250Ly4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jYW5jZWwvaXNDYW5jZWwuanMiLCJ3ZWJwYWNrOi8vVVJMLVNob3J0bmVyLUZyb250Ly4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL0F4aW9zLmpzIiwid2VicGFjazovL1VSTC1TaG9ydG5lci1Gcm9udC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9JbnRlcmNlcHRvck1hbmFnZXIuanMiLCJ3ZWJwYWNrOi8vVVJMLVNob3J0bmVyLUZyb250Ly4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2J1aWxkRnVsbFBhdGguanMiLCJ3ZWJwYWNrOi8vVVJMLVNob3J0bmVyLUZyb250Ly4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2NyZWF0ZUVycm9yLmpzIiwid2VicGFjazovL1VSTC1TaG9ydG5lci1Gcm9udC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9kaXNwYXRjaFJlcXVlc3QuanMiLCJ3ZWJwYWNrOi8vVVJMLVNob3J0bmVyLUZyb250Ly4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2VuaGFuY2VFcnJvci5qcyIsIndlYnBhY2s6Ly9VUkwtU2hvcnRuZXItRnJvbnQvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvbWVyZ2VDb25maWcuanMiLCJ3ZWJwYWNrOi8vVVJMLVNob3J0bmVyLUZyb250Ly4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL3NldHRsZS5qcyIsIndlYnBhY2s6Ly9VUkwtU2hvcnRuZXItRnJvbnQvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvdHJhbnNmb3JtRGF0YS5qcyIsIndlYnBhY2s6Ly9VUkwtU2hvcnRuZXItRnJvbnQvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2RlZmF1bHRzLmpzIiwid2VicGFjazovL1VSTC1TaG9ydG5lci1Gcm9udC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvZW52L2RhdGEuanMiLCJ3ZWJwYWNrOi8vVVJMLVNob3J0bmVyLUZyb250Ly4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2JpbmQuanMiLCJ3ZWJwYWNrOi8vVVJMLVNob3J0bmVyLUZyb250Ly4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2J1aWxkVVJMLmpzIiwid2VicGFjazovL1VSTC1TaG9ydG5lci1Gcm9udC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9jb21iaW5lVVJMcy5qcyIsIndlYnBhY2s6Ly9VUkwtU2hvcnRuZXItRnJvbnQvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvY29va2llcy5qcyIsIndlYnBhY2s6Ly9VUkwtU2hvcnRuZXItRnJvbnQvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvaXNBYnNvbHV0ZVVSTC5qcyIsIndlYnBhY2s6Ly9VUkwtU2hvcnRuZXItRnJvbnQvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvaXNBeGlvc0Vycm9yLmpzIiwid2VicGFjazovL1VSTC1TaG9ydG5lci1Gcm9udC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9pc1VSTFNhbWVPcmlnaW4uanMiLCJ3ZWJwYWNrOi8vVVJMLVNob3J0bmVyLUZyb250Ly4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL25vcm1hbGl6ZUhlYWRlck5hbWUuanMiLCJ3ZWJwYWNrOi8vVVJMLVNob3J0bmVyLUZyb250Ly4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL3BhcnNlSGVhZGVycy5qcyIsIndlYnBhY2s6Ly9VUkwtU2hvcnRuZXItRnJvbnQvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvc3ByZWFkLmpzIiwid2VicGFjazovL1VSTC1TaG9ydG5lci1Gcm9udC8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy92YWxpZGF0b3IuanMiLCJ3ZWJwYWNrOi8vVVJMLVNob3J0bmVyLUZyb250Ly4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi91dGlscy5qcyIsIndlYnBhY2s6Ly9VUkwtU2hvcnRuZXItRnJvbnQvLi9zcmMvc3R5bGUuY3NzIiwid2VicGFjazovL1VSTC1TaG9ydG5lci1Gcm9udC8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9hcGkuanMiLCJ3ZWJwYWNrOi8vVVJMLVNob3J0bmVyLUZyb250Ly4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL3NvdXJjZU1hcHMuanMiLCJ3ZWJwYWNrOi8vVVJMLVNob3J0bmVyLUZyb250Ly4vc3JjL3N0eWxlLmNzcz83MTYzIiwid2VicGFjazovL1VSTC1TaG9ydG5lci1Gcm9udC8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qcyIsIndlYnBhY2s6Ly9VUkwtU2hvcnRuZXItRnJvbnQvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRCeVNlbGVjdG9yLmpzIiwid2VicGFjazovL1VSTC1TaG9ydG5lci1Gcm9udC8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydFN0eWxlRWxlbWVudC5qcyIsIndlYnBhY2s6Ly9VUkwtU2hvcnRuZXItRnJvbnQvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMuanMiLCJ3ZWJwYWNrOi8vVVJMLVNob3J0bmVyLUZyb250Ly4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVEb21BUEkuanMiLCJ3ZWJwYWNrOi8vVVJMLVNob3J0bmVyLUZyb250Ly4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVUYWdUcmFuc2Zvcm0uanMiLCJ3ZWJwYWNrOi8vVVJMLVNob3J0bmVyLUZyb250Ly4vbm9kZV9tb2R1bGVzL3N3ZWV0YWxlcnQvZGlzdC9zd2VldGFsZXJ0Lm1pbi5qcyIsIndlYnBhY2s6Ly9VUkwtU2hvcnRuZXItRnJvbnQvLi9zcmMvbW9kdWxlcy9jcmVhdGVGdW5jdGlvbnMuanMiLCJ3ZWJwYWNrOi8vVVJMLVNob3J0bmVyLUZyb250Ly4vc3JjL21vZHVsZXMvZGlzcGxheURhdGEuanMiLCJ3ZWJwYWNrOi8vVVJMLVNob3J0bmVyLUZyb250L3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL1VSTC1TaG9ydG5lci1Gcm9udC93ZWJwYWNrL3J1bnRpbWUvY29tcGF0IGdldCBkZWZhdWx0IGV4cG9ydCIsIndlYnBhY2s6Ly9VUkwtU2hvcnRuZXItRnJvbnQvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL1VSTC1TaG9ydG5lci1Gcm9udC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL1VSTC1TaG9ydG5lci1Gcm9udC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL1VSTC1TaG9ydG5lci1Gcm9udC8uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vbGliL2F4aW9zJyk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgc2V0dGxlID0gcmVxdWlyZSgnLi8uLi9jb3JlL3NldHRsZScpO1xudmFyIGNvb2tpZXMgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvY29va2llcycpO1xudmFyIGJ1aWxkVVJMID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2J1aWxkVVJMJyk7XG52YXIgYnVpbGRGdWxsUGF0aCA9IHJlcXVpcmUoJy4uL2NvcmUvYnVpbGRGdWxsUGF0aCcpO1xudmFyIHBhcnNlSGVhZGVycyA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9wYXJzZUhlYWRlcnMnKTtcbnZhciBpc1VSTFNhbWVPcmlnaW4gPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvaXNVUkxTYW1lT3JpZ2luJyk7XG52YXIgY3JlYXRlRXJyb3IgPSByZXF1aXJlKCcuLi9jb3JlL2NyZWF0ZUVycm9yJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuLi9kZWZhdWx0cycpO1xudmFyIENhbmNlbCA9IHJlcXVpcmUoJy4uL2NhbmNlbC9DYW5jZWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB4aHJBZGFwdGVyKGNvbmZpZykge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gZGlzcGF0Y2hYaHJSZXF1ZXN0KHJlc29sdmUsIHJlamVjdCkge1xuICAgIHZhciByZXF1ZXN0RGF0YSA9IGNvbmZpZy5kYXRhO1xuICAgIHZhciByZXF1ZXN0SGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzO1xuICAgIHZhciByZXNwb25zZVR5cGUgPSBjb25maWcucmVzcG9uc2VUeXBlO1xuICAgIHZhciBvbkNhbmNlbGVkO1xuICAgIGZ1bmN0aW9uIGRvbmUoKSB7XG4gICAgICBpZiAoY29uZmlnLmNhbmNlbFRva2VuKSB7XG4gICAgICAgIGNvbmZpZy5jYW5jZWxUb2tlbi51bnN1YnNjcmliZShvbkNhbmNlbGVkKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGNvbmZpZy5zaWduYWwpIHtcbiAgICAgICAgY29uZmlnLnNpZ25hbC5yZW1vdmVFdmVudExpc3RlbmVyKCdhYm9ydCcsIG9uQ2FuY2VsZWQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh1dGlscy5pc0Zvcm1EYXRhKHJlcXVlc3REYXRhKSkge1xuICAgICAgZGVsZXRlIHJlcXVlc3RIZWFkZXJzWydDb250ZW50LVR5cGUnXTsgLy8gTGV0IHRoZSBicm93c2VyIHNldCBpdFxuICAgIH1cblxuICAgIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAvLyBIVFRQIGJhc2ljIGF1dGhlbnRpY2F0aW9uXG4gICAgaWYgKGNvbmZpZy5hdXRoKSB7XG4gICAgICB2YXIgdXNlcm5hbWUgPSBjb25maWcuYXV0aC51c2VybmFtZSB8fCAnJztcbiAgICAgIHZhciBwYXNzd29yZCA9IGNvbmZpZy5hdXRoLnBhc3N3b3JkID8gdW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KGNvbmZpZy5hdXRoLnBhc3N3b3JkKSkgOiAnJztcbiAgICAgIHJlcXVlc3RIZWFkZXJzLkF1dGhvcml6YXRpb24gPSAnQmFzaWMgJyArIGJ0b2EodXNlcm5hbWUgKyAnOicgKyBwYXNzd29yZCk7XG4gICAgfVxuXG4gICAgdmFyIGZ1bGxQYXRoID0gYnVpbGRGdWxsUGF0aChjb25maWcuYmFzZVVSTCwgY29uZmlnLnVybCk7XG4gICAgcmVxdWVzdC5vcGVuKGNvbmZpZy5tZXRob2QudG9VcHBlckNhc2UoKSwgYnVpbGRVUkwoZnVsbFBhdGgsIGNvbmZpZy5wYXJhbXMsIGNvbmZpZy5wYXJhbXNTZXJpYWxpemVyKSwgdHJ1ZSk7XG5cbiAgICAvLyBTZXQgdGhlIHJlcXVlc3QgdGltZW91dCBpbiBNU1xuICAgIHJlcXVlc3QudGltZW91dCA9IGNvbmZpZy50aW1lb3V0O1xuXG4gICAgZnVuY3Rpb24gb25sb2FkZW5kKCkge1xuICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIFByZXBhcmUgdGhlIHJlc3BvbnNlXG4gICAgICB2YXIgcmVzcG9uc2VIZWFkZXJzID0gJ2dldEFsbFJlc3BvbnNlSGVhZGVycycgaW4gcmVxdWVzdCA/IHBhcnNlSGVhZGVycyhyZXF1ZXN0LmdldEFsbFJlc3BvbnNlSGVhZGVycygpKSA6IG51bGw7XG4gICAgICB2YXIgcmVzcG9uc2VEYXRhID0gIXJlc3BvbnNlVHlwZSB8fCByZXNwb25zZVR5cGUgPT09ICd0ZXh0JyB8fCAgcmVzcG9uc2VUeXBlID09PSAnanNvbicgP1xuICAgICAgICByZXF1ZXN0LnJlc3BvbnNlVGV4dCA6IHJlcXVlc3QucmVzcG9uc2U7XG4gICAgICB2YXIgcmVzcG9uc2UgPSB7XG4gICAgICAgIGRhdGE6IHJlc3BvbnNlRGF0YSxcbiAgICAgICAgc3RhdHVzOiByZXF1ZXN0LnN0YXR1cyxcbiAgICAgICAgc3RhdHVzVGV4dDogcmVxdWVzdC5zdGF0dXNUZXh0LFxuICAgICAgICBoZWFkZXJzOiByZXNwb25zZUhlYWRlcnMsXG4gICAgICAgIGNvbmZpZzogY29uZmlnLFxuICAgICAgICByZXF1ZXN0OiByZXF1ZXN0XG4gICAgICB9O1xuXG4gICAgICBzZXR0bGUoZnVuY3Rpb24gX3Jlc29sdmUodmFsdWUpIHtcbiAgICAgICAgcmVzb2x2ZSh2YWx1ZSk7XG4gICAgICAgIGRvbmUoKTtcbiAgICAgIH0sIGZ1bmN0aW9uIF9yZWplY3QoZXJyKSB7XG4gICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICBkb25lKCk7XG4gICAgICB9LCByZXNwb25zZSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH1cblxuICAgIGlmICgnb25sb2FkZW5kJyBpbiByZXF1ZXN0KSB7XG4gICAgICAvLyBVc2Ugb25sb2FkZW5kIGlmIGF2YWlsYWJsZVxuICAgICAgcmVxdWVzdC5vbmxvYWRlbmQgPSBvbmxvYWRlbmQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIExpc3RlbiBmb3IgcmVhZHkgc3RhdGUgdG8gZW11bGF0ZSBvbmxvYWRlbmRcbiAgICAgIHJlcXVlc3Qub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gaGFuZGxlTG9hZCgpIHtcbiAgICAgICAgaWYgKCFyZXF1ZXN0IHx8IHJlcXVlc3QucmVhZHlTdGF0ZSAhPT0gNCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoZSByZXF1ZXN0IGVycm9yZWQgb3V0IGFuZCB3ZSBkaWRuJ3QgZ2V0IGEgcmVzcG9uc2UsIHRoaXMgd2lsbCBiZVxuICAgICAgICAvLyBoYW5kbGVkIGJ5IG9uZXJyb3IgaW5zdGVhZFxuICAgICAgICAvLyBXaXRoIG9uZSBleGNlcHRpb246IHJlcXVlc3QgdGhhdCB1c2luZyBmaWxlOiBwcm90b2NvbCwgbW9zdCBicm93c2Vyc1xuICAgICAgICAvLyB3aWxsIHJldHVybiBzdGF0dXMgYXMgMCBldmVuIHRob3VnaCBpdCdzIGEgc3VjY2Vzc2Z1bCByZXF1ZXN0XG4gICAgICAgIGlmIChyZXF1ZXN0LnN0YXR1cyA9PT0gMCAmJiAhKHJlcXVlc3QucmVzcG9uc2VVUkwgJiYgcmVxdWVzdC5yZXNwb25zZVVSTC5pbmRleE9mKCdmaWxlOicpID09PSAwKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyByZWFkeXN0YXRlIGhhbmRsZXIgaXMgY2FsbGluZyBiZWZvcmUgb25lcnJvciBvciBvbnRpbWVvdXQgaGFuZGxlcnMsXG4gICAgICAgIC8vIHNvIHdlIHNob3VsZCBjYWxsIG9ubG9hZGVuZCBvbiB0aGUgbmV4dCAndGljaydcbiAgICAgICAgc2V0VGltZW91dChvbmxvYWRlbmQpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgYnJvd3NlciByZXF1ZXN0IGNhbmNlbGxhdGlvbiAoYXMgb3Bwb3NlZCB0byBhIG1hbnVhbCBjYW5jZWxsYXRpb24pXG4gICAgcmVxdWVzdC5vbmFib3J0ID0gZnVuY3Rpb24gaGFuZGxlQWJvcnQoKSB7XG4gICAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoJ1JlcXVlc3QgYWJvcnRlZCcsIGNvbmZpZywgJ0VDT05OQUJPUlRFRCcsIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSBsb3cgbGV2ZWwgbmV0d29yayBlcnJvcnNcbiAgICByZXF1ZXN0Lm9uZXJyb3IgPSBmdW5jdGlvbiBoYW5kbGVFcnJvcigpIHtcbiAgICAgIC8vIFJlYWwgZXJyb3JzIGFyZSBoaWRkZW4gZnJvbSB1cyBieSB0aGUgYnJvd3NlclxuICAgICAgLy8gb25lcnJvciBzaG91bGQgb25seSBmaXJlIGlmIGl0J3MgYSBuZXR3b3JrIGVycm9yXG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoJ05ldHdvcmsgRXJyb3InLCBjb25maWcsIG51bGwsIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSB0aW1lb3V0XG4gICAgcmVxdWVzdC5vbnRpbWVvdXQgPSBmdW5jdGlvbiBoYW5kbGVUaW1lb3V0KCkge1xuICAgICAgdmFyIHRpbWVvdXRFcnJvck1lc3NhZ2UgPSBjb25maWcudGltZW91dCA/ICd0aW1lb3V0IG9mICcgKyBjb25maWcudGltZW91dCArICdtcyBleGNlZWRlZCcgOiAndGltZW91dCBleGNlZWRlZCc7XG4gICAgICB2YXIgdHJhbnNpdGlvbmFsID0gY29uZmlnLnRyYW5zaXRpb25hbCB8fCBkZWZhdWx0cy50cmFuc2l0aW9uYWw7XG4gICAgICBpZiAoY29uZmlnLnRpbWVvdXRFcnJvck1lc3NhZ2UpIHtcbiAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZSA9IGNvbmZpZy50aW1lb3V0RXJyb3JNZXNzYWdlO1xuICAgICAgfVxuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKFxuICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlLFxuICAgICAgICBjb25maWcsXG4gICAgICAgIHRyYW5zaXRpb25hbC5jbGFyaWZ5VGltZW91dEVycm9yID8gJ0VUSU1FRE9VVCcgOiAnRUNPTk5BQk9SVEVEJyxcbiAgICAgICAgcmVxdWVzdCkpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gQWRkIHhzcmYgaGVhZGVyXG4gICAgLy8gVGhpcyBpcyBvbmx5IGRvbmUgaWYgcnVubmluZyBpbiBhIHN0YW5kYXJkIGJyb3dzZXIgZW52aXJvbm1lbnQuXG4gICAgLy8gU3BlY2lmaWNhbGx5IG5vdCBpZiB3ZSdyZSBpbiBhIHdlYiB3b3JrZXIsIG9yIHJlYWN0LW5hdGl2ZS5cbiAgICBpZiAodXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSkge1xuICAgICAgLy8gQWRkIHhzcmYgaGVhZGVyXG4gICAgICB2YXIgeHNyZlZhbHVlID0gKGNvbmZpZy53aXRoQ3JlZGVudGlhbHMgfHwgaXNVUkxTYW1lT3JpZ2luKGZ1bGxQYXRoKSkgJiYgY29uZmlnLnhzcmZDb29raWVOYW1lID9cbiAgICAgICAgY29va2llcy5yZWFkKGNvbmZpZy54c3JmQ29va2llTmFtZSkgOlxuICAgICAgICB1bmRlZmluZWQ7XG5cbiAgICAgIGlmICh4c3JmVmFsdWUpIHtcbiAgICAgICAgcmVxdWVzdEhlYWRlcnNbY29uZmlnLnhzcmZIZWFkZXJOYW1lXSA9IHhzcmZWYWx1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBBZGQgaGVhZGVycyB0byB0aGUgcmVxdWVzdFxuICAgIGlmICgnc2V0UmVxdWVzdEhlYWRlcicgaW4gcmVxdWVzdCkge1xuICAgICAgdXRpbHMuZm9yRWFjaChyZXF1ZXN0SGVhZGVycywgZnVuY3Rpb24gc2V0UmVxdWVzdEhlYWRlcih2YWwsIGtleSkge1xuICAgICAgICBpZiAodHlwZW9mIHJlcXVlc3REYXRhID09PSAndW5kZWZpbmVkJyAmJiBrZXkudG9Mb3dlckNhc2UoKSA9PT0gJ2NvbnRlbnQtdHlwZScpIHtcbiAgICAgICAgICAvLyBSZW1vdmUgQ29udGVudC1UeXBlIGlmIGRhdGEgaXMgdW5kZWZpbmVkXG4gICAgICAgICAgZGVsZXRlIHJlcXVlc3RIZWFkZXJzW2tleV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gT3RoZXJ3aXNlIGFkZCBoZWFkZXIgdG8gdGhlIHJlcXVlc3RcbiAgICAgICAgICByZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoa2V5LCB2YWwpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBBZGQgd2l0aENyZWRlbnRpYWxzIHRvIHJlcXVlc3QgaWYgbmVlZGVkXG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcud2l0aENyZWRlbnRpYWxzKSkge1xuICAgICAgcmVxdWVzdC53aXRoQ3JlZGVudGlhbHMgPSAhIWNvbmZpZy53aXRoQ3JlZGVudGlhbHM7XG4gICAgfVxuXG4gICAgLy8gQWRkIHJlc3BvbnNlVHlwZSB0byByZXF1ZXN0IGlmIG5lZWRlZFxuICAgIGlmIChyZXNwb25zZVR5cGUgJiYgcmVzcG9uc2VUeXBlICE9PSAnanNvbicpIHtcbiAgICAgIHJlcXVlc3QucmVzcG9uc2VUeXBlID0gY29uZmlnLnJlc3BvbnNlVHlwZTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgcHJvZ3Jlc3MgaWYgbmVlZGVkXG4gICAgaWYgKHR5cGVvZiBjb25maWcub25Eb3dubG9hZFByb2dyZXNzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgY29uZmlnLm9uRG93bmxvYWRQcm9ncmVzcyk7XG4gICAgfVxuXG4gICAgLy8gTm90IGFsbCBicm93c2VycyBzdXBwb3J0IHVwbG9hZCBldmVudHNcbiAgICBpZiAodHlwZW9mIGNvbmZpZy5vblVwbG9hZFByb2dyZXNzID09PSAnZnVuY3Rpb24nICYmIHJlcXVlc3QudXBsb2FkKSB7XG4gICAgICByZXF1ZXN0LnVwbG9hZC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIGNvbmZpZy5vblVwbG9hZFByb2dyZXNzKTtcbiAgICB9XG5cbiAgICBpZiAoY29uZmlnLmNhbmNlbFRva2VuIHx8IGNvbmZpZy5zaWduYWwpIHtcbiAgICAgIC8vIEhhbmRsZSBjYW5jZWxsYXRpb25cbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzXG4gICAgICBvbkNhbmNlbGVkID0gZnVuY3Rpb24oY2FuY2VsKSB7XG4gICAgICAgIGlmICghcmVxdWVzdCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICByZWplY3QoIWNhbmNlbCB8fCAoY2FuY2VsICYmIGNhbmNlbC50eXBlKSA/IG5ldyBDYW5jZWwoJ2NhbmNlbGVkJykgOiBjYW5jZWwpO1xuICAgICAgICByZXF1ZXN0LmFib3J0KCk7XG4gICAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgICAgfTtcblxuICAgICAgY29uZmlnLmNhbmNlbFRva2VuICYmIGNvbmZpZy5jYW5jZWxUb2tlbi5zdWJzY3JpYmUob25DYW5jZWxlZCk7XG4gICAgICBpZiAoY29uZmlnLnNpZ25hbCkge1xuICAgICAgICBjb25maWcuc2lnbmFsLmFib3J0ZWQgPyBvbkNhbmNlbGVkKCkgOiBjb25maWcuc2lnbmFsLmFkZEV2ZW50TGlzdGVuZXIoJ2Fib3J0Jywgb25DYW5jZWxlZCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFyZXF1ZXN0RGF0YSkge1xuICAgICAgcmVxdWVzdERhdGEgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIFNlbmQgdGhlIHJlcXVlc3RcbiAgICByZXF1ZXN0LnNlbmQocmVxdWVzdERhdGEpO1xuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbnZhciBiaW5kID0gcmVxdWlyZSgnLi9oZWxwZXJzL2JpbmQnKTtcbnZhciBBeGlvcyA9IHJlcXVpcmUoJy4vY29yZS9BeGlvcycpO1xudmFyIG1lcmdlQ29uZmlnID0gcmVxdWlyZSgnLi9jb3JlL21lcmdlQ29uZmlnJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuL2RlZmF1bHRzJyk7XG5cbi8qKlxuICogQ3JlYXRlIGFuIGluc3RhbmNlIG9mIEF4aW9zXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGRlZmF1bHRDb25maWcgVGhlIGRlZmF1bHQgY29uZmlnIGZvciB0aGUgaW5zdGFuY2VcbiAqIEByZXR1cm4ge0F4aW9zfSBBIG5ldyBpbnN0YW5jZSBvZiBBeGlvc1xuICovXG5mdW5jdGlvbiBjcmVhdGVJbnN0YW5jZShkZWZhdWx0Q29uZmlnKSB7XG4gIHZhciBjb250ZXh0ID0gbmV3IEF4aW9zKGRlZmF1bHRDb25maWcpO1xuICB2YXIgaW5zdGFuY2UgPSBiaW5kKEF4aW9zLnByb3RvdHlwZS5yZXF1ZXN0LCBjb250ZXh0KTtcblxuICAvLyBDb3B5IGF4aW9zLnByb3RvdHlwZSB0byBpbnN0YW5jZVxuICB1dGlscy5leHRlbmQoaW5zdGFuY2UsIEF4aW9zLnByb3RvdHlwZSwgY29udGV4dCk7XG5cbiAgLy8gQ29weSBjb250ZXh0IHRvIGluc3RhbmNlXG4gIHV0aWxzLmV4dGVuZChpbnN0YW5jZSwgY29udGV4dCk7XG5cbiAgLy8gRmFjdG9yeSBmb3IgY3JlYXRpbmcgbmV3IGluc3RhbmNlc1xuICBpbnN0YW5jZS5jcmVhdGUgPSBmdW5jdGlvbiBjcmVhdGUoaW5zdGFuY2VDb25maWcpIHtcbiAgICByZXR1cm4gY3JlYXRlSW5zdGFuY2UobWVyZ2VDb25maWcoZGVmYXVsdENvbmZpZywgaW5zdGFuY2VDb25maWcpKTtcbiAgfTtcblxuICByZXR1cm4gaW5zdGFuY2U7XG59XG5cbi8vIENyZWF0ZSB0aGUgZGVmYXVsdCBpbnN0YW5jZSB0byBiZSBleHBvcnRlZFxudmFyIGF4aW9zID0gY3JlYXRlSW5zdGFuY2UoZGVmYXVsdHMpO1xuXG4vLyBFeHBvc2UgQXhpb3MgY2xhc3MgdG8gYWxsb3cgY2xhc3MgaW5oZXJpdGFuY2VcbmF4aW9zLkF4aW9zID0gQXhpb3M7XG5cbi8vIEV4cG9zZSBDYW5jZWwgJiBDYW5jZWxUb2tlblxuYXhpb3MuQ2FuY2VsID0gcmVxdWlyZSgnLi9jYW5jZWwvQ2FuY2VsJyk7XG5heGlvcy5DYW5jZWxUb2tlbiA9IHJlcXVpcmUoJy4vY2FuY2VsL0NhbmNlbFRva2VuJyk7XG5heGlvcy5pc0NhbmNlbCA9IHJlcXVpcmUoJy4vY2FuY2VsL2lzQ2FuY2VsJyk7XG5heGlvcy5WRVJTSU9OID0gcmVxdWlyZSgnLi9lbnYvZGF0YScpLnZlcnNpb247XG5cbi8vIEV4cG9zZSBhbGwvc3ByZWFkXG5heGlvcy5hbGwgPSBmdW5jdGlvbiBhbGwocHJvbWlzZXMpIHtcbiAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKTtcbn07XG5heGlvcy5zcHJlYWQgPSByZXF1aXJlKCcuL2hlbHBlcnMvc3ByZWFkJyk7XG5cbi8vIEV4cG9zZSBpc0F4aW9zRXJyb3JcbmF4aW9zLmlzQXhpb3NFcnJvciA9IHJlcXVpcmUoJy4vaGVscGVycy9pc0F4aW9zRXJyb3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSBheGlvcztcblxuLy8gQWxsb3cgdXNlIG9mIGRlZmF1bHQgaW1wb3J0IHN5bnRheCBpbiBUeXBlU2NyaXB0XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gYXhpb3M7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQSBgQ2FuY2VsYCBpcyBhbiBvYmplY3QgdGhhdCBpcyB0aHJvd24gd2hlbiBhbiBvcGVyYXRpb24gaXMgY2FuY2VsZWQuXG4gKlxuICogQGNsYXNzXG4gKiBAcGFyYW0ge3N0cmluZz19IG1lc3NhZ2UgVGhlIG1lc3NhZ2UuXG4gKi9cbmZ1bmN0aW9uIENhbmNlbChtZXNzYWdlKSB7XG4gIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG59XG5cbkNhbmNlbC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgcmV0dXJuICdDYW5jZWwnICsgKHRoaXMubWVzc2FnZSA/ICc6ICcgKyB0aGlzLm1lc3NhZ2UgOiAnJyk7XG59O1xuXG5DYW5jZWwucHJvdG90eXBlLl9fQ0FOQ0VMX18gPSB0cnVlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbmNlbDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENhbmNlbCA9IHJlcXVpcmUoJy4vQ2FuY2VsJyk7XG5cbi8qKlxuICogQSBgQ2FuY2VsVG9rZW5gIGlzIGFuIG9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlcXVlc3QgY2FuY2VsbGF0aW9uIG9mIGFuIG9wZXJhdGlvbi5cbiAqXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGV4ZWN1dG9yIFRoZSBleGVjdXRvciBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gQ2FuY2VsVG9rZW4oZXhlY3V0b3IpIHtcbiAgaWYgKHR5cGVvZiBleGVjdXRvciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2V4ZWN1dG9yIG11c3QgYmUgYSBmdW5jdGlvbi4nKTtcbiAgfVxuXG4gIHZhciByZXNvbHZlUHJvbWlzZTtcblxuICB0aGlzLnByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbiBwcm9taXNlRXhlY3V0b3IocmVzb2x2ZSkge1xuICAgIHJlc29sdmVQcm9taXNlID0gcmVzb2x2ZTtcbiAgfSk7XG5cbiAgdmFyIHRva2VuID0gdGhpcztcblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xuICB0aGlzLnByb21pc2UudGhlbihmdW5jdGlvbihjYW5jZWwpIHtcbiAgICBpZiAoIXRva2VuLl9saXN0ZW5lcnMpIHJldHVybjtcblxuICAgIHZhciBpO1xuICAgIHZhciBsID0gdG9rZW4uX2xpc3RlbmVycy5sZW5ndGg7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICB0b2tlbi5fbGlzdGVuZXJzW2ldKGNhbmNlbCk7XG4gICAgfVxuICAgIHRva2VuLl9saXN0ZW5lcnMgPSBudWxsO1xuICB9KTtcblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xuICB0aGlzLnByb21pc2UudGhlbiA9IGZ1bmN0aW9uKG9uZnVsZmlsbGVkKSB7XG4gICAgdmFyIF9yZXNvbHZlO1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzXG4gICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgICB0b2tlbi5zdWJzY3JpYmUocmVzb2x2ZSk7XG4gICAgICBfcmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgfSkudGhlbihvbmZ1bGZpbGxlZCk7XG5cbiAgICBwcm9taXNlLmNhbmNlbCA9IGZ1bmN0aW9uIHJlamVjdCgpIHtcbiAgICAgIHRva2VuLnVuc3Vic2NyaWJlKF9yZXNvbHZlKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH07XG5cbiAgZXhlY3V0b3IoZnVuY3Rpb24gY2FuY2VsKG1lc3NhZ2UpIHtcbiAgICBpZiAodG9rZW4ucmVhc29uKSB7XG4gICAgICAvLyBDYW5jZWxsYXRpb24gaGFzIGFscmVhZHkgYmVlbiByZXF1ZXN0ZWRcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0b2tlbi5yZWFzb24gPSBuZXcgQ2FuY2VsKG1lc3NhZ2UpO1xuICAgIHJlc29sdmVQcm9taXNlKHRva2VuLnJlYXNvbik7XG4gIH0pO1xufVxuXG4vKipcbiAqIFRocm93cyBhIGBDYW5jZWxgIGlmIGNhbmNlbGxhdGlvbiBoYXMgYmVlbiByZXF1ZXN0ZWQuXG4gKi9cbkNhbmNlbFRva2VuLnByb3RvdHlwZS50aHJvd0lmUmVxdWVzdGVkID0gZnVuY3Rpb24gdGhyb3dJZlJlcXVlc3RlZCgpIHtcbiAgaWYgKHRoaXMucmVhc29uKSB7XG4gICAgdGhyb3cgdGhpcy5yZWFzb247XG4gIH1cbn07XG5cbi8qKlxuICogU3Vic2NyaWJlIHRvIHRoZSBjYW5jZWwgc2lnbmFsXG4gKi9cblxuQ2FuY2VsVG9rZW4ucHJvdG90eXBlLnN1YnNjcmliZSA9IGZ1bmN0aW9uIHN1YnNjcmliZShsaXN0ZW5lcikge1xuICBpZiAodGhpcy5yZWFzb24pIHtcbiAgICBsaXN0ZW5lcih0aGlzLnJlYXNvbik7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKHRoaXMuX2xpc3RlbmVycykge1xuICAgIHRoaXMuX2xpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLl9saXN0ZW5lcnMgPSBbbGlzdGVuZXJdO1xuICB9XG59O1xuXG4vKipcbiAqIFVuc3Vic2NyaWJlIGZyb20gdGhlIGNhbmNlbCBzaWduYWxcbiAqL1xuXG5DYW5jZWxUb2tlbi5wcm90b3R5cGUudW5zdWJzY3JpYmUgPSBmdW5jdGlvbiB1bnN1YnNjcmliZShsaXN0ZW5lcikge1xuICBpZiAoIXRoaXMuX2xpc3RlbmVycykge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgaW5kZXggPSB0aGlzLl9saXN0ZW5lcnMuaW5kZXhPZihsaXN0ZW5lcik7XG4gIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICB0aGlzLl9saXN0ZW5lcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgfVxufTtcblxuLyoqXG4gKiBSZXR1cm5zIGFuIG9iamVjdCB0aGF0IGNvbnRhaW5zIGEgbmV3IGBDYW5jZWxUb2tlbmAgYW5kIGEgZnVuY3Rpb24gdGhhdCwgd2hlbiBjYWxsZWQsXG4gKiBjYW5jZWxzIHRoZSBgQ2FuY2VsVG9rZW5gLlxuICovXG5DYW5jZWxUb2tlbi5zb3VyY2UgPSBmdW5jdGlvbiBzb3VyY2UoKSB7XG4gIHZhciBjYW5jZWw7XG4gIHZhciB0b2tlbiA9IG5ldyBDYW5jZWxUb2tlbihmdW5jdGlvbiBleGVjdXRvcihjKSB7XG4gICAgY2FuY2VsID0gYztcbiAgfSk7XG4gIHJldHVybiB7XG4gICAgdG9rZW46IHRva2VuLFxuICAgIGNhbmNlbDogY2FuY2VsXG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbmNlbFRva2VuO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQ2FuY2VsKHZhbHVlKSB7XG4gIHJldHVybiAhISh2YWx1ZSAmJiB2YWx1ZS5fX0NBTkNFTF9fKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBidWlsZFVSTCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvYnVpbGRVUkwnKTtcbnZhciBJbnRlcmNlcHRvck1hbmFnZXIgPSByZXF1aXJlKCcuL0ludGVyY2VwdG9yTWFuYWdlcicpO1xudmFyIGRpc3BhdGNoUmVxdWVzdCA9IHJlcXVpcmUoJy4vZGlzcGF0Y2hSZXF1ZXN0Jyk7XG52YXIgbWVyZ2VDb25maWcgPSByZXF1aXJlKCcuL21lcmdlQ29uZmlnJyk7XG52YXIgdmFsaWRhdG9yID0gcmVxdWlyZSgnLi4vaGVscGVycy92YWxpZGF0b3InKTtcblxudmFyIHZhbGlkYXRvcnMgPSB2YWxpZGF0b3IudmFsaWRhdG9ycztcbi8qKlxuICogQ3JlYXRlIGEgbmV3IGluc3RhbmNlIG9mIEF4aW9zXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGluc3RhbmNlQ29uZmlnIFRoZSBkZWZhdWx0IGNvbmZpZyBmb3IgdGhlIGluc3RhbmNlXG4gKi9cbmZ1bmN0aW9uIEF4aW9zKGluc3RhbmNlQ29uZmlnKSB7XG4gIHRoaXMuZGVmYXVsdHMgPSBpbnN0YW5jZUNvbmZpZztcbiAgdGhpcy5pbnRlcmNlcHRvcnMgPSB7XG4gICAgcmVxdWVzdDogbmV3IEludGVyY2VwdG9yTWFuYWdlcigpLFxuICAgIHJlc3BvbnNlOiBuZXcgSW50ZXJjZXB0b3JNYW5hZ2VyKClcbiAgfTtcbn1cblxuLyoqXG4gKiBEaXNwYXRjaCBhIHJlcXVlc3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIFRoZSBjb25maWcgc3BlY2lmaWMgZm9yIHRoaXMgcmVxdWVzdCAobWVyZ2VkIHdpdGggdGhpcy5kZWZhdWx0cylcbiAqL1xuQXhpb3MucHJvdG90eXBlLnJlcXVlc3QgPSBmdW5jdGlvbiByZXF1ZXN0KGNvbmZpZykge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgLy8gQWxsb3cgZm9yIGF4aW9zKCdleGFtcGxlL3VybCdbLCBjb25maWddKSBhIGxhIGZldGNoIEFQSVxuICBpZiAodHlwZW9mIGNvbmZpZyA9PT0gJ3N0cmluZycpIHtcbiAgICBjb25maWcgPSBhcmd1bWVudHNbMV0gfHwge307XG4gICAgY29uZmlnLnVybCA9IGFyZ3VtZW50c1swXTtcbiAgfSBlbHNlIHtcbiAgICBjb25maWcgPSBjb25maWcgfHwge307XG4gIH1cblxuICBjb25maWcgPSBtZXJnZUNvbmZpZyh0aGlzLmRlZmF1bHRzLCBjb25maWcpO1xuXG4gIC8vIFNldCBjb25maWcubWV0aG9kXG4gIGlmIChjb25maWcubWV0aG9kKSB7XG4gICAgY29uZmlnLm1ldGhvZCA9IGNvbmZpZy5tZXRob2QudG9Mb3dlckNhc2UoKTtcbiAgfSBlbHNlIGlmICh0aGlzLmRlZmF1bHRzLm1ldGhvZCkge1xuICAgIGNvbmZpZy5tZXRob2QgPSB0aGlzLmRlZmF1bHRzLm1ldGhvZC50b0xvd2VyQ2FzZSgpO1xuICB9IGVsc2Uge1xuICAgIGNvbmZpZy5tZXRob2QgPSAnZ2V0JztcbiAgfVxuXG4gIHZhciB0cmFuc2l0aW9uYWwgPSBjb25maWcudHJhbnNpdGlvbmFsO1xuXG4gIGlmICh0cmFuc2l0aW9uYWwgIT09IHVuZGVmaW5lZCkge1xuICAgIHZhbGlkYXRvci5hc3NlcnRPcHRpb25zKHRyYW5zaXRpb25hbCwge1xuICAgICAgc2lsZW50SlNPTlBhcnNpbmc6IHZhbGlkYXRvcnMudHJhbnNpdGlvbmFsKHZhbGlkYXRvcnMuYm9vbGVhbiksXG4gICAgICBmb3JjZWRKU09OUGFyc2luZzogdmFsaWRhdG9ycy50cmFuc2l0aW9uYWwodmFsaWRhdG9ycy5ib29sZWFuKSxcbiAgICAgIGNsYXJpZnlUaW1lb3V0RXJyb3I6IHZhbGlkYXRvcnMudHJhbnNpdGlvbmFsKHZhbGlkYXRvcnMuYm9vbGVhbilcbiAgICB9LCBmYWxzZSk7XG4gIH1cblxuICAvLyBmaWx0ZXIgb3V0IHNraXBwZWQgaW50ZXJjZXB0b3JzXG4gIHZhciByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbiA9IFtdO1xuICB2YXIgc3luY2hyb25vdXNSZXF1ZXN0SW50ZXJjZXB0b3JzID0gdHJ1ZTtcbiAgdGhpcy5pbnRlcmNlcHRvcnMucmVxdWVzdC5mb3JFYWNoKGZ1bmN0aW9uIHVuc2hpZnRSZXF1ZXN0SW50ZXJjZXB0b3JzKGludGVyY2VwdG9yKSB7XG4gICAgaWYgKHR5cGVvZiBpbnRlcmNlcHRvci5ydW5XaGVuID09PSAnZnVuY3Rpb24nICYmIGludGVyY2VwdG9yLnJ1bldoZW4oY29uZmlnKSA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzeW5jaHJvbm91c1JlcXVlc3RJbnRlcmNlcHRvcnMgPSBzeW5jaHJvbm91c1JlcXVlc3RJbnRlcmNlcHRvcnMgJiYgaW50ZXJjZXB0b3Iuc3luY2hyb25vdXM7XG5cbiAgICByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbi51bnNoaWZ0KGludGVyY2VwdG9yLmZ1bGZpbGxlZCwgaW50ZXJjZXB0b3IucmVqZWN0ZWQpO1xuICB9KTtcblxuICB2YXIgcmVzcG9uc2VJbnRlcmNlcHRvckNoYWluID0gW107XG4gIHRoaXMuaW50ZXJjZXB0b3JzLnJlc3BvbnNlLmZvckVhY2goZnVuY3Rpb24gcHVzaFJlc3BvbnNlSW50ZXJjZXB0b3JzKGludGVyY2VwdG9yKSB7XG4gICAgcmVzcG9uc2VJbnRlcmNlcHRvckNoYWluLnB1c2goaW50ZXJjZXB0b3IuZnVsZmlsbGVkLCBpbnRlcmNlcHRvci5yZWplY3RlZCk7XG4gIH0pO1xuXG4gIHZhciBwcm9taXNlO1xuXG4gIGlmICghc3luY2hyb25vdXNSZXF1ZXN0SW50ZXJjZXB0b3JzKSB7XG4gICAgdmFyIGNoYWluID0gW2Rpc3BhdGNoUmVxdWVzdCwgdW5kZWZpbmVkXTtcblxuICAgIEFycmF5LnByb3RvdHlwZS51bnNoaWZ0LmFwcGx5KGNoYWluLCByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbik7XG4gICAgY2hhaW4gPSBjaGFpbi5jb25jYXQocmVzcG9uc2VJbnRlcmNlcHRvckNoYWluKTtcblxuICAgIHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoY29uZmlnKTtcbiAgICB3aGlsZSAoY2hhaW4ubGVuZ3RoKSB7XG4gICAgICBwcm9taXNlID0gcHJvbWlzZS50aGVuKGNoYWluLnNoaWZ0KCksIGNoYWluLnNoaWZ0KCkpO1xuICAgIH1cblxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cblxuICB2YXIgbmV3Q29uZmlnID0gY29uZmlnO1xuICB3aGlsZSAocmVxdWVzdEludGVyY2VwdG9yQ2hhaW4ubGVuZ3RoKSB7XG4gICAgdmFyIG9uRnVsZmlsbGVkID0gcmVxdWVzdEludGVyY2VwdG9yQ2hhaW4uc2hpZnQoKTtcbiAgICB2YXIgb25SZWplY3RlZCA9IHJlcXVlc3RJbnRlcmNlcHRvckNoYWluLnNoaWZ0KCk7XG4gICAgdHJ5IHtcbiAgICAgIG5ld0NvbmZpZyA9IG9uRnVsZmlsbGVkKG5ld0NvbmZpZyk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIG9uUmVqZWN0ZWQoZXJyb3IpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgdHJ5IHtcbiAgICBwcm9taXNlID0gZGlzcGF0Y2hSZXF1ZXN0KG5ld0NvbmZpZyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycm9yKTtcbiAgfVxuXG4gIHdoaWxlIChyZXNwb25zZUludGVyY2VwdG9yQ2hhaW4ubGVuZ3RoKSB7XG4gICAgcHJvbWlzZSA9IHByb21pc2UudGhlbihyZXNwb25zZUludGVyY2VwdG9yQ2hhaW4uc2hpZnQoKSwgcmVzcG9uc2VJbnRlcmNlcHRvckNoYWluLnNoaWZ0KCkpO1xuICB9XG5cbiAgcmV0dXJuIHByb21pc2U7XG59O1xuXG5BeGlvcy5wcm90b3R5cGUuZ2V0VXJpID0gZnVuY3Rpb24gZ2V0VXJpKGNvbmZpZykge1xuICBjb25maWcgPSBtZXJnZUNvbmZpZyh0aGlzLmRlZmF1bHRzLCBjb25maWcpO1xuICByZXR1cm4gYnVpbGRVUkwoY29uZmlnLnVybCwgY29uZmlnLnBhcmFtcywgY29uZmlnLnBhcmFtc1NlcmlhbGl6ZXIpLnJlcGxhY2UoL15cXD8vLCAnJyk7XG59O1xuXG4vLyBQcm92aWRlIGFsaWFzZXMgZm9yIHN1cHBvcnRlZCByZXF1ZXN0IG1ldGhvZHNcbnV0aWxzLmZvckVhY2goWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnLCAnb3B0aW9ucyddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kTm9EYXRhKG1ldGhvZCkge1xuICAvKmVzbGludCBmdW5jLW5hbWVzOjAqL1xuICBBeGlvcy5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKHVybCwgY29uZmlnKSB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdChtZXJnZUNvbmZpZyhjb25maWcgfHwge30sIHtcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgdXJsOiB1cmwsXG4gICAgICBkYXRhOiAoY29uZmlnIHx8IHt9KS5kYXRhXG4gICAgfSkpO1xuICB9O1xufSk7XG5cbnV0aWxzLmZvckVhY2goWydwb3N0JywgJ3B1dCcsICdwYXRjaCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kV2l0aERhdGEobWV0aG9kKSB7XG4gIC8qZXNsaW50IGZ1bmMtbmFtZXM6MCovXG4gIEF4aW9zLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24odXJsLCBkYXRhLCBjb25maWcpIHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KG1lcmdlQ29uZmlnKGNvbmZpZyB8fCB7fSwge1xuICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICB1cmw6IHVybCxcbiAgICAgIGRhdGE6IGRhdGFcbiAgICB9KSk7XG4gIH07XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBeGlvcztcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5mdW5jdGlvbiBJbnRlcmNlcHRvck1hbmFnZXIoKSB7XG4gIHRoaXMuaGFuZGxlcnMgPSBbXTtcbn1cblxuLyoqXG4gKiBBZGQgYSBuZXcgaW50ZXJjZXB0b3IgdG8gdGhlIHN0YWNrXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVsZmlsbGVkIFRoZSBmdW5jdGlvbiB0byBoYW5kbGUgYHRoZW5gIGZvciBhIGBQcm9taXNlYFxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVqZWN0ZWQgVGhlIGZ1bmN0aW9uIHRvIGhhbmRsZSBgcmVqZWN0YCBmb3IgYSBgUHJvbWlzZWBcbiAqXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IEFuIElEIHVzZWQgdG8gcmVtb3ZlIGludGVyY2VwdG9yIGxhdGVyXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUudXNlID0gZnVuY3Rpb24gdXNlKGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIG9wdGlvbnMpIHtcbiAgdGhpcy5oYW5kbGVycy5wdXNoKHtcbiAgICBmdWxmaWxsZWQ6IGZ1bGZpbGxlZCxcbiAgICByZWplY3RlZDogcmVqZWN0ZWQsXG4gICAgc3luY2hyb25vdXM6IG9wdGlvbnMgPyBvcHRpb25zLnN5bmNocm9ub3VzIDogZmFsc2UsXG4gICAgcnVuV2hlbjogb3B0aW9ucyA/IG9wdGlvbnMucnVuV2hlbiA6IG51bGxcbiAgfSk7XG4gIHJldHVybiB0aGlzLmhhbmRsZXJzLmxlbmd0aCAtIDE7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhbiBpbnRlcmNlcHRvciBmcm9tIHRoZSBzdGFja1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBpZCBUaGUgSUQgdGhhdCB3YXMgcmV0dXJuZWQgYnkgYHVzZWBcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS5lamVjdCA9IGZ1bmN0aW9uIGVqZWN0KGlkKSB7XG4gIGlmICh0aGlzLmhhbmRsZXJzW2lkXSkge1xuICAgIHRoaXMuaGFuZGxlcnNbaWRdID0gbnVsbDtcbiAgfVxufTtcblxuLyoqXG4gKiBJdGVyYXRlIG92ZXIgYWxsIHRoZSByZWdpc3RlcmVkIGludGVyY2VwdG9yc1xuICpcbiAqIFRoaXMgbWV0aG9kIGlzIHBhcnRpY3VsYXJseSB1c2VmdWwgZm9yIHNraXBwaW5nIG92ZXIgYW55XG4gKiBpbnRlcmNlcHRvcnMgdGhhdCBtYXkgaGF2ZSBiZWNvbWUgYG51bGxgIGNhbGxpbmcgYGVqZWN0YC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24gdG8gY2FsbCBmb3IgZWFjaCBpbnRlcmNlcHRvclxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbiBmb3JFYWNoKGZuKSB7XG4gIHV0aWxzLmZvckVhY2godGhpcy5oYW5kbGVycywgZnVuY3Rpb24gZm9yRWFjaEhhbmRsZXIoaCkge1xuICAgIGlmIChoICE9PSBudWxsKSB7XG4gICAgICBmbihoKTtcbiAgICB9XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmNlcHRvck1hbmFnZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBpc0Fic29sdXRlVVJMID0gcmVxdWlyZSgnLi4vaGVscGVycy9pc0Fic29sdXRlVVJMJyk7XG52YXIgY29tYmluZVVSTHMgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2NvbWJpbmVVUkxzJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBVUkwgYnkgY29tYmluaW5nIHRoZSBiYXNlVVJMIHdpdGggdGhlIHJlcXVlc3RlZFVSTCxcbiAqIG9ubHkgd2hlbiB0aGUgcmVxdWVzdGVkVVJMIGlzIG5vdCBhbHJlYWR5IGFuIGFic29sdXRlIFVSTC5cbiAqIElmIHRoZSByZXF1ZXN0VVJMIGlzIGFic29sdXRlLCB0aGlzIGZ1bmN0aW9uIHJldHVybnMgdGhlIHJlcXVlc3RlZFVSTCB1bnRvdWNoZWQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2VVUkwgVGhlIGJhc2UgVVJMXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVxdWVzdGVkVVJMIEFic29sdXRlIG9yIHJlbGF0aXZlIFVSTCB0byBjb21iaW5lXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgY29tYmluZWQgZnVsbCBwYXRoXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYnVpbGRGdWxsUGF0aChiYXNlVVJMLCByZXF1ZXN0ZWRVUkwpIHtcbiAgaWYgKGJhc2VVUkwgJiYgIWlzQWJzb2x1dGVVUkwocmVxdWVzdGVkVVJMKSkge1xuICAgIHJldHVybiBjb21iaW5lVVJMcyhiYXNlVVJMLCByZXF1ZXN0ZWRVUkwpO1xuICB9XG4gIHJldHVybiByZXF1ZXN0ZWRVUkw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZW5oYW5jZUVycm9yID0gcmVxdWlyZSgnLi9lbmhhbmNlRXJyb3InKTtcblxuLyoqXG4gKiBDcmVhdGUgYW4gRXJyb3Igd2l0aCB0aGUgc3BlY2lmaWVkIG1lc3NhZ2UsIGNvbmZpZywgZXJyb3IgY29kZSwgcmVxdWVzdCBhbmQgcmVzcG9uc2UuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgVGhlIGVycm9yIG1lc3NhZ2UuXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIFRoZSBjb25maWcuXG4gKiBAcGFyYW0ge3N0cmluZ30gW2NvZGVdIFRoZSBlcnJvciBjb2RlIChmb3IgZXhhbXBsZSwgJ0VDT05OQUJPUlRFRCcpLlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXF1ZXN0XSBUaGUgcmVxdWVzdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVzcG9uc2VdIFRoZSByZXNwb25zZS5cbiAqIEByZXR1cm5zIHtFcnJvcn0gVGhlIGNyZWF0ZWQgZXJyb3IuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3JlYXRlRXJyb3IobWVzc2FnZSwgY29uZmlnLCBjb2RlLCByZXF1ZXN0LCByZXNwb25zZSkge1xuICB2YXIgZXJyb3IgPSBuZXcgRXJyb3IobWVzc2FnZSk7XG4gIHJldHVybiBlbmhhbmNlRXJyb3IoZXJyb3IsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIHRyYW5zZm9ybURhdGEgPSByZXF1aXJlKCcuL3RyYW5zZm9ybURhdGEnKTtcbnZhciBpc0NhbmNlbCA9IHJlcXVpcmUoJy4uL2NhbmNlbC9pc0NhbmNlbCcpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi4vZGVmYXVsdHMnKTtcbnZhciBDYW5jZWwgPSByZXF1aXJlKCcuLi9jYW5jZWwvQ2FuY2VsJyk7XG5cbi8qKlxuICogVGhyb3dzIGEgYENhbmNlbGAgaWYgY2FuY2VsbGF0aW9uIGhhcyBiZWVuIHJlcXVlc3RlZC5cbiAqL1xuZnVuY3Rpb24gdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpIHtcbiAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbikge1xuICAgIGNvbmZpZy5jYW5jZWxUb2tlbi50aHJvd0lmUmVxdWVzdGVkKCk7XG4gIH1cblxuICBpZiAoY29uZmlnLnNpZ25hbCAmJiBjb25maWcuc2lnbmFsLmFib3J0ZWQpIHtcbiAgICB0aHJvdyBuZXcgQ2FuY2VsKCdjYW5jZWxlZCcpO1xuICB9XG59XG5cbi8qKlxuICogRGlzcGF0Y2ggYSByZXF1ZXN0IHRvIHRoZSBzZXJ2ZXIgdXNpbmcgdGhlIGNvbmZpZ3VyZWQgYWRhcHRlci5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gY29uZmlnIFRoZSBjb25maWcgdGhhdCBpcyB0byBiZSB1c2VkIGZvciB0aGUgcmVxdWVzdFxuICogQHJldHVybnMge1Byb21pc2V9IFRoZSBQcm9taXNlIHRvIGJlIGZ1bGZpbGxlZFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRpc3BhdGNoUmVxdWVzdChjb25maWcpIHtcbiAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gIC8vIEVuc3VyZSBoZWFkZXJzIGV4aXN0XG4gIGNvbmZpZy5oZWFkZXJzID0gY29uZmlnLmhlYWRlcnMgfHwge307XG5cbiAgLy8gVHJhbnNmb3JtIHJlcXVlc3QgZGF0YVxuICBjb25maWcuZGF0YSA9IHRyYW5zZm9ybURhdGEuY2FsbChcbiAgICBjb25maWcsXG4gICAgY29uZmlnLmRhdGEsXG4gICAgY29uZmlnLmhlYWRlcnMsXG4gICAgY29uZmlnLnRyYW5zZm9ybVJlcXVlc3RcbiAgKTtcblxuICAvLyBGbGF0dGVuIGhlYWRlcnNcbiAgY29uZmlnLmhlYWRlcnMgPSB1dGlscy5tZXJnZShcbiAgICBjb25maWcuaGVhZGVycy5jb21tb24gfHwge30sXG4gICAgY29uZmlnLmhlYWRlcnNbY29uZmlnLm1ldGhvZF0gfHwge30sXG4gICAgY29uZmlnLmhlYWRlcnNcbiAgKTtcblxuICB1dGlscy5mb3JFYWNoKFxuICAgIFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJywgJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJywgJ2NvbW1vbiddLFxuICAgIGZ1bmN0aW9uIGNsZWFuSGVhZGVyQ29uZmlnKG1ldGhvZCkge1xuICAgICAgZGVsZXRlIGNvbmZpZy5oZWFkZXJzW21ldGhvZF07XG4gICAgfVxuICApO1xuXG4gIHZhciBhZGFwdGVyID0gY29uZmlnLmFkYXB0ZXIgfHwgZGVmYXVsdHMuYWRhcHRlcjtcblxuICByZXR1cm4gYWRhcHRlcihjb25maWcpLnRoZW4oZnVuY3Rpb24gb25BZGFwdGVyUmVzb2x1dGlvbihyZXNwb25zZSkge1xuICAgIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAgIC8vIFRyYW5zZm9ybSByZXNwb25zZSBkYXRhXG4gICAgcmVzcG9uc2UuZGF0YSA9IHRyYW5zZm9ybURhdGEuY2FsbChcbiAgICAgIGNvbmZpZyxcbiAgICAgIHJlc3BvbnNlLmRhdGEsXG4gICAgICByZXNwb25zZS5oZWFkZXJzLFxuICAgICAgY29uZmlnLnRyYW5zZm9ybVJlc3BvbnNlXG4gICAgKTtcblxuICAgIHJldHVybiByZXNwb25zZTtcbiAgfSwgZnVuY3Rpb24gb25BZGFwdGVyUmVqZWN0aW9uKHJlYXNvbikge1xuICAgIGlmICghaXNDYW5jZWwocmVhc29uKSkge1xuICAgICAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gICAgICAvLyBUcmFuc2Zvcm0gcmVzcG9uc2UgZGF0YVxuICAgICAgaWYgKHJlYXNvbiAmJiByZWFzb24ucmVzcG9uc2UpIHtcbiAgICAgICAgcmVhc29uLnJlc3BvbnNlLmRhdGEgPSB0cmFuc2Zvcm1EYXRhLmNhbGwoXG4gICAgICAgICAgY29uZmlnLFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5kYXRhLFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5oZWFkZXJzLFxuICAgICAgICAgIGNvbmZpZy50cmFuc2Zvcm1SZXNwb25zZVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChyZWFzb24pO1xuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVXBkYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBjb25maWcsIGVycm9yIGNvZGUsIGFuZCByZXNwb25zZS5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJvciBUaGUgZXJyb3IgdG8gdXBkYXRlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdF0gVGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBlcnJvci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBlbmhhbmNlRXJyb3IoZXJyb3IsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgZXJyb3IuY29uZmlnID0gY29uZmlnO1xuICBpZiAoY29kZSkge1xuICAgIGVycm9yLmNvZGUgPSBjb2RlO1xuICB9XG5cbiAgZXJyb3IucmVxdWVzdCA9IHJlcXVlc3Q7XG4gIGVycm9yLnJlc3BvbnNlID0gcmVzcG9uc2U7XG4gIGVycm9yLmlzQXhpb3NFcnJvciA9IHRydWU7XG5cbiAgZXJyb3IudG9KU09OID0gZnVuY3Rpb24gdG9KU09OKCkge1xuICAgIHJldHVybiB7XG4gICAgICAvLyBTdGFuZGFyZFxuICAgICAgbWVzc2FnZTogdGhpcy5tZXNzYWdlLFxuICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgLy8gTWljcm9zb2Z0XG4gICAgICBkZXNjcmlwdGlvbjogdGhpcy5kZXNjcmlwdGlvbixcbiAgICAgIG51bWJlcjogdGhpcy5udW1iZXIsXG4gICAgICAvLyBNb3ppbGxhXG4gICAgICBmaWxlTmFtZTogdGhpcy5maWxlTmFtZSxcbiAgICAgIGxpbmVOdW1iZXI6IHRoaXMubGluZU51bWJlcixcbiAgICAgIGNvbHVtbk51bWJlcjogdGhpcy5jb2x1bW5OdW1iZXIsXG4gICAgICBzdGFjazogdGhpcy5zdGFjayxcbiAgICAgIC8vIEF4aW9zXG4gICAgICBjb25maWc6IHRoaXMuY29uZmlnLFxuICAgICAgY29kZTogdGhpcy5jb2RlLFxuICAgICAgc3RhdHVzOiB0aGlzLnJlc3BvbnNlICYmIHRoaXMucmVzcG9uc2Uuc3RhdHVzID8gdGhpcy5yZXNwb25zZS5zdGF0dXMgOiBudWxsXG4gICAgfTtcbiAgfTtcbiAgcmV0dXJuIGVycm9yO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxuLyoqXG4gKiBDb25maWctc3BlY2lmaWMgbWVyZ2UtZnVuY3Rpb24gd2hpY2ggY3JlYXRlcyBhIG5ldyBjb25maWctb2JqZWN0XG4gKiBieSBtZXJnaW5nIHR3byBjb25maWd1cmF0aW9uIG9iamVjdHMgdG9nZXRoZXIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZzFcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcyXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBOZXcgb2JqZWN0IHJlc3VsdGluZyBmcm9tIG1lcmdpbmcgY29uZmlnMiB0byBjb25maWcxXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbWVyZ2VDb25maWcoY29uZmlnMSwgY29uZmlnMikge1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgY29uZmlnMiA9IGNvbmZpZzIgfHwge307XG4gIHZhciBjb25maWcgPSB7fTtcblxuICBmdW5jdGlvbiBnZXRNZXJnZWRWYWx1ZSh0YXJnZXQsIHNvdXJjZSkge1xuICAgIGlmICh1dGlscy5pc1BsYWluT2JqZWN0KHRhcmdldCkgJiYgdXRpbHMuaXNQbGFpbk9iamVjdChzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gdXRpbHMubWVyZ2UodGFyZ2V0LCBzb3VyY2UpO1xuICAgIH0gZWxzZSBpZiAodXRpbHMuaXNQbGFpbk9iamVjdChzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gdXRpbHMubWVyZ2Uoe30sIHNvdXJjZSk7XG4gICAgfSBlbHNlIGlmICh1dGlscy5pc0FycmF5KHNvdXJjZSkpIHtcbiAgICAgIHJldHVybiBzb3VyY2Uuc2xpY2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIHNvdXJjZTtcbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjb25zaXN0ZW50LXJldHVyblxuICBmdW5jdGlvbiBtZXJnZURlZXBQcm9wZXJ0aWVzKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICByZXR1cm4gZ2V0TWVyZ2VkVmFsdWUoY29uZmlnMVtwcm9wXSwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMVtwcm9wXSkpIHtcbiAgICAgIHJldHVybiBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjb25zaXN0ZW50LXJldHVyblxuICBmdW5jdGlvbiB2YWx1ZUZyb21Db25maWcyKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICByZXR1cm4gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcyW3Byb3BdKTtcbiAgICB9XG4gIH1cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY29uc2lzdGVudC1yZXR1cm5cbiAgZnVuY3Rpb24gZGVmYXVsdFRvQ29uZmlnMihwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgcmV0dXJuIGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMVtwcm9wXSkpIHtcbiAgICAgIHJldHVybiBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjb25zaXN0ZW50LXJldHVyblxuICBmdW5jdGlvbiBtZXJnZURpcmVjdEtleXMocHJvcCkge1xuICAgIGlmIChwcm9wIGluIGNvbmZpZzIpIHtcbiAgICAgIHJldHVybiBnZXRNZXJnZWRWYWx1ZShjb25maWcxW3Byb3BdLCBjb25maWcyW3Byb3BdKTtcbiAgICB9IGVsc2UgaWYgKHByb3AgaW4gY29uZmlnMSkge1xuICAgICAgcmV0dXJuIGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMVtwcm9wXSk7XG4gICAgfVxuICB9XG5cbiAgdmFyIG1lcmdlTWFwID0ge1xuICAgICd1cmwnOiB2YWx1ZUZyb21Db25maWcyLFxuICAgICdtZXRob2QnOiB2YWx1ZUZyb21Db25maWcyLFxuICAgICdkYXRhJzogdmFsdWVGcm9tQ29uZmlnMixcbiAgICAnYmFzZVVSTCc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3RyYW5zZm9ybVJlcXVlc3QnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd0cmFuc2Zvcm1SZXNwb25zZSc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3BhcmFtc1NlcmlhbGl6ZXInOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd0aW1lb3V0JzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAndGltZW91dE1lc3NhZ2UnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd3aXRoQ3JlZGVudGlhbHMnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdhZGFwdGVyJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAncmVzcG9uc2VUeXBlJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAneHNyZkNvb2tpZU5hbWUnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd4c3JmSGVhZGVyTmFtZSc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ29uVXBsb2FkUHJvZ3Jlc3MnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdvbkRvd25sb2FkUHJvZ3Jlc3MnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdkZWNvbXByZXNzJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnbWF4Q29udGVudExlbmd0aCc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ21heEJvZHlMZW5ndGgnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd0cmFuc3BvcnQnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdodHRwQWdlbnQnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdodHRwc0FnZW50JzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnY2FuY2VsVG9rZW4nOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdzb2NrZXRQYXRoJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAncmVzcG9uc2VFbmNvZGluZyc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3ZhbGlkYXRlU3RhdHVzJzogbWVyZ2VEaXJlY3RLZXlzXG4gIH07XG5cbiAgdXRpbHMuZm9yRWFjaChPYmplY3Qua2V5cyhjb25maWcxKS5jb25jYXQoT2JqZWN0LmtleXMoY29uZmlnMikpLCBmdW5jdGlvbiBjb21wdXRlQ29uZmlnVmFsdWUocHJvcCkge1xuICAgIHZhciBtZXJnZSA9IG1lcmdlTWFwW3Byb3BdIHx8IG1lcmdlRGVlcFByb3BlcnRpZXM7XG4gICAgdmFyIGNvbmZpZ1ZhbHVlID0gbWVyZ2UocHJvcCk7XG4gICAgKHV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZ1ZhbHVlKSAmJiBtZXJnZSAhPT0gbWVyZ2VEaXJlY3RLZXlzKSB8fCAoY29uZmlnW3Byb3BdID0gY29uZmlnVmFsdWUpO1xuICB9KTtcblxuICByZXR1cm4gY29uZmlnO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNyZWF0ZUVycm9yID0gcmVxdWlyZSgnLi9jcmVhdGVFcnJvcicpO1xuXG4vKipcbiAqIFJlc29sdmUgb3IgcmVqZWN0IGEgUHJvbWlzZSBiYXNlZCBvbiByZXNwb25zZSBzdGF0dXMuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVzb2x2ZSBBIGZ1bmN0aW9uIHRoYXQgcmVzb2x2ZXMgdGhlIHByb21pc2UuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZWplY3QgQSBmdW5jdGlvbiB0aGF0IHJlamVjdHMgdGhlIHByb21pc2UuXG4gKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgVGhlIHJlc3BvbnNlLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHJlc3BvbnNlKSB7XG4gIHZhciB2YWxpZGF0ZVN0YXR1cyA9IHJlc3BvbnNlLmNvbmZpZy52YWxpZGF0ZVN0YXR1cztcbiAgaWYgKCFyZXNwb25zZS5zdGF0dXMgfHwgIXZhbGlkYXRlU3RhdHVzIHx8IHZhbGlkYXRlU3RhdHVzKHJlc3BvbnNlLnN0YXR1cykpIHtcbiAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgfSBlbHNlIHtcbiAgICByZWplY3QoY3JlYXRlRXJyb3IoXG4gICAgICAnUmVxdWVzdCBmYWlsZWQgd2l0aCBzdGF0dXMgY29kZSAnICsgcmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgcmVzcG9uc2UuY29uZmlnLFxuICAgICAgbnVsbCxcbiAgICAgIHJlc3BvbnNlLnJlcXVlc3QsXG4gICAgICByZXNwb25zZVxuICAgICkpO1xuICB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuLy4uL2RlZmF1bHRzJyk7XG5cbi8qKlxuICogVHJhbnNmb3JtIHRoZSBkYXRhIGZvciBhIHJlcXVlc3Qgb3IgYSByZXNwb25zZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gZGF0YSBUaGUgZGF0YSB0byBiZSB0cmFuc2Zvcm1lZFxuICogQHBhcmFtIHtBcnJheX0gaGVhZGVycyBUaGUgaGVhZGVycyBmb3IgdGhlIHJlcXVlc3Qgb3IgcmVzcG9uc2VcbiAqIEBwYXJhbSB7QXJyYXl8RnVuY3Rpb259IGZucyBBIHNpbmdsZSBmdW5jdGlvbiBvciBBcnJheSBvZiBmdW5jdGlvbnNcbiAqIEByZXR1cm5zIHsqfSBUaGUgcmVzdWx0aW5nIHRyYW5zZm9ybWVkIGRhdGFcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0cmFuc2Zvcm1EYXRhKGRhdGEsIGhlYWRlcnMsIGZucykge1xuICB2YXIgY29udGV4dCA9IHRoaXMgfHwgZGVmYXVsdHM7XG4gIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICB1dGlscy5mb3JFYWNoKGZucywgZnVuY3Rpb24gdHJhbnNmb3JtKGZuKSB7XG4gICAgZGF0YSA9IGZuLmNhbGwoY29udGV4dCwgZGF0YSwgaGVhZGVycyk7XG4gIH0pO1xuXG4gIHJldHVybiBkYXRhO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xudmFyIG5vcm1hbGl6ZUhlYWRlck5hbWUgPSByZXF1aXJlKCcuL2hlbHBlcnMvbm9ybWFsaXplSGVhZGVyTmFtZScpO1xudmFyIGVuaGFuY2VFcnJvciA9IHJlcXVpcmUoJy4vY29yZS9lbmhhbmNlRXJyb3InKTtcblxudmFyIERFRkFVTFRfQ09OVEVOVF9UWVBFID0ge1xuICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCdcbn07XG5cbmZ1bmN0aW9uIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCB2YWx1ZSkge1xuICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGhlYWRlcnMpICYmIHV0aWxzLmlzVW5kZWZpbmVkKGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddKSkge1xuICAgIGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddID0gdmFsdWU7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0RGVmYXVsdEFkYXB0ZXIoKSB7XG4gIHZhciBhZGFwdGVyO1xuICBpZiAodHlwZW9mIFhNTEh0dHBSZXF1ZXN0ICE9PSAndW5kZWZpbmVkJykge1xuICAgIC8vIEZvciBicm93c2VycyB1c2UgWEhSIGFkYXB0ZXJcbiAgICBhZGFwdGVyID0gcmVxdWlyZSgnLi9hZGFwdGVycy94aHInKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHByb2Nlc3MpID09PSAnW29iamVjdCBwcm9jZXNzXScpIHtcbiAgICAvLyBGb3Igbm9kZSB1c2UgSFRUUCBhZGFwdGVyXG4gICAgYWRhcHRlciA9IHJlcXVpcmUoJy4vYWRhcHRlcnMvaHR0cCcpO1xuICB9XG4gIHJldHVybiBhZGFwdGVyO1xufVxuXG5mdW5jdGlvbiBzdHJpbmdpZnlTYWZlbHkocmF3VmFsdWUsIHBhcnNlciwgZW5jb2Rlcikge1xuICBpZiAodXRpbHMuaXNTdHJpbmcocmF3VmFsdWUpKSB7XG4gICAgdHJ5IHtcbiAgICAgIChwYXJzZXIgfHwgSlNPTi5wYXJzZSkocmF3VmFsdWUpO1xuICAgICAgcmV0dXJuIHV0aWxzLnRyaW0ocmF3VmFsdWUpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChlLm5hbWUgIT09ICdTeW50YXhFcnJvcicpIHtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gKGVuY29kZXIgfHwgSlNPTi5zdHJpbmdpZnkpKHJhd1ZhbHVlKTtcbn1cblxudmFyIGRlZmF1bHRzID0ge1xuXG4gIHRyYW5zaXRpb25hbDoge1xuICAgIHNpbGVudEpTT05QYXJzaW5nOiB0cnVlLFxuICAgIGZvcmNlZEpTT05QYXJzaW5nOiB0cnVlLFxuICAgIGNsYXJpZnlUaW1lb3V0RXJyb3I6IGZhbHNlXG4gIH0sXG5cbiAgYWRhcHRlcjogZ2V0RGVmYXVsdEFkYXB0ZXIoKSxcblxuICB0cmFuc2Zvcm1SZXF1ZXN0OiBbZnVuY3Rpb24gdHJhbnNmb3JtUmVxdWVzdChkYXRhLCBoZWFkZXJzKSB7XG4gICAgbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCAnQWNjZXB0Jyk7XG4gICAgbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCAnQ29udGVudC1UeXBlJyk7XG5cbiAgICBpZiAodXRpbHMuaXNGb3JtRGF0YShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNBcnJheUJ1ZmZlcihkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNCdWZmZXIoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzU3RyZWFtKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0ZpbGUoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQmxvYihkYXRhKVxuICAgICkge1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc0FycmF5QnVmZmVyVmlldyhkYXRhKSkge1xuICAgICAgcmV0dXJuIGRhdGEuYnVmZmVyO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNVUkxTZWFyY2hQYXJhbXMoZGF0YSkpIHtcbiAgICAgIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkO2NoYXJzZXQ9dXRmLTgnKTtcbiAgICAgIHJldHVybiBkYXRhLnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc09iamVjdChkYXRhKSB8fCAoaGVhZGVycyAmJiBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9PT0gJ2FwcGxpY2F0aW9uL2pzb24nKSkge1xuICAgICAgc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICByZXR1cm4gc3RyaW5naWZ5U2FmZWx5KGRhdGEpO1xuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfV0sXG5cbiAgdHJhbnNmb3JtUmVzcG9uc2U6IFtmdW5jdGlvbiB0cmFuc2Zvcm1SZXNwb25zZShkYXRhKSB7XG4gICAgdmFyIHRyYW5zaXRpb25hbCA9IHRoaXMudHJhbnNpdGlvbmFsIHx8IGRlZmF1bHRzLnRyYW5zaXRpb25hbDtcbiAgICB2YXIgc2lsZW50SlNPTlBhcnNpbmcgPSB0cmFuc2l0aW9uYWwgJiYgdHJhbnNpdGlvbmFsLnNpbGVudEpTT05QYXJzaW5nO1xuICAgIHZhciBmb3JjZWRKU09OUGFyc2luZyA9IHRyYW5zaXRpb25hbCAmJiB0cmFuc2l0aW9uYWwuZm9yY2VkSlNPTlBhcnNpbmc7XG4gICAgdmFyIHN0cmljdEpTT05QYXJzaW5nID0gIXNpbGVudEpTT05QYXJzaW5nICYmIHRoaXMucmVzcG9uc2VUeXBlID09PSAnanNvbic7XG5cbiAgICBpZiAoc3RyaWN0SlNPTlBhcnNpbmcgfHwgKGZvcmNlZEpTT05QYXJzaW5nICYmIHV0aWxzLmlzU3RyaW5nKGRhdGEpICYmIGRhdGEubGVuZ3RoKSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmIChzdHJpY3RKU09OUGFyc2luZykge1xuICAgICAgICAgIGlmIChlLm5hbWUgPT09ICdTeW50YXhFcnJvcicpIHtcbiAgICAgICAgICAgIHRocm93IGVuaGFuY2VFcnJvcihlLCB0aGlzLCAnRV9KU09OX1BBUlNFJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZGF0YTtcbiAgfV0sXG5cbiAgLyoqXG4gICAqIEEgdGltZW91dCBpbiBtaWxsaXNlY29uZHMgdG8gYWJvcnQgYSByZXF1ZXN0LiBJZiBzZXQgdG8gMCAoZGVmYXVsdCkgYVxuICAgKiB0aW1lb3V0IGlzIG5vdCBjcmVhdGVkLlxuICAgKi9cbiAgdGltZW91dDogMCxcblxuICB4c3JmQ29va2llTmFtZTogJ1hTUkYtVE9LRU4nLFxuICB4c3JmSGVhZGVyTmFtZTogJ1gtWFNSRi1UT0tFTicsXG5cbiAgbWF4Q29udGVudExlbmd0aDogLTEsXG4gIG1heEJvZHlMZW5ndGg6IC0xLFxuXG4gIHZhbGlkYXRlU3RhdHVzOiBmdW5jdGlvbiB2YWxpZGF0ZVN0YXR1cyhzdGF0dXMpIHtcbiAgICByZXR1cm4gc3RhdHVzID49IDIwMCAmJiBzdGF0dXMgPCAzMDA7XG4gIH0sXG5cbiAgaGVhZGVyczoge1xuICAgIGNvbW1vbjoge1xuICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uLCB0ZXh0L3BsYWluLCAqLyonXG4gICAgfVxuICB9XG59O1xuXG51dGlscy5mb3JFYWNoKFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2ROb0RhdGEobWV0aG9kKSB7XG4gIGRlZmF1bHRzLmhlYWRlcnNbbWV0aG9kXSA9IHt9O1xufSk7XG5cbnV0aWxzLmZvckVhY2goWydwb3N0JywgJ3B1dCcsICdwYXRjaCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kV2l0aERhdGEobWV0aG9kKSB7XG4gIGRlZmF1bHRzLmhlYWRlcnNbbWV0aG9kXSA9IHV0aWxzLm1lcmdlKERFRkFVTFRfQ09OVEVOVF9UWVBFKTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlZmF1bHRzO1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIFwidmVyc2lvblwiOiBcIjAuMjQuMFwiXG59OyIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBiaW5kKGZuLCB0aGlzQXJnKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwKCkge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgYXJnc1tpXSA9IGFyZ3VtZW50c1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5mdW5jdGlvbiBlbmNvZGUodmFsKSB7XG4gIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQodmFsKS5cbiAgICByZXBsYWNlKC8lM0EvZ2ksICc6JykuXG4gICAgcmVwbGFjZSgvJTI0L2csICckJykuXG4gICAgcmVwbGFjZSgvJTJDL2dpLCAnLCcpLlxuICAgIHJlcGxhY2UoLyUyMC9nLCAnKycpLlxuICAgIHJlcGxhY2UoLyU1Qi9naSwgJ1snKS5cbiAgICByZXBsYWNlKC8lNUQvZ2ksICddJyk7XG59XG5cbi8qKlxuICogQnVpbGQgYSBVUkwgYnkgYXBwZW5kaW5nIHBhcmFtcyB0byB0aGUgZW5kXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybCBUaGUgYmFzZSBvZiB0aGUgdXJsIChlLmcuLCBodHRwOi8vd3d3Lmdvb2dsZS5jb20pXG4gKiBAcGFyYW0ge29iamVjdH0gW3BhcmFtc10gVGhlIHBhcmFtcyB0byBiZSBhcHBlbmRlZFxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGZvcm1hdHRlZCB1cmxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBidWlsZFVSTCh1cmwsIHBhcmFtcywgcGFyYW1zU2VyaWFsaXplcikge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgaWYgKCFwYXJhbXMpIHtcbiAgICByZXR1cm4gdXJsO1xuICB9XG5cbiAgdmFyIHNlcmlhbGl6ZWRQYXJhbXM7XG4gIGlmIChwYXJhbXNTZXJpYWxpemVyKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtc1NlcmlhbGl6ZXIocGFyYW1zKTtcbiAgfSBlbHNlIGlmICh1dGlscy5pc1VSTFNlYXJjaFBhcmFtcyhwYXJhbXMpKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtcy50b1N0cmluZygpO1xuICB9IGVsc2Uge1xuICAgIHZhciBwYXJ0cyA9IFtdO1xuXG4gICAgdXRpbHMuZm9yRWFjaChwYXJhbXMsIGZ1bmN0aW9uIHNlcmlhbGl6ZSh2YWwsIGtleSkge1xuICAgICAgaWYgKHZhbCA9PT0gbnVsbCB8fCB0eXBlb2YgdmFsID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh1dGlscy5pc0FycmF5KHZhbCkpIHtcbiAgICAgICAga2V5ID0ga2V5ICsgJ1tdJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbCA9IFt2YWxdO1xuICAgICAgfVxuXG4gICAgICB1dGlscy5mb3JFYWNoKHZhbCwgZnVuY3Rpb24gcGFyc2VWYWx1ZSh2KSB7XG4gICAgICAgIGlmICh1dGlscy5pc0RhdGUodikpIHtcbiAgICAgICAgICB2ID0gdi50b0lTT1N0cmluZygpO1xuICAgICAgICB9IGVsc2UgaWYgKHV0aWxzLmlzT2JqZWN0KHYpKSB7XG4gICAgICAgICAgdiA9IEpTT04uc3RyaW5naWZ5KHYpO1xuICAgICAgICB9XG4gICAgICAgIHBhcnRzLnB1c2goZW5jb2RlKGtleSkgKyAnPScgKyBlbmNvZGUodikpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFydHMuam9pbignJicpO1xuICB9XG5cbiAgaWYgKHNlcmlhbGl6ZWRQYXJhbXMpIHtcbiAgICB2YXIgaGFzaG1hcmtJbmRleCA9IHVybC5pbmRleE9mKCcjJyk7XG4gICAgaWYgKGhhc2htYXJrSW5kZXggIT09IC0xKSB7XG4gICAgICB1cmwgPSB1cmwuc2xpY2UoMCwgaGFzaG1hcmtJbmRleCk7XG4gICAgfVxuXG4gICAgdXJsICs9ICh1cmwuaW5kZXhPZignPycpID09PSAtMSA/ICc/JyA6ICcmJykgKyBzZXJpYWxpemVkUGFyYW1zO1xuICB9XG5cbiAgcmV0dXJuIHVybDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBVUkwgYnkgY29tYmluaW5nIHRoZSBzcGVjaWZpZWQgVVJMc1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVVJMIFRoZSBiYXNlIFVSTFxuICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aXZlVVJMIFRoZSByZWxhdGl2ZSBVUkxcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBjb21iaW5lZCBVUkxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjb21iaW5lVVJMcyhiYXNlVVJMLCByZWxhdGl2ZVVSTCkge1xuICByZXR1cm4gcmVsYXRpdmVVUkxcbiAgICA/IGJhc2VVUkwucmVwbGFjZSgvXFwvKyQvLCAnJykgKyAnLycgKyByZWxhdGl2ZVVSTC5yZXBsYWNlKC9eXFwvKy8sICcnKVxuICAgIDogYmFzZVVSTDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoXG4gIHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkgP1xuXG4gIC8vIFN0YW5kYXJkIGJyb3dzZXIgZW52cyBzdXBwb3J0IGRvY3VtZW50LmNvb2tpZVxuICAgIChmdW5jdGlvbiBzdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB3cml0ZTogZnVuY3Rpb24gd3JpdGUobmFtZSwgdmFsdWUsIGV4cGlyZXMsIHBhdGgsIGRvbWFpbiwgc2VjdXJlKSB7XG4gICAgICAgICAgdmFyIGNvb2tpZSA9IFtdO1xuICAgICAgICAgIGNvb2tpZS5wdXNoKG5hbWUgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpKTtcblxuICAgICAgICAgIGlmICh1dGlscy5pc051bWJlcihleHBpcmVzKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ2V4cGlyZXM9JyArIG5ldyBEYXRlKGV4cGlyZXMpLnRvR01UU3RyaW5nKCkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh1dGlscy5pc1N0cmluZyhwYXRoKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ3BhdGg9JyArIHBhdGgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh1dGlscy5pc1N0cmluZyhkb21haW4pKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnZG9tYWluPScgKyBkb21haW4pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChzZWN1cmUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdzZWN1cmUnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBkb2N1bWVudC5jb29raWUgPSBjb29raWUuam9pbignOyAnKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZWFkOiBmdW5jdGlvbiByZWFkKG5hbWUpIHtcbiAgICAgICAgICB2YXIgbWF0Y2ggPSBkb2N1bWVudC5jb29raWUubWF0Y2gobmV3IFJlZ0V4cCgnKF58O1xcXFxzKikoJyArIG5hbWUgKyAnKT0oW147XSopJykpO1xuICAgICAgICAgIHJldHVybiAobWF0Y2ggPyBkZWNvZGVVUklDb21wb25lbnQobWF0Y2hbM10pIDogbnVsbCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUobmFtZSkge1xuICAgICAgICAgIHRoaXMud3JpdGUobmFtZSwgJycsIERhdGUubm93KCkgLSA4NjQwMDAwMCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSkoKSA6XG5cbiAgLy8gTm9uIHN0YW5kYXJkIGJyb3dzZXIgZW52ICh3ZWIgd29ya2VycywgcmVhY3QtbmF0aXZlKSBsYWNrIG5lZWRlZCBzdXBwb3J0LlxuICAgIChmdW5jdGlvbiBub25TdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB3cml0ZTogZnVuY3Rpb24gd3JpdGUoKSB7fSxcbiAgICAgICAgcmVhZDogZnVuY3Rpb24gcmVhZCgpIHsgcmV0dXJuIG51bGw7IH0sXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge31cbiAgICAgIH07XG4gICAgfSkoKVxuKTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHNwZWNpZmllZCBVUkwgaXMgYWJzb2x1dGVcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsIFRoZSBVUkwgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHNwZWNpZmllZCBVUkwgaXMgYWJzb2x1dGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQWJzb2x1dGVVUkwodXJsKSB7XG4gIC8vIEEgVVJMIGlzIGNvbnNpZGVyZWQgYWJzb2x1dGUgaWYgaXQgYmVnaW5zIHdpdGggXCI8c2NoZW1lPjovL1wiIG9yIFwiLy9cIiAocHJvdG9jb2wtcmVsYXRpdmUgVVJMKS5cbiAgLy8gUkZDIDM5ODYgZGVmaW5lcyBzY2hlbWUgbmFtZSBhcyBhIHNlcXVlbmNlIG9mIGNoYXJhY3RlcnMgYmVnaW5uaW5nIHdpdGggYSBsZXR0ZXIgYW5kIGZvbGxvd2VkXG4gIC8vIGJ5IGFueSBjb21iaW5hdGlvbiBvZiBsZXR0ZXJzLCBkaWdpdHMsIHBsdXMsIHBlcmlvZCwgb3IgaHlwaGVuLlxuICByZXR1cm4gL14oW2Etel1bYS16XFxkXFwrXFwtXFwuXSo6KT9cXC9cXC8vaS50ZXN0KHVybCk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgcGF5bG9hZCBpcyBhbiBlcnJvciB0aHJvd24gYnkgQXhpb3NcbiAqXG4gKiBAcGFyYW0geyp9IHBheWxvYWQgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBwYXlsb2FkIGlzIGFuIGVycm9yIHRocm93biBieSBBeGlvcywgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNBeGlvc0Vycm9yKHBheWxvYWQpIHtcbiAgcmV0dXJuICh0eXBlb2YgcGF5bG9hZCA9PT0gJ29iamVjdCcpICYmIChwYXlsb2FkLmlzQXhpb3NFcnJvciA9PT0gdHJ1ZSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKFxuICB1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpID9cblxuICAvLyBTdGFuZGFyZCBicm93c2VyIGVudnMgaGF2ZSBmdWxsIHN1cHBvcnQgb2YgdGhlIEFQSXMgbmVlZGVkIHRvIHRlc3RcbiAgLy8gd2hldGhlciB0aGUgcmVxdWVzdCBVUkwgaXMgb2YgdGhlIHNhbWUgb3JpZ2luIGFzIGN1cnJlbnQgbG9jYXRpb24uXG4gICAgKGZ1bmN0aW9uIHN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHZhciBtc2llID0gLyhtc2llfHRyaWRlbnQpL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcbiAgICAgIHZhciB1cmxQYXJzaW5nTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgIHZhciBvcmlnaW5VUkw7XG5cbiAgICAgIC8qKlxuICAgICogUGFyc2UgYSBVUkwgdG8gZGlzY292ZXIgaXQncyBjb21wb25lbnRzXG4gICAgKlxuICAgICogQHBhcmFtIHtTdHJpbmd9IHVybCBUaGUgVVJMIHRvIGJlIHBhcnNlZFxuICAgICogQHJldHVybnMge09iamVjdH1cbiAgICAqL1xuICAgICAgZnVuY3Rpb24gcmVzb2x2ZVVSTCh1cmwpIHtcbiAgICAgICAgdmFyIGhyZWYgPSB1cmw7XG5cbiAgICAgICAgaWYgKG1zaWUpIHtcbiAgICAgICAgLy8gSUUgbmVlZHMgYXR0cmlidXRlIHNldCB0d2ljZSB0byBub3JtYWxpemUgcHJvcGVydGllc1xuICAgICAgICAgIHVybFBhcnNpbmdOb2RlLnNldEF0dHJpYnV0ZSgnaHJlZicsIGhyZWYpO1xuICAgICAgICAgIGhyZWYgPSB1cmxQYXJzaW5nTm9kZS5ocmVmO1xuICAgICAgICB9XG5cbiAgICAgICAgdXJsUGFyc2luZ05vZGUuc2V0QXR0cmlidXRlKCdocmVmJywgaHJlZik7XG5cbiAgICAgICAgLy8gdXJsUGFyc2luZ05vZGUgcHJvdmlkZXMgdGhlIFVybFV0aWxzIGludGVyZmFjZSAtIGh0dHA6Ly91cmwuc3BlYy53aGF0d2cub3JnLyN1cmx1dGlsc1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGhyZWY6IHVybFBhcnNpbmdOb2RlLmhyZWYsXG4gICAgICAgICAgcHJvdG9jb2w6IHVybFBhcnNpbmdOb2RlLnByb3RvY29sID8gdXJsUGFyc2luZ05vZGUucHJvdG9jb2wucmVwbGFjZSgvOiQvLCAnJykgOiAnJyxcbiAgICAgICAgICBob3N0OiB1cmxQYXJzaW5nTm9kZS5ob3N0LFxuICAgICAgICAgIHNlYXJjaDogdXJsUGFyc2luZ05vZGUuc2VhcmNoID8gdXJsUGFyc2luZ05vZGUuc2VhcmNoLnJlcGxhY2UoL15cXD8vLCAnJykgOiAnJyxcbiAgICAgICAgICBoYXNoOiB1cmxQYXJzaW5nTm9kZS5oYXNoID8gdXJsUGFyc2luZ05vZGUuaGFzaC5yZXBsYWNlKC9eIy8sICcnKSA6ICcnLFxuICAgICAgICAgIGhvc3RuYW1lOiB1cmxQYXJzaW5nTm9kZS5ob3N0bmFtZSxcbiAgICAgICAgICBwb3J0OiB1cmxQYXJzaW5nTm9kZS5wb3J0LFxuICAgICAgICAgIHBhdGhuYW1lOiAodXJsUGFyc2luZ05vZGUucGF0aG5hbWUuY2hhckF0KDApID09PSAnLycpID9cbiAgICAgICAgICAgIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lIDpcbiAgICAgICAgICAgICcvJyArIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIG9yaWdpblVSTCA9IHJlc29sdmVVUkwod2luZG93LmxvY2F0aW9uLmhyZWYpO1xuXG4gICAgICAvKipcbiAgICAqIERldGVybWluZSBpZiBhIFVSTCBzaGFyZXMgdGhlIHNhbWUgb3JpZ2luIGFzIHRoZSBjdXJyZW50IGxvY2F0aW9uXG4gICAgKlxuICAgICogQHBhcmFtIHtTdHJpbmd9IHJlcXVlc3RVUkwgVGhlIFVSTCB0byB0ZXN0XG4gICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiBVUkwgc2hhcmVzIHRoZSBzYW1lIG9yaWdpbiwgb3RoZXJ3aXNlIGZhbHNlXG4gICAgKi9cbiAgICAgIHJldHVybiBmdW5jdGlvbiBpc1VSTFNhbWVPcmlnaW4ocmVxdWVzdFVSTCkge1xuICAgICAgICB2YXIgcGFyc2VkID0gKHV0aWxzLmlzU3RyaW5nKHJlcXVlc3RVUkwpKSA/IHJlc29sdmVVUkwocmVxdWVzdFVSTCkgOiByZXF1ZXN0VVJMO1xuICAgICAgICByZXR1cm4gKHBhcnNlZC5wcm90b2NvbCA9PT0gb3JpZ2luVVJMLnByb3RvY29sICYmXG4gICAgICAgICAgICBwYXJzZWQuaG9zdCA9PT0gb3JpZ2luVVJMLmhvc3QpO1xuICAgICAgfTtcbiAgICB9KSgpIDpcblxuICAvLyBOb24gc3RhbmRhcmQgYnJvd3NlciBlbnZzICh3ZWIgd29ya2VycywgcmVhY3QtbmF0aXZlKSBsYWNrIG5lZWRlZCBzdXBwb3J0LlxuICAgIChmdW5jdGlvbiBub25TdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gaXNVUkxTYW1lT3JpZ2luKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH07XG4gICAgfSkoKVxuKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsIG5vcm1hbGl6ZWROYW1lKSB7XG4gIHV0aWxzLmZvckVhY2goaGVhZGVycywgZnVuY3Rpb24gcHJvY2Vzc0hlYWRlcih2YWx1ZSwgbmFtZSkge1xuICAgIGlmIChuYW1lICE9PSBub3JtYWxpemVkTmFtZSAmJiBuYW1lLnRvVXBwZXJDYXNlKCkgPT09IG5vcm1hbGl6ZWROYW1lLnRvVXBwZXJDYXNlKCkpIHtcbiAgICAgIGhlYWRlcnNbbm9ybWFsaXplZE5hbWVdID0gdmFsdWU7XG4gICAgICBkZWxldGUgaGVhZGVyc1tuYW1lXTtcbiAgICB9XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG4vLyBIZWFkZXJzIHdob3NlIGR1cGxpY2F0ZXMgYXJlIGlnbm9yZWQgYnkgbm9kZVxuLy8gYy5mLiBodHRwczovL25vZGVqcy5vcmcvYXBpL2h0dHAuaHRtbCNodHRwX21lc3NhZ2VfaGVhZGVyc1xudmFyIGlnbm9yZUR1cGxpY2F0ZU9mID0gW1xuICAnYWdlJywgJ2F1dGhvcml6YXRpb24nLCAnY29udGVudC1sZW5ndGgnLCAnY29udGVudC10eXBlJywgJ2V0YWcnLFxuICAnZXhwaXJlcycsICdmcm9tJywgJ2hvc3QnLCAnaWYtbW9kaWZpZWQtc2luY2UnLCAnaWYtdW5tb2RpZmllZC1zaW5jZScsXG4gICdsYXN0LW1vZGlmaWVkJywgJ2xvY2F0aW9uJywgJ21heC1mb3J3YXJkcycsICdwcm94eS1hdXRob3JpemF0aW9uJyxcbiAgJ3JlZmVyZXInLCAncmV0cnktYWZ0ZXInLCAndXNlci1hZ2VudCdcbl07XG5cbi8qKlxuICogUGFyc2UgaGVhZGVycyBpbnRvIGFuIG9iamVjdFxuICpcbiAqIGBgYFxuICogRGF0ZTogV2VkLCAyNyBBdWcgMjAxNCAwODo1ODo0OSBHTVRcbiAqIENvbnRlbnQtVHlwZTogYXBwbGljYXRpb24vanNvblxuICogQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVxuICogVHJhbnNmZXItRW5jb2Rpbmc6IGNodW5rZWRcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBoZWFkZXJzIEhlYWRlcnMgbmVlZGluZyB0byBiZSBwYXJzZWRcbiAqIEByZXR1cm5zIHtPYmplY3R9IEhlYWRlcnMgcGFyc2VkIGludG8gYW4gb2JqZWN0XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcGFyc2VIZWFkZXJzKGhlYWRlcnMpIHtcbiAgdmFyIHBhcnNlZCA9IHt9O1xuICB2YXIga2V5O1xuICB2YXIgdmFsO1xuICB2YXIgaTtcblxuICBpZiAoIWhlYWRlcnMpIHsgcmV0dXJuIHBhcnNlZDsgfVxuXG4gIHV0aWxzLmZvckVhY2goaGVhZGVycy5zcGxpdCgnXFxuJyksIGZ1bmN0aW9uIHBhcnNlcihsaW5lKSB7XG4gICAgaSA9IGxpbmUuaW5kZXhPZignOicpO1xuICAgIGtleSA9IHV0aWxzLnRyaW0obGluZS5zdWJzdHIoMCwgaSkpLnRvTG93ZXJDYXNlKCk7XG4gICAgdmFsID0gdXRpbHMudHJpbShsaW5lLnN1YnN0cihpICsgMSkpO1xuXG4gICAgaWYgKGtleSkge1xuICAgICAgaWYgKHBhcnNlZFtrZXldICYmIGlnbm9yZUR1cGxpY2F0ZU9mLmluZGV4T2Yoa2V5KSA+PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChrZXkgPT09ICdzZXQtY29va2llJykge1xuICAgICAgICBwYXJzZWRba2V5XSA9IChwYXJzZWRba2V5XSA/IHBhcnNlZFtrZXldIDogW10pLmNvbmNhdChbdmFsXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYXJzZWRba2V5XSA9IHBhcnNlZFtrZXldID8gcGFyc2VkW2tleV0gKyAnLCAnICsgdmFsIDogdmFsO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHBhcnNlZDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogU3ludGFjdGljIHN1Z2FyIGZvciBpbnZva2luZyBhIGZ1bmN0aW9uIGFuZCBleHBhbmRpbmcgYW4gYXJyYXkgZm9yIGFyZ3VtZW50cy5cbiAqXG4gKiBDb21tb24gdXNlIGNhc2Ugd291bGQgYmUgdG8gdXNlIGBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHlgLlxuICpcbiAqICBgYGBqc1xuICogIGZ1bmN0aW9uIGYoeCwgeSwgeikge31cbiAqICB2YXIgYXJncyA9IFsxLCAyLCAzXTtcbiAqICBmLmFwcGx5KG51bGwsIGFyZ3MpO1xuICogIGBgYFxuICpcbiAqIFdpdGggYHNwcmVhZGAgdGhpcyBleGFtcGxlIGNhbiBiZSByZS13cml0dGVuLlxuICpcbiAqICBgYGBqc1xuICogIHNwcmVhZChmdW5jdGlvbih4LCB5LCB6KSB7fSkoWzEsIDIsIDNdKTtcbiAqICBgYGBcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICogQHJldHVybnMge0Z1bmN0aW9ufVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNwcmVhZChjYWxsYmFjaykge1xuICByZXR1cm4gZnVuY3Rpb24gd3JhcChhcnIpIHtcbiAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkobnVsbCwgYXJyKTtcbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBWRVJTSU9OID0gcmVxdWlyZSgnLi4vZW52L2RhdGEnKS52ZXJzaW9uO1xuXG52YXIgdmFsaWRhdG9ycyA9IHt9O1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xuWydvYmplY3QnLCAnYm9vbGVhbicsICdudW1iZXInLCAnZnVuY3Rpb24nLCAnc3RyaW5nJywgJ3N5bWJvbCddLmZvckVhY2goZnVuY3Rpb24odHlwZSwgaSkge1xuICB2YWxpZGF0b3JzW3R5cGVdID0gZnVuY3Rpb24gdmFsaWRhdG9yKHRoaW5nKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB0aGluZyA9PT0gdHlwZSB8fCAnYScgKyAoaSA8IDEgPyAnbiAnIDogJyAnKSArIHR5cGU7XG4gIH07XG59KTtcblxudmFyIGRlcHJlY2F0ZWRXYXJuaW5ncyA9IHt9O1xuXG4vKipcbiAqIFRyYW5zaXRpb25hbCBvcHRpb24gdmFsaWRhdG9yXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufGJvb2xlYW4/fSB2YWxpZGF0b3IgLSBzZXQgdG8gZmFsc2UgaWYgdGhlIHRyYW5zaXRpb25hbCBvcHRpb24gaGFzIGJlZW4gcmVtb3ZlZFxuICogQHBhcmFtIHtzdHJpbmc/fSB2ZXJzaW9uIC0gZGVwcmVjYXRlZCB2ZXJzaW9uIC8gcmVtb3ZlZCBzaW5jZSB2ZXJzaW9uXG4gKiBAcGFyYW0ge3N0cmluZz99IG1lc3NhZ2UgLSBzb21lIG1lc3NhZ2Ugd2l0aCBhZGRpdGlvbmFsIGluZm9cbiAqIEByZXR1cm5zIHtmdW5jdGlvbn1cbiAqL1xudmFsaWRhdG9ycy50cmFuc2l0aW9uYWwgPSBmdW5jdGlvbiB0cmFuc2l0aW9uYWwodmFsaWRhdG9yLCB2ZXJzaW9uLCBtZXNzYWdlKSB7XG4gIGZ1bmN0aW9uIGZvcm1hdE1lc3NhZ2Uob3B0LCBkZXNjKSB7XG4gICAgcmV0dXJuICdbQXhpb3MgdicgKyBWRVJTSU9OICsgJ10gVHJhbnNpdGlvbmFsIG9wdGlvbiBcXCcnICsgb3B0ICsgJ1xcJycgKyBkZXNjICsgKG1lc3NhZ2UgPyAnLiAnICsgbWVzc2FnZSA6ICcnKTtcbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzXG4gIHJldHVybiBmdW5jdGlvbih2YWx1ZSwgb3B0LCBvcHRzKSB7XG4gICAgaWYgKHZhbGlkYXRvciA9PT0gZmFsc2UpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihmb3JtYXRNZXNzYWdlKG9wdCwgJyBoYXMgYmVlbiByZW1vdmVkJyArICh2ZXJzaW9uID8gJyBpbiAnICsgdmVyc2lvbiA6ICcnKSkpO1xuICAgIH1cblxuICAgIGlmICh2ZXJzaW9uICYmICFkZXByZWNhdGVkV2FybmluZ3Nbb3B0XSkge1xuICAgICAgZGVwcmVjYXRlZFdhcm5pbmdzW29wdF0gPSB0cnVlO1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgZm9ybWF0TWVzc2FnZShcbiAgICAgICAgICBvcHQsXG4gICAgICAgICAgJyBoYXMgYmVlbiBkZXByZWNhdGVkIHNpbmNlIHYnICsgdmVyc2lvbiArICcgYW5kIHdpbGwgYmUgcmVtb3ZlZCBpbiB0aGUgbmVhciBmdXR1cmUnXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbGlkYXRvciA/IHZhbGlkYXRvcih2YWx1ZSwgb3B0LCBvcHRzKSA6IHRydWU7XG4gIH07XG59O1xuXG4vKipcbiAqIEFzc2VydCBvYmplY3QncyBwcm9wZXJ0aWVzIHR5cGVcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zXG4gKiBAcGFyYW0ge29iamVjdH0gc2NoZW1hXG4gKiBAcGFyYW0ge2Jvb2xlYW4/fSBhbGxvd1Vua25vd25cbiAqL1xuXG5mdW5jdGlvbiBhc3NlcnRPcHRpb25zKG9wdGlvbnMsIHNjaGVtYSwgYWxsb3dVbmtub3duKSB7XG4gIGlmICh0eXBlb2Ygb3B0aW9ucyAhPT0gJ29iamVjdCcpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvcHRpb25zIG11c3QgYmUgYW4gb2JqZWN0Jyk7XG4gIH1cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvcHRpb25zKTtcbiAgdmFyIGkgPSBrZXlzLmxlbmd0aDtcbiAgd2hpbGUgKGktLSA+IDApIHtcbiAgICB2YXIgb3B0ID0ga2V5c1tpXTtcbiAgICB2YXIgdmFsaWRhdG9yID0gc2NoZW1hW29wdF07XG4gICAgaWYgKHZhbGlkYXRvcikge1xuICAgICAgdmFyIHZhbHVlID0gb3B0aW9uc1tvcHRdO1xuICAgICAgdmFyIHJlc3VsdCA9IHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsaWRhdG9yKHZhbHVlLCBvcHQsIG9wdGlvbnMpO1xuICAgICAgaWYgKHJlc3VsdCAhPT0gdHJ1ZSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvcHRpb24gJyArIG9wdCArICcgbXVzdCBiZSAnICsgcmVzdWx0KTtcbiAgICAgIH1cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBpZiAoYWxsb3dVbmtub3duICE9PSB0cnVlKSB7XG4gICAgICB0aHJvdyBFcnJvcignVW5rbm93biBvcHRpb24gJyArIG9wdCk7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhc3NlcnRPcHRpb25zOiBhc3NlcnRPcHRpb25zLFxuICB2YWxpZGF0b3JzOiB2YWxpZGF0b3JzXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYmluZCA9IHJlcXVpcmUoJy4vaGVscGVycy9iaW5kJyk7XG5cbi8vIHV0aWxzIGlzIGEgbGlicmFyeSBvZiBnZW5lcmljIGhlbHBlciBmdW5jdGlvbnMgbm9uLXNwZWNpZmljIHRvIGF4aW9zXG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gQXJyYXlcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBBcnJheSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXkodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgdW5kZWZpbmVkXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHZhbHVlIGlzIHVuZGVmaW5lZCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3VuZGVmaW5lZCc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQnVmZmVyKHZhbCkge1xuICByZXR1cm4gdmFsICE9PSBudWxsICYmICFpc1VuZGVmaW5lZCh2YWwpICYmIHZhbC5jb25zdHJ1Y3RvciAhPT0gbnVsbCAmJiAhaXNVbmRlZmluZWQodmFsLmNvbnN0cnVjdG9yKVxuICAgICYmIHR5cGVvZiB2YWwuY29uc3RydWN0b3IuaXNCdWZmZXIgPT09ICdmdW5jdGlvbicgJiYgdmFsLmNvbnN0cnVjdG9yLmlzQnVmZmVyKHZhbCk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gQXJyYXlCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBBcnJheUJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXIodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEFycmF5QnVmZmVyXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGb3JtRGF0YVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEZvcm1EYXRhLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGb3JtRGF0YSh2YWwpIHtcbiAgcmV0dXJuICh0eXBlb2YgRm9ybURhdGEgIT09ICd1bmRlZmluZWQnKSAmJiAodmFsIGluc3RhbmNlb2YgRm9ybURhdGEpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXJWaWV3KHZhbCkge1xuICB2YXIgcmVzdWx0O1xuICBpZiAoKHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcpICYmIChBcnJheUJ1ZmZlci5pc1ZpZXcpKSB7XG4gICAgcmVzdWx0ID0gQXJyYXlCdWZmZXIuaXNWaWV3KHZhbCk7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0ID0gKHZhbCkgJiYgKHZhbC5idWZmZXIpICYmICh2YWwuYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBTdHJpbmdcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFN0cmluZywgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3RyaW5nKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3N0cmluZyc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBOdW1iZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIE51bWJlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzTnVtYmVyKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ251bWJlcic7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gT2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gT2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IG51bGwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBwbGFpbiBPYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgcGxhaW4gT2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNQbGFpbk9iamVjdCh2YWwpIHtcbiAgaWYgKHRvU3RyaW5nLmNhbGwodmFsKSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgcHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHZhbCk7XG4gIHJldHVybiBwcm90b3R5cGUgPT09IG51bGwgfHwgcHJvdG90eXBlID09PSBPYmplY3QucHJvdG90eXBlO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRGF0ZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRGF0ZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRGF0ZSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRmlsZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRmlsZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRmlsZSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRmlsZV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgQmxvYlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgQmxvYiwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQmxvYih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQmxvYl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRnVuY3Rpb25cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEZ1bmN0aW9uLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGdW5jdGlvbih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFN0cmVhbVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgU3RyZWFtLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTdHJlYW0odmFsKSB7XG4gIHJldHVybiBpc09iamVjdCh2YWwpICYmIGlzRnVuY3Rpb24odmFsLnBpcGUpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgVVJMU2VhcmNoUGFyYW1zIG9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgVVJMU2VhcmNoUGFyYW1zIG9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzVVJMU2VhcmNoUGFyYW1zKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIFVSTFNlYXJjaFBhcmFtcyAhPT0gJ3VuZGVmaW5lZCcgJiYgdmFsIGluc3RhbmNlb2YgVVJMU2VhcmNoUGFyYW1zO1xufVxuXG4vKipcbiAqIFRyaW0gZXhjZXNzIHdoaXRlc3BhY2Ugb2ZmIHRoZSBiZWdpbm5pbmcgYW5kIGVuZCBvZiBhIHN0cmluZ1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgVGhlIFN0cmluZyB0byB0cmltXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgU3RyaW5nIGZyZWVkIG9mIGV4Y2VzcyB3aGl0ZXNwYWNlXG4gKi9cbmZ1bmN0aW9uIHRyaW0oc3RyKSB7XG4gIHJldHVybiBzdHIudHJpbSA/IHN0ci50cmltKCkgOiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiB3ZSdyZSBydW5uaW5nIGluIGEgc3RhbmRhcmQgYnJvd3NlciBlbnZpcm9ubWVudFxuICpcbiAqIFRoaXMgYWxsb3dzIGF4aW9zIHRvIHJ1biBpbiBhIHdlYiB3b3JrZXIsIGFuZCByZWFjdC1uYXRpdmUuXG4gKiBCb3RoIGVudmlyb25tZW50cyBzdXBwb3J0IFhNTEh0dHBSZXF1ZXN0LCBidXQgbm90IGZ1bGx5IHN0YW5kYXJkIGdsb2JhbHMuXG4gKlxuICogd2ViIHdvcmtlcnM6XG4gKiAgdHlwZW9mIHdpbmRvdyAtPiB1bmRlZmluZWRcbiAqICB0eXBlb2YgZG9jdW1lbnQgLT4gdW5kZWZpbmVkXG4gKlxuICogcmVhY3QtbmF0aXZlOlxuICogIG5hdmlnYXRvci5wcm9kdWN0IC0+ICdSZWFjdE5hdGl2ZSdcbiAqIG5hdGl2ZXNjcmlwdFxuICogIG5hdmlnYXRvci5wcm9kdWN0IC0+ICdOYXRpdmVTY3JpcHQnIG9yICdOUydcbiAqL1xuZnVuY3Rpb24gaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gIGlmICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiAobmF2aWdhdG9yLnByb2R1Y3QgPT09ICdSZWFjdE5hdGl2ZScgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ05hdGl2ZVNjcmlwdCcgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ05TJykpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIChcbiAgICB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJlxuICAgIHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCdcbiAgKTtcbn1cblxuLyoqXG4gKiBJdGVyYXRlIG92ZXIgYW4gQXJyYXkgb3IgYW4gT2JqZWN0IGludm9raW5nIGEgZnVuY3Rpb24gZm9yIGVhY2ggaXRlbS5cbiAqXG4gKiBJZiBgb2JqYCBpcyBhbiBBcnJheSBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBwYXNzaW5nXG4gKiB0aGUgdmFsdWUsIGluZGV4LCBhbmQgY29tcGxldGUgYXJyYXkgZm9yIGVhY2ggaXRlbS5cbiAqXG4gKiBJZiAnb2JqJyBpcyBhbiBPYmplY3QgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgcGFzc2luZ1xuICogdGhlIHZhbHVlLCBrZXksIGFuZCBjb21wbGV0ZSBvYmplY3QgZm9yIGVhY2ggcHJvcGVydHkuXG4gKlxuICogQHBhcmFtIHtPYmplY3R8QXJyYXl9IG9iaiBUaGUgb2JqZWN0IHRvIGl0ZXJhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBjYWxsYmFjayB0byBpbnZva2UgZm9yIGVhY2ggaXRlbVxuICovXG5mdW5jdGlvbiBmb3JFYWNoKG9iaiwgZm4pIHtcbiAgLy8gRG9uJ3QgYm90aGVyIGlmIG5vIHZhbHVlIHByb3ZpZGVkXG4gIGlmIChvYmogPT09IG51bGwgfHwgdHlwZW9mIG9iaiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBGb3JjZSBhbiBhcnJheSBpZiBub3QgYWxyZWFkeSBzb21ldGhpbmcgaXRlcmFibGVcbiAgaWYgKHR5cGVvZiBvYmogIT09ICdvYmplY3QnKSB7XG4gICAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gICAgb2JqID0gW29ial07XG4gIH1cblxuICBpZiAoaXNBcnJheShvYmopKSB7XG4gICAgLy8gSXRlcmF0ZSBvdmVyIGFycmF5IHZhbHVlc1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gb2JqLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgZm4uY2FsbChudWxsLCBvYmpbaV0sIGksIG9iaik7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIEl0ZXJhdGUgb3ZlciBvYmplY3Qga2V5c1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSB7XG4gICAgICAgIGZuLmNhbGwobnVsbCwgb2JqW2tleV0sIGtleSwgb2JqKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBBY2NlcHRzIHZhcmFyZ3MgZXhwZWN0aW5nIGVhY2ggYXJndW1lbnQgdG8gYmUgYW4gb2JqZWN0LCB0aGVuXG4gKiBpbW11dGFibHkgbWVyZ2VzIHRoZSBwcm9wZXJ0aWVzIG9mIGVhY2ggb2JqZWN0IGFuZCByZXR1cm5zIHJlc3VsdC5cbiAqXG4gKiBXaGVuIG11bHRpcGxlIG9iamVjdHMgY29udGFpbiB0aGUgc2FtZSBrZXkgdGhlIGxhdGVyIG9iamVjdCBpblxuICogdGhlIGFyZ3VtZW50cyBsaXN0IHdpbGwgdGFrZSBwcmVjZWRlbmNlLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogYGBganNcbiAqIHZhciByZXN1bHQgPSBtZXJnZSh7Zm9vOiAxMjN9LCB7Zm9vOiA0NTZ9KTtcbiAqIGNvbnNvbGUubG9nKHJlc3VsdC5mb28pOyAvLyBvdXRwdXRzIDQ1NlxuICogYGBgXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iajEgT2JqZWN0IHRvIG1lcmdlXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXN1bHQgb2YgYWxsIG1lcmdlIHByb3BlcnRpZXNcbiAqL1xuZnVuY3Rpb24gbWVyZ2UoLyogb2JqMSwgb2JqMiwgb2JqMywgLi4uICovKSB7XG4gIHZhciByZXN1bHQgPSB7fTtcbiAgZnVuY3Rpb24gYXNzaWduVmFsdWUodmFsLCBrZXkpIHtcbiAgICBpZiAoaXNQbGFpbk9iamVjdChyZXN1bHRba2V5XSkgJiYgaXNQbGFpbk9iamVjdCh2YWwpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IG1lcmdlKHJlc3VsdFtrZXldLCB2YWwpO1xuICAgIH0gZWxzZSBpZiAoaXNQbGFpbk9iamVjdCh2YWwpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IG1lcmdlKHt9LCB2YWwpO1xuICAgIH0gZWxzZSBpZiAoaXNBcnJheSh2YWwpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IHZhbC5zbGljZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHRba2V5XSA9IHZhbDtcbiAgICB9XG4gIH1cblxuICBmb3IgKHZhciBpID0gMCwgbCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBmb3JFYWNoKGFyZ3VtZW50c1tpXSwgYXNzaWduVmFsdWUpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRXh0ZW5kcyBvYmplY3QgYSBieSBtdXRhYmx5IGFkZGluZyB0byBpdCB0aGUgcHJvcGVydGllcyBvZiBvYmplY3QgYi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYSBUaGUgb2JqZWN0IHRvIGJlIGV4dGVuZGVkXG4gKiBAcGFyYW0ge09iamVjdH0gYiBUaGUgb2JqZWN0IHRvIGNvcHkgcHJvcGVydGllcyBmcm9tXG4gKiBAcGFyYW0ge09iamVjdH0gdGhpc0FyZyBUaGUgb2JqZWN0IHRvIGJpbmQgZnVuY3Rpb24gdG9cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHJlc3VsdGluZyB2YWx1ZSBvZiBvYmplY3QgYVxuICovXG5mdW5jdGlvbiBleHRlbmQoYSwgYiwgdGhpc0FyZykge1xuICBmb3JFYWNoKGIsIGZ1bmN0aW9uIGFzc2lnblZhbHVlKHZhbCwga2V5KSB7XG4gICAgaWYgKHRoaXNBcmcgJiYgdHlwZW9mIHZhbCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgYVtrZXldID0gYmluZCh2YWwsIHRoaXNBcmcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhW2tleV0gPSB2YWw7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIGE7XG59XG5cbi8qKlxuICogUmVtb3ZlIGJ5dGUgb3JkZXIgbWFya2VyLiBUaGlzIGNhdGNoZXMgRUYgQkIgQkYgKHRoZSBVVEYtOCBCT00pXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGNvbnRlbnQgd2l0aCBCT01cbiAqIEByZXR1cm4ge3N0cmluZ30gY29udGVudCB2YWx1ZSB3aXRob3V0IEJPTVxuICovXG5mdW5jdGlvbiBzdHJpcEJPTShjb250ZW50KSB7XG4gIGlmIChjb250ZW50LmNoYXJDb2RlQXQoMCkgPT09IDB4RkVGRikge1xuICAgIGNvbnRlbnQgPSBjb250ZW50LnNsaWNlKDEpO1xuICB9XG4gIHJldHVybiBjb250ZW50O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgaXNBcnJheTogaXNBcnJheSxcbiAgaXNBcnJheUJ1ZmZlcjogaXNBcnJheUJ1ZmZlcixcbiAgaXNCdWZmZXI6IGlzQnVmZmVyLFxuICBpc0Zvcm1EYXRhOiBpc0Zvcm1EYXRhLFxuICBpc0FycmF5QnVmZmVyVmlldzogaXNBcnJheUJ1ZmZlclZpZXcsXG4gIGlzU3RyaW5nOiBpc1N0cmluZyxcbiAgaXNOdW1iZXI6IGlzTnVtYmVyLFxuICBpc09iamVjdDogaXNPYmplY3QsXG4gIGlzUGxhaW5PYmplY3Q6IGlzUGxhaW5PYmplY3QsXG4gIGlzVW5kZWZpbmVkOiBpc1VuZGVmaW5lZCxcbiAgaXNEYXRlOiBpc0RhdGUsXG4gIGlzRmlsZTogaXNGaWxlLFxuICBpc0Jsb2I6IGlzQmxvYixcbiAgaXNGdW5jdGlvbjogaXNGdW5jdGlvbixcbiAgaXNTdHJlYW06IGlzU3RyZWFtLFxuICBpc1VSTFNlYXJjaFBhcmFtczogaXNVUkxTZWFyY2hQYXJhbXMsXG4gIGlzU3RhbmRhcmRCcm93c2VyRW52OiBpc1N0YW5kYXJkQnJvd3NlckVudixcbiAgZm9yRWFjaDogZm9yRWFjaCxcbiAgbWVyZ2U6IG1lcmdlLFxuICBleHRlbmQ6IGV4dGVuZCxcbiAgdHJpbTogdHJpbSxcbiAgc3RyaXBCT006IHN0cmlwQk9NXG59O1xuIiwiLy8gSW1wb3J0c1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18gZnJvbSBcIi4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9zb3VyY2VNYXBzLmpzXCI7XG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fIGZyb20gXCIuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzXCI7XG52YXIgX19fQ1NTX0xPQURFUl9FWFBPUlRfX18gPSBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18oX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyk7XG4vLyBNb2R1bGVcbl9fX0NTU19MT0FERVJfRVhQT1JUX19fLnB1c2goW21vZHVsZS5pZCwgXCJib2R5IHtcXHJcXG4gIGJhY2tncm91bmQtY29sb3I6IGFxdWE7XFxyXFxufVxcclxcbmgxIHtcXHJcXG4gIGNvbG9yOiByZ2IoMzQsIDE0MSwgNDgpO1xcclxcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcclxcbiAgbWFyZ2luLXRvcDogMjBweDtcXHJcXG59XFxyXFxuI3RhYmxlIHtcXHJcXG4gIG1hcmdpbjogYXV0bztcXHJcXG4gIHdpZHRoOiA4MHZ3ICFpbXBvcnRhbnQ7XFxyXFxufVxcclxcblxcclxcbi50YWJsZSAuYm9yZGVyQ29ybmVyMSB7XFxyXFxuICBib3JkZXItdG9wLWxlZnQtcmFkaXVzOiAyMHB4O1xcclxcbn1cXHJcXG4udGFibGUgLmJvcmRlckNvcm5lcjIge1xcclxcbiAgYm9yZGVyLXRvcC1yaWdodC1yYWRpdXM6IDIwcHg7XFxyXFxufVxcclxcbi5mb3JtLWZsb2F0aW5nIHtcXHJcXG4gIGRpc3BsYXk6IGZsZXg7XFxyXFxuICBtYXJnaW46IGF1dG87XFxyXFxuICBtYXgtd2lkdGg6IDgwdnc7XFxyXFxufVxcclxcbi5idG4ge1xcclxcbiAgZm9udC1zaXplOiAyMHB4O1xcclxcbiAgYm9yZGVyLXJhZGl1czogMHB4IDEwcHggMTBweCAwcHg7XFxyXFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMzQsIDE0MSwgNDgpO1xcclxcbn1cXHJcXG4uZGlzcGxheSB7XFxyXFxuICBtYXJnaW46IGF1dG87XFxyXFxuICBkaXNwbGF5OiBmbGV4O1xcclxcbiAgd2lkdGg6IDgwdnc7XFxyXFxufVxcclxcbi5zaG9ydGVuZExhYmVsIHtcXHJcXG4gIGRpc3BsYXk6IGZsZXg7XFxyXFxuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMzQsIDE0MSwgNDgpO1xcclxcbiAgYm9yZGVyLXJhZGl1czogMTBweCAwcHggMHB4IDEwcHg7XFxyXFxuICBjb2xvcjogd2hpdGU7XFxyXFxuICBoZWlnaHQ6IDYwcHg7XFxyXFxuICBmb250LXNpemU6IDIwcHg7XFxyXFxuICB3aWR0aDogMTYwcHg7XFxyXFxuICBhbGlnbi1pdGVtczogY2VudGVyO1xcclxcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxyXFxufVxcclxcbiNzaG9ydGVuZFVybCB7XFxyXFxuICBiYWNrZ3JvdW5kLWNvbG9yOiB3aGl0ZTtcXHJcXG4gIHdpZHRoOiA4MHZ3O1xcclxcbiAgZGlzcGxheTogZmxleDtcXHJcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxyXFxuICBmb250LXNpemU6IDIwcHg7XFxyXFxuICBib3JkZXItcmFkaXVzOiAwcHggMTBweCAxMHB4IDBweDtcXHJcXG4gIGhlaWdodDogNjBweDtcXHJcXG4gIHBhZGRpbmctbGVmdDogMTBweDtcXHJcXG59XFxyXFxuI29yaWdpbmFsVXJsSW5wdXQge1xcclxcbiAgYm9yZGVyLXJhZGl1czogMTBweCAwcHggMHB4IDEwcHg7XFxyXFxufVxcclxcbi50YWJsZUhlYWRpbmcge1xcclxcbiAgY29sb3I6IHJnYigzNCwgMTQxLCA0OCk7XFxyXFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxyXFxuICBtYXJnaW4tYm90dG9tOiAxNXB4O1xcclxcbn1cXHJcXG50aCB7XFxyXFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxyXFxufVxcclxcbi5sZW5ndGhDb250cm9sIHtcXHJcXG4gIHdvcmQtYnJlYWs6IGJyZWFrLWFsbDtcXHJcXG4gIG1heC13aWR0aDogMjh2dztcXHJcXG4gIG1pbi13aWR0aDogMjAwcHggIWltcG9ydGFudDtcXHJcXG59XFxyXFxuXCIsIFwiXCIse1widmVyc2lvblwiOjMsXCJzb3VyY2VzXCI6W1wid2VicGFjazovLy4vc3JjL3N0eWxlLmNzc1wiXSxcIm5hbWVzXCI6W10sXCJtYXBwaW5nc1wiOlwiQUFBQTtFQUNFLHNCQUFzQjtBQUN4QjtBQUNBO0VBQ0UsdUJBQXVCO0VBQ3ZCLGtCQUFrQjtFQUNsQixnQkFBZ0I7QUFDbEI7QUFDQTtFQUNFLFlBQVk7RUFDWixzQkFBc0I7QUFDeEI7O0FBRUE7RUFDRSw0QkFBNEI7QUFDOUI7QUFDQTtFQUNFLDZCQUE2QjtBQUMvQjtBQUNBO0VBQ0UsYUFBYTtFQUNiLFlBQVk7RUFDWixlQUFlO0FBQ2pCO0FBQ0E7RUFDRSxlQUFlO0VBQ2YsZ0NBQWdDO0VBQ2hDLGtDQUFrQztBQUNwQztBQUNBO0VBQ0UsWUFBWTtFQUNaLGFBQWE7RUFDYixXQUFXO0FBQ2I7QUFDQTtFQUNFLGFBQWE7RUFDYixrQ0FBa0M7RUFDbEMsZ0NBQWdDO0VBQ2hDLFlBQVk7RUFDWixZQUFZO0VBQ1osZUFBZTtFQUNmLFlBQVk7RUFDWixtQkFBbUI7RUFDbkIsdUJBQXVCO0FBQ3pCO0FBQ0E7RUFDRSx1QkFBdUI7RUFDdkIsV0FBVztFQUNYLGFBQWE7RUFDYixtQkFBbUI7RUFDbkIsZUFBZTtFQUNmLGdDQUFnQztFQUNoQyxZQUFZO0VBQ1osa0JBQWtCO0FBQ3BCO0FBQ0E7RUFDRSxnQ0FBZ0M7QUFDbEM7QUFDQTtFQUNFLHVCQUF1QjtFQUN2QixrQkFBa0I7RUFDbEIsbUJBQW1CO0FBQ3JCO0FBQ0E7RUFDRSxrQkFBa0I7QUFDcEI7QUFDQTtFQUNFLHFCQUFxQjtFQUNyQixlQUFlO0VBQ2YsMkJBQTJCO0FBQzdCXCIsXCJzb3VyY2VzQ29udGVudFwiOltcImJvZHkge1xcclxcbiAgYmFja2dyb3VuZC1jb2xvcjogYXF1YTtcXHJcXG59XFxyXFxuaDEge1xcclxcbiAgY29sb3I6IHJnYigzNCwgMTQxLCA0OCk7XFxyXFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxyXFxuICBtYXJnaW4tdG9wOiAyMHB4O1xcclxcbn1cXHJcXG4jdGFibGUge1xcclxcbiAgbWFyZ2luOiBhdXRvO1xcclxcbiAgd2lkdGg6IDgwdncgIWltcG9ydGFudDtcXHJcXG59XFxyXFxuXFxyXFxuLnRhYmxlIC5ib3JkZXJDb3JuZXIxIHtcXHJcXG4gIGJvcmRlci10b3AtbGVmdC1yYWRpdXM6IDIwcHg7XFxyXFxufVxcclxcbi50YWJsZSAuYm9yZGVyQ29ybmVyMiB7XFxyXFxuICBib3JkZXItdG9wLXJpZ2h0LXJhZGl1czogMjBweDtcXHJcXG59XFxyXFxuLmZvcm0tZmxvYXRpbmcge1xcclxcbiAgZGlzcGxheTogZmxleDtcXHJcXG4gIG1hcmdpbjogYXV0bztcXHJcXG4gIG1heC13aWR0aDogODB2dztcXHJcXG59XFxyXFxuLmJ0biB7XFxyXFxuICBmb250LXNpemU6IDIwcHg7XFxyXFxuICBib3JkZXItcmFkaXVzOiAwcHggMTBweCAxMHB4IDBweDtcXHJcXG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigzNCwgMTQxLCA0OCk7XFxyXFxufVxcclxcbi5kaXNwbGF5IHtcXHJcXG4gIG1hcmdpbjogYXV0bztcXHJcXG4gIGRpc3BsYXk6IGZsZXg7XFxyXFxuICB3aWR0aDogODB2dztcXHJcXG59XFxyXFxuLnNob3J0ZW5kTGFiZWwge1xcclxcbiAgZGlzcGxheTogZmxleDtcXHJcXG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigzNCwgMTQxLCA0OCk7XFxyXFxuICBib3JkZXItcmFkaXVzOiAxMHB4IDBweCAwcHggMTBweDtcXHJcXG4gIGNvbG9yOiB3aGl0ZTtcXHJcXG4gIGhlaWdodDogNjBweDtcXHJcXG4gIGZvbnQtc2l6ZTogMjBweDtcXHJcXG4gIHdpZHRoOiAxNjBweDtcXHJcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxyXFxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXHJcXG59XFxyXFxuI3Nob3J0ZW5kVXJsIHtcXHJcXG4gIGJhY2tncm91bmQtY29sb3I6IHdoaXRlO1xcclxcbiAgd2lkdGg6IDgwdnc7XFxyXFxuICBkaXNwbGF5OiBmbGV4O1xcclxcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXHJcXG4gIGZvbnQtc2l6ZTogMjBweDtcXHJcXG4gIGJvcmRlci1yYWRpdXM6IDBweCAxMHB4IDEwcHggMHB4O1xcclxcbiAgaGVpZ2h0OiA2MHB4O1xcclxcbiAgcGFkZGluZy1sZWZ0OiAxMHB4O1xcclxcbn1cXHJcXG4jb3JpZ2luYWxVcmxJbnB1dCB7XFxyXFxuICBib3JkZXItcmFkaXVzOiAxMHB4IDBweCAwcHggMTBweDtcXHJcXG59XFxyXFxuLnRhYmxlSGVhZGluZyB7XFxyXFxuICBjb2xvcjogcmdiKDM0LCAxNDEsIDQ4KTtcXHJcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXHJcXG4gIG1hcmdpbi1ib3R0b206IDE1cHg7XFxyXFxufVxcclxcbnRoIHtcXHJcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXHJcXG59XFxyXFxuLmxlbmd0aENvbnRyb2wge1xcclxcbiAgd29yZC1icmVhazogYnJlYWstYWxsO1xcclxcbiAgbWF4LXdpZHRoOiAyOHZ3O1xcclxcbiAgbWluLXdpZHRoOiAyMDBweCAhaW1wb3J0YW50O1xcclxcbn1cXHJcXG5cIl0sXCJzb3VyY2VSb290XCI6XCJcIn1dKTtcbi8vIEV4cG9ydHNcbmV4cG9ydCBkZWZhdWx0IF9fX0NTU19MT0FERVJfRVhQT1JUX19fO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qXG4gIE1JVCBMaWNlbnNlIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4gIEF1dGhvciBUb2JpYXMgS29wcGVycyBAc29rcmFcbiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKSB7XG4gIHZhciBsaXN0ID0gW107IC8vIHJldHVybiB0aGUgbGlzdCBvZiBtb2R1bGVzIGFzIGNzcyBzdHJpbmdcblxuICBsaXN0LnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICB2YXIgY29udGVudCA9IFwiXCI7XG4gICAgICB2YXIgbmVlZExheWVyID0gdHlwZW9mIGl0ZW1bNV0gIT09IFwidW5kZWZpbmVkXCI7XG5cbiAgICAgIGlmIChpdGVtWzRdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChpdGVtWzRdLCBcIikge1wiKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGl0ZW1bMl0pIHtcbiAgICAgICAgY29udGVudCArPSBcIkBtZWRpYSBcIi5jb25jYXQoaXRlbVsyXSwgXCIge1wiKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG5lZWRMYXllcikge1xuICAgICAgICBjb250ZW50ICs9IFwiQGxheWVyXCIuY29uY2F0KGl0ZW1bNV0ubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChpdGVtWzVdKSA6IFwiXCIsIFwiIHtcIik7XG4gICAgICB9XG5cbiAgICAgIGNvbnRlbnQgKz0gY3NzV2l0aE1hcHBpbmdUb1N0cmluZyhpdGVtKTtcblxuICAgICAgaWYgKG5lZWRMYXllcikge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXRlbVsyXSkge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXRlbVs0XSkge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gY29udGVudDtcbiAgICB9KS5qb2luKFwiXCIpO1xuICB9OyAvLyBpbXBvcnQgYSBsaXN0IG9mIG1vZHVsZXMgaW50byB0aGUgbGlzdFxuXG5cbiAgbGlzdC5pID0gZnVuY3Rpb24gaShtb2R1bGVzLCBtZWRpYSwgZGVkdXBlLCBzdXBwb3J0cywgbGF5ZXIpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZXMgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIG1vZHVsZXMgPSBbW251bGwsIG1vZHVsZXMsIHVuZGVmaW5lZF1dO1xuICAgIH1cblxuICAgIHZhciBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzID0ge307XG5cbiAgICBpZiAoZGVkdXBlKSB7XG4gICAgICBmb3IgKHZhciBrID0gMDsgayA8IHRoaXMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgdmFyIGlkID0gdGhpc1trXVswXTtcblxuICAgICAgICBpZiAoaWQgIT0gbnVsbCkge1xuICAgICAgICAgIGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaWRdID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIF9rID0gMDsgX2sgPCBtb2R1bGVzLmxlbmd0aDsgX2srKykge1xuICAgICAgdmFyIGl0ZW0gPSBbXS5jb25jYXQobW9kdWxlc1tfa10pO1xuXG4gICAgICBpZiAoZGVkdXBlICYmIGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaXRlbVswXV0pIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgbGF5ZXIgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBpdGVtWzVdID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgaXRlbVs1XSA9IGxheWVyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBsYXllclwiLmNvbmNhdChpdGVtWzVdLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQoaXRlbVs1XSkgOiBcIlwiLCBcIiB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVs1XSA9IGxheWVyO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChtZWRpYSkge1xuICAgICAgICBpZiAoIWl0ZW1bMl0pIHtcbiAgICAgICAgICBpdGVtWzJdID0gbWVkaWE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQG1lZGlhIFwiLmNvbmNhdChpdGVtWzJdLCBcIiB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVsyXSA9IG1lZGlhO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChzdXBwb3J0cykge1xuICAgICAgICBpZiAoIWl0ZW1bNF0pIHtcbiAgICAgICAgICBpdGVtWzRdID0gXCJcIi5jb25jYXQoc3VwcG9ydHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBzdXBwb3J0cyAoXCIuY29uY2F0KGl0ZW1bNF0sIFwiKSB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVs0XSA9IHN1cHBvcnRzO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGxpc3QucHVzaChpdGVtKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIGxpc3Q7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdGVtKSB7XG4gIHZhciBjb250ZW50ID0gaXRlbVsxXTtcbiAgdmFyIGNzc01hcHBpbmcgPSBpdGVtWzNdO1xuXG4gIGlmICghY3NzTWFwcGluZykge1xuICAgIHJldHVybiBjb250ZW50O1xuICB9XG5cbiAgaWYgKHR5cGVvZiBidG9hID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICB2YXIgYmFzZTY0ID0gYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoY3NzTWFwcGluZykpKSk7XG4gICAgdmFyIGRhdGEgPSBcInNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LFwiLmNvbmNhdChiYXNlNjQpO1xuICAgIHZhciBzb3VyY2VNYXBwaW5nID0gXCIvKiMgXCIuY29uY2F0KGRhdGEsIFwiICovXCIpO1xuICAgIHZhciBzb3VyY2VVUkxzID0gY3NzTWFwcGluZy5zb3VyY2VzLm1hcChmdW5jdGlvbiAoc291cmNlKSB7XG4gICAgICByZXR1cm4gXCIvKiMgc291cmNlVVJMPVwiLmNvbmNhdChjc3NNYXBwaW5nLnNvdXJjZVJvb3QgfHwgXCJcIikuY29uY2F0KHNvdXJjZSwgXCIgKi9cIik7XG4gICAgfSk7XG4gICAgcmV0dXJuIFtjb250ZW50XS5jb25jYXQoc291cmNlVVJMcykuY29uY2F0KFtzb3VyY2VNYXBwaW5nXSkuam9pbihcIlxcblwiKTtcbiAgfVxuXG4gIHJldHVybiBbY29udGVudF0uam9pbihcIlxcblwiKTtcbn07IiwiXG4gICAgICBpbXBvcnQgQVBJIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzXCI7XG4gICAgICBpbXBvcnQgZG9tQVBJIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVEb21BUEkuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRGbiBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanNcIjtcbiAgICAgIGltcG9ydCBzZXRBdHRyaWJ1dGVzIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0U3R5bGVFbGVtZW50IGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzXCI7XG4gICAgICBpbXBvcnQgc3R5bGVUYWdUcmFuc2Zvcm1GbiBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzXCI7XG4gICAgICBpbXBvcnQgY29udGVudCwgKiBhcyBuYW1lZEV4cG9ydCBmcm9tIFwiISEuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL3N0eWxlLmNzc1wiO1xuICAgICAgXG4gICAgICBcblxudmFyIG9wdGlvbnMgPSB7fTtcblxub3B0aW9ucy5zdHlsZVRhZ1RyYW5zZm9ybSA9IHN0eWxlVGFnVHJhbnNmb3JtRm47XG5vcHRpb25zLnNldEF0dHJpYnV0ZXMgPSBzZXRBdHRyaWJ1dGVzO1xuXG4gICAgICBvcHRpb25zLmluc2VydCA9IGluc2VydEZuLmJpbmQobnVsbCwgXCJoZWFkXCIpO1xuICAgIFxub3B0aW9ucy5kb21BUEkgPSBkb21BUEk7XG5vcHRpb25zLmluc2VydFN0eWxlRWxlbWVudCA9IGluc2VydFN0eWxlRWxlbWVudDtcblxudmFyIHVwZGF0ZSA9IEFQSShjb250ZW50LCBvcHRpb25zKTtcblxuXG5cbmV4cG9ydCAqIGZyb20gXCIhIS4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vc3R5bGUuY3NzXCI7XG4gICAgICAgZXhwb3J0IGRlZmF1bHQgY29udGVudCAmJiBjb250ZW50LmxvY2FscyA/IGNvbnRlbnQubG9jYWxzIDogdW5kZWZpbmVkO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBzdHlsZXNJbkRPTSA9IFtdO1xuXG5mdW5jdGlvbiBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKSB7XG4gIHZhciByZXN1bHQgPSAtMTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0eWxlc0luRE9NLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHN0eWxlc0luRE9NW2ldLmlkZW50aWZpZXIgPT09IGlkZW50aWZpZXIpIHtcbiAgICAgIHJlc3VsdCA9IGk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBtb2R1bGVzVG9Eb20obGlzdCwgb3B0aW9ucykge1xuICB2YXIgaWRDb3VudE1hcCA9IHt9O1xuICB2YXIgaWRlbnRpZmllcnMgPSBbXTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaXRlbSA9IGxpc3RbaV07XG4gICAgdmFyIGlkID0gb3B0aW9ucy5iYXNlID8gaXRlbVswXSArIG9wdGlvbnMuYmFzZSA6IGl0ZW1bMF07XG4gICAgdmFyIGNvdW50ID0gaWRDb3VudE1hcFtpZF0gfHwgMDtcbiAgICB2YXIgaWRlbnRpZmllciA9IFwiXCIuY29uY2F0KGlkLCBcIiBcIikuY29uY2F0KGNvdW50KTtcbiAgICBpZENvdW50TWFwW2lkXSA9IGNvdW50ICsgMTtcbiAgICB2YXIgaW5kZXhCeUlkZW50aWZpZXIgPSBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKTtcbiAgICB2YXIgb2JqID0ge1xuICAgICAgY3NzOiBpdGVtWzFdLFxuICAgICAgbWVkaWE6IGl0ZW1bMl0sXG4gICAgICBzb3VyY2VNYXA6IGl0ZW1bM10sXG4gICAgICBzdXBwb3J0czogaXRlbVs0XSxcbiAgICAgIGxheWVyOiBpdGVtWzVdXG4gICAgfTtcblxuICAgIGlmIChpbmRleEJ5SWRlbnRpZmllciAhPT0gLTEpIHtcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4QnlJZGVudGlmaWVyXS5yZWZlcmVuY2VzKys7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleEJ5SWRlbnRpZmllcl0udXBkYXRlcihvYmopO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgdXBkYXRlciA9IGFkZEVsZW1lbnRTdHlsZShvYmosIG9wdGlvbnMpO1xuICAgICAgb3B0aW9ucy5ieUluZGV4ID0gaTtcbiAgICAgIHN0eWxlc0luRE9NLnNwbGljZShpLCAwLCB7XG4gICAgICAgIGlkZW50aWZpZXI6IGlkZW50aWZpZXIsXG4gICAgICAgIHVwZGF0ZXI6IHVwZGF0ZXIsXG4gICAgICAgIHJlZmVyZW5jZXM6IDFcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlkZW50aWZpZXJzLnB1c2goaWRlbnRpZmllcik7XG4gIH1cblxuICByZXR1cm4gaWRlbnRpZmllcnM7XG59XG5cbmZ1bmN0aW9uIGFkZEVsZW1lbnRTdHlsZShvYmosIG9wdGlvbnMpIHtcbiAgdmFyIGFwaSA9IG9wdGlvbnMuZG9tQVBJKG9wdGlvbnMpO1xuICBhcGkudXBkYXRlKG9iaik7XG5cbiAgdmFyIHVwZGF0ZXIgPSBmdW5jdGlvbiB1cGRhdGVyKG5ld09iaikge1xuICAgIGlmIChuZXdPYmopIHtcbiAgICAgIGlmIChuZXdPYmouY3NzID09PSBvYmouY3NzICYmIG5ld09iai5tZWRpYSA9PT0gb2JqLm1lZGlhICYmIG5ld09iai5zb3VyY2VNYXAgPT09IG9iai5zb3VyY2VNYXAgJiYgbmV3T2JqLnN1cHBvcnRzID09PSBvYmouc3VwcG9ydHMgJiYgbmV3T2JqLmxheWVyID09PSBvYmoubGF5ZXIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBhcGkudXBkYXRlKG9iaiA9IG5ld09iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFwaS5yZW1vdmUoKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIHVwZGF0ZXI7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGxpc3QsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIGxpc3QgPSBsaXN0IHx8IFtdO1xuICB2YXIgbGFzdElkZW50aWZpZXJzID0gbW9kdWxlc1RvRG9tKGxpc3QsIG9wdGlvbnMpO1xuICByZXR1cm4gZnVuY3Rpb24gdXBkYXRlKG5ld0xpc3QpIHtcbiAgICBuZXdMaXN0ID0gbmV3TGlzdCB8fCBbXTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGFzdElkZW50aWZpZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaWRlbnRpZmllciA9IGxhc3RJZGVudGlmaWVyc1tpXTtcbiAgICAgIHZhciBpbmRleCA9IGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpO1xuICAgICAgc3R5bGVzSW5ET01baW5kZXhdLnJlZmVyZW5jZXMtLTtcbiAgICB9XG5cbiAgICB2YXIgbmV3TGFzdElkZW50aWZpZXJzID0gbW9kdWxlc1RvRG9tKG5ld0xpc3QsIG9wdGlvbnMpO1xuXG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGxhc3RJZGVudGlmaWVycy5sZW5ndGg7IF9pKyspIHtcbiAgICAgIHZhciBfaWRlbnRpZmllciA9IGxhc3RJZGVudGlmaWVyc1tfaV07XG5cbiAgICAgIHZhciBfaW5kZXggPSBnZXRJbmRleEJ5SWRlbnRpZmllcihfaWRlbnRpZmllcik7XG5cbiAgICAgIGlmIChzdHlsZXNJbkRPTVtfaW5kZXhdLnJlZmVyZW5jZXMgPT09IDApIHtcbiAgICAgICAgc3R5bGVzSW5ET01bX2luZGV4XS51cGRhdGVyKCk7XG5cbiAgICAgICAgc3R5bGVzSW5ET00uc3BsaWNlKF9pbmRleCwgMSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGFzdElkZW50aWZpZXJzID0gbmV3TGFzdElkZW50aWZpZXJzO1xuICB9O1xufTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIG1lbW8gPSB7fTtcbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuXG5mdW5jdGlvbiBnZXRUYXJnZXQodGFyZ2V0KSB7XG4gIGlmICh0eXBlb2YgbWVtb1t0YXJnZXRdID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgdmFyIHN0eWxlVGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXJnZXQpOyAvLyBTcGVjaWFsIGNhc2UgdG8gcmV0dXJuIGhlYWQgb2YgaWZyYW1lIGluc3RlYWQgb2YgaWZyYW1lIGl0c2VsZlxuXG4gICAgaWYgKHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCAmJiBzdHlsZVRhcmdldCBpbnN0YW5jZW9mIHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gVGhpcyB3aWxsIHRocm93IGFuIGV4Y2VwdGlvbiBpZiBhY2Nlc3MgdG8gaWZyYW1lIGlzIGJsb2NrZWRcbiAgICAgICAgLy8gZHVlIHRvIGNyb3NzLW9yaWdpbiByZXN0cmljdGlvbnNcbiAgICAgICAgc3R5bGVUYXJnZXQgPSBzdHlsZVRhcmdldC5jb250ZW50RG9jdW1lbnQuaGVhZDtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gaXN0YW5idWwgaWdub3JlIG5leHRcbiAgICAgICAgc3R5bGVUYXJnZXQgPSBudWxsO1xuICAgICAgfVxuICAgIH1cblxuICAgIG1lbW9bdGFyZ2V0XSA9IHN0eWxlVGFyZ2V0O1xuICB9XG5cbiAgcmV0dXJuIG1lbW9bdGFyZ2V0XTtcbn1cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuXG5cbmZ1bmN0aW9uIGluc2VydEJ5U2VsZWN0b3IoaW5zZXJ0LCBzdHlsZSkge1xuICB2YXIgdGFyZ2V0ID0gZ2V0VGFyZ2V0KGluc2VydCk7XG5cbiAgaWYgKCF0YXJnZXQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZG4ndCBmaW5kIGEgc3R5bGUgdGFyZ2V0LiBUaGlzIHByb2JhYmx5IG1lYW5zIHRoYXQgdGhlIHZhbHVlIGZvciB0aGUgJ2luc2VydCcgcGFyYW1ldGVyIGlzIGludmFsaWQuXCIpO1xuICB9XG5cbiAgdGFyZ2V0LmFwcGVuZENoaWxkKHN0eWxlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpbnNlcnRCeVNlbGVjdG9yOyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGluc2VydFN0eWxlRWxlbWVudChvcHRpb25zKSB7XG4gIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xuICBvcHRpb25zLnNldEF0dHJpYnV0ZXMoZWxlbWVudCwgb3B0aW9ucy5hdHRyaWJ1dGVzKTtcbiAgb3B0aW9ucy5pbnNlcnQoZWxlbWVudCwgb3B0aW9ucy5vcHRpb25zKTtcbiAgcmV0dXJuIGVsZW1lbnQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaW5zZXJ0U3R5bGVFbGVtZW50OyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIHNldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcyhzdHlsZUVsZW1lbnQpIHtcbiAgdmFyIG5vbmNlID0gdHlwZW9mIF9fd2VicGFja19ub25jZV9fICE9PSBcInVuZGVmaW5lZFwiID8gX193ZWJwYWNrX25vbmNlX18gOiBudWxsO1xuXG4gIGlmIChub25jZSkge1xuICAgIHN0eWxlRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJub25jZVwiLCBub25jZSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXM7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gYXBwbHkoc3R5bGVFbGVtZW50LCBvcHRpb25zLCBvYmopIHtcbiAgdmFyIGNzcyA9IFwiXCI7XG5cbiAgaWYgKG9iai5zdXBwb3J0cykge1xuICAgIGNzcyArPSBcIkBzdXBwb3J0cyAoXCIuY29uY2F0KG9iai5zdXBwb3J0cywgXCIpIHtcIik7XG4gIH1cblxuICBpZiAob2JqLm1lZGlhKSB7XG4gICAgY3NzICs9IFwiQG1lZGlhIFwiLmNvbmNhdChvYmoubWVkaWEsIFwiIHtcIik7XG4gIH1cblxuICB2YXIgbmVlZExheWVyID0gdHlwZW9mIG9iai5sYXllciAhPT0gXCJ1bmRlZmluZWRcIjtcblxuICBpZiAobmVlZExheWVyKSB7XG4gICAgY3NzICs9IFwiQGxheWVyXCIuY29uY2F0KG9iai5sYXllci5sZW5ndGggPiAwID8gXCIgXCIuY29uY2F0KG9iai5sYXllcikgOiBcIlwiLCBcIiB7XCIpO1xuICB9XG5cbiAgY3NzICs9IG9iai5jc3M7XG5cbiAgaWYgKG5lZWRMYXllcikge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuXG4gIGlmIChvYmoubWVkaWEpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cblxuICBpZiAob2JqLnN1cHBvcnRzKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG5cbiAgdmFyIHNvdXJjZU1hcCA9IG9iai5zb3VyY2VNYXA7XG5cbiAgaWYgKHNvdXJjZU1hcCAmJiB0eXBlb2YgYnRvYSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIGNzcyArPSBcIlxcbi8qIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsXCIuY29uY2F0KGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KHNvdXJjZU1hcCkpKSksIFwiICovXCIpO1xuICB9IC8vIEZvciBvbGQgSUVcblxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgICovXG5cblxuICBvcHRpb25zLnN0eWxlVGFnVHJhbnNmb3JtKGNzcywgc3R5bGVFbGVtZW50LCBvcHRpb25zLm9wdGlvbnMpO1xufVxuXG5mdW5jdGlvbiByZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGVFbGVtZW50KSB7XG4gIC8vIGlzdGFuYnVsIGlnbm9yZSBpZlxuICBpZiAoc3R5bGVFbGVtZW50LnBhcmVudE5vZGUgPT09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBzdHlsZUVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzdHlsZUVsZW1lbnQpO1xufVxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5cblxuZnVuY3Rpb24gZG9tQVBJKG9wdGlvbnMpIHtcbiAgdmFyIHN0eWxlRWxlbWVudCA9IG9wdGlvbnMuaW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMpO1xuICByZXR1cm4ge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKG9iaikge1xuICAgICAgYXBwbHkoc3R5bGVFbGVtZW50LCBvcHRpb25zLCBvYmopO1xuICAgIH0sXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7XG4gICAgICByZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGVFbGVtZW50KTtcbiAgICB9XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZG9tQVBJOyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIHN0eWxlVGFnVHJhbnNmb3JtKGNzcywgc3R5bGVFbGVtZW50KSB7XG4gIGlmIChzdHlsZUVsZW1lbnQuc3R5bGVTaGVldCkge1xuICAgIHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0LmNzc1RleHQgPSBjc3M7XG4gIH0gZWxzZSB7XG4gICAgd2hpbGUgKHN0eWxlRWxlbWVudC5maXJzdENoaWxkKSB7XG4gICAgICBzdHlsZUVsZW1lbnQucmVtb3ZlQ2hpbGQoc3R5bGVFbGVtZW50LmZpcnN0Q2hpbGQpO1xuICAgIH1cblxuICAgIHN0eWxlRWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MpKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN0eWxlVGFnVHJhbnNmb3JtOyIsIiFmdW5jdGlvbih0LGUpe1wib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzJiZcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlP21vZHVsZS5leHBvcnRzPWUoKTpcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFtdLGUpOlwib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzP2V4cG9ydHMuc3dhbD1lKCk6dC5zd2FsPWUoKX0odGhpcyxmdW5jdGlvbigpe3JldHVybiBmdW5jdGlvbih0KXtmdW5jdGlvbiBlKG8pe2lmKG5bb10pcmV0dXJuIG5bb10uZXhwb3J0czt2YXIgcj1uW29dPXtpOm8sbDohMSxleHBvcnRzOnt9fTtyZXR1cm4gdFtvXS5jYWxsKHIuZXhwb3J0cyxyLHIuZXhwb3J0cyxlKSxyLmw9ITAsci5leHBvcnRzfXZhciBuPXt9O3JldHVybiBlLm09dCxlLmM9bixlLmQ9ZnVuY3Rpb24odCxuLG8pe2Uubyh0LG4pfHxPYmplY3QuZGVmaW5lUHJvcGVydHkodCxuLHtjb25maWd1cmFibGU6ITEsZW51bWVyYWJsZTohMCxnZXQ6b30pfSxlLm49ZnVuY3Rpb24odCl7dmFyIG49dCYmdC5fX2VzTW9kdWxlP2Z1bmN0aW9uKCl7cmV0dXJuIHQuZGVmYXVsdH06ZnVuY3Rpb24oKXtyZXR1cm4gdH07cmV0dXJuIGUuZChuLFwiYVwiLG4pLG59LGUubz1mdW5jdGlvbih0LGUpe3JldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodCxlKX0sZS5wPVwiXCIsZShlLnM9OCl9KFtmdW5jdGlvbih0LGUsbil7XCJ1c2Ugc3RyaWN0XCI7T2JqZWN0LmRlZmluZVByb3BlcnR5KGUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7dmFyIG89XCJzd2FsLWJ1dHRvblwiO2UuQ0xBU1NfTkFNRVM9e01PREFMOlwic3dhbC1tb2RhbFwiLE9WRVJMQVk6XCJzd2FsLW92ZXJsYXlcIixTSE9XX01PREFMOlwic3dhbC1vdmVybGF5LS1zaG93LW1vZGFsXCIsTU9EQUxfVElUTEU6XCJzd2FsLXRpdGxlXCIsTU9EQUxfVEVYVDpcInN3YWwtdGV4dFwiLElDT046XCJzd2FsLWljb25cIixJQ09OX0NVU1RPTTpcInN3YWwtaWNvbi0tY3VzdG9tXCIsQ09OVEVOVDpcInN3YWwtY29udGVudFwiLEZPT1RFUjpcInN3YWwtZm9vdGVyXCIsQlVUVE9OX0NPTlRBSU5FUjpcInN3YWwtYnV0dG9uLWNvbnRhaW5lclwiLEJVVFRPTjpvLENPTkZJUk1fQlVUVE9OOm8rXCItLWNvbmZpcm1cIixDQU5DRUxfQlVUVE9OOm8rXCItLWNhbmNlbFwiLERBTkdFUl9CVVRUT046bytcIi0tZGFuZ2VyXCIsQlVUVE9OX0xPQURJTkc6bytcIi0tbG9hZGluZ1wiLEJVVFRPTl9MT0FERVI6bytcIl9fbG9hZGVyXCJ9LGUuZGVmYXVsdD1lLkNMQVNTX05BTUVTfSxmdW5jdGlvbih0LGUsbil7XCJ1c2Ugc3RyaWN0XCI7T2JqZWN0LmRlZmluZVByb3BlcnR5KGUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksZS5nZXROb2RlPWZ1bmN0aW9uKHQpe3ZhciBlPVwiLlwiK3Q7cmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZSl9LGUuc3RyaW5nVG9Ob2RlPWZ1bmN0aW9uKHQpe3ZhciBlPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7cmV0dXJuIGUuaW5uZXJIVE1MPXQudHJpbSgpLGUuZmlyc3RDaGlsZH0sZS5pbnNlcnRBZnRlcj1mdW5jdGlvbih0LGUpe3ZhciBuPWUubmV4dFNpYmxpbmc7ZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh0LG4pfSxlLnJlbW92ZU5vZGU9ZnVuY3Rpb24odCl7dC5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKHQpfSxlLnRocm93RXJyPWZ1bmN0aW9uKHQpe3Rocm93IHQ9dC5yZXBsYWNlKC8gKyg/PSApL2csXCJcIiksXCJTd2VldEFsZXJ0OiBcIisodD10LnRyaW0oKSl9LGUuaXNQbGFpbk9iamVjdD1mdW5jdGlvbih0KXtpZihcIltvYmplY3QgT2JqZWN0XVwiIT09T2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHQpKXJldHVybiExO3ZhciBlPU9iamVjdC5nZXRQcm90b3R5cGVPZih0KTtyZXR1cm4gbnVsbD09PWV8fGU9PT1PYmplY3QucHJvdG90eXBlfSxlLm9yZGluYWxTdWZmaXhPZj1mdW5jdGlvbih0KXt2YXIgZT10JTEwLG49dCUxMDA7cmV0dXJuIDE9PT1lJiYxMSE9PW4/dCtcInN0XCI6Mj09PWUmJjEyIT09bj90K1wibmRcIjozPT09ZSYmMTMhPT1uP3QrXCJyZFwiOnQrXCJ0aFwifX0sZnVuY3Rpb24odCxlLG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIG8odCl7Zm9yKHZhciBuIGluIHQpZS5oYXNPd25Qcm9wZXJ0eShuKXx8KGVbbl09dFtuXSl9T2JqZWN0LmRlZmluZVByb3BlcnR5KGUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksbyhuKDI1KSk7dmFyIHI9bigyNik7ZS5vdmVybGF5TWFya3VwPXIuZGVmYXVsdCxvKG4oMjcpKSxvKG4oMjgpKSxvKG4oMjkpKTt2YXIgaT1uKDApLGE9aS5kZWZhdWx0Lk1PREFMX1RJVExFLHM9aS5kZWZhdWx0Lk1PREFMX1RFWFQsYz1pLmRlZmF1bHQuSUNPTixsPWkuZGVmYXVsdC5GT09URVI7ZS5pY29uTWFya3VwPSdcXG4gIDxkaXYgY2xhc3M9XCInK2MrJ1wiPjwvZGl2PicsZS50aXRsZU1hcmt1cD0nXFxuICA8ZGl2IGNsYXNzPVwiJythKydcIj48L2Rpdj5cXG4nLGUudGV4dE1hcmt1cD0nXFxuICA8ZGl2IGNsYXNzPVwiJytzKydcIj48L2Rpdj4nLGUuZm9vdGVyTWFya3VwPSdcXG4gIDxkaXYgY2xhc3M9XCInK2wrJ1wiPjwvZGl2Plxcbid9LGZ1bmN0aW9uKHQsZSxuKXtcInVzZSBzdHJpY3RcIjtPYmplY3QuZGVmaW5lUHJvcGVydHkoZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KTt2YXIgbz1uKDEpO2UuQ09ORklSTV9LRVk9XCJjb25maXJtXCIsZS5DQU5DRUxfS0VZPVwiY2FuY2VsXCI7dmFyIHI9e3Zpc2libGU6ITAsdGV4dDpudWxsLHZhbHVlOm51bGwsY2xhc3NOYW1lOlwiXCIsY2xvc2VNb2RhbDohMH0saT1PYmplY3QuYXNzaWduKHt9LHIse3Zpc2libGU6ITEsdGV4dDpcIkNhbmNlbFwiLHZhbHVlOm51bGx9KSxhPU9iamVjdC5hc3NpZ24oe30scix7dGV4dDpcIk9LXCIsdmFsdWU6ITB9KTtlLmRlZmF1bHRCdXR0b25MaXN0PXtjYW5jZWw6aSxjb25maXJtOmF9O3ZhciBzPWZ1bmN0aW9uKHQpe3N3aXRjaCh0KXtjYXNlIGUuQ09ORklSTV9LRVk6cmV0dXJuIGE7Y2FzZSBlLkNBTkNFTF9LRVk6cmV0dXJuIGk7ZGVmYXVsdDp2YXIgbj10LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpK3Quc2xpY2UoMSk7cmV0dXJuIE9iamVjdC5hc3NpZ24oe30scix7dGV4dDpuLHZhbHVlOnR9KX19LGM9ZnVuY3Rpb24odCxlKXt2YXIgbj1zKHQpO3JldHVybiEwPT09ZT9PYmplY3QuYXNzaWduKHt9LG4se3Zpc2libGU6ITB9KTpcInN0cmluZ1wiPT10eXBlb2YgZT9PYmplY3QuYXNzaWduKHt9LG4se3Zpc2libGU6ITAsdGV4dDplfSk6by5pc1BsYWluT2JqZWN0KGUpP09iamVjdC5hc3NpZ24oe3Zpc2libGU6ITB9LG4sZSk6T2JqZWN0LmFzc2lnbih7fSxuLHt2aXNpYmxlOiExfSl9LGw9ZnVuY3Rpb24odCl7Zm9yKHZhciBlPXt9LG49MCxvPU9iamVjdC5rZXlzKHQpO248by5sZW5ndGg7bisrKXt2YXIgcj1vW25dLGE9dFtyXSxzPWMocixhKTtlW3JdPXN9cmV0dXJuIGUuY2FuY2VsfHwoZS5jYW5jZWw9aSksZX0sdT1mdW5jdGlvbih0KXt2YXIgbj17fTtzd2l0Y2godC5sZW5ndGgpe2Nhc2UgMTpuW2UuQ0FOQ0VMX0tFWV09T2JqZWN0LmFzc2lnbih7fSxpLHt2aXNpYmxlOiExfSk7YnJlYWs7Y2FzZSAyOm5bZS5DQU5DRUxfS0VZXT1jKGUuQ0FOQ0VMX0tFWSx0WzBdKSxuW2UuQ09ORklSTV9LRVldPWMoZS5DT05GSVJNX0tFWSx0WzFdKTticmVhaztkZWZhdWx0Om8udGhyb3dFcnIoXCJJbnZhbGlkIG51bWJlciBvZiAnYnV0dG9ucycgaW4gYXJyYXkgKFwiK3QubGVuZ3RoK1wiKS5cXG4gICAgICBJZiB5b3Ugd2FudCBtb3JlIHRoYW4gMiBidXR0b25zLCB5b3UgbmVlZCB0byB1c2UgYW4gb2JqZWN0IVwiKX1yZXR1cm4gbn07ZS5nZXRCdXR0b25MaXN0T3B0cz1mdW5jdGlvbih0KXt2YXIgbj1lLmRlZmF1bHRCdXR0b25MaXN0O3JldHVyblwic3RyaW5nXCI9PXR5cGVvZiB0P25bZS5DT05GSVJNX0tFWV09YyhlLkNPTkZJUk1fS0VZLHQpOkFycmF5LmlzQXJyYXkodCk/bj11KHQpOm8uaXNQbGFpbk9iamVjdCh0KT9uPWwodCk6ITA9PT10P249dShbITAsITBdKTohMT09PXQ/bj11KFshMSwhMV0pOnZvaWQgMD09PXQmJihuPWUuZGVmYXVsdEJ1dHRvbkxpc3QpLG59fSxmdW5jdGlvbih0LGUsbil7XCJ1c2Ugc3RyaWN0XCI7T2JqZWN0LmRlZmluZVByb3BlcnR5KGUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7dmFyIG89bigxKSxyPW4oMiksaT1uKDApLGE9aS5kZWZhdWx0Lk1PREFMLHM9aS5kZWZhdWx0Lk9WRVJMQVksYz1uKDMwKSxsPW4oMzEpLHU9bigzMiksZj1uKDMzKTtlLmluamVjdEVsSW50b01vZGFsPWZ1bmN0aW9uKHQpe3ZhciBlPW8uZ2V0Tm9kZShhKSxuPW8uc3RyaW5nVG9Ob2RlKHQpO3JldHVybiBlLmFwcGVuZENoaWxkKG4pLG59O3ZhciBkPWZ1bmN0aW9uKHQpe3QuY2xhc3NOYW1lPWEsdC50ZXh0Q29udGVudD1cIlwifSxwPWZ1bmN0aW9uKHQsZSl7ZCh0KTt2YXIgbj1lLmNsYXNzTmFtZTtuJiZ0LmNsYXNzTGlzdC5hZGQobil9O2UuaW5pdE1vZGFsQ29udGVudD1mdW5jdGlvbih0KXt2YXIgZT1vLmdldE5vZGUoYSk7cChlLHQpLGMuZGVmYXVsdCh0Lmljb24pLGwuaW5pdFRpdGxlKHQudGl0bGUpLGwuaW5pdFRleHQodC50ZXh0KSxmLmRlZmF1bHQodC5jb250ZW50KSx1LmRlZmF1bHQodC5idXR0b25zLHQuZGFuZ2VyTW9kZSl9O3ZhciBtPWZ1bmN0aW9uKCl7dmFyIHQ9by5nZXROb2RlKHMpLGU9by5zdHJpbmdUb05vZGUoci5tb2RhbE1hcmt1cCk7dC5hcHBlbmRDaGlsZChlKX07ZS5kZWZhdWx0PW19LGZ1bmN0aW9uKHQsZSxuKXtcInVzZSBzdHJpY3RcIjtPYmplY3QuZGVmaW5lUHJvcGVydHkoZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KTt2YXIgbz1uKDMpLHI9e2lzT3BlbjohMSxwcm9taXNlOm51bGwsYWN0aW9uczp7fSx0aW1lcjpudWxsfSxpPU9iamVjdC5hc3NpZ24oe30scik7ZS5yZXNldFN0YXRlPWZ1bmN0aW9uKCl7aT1PYmplY3QuYXNzaWduKHt9LHIpfSxlLnNldEFjdGlvblZhbHVlPWZ1bmN0aW9uKHQpe2lmKFwic3RyaW5nXCI9PXR5cGVvZiB0KXJldHVybiBhKG8uQ09ORklSTV9LRVksdCk7Zm9yKHZhciBlIGluIHQpYShlLHRbZV0pfTt2YXIgYT1mdW5jdGlvbih0LGUpe2kuYWN0aW9uc1t0XXx8KGkuYWN0aW9uc1t0XT17fSksT2JqZWN0LmFzc2lnbihpLmFjdGlvbnNbdF0se3ZhbHVlOmV9KX07ZS5zZXRBY3Rpb25PcHRpb25zRm9yPWZ1bmN0aW9uKHQsZSl7dmFyIG49KHZvaWQgMD09PWU/e306ZSkuY2xvc2VNb2RhbCxvPXZvaWQgMD09PW58fG47T2JqZWN0LmFzc2lnbihpLmFjdGlvbnNbdF0se2Nsb3NlTW9kYWw6b30pfSxlLmRlZmF1bHQ9aX0sZnVuY3Rpb24odCxlLG4pe1widXNlIHN0cmljdFwiO09iamVjdC5kZWZpbmVQcm9wZXJ0eShlLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pO3ZhciBvPW4oMSkscj1uKDMpLGk9bigwKSxhPWkuZGVmYXVsdC5PVkVSTEFZLHM9aS5kZWZhdWx0LlNIT1dfTU9EQUwsYz1pLmRlZmF1bHQuQlVUVE9OLGw9aS5kZWZhdWx0LkJVVFRPTl9MT0FESU5HLHU9big1KTtlLm9wZW5Nb2RhbD1mdW5jdGlvbigpe28uZ2V0Tm9kZShhKS5jbGFzc0xpc3QuYWRkKHMpLHUuZGVmYXVsdC5pc09wZW49ITB9O3ZhciBmPWZ1bmN0aW9uKCl7by5nZXROb2RlKGEpLmNsYXNzTGlzdC5yZW1vdmUocyksdS5kZWZhdWx0LmlzT3Blbj0hMX07ZS5vbkFjdGlvbj1mdW5jdGlvbih0KXt2b2lkIDA9PT10JiYodD1yLkNBTkNFTF9LRVkpO3ZhciBlPXUuZGVmYXVsdC5hY3Rpb25zW3RdLG49ZS52YWx1ZTtpZighMT09PWUuY2xvc2VNb2RhbCl7dmFyIGk9YytcIi0tXCIrdDtvLmdldE5vZGUoaSkuY2xhc3NMaXN0LmFkZChsKX1lbHNlIGYoKTt1LmRlZmF1bHQucHJvbWlzZS5yZXNvbHZlKG4pfSxlLmdldFN0YXRlPWZ1bmN0aW9uKCl7dmFyIHQ9T2JqZWN0LmFzc2lnbih7fSx1LmRlZmF1bHQpO3JldHVybiBkZWxldGUgdC5wcm9taXNlLGRlbGV0ZSB0LnRpbWVyLHR9LGUuc3RvcExvYWRpbmc9ZnVuY3Rpb24oKXtmb3IodmFyIHQ9ZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5cIitjKSxlPTA7ZTx0Lmxlbmd0aDtlKyspe3RbZV0uY2xhc3NMaXN0LnJlbW92ZShsKX19fSxmdW5jdGlvbih0LGUpe3ZhciBuO249ZnVuY3Rpb24oKXtyZXR1cm4gdGhpc30oKTt0cnl7bj1ufHxGdW5jdGlvbihcInJldHVybiB0aGlzXCIpKCl8fCgwLGV2YWwpKFwidGhpc1wiKX1jYXRjaCh0KXtcIm9iamVjdFwiPT10eXBlb2Ygd2luZG93JiYobj13aW5kb3cpfXQuZXhwb3J0cz1ufSxmdW5jdGlvbih0LGUsbil7KGZ1bmN0aW9uKGUpe3QuZXhwb3J0cz1lLnN3ZWV0QWxlcnQ9big5KX0pLmNhbGwoZSxuKDcpKX0sZnVuY3Rpb24odCxlLG4peyhmdW5jdGlvbihlKXt0LmV4cG9ydHM9ZS5zd2FsPW4oMTApfSkuY2FsbChlLG4oNykpfSxmdW5jdGlvbih0LGUsbil7XCJ1bmRlZmluZWRcIiE9dHlwZW9mIHdpbmRvdyYmbigxMSksbigxNik7dmFyIG89bigyMykuZGVmYXVsdDt0LmV4cG9ydHM9b30sZnVuY3Rpb24odCxlLG4pe3ZhciBvPW4oMTIpO1wic3RyaW5nXCI9PXR5cGVvZiBvJiYobz1bW3QuaSxvLFwiXCJdXSk7dmFyIHI9e2luc2VydEF0OlwidG9wXCJ9O3IudHJhbnNmb3JtPXZvaWQgMDtuKDE0KShvLHIpO28ubG9jYWxzJiYodC5leHBvcnRzPW8ubG9jYWxzKX0sZnVuY3Rpb24odCxlLG4pe2U9dC5leHBvcnRzPW4oMTMpKHZvaWQgMCksZS5wdXNoKFt0LmksJy5zd2FsLWljb24tLWVycm9ye2JvcmRlci1jb2xvcjojZjI3NDc0Oy13ZWJraXQtYW5pbWF0aW9uOmFuaW1hdGVFcnJvckljb24gLjVzO2FuaW1hdGlvbjphbmltYXRlRXJyb3JJY29uIC41c30uc3dhbC1pY29uLS1lcnJvcl9feC1tYXJre3Bvc2l0aW9uOnJlbGF0aXZlO2Rpc3BsYXk6YmxvY2s7LXdlYmtpdC1hbmltYXRpb246YW5pbWF0ZVhNYXJrIC41czthbmltYXRpb246YW5pbWF0ZVhNYXJrIC41c30uc3dhbC1pY29uLS1lcnJvcl9fbGluZXtwb3NpdGlvbjphYnNvbHV0ZTtoZWlnaHQ6NXB4O3dpZHRoOjQ3cHg7YmFja2dyb3VuZC1jb2xvcjojZjI3NDc0O2Rpc3BsYXk6YmxvY2s7dG9wOjM3cHg7Ym9yZGVyLXJhZGl1czoycHh9LnN3YWwtaWNvbi0tZXJyb3JfX2xpbmUtLWxlZnR7LXdlYmtpdC10cmFuc2Zvcm06cm90YXRlKDQ1ZGVnKTt0cmFuc2Zvcm06cm90YXRlKDQ1ZGVnKTtsZWZ0OjE3cHh9LnN3YWwtaWNvbi0tZXJyb3JfX2xpbmUtLXJpZ2h0ey13ZWJraXQtdHJhbnNmb3JtOnJvdGF0ZSgtNDVkZWcpO3RyYW5zZm9ybTpyb3RhdGUoLTQ1ZGVnKTtyaWdodDoxNnB4fUAtd2Via2l0LWtleWZyYW1lcyBhbmltYXRlRXJyb3JJY29uezAley13ZWJraXQtdHJhbnNmb3JtOnJvdGF0ZVgoMTAwZGVnKTt0cmFuc2Zvcm06cm90YXRlWCgxMDBkZWcpO29wYWNpdHk6MH10b3std2Via2l0LXRyYW5zZm9ybTpyb3RhdGVYKDBkZWcpO3RyYW5zZm9ybTpyb3RhdGVYKDBkZWcpO29wYWNpdHk6MX19QGtleWZyYW1lcyBhbmltYXRlRXJyb3JJY29uezAley13ZWJraXQtdHJhbnNmb3JtOnJvdGF0ZVgoMTAwZGVnKTt0cmFuc2Zvcm06cm90YXRlWCgxMDBkZWcpO29wYWNpdHk6MH10b3std2Via2l0LXRyYW5zZm9ybTpyb3RhdGVYKDBkZWcpO3RyYW5zZm9ybTpyb3RhdGVYKDBkZWcpO29wYWNpdHk6MX19QC13ZWJraXQta2V5ZnJhbWVzIGFuaW1hdGVYTWFya3swJXstd2Via2l0LXRyYW5zZm9ybTpzY2FsZSguNCk7dHJhbnNmb3JtOnNjYWxlKC40KTttYXJnaW4tdG9wOjI2cHg7b3BhY2l0eTowfTUwJXstd2Via2l0LXRyYW5zZm9ybTpzY2FsZSguNCk7dHJhbnNmb3JtOnNjYWxlKC40KTttYXJnaW4tdG9wOjI2cHg7b3BhY2l0eTowfTgwJXstd2Via2l0LXRyYW5zZm9ybTpzY2FsZSgxLjE1KTt0cmFuc2Zvcm06c2NhbGUoMS4xNSk7bWFyZ2luLXRvcDotNnB4fXRvey13ZWJraXQtdHJhbnNmb3JtOnNjYWxlKDEpO3RyYW5zZm9ybTpzY2FsZSgxKTttYXJnaW4tdG9wOjA7b3BhY2l0eToxfX1Aa2V5ZnJhbWVzIGFuaW1hdGVYTWFya3swJXstd2Via2l0LXRyYW5zZm9ybTpzY2FsZSguNCk7dHJhbnNmb3JtOnNjYWxlKC40KTttYXJnaW4tdG9wOjI2cHg7b3BhY2l0eTowfTUwJXstd2Via2l0LXRyYW5zZm9ybTpzY2FsZSguNCk7dHJhbnNmb3JtOnNjYWxlKC40KTttYXJnaW4tdG9wOjI2cHg7b3BhY2l0eTowfTgwJXstd2Via2l0LXRyYW5zZm9ybTpzY2FsZSgxLjE1KTt0cmFuc2Zvcm06c2NhbGUoMS4xNSk7bWFyZ2luLXRvcDotNnB4fXRvey13ZWJraXQtdHJhbnNmb3JtOnNjYWxlKDEpO3RyYW5zZm9ybTpzY2FsZSgxKTttYXJnaW4tdG9wOjA7b3BhY2l0eToxfX0uc3dhbC1pY29uLS13YXJuaW5ne2JvcmRlci1jb2xvcjojZjhiYjg2Oy13ZWJraXQtYW5pbWF0aW9uOnB1bHNlV2FybmluZyAuNzVzIGluZmluaXRlIGFsdGVybmF0ZTthbmltYXRpb246cHVsc2VXYXJuaW5nIC43NXMgaW5maW5pdGUgYWx0ZXJuYXRlfS5zd2FsLWljb24tLXdhcm5pbmdfX2JvZHl7d2lkdGg6NXB4O2hlaWdodDo0N3B4O3RvcDoxMHB4O2JvcmRlci1yYWRpdXM6MnB4O21hcmdpbi1sZWZ0Oi0ycHh9LnN3YWwtaWNvbi0td2FybmluZ19fYm9keSwuc3dhbC1pY29uLS13YXJuaW5nX19kb3R7cG9zaXRpb246YWJzb2x1dGU7bGVmdDo1MCU7YmFja2dyb3VuZC1jb2xvcjojZjhiYjg2fS5zd2FsLWljb24tLXdhcm5pbmdfX2RvdHt3aWR0aDo3cHg7aGVpZ2h0OjdweDtib3JkZXItcmFkaXVzOjUwJTttYXJnaW4tbGVmdDotNHB4O2JvdHRvbTotMTFweH1ALXdlYmtpdC1rZXlmcmFtZXMgcHVsc2VXYXJuaW5nezAle2JvcmRlci1jb2xvcjojZjhkNDg2fXRve2JvcmRlci1jb2xvcjojZjhiYjg2fX1Aa2V5ZnJhbWVzIHB1bHNlV2FybmluZ3swJXtib3JkZXItY29sb3I6I2Y4ZDQ4Nn10b3tib3JkZXItY29sb3I6I2Y4YmI4Nn19LnN3YWwtaWNvbi0tc3VjY2Vzc3tib3JkZXItY29sb3I6I2E1ZGM4Nn0uc3dhbC1pY29uLS1zdWNjZXNzOmFmdGVyLC5zd2FsLWljb24tLXN1Y2Nlc3M6YmVmb3Jle2NvbnRlbnQ6XCJcIjtib3JkZXItcmFkaXVzOjUwJTtwb3NpdGlvbjphYnNvbHV0ZTt3aWR0aDo2MHB4O2hlaWdodDoxMjBweDtiYWNrZ3JvdW5kOiNmZmY7LXdlYmtpdC10cmFuc2Zvcm06cm90YXRlKDQ1ZGVnKTt0cmFuc2Zvcm06cm90YXRlKDQ1ZGVnKX0uc3dhbC1pY29uLS1zdWNjZXNzOmJlZm9yZXtib3JkZXItcmFkaXVzOjEyMHB4IDAgMCAxMjBweDt0b3A6LTdweDtsZWZ0Oi0zM3B4Oy13ZWJraXQtdHJhbnNmb3JtOnJvdGF0ZSgtNDVkZWcpO3RyYW5zZm9ybTpyb3RhdGUoLTQ1ZGVnKTstd2Via2l0LXRyYW5zZm9ybS1vcmlnaW46NjBweCA2MHB4O3RyYW5zZm9ybS1vcmlnaW46NjBweCA2MHB4fS5zd2FsLWljb24tLXN1Y2Nlc3M6YWZ0ZXJ7Ym9yZGVyLXJhZGl1czowIDEyMHB4IDEyMHB4IDA7dG9wOi0xMXB4O2xlZnQ6MzBweDstd2Via2l0LXRyYW5zZm9ybTpyb3RhdGUoLTQ1ZGVnKTt0cmFuc2Zvcm06cm90YXRlKC00NWRlZyk7LXdlYmtpdC10cmFuc2Zvcm0tb3JpZ2luOjAgNjBweDt0cmFuc2Zvcm0tb3JpZ2luOjAgNjBweDstd2Via2l0LWFuaW1hdGlvbjpyb3RhdGVQbGFjZWhvbGRlciA0LjI1cyBlYXNlLWluO2FuaW1hdGlvbjpyb3RhdGVQbGFjZWhvbGRlciA0LjI1cyBlYXNlLWlufS5zd2FsLWljb24tLXN1Y2Nlc3NfX3Jpbmd7d2lkdGg6ODBweDtoZWlnaHQ6ODBweDtib3JkZXI6NHB4IHNvbGlkIGhzbGEoOTgsNTUlLDY5JSwuMik7Ym9yZGVyLXJhZGl1czo1MCU7Ym94LXNpemluZzpjb250ZW50LWJveDtwb3NpdGlvbjphYnNvbHV0ZTtsZWZ0Oi00cHg7dG9wOi00cHg7ei1pbmRleDoyfS5zd2FsLWljb24tLXN1Y2Nlc3NfX2hpZGUtY29ybmVyc3t3aWR0aDo1cHg7aGVpZ2h0OjkwcHg7YmFja2dyb3VuZC1jb2xvcjojZmZmO3BhZGRpbmc6MXB4O3Bvc2l0aW9uOmFic29sdXRlO2xlZnQ6MjhweDt0b3A6OHB4O3otaW5kZXg6MTstd2Via2l0LXRyYW5zZm9ybTpyb3RhdGUoLTQ1ZGVnKTt0cmFuc2Zvcm06cm90YXRlKC00NWRlZyl9LnN3YWwtaWNvbi0tc3VjY2Vzc19fbGluZXtoZWlnaHQ6NXB4O2JhY2tncm91bmQtY29sb3I6I2E1ZGM4NjtkaXNwbGF5OmJsb2NrO2JvcmRlci1yYWRpdXM6MnB4O3Bvc2l0aW9uOmFic29sdXRlO3otaW5kZXg6Mn0uc3dhbC1pY29uLS1zdWNjZXNzX19saW5lLS10aXB7d2lkdGg6MjVweDtsZWZ0OjE0cHg7dG9wOjQ2cHg7LXdlYmtpdC10cmFuc2Zvcm06cm90YXRlKDQ1ZGVnKTt0cmFuc2Zvcm06cm90YXRlKDQ1ZGVnKTstd2Via2l0LWFuaW1hdGlvbjphbmltYXRlU3VjY2Vzc1RpcCAuNzVzO2FuaW1hdGlvbjphbmltYXRlU3VjY2Vzc1RpcCAuNzVzfS5zd2FsLWljb24tLXN1Y2Nlc3NfX2xpbmUtLWxvbmd7d2lkdGg6NDdweDtyaWdodDo4cHg7dG9wOjM4cHg7LXdlYmtpdC10cmFuc2Zvcm06cm90YXRlKC00NWRlZyk7dHJhbnNmb3JtOnJvdGF0ZSgtNDVkZWcpOy13ZWJraXQtYW5pbWF0aW9uOmFuaW1hdGVTdWNjZXNzTG9uZyAuNzVzO2FuaW1hdGlvbjphbmltYXRlU3VjY2Vzc0xvbmcgLjc1c31ALXdlYmtpdC1rZXlmcmFtZXMgcm90YXRlUGxhY2Vob2xkZXJ7MCV7LXdlYmtpdC10cmFuc2Zvcm06cm90YXRlKC00NWRlZyk7dHJhbnNmb3JtOnJvdGF0ZSgtNDVkZWcpfTUley13ZWJraXQtdHJhbnNmb3JtOnJvdGF0ZSgtNDVkZWcpO3RyYW5zZm9ybTpyb3RhdGUoLTQ1ZGVnKX0xMiV7LXdlYmtpdC10cmFuc2Zvcm06cm90YXRlKC00MDVkZWcpO3RyYW5zZm9ybTpyb3RhdGUoLTQwNWRlZyl9dG97LXdlYmtpdC10cmFuc2Zvcm06cm90YXRlKC00MDVkZWcpO3RyYW5zZm9ybTpyb3RhdGUoLTQwNWRlZyl9fUBrZXlmcmFtZXMgcm90YXRlUGxhY2Vob2xkZXJ7MCV7LXdlYmtpdC10cmFuc2Zvcm06cm90YXRlKC00NWRlZyk7dHJhbnNmb3JtOnJvdGF0ZSgtNDVkZWcpfTUley13ZWJraXQtdHJhbnNmb3JtOnJvdGF0ZSgtNDVkZWcpO3RyYW5zZm9ybTpyb3RhdGUoLTQ1ZGVnKX0xMiV7LXdlYmtpdC10cmFuc2Zvcm06cm90YXRlKC00MDVkZWcpO3RyYW5zZm9ybTpyb3RhdGUoLTQwNWRlZyl9dG97LXdlYmtpdC10cmFuc2Zvcm06cm90YXRlKC00MDVkZWcpO3RyYW5zZm9ybTpyb3RhdGUoLTQwNWRlZyl9fUAtd2Via2l0LWtleWZyYW1lcyBhbmltYXRlU3VjY2Vzc1RpcHswJXt3aWR0aDowO2xlZnQ6MXB4O3RvcDoxOXB4fTU0JXt3aWR0aDowO2xlZnQ6MXB4O3RvcDoxOXB4fTcwJXt3aWR0aDo1MHB4O2xlZnQ6LThweDt0b3A6MzdweH04NCV7d2lkdGg6MTdweDtsZWZ0OjIxcHg7dG9wOjQ4cHh9dG97d2lkdGg6MjVweDtsZWZ0OjE0cHg7dG9wOjQ1cHh9fUBrZXlmcmFtZXMgYW5pbWF0ZVN1Y2Nlc3NUaXB7MCV7d2lkdGg6MDtsZWZ0OjFweDt0b3A6MTlweH01NCV7d2lkdGg6MDtsZWZ0OjFweDt0b3A6MTlweH03MCV7d2lkdGg6NTBweDtsZWZ0Oi04cHg7dG9wOjM3cHh9ODQle3dpZHRoOjE3cHg7bGVmdDoyMXB4O3RvcDo0OHB4fXRve3dpZHRoOjI1cHg7bGVmdDoxNHB4O3RvcDo0NXB4fX1ALXdlYmtpdC1rZXlmcmFtZXMgYW5pbWF0ZVN1Y2Nlc3NMb25nezAle3dpZHRoOjA7cmlnaHQ6NDZweDt0b3A6NTRweH02NSV7d2lkdGg6MDtyaWdodDo0NnB4O3RvcDo1NHB4fTg0JXt3aWR0aDo1NXB4O3JpZ2h0OjA7dG9wOjM1cHh9dG97d2lkdGg6NDdweDtyaWdodDo4cHg7dG9wOjM4cHh9fUBrZXlmcmFtZXMgYW5pbWF0ZVN1Y2Nlc3NMb25nezAle3dpZHRoOjA7cmlnaHQ6NDZweDt0b3A6NTRweH02NSV7d2lkdGg6MDtyaWdodDo0NnB4O3RvcDo1NHB4fTg0JXt3aWR0aDo1NXB4O3JpZ2h0OjA7dG9wOjM1cHh9dG97d2lkdGg6NDdweDtyaWdodDo4cHg7dG9wOjM4cHh9fS5zd2FsLWljb24tLWluZm97Ym9yZGVyLWNvbG9yOiNjOWRhZTF9LnN3YWwtaWNvbi0taW5mbzpiZWZvcmV7d2lkdGg6NXB4O2hlaWdodDoyOXB4O2JvdHRvbToxN3B4O2JvcmRlci1yYWRpdXM6MnB4O21hcmdpbi1sZWZ0Oi0ycHh9LnN3YWwtaWNvbi0taW5mbzphZnRlciwuc3dhbC1pY29uLS1pbmZvOmJlZm9yZXtjb250ZW50OlwiXCI7cG9zaXRpb246YWJzb2x1dGU7bGVmdDo1MCU7YmFja2dyb3VuZC1jb2xvcjojYzlkYWUxfS5zd2FsLWljb24tLWluZm86YWZ0ZXJ7d2lkdGg6N3B4O2hlaWdodDo3cHg7Ym9yZGVyLXJhZGl1czo1MCU7bWFyZ2luLWxlZnQ6LTNweDt0b3A6MTlweH0uc3dhbC1pY29ue3dpZHRoOjgwcHg7aGVpZ2h0OjgwcHg7Ym9yZGVyLXdpZHRoOjRweDtib3JkZXItc3R5bGU6c29saWQ7Ym9yZGVyLXJhZGl1czo1MCU7cGFkZGluZzowO3Bvc2l0aW9uOnJlbGF0aXZlO2JveC1zaXppbmc6Y29udGVudC1ib3g7bWFyZ2luOjIwcHggYXV0b30uc3dhbC1pY29uOmZpcnN0LWNoaWxke21hcmdpbi10b3A6MzJweH0uc3dhbC1pY29uLS1jdXN0b217d2lkdGg6YXV0bztoZWlnaHQ6YXV0bzttYXgtd2lkdGg6MTAwJTtib3JkZXI6bm9uZTtib3JkZXItcmFkaXVzOjB9LnN3YWwtaWNvbiBpbWd7bWF4LXdpZHRoOjEwMCU7bWF4LWhlaWdodDoxMDAlfS5zd2FsLXRpdGxle2NvbG9yOnJnYmEoMCwwLDAsLjY1KTtmb250LXdlaWdodDo2MDA7dGV4dC10cmFuc2Zvcm06bm9uZTtwb3NpdGlvbjpyZWxhdGl2ZTtkaXNwbGF5OmJsb2NrO3BhZGRpbmc6MTNweCAxNnB4O2ZvbnQtc2l6ZToyN3B4O2xpbmUtaGVpZ2h0Om5vcm1hbDt0ZXh0LWFsaWduOmNlbnRlcjttYXJnaW4tYm90dG9tOjB9LnN3YWwtdGl0bGU6Zmlyc3QtY2hpbGR7bWFyZ2luLXRvcDoyNnB4fS5zd2FsLXRpdGxlOm5vdCg6Zmlyc3QtY2hpbGQpe3BhZGRpbmctYm90dG9tOjB9LnN3YWwtdGl0bGU6bm90KDpsYXN0LWNoaWxkKXttYXJnaW4tYm90dG9tOjEzcHh9LnN3YWwtdGV4dHtmb250LXNpemU6MTZweDtwb3NpdGlvbjpyZWxhdGl2ZTtmbG9hdDpub25lO2xpbmUtaGVpZ2h0Om5vcm1hbDt2ZXJ0aWNhbC1hbGlnbjp0b3A7dGV4dC1hbGlnbjpsZWZ0O2Rpc3BsYXk6aW5saW5lLWJsb2NrO21hcmdpbjowO3BhZGRpbmc6MCAxMHB4O2ZvbnQtd2VpZ2h0OjQwMDtjb2xvcjpyZ2JhKDAsMCwwLC42NCk7bWF4LXdpZHRoOmNhbGMoMTAwJSAtIDIwcHgpO292ZXJmbG93LXdyYXA6YnJlYWstd29yZDtib3gtc2l6aW5nOmJvcmRlci1ib3h9LnN3YWwtdGV4dDpmaXJzdC1jaGlsZHttYXJnaW4tdG9wOjQ1cHh9LnN3YWwtdGV4dDpsYXN0LWNoaWxke21hcmdpbi1ib3R0b206NDVweH0uc3dhbC1mb290ZXJ7dGV4dC1hbGlnbjpyaWdodDtwYWRkaW5nLXRvcDoxM3B4O21hcmdpbi10b3A6MTNweDtwYWRkaW5nOjEzcHggMTZweDtib3JkZXItcmFkaXVzOmluaGVyaXQ7Ym9yZGVyLXRvcC1sZWZ0LXJhZGl1czowO2JvcmRlci10b3AtcmlnaHQtcmFkaXVzOjB9LnN3YWwtYnV0dG9uLWNvbnRhaW5lcnttYXJnaW46NXB4O2Rpc3BsYXk6aW5saW5lLWJsb2NrO3Bvc2l0aW9uOnJlbGF0aXZlfS5zd2FsLWJ1dHRvbntiYWNrZ3JvdW5kLWNvbG9yOiM3Y2QxZjk7Y29sb3I6I2ZmZjtib3JkZXI6bm9uZTtib3gtc2hhZG93Om5vbmU7Ym9yZGVyLXJhZGl1czo1cHg7Zm9udC13ZWlnaHQ6NjAwO2ZvbnQtc2l6ZToxNHB4O3BhZGRpbmc6MTBweCAyNHB4O21hcmdpbjowO2N1cnNvcjpwb2ludGVyfS5zd2FsLWJ1dHRvbjpub3QoW2Rpc2FibGVkXSk6aG92ZXJ7YmFja2dyb3VuZC1jb2xvcjojNzhjYmYyfS5zd2FsLWJ1dHRvbjphY3RpdmV7YmFja2dyb3VuZC1jb2xvcjojNzBiY2UwfS5zd2FsLWJ1dHRvbjpmb2N1c3tvdXRsaW5lOm5vbmU7Ym94LXNoYWRvdzowIDAgMCAxcHggI2ZmZiwwIDAgMCAzcHggcmdiYSg0MywxMTQsMTY1LC4yOSl9LnN3YWwtYnV0dG9uW2Rpc2FibGVkXXtvcGFjaXR5Oi41O2N1cnNvcjpkZWZhdWx0fS5zd2FsLWJ1dHRvbjo6LW1vei1mb2N1cy1pbm5lcntib3JkZXI6MH0uc3dhbC1idXR0b24tLWNhbmNlbHtjb2xvcjojNTU1O2JhY2tncm91bmQtY29sb3I6I2VmZWZlZn0uc3dhbC1idXR0b24tLWNhbmNlbDpub3QoW2Rpc2FibGVkXSk6aG92ZXJ7YmFja2dyb3VuZC1jb2xvcjojZThlOGU4fS5zd2FsLWJ1dHRvbi0tY2FuY2VsOmFjdGl2ZXtiYWNrZ3JvdW5kLWNvbG9yOiNkN2Q3ZDd9LnN3YWwtYnV0dG9uLS1jYW5jZWw6Zm9jdXN7Ym94LXNoYWRvdzowIDAgMCAxcHggI2ZmZiwwIDAgMCAzcHggcmdiYSgxMTYsMTM2LDE1MCwuMjkpfS5zd2FsLWJ1dHRvbi0tZGFuZ2Vye2JhY2tncm91bmQtY29sb3I6I2U2NDk0Mn0uc3dhbC1idXR0b24tLWRhbmdlcjpub3QoW2Rpc2FibGVkXSk6aG92ZXJ7YmFja2dyb3VuZC1jb2xvcjojZGY0NzQwfS5zd2FsLWJ1dHRvbi0tZGFuZ2VyOmFjdGl2ZXtiYWNrZ3JvdW5kLWNvbG9yOiNjZjQyM2J9LnN3YWwtYnV0dG9uLS1kYW5nZXI6Zm9jdXN7Ym94LXNoYWRvdzowIDAgMCAxcHggI2ZmZiwwIDAgMCAzcHggcmdiYSgxNjUsNDMsNDMsLjI5KX0uc3dhbC1jb250ZW50e3BhZGRpbmc6MCAyMHB4O21hcmdpbi10b3A6MjBweDtmb250LXNpemU6bWVkaXVtfS5zd2FsLWNvbnRlbnQ6bGFzdC1jaGlsZHttYXJnaW4tYm90dG9tOjIwcHh9LnN3YWwtY29udGVudF9faW5wdXQsLnN3YWwtY29udGVudF9fdGV4dGFyZWF7LXdlYmtpdC1hcHBlYXJhbmNlOm5vbmU7YmFja2dyb3VuZC1jb2xvcjojZmZmO2JvcmRlcjpub25lO2ZvbnQtc2l6ZToxNHB4O2Rpc3BsYXk6YmxvY2s7Ym94LXNpemluZzpib3JkZXItYm94O3dpZHRoOjEwMCU7Ym9yZGVyOjFweCBzb2xpZCByZ2JhKDAsMCwwLC4xNCk7cGFkZGluZzoxMHB4IDEzcHg7Ym9yZGVyLXJhZGl1czoycHg7dHJhbnNpdGlvbjpib3JkZXItY29sb3IgLjJzfS5zd2FsLWNvbnRlbnRfX2lucHV0OmZvY3VzLC5zd2FsLWNvbnRlbnRfX3RleHRhcmVhOmZvY3Vze291dGxpbmU6bm9uZTtib3JkZXItY29sb3I6IzZkYjhmZn0uc3dhbC1jb250ZW50X190ZXh0YXJlYXtyZXNpemU6dmVydGljYWx9LnN3YWwtYnV0dG9uLS1sb2FkaW5ne2NvbG9yOnRyYW5zcGFyZW50fS5zd2FsLWJ1dHRvbi0tbG9hZGluZ34uc3dhbC1idXR0b25fX2xvYWRlcntvcGFjaXR5OjF9LnN3YWwtYnV0dG9uX19sb2FkZXJ7cG9zaXRpb246YWJzb2x1dGU7aGVpZ2h0OmF1dG87d2lkdGg6NDNweDt6LWluZGV4OjI7bGVmdDo1MCU7dG9wOjUwJTstd2Via2l0LXRyYW5zZm9ybTp0cmFuc2xhdGVYKC01MCUpIHRyYW5zbGF0ZVkoLTUwJSk7dHJhbnNmb3JtOnRyYW5zbGF0ZVgoLTUwJSkgdHJhbnNsYXRlWSgtNTAlKTt0ZXh0LWFsaWduOmNlbnRlcjtwb2ludGVyLWV2ZW50czpub25lO29wYWNpdHk6MH0uc3dhbC1idXR0b25fX2xvYWRlciBkaXZ7ZGlzcGxheTppbmxpbmUtYmxvY2s7ZmxvYXQ6bm9uZTt2ZXJ0aWNhbC1hbGlnbjpiYXNlbGluZTt3aWR0aDo5cHg7aGVpZ2h0OjlweDtwYWRkaW5nOjA7Ym9yZGVyOm5vbmU7bWFyZ2luOjJweDtvcGFjaXR5Oi40O2JvcmRlci1yYWRpdXM6N3B4O2JhY2tncm91bmQtY29sb3I6aHNsYSgwLDAlLDEwMCUsLjkpO3RyYW5zaXRpb246YmFja2dyb3VuZCAuMnM7LXdlYmtpdC1hbmltYXRpb246c3dhbC1sb2FkaW5nLWFuaW0gMXMgaW5maW5pdGU7YW5pbWF0aW9uOnN3YWwtbG9hZGluZy1hbmltIDFzIGluZmluaXRlfS5zd2FsLWJ1dHRvbl9fbG9hZGVyIGRpdjpudGgtY2hpbGQoM24rMil7LXdlYmtpdC1hbmltYXRpb24tZGVsYXk6LjE1czthbmltYXRpb24tZGVsYXk6LjE1c30uc3dhbC1idXR0b25fX2xvYWRlciBkaXY6bnRoLWNoaWxkKDNuKzMpey13ZWJraXQtYW5pbWF0aW9uLWRlbGF5Oi4zczthbmltYXRpb24tZGVsYXk6LjNzfUAtd2Via2l0LWtleWZyYW1lcyBzd2FsLWxvYWRpbmctYW5pbXswJXtvcGFjaXR5Oi40fTIwJXtvcGFjaXR5Oi40fTUwJXtvcGFjaXR5OjF9dG97b3BhY2l0eTouNH19QGtleWZyYW1lcyBzd2FsLWxvYWRpbmctYW5pbXswJXtvcGFjaXR5Oi40fTIwJXtvcGFjaXR5Oi40fTUwJXtvcGFjaXR5OjF9dG97b3BhY2l0eTouNH19LnN3YWwtb3ZlcmxheXtwb3NpdGlvbjpmaXhlZDt0b3A6MDtib3R0b206MDtsZWZ0OjA7cmlnaHQ6MDt0ZXh0LWFsaWduOmNlbnRlcjtmb250LXNpemU6MDtvdmVyZmxvdy15OmF1dG87YmFja2dyb3VuZC1jb2xvcjpyZ2JhKDAsMCwwLC40KTt6LWluZGV4OjEwMDAwO3BvaW50ZXItZXZlbnRzOm5vbmU7b3BhY2l0eTowO3RyYW5zaXRpb246b3BhY2l0eSAuM3N9LnN3YWwtb3ZlcmxheTpiZWZvcmV7Y29udGVudDpcIiBcIjtkaXNwbGF5OmlubGluZS1ibG9jazt2ZXJ0aWNhbC1hbGlnbjptaWRkbGU7aGVpZ2h0OjEwMCV9LnN3YWwtb3ZlcmxheS0tc2hvdy1tb2RhbHtvcGFjaXR5OjE7cG9pbnRlci1ldmVudHM6YXV0b30uc3dhbC1vdmVybGF5LS1zaG93LW1vZGFsIC5zd2FsLW1vZGFse29wYWNpdHk6MTtwb2ludGVyLWV2ZW50czphdXRvO2JveC1zaXppbmc6Ym9yZGVyLWJveDstd2Via2l0LWFuaW1hdGlvbjpzaG93U3dlZXRBbGVydCAuM3M7YW5pbWF0aW9uOnNob3dTd2VldEFsZXJ0IC4zczt3aWxsLWNoYW5nZTp0cmFuc2Zvcm19LnN3YWwtbW9kYWx7d2lkdGg6NDc4cHg7b3BhY2l0eTowO3BvaW50ZXItZXZlbnRzOm5vbmU7YmFja2dyb3VuZC1jb2xvcjojZmZmO3RleHQtYWxpZ246Y2VudGVyO2JvcmRlci1yYWRpdXM6NXB4O3Bvc2l0aW9uOnN0YXRpYzttYXJnaW46MjBweCBhdXRvO2Rpc3BsYXk6aW5saW5lLWJsb2NrO3ZlcnRpY2FsLWFsaWduOm1pZGRsZTstd2Via2l0LXRyYW5zZm9ybTpzY2FsZSgxKTt0cmFuc2Zvcm06c2NhbGUoMSk7LXdlYmtpdC10cmFuc2Zvcm0tb3JpZ2luOjUwJSA1MCU7dHJhbnNmb3JtLW9yaWdpbjo1MCUgNTAlO3otaW5kZXg6MTAwMDE7dHJhbnNpdGlvbjpvcGFjaXR5IC4ycywtd2Via2l0LXRyYW5zZm9ybSAuM3M7dHJhbnNpdGlvbjp0cmFuc2Zvcm0gLjNzLG9wYWNpdHkgLjJzO3RyYW5zaXRpb246dHJhbnNmb3JtIC4zcyxvcGFjaXR5IC4ycywtd2Via2l0LXRyYW5zZm9ybSAuM3N9QG1lZGlhIChtYXgtd2lkdGg6NTAwcHgpey5zd2FsLW1vZGFse3dpZHRoOmNhbGMoMTAwJSAtIDIwcHgpfX1ALXdlYmtpdC1rZXlmcmFtZXMgc2hvd1N3ZWV0QWxlcnR7MCV7LXdlYmtpdC10cmFuc2Zvcm06c2NhbGUoMSk7dHJhbnNmb3JtOnNjYWxlKDEpfTEley13ZWJraXQtdHJhbnNmb3JtOnNjYWxlKC41KTt0cmFuc2Zvcm06c2NhbGUoLjUpfTQ1JXstd2Via2l0LXRyYW5zZm9ybTpzY2FsZSgxLjA1KTt0cmFuc2Zvcm06c2NhbGUoMS4wNSl9ODAley13ZWJraXQtdHJhbnNmb3JtOnNjYWxlKC45NSk7dHJhbnNmb3JtOnNjYWxlKC45NSl9dG97LXdlYmtpdC10cmFuc2Zvcm06c2NhbGUoMSk7dHJhbnNmb3JtOnNjYWxlKDEpfX1Aa2V5ZnJhbWVzIHNob3dTd2VldEFsZXJ0ezAley13ZWJraXQtdHJhbnNmb3JtOnNjYWxlKDEpO3RyYW5zZm9ybTpzY2FsZSgxKX0xJXstd2Via2l0LXRyYW5zZm9ybTpzY2FsZSguNSk7dHJhbnNmb3JtOnNjYWxlKC41KX00NSV7LXdlYmtpdC10cmFuc2Zvcm06c2NhbGUoMS4wNSk7dHJhbnNmb3JtOnNjYWxlKDEuMDUpfTgwJXstd2Via2l0LXRyYW5zZm9ybTpzY2FsZSguOTUpO3RyYW5zZm9ybTpzY2FsZSguOTUpfXRvey13ZWJraXQtdHJhbnNmb3JtOnNjYWxlKDEpO3RyYW5zZm9ybTpzY2FsZSgxKX19JyxcIlwiXSl9LGZ1bmN0aW9uKHQsZSl7ZnVuY3Rpb24gbih0LGUpe3ZhciBuPXRbMV18fFwiXCIscj10WzNdO2lmKCFyKXJldHVybiBuO2lmKGUmJlwiZnVuY3Rpb25cIj09dHlwZW9mIGJ0b2Epe3ZhciBpPW8ocik7cmV0dXJuW25dLmNvbmNhdChyLnNvdXJjZXMubWFwKGZ1bmN0aW9uKHQpe3JldHVyblwiLyojIHNvdXJjZVVSTD1cIityLnNvdXJjZVJvb3QrdCtcIiAqL1wifSkpLmNvbmNhdChbaV0pLmpvaW4oXCJcXG5cIil9cmV0dXJuW25dLmpvaW4oXCJcXG5cIil9ZnVuY3Rpb24gbyh0KXtyZXR1cm5cIi8qIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04O2Jhc2U2NCxcIitidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeSh0KSkpKStcIiAqL1wifXQuZXhwb3J0cz1mdW5jdGlvbih0KXt2YXIgZT1bXTtyZXR1cm4gZS50b1N0cmluZz1mdW5jdGlvbigpe3JldHVybiB0aGlzLm1hcChmdW5jdGlvbihlKXt2YXIgbz1uKGUsdCk7cmV0dXJuIGVbMl0/XCJAbWVkaWEgXCIrZVsyXStcIntcIitvK1wifVwiOm99KS5qb2luKFwiXCIpfSxlLmk9ZnVuY3Rpb24odCxuKXtcInN0cmluZ1wiPT10eXBlb2YgdCYmKHQ9W1tudWxsLHQsXCJcIl1dKTtmb3IodmFyIG89e30scj0wO3I8dGhpcy5sZW5ndGg7cisrKXt2YXIgaT10aGlzW3JdWzBdO1wibnVtYmVyXCI9PXR5cGVvZiBpJiYob1tpXT0hMCl9Zm9yKHI9MDtyPHQubGVuZ3RoO3IrKyl7dmFyIGE9dFtyXTtcIm51bWJlclwiPT10eXBlb2YgYVswXSYmb1thWzBdXXx8KG4mJiFhWzJdP2FbMl09bjpuJiYoYVsyXT1cIihcIithWzJdK1wiKSBhbmQgKFwiK24rXCIpXCIpLGUucHVzaChhKSl9fSxlfX0sZnVuY3Rpb24odCxlLG4pe2Z1bmN0aW9uIG8odCxlKXtmb3IodmFyIG49MDtuPHQubGVuZ3RoO24rKyl7dmFyIG89dFtuXSxyPW1bby5pZF07aWYocil7ci5yZWZzKys7Zm9yKHZhciBpPTA7aTxyLnBhcnRzLmxlbmd0aDtpKyspci5wYXJ0c1tpXShvLnBhcnRzW2ldKTtmb3IoO2k8by5wYXJ0cy5sZW5ndGg7aSsrKXIucGFydHMucHVzaCh1KG8ucGFydHNbaV0sZSkpfWVsc2V7Zm9yKHZhciBhPVtdLGk9MDtpPG8ucGFydHMubGVuZ3RoO2krKylhLnB1c2godShvLnBhcnRzW2ldLGUpKTttW28uaWRdPXtpZDpvLmlkLHJlZnM6MSxwYXJ0czphfX19fWZ1bmN0aW9uIHIodCxlKXtmb3IodmFyIG49W10sbz17fSxyPTA7cjx0Lmxlbmd0aDtyKyspe3ZhciBpPXRbcl0sYT1lLmJhc2U/aVswXStlLmJhc2U6aVswXSxzPWlbMV0sYz1pWzJdLGw9aVszXSx1PXtjc3M6cyxtZWRpYTpjLHNvdXJjZU1hcDpsfTtvW2FdP29bYV0ucGFydHMucHVzaCh1KTpuLnB1c2gob1thXT17aWQ6YSxwYXJ0czpbdV19KX1yZXR1cm4gbn1mdW5jdGlvbiBpKHQsZSl7dmFyIG49dih0Lmluc2VydEludG8pO2lmKCFuKXRocm93IG5ldyBFcnJvcihcIkNvdWxkbid0IGZpbmQgYSBzdHlsZSB0YXJnZXQuIFRoaXMgcHJvYmFibHkgbWVhbnMgdGhhdCB0aGUgdmFsdWUgZm9yIHRoZSAnaW5zZXJ0SW50bycgcGFyYW1ldGVyIGlzIGludmFsaWQuXCIpO3ZhciBvPXdbdy5sZW5ndGgtMV07aWYoXCJ0b3BcIj09PXQuaW5zZXJ0QXQpbz9vLm5leHRTaWJsaW5nP24uaW5zZXJ0QmVmb3JlKGUsby5uZXh0U2libGluZyk6bi5hcHBlbmRDaGlsZChlKTpuLmluc2VydEJlZm9yZShlLG4uZmlyc3RDaGlsZCksdy5wdXNoKGUpO2Vsc2V7aWYoXCJib3R0b21cIiE9PXQuaW5zZXJ0QXQpdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCB2YWx1ZSBmb3IgcGFyYW1ldGVyICdpbnNlcnRBdCcuIE11c3QgYmUgJ3RvcCcgb3IgJ2JvdHRvbScuXCIpO24uYXBwZW5kQ2hpbGQoZSl9fWZ1bmN0aW9uIGEodCl7aWYobnVsbD09PXQucGFyZW50Tm9kZSlyZXR1cm4hMTt0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodCk7dmFyIGU9dy5pbmRleE9mKHQpO2U+PTAmJncuc3BsaWNlKGUsMSl9ZnVuY3Rpb24gcyh0KXt2YXIgZT1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7cmV0dXJuIHQuYXR0cnMudHlwZT1cInRleHQvY3NzXCIsbChlLHQuYXR0cnMpLGkodCxlKSxlfWZ1bmN0aW9uIGModCl7dmFyIGU9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpbmtcIik7cmV0dXJuIHQuYXR0cnMudHlwZT1cInRleHQvY3NzXCIsdC5hdHRycy5yZWw9XCJzdHlsZXNoZWV0XCIsbChlLHQuYXR0cnMpLGkodCxlKSxlfWZ1bmN0aW9uIGwodCxlKXtPYmplY3Qua2V5cyhlKS5mb3JFYWNoKGZ1bmN0aW9uKG4pe3Quc2V0QXR0cmlidXRlKG4sZVtuXSl9KX1mdW5jdGlvbiB1KHQsZSl7dmFyIG4sbyxyLGk7aWYoZS50cmFuc2Zvcm0mJnQuY3NzKXtpZighKGk9ZS50cmFuc2Zvcm0odC5jc3MpKSlyZXR1cm4gZnVuY3Rpb24oKXt9O3QuY3NzPWl9aWYoZS5zaW5nbGV0b24pe3ZhciBsPWgrKztuPWd8fChnPXMoZSkpLG89Zi5iaW5kKG51bGwsbixsLCExKSxyPWYuYmluZChudWxsLG4sbCwhMCl9ZWxzZSB0LnNvdXJjZU1hcCYmXCJmdW5jdGlvblwiPT10eXBlb2YgVVJMJiZcImZ1bmN0aW9uXCI9PXR5cGVvZiBVUkwuY3JlYXRlT2JqZWN0VVJMJiZcImZ1bmN0aW9uXCI9PXR5cGVvZiBVUkwucmV2b2tlT2JqZWN0VVJMJiZcImZ1bmN0aW9uXCI9PXR5cGVvZiBCbG9iJiZcImZ1bmN0aW9uXCI9PXR5cGVvZiBidG9hPyhuPWMoZSksbz1wLmJpbmQobnVsbCxuLGUpLHI9ZnVuY3Rpb24oKXthKG4pLG4uaHJlZiYmVVJMLnJldm9rZU9iamVjdFVSTChuLmhyZWYpfSk6KG49cyhlKSxvPWQuYmluZChudWxsLG4pLHI9ZnVuY3Rpb24oKXthKG4pfSk7cmV0dXJuIG8odCksZnVuY3Rpb24oZSl7aWYoZSl7aWYoZS5jc3M9PT10LmNzcyYmZS5tZWRpYT09PXQubWVkaWEmJmUuc291cmNlTWFwPT09dC5zb3VyY2VNYXApcmV0dXJuO28odD1lKX1lbHNlIHIoKX19ZnVuY3Rpb24gZih0LGUsbixvKXt2YXIgcj1uP1wiXCI6by5jc3M7aWYodC5zdHlsZVNoZWV0KXQuc3R5bGVTaGVldC5jc3NUZXh0PXgoZSxyKTtlbHNle3ZhciBpPWRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHIpLGE9dC5jaGlsZE5vZGVzO2FbZV0mJnQucmVtb3ZlQ2hpbGQoYVtlXSksYS5sZW5ndGg/dC5pbnNlcnRCZWZvcmUoaSxhW2VdKTp0LmFwcGVuZENoaWxkKGkpfX1mdW5jdGlvbiBkKHQsZSl7dmFyIG49ZS5jc3Msbz1lLm1lZGlhO2lmKG8mJnQuc2V0QXR0cmlidXRlKFwibWVkaWFcIixvKSx0LnN0eWxlU2hlZXQpdC5zdHlsZVNoZWV0LmNzc1RleHQ9bjtlbHNle2Zvcig7dC5maXJzdENoaWxkOyl0LnJlbW92ZUNoaWxkKHQuZmlyc3RDaGlsZCk7dC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShuKSl9fWZ1bmN0aW9uIHAodCxlLG4pe3ZhciBvPW4uY3NzLHI9bi5zb3VyY2VNYXAsaT12b2lkIDA9PT1lLmNvbnZlcnRUb0Fic29sdXRlVXJscyYmcjsoZS5jb252ZXJ0VG9BYnNvbHV0ZVVybHN8fGkpJiYobz15KG8pKSxyJiYobys9XCJcXG4vKiMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LFwiK2J0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KHIpKSkpK1wiICovXCIpO3ZhciBhPW5ldyBCbG9iKFtvXSx7dHlwZTpcInRleHQvY3NzXCJ9KSxzPXQuaHJlZjt0LmhyZWY9VVJMLmNyZWF0ZU9iamVjdFVSTChhKSxzJiZVUkwucmV2b2tlT2JqZWN0VVJMKHMpfXZhciBtPXt9LGI9ZnVuY3Rpb24odCl7dmFyIGU7cmV0dXJuIGZ1bmN0aW9uKCl7cmV0dXJuIHZvaWQgMD09PWUmJihlPXQuYXBwbHkodGhpcyxhcmd1bWVudHMpKSxlfX0oZnVuY3Rpb24oKXtyZXR1cm4gd2luZG93JiZkb2N1bWVudCYmZG9jdW1lbnQuYWxsJiYhd2luZG93LmF0b2J9KSx2PWZ1bmN0aW9uKHQpe3ZhciBlPXt9O3JldHVybiBmdW5jdGlvbihuKXtyZXR1cm4gdm9pZCAwPT09ZVtuXSYmKGVbbl09dC5jYWxsKHRoaXMsbikpLGVbbl19fShmdW5jdGlvbih0KXtyZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0KX0pLGc9bnVsbCxoPTAsdz1bXSx5PW4oMTUpO3QuZXhwb3J0cz1mdW5jdGlvbih0LGUpe2lmKFwidW5kZWZpbmVkXCIhPXR5cGVvZiBERUJVRyYmREVCVUcmJlwib2JqZWN0XCIhPXR5cGVvZiBkb2N1bWVudCl0aHJvdyBuZXcgRXJyb3IoXCJUaGUgc3R5bGUtbG9hZGVyIGNhbm5vdCBiZSB1c2VkIGluIGEgbm9uLWJyb3dzZXIgZW52aXJvbm1lbnRcIik7ZT1lfHx7fSxlLmF0dHJzPVwib2JqZWN0XCI9PXR5cGVvZiBlLmF0dHJzP2UuYXR0cnM6e30sZS5zaW5nbGV0b258fChlLnNpbmdsZXRvbj1iKCkpLGUuaW5zZXJ0SW50b3x8KGUuaW5zZXJ0SW50bz1cImhlYWRcIiksZS5pbnNlcnRBdHx8KGUuaW5zZXJ0QXQ9XCJib3R0b21cIik7dmFyIG49cih0LGUpO3JldHVybiBvKG4sZSksZnVuY3Rpb24odCl7Zm9yKHZhciBpPVtdLGE9MDthPG4ubGVuZ3RoO2ErKyl7dmFyIHM9blthXSxjPW1bcy5pZF07Yy5yZWZzLS0saS5wdXNoKGMpfWlmKHQpe28ocih0LGUpLGUpfWZvcih2YXIgYT0wO2E8aS5sZW5ndGg7YSsrKXt2YXIgYz1pW2FdO2lmKDA9PT1jLnJlZnMpe2Zvcih2YXIgbD0wO2w8Yy5wYXJ0cy5sZW5ndGg7bCsrKWMucGFydHNbbF0oKTtkZWxldGUgbVtjLmlkXX19fX07dmFyIHg9ZnVuY3Rpb24oKXt2YXIgdD1bXTtyZXR1cm4gZnVuY3Rpb24oZSxuKXtyZXR1cm4gdFtlXT1uLHQuZmlsdGVyKEJvb2xlYW4pLmpvaW4oXCJcXG5cIil9fSgpfSxmdW5jdGlvbih0LGUpe3QuZXhwb3J0cz1mdW5jdGlvbih0KXt2YXIgZT1cInVuZGVmaW5lZFwiIT10eXBlb2Ygd2luZG93JiZ3aW5kb3cubG9jYXRpb247aWYoIWUpdGhyb3cgbmV3IEVycm9yKFwiZml4VXJscyByZXF1aXJlcyB3aW5kb3cubG9jYXRpb25cIik7aWYoIXR8fFwic3RyaW5nXCIhPXR5cGVvZiB0KXJldHVybiB0O3ZhciBuPWUucHJvdG9jb2wrXCIvL1wiK2UuaG9zdCxvPW4rZS5wYXRobmFtZS5yZXBsYWNlKC9cXC9bXlxcL10qJC8sXCIvXCIpO3JldHVybiB0LnJlcGxhY2UoL3VybFxccypcXCgoKD86W14pKF18XFwoKD86W14pKF0rfFxcKFteKShdKlxcKSkqXFwpKSopXFwpL2dpLGZ1bmN0aW9uKHQsZSl7dmFyIHI9ZS50cmltKCkucmVwbGFjZSgvXlwiKC4qKVwiJC8sZnVuY3Rpb24odCxlKXtyZXR1cm4gZX0pLnJlcGxhY2UoL14nKC4qKSckLyxmdW5jdGlvbih0LGUpe3JldHVybiBlfSk7aWYoL14oI3xkYXRhOnxodHRwOlxcL1xcL3xodHRwczpcXC9cXC98ZmlsZTpcXC9cXC9cXC8pL2kudGVzdChyKSlyZXR1cm4gdDt2YXIgaTtyZXR1cm4gaT0wPT09ci5pbmRleE9mKFwiLy9cIik/cjowPT09ci5pbmRleE9mKFwiL1wiKT9uK3I6bytyLnJlcGxhY2UoL15cXC5cXC8vLFwiXCIpLFwidXJsKFwiK0pTT04uc3RyaW5naWZ5KGkpK1wiKVwifSl9fSxmdW5jdGlvbih0LGUsbil7dmFyIG89bigxNyk7XCJ1bmRlZmluZWRcIj09dHlwZW9mIHdpbmRvd3x8d2luZG93LlByb21pc2V8fCh3aW5kb3cuUHJvbWlzZT1vKSxuKDIxKSxTdHJpbmcucHJvdG90eXBlLmluY2x1ZGVzfHwoU3RyaW5nLnByb3RvdHlwZS5pbmNsdWRlcz1mdW5jdGlvbih0LGUpe1widXNlIHN0cmljdFwiO3JldHVyblwibnVtYmVyXCIhPXR5cGVvZiBlJiYoZT0wKSwhKGUrdC5sZW5ndGg+dGhpcy5sZW5ndGgpJiYtMSE9PXRoaXMuaW5kZXhPZih0LGUpfSksQXJyYXkucHJvdG90eXBlLmluY2x1ZGVzfHxPYmplY3QuZGVmaW5lUHJvcGVydHkoQXJyYXkucHJvdG90eXBlLFwiaW5jbHVkZXNcIix7dmFsdWU6ZnVuY3Rpb24odCxlKXtpZihudWxsPT10aGlzKXRocm93IG5ldyBUeXBlRXJyb3IoJ1widGhpc1wiIGlzIG51bGwgb3Igbm90IGRlZmluZWQnKTt2YXIgbj1PYmplY3QodGhpcyksbz1uLmxlbmd0aD4+PjA7aWYoMD09PW8pcmV0dXJuITE7Zm9yKHZhciByPTB8ZSxpPU1hdGgubWF4KHI+PTA/cjpvLU1hdGguYWJzKHIpLDApO2k8bzspe2lmKGZ1bmN0aW9uKHQsZSl7cmV0dXJuIHQ9PT1lfHxcIm51bWJlclwiPT10eXBlb2YgdCYmXCJudW1iZXJcIj09dHlwZW9mIGUmJmlzTmFOKHQpJiZpc05hTihlKX0obltpXSx0KSlyZXR1cm4hMDtpKyt9cmV0dXJuITF9fSksXCJ1bmRlZmluZWRcIiE9dHlwZW9mIHdpbmRvdyYmZnVuY3Rpb24odCl7dC5mb3JFYWNoKGZ1bmN0aW9uKHQpe3QuaGFzT3duUHJvcGVydHkoXCJyZW1vdmVcIil8fE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwicmVtb3ZlXCIse2NvbmZpZ3VyYWJsZTohMCxlbnVtZXJhYmxlOiEwLHdyaXRhYmxlOiEwLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMpfX0pfSl9KFtFbGVtZW50LnByb3RvdHlwZSxDaGFyYWN0ZXJEYXRhLnByb3RvdHlwZSxEb2N1bWVudFR5cGUucHJvdG90eXBlXSl9LGZ1bmN0aW9uKHQsZSxuKXsoZnVuY3Rpb24oZSl7IWZ1bmN0aW9uKG4pe2Z1bmN0aW9uIG8oKXt9ZnVuY3Rpb24gcih0LGUpe3JldHVybiBmdW5jdGlvbigpe3QuYXBwbHkoZSxhcmd1bWVudHMpfX1mdW5jdGlvbiBpKHQpe2lmKFwib2JqZWN0XCIhPXR5cGVvZiB0aGlzKXRocm93IG5ldyBUeXBlRXJyb3IoXCJQcm9taXNlcyBtdXN0IGJlIGNvbnN0cnVjdGVkIHZpYSBuZXdcIik7aWYoXCJmdW5jdGlvblwiIT10eXBlb2YgdCl0aHJvdyBuZXcgVHlwZUVycm9yKFwibm90IGEgZnVuY3Rpb25cIik7dGhpcy5fc3RhdGU9MCx0aGlzLl9oYW5kbGVkPSExLHRoaXMuX3ZhbHVlPXZvaWQgMCx0aGlzLl9kZWZlcnJlZHM9W10sZih0LHRoaXMpfWZ1bmN0aW9uIGEodCxlKXtmb3IoOzM9PT10Ll9zdGF0ZTspdD10Ll92YWx1ZTtpZigwPT09dC5fc3RhdGUpcmV0dXJuIHZvaWQgdC5fZGVmZXJyZWRzLnB1c2goZSk7dC5faGFuZGxlZD0hMCxpLl9pbW1lZGlhdGVGbihmdW5jdGlvbigpe3ZhciBuPTE9PT10Ll9zdGF0ZT9lLm9uRnVsZmlsbGVkOmUub25SZWplY3RlZDtpZihudWxsPT09bilyZXR1cm4gdm9pZCgxPT09dC5fc3RhdGU/czpjKShlLnByb21pc2UsdC5fdmFsdWUpO3ZhciBvO3RyeXtvPW4odC5fdmFsdWUpfWNhdGNoKHQpe3JldHVybiB2b2lkIGMoZS5wcm9taXNlLHQpfXMoZS5wcm9taXNlLG8pfSl9ZnVuY3Rpb24gcyh0LGUpe3RyeXtpZihlPT09dCl0aHJvdyBuZXcgVHlwZUVycm9yKFwiQSBwcm9taXNlIGNhbm5vdCBiZSByZXNvbHZlZCB3aXRoIGl0c2VsZi5cIik7aWYoZSYmKFwib2JqZWN0XCI9PXR5cGVvZiBlfHxcImZ1bmN0aW9uXCI9PXR5cGVvZiBlKSl7dmFyIG49ZS50aGVuO2lmKGUgaW5zdGFuY2VvZiBpKXJldHVybiB0Ll9zdGF0ZT0zLHQuX3ZhbHVlPWUsdm9pZCBsKHQpO2lmKFwiZnVuY3Rpb25cIj09dHlwZW9mIG4pcmV0dXJuIHZvaWQgZihyKG4sZSksdCl9dC5fc3RhdGU9MSx0Ll92YWx1ZT1lLGwodCl9Y2F0Y2goZSl7Yyh0LGUpfX1mdW5jdGlvbiBjKHQsZSl7dC5fc3RhdGU9Mix0Ll92YWx1ZT1lLGwodCl9ZnVuY3Rpb24gbCh0KXsyPT09dC5fc3RhdGUmJjA9PT10Ll9kZWZlcnJlZHMubGVuZ3RoJiZpLl9pbW1lZGlhdGVGbihmdW5jdGlvbigpe3QuX2hhbmRsZWR8fGkuX3VuaGFuZGxlZFJlamVjdGlvbkZuKHQuX3ZhbHVlKX0pO2Zvcih2YXIgZT0wLG49dC5fZGVmZXJyZWRzLmxlbmd0aDtlPG47ZSsrKWEodCx0Ll9kZWZlcnJlZHNbZV0pO3QuX2RlZmVycmVkcz1udWxsfWZ1bmN0aW9uIHUodCxlLG4pe3RoaXMub25GdWxmaWxsZWQ9XCJmdW5jdGlvblwiPT10eXBlb2YgdD90Om51bGwsdGhpcy5vblJlamVjdGVkPVwiZnVuY3Rpb25cIj09dHlwZW9mIGU/ZTpudWxsLHRoaXMucHJvbWlzZT1ufWZ1bmN0aW9uIGYodCxlKXt2YXIgbj0hMTt0cnl7dChmdW5jdGlvbih0KXtufHwobj0hMCxzKGUsdCkpfSxmdW5jdGlvbih0KXtufHwobj0hMCxjKGUsdCkpfSl9Y2F0Y2godCl7aWYobilyZXR1cm47bj0hMCxjKGUsdCl9fXZhciBkPXNldFRpbWVvdXQ7aS5wcm90b3R5cGUuY2F0Y2g9ZnVuY3Rpb24odCl7cmV0dXJuIHRoaXMudGhlbihudWxsLHQpfSxpLnByb3RvdHlwZS50aGVuPWZ1bmN0aW9uKHQsZSl7dmFyIG49bmV3IHRoaXMuY29uc3RydWN0b3Iobyk7cmV0dXJuIGEodGhpcyxuZXcgdSh0LGUsbikpLG59LGkuYWxsPWZ1bmN0aW9uKHQpe3ZhciBlPUFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHQpO3JldHVybiBuZXcgaShmdW5jdGlvbih0LG4pe2Z1bmN0aW9uIG8oaSxhKXt0cnl7aWYoYSYmKFwib2JqZWN0XCI9PXR5cGVvZiBhfHxcImZ1bmN0aW9uXCI9PXR5cGVvZiBhKSl7dmFyIHM9YS50aGVuO2lmKFwiZnVuY3Rpb25cIj09dHlwZW9mIHMpcmV0dXJuIHZvaWQgcy5jYWxsKGEsZnVuY3Rpb24odCl7byhpLHQpfSxuKX1lW2ldPWEsMD09LS1yJiZ0KGUpfWNhdGNoKHQpe24odCl9fWlmKDA9PT1lLmxlbmd0aClyZXR1cm4gdChbXSk7Zm9yKHZhciByPWUubGVuZ3RoLGk9MDtpPGUubGVuZ3RoO2krKylvKGksZVtpXSl9KX0saS5yZXNvbHZlPWZ1bmN0aW9uKHQpe3JldHVybiB0JiZcIm9iamVjdFwiPT10eXBlb2YgdCYmdC5jb25zdHJ1Y3Rvcj09PWk/dDpuZXcgaShmdW5jdGlvbihlKXtlKHQpfSl9LGkucmVqZWN0PWZ1bmN0aW9uKHQpe3JldHVybiBuZXcgaShmdW5jdGlvbihlLG4pe24odCl9KX0saS5yYWNlPWZ1bmN0aW9uKHQpe3JldHVybiBuZXcgaShmdW5jdGlvbihlLG4pe2Zvcih2YXIgbz0wLHI9dC5sZW5ndGg7bzxyO28rKyl0W29dLnRoZW4oZSxuKX0pfSxpLl9pbW1lZGlhdGVGbj1cImZ1bmN0aW9uXCI9PXR5cGVvZiBlJiZmdW5jdGlvbih0KXtlKHQpfXx8ZnVuY3Rpb24odCl7ZCh0LDApfSxpLl91bmhhbmRsZWRSZWplY3Rpb25Gbj1mdW5jdGlvbih0KXtcInVuZGVmaW5lZFwiIT10eXBlb2YgY29uc29sZSYmY29uc29sZSYmY29uc29sZS53YXJuKFwiUG9zc2libGUgVW5oYW5kbGVkIFByb21pc2UgUmVqZWN0aW9uOlwiLHQpfSxpLl9zZXRJbW1lZGlhdGVGbj1mdW5jdGlvbih0KXtpLl9pbW1lZGlhdGVGbj10fSxpLl9zZXRVbmhhbmRsZWRSZWplY3Rpb25Gbj1mdW5jdGlvbih0KXtpLl91bmhhbmRsZWRSZWplY3Rpb25Gbj10fSx2b2lkIDAhPT10JiZ0LmV4cG9ydHM/dC5leHBvcnRzPWk6bi5Qcm9taXNlfHwobi5Qcm9taXNlPWkpfSh0aGlzKX0pLmNhbGwoZSxuKDE4KS5zZXRJbW1lZGlhdGUpfSxmdW5jdGlvbih0LGUsbil7ZnVuY3Rpb24gbyh0LGUpe3RoaXMuX2lkPXQsdGhpcy5fY2xlYXJGbj1lfXZhciByPUZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseTtlLnNldFRpbWVvdXQ9ZnVuY3Rpb24oKXtyZXR1cm4gbmV3IG8oci5jYWxsKHNldFRpbWVvdXQsd2luZG93LGFyZ3VtZW50cyksY2xlYXJUaW1lb3V0KX0sZS5zZXRJbnRlcnZhbD1mdW5jdGlvbigpe3JldHVybiBuZXcgbyhyLmNhbGwoc2V0SW50ZXJ2YWwsd2luZG93LGFyZ3VtZW50cyksY2xlYXJJbnRlcnZhbCl9LGUuY2xlYXJUaW1lb3V0PWUuY2xlYXJJbnRlcnZhbD1mdW5jdGlvbih0KXt0JiZ0LmNsb3NlKCl9LG8ucHJvdG90eXBlLnVucmVmPW8ucHJvdG90eXBlLnJlZj1mdW5jdGlvbigpe30sby5wcm90b3R5cGUuY2xvc2U9ZnVuY3Rpb24oKXt0aGlzLl9jbGVhckZuLmNhbGwod2luZG93LHRoaXMuX2lkKX0sZS5lbnJvbGw9ZnVuY3Rpb24odCxlKXtjbGVhclRpbWVvdXQodC5faWRsZVRpbWVvdXRJZCksdC5faWRsZVRpbWVvdXQ9ZX0sZS51bmVucm9sbD1mdW5jdGlvbih0KXtjbGVhclRpbWVvdXQodC5faWRsZVRpbWVvdXRJZCksdC5faWRsZVRpbWVvdXQ9LTF9LGUuX3VucmVmQWN0aXZlPWUuYWN0aXZlPWZ1bmN0aW9uKHQpe2NsZWFyVGltZW91dCh0Ll9pZGxlVGltZW91dElkKTt2YXIgZT10Ll9pZGxlVGltZW91dDtlPj0wJiYodC5faWRsZVRpbWVvdXRJZD1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7dC5fb25UaW1lb3V0JiZ0Ll9vblRpbWVvdXQoKX0sZSkpfSxuKDE5KSxlLnNldEltbWVkaWF0ZT1zZXRJbW1lZGlhdGUsZS5jbGVhckltbWVkaWF0ZT1jbGVhckltbWVkaWF0ZX0sZnVuY3Rpb24odCxlLG4peyhmdW5jdGlvbih0LGUpeyFmdW5jdGlvbih0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIG8odCl7XCJmdW5jdGlvblwiIT10eXBlb2YgdCYmKHQ9bmV3IEZ1bmN0aW9uKFwiXCIrdCkpO2Zvcih2YXIgZT1uZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aC0xKSxuPTA7bjxlLmxlbmd0aDtuKyspZVtuXT1hcmd1bWVudHNbbisxXTt2YXIgbz17Y2FsbGJhY2s6dCxhcmdzOmV9O3JldHVybiBsW2NdPW8scyhjKSxjKyt9ZnVuY3Rpb24gcih0KXtkZWxldGUgbFt0XX1mdW5jdGlvbiBpKHQpe3ZhciBlPXQuY2FsbGJhY2ssbz10LmFyZ3M7c3dpdGNoKG8ubGVuZ3RoKXtjYXNlIDA6ZSgpO2JyZWFrO2Nhc2UgMTplKG9bMF0pO2JyZWFrO2Nhc2UgMjplKG9bMF0sb1sxXSk7YnJlYWs7Y2FzZSAzOmUob1swXSxvWzFdLG9bMl0pO2JyZWFrO2RlZmF1bHQ6ZS5hcHBseShuLG8pfX1mdW5jdGlvbiBhKHQpe2lmKHUpc2V0VGltZW91dChhLDAsdCk7ZWxzZXt2YXIgZT1sW3RdO2lmKGUpe3U9ITA7dHJ5e2koZSl9ZmluYWxseXtyKHQpLHU9ITF9fX19aWYoIXQuc2V0SW1tZWRpYXRlKXt2YXIgcyxjPTEsbD17fSx1PSExLGY9dC5kb2N1bWVudCxkPU9iamVjdC5nZXRQcm90b3R5cGVPZiYmT2JqZWN0LmdldFByb3RvdHlwZU9mKHQpO2Q9ZCYmZC5zZXRUaW1lb3V0P2Q6dCxcIltvYmplY3QgcHJvY2Vzc11cIj09PXt9LnRvU3RyaW5nLmNhbGwodC5wcm9jZXNzKT9mdW5jdGlvbigpe3M9ZnVuY3Rpb24odCl7ZS5uZXh0VGljayhmdW5jdGlvbigpe2EodCl9KX19KCk6ZnVuY3Rpb24oKXtpZih0LnBvc3RNZXNzYWdlJiYhdC5pbXBvcnRTY3JpcHRzKXt2YXIgZT0hMCxuPXQub25tZXNzYWdlO3JldHVybiB0Lm9ubWVzc2FnZT1mdW5jdGlvbigpe2U9ITF9LHQucG9zdE1lc3NhZ2UoXCJcIixcIipcIiksdC5vbm1lc3NhZ2U9bixlfX0oKT9mdW5jdGlvbigpe3ZhciBlPVwic2V0SW1tZWRpYXRlJFwiK01hdGgucmFuZG9tKCkrXCIkXCIsbj1mdW5jdGlvbihuKXtuLnNvdXJjZT09PXQmJlwic3RyaW5nXCI9PXR5cGVvZiBuLmRhdGEmJjA9PT1uLmRhdGEuaW5kZXhPZihlKSYmYSgrbi5kYXRhLnNsaWNlKGUubGVuZ3RoKSl9O3QuYWRkRXZlbnRMaXN0ZW5lcj90LmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsbiwhMSk6dC5hdHRhY2hFdmVudChcIm9ubWVzc2FnZVwiLG4pLHM9ZnVuY3Rpb24obil7dC5wb3N0TWVzc2FnZShlK24sXCIqXCIpfX0oKTp0Lk1lc3NhZ2VDaGFubmVsP2Z1bmN0aW9uKCl7dmFyIHQ9bmV3IE1lc3NhZ2VDaGFubmVsO3QucG9ydDEub25tZXNzYWdlPWZ1bmN0aW9uKHQpe2EodC5kYXRhKX0scz1mdW5jdGlvbihlKXt0LnBvcnQyLnBvc3RNZXNzYWdlKGUpfX0oKTpmJiZcIm9ucmVhZHlzdGF0ZWNoYW5nZVwiaW4gZi5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIpP2Z1bmN0aW9uKCl7dmFyIHQ9Zi5kb2N1bWVudEVsZW1lbnQ7cz1mdW5jdGlvbihlKXt2YXIgbj1mLmNyZWF0ZUVsZW1lbnQoXCJzY3JpcHRcIik7bi5vbnJlYWR5c3RhdGVjaGFuZ2U9ZnVuY3Rpb24oKXthKGUpLG4ub25yZWFkeXN0YXRlY2hhbmdlPW51bGwsdC5yZW1vdmVDaGlsZChuKSxuPW51bGx9LHQuYXBwZW5kQ2hpbGQobil9fSgpOmZ1bmN0aW9uKCl7cz1mdW5jdGlvbih0KXtzZXRUaW1lb3V0KGEsMCx0KX19KCksZC5zZXRJbW1lZGlhdGU9byxkLmNsZWFySW1tZWRpYXRlPXJ9fShcInVuZGVmaW5lZFwiPT10eXBlb2Ygc2VsZj92b2lkIDA9PT10P3RoaXM6dDpzZWxmKX0pLmNhbGwoZSxuKDcpLG4oMjApKX0sZnVuY3Rpb24odCxlKXtmdW5jdGlvbiBuKCl7dGhyb3cgbmV3IEVycm9yKFwic2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZFwiKX1mdW5jdGlvbiBvKCl7dGhyb3cgbmV3IEVycm9yKFwiY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkXCIpfWZ1bmN0aW9uIHIodCl7aWYodT09PXNldFRpbWVvdXQpcmV0dXJuIHNldFRpbWVvdXQodCwwKTtpZigodT09PW58fCF1KSYmc2V0VGltZW91dClyZXR1cm4gdT1zZXRUaW1lb3V0LHNldFRpbWVvdXQodCwwKTt0cnl7cmV0dXJuIHUodCwwKX1jYXRjaChlKXt0cnl7cmV0dXJuIHUuY2FsbChudWxsLHQsMCl9Y2F0Y2goZSl7cmV0dXJuIHUuY2FsbCh0aGlzLHQsMCl9fX1mdW5jdGlvbiBpKHQpe2lmKGY9PT1jbGVhclRpbWVvdXQpcmV0dXJuIGNsZWFyVGltZW91dCh0KTtpZigoZj09PW98fCFmKSYmY2xlYXJUaW1lb3V0KXJldHVybiBmPWNsZWFyVGltZW91dCxjbGVhclRpbWVvdXQodCk7dHJ5e3JldHVybiBmKHQpfWNhdGNoKGUpe3RyeXtyZXR1cm4gZi5jYWxsKG51bGwsdCl9Y2F0Y2goZSl7cmV0dXJuIGYuY2FsbCh0aGlzLHQpfX19ZnVuY3Rpb24gYSgpe2ImJnAmJihiPSExLHAubGVuZ3RoP209cC5jb25jYXQobSk6dj0tMSxtLmxlbmd0aCYmcygpKX1mdW5jdGlvbiBzKCl7aWYoIWIpe3ZhciB0PXIoYSk7Yj0hMDtmb3IodmFyIGU9bS5sZW5ndGg7ZTspe2ZvcihwPW0sbT1bXTsrK3Y8ZTspcCYmcFt2XS5ydW4oKTt2PS0xLGU9bS5sZW5ndGh9cD1udWxsLGI9ITEsaSh0KX19ZnVuY3Rpb24gYyh0LGUpe3RoaXMuZnVuPXQsdGhpcy5hcnJheT1lfWZ1bmN0aW9uIGwoKXt9dmFyIHUsZixkPXQuZXhwb3J0cz17fTshZnVuY3Rpb24oKXt0cnl7dT1cImZ1bmN0aW9uXCI9PXR5cGVvZiBzZXRUaW1lb3V0P3NldFRpbWVvdXQ6bn1jYXRjaCh0KXt1PW59dHJ5e2Y9XCJmdW5jdGlvblwiPT10eXBlb2YgY2xlYXJUaW1lb3V0P2NsZWFyVGltZW91dDpvfWNhdGNoKHQpe2Y9b319KCk7dmFyIHAsbT1bXSxiPSExLHY9LTE7ZC5uZXh0VGljaz1mdW5jdGlvbih0KXt2YXIgZT1uZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aC0xKTtpZihhcmd1bWVudHMubGVuZ3RoPjEpZm9yKHZhciBuPTE7bjxhcmd1bWVudHMubGVuZ3RoO24rKyllW24tMV09YXJndW1lbnRzW25dO20ucHVzaChuZXcgYyh0LGUpKSwxIT09bS5sZW5ndGh8fGJ8fHIocyl9LGMucHJvdG90eXBlLnJ1bj1mdW5jdGlvbigpe3RoaXMuZnVuLmFwcGx5KG51bGwsdGhpcy5hcnJheSl9LGQudGl0bGU9XCJicm93c2VyXCIsZC5icm93c2VyPSEwLGQuZW52PXt9LGQuYXJndj1bXSxkLnZlcnNpb249XCJcIixkLnZlcnNpb25zPXt9LGQub249bCxkLmFkZExpc3RlbmVyPWwsZC5vbmNlPWwsZC5vZmY9bCxkLnJlbW92ZUxpc3RlbmVyPWwsZC5yZW1vdmVBbGxMaXN0ZW5lcnM9bCxkLmVtaXQ9bCxkLnByZXBlbmRMaXN0ZW5lcj1sLGQucHJlcGVuZE9uY2VMaXN0ZW5lcj1sLGQubGlzdGVuZXJzPWZ1bmN0aW9uKHQpe3JldHVybltdfSxkLmJpbmRpbmc9ZnVuY3Rpb24odCl7dGhyb3cgbmV3IEVycm9yKFwicHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWRcIil9LGQuY3dkPWZ1bmN0aW9uKCl7cmV0dXJuXCIvXCJ9LGQuY2hkaXI9ZnVuY3Rpb24odCl7dGhyb3cgbmV3IEVycm9yKFwicHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkXCIpfSxkLnVtYXNrPWZ1bmN0aW9uKCl7cmV0dXJuIDB9fSxmdW5jdGlvbih0LGUsbil7XCJ1c2Ugc3RyaWN0XCI7bigyMikucG9seWZpbGwoKX0sZnVuY3Rpb24odCxlLG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIG8odCxlKXtpZih2b2lkIDA9PT10fHxudWxsPT09dCl0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNvbnZlcnQgZmlyc3QgYXJndW1lbnQgdG8gb2JqZWN0XCIpO2Zvcih2YXIgbj1PYmplY3QodCksbz0xO288YXJndW1lbnRzLmxlbmd0aDtvKyspe3ZhciByPWFyZ3VtZW50c1tvXTtpZih2b2lkIDAhPT1yJiZudWxsIT09cilmb3IodmFyIGk9T2JqZWN0LmtleXMoT2JqZWN0KHIpKSxhPTAscz1pLmxlbmd0aDthPHM7YSsrKXt2YXIgYz1pW2FdLGw9T2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihyLGMpO3ZvaWQgMCE9PWwmJmwuZW51bWVyYWJsZSYmKG5bY109cltjXSl9fXJldHVybiBufWZ1bmN0aW9uIHIoKXtPYmplY3QuYXNzaWdufHxPYmplY3QuZGVmaW5lUHJvcGVydHkoT2JqZWN0LFwiYXNzaWduXCIse2VudW1lcmFibGU6ITEsY29uZmlndXJhYmxlOiEwLHdyaXRhYmxlOiEwLHZhbHVlOm99KX10LmV4cG9ydHM9e2Fzc2lnbjpvLHBvbHlmaWxsOnJ9fSxmdW5jdGlvbih0LGUsbil7XCJ1c2Ugc3RyaWN0XCI7T2JqZWN0LmRlZmluZVByb3BlcnR5KGUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7dmFyIG89bigyNCkscj1uKDYpLGk9big1KSxhPW4oMzYpLHM9ZnVuY3Rpb24oKXtmb3IodmFyIHQ9W10sZT0wO2U8YXJndW1lbnRzLmxlbmd0aDtlKyspdFtlXT1hcmd1bWVudHNbZV07aWYoXCJ1bmRlZmluZWRcIiE9dHlwZW9mIHdpbmRvdyl7dmFyIG49YS5nZXRPcHRzLmFwcGx5KHZvaWQgMCx0KTtyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24odCxlKXtpLmRlZmF1bHQucHJvbWlzZT17cmVzb2x2ZTp0LHJlamVjdDplfSxvLmRlZmF1bHQobiksc2V0VGltZW91dChmdW5jdGlvbigpe3Iub3Blbk1vZGFsKCl9KX0pfX07cy5jbG9zZT1yLm9uQWN0aW9uLHMuZ2V0U3RhdGU9ci5nZXRTdGF0ZSxzLnNldEFjdGlvblZhbHVlPWkuc2V0QWN0aW9uVmFsdWUscy5zdG9wTG9hZGluZz1yLnN0b3BMb2FkaW5nLHMuc2V0RGVmYXVsdHM9YS5zZXREZWZhdWx0cyxlLmRlZmF1bHQ9c30sZnVuY3Rpb24odCxlLG4pe1widXNlIHN0cmljdFwiO09iamVjdC5kZWZpbmVQcm9wZXJ0eShlLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pO3ZhciBvPW4oMSkscj1uKDApLGk9ci5kZWZhdWx0Lk1PREFMLGE9big0KSxzPW4oMzQpLGM9bigzNSksbD1uKDEpO2UuaW5pdD1mdW5jdGlvbih0KXtvLmdldE5vZGUoaSl8fChkb2N1bWVudC5ib2R5fHxsLnRocm93RXJyKFwiWW91IGNhbiBvbmx5IHVzZSBTd2VldEFsZXJ0IEFGVEVSIHRoZSBET00gaGFzIGxvYWRlZCFcIikscy5kZWZhdWx0KCksYS5kZWZhdWx0KCkpLGEuaW5pdE1vZGFsQ29udGVudCh0KSxjLmRlZmF1bHQodCl9LGUuZGVmYXVsdD1lLmluaXR9LGZ1bmN0aW9uKHQsZSxuKXtcInVzZSBzdHJpY3RcIjtPYmplY3QuZGVmaW5lUHJvcGVydHkoZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KTt2YXIgbz1uKDApLHI9by5kZWZhdWx0Lk1PREFMO2UubW9kYWxNYXJrdXA9J1xcbiAgPGRpdiBjbGFzcz1cIicrcisnXCIgcm9sZT1cImRpYWxvZ1wiIGFyaWEtbW9kYWw9XCJ0cnVlXCI+PC9kaXY+JyxlLmRlZmF1bHQ9ZS5tb2RhbE1hcmt1cH0sZnVuY3Rpb24odCxlLG4pe1widXNlIHN0cmljdFwiO09iamVjdC5kZWZpbmVQcm9wZXJ0eShlLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pO3ZhciBvPW4oMCkscj1vLmRlZmF1bHQuT1ZFUkxBWSxpPSc8ZGl2IFxcbiAgICBjbGFzcz1cIicrcisnXCJcXG4gICAgdGFiSW5kZXg9XCItMVwiPlxcbiAgPC9kaXY+JztlLmRlZmF1bHQ9aX0sZnVuY3Rpb24odCxlLG4pe1widXNlIHN0cmljdFwiO09iamVjdC5kZWZpbmVQcm9wZXJ0eShlLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pO3ZhciBvPW4oMCkscj1vLmRlZmF1bHQuSUNPTjtlLmVycm9ySWNvbk1hcmt1cD1mdW5jdGlvbigpe3ZhciB0PXIrXCItLWVycm9yXCIsZT10K1wiX19saW5lXCI7cmV0dXJuJ1xcbiAgICA8ZGl2IGNsYXNzPVwiJyt0KydfX3gtbWFya1wiPlxcbiAgICAgIDxzcGFuIGNsYXNzPVwiJytlK1wiIFwiK2UrJy0tbGVmdFwiPjwvc3Bhbj5cXG4gICAgICA8c3BhbiBjbGFzcz1cIicrZStcIiBcIitlKyctLXJpZ2h0XCI+PC9zcGFuPlxcbiAgICA8L2Rpdj5cXG4gICd9LGUud2FybmluZ0ljb25NYXJrdXA9ZnVuY3Rpb24oKXt2YXIgdD1yK1wiLS13YXJuaW5nXCI7cmV0dXJuJ1xcbiAgICA8c3BhbiBjbGFzcz1cIicrdCsnX19ib2R5XCI+XFxuICAgICAgPHNwYW4gY2xhc3M9XCInK3QrJ19fZG90XCI+PC9zcGFuPlxcbiAgICA8L3NwYW4+XFxuICAnfSxlLnN1Y2Nlc3NJY29uTWFya3VwPWZ1bmN0aW9uKCl7dmFyIHQ9citcIi0tc3VjY2Vzc1wiO3JldHVybidcXG4gICAgPHNwYW4gY2xhc3M9XCInK3QrXCJfX2xpbmUgXCIrdCsnX19saW5lLS1sb25nXCI+PC9zcGFuPlxcbiAgICA8c3BhbiBjbGFzcz1cIicrdCtcIl9fbGluZSBcIit0KydfX2xpbmUtLXRpcFwiPjwvc3Bhbj5cXG5cXG4gICAgPGRpdiBjbGFzcz1cIicrdCsnX19yaW5nXCI+PC9kaXY+XFxuICAgIDxkaXYgY2xhc3M9XCInK3QrJ19faGlkZS1jb3JuZXJzXCI+PC9kaXY+XFxuICAnfX0sZnVuY3Rpb24odCxlLG4pe1widXNlIHN0cmljdFwiO09iamVjdC5kZWZpbmVQcm9wZXJ0eShlLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pO3ZhciBvPW4oMCkscj1vLmRlZmF1bHQuQ09OVEVOVDtlLmNvbnRlbnRNYXJrdXA9J1xcbiAgPGRpdiBjbGFzcz1cIicrcisnXCI+XFxuXFxuICA8L2Rpdj5cXG4nfSxmdW5jdGlvbih0LGUsbil7XCJ1c2Ugc3RyaWN0XCI7T2JqZWN0LmRlZmluZVByb3BlcnR5KGUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7dmFyIG89bigwKSxyPW8uZGVmYXVsdC5CVVRUT05fQ09OVEFJTkVSLGk9by5kZWZhdWx0LkJVVFRPTixhPW8uZGVmYXVsdC5CVVRUT05fTE9BREVSO2UuYnV0dG9uTWFya3VwPSdcXG4gIDxkaXYgY2xhc3M9XCInK3IrJ1wiPlxcblxcbiAgICA8YnV0dG9uXFxuICAgICAgY2xhc3M9XCInK2krJ1wiXFxuICAgID48L2J1dHRvbj5cXG5cXG4gICAgPGRpdiBjbGFzcz1cIicrYSsnXCI+XFxuICAgICAgPGRpdj48L2Rpdj5cXG4gICAgICA8ZGl2PjwvZGl2PlxcbiAgICAgIDxkaXY+PC9kaXY+XFxuICAgIDwvZGl2PlxcblxcbiAgPC9kaXY+XFxuJ30sZnVuY3Rpb24odCxlLG4pe1widXNlIHN0cmljdFwiO09iamVjdC5kZWZpbmVQcm9wZXJ0eShlLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pO3ZhciBvPW4oNCkscj1uKDIpLGk9bigwKSxhPWkuZGVmYXVsdC5JQ09OLHM9aS5kZWZhdWx0LklDT05fQ1VTVE9NLGM9W1wiZXJyb3JcIixcIndhcm5pbmdcIixcInN1Y2Nlc3NcIixcImluZm9cIl0sbD17ZXJyb3I6ci5lcnJvckljb25NYXJrdXAoKSx3YXJuaW5nOnIud2FybmluZ0ljb25NYXJrdXAoKSxzdWNjZXNzOnIuc3VjY2Vzc0ljb25NYXJrdXAoKX0sdT1mdW5jdGlvbih0LGUpe3ZhciBuPWErXCItLVwiK3Q7ZS5jbGFzc0xpc3QuYWRkKG4pO3ZhciBvPWxbdF07byYmKGUuaW5uZXJIVE1MPW8pfSxmPWZ1bmN0aW9uKHQsZSl7ZS5jbGFzc0xpc3QuYWRkKHMpO3ZhciBuPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7bi5zcmM9dCxlLmFwcGVuZENoaWxkKG4pfSxkPWZ1bmN0aW9uKHQpe2lmKHQpe3ZhciBlPW8uaW5qZWN0RWxJbnRvTW9kYWwoci5pY29uTWFya3VwKTtjLmluY2x1ZGVzKHQpP3UodCxlKTpmKHQsZSl9fTtlLmRlZmF1bHQ9ZH0sZnVuY3Rpb24odCxlLG4pe1widXNlIHN0cmljdFwiO09iamVjdC5kZWZpbmVQcm9wZXJ0eShlLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pO3ZhciBvPW4oMikscj1uKDQpLGk9ZnVuY3Rpb24odCl7bmF2aWdhdG9yLnVzZXJBZ2VudC5pbmNsdWRlcyhcIkFwcGxlV2ViS2l0XCIpJiYodC5zdHlsZS5kaXNwbGF5PVwibm9uZVwiLHQub2Zmc2V0SGVpZ2h0LHQuc3R5bGUuZGlzcGxheT1cIlwiKX07ZS5pbml0VGl0bGU9ZnVuY3Rpb24odCl7aWYodCl7dmFyIGU9ci5pbmplY3RFbEludG9Nb2RhbChvLnRpdGxlTWFya3VwKTtlLnRleHRDb250ZW50PXQsaShlKX19LGUuaW5pdFRleHQ9ZnVuY3Rpb24odCl7aWYodCl7dmFyIGU9ZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO3Quc3BsaXQoXCJcXG5cIikuZm9yRWFjaChmdW5jdGlvbih0LG4sbyl7ZS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0KSksbjxvLmxlbmd0aC0xJiZlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJiclwiKSl9KTt2YXIgbj1yLmluamVjdEVsSW50b01vZGFsKG8udGV4dE1hcmt1cCk7bi5hcHBlbmRDaGlsZChlKSxpKG4pfX19LGZ1bmN0aW9uKHQsZSxuKXtcInVzZSBzdHJpY3RcIjtPYmplY3QuZGVmaW5lUHJvcGVydHkoZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KTt2YXIgbz1uKDEpLHI9big0KSxpPW4oMCksYT1pLmRlZmF1bHQuQlVUVE9OLHM9aS5kZWZhdWx0LkRBTkdFUl9CVVRUT04sYz1uKDMpLGw9bigyKSx1PW4oNiksZj1uKDUpLGQ9ZnVuY3Rpb24odCxlLG4pe3ZhciByPWUudGV4dCxpPWUudmFsdWUsZD1lLmNsYXNzTmFtZSxwPWUuY2xvc2VNb2RhbCxtPW8uc3RyaW5nVG9Ob2RlKGwuYnV0dG9uTWFya3VwKSxiPW0ucXVlcnlTZWxlY3RvcihcIi5cIithKSx2PWErXCItLVwiK3Q7aWYoYi5jbGFzc0xpc3QuYWRkKHYpLGQpeyhBcnJheS5pc0FycmF5KGQpP2Q6ZC5zcGxpdChcIiBcIikpLmZpbHRlcihmdW5jdGlvbih0KXtyZXR1cm4gdC5sZW5ndGg+MH0pLmZvckVhY2goZnVuY3Rpb24odCl7Yi5jbGFzc0xpc3QuYWRkKHQpfSl9biYmdD09PWMuQ09ORklSTV9LRVkmJmIuY2xhc3NMaXN0LmFkZChzKSxiLnRleHRDb250ZW50PXI7dmFyIGc9e307cmV0dXJuIGdbdF09aSxmLnNldEFjdGlvblZhbHVlKGcpLGYuc2V0QWN0aW9uT3B0aW9uc0Zvcih0LHtjbG9zZU1vZGFsOnB9KSxiLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLGZ1bmN0aW9uKCl7cmV0dXJuIHUub25BY3Rpb24odCl9KSxtfSxwPWZ1bmN0aW9uKHQsZSl7dmFyIG49ci5pbmplY3RFbEludG9Nb2RhbChsLmZvb3Rlck1hcmt1cCk7Zm9yKHZhciBvIGluIHQpe3ZhciBpPXRbb10sYT1kKG8saSxlKTtpLnZpc2libGUmJm4uYXBwZW5kQ2hpbGQoYSl9MD09PW4uY2hpbGRyZW4ubGVuZ3RoJiZuLnJlbW92ZSgpfTtlLmRlZmF1bHQ9cH0sZnVuY3Rpb24odCxlLG4pe1widXNlIHN0cmljdFwiO09iamVjdC5kZWZpbmVQcm9wZXJ0eShlLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pO3ZhciBvPW4oMykscj1uKDQpLGk9bigyKSxhPW4oNSkscz1uKDYpLGM9bigwKSxsPWMuZGVmYXVsdC5DT05URU5ULHU9ZnVuY3Rpb24odCl7dC5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIixmdW5jdGlvbih0KXt2YXIgZT10LnRhcmdldCxuPWUudmFsdWU7YS5zZXRBY3Rpb25WYWx1ZShuKX0pLHQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsZnVuY3Rpb24odCl7aWYoXCJFbnRlclwiPT09dC5rZXkpcmV0dXJuIHMub25BY3Rpb24oby5DT05GSVJNX0tFWSl9KSxzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7dC5mb2N1cygpLGEuc2V0QWN0aW9uVmFsdWUoXCJcIil9LDApfSxmPWZ1bmN0aW9uKHQsZSxuKXt2YXIgbz1kb2N1bWVudC5jcmVhdGVFbGVtZW50KGUpLHI9bCtcIl9fXCIrZTtvLmNsYXNzTGlzdC5hZGQocik7Zm9yKHZhciBpIGluIG4pe3ZhciBhPW5baV07b1tpXT1hfVwiaW5wdXRcIj09PWUmJnUobyksdC5hcHBlbmRDaGlsZChvKX0sZD1mdW5jdGlvbih0KXtpZih0KXt2YXIgZT1yLmluamVjdEVsSW50b01vZGFsKGkuY29udGVudE1hcmt1cCksbj10LmVsZW1lbnQsbz10LmF0dHJpYnV0ZXM7XCJzdHJpbmdcIj09dHlwZW9mIG4/ZihlLG4sbyk6ZS5hcHBlbmRDaGlsZChuKX19O2UuZGVmYXVsdD1kfSxmdW5jdGlvbih0LGUsbil7XCJ1c2Ugc3RyaWN0XCI7T2JqZWN0LmRlZmluZVByb3BlcnR5KGUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7dmFyIG89bigxKSxyPW4oMiksaT1mdW5jdGlvbigpe3ZhciB0PW8uc3RyaW5nVG9Ob2RlKHIub3ZlcmxheU1hcmt1cCk7ZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0KX07ZS5kZWZhdWx0PWl9LGZ1bmN0aW9uKHQsZSxuKXtcInVzZSBzdHJpY3RcIjtPYmplY3QuZGVmaW5lUHJvcGVydHkoZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KTt2YXIgbz1uKDUpLHI9big2KSxpPW4oMSksYT1uKDMpLHM9bigwKSxjPXMuZGVmYXVsdC5NT0RBTCxsPXMuZGVmYXVsdC5CVVRUT04sdT1zLmRlZmF1bHQuT1ZFUkxBWSxmPWZ1bmN0aW9uKHQpe3QucHJldmVudERlZmF1bHQoKSx2KCl9LGQ9ZnVuY3Rpb24odCl7dC5wcmV2ZW50RGVmYXVsdCgpLGcoKX0scD1mdW5jdGlvbih0KXtpZihvLmRlZmF1bHQuaXNPcGVuKXN3aXRjaCh0LmtleSl7Y2FzZVwiRXNjYXBlXCI6cmV0dXJuIHIub25BY3Rpb24oYS5DQU5DRUxfS0VZKX19LG09ZnVuY3Rpb24odCl7aWYoby5kZWZhdWx0LmlzT3Blbilzd2l0Y2godC5rZXkpe2Nhc2VcIlRhYlwiOnJldHVybiBmKHQpfX0sYj1mdW5jdGlvbih0KXtpZihvLmRlZmF1bHQuaXNPcGVuKXJldHVyblwiVGFiXCI9PT10LmtleSYmdC5zaGlmdEtleT9kKHQpOnZvaWQgMH0sdj1mdW5jdGlvbigpe3ZhciB0PWkuZ2V0Tm9kZShsKTt0JiYodC50YWJJbmRleD0wLHQuZm9jdXMoKSl9LGc9ZnVuY3Rpb24oKXt2YXIgdD1pLmdldE5vZGUoYyksZT10LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuXCIrbCksbj1lLmxlbmd0aC0xLG89ZVtuXTtvJiZvLmZvY3VzKCl9LGg9ZnVuY3Rpb24odCl7dFt0Lmxlbmd0aC0xXS5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLG0pfSx3PWZ1bmN0aW9uKHQpe3RbMF0uYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIixiKX0seT1mdW5jdGlvbigpe3ZhciB0PWkuZ2V0Tm9kZShjKSxlPXQucXVlcnlTZWxlY3RvckFsbChcIi5cIitsKTtlLmxlbmd0aCYmKGgoZSksdyhlKSl9LHg9ZnVuY3Rpb24odCl7aWYoaS5nZXROb2RlKHUpPT09dC50YXJnZXQpcmV0dXJuIHIub25BY3Rpb24oYS5DQU5DRUxfS0VZKX0sXz1mdW5jdGlvbih0KXt2YXIgZT1pLmdldE5vZGUodSk7ZS5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIix4KSx0JiZlLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLHgpfSxrPWZ1bmN0aW9uKHQpe28uZGVmYXVsdC50aW1lciYmY2xlYXJUaW1lb3V0KG8uZGVmYXVsdC50aW1lciksdCYmKG8uZGVmYXVsdC50aW1lcj13aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpe3JldHVybiByLm9uQWN0aW9uKGEuQ0FOQ0VMX0tFWSl9LHQpKX0sTz1mdW5jdGlvbih0KXt0LmNsb3NlT25Fc2M/ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXVwXCIscCk6ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleXVwXCIscCksdC5kYW5nZXJNb2RlP3YoKTpnKCkseSgpLF8odC5jbG9zZU9uQ2xpY2tPdXRzaWRlKSxrKHQudGltZXIpfTtlLmRlZmF1bHQ9T30sZnVuY3Rpb24odCxlLG4pe1widXNlIHN0cmljdFwiO09iamVjdC5kZWZpbmVQcm9wZXJ0eShlLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pO3ZhciBvPW4oMSkscj1uKDMpLGk9bigzNyksYT1uKDM4KSxzPXt0aXRsZTpudWxsLHRleHQ6bnVsbCxpY29uOm51bGwsYnV0dG9uczpyLmRlZmF1bHRCdXR0b25MaXN0LGNvbnRlbnQ6bnVsbCxjbGFzc05hbWU6bnVsbCxjbG9zZU9uQ2xpY2tPdXRzaWRlOiEwLGNsb3NlT25Fc2M6ITAsZGFuZ2VyTW9kZTohMSx0aW1lcjpudWxsfSxjPU9iamVjdC5hc3NpZ24oe30scyk7ZS5zZXREZWZhdWx0cz1mdW5jdGlvbih0KXtjPU9iamVjdC5hc3NpZ24oe30scyx0KX07dmFyIGw9ZnVuY3Rpb24odCl7dmFyIGU9dCYmdC5idXR0b24sbj10JiZ0LmJ1dHRvbnM7cmV0dXJuIHZvaWQgMCE9PWUmJnZvaWQgMCE9PW4mJm8udGhyb3dFcnIoXCJDYW5ub3Qgc2V0IGJvdGggJ2J1dHRvbicgYW5kICdidXR0b25zJyBvcHRpb25zIVwiKSx2b2lkIDAhPT1lP3tjb25maXJtOmV9Om59LHU9ZnVuY3Rpb24odCl7cmV0dXJuIG8ub3JkaW5hbFN1ZmZpeE9mKHQrMSl9LGY9ZnVuY3Rpb24odCxlKXtvLnRocm93RXJyKHUoZSkrXCIgYXJndW1lbnQgKCdcIit0K1wiJykgaXMgaW52YWxpZFwiKX0sZD1mdW5jdGlvbih0LGUpe3ZhciBuPXQrMSxyPWVbbl07by5pc1BsYWluT2JqZWN0KHIpfHx2b2lkIDA9PT1yfHxvLnRocm93RXJyKFwiRXhwZWN0ZWQgXCIrdShuKStcIiBhcmd1bWVudCAoJ1wiK3IrXCInKSB0byBiZSBhIHBsYWluIG9iamVjdFwiKX0scD1mdW5jdGlvbih0LGUpe3ZhciBuPXQrMSxyPWVbbl07dm9pZCAwIT09ciYmby50aHJvd0VycihcIlVuZXhwZWN0ZWQgXCIrdShuKStcIiBhcmd1bWVudCAoXCIrcitcIilcIil9LG09ZnVuY3Rpb24odCxlLG4scil7dmFyIGk9dHlwZW9mIGUsYT1cInN0cmluZ1wiPT09aSxzPWUgaW5zdGFuY2VvZiBFbGVtZW50O2lmKGEpe2lmKDA9PT1uKXJldHVybnt0ZXh0OmV9O2lmKDE9PT1uKXJldHVybnt0ZXh0OmUsdGl0bGU6clswXX07aWYoMj09PW4pcmV0dXJuIGQobixyKSx7aWNvbjplfTtmKGUsbil9ZWxzZXtpZihzJiYwPT09bilyZXR1cm4gZChuLHIpLHtjb250ZW50OmV9O2lmKG8uaXNQbGFpbk9iamVjdChlKSlyZXR1cm4gcChuLHIpLGU7ZihlLG4pfX07ZS5nZXRPcHRzPWZ1bmN0aW9uKCl7Zm9yKHZhciB0PVtdLGU9MDtlPGFyZ3VtZW50cy5sZW5ndGg7ZSsrKXRbZV09YXJndW1lbnRzW2VdO3ZhciBuPXt9O3QuZm9yRWFjaChmdW5jdGlvbihlLG8pe3ZhciByPW0oMCxlLG8sdCk7T2JqZWN0LmFzc2lnbihuLHIpfSk7dmFyIG89bChuKTtuLmJ1dHRvbnM9ci5nZXRCdXR0b25MaXN0T3B0cyhvKSxkZWxldGUgbi5idXR0b24sbi5jb250ZW50PWkuZ2V0Q29udGVudE9wdHMobi5jb250ZW50KTt2YXIgdT1PYmplY3QuYXNzaWduKHt9LHMsYyxuKTtyZXR1cm4gT2JqZWN0LmtleXModSkuZm9yRWFjaChmdW5jdGlvbih0KXthLkRFUFJFQ0FURURfT1BUU1t0XSYmYS5sb2dEZXByZWNhdGlvbih0KX0pLHV9fSxmdW5jdGlvbih0LGUsbil7XCJ1c2Ugc3RyaWN0XCI7T2JqZWN0LmRlZmluZVByb3BlcnR5KGUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7dmFyIG89bigxKSxyPXtlbGVtZW50OlwiaW5wdXRcIixhdHRyaWJ1dGVzOntwbGFjZWhvbGRlcjpcIlwifX07ZS5nZXRDb250ZW50T3B0cz1mdW5jdGlvbih0KXt2YXIgZT17fTtyZXR1cm4gby5pc1BsYWluT2JqZWN0KHQpP09iamVjdC5hc3NpZ24oZSx0KTp0IGluc3RhbmNlb2YgRWxlbWVudD97ZWxlbWVudDp0fTpcImlucHV0XCI9PT10P3I6bnVsbH19LGZ1bmN0aW9uKHQsZSxuKXtcInVzZSBzdHJpY3RcIjtPYmplY3QuZGVmaW5lUHJvcGVydHkoZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxlLmxvZ0RlcHJlY2F0aW9uPWZ1bmN0aW9uKHQpe3ZhciBuPWUuREVQUkVDQVRFRF9PUFRTW3RdLG89bi5vbmx5UmVuYW1lLHI9bi5yZXBsYWNlbWVudCxpPW4uc3ViT3B0aW9uLGE9bi5saW5rLHM9bz9cInJlbmFtZWRcIjpcImRlcHJlY2F0ZWRcIixjPSdTd2VldEFsZXJ0IHdhcm5pbmc6IFwiJyt0KydcIiBvcHRpb24gaGFzIGJlZW4gJytzK1wiLlwiO2lmKHIpe2MrPVwiIFBsZWFzZSB1c2VcIisoaT8nIFwiJytpKydcIiBpbiAnOlwiIFwiKSsnXCInK3IrJ1wiIGluc3RlYWQuJ312YXIgbD1cImh0dHBzOi8vc3dlZXRhbGVydC5qcy5vcmdcIjtjKz1hP1wiIE1vcmUgZGV0YWlsczogXCIrbCthOlwiIE1vcmUgZGV0YWlsczogXCIrbCtcIi9ndWlkZXMvI3VwZ3JhZGluZy1mcm9tLTF4XCIsY29uc29sZS53YXJuKGMpfSxlLkRFUFJFQ0FURURfT1BUUz17dHlwZTp7cmVwbGFjZW1lbnQ6XCJpY29uXCIsbGluazpcIi9kb2NzLyNpY29uXCJ9LGltYWdlVXJsOntyZXBsYWNlbWVudDpcImljb25cIixsaW5rOlwiL2RvY3MvI2ljb25cIn0sY3VzdG9tQ2xhc3M6e3JlcGxhY2VtZW50OlwiY2xhc3NOYW1lXCIsb25seVJlbmFtZTohMCxsaW5rOlwiL2RvY3MvI2NsYXNzbmFtZVwifSxpbWFnZVNpemU6e30sc2hvd0NhbmNlbEJ1dHRvbjp7cmVwbGFjZW1lbnQ6XCJidXR0b25zXCIsbGluazpcIi9kb2NzLyNidXR0b25zXCJ9LHNob3dDb25maXJtQnV0dG9uOntyZXBsYWNlbWVudDpcImJ1dHRvblwiLGxpbms6XCIvZG9jcy8jYnV0dG9uXCJ9LGNvbmZpcm1CdXR0b25UZXh0OntyZXBsYWNlbWVudDpcImJ1dHRvblwiLGxpbms6XCIvZG9jcy8jYnV0dG9uXCJ9LGNvbmZpcm1CdXR0b25Db2xvcjp7fSxjYW5jZWxCdXR0b25UZXh0OntyZXBsYWNlbWVudDpcImJ1dHRvbnNcIixsaW5rOlwiL2RvY3MvI2J1dHRvbnNcIn0sY2xvc2VPbkNvbmZpcm06e3JlcGxhY2VtZW50OlwiYnV0dG9uXCIsc3ViT3B0aW9uOlwiY2xvc2VNb2RhbFwiLGxpbms6XCIvZG9jcy8jYnV0dG9uXCJ9LGNsb3NlT25DYW5jZWw6e3JlcGxhY2VtZW50OlwiYnV0dG9uc1wiLHN1Yk9wdGlvbjpcImNsb3NlTW9kYWxcIixsaW5rOlwiL2RvY3MvI2J1dHRvbnNcIn0sc2hvd0xvYWRlck9uQ29uZmlybTp7cmVwbGFjZW1lbnQ6XCJidXR0b25zXCJ9LGFuaW1hdGlvbjp7fSxpbnB1dFR5cGU6e3JlcGxhY2VtZW50OlwiY29udGVudFwiLGxpbms6XCIvZG9jcy8jY29udGVudFwifSxpbnB1dFZhbHVlOntyZXBsYWNlbWVudDpcImNvbnRlbnRcIixsaW5rOlwiL2RvY3MvI2NvbnRlbnRcIn0saW5wdXRQbGFjZWhvbGRlcjp7cmVwbGFjZW1lbnQ6XCJjb250ZW50XCIsbGluazpcIi9kb2NzLyNjb250ZW50XCJ9LGh0bWw6e3JlcGxhY2VtZW50OlwiY29udGVudFwiLGxpbms6XCIvZG9jcy8jY29udGVudFwifSxhbGxvd0VzY2FwZUtleTp7cmVwbGFjZW1lbnQ6XCJjbG9zZU9uRXNjXCIsb25seVJlbmFtZTohMCxsaW5rOlwiL2RvY3MvI2Nsb3Nlb25lc2NcIn0sYWxsb3dDbGlja091dHNpZGU6e3JlcGxhY2VtZW50OlwiY2xvc2VPbkNsaWNrT3V0c2lkZVwiLG9ubHlSZW5hbWU6ITAsbGluazpcIi9kb2NzLyNjbG9zZW9uY2xpY2tvdXRzaWRlXCJ9fX1dKX0pOyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmNvbnN0IHNob3J0VXJsQmFzZSA9ICdodHRwOi8vbG9jYWxob3N0OjMwMDAvcmVkaXJlY3QvJ1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVGFibGVSb3dIZWFkZXIocm93TnVtKSB7XHJcbiAgY29uc3Qgcm93SGVhZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGgnKTtcclxuICByb3dIZWFkZXIudGV4dENvbnRlbnQgPSByb3dOdW07XHJcbiAgcmV0dXJuIHJvd0hlYWRlcjtcclxufVxyXG5cclxuLy8gaGVyZSBJZiBJIGNoZWNrIGlmIHRoZSB1cmwgaXMgaXMgdGhlIG9uZSB0aGUgdXNlciBqdXN0IGVudGVyZWQgdG8gc28gSSBjYW4gcmVhZGlseSBzaG93IGhpbVxyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlT3JpZ2luYWxVcmxUYWJsZUVsZW1lbnQodXJsSW5mbykge1xyXG4gIGlmICh1cmxJbmZvLm9yaWdpbmFsVXJsID09PSBvcmlnaW5hbFVybElucHV0LnZhbHVlKSB7XHJcbiAgICBkaXNwbGF5U2hvcnRVcmwodXJsSW5mby5zaG9ydFVybElkKTtcclxuICB9XHJcbiAgY29uc3QgX29yaWdpbmFsVXJsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKTtcclxuICBfb3JpZ2luYWxVcmwudGV4dENvbnRlbnQgPSB1cmxJbmZvLm9yaWdpbmFsVXJsO1xyXG4gIF9vcmlnaW5hbFVybC5jbGFzc0xpc3QuYWRkKCdsZW5ndGhDb250cm9sJyk7XHJcbiAgcmV0dXJuIF9vcmlnaW5hbFVybDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVRhYmxlRWxlbWVudCh0ZXh0KSB7XHJcbiAgY29uc3QgdGFibGVFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKTtcclxuICB0YWJsZUVsZW1lbnQudGV4dENvbnRlbnQgPSB0ZXh0O1xyXG4gIHJldHVybiB0YWJsZUVsZW1lbnQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTaG9ydFVybFRhYmxlRWxlbWVudChzaG9ydFVybElkKSB7XHJcbiAgY29uc3QgdGFibGVFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKTtcclxuICB0YWJsZUVsZW1lbnQuYXBwZW5kKGNyZWF0ZUxpbmsoc2hvcnRVcmxCYXNlICsgc2hvcnRVcmxJZCkpO1xyXG4gIHJldHVybiB0YWJsZUVsZW1lbnQ7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRpc3BsYXlTaG9ydFVybChzaG9ydFVybElkKSB7XHJcbiAgc2hvcnRlbmRVcmwudGV4dENvbnRlbnQgPSAnJztcclxuICBzaG9ydGVuZFVybC5hcHBlbmQoY3JlYXRlTGluayhzaG9ydFVybEJhc2UgKyBzaG9ydFVybElkKSk7XHJcbn1cclxuZnVuY3Rpb24gY3JlYXRlTGluayhzaG9ydFVybCkge1xyXG4gIGNvbnN0IGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XHJcbiAgbGluay50ZXh0Q29udGVudCA9IHNob3J0VXJsO1xyXG4gIGxpbmsuaHJlZiA9IHNob3J0VXJsO1xyXG4gIHJldHVybiBsaW5rO1xyXG59XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuaW1wb3J0IHtcclxuICBjcmVhdGVPcmlnaW5hbFVybFRhYmxlRWxlbWVudCxcclxuICBjcmVhdGVTaG9ydFVybFRhYmxlRWxlbWVudCxcclxuICBjcmVhdGVUYWJsZUVsZW1lbnQsXHJcbiAgY3JlYXRlVGFibGVSb3dIZWFkZXIsXHJcbn0gZnJvbSAnLi9jcmVhdGVGdW5jdGlvbnMuanMnO1xyXG5cclxuLy8gdGhpcyBmdW5jdGlvbiBkaXNwbGF5cyBhbGwgdGhlIGRhdGFcclxuZXhwb3J0IGZ1bmN0aW9uIGRpc3BsYXlEYXRhKGRhdGEpIHtcclxuICBsZXQgaSA9IDA7XHJcbiAgZGlzcGxheVVybEluZm8udGV4dENvbnRlbnQgPSAnJztcclxuICBmb3IgKGNvbnN0IHVybEluZm8gaW4gZGF0YSkge1xyXG4gICAgY29uc3QgdGFibGVSb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0cicpO1xyXG4gICAgdGFibGVSb3cuYXBwZW5kKGNyZWF0ZVRhYmxlUm93SGVhZGVyKCsraSkpO1xyXG4gICAgdGFibGVSb3cuYXBwZW5kKGNyZWF0ZU9yaWdpbmFsVXJsVGFibGVFbGVtZW50KGRhdGFbdXJsSW5mb10pKTtcclxuICAgIHRhYmxlUm93LmFwcGVuZChjcmVhdGVUYWJsZUVsZW1lbnQoZGF0YVt1cmxJbmZvXS5yZWRpcmVjdENvdW50KSk7XHJcbiAgICB0YWJsZVJvdy5hcHBlbmQoY3JlYXRlVGFibGVFbGVtZW50KGRhdGFbdXJsSW5mb10uY3JlYXRpb25EYXRlKSk7XHJcbiAgICB0YWJsZVJvdy5hcHBlbmQoY3JlYXRlU2hvcnRVcmxUYWJsZUVsZW1lbnQoZGF0YVt1cmxJbmZvXS5zaG9ydFVybElkKSk7XHJcbiAgICBkaXNwbGF5VXJsSW5mby5hcHBlbmQodGFibGVSb3cpO1xyXG4gIH1cclxufVxyXG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdGlkOiBtb2R1bGVJZCxcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbl9fd2VicGFja19yZXF1aXJlX18ubiA9IChtb2R1bGUpID0+IHtcblx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG5cdFx0KCkgPT4gKG1vZHVsZVsnZGVmYXVsdCddKSA6XG5cdFx0KCkgPT4gKG1vZHVsZSk7XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xyXG5pbXBvcnQgJy4vc3R5bGUuY3NzJztcclxuaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJztcclxuaW1wb3J0IHN3YWwgZnJvbSAnc3dlZXRhbGVydCc7XHJcbmltcG9ydCB7ZGlzcGxheURhdGF9IGZyb20gJy4vbW9kdWxlcy9kaXNwbGF5RGF0YS5qcydcclxuXHJcbmV4cG9ydCBjb25zdCBiYXNlVXJsID0gJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMC8nO1xyXG5cclxuc2hvcnRlbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNob3J0ZW5pbmdVcmwpO1xyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGdldFRhYmxlRGF0YSk7XHJcblxyXG4vLyBsb2FkcyB0aGUgaW5mb3JtYXRpb24gZm9yIHRoZSB0YWJsZSBldmVyeXRpbWUgeW91IG9wZW4gdGhlIHBhZ2VcclxuZnVuY3Rpb24gZ2V0VGFibGVEYXRhKCkge1xyXG4gIGF4aW9zLmdldChgJHtiYXNlVXJsfXNob3J0ZW5kL2xpc3RgKS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgZGlzcGxheURhdGEocmVzcG9uc2UuZGF0YSk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIHNlbmRzIHJlcXVlc3QgdG8gc2hvcnRlbiBVcmwgYW5kIHJlc3BvbmRzIGFjY29yZGluZ2x5XHJcbmZ1bmN0aW9uIHNob3J0ZW5pbmdVcmwoZXZlbnQpIHtcclxuICBheGlvc1xyXG4gICAgLnBvc3QoYCR7YmFzZVVybH1zaG9ydGVuYCwge1xyXG4gICAgICBvcmlnaW5hbFVybDogb3JpZ2luYWxVcmxJbnB1dC52YWx1ZSxcclxuICAgIH0pXHJcbiAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgZGlzcGxheURhdGEocmVzcG9uc2UuZGF0YSk7XHJcbiAgICAgIG9yaWdpbmFsVXJsSW5wdXQudmFsdWUgPSAnJztcclxuICAgIH0pXHJcbiAgICAuY2F0Y2goKGVycikgPT4ge1xyXG4gICAgICAvLyB0aGlzIGlzIGFuIGV4dGVudGlvbiBJIHVzZSBpbnN0ZWFkIG9mIHVzaW5nIGFsZXJ0XHJcbiAgICAgIHN3YWwoYEVycm9yOiAke2Vyci5yZXNwb25zZS5zdGF0dXN9YCwgZXJyLnJlc3BvbnNlLmRhdGEsICdlcnJvcicpXHJcbiAgICB9KTtcclxufVxyXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=