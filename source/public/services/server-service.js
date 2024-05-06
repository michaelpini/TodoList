import TodoItem from "../scripts/model.js";

const rappi = 
`Rapperswil Castle (Swiss German: Schloss Rapperswil) is a castle, built in the early 13th century by the House of Rapperswil, in the formerly independent city of Rapperswil.
The castle is located on the eastern Zürichsee's western Obersee lakeshore in Rapperswil, a locality of the Rapperswil-Jona municipality in Switzerland's canton of St. Gallen.
Since 1870 the castle has been home to the Polish National Museum established by Polish émigrés, including the castle's lessee and restorer, Count Wladyslaw Broel-Plater. Schloss Rapperswil and the Museum are listed in the Swiss inventory of cultural property of national and regional significance as Class A objects of national importance.`

async function loadFakeData() {
    return new Promise((resolve) => {
        window.setTimeout(() => {
            const arr = [];
            arr.push(new TodoItem('Food Shopping', 'Get groceries for the weekend', '2024-04-23', 5, true, crypto.randomUUID()));
            arr.push(new TodoItem('Pay Taxes', 'Get bank statements and make declaration', '', '', false, crypto.randomUUID()));
            arr.push(new TodoItem('Visit Rapperswil', rappi, '2024-04-29', 2, false, crypto.randomUUID()));
            resolve(arr);
        }, 1000)
    })
}

async function saveFakeData(item) {
    return new Promise((resolve) => {
        const result = {...item};
        if (!result.id) result.id = crypto.randomUUID();
        setTimeout(() => resolve(result), 1000)
    })
}

class ServerService {
    static getList() {
        return loadFakeData();
        // todo: implement server get for complete list
    }

    static getItem(id) {
        // todo: implement server get for the supplied id
    }

    static saveItem(item) {
        return saveFakeData(item);
        // todo: implement the the server post for saving new item (id = null)
        // no id -> add item
        // valid id -> edit item
        // retrun added / updated item
    }
}

export default ServerService;


