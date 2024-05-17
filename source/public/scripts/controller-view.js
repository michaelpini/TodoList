import DataService from "../services/data.service.js";
import localDbService from "../services/local-db.service.js";
import { sortObjectArray } from "../services/util.js";
import { getFormData, initHandlebars, isDirty, loadIcons, renderList, setTheme, showAddEditForm } from "./view.js";
import dataService from "../services/data.service.js";

const displayOptions = {
    show: 'list',
    sortBy: 'name',
    sortMode: 'asc',
    filterOpen: false,
    theme: 'light',
}
const spinner = document.querySelector('#spinner');

function sortFilter() {
    let data = DataService.getList();
    if (displayOptions.filterOpen) {
        data = data.filter(x => !x.completed);
    }
    sortObjectArray(data, displayOptions.sortBy, displayOptions.sortMode === 'desc');
    renderList(displayOptions, data);
}

function navBarHandler(ev) {
    if (ev.target.id === 'NewTask') showAddEditForm();
    if (ev.target.id === 'ToggleMode') setTheme(displayOptions, 'toggle');
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

function validateForm() {
    return document.querySelector('form').reportValidity();
}

function saveHandler() {
    if (validateForm()) {
        const data = getFormData();
        spinner.showModal();
        localDbService.save(data)
            .then(response => {
                if (!DataService.updateItem(response)) DataService.addItem(response);
                renderList(displayOptions, DataService.getList());
                document.querySelector("#view-form").classList.add("hidden");
                document.querySelector("#view-list").classList.remove("hidden");
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
        document.querySelector('#view-form').classList.add('hidden');
        document.querySelector('#view-list').classList.remove('hidden');
    }
}

function deleteHandler() {
    const data = getFormData();
    localDbService.delete(data.id).then(() => {
        dataService.deleteItem(data.id);
        renderList(displayOptions, DataService.getList());
        document.querySelector('#view-form').classList.add('hidden');
        document.querySelector('#view-list').classList.remove('hidden');
    })
        .catch(err => {
        alert("Error deleting data");
    })
}

function addEventListeners() {
    document.querySelector(".navbar").addEventListener('click', navBarHandler);
    document.querySelector("#toolbar-parent").addEventListener('click', toolbarHandler);
    document.querySelector('#list-parent').addEventListener('click', editItemHandler);
    document.querySelector('form').addEventListener('submit', ev => {
        ev.preventDefault();
    })
    document.querySelector('button[name="btnSave"]').addEventListener('click', saveHandler);
    document.querySelector('button[name="btnCancel"]').addEventListener('click', cancelHandler);
    document.querySelector('button[name="btnDelete"]').addEventListener('click', deleteHandler);
}

async function loadListData() {
    spinner.showModal();
    const data = await localDbService.getAll();
    DataService.setList(data);
    renderList(displayOptions, data);
    spinner.close();
}

async function initializeView() {
    await loadIcons();
    initHandlebars(displayOptions);
    setTheme(displayOptions);
    addEventListeners();
    renderList(displayOptions);
    await loadListData();
}

export default initializeView;

