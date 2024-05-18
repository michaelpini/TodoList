import LocalDbService from "../services/local-db.service.js";
import { sortObjectArray } from "../services/util.js";
import { displayOptions, initView, renderForm, renderList, setTheme, setView, spinner } from "./view.js";
import Data from "./model.js";
import TodoItem from "./todo-item.js";

let formData = null;

function sortFilter() {
    let data = Data.getAll();
    if (displayOptions.filterOpen) {
        data = data.filter(x => !x.completed);
    }
    sortObjectArray(data, displayOptions.sortBy, displayOptions.sortMode === 'desc');
    renderList(data);
}

function navBarHandler(ev) {
    if (ev.target.id === 'NewTask') showAddEditForm();
    if (ev.target.id === 'ToggleMode') setTheme('toggle');
}

function toolbarHandler(ev) {
    // SortBy button
    if (ev.target?.dataset?.sortBy) {
        if (displayOptions.sortBy === ev.target.dataset.sortBy) {
            displayOptions.sortMode = displayOptions.sortMode === 'asc' ? 'desc' : 'asc';
        } else {
            displayOptions.sortMode = ev.target.dataset.sortMode;
        }
        displayOptions.sortBy = ev.target.dataset.sortBy;
        sortFilter();
    }
    // FilterOpen button
    else if (ev.target?.dataset?.filterOpen) {
        displayOptions.filterOpen = !displayOptions.filterOpen;
        sortFilter();
    }
}

function editItemHandler(ev) {
    const id = ev.target?.dataset?.id;
    if (id) showAddEditForm(id);
}

function getFormData() {
    const newData = { ...formData };
    newData.name = document.querySelector("input[name=\"name\"]").value;
    newData.description = document.querySelector("textarea[name=\"description\"]").value;
    newData.importance = +document.querySelector("input[name=\"importance\"]").value;
    newData.dueDate = document.querySelector("input[name=\"dueDate\"]").value;
    newData.completed = document.querySelector("input[name=\"completed\"]").checked;
    return newData;
}

function isDirty() {
    const newData = getFormData();
    for (const key of Object.keys(newData)) {
        if (newData[key] !== formData[key]) return true;
    }
    return false;
}

function validateForm() {
    return document.querySelector('form').reportValidity();
}

function showAddEditForm(id) {
    formData = Data.getById(id) || new TodoItem();
    setView('form');
    renderForm(formData);
}

function saveHandler() {
    if (validateForm()) {
        const data = getFormData();
        spinner.showModal();
        LocalDbService.save(data)
            .then(response => {
                if (!Data.update(response)) Data.add(response);
                renderList(Data.getAll());
                setView('list');
            })
            .catch(() => {
                alert("Error saving data");
            })
            .finally(() => {
                spinner.close();
            });
    } else {
        alert("Data is missing - please fill in all required fields");
    }
}

function cancelHandler() {
    if (!isDirty() || confirm('Discard changes and close?')) {
        setView('list');
    }
}

function deleteHandler() {
    const data = getFormData();
    LocalDbService.delete(data.id).then(() => {
        Data.delete(data.id);
        renderList(Data.getAll());
        document.querySelector('#view-form').classList.add('hidden');
        document.querySelector('#view-list').classList.remove('hidden');
    })
        .catch(err => {
        alert("Error deleting data");
    })
}

async function loadListData() {
    spinner.showModal();
    const data = await LocalDbService.getAll();
    Data.setAll(data);
    renderList(data);
    spinner.close();
}

async function initialize() {
    await initView();
    await loadListData();
}

export { initialize,
    navBarHandler,
    toolbarHandler,
    editItemHandler,
    saveHandler,
    cancelHandler,
    deleteHandler,
};

