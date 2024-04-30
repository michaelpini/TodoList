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
    if (!Array.isArray(array) || !Object.hasOwn(array[0], prop)) return array;
    const arr = clone ? [...array] : array;
    arr.sort((a, b) => {
        if (a[prop] > b[prop]) return descending ? -1 : 1;
        if (a[prop] < b[prop]) return descending ? 1 : -1;
        return 0
    })
    return arr;
}

export { sortObjectArray };