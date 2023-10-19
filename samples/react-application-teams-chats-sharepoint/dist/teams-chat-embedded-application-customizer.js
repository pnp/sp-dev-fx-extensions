define("c129df59-b7ec-487d-b748-e197e12a16f8_0.0.1", ["TeamsChatEmbeddedApplicationCustomizerStrings","@microsoft/sp-application-base","react","react-dom","@microsoft/decorators"], function(__WEBPACK_EXTERNAL_MODULE__91a9__, __WEBPACK_EXTERNAL_MODULE_GPet__, __WEBPACK_EXTERNAL_MODULE_cDcd__, __WEBPACK_EXTERNAL_MODULE_faye__, __WEBPACK_EXTERNAL_MODULE_wxtz__) { return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "hLTl");
/******/ })
/************************************************************************/
/******/ ({

/***/ "+t9t":
/*!***************************************************!*\
  !*** ./node_modules/@pnp/graph/graphqueryable.js ***!
  \***************************************************/
/*! exports provided: graphInvokableFactory, _GraphQueryable, GraphQueryable, _GraphQueryableCollection, GraphQueryableCollection, _GraphQueryableInstance, GraphQueryableInstance */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "graphInvokableFactory", function() { return graphInvokableFactory; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "_GraphQueryable", function() { return _GraphQueryable; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GraphQueryable", function() { return GraphQueryable; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "_GraphQueryableCollection", function() { return _GraphQueryableCollection; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GraphQueryableCollection", function() { return GraphQueryableCollection; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "_GraphQueryableInstance", function() { return _GraphQueryableInstance; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GraphQueryableInstance", function() { return GraphQueryableInstance; });
/* harmony import */ var _pnp_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @pnp/core */ "JC1J");
/* harmony import */ var _pnp_queryable__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @pnp/queryable */ "Ymo3");
/* harmony import */ var _behaviors_consistency_level_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./behaviors/consistency-level.js */ "USGv");
/* harmony import */ var _behaviors_paged_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./behaviors/paged.js */ "u29L");




const graphInvokableFactory = (f) => {
    return Object(_pnp_queryable__WEBPACK_IMPORTED_MODULE_1__["queryableFactory"])(f);
};
/**
 * Queryable Base Class
 *
 */
class _GraphQueryable extends _pnp_queryable__WEBPACK_IMPORTED_MODULE_1__["Queryable"] {
    /**
     * Creates a new instance of the Queryable class
     *
     * @constructor
     * @param base A string or Queryable that should form the base part of the url
     *
     */
    constructor(base, path) {
        super(base, path);
        if (typeof base === "string") {
            this.parentUrl = base;
        }
        else if (Object(_pnp_core__WEBPACK_IMPORTED_MODULE_0__["isArray"])(base)) {
            this.parentUrl = base[0].toUrl();
        }
        else {
            this.parentUrl = base.toUrl();
        }
    }
    /**
     * Choose which fields to return
     *
     * @param selects One or more fields to return
     */
    select(...selects) {
        if (selects.length > 0) {
            this.query.set("$select", selects.join(","));
        }
        return this;
    }
    /**
     * Expands fields such as lookups to get additional data
     *
     * @param expands The Fields for which to expand the values
     */
    expand(...expands) {
        if (expands.length > 0) {
            this.query.set("$expand", expands.join(","));
        }
        return this;
    }
    /**
     * Gets a parent for this instance as specified
     *
     * @param factory The contructor for the class to create
     */
    getParent(factory, base = this.parentUrl, path) {
        if (typeof base === "string") {
            // we need to ensure the parent has observers, even if we are rebasing the url (#2435)
            base = [this, base];
        }
        return new factory(base, path);
    }
}
const GraphQueryable = graphInvokableFactory(_GraphQueryable);
/**
 * Represents a REST collection which can be filtered, paged, and selected
 *
 */
class _GraphQueryableCollection extends _GraphQueryable {
    /**
     *
     * @param filter The string representing the filter query
     */
    filter(filter) {
        this.query.set("$filter", filter);
        return this;
    }
    /**
     * Orders based on the supplied fields
     *
     * @param orderby The name of the field on which to sort
     * @param ascending If false DESC is appended, otherwise ASC (default)
     */
    orderBy(orderBy, ascending = true) {
        var _a;
        const o = "$orderby";
        const query = ((_a = this.query.get(o)) === null || _a === void 0 ? void 0 : _a.split(",")) || [];
        query.push(`${orderBy} ${ascending ? "asc" : "desc"}`);
        this.query.set(o, query.join(","));
        return this;
    }
    /**
     * Limits the query to only return the specified number of items
     *
     * @param top The query row limit
     */
    top(top) {
        this.query.set("$top", top.toString());
        return this;
    }
    /**
     * Skips a set number of items in the return set
     *
     * @param num Number of items to skip
     */
    skip(num) {
        this.query.set("$skip", num.toString());
        return this;
    }
    /**
     * Skips a set number of items in the return set
     *
     * @param num Number of items to skip
     */
    search(query) {
        this.using(Object(_behaviors_consistency_level_js__WEBPACK_IMPORTED_MODULE_2__["ConsistencyLevel"])());
        this.query.set("$search", query);
        return this;
    }
    /**
     * 	To request second and subsequent pages of Graph data
     */
    skipToken(token) {
        this.query.set("$skiptoken", token);
        return this;
    }
    /**
     * 	Retrieves the total count of matching resources
     *  If the resource doesn't support count, this value will always be zero
     */
    async count() {
        const q = Object(_behaviors_paged_js__WEBPACK_IMPORTED_MODULE_3__["AsPaged"])(this);
        const r = await q.top(1)();
        return r.count;
    }
    /**
     * Allows reading through a collection as pages of information whose size is determined by top or the api method's default
     *
     * @returns an object containing results, the ability to determine if there are more results, and request the next page of results
     */
    paged() {
        return Object(_behaviors_paged_js__WEBPACK_IMPORTED_MODULE_3__["AsPaged"])(this)();
    }
}
const GraphQueryableCollection = graphInvokableFactory(_GraphQueryableCollection);
/**
 * Represents an instance that can be selected
 *
 */
class _GraphQueryableInstance extends _GraphQueryable {
}
const GraphQueryableInstance = graphInvokableFactory(_GraphQueryableInstance);
//# sourceMappingURL=graphqueryable.js.map

/***/ }),

/***/ "+y5s":
/*!*************************************************************!*\
  !*** ./node_modules/@pnp/queryable/behaviors/cancelable.js ***!
  \*************************************************************/
/*! exports provided: asCancelableScope, cancelableScope, Cancelable, CancelAction */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "asCancelableScope", function() { return asCancelableScope; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "cancelableScope", function() { return cancelableScope; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Cancelable", function() { return Cancelable; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CancelAction", function() { return CancelAction; });
/* harmony import */ var _pnp_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @pnp/core */ "JC1J");

/**
 * Cancelable is a fairly complex behavior as there is a lot to consider through multiple timelines. We have
 * two main cases:
 *
 * 1. basic method that is a single call and returns the result of an operation (return spPost(...))
 * 2. complex method that has multiple async calls within
 *
 * 1. For basic calls the cancel info is attached in init as it is only involved within a single request.
 *    This works because there is only one request and the cancel logic doesn't need to persist across
 *    inheriting instances. Also, many of these requests are so fast canceling is likely unnecessary
 *
 * 2. Complex method present a larger challenge because they are comprised of > 1 request and the promise
 *    that is actually returned to the user is not directly from one of our calls. This promise is the
 *    one "created" by the language when you await. For complex methods we have two things that solve these
 *    needs.
 *
 *    The first is the use of either the cancelableScope decorator or the asCancelableScope method
 *    wrapper. These create an upper level cancel info that is then shared across the child requests within
 *    the complex method. Meaning if I do a files.addChunked the same cancel info (and cancel method)
 *    are set on the current "this" which is user object on which the method was called. This info is then
 *    passed down to any child requests using the original "this" as a base using the construct moment.
 *
 *    The CancelAction behavior is used to apply additional actions to a request once it is canceled. For example
 *    in the case of uploading files chunked in sp we cancel the upload by id.
 */
// this is a special moment used to broadcast when a request is canceled
const MomentName = "__CancelMoment__";
// this value is used to track cancel state and the value is represetented by IScopeInfo
const ScopeId = Symbol.for("CancelScopeId");
// module map of all currently tracked cancel scopes
const cancelScopes = new Map();
/**
 * This method is bound to a scope id and used as the cancel method exposed to the user via cancelable promise
 *
 * @param this unused, the current promise
 * @param scopeId Id bound at creation time
 */
async function cancelPrimitive(scopeId) {
    const scope = cancelScopes.get(scopeId);
    scope.controller.abort();
    if (Object(_pnp_core__WEBPACK_IMPORTED_MODULE_0__["isArray"])(scope === null || scope === void 0 ? void 0 : scope.actions)) {
        scope.actions.map(action => scope.currentSelf.on[MomentName](action));
    }
    try {
        await scope.currentSelf.emit[MomentName]();
    }
    catch (e) {
        scope.currentSelf.log(`Error in cancel: ${e}`, 3);
    }
}
/**
 * Creates a new scope id, sets it on the instance's ScopeId property, and adds the info to the map
 *
 * @returns the new scope id (GUID)
 */
function createScope(instance) {
    const id = Object(_pnp_core__WEBPACK_IMPORTED_MODULE_0__["getGUID"])();
    instance[ScopeId] = id;
    cancelScopes.set(id, {
        cancel: cancelPrimitive.bind({}, id),
        actions: [],
        controller: null,
        currentSelf: instance,
    });
    return id;
}
/**
 * Function wrapper that turns the supplied function into a cancellation scope
 *
 * @param func Func to wrap
 * @returns The same func signature, wrapped with our cancel scoping logic
 */
const asCancelableScope = (func) => {
    return function (...args) {
        // ensure we have setup "this" to cancel
        // 1. for single requests the value is set in the behavior's init observer
        // 2. for complex requests the value is set here
        if (!Reflect.has(this, ScopeId)) {
            createScope(this);
        }
        // execute the original function, but don't await it
        const result = func.apply(this, args).finally(() => {
            // remove any cancel scope values tied to this instance
            cancelScopes.delete(this[ScopeId]);
            delete this[ScopeId];
        });
        // ensure the synthetic promise from a complex method has a cancel method
        result.cancel = cancelScopes.get(this[ScopeId]).cancel;
        return result;
    };
};
/**
 * Decorator used to mark multi-step methods to ensure all subrequests are properly cancelled
 */
function cancelableScope(_target, _propertyKey, descriptor) {
    // wrapping the original method
    descriptor.value = asCancelableScope(descriptor.value);
}
/**
 * Allows requests to be canceled by the caller by adding a cancel method to the Promise returned by the library
 *
 * @returns Timeline pipe to setup canelability
 */
function Cancelable() {
    if (!AbortController) {
        throw Error("The current environment appears to not support AbortController, please include a suitable polyfill.");
    }
    return (instance) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        instance.on.construct(function (init, path) {
            if (typeof init !== "string") {
                const parent = Object(_pnp_core__WEBPACK_IMPORTED_MODULE_0__["isArray"])(init) ? init[0] : init;
                if (Reflect.has(parent, ScopeId)) {
                    // ensure we carry over the scope id to the new instance from the parent
                    this[ScopeId] = parent[ScopeId];
                }
                // define the moment's implementation
                this.moments[MomentName] = Object(_pnp_core__WEBPACK_IMPORTED_MODULE_0__["asyncBroadcast"])();
            }
        });
        // init our queryable to support cancellation
        instance.on.init(function () {
            if (!Reflect.has(this, ScopeId)) {
                // ensure we have setup "this" to cancel
                // 1. for single requests this will set the value
                // 2. for complex requests the value is set in asCancelableScope
                const id = createScope(this);
                // if we are creating the scope here, we have not created it within asCancelableScope
                // meaning the finally handler there will not delete the tracked scope reference
                this.on.dispose(() => {
                    cancelScopes.delete(id);
                });
            }
            this.on[this.InternalPromise]((promise) => {
                // when a new promise is created add a cancel method
                promise.cancel = cancelScopes.get(this[ScopeId]).cancel;
                return [promise];
            });
        });
        instance.on.pre(async function (url, init, result) {
            // grab the current scope, update the controller and currentSelf
            const existingScope = cancelScopes.get(this[ScopeId]);
            // if we are here without a scope we are likely running a CancelAction request so we just ignore canceling
            if (Object(_pnp_core__WEBPACK_IMPORTED_MODULE_0__["objectDefinedNotNull"])(existingScope)) {
                const controller = new AbortController();
                existingScope.controller = controller;
                existingScope.currentSelf = this;
                if (init.signal) {
                    // we do our best to hook our logic to the existing signal
                    init.signal.addEventListener("abort", () => {
                        existingScope.cancel();
                    });
                }
                else {
                    init.signal = controller.signal;
                }
            }
            return [url, init, result];
        });
        // clean up any cancel info from the object after the request lifecycle is complete
        instance.on.dispose(function () {
            delete this[ScopeId];
            delete this.moments[MomentName];
        });
        return instance;
    };
}
/**
 * Allows you to define an action that is run when a request is cancelled
 *
 * @param action The action to run
 * @returns A timeline pipe used in the request lifecycle
 */
function CancelAction(action) {
    return (instance) => {
        instance.on.pre(async function (...args) {
            const existingScope = cancelScopes.get(this[ScopeId]);
            // if we don't have a scope this request is not using Cancelable so we do nothing
            if (Object(_pnp_core__WEBPACK_IMPORTED_MODULE_0__["objectDefinedNotNull"])(existingScope)) {
                if (!Object(_pnp_core__WEBPACK_IMPORTED_MODULE_0__["isArray"])(existingScope.actions)) {
                    existingScope.actions = [];
                }
                if (existingScope.actions.indexOf(action) < 0) {
                    existingScope.actions.push(action);
                }
            }
            return args;
        });
        return instance;
    };
}
//# sourceMappingURL=cancelable.js.map

/***/ }),

/***/ "/sQB":
/*!**************************************************!*\
  !*** ./node_modules/@pnp/queryable/invokable.js ***!
  \**************************************************/
/*! exports provided: invokable */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "invokable", function() { return invokable; });
/* harmony import */ var _operations_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./operations.js */ "h6Ct");
/* harmony import */ var _pnp_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @pnp/core */ "JC1J");


/**
 * Allows a decorated object to be invoked as a function, optionally providing an implementation for that action
 *
 * @param invokeableAction Optional. The logic to execute upon invoking the object as a function.
 * @returns Decorator which applies the invokable logic to the tagged class
 */
function invokable(invokeableAction) {
    if (!Object(_pnp_core__WEBPACK_IMPORTED_MODULE_1__["isFunc"])(invokeableAction)) {
        invokeableAction = function (init) {
            return Object(_operations_js__WEBPACK_IMPORTED_MODULE_0__["op"])(this, _operations_js__WEBPACK_IMPORTED_MODULE_0__["get"], init);
        };
    }
    return (target) => {
        return new Proxy(target, {
            construct(clz, args, newTarget) {
                const invokableInstance = Object.assign(function (init) {
                    // the "this" for our invoked object will be set by extendable OR we use invokableInstance directly
                    const localThis = typeof this === "undefined" ? invokableInstance : this;
                    return Reflect.apply(invokeableAction, localThis, [init]);
                }, Reflect.construct(clz, args, newTarget));
                Reflect.setPrototypeOf(invokableInstance, newTarget.prototype);
                return invokableInstance;
            },
        });
    };
}
//# sourceMappingURL=invokable.js.map

/***/ }),

/***/ "0qgB":
/*!*********************************************************!*\
  !*** ./node_modules/@pnp/queryable/request-builders.js ***!
  \*********************************************************/
/*! exports provided: body, headers */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "body", function() { return body; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "headers", function() { return headers; });
/* harmony import */ var _pnp_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @pnp/core */ "JC1J");

/**
 * takes the supplied object of type U, JSON.stringify's it, and sets it as the value of a "body" property
 */
function body(o, previous) {
    return Object.assign({ body: Object(_pnp_core__WEBPACK_IMPORTED_MODULE_0__["jsS"])(o) }, previous);
}
/**
 * Adds headers to an new/existing RequestInit
 *
 * @param o Headers to add
 * @param previous Any previous partial RequestInit
 * @returns RequestInit combining previous and specified headers
 */
// eslint-disable-next-line @typescript-eslint/ban-types
function headers(o, previous) {
    return Object.assign({}, previous, { headers: { ...previous === null || previous === void 0 ? void 0 : previous.headers, ...o } });
}
//# sourceMappingURL=request-builders.js.map

/***/ }),

/***/ "359w":
/*!**********************************************************!*\
  !*** ./node_modules/@pnp/queryable/queryable-factory.js ***!
  \**********************************************************/
/*! exports provided: queryableFactory */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "queryableFactory", function() { return queryableFactory; });
function queryableFactory(constructor) {
    return (init, path) => {
        // construct the concrete instance
        const instance = new constructor(init, path);
        // we emit the construct event from the factory because we need all of the decorators and constructors
        // to have fully finished before we emit, which is now true. We type the instance to any to get around
        // the protected nature of emit
        instance.emit.construct(init, path);
        return instance;
    };
}
//# sourceMappingURL=queryable-factory.js.map

/***/ }),

/***/ "4kGv":
/*!********************************************!*\
  !*** ./node_modules/@pnp/core/timeline.js ***!
  \********************************************/
/*! exports provided: noInherit, once, Timeline, cloneObserverCollection */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "noInherit", function() { return noInherit; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "once", function() { return once; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Timeline", function() { return Timeline; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "cloneObserverCollection", function() { return cloneObserverCollection; });
/* harmony import */ var _moments_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./moments.js */ "DZog");
/* harmony import */ var _util_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./util.js */ "NuLX");


/**
 * Field name to hold any flags on observer functions used to modify their behavior
 */
const flags = Symbol.for("ObserverLifecycleFlags");
/**
 * Bitwise flags to indicate modified behavior
 */
var ObserverLifecycleFlags;
(function (ObserverLifecycleFlags) {
    // eslint-disable-next-line no-bitwise
    ObserverLifecycleFlags[ObserverLifecycleFlags["noInherit"] = 1] = "noInherit";
    // eslint-disable-next-line no-bitwise
    ObserverLifecycleFlags[ObserverLifecycleFlags["once"] = 2] = "once";
})(ObserverLifecycleFlags || (ObserverLifecycleFlags = {}));
/**
 * Creates a filter function for use in Array.filter that will filter OUT any observers with the specified [flag]
 *
 * @param flag The flag used to exclude observers
 * @returns An Array.filter function
 */
// eslint-disable-next-line no-bitwise
const byFlag = (flag) => ((observer) => !((observer[flags] || 0) & flag));
/**
 * Creates an observer lifecycle modification flag application function
 * @param flag The flag to the bound function should add
 * @returns A function that can be used to apply [flag] to any valid observer
 */
const addFlag = (flag) => ((observer) => {
    // eslint-disable-next-line no-bitwise
    observer[flags] = (observer[flags] || 0) | flag;
    return observer;
});
/**
 * Observer lifecycle modifier that indicates this observer should NOT be inherited by any child
 * timelines.
 */
const noInherit = addFlag(1 /* noInherit */);
/**
 * Observer lifecycle modifier that indicates this observer should only fire once per instance, it is then removed.
 *
 * Note: If you have a parent and child timeline "once" will affect both and the observer will fire once for a parent lifecycle
 * and once for a child lifecycle
 */
const once = addFlag(2 /* once */);
/**
 * Timeline represents a set of operations executed in order of definition,
 * with each moment's behavior controlled by the implementing function
 */
class Timeline {
    /**
     * Creates a new instance of Timeline with the supplied moments and optionally any observers to include
     *
     * @param moments The moment object defining this timeline
     * @param observers Any observers to include (optional)
     */
    constructor(moments, observers = {}) {
        this.moments = moments;
        this.observers = observers;
        this._onProxy = null;
        this._emitProxy = null;
        this._inheritingObservers = true;
    }
    /**
     * Apply the supplied behavior(s) to this timeline
     *
     * @param behaviors One or more behaviors
     * @returns `this` Timeline
     */
    using(...behaviors) {
        for (let i = 0; i < behaviors.length; i++) {
            behaviors[i](this);
        }
        return this;
    }
    /**
     * Property allowing access to manage observers on moments within this timeline
     */
    get on() {
        if (this._onProxy === null) {
            this._onProxy = new Proxy(this, {
                get: (target, p) => Object.assign((handler) => {
                    target.cloneObserversOnChange();
                    addObserver(target.observers, p, handler, "add");
                    return target;
                }, {
                    toArray: () => {
                        return Reflect.has(target.observers, p) ? [...Reflect.get(target.observers, p)] : [];
                    },
                    replace: (handler) => {
                        target.cloneObserversOnChange();
                        addObserver(target.observers, p, handler, "replace");
                        return target;
                    },
                    prepend: (handler) => {
                        target.cloneObserversOnChange();
                        addObserver(target.observers, p, handler, "prepend");
                        return target;
                    },
                    clear: () => {
                        if (Reflect.has(target.observers, p)) {
                            target.cloneObserversOnChange();
                            // we trust ourselves that this will be an array
                            target.observers[p].length = 0;
                            return true;
                        }
                        return false;
                    },
                }),
            });
        }
        return this._onProxy;
    }
    /**
     * Shorthand method to emit a logging event tied to this timeline
     *
     * @param message The message to log
     * @param level The level at which the message applies
     */
    log(message, level = 0) {
        this.emit.log(message, level);
    }
    /**
     * Shorthand method to emit an error event tied to this timeline
     *
     * @param e Optional. Any error object to emit. If none is provided no emit occurs
     */
    error(e) {
        if (Object(_util_js__WEBPACK_IMPORTED_MODULE_1__["objectDefinedNotNull"])(e)) {
            this.emit.error(e);
        }
    }
    /**
     * Property allowing access to invoke a moment from within this timeline
     */
    get emit() {
        if (this._emitProxy === null) {
            this._emitProxy = new Proxy(this, {
                get: (target, p) => (...args) => {
                    // handle the case where no observers registered for the target moment
                    const observers = Reflect.has(target.observers, p) ? Reflect.get(target.observers, p) : [];
                    if ((!Object(_util_js__WEBPACK_IMPORTED_MODULE_1__["isArray"])(observers) || observers.length < 1) && p === "error") {
                        // if we are emitting an error, and no error observers are defined, we throw
                        throw Error(`Unhandled Exception: ${args[0]}`);
                    }
                    try {
                        // default to broadcasting any events without specific impl (will apply to log and error)
                        const moment = Reflect.has(target.moments, p) ? Reflect.get(target.moments, p) : p === "init" || p === "dispose" ? Object(_moments_js__WEBPACK_IMPORTED_MODULE_0__["lifecycle"])() : Object(_moments_js__WEBPACK_IMPORTED_MODULE_0__["broadcast"])();
                        // pass control to the individual moment's implementation
                        return Reflect.apply(moment, target, [observers, ...args]);
                    }
                    catch (e) {
                        if (p !== "error") {
                            this.error(e);
                        }
                        else {
                            // if all else fails, re-throw as we are getting errors from error observers meaning something is sideways
                            throw e;
                        }
                    }
                    finally {
                        // here we need to remove any "once" observers
                        if (observers && observers.length > 0) {
                            Reflect.set(target.observers, p, observers.filter(byFlag(2 /* once */)));
                        }
                    }
                },
            });
        }
        return this._emitProxy;
    }
    /**
     * Starts a timeline
     *
     * @description This method first emits "init" to allow for any needed initial conditions then calls execute with any supplied init
     *
     * @param init A value passed into the execute logic from the initiator of the timeline
     * @returns The result of this.execute
     */
    start(init) {
        // initialize our timeline
        this.emit.init();
        // get a ref to the promise returned by execute
        const p = this.execute(init);
        // attach our dispose logic
        p.finally(() => {
            try {
                // provide an opportunity for cleanup of the timeline
                this.emit.dispose();
            }
            catch (e) {
                // shouldn't happen, but possible dispose throws - which may be missed as the usercode await will have resolved.
                const e2 = Object.assign(Error("Error in dispose."), {
                    innerException: e,
                });
                this.error(e2);
            }
        }).catch(() => void (0));
        // give the promise back to the caller
        return p;
    }
    /**
     * By default a timeline references the same observer collection as a parent timeline,
     * if any changes are made to the observers this method first clones them ensuring we
     * maintain a local copy and de-ref the parent
     */
    cloneObserversOnChange() {
        if (this._inheritingObservers) {
            this._inheritingObservers = false;
            this.observers = cloneObserverCollection(this.observers);
        }
    }
}
/**
 * Adds an observer to a given target
 *
 * @param target The object to which events are registered
 * @param moment The name of the moment to which the observer is registered
 * @param addBehavior Determines how the observer is added to the collection
 *
 */
function addObserver(target, moment, observer, addBehavior) {
    if (!Object(_util_js__WEBPACK_IMPORTED_MODULE_1__["isFunc"])(observer)) {
        throw Error("Observers must be functions.");
    }
    if (!Reflect.has(target, moment)) {
        // if we don't have a registration for this moment, then we just add a new prop
        target[moment] = [observer];
    }
    else {
        // if we have an existing property then we follow the specified behavior
        switch (addBehavior) {
            case "add":
                target[moment].push(observer);
                break;
            case "prepend":
                target[moment].unshift(observer);
                break;
            case "replace":
                target[moment].length = 0;
                target[moment].push(observer);
                break;
        }
    }
    return target[moment];
}
function cloneObserverCollection(source) {
    return Reflect.ownKeys(source).reduce((clone, key) => {
        // eslint-disable-next-line no-bitwise
        clone[key] = [...source[key].filter(byFlag(1 /* noInherit */))];
        return clone;
    }, {});
}
//# sourceMappingURL=timeline.js.map

/***/ }),

/***/ "5NiK":
/*!***************************************!*\
  !*** ./node_modules/@pnp/graph/fi.js ***!
  \***************************************/
/*! exports provided: GraphFI, graphfi */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GraphFI", function() { return GraphFI; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "graphfi", function() { return graphfi; });
/* harmony import */ var _graphqueryable_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./graphqueryable.js */ "+t9t");

class GraphFI {
    /**
     * Creates a new instance of the GraphFI class
     *
     * @param root Establishes a root url/configuration
     */
    constructor(root = "") {
        this._root = Object(_graphqueryable_js__WEBPACK_IMPORTED_MODULE_0__["GraphQueryable"])(root);
    }
    /**
     * Applies one or more behaviors which will be inherited by all instances chained from this root
     *
     */
    using(...behaviors) {
        this._root.using(...behaviors);
        return this;
    }
    /**
     * Used by extending classes to create new objects directly from the root
     *
     * @param factory The factory for the type of object to create
     * @returns A configured instance of that object
     */
    create(factory, path) {
        return factory(this._root, path);
    }
}
function graphfi(root = "") {
    if (typeof root === "object" && !Reflect.has(root, "length")) {
        root = root._root;
    }
    return new GraphFI(root);
}
//# sourceMappingURL=fi.js.map

/***/ }),

/***/ "8oxB":
/*!*****************************************!*\
  !*** ./node_modules/process/browser.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),

/***/ "91a9":
/*!****************************************************************!*\
  !*** external "TeamsChatEmbeddedApplicationCustomizerStrings" ***!
  \****************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__91a9__;

/***/ }),

/***/ "AKQX":
/*!*************************************************!*\
  !*** ./node_modules/@pnp/graph/photos/index.js ***!
  \*************************************************/
/*! exports provided: Photo */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _groups_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./groups.js */ "gmKL");
/* harmony import */ var _users_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./users.js */ "GY8X");
/* harmony import */ var _types_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./types.js */ "PFzI");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Photo", function() { return _types_js__WEBPACK_IMPORTED_MODULE_2__["Photo"]; });




//# sourceMappingURL=index.js.map

/***/ }),

/***/ "CQoQ":
/*!***********************************************************!*\
  !*** ./node_modules/@pnp/graph/behaviors/graphbrowser.js ***!
  \***********************************************************/
/*! exports provided: GraphBrowser */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GraphBrowser", function() { return GraphBrowser; });
/* harmony import */ var _pnp_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @pnp/core */ "JC1J");
/* harmony import */ var _pnp_queryable__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @pnp/queryable */ "Ymo3");
/* harmony import */ var _defaults_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./defaults.js */ "upeu");



function GraphBrowser(props) {
    if ((props === null || props === void 0 ? void 0 : props.baseUrl) && !Object(_pnp_core__WEBPACK_IMPORTED_MODULE_0__["isUrlAbsolute"])(props.baseUrl)) {
        throw Error("GraphBrowser props.baseUrl must be absolute when supplied.");
    }
    return (instance) => {
        instance.using(Object(_defaults_js__WEBPACK_IMPORTED_MODULE_2__["DefaultHeaders"])(), Object(_defaults_js__WEBPACK_IMPORTED_MODULE_2__["DefaultInit"])(), Object(_pnp_queryable__WEBPACK_IMPORTED_MODULE_1__["BrowserFetchWithRetry"])(), Object(_pnp_queryable__WEBPACK_IMPORTED_MODULE_1__["DefaultParse"])());
        if (props === null || props === void 0 ? void 0 : props.baseUrl) {
            // we want to fix up the url first
            instance.on.pre.prepend(async (url, init, result) => {
                if (!Object(_pnp_core__WEBPACK_IMPORTED_MODULE_0__["isUrlAbsolute"])(url)) {
                    url = Object(_pnp_core__WEBPACK_IMPORTED_MODULE_0__["combine"])(props.baseUrl, url);
                }
                return [url, init, result];
            });
        }
        return instance;
    };
}
//# sourceMappingURL=graphbrowser.js.map

/***/ }),

/***/ "DZog":
/*!*******************************************!*\
  !*** ./node_modules/@pnp/core/moments.js ***!
  \*******************************************/
/*! exports provided: broadcast, asyncBroadcast, reduce, asyncReduce, request, lifecycle */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "broadcast", function() { return broadcast; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "asyncBroadcast", function() { return asyncBroadcast; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "reduce", function() { return reduce; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "asyncReduce", function() { return asyncReduce; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "request", function() { return request; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "lifecycle", function() { return lifecycle; });
/* harmony import */ var _util_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./util.js */ "NuLX");

/**
 * Emits to all registered observers the supplied arguments. Any values returned by the observers are ignored
 *
 * @returns void
 */
function broadcast() {
    return function (observers, ...args) {
        const obs = [...observers];
        for (let i = 0; i < obs.length; i++) {
            Reflect.apply(obs[i], this, args);
        }
    };
}
/**
 * Defines a moment that executes each observer asynchronously in parallel awaiting all promises to resolve or reject before continuing
 *
 * @returns The final set of arguments
 */
function asyncBroadcast() {
    return async function (observers, ...args) {
        // get our initial values
        const r = args;
        const obs = [...observers];
        const promises = [];
        for (let i = 0; i < obs.length; i++) {
            promises.push(Reflect.apply(obs[i], this, r));
        }
        return Promise.all(promises);
    };
}
/**
 * Defines a moment that executes each observer synchronously, passing the returned arguments as the arguments to the next observer.
 * This is very much like the redux pattern taking the arguments as the state which each observer may modify then returning a new state
 *
 * @returns The final set of arguments
 */
function reduce() {
    return function (observers, ...args) {
        const obs = [...observers];
        return obs.reduce((params, func) => Reflect.apply(func, this, params), args);
    };
}
/**
 * Defines a moment that executes each observer asynchronously, awaiting the result and passes the returned arguments as the arguments to the next observer.
 * This is very much like the redux pattern taking the arguments as the state which each observer may modify then returning a new state
 *
 * @returns The final set of arguments
 */
function asyncReduce() {
    return async function (observers, ...args) {
        const obs = [...observers];
        return obs.reduce((prom, func) => prom.then((params) => Reflect.apply(func, this, params)), Promise.resolve(args));
    };
}
/**
 * Defines a moment where the first registered observer is used to asynchronously execute a request, returning a single result
 * If no result is returned (undefined) no further action is taken and the result will be undefined (i.e. additional observers are not used)
 *
 * @returns The result returned by the first registered observer
 */
function request() {
    return async function (observers, ...args) {
        if (!Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["isArray"])(observers) || observers.length < 1) {
            return undefined;
        }
        const handler = observers[0];
        return Reflect.apply(handler, this, args);
    };
}
/**
 * Defines a special moment used to configure the timeline itself before starting. Each observer is executed in order,
 * possibly modifying the "this" instance, with the final product returned
 *
 */
function lifecycle() {
    return function (observers, ...args) {
        const obs = [...observers];
        // process each handler which updates our instance in order
        // very similar to asyncReduce but the state is the object itself
        for (let i = 0; i < obs.length; i++) {
            Reflect.apply(obs[i], this, args);
        }
        return this;
    };
}
//# sourceMappingURL=moments.js.map

/***/ }),

/***/ "E7/1":
/*!***************************************************!*\
  !*** ./node_modules/@pnp/graph/behaviors/spfx.js ***!
  \***************************************************/
/*! exports provided: SPFxToken, SPFx */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SPFxToken", function() { return SPFxToken; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SPFx", function() { return SPFx; });
/* harmony import */ var _pnp_queryable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @pnp/queryable */ "Ymo3");
/* harmony import */ var _defaults_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./defaults.js */ "upeu");


function SPFxToken(context) {
    return (instance) => {
        instance.on.auth.replace(async function (url, init) {
            const provider = await context.aadTokenProviderFactory.getTokenProvider();
            const token = await provider.getToken(`${url.protocol}//${url.hostname}`);
            // eslint-disable-next-line @typescript-eslint/dot-notation
            init.headers["Authorization"] = `Bearer ${token}`;
            return [url, init];
        });
        return instance;
    };
}
function SPFx(context) {
    return (instance) => {
        instance.using(Object(_defaults_js__WEBPACK_IMPORTED_MODULE_1__["DefaultHeaders"])(), Object(_defaults_js__WEBPACK_IMPORTED_MODULE_1__["DefaultInit"])(), Object(_pnp_queryable__WEBPACK_IMPORTED_MODULE_0__["BrowserFetchWithRetry"])(), Object(_pnp_queryable__WEBPACK_IMPORTED_MODULE_0__["DefaultParse"])(), SPFxToken(context));
        return instance;
    };
}
//# sourceMappingURL=spfx.js.map

/***/ }),

/***/ "GPet":
/*!*************************************************!*\
  !*** external "@microsoft/sp-application-base" ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_GPet__;

/***/ }),

/***/ "GY8X":
/*!*************************************************!*\
  !*** ./node_modules/@pnp/graph/photos/users.js ***!
  \*************************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _pnp_queryable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @pnp/queryable */ "Ymo3");
/* harmony import */ var _users_types_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../users/types.js */ "iCPL");
/* harmony import */ var _types_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./types.js */ "PFzI");



Object(_pnp_queryable__WEBPACK_IMPORTED_MODULE_0__["addProp"])(_users_types_js__WEBPACK_IMPORTED_MODULE_1__["_User"], "photo", _types_js__WEBPACK_IMPORTED_MODULE_2__["Photo"]);
//# sourceMappingURL=users.js.map

/***/ }),

/***/ "Gx3w":
/*!******************************************!*\
  !*** ./node_modules/@pnp/graph/index.js ***!
  \******************************************/
/*! exports provided: graphfi, GraphFI, GraphQueryable, GraphQueryableCollection, GraphQueryableInstance, graphGet, graphPost, graphDelete, graphPatch, graphPut, ConsistencyLevel, DefaultInit, DefaultHeaders, Endpoint, GraphBrowser, AsPaged, Paged, Telemetry, SPFxToken, SPFx */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _fi_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./fi.js */ "5NiK");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "graphfi", function() { return _fi_js__WEBPACK_IMPORTED_MODULE_0__["graphfi"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "GraphFI", function() { return _fi_js__WEBPACK_IMPORTED_MODULE_0__["GraphFI"]; });

/* harmony import */ var _graphqueryable_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./graphqueryable.js */ "+t9t");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "GraphQueryable", function() { return _graphqueryable_js__WEBPACK_IMPORTED_MODULE_1__["GraphQueryable"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "GraphQueryableCollection", function() { return _graphqueryable_js__WEBPACK_IMPORTED_MODULE_1__["GraphQueryableCollection"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "GraphQueryableInstance", function() { return _graphqueryable_js__WEBPACK_IMPORTED_MODULE_1__["GraphQueryableInstance"]; });

/* harmony import */ var _operations_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./operations.js */ "xfNx");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "graphGet", function() { return _operations_js__WEBPACK_IMPORTED_MODULE_2__["graphGet"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "graphPost", function() { return _operations_js__WEBPACK_IMPORTED_MODULE_2__["graphPost"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "graphDelete", function() { return _operations_js__WEBPACK_IMPORTED_MODULE_2__["graphDelete"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "graphPatch", function() { return _operations_js__WEBPACK_IMPORTED_MODULE_2__["graphPatch"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "graphPut", function() { return _operations_js__WEBPACK_IMPORTED_MODULE_2__["graphPut"]; });

/* harmony import */ var _behaviors_consistency_level_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./behaviors/consistency-level.js */ "USGv");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ConsistencyLevel", function() { return _behaviors_consistency_level_js__WEBPACK_IMPORTED_MODULE_3__["ConsistencyLevel"]; });

/* harmony import */ var _behaviors_defaults_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./behaviors/defaults.js */ "upeu");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "DefaultInit", function() { return _behaviors_defaults_js__WEBPACK_IMPORTED_MODULE_4__["DefaultInit"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "DefaultHeaders", function() { return _behaviors_defaults_js__WEBPACK_IMPORTED_MODULE_4__["DefaultHeaders"]; });

/* harmony import */ var _behaviors_endpoint_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./behaviors/endpoint.js */ "erwh");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Endpoint", function() { return _behaviors_endpoint_js__WEBPACK_IMPORTED_MODULE_5__["Endpoint"]; });

/* harmony import */ var _behaviors_graphbrowser_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./behaviors/graphbrowser.js */ "CQoQ");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "GraphBrowser", function() { return _behaviors_graphbrowser_js__WEBPACK_IMPORTED_MODULE_6__["GraphBrowser"]; });

/* harmony import */ var _behaviors_paged_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./behaviors/paged.js */ "u29L");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "AsPaged", function() { return _behaviors_paged_js__WEBPACK_IMPORTED_MODULE_7__["AsPaged"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Paged", function() { return _behaviors_paged_js__WEBPACK_IMPORTED_MODULE_7__["Paged"]; });

/* harmony import */ var _behaviors_telemetry_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./behaviors/telemetry.js */ "zSku");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Telemetry", function() { return _behaviors_telemetry_js__WEBPACK_IMPORTED_MODULE_8__["Telemetry"]; });

/* harmony import */ var _behaviors_spfx_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./behaviors/spfx.js */ "E7/1");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SPFxToken", function() { return _behaviors_spfx_js__WEBPACK_IMPORTED_MODULE_9__["SPFxToken"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SPFx", function() { return _behaviors_spfx_js__WEBPACK_IMPORTED_MODULE_9__["SPFx"]; });











//# sourceMappingURL=index.js.map

/***/ }),

/***/ "ISfK":
/*!**********************************************************!*\
  !*** ./node_modules/@pnp/queryable/behaviors/timeout.js ***!
  \**********************************************************/
/*! exports provided: Timeout */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Timeout", function() { return Timeout; });
/**
 * Behavior that will cause a timeout in the request after the specified milliseconds
 *
 * @param timeout Number of milliseconds to set the timeout
 */
function Timeout(timeout) {
    return (instance) => {
        instance.on.pre(async (url, init, result) => {
            const controller = new AbortController();
            init.signal = controller.signal;
            setTimeout(() => controller.abort(), timeout);
            return [url, init, result];
        });
        return instance;
    };
}
//# sourceMappingURL=timeout.js.map

/***/ }),

/***/ "IwJs":
/*!*********************************************************************!*\
  !*** ./node_modules/@pnp/queryable/node_modules/tslib/tslib.es6.js ***!
  \*********************************************************************/
/*! exports provided: __extends, __assign, __rest, __decorate, __param, __metadata, __awaiter, __generator, __createBinding, __exportStar, __values, __read, __spread, __spreadArrays, __spreadArray, __await, __asyncGenerator, __asyncDelegator, __asyncValues, __makeTemplateObject, __importStar, __importDefault, __classPrivateFieldGet, __classPrivateFieldSet, __classPrivateFieldIn */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__extends", function() { return __extends; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__assign", function() { return __assign; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__rest", function() { return __rest; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__decorate", function() { return __decorate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__param", function() { return __param; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__metadata", function() { return __metadata; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__awaiter", function() { return __awaiter; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__generator", function() { return __generator; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__createBinding", function() { return __createBinding; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__exportStar", function() { return __exportStar; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__values", function() { return __values; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__read", function() { return __read; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__spread", function() { return __spread; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__spreadArrays", function() { return __spreadArrays; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__spreadArray", function() { return __spreadArray; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__await", function() { return __await; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__asyncGenerator", function() { return __asyncGenerator; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__asyncDelegator", function() { return __asyncDelegator; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__asyncValues", function() { return __asyncValues; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__makeTemplateObject", function() { return __makeTemplateObject; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__importStar", function() { return __importStar; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__importDefault", function() { return __importDefault; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__classPrivateFieldGet", function() { return __classPrivateFieldGet; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__classPrivateFieldSet", function() { return __classPrivateFieldSet; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__classPrivateFieldIn", function() { return __classPrivateFieldIn; });
/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    }
    return __assign.apply(this, arguments);
}

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __param(paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
}

function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

var __createBinding = Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});

function __exportStar(m, o) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) __createBinding(o, m, p);
}

function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

/** @deprecated */
function __spread() {
    for (var ar = [], i = 0; i < arguments.length; i++)
        ar = ar.concat(__read(arguments[i]));
    return ar;
}

/** @deprecated */
function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
}

function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}

function __await(v) {
    return this instanceof __await ? (this.v = v, this) : new __await(v);
}

function __asyncGenerator(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
}

function __asyncDelegator(o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
}

function __asyncValues(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
}

function __makeTemplateObject(cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};

var __setModuleDefault = Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
};

function __importStar(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
}

function __importDefault(mod) {
    return (mod && mod.__esModule) ? mod : { default: mod };
}

function __classPrivateFieldGet(receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}

function __classPrivateFieldSet(receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
}

function __classPrivateFieldIn(state, receiver) {
    if (receiver === null || (typeof receiver !== "object" && typeof receiver !== "function")) throw new TypeError("Cannot use 'in' operator on non-object");
    return typeof state === "function" ? receiver === state : state.has(receiver);
}


/***/ }),

/***/ "JC1J":
/*!*****************************************!*\
  !*** ./node_modules/@pnp/core/index.js ***!
  \*****************************************/
/*! exports provided: PnPClientStorageWrapper, PnPClientStorage, dateAdd, combine, getRandomString, getGUID, isFunc, isArray, isUrlAbsolute, stringIsNullOrEmpty, objectDefinedNotNull, jsS, hOP, getHashCode, delay, broadcast, asyncBroadcast, reduce, asyncReduce, request, lifecycle, noInherit, once, Timeline, cloneObserverCollection, extendable, extend, extendFactory, disableExtensions, enableExtensions, AssignFrom, CopyFrom */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _storage_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./storage.js */ "L2F+");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "PnPClientStorageWrapper", function() { return _storage_js__WEBPACK_IMPORTED_MODULE_0__["PnPClientStorageWrapper"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "PnPClientStorage", function() { return _storage_js__WEBPACK_IMPORTED_MODULE_0__["PnPClientStorage"]; });

/* harmony import */ var _util_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./util.js */ "NuLX");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "dateAdd", function() { return _util_js__WEBPACK_IMPORTED_MODULE_1__["dateAdd"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "combine", function() { return _util_js__WEBPACK_IMPORTED_MODULE_1__["combine"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getRandomString", function() { return _util_js__WEBPACK_IMPORTED_MODULE_1__["getRandomString"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getGUID", function() { return _util_js__WEBPACK_IMPORTED_MODULE_1__["getGUID"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isFunc", function() { return _util_js__WEBPACK_IMPORTED_MODULE_1__["isFunc"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isArray", function() { return _util_js__WEBPACK_IMPORTED_MODULE_1__["isArray"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isUrlAbsolute", function() { return _util_js__WEBPACK_IMPORTED_MODULE_1__["isUrlAbsolute"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "stringIsNullOrEmpty", function() { return _util_js__WEBPACK_IMPORTED_MODULE_1__["stringIsNullOrEmpty"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "objectDefinedNotNull", function() { return _util_js__WEBPACK_IMPORTED_MODULE_1__["objectDefinedNotNull"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "jsS", function() { return _util_js__WEBPACK_IMPORTED_MODULE_1__["jsS"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "hOP", function() { return _util_js__WEBPACK_IMPORTED_MODULE_1__["hOP"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getHashCode", function() { return _util_js__WEBPACK_IMPORTED_MODULE_1__["getHashCode"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "delay", function() { return _util_js__WEBPACK_IMPORTED_MODULE_1__["delay"]; });

/* harmony import */ var _moments_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./moments.js */ "DZog");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "broadcast", function() { return _moments_js__WEBPACK_IMPORTED_MODULE_2__["broadcast"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "asyncBroadcast", function() { return _moments_js__WEBPACK_IMPORTED_MODULE_2__["asyncBroadcast"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "reduce", function() { return _moments_js__WEBPACK_IMPORTED_MODULE_2__["reduce"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "asyncReduce", function() { return _moments_js__WEBPACK_IMPORTED_MODULE_2__["asyncReduce"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "request", function() { return _moments_js__WEBPACK_IMPORTED_MODULE_2__["request"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "lifecycle", function() { return _moments_js__WEBPACK_IMPORTED_MODULE_2__["lifecycle"]; });

/* harmony import */ var _timeline_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./timeline.js */ "4kGv");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "noInherit", function() { return _timeline_js__WEBPACK_IMPORTED_MODULE_3__["noInherit"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "once", function() { return _timeline_js__WEBPACK_IMPORTED_MODULE_3__["once"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Timeline", function() { return _timeline_js__WEBPACK_IMPORTED_MODULE_3__["Timeline"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "cloneObserverCollection", function() { return _timeline_js__WEBPACK_IMPORTED_MODULE_3__["cloneObserverCollection"]; });

/* harmony import */ var _extendable_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./extendable.js */ "t9SU");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "extendable", function() { return _extendable_js__WEBPACK_IMPORTED_MODULE_4__["extendable"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "extend", function() { return _extendable_js__WEBPACK_IMPORTED_MODULE_4__["extend"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "extendFactory", function() { return _extendable_js__WEBPACK_IMPORTED_MODULE_4__["extendFactory"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "disableExtensions", function() { return _extendable_js__WEBPACK_IMPORTED_MODULE_4__["disableExtensions"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "enableExtensions", function() { return _extendable_js__WEBPACK_IMPORTED_MODULE_4__["enableExtensions"]; });

/* harmony import */ var _behaviors_assign_from_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./behaviors/assign-from.js */ "zhiF");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "AssignFrom", function() { return _behaviors_assign_from_js__WEBPACK_IMPORTED_MODULE_5__["AssignFrom"]; });

/* harmony import */ var _behaviors_copy_from_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./behaviors/copy-from.js */ "qNel");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "CopyFrom", function() { return _behaviors_copy_from_js__WEBPACK_IMPORTED_MODULE_6__["CopyFrom"]; });






/**
 * Behavior exports
 */


//# sourceMappingURL=index.js.map

/***/ }),

/***/ "JPst":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
// eslint-disable-next-line func-names
module.exports = function (useSourceMap) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = cssWithMappingToString(item, useSourceMap);

      if (item[2]) {
        return "@media ".concat(item[2], "{").concat(content, "}");
      }

      return content;
    }).join('');
  }; // import a list of modules into the list
  // eslint-disable-next-line func-names


  list.i = function (modules, mediaQuery) {
    if (typeof modules === 'string') {
      // eslint-disable-next-line no-param-reassign
      modules = [[null, modules, '']];
    }

    var alreadyImportedModules = {};

    for (var i = 0; i < this.length; i++) {
      // eslint-disable-next-line prefer-destructuring
      var id = this[i][0];

      if (id != null) {
        alreadyImportedModules[id] = true;
      }
    }

    for (var _i = 0; _i < modules.length; _i++) {
      var item = modules[_i]; // skip already imported module
      // this implementation is not 100% perfect for weird media query combinations
      // when a module is imported multiple times with different media queries.
      // I hope this will never occur (Hey this way we have smaller bundles)

      if (item[0] == null || !alreadyImportedModules[item[0]]) {
        if (mediaQuery && !item[2]) {
          item[2] = mediaQuery;
        } else if (mediaQuery) {
          item[2] = "(".concat(item[2], ") and (").concat(mediaQuery, ")");
        }

        list.push(item);
      }
    }
  };

  return list;
};

function cssWithMappingToString(item, useSourceMap) {
  var content = item[1] || ''; // eslint-disable-next-line prefer-destructuring

  var cssMapping = item[3];

  if (!cssMapping) {
    return content;
  }

  if (useSourceMap && typeof btoa === 'function') {
    var sourceMapping = toComment(cssMapping);
    var sourceURLs = cssMapping.sources.map(function (source) {
      return "/*# sourceURL=".concat(cssMapping.sourceRoot).concat(source, " */");
    });
    return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
  }

  return [content].join('\n');
} // Adapted from convert-source-map (MIT)


function toComment(sourceMap) {
  // eslint-disable-next-line no-undef
  var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
  var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
  return "/*# ".concat(data, " */");
}

/***/ }),

/***/ "L2F+":
/*!*******************************************!*\
  !*** ./node_modules/@pnp/core/storage.js ***!
  \*******************************************/
/*! exports provided: PnPClientStorageWrapper, PnPClientStorage */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PnPClientStorageWrapper", function() { return PnPClientStorageWrapper; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PnPClientStorage", function() { return PnPClientStorage; });
/* harmony import */ var _util_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./util.js */ "NuLX");

let storageShim;
function getStorageShim() {
    if (typeof storageShim === "undefined") {
        storageShim = new MemoryStorage();
    }
    return storageShim;
}
/**
 * A wrapper class to provide a consistent interface to browser based storage
 *
 */
class PnPClientStorageWrapper {
    /**
     * Creates a new instance of the PnPClientStorageWrapper class
     *
     * @constructor
     */
    constructor(store) {
        this.store = store;
        this.enabled = this.test();
    }
    /**
     * Get a value from storage, or null if that value does not exist
     *
     * @param key The key whose value we want to retrieve
     */
    get(key) {
        if (!this.enabled) {
            return null;
        }
        const o = this.store.getItem(key);
        if (!Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["objectDefinedNotNull"])(o)) {
            return null;
        }
        const persistable = JSON.parse(o);
        if (new Date(persistable.expiration) <= new Date()) {
            this.delete(key);
            return null;
        }
        else {
            return persistable.value;
        }
    }
    /**
     * Adds a value to the underlying storage
     *
     * @param key The key to use when storing the provided value
     * @param o The value to store
     * @param expire Optional, if provided the expiration of the item, otherwise the default is used
     */
    put(key, o, expire) {
        if (this.enabled) {
            this.store.setItem(key, this.createPersistable(o, expire));
        }
    }
    /**
     * Deletes a value from the underlying storage
     *
     * @param key The key of the pair we want to remove from storage
     */
    delete(key) {
        if (this.enabled) {
            this.store.removeItem(key);
        }
    }
    /**
     * Gets an item from the underlying storage, or adds it if it does not exist using the supplied getter function
     *
     * @param key The key to use when storing the provided value
     * @param getter A function which will upon execution provide the desired value
     * @param expire Optional, if provided the expiration of the item, otherwise the default is used
     */
    async getOrPut(key, getter, expire) {
        if (!this.enabled) {
            return getter();
        }
        let o = this.get(key);
        if (o === null) {
            o = await getter();
            this.put(key, o, expire);
        }
        return o;
    }
    /**
     * Deletes any expired items placed in the store by the pnp library, leaves other items untouched
     */
    async deleteExpired() {
        if (!this.enabled) {
            return;
        }
        for (let i = 0; i < this.store.length; i++) {
            const key = this.store.key(i);
            if (key !== null) {
                // test the stored item to see if we stored it
                if (/["|']?pnp["|']? ?: ?1/i.test(this.store.getItem(key))) {
                    // get those items as get will delete from cache if they are expired
                    await this.get(key);
                }
            }
        }
    }
    /**
     * Used to determine if the wrapped storage is available currently
     */
    test() {
        const str = "t";
        try {
            this.store.setItem(str, str);
            this.store.removeItem(str);
            return true;
        }
        catch (e) {
            return false;
        }
    }
    /**
     * Creates the persistable to store
     */
    createPersistable(o, expire) {
        if (expire === undefined) {
            expire = Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["dateAdd"])(new Date(), "minute", 5);
        }
        return Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["jsS"])({ pnp: 1, expiration: expire, value: o });
    }
}
/**
 * A thin implementation of in-memory storage for use in nodejs
 */
class MemoryStorage {
    constructor(_store = new Map()) {
        this._store = _store;
    }
    get length() {
        return this._store.size;
    }
    clear() {
        this._store.clear();
    }
    getItem(key) {
        return this._store.get(key);
    }
    key(index) {
        return Array.from(this._store)[index][0];
    }
    removeItem(key) {
        this._store.delete(key);
    }
    setItem(key, data) {
        this._store.set(key, data);
    }
}
/**
 * A class that will establish wrappers for both local and session storage, substituting basic memory storage for nodejs
 */
class PnPClientStorage {
    /**
     * Creates a new instance of the PnPClientStorage class
     *
     * @constructor
     */
    constructor(_local = null, _session = null) {
        this._local = _local;
        this._session = _session;
    }
    /**
     * Provides access to the local storage of the browser
     */
    get local() {
        if (this._local === null) {
            this._local = new PnPClientStorageWrapper(typeof localStorage === "undefined" ? getStorageShim() : localStorage);
        }
        return this._local;
    }
    /**
     * Provides access to the session storage of the browser
     */
    get session() {
        if (this._session === null) {
            this._session = new PnPClientStorageWrapper(typeof sessionStorage === "undefined" ? getStorageShim() : sessionStorage);
        }
        return this._session;
    }
}
//# sourceMappingURL=storage.js.map

/***/ }),

/***/ "NDCN":
/*!*************************************************!*\
  !*** ./node_modules/@pnp/graph/groups/types.js ***!
  \*************************************************/
/*! exports provided: GroupType, _Group, Group, _Groups, Groups */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GroupType", function() { return GroupType; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "_Group", function() { return _Group; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Group", function() { return Group; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "_Groups", function() { return _Groups; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Groups", function() { return Groups; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "Vx2g");
/* harmony import */ var _pnp_queryable__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @pnp/queryable */ "Ymo3");
/* harmony import */ var _graphqueryable_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../graphqueryable.js */ "+t9t");
/* harmony import */ var _decorators_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../decorators.js */ "s0bl");
/* harmony import */ var _operations_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../operations.js */ "xfNx");
/* harmony import */ var _directory_objects_types_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../directory-objects/types.js */ "PGrk");






var GroupType;
(function (GroupType) {
    /**
     * Office 365 (aka unified group)
     */
    GroupType[GroupType["Office365"] = 0] = "Office365";
    /**
     * Dynamic membership
     */
    GroupType[GroupType["Dynamic"] = 1] = "Dynamic";
    /**
     * Security
     */
    GroupType[GroupType["Security"] = 2] = "Security";
})(GroupType || (GroupType = {}));
/**
 * Represents a group entity
 */
let _Group = class _Group extends _directory_objects_types_js__WEBPACK_IMPORTED_MODULE_5__["_DirectoryObject"] {
    /**
     * Add the group to the list of the current user's favorite groups. Supported for only Office 365 groups
     */
    addFavorite() {
        return Object(_operations_js__WEBPACK_IMPORTED_MODULE_4__["graphPost"])(Group(this, "addFavorite"));
    }
    /**
     * Remove the group from the list of the current user's favorite groups. Supported for only Office 365 groups
     */
    removeFavorite() {
        return Object(_operations_js__WEBPACK_IMPORTED_MODULE_4__["graphPost"])(Group(this, "removeFavorite"));
    }
    /**
     * Reset the unseenCount of all the posts that the current user has not seen since their last visit
     */
    resetUnseenCount() {
        return Object(_operations_js__WEBPACK_IMPORTED_MODULE_4__["graphPost"])(Group(this, "resetUnseenCount"));
    }
    /**
     * Calling this method will enable the current user to receive email notifications for this group,
     * about new posts, events, and files in that group. Supported for only Office 365 groups
     */
    subscribeByMail() {
        return Object(_operations_js__WEBPACK_IMPORTED_MODULE_4__["graphPost"])(Group(this, "subscribeByMail"));
    }
    /**
     * Calling this method will prevent the current user from receiving email notifications for this group
     * about new posts, events, and files in that group. Supported for only Office 365 groups
     */
    unsubscribeByMail() {
        return Object(_operations_js__WEBPACK_IMPORTED_MODULE_4__["graphPost"])(Group(this, "unsubscribeByMail"));
    }
    /**
     * Get the occurrences, exceptions, and single instances of events in a calendar view defined by a time range, from the default calendar of a group
     *
     * @param start Start date and time of the time range
     * @param end End date and time of the time range
     */
    getCalendarView(start, end) {
        const view = Group(this, "calendarView");
        view.query.set("startDateTime", start.toISOString());
        view.query.set("endDateTime", end.toISOString());
        return view();
    }
};
_Group = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"])([
    Object(_decorators_js__WEBPACK_IMPORTED_MODULE_3__["deleteable"])(),
    Object(_decorators_js__WEBPACK_IMPORTED_MODULE_3__["updateable"])()
], _Group);

const Group = Object(_graphqueryable_js__WEBPACK_IMPORTED_MODULE_2__["graphInvokableFactory"])(_Group);
/**
 * Describes a collection of Group objects
 *
 */
let _Groups = class _Groups extends _directory_objects_types_js__WEBPACK_IMPORTED_MODULE_5__["_DirectoryObjects"] {
    /**
     * Create a new group as specified in the request body.
     *
     * @param name Name to display in the address book for the group
     * @param mailNickname Mail alias for the group
     * @param groupType Type of group being created
     * @param additionalProperties A plain object collection of additional properties you want to set on the new group
     */
    async add(name, mailNickname, groupType, additionalProperties = {}) {
        let postBody = {
            displayName: name,
            mailEnabled: groupType === GroupType.Office365,
            mailNickname: mailNickname,
            securityEnabled: groupType !== GroupType.Office365,
            ...additionalProperties,
        };
        // include a group type if required
        if (groupType !== GroupType.Security) {
            postBody = {
                ...postBody,
                groupTypes: groupType === GroupType.Office365 ? ["Unified"] : ["DynamicMembership"],
            };
        }
        const data = await Object(_operations_js__WEBPACK_IMPORTED_MODULE_4__["graphPost"])(this, Object(_pnp_queryable__WEBPACK_IMPORTED_MODULE_1__["body"])(postBody));
        return {
            data,
            group: this.getById(data.id),
        };
    }
};
_Groups = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"])([
    Object(_decorators_js__WEBPACK_IMPORTED_MODULE_3__["defaultPath"])("groups"),
    Object(_decorators_js__WEBPACK_IMPORTED_MODULE_3__["getById"])(Group)
], _Groups);

const Groups = Object(_graphqueryable_js__WEBPACK_IMPORTED_MODULE_2__["graphInvokableFactory"])(_Groups);
//# sourceMappingURL=types.js.map

/***/ }),

/***/ "NuLX":
/*!****************************************!*\
  !*** ./node_modules/@pnp/core/util.js ***!
  \****************************************/
/*! exports provided: dateAdd, combine, getRandomString, getGUID, isFunc, isArray, isUrlAbsolute, stringIsNullOrEmpty, objectDefinedNotNull, jsS, hOP, getHashCode, delay */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "dateAdd", function() { return dateAdd; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "combine", function() { return combine; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getRandomString", function() { return getRandomString; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getGUID", function() { return getGUID; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isFunc", function() { return isFunc; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isArray", function() { return isArray; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isUrlAbsolute", function() { return isUrlAbsolute; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "stringIsNullOrEmpty", function() { return stringIsNullOrEmpty; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "objectDefinedNotNull", function() { return objectDefinedNotNull; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "jsS", function() { return jsS; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "hOP", function() { return hOP; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getHashCode", function() { return getHashCode; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "delay", function() { return delay; });
/**
 * Adds a value to a date
 *
 * @param date The date to which we will add units, done in local time
 * @param interval The name of the interval to add, one of: ['year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second']
 * @param units The amount to add to date of the given interval
 *
 * http://stackoverflow.com/questions/1197928/how-to-add-30-minutes-to-a-javascript-date-object
 */
function dateAdd(date, interval, units) {
    let ret = new Date(date.toString()); // don't change original date
    switch (interval.toLowerCase()) {
        case "year":
            ret.setFullYear(ret.getFullYear() + units);
            break;
        case "quarter":
            ret.setMonth(ret.getMonth() + 3 * units);
            break;
        case "month":
            ret.setMonth(ret.getMonth() + units);
            break;
        case "week":
            ret.setDate(ret.getDate() + 7 * units);
            break;
        case "day":
            ret.setDate(ret.getDate() + units);
            break;
        case "hour":
            ret.setTime(ret.getTime() + units * 3600000);
            break;
        case "minute":
            ret.setTime(ret.getTime() + units * 60000);
            break;
        case "second":
            ret.setTime(ret.getTime() + units * 1000);
            break;
        default:
            ret = undefined;
            break;
    }
    return ret;
}
/**
 * Combines an arbitrary set of paths ensuring and normalizes the slashes
 *
 * @param paths 0 to n path parts to combine
 */
function combine(...paths) {
    return paths
        .filter(path => !stringIsNullOrEmpty(path))
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .map(path => path.replace(/^[\\|/]/, "").replace(/[\\|/]$/, ""))
        .join("/")
        .replace(/\\/g, "/");
}
/**
 * Gets a random string of chars length
 *
 * https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
 *
 * @param chars The length of the random string to generate
 */
function getRandomString(chars) {
    const text = new Array(chars);
    for (let i = 0; i < chars; i++) {
        text[i] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".charAt(Math.floor(Math.random() * 62));
    }
    return text.join("");
}
/**
 * Gets a random GUID value
 *
 * http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
 */
/* eslint-disable no-bitwise */
function getGUID() {
    let d = Date.now();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
    });
}
/* eslint-enable no-bitwise */
/**
 * Determines if a given value is a function
 *
 * @param f The thing to test for functionness
 */
// eslint-disable-next-line @typescript-eslint/ban-types
function isFunc(f) {
    return typeof f === "function";
}
/**
 * @returns whether the provided parameter is a JavaScript Array or not.
*/
function isArray(array) {
    return Array.isArray(array);
}
/**
 * Determines if a given url is absolute
 *
 * @param url The url to check to see if it is absolute
 */
function isUrlAbsolute(url) {
    return /^https?:\/\/|^\/\//i.test(url);
}
/**
 * Determines if a string is null or empty or undefined
 *
 * @param s The string to test
 */
function stringIsNullOrEmpty(s) {
    return typeof s === "undefined" || s === null || s.length < 1;
}
/**
 * Determines if an object is both defined and not null
 * @param obj Object to test
 */
function objectDefinedNotNull(obj) {
    return typeof obj !== "undefined" && obj !== null;
}
/**
 * Shorthand for JSON.stringify
 *
 * @param o Any type of object
 */
function jsS(o) {
    return JSON.stringify(o);
}
/**
 * Shorthand for Object.hasOwnProperty
 *
 * @param o Object to check for
 * @param p Name of the property
 */
function hOP(o, p) {
    return Object.hasOwnProperty.call(o, p);
}
/**
 * Generates a ~unique hash code
 *
 * From: https://stackoverflow.com/questions/6122571/simple-non-secure-hash-function-for-javascript
 */
/* eslint-disable no-bitwise */
function getHashCode(s) {
    let hash = 0;
    if (s.length === 0) {
        return hash;
    }
    for (let i = 0; i < s.length; i++) {
        const chr = s.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}
/* eslint-enable no-bitwise */
/**
 * Waits a specified number of milliseconds before resolving
 *
 * @param ms Number of ms to wait
 */
function delay(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
//# sourceMappingURL=util.js.map

/***/ }),

/***/ "O7od":
/*!*********************************************************************!*\
  !*** ./node_modules/@microsoft/teams-js/dist/MicrosoftTeams.min.js ***!
  \*********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {!function(e,t){ true?module.exports=t():undefined}("undefined"!=typeof self?self:this,(()=>(()=>{var e={302:(e,t,n)=>{t.formatArgs=function(t){if(t[0]=(this.useColors?"%c":"")+this.namespace+(this.useColors?" %c":" ")+t[0]+(this.useColors?"%c ":" ")+"+"+e.exports.humanize(this.diff),!this.useColors)return;const n="color: "+this.color;t.splice(1,0,n,"color: inherit");let r=0,o=0;t[0].replace(/%[a-zA-Z%]/g,(e=>{"%%"!==e&&(r++,"%c"===e&&(o=r))})),t.splice(o,0,n)},t.save=function(e){try{e?t.storage.setItem("debug",e):t.storage.removeItem("debug")}catch(e){}},t.load=function(){let e;try{e=t.storage.getItem("debug")}catch(e){}!e&&"undefined"!=typeof process&&"env"in process&&(e=process.env.DEBUG);return e},t.useColors=function(){if("undefined"!=typeof window&&window.process&&("renderer"===window.process.type||window.process.__nwjs))return!0;if("undefined"!=typeof navigator&&navigator.userAgent&&navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/))return!1;return"undefined"!=typeof document&&document.documentElement&&document.documentElement.style&&document.documentElement.style.WebkitAppearance||"undefined"!=typeof window&&window.console&&(window.console.firebug||window.console.exception&&window.console.table)||"undefined"!=typeof navigator&&navigator.userAgent&&navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)&&parseInt(RegExp.$1,10)>=31||"undefined"!=typeof navigator&&navigator.userAgent&&navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/)},t.storage=function(){try{return localStorage}catch(e){}}(),t.destroy=(()=>{let e=!1;return()=>{e||(e=!0,console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."))}})(),t.colors=["#0000CC","#0000FF","#0033CC","#0033FF","#0066CC","#0066FF","#0099CC","#0099FF","#00CC00","#00CC33","#00CC66","#00CC99","#00CCCC","#00CCFF","#3300CC","#3300FF","#3333CC","#3333FF","#3366CC","#3366FF","#3399CC","#3399FF","#33CC00","#33CC33","#33CC66","#33CC99","#33CCCC","#33CCFF","#6600CC","#6600FF","#6633CC","#6633FF","#66CC00","#66CC33","#9900CC","#9900FF","#9933CC","#9933FF","#99CC00","#99CC33","#CC0000","#CC0033","#CC0066","#CC0099","#CC00CC","#CC00FF","#CC3300","#CC3333","#CC3366","#CC3399","#CC33CC","#CC33FF","#CC6600","#CC6633","#CC9900","#CC9933","#CCCC00","#CCCC33","#FF0000","#FF0033","#FF0066","#FF0099","#FF00CC","#FF00FF","#FF3300","#FF3333","#FF3366","#FF3399","#FF33CC","#FF33FF","#FF6600","#FF6633","#FF9900","#FF9933","#FFCC00","#FFCC33"],t.log=console.debug||console.log||(()=>{}),e.exports=n(65)(t);const{formatters:r}=e.exports;r.j=function(e){try{return JSON.stringify(e)}catch(e){return"[UnexpectedJSONParseError]: "+e.message}}},65:(e,t,n)=>{e.exports=function(e){function t(e){let n,o,i,a=null;function s(...e){if(!s.enabled)return;const r=s,o=Number(new Date),i=o-(n||o);r.diff=i,r.prev=n,r.curr=o,n=o,e[0]=t.coerce(e[0]),"string"!=typeof e[0]&&e.unshift("%O");let a=0;e[0]=e[0].replace(/%([a-zA-Z%])/g,((n,o)=>{if("%%"===n)return"%";a++;const i=t.formatters[o];if("function"==typeof i){const t=e[a];n=i.call(r,t),e.splice(a,1),a--}return n})),t.formatArgs.call(r,e);(r.log||t.log).apply(r,e)}return s.namespace=e,s.useColors=t.useColors(),s.color=t.selectColor(e),s.extend=r,s.destroy=t.destroy,Object.defineProperty(s,"enabled",{enumerable:!0,configurable:!1,get:()=>null!==a?a:(o!==t.namespaces&&(o=t.namespaces,i=t.enabled(e)),i),set:e=>{a=e}}),"function"==typeof t.init&&t.init(s),s}function r(e,n){const r=t(this.namespace+(void 0===n?":":n)+e);return r.log=this.log,r}function o(e){return e.toString().substring(2,e.toString().length-2).replace(/\.\*\?$/,"*")}return t.debug=t,t.default=t,t.coerce=function(e){if(e instanceof Error)return e.stack||e.message;return e},t.disable=function(){const e=[...t.names.map(o),...t.skips.map(o).map((e=>"-"+e))].join(",");return t.enable(""),e},t.enable=function(e){let n;t.save(e),t.namespaces=e,t.names=[],t.skips=[];const r=("string"==typeof e?e:"").split(/[\s,]+/),o=r.length;for(n=0;n<o;n++)r[n]&&("-"===(e=r[n].replace(/\*/g,".*?"))[0]?t.skips.push(new RegExp("^"+e.slice(1)+"$")):t.names.push(new RegExp("^"+e+"$")))},t.enabled=function(e){if("*"===e[e.length-1])return!0;let n,r;for(n=0,r=t.skips.length;n<r;n++)if(t.skips[n].test(e))return!1;for(n=0,r=t.names.length;n<r;n++)if(t.names[n].test(e))return!0;return!1},t.humanize=n(247),t.destroy=function(){console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.")},Object.keys(e).forEach((n=>{t[n]=e[n]})),t.names=[],t.skips=[],t.formatters={},t.selectColor=function(e){let n=0;for(let t=0;t<e.length;t++)n=(n<<5)-n+e.charCodeAt(t),n|=0;return t.colors[Math.abs(n)%t.colors.length]},t.enable(t.load()),t}},247:e=>{var t=1e3,n=60*t,r=60*n,o=24*r,i=7*o,a=365.25*o;function s(e){if(!((e=String(e)).length>100)){var s=/^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(e);if(s){var c=parseFloat(s[1]);switch((s[2]||"ms").toLowerCase()){case"years":case"year":case"yrs":case"yr":case"y":return c*a;case"weeks":case"week":case"w":return c*i;case"days":case"day":case"d":return c*o;case"hours":case"hour":case"hrs":case"hr":case"h":return c*r;case"minutes":case"minute":case"mins":case"min":case"m":return c*n;case"seconds":case"second":case"secs":case"sec":case"s":return c*t;case"milliseconds":case"millisecond":case"msecs":case"msec":case"ms":return c;default:return}}}}function c(e){var i=Math.abs(e);return i>=o?Math.round(e/o)+"d":i>=r?Math.round(e/r)+"h":i>=n?Math.round(e/n)+"m":i>=t?Math.round(e/t)+"s":e+"ms"}function u(e){var i=Math.abs(e);return i>=o?l(e,i,o,"day"):i>=r?l(e,i,r,"hour"):i>=n?l(e,i,n,"minute"):i>=t?l(e,i,t,"second"):e+" ms"}function l(e,t,n,r){var o=t>=1.5*n;return Math.round(e/n)+" "+r+(o?"s":"")}e.exports=function(e,t){t=t||{};var n=typeof e;if("string"===n&&e.length>0)return s(e);if("number"===n&&isFinite(e))return t.long?u(e):c(e);throw new Error("val is not a non-empty string or a valid number. val="+JSON.stringify(e))}}},t={};function n(r){var o=t[r];if(void 0!==o)return o.exports;var i=t[r]={exports:{}};return e[r](i,i.exports,n),i.exports}(()=>{n.d=(e,t)=>{for(var r in t)n.o(t,r)&&!n.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}})(),(()=>{n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t)})(),(()=>{n.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}})();var r={};return(()=>{"use strict";n.r(r),n.d(r,{ActionObjectType:()=>O,ChannelType:()=>B,ChildAppWindow:()=>Wn,DialogDimension:()=>W,ErrorCode:()=>D,FileOpenPreference:()=>R,FrameContexts:()=>x,HostClientType:()=>L,HostName:()=>H,LiveShareHost:()=>eo,NotificationTypes:()=>Nt,ParentAppWindow:()=>Bn,SecondaryM365ContentIdName:()=>M,TaskModuleDimension:()=>j,TeamType:()=>V,UserSettingTypes:()=>Lt,UserTeamRole:()=>_,ViewerActionTypes:()=>Ut,app:()=>Me,appEntity:()=>So,appInitialization:()=>br,appInstallDialog:()=>$t,authentication:()=>Ae,barCode:()=>Cn,calendar:()=>Gn,call:()=>yr,chat:()=>yn,clipboard:()=>Nn,conversations:()=>Ht,dialog:()=>ke,enablePrintCapability:()=>Ar,executeDeepLink:()=>zr,files:()=>vo,geoLocation:()=>Un,getAdaptiveCardSchemaVersion:()=>xn,getContext:()=>Rr,getMruTabInstances:()=>Br,getTabInstances:()=>Wr,initialize:()=>Fr,initializeWithFrameContext:()=>qr,liveShare:()=>$r,location:()=>_n,logs:()=>Dt,mail:()=>qn,marketplace:()=>wo,media:()=>vn,meeting:()=>jn,meetingRoom:()=>Co,menus:()=>Re,monetization:()=>zn,navigateBack:()=>Xr,navigateCrossDomain:()=>Zr,navigateToTab:()=>Kr,notifications:()=>yo,openFilePreview:()=>Qt,pages:()=>De,people:()=>Jn,print:()=>kr,profile:()=>Kn,registerAppButtonClickHandler:()=>Dr,registerAppButtonHoverEnterHandler:()=>Nr,registerAppButtonHoverLeaveHandler:()=>Ur,registerBackButtonHandler:()=>Lr,registerBeforeUnloadHandler:()=>xr,registerChangeSettingsHandler:()=>_r,registerCustomHandler:()=>Zt,registerFocusEnterHandler:()=>Vr,registerFullScreenHandler:()=>Mr,registerOnLoadHandler:()=>Hr,registerOnThemeChangeHandler:()=>Or,registerUserSettingsChangeHandler:()=>Xt,remoteCamera:()=>bo,returnFocus:()=>Jr,search:()=>gr,secondaryBrowser:()=>Vn,sendCustomEvent:()=>Kt,sendCustomMessage:()=>Jt,setFrameContext:()=>Gr,settings:()=>Sr,shareDeepLink:()=>jr,sharing:()=>wr,stageView:()=>vr,tasks:()=>Qr,teams:()=>Eo,teamsCore:()=>Oe,uploadCustomApp:()=>qt,version:()=>Ne,video:()=>hr,videoEx:()=>To,webStorage:()=>Cr});var e="2.0.1",t="2.0.2",o="2.0.3",i="2.0.4",a="2.0.1",s="1.9.0",c="2.0.0",u="1.7.0",l="1.8.0",d="1.9.0",f=["teams.microsoft.com","teams.microsoft.us","gov.teams.microsoft.us","dod.teams.microsoft.us","int.teams.microsoft.com","teams.live.com","devspaces.skype.com","ssauth.skype.com","local.teams.live.com","local.teams.live.com:8080","local.teams.office.com","local.teams.office.com:8080","outlook.office.com","outlook-sdf.office.com","outlook.office365.com","outlook-sdf.office365.com","outlook.live.com","outlook-sdf.live.com","*.teams.microsoft.com","*.www.office.com","www.office.com","word.office.com","excel.office.com","powerpoint.office.com","www.officeppe.com","*.www.microsoft365.com","www.microsoft365.com"],p=/^https:\/\//,m="https",h="teams.microsoft.com",g="The library has not yet been initialized",w="The runtime has not yet been initialized",v="The runtime version is not supported",C="The call was not properly started",y=function(){function e(){}return e.initializeCalled=!1,e.initializeCompleted=!1,e.additionalValidOrigins=[],e.isFramelessWindow=!1,e.printCapabilityEnabled=!1,e}(),b=(0,n(302).debug)("teamsJs");function S(e){return b.extend(e)}const E={randomUUID:"undefined"!=typeof crypto&&crypto.randomUUID&&crypto.randomUUID.bind(crypto)};let I;const T=new Uint8Array(16);function P(){if(!I&&(I="undefined"!=typeof crypto&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto),!I))throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return I(T)}const F=[];for(let e=0;e<256;++e)F.push((e+256).toString(16).slice(1));function A(e,t=0){return(F[e[t+0]]+F[e[t+1]]+F[e[t+2]]+F[e[t+3]]+"-"+F[e[t+4]]+F[e[t+5]]+"-"+F[e[t+6]]+F[e[t+7]]+"-"+F[e[t+8]]+F[e[t+9]]+"-"+F[e[t+10]]+F[e[t+11]]+F[e[t+12]]+F[e[t+13]]+F[e[t+14]]+F[e[t+15]]).toLowerCase()}const k=function(e,t,n){if(E.randomUUID&&!t&&!e)return E.randomUUID();const r=(e=e||{}).random||(e.rng||P)();if(r[6]=15&r[6]|64,r[8]=63&r[8]|128,t){n=n||0;for(let e=0;e<16;++e)t[n+e]=r[e];return t}return A(r)};var R,O,M,D,N,U,L,H,x,V,_,W;!function(e){e.Inline="inline",e.Desktop="desktop",e.Web="web"}(R||(R={})),function(e){e.M365Content="m365content"}(O||(O={})),function(e){e.DriveId="driveId",e.GroupId="groupId",e.SiteId="siteId",e.UserId="userId"}(M||(M={})),function(e){e[e.NOT_SUPPORTED_ON_PLATFORM=100]="NOT_SUPPORTED_ON_PLATFORM",e[e.INTERNAL_ERROR=500]="INTERNAL_ERROR",e[e.NOT_SUPPORTED_IN_CURRENT_CONTEXT=501]="NOT_SUPPORTED_IN_CURRENT_CONTEXT",e[e.PERMISSION_DENIED=1e3]="PERMISSION_DENIED",e[e.NETWORK_ERROR=2e3]="NETWORK_ERROR",e[e.NO_HW_SUPPORT=3e3]="NO_HW_SUPPORT",e[e.INVALID_ARGUMENTS=4e3]="INVALID_ARGUMENTS",e[e.UNAUTHORIZED_USER_OPERATION=5e3]="UNAUTHORIZED_USER_OPERATION",e[e.INSUFFICIENT_RESOURCES=6e3]="INSUFFICIENT_RESOURCES",e[e.THROTTLE=7e3]="THROTTLE",e[e.USER_ABORT=8e3]="USER_ABORT",e[e.OPERATION_TIMED_OUT=8001]="OPERATION_TIMED_OUT",e[e.OLD_PLATFORM=9e3]="OLD_PLATFORM",e[e.FILE_NOT_FOUND=404]="FILE_NOT_FOUND",e[e.SIZE_EXCEEDED=1e4]="SIZE_EXCEEDED"}(D||(D={})),function(e){e.GeoLocation="geolocation",e.Media="media"}(N||(N={})),function(e){e.TextPlain="text/plain",e.TextHtml="text/html",e.ImagePNG="image/png",e.ImageJPEG="image/jpeg"}(U||(U={})),function(e){e.desktop="desktop",e.web="web",e.android="android",e.ios="ios",e.ipados="ipados",e.macos="macos",e.rigel="rigel",e.surfaceHub="surfaceHub",e.teamsRoomsWindows="teamsRoomsWindows",e.teamsRoomsAndroid="teamsRoomsAndroid",e.teamsPhones="teamsPhones",e.teamsDisplays="teamsDisplays"}(L||(L={})),function(e){e.office="Office",e.outlook="Outlook",e.outlookWin32="OutlookWin32",e.orange="Orange",e.teams="Teams",e.teamsModern="TeamsModern"}(H||(H={})),function(e){e.settings="settings",e.content="content",e.authentication="authentication",e.remove="remove",e.task="task",e.sidePanel="sidePanel",e.stage="stage",e.meetingStage="meetingStage"}(x||(x={})),function(e){e[e.Standard=0]="Standard",e[e.Edu=1]="Edu",e[e.Class=2]="Class",e[e.Plc=3]="Plc",e[e.Staff=4]="Staff"}(V||(V={})),function(e){e[e.Admin=0]="Admin",e[e.User=1]="User",e[e.Guest=2]="Guest"}(_||(_={})),function(e){e.Large="large",e.Medium="medium",e.Small="small"}(W||(W={}));var B,j=W;!function(e){e.Regular="Regular",e.Private="Private",e.Shared="Shared"}(B||(B={}));var z={errorCode:D.NOT_SUPPORTED_ON_PLATFORM},G={majorVersion:1,minorVersion:5},q={adaptiveCardSchemaVersion:{majorVersion:1,minorVersion:5}};function J(e,t){if("*."===e.substring(0,2)){var n=e.substring(1);if(t.length>n.length&&t.split(".").length===n.split(".").length&&t.substring(t.length-n.length)===n)return!0}else if(e===t)return!0;return!1}var K=S("validateOrigin");function Z(e){if(!ae(e))return K("Origin %s is invalid because it is not using https protocol. Protocol being used: %s",e,e.protocol),!1;var t=e.host;if(f.some((function(e){return J(e,t)})))return!0;for(var n=0,r=y.additionalValidOrigins;n<r.length;n++){var o=r[n];if(J("https://"===o.substring(0,8)?o.substring(8):o,t))return!0}return K("Origin %s is invalid because it is not an origin approved by this library or included in the call to app.initialize.\nOrigins approved by this library: %o\nOrigins included in app.initialize: %o",e,f,y.additionalValidOrigins),!1}function X(e){return function(t,n){if(!t)throw new Error(e||n)}}function Q(e,t){if("string"!=typeof e||"string"!=typeof t)return NaN;var n=e.split("."),r=t.split(".");function o(e){return/^\d+$/.test(e)}if(!n.every(o)||!r.every(o))return NaN;for(;n.length<r.length;)n.push("0");for(;r.length<n.length;)r.push("0");for(var i=0;i<n.length;++i)if(Number(n[i])!=Number(r[i]))return Number(n[i])>Number(r[i])?1:-1;return 0}function $(){return k()}function Y(e){return Object.keys(e).forEach((function(t){"object"==typeof e[t]&&Y(e[t])})),Object.freeze(e)}function ee(e,t){for(var n=[],r=2;r<arguments.length;r++)n[r-2]=arguments[r];var o=e.apply(void 0,n);return o.then((function(e){t&&t(void 0,e)})).catch((function(e){t&&t(e)})),o}function te(e,t){for(var n=[],r=2;r<arguments.length;r++)n[r-2]=arguments[r];var o=e.apply(void 0,n);return o.then((function(){t&&t(null)})).catch((function(e){t&&t(e)})),o}function ne(e,t){for(var n=[],r=2;r<arguments.length;r++)n[r-2]=arguments[r];var o=e.apply(void 0,n);return o.then((function(e){t&&t(null,e)})).catch((function(e){t&&t(e,null)})),o}function re(e,t,n){return new Promise((function(r,o){var i=setTimeout(o,t,n);e().then((function(e){clearTimeout(i),r(e)})).catch((function(e){clearTimeout(i),o(e)}))}))}function oe(e){var t=new URL("https://teams.microsoft.com/l/entity/"+encodeURIComponent(e.appId)+"/"+encodeURIComponent(e.pageId));return e.webUrl&&t.searchParams.append("webUrl",e.webUrl),(e.channelId||e.subPageId)&&t.searchParams.append("context",JSON.stringify({channelId:e.channelId,subEntityId:e.subPageId})),t.toString()}function ie(e){return!(Q("".concat(e.majorVersion,".").concat(e.minorVersion),"".concat(G.majorVersion,".").concat(G.minorVersion))>=0)}function ae(e){return"https:"===e.protocol}function se(e,t){return new Promise((function(n,r){e||r("MimeType cannot be null or empty."),t||r("Base64 string cannot be null or empty.");var o=atob(t);if(e.startsWith("image/")){for(var i=new Uint8Array(o.length),a=0;a<o.length;a++)i[a]=o.charCodeAt(a);n(new Blob([i],{type:e}))}n(new Blob([o],{type:e}))}))}function ce(e){return new Promise((function(t,n){0===e.size&&n(new Error("Blob cannot be empty."));var r=new FileReader;r.onloadend=function(){r.result?t(r.result.toString().split(",")[1]):n(new Error("Failed to read the blob"))},r.onerror=function(){n(r.error)},r.readAsDataURL(e)}))}function ue(){if(le())throw new Error("window object undefined at SSR check");return window}function le(){return"undefined"==typeof window}var de=function(){return de=Object.assign||function(e){for(var t,n=1,r=arguments.length;n<r;n++)for(var o in t=arguments[n])Object.prototype.hasOwnProperty.call(t,o)&&(e[o]=t[o]);return e},de.apply(this,arguments)},fe=function(e,t){var n={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var o=0;for(r=Object.getOwnPropertySymbols(e);o<r.length;o++)t.indexOf(r[o])<0&&Object.prototype.propertyIsEnumerable.call(e,r[o])&&(n[r[o]]=e[r[o]])}return n},pe=S("runtime"),me=3;function he(e){return e.apiVersion===me}var ge={apiVersion:-1,supports:{}};function we(e){if(he(e))return!0;throw-1===e.apiVersion?new Error(w):new Error(v)}var ve=ge,Ce={apiVersion:3,hostVersionsInfo:q,isLegacyTeams:!0,supports:{appInstallDialog:{},appEntity:{},call:{},chat:{},conversations:{},dialog:{card:{bot:{}},url:{bot:{}},update:{}},interactive:{},logs:{},meetingRoom:{},menus:{},monetization:{},notifications:{},pages:{appButton:{},tabs:{},config:{},backStack:{},fullTrust:{}},remoteCamera:{},stageView:{},teams:{fullTrust:{}},teamsCore:{},video:{sharedFrame:{}}}},ye=[L.desktop,L.web,L.android,L.ios,L.rigel,L.surfaceHub,L.teamsRoomsWindows,L.teamsRoomsAndroid,L.teamsPhones,L.teamsDisplays];function be(e){var t=e;if(t.apiVersion<me&&Se.forEach((function(e){t.apiVersion===e.versionToUpgradeFrom&&(t=e.upgradeToNextVersion(t))})),he(t))return t;throw new Error("Received a runtime that could not be upgraded to the latest version")}var Se=[{versionToUpgradeFrom:1,upgradeToNextVersion:function(e){var t;return{apiVersion:2,hostVersionsInfo:void 0,isLegacyTeams:e.isLegacyTeams,supports:de(de({},e.supports),{dialog:e.supports.dialog?{card:void 0,url:e.supports.dialog,update:null===(t=e.supports.dialog)||void 0===t?void 0:t.update}:void 0})}}},{versionToUpgradeFrom:2,upgradeToNextVersion:function(e){var t=e.supports,n=(t.appNotification,fe(t,["appNotification"]));return de(de({},e),{apiVersion:3,supports:n})}}],Ee={"1.9.0":[{capability:{location:{}},hostClientTypes:ye}],"2.0.0":[{capability:{people:{}},hostClientTypes:ye},{capability:{sharing:{}},hostClientTypes:[L.desktop,L.web]}],"2.0.1":[{capability:{teams:{fullTrust:{joinedTeams:{}}}},hostClientTypes:[L.android,L.desktop,L.ios,L.teamsRoomsAndroid,L.teamsPhones,L.teamsDisplays,L.web]},{capability:{webStorage:{}},hostClientTypes:[L.desktop]}],"2.0.5":[{capability:{webStorage:{}},hostClientTypes:[L.android,L.desktop,L.ios]}]},Ie=pe.extend("generateBackCompatRuntimeConfig");function Te(e){Ie("generating back compat runtime config for %s",e);var t=de({},Ce.supports);Ie("Supported capabilities in config before updating based on highestSupportedVersion: %o",t),Object.keys(Ee).forEach((function(n){Q(e,n)>=0&&Ee[n].forEach((function(e){e.hostClientTypes.includes(y.hostClientType)&&(t=de(de({},t),e.capability))}))}));var n={apiVersion:me,hostVersionsInfo:q,isLegacyTeams:!0,supports:t};return Ie("Runtime config after updating based on highestSupportedVersion: %o",n),n}var Pe=pe.extend("applyRuntimeConfig");function Fe(e){"string"==typeof e.apiVersion&&(Pe("Trying to apply runtime with string apiVersion, processing as v1: %o",e),e=de(de({},e),{apiVersion:1})),Pe("Fast-forwarding runtime %o",e);var t=be(e);Pe("Applying runtime %o",t),ve=Y(t)}var Ae,ke,Re,Oe,Me,De,Ne="2.15.0",Ue=S("internal"),Le=Ue.extend("ensureInitializeCalled"),He=Ue.extend("ensureInitialized");function xe(){if(!y.initializeCalled)throw Le(g),new Error(g)}function Ve(e){for(var t=[],n=1;n<arguments.length;n++)t[n-1]=arguments[n];if(!y.initializeCompleted)throw He("%s. initializeCalled: %s",g,y.initializeCalled.toString()),new Error(g);if(t&&t.length>0){for(var r=!1,o=0;o<t.length;o++)if(t[o]===y.frameContext){r=!0;break}if(!r)throw new Error("This call is only allowed in following contexts: ".concat(JSON.stringify(t),". ")+'Current context: "'.concat(y.frameContext,'".'))}return we(e)}function _e(t){void 0===t&&(t=e);var n=Q(y.clientSupportedSDKVersion,t);return!isNaN(n)&&n>=0}function We(){return y.hostClientType==L.android||y.hostClientType==L.ios||y.hostClientType==L.ipados}function Be(t){if(void 0===t&&(t=e),!We())throw{errorCode:D.NOT_SUPPORTED_ON_PLATFORM};if(!_e(t))throw{errorCode:D.OLD_PLATFORM}}function je(e){var t=y.additionalValidOrigins.concat(e.filter((function(e){return"string"==typeof e&&p.test(e)}))),n={};t=t.filter((function(e){return!n[e]&&(n[e]=!0,!0)})),y.additionalValidOrigins=t}function ze(e){return{actionInfo:e.actionInfo,app:{locale:e.locale,sessionId:e.appSessionId?e.appSessionId:"",theme:e.theme?e.theme:"default",iconPositionVertical:e.appIconPosition,osLocaleInfo:e.osLocaleInfo,parentMessageId:e.parentMessageId,userClickTime:e.userClickTime,userFileOpenPreference:e.userFileOpenPreference,host:{name:e.hostName?e.hostName:H.teams,clientType:e.hostClientType?e.hostClientType:L.web,sessionId:e.sessionId?e.sessionId:"",ringId:e.ringId},appLaunchId:e.appLaunchId},page:{id:e.entityId,frameContext:e.frameContext?e.frameContext:y.frameContext,subPageId:e.subEntityId,isFullScreen:e.isFullScreen,isMultiWindow:e.isMultiWindow,sourceOrigin:e.sourceOrigin},user:{id:e.userObjectId,displayName:e.userDisplayName,isCallingAllowed:e.isCallingAllowed,isPSTNCallingAllowed:e.isPSTNCallingAllowed,licenseType:e.userLicenseType,loginHint:e.loginHint,userPrincipalName:e.userPrincipalName,tenant:e.tid?{id:e.tid,teamsSku:e.tenantSKU}:void 0},channel:e.channelId?{id:e.channelId,displayName:e.channelName,relativeUrl:e.channelRelativeUrl,membershipType:e.channelType,defaultOneNoteSectionId:e.defaultOneNoteSectionId,ownerGroupId:e.hostTeamGroupId,ownerTenantId:e.hostTeamTenantId}:void 0,chat:e.chatId?{id:e.chatId}:void 0,meeting:e.meetingId?{id:e.meetingId}:void 0,sharepoint:e.sharepoint,team:e.teamId?{internalId:e.teamId,displayName:e.teamName,type:e.teamType,groupId:e.groupId,templateId:e.teamTemplateId,isArchived:e.isTeamArchived,userRole:e.userTeamRole}:void 0,sharePointSite:e.teamSiteUrl||e.teamSiteDomain||e.teamSitePath||e.mySitePath||e.mySiteDomain?{teamSiteUrl:e.teamSiteUrl,teamSiteDomain:e.teamSiteDomain,teamSitePath:e.teamSitePath,teamSiteId:e.teamSiteId,mySitePath:e.mySitePath,mySiteDomain:e.mySiteDomain}:void 0}}!function(e){var t,n,r;function o(e){return new Promise((function(n,r){if(y.hostClientType===L.desktop||y.hostClientType===L.android||y.hostClientType===L.ios||y.hostClientType===L.ipados||y.hostClientType===L.macos||y.hostClientType===L.rigel||y.hostClientType===L.teamsRoomsWindows||y.hostClientType===L.teamsRoomsAndroid||y.hostClientType===L.teamsPhones||y.hostClientType===L.teamsDisplays||y.hostClientType===L.surfaceHub){var o=document.createElement("a");o.href=e.url,n(wt("authentication.authenticate",[o.href,e.width,e.height,e.isExternal]).then((function(e){var t=e[0],n=e[1];if(t)return n;throw new Error(n)})))}else t={success:n,fail:r},c(e)}))}function i(e){return new Promise((function(t){t(wt("authentication.getAuthToken",[null==e?void 0:e.resources,null==e?void 0:e.claims,null==e?void 0:e.silent]))})).then((function(e){var t=e[0],n=e[1];if(t)return n;throw new Error(n)}))}function a(){return new Promise((function(e){e(wt("authentication.getUser"))})).then((function(e){var t=e[0],n=e[1];if(t)return n;throw new Error(n)}))}function s(){u();try{ut.childWindow&&ut.childWindow.close()}finally{ut.childWindow=null,ut.childOrigin=null}}function c(e){s();var t=e.width||600,n=e.height||400;t=Math.min(t,ut.currentWindow.outerWidth-400),n=Math.min(n,ut.currentWindow.outerHeight-200);var r=document.createElement("a");r.href=e.url.replace("{oauthRedirectMethod}","web");var o=void 0!==ut.currentWindow.screenLeft?ut.currentWindow.screenLeft:ut.currentWindow.screenX,i=void 0!==ut.currentWindow.screenTop?ut.currentWindow.screenTop:ut.currentWindow.screenY;o+=ut.currentWindow.outerWidth/2-t/2,i+=ut.currentWindow.outerHeight/2-n/2,ut.childWindow=ut.currentWindow.open(r.href,"_blank","toolbar=no, location=yes, status=no, menubar=no, scrollbars=yes, top="+i+", left="+o+", width="+t+", height="+n),ut.childWindow?l():f("FailedToOpenWindow")}function u(){n&&(clearInterval(n),n=0),$e("initialize"),$e("navigateCrossDomain")}function l(){u(),n=ut.currentWindow.setInterval((function(){if(!ut.childWindow||ut.childWindow.closed)f("CancelledByUser");else{var e=ut.childOrigin;try{ut.childOrigin="*",Bt("ping")}finally{ut.childOrigin=e}}}),100),Qe("initialize",(function(){return[x.authentication,y.hostClientType]})),Qe("navigateCrossDomain",(function(){return!1}))}function d(e){try{t&&t.success(e)}finally{t=null,s()}}function f(e){try{t&&t.fail(new Error(e))}finally{t=null,s()}}function p(e,t,n){if(e){var r=document.createElement("a");r.href=decodeURIComponent(e),r.host&&r.host!==ue().location.host&&"outlook.office.com"===r.host&&r.search.indexOf("client_type=Win32_Outlook")>-1&&(t&&"result"===t&&(n&&(r.href=m(r.href,"result",n)),ut.currentWindow.location.assign(m(r.href,"authSuccess",""))),t&&"reason"===t&&(n&&(r.href=m(r.href,"reason",n)),ut.currentWindow.location.assign(m(r.href,"authFailure",""))))}}function m(e,t,n){var r=e.indexOf("#"),o=-1===r?"#":e.substr(r);return o=o+"&"+t+(""!==n?"="+n:""),(e=-1===r?e:e.substr(0,r))+o}e.initialize=function(){Qe("authentication.authenticate.success",d,!1),Qe("authentication.authenticate.failure",f,!1)},e.registerAuthenticationHandlers=function(e){r=e},e.authenticate=function(e){var t=void 0!==e,n=t?e:r;if(!n)throw new Error("No parameters are provided for authentication");return Ve(ve,x.content,x.sidePanel,x.settings,x.remove,x.task,x.stage,x.meetingStage),o(n).then((function(e){try{return n&&n.successCallback?(n.successCallback(e),""):e}finally{t||(r=null)}})).catch((function(e){try{if(n&&n.failureCallback)return n.failureCallback(e.message),"";throw e}finally{t||(r=null)}}))},e.getAuthToken=function(e){return xe(),i(e).then((function(t){return e&&e.successCallback?(e.successCallback(t),""):t})).catch((function(t){if(e&&e.failureCallback)return e.failureCallback(t.message),"";throw t}))},e.getUser=function(e){return xe(),a().then((function(t){return e&&e.successCallback?(e.successCallback(t),null):t})).catch((function(t){if(e&&e.failureCallback)return e.failureCallback(t.message),null;throw t}))},e.notifySuccess=function(e,t){p(t,"result",e),Ve(ve,x.authentication),Ct("authentication.authenticate.success",[e]),_t(ut.parentWindow,(function(){return setTimeout((function(){return ut.currentWindow.close()}),200)}))},e.notifyFailure=function(e,t){p(t,"reason",e),Ve(ve,x.authentication),Ct("authentication.authenticate.failure",[e]),_t(ut.parentWindow,(function(){return setTimeout((function(){return ut.currentWindow.close()}),200)}))},function(e){e.Public="public",e.EUDB="eudb",e.Other="other"}(e.DataResidency||(e.DataResidency={}))}(Ae||(Ae={})),function(e){var t=[];function n(e){y.frameContext&&(y.frameContext===x.task?t.push(e):$e("messageForChild"))}e.initialize=function(){Qe("messageForChild",n,!1)},function(e){function n(){return Ve(ve)&&void 0!==(ve.supports.dialog&&ve.supports.dialog.url)}function r(e){return{url:e.url,height:e.size?e.size.height:W.Small,width:e.size?e.size.width:W.Small,title:e.title,fallbackUrl:e.fallbackUrl}}function o(e){var t=r(e);return t.completionBotId=e.completionBotId,t}e.open=function(e,t,o){if(Ve(ve,x.content,x.sidePanel,x.meetingStage),!n())throw z;o&&Qe("messageForParent",o),Ct("tasks.startTask",[r(e)],(function(e,n){null==t||t({err:e,result:n}),$e("messageForParent")}))},e.submit=function(e,t){if(Ve(ve,x.content,x.task),!n())throw z;Ct("tasks.completeTask",[e,t?Array.isArray(t)?t:[t]:[]])},e.sendMessageToParentFromDialog=function(e){if(Ve(ve,x.task),!n())throw z;Ct("messageForParent",[e])},e.sendMessageToDialog=function(e){if(Ve(ve,x.content,x.sidePanel,x.meetingStage),!n())throw z;Ct("messageForChild",[e])},e.registerOnMessageFromParent=function(e){if(Ve(ve,x.task),!n())throw z;for($e("messageForChild"),Qe("messageForChild",e),t.reverse();t.length>0;){e(t.pop())}},e.isSupported=n,function(e){function t(){return Ve(ve)&&void 0!==(ve.supports.dialog&&ve.supports.dialog.url&&ve.supports.dialog.url.bot)}e.open=function(e,n,r){if(Ve(ve,x.content,x.sidePanel,x.meetingStage),!t())throw z;r&&Qe("messageForParent",r),Ct("tasks.startTask",[o(e)],(function(e,t){null==n||n({err:e,result:t}),$e("messageForParent")}))},e.isSupported=t}(e.bot||(e.bot={})),e.getDialogInfoFromUrlDialogInfo=r,e.getDialogInfoFromBotUrlDialogInfo=o}(e.url||(e.url={})),e.isSupported=function(){return!(!Ve(ve)||!ve.supports.dialog)},function(e){function t(){return!(!Ve(ve)||!ve.supports.dialog)&&!!ve.supports.dialog.update}e.resize=function(e){if(Ve(ve,x.content,x.sidePanel,x.task,x.meetingStage),!t())throw z;Ct("tasks.updateTask",[e])},e.isSupported=t}(e.update||(e.update={})),function(e){function t(){var e=ve.hostVersionsInfo&&ve.hostVersionsInfo.adaptiveCardSchemaVersion&&!ie(ve.hostVersionsInfo.adaptiveCardSchemaVersion);return Ve(ve)&&void 0!==(e&&ve.supports.dialog&&ve.supports.dialog.card)}function n(e){return{card:e.card,height:e.size?e.size.height:W.Small,width:e.size?e.size.width:W.Small,title:e.title}}function r(e){var t=n(e);return t.completionBotId=e.completionBotId,t}e.open=function(e,r){if(Ve(ve,x.content,x.sidePanel,x.meetingStage),!t())throw z;Ct("tasks.startTask",[n(e)],(function(e,t){null==r||r({err:e,result:t})}))},e.isSupported=t,function(e){function t(){var e=ve.hostVersionsInfo&&ve.hostVersionsInfo.adaptiveCardSchemaVersion&&!ie(ve.hostVersionsInfo.adaptiveCardSchemaVersion);return Ve(ve)&&void 0!==(e&&ve.supports.dialog&&ve.supports.dialog.card&&ve.supports.dialog.card.bot)}e.open=function(e,n){if(Ve(ve,x.content,x.sidePanel,x.meetingStage),!t())throw z;Ct("tasks.startTask",[r(e)],(function(e,t){null==n||n({err:e,result:t})}))},e.isSupported=t}(e.bot||(e.bot={}))}(e.adaptiveCard||(e.adaptiveCard={}))}(ke||(ke={})),function(e){!function(e){e[e.ifRoom=0]="ifRoom",e[e.overflowOnly=1]="overflowOnly"}(e.DisplayMode||(e.DisplayMode={}));var t,n,r,o=function(){return function(){this.enabled=!0,this.selected=!1}}();function i(e){r&&r(e)||(Ve(ve),Ct("viewConfigItemPress",[e]))}function a(e){t&&t(e)||(Ve(ve),Ct("handleNavBarMenuItemPress",[e]))}function s(e){n&&n(e)||(Ve(ve),Ct("handleActionMenuItemPress",[e]))}function c(){return!(!Ve(ve)||!ve.supports.menus)}e.MenuItem=o,function(e){e.dropDown="dropDown",e.popOver="popOver"}(e.MenuListType||(e.MenuListType={})),e.initialize=function(){Qe("navBarMenuItemPress",a,!1),Qe("actionMenuItemPress",s,!1),Qe("setModuleView",i,!1)},e.setUpViews=function(e,t){if(Ve(ve),!c())throw z;r=t,Ct("setUpViews",[e])},e.setNavBarMenu=function(e,n){if(Ve(ve),!c())throw z;t=n,Ct("setNavBarMenu",[e])},e.showActionMenu=function(e,t){if(Ve(ve),!c())throw z;n=t,Ct("showActionMenu",[e])},e.isSupported=c}(Re||(Re={})),function(e){function t(){ue().print()}function n(e,t){e&&Ve(ve),e&&t&&t(),rt(e)}function r(e,t){e&&Ve(ve),e&&t&&t(),it(e)}function o(){return!(!Ve(ve)||!ve.supports.teamsCore)}e.enablePrintCapability=function(){if(!y.printCapabilityEnabled){if(Ve(ve),!o())throw z;y.printCapabilityEnabled=!0,document.addEventListener("keydown",(function(e){(e.ctrlKey||e.metaKey)&&80===e.keyCode&&(t(),e.cancelBubble=!0,e.preventDefault(),e.stopImmediatePropagation())}))}},e.print=t,e.registerOnLoadHandler=function(e){n(e,(function(){if(e&&!o())throw z}))},e.registerOnLoadHandlerHelper=n,e.registerBeforeUnloadHandler=function(e){r(e,(function(){if(e&&!o())throw z}))},e.registerBeforeUnloadHandlerHelper=r,e.isSupported=o}(Oe||(Oe={})),function(t){var n=S("app");t.Messages={AppLoaded:"appInitialization.appLoaded",Success:"appInitialization.success",Failure:"appInitialization.failure",ExpectedFailure:"appInitialization.expectedFailure"},function(e){e.AuthFailed="AuthFailed",e.Timeout="Timeout",e.Other="Other"}(t.FailedReason||(t.FailedReason={})),function(e){e.PermissionError="PermissionError",e.NotFound="NotFound",e.Throttling="Throttling",e.Offline="Offline",e.Other="Other"}(t.ExpectedFailureReason||(t.ExpectedFailureReason={})),t.isInitialized=function(){return y.initializeCompleted},t.getFrameContext=function(){return y.frameContext};var r=5e3;t.initialize=function(e){return le()?(n.extend("initialize")("window object undefined at initialization"),Promise.resolve()):re((function(){return i(e)}),r,new Error("SDK initialization timed out."))};var o=n.extend("initializeHelper");function i(t){return new Promise((function(n){y.initializeCalled||(y.initializeCalled=!0,Ke(),y.initializePromise=dt(t).then((function(t){var n=t.context,r=t.clientType,i=t.runtimeConfig,a=t.clientSupportedSDKVersion,s=void 0===a?e:a;y.frameContext=n,y.hostClientType=r,y.clientSupportedSDKVersion=s;try{o("Parsing %s",i);var c=JSON.parse(i);if(o("Checking if %o is a valid runtime object",null!=c?c:"null"),!c||!c.apiVersion)throw new Error("Received runtime config is invalid");i&&Fe(c)}catch(t){if(!(t instanceof SyntaxError))throw t;try{o("Attempting to parse %s as an SDK version",i),isNaN(Q(i,e))||(y.clientSupportedSDKVersion=i);c=JSON.parse(s);if(o("givenRuntimeConfig parsed to %o",null!=c?c:"null"),!c)throw new Error("givenRuntimeConfig string was successfully parsed. However, it parsed to value of null");Fe(c)}catch(e){if(!(e instanceof SyntaxError))throw e;Fe(Te(y.clientSupportedSDKVersion))}}y.initializeCompleted=!0})),Ae.initialize(),Re.initialize(),De.config.initialize(),ke.initialize()),Array.isArray(t)&&je(t),n(y.initializePromise)}))}function a(e){e&&xe(),tt(e)}t._initialize=function(e){ut.currentWindow=e},t._uninitialize=function(){y.initializeCalled&&(y.frameContext&&(a(null),De.backStack.registerBackButtonHandler(null),De.registerFullScreenHandler(null),Oe.registerBeforeUnloadHandler(null),Oe.registerOnLoadHandler(null),Dt.registerGetLogHandler(null)),y.frameContext===x.settings&&De.config.registerOnSaveHandler(null),y.frameContext===x.remove&&De.config.registerOnRemoveHandler(null),y.initializeCalled=!1,y.initializeCompleted=!1,y.initializePromise=null,y.additionalValidOrigins=[],y.frameContext=null,y.hostClientType=null,y.isFramelessWindow=!1,ft())},t.getContext=function(){return new Promise((function(e){xe(),e(pt("getContext"))})).then((function(e){return ze(e)}))},t.notifyAppLoaded=function(){xe(),Ct(t.Messages.AppLoaded,[Ne])},t.notifySuccess=function(){xe(),Ct(t.Messages.Success,[Ne])},t.notifyFailure=function(e){xe(),Ct(t.Messages.Failure,[e.reason,e.message])},t.notifyExpectedFailure=function(e){xe(),Ct(t.Messages.ExpectedFailure,[e.reason,e.message])},t.registerOnThemeChangeHandler=a,t.openLink=function(e){return new Promise((function(t){Ve(ve,x.content,x.sidePanel,x.settings,x.task,x.stage,x.meetingStage),t(mt("executeDeepLink",e))}))}}(Me||(Me={})),function(e){function t(e){if(Ve(ve,x.content),!n())throw z;Ct("setFrameContext",[e])}function n(){return!(!Ve(ve)||!ve.supports.pages)}e.returnFocus=function(e){if(Ve(ve),!n())throw z;Ct("returnFocus",[e])},e.registerFocusEnterHandler=function(e){et("focusEnter",e,[],(function(){if(!n())throw z}))},e.setCurrentFrame=t,e.initializeWithFrameContext=function(e,n,r){Me.initialize(r).then((function(){return n&&n()})),t(e)},e.getConfig=function(){return new Promise((function(e){if(Ve(ve,x.content,x.settings,x.remove,x.sidePanel),!n())throw z;e(pt("settings.getSettings"))}))},e.navigateCrossDomain=function(e){return new Promise((function(t){if(Ve(ve,x.content,x.sidePanel,x.settings,x.remove,x.task,x.stage,x.meetingStage),!n())throw z;t(ht("navigateCrossDomain","Cross-origin navigation is only supported for URLs matching the pattern registered in the manifest.",e))}))},e.navigateToApp=function(e){return new Promise((function(t){if(Ve(ve,x.content,x.sidePanel,x.settings,x.task,x.stage,x.meetingStage),!n())throw z;ve.isLegacyTeams?t(mt("executeDeepLink",oe(e))):t(mt("pages.navigateToApp",e))}))},e.shareDeepLink=function(e){if(Ve(ve,x.content,x.sidePanel,x.meetingStage),!n())throw z;Ct("shareDeepLink",[e.subPageId,e.subPageLabel,e.subPageWebUrl])},e.registerFullScreenHandler=function(e){et("fullScreenChange",e,[],(function(){if(e&&!n())throw z}))},e.isSupported=n,function(e){function t(){return!(!Ve(ve)||!ve.supports.pages)&&!!ve.supports.pages.tabs}e.navigateToTab=function(e){return new Promise((function(n){if(Ve(ve),!t())throw z;n(ht("navigateToTab","Invalid internalTabInstanceId and/or channelId were/was provided",e))}))},e.getTabInstances=function(e){return new Promise((function(n){if(Ve(ve),!t())throw z;n(pt("getTabInstances",e))}))},e.getMruTabInstances=function(e){return new Promise((function(n){if(Ve(ve),!t())throw z;n(pt("getMruTabInstances",e))}))},e.isSupported=t}(e.tabs||(e.tabs={})),function(e){var t,n;function r(e,n){e&&Ve(ve,x.settings),n&&n(),t=e,e&&Ct("registerHandler",["save"])}function o(e,t){e&&Ve(ve,x.remove,x.settings),t&&t(),n=e,e&&Ct("registerHandler",["remove"])}function i(e){var n=new a(e);t?t(n):ut.childWindow?Bt("settings.save",[e]):n.notifySuccess()}e.initialize=function(){Qe("settings.save",i,!1),Qe("settings.remove",s,!1)},e.setValidityState=function(e){if(Ve(ve,x.settings,x.remove),!u())throw z;Ct("settings.setValidityState",[e])},e.setConfig=function(e){return new Promise((function(t){if(Ve(ve,x.content,x.settings,x.sidePanel),!u())throw z;t(mt("settings.setSettings",e))}))},e.registerOnSaveHandler=function(e){r(e,(function(){if(e&&!u())throw z}))},e.registerOnSaveHandlerHelper=r,e.registerOnRemoveHandler=function(e){o(e,(function(){if(e&&!u())throw z}))},e.registerOnRemoveHandlerHelper=o,e.registerChangeConfigHandler=function(e){et("changeSettings",e,[x.content],(function(){if(!u())throw z}))};var a=function(){function e(e){this.notified=!1,this.result=e||{}}return e.prototype.notifySuccess=function(){this.ensureNotNotified(),Ct("settings.save.success"),this.notified=!0},e.prototype.notifyFailure=function(e){this.ensureNotNotified(),Ct("settings.save.failure",[e]),this.notified=!0},e.prototype.ensureNotNotified=function(){if(this.notified)throw new Error("The SaveEvent may only notify success or failure once.")},e}();function s(){var e=new c;n?n(e):ut.childWindow?Bt("settings.remove",[]):e.notifySuccess()}var c=function(){function e(){this.notified=!1}return e.prototype.notifySuccess=function(){this.ensureNotNotified(),Ct("settings.remove.success"),this.notified=!0},e.prototype.notifyFailure=function(e){this.ensureNotNotified(),Ct("settings.remove.failure",[e]),this.notified=!0},e.prototype.ensureNotNotified=function(){if(this.notified)throw new Error("The removeEventType may only notify success or failure once.")},e}();function u(){return!(!Ve(ve)||!ve.supports.pages)&&!!ve.supports.pages.config}e.isSupported=u}(e.config||(e.config={})),function(e){var t;function n(){return new Promise((function(e){if(Ve(ve),!i())throw z;e(ht("navigateBack","Back navigation is not supported in the current client or context."))}))}function r(e,n){e&&Ve(ve),n&&n(),t=e,e&&Ct("registerHandler",["backButton"])}function o(){t&&t()||(ut.childWindow?Bt("backButtonPress",[]):n())}function i(){return!(!Ve(ve)||!ve.supports.pages)&&!!ve.supports.pages.backStack}e._initialize=function(){Qe("backButtonPress",o,!1)},e.navigateBack=n,e.registerBackButtonHandler=function(e){r(e,(function(){if(e&&!i())throw z}))},e.registerBackButtonHandlerHelper=r,e.isSupported=i}(e.backStack||(e.backStack={})),function(e){function t(){return!(!Ve(ve)||!ve.supports.pages)&&!!ve.supports.pages.fullTrust}e.enterFullscreen=function(){if(Ve(ve,x.content),!t())throw z;Ct("enterFullscreen",[])},e.exitFullscreen=function(){if(Ve(ve,x.content),!t())throw z;Ct("exitFullscreen",[])},e.isSupported=t}(e.fullTrust||(e.fullTrust={})),function(e){function t(){return!(!Ve(ve)||!ve.supports.pages)&&!!ve.supports.pages.appButton}e.onClick=function(e){et("appButtonClick",e,[x.content],(function(){if(!t())throw z}))},e.onHoverEnter=function(e){et("appButtonHoverEnter",e,[x.content],(function(){if(!t())throw z}))},e.onHoverLeave=function(e){et("appButtonHoverLeave",e,[x.content],(function(){if(!t())throw z}))},e.isSupported=t}(e.appButton||(e.appButton={})),function(e){function t(){return!(!Ve(ve)||!ve.supports.pages)&&!!ve.supports.pages.currentApp}e.navigateTo=function(e){return new Promise((function(n){if(Ve(ve,x.content,x.sidePanel,x.settings,x.task,x.stage,x.meetingStage),!t())throw z;n(gt("pages.currentApp.navigateTo",e))}))},e.navigateToDefaultPage=function(){return new Promise((function(e){if(Ve(ve,x.content,x.sidePanel,x.settings,x.task,x.stage,x.meetingStage),!t())throw z;e(gt("pages.currentApp.navigateToDefaultPage"))}))},e.isSupported=t}(e.currentApp||(e.currentApp={}))}(De||(De={}));var Ge=function(e,t,n){if(n||2===arguments.length)for(var r,o=0,i=t.length;o<i;o++)!r&&o in t||(r||(r=Array.prototype.slice.call(t,0,o)),r[o]=t[o]);return e.concat(r||Array.prototype.slice.call(t))},qe=S("handlers"),Je=function(){function e(){}return e.handlers={},e}();function Ke(){Je.handlers.themeChange=nt,Je.handlers.load=ot,Je.handlers.beforeUnload=at,De.backStack._initialize()}var Ze=qe.extend("callHandler");function Xe(e,t){var n=Je.handlers[e];return n?(Ze("Invoking the registered handler for message %s with arguments %o",e,t),[!0,n.apply(this,t)]):ut.childWindow?(Bt(e,t),[!1,void 0]):(Ze("Handler for action message %s not found.",e),[!1,void 0])}function Qe(e,t,n,r){void 0===n&&(n=!0),void 0===r&&(r=[]),t?(Je.handlers[e]=t,n&&Ct("registerHandler",Ge([e],r,!0))):delete Je.handlers[e]}function $e(e){delete Je.handlers[e]}function Ye(e){return null!=Je.handlers[e]}function et(e,t,n,r){t&&Ve.apply(void 0,Ge([ve],n,!1)),r&&r(),Qe(e,t)}function tt(e){Je.themeChangeHandler=e,e&&Ct("registerHandler",["themeChange"])}function nt(e){Je.themeChangeHandler&&Je.themeChangeHandler(e),ut.childWindow&&Bt("themeChange",[e])}function rt(e){Je.loadHandler=e,e&&Ct("registerHandler",["load"])}function ot(e){Je.loadHandler&&Je.loadHandler(e),ut.childWindow&&Bt("load",[e])}function it(e){Je.beforeUnloadHandler=e,e&&Ct("registerHandler",["beforeUnload"])}function at(){var e=function(){Ct("readyToUnload",[])};Je.beforeUnloadHandler&&Je.beforeUnloadHandler(e)||(ut.childWindow?Bt("beforeUnload"):e())}var st=function(e,t,n){if(n||2===arguments.length)for(var r,o=0,i=t.length;o<i;o++)!r&&o in t||(r||(r=Array.prototype.slice.call(t,0,o)),r[o]=t[o]);return e.concat(r||Array.prototype.slice.call(t))},ct=S("communication"),ut=function(){return function(){}}(),lt=function(){function e(){}return e.parentMessageQueue=[],e.childMessageQueue=[],e.nextMessageId=0,e.callbacks={},e.promiseCallbacks={},e}();function dt(e){if(lt.messageListener=function(e){return Et(e)},ut.currentWindow=ut.currentWindow||ue(),ut.parentWindow=ut.currentWindow.parent!==ut.currentWindow.self?ut.currentWindow.parent:ut.currentWindow.opener,(ut.parentWindow||e)&&ut.currentWindow.addEventListener("message",lt.messageListener,!1),!ut.parentWindow){var t=ut.currentWindow;if(!t.nativeInterface)return Promise.reject(new Error("Initialization Failed. No Parent window found."));y.isFramelessWindow=!0,t.onNativeMessage=At}try{return ut.parentOrigin="*",wt("initialize",[Ne,me]).then((function(e){return{context:e[0],clientType:e[1],runtimeConfig:e[2],clientSupportedSDKVersion:e[3]}}))}finally{ut.parentOrigin=null}}function ft(){ut.currentWindow&&ut.currentWindow.removeEventListener("message",lt.messageListener,!1),ut.currentWindow=null,ut.parentWindow=null,ut.parentOrigin=null,ut.childWindow=null,ut.childOrigin=null,lt.parentMessageQueue=[],lt.childMessageQueue=[],lt.nextMessageId=0,lt.callbacks={},lt.promiseCallbacks={}}function pt(e){for(var t=[],n=1;n<arguments.length;n++)t[n-1]=arguments[n];return wt(e,t).then((function(e){return e[0]}))}function mt(e){for(var t=[],n=1;n<arguments.length;n++)t[n-1]=arguments[n];return wt(e,t).then((function(e){var t=e[0],n=e[1];if(!t)throw new Error(n)}))}function ht(e,t){for(var n=[],r=2;r<arguments.length;r++)n[r-2]=arguments[r];return wt(e,n).then((function(e){var n=e[0],r=e[1];if(!n)throw new Error(r||t)}))}function gt(e){for(var t=[],n=1;n<arguments.length;n++)t[n-1]=arguments[n];return wt(e,t).then((function(e){var t=e[0],n=e[1];if(t)throw t;return n}))}function wt(e,t){return void 0===t&&(t=void 0),new Promise((function(n){n(vt(bt(e,t).id))}))}function vt(e){return new Promise((function(t){lt.promiseCallbacks[e]=t}))}function Ct(e,t,n){var r;t instanceof Function?n=t:t instanceof Array&&(r=t);var o=bt(e,r);n&&(lt.callbacks[o.id]=n)}var yt=ct.extend("sendMessageToParentHelper");function bt(e,t){var n=yt,r=ut.parentWindow,o=jt(e,t);if(n("Message %i information: %o",o.id,{actionName:e,args:t}),y.isFramelessWindow)ut.currentWindow&&ut.currentWindow.nativeInterface&&(n("Sending message %i to parent via framelessPostMessage interface",o.id),ut.currentWindow.nativeInterface.framelessPostMessage(JSON.stringify(o)));else{var i=Mt(r);r&&i?(n("Sending message %i to parent via postMessage",o.id),r.postMessage(o,i)):(n("Adding message %i to parent message queue",o.id),Ot(r).push(o))}return o}var St=ct.extend("processMessage");function Et(e){if(e&&e.data&&"object"==typeof e.data){var t=e.source||e.originalEvent&&e.originalEvent.source,n=e.origin||e.originalEvent&&e.originalEvent.origin;Tt(t,n)?(Pt(t,n),t===ut.parentWindow?At(e):t===ut.childWindow&&Rt(e)):St("Message being ignored by app because it is either coming from the current window or a different window with an invalid origin")}else St("Unrecognized message format received by app, message being ignored. Message: %o",e)}var It=ct.extend("shouldProcessMessage");function Tt(e,t){if(ut.currentWindow&&e===ut.currentWindow)return It("Should not process message because it is coming from the current window"),!1;if(ut.currentWindow&&ut.currentWindow.location&&t&&t===ut.currentWindow.location.origin)return!0;var n=Z(new URL(t));return n||It("Message has an invalid origin of %s",t),n}function Pt(e,t){y.isFramelessWindow||ut.parentWindow&&!ut.parentWindow.closed&&e!==ut.parentWindow?ut.childWindow&&!ut.childWindow.closed&&e!==ut.childWindow||(ut.childWindow=e,ut.childOrigin=t):(ut.parentWindow=e,ut.parentOrigin=t),ut.parentWindow&&ut.parentWindow.closed&&(ut.parentWindow=null,ut.parentOrigin=null),ut.childWindow&&ut.childWindow.closed&&(ut.childWindow=null,ut.childOrigin=null),Vt(ut.parentWindow),Vt(ut.childWindow)}var Ft=ct.extend("handleParentMessage");function At(e){var t=Ft;if("id"in e.data&&"number"==typeof e.data.id){var n=e.data,r=lt.callbacks[n.id];t("Received a response from parent for message %i",n.id),r&&(t("Invoking the registered callback for message %i with arguments %o",n.id,n.args),r.apply(null,st(st([],n.args,!0),[n.isPartialResponse],!1)),kt(e)||(t("Removing registered callback for message %i",n.id),delete lt.callbacks[n.id]));var o=lt.promiseCallbacks[n.id];o&&(t("Invoking the registered promise callback for message %i with arguments %o",n.id,n.args),o(n.args),t("Removing registered promise callback for message %i",n.id),delete lt.promiseCallbacks[n.id])}else if("func"in e.data&&"string"==typeof e.data.func){t("Received an action message %s from parent",(n=e.data).func),Xe(n.func,n.args)}else t("Received an unknown message: %O",e)}function kt(e){return!0===e.data.isPartialResponse}function Rt(e){if("id"in e.data&&"func"in e.data){var t=e.data,n=Xe(t.func,t.args),r=n[0],o=n[1];r&&void 0!==o?Wt(t.id,Array.isArray(o)?o:[o]):Ct(t.func,t.args,(function(){for(var e=[],n=0;n<arguments.length;n++)e[n]=arguments[n];if(ut.childWindow){var r=e.pop();Wt(t.id,e,r)}}))}}function Ot(e){return e===ut.parentWindow?lt.parentMessageQueue:e===ut.childWindow?lt.childMessageQueue:[]}function Mt(e){return e===ut.parentWindow?ut.parentOrigin:e===ut.childWindow?ut.childOrigin:null}var Dt,Nt,Ut,Lt,Ht,xt=ct.extend("flushMessageQueue");function Vt(e){for(var t=Mt(e),n=Ot(e),r=e==ut.parentWindow?"parent":"child";e&&t&&n.length>0;){var o=n.shift();xt("Flushing message %i from "+r+" message queue via postMessage.",o.id),e.postMessage(o,t)}}function _t(e,t){var n=ut.currentWindow.setInterval((function(){0===Ot(e).length&&(clearInterval(n),t())}),100)}function Wt(e,t,n){var r=ut.childWindow,o=zt(e,t,n),i=Mt(r);r&&i&&r.postMessage(o,i)}function Bt(e,t){var n=ut.childWindow,r=Gt(e,t),o=Mt(n);n&&o?n.postMessage(r,o):Ot(n).push(r)}function jt(e,t){return{id:lt.nextMessageId++,func:e,timestamp:Date.now(),args:t||[]}}function zt(e,t,n){return{id:e,args:t||[],isPartialResponse:n}}function Gt(e,t){return{func:e,args:t||[]}}function qt(e,t){Ve(ve),Ct("uploadCustomApp",[e],t||X())}function Jt(e,t,n){Ve(ve),Ct(e,t,n)}function Kt(e,t){if(Ve(ve),!ut.childWindow)throw new Error("The child window has not yet been initialized or is not present");Bt(e,t)}function Zt(e,t){var n=this;Ve(ve),Qe(e,(function(){for(var e=[],r=0;r<arguments.length;r++)e[r]=arguments[r];return t.apply(n,e)}))}function Xt(e,t){Ve(ve),Qe("userSettingsChange",t,!0,[e])}function Qt(e){Ve(ve,x.content,x.task),Ct("openFilePreview",[e.entityId,e.title,e.description,e.type,e.objectUrl,e.downloadUrl,e.webPreviewUrl,e.webEditUrl,e.baseUrl,e.editFile,e.subEntityId,e.viewerAction,e.fileOpenPreference,e.conversationId])}!function(e){function t(){return!(!Ve(ve)||!ve.supports.logs)}e.registerGetLogHandler=function(e){if(e&&Ve(ve),e&&!t())throw z;e?Qe("log.request",(function(){Ct("log.receive",[e()])})):$e("log.request")},e.isSupported=t}(Dt||(Dt={})),function(e){e.fileDownloadStart="fileDownloadStart",e.fileDownloadComplete="fileDownloadComplete"}(Nt||(Nt={})),function(e){e.view="view",e.edit="edit",e.editNew="editNew"}(Ut||(Ut={})),function(e){e.fileOpenPreference="fileOpenPreference",e.theme="theme"}(Lt||(Lt={})),function(e){function t(){return!(!Ve(ve)||!ve.supports.conversations)}e.openConversation=function(e){return new Promise((function(n){if(Ve(ve,x.content),!t())throw z;var r=mt("conversations.openConversation",{title:e.title,subEntityId:e.subEntityId,conversationId:e.conversationId,channelId:e.channelId,entityId:e.entityId});e.onStartConversation&&Qe("startConversation",(function(t,n,r,o){return e.onStartConversation({subEntityId:t,conversationId:n,channelId:r,entityId:o})})),e.onCloseConversation&&Qe("closeConversation",(function(t,n,r,o){return e.onCloseConversation({subEntityId:t,conversationId:n,channelId:r,entityId:o})})),n(r)}))},e.closeConversation=function(){if(Ve(ve,x.content),!t())throw z;Ct("conversations.closeConversation"),$e("startConversation"),$e("closeConversation")},e.getChatMembers=function(){return new Promise((function(e){if(Ve(ve),!t())throw z;e(pt("getChatMembers"))}))},e.isSupported=t}(Ht||(Ht={}));var $t,Yt="/l/app/",en="/l/meeting/new",tn="attendees",nn="startTime",rn="endTime",on="subject",an="content",sn="/l/call/0/0",cn="source",un="withVideo",ln="/l/chat/0/0",dn="users",fn="topicName",pn="message";function mn(e,t,n){if(0===e.length)throw new Error("Must have at least one user when creating a chat deep link");var r="".concat(dn,"=")+e.map((function(e){return encodeURIComponent(e)})).join(","),o=void 0===t?"":"&".concat(fn,"=").concat(encodeURIComponent(t)),i=void 0===n?"":"&".concat(pn,"=").concat(encodeURIComponent(n));return"".concat(m,"://").concat(h).concat(ln,"?").concat(r).concat(o).concat(i)}function hn(e,t,n){if(0===e.length)throw new Error("Must have at least one target when creating a call deep link");var r="".concat(dn,"=")+e.map((function(e){return encodeURIComponent(e)})).join(","),o=void 0===t?"":"&".concat(un,"=").concat(encodeURIComponent(t)),i=void 0===n?"":"&".concat(cn,"=").concat(encodeURIComponent(n));return"".concat(m,"://").concat(h).concat(sn,"?").concat(r).concat(o).concat(i)}function gn(e,t,n,r,o){var i=void 0===e?"":"".concat(tn,"=")+e.map((function(e){return encodeURIComponent(e)})).join(","),a=void 0===t?"":"&".concat(nn,"=").concat(encodeURIComponent(t)),s=void 0===n?"":"&".concat(rn,"=").concat(encodeURIComponent(n)),c=void 0===r?"":"&".concat(on,"=").concat(encodeURIComponent(r)),u=void 0===o?"":"&".concat(an,"=").concat(encodeURIComponent(o));return"".concat(m,"://").concat(h).concat(en,"?").concat(i).concat(a).concat(s).concat(c).concat(u)}function wn(e){if(!e)throw new Error("App ID must be set when creating an app install dialog deep link");return"".concat(m,"://").concat(h).concat(Yt).concat(encodeURIComponent(e))}!function(e){function t(){return!(!Ve(ve)||!ve.supports.appInstallDialog)}e.openAppInstallDialog=function(e){return new Promise((function(n){if(Ve(ve,x.content,x.sidePanel,x.settings,x.task,x.stage,x.meetingStage),!t())throw new Error("Not supported");ve.isLegacyTeams?n(mt("executeDeepLink",wn(e.appId))):(Ct("appInstallDialog.openAppInstallDialog",[e]),n())}))},e.isSupported=t}($t||($t={}));var vn,Cn,yn,bn=function(){var e=function(t,n){return e=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])},e(t,n)};return function(t,n){if("function"!=typeof n&&null!==n)throw new TypeError("Class extends value "+String(n)+" is not a constructor or null");function r(){this.constructor=t}e(t,n),t.prototype=null===n?Object.create(n):(r.prototype=n.prototype,new r)}}();function Sn(e,t){if(null==e||null==t||e.length<=0)return null;var n,r=1;return e.sort((function(e,t){return e.sequence>t.sequence?1:-1})),e.forEach((function(e){e.sequence==r&&(n=n?new Blob([n,e.file],{type:t}):new Blob([e.file],{type:t}),r++)})),n}function En(e,t){if(null==e||null==t)return null;for(var n=atob(e.chunk),r=new Array(n.length),o=0;o<n.length;o++)r[o]=n.charCodeAt(o);var i=new Uint8Array(r),a=new Blob([i],{type:t});return{sequence:e.chunkSequence,file:a}}function In(e){An(e)?Be(t):kn(e)?Be(o):Fn(e)&&Be(i)}function Tn(e){return!(e.mediaType!=vn.MediaType.Video||!e.videoProps||!e.videoProps.videoController)}function Pn(e){return!(null==e||e.maxMediaCount>10)}function Fn(e){var t;return!((null==e?void 0:e.mediaType)!=vn.MediaType.Image||!(null===(t=null==e?void 0:e.imageProps)||void 0===t?void 0:t.imageOutputFormats))}function An(e){return!(!e||e.mediaType!=vn.MediaType.VideoAndImage&&!e.videoAndImageProps)}function kn(e){return!(!e||e.mediaType!=vn.MediaType.Video||!e.videoProps||e.videoProps.isFullScreenMode)}function Rn(e,t,n){return null!=e&&null!=t&&t==vn.FileFormat.ID&&null!=n}function On(e){return!(null==e||e.length<=0||e.length>10)}function Mn(e){return!e||!(null===e.timeOutIntervalInSec||e.timeOutIntervalInSec<=0||e.timeOutIntervalInSec>60)}function Dn(e){if(e){if(e.title&&"string"!=typeof e.title)return!1;if(e.setSelected&&"object"!=typeof e.setSelected)return!1;if(e.openOrgWideSearchInChatOrChannel&&"boolean"!=typeof e.openOrgWideSearchInChatOrChannel)return!1;if(e.singleSelect&&"boolean"!=typeof e.singleSelect)return!1}return!0}!function(e){!function(e){e.Base64="base64",e.ID="id"}(e.FileFormat||(e.FileFormat={}));var t=function(){return function(){}}();function n(){return!(!Ve(ve)||!ve.supports.permissions)}e.File=t,e.captureImage=function(e){if(!e)throw new Error("[captureImage] Callback cannot be null");Ve(ve,x.content,x.task),y.isFramelessWindow?_e(u)?Ct("captureImage",e):e({errorCode:D.OLD_PLATFORM},void 0):e({errorCode:D.NOT_SUPPORTED_ON_PLATFORM},void 0)},e.hasPermission=function(){if(Ve(ve,x.content,x.task),!n())throw z;var e=N.Media;return new Promise((function(t){t(gt("permissions.has",e))}))},e.requestPermission=function(){if(Ve(ve,x.content,x.task),!n())throw z;var e=N.Media;return new Promise((function(t){t(gt("permissions.request",e))}))};var r=function(e){function t(t){void 0===t&&(t=null);var n=e.call(this)||this;return t&&(n.content=t.content,n.format=t.format,n.mimeType=t.mimeType,n.name=t.name,n.preview=t.preview,n.size=t.size),n}return bn(t,e),t.prototype.getMedia=function(e){if(!e)throw new Error("[get Media] Callback cannot be null");(Ve(ve,x.content,x.task),_e(l))?Rn(this.mimeType,this.format,this.content)?_e("2.0.0")?this.getMediaViaCallback(e):this.getMediaViaHandler(e):e({errorCode:D.INVALID_ARGUMENTS},null):e({errorCode:D.OLD_PLATFORM},null)},t.prototype.getMediaViaCallback=function(e){var t={mediaMimeType:this.mimeType,assembleAttachment:[]};Ct("getMedia",[this.content],(function(n){if(e)if(n&&n.error)e(n.error,null);else if(n&&n.mediaChunk)if(n.mediaChunk.chunkSequence<=0){var r=Sn(t.assembleAttachment,t.mediaMimeType);e(n.error,r)}else{var o=En(n.mediaChunk,t.mediaMimeType);t.assembleAttachment.push(o)}else e({errorCode:D.INTERNAL_ERROR,message:"data received is null"},null)}))},t.prototype.getMediaViaHandler=function(e){var t=$(),n={mediaMimeType:this.mimeType,assembleAttachment:[]},r=[t,this.content];this.content&&e&&Ct("getMedia",r),Qe("getMedia"+t,(function(r){if(e){var o=JSON.parse(r);if(o.error)e(o.error,null),$e("getMedia"+t);else if(o.mediaChunk)if(o.mediaChunk.chunkSequence<=0){var i=Sn(n.assembleAttachment,n.mediaMimeType);e(o.error,i),$e("getMedia"+t)}else{var a=En(o.mediaChunk,n.mediaMimeType);n.assembleAttachment.push(a)}else e({errorCode:D.INTERNAL_ERROR,message:"data received is null"},null),$e("getMedia"+t)}}))},t}(t);e.Media=r;var i,a,s=function(e){function t(){return null!==e&&e.apply(this,arguments)||this}return bn(t,e),t.prototype.getMediaType=function(){return a.Video},t.prototype.notifyEventToApp=function(e){if(this.controllerCallback)switch(e){case i.StartRecording:if(this.controllerCallback.onRecordingStarted){this.controllerCallback.onRecordingStarted();break}}},t}(function(){function e(e){this.controllerCallback=e}return e.prototype.notifyEventToHost=function(e,t){Ve(ve,x.content,x.task);try{Be(o)}catch(e){return void(t&&t(e))}Ct("media.controller",[{mediaType:this.getMediaType(),mediaControllerEvent:e}],(function(e){t&&t(e)}))},e.prototype.stop=function(e){this.notifyEventToHost(i.StopRecording,e)},e}());e.VideoController=s,function(e){e[e.StartRecording=1]="StartRecording",e[e.StopRecording=2]="StopRecording"}(i=e.MediaControllerEvent||(e.MediaControllerEvent={})),function(e){e[e.Photo=1]="Photo",e[e.Document=2]="Document",e[e.Whiteboard=3]="Whiteboard",e[e.BusinessCard=4]="BusinessCard"}(e.CameraStartMode||(e.CameraStartMode={})),function(e){e[e.Camera=1]="Camera",e[e.Gallery=2]="Gallery"}(e.Source||(e.Source={})),function(e){e[e.Image=1]="Image",e[e.Video=2]="Video",e[e.VideoAndImage=3]="VideoAndImage",e[e.Audio=4]="Audio"}(a=e.MediaType||(e.MediaType={})),function(e){e[e.ID=1]="ID",e[e.URL=2]="URL"}(e.ImageUriType||(e.ImageUriType={})),function(e){e[e.IMAGE=1]="IMAGE",e[e.PDF=2]="PDF"}(e.ImageOutputFormats||(e.ImageOutputFormats={})),e.selectMedia=function(e,t){if(!t)throw new Error("[select Media] Callback cannot be null");if(Ve(ve,x.content,x.task),_e(l)){try{In(e)}catch(e){return void t(e,null)}if(Pn(e)){Ct("selectMedia",[e],(function(n,o,i){if(i)Tn(e)&&e.videoProps.videoController.notifyEventToApp(i);else if(o){for(var a=[],s=0,c=o;s<c.length;s++){var u=c[s];a.push(new r(u))}t(n,a)}else t(n,null)}))}else{var n={errorCode:D.INVALID_ARGUMENTS};t(n,null)}}else{var o={errorCode:D.OLD_PLATFORM};t(o,null)}},e.viewImages=function(e,t){if(!t)throw new Error("[view images] Callback cannot be null");Ve(ve,x.content,x.task),_e(l)?On(e)?Ct("viewImages",[e],t):t({errorCode:D.INVALID_ARGUMENTS}):t({errorCode:D.OLD_PLATFORM})},e.scanBarCode=function(e,t){if(!e)throw new Error("[media.scanBarCode] Callback cannot be null");Ve(ve,x.content,x.task),y.hostClientType!==L.desktop&&y.hostClientType!==L.web&&y.hostClientType!==L.rigel&&y.hostClientType!==L.teamsRoomsWindows&&y.hostClientType!==L.teamsRoomsAndroid&&y.hostClientType!==L.teamsPhones&&y.hostClientType!==L.teamsDisplays?_e(d)?Mn(t)?Ct("media.scanBarCode",[t],e):e({errorCode:D.INVALID_ARGUMENTS},null):e({errorCode:D.OLD_PLATFORM},null):e({errorCode:D.NOT_SUPPORTED_ON_PLATFORM},null)}}(vn||(vn={})),function(e){function t(){return!!(Ve(ve)&&ve.supports.barCode&&ve.supports.permissions)}e.scanBarCode=function(e){return new Promise((function(n){if(Ve(ve,x.content,x.task),!t())throw z;if(!Mn(e))throw{errorCode:D.INVALID_ARGUMENTS};n(gt("media.scanBarCode",e))}))},e.hasPermission=function(){if(Ve(ve,x.content,x.task),!t())throw z;var e=N.Media;return new Promise((function(t){t(gt("permissions.has",e))}))},e.requestPermission=function(){if(Ve(ve,x.content,x.task),!t())throw z;var e=N.Media;return new Promise((function(t){t(gt("permissions.request",e))}))},e.isSupported=t}(Cn||(Cn={})),function(e){function t(e){return new Promise((function(t){if(Ve(ve,x.content,x.task),!n())throw z;ve.isLegacyTeams?t(mt("executeDeepLink",mn([e.user],void 0,e.message))):t(mt("chat.openChat",{members:e.user,message:e.message}))}))}function n(){return!(!Ve(ve)||!ve.supports.chat)}e.openChat=t,e.openGroupChat=function(e){return new Promise((function(r){if(e.users.length<1)throw Error("OpenGroupChat Failed: No users specified");if(1===e.users.length){t({user:e.users[0],message:e.message})}else{if(Ve(ve,x.content,x.task),!n())throw z;if(ve.isLegacyTeams)r(mt("executeDeepLink",mn(e.users,e.topic,e.message)));else r(mt("chat.openChat",{members:e.users,message:e.message,topic:e.topic}))}}))},e.isSupported=n}(yn||(yn={}));var Nn,Un,Ln=function(e,t,n,r){function o(e){return e instanceof n?e:new n((function(t){t(e)}))}return new(n||(n=Promise))((function(n,i){function a(e){try{c(r.next(e))}catch(e){i(e)}}function s(e){try{c(r.throw(e))}catch(e){i(e)}}function c(e){e.done?n(e.value):o(e.value).then(a,s)}c((r=r.apply(e,t||[])).next())}))},Hn=function(e,t){var n,r,o,i,a={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return i={next:s(0),throw:s(1),return:s(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function s(e){return function(t){return c([e,t])}}function c(s){if(n)throw new TypeError("Generator is already executing.");for(;i&&(i=0,s[0]&&(a=0)),a;)try{if(n=1,r&&(o=2&s[0]?r.return:s[0]?r.throw||((o=r.return)&&o.call(r),0):r.next)&&!(o=o.call(r,s[1])).done)return o;switch(r=0,o&&(s=[2&s[0],o.value]),s[0]){case 0:case 1:o=s;break;case 4:return a.label++,{value:s[1],done:!1};case 5:a.label++,r=s[1],s=[0];continue;case 7:s=a.ops.pop(),a.trys.pop();continue;default:if(!(o=a.trys,(o=o.length>0&&o[o.length-1])||6!==s[0]&&2!==s[0])){a=0;continue}if(3===s[0]&&(!o||s[1]>o[0]&&s[1]<o[3])){a.label=s[1];break}if(6===s[0]&&a.label<o[1]){a.label=o[1],o=s;break}if(o&&a.label<o[2]){a.label=o[2],a.ops.push(s);break}o[2]&&a.ops.pop(),a.trys.pop();continue}s=t.call(e,a)}catch(e){s=[6,e],r=0}finally{n=o=0}if(5&s[0])throw s[1];return{value:s[0]?s[1]:void 0,done:!0}}};function xn(){return ve.hostVersionsInfo?ve.hostVersionsInfo.adaptiveCardSchemaVersion:void 0}!function(e){function t(){return!!(Ve(ve)&&navigator&&navigator.clipboard&&ve.supports.clipboard)}e.write=function(e){return Ln(this,void 0,void 0,(function(){var n;return Hn(this,(function(r){switch(r.label){case 0:if(Ve(ve,x.content,x.task,x.stage,x.sidePanel),!t())throw z;if(!e.type||!Object.values(U).includes(e.type))throw new Error("Blob type ".concat(e.type," is not supported. Supported blob types are ").concat(Object.values(U)));return[4,ce(e)];case 1:return n=r.sent(),[2,gt("clipboard.writeToClipboard",{mimeType:e.type,content:n})]}}))}))},e.read=function(){return Ln(this,void 0,void 0,(function(){var e,n,r;return Hn(this,(function(o){switch(o.label){case 0:if(Ve(ve,x.content,x.task,x.stage,x.sidePanel),!t())throw z;return We()||y.hostClientType===L.macos?(r=(n=JSON).parse,[4,gt("clipboard.readFromClipboard")]):[3,2];case 1:return[2,se((e=r.apply(n,[o.sent()])).mimeType,e.content)];case 2:return[2,gt("clipboard.readFromClipboard")]}}))}))},e.isSupported=t}(Nn||(Nn={})),function(e){function t(){return!!(Ve(ve)&&ve.supports.geoLocation&&ve.supports.permissions)}e.getCurrentLocation=function(){if(Ve(ve,x.content,x.task),!t())throw z;return gt("location.getLocation",{allowChooseLocation:!1,showMap:!1})},e.hasPermission=function(){if(Ve(ve,x.content,x.task),!t())throw z;var e=N.GeoLocation;return new Promise((function(t){t(gt("permissions.has",e))}))},e.requestPermission=function(){if(Ve(ve,x.content,x.task),!t())throw z;var e=N.GeoLocation;return new Promise((function(t){t(gt("permissions.request",e))}))},e.isSupported=t,function(e){function t(){return!!(Ve(ve)&&ve.supports.geoLocation&&ve.supports.geoLocation.map&&ve.supports.permissions)}e.chooseLocation=function(){if(Ve(ve,x.content,x.task),!t())throw z;return gt("location.getLocation",{allowChooseLocation:!0,showMap:!0})},e.showLocation=function(e){if(Ve(ve,x.content,x.task),!t())throw z;if(!e)throw{errorCode:D.INVALID_ARGUMENTS};return gt("location.showLocation",e)},e.isSupported=t}(e.map||(e.map={}))}(Un||(Un={}));var Vn,_n,Wn=function(){function e(){}return e.prototype.postMessage=function(e,t){Ve(ve),Ct("messageForChild",[e],t||X())},e.prototype.addEventListener=function(e,t){Ve(ve),"message"===e&&Qe("messageForParent",t)},e}(),Bn=function(){function e(){}return Object.defineProperty(e,"Instance",{get:function(){return this._instance||(this._instance=new this)},enumerable:!1,configurable:!0}),e.prototype.postMessage=function(e,t){Ve(ve,x.task),Ct("messageForParent",[e],t||X())},e.prototype.addEventListener=function(e,t){Ve(ve,x.task),"message"===e&&Qe("messageForChild",t)},e}();!function(e){function t(){return!(!Ve(ve)||!ve.supports.secondaryBrowser)}e.open=function(e){if(Ve(ve,x.content),!t())throw z;if(!e||!ae(e))throw{errorCode:D.INVALID_ARGUMENTS,message:"Invalid Url: Only https URL is allowed"};return gt("secondaryBrowser.open",e.toString())},e.isSupported=t}(Vn||(Vn={})),function(e){function t(){return!(!Ve(ve)||!ve.supports.location)}e.getLocation=function(e,n){if(!n)throw new Error("[location.getLocation] Callback cannot be null");if(Ve(ve,x.content,x.task),!_e(s))throw{errorCode:D.OLD_PLATFORM};if(!e)throw{errorCode:D.INVALID_ARGUMENTS};if(!t())throw z;Ct("location.getLocation",[e],n)},e.showLocation=function(e,n){if(!n)throw new Error("[location.showLocation] Callback cannot be null");if(Ve(ve,x.content,x.task),!_e(s))throw{errorCode:D.OLD_PLATFORM};if(!e)throw{errorCode:D.INVALID_ARGUMENTS};if(!t())throw z;Ct("location.showLocation",[e],n)},e.isSupported=t}(_n||(_n={}));var jn,zn,Gn,qn,Jn,Kn,Zn=function(e,t,n,r){function o(e){return e instanceof n?e:new n((function(t){t(e)}))}return new(n||(n=Promise))((function(n,i){function a(e){try{c(r.next(e))}catch(e){i(e)}}function s(e){try{c(r.throw(e))}catch(e){i(e)}}function c(e){e.done?n(e.value):o(e.value).then(a,s)}c((r=r.apply(e,t||[])).next())}))},Xn=function(e,t){var n,r,o,i,a={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return i={next:s(0),throw:s(1),return:s(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function s(e){return function(t){return c([e,t])}}function c(s){if(n)throw new TypeError("Generator is already executing.");for(;i&&(i=0,s[0]&&(a=0)),a;)try{if(n=1,r&&(o=2&s[0]?r.return:s[0]?r.throw||((o=r.return)&&o.call(r),0):r.next)&&!(o=o.call(r,s[1])).done)return o;switch(r=0,o&&(s=[2&s[0],o.value]),s[0]){case 0:case 1:o=s;break;case 4:return a.label++,{value:s[1],done:!1};case 5:a.label++,r=s[1],s=[0];continue;case 7:s=a.ops.pop(),a.trys.pop();continue;default:if(!(o=a.trys,(o=o.length>0&&o[o.length-1])||6!==s[0]&&2!==s[0])){a=0;continue}if(3===s[0]&&(!o||s[1]>o[0]&&s[1]<o[3])){a.label=s[1];break}if(6===s[0]&&a.label<o[1]){a.label=o[1],o=s;break}if(o&&a.label<o[2]){a.label=o[2],a.ops.push(s);break}o[2]&&a.ops.pop(),a.trys.pop();continue}s=t.call(e,a)}catch(e){s=[6,e],r=0}finally{n=o=0}if(5&s[0])throw s[1];return{value:s[0]?s[1]:void 0,done:!0}}};function Qn(e){return e?e.modality&&"string"!=typeof e.modality?[!1,"modality must be a string"]:e.targetElementBoundingRect&&"object"==typeof e.targetElementBoundingRect?e.triggerType&&"string"==typeof e.triggerType?$n(e.persona):[!1,"triggerType must be a valid string"]:[!1,"targetElementBoundingRect must be a DOMRect"]:[!1,"A request object is required"]}function $n(e){return e?e.displayName&&"string"!=typeof e.displayName?[!1,"displayName must be a string"]:e.identifiers&&"object"==typeof e.identifiers?e.identifiers.AadObjectId||e.identifiers.Smtp||e.identifiers.Upn?e.identifiers.AadObjectId&&"string"!=typeof e.identifiers.AadObjectId?[!1,"AadObjectId identifier must be a string"]:e.identifiers.Smtp&&"string"!=typeof e.identifiers.Smtp?[!1,"Smtp identifier must be a string"]:e.identifiers.Upn&&"string"!=typeof e.identifiers.Upn?[!1,"Upn identifier must be a string"]:[!0,void 0]:[!1,"at least one valid identifier must be provided"]:[!1,"persona identifiers object must be provided"]:[!1,"persona object must be provided"]}!function(e){var t;function n(e,n){var r=this;Ct("meeting.requestAppAudioHandling",[e.isAppHandlingAudio],(function(i,a){if(i&&null!=a)throw new Error("[requestAppAudioHandling] Callback response - both parameters cannot be set");if(i)throw new Error("[requestAppAudioHandling] Callback response - SDK error ".concat(i.errorCode," ").concat(i.message));if("boolean"!=typeof a)throw new Error("[requestAppAudioHandling] Callback response - isHostAudioless must be a boolean");Qe("meeting.micStateChanged",(function(n){return Zn(r,void 0,void 0,(function(){var r,i;return Xn(this,(function(a){switch(a.label){case 0:return a.trys.push([0,2,,3]),[4,e.micMuteStateChangedCallback(n)];case 1:return r=a.sent(),i=r.isMicMuted===n.isMicMuted,o(r,i?t.HostInitiated:t.AppDeclinedToChange),[3,3];case 2:return a.sent(),o(n,t.AppFailedToChange),[3,3];case 3:return[2]}}))}))})),n(a)}))}function r(e,t){Ct("meeting.requestAppAudioHandling",[e.isAppHandlingAudio],(function(e,n){if(e&&null!=n)throw new Error("[requestAppAudioHandling] Callback response - both parameters cannot be set");if(e)throw new Error("[requestAppAudioHandling] Callback response - SDK error ".concat(e.errorCode," ").concat(e.message));if("boolean"!=typeof n)throw new Error("[requestAppAudioHandling] Callback response - isHostAudioless must be a boolean");Ye("meeting.micStateChanged")&&$e("meeting.micStateChanged"),t(n)}))}function o(e,t){Ve(ve,x.sidePanel,x.meetingStage),Ct("meeting.updateMicState",[e,t])}!function(e){e[e.HostInitiated=0]="HostInitiated",e[e.AppInitiated=1]="AppInitiated",e[e.AppDeclinedToChange=2]="AppDeclinedToChange",e[e.AppFailedToChange=3]="AppFailedToChange"}(t||(t={})),function(e){e.like="like",e.heart="heart",e.laugh="laugh",e.surprised="surprised",e.applause="applause"}(e.MeetingReactionType||(e.MeetingReactionType={})),function(e){e.Unknown="Unknown",e.Adhoc="Adhoc",e.Scheduled="Scheduled",e.Recurring="Recurring",e.Broadcast="Broadcast",e.MeetNow="MeetNow"}(e.MeetingType||(e.MeetingType={})),function(e){e.OneOnOneCall="oneOnOneCall",e.GroupCall="groupCall"}(e.CallType||(e.CallType={})),e.getIncomingClientAudioState=function(e){if(!e)throw new Error("[get incoming client audio state] Callback cannot be null");Ve(ve,x.sidePanel,x.meetingStage),Ct("getIncomingClientAudioState",e)},e.toggleIncomingClientAudio=function(e){if(!e)throw new Error("[toggle incoming client audio] Callback cannot be null");Ve(ve,x.sidePanel,x.meetingStage),Ct("toggleIncomingClientAudio",e)},e.getMeetingDetails=function(e){if(!e)throw new Error("[get meeting details] Callback cannot be null");Ve(ve,x.sidePanel,x.meetingStage,x.settings,x.content),Ct("meeting.getMeetingDetails",e)},e.getAuthenticationTokenForAnonymousUser=function(e){if(!e)throw new Error("[get Authentication Token For AnonymousUser] Callback cannot be null");Ve(ve,x.sidePanel,x.meetingStage,x.task),Ct("meeting.getAuthenticationTokenForAnonymousUser",e)},e.getLiveStreamState=function(e){if(!e)throw new Error("[get live stream state] Callback cannot be null");Ve(ve,x.sidePanel),Ct("meeting.getLiveStreamState",e)},e.requestStartLiveStreaming=function(e,t,n){if(!e)throw new Error("[request start live streaming] Callback cannot be null");Ve(ve,x.sidePanel),Ct("meeting.requestStartLiveStreaming",[t,n],e)},e.requestStopLiveStreaming=function(e){if(!e)throw new Error("[request stop live streaming] Callback cannot be null");Ve(ve,x.sidePanel),Ct("meeting.requestStopLiveStreaming",e)},e.registerLiveStreamChangedHandler=function(e){if(!e)throw new Error("[register live stream changed handler] Handler cannot be null");Ve(ve,x.sidePanel),Qe("meeting.liveStreamChanged",e)},e.shareAppContentToStage=function(e,t){if(!e)throw new Error("[share app content to stage] Callback cannot be null");Ve(ve,x.sidePanel,x.meetingStage),Ct("meeting.shareAppContentToStage",[t],e)},e.getAppContentStageSharingCapabilities=function(e){if(!e)throw new Error("[get app content stage sharing capabilities] Callback cannot be null");Ve(ve,x.sidePanel,x.meetingStage),Ct("meeting.getAppContentStageSharingCapabilities",e)},e.stopSharingAppContentToStage=function(e){if(!e)throw new Error("[stop sharing app content to stage] Callback cannot be null");Ve(ve,x.sidePanel,x.meetingStage),Ct("meeting.stopSharingAppContentToStage",e)},e.getAppContentStageSharingState=function(e){if(!e)throw new Error("[get app content stage sharing state] Callback cannot be null");Ve(ve,x.sidePanel,x.meetingStage),Ct("meeting.getAppContentStageSharingState",e)},e.registerSpeakingStateChangeHandler=function(e){if(!e)throw new Error("[registerSpeakingStateChangeHandler] Handler cannot be null");Ve(ve,x.sidePanel,x.meetingStage),Qe("meeting.speakingStateChanged",e)},e.registerRaiseHandStateChangedHandler=function(e){if(!e)throw new Error("[registerRaiseHandStateChangedHandler] Handler cannot be null");Ve(ve,x.sidePanel,x.meetingStage),Qe("meeting.raiseHandStateChanged",e)},e.registerMeetingReactionReceivedHandler=function(e){if(!e)throw new Error("[registerMeetingReactionReceivedHandler] Handler cannot be null");Ve(ve,x.sidePanel,x.meetingStage),Qe("meeting.meetingReactionReceived",e)},function(e){e.setOptions=function(e){Ve(ve,x.sidePanel),e.contentUrl&&new URL(e.contentUrl),Ct("meeting.appShareButton.setOptions",[e])}}(e.appShareButton||(e.appShareButton={})),e.requestAppAudioHandling=function(e,t){if(!t)throw new Error("[requestAppAudioHandling] Callback response cannot be null");if(!e.micMuteStateChangedCallback)throw new Error("[requestAppAudioHandling] Callback Mic mute state handler cannot be null");Ve(ve,x.sidePanel,x.meetingStage),e.isAppHandlingAudio?n(e,t):r(e,t)},e.updateMicState=function(e){o(e,t.AppInitiated)}}(jn||(jn={})),function(e){function t(){return!(!Ve(ve)||!ve.supports.monetization)}e.openPurchaseExperience=function(e,n){var r,o;return"function"==typeof e?(r=e,o=n):o=e,Ve(ve,x.content),ne((function(){return new Promise((function(e){if(!t())throw z;e(gt("monetization.openPurchaseExperience",o))}))}),r)},e.isSupported=t}(zn||(zn={})),function(e){function t(){return!(!Ve(ve)||!ve.supports.calendar)}e.openCalendarItem=function(e){return new Promise((function(n){if(Ve(ve,x.content),!t())throw new Error("Not supported");if(!e.itemId||!e.itemId.trim())throw new Error("Must supply an itemId to openCalendarItem");n(mt("calendar.openCalendarItem",e))}))},e.composeMeeting=function(e){return new Promise((function(n){if(Ve(ve,x.content),!t())throw new Error("Not supported");ve.isLegacyTeams?n(mt("executeDeepLink",gn(e.attendees,e.startTime,e.endTime,e.subject,e.content))):n(mt("calendar.composeMeeting",e))}))},e.isSupported=t}(Gn||(Gn={})),function(e){function t(){return!(!Ve(ve)||!ve.supports.mail)}e.openMailItem=function(e){return new Promise((function(n){if(Ve(ve,x.content),!t())throw new Error("Not supported");if(!e.itemId||!e.itemId.trim())throw new Error("Must supply an itemId to openMailItem");n(mt("mail.openMailItem",e))}))},e.composeMail=function(e){return new Promise((function(n){if(Ve(ve,x.content),!t())throw new Error("Not supported");n(mt("mail.composeMail",e))}))},e.isSupported=t,function(e){e.New="new",e.Reply="reply",e.ReplyAll="replyAll",e.Forward="forward"}(e.ComposeMailType||(e.ComposeMailType={}))}(qn||(qn={})),function(e){function t(e){return new Promise((function(t){if(!_e(c))throw{errorCode:D.OLD_PLATFORM};if(!Dn(e))throw{errorCode:D.INVALID_ARGUMENTS};if(!n())throw z;t(gt("people.selectPeople",e))}))}function n(){return!(!Ve(ve)||!ve.supports.people)}e.selectPeople=function(e,n){var r,o,i;return Ve(ve,x.content,x.task,x.settings),"function"==typeof e?(o=(r=[e,n])[0],i=r[1]):i=e,ee(t,o,i)},e.isSupported=n}(Jn||(Jn={})),function(e){e.showProfile=function(e){return Ve(ve,x.content),new Promise((function(t){var n=Qn(e),r=n[0],o=n[1];if(!r)throw{errorCode:D.INVALID_ARGUMENTS,message:o};t(gt("profile.showProfile",{modality:e.modality,persona:e.persona,triggerType:e.triggerType,targetRectangle:{x:e.targetElementBoundingRect.x,y:e.targetElementBoundingRect.y,width:e.targetElementBoundingRect.width,height:e.targetElementBoundingRect.height}}))}))},e.isSupported=function(){return!(!Ve(ve)||!ve.supports.profile)}}(Kn||(Kn={}));var Yn,er=function(){function e(){}return e.setTimeout=function(t,n){var r=performance.now(),o=$();return e.setTimeoutCallbacks[o]={callback:t,timeoutInMs:n,startedAtInMs:r},o},e.clearTimeout=function(t){delete e.setTimeoutCallbacks[t]},e.setInterval=function(t,n){e.setTimeout((function r(){t(),e.setTimeout(r,n)}),n)},e.tick=function(){var t=performance.now(),n=[];for(var r in e.setTimeoutCallbacks){t-(a=e.setTimeoutCallbacks[r]).startedAtInMs>=a.timeoutInMs&&n.push(r)}for(var o=0,i=n;o<i.length;o++){var a,s=i[o];(a=e.setTimeoutCallbacks[s]).callback(),delete e.setTimeoutCallbacks[s]}},e.setTimeoutCallbacks={},e}(),tr=function(){function e(e,t){this.reportStatisticsResult=t,this.sampleCount=0,this.distributionBins=new Uint32Array(e)}return e.prototype.processStarts=function(e,t,n,r){er.tick(),this.suitableForThisSession(e,t,n,r)||this.reportAndResetSession(this.getStatistics(),e,r,t,n),this.start()},e.prototype.processEnds=function(){var e=performance.now()-this.frameProcessingStartedAt,t=Math.floor(Math.max(0,Math.min(this.distributionBins.length-1,e)));this.distributionBins[t]+=1,this.sampleCount+=1},e.prototype.getStatistics=function(){return this.currentSession?{effectId:this.currentSession.effectId,effectParam:this.currentSession.effectParam,frameHeight:this.currentSession.frameHeight,frameWidth:this.currentSession.frameWidth,duration:performance.now()-this.currentSession.startedAtInMs,sampleCount:this.sampleCount,distributionBins:this.distributionBins.slice()}:null},e.prototype.start=function(){this.frameProcessingStartedAt=performance.now()},e.prototype.suitableForThisSession=function(e,t,n,r){return this.currentSession&&this.currentSession.effectId===e&&this.currentSession.effectParam===r&&this.currentSession.frameWidth===t&&this.currentSession.frameHeight===n},e.prototype.reportAndResetSession=function(e,t,n,r,o){var i=this;e&&this.reportStatisticsResult(e),this.resetCurrentSession(this.getNextTimeout(t,this.currentSession),t,n,r,o),this.timeoutId&&er.clearTimeout(this.timeoutId),this.timeoutId=er.setTimeout(function(){return i.reportAndResetSession(i.getStatistics(),t,n,r,o)}.bind(this),this.currentSession.timeoutInMs)},e.prototype.resetCurrentSession=function(e,t,n,r,o){this.currentSession={startedAtInMs:performance.now(),timeoutInMs:e,effectId:t,effectParam:n,frameWidth:r,frameHeight:o},this.sampleCount=0,this.distributionBins.fill(0)},e.prototype.getNextTimeout=function(t,n){return n&&n.effectId===t?Math.min(e.maxSessionTimeoutInMs,2*n.timeoutInMs):e.initialSessionTimeoutInMs},e.initialSessionTimeoutInMs=1e3,e.maxSessionTimeoutInMs=3e4,e}(),nr=function(){function e(t){var n=this;this.reportPerformanceEvent=t,this.isFirstFrameProcessed=!1,this.frameProcessTimeLimit=100,this.frameProcessingStartedAt=0,this.frameProcessingTimeCost=0,this.processedFrameCount=0,this.performanceStatistics=new tr(e.distributionBinSize,(function(e){return n.reportPerformanceEvent("video.performance.performanceDataGenerated",[e])}))}return e.prototype.startMonitorSlowFrameProcessing=function(){var t=this;er.setInterval((function(){if(0!==t.processedFrameCount){var e=t.frameProcessingTimeCost/t.processedFrameCount;e>t.frameProcessTimeLimit&&t.reportPerformanceEvent("video.performance.frameProcessingSlow",[e]),t.frameProcessingTimeCost=0,t.processedFrameCount=0}}),e.calculateFPSInterval)},e.prototype.setFrameProcessTimeLimit=function(e){this.frameProcessTimeLimit=e},e.prototype.reportApplyingVideoEffect=function(e,t){var n,r;(null===(n=this.applyingEffect)||void 0===n?void 0:n.effectId)===e&&(null===(r=this.applyingEffect)||void 0===r?void 0:r.effectParam)===t||(this.applyingEffect={effectId:e,effectParam:t},this.appliedEffect=void 0)},e.prototype.reportVideoEffectChanged=function(e,t){void 0===this.applyingEffect||this.applyingEffect.effectId!==e&&this.applyingEffect.effectParam!==t||(this.appliedEffect={effectId:e,effectParam:t},this.applyingEffect=void 0,this.isFirstFrameProcessed=!1)},e.prototype.reportStartFrameProcessing=function(e,t){er.tick(),this.appliedEffect&&(this.frameProcessingStartedAt=performance.now(),this.performanceStatistics.processStarts(this.appliedEffect.effectId,e,t,this.appliedEffect.effectParam))},e.prototype.reportFrameProcessed=function(){var e;this.appliedEffect&&(this.processedFrameCount++,this.frameProcessingTimeCost+=performance.now()-this.frameProcessingStartedAt,this.performanceStatistics.processEnds(),this.isFirstFrameProcessed||(this.isFirstFrameProcessed=!0,this.reportPerformanceEvent("video.performance.firstFrameProcessed",[Date.now(),this.appliedEffect.effectId,null===(e=this.appliedEffect)||void 0===e?void 0:e.effectParam])))},e.prototype.reportGettingTextureStream=function(e){this.gettingTextureStreamStartedAt=performance.now(),this.currentStreamId=e},e.prototype.reportTextureStreamAcquired=function(){if(void 0!==this.gettingTextureStreamStartedAt){var e=performance.now()-this.gettingTextureStreamStartedAt;this.reportPerformanceEvent("video.performance.textureStreamAcquired",[this.currentStreamId,e])}},e.distributionBinSize=1e3,e.calculateFPSInterval=1e3,e}(),rr=function(e,t,n,r){function o(e){return e instanceof n?e:new n((function(t){t(e)}))}return new(n||(n=Promise))((function(n,i){function a(e){try{c(r.next(e))}catch(e){i(e)}}function s(e){try{c(r.throw(e))}catch(e){i(e)}}function c(e){e.done?n(e.value):o(e.value).then(a,s)}c((r=r.apply(e,t||[])).next())}))},or=function(e,t){var n,r,o,i,a={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return i={next:s(0),throw:s(1),return:s(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function s(e){return function(t){return c([e,t])}}function c(s){if(n)throw new TypeError("Generator is already executing.");for(;i&&(i=0,s[0]&&(a=0)),a;)try{if(n=1,r&&(o=2&s[0]?r.return:s[0]?r.throw||((o=r.return)&&o.call(r),0):r.next)&&!(o=o.call(r,s[1])).done)return o;switch(r=0,o&&(s=[2&s[0],o.value]),s[0]){case 0:case 1:o=s;break;case 4:return a.label++,{value:s[1],done:!1};case 5:a.label++,r=s[1],s=[0];continue;case 7:s=a.ops.pop(),a.trys.pop();continue;default:if(!(o=a.trys,(o=o.length>0&&o[o.length-1])||6!==s[0]&&2!==s[0])){a=0;continue}if(3===s[0]&&(!o||s[1]>o[0]&&s[1]<o[3])){a.label=s[1];break}if(6===s[0]&&a.label<o[1]){a.label=o[1],o=s;break}if(o&&a.label<o[2]){a.label=o[2],a.ops.push(s);break}o[2]&&a.ops.pop(),a.trys.pop();continue}s=t.call(e,a)}catch(e){s=[6,e],r=0}finally{n=o=0}if(5&s[0])throw s[1];return{value:s[0]?s[1]:void 0,done:!0}}};function ir(e,t,n,r){var o,i;return rr(this,void 0,void 0,(function(){var a,s;return or(this,(function(c){switch(c.label){case 0:return a=cr(),!le()&&(null===(i=null===(o=window.chrome)||void 0===o?void 0:o.webview)||void 0===i||i.registerTextureStream(e,a)),s=ur,[4,sr(e,n,r)];case 1:return s.apply(void 0,[c.sent(),new lr(n,t),a.writable]),[2]}}))}))}function ar(e,t,n,r){var o,i;return rr(this,void 0,void 0,(function(){var a,s;return or(this,(function(c){switch(c.label){case 0:return a=cr(),!le()&&(null===(i=null===(o=window.chrome)||void 0===o?void 0:o.webview)||void 0===i||i.registerTextureStream(e,a)),s=ur,[4,sr(e,n,r)];case 1:return s.apply(void 0,[c.sent(),new pr(n,t),a.writable]),[2]}}))}))}function sr(e,t,n){return rr(this,void 0,void 0,(function(){var r,o,i,a,s;return or(this,(function(c){switch(c.label){case 0:if(le())throw z;r=ue().chrome,c.label=1;case 1:return c.trys.push([1,3,,4]),null==n||n.reportGettingTextureStream(e),[4,r.webview.getTextureStream(e)];case 2:if(o=c.sent(),0===(i=o.getVideoTracks()).length)throw new Error("No video track in stream ".concat(e));return null==n||n.reportTextureStreamAcquired(),[2,i[0]];case 3:throw a=c.sent(),s="Failed to get video track from stream ".concat(e,", error: ").concat(a),t(s),new Error("Internal error: can't get video track from stream ".concat(e));case 4:return[2]}}))}))}function cr(){if(le())throw z;var e=window.MediaStreamTrackGenerator;if(!e)throw z;return new e({kind:"video"})}function ur(e,t,n){new(0,ue().MediaStreamTrackProcessor)({track:e}).readable.pipeThrough(new TransformStream(t)).pipeTo(n)}!function(e){e.TimestampIsNull="timestamp of the original video frame is null",e.UnsupportedVideoFramePixelFormat="Unsupported video frame pixel format"}(Yn||(Yn={}));var lr=function(){return function(e,t){var n=this;this.notifyError=e,this.videoFrameHandler=t,this.transform=function(e,t){return rr(n,void 0,void 0,(function(){var n,r,o,i;return or(this,(function(a){switch(a.label){case 0:if(null===(n=e.timestamp))return[3,5];a.label=1;case 1:return a.trys.push([1,3,,4]),[4,this.videoFrameHandler({videoFrame:e})];case 2:return r=a.sent(),o=new VideoFrame(r,{timestamp:n}),t.enqueue(o),e.close(),r.close(),[3,4];case 3:return i=a.sent(),e.close(),this.notifyError(i),[3,4];case 4:return[3,6];case 5:this.notifyError(Yn.TimestampIsNull),a.label=6;case 6:return[2]}}))}))}}}(),dr=function(){function e(e,t){if(this.headerBuffer=e,this.notifyError=t,this.ONE_TEXTURE_INPUT_ID=1869900081,this.INVALID_HEADER_ERROR="Invalid video frame header",this.UNSUPPORTED_LAYOUT_ERROR="Unsupported texture layout",this.headerDataView=new Uint32Array(e),this.headerDataView.length<8)throw this.notifyError(this.INVALID_HEADER_ERROR),new Error(this.INVALID_HEADER_ERROR);if(this.headerDataView[0]!==this.ONE_TEXTURE_INPUT_ID)throw this.notifyError(this.UNSUPPORTED_LAYOUT_ERROR),new Error(this.UNSUPPORTED_LAYOUT_ERROR)}return Object.defineProperty(e.prototype,"oneTextureLayoutId",{get:function(){return this.headerDataView[0]},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"version",{get:function(){return this.headerDataView[1]},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"frameRowOffset",{get:function(){return this.headerDataView[2]},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"frameFormat",{get:function(){return this.headerDataView[3]},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"frameWidth",{get:function(){return this.headerDataView[4]},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"frameHeight",{get:function(){return this.headerDataView[5]},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"multiStreamHeaderRowOffset",{get:function(){return this.headerDataView[6]},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"multiStreamCount",{get:function(){return this.headerDataView[7]},enumerable:!1,configurable:!0}),e}(),fr=function(){function e(e,t){this.metadataMap=new Map,this.AUDIO_INFERENCE_RESULT_STREAM_ID=828664161;for(var n=new Uint32Array(e),r=0,o=0;r<t;r++){var i=n[o++],a=n[o++],s=n[o++],c=new Uint8Array(e,a,s);this.metadataMap.set(i,c)}}return Object.defineProperty(e.prototype,"audioInferenceResult",{get:function(){return this.metadataMap.get(this.AUDIO_INFERENCE_RESULT_STREAM_ID)},enumerable:!1,configurable:!0}),e}(),pr=function(){return function(e,t){var n=this;this.notifyError=e,this.videoFrameHandler=t,this.shouldDiscardAudioInferenceResult=!1,this.transform=function(e,t){return rr(n,void 0,void 0,(function(){var n,r,o,i,a,s,c,u;return or(this,(function(l){switch(l.label){case 0:if(null===(n=e.timestamp))return[3,6];l.label=1;case 1:return l.trys.push([1,4,,5]),[4,this.extractVideoFrameAndMetadata(e)];case 2:return r=l.sent(),o=r.videoFrame,i=r.metadata,a=(void 0===i?{}:i).audioInferenceResult,[4,this.videoFrameHandler({videoFrame:o,audioInferenceResult:a})];case 3:return s=l.sent(),c=new VideoFrame(s,{timestamp:n}),t.enqueue(c),o.close(),e.close(),s.close(),[3,5];case 4:return u=l.sent(),e.close(),this.notifyError(u),[3,5];case 5:return[3,7];case 6:this.notifyError(Yn.TimestampIsNull),l.label=7;case 7:return[2]}}))}))},this.extractVideoFrameAndMetadata=function(e){return rr(n,void 0,void 0,(function(){var t,n,r,o,i,a;return or(this,(function(s){switch(s.label){case 0:if(le())throw z;if("NV12"!==e.format)throw this.notifyError(Yn.UnsupportedVideoFramePixelFormat),new Error(Yn.UnsupportedVideoFramePixelFormat);return t={x:0,y:0,width:e.codedWidth,height:2},n=new ArrayBuffer(t.width*t.height*3/2),[4,e.copyTo(n,{rect:t})];case 1:return s.sent(),r=new dr(n,this.notifyError),o={x:0,y:r.multiStreamHeaderRowOffset,width:e.codedWidth,height:e.codedHeight-r.multiStreamHeaderRowOffset},i=new ArrayBuffer(o.width*o.height*3/2),[4,e.copyTo(i,{rect:o})];case 2:return s.sent(),a=new fr(i,r.multiStreamCount),[2,{videoFrame:new VideoFrame(e,{timestamp:e.timestamp,visibleRect:{x:0,y:r.frameRowOffset,width:r.frameWidth,height:r.frameHeight}}),metadata:{audioInferenceResult:this.shouldDiscardAudioInferenceResult?void 0:a.audioInferenceResult}}]}}))}))},Qe("video.mediaStream.audioInferenceDiscardStatusChange",(function(e){var t=e.discardAudioInferenceResult;n.shouldDiscardAudioInferenceResult=t}))}}();function mr(e,t){return function(n,r){null==t||t.reportApplyingVideoEffect(n||"",r),e(n,r).then((function(){null==t||t.reportVideoEffectChanged(n||"",r),Ct("video.videoEffectReadiness",[!0,n,void 0,r])})).catch((function(e){var t=e in hr.EffectFailureReason?e:hr.EffectFailureReason.InitializationFailure;Ct("video.videoEffectReadiness",[!1,n,t,r])}))}}var hr,gr,wr,vr,Cr,yr,br,Sr,Er=function(){return Er=Object.assign||function(e){for(var t,n=1,r=arguments.length;n<r;n++)for(var o in t=arguments[n])Object.prototype.hasOwnProperty.call(t,o)&&(e[o]=t[o]);return e},Er.apply(this,arguments)},Ir=function(e,t,n,r){function o(e){return e instanceof n?e:new n((function(t){t(e)}))}return new(n||(n=Promise))((function(n,i){function a(e){try{c(r.next(e))}catch(e){i(e)}}function s(e){try{c(r.throw(e))}catch(e){i(e)}}function c(e){e.done?n(e.value):o(e.value).then(a,s)}c((r=r.apply(e,t||[])).next())}))},Tr=function(e,t){var n,r,o,i,a={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return i={next:s(0),throw:s(1),return:s(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function s(e){return function(t){return c([e,t])}}function c(s){if(n)throw new TypeError("Generator is already executing.");for(;i&&(i=0,s[0]&&(a=0)),a;)try{if(n=1,r&&(o=2&s[0]?r.return:s[0]?r.throw||((o=r.return)&&o.call(r),0):r.next)&&!(o=o.call(r,s[1])).done)return o;switch(r=0,o&&(s=[2&s[0],o.value]),s[0]){case 0:case 1:o=s;break;case 4:return a.label++,{value:s[1],done:!1};case 5:a.label++,r=s[1],s=[0];continue;case 7:s=a.ops.pop(),a.trys.pop();continue;default:if(!(o=a.trys,(o=o.length>0&&o[o.length-1])||6!==s[0]&&2!==s[0])){a=0;continue}if(3===s[0]&&(!o||s[1]>o[0]&&s[1]<o[3])){a.label=s[1];break}if(6===s[0]&&a.label<o[1]){a.label=o[1],o=s;break}if(o&&a.label<o[2]){a.label=o[2],a.ops.push(s);break}o[2]&&a.ops.pop(),a.trys.pop();continue}s=t.call(e,a)}catch(e){s=[6,e],r=0}finally{n=o=0}if(5&s[0])throw s[1];return{value:s[0]?s[1]:void 0,done:!0}}},Pr=function(e,t){var n={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var o=0;for(r=Object.getOwnPropertySymbols(e);o<r.length;o++)t.indexOf(r[o])<0&&Object.prototype.propertyIsEnumerable.call(e,r[o])&&(n[r[o]]=e[r[o]])}return n};function Fr(e,t){Me.initialize(t).then((function(){e&&e()}))}function Ar(){Oe.enablePrintCapability()}function kr(){Oe.print()}function Rr(e){xe(),Ct("getContext",(function(t){t.frameContext||(t.frameContext=y.frameContext),e(t)}))}function Or(e){Me.registerOnThemeChangeHandler(e)}function Mr(e){et("fullScreenChange",e,[])}function Dr(e){et("appButtonClick",e,[x.content])}function Nr(e){et("appButtonHoverEnter",e,[x.content])}function Ur(e){et("appButtonHoverLeave",e,[x.content])}function Lr(e){De.backStack.registerBackButtonHandlerHelper(e)}function Hr(e){Oe.registerOnLoadHandlerHelper(e)}function xr(e){Oe.registerBeforeUnloadHandlerHelper(e)}function Vr(e){et("focusEnter",e,[])}function _r(e){et("changeSettings",e,[x.content])}function Wr(e,t){Ve(ve),De.tabs.getTabInstances(t).then((function(t){e(t)}))}function Br(e,t){Ve(ve),De.tabs.getMruTabInstances(t).then((function(t){e(t)}))}function jr(e){De.shareDeepLink({subPageId:e.subEntityId,subPageLabel:e.subEntityLabel,subPageWebUrl:e.subEntityWebUrl})}function zr(e,t){Ve(ve,x.content,x.sidePanel,x.settings,x.task,x.stage,x.meetingStage),t=t||X(),Me.openLink(e).then((function(){t(!0)})).catch((function(e){t(!1,e.message)}))}function Gr(e){De.setCurrentFrame(e)}function qr(e,t,n){De.initializeWithFrameContext(e,t,n)}function Jr(e){De.returnFocus(e)}function Kr(e,t){Ve(ve),t=t||X(),De.tabs.navigateToTab(e).then((function(){t(!0)})).catch((function(e){t(!1,e.message)}))}function Zr(e,t){Ve(ve,x.content,x.sidePanel,x.settings,x.remove,x.task,x.stage,x.meetingStage),t=t||X(),De.navigateCrossDomain(e).then((function(){t(!0)})).catch((function(e){t(!1,e.message)}))}function Xr(e){Ve(ve),e=e||X(),De.backStack.navigateBack().then((function(){e(!0)})).catch((function(t){e(!1,t.message)}))}!function(e){var t=le()?void 0:new nr(Ct);function n(e){Ct("video.videoFrameProcessed",[e])}function r(e){Ct("video.notifyError",[e])}function o(){return Ve(ve)&&!!ve.supports.video&&(!!ve.supports.video.mediaStream||!!ve.supports.video.sharedFrame)}function i(e,n){var i=this;if(Ve(ve,x.sidePanel),!o()||!u())throw z;Qe("video.startVideoExtensibilityVideoStream",(function(n){return Ir(i,void 0,void 0,(function(){var o,i;return Tr(this,(function(s){switch(s.label){case 0:return o=n.streamId,i=a(e,t),[4,ir(o,i,r,t)];case 1:return s.sent(),[2]}}))}))}),!1),Ct("video.mediaStream.registerForVideoFrame",[n])}function a(e,t){var n=this;return function(r){return Ir(n,void 0,void 0,(function(){var n,o;return Tr(this,(function(i){switch(i.label){case 0:return n=r.videoFrame,null==t||t.reportStartFrameProcessing(n.codedWidth,n.codedHeight),[4,e(r)];case 1:return o=i.sent(),null==t||t.reportFrameProcessed(),[2,o]}}))}))}}function s(e,i){if(Ve(ve,x.sidePanel),!o()||!d())throw z;Qe("video.newVideoFrame",(function(o){if(o){var i=o.timestamp;null==t||t.reportStartFrameProcessing(o.width,o.height),e(c(o),(function(){null==t||t.reportFrameProcessed(),n(i)}),r)}}),!1),Ct("video.registerForVideoFrame",[i])}function c(e){if("videoFrameBuffer"in e)return e;var t=e.data,n=Pr(e,["data"]);return Er(Er({},n),{videoFrameBuffer:t})}function u(){var e;return Ve(ve,x.sidePanel)&&l()&&!!(null===(e=ve.supports.video)||void 0===e?void 0:e.mediaStream)}function l(){var e,t,n,r;return!(!(null===(t=null===(e=ue().chrome)||void 0===e?void 0:e.webview)||void 0===t?void 0:t.getTextureStream)||!(null===(r=null===(n=ue().chrome)||void 0===n?void 0:n.webview)||void 0===r?void 0:r.registerTextureStream))}function d(){var e;return Ve(ve,x.sidePanel)&&!!(null===(e=ve.supports.video)||void 0===e?void 0:e.sharedFrame)}!function(e){e.NV12="NV12"}(e.VideoFrameFormat||(e.VideoFrameFormat={})),function(e){e.EffectChanged="EffectChanged",e.EffectDisabled="EffectDisabled"}(e.EffectChangeType||(e.EffectChangeType={})),function(e){e.InvalidEffectId="InvalidEffectId",e.InitializationFailure="InitializationFailure"}(e.EffectFailureReason||(e.EffectFailureReason={})),e.registerForVideoFrame=function(e){if(Ve(ve,x.sidePanel),!o())throw z;if(!e.videoFrameHandler||!e.videoBufferHandler)throw new Error("Both videoFrameHandler and videoBufferHandler must be provided");if(Qe("video.setFrameProcessTimeLimit",(function(e){return null==t?void 0:t.setFrameProcessTimeLimit(e.timeLimit)}),!1),u())i(e.videoFrameHandler,e.config);else{if(!d())throw z;s(e.videoBufferHandler,e.config)}null==t||t.startMonitorSlowFrameProcessing()},e.notifySelectedVideoEffectChanged=function(e,t){if(Ve(ve,x.sidePanel),!o())throw z;Ct("video.videoEffectChanged",[e,t])},e.registerForVideoEffect=function(e){if(Ve(ve,x.sidePanel),!o())throw z;Qe("video.effectParameterChange",mr(e,t),!1),Ct("video.registerForVideoEffect")},e.isSupported=o}(hr||(hr={})),function(e){var t="search.queryChange",n="search.queryClose",r="search.queryExecute";function o(){return!(!Ve(ve)||!ve.supports.search)}e.registerHandlers=function(e,i,a){if(Ve(ve,x.content),!o())throw z;Qe(n,e),Qe(r,i),a&&Qe(t,a)},e.unregisterHandlers=function(){if(Ve(ve,x.content),!o())throw z;Ct("search.unregister"),$e(t),$e(n),$e(r)},e.isSupported=o,e.closeSearch=function(){return new Promise((function(e){if(Ve(ve,x.content),!o())throw new Error("Not supported");e(mt("search.closeSearch"))}))}}(gr||(gr={})),function(e){function t(t){return new Promise((function(n){if(!i())throw z;n(gt(e.SharingAPIMessages.shareWebContent,t))}))}function n(e){if(!(e&&e.content&&e.content.length))throw{errorCode:D.INVALID_ARGUMENTS,message:"Shared content is missing"}}function r(e){if(e.content.some((function(e){return!e.type})))throw{errorCode:D.INVALID_ARGUMENTS,message:"Shared content type cannot be undefined"};if(e.content.some((function(t){return t.type!==e.content[0].type})))throw{errorCode:D.INVALID_ARGUMENTS,message:"Shared content must be of the same type"}}function o(e){if("URL"!==e.content[0].type)throw{errorCode:D.INVALID_ARGUMENTS,message:"Content type is unsupported"};if(e.content.some((function(e){return!e.url})))throw{errorCode:D.INVALID_ARGUMENTS,message:"URLs are required for URL content types"}}function i(){return!(!Ve(ve)||!ve.supports.sharing)}e.SharingAPIMessages={shareWebContent:"sharing.shareWebContent"},e.shareWebContent=function(e,i){try{n(e),r(e),o(e)}catch(e){return te((function(){return Promise.reject(e)}),i)}return Ve(ve,x.content,x.sidePanel,x.task,x.stage,x.meetingStage),te(t,i,e)},e.isSupported=i}(wr||(wr={})),function(e){function t(){return!(!Ve(ve)||!ve.supports.stageView)}e.open=function(e){return new Promise((function(n){if(Ve(ve,x.content),!t())throw z;if(!e)throw new Error("[stageView.open] Stage view params cannot be null");n(gt("stageView.open",e))}))},e.isSupported=t}(vr||(vr={})),function(e){function t(){return!(!Ve(ve)||!ve.supports.webStorage)}e.isWebStorageClearedOnUserLogOut=function(){return Ve(ve),t()},e.isSupported=t}(Cr||(Cr={})),function(e){var t;function n(){return!(!Ve(ve)||!ve.supports.call)}!function(e){e.Unknown="unknown",e.Audio="audio",e.Video="video",e.VideoBasedScreenSharing="videoBasedScreenSharing",e.Data="data"}(t=e.CallModalities||(e.CallModalities={})),e.startCall=function(e){return new Promise((function(r){var o;if(Ve(ve,x.content,x.task),!n())throw z;if(!ve.isLegacyTeams)return Ct("call.startCall",[e],r);r(pt("executeDeepLink",hn(e.targets,null===(o=e.requestedModalities)||void 0===o?void 0:o.includes(t.Video),e.source)).then((function(e){if(!e)throw new Error(C);return e})))}))},e.isSupported=n}(yr||(yr={})),function(e){e.Messages=Me.Messages,e.FailedReason=Me.FailedReason,e.ExpectedFailureReason=Me.ExpectedFailureReason,e.notifyAppLoaded=function(){Me.notifyAppLoaded()},e.notifySuccess=function(){Me.notifySuccess()},e.notifyFailure=function(e){Me.notifyFailure(e)},e.notifyExpectedFailure=function(e){Me.notifyExpectedFailure(e)}}(br||(br={})),function(e){e.setValidityState=function(e){De.config.setValidityState(e)},e.getSettings=function(e){Ve(ve,x.content,x.settings,x.remove,x.sidePanel),De.getConfig().then((function(t){e(t)}))},e.setSettings=function(e,t){Ve(ve,x.content,x.settings,x.sidePanel),t=t||X(),De.config.setConfig(e).then((function(){t(!0)})).catch((function(e){t(!1,e.message)}))},e.registerOnSaveHandler=function(e){De.config.registerOnSaveHandlerHelper(e)},e.registerOnRemoveHandler=function(e){De.config.registerOnRemoveHandlerHelper(e)}}(Sr||(Sr={}));var Qr,$r,Yr=function(e,t){var n={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var o=0;for(r=Object.getOwnPropertySymbols(e);o<r.length;o++)t.indexOf(r[o])<0&&Object.prototype.propertyIsEnumerable.call(e,r[o])&&(n[r[o]]=e[r[o]])}return n};!function(e){function t(e){return{url:e.url,size:{height:e.height?e.height:j.Small,width:e.width?e.width:j.Small},title:e.title,fallbackUrl:e.fallbackUrl}}function n(e){return{url:e.url,size:{height:e.height?e.height:j.Small,width:e.width?e.width:j.Small},title:e.title,fallbackUrl:e.fallbackUrl,completionBotId:e.completionBotId}}function r(e){return e.height=e.height?e.height:j.Small,e.width=e.width?e.width:j.Small,e}e.startTask=function(e,r){var o=r?function(e){return r(e.err,e.result)}:void 0;return void 0===e.card&&void 0===e.url||e.card?(Ve(ve,x.content,x.sidePanel,x.meetingStage),Ct("tasks.startTask",[e],r)):void 0!==e.completionBotId?ke.url.bot.open(n(e),o):ke.url.open(t(e),o),new Wn},e.updateTask=function(e){(e=r(e)).width,e.height;var t=Yr(e,["width","height"]);if(Object.keys(t).length)throw new Error("resize requires a TaskInfo argument containing only width and height");ke.update.resize(e)},e.submitTask=function(e,t){ke.url.submit(e,t)},e.getDefaultSizeIfNotProvided=r}(Qr||(Qr={})),function(e){!function(e){e.guest="Guest",e.attendee="Attendee",e.presenter="Presenter",e.organizer="Organizer"}(e.UserMeetingRole||(e.UserMeetingRole={})),function(e){e.added="Added",e.alreadyExists="AlreadyExists",e.conflict="Conflict",e.notFound="NotFound"}(e.ContainerState||(e.ContainerState={})),e.isSupported=function(){return!(!Ve(ve,x.meetingStage,x.sidePanel)||!ve.supports.interactive)}}($r||($r={}));var eo=function(){function e(){}return e.prototype.getFluidTenantInfo=function(){return to(),new Promise((function(e){e(gt("interactive.getFluidTenantInfo"))}))},e.prototype.getFluidToken=function(e){return to(),new Promise((function(t){t(gt("interactive.getFluidToken",e))}))},e.prototype.getFluidContainerId=function(){return to(),new Promise((function(e){e(gt("interactive.getFluidContainerId"))}))},e.prototype.setFluidContainerId=function(e){return to(),new Promise((function(t){t(gt("interactive.setFluidContainerId",e))}))},e.prototype.getNtpTime=function(){return to(),new Promise((function(e){e(gt("interactive.getNtpTime"))}))},e.prototype.registerClientId=function(e){return to(),new Promise((function(t){t(gt("interactive.registerClientId",e))}))},e.prototype.getClientRoles=function(e){return to(),new Promise((function(t){t(gt("interactive.getClientRoles",e))}))},e.prototype.getClientInfo=function(e){return to(),new Promise((function(t){t(gt("interactive.getClientInfo",e))}))},e.create=function(){return to(),new e},e}();function to(){if(!$r.isSupported())throw new Error("LiveShareHost Not supported")}const no=/^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;const ro=function(e){return"string"==typeof e&&no.test(e)};var oo=function(){return oo=Object.assign||function(e){for(var t,n=1,r=arguments.length;n<r;n++)for(var o in t=arguments[n])Object.prototype.hasOwnProperty.call(t,o)&&(e[o]=t[o]);return e},oo.apply(this,arguments)},io=function(e,t){var n={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var o=0;for(r=Object.getOwnPropertySymbols(e);o<r.length;o++)t.indexOf(r[o])<0&&Object.prototype.propertyIsEnumerable.call(e,r[o])&&(n[r[o]]=e[r[o]])}return n};function ao(e){try{return e.cartItems=so(e.cartItems),e}catch(e){throw new Error("Error deserializing cart")}}function so(e){return e.map((function(e){if(e.imageURL){var t=new URL(e.imageURL);e.imageURL=t}return e.accessories&&(e.accessories=so(e.accessories)),e}))}var co=function(e){try{return e.map((function(e){var t=e.imageURL,n=e.accessories,r=io(e,["imageURL","accessories"]),o=oo({},r);return t&&(o.imageURL=t.href),n&&(o.accessories=co(n)),o}))}catch(e){throw new Error("Error serializing cart items")}};function uo(e){if(!Array.isArray(e)||0===e.length)throw new Error("cartItems must be a non-empty array");for(var t=0,n=e;t<n.length;t++){var r=n[t];fo(r),lo(r.accessories)}}function lo(e){if(null!=e){if(!Array.isArray(e)||0===e.length)throw new Error("CartItem.accessories must be a non-empty array");for(var t=0,n=e;t<n.length;t++){var r=n[t];if(r.accessories)throw new Error("Item in CartItem.accessories cannot have accessories");fo(r)}}}function fo(e){if(!e.id)throw new Error("cartItem.id must not be empty");if(!e.name)throw new Error("cartItem.name must not be empty");mo(e.price),ho(e.quantity)}function po(e){if(null!=e){if(!e)throw new Error("id must not be empty");if(!1===ro(e))throw new Error("id must be a valid UUID")}}function mo(e){if("number"!=typeof e||e<0)throw new Error("price ".concat(e," must be a number not less than 0"));if(parseFloat(e.toFixed(3))!==e)throw new Error("price ".concat(e," must have at most 3 decimal places"))}function ho(e){if("number"!=typeof e||e<=0||parseInt(e.toString())!==e)throw new Error("quantity ".concat(e," must be an integer greater than 0"))}function go(e){if(!Object.values(wo.CartStatus).includes(e))throw new Error("cartStatus ".concat(e," is not valid"))}var wo,vo,Co,yo,bo,So,Eo,Io=function(){return Io=Object.assign||function(e){for(var t,n=1,r=arguments.length;n<r;n++)for(var o in t=arguments[n])Object.prototype.hasOwnProperty.call(t,o)&&(e[o]=t[o]);return e},Io.apply(this,arguments)};!function(e){function t(){return!(!Ve(ve)||!ve.supports.marketplace)}e.cartVersion={majorVersion:1,minorVersion:1},function(e){e.TACAdminUser="TACAdminUser",e.TeamsAdminUser="TeamsAdminUser",e.TeamsEndUser="TeamsEndUser"}(e.Intent||(e.Intent={})),function(e){e.Open="Open",e.Processing="Processing",e.Processed="Processed",e.Closed="Closed",e.Error="Error"}(e.CartStatus||(e.CartStatus={})),e.getCart=function(){if(Ve(ve,x.content,x.task),!t())throw z;return gt("marketplace.getCart",e.cartVersion).then(ao)},e.addOrUpdateCartItems=function(n){if(Ve(ve,x.content,x.task),!t())throw z;if(!n)throw new Error("addOrUpdateCartItemsParams must be provided");return po(null==n?void 0:n.cartId),uo(null==n?void 0:n.cartItems),gt("marketplace.addOrUpdateCartItems",Io(Io({},n),{cartItems:co(n.cartItems),cartVersion:e.cartVersion})).then(ao)},e.removeCartItems=function(n){if(Ve(ve,x.content,x.task),!t())throw z;if(!n)throw new Error("removeCartItemsParams must be provided");if(po(null==n?void 0:n.cartId),!Array.isArray(null==n?void 0:n.cartItemIds)||0===(null==n?void 0:n.cartItemIds.length))throw new Error("cartItemIds must be a non-empty array");return gt("marketplace.removeCartItems",Io(Io({},n),{cartVersion:e.cartVersion})).then(ao)},e.updateCartStatus=function(n){if(Ve(ve,x.content,x.task),!t())throw z;if(!n)throw new Error("updateCartStatusParams must be provided");return po(null==n?void 0:n.cartId),go(null==n?void 0:n.cartStatus),gt("marketplace.updateCartStatus",Io(Io({},n),{cartVersion:e.cartVersion})).then(ao)},e.isSupported=t}(wo||(wo={})),function(e){function t(e,t){return{errorCode:e,message:t}}!function(e){e.Dropbox="DROPBOX",e.Box="BOX",e.Sharefile="SHAREFILE",e.GoogleDrive="GOOGLEDRIVE",e.Egnyte="EGNYTE",e.SharePoint="SharePoint"}(e.CloudStorageProvider||(e.CloudStorageProvider={})),function(e){e[e.Sharepoint=0]="Sharepoint",e[e.WopiIntegration=1]="WopiIntegration",e[e.Google=2]="Google",e[e.OneDrive=3]="OneDrive",e[e.Recent=4]="Recent",e[e.Aggregate=5]="Aggregate",e[e.FileSystem=6]="FileSystem",e[e.Search=7]="Search",e[e.AllFiles=8]="AllFiles",e[e.SharedWithMe=9]="SharedWithMe"}(e.CloudStorageProviderType||(e.CloudStorageProviderType={})),function(e){e.ClassMaterials="classMaterials"}(e.SpecialDocumentLibraryType||(e.SpecialDocumentLibraryType={})),function(e){e.Readonly="readonly"}(e.DocumentLibraryAccessType||(e.DocumentLibraryAccessType={})),function(e){e.Downloaded="Downloaded",e.Downloading="Downloading",e.Failed="Failed"}(e.FileDownloadStatus||(e.FileDownloadStatus={})),function(e){e.Download="DOWNLOAD",e.Upload="UPLOAD",e.Delete="DELETE"}(e.CloudStorageProviderFileAction||(e.CloudStorageProviderFileAction={})),e.getCloudStorageFolders=function(e,t){if(Ve(ve,x.content),!e||0===e.length)throw new Error("[files.getCloudStorageFolders] channelId name cannot be null or empty");if(!t)throw new Error("[files.getCloudStorageFolders] Callback cannot be null");Ct("files.getCloudStorageFolders",[e],t)},e.addCloudStorageFolder=function(e,t){if(Ve(ve,x.content),!e||0===e.length)throw new Error("[files.addCloudStorageFolder] channelId name cannot be null or empty");if(!t)throw new Error("[files.addCloudStorageFolder] Callback cannot be null");Ct("files.addCloudStorageFolder",[e],t)},e.deleteCloudStorageFolder=function(e,t,n){if(Ve(ve,x.content),!e)throw new Error("[files.deleteCloudStorageFolder] channelId name cannot be null or empty");if(!t)throw new Error("[files.deleteCloudStorageFolder] folderToDelete cannot be null or empty");if(!n)throw new Error("[files.deleteCloudStorageFolder] Callback cannot be null");Ct("files.deleteCloudStorageFolder",[e,t],n)},e.getCloudStorageFolderContents=function(e,t,n){if(Ve(ve,x.content),!e||!t)throw new Error("[files.getCloudStorageFolderContents] folder/providerCode name cannot be null or empty");if(!n)throw new Error("[files.getCloudStorageFolderContents] Callback cannot be null");if("isSubdirectory"in e&&!e.isSubdirectory)throw new Error("[files.getCloudStorageFolderContents] provided folder is not a subDirectory");Ct("files.getCloudStorageFolderContents",[e,t],n)},e.openCloudStorageFile=function(e,t,n){if(Ve(ve,x.content),!e||!t)throw new Error("[files.openCloudStorageFile] file/providerCode cannot be null or empty");if(e.isSubdirectory)throw new Error("[files.openCloudStorageFile] provided file is a subDirectory");Ct("files.openCloudStorageFile",[e,t,n])},e.getExternalProviders=function(e,t){if(void 0===e&&(e=!1),Ve(ve,x.content),!t)throw new Error("[files.getExternalProviders] Callback cannot be null");Ct("files.getExternalProviders",[e],t)},e.copyMoveFiles=function(e,t,n,r,o,i){if(void 0===o&&(o=!1),Ve(ve,x.content),!e||0===e.length)throw new Error("[files.copyMoveFiles] selectedFiles cannot be null or empty");if(!t)throw new Error("[files.copyMoveFiles] providerCode cannot be null or empty");if(!n)throw new Error("[files.copyMoveFiles] destinationFolder cannot be null or empty");if(!r)throw new Error("[files.copyMoveFiles] destinationProviderCode cannot be null or empty");if(!i)throw new Error("[files.copyMoveFiles] callback cannot be null");Ct("files.copyMoveFiles",[e,t,n,r,o],i)},e.getFileDownloads=function(e){if(Ve(ve,x.content),!e)throw new Error("[files.getFileDownloads] Callback cannot be null");Ct("files.getFileDownloads",[],e)},e.openDownloadFolder=function(e,t){if(void 0===e&&(e=void 0),Ve(ve,x.content),!t)throw new Error("[files.openDownloadFolder] Callback cannot be null");Ct("files.openDownloadFolder",[e],t)},e.addCloudStorageProvider=function(e){if(Ve(ve,x.content),!e)throw t(D.INVALID_ARGUMENTS,"[files.addCloudStorageProvider] callback cannot be null");Ct("files.addCloudStorageProvider",[],e)},e.removeCloudStorageProvider=function(e,n){if(Ve(ve,x.content),!n)throw t(D.INVALID_ARGUMENTS,"[files.removeCloudStorageProvider] callback cannot be null");if(!e||!e.content)throw t(D.INVALID_ARGUMENTS,"[files.removeCloudStorageProvider] 3P cloud storage provider request content is missing");Ct("files.removeCloudStorageProvider",[e],n)},e.addCloudStorageProviderFile=function(e,n){if(Ve(ve,x.content),!n)throw t(D.INVALID_ARGUMENTS,"[files.addCloudStorageProviderFile] callback cannot be null");if(!e||!e.content)throw t(D.INVALID_ARGUMENTS,"[files.addCloudStorageProviderFile] 3P cloud storage provider request content is missing");Ct("files.addCloudStorageProviderFile",[e],n)},e.renameCloudStorageProviderFile=function(e,n){if(Ve(ve,x.content),!n)throw t(D.INVALID_ARGUMENTS,"[files.renameCloudStorageProviderFile] callback cannot be null");if(!e||!e.content)throw t(D.INVALID_ARGUMENTS,"[files.renameCloudStorageProviderFile] 3P cloud storage provider request content is missing");Ct("files.renameCloudStorageProviderFile",[e],n)},e.deleteCloudStorageProviderFile=function(e,n){if(Ve(ve,x.content),!n)throw t(D.INVALID_ARGUMENTS,"[files.deleteCloudStorageProviderFile] callback cannot be null");if(!(e&&e.content&&e.content.itemList&&e.content.itemList.length>0))throw t(D.INVALID_ARGUMENTS,"[files.deleteCloudStorageProviderFile] 3P cloud storage provider request content details are missing");Ct("files.deleteCloudStorageProviderFile",[e],n)},e.downloadCloudStorageProviderFile=function(e,n){if(Ve(ve,x.content),!n)throw t(D.INVALID_ARGUMENTS,"[files.downloadCloudStorageProviderFile] callback cannot be null");if(!(e&&e.content&&e.content.itemList&&e.content.itemList.length>0))throw t(D.INVALID_ARGUMENTS,"[files.downloadCloudStorageProviderFile] 3P cloud storage provider request content details are missing");Ct("files.downloadCloudStorageProviderFile",[e],n)},e.uploadCloudStorageProviderFile=function(e,n){if(Ve(ve,x.content),!n)throw t(D.INVALID_ARGUMENTS,"[files.uploadCloudStorageProviderFile] callback cannot be null");if(!(e&&e.content&&e.content.itemList&&e.content.itemList.length>0))throw t(D.INVALID_ARGUMENTS,"[files.uploadCloudStorageProviderFile] 3P cloud storage provider request content details are missing");if(!e.content.destinationFolder)throw t(D.INVALID_ARGUMENTS,"[files.uploadCloudStorageProviderFile] Invalid destination folder details");Ct("files.uploadCloudStorageProviderFile",[e],n)},e.registerCloudStorageProviderListChangeHandler=function(e){if(Ve(ve),!e)throw new Error("[registerCloudStorageProviderListChangeHandler] Handler cannot be null");Qe("files.cloudStorageProviderListChange",e)},e.registerCloudStorageProviderContentChangeHandler=function(e){if(Ve(ve),!e)throw new Error("[registerCloudStorageProviderContentChangeHandler] Handler cannot be null");Qe("files.cloudStorageProviderContentChange",e)}}(vo||(vo={})),function(e){function t(){return!(!Ve(ve)||!ve.supports.meetingRoom)}e.getPairedMeetingRoomInfo=function(){return new Promise((function(e){if(Ve(ve),!t())throw z;e(gt("meetingRoom.getPairedMeetingRoomInfo"))}))},e.sendCommandToPairedMeetingRoom=function(e){return new Promise((function(n){if(!e||0==e.length)throw new Error("[meetingRoom.sendCommandToPairedMeetingRoom] Command name cannot be null or empty");if(Ve(ve),!t())throw z;n(gt("meetingRoom.sendCommandToPairedMeetingRoom",e))}))},e.registerMeetingRoomCapabilitiesUpdateHandler=function(e){if(!e)throw new Error("[meetingRoom.registerMeetingRoomCapabilitiesUpdateHandler] Handler cannot be null");if(Ve(ve),!t())throw z;Qe("meetingRoom.meetingRoomCapabilitiesUpdate",(function(t){Ve(ve),e(t)}))},e.registerMeetingRoomStatesUpdateHandler=function(e){if(!e)throw new Error("[meetingRoom.registerMeetingRoomStatesUpdateHandler] Handler cannot be null");if(Ve(ve),!t())throw z;Qe("meetingRoom.meetingRoomStatesUpdate",(function(t){Ve(ve),e(t)}))},e.isSupported=t}(Co||(Co={})),function(e){function t(){return!(!Ve(ve)||!ve.supports.notifications)}e.showNotification=function(e){if(Ve(ve,x.content),!t())throw z;Ct("notifications.showNotification",[e])},e.isSupported=t}(yo||(yo={})),function(e){function t(){return!(!Ve(ve)||!ve.supports.remoteCamera)}!function(e){e.Reset="Reset",e.ZoomIn="ZoomIn",e.ZoomOut="ZoomOut",e.PanLeft="PanLeft",e.PanRight="PanRight",e.TiltUp="TiltUp",e.TiltDown="TiltDown"}(e.ControlCommand||(e.ControlCommand={})),function(e){e[e.CommandResetError=0]="CommandResetError",e[e.CommandZoomInError=1]="CommandZoomInError",e[e.CommandZoomOutError=2]="CommandZoomOutError",e[e.CommandPanLeftError=3]="CommandPanLeftError",e[e.CommandPanRightError=4]="CommandPanRightError",e[e.CommandTiltUpError=5]="CommandTiltUpError",e[e.CommandTiltDownError=6]="CommandTiltDownError",e[e.SendDataError=7]="SendDataError"}(e.ErrorReason||(e.ErrorReason={})),function(e){e[e.None=0]="None",e[e.ControlDenied=1]="ControlDenied",e[e.ControlNoResponse=2]="ControlNoResponse",e[e.ControlBusy=3]="ControlBusy",e[e.AckTimeout=4]="AckTimeout",e[e.ControlTerminated=5]="ControlTerminated",e[e.ControllerTerminated=6]="ControllerTerminated",e[e.DataChannelError=7]="DataChannelError",e[e.ControllerCancelled=8]="ControllerCancelled",e[e.ControlDisabled=9]="ControlDisabled",e[e.ControlTerminatedToAllowOtherController=10]="ControlTerminatedToAllowOtherController"}(e.SessionTerminatedReason||(e.SessionTerminatedReason={})),e.getCapableParticipants=function(e){if(!e)throw new Error("[remoteCamera.getCapableParticipants] Callback cannot be null");if(Ve(ve,x.sidePanel),!t())throw z;Ct("remoteCamera.getCapableParticipants",e)},e.requestControl=function(e,n){if(!e)throw new Error("[remoteCamera.requestControl] Participant cannot be null");if(!n)throw new Error("[remoteCamera.requestControl] Callback cannot be null");if(Ve(ve,x.sidePanel),!t())throw z;Ct("remoteCamera.requestControl",[e],n)},e.sendControlCommand=function(e,n){if(!e)throw new Error("[remoteCamera.sendControlCommand] ControlCommand cannot be null");if(!n)throw new Error("[remoteCamera.sendControlCommand] Callback cannot be null");if(Ve(ve,x.sidePanel),!t())throw z;Ct("remoteCamera.sendControlCommand",[e],n)},e.terminateSession=function(e){if(!e)throw new Error("[remoteCamera.terminateSession] Callback cannot be null");if(Ve(ve,x.sidePanel),!t())throw z;Ct("remoteCamera.terminateSession",e)},e.registerOnCapableParticipantsChangeHandler=function(e){if(!e)throw new Error("[remoteCamera.registerOnCapableParticipantsChangeHandler] Handler cannot be null");if(Ve(ve,x.sidePanel),!t())throw z;Qe("remoteCamera.capableParticipantsChange",e)},e.registerOnErrorHandler=function(e){if(!e)throw new Error("[remoteCamera.registerOnErrorHandler] Handler cannot be null");if(Ve(ve,x.sidePanel),!t())throw z;Qe("remoteCamera.handlerError",e)},e.registerOnDeviceStateChangeHandler=function(e){if(!e)throw new Error("[remoteCamera.registerOnDeviceStateChangeHandler] Handler cannot be null");if(Ve(ve,x.sidePanel),!t())throw z;Qe("remoteCamera.deviceStateChange",e)},e.registerOnSessionStatusChangeHandler=function(e){if(!e)throw new Error("[remoteCamera.registerOnSessionStatusChangeHandler] Handler cannot be null");if(Ve(ve,x.sidePanel),!t())throw z;Qe("remoteCamera.sessionStatusChange",e)},e.isSupported=t}(bo||(bo={})),function(e){function t(){return!(!Ve(ve)||!ve.supports.appEntity)}e.selectAppEntity=function(e,n,r,o){if(Ve(ve,x.content),!t())throw z;if(!e||0==e.length)throw new Error("[appEntity.selectAppEntity] threadId name cannot be null or empty");if(!o)throw new Error("[appEntity.selectAppEntity] Callback cannot be null");Ct("appEntity.selectAppEntity",[e,n,r],o)},e.isSupported=t}(So||(So={})),function(e){function t(){return!(!Ve(ve)||!ve.supports.teams)}!function(e){e[e.Regular=0]="Regular",e[e.Private=1]="Private",e[e.Shared=2]="Shared"}(e.ChannelType||(e.ChannelType={})),e.getTeamChannels=function(e,n){if(Ve(ve,x.content),!t())throw z;if(!e)throw new Error("[teams.getTeamChannels] groupId cannot be null or empty");if(!n)throw new Error("[teams.getTeamChannels] Callback cannot be null");Ct("teams.getTeamChannels",[e],n)},e.refreshSiteUrl=function(e,n){if(Ve(ve),!t())throw z;if(!e)throw new Error("[teams.refreshSiteUrl] threadId cannot be null or empty");if(!n)throw new Error("[teams.refreshSiteUrl] Callback cannot be null");Ct("teams.refreshSiteUrl",[e],n)},e.isSupported=t,function(e){function t(){return!(!Ve(ve)||!ve.supports.teams)&&!!ve.supports.teams.fullTrust}!function(e){function t(){return!(!Ve(ve)||!ve.supports.teams)&&(!!ve.supports.teams.fullTrust&&!!ve.supports.teams.fullTrust.joinedTeams)}e.getUserJoinedTeams=function(e){return new Promise((function(n){if(Ve(ve),!t())throw z;if((y.hostClientType===L.android||y.hostClientType===L.teamsRoomsAndroid||y.hostClientType===L.teamsPhones||y.hostClientType===L.teamsDisplays)&&!_e(a)){var r={errorCode:D.OLD_PLATFORM};throw new Error(JSON.stringify(r))}n(pt("getUserJoinedTeams",e))}))},e.isSupported=t}(e.joinedTeams||(e.joinedTeams={})),e.getConfigSetting=function(e){return new Promise((function(n){if(Ve(ve),!t())throw z;n(pt("getConfigSetting",e))}))},e.isSupported=t}(e.fullTrust||(e.fullTrust={}))}(Eo||(Eo={}));var To,Po=function(e,t,n,r){function o(e){return e instanceof n?e:new n((function(t){t(e)}))}return new(n||(n=Promise))((function(n,i){function a(e){try{c(r.next(e))}catch(e){i(e)}}function s(e){try{c(r.throw(e))}catch(e){i(e)}}function c(e){e.done?n(e.value):o(e.value).then(a,s)}c((r=r.apply(e,t||[])).next())}))},Fo=function(e,t){var n,r,o,i,a={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return i={next:s(0),throw:s(1),return:s(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function s(e){return function(t){return c([e,t])}}function c(s){if(n)throw new TypeError("Generator is already executing.");for(;i&&(i=0,s[0]&&(a=0)),a;)try{if(n=1,r&&(o=2&s[0]?r.return:s[0]?r.throw||((o=r.return)&&o.call(r),0):r.next)&&!(o=o.call(r,s[1])).done)return o;switch(r=0,o&&(s=[2&s[0],o.value]),s[0]){case 0:case 1:o=s;break;case 4:return a.label++,{value:s[1],done:!1};case 5:a.label++,r=s[1],s=[0];continue;case 7:s=a.ops.pop(),a.trys.pop();continue;default:if(!(o=a.trys,(o=o.length>0&&o[o.length-1])||6!==s[0]&&2!==s[0])){a=0;continue}if(3===s[0]&&(!o||s[1]>o[0]&&s[1]<o[3])){a.label=s[1];break}if(6===s[0]&&a.label<o[1]){a.label=o[1],o=s;break}if(o&&a.label<o[2]){a.label=o[2],a.ops.push(s);break}o[2]&&a.ops.pop(),a.trys.pop();continue}s=t.call(e,a)}catch(e){s=[6,e],r=0}finally{n=o=0}if(5&s[0])throw s[1];return{value:s[0]?s[1]:void 0,done:!0}}};!function(e){var t,n=le()?void 0:new nr(Ct);function r(e,t){var n=this;return function(r){return Po(n,void 0,void 0,(function(){var n,o;return Fo(this,(function(i){switch(i.label){case 0:return n=r.videoFrame,t.reportStartFrameProcessing(n.codedWidth,n.codedHeight),[4,e(r)];case 1:return o=i.sent(),t.reportFrameProcessed(),[2,o]}}))}))}}function o(e){return e.videoFrameBuffer=e.videoFrameBuffer||e.data,delete e.data,e}function i(){return Ve(ve),hr.isSupported()}function a(e){Ct("video.videoFrameProcessed",[e])}function s(e,n){void 0===n&&(n=t.Warn),Ct("video.notifyError",[e,n])}!function(e){e.Fatal="fatal",e.Warn="warn"}(t=e.ErrorLevel||(e.ErrorLevel={})),e.registerForVideoFrame=function(e){var t,c,u=this;if(!i())throw z;if(!e.videoFrameHandler||!e.videoBufferHandler)throw new Error("Both videoFrameHandler and videoBufferHandler must be provided");if(Ve(ve,x.sidePanel)){if(Qe("video.setFrameProcessTimeLimit",(function(e){return null==n?void 0:n.setFrameProcessTimeLimit(e)}),!1),null===(t=ve.supports.video)||void 0===t?void 0:t.mediaStream)Qe("video.startVideoExtensibilityVideoStream",(function(t){return Po(u,void 0,void 0,(function(){var o,i,a;return Fo(this,(function(c){switch(c.label){case 0:return o=t.streamId,i=t.metadataInTexture,a=n?r(e.videoFrameHandler,n):e.videoFrameHandler,i?[4,ar(o,a,s,n)]:[3,2];case 1:return c.sent(),[3,4];case 2:return[4,ir(o,a,s,n)];case 3:c.sent(),c.label=4;case 4:return[2]}}))}))}),!1),Ct("video.mediaStream.registerForVideoFrame",[e.config]);else{if(!(null===(c=ve.supports.video)||void 0===c?void 0:c.sharedFrame))throw z;Qe("video.newVideoFrame",(function(t){if(t){null==n||n.reportStartFrameProcessing(t.width,t.height);var r=t.timestamp;e.videoBufferHandler(o(t),(function(){null==n||n.reportFrameProcessed(),a(r)}),s)}}),!1),Ct("video.registerForVideoFrame",[e.config])}null==n||n.startMonitorSlowFrameProcessing()}},e.notifySelectedVideoEffectChanged=function(e,t,n){if(Ve(ve,x.sidePanel),!i())throw z;Ct("video.videoEffectChanged",[e,t,n])},e.registerForVideoEffect=function(e){if(Ve(ve,x.sidePanel),!i())throw z;Qe("video.effectParameterChange",mr(e,n),!1),Ct("video.registerForVideoEffect")},e.updatePersonalizedEffects=function(e){if(Ve(ve,x.sidePanel),!hr.isSupported())throw z;Ct("video.personalizedEffectsChanged",[e])},e.isSupported=i,e.notifyFatalError=function(e){if(Ve(ve),!hr.isSupported())throw z;s(e,t.Fatal)}}(To||(To={}))})(),r})()));
//# sourceMappingURL=MicrosoftTeams.min.js.map
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../../process/browser.js */ "8oxB")))

/***/ }),

/***/ "PFzI":
/*!*************************************************!*\
  !*** ./node_modules/@pnp/graph/photos/types.js ***!
  \*************************************************/
/*! exports provided: _Photo, Photo */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "_Photo", function() { return _Photo; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Photo", function() { return Photo; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "Vx2g");
/* harmony import */ var _graphqueryable_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../graphqueryable.js */ "+t9t");
/* harmony import */ var _pnp_queryable__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @pnp/queryable */ "Ymo3");
/* harmony import */ var _decorators_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../decorators.js */ "s0bl");
/* harmony import */ var _operations_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../operations.js */ "xfNx");





let _Photo = class _Photo extends _graphqueryable_js__WEBPACK_IMPORTED_MODULE_1__["_GraphQueryableInstance"] {
    /**
     * Gets the image bytes as a blob (browser)
     */
    getBlob() {
        return Photo(this, "$value").using(Object(_pnp_queryable__WEBPACK_IMPORTED_MODULE_2__["BlobParse"])())();
    }
    /**
     * Gets the image file bytes as a Buffer (node.js)
     */
    getBuffer() {
        return Photo(this, "$value").using(Object(_pnp_queryable__WEBPACK_IMPORTED_MODULE_2__["BufferParse"])())();
    }
    /**
     * Sets the file bytes
     *
     * @param content Image file contents, max 4 MB
     */
    setContent(content) {
        return Object(_operations_js__WEBPACK_IMPORTED_MODULE_4__["graphPatch"])(Photo(this, "$value"), { body: content });
    }
};
_Photo = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"])([
    Object(_decorators_js__WEBPACK_IMPORTED_MODULE_3__["defaultPath"])("photo")
], _Photo);

const Photo = Object(_graphqueryable_js__WEBPACK_IMPORTED_MODULE_1__["graphInvokableFactory"])(_Photo);
//# sourceMappingURL=types.js.map

/***/ }),

/***/ "PGrk":
/*!************************************************************!*\
  !*** ./node_modules/@pnp/graph/directory-objects/types.js ***!
  \************************************************************/
/*! exports provided: _DirectoryObject, DirectoryObject, _DirectoryObjects, DirectoryObjects, DirectoryObjectTypes */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "_DirectoryObject", function() { return _DirectoryObject; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DirectoryObject", function() { return DirectoryObject; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "_DirectoryObjects", function() { return _DirectoryObjects; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DirectoryObjects", function() { return DirectoryObjects; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DirectoryObjectTypes", function() { return DirectoryObjectTypes; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "Vx2g");
/* harmony import */ var _graphqueryable_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../graphqueryable.js */ "+t9t");
/* harmony import */ var _decorators_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../decorators.js */ "s0bl");
/* harmony import */ var _pnp_queryable__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @pnp/queryable */ "Ymo3");
/* harmony import */ var _operations_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../operations.js */ "xfNx");
/* harmony import */ var _behaviors_paged_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../behaviors/paged.js */ "u29L");






/**
 * Represents a Directory Object entity
 */
let _DirectoryObject = class _DirectoryObject extends _graphqueryable_js__WEBPACK_IMPORTED_MODULE_1__["_GraphQueryableInstance"] {
    /**
   * Returns all the groups and directory roles that the specified Directory Object is a member of. The check is transitive
   *
   * @param securityEnabledOnly
   */
    getMemberObjects(securityEnabledOnly = false) {
        return Object(_operations_js__WEBPACK_IMPORTED_MODULE_4__["graphPost"])(DirectoryObject(this, "getMemberObjects"), Object(_pnp_queryable__WEBPACK_IMPORTED_MODULE_3__["body"])({ securityEnabledOnly }));
    }
    /**
   * Returns all the groups that the specified Directory Object is a member of. The check is transitive
   *
   * @param securityEnabledOnly
   */
    getMemberGroups(securityEnabledOnly = false) {
        return Object(_operations_js__WEBPACK_IMPORTED_MODULE_4__["graphPost"])(DirectoryObject(this, "getMemberGroups"), Object(_pnp_queryable__WEBPACK_IMPORTED_MODULE_3__["body"])({ securityEnabledOnly }));
    }
    /**
   * Check for membership in a specified list of groups, and returns from that list those groups of which the specified user, group, or directory object is a member.
   * This function is transitive.
   * @param groupIds A collection that contains the object IDs of the groups in which to check membership. Up to 20 groups may be specified.
   */
    checkMemberGroups(groupIds) {
        return Object(_operations_js__WEBPACK_IMPORTED_MODULE_4__["graphPost"])(DirectoryObject(this, "checkMemberGroups"), Object(_pnp_queryable__WEBPACK_IMPORTED_MODULE_3__["body"])({ groupIds }));
    }
};
_DirectoryObject = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"])([
    Object(_decorators_js__WEBPACK_IMPORTED_MODULE_2__["deleteable"])()
], _DirectoryObject);

const DirectoryObject = Object(_graphqueryable_js__WEBPACK_IMPORTED_MODULE_1__["graphInvokableFactory"])(_DirectoryObject);
/**
 * Describes a collection of Directory Objects
 *
 */
let _DirectoryObjects = class _DirectoryObjects extends _graphqueryable_js__WEBPACK_IMPORTED_MODULE_1__["_GraphQueryableCollection"] {
    /**
  * Returns the directory objects specified in a list of ids. NOTE: The directory objects returned are the full objects containing all their properties.
  * The $select query option is not available for this operation.
  *
  * @param ids A collection of ids for which to return objects. You can specify up to 1000 ids.
  * @param type A collection of resource types that specifies the set of resource collections to search. Default is directoryObject.
  */
    getByIds(ids, type = DirectoryObjectTypes.directoryObject) {
        return Object(_operations_js__WEBPACK_IMPORTED_MODULE_4__["graphPost"])(DirectoryObjects(this, "getByIds"), Object(_pnp_queryable__WEBPACK_IMPORTED_MODULE_3__["body"])({ ids, type }));
    }
    /**
     * 	Retrieves the total count of matching resources
     *  If the resource doesn't support count, this value will always be zero
     */
    async count() {
        const q = Object(_behaviors_paged_js__WEBPACK_IMPORTED_MODULE_5__["AsPaged"])(this, true);
        const r = await q.top(1)();
        return r.count;
    }
    /**
     * Allows reading through a collection as pages of information whose size is determined by top or the api method's default
     *
     * @returns an object containing results, the ability to determine if there are more results, and request the next page of results
     */
    paged() {
        return Object(_behaviors_paged_js__WEBPACK_IMPORTED_MODULE_5__["AsPaged"])(this, true)();
    }
};
_DirectoryObjects = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"])([
    Object(_decorators_js__WEBPACK_IMPORTED_MODULE_2__["defaultPath"])("directoryObjects"),
    Object(_decorators_js__WEBPACK_IMPORTED_MODULE_2__["getById"])(DirectoryObject)
], _DirectoryObjects);

const DirectoryObjects = Object(_graphqueryable_js__WEBPACK_IMPORTED_MODULE_1__["graphInvokableFactory"])(_DirectoryObjects);
/**
 * DirectoryObjectTypes
 */
var DirectoryObjectTypes;
(function (DirectoryObjectTypes) {
    /**
   * Directory Objects
   */
    DirectoryObjectTypes[DirectoryObjectTypes["directoryObject"] = 0] = "directoryObject";
    /**
   * User
   */
    DirectoryObjectTypes[DirectoryObjectTypes["user"] = 1] = "user";
    /**
   * Group
   */
    DirectoryObjectTypes[DirectoryObjectTypes["group"] = 2] = "group";
    /**
   * Device
   */
    DirectoryObjectTypes[DirectoryObjectTypes["device"] = 3] = "device";
})(DirectoryObjectTypes || (DirectoryObjectTypes = {}));
//# sourceMappingURL=types.js.map

/***/ }),

/***/ "PwfB":
/*!********************************************************!*\
  !*** ./lib/extensions/Components/Chat/Chat.module.css ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var content = __webpack_require__(/*! !../../../../node_modules/css-loader/dist/cjs.js!../../../../node_modules/postcss-loader/src??postcss!./Chat.module.css */ "T/wG");
var loader = __webpack_require__(/*! ./node_modules/@microsoft/loader-load-themed-styles/node_modules/@microsoft/load-themed-styles/lib/index.js */ "ruv1");

if(typeof content === "string") content = [[module.i, content]];

// add the styles to the DOM
for (var i = 0; i < content.length; i++) loader.loadStyles(content[i][1], true);

if(content.locals) module.exports = content.locals;

/***/ }),

/***/ "T/wG":
/*!*****************************************************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./node_modules/postcss-loader/src??postcss!./lib/extensions/Components/Chat/Chat.module.css ***!
  \*****************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(/*! ../../../../node_modules/css-loader/dist/runtime/api.js */ "JPst")(false);
// Module
exports.push([module.i, ".chatDrawerOpen_b430718f{position:fixed;width:300px;height:600px;bottom:0;z-index:100;right:40px;background:#fff;border:1px solid #bebebe;border-top-left-radius:10px;border-top-right-radius:10px;box-shadow:0 0 0 1px rgba(0,0,0,.08),0 4px 4px 0 rgba(0,0,0,.3);transition:all .5s ease-in-out}.chatDrawerOpen_b430718f:hover{background-color:#f9fafb}.chatDrawerClose_b430718f{position:fixed;width:300px;height:45px;bottom:0;z-index:100;right:40px;background:#fff;border:1px solid #bebebe;border-top-left-radius:10px;border-top-right-radius:10px;box-shadow:0 0 0 1px rgba(0,0,0,.08),0 4px 4px 0 rgba(0,0,0,.3);transition:all .5s ease-in-out}.chatDrawerClose_b430718f:hover{background-color:#f9fafb}.chatSlideButton_b430718f{position:absolute;width:100%;cursor:pointer}.chatLabel_b430718f{height:40px;padding:7px 8px}.chatText_b430718f{color:#242424;font-size:14px;font-weight:600;position:absolute;left:50px;top:14px}.chatPicture_b430718f{width:32px;height:32px;border-radius:100%}.chatContent_b430718f{position:absolute;top:45px;width:100%}.chatFrame_b430718f{width:100%;height:560px;border:none}.openChatIcon_b430718f{position:absolute;right:8px;top:8px;height:30px;width:30px;border-radius:100%;cursor:pointer}.openChatIcon_b430718f:hover{background-color:#ebebeb}.openChatSVG_b430718f{fill:#646464;position:absolute;top:7px;left:7px}", ""]);


/***/ }),

/***/ "USGv":
/*!****************************************************************!*\
  !*** ./node_modules/@pnp/graph/behaviors/consistency-level.js ***!
  \****************************************************************/
/*! exports provided: ConsistencyLevel */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ConsistencyLevel", function() { return ConsistencyLevel; });
function ConsistencyLevel(level = "eventual") {
    return (instance) => {
        instance.on.pre(async function (url, init, result) {
            init.headers = { ...init.headers, "ConsistencyLevel": level };
            return [url, init, result];
        });
        return instance;
    };
}
//# sourceMappingURL=consistency-level.js.map

/***/ }),

/***/ "V/rj":
/*!************************************************!*\
  !*** ./lib/extensions/Components/Chat/Chat.js ***!
  \************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "cDcd");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _Chat_module_scss__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Chat.module.scss */ "tDpx");



var Chat = function (_a) {
    var label = _a.label, userPhoto = _a.userPhoto;
    var _b = Object(react__WEBPACK_IMPORTED_MODULE_0__["useState"])(), open = _b[0], setOpen = _b[1];
    Object(react__WEBPACK_IMPORTED_MODULE_0__["useEffect"])(function () {
        if (open === undefined) {
            setOpen(false);
        }
    });
    function handleClick() {
        if (open === false) {
            setOpen(true);
        }
        else {
            setOpen(false);
        }
    }
    return (react__WEBPACK_IMPORTED_MODULE_0__["createElement"](react__WEBPACK_IMPORTED_MODULE_0__["Fragment"], null,
        react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("div", { className: "".concat(open ? _Chat_module_scss__WEBPACK_IMPORTED_MODULE_1__["default"].chatDrawerOpen : _Chat_module_scss__WEBPACK_IMPORTED_MODULE_1__["default"].chatDrawerClose) },
            react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("div", { className: _Chat_module_scss__WEBPACK_IMPORTED_MODULE_1__["default"].chatSlideButton, onClick: handleClick },
                react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("div", { className: _Chat_module_scss__WEBPACK_IMPORTED_MODULE_1__["default"].chatLabel },
                    react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("img", { className: _Chat_module_scss__WEBPACK_IMPORTED_MODULE_1__["default"].chatPicture, src: userPhoto }),
                    react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("span", { className: _Chat_module_scss__WEBPACK_IMPORTED_MODULE_1__["default"].chatText }, label),
                    react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("span", { className: _Chat_module_scss__WEBPACK_IMPORTED_MODULE_1__["default"].openChatIcon },
                        open === false &&
                            react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("svg", { className: _Chat_module_scss__WEBPACK_IMPORTED_MODULE_1__["default"].openChatSVG, xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 16 16", "data-supported-dps": "16x16", fill: "currentColor", width: "16", height: "16", focusable: "false" },
                                react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("path", { d: "M15 11L8 6.39 1 11V8.61L8 4l7 4.61z" })),
                        open === true &&
                            react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("svg", { className: _Chat_module_scss__WEBPACK_IMPORTED_MODULE_1__["default"].openChatSVG, xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 16 16", "data-supported-dps": "16x16", fill: "currentColor", width: "16", height: "16", focusable: "false" },
                                react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("path", { d: "M1 5l7 4.61L15 5v2.39L8 12 1 7.39z" }))))),
            react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("div", { className: _Chat_module_scss__WEBPACK_IMPORTED_MODULE_1__["default"].chatContent },
                react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("iframe", { className: _Chat_module_scss__WEBPACK_IMPORTED_MODULE_1__["default"].chatFrame, src: "https://teams.microsoft.com/embed-client/chats/list?layout=singlePane" })))));
};
/* harmony default export */ __webpack_exports__["default"] = (Chat);


/***/ }),

/***/ "V4GX":
/*!*************************************************!*\
  !*** ./node_modules/@pnp/queryable/add-prop.js ***!
  \*************************************************/
/*! exports provided: addProp */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "addProp", function() { return addProp; });
/**
 * Adds a property to a target instance
 *
 * @param target The object to whose prototype we will add a property
 * @param name Property name
 * @param factory Factory method used to produce the property value
 * @param path Any additional path required to produce the value
 */
function addProp(target, name, factory, path) {
    Reflect.defineProperty(target.prototype, name, {
        configurable: true,
        enumerable: true,
        get: function () {
            return factory(this, path || name);
        },
    });
}
//# sourceMappingURL=add-prop.js.map

/***/ }),

/***/ "Vx2g":
/*!*****************************************************************!*\
  !*** ./node_modules/@pnp/graph/node_modules/tslib/tslib.es6.js ***!
  \*****************************************************************/
/*! exports provided: __extends, __assign, __rest, __decorate, __param, __esDecorate, __runInitializers, __propKey, __setFunctionName, __metadata, __awaiter, __generator, __createBinding, __exportStar, __values, __read, __spread, __spreadArrays, __spreadArray, __await, __asyncGenerator, __asyncDelegator, __asyncValues, __makeTemplateObject, __importStar, __importDefault, __classPrivateFieldGet, __classPrivateFieldSet, __classPrivateFieldIn */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__extends", function() { return __extends; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__assign", function() { return __assign; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__rest", function() { return __rest; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__decorate", function() { return __decorate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__param", function() { return __param; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__esDecorate", function() { return __esDecorate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__runInitializers", function() { return __runInitializers; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__propKey", function() { return __propKey; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__setFunctionName", function() { return __setFunctionName; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__metadata", function() { return __metadata; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__awaiter", function() { return __awaiter; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__generator", function() { return __generator; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__createBinding", function() { return __createBinding; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__exportStar", function() { return __exportStar; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__values", function() { return __values; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__read", function() { return __read; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__spread", function() { return __spread; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__spreadArrays", function() { return __spreadArrays; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__spreadArray", function() { return __spreadArray; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__await", function() { return __await; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__asyncGenerator", function() { return __asyncGenerator; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__asyncDelegator", function() { return __asyncDelegator; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__asyncValues", function() { return __asyncValues; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__makeTemplateObject", function() { return __makeTemplateObject; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__importStar", function() { return __importStar; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__importDefault", function() { return __importDefault; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__classPrivateFieldGet", function() { return __classPrivateFieldGet; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__classPrivateFieldSet", function() { return __classPrivateFieldSet; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__classPrivateFieldIn", function() { return __classPrivateFieldIn; });
/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    }
    return __assign.apply(this, arguments);
}

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __param(paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
}

function __esDecorate(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.push(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.push(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};

function __runInitializers(thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};

function __propKey(x) {
    return typeof x === "symbol" ? x : "".concat(x);
};

function __setFunctionName(f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};

function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

var __createBinding = Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});

function __exportStar(m, o) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) __createBinding(o, m, p);
}

function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

/** @deprecated */
function __spread() {
    for (var ar = [], i = 0; i < arguments.length; i++)
        ar = ar.concat(__read(arguments[i]));
    return ar;
}

/** @deprecated */
function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
}

function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}

function __await(v) {
    return this instanceof __await ? (this.v = v, this) : new __await(v);
}

function __asyncGenerator(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
}

function __asyncDelegator(o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: false } : f ? f(v) : v; } : f; }
}

function __asyncValues(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
}

function __makeTemplateObject(cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};

var __setModuleDefault = Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
};

function __importStar(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
}

function __importDefault(mod) {
    return (mod && mod.__esModule) ? mod : { default: mod };
}

function __classPrivateFieldGet(receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}

function __classPrivateFieldSet(receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
}

function __classPrivateFieldIn(state, receiver) {
    if (receiver === null || (typeof receiver !== "object" && typeof receiver !== "function")) throw new TypeError("Cannot use 'in' operator on non-object");
    return typeof state === "function" ? receiver === state : state.has(receiver);
}


/***/ }),

/***/ "VxMn":
/*!**********************************************************!*\
  !*** ./node_modules/@pnp/queryable/behaviors/caching.js ***!
  \**********************************************************/
/*! exports provided: CacheAlways, CacheNever, CacheKey, Caching, bindCachingCore */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CacheAlways", function() { return CacheAlways; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CacheNever", function() { return CacheNever; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CacheKey", function() { return CacheKey; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Caching", function() { return Caching; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "bindCachingCore", function() { return bindCachingCore; });
/* harmony import */ var _pnp_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @pnp/core */ "JC1J");

/**
 * Behavior that forces caching for the request regardless of "method"
 *
 * @returns TimelinePipe
 */
function CacheAlways() {
    return (instance) => {
        instance.on.pre.prepend(async function (url, init, result) {
            init.headers = { ...init.headers, "X-PnP-CacheAlways": "1" };
            return [url, init, result];
        });
        return instance;
    };
}
/**
 * Behavior that blocks caching for the request regardless of "method"
 *
 * Note: If both Caching and CacheAlways are present AND CacheNever is present the request will not be cached
 * as we give priority to the CacheNever case
 *
 * @returns TimelinePipe
 */
function CacheNever() {
    return (instance) => {
        instance.on.pre.prepend(async function (url, init, result) {
            init.headers = { ...init.headers, "X-PnP-CacheNever": "1" };
            return [url, init, result];
        });
        return instance;
    };
}
/**
 * Behavior that allows you to specify a cache key for a request
 *
 * @param key The key to use for caching
  */
function CacheKey(key) {
    return (instance) => {
        instance.on.pre.prepend(async function (url, init, result) {
            init.headers = { ...init.headers, "X-PnP-CacheKey": key };
            return [url, init, result];
        });
        return instance;
    };
}
/**
 * Adds caching to the requests based on the supplied props
 *
 * @param props Optional props that configure how caching will work
 * @returns TimelinePipe used to configure requests
 */
function Caching(props) {
    return (instance) => {
        instance.on.pre(async function (url, init, result) {
            const [shouldCache, getCachedValue, setCachedValue] = bindCachingCore(url, init, props);
            // only cache get requested data or where the CacheAlways header is present (allows caching of POST requests)
            if (shouldCache) {
                const cached = getCachedValue();
                // we need to ensure that result stays "undefined" unless we mean to set null as the result
                if (cached === null) {
                    // if we don't have a cached result we need to get it after the request is sent and parsed
                    this.on.post(Object(_pnp_core__WEBPACK_IMPORTED_MODULE_0__["noInherit"])(async function (url, result) {
                        setCachedValue(result);
                        return [url, result];
                    }));
                }
                else {
                    result = cached;
                }
            }
            return [url, init, result];
        });
        return instance;
    };
}
const storage = new _pnp_core__WEBPACK_IMPORTED_MODULE_0__["PnPClientStorage"]();
/**
 * Based on the supplied properties, creates bound logic encapsulating common caching configuration
 * sharable across implementations to more easily provide consistent behavior across behaviors
 *
 * @param props Any caching props used to initialize the core functions
 */
function bindCachingCore(url, init, props) {
    var _a, _b;
    const { store, keyFactory, expireFunc } = {
        store: "local",
        keyFactory: (url) => Object(_pnp_core__WEBPACK_IMPORTED_MODULE_0__["getHashCode"])(url.toLowerCase()).toString(),
        expireFunc: () => Object(_pnp_core__WEBPACK_IMPORTED_MODULE_0__["dateAdd"])(new Date(), "minute", 5),
        ...props,
    };
    const s = store === "session" ? storage.session : storage.local;
    const key = (init === null || init === void 0 ? void 0 : init.headers["X-PnP-CacheKey"]) ? init.headers["X-PnP-CacheKey"] : keyFactory(url);
    return [
        // calculated value indicating if we should cache this request
        (/get/i.test(init.method) || ((_a = init === null || init === void 0 ? void 0 : init.headers["X-PnP-CacheAlways"]) !== null && _a !== void 0 ? _a : false)) && !((_b = init === null || init === void 0 ? void 0 : init.headers["X-PnP-CacheNever"]) !== null && _b !== void 0 ? _b : false),
        // gets the cached value
        () => s.get(key),
        // sets the cached value
        (value) => s.put(key, value, expireFunc(url)),
    ];
}
//# sourceMappingURL=caching.js.map

/***/ }),

/***/ "WE4i":
/*!***************************************************************!*\
  !*** ./node_modules/@pnp/queryable/behaviors/bearer-token.js ***!
  \***************************************************************/
/*! exports provided: BearerToken */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BearerToken", function() { return BearerToken; });
/* harmony import */ var _inject_headers_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./inject-headers.js */ "XOGp");

function BearerToken(token) {
    return (instance) => {
        instance.using(Object(_inject_headers_js__WEBPACK_IMPORTED_MODULE_0__["InjectHeaders"])({
            "Authorization": `Bearer ${token}`,
        }));
        return instance;
    };
}
//# sourceMappingURL=bearer-token.js.map

/***/ }),

/***/ "Ww49":
/*!**************************************************!*\
  !*** ./node_modules/@pnp/queryable/queryable.js ***!
  \**************************************************/
/*! exports provided: Queryable */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Queryable", function() { return Queryable; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "IwJs");
/* harmony import */ var _pnp_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @pnp/core */ "JC1J");
/* harmony import */ var _invokable_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./invokable.js */ "/sQB");



const DefaultMoments = {
    construct: Object(_pnp_core__WEBPACK_IMPORTED_MODULE_1__["lifecycle"])(),
    pre: Object(_pnp_core__WEBPACK_IMPORTED_MODULE_1__["asyncReduce"])(),
    auth: Object(_pnp_core__WEBPACK_IMPORTED_MODULE_1__["asyncReduce"])(),
    send: Object(_pnp_core__WEBPACK_IMPORTED_MODULE_1__["request"])(),
    parse: Object(_pnp_core__WEBPACK_IMPORTED_MODULE_1__["asyncReduce"])(),
    post: Object(_pnp_core__WEBPACK_IMPORTED_MODULE_1__["asyncReduce"])(),
    data: Object(_pnp_core__WEBPACK_IMPORTED_MODULE_1__["broadcast"])(),
};
let Queryable = class Queryable extends _pnp_core__WEBPACK_IMPORTED_MODULE_1__["Timeline"] {
    constructor(init, path) {
        super(DefaultMoments);
        // these keys represent internal events for Queryable, users are not expected to
        // subscribe directly to these, rather they enable functionality within Queryable
        // they are Symbols such that there are NOT cloned between queryables as we only grab string keys (by design)
        this.InternalResolve = Symbol.for("Queryable_Resolve");
        this.InternalReject = Symbol.for("Queryable_Reject");
        this.InternalPromise = Symbol.for("Queryable_Promise");
        this._query = new URLSearchParams();
        // add an intneral moment with specific implementaion for promise creation
        this.moments[this.InternalPromise] = Object(_pnp_core__WEBPACK_IMPORTED_MODULE_1__["reduce"])();
        let parent;
        if (typeof init === "string") {
            this._url = Object(_pnp_core__WEBPACK_IMPORTED_MODULE_1__["combine"])(init, path);
        }
        else if (Object(_pnp_core__WEBPACK_IMPORTED_MODULE_1__["isArray"])(init)) {
            if (init.length !== 2) {
                throw Error("When using the tuple param exactly two arguments are expected.");
            }
            if (typeof init[1] !== "string") {
                throw Error("Expected second tuple param to be a string.");
            }
            parent = init[0];
            this._url = Object(_pnp_core__WEBPACK_IMPORTED_MODULE_1__["combine"])(init[1], path);
        }
        else {
            parent = init;
            this._url = Object(_pnp_core__WEBPACK_IMPORTED_MODULE_1__["combine"])(parent._url, path);
        }
        if (typeof parent !== "undefined") {
            this.observers = parent.observers;
            this._inheritingObservers = true;
        }
    }
    /**
     * Directly concatenates the supplied string to the current url, not normalizing "/" chars
     *
     * @param pathPart The string to concatenate to the url
     */
    concat(pathPart) {
        this._url += pathPart;
        return this;
    }
    /**
     * Gets the full url with query information
     *
     */
    toRequestUrl() {
        let url = this.toUrl();
        const query = this.query.toString();
        if (!Object(_pnp_core__WEBPACK_IMPORTED_MODULE_1__["stringIsNullOrEmpty"])(query)) {
            url += `${url.indexOf("?") > -1 ? "&" : "?"}${query}`;
        }
        return url;
    }
    /**
     * Querystring key, value pairs which will be included in the request
     */
    get query() {
        return this._query;
    }
    /**
     * Gets the current url
     *
     */
    toUrl() {
        return this._url;
    }
    execute(userInit) {
        // if there are NO observers registered this is likely either a bug in the library or a user error, direct to docs
        if (Reflect.ownKeys(this.observers).length < 1) {
            throw Error("No observers registered for this request. (https://pnp.github.io/pnpjs/queryable/queryable#no-observers-registered-for-this-request)");
        }
        // schedule the execution after we return the promise below in the next event loop
        setTimeout(async () => {
            const requestId = Object(_pnp_core__WEBPACK_IMPORTED_MODULE_1__["getGUID"])();
            let requestUrl;
            const log = (msg, level) => {
                // this allows us to easily and consistently format our messages
                this.log(`[${requestId}] ${msg}`, level);
            };
            try {
                log("Beginning request", 0);
                // include the request id in the headers to assist with debugging against logs
                const initSeed = {
                    ...userInit,
                    headers: { ...userInit.headers, "X-PnPjs-RequestId": requestId },
                };
                // eslint-disable-next-line prefer-const
                let [url, init, result] = await this.emit.pre(this.toRequestUrl(), initSeed, undefined);
                log(`Url: ${url}`, 1);
                if (typeof result !== "undefined") {
                    log("Result returned from pre, Emitting data");
                    this.emit.data(result);
                    log("Emitted data");
                    return;
                }
                log("Emitting auth");
                [requestUrl, init] = await this.emit.auth(new URL(url), init);
                log("Emitted auth");
                // we always resepect user supplied init over observer modified init
                init = { ...init, ...userInit, headers: { ...init.headers, ...userInit.headers } };
                log("Emitting send");
                let response = await this.emit.send(requestUrl, init);
                log("Emitted send");
                log("Emitting parse");
                [requestUrl, response, result] = await this.emit.parse(requestUrl, response, result);
                log("Emitted parse");
                log("Emitting post");
                [requestUrl, result] = await this.emit.post(requestUrl, result);
                log("Emitted post");
                log("Emitting data");
                this.emit.data(result);
                log("Emitted data");
            }
            catch (e) {
                log(`Emitting error: "${e.message || e}"`, 3);
                // anything that throws we emit and continue
                this.error(e);
                log("Emitted error", 3);
            }
            finally {
                log("Finished request", 0);
            }
        }, 0);
        // this is the promise that the calling code will recieve and await
        let promise = new Promise((resolve, reject) => {
            // we overwrite any pre-existing internal events as a
            // given queryable only processes a single request at a time
            this.on[this.InternalResolve].replace(resolve);
            this.on[this.InternalReject].replace(reject);
        });
        // this allows us to internally hook the promise creation and modify it. This was introduced to allow for
        // cancelable to work as envisioned, but may have other users. Meant for internal use in the library accessed via behaviors.
        [promise] = this.emit[this.InternalPromise](promise);
        return promise;
    }
};
Queryable = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"])([
    Object(_pnp_core__WEBPACK_IMPORTED_MODULE_1__["extendable"])(),
    Object(_invokable_js__WEBPACK_IMPORTED_MODULE_2__["invokable"])()
], Queryable);

//# sourceMappingURL=queryable.js.map

/***/ }),

/***/ "XOGp":
/*!*****************************************************************!*\
  !*** ./node_modules/@pnp/queryable/behaviors/inject-headers.js ***!
  \*****************************************************************/
/*! exports provided: InjectHeaders */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "InjectHeaders", function() { return InjectHeaders; });
function InjectHeaders(headers, prepend = false) {
    return (instance) => {
        const f = async function (url, init, result) {
            init.headers = { ...init.headers, ...headers };
            return [url, init, result];
        };
        if (prepend) {
            instance.on.pre.prepend(f);
        }
        else {
            instance.on.pre(f);
        }
        return instance;
    };
}
//# sourceMappingURL=inject-headers.js.map

/***/ }),

/***/ "Ymo3":
/*!**********************************************!*\
  !*** ./node_modules/@pnp/queryable/index.js ***!
  \**********************************************/
/*! exports provided: addProp, invokable, get, post, put, patch, del, op, Queryable, queryableFactory, body, headers, BearerToken, BrowserFetch, BrowserFetchWithRetry, CacheAlways, CacheNever, CacheKey, Caching, bindCachingCore, CachingPessimisticRefresh, asCancelableScope, cancelableScope, Cancelable, CancelAction, InjectHeaders, DefaultParse, TextParse, BlobParse, JSONParse, BufferParse, HeaderParse, JSONHeaderParse, errorCheck, parseODataJSON, parseBinderWithErrorCheck, HttpRequestError, Timeout, ResolveOnData, RejectOnError */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _add_prop_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./add-prop.js */ "V4GX");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "addProp", function() { return _add_prop_js__WEBPACK_IMPORTED_MODULE_0__["addProp"]; });

/* harmony import */ var _invokable_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./invokable.js */ "/sQB");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "invokable", function() { return _invokable_js__WEBPACK_IMPORTED_MODULE_1__["invokable"]; });

/* harmony import */ var _operations_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./operations.js */ "h6Ct");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "get", function() { return _operations_js__WEBPACK_IMPORTED_MODULE_2__["get"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "post", function() { return _operations_js__WEBPACK_IMPORTED_MODULE_2__["post"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "put", function() { return _operations_js__WEBPACK_IMPORTED_MODULE_2__["put"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "patch", function() { return _operations_js__WEBPACK_IMPORTED_MODULE_2__["patch"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "del", function() { return _operations_js__WEBPACK_IMPORTED_MODULE_2__["del"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "op", function() { return _operations_js__WEBPACK_IMPORTED_MODULE_2__["op"]; });

/* harmony import */ var _queryable_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./queryable.js */ "Ww49");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Queryable", function() { return _queryable_js__WEBPACK_IMPORTED_MODULE_3__["Queryable"]; });

/* harmony import */ var _queryable_factory_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./queryable-factory.js */ "359w");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "queryableFactory", function() { return _queryable_factory_js__WEBPACK_IMPORTED_MODULE_4__["queryableFactory"]; });

/* harmony import */ var _request_builders_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./request-builders.js */ "0qgB");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "body", function() { return _request_builders_js__WEBPACK_IMPORTED_MODULE_5__["body"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "headers", function() { return _request_builders_js__WEBPACK_IMPORTED_MODULE_5__["headers"]; });

/* harmony import */ var _behaviors_bearer_token_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./behaviors/bearer-token.js */ "WE4i");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "BearerToken", function() { return _behaviors_bearer_token_js__WEBPACK_IMPORTED_MODULE_6__["BearerToken"]; });

/* harmony import */ var _behaviors_browser_fetch_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./behaviors/browser-fetch.js */ "do2w");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "BrowserFetch", function() { return _behaviors_browser_fetch_js__WEBPACK_IMPORTED_MODULE_7__["BrowserFetch"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "BrowserFetchWithRetry", function() { return _behaviors_browser_fetch_js__WEBPACK_IMPORTED_MODULE_7__["BrowserFetchWithRetry"]; });

/* harmony import */ var _behaviors_caching_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./behaviors/caching.js */ "VxMn");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "CacheAlways", function() { return _behaviors_caching_js__WEBPACK_IMPORTED_MODULE_8__["CacheAlways"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "CacheNever", function() { return _behaviors_caching_js__WEBPACK_IMPORTED_MODULE_8__["CacheNever"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "CacheKey", function() { return _behaviors_caching_js__WEBPACK_IMPORTED_MODULE_8__["CacheKey"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Caching", function() { return _behaviors_caching_js__WEBPACK_IMPORTED_MODULE_8__["Caching"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "bindCachingCore", function() { return _behaviors_caching_js__WEBPACK_IMPORTED_MODULE_8__["bindCachingCore"]; });

/* harmony import */ var _behaviors_caching_pessimistic_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./behaviors/caching-pessimistic.js */ "qL0N");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "CachingPessimisticRefresh", function() { return _behaviors_caching_pessimistic_js__WEBPACK_IMPORTED_MODULE_9__["CachingPessimisticRefresh"]; });

/* harmony import */ var _behaviors_cancelable_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./behaviors/cancelable.js */ "+y5s");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "asCancelableScope", function() { return _behaviors_cancelable_js__WEBPACK_IMPORTED_MODULE_10__["asCancelableScope"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "cancelableScope", function() { return _behaviors_cancelable_js__WEBPACK_IMPORTED_MODULE_10__["cancelableScope"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Cancelable", function() { return _behaviors_cancelable_js__WEBPACK_IMPORTED_MODULE_10__["Cancelable"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "CancelAction", function() { return _behaviors_cancelable_js__WEBPACK_IMPORTED_MODULE_10__["CancelAction"]; });

/* harmony import */ var _behaviors_inject_headers_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./behaviors/inject-headers.js */ "XOGp");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "InjectHeaders", function() { return _behaviors_inject_headers_js__WEBPACK_IMPORTED_MODULE_11__["InjectHeaders"]; });

/* harmony import */ var _behaviors_parsers_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./behaviors/parsers.js */ "udT0");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "DefaultParse", function() { return _behaviors_parsers_js__WEBPACK_IMPORTED_MODULE_12__["DefaultParse"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TextParse", function() { return _behaviors_parsers_js__WEBPACK_IMPORTED_MODULE_12__["TextParse"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "BlobParse", function() { return _behaviors_parsers_js__WEBPACK_IMPORTED_MODULE_12__["BlobParse"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "JSONParse", function() { return _behaviors_parsers_js__WEBPACK_IMPORTED_MODULE_12__["JSONParse"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "BufferParse", function() { return _behaviors_parsers_js__WEBPACK_IMPORTED_MODULE_12__["BufferParse"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "HeaderParse", function() { return _behaviors_parsers_js__WEBPACK_IMPORTED_MODULE_12__["HeaderParse"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "JSONHeaderParse", function() { return _behaviors_parsers_js__WEBPACK_IMPORTED_MODULE_12__["JSONHeaderParse"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "errorCheck", function() { return _behaviors_parsers_js__WEBPACK_IMPORTED_MODULE_12__["errorCheck"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "parseODataJSON", function() { return _behaviors_parsers_js__WEBPACK_IMPORTED_MODULE_12__["parseODataJSON"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "parseBinderWithErrorCheck", function() { return _behaviors_parsers_js__WEBPACK_IMPORTED_MODULE_12__["parseBinderWithErrorCheck"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "HttpRequestError", function() { return _behaviors_parsers_js__WEBPACK_IMPORTED_MODULE_12__["HttpRequestError"]; });

/* harmony import */ var _behaviors_timeout_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./behaviors/timeout.js */ "ISfK");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Timeout", function() { return _behaviors_timeout_js__WEBPACK_IMPORTED_MODULE_13__["Timeout"]; });

/* harmony import */ var _behaviors_resolvers_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./behaviors/resolvers.js */ "tGZ3");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ResolveOnData", function() { return _behaviors_resolvers_js__WEBPACK_IMPORTED_MODULE_14__["ResolveOnData"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "RejectOnError", function() { return _behaviors_resolvers_js__WEBPACK_IMPORTED_MODULE_14__["RejectOnError"]; });







/**
 * Behavior exports
 */









//# sourceMappingURL=index.js.map

/***/ }),

/***/ "cDcd":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_cDcd__;

/***/ }),

/***/ "do2w":
/*!****************************************************************!*\
  !*** ./node_modules/@pnp/queryable/behaviors/browser-fetch.js ***!
  \****************************************************************/
/*! exports provided: BrowserFetch, BrowserFetchWithRetry */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BrowserFetch", function() { return BrowserFetch; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BrowserFetchWithRetry", function() { return BrowserFetchWithRetry; });
/* harmony import */ var _pnp_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @pnp/core */ "JC1J");
/* harmony import */ var _parsers_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./parsers.js */ "udT0");


function BrowserFetch(props) {
    const { replace } = {
        replace: true,
        ...props,
    };
    return (instance) => {
        if (replace) {
            instance.on.send.clear();
        }
        instance.on.send(function (url, init) {
            this.log(`Fetch: ${init.method} ${url.toString()}`, 0);
            return fetch(url.toString(), init);
        });
        return instance;
    };
}
function BrowserFetchWithRetry(props) {
    const { interval, replace, retries } = {
        replace: true,
        interval: 200,
        retries: 3,
        ...props,
    };
    return (instance) => {
        if (replace) {
            instance.on.send.clear();
        }
        instance.on.send(function (url, init) {
            let response;
            let wait = interval;
            let count = 0;
            let lastErr;
            const retry = async () => {
                // if we've tried too many times, throw
                if (count >= retries) {
                    throw lastErr || new _parsers_js__WEBPACK_IMPORTED_MODULE_1__["HttpRequestError"](`Retry count exceeded (${retries}) for this request. ${response.status}: ${response.statusText};`, response);
                }
                count++;
                if (typeof response === "undefined" || (response === null || response === void 0 ? void 0 : response.status) === 429 || (response === null || response === void 0 ? void 0 : response.status) === 503 || (response === null || response === void 0 ? void 0 : response.status) === 504) {
                    // this is our first try and response isn't defined yet
                    // we have been throttled OR http status code 503 or 504, we can retry this
                    if (typeof response !== "undefined") {
                        // this isn't our first try so we need to calculate delay
                        if (response.headers.has("Retry-After")) {
                            // if we have gotten a header, use that value as the delay value in seconds
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            wait = parseInt(response.headers.get("Retry-After"), 10) * 1000;
                        }
                        else {
                            // Increment our counters.
                            wait *= 2;
                        }
                        this.log(`Attempt #${count} to retry request which failed with ${response.status}: ${response.statusText}`, 0);
                        await Object(_pnp_core__WEBPACK_IMPORTED_MODULE_0__["delay"])(wait);
                    }
                    try {
                        const u = url.toString();
                        this.log(`Fetch: ${init.method} ${u}`, 0);
                        response = await fetch(u, init);
                        // if we got a good response, return it, otherwise see if we can retry
                        return response.ok ? response : retry();
                    }
                    catch (err) {
                        if (/AbortError/.test(err.name)) {
                            // don't retry aborted requests
                            throw err;
                        }
                        // if there is no network the response is undefined and err is all we have
                        // so we grab the err and save it to throw if we exceed the number of retries
                        // #2226 first reported this
                        lastErr = err;
                        return retry();
                    }
                }
                else {
                    return response;
                }
            };
            // this the the first call to retry that starts the cycle
            // response is undefined and the other values have their defaults
            return retry();
        });
        return instance;
    };
}
//# sourceMappingURL=browser-fetch.js.map

/***/ }),

/***/ "erwh":
/*!*******************************************************!*\
  !*** ./node_modules/@pnp/graph/behaviors/endpoint.js ***!
  \*******************************************************/
/*! exports provided: Endpoint */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Endpoint", function() { return Endpoint; });
function Endpoint(endpoint) {
    return (instance) => {
        instance.on.pre(async function (url, init, result) {
            const all = ["beta", "v1.0"];
            let regex = new RegExp(endpoint, "i");
            const replaces = all.filter(s => !regex.test(s)).map(s => s.replace(".", "\\."));
            regex = new RegExp(`/?(${replaces.join("|")})/?`, "ig");
            url = url.replace(regex, `/${endpoint}/`);
            return [url, init, result];
        });
        return instance;
    };
}
//# sourceMappingURL=endpoint.js.map

/***/ }),

/***/ "faye":
/*!****************************!*\
  !*** external "react-dom" ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_faye__;

/***/ }),

/***/ "gP/q":
/*!************************************************!*\
  !*** ./node_modules/@pnp/graph/users/index.js ***!
  \************************************************/
/*! exports provided: User, Users, People */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _fi_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../fi.js */ "5NiK");
/* harmony import */ var _types_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./types.js */ "iCPL");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "User", function() { return _types_js__WEBPACK_IMPORTED_MODULE_1__["User"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Users", function() { return _types_js__WEBPACK_IMPORTED_MODULE_1__["Users"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "People", function() { return _types_js__WEBPACK_IMPORTED_MODULE_1__["People"]; });




Reflect.defineProperty(_fi_js__WEBPACK_IMPORTED_MODULE_0__["GraphFI"].prototype, "me", {
    configurable: true,
    enumerable: true,
    get: function () {
        return this.create(_types_js__WEBPACK_IMPORTED_MODULE_1__["User"], "me");
    },
});
Reflect.defineProperty(_fi_js__WEBPACK_IMPORTED_MODULE_0__["GraphFI"].prototype, "users", {
    configurable: true,
    enumerable: true,
    get: function () {
        return this.create(_types_js__WEBPACK_IMPORTED_MODULE_1__["Users"]);
    },
});
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "gmKL":
/*!**************************************************!*\
  !*** ./node_modules/@pnp/graph/photos/groups.js ***!
  \**************************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _pnp_queryable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @pnp/queryable */ "Ymo3");
/* harmony import */ var _groups_types_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../groups/types.js */ "NDCN");
/* harmony import */ var _types_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./types.js */ "PFzI");



Object(_pnp_queryable__WEBPACK_IMPORTED_MODULE_0__["addProp"])(_groups_types_js__WEBPACK_IMPORTED_MODULE_1__["_Group"], "photo", _types_js__WEBPACK_IMPORTED_MODULE_2__["Photo"]);
//# sourceMappingURL=groups.js.map

/***/ }),

/***/ "h6Ct":
/*!***************************************************!*\
  !*** ./node_modules/@pnp/queryable/operations.js ***!
  \***************************************************/
/*! exports provided: get, post, put, patch, del, op */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "get", function() { return get; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "post", function() { return post; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "put", function() { return put; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "patch", function() { return patch; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "del", function() { return del; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "op", function() { return op; });
function ensureInit(method, init = { headers: {} }) {
    return { method, ...init, headers: { ...init.headers } };
}
function get(init) {
    return this.start(ensureInit("GET", init));
}
function post(init) {
    return this.start(ensureInit("POST", init));
}
function put(init) {
    return this.start(ensureInit("PUT", init));
}
function patch(init) {
    return this.start(ensureInit("PATCH", init));
}
function del(init) {
    return this.start(ensureInit("DELETE", init));
}
function op(q, operation, init) {
    return Reflect.apply(operation, q, [init]);
}
//# sourceMappingURL=operations.js.map

/***/ }),

/***/ "hLTl":
/*!************************************************************************************!*\
  !*** ./lib/extensions/teamsChatEmbedded/TeamsChatEmbeddedApplicationCustomizer.js ***!
  \************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _microsoft_decorators__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @microsoft/decorators */ "wxtz");
/* harmony import */ var _microsoft_decorators__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_microsoft_decorators__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _microsoft_sp_application_base__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @microsoft/sp-application-base */ "GPet");
/* harmony import */ var _microsoft_sp_application_base__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_microsoft_sp_application_base__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _Components_Chat_Chat__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Components/Chat/Chat */ "V/rj");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react */ "cDcd");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react-dom */ "faye");
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(react_dom__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _pnp_graph__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @pnp/graph */ "Gx3w");
/* harmony import */ var _pnp_graph_users__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @pnp/graph/users */ "gP/q");
/* harmony import */ var _pnp_graph_photos__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @pnp/graph/photos */ "AKQX");
/* harmony import */ var TeamsChatEmbeddedApplicationCustomizerStrings__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! TeamsChatEmbeddedApplicationCustomizerStrings */ "91a9");
/* harmony import */ var TeamsChatEmbeddedApplicationCustomizerStrings__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(TeamsChatEmbeddedApplicationCustomizerStrings__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var _microsoft_teams_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @microsoft/teams-js */ "O7od");
/* harmony import */ var _microsoft_teams_js__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(_microsoft_teams_js__WEBPACK_IMPORTED_MODULE_9__);
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
/* eslint-disable no-debugger */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable @microsoft/spfx/pair-react-dom-render-unmount */
/* eslint-disable @typescript-eslint/explicit-function-return-type */










/** A Custom Action which can be run during execution of a Client Side Application */
var TeamsChatEmbeddedApplicationCustomizer = /** @class */ (function (_super) {
    __extends(TeamsChatEmbeddedApplicationCustomizer, _super);
    function TeamsChatEmbeddedApplicationCustomizer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TeamsChatEmbeddedApplicationCustomizer.prototype.onInit = function () {
        return __awaiter(this, void 0, void 0, function () {
            var context, exp_1, graph, photoValue, url, blobUrl, chat;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 5]);
                        return [4 /*yield*/, _microsoft_teams_js__WEBPACK_IMPORTED_MODULE_9__["app"].initialize()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, _microsoft_teams_js__WEBPACK_IMPORTED_MODULE_9__["app"].getContext()];
                    case 2:
                        context = _a.sent();
                        if (context) {
                            debugger;
                            return [2 /*return*/];
                        }
                        return [3 /*break*/, 5];
                    case 3:
                        exp_1 = _a.sent();
                        this._bottomPlaceholder = this.context.placeholderProvider.tryCreateContent(_microsoft_sp_application_base__WEBPACK_IMPORTED_MODULE_1__["PlaceholderName"].Bottom);
                        graph = Object(_pnp_graph__WEBPACK_IMPORTED_MODULE_5__["graphfi"])().using(Object(_pnp_graph__WEBPACK_IMPORTED_MODULE_5__["SPFx"])(this.context));
                        return [4 /*yield*/, graph.me.photo.getBlob()];
                    case 4:
                        photoValue = _a.sent();
                        url = window.URL || window.webkitURL;
                        blobUrl = url.createObjectURL(photoValue);
                        chat = react__WEBPACK_IMPORTED_MODULE_3__["createElement"](_Components_Chat_Chat__WEBPACK_IMPORTED_MODULE_2__["default"], { label: TeamsChatEmbeddedApplicationCustomizerStrings__WEBPACK_IMPORTED_MODULE_8__["Label"], userPhoto: blobUrl });
                        react_dom__WEBPACK_IMPORTED_MODULE_4__["render"](chat, this._bottomPlaceholder.domElement);
                        debugger;
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/, Promise.resolve()];
                }
            });
        });
    };
    __decorate([
        _microsoft_decorators__WEBPACK_IMPORTED_MODULE_0__["override"]
    ], TeamsChatEmbeddedApplicationCustomizer.prototype, "onInit", null);
    return TeamsChatEmbeddedApplicationCustomizer;
}(_microsoft_sp_application_base__WEBPACK_IMPORTED_MODULE_1__["BaseApplicationCustomizer"]));
/* harmony default export */ __webpack_exports__["default"] = (TeamsChatEmbeddedApplicationCustomizer);


/***/ }),

/***/ "iCPL":
/*!************************************************!*\
  !*** ./node_modules/@pnp/graph/users/types.js ***!
  \************************************************/
/*! exports provided: _User, User, _Users, Users, _People, People */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "_User", function() { return _User; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "User", function() { return User; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "_Users", function() { return _Users; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Users", function() { return Users; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "_People", function() { return _People; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "People", function() { return People; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "Vx2g");
/* harmony import */ var _graphqueryable_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../graphqueryable.js */ "+t9t");
/* harmony import */ var _directory_objects_types_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../directory-objects/types.js */ "PGrk");
/* harmony import */ var _decorators_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../decorators.js */ "s0bl");




let _User = class _User extends _directory_objects_types_js__WEBPACK_IMPORTED_MODULE_2__["_DirectoryObject"] {
    /**
    * The groups and directory roles associated with the user
    */
    get memberOf() {
        return Object(_directory_objects_types_js__WEBPACK_IMPORTED_MODULE_2__["DirectoryObjects"])(this, "memberOf");
    }
    /**
    * The groups and directory roles associated with the user
    */
    get transitiveMemberOf() {
        return Object(_directory_objects_types_js__WEBPACK_IMPORTED_MODULE_2__["DirectoryObjects"])(this, "transitiveMemberOf");
    }
    /**
     * Retrieve a collection of person objects ordered by their relevance to the user
     */
    get people() {
        return People(this);
    }
    /**
    * People that have direct reports to the user
    */
    get directReports() {
        return People(this, "directReports");
    }
    /**
    * The manager associated with this user
    */
    get manager() {
        return User(this, "manager");
    }
};
_User = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"])([
    Object(_decorators_js__WEBPACK_IMPORTED_MODULE_3__["updateable"])(),
    Object(_decorators_js__WEBPACK_IMPORTED_MODULE_3__["deleteable"])()
], _User);

const User = Object(_graphqueryable_js__WEBPACK_IMPORTED_MODULE_1__["graphInvokableFactory"])(_User);
let _Users = class _Users extends _directory_objects_types_js__WEBPACK_IMPORTED_MODULE_2__["_DirectoryObjects"] {
};
_Users = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"])([
    Object(_decorators_js__WEBPACK_IMPORTED_MODULE_3__["defaultPath"])("users"),
    Object(_decorators_js__WEBPACK_IMPORTED_MODULE_3__["getById"])(User)
], _Users);

const Users = Object(_graphqueryable_js__WEBPACK_IMPORTED_MODULE_1__["graphInvokableFactory"])(_Users);
let _People = class _People extends _directory_objects_types_js__WEBPACK_IMPORTED_MODULE_2__["_DirectoryObjects"] {
};
_People = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"])([
    Object(_decorators_js__WEBPACK_IMPORTED_MODULE_3__["defaultPath"])("people")
], _People);

const People = Object(_graphqueryable_js__WEBPACK_IMPORTED_MODULE_1__["graphInvokableFactory"])(_People);
//# sourceMappingURL=types.js.map

/***/ }),

/***/ "qL0N":
/*!**********************************************************************!*\
  !*** ./node_modules/@pnp/queryable/behaviors/caching-pessimistic.js ***!
  \**********************************************************************/
/*! exports provided: CachingPessimisticRefresh */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CachingPessimisticRefresh", function() { return CachingPessimisticRefresh; });
/* harmony import */ var _pnp_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @pnp/core */ "JC1J");
/* harmony import */ var _queryable_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../queryable.js */ "Ww49");
/* harmony import */ var _caching_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./caching.js */ "VxMn");



/**
 * Pessimistic Caching Behavior
 * Always returns the cached value if one exists but asynchronously executes the call and updates the cache.
 * If a expireFunc is included then the cache update only happens if the cache has expired.
 *
 * @param store Use local or session storage
 * @param keyFactory: a function that returns the key for the cache value, if not provided a default hash of the url will be used
 * @param expireFunc: a function that returns a date of expiration for the cache value, if not provided the cache never expires but is always updated.
 */
function CachingPessimisticRefresh(props) {
    return (instance) => {
        const pre = async function (url, init, result) {
            const [shouldCache, getCachedValue, setCachedValue] = Object(_caching_js__WEBPACK_IMPORTED_MODULE_2__["bindCachingCore"])(url, init, props);
            if (!shouldCache) {
                return [url, init, result];
            }
            const cached = getCachedValue();
            if (Object(_pnp_core__WEBPACK_IMPORTED_MODULE_0__["objectDefinedNotNull"])(cached)) {
                // set our result
                result = cached;
                setTimeout(async () => {
                    const q = new _queryable_js__WEBPACK_IMPORTED_MODULE_1__["Queryable"](this);
                    const a = q.on.pre.toArray();
                    q.on.pre.clear();
                    // filter out this pre handler from the original queryable as we don't want to re-run it
                    a.filter(v => v !== pre).map(v => q.on.pre(v));
                    // in this case the init should contain the correct "method"
                    const value = await q(init);
                    setCachedValue(value);
                }, 0);
            }
            else {
                // register the post handler to cache the value as there is not one already in the cache
                // and we need to run this request as normal
                this.on.post(Object(_pnp_core__WEBPACK_IMPORTED_MODULE_0__["noInherit"])(async function (url, result) {
                    setCachedValue(result);
                    return [url, result];
                }));
            }
            return [url, init, result];
        };
        instance.on.pre(pre);
        return instance;
    };
}
//# sourceMappingURL=caching-pessimistic.js.map

/***/ }),

/***/ "qNel":
/*!*******************************************************!*\
  !*** ./node_modules/@pnp/core/behaviors/copy-from.js ***!
  \*******************************************************/
/*! exports provided: CopyFrom */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CopyFrom", function() { return CopyFrom; });
/* harmony import */ var _util_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util.js */ "NuLX");
/* harmony import */ var _timeline_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../timeline.js */ "4kGv");


/**
 * Behavior that will copy all the observers in the source timeline and apply it to the incoming instance
 *
 * @param source The source instance from which we will copy the observers
 * @param behavior replace = observers are cleared before adding, append preserves any observers already present
 * @param filter If provided filters the moments from which the observers are copied. It should return true for each moment to include.
 * @returns The mutated this
 */
function CopyFrom(source, behavior = "append", filter) {
    return (instance) => {
        return Reflect.apply(copyObservers, instance, [source, behavior, filter]);
    };
}
/**
 * Function with implied this allows us to access protected members
 *
 * @param this The timeline whose observers we will copy
 * @param source The source instance from which we will copy the observers
 * @param behavior replace = observers are cleared before adding, append preserves any observers already present
 * @returns The mutated this
 */
function copyObservers(source, behavior, filter) {
    if (!Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["objectDefinedNotNull"])(source) || !Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["objectDefinedNotNull"])(source.observers)) {
        return this;
    }
    if (!Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["isFunc"])(filter)) {
        filter = () => true;
    }
    const clonedSource = Object(_timeline_js__WEBPACK_IMPORTED_MODULE_1__["cloneObserverCollection"])(source.observers);
    const keys = Object.keys(clonedSource).filter(filter);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const on = this.on[key];
        if (behavior === "replace") {
            on.clear();
        }
        const momentObservers = clonedSource[key];
        momentObservers.forEach(v => on(v));
    }
    return this;
}
//# sourceMappingURL=copy-from.js.map

/***/ }),

/***/ "ruv1":
/*!*******************************************************************************************************************!*\
  !*** ./node_modules/@microsoft/loader-load-themed-styles/node_modules/@microsoft/load-themed-styles/lib/index.js ***!
  \*******************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitStyles = exports.detokenize = exports.clearStyles = exports.loadTheme = exports.flush = exports.configureRunMode = exports.configureLoadStyles = exports.loadStyles = void 0;
// Store the theming state in __themeState__ global scope for reuse in the case of duplicate
// load-themed-styles hosted on the page.
var _root = typeof window === 'undefined' ? global : window; // eslint-disable-line @typescript-eslint/no-explicit-any
// Nonce string to inject into script tag if one provided. This is used in CSP (Content Security Policy).
var _styleNonce = _root && _root.CSPSettings && _root.CSPSettings.nonce;
var _themeState = initializeThemeState();
/**
 * Matches theming tokens. For example, "[theme: themeSlotName, default: #FFF]" (including the quotes).
 */
var _themeTokenRegex = /[\'\"]\[theme:\s*(\w+)\s*(?:\,\s*default:\s*([\\"\']?[\.\,\(\)\#\-\s\w]*[\.\,\(\)\#\-\w][\"\']?))?\s*\][\'\"]/g;
var now = function () {
    return typeof performance !== 'undefined' && !!performance.now ? performance.now() : Date.now();
};
function measure(func) {
    var start = now();
    func();
    var end = now();
    _themeState.perf.duration += end - start;
}
/**
 * initialize global state object
 */
function initializeThemeState() {
    var state = _root.__themeState__ || {
        theme: undefined,
        lastStyleElement: undefined,
        registeredStyles: []
    };
    if (!state.runState) {
        state = __assign(__assign({}, state), { perf: {
                count: 0,
                duration: 0
            }, runState: {
                flushTimer: 0,
                mode: 0 /* Mode.sync */,
                buffer: []
            } });
    }
    if (!state.registeredThemableStyles) {
        state = __assign(__assign({}, state), { registeredThemableStyles: [] });
    }
    _root.__themeState__ = state;
    return state;
}
/**
 * Loads a set of style text. If it is registered too early, we will register it when the window.load
 * event is fired.
 * @param {string | ThemableArray} styles Themable style text to register.
 * @param {boolean} loadAsync When true, always load styles in async mode, irrespective of current sync mode.
 */
function loadStyles(styles, loadAsync) {
    if (loadAsync === void 0) { loadAsync = false; }
    measure(function () {
        var styleParts = Array.isArray(styles) ? styles : splitStyles(styles);
        var _a = _themeState.runState, mode = _a.mode, buffer = _a.buffer, flushTimer = _a.flushTimer;
        if (loadAsync || mode === 1 /* Mode.async */) {
            buffer.push(styleParts);
            if (!flushTimer) {
                _themeState.runState.flushTimer = asyncLoadStyles();
            }
        }
        else {
            applyThemableStyles(styleParts);
        }
    });
}
exports.loadStyles = loadStyles;
/**
 * Allows for customizable loadStyles logic. e.g. for server side rendering application
 * @param {(processedStyles: string, rawStyles?: string | ThemableArray) => void}
 * a loadStyles callback that gets called when styles are loaded or reloaded
 */
function configureLoadStyles(loadStylesFn) {
    _themeState.loadStyles = loadStylesFn;
}
exports.configureLoadStyles = configureLoadStyles;
/**
 * Configure run mode of load-themable-styles
 * @param mode load-themable-styles run mode, async or sync
 */
function configureRunMode(mode) {
    _themeState.runState.mode = mode;
}
exports.configureRunMode = configureRunMode;
/**
 * external code can call flush to synchronously force processing of currently buffered styles
 */
function flush() {
    measure(function () {
        var styleArrays = _themeState.runState.buffer.slice();
        _themeState.runState.buffer = [];
        var mergedStyleArray = [].concat.apply([], styleArrays);
        if (mergedStyleArray.length > 0) {
            applyThemableStyles(mergedStyleArray);
        }
    });
}
exports.flush = flush;
/**
 * register async loadStyles
 */
function asyncLoadStyles() {
    return setTimeout(function () {
        _themeState.runState.flushTimer = 0;
        flush();
    }, 0);
}
/**
 * Loads a set of style text. If it is registered too early, we will register it when the window.load event
 * is fired.
 * @param {string} styleText Style to register.
 * @param {IStyleRecord} styleRecord Existing style record to re-apply.
 */
function applyThemableStyles(stylesArray, styleRecord) {
    if (_themeState.loadStyles) {
        _themeState.loadStyles(resolveThemableArray(stylesArray).styleString, stylesArray);
    }
    else {
        registerStyles(stylesArray);
    }
}
/**
 * Registers a set theme tokens to find and replace. If styles were already registered, they will be
 * replaced.
 * @param {theme} theme JSON object of theme tokens to values.
 */
function loadTheme(theme) {
    _themeState.theme = theme;
    // reload styles.
    reloadStyles();
}
exports.loadTheme = loadTheme;
/**
 * Clear already registered style elements and style records in theme_State object
 * @param option - specify which group of registered styles should be cleared.
 * Default to be both themable and non-themable styles will be cleared
 */
function clearStyles(option) {
    if (option === void 0) { option = 3 /* ClearStyleOptions.all */; }
    if (option === 3 /* ClearStyleOptions.all */ || option === 2 /* ClearStyleOptions.onlyNonThemable */) {
        clearStylesInternal(_themeState.registeredStyles);
        _themeState.registeredStyles = [];
    }
    if (option === 3 /* ClearStyleOptions.all */ || option === 1 /* ClearStyleOptions.onlyThemable */) {
        clearStylesInternal(_themeState.registeredThemableStyles);
        _themeState.registeredThemableStyles = [];
    }
}
exports.clearStyles = clearStyles;
function clearStylesInternal(records) {
    records.forEach(function (styleRecord) {
        var styleElement = styleRecord && styleRecord.styleElement;
        if (styleElement && styleElement.parentElement) {
            styleElement.parentElement.removeChild(styleElement);
        }
    });
}
/**
 * Reloads styles.
 */
function reloadStyles() {
    if (_themeState.theme) {
        var themableStyles = [];
        for (var _i = 0, _a = _themeState.registeredThemableStyles; _i < _a.length; _i++) {
            var styleRecord = _a[_i];
            themableStyles.push(styleRecord.themableStyle);
        }
        if (themableStyles.length > 0) {
            clearStyles(1 /* ClearStyleOptions.onlyThemable */);
            applyThemableStyles([].concat.apply([], themableStyles));
        }
    }
}
/**
 * Find theme tokens and replaces them with provided theme values.
 * @param {string} styles Tokenized styles to fix.
 */
function detokenize(styles) {
    if (styles) {
        styles = resolveThemableArray(splitStyles(styles)).styleString;
    }
    return styles;
}
exports.detokenize = detokenize;
/**
 * Resolves ThemingInstruction objects in an array and joins the result into a string.
 * @param {ThemableArray} splitStyleArray ThemableArray to resolve and join.
 */
function resolveThemableArray(splitStyleArray) {
    var theme = _themeState.theme;
    var themable = false;
    // Resolve the array of theming instructions to an array of strings.
    // Then join the array to produce the final CSS string.
    var resolvedArray = (splitStyleArray || []).map(function (currentValue) {
        var themeSlot = currentValue.theme;
        if (themeSlot) {
            themable = true;
            // A theming annotation. Resolve it.
            var themedValue = theme ? theme[themeSlot] : undefined;
            var defaultValue = currentValue.defaultValue || 'inherit';
            // Warn to console if we hit an unthemed value even when themes are provided, but only if "DEBUG" is true.
            // Allow the themedValue to be undefined to explicitly request the default value.
            if (theme &&
                !themedValue &&
                console &&
                !(themeSlot in theme) &&
                "boolean" !== 'undefined' &&
                true) {
                console.warn("Theming value not provided for \"".concat(themeSlot, "\". Falling back to \"").concat(defaultValue, "\"."));
            }
            return themedValue || defaultValue;
        }
        else {
            // A non-themable string. Preserve it.
            return currentValue.rawString;
        }
    });
    return {
        styleString: resolvedArray.join(''),
        themable: themable
    };
}
/**
 * Split tokenized CSS into an array of strings and theme specification objects
 * @param {string} styles Tokenized styles to split.
 */
function splitStyles(styles) {
    var result = [];
    if (styles) {
        var pos = 0; // Current position in styles.
        var tokenMatch = void 0;
        while ((tokenMatch = _themeTokenRegex.exec(styles))) {
            var matchIndex = tokenMatch.index;
            if (matchIndex > pos) {
                result.push({
                    rawString: styles.substring(pos, matchIndex)
                });
            }
            result.push({
                theme: tokenMatch[1],
                defaultValue: tokenMatch[2] // May be undefined
            });
            // index of the first character after the current match
            pos = _themeTokenRegex.lastIndex;
        }
        // Push the rest of the string after the last match.
        result.push({
            rawString: styles.substring(pos)
        });
    }
    return result;
}
exports.splitStyles = splitStyles;
/**
 * Registers a set of style text. If it is registered too early, we will register it when the
 * window.load event is fired.
 * @param {ThemableArray} styleArray Array of IThemingInstruction objects to register.
 * @param {IStyleRecord} styleRecord May specify a style Element to update.
 */
function registerStyles(styleArray) {
    if (typeof document === 'undefined') {
        return;
    }
    var head = document.getElementsByTagName('head')[0];
    var styleElement = document.createElement('style');
    var _a = resolveThemableArray(styleArray), styleString = _a.styleString, themable = _a.themable;
    styleElement.setAttribute('data-load-themed-styles', 'true');
    if (_styleNonce) {
        styleElement.setAttribute('nonce', _styleNonce);
    }
    styleElement.appendChild(document.createTextNode(styleString));
    _themeState.perf.count++;
    head.appendChild(styleElement);
    var ev = document.createEvent('HTMLEvents');
    ev.initEvent('styleinsert', true /* bubbleEvent */, false /* cancelable */);
    ev.args = {
        newStyle: styleElement
    };
    document.dispatchEvent(ev);
    var record = {
        styleElement: styleElement,
        themableStyle: styleArray
    };
    if (themable) {
        _themeState.registeredThemableStyles.push(record);
    }
    else {
        _themeState.registeredStyles.push(record);
    }
}
//# sourceMappingURL=index.js.map
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../../../../../webpack/buildin/global.js */ "yLpj")))

/***/ }),

/***/ "s0bl":
/*!***********************************************!*\
  !*** ./node_modules/@pnp/graph/decorators.js ***!
  \***********************************************/
/*! exports provided: defaultPath, deleteable, deleteableWithETag, updateable, updateableWithETag, addable, getById */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "defaultPath", function() { return defaultPath; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "deleteable", function() { return deleteable; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "deleteableWithETag", function() { return deleteableWithETag; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "updateable", function() { return updateable; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "updateableWithETag", function() { return updateableWithETag; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "addable", function() { return addable; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getById", function() { return getById; });
/* harmony import */ var _operations_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./operations.js */ "xfNx");
/* harmony import */ var _pnp_queryable__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @pnp/queryable */ "Ymo3");


/**
 * Decorator used to specify the default path for Queryable objects
 *
 * @param path
 */
function defaultPath(path) {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return function (target) {
        return class extends target {
            constructor(...args) {
                super(args[0], args.length > 1 && args[1] !== undefined ? args[1] : path);
            }
        };
    };
}
/**
 * Adds the delete method to the tagged class
 */
function deleteable() {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return function (target) {
        return class extends target {
            delete() {
                return Object(_operations_js__WEBPACK_IMPORTED_MODULE_0__["graphDelete"])(this);
            }
        };
    };
}
/**
 * Adds the delete method to the tagged class
 */
function deleteableWithETag() {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return function (target) {
        return class extends target {
            delete(eTag = "*") {
                return Object(_operations_js__WEBPACK_IMPORTED_MODULE_0__["graphDelete"])(this, Object(_pnp_queryable__WEBPACK_IMPORTED_MODULE_1__["headers"])({
                    "If-Match": eTag,
                }));
            }
        };
    };
}
/**
 * Adds the update method to the tagged class
 */
function updateable() {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return function (target) {
        return class extends target {
            update(props) {
                return Object(_operations_js__WEBPACK_IMPORTED_MODULE_0__["graphPatch"])(this, Object(_pnp_queryable__WEBPACK_IMPORTED_MODULE_1__["body"])(props));
            }
        };
    };
}
/**
 * Adds the update method to the tagged class
 */
function updateableWithETag() {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return function (target) {
        return class extends target {
            update(props, eTag = "*") {
                return Object(_operations_js__WEBPACK_IMPORTED_MODULE_0__["graphPatch"])(this, Object(_pnp_queryable__WEBPACK_IMPORTED_MODULE_1__["body"])(props, Object(_pnp_queryable__WEBPACK_IMPORTED_MODULE_1__["headers"])({
                    "If-Match": eTag,
                })));
            }
        };
    };
}
/**
 * Adds the add method to the tagged class
 */
function addable() {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return function (target) {
        return class extends target {
            add(props) {
                return Object(_operations_js__WEBPACK_IMPORTED_MODULE_0__["graphPost"])(this, Object(_pnp_queryable__WEBPACK_IMPORTED_MODULE_1__["body"])(props));
            }
        };
    };
}
/**
 * Adds the getById method to a collection
 */
function getById(factory) {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return function (target) {
        return class extends target {
            getById(id) {
                return factory(this, id);
            }
        };
    };
}
//# sourceMappingURL=decorators.js.map

/***/ }),

/***/ "t9SU":
/*!**********************************************!*\
  !*** ./node_modules/@pnp/core/extendable.js ***!
  \**********************************************/
/*! exports provided: extendable, extend, extendFactory, disableExtensions, enableExtensions */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "extendable", function() { return extendable; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "extend", function() { return extend; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "extendFactory", function() { return extendFactory; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "disableExtensions", function() { return disableExtensions; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "enableExtensions", function() { return enableExtensions; });
/* harmony import */ var _util_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./util.js */ "NuLX");

let _enableExtensions = false;
const ObjExtensionsSym = Symbol.for("PnPExt");
const factoryExtensions = new Map();
/**
 * Decorator factory wrapping any tagged class in the extension proxy, enabling the use of object extensions
 *
 * @description MUST be applied last (i.e. be the first decorator in the list top to bottom applied to a class)
 *
 * @returns Decorator implementation
 */
function extendable() {
    return (target) => {
        return new Proxy(target, {
            construct(clz, args, newTarget) {
                let r = Reflect.construct(clz, args, newTarget);
                // this block handles the factory function extensions by picking
                // them off the factory and applying them to the created object
                const proto = Reflect.getPrototypeOf(target);
                if (Reflect.has(proto, ObjExtensionsSym)) {
                    const extensions = factoryExtensions.get(Reflect.get(proto, ObjExtensionsSym));
                    if (extensions) {
                        r = extend(r, extensions);
                    }
                }
                const proxied = new Proxy(r, {
                    apply: (target, _thisArg, argArray) => {
                        // eslint-disable-next-line @typescript-eslint/ban-types
                        return extensionOrDefault("apply", (...a) => Reflect.apply(...a), target, proxied, argArray);
                    },
                    get: (target, p, receiver) => {
                        // eslint-disable-next-line @typescript-eslint/ban-types
                        return extensionOrDefault("get", (...a) => Reflect.get(...a), target, p, receiver);
                    },
                    has: (target, p) => {
                        // eslint-disable-next-line @typescript-eslint/ban-types
                        return extensionOrDefault("has", (...a) => Reflect.has(...a), target, p);
                    },
                    set: (target, p, value, receiver) => {
                        // eslint-disable-next-line @typescript-eslint/ban-types
                        return extensionOrDefault("set", (...a) => Reflect.set(...a), target, p, value, receiver);
                    },
                });
                return proxied;
            },
        });
    };
}
/**
 * Applies the supplied extensions to a single instance
 *
 * @param target Object to which extensions are applied
 * @param extensions Extensions to apply
 */
function extend(target, extensions) {
    _enableExtensions = true;
    if (!Reflect.has(target, ObjExtensionsSym)) {
        Reflect.defineProperty(target, ObjExtensionsSym, {
            writable: true,
            value: [],
        });
    }
    extendCol(Reflect.get(target, ObjExtensionsSym), extensions);
    return target;
}
/**
 * Allows applying extensions to all instances created from the supplied factory
 *
 * @param factory The Invokable Factory method to extend
 * @param extensions Extensions to apply
 */
function extendFactory(factory, extensions) {
    _enableExtensions = true;
    // factoryExtensions
    const proto = Reflect.getPrototypeOf(factory);
    if (proto) {
        if (!Reflect.has(proto, ObjExtensionsSym)) {
            Reflect.defineProperty(proto, ObjExtensionsSym, {
                value: Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["getGUID"])(),
            });
        }
        const key = proto[ObjExtensionsSym];
        if (!factoryExtensions.has(key)) {
            factoryExtensions.set(key, []);
        }
        extendCol(factoryExtensions.get(key), extensions);
    }
}
function extendCol(a, e) {
    if (Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["isArray"])(e)) {
        a.push(...e);
    }
    else {
        a.push(e);
    }
}
/**
 * Disables all extensions
 */
const disableExtensions = () => {
    _enableExtensions = false;
};
/**
 * Enables all extensions
 */
const enableExtensions = () => {
    _enableExtensions = true;
};
/**
 * Executes the extended functionality if present, or the default action
 *
 * @param op Current operation type
 * @param or The default non-extended functionality
 * @param target The current "this" to which the current call applies
 * @param rest Any arguments required for the called method
 * @returns Whatever the underlying extension or method returns
 */
function extensionOrDefault(op, or, target, ...rest) {
    if (_enableExtensions && Reflect.has(target, ObjExtensionsSym)) {
        const extensions = [...Reflect.get(target, ObjExtensionsSym)];
        let result = undefined;
        for (let i = 0; i < extensions.length; i++) {
            const extension = extensions[i];
            if (Object(_util_js__WEBPACK_IMPORTED_MODULE_0__["isFunc"])(extension)) {
                // this extension is a function which we call
                result = extension(op, target, ...rest);
            }
            else if (op === "get" && Reflect.has(extension, rest[0])) {
                // this extension is a named extension meaning we are adding/overriding a specific method/property
                result = Reflect.get(extension, rest[0], target);
            }
            else if (Reflect.has(extension, op)) {
                // this extension is a ProxyHandler that has a handler defined for {op} so we pass control and see if we get a result
                result = Reflect.get(extension, op)(target, ...rest);
            }
            if (typeof result !== "undefined") {
                // if a extension returned a result, we return that
                // this means that this extension overrides any other extensions and no more are executed
                // first extension in the list to return "wins"
                return result;
            }
        }
    }
    return or(target, ...rest);
}
//# sourceMappingURL=extendable.js.map

/***/ }),

/***/ "tDpx":
/*!************************************************************!*\
  !*** ./lib/extensions/Components/Chat/Chat.module.scss.js ***!
  \************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* tslint:disable */
__webpack_require__(/*! ./Chat.module.css */ "PwfB");
var styles = {
    chatDrawerOpen: 'chatDrawerOpen_b430718f',
    chatDrawerClose: 'chatDrawerClose_b430718f',
    chatSlideButton: 'chatSlideButton_b430718f',
    chatLabel: 'chatLabel_b430718f',
    chatText: 'chatText_b430718f',
    chatPicture: 'chatPicture_b430718f',
    chatContent: 'chatContent_b430718f',
    chatFrame: 'chatFrame_b430718f',
    openChatIcon: 'openChatIcon_b430718f',
    openChatSVG: 'openChatSVG_b430718f'
};
/* harmony default export */ __webpack_exports__["default"] = (styles);
/* tslint:enable */ 


/***/ }),

/***/ "tGZ3":
/*!************************************************************!*\
  !*** ./node_modules/@pnp/queryable/behaviors/resolvers.js ***!
  \************************************************************/
/*! exports provided: ResolveOnData, RejectOnError */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ResolveOnData", function() { return ResolveOnData; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RejectOnError", function() { return RejectOnError; });
function ResolveOnData() {
    return (instance) => {
        instance.on.data(function (data) {
            this.emit[this.InternalResolve](data);
        });
        return instance;
    };
}
function RejectOnError() {
    return (instance) => {
        instance.on.error(function (err) {
            this.emit[this.InternalReject](err);
        });
        return instance;
    };
}
//# sourceMappingURL=resolvers.js.map

/***/ }),

/***/ "u29L":
/*!****************************************************!*\
  !*** ./node_modules/@pnp/graph/behaviors/paged.js ***!
  \****************************************************/
/*! exports provided: AsPaged, Paged */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AsPaged", function() { return AsPaged; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Paged", function() { return Paged; });
/* harmony import */ var _pnp_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @pnp/core */ "JC1J");
/* harmony import */ var _pnp_queryable__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @pnp/queryable */ "Ymo3");
/* harmony import */ var _graphqueryable_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../graphqueryable.js */ "+t9t");
/* harmony import */ var _consistency_level_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./consistency-level.js */ "USGv");




/**
 * Configures a collection query to returned paged results
 *
 * @param col Collection forming the basis of the paged collection, this param is NOT modified
 * @returns A duplicate collection which will return paged results
 */
function AsPaged(col, supportsCount = false) {
    const q = Object(_graphqueryable_js__WEBPACK_IMPORTED_MODULE_2__["GraphQueryableCollection"])(col).using(Paged(supportsCount), Object(_consistency_level_js__WEBPACK_IMPORTED_MODULE_3__["ConsistencyLevel"])());
    const queryParams = ["$search", "$top", "$select", "$expand", "$filter", "$orderby"];
    if (supportsCount) {
        // we might be constructing our query with a next url that will already contain $count so we need
        // to ensure we don't add it again, likewise if it is already in our query collection we don't add it again
        if (!q.query.has("$count") && !/\$count=true/i.test(q.toUrl())) {
            q.query.set("$count", "true");
        }
        queryParams.push("$count");
    }
    for (let i = 0; i < queryParams.length; i++) {
        const param = col.query.get(queryParams[i]);
        if (Object(_pnp_core__WEBPACK_IMPORTED_MODULE_0__["objectDefinedNotNull"])(param)) {
            q.query.set(queryParams[i], param);
        }
    }
    return q;
}
/**
 * Behavior that converts results to pages when used with a collection (exposed through the paged method of GraphCollection)
 *
 * @returns A TimelinePipe used to configure the queryable
 */
function Paged(supportsCount = false) {
    return (instance) => {
        instance.on.parse.replace(_pnp_queryable__WEBPACK_IMPORTED_MODULE_1__["errorCheck"]);
        instance.on.parse(async (url, response, result) => {
            const txt = await response.text();
            const json = txt.replace(/\s/ig, "").length > 0 ? JSON.parse(txt) : {};
            const nextLink = json["@odata.nextLink"];
            const count = supportsCount && Object(_pnp_core__WEBPACK_IMPORTED_MODULE_0__["hOP"])(json, "@odata.count") ? parseInt(json["@odata.count"], 10) : 0;
            const hasNext = !Object(_pnp_core__WEBPACK_IMPORTED_MODULE_0__["stringIsNullOrEmpty"])(nextLink);
            result = {
                count,
                hasNext,
                next: () => (hasNext ? AsPaged(Object(_graphqueryable_js__WEBPACK_IMPORTED_MODULE_2__["GraphQueryableCollection"])([instance, nextLink]), supportsCount)() : null),
                value: Object(_pnp_queryable__WEBPACK_IMPORTED_MODULE_1__["parseODataJSON"])(json),
            };
            return [url, response, result];
        });
        return instance;
    };
}
//# sourceMappingURL=paged.js.map

/***/ }),

/***/ "udT0":
/*!**********************************************************!*\
  !*** ./node_modules/@pnp/queryable/behaviors/parsers.js ***!
  \**********************************************************/
/*! exports provided: DefaultParse, TextParse, BlobParse, JSONParse, BufferParse, HeaderParse, JSONHeaderParse, errorCheck, parseODataJSON, parseBinderWithErrorCheck, HttpRequestError */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DefaultParse", function() { return DefaultParse; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TextParse", function() { return TextParse; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BlobParse", function() { return BlobParse; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "JSONParse", function() { return JSONParse; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BufferParse", function() { return BufferParse; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HeaderParse", function() { return HeaderParse; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "JSONHeaderParse", function() { return JSONHeaderParse; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "errorCheck", function() { return errorCheck; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parseODataJSON", function() { return parseODataJSON; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parseBinderWithErrorCheck", function() { return parseBinderWithErrorCheck; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HttpRequestError", function() { return HttpRequestError; });
/* harmony import */ var _pnp_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @pnp/core */ "JC1J");


function DefaultParse() {
    return parseBinderWithErrorCheck(async (response) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if ((response.headers.has("Content-Length") && parseFloat(response.headers.get("Content-Length")) === 0) || response.status === 204) {
            return {};
        }
        // patch to handle cases of 200 response with no or whitespace only bodies (#487 & #545)
        const txt = await response.text();
        const json = txt.replace(/\s/ig, "").length > 0 ? JSON.parse(txt) : {};
        return parseODataJSON(json);
    });
}
function TextParse() {
    return parseBinderWithErrorCheck(r => r.text());
}
function BlobParse() {
    return parseBinderWithErrorCheck(r => r.blob());
}
function JSONParse() {
    return parseBinderWithErrorCheck(r => r.json());
}
function BufferParse() {
    return parseBinderWithErrorCheck(r => Object(_pnp_core__WEBPACK_IMPORTED_MODULE_0__["isFunc"])(r.arrayBuffer) ? r.arrayBuffer() : r.buffer());
}
function HeaderParse() {
    return parseBinderWithErrorCheck(async (r) => r.headers);
}
function JSONHeaderParse() {
    return parseBinderWithErrorCheck(async (response) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if ((response.headers.has("Content-Length") && parseFloat(response.headers.get("Content-Length")) === 0) || response.status === 204) {
            return {};
        }
        // patch to handle cases of 200 response with no or whitespace only bodies (#487 & #545)
        const txt = await response.text();
        const json = txt.replace(/\s/ig, "").length > 0 ? JSON.parse(txt) : {};
        const all = { data: { ...parseODataJSON(json) }, headers: { ...response.headers } };
        return all;
    });
}
async function errorCheck(url, response, result) {
    if (!response.ok) {
        throw await HttpRequestError.init(response);
    }
    return [url, response, result];
}
function parseODataJSON(json) {
    let result = json;
    if (Object(_pnp_core__WEBPACK_IMPORTED_MODULE_0__["hOP"])(json, "d")) {
        if (Object(_pnp_core__WEBPACK_IMPORTED_MODULE_0__["hOP"])(json.d, "results")) {
            result = json.d.results;
        }
        else {
            result = json.d;
        }
    }
    else if (Object(_pnp_core__WEBPACK_IMPORTED_MODULE_0__["hOP"])(json, "value")) {
        result = json.value;
    }
    return result;
}
/**
 * Provides a clean way to create new parse bindings without having to duplicate a lot of boilerplate
 * Includes errorCheck ahead of the supplied impl
 *
 * @param impl Method used to parse the response
 * @returns Queryable behavior binding function
 */
function parseBinderWithErrorCheck(impl) {
    return (instance) => {
        // we clear anything else registered for parse
        // add error check
        // add the impl function we are supplied
        instance.on.parse.replace(errorCheck);
        instance.on.parse(async (url, response, result) => {
            if (response.ok && typeof result === "undefined") {
                result = await impl(response);
            }
            return [url, response, result];
        });
        return instance;
    };
}
class HttpRequestError extends Error {
    constructor(message, response, status = response.status, statusText = response.statusText) {
        super(message);
        this.response = response;
        this.status = status;
        this.statusText = statusText;
        this.isHttpRequestError = true;
    }
    static async init(r) {
        const t = await r.clone().text();
        return new HttpRequestError(`Error making HttpClient request in queryable [${r.status}] ${r.statusText} ::> ${t}`, r);
    }
}
//# sourceMappingURL=parsers.js.map

/***/ }),

/***/ "upeu":
/*!*******************************************************!*\
  !*** ./node_modules/@pnp/graph/behaviors/defaults.js ***!
  \*******************************************************/
/*! exports provided: DefaultInit, DefaultHeaders */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DefaultInit", function() { return DefaultInit; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DefaultHeaders", function() { return DefaultHeaders; });
/* harmony import */ var _pnp_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @pnp/core */ "JC1J");
/* harmony import */ var _pnp_queryable__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @pnp/queryable */ "Ymo3");
/* harmony import */ var _telemetry_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./telemetry.js */ "zSku");



function DefaultInit(graphUrl = "https://graph.microsoft.com/v1.0") {
    return (instance) => {
        instance.using(Object(_telemetry_js__WEBPACK_IMPORTED_MODULE_2__["Telemetry"])(), Object(_pnp_queryable__WEBPACK_IMPORTED_MODULE_1__["RejectOnError"])(), Object(_pnp_queryable__WEBPACK_IMPORTED_MODULE_1__["ResolveOnData"])());
        instance.on.pre(async (url, init, result) => {
            init.cache = "default";
            init.credentials = "same-origin";
            if (!Object(_pnp_core__WEBPACK_IMPORTED_MODULE_0__["isUrlAbsolute"])(url)) {
                url = Object(_pnp_core__WEBPACK_IMPORTED_MODULE_0__["combine"])(graphUrl, url);
            }
            return [url, init, result];
        });
        return instance;
    };
}
function DefaultHeaders() {
    return (instance) => {
        instance
            .using(Object(_pnp_queryable__WEBPACK_IMPORTED_MODULE_1__["InjectHeaders"])({
            "Content-Type": "application/json",
        }));
        return instance;
    };
}
//# sourceMappingURL=defaults.js.map

/***/ }),

/***/ "wxtz":
/*!****************************************!*\
  !*** external "@microsoft/decorators" ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_wxtz__;

/***/ }),

/***/ "xfNx":
/*!***********************************************!*\
  !*** ./node_modules/@pnp/graph/operations.js ***!
  \***********************************************/
/*! exports provided: graphGet, graphPost, graphDelete, graphPatch, graphPut */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "graphGet", function() { return graphGet; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "graphPost", function() { return graphPost; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "graphDelete", function() { return graphDelete; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "graphPatch", function() { return graphPatch; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "graphPut", function() { return graphPut; });
/* harmony import */ var _pnp_queryable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @pnp/queryable */ "Ymo3");

const graphGet = (o, init) => {
    return Object(_pnp_queryable__WEBPACK_IMPORTED_MODULE_0__["op"])(o, _pnp_queryable__WEBPACK_IMPORTED_MODULE_0__["get"], init);
};
const graphPost = (o, init) => {
    return Object(_pnp_queryable__WEBPACK_IMPORTED_MODULE_0__["op"])(o, _pnp_queryable__WEBPACK_IMPORTED_MODULE_0__["post"], init);
};
const graphDelete = (o, init) => {
    return Object(_pnp_queryable__WEBPACK_IMPORTED_MODULE_0__["op"])(o, _pnp_queryable__WEBPACK_IMPORTED_MODULE_0__["del"], init);
};
const graphPatch = (o, init) => {
    return Object(_pnp_queryable__WEBPACK_IMPORTED_MODULE_0__["op"])(o, _pnp_queryable__WEBPACK_IMPORTED_MODULE_0__["patch"], init);
};
const graphPut = (o, init) => {
    return Object(_pnp_queryable__WEBPACK_IMPORTED_MODULE_0__["op"])(o, _pnp_queryable__WEBPACK_IMPORTED_MODULE_0__["put"], init);
};
//# sourceMappingURL=operations.js.map

/***/ }),

/***/ "yLpj":
/*!***********************************!*\
  !*** (webpack)/buildin/global.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || new Function("return this")();
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),

/***/ "zSku":
/*!********************************************************!*\
  !*** ./node_modules/@pnp/graph/behaviors/telemetry.js ***!
  \********************************************************/
/*! exports provided: Telemetry */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Telemetry", function() { return Telemetry; });
function Telemetry() {
    return (instance) => {
        instance.on.pre(async function (url, init, result) {
            init.headers = { ...init.headers, SdkVersion: "PnPCoreJS/3.16.0" };
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/dot-notation
            this.log(`Request Tag: ${init.headers["SdkVersion"]}`, 0);
            return [url, init, result];
        });
        return instance;
    };
}
//# sourceMappingURL=telemetry.js.map

/***/ }),

/***/ "zhiF":
/*!*********************************************************!*\
  !*** ./node_modules/@pnp/core/behaviors/assign-from.js ***!
  \*********************************************************/
/*! exports provided: AssignFrom */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AssignFrom", function() { return AssignFrom; });
/**
 * Behavior that will assign a ref to the source's observers and reset the instance's inheriting flag
 *
 * @param source The source instance from which we will assign the observers
 */
function AssignFrom(source) {
    return (instance) => {
        instance.observers = source.observers;
        instance._inheritingObservers = true;
        return instance;
    };
}
//# sourceMappingURL=assign-from.js.map

/***/ })

/******/ })});;
//# sourceMappingURL=teams-chat-embedded-application-customizer.js.map