const urlBase = "http://localhost:8080/";
const urlGetAll = `${urlBase}get/`;
const urlGetById = `${urlBase}get/id:?`;
const urlSave = `${urlBase}save/`;
const urlDelete = `${urlBase}delete/id:?`;

class ServerService {
    static async getAll() {
        try {
            const response = await fetch(urlGetAll);
            const data = await response.json();
            return data;
        }
        catch (error) {
            alert('Error loading list from server');
            return false;
        }
    }

    static async getById(id) {
        try {
            const response = await fetch(urlGetById.replace('id:?', id));
            const data = await response.json();
            return data;
        }
        catch (error) {
            alert('Error loading item from server');
            return false;
        }
    }

    static async save(item) {
        // no id -> add item
        // valid id -> edit item
        // return added / updated item
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(item)
        }
        try {
            const response = await fetch(urlSave, options);
            const data = await response.json();
            return data;  // Expecting saved item as json object
        }
        catch (error) {
            alert('Error saving item to server');
            return false;
        }
    }

    static async delete(id) {
        try {
            const response = await fetch(urlDelete.replace('id:?', id));
            const data = await response.json();
            return data;
        }
        catch (error) {
            alert('Error deleting item from server');
            return false;
        }

    }
}

export default ServerService;


