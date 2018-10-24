import { observable, reaction, toJS, isObservable, observe } from "mobx";
import { getDoc, populateDocs } from "./Document";

const DbConnect = db => {
    return (fn, data) => {
        if (fn && fn._pipeline) {
            return fn.init(db, data);
        } else if (typeof fn == "function") {
            return fn(db, data);
        } else {
            return data;
        }
    };
};
export default class Dataset {
    constructor(model, query, db, props = {}, _find) {
        this.db = db;
        this.props = props;

        model = typeof model == "function" ? model() : model;
        this.model = model;

        let _only = query._only;
        if (query._limit === undefined || _only) {
            query = query.limit(_only ? 1 : 20);
        }
        this.query = query;
        this._find = _find;

        let { create, autoFetch } = props;
        let dataset = {
            data: null,
            loading: true
        };

        if (create) {
            dataset.data = getDoc({}, model, this.getDocProps({ _isNew: true }));
            dataset.loading = false;
        } else {
            dataset.data = this.getBlankData();
            autoFetch !== false && this.loadData();
        }
        this.dataset = observable(dataset);

        Object.defineProperty(this.dataset, "remove", {
            enumerable: false,
            write: false,
            value: this.removeData
        });

        Object.defineProperty(this.dataset, "_dataset", {
            enumerable: false,
            write: false,
            value: true
        });

        Object.defineProperty(this.dataset, "loadMoreData", {
            enumerable: false,
            write: false,
            value: this.loadMoreData
        });

        Object.defineProperty(this.dataset, "reloadData", {
            enumerable: false,
            write: false,
            value: this.reloadData
        });
    }

    observeDataParams(dataParams) {
        this.queryParams.params = this.queryParams.params || {};
        for (let paramKey in dataParams) {
            var paramValue = dataParams[paramKey];
            observe(paramValue, change => {
                this.queryParams.params[paramKey] = change.newValue;
                this.loadData(this.queryParams);
            });
            this.queryParams.params[paramKey] = paramValue.value;
        }
    }

    getBlankData() {
        return this.query._only /*|| (this.query.getFilters && this.query.getFilters())*/ ? {} : [];
    }

    getQueryParams() {
        let query = this.query;
        let paramValue = query._paramValue;
        return {
            id: query._id,
            limit: query._limit,
            relationValue: query._relationValue,
            paramValue: paramValue && typeof paramValue !== "function" ? paramValue : void 0
        };
    }

    getDocProps = (props = {}) => {
        return {
            ...props,
            _db: this.db,
            _dbConnect: DbConnect(this.db),
            _find: this._find,
            _user: this.db.user
        };
    };

    loadData() {
        let model = this.model;
        let queryParams = this.getQueryParams();
        this.db
            .find(model, queryParams)
            .then(({ result } = {}) => {
                let docs = populateDocs(result, model, this.getDocProps());
                this.dataset.data = docs;
                this.dataset.loading = false;
            })
            .catch(e => {
                alert(e.stack);
            });
    }

    reloadData = reloadQueryParams => {
        let model = this.model;
        let queryParams = this.getQueryParams();
        this.db
            .find(model, {
                ...queryParams,
                ...reloadQueryParams
            })
            .then(({ result } = {}) => {
                let docs = populateDocs(result, model, this.getDocProps());
                this.dataset.data = docs;
                this.dataset.loading = false;
            })
            .catch(e => {
                alert(e.stack);
            });
    };

    loadMoreData = () => {
        console.log("loadMoreData called....", this.hasNext);
        if (!this.hasNext || this.loadingMore) {
            return;
        }
        this.loadingMore = true;
        this.loading = true;
        let queryParams = this.queryParams;
        this.skip = (this.skip || 0) + this.limit;
        this.model[this.id]
            .data({
                ...queryParams,
                skip: this.skip,
                limit: this.limit
            })
            .then(data => {
                this.setHasNext(data);
                this.dataset.data = [...this.dataset.data, ...data];
                this.loadingMore = false;
            });
    };

    setHasNext(data) {
        this.hasNext = Array.isArray(data) && data.length === this.limit;
    }

    setData(data) {
        this.setHasNext(data);
        this.dataset.data = data;
    }

    removeData = () => {
        this.dataset.data = this.getBlankData();
    };
}
