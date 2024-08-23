/* global Handlebars */
import { TodoItem } from "../model/todo-item.js";
import { dataService, persistenceService, showDialog, spinner } from "./main-controller.js";
import { Deferred } from "../services/util.js";

const importanceLevels = [1, 2, 3, 4, 5];
let formTemplateCompiled = null;
let formData = null;
let deferred = null;

// Event Handlers
async function saveHandler() {
    if (validateForm()) {
        const data = getFormData();
        spinner.showModal();
        try {
            if (data.id) {  // Update
                const res = await persistenceService.update(data);
                dataService.update(res);
                deferred.resolve('updated successfully');
            } else {  // Add
                const res = await persistenceService.add(data);
                dataService.add(res);
                deferred.resolve('added successfully');
            }
        } catch {
            await showDialog({
                title: 'Error',
                icon: 'error',
                msg: 'Error saving data',
                btnOk: '',
                btnCancel: 'Close',
            })
        }
        spinner.close();
    } else {
        await showDialog({
            msg: 'Please fill in all required fields',
            title: 'Data is missing',
            icon: 'warning',
            btnOk: '',
            btnCancel: 'Close'
        })
    }
}

function cancelHandler() {
    if (isDirty()) {
        showDialog({
            msg: 'Discard changes and close?',
            title: 'Unsaved changes',
            icon: 'question',
            btnOk: 'Discard'
        }).then(() => {
            deferred.reject('user cancelled');
        })
    } else {
        deferred.reject('user cancelled');
    }
}

function deleteHandler() {
    const data = getFormData();
    showDialog({
        msg: `Are you sure you want to delete item "${data.name}"? \n⚠️ Caution: no undo!`,
        title: 'Delete item',
        icon: 'question',
        btnOk: 'Delete',
    }).then(() => {
        persistenceService.delete(data.id)
            .then(() => {
                dataService.delete(data.id);
                deferred.resolve('delete successful');
            })
            .catch(() => {
                showDialog({
                    title: 'Error',
                    icon: 'error',
                    msg: 'Error deleting data',
                    btnOk: '',
                    btnCancel: 'Close',
                })

            })

        }
    );
}

function addEventListeners() {
    document.querySelector('form').addEventListener('submit', ev => {
        ev.preventDefault();
    })
    document.querySelector('button[name="btnSave"]').addEventListener('click', saveHandler);
    document.querySelector('button[name="btnCancel"]').addEventListener('click', cancelHandler);
    document.querySelector('button[name="btnDelete"]').addEventListener('click', deleteHandler);
}

// Initialize
async function initForm() {
    initHandlebars();
    addEventListeners();
    renderForm();
}

function initHandlebars() {
    formTemplateCompiled = Handlebars.compile(document.querySelector('#form-template').innerHTML);
}

function getFormData() {
    const newData = { ...formData };
    newData.name = document.querySelector('input[name="name"]').value;
    newData.description = document.querySelector('textarea[name="description"]').value;
    newData.importance = +document.querySelector('input[name="importance"]').value;
    newData.dueDate = document.querySelector('input[name="dueDate"]').value;
    newData.completed = document.querySelector('input[name="completed"]').checked;
    return newData;
}

function isDirty() {
    const newData = getFormData();
    // eslint-disable-next-line no-restricted-syntax
    for (const key of Object.keys(newData)) {
        if (newData[key] !== formData[key]) return true;
    }
    return false;
}

function validateForm() {
    return document.querySelector('form').reportValidity();
}

// Render Form

async function show(id) {
    formData = dataService.getById(id) || new TodoItem();
    deferred = new Deferred();
    renderForm(formData);
    document.querySelector('button[name="btnDelete"]').classList.toggle('hidden', !id);
    return deferred.promise;
}

function renderForm(data) {
    document.querySelector('#form-parent').innerHTML = formTemplateCompiled(data, {data: {levels: importanceLevels}});
}

export { show, initForm };

