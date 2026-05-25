const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const DB_FILE = path.join(__dirname, '..', '..', 'data', 'local_db.json');

let localDb = {
    Room: [],
    User: [],
    Problem: [],
    Team: [],
    Solution: []
};

// Ensure data directory exists
const dataDir = path.dirname(DB_FILE);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Load existing DB if present
function loadLocalDb() {
    try {
        if (fs.existsSync(DB_FILE)) {
            const data = fs.readFileSync(DB_FILE, 'utf8');
            const parsed = JSON.parse(data);
            localDb = { ...localDb, ...parsed };
            console.log('📦 Local fallback database loaded successfully from', DB_FILE);
        } else {
            console.log('📦 Local fallback database file not found, initializing fresh at', DB_FILE);
        }
    } catch (err) {
        console.error('❌ Failed to load local fallback DB:', err);
    }

    // Load seeded problems if empty
    if (localDb.Problem.length === 0) {
        try {
            const seededProblems = require('../seed/problemsData');
            localDb.Problem = seededProblems.map(p => ({
                _id: p.problemId || p.id || Math.random().toString(36).substring(2, 11),
                id: p.problemId || p.id,
                ...p
            }));
            console.log(`🌱 Seeded ${localDb.Problem.length} problems into local fallback database`);
            persistLocalDb();
        } catch (err) {
            console.error('❌ Failed to seed problems to local fallback DB:', err);
        }
    }
}

function persistLocalDb() {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(localDb, null, 2), 'utf8');
    } catch (err) {
        console.error('❌ Failed to persist local fallback DB:', err);
    }
}

// Load it immediately
loadLocalDb();

// Helper to determine if we should use fallback
function shouldFallback() {
    return mongoose.connection.readyState !== 1;
}

// Helper to project fields (e.g. .select('a b -c'))
function projectFields(item, fields) {
    if (!item) return item;
    const obj = typeof item.toObject === 'function' ? item.toObject() : { ...item };
    if (!fields) return obj;

    const fieldList = typeof fields === 'string' ? fields.trim().split(/\s+/) : [];
    if (fieldList.length === 0) return obj;

    const isExcluding = fieldList[0].startsWith('-');
    if (isExcluding) {
        const excludeKeys = fieldList.map(f => f.substring(1));
        for (const key of excludeKeys) {
            delete obj[key];
        }
    } else {
        const includeKeys = new Set(fieldList);
        const newObj = { _id: obj._id, id: obj.id }; // always keep id
        for (const key of includeKeys) {
            newObj[key] = obj[key];
        }
        return newObj;
    }
    return obj;
}

// Helper to compare items for sorting
function compareItems(a, b, sortOption) {
    let sortFields = [];
    if (typeof sortOption === 'string') {
        const fields = sortOption.trim().split(/\s+/);
        for (const f of fields) {
            if (f.startsWith('-')) {
                sortFields.push({ field: f.substring(1), direction: -1 });
            } else {
                sortFields.push({ field: f, direction: 1 });
            }
        }
    } else if (sortOption && typeof sortOption === 'object') {
        for (const [field, dir] of Object.entries(sortOption)) {
            const direction = (dir === -1 || dir === 'desc' || dir === 'descending') ? -1 : 1;
            sortFields.push({ field, direction });
        }
    }

    for (const { field, direction } of sortFields) {
        const valA = getNestedValue(a, field);
        const valB = getNestedValue(b, field);

        if (valA === valB) continue;
        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;

        if (valA < valB) return -1 * direction;
        if (valA > valB) return 1 * direction;
    }
    return 0;
}

function getNestedValue(obj, path) {
    if (!obj) return undefined;
    const parts = path.split('.');
    let current = obj;
    for (const part of parts) {
        if (current === undefined || current === null) return current;
        current = current[part];
    }
    return current;
}

function setNestedValue(obj, path, value) {
    const parts = path.split('.');
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current[part]) current[part] = {};
        current = current[part];
    }
    current[parts[parts.length - 1]] = value;
}

// Helper to check if item matches mongoose query
function matchItem(item, query) {
    if (!query || Object.keys(query).length === 0) return true;
    for (const [key, value] of Object.entries(query)) {
        const itemValue = getNestedValue(item, key);
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            if ('$in' in value) {
                if (!Array.isArray(value.$in)) continue;
                if (!value.$in.includes(itemValue)) return false;
            } else if ('$gte' in value) {
                if (itemValue < value.$gte) return false;
            } else if ('$lte' in value) {
                if (itemValue > value.$lte) return false;
            }
        } else {
            if (itemValue !== value) {
                // If it's ID comparison, compare strings
                if (itemValue && value && (itemValue.toString() === value.toString())) {
                    continue;
                }
                return false;
            }
        }
    }
    return true;
}

// Fallback Query Chain Simulation
class FallbackQuery {
    constructor(dataPromise) {
        this.dataPromise = Promise.resolve(dataPromise);
    }
    select(fields) {
        this.dataPromise = this.dataPromise.then(data => {
            if (Array.isArray(data)) {
                return data.map(item => projectFields(item, fields));
            } else if (data) {
                return projectFields(data, fields);
            }
            return data;
        });
        return this;
    }
    sort(sortOption) {
        this.dataPromise = this.dataPromise.then(data => {
            if (!Array.isArray(data)) return data;
            return [...data].sort((a, b) => compareItems(a, b, sortOption));
        });
        return this;
    }
    limit(limitNum) {
        this.dataPromise = this.dataPromise.then(data => {
            if (!Array.isArray(data)) return data;
            return data.slice(0, limitNum);
        });
        return this;
    }
    populate() {
        return this; // No-op, not strictly needed for MVP dashboard or problems
    }
    exec() {
        return this.dataPromise;
    }
    then(onResolve, onReject) {
        return this.dataPromise.then(onResolve, onReject);
    }
    catch(onReject) {
        return this.dataPromise.catch(onReject);
    }
}

// Wrap plain object to look like mongoose Document
function wrapDocument(doc, modelName) {
    if (!doc) return doc;
    if (doc.toObject) return doc;

    const wrapped = { ...doc };
    wrapped.toObject = function() {
        const copy = { ...this };
        delete copy.toObject;
        delete copy.save;
        return copy;
    };
    wrapped.save = async function() {
        const plain = this.toObject();
        if (!localDb[modelName]) localDb[modelName] = [];
        const index = localDb[modelName].findIndex(x => x._id.toString() === plain._id.toString());
        if (index >= 0) {
            localDb[modelName][index] = { ...localDb[modelName][index], ...plain, updatedAt: new Date() };
        } else {
            localDb[modelName].push(plain);
        }
        persistLocalDb();
        return this;
    };
    return wrapped;
}

function wrapDocuments(docs, modelName) {
    if (Array.isArray(docs)) {
        return docs.map(d => wrapDocument(d, modelName));
    }
    return wrapDocument(docs, modelName);
}

// Apply updates ($push, $set, etc.)
function applyUpdate(item, update) {
    if (!update) return;

    if (update.$push) {
        for (const [key, val] of Object.entries(update.$push)) {
            if (!item[key]) item[key] = [];
            if (val && typeof val === 'object' && val.$each) {
                item[key].push(...val.$each);
            } else {
                item[key].push(val);
            }
        }
    }

    if (update.$set) {
        for (const [key, val] of Object.entries(update.$set)) {
            setNestedValue(item, key, val);
        }
    }

    // Direct keys update
    for (const [key, val] of Object.entries(update)) {
        if (!key.startsWith('$')) {
            setNestedValue(item, key, val);
        }
    }
    item.updatedAt = new Date();
}

// Monkey patch mongoose.Model static methods
const originalFind = mongoose.Model.find;
const originalFindOne = mongoose.Model.findOne;
const originalFindById = mongoose.Model.findById;
const originalFindOneAndUpdate = mongoose.Model.findOneAndUpdate;
const originalFindByIdAndUpdate = mongoose.Model.findByIdAndUpdate;
const originalUpdateOne = mongoose.Model.updateOne;
const originalDeleteMany = mongoose.Model.deleteMany;
const originalCreate = mongoose.Model.create;
const originalSave = mongoose.Model.prototype.save;

mongoose.Model.find = function(query, projection, options) {
    if (!shouldFallback()) return originalFind.apply(this, arguments);
    const modelName = this.modelName;
    const items = localDb[modelName] || [];
    const matched = items.filter(item => matchItem(item, query));
    return new FallbackQuery(wrapDocuments(matched, modelName));
};

mongoose.Model.findOne = function(query, projection, options) {
    if (!shouldFallback()) return originalFindOne.apply(this, arguments);
    const modelName = this.modelName;
    const items = localDb[modelName] || [];
    const matched = items.find(item => matchItem(item, query));
    return new FallbackQuery(wrapDocument(matched, modelName));
};

mongoose.Model.findById = function(id, projection, options) {
    if (!shouldFallback()) return originalFindById.apply(this, arguments);
    const modelName = this.modelName;
    const items = localDb[modelName] || [];
    const matched = items.find(item => item._id === id || item._id.toString() === id.toString() || item.id === id);
    return new FallbackQuery(wrapDocument(matched, modelName));
};

mongoose.Model.findOneAndUpdate = function(query, update, options) {
    if (!shouldFallback()) return originalFindOneAndUpdate.apply(this, arguments);
    const modelName = this.modelName;
    if (!localDb[modelName]) localDb[modelName] = [];
    let item = localDb[modelName].find(item => matchItem(item, query));

    if (!item && options && options.upsert) {
        item = {
            _id: (query && query._id) || Math.random().toString(36).substring(2, 11),
            createdAt: new Date(),
            ...query
        };
        localDb[modelName].push(item);
    }

    if (item) {
        applyUpdate(item, update);
        persistLocalDb();
    }
    return new FallbackQuery(wrapDocument(item, modelName));
};

mongoose.Model.findByIdAndUpdate = function(id, update, options) {
    if (!shouldFallback()) return originalFindByIdAndUpdate.apply(this, arguments);
    const modelName = this.modelName;
    const items = localDb[modelName] || [];
    const item = items.find(item => item._id === id || item._id.toString() === id.toString() || item.id === id);

    if (item) {
        applyUpdate(item, update);
        persistLocalDb();
    }
    return new FallbackQuery(wrapDocument(item, modelName));
};

mongoose.Model.updateOne = function(query, update, options) {
    if (!shouldFallback()) return originalUpdateOne.apply(this, arguments);
    const modelName = this.modelName;
    const items = localDb[modelName] || [];
    const item = items.find(item => matchItem(item, query));

    if (item) {
        applyUpdate(item, update);
        persistLocalDb();
    }
    return new FallbackQuery({ n: item ? 1 : 0, nModified: item ? 1 : 0, ok: 1 });
};

mongoose.Model.deleteMany = function(query, options) {
    if (!shouldFallback()) return originalDeleteMany.apply(this, arguments);
    const modelName = this.modelName;
    const items = localDb[modelName] || [];
    const initialCount = items.length;
    localDb[modelName] = items.filter(item => !matchItem(item, query));
    persistLocalDb();
    const deletedCount = initialCount - localDb[modelName].length;
    return new FallbackQuery({ deletedCount, ok: 1 });
};

mongoose.Model.create = async function(doc, options) {
    if (!shouldFallback()) return originalCreate.apply(this, arguments);
    const modelName = this.modelName;
    if (!localDb[modelName]) localDb[modelName] = [];

    const docs = Array.isArray(doc) ? doc : [doc];
    const createdDocs = [];

    for (const d of docs) {
        const item = {
            _id: d._id || Math.random().toString(36).substring(2, 11),
            createdAt: new Date(),
            updatedAt: new Date(),
            ...d
        };
        localDb[modelName].push(item);
        createdDocs.push(wrapDocument(item, modelName));
    }
    persistLocalDb();
    return Array.isArray(doc) ? createdDocs : createdDocs[0];
};

mongoose.Model.prototype.save = async function(options) {
    if (!shouldFallback()) return originalSave.apply(this, arguments);
    const modelName = this.constructor.modelName;
    if (!localDb[modelName]) localDb[modelName] = [];

    const plain = this.toObject ? this.toObject() : this;
    if (!plain._id) {
        plain._id = Math.random().toString(36).substring(2, 11);
    }

    const index = localDb[modelName].findIndex(x => x._id.toString() === plain._id.toString());
    if (index >= 0) {
        localDb[modelName][index] = { ...localDb[modelName][index], ...plain, updatedAt: new Date() };
    } else {
        plain.createdAt = plain.createdAt || new Date();
        plain.updatedAt = new Date();
        localDb[modelName].push(plain);
    }
    persistLocalDb();
    return this;
};

module.exports = {
    loadLocalDb,
    persistLocalDb,
    shouldFallback
};
