/**
 * **Sorts an array of objects by a property / key**
 * @param array {object[]} array of objects to be sorted
 * @param prop {string} property / key name to sort by
 * @param descending {boolean} indicates whether to sort in descending order - default ascending
 * @param clone {boolean} indicates whether to return a copy of the array - default returns original
 * @returns {object[]|*}
 * @example Sorts arr by name in ascending order (***modifies the original array*** and returns it)
 * const arr = [
 *     {name: 'John Doe', age: 23},
 *     {name: 'Jane Doe', age: 45},
 * ]
 * sortObjectArray(arr, 'name');
 * @example Returns a ***copy of the original array***, sorted by age in descending order
 * const sortedCopy = sortObjectArray(arr, 'age', true, true);
 */
function sortObjectArray(array, prop, descending = false, clone = false) {
    if (!Array.isArray(array) || !array.length || !Object.hasOwn(array[0], prop)) return array;
    const arr = clone ? [...array] : array;
    arr.sort((a, b) => {
        if (a[prop] > b[prop]) return descending ? -1 : 1;
        if (a[prop] < b[prop]) return descending ? 1 : -1;
        return 0
    })
    return arr;
}

/**
 * Returns a random id as UUID 8-4-4-4-12
 * - Uses ``crypto.randomUUID()`` in secure environments and if supported by browser.
 * - Uses ``crypto.getRandomValues()`` otherwise to construct a UUID
 * @example
 * const id = getRandomId();  // "895964fc-31d6-2daf-7603-4f651a90200d"
 * @returns {string}
 */
function getRandomId() {
    try {
        return crypto.randomUUID();
    }
    catch (error) {
        let [a, b, c, d, e] = crypto.getRandomValues(new BigUint64Array(5));
        a = a.toString(16).slice(-8);
        b = b.toString(16).slice(-4);
        c = c.toString(16).slice(-4);
        d = d.toString(16).slice(-4);
        e = e.toString(16).slice(-12);
        return `${a}-${b}-${c}-${d}-${e}`
    }
}

/**
 * Saves an object as json to a file. The file is downloaded by the browser to the default download location.
 * @param obj {object} The object to save
 * @param filename {string} filename (without .json, will be added)
 * @example
 * const data = [ { name: Michael, age: 56 } ];
 * saveToFile(data, 'membersList');
 * // %userprofile%\downloads\membersList.json
 */
function saveToFile (obj, filename) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], {
        type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * creates a deferred object containing a promise, which can be resolved or rejected
 * @example:
 * const deferred = new Deferred();
 *
 * async function wait() {
 *     console.log('waiting...');
 *     await deferred.promise;
 *     console.log('resolved!');
 * }
 * wait();
 * setTimeout(() => deferred.resolve(), 1000);
 */
class Deferred {
    promise;

    resolve;

    reject;

    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.reject = reject;
            this.resolve = resolve;
        });
    }
}

export { sortObjectArray, getRandomId, saveToFile, Deferred };
