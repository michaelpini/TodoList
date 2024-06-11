/* global Handlebars */
import { TodoItem } from "../model/todo-item.js";
import { dataService, persistenceService, spinner } from "./main-controller.js";
import { Deferred } from "../services/util.js";

let formTemplateCompiled = null;
let formData = null;
let deferred = null;
const importanceLevels = [1, 2, 3, 4, 5];

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
            alert("Error saving data");
        }
        spinner.close();
    } else {
        alert("Data is missing - please fill in all required fields");
    }
}

function cancelHandler() {
    if (!isDirty() || confirm('Discard changes and close?')) {
        deferred.reject('user cancelled');
    }
}

function deleteHandler() {
    const data = getFormData();
    if (confirm(`Are you sure you want to delete item "${data.name}"? \n⚠️ Caution: no undo!`)) {
        persistenceService.delete(data.id)
            .then(() => {
                dataService.delete(data.id);
                deferred.resolve('delete successful');
            })
            .catch(() => {
                alert("Error deleting data");
            })
    }
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
    formTemplateCompiled = Handlebars.compile(document.querySelector("#form-template").innerHTML);
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

// Render Form

async function show(id) {
    formData = dataService.getById(id) || new TodoItem();
    deferred = new Deferred();
    renderForm(formData);
    return deferred.promise;
}

function renderForm(data) {
    document.querySelector("#form-parent").innerHTML = formTemplateCompiled(data, {data: {levels: importanceLevels}});
}

export { show, initForm };

