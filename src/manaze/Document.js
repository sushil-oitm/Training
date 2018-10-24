import { observable, isObservableArray, toJS } from "mobx";

    let  computeInternally=()=>({})
    let  getNestedFields=()=>({})
    let  getChangesFromMergedData=()=>({})
    let  getSubModels=()=>({})
    let  getNestedComputations=()=>({})
    let  getComputations=()=>({})
    let  getFieldType=()=>({})


const isSubModel = fieldSchema => {
    return fieldSchema && Array.isArray(fieldSchema) && fieldSchema.length && fieldSchema[0]._isSubModel;
};

const getNestedIndex = (data, _id) => {
    if (!data || !data.length) {
        return -1;
    }
    for (var index = 0; index < data.length; index++) {
        if (data[index]._id == _id) {
            return index;
        }
    }
};

const getNestedFieldsUsedInDocuments = (doc, nestedFields) => {
    if (!nestedFields || !Object.keys(nestedFields).length) {
        return null;
    }
    let requiredNestedFields = {};
    for (var k in nestedFields) {
        if (doc[k] !== undefined) {
            requiredNestedFields = requiredNestedFields || {};
        }
        requiredNestedFields[k] = 1;
    }
    return requiredNestedFields;
};

const getMatchingArrayChange = (changes, requireIndex) => {
    for (var index = 0; index < changes.length; index++) {
        if (changes[index].index == requireIndex) {
            return changes[index];
        }
    }
};

class Document {
    constructor(model = {}, { _isNew, _parent, _db, _find, _dbConnect, _computations, _user, _autoSave } = {}) {
        this._isNew = _isNew;
        this._db = _db;
        this._find = _find;
        this._dbConnect = _dbConnect;
        this._model = model;
        this._user = _user;
        this._parent = _parent;
        this._computations = _computations;
        this._autoSave = _autoSave;

        this._updates = {};
        this._allChangeFields = {};
        this._allAffectedComputations = {};
        this._reactionsToRun = [];
        this._saving = observable(false);
    }

    setDoc = doc => {
        this._values = observable.object(doc);

        this._defineExtraProps(this._values);
        if (this._isNew) {
            const changes = {};
            for (var k in doc) {
                const v = doc[k];
                if (v !== undefined) {
                    changes[k] = 1;
                }
            }
            this._compute(this._values, changes);
        }
    };

    mergeChangeFields = (data, nestedFields, computedValues) => {
        let { data: mergedData, changeFields, allAffectedComputations } = computedValues;
        Object.assign(this._allAffectedComputations, allAffectedComputations);
        if (changeFields) {
            let allChangeFields = this._allChangeFields;
            for (var k in changeFields) {
                let valueToMerge = mergedData[k];
                let isNestedField = nestedFields && nestedFields[k];

                if (isNestedField) {
                    let changeFieldInfo = changeFields[k];
                    let nestedFieldModel = getFieldModel(this._model._schema, k);
                    const { changes, remove, override } = changeFieldInfo;
                    if (override) {
                        let docValue = populateSubModelDocs(
                            k,
                            valueToMerge,
                            nestedFieldModel,
                            {
                                _dbConnect: this._dbConnect,
                                _find: this._find,
                                _user: this._user
                            },
                            data
                        );
                        data[k] = docValue;
                        allChangeFields[k] = changeFieldInfo;
                    } else if (changes) {
                        allChangeFields[k] = allChangeFields[k] || {};
                        allChangeFields[k].changes = allChangeFields[k].changes || [];

                        changes.forEach(change => {
                            const { op, fields, index } = change;
                            const currentDoc = data[k][index];
                            const modifiedDoc = valueToMerge[index];

                            let matchedArrayChange = getMatchingArrayChange(allChangeFields[k].changes, index);
                            if (!matchedArrayChange) {
                                const isNewDoc = currentDoc._id.indexOf("new_") >= 0;
                                matchedArrayChange = { fields: {}, index: index, op: isNewDoc ? "insert" : "update" };
                                allChangeFields[k].changes.push(matchedArrayChange);
                            }
                            for (var obj in fields) {
                                currentDoc[obj] = modifiedDoc[obj];
                                matchedArrayChange.fields[obj] = 1;
                            }
                        });
                    }
                } else {
                    data[k] = valueToMerge;
                    allChangeFields[k] = 1;
                }
            }
        }
    };

    _compute(values, changeFields, ignoreComputations) {
        console.log(
            "***************compute called*************changeFields",
            changeFields,
            ">>>ignoreComputations>>>>",
            ignoreComputations
        );
        let model = this._model;

        const computations = getComputations(this._computations || model["_computations"], "default");
        const schema = model["_schema"];
        const relations = model["_relations"];

        const nestedComputations = getNestedComputations(model["_nestedComputations"], "default");
        const nestedFields = getNestedFields(relations, getSubModels(schema));

        if (computations || nestedComputations) {
            const _compute = computeInternally(
                computations,
                nestedFields,
                nestedComputations,
                this._find,
                ignoreComputations
            );

            const dataForComputations = toJS(values);
            if (this._parent) {
                dataForComputations["_parent"] = this._parent().data;
            }

            const computedValues = this._dbConnect(_compute, {
                user: this._user,
                data: dataForComputations,
                changeFields
            });
            this._allChangeFields = this._allChangeFields || {};

            if (computedValues instanceof Promise) {
                computedValues
                    .then(_computedValues => {
                        this.mergeChangeFields(values, nestedFields, _computedValues);
                    })
                    .catch(e => {
                        console.log("Error>>>>>>>>", e);
                        throw e;
                    });
            } else {
                this.mergeChangeFields(values, nestedFields, computedValues);
            }
            return computedValues;
        } else {
            this._allChangeFields = this._allChangeFields || {};
            for (var k in changeFields) {
                this._allChangeFields[k] = 1;
            }
        }
    }

    _getObservableValue() {
        return this._values;
    }

    _getValue(field) {
        return this._values[field];
    }

    setValue = (field, value) => {
        const oldValue = this._values[field];
        this._values[field] = value;
        let computeResult = this._compute(this._values, { [field]: 1 });
        if (computeResult instanceof Promise) {
            return computeResult.then(_result => {
                if (this._autoSave) {
                    this._values.save();
                }
                return _result;
            });
        } else {
            if (this._autoSave) {
                this._values.save();
            }
            return computeResult;
        }
    };

    isNew = () => {
        return this._isNew;
    };

    _isNullOrUndefined(value) {
        return value === undefined || value === null;
    }

    _update(field, value, oldValue) {
        const fieldSchema = this._model._schema[field];

        const relations = this._model["_relations"];

        if (!isSubModel(fieldSchema) && (!relations || !relations[field])) {
            this._updates[field] = value;
        }
    }

    _defineExtraProps(values) {
        Object.defineProperty(values, "_doc", {
            enumerable: false,
            write: false,
            value: this
        });

        Object.defineProperty(values, "save", {
            enumerable: false,
            write: false,
            value: this.save
        });
        Object.defineProperty(values, "_getUpdates", {
            enumerable: false,
            write: false,
            value: this._getUpdates
        });
        Object.defineProperty(values, "isSaving", {
            enumerable: false,
            write: true,
            value: this.isSaving
        });

        Object.defineProperty(values, "create", {
            enumerable: false,
            write: false,
            value: this.create
        });

        Object.defineProperty(values, "addDoc", {
            enumerable: false,
            write: false,
            value: this.addDoc
        });

        Object.defineProperty(values, "setValue", {
            enumerable: false,
            write: false,
            value: this.setValue
        });

        Object.defineProperty(values, "isNew", {
            enumerable: false,
            write: false,
            value: this.isNew
        });
    }

    updateId(doc, _updateMappings) {
        doc._setUpdates({});
        let values = doc._getObservableValue();
        if (doc._isNew && _updateMappings && _updateMappings.self) {
            values._id = _updateMappings.self._id;
            doc._isNew = false;
        }

        if (_updateMappings && _updateMappings.nestedFields) {
            const nestedFields = _updateMappings.nestedFields;
            for (var k in nestedFields) {
                let fieldValue = values[k];
                if (fieldValue) {
                    let mappingValues = nestedFields[k];
                    mappingValues.forEach(nestedMappings => {
                        const { old_id, _id } = nestedMappings;
                        if (old_id) {
                            if (isObservableArray(fieldValue)) {
                                const matched = fieldValue.find(dataField => dataField._id === old_id);
                                if (matched) {
                                    matched._id = _id;
                                }
                            }
                        }
                    });
                }
                //it should be an array
            }
        }
    }

    isSaving = () => {
        return this._saving.get();
    };

    setSaving = saving => {
        this._saving.set(saving);
    };

    save = callback => {
        if (callback) {
            if (this._runningReaction) {
                this._addReactionCallback(() => {
                    callback(this._getUpdates());
                });
            } else {
                callback(this._getUpdates());
            }
            return;
        }

        const updates = this._getUpdates();
        if (this._parent) {
            //push its changes into main
            const { doc: parentDoc, value } = this._parent();
            const nestedDoc = toJS(this._getObservableValue());
            delete nestedDoc["_parent"];
            const { changes, computedIds } = this._getUpdates();
            parentDoc.addDoc(value, nestedDoc, changes, computedIds);
            return;
        }

        this.setSaving(true);
        if (!updates || !updates._updates) {
            throw new Error("No updates found for saving....");
        }
        const _updates = updates._updates;
        console.log("_updates>>>", _updates);
        if (_updates.insert && Object.keys(_updates.insert).length == 0) {
            throw new Error(`Insert can not be empty >>>> ${JSON.stringify(_updates)}`);
        } else if (_updates.update) {
            const updateOp = _updates.update;
            if (!updateOp.changes || Object.keys(updateOp.changes).length == 0 || !updateOp._id) {
                throw new Error(`Invalid Update op >>>> ${JSON.stringify(_updates)} >>> must contain changes and _id`);
            }
        }
        return this._db
            .save(updates, this._model)
            .then(({ result, mappings }) => {
                this.updateId(this, mappings);
                this._allChangeFields = {};
                this.setSaving(false);
                return result;
            })
            .catch(e => {
                console.error(e.message);
                this.setSaving(false);
            });
    };

    _setUpdates(_updates) {
        this._updates = _updates;
    }

    _getUpdates = () => {
        const schema = this._model["_schema"];
        const relations = this._model["_relations"];
        const nestedFields = getNestedFields(relations, getSubModels(schema));

        console.log("this._allChangeFields>>>>>", this._allChangeFields);

        const _updates = getChangesFromMergedData(toJS(this._values), this._allChangeFields, null, nestedFields, relations);
        const { selfChanges, subModelChanges, relationChanges } = _updates;
        let modifiedUpdates = { ...selfChanges, ...subModelChanges, ...relationChanges };

        let _isNew = this._isNew;
        const _id = this._values._id;
        if (_isNew) {
            modifiedUpdates._id = _id;
            modifiedUpdates = { insert: modifiedUpdates };
        } else {
            modifiedUpdates = { update: { changes: modifiedUpdates, _id: _id } };
        }

        return { _updates: modifiedUpdates, changes: this._allChangeFields, computedIds: this._allAffectedComputations };
    };

    addDoc = (field, doc, changes, allAffectedComputations) => {
        var fieldValue = this._getObservableValue()[field];
        if (fieldValue) {
            let findValue = fieldValue.find(row => row._id === doc._id);
            if (findValue) {
                for (var k in doc) {
                    if (findValue[k] != doc[k]) {
                        findValue[k] = doc[k];
                    }
                }
            } else {
                fieldValue.push(doc);
            }
        } else {
            fieldValue = [doc];
            this._getObservableValue()[field] = fieldValue;
        }
        if (changes) {
            //get index
            const nestedIndex = getNestedIndex(fieldValue, doc._id);
            const nestedChanges = {
                [field]: {
                    changes: [
                        { fields: changes, index: nestedIndex, op: doc._id && doc._id.indexOf("new_") >= 0 ? "insert" : "update" }
                    ]
                }
            };

            const nestedAffectedComputations = {};
            for (var obj in allAffectedComputations) {
                nestedAffectedComputations[`_${field}_${obj}_`] = 1;
            }
            this._compute(this._getObservableValue(), nestedChanges, nestedAffectedComputations);
        }
    };

    create = (field, doc = {}, add = false) => {
        let schema = this._model._schema;
        const fieldSchema = schema[field];
        if (!fieldSchema || !Array.isArray(fieldSchema)) {
            throw new Error(`Please Provide a array/relation field for create nested doc. Provided field is >>[${field}]`);
        }
        const fieldModel = getFieldModel(schema, field);
        const nestedComputations = this._model["_nestedComputations"];
        const fieldNestedComputations = nestedComputations ? nestedComputations[field] : null;

        const _values = toJS(this._getObservableValue());
        const fieldValue = _values[field];
        delete _values[field];

        let nestedId = fieldValue && doc._id && fieldValue.find(d => d._id == doc._id);
        let nestedDocProps = {
            _isNew: nestedId ? false : true,
            _dbConnect: this._dbConnect,
            _find: this._find,
            _user: this._user,
            _parent: () => ({
                doc: this,
                value: field,
                data: _values
            }),
            _computations: fieldNestedComputations
        };
        const nestedDoc = getDoc(doc, fieldModel, nestedDocProps);
        if (add) {
            this.addDoc(field, nestedDoc);
        }
        return nestedDoc;
    };
}

export const populateSubModelDocs = (fieldKey, data, model, docProps, parentDoc) => {
    return data.map(row => {
        let subModelDocProps = {
            ...docProps,
            _autoSave: true,
            _parent: () => ({
                doc: parentDoc,
                value: fieldKey
            })
        };
        return getDoc(row, model, subModelDocProps);
    });
};

export const populateDocs = (data, model, docProps) => {
    if (!data) {
        return;
    }
    if (Array.isArray(data)) {
        return data.map(row => getDoc(row, model, docProps));
    } else {
        return getDoc(data, model, docProps);
    }
};

export const getDoc = (row, model, docProps = {}) => {
    var observableData = {};
    var doc = new Document(model, docProps);
    const schema = model._schema;
    const relations = model._relations;

    schema &&
    Object.keys(schema).forEach(fieldKey => {
        const fieldInfo = schema[fieldKey];
        let fieldValue = row[fieldKey];
        var resolvedValue = null;
        if (fieldInfo === "date") {
            if (fieldValue && !(fieldValue instanceof Date)) {
                fieldValue = new Date(fieldValue);
            }
            resolvedValue = fieldValue;
        } else if (fieldValue && (isSubModel(fieldInfo) || (relations && relations[fieldKey]))) {
            const arrayModel = getFieldModel(schema, fieldKey);
            resolvedValue = populateSubModelDocs(fieldKey, fieldValue, arrayModel, docProps, doc);
        } else {
            resolvedValue = fieldValue;
        }
        observableData[fieldKey] = resolvedValue;
    });
    if (docProps._isNew && !observableData._id) {
        var uniqueId = new Date().getTime();
        observableData._id = `new_${uniqueId}`;
    }
    doc.setDoc(observableData);
    return doc._getObservableValue();
};

const getFieldModel = (schema, field) => {
    let model = getFieldType(schema, field);
    if (!model._isModel) {
        throw new Error(`Expected field should be a model but not found field is ${field}`);
    }
    return model;
};
