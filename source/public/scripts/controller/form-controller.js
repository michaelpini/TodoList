/* global Handlebars */
import Data from "../model/data.js";
import TodoItem from "../model/todo-item.js";
import LocalDbService from "../services/local-db.service.js";
import { spinner } from "./main-controller.js";
import { Deferred } from "../services/util.js";

let formTemplateCompiled = null;
let formData = null;
let deferred = null;

// Event Handlers
function saveHandler() {
    if (validateForm()) {
        const data = getFormData();
        spinner.showModal();
        LocalDbService.save(data)
            .then(response => {
                if (!Data.update(response)) Data.add(response);
                deferred.resolve('saved successfully');
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
        deferred.reject('user cancelled');
    }
}

function deleteHandler() {
    const data = getFormData();
    if (confirm(`Are you sure you want to delete item "${data.name}"? \n⚠️ Caution: no undo!`)) {
        LocalDbService.delete(data.id)
            .then(() => {
                Data.delete(data.id);
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
    formData = Data.getById(id) || new TodoItem();
    deferred = new Deferred();
    renderForm(formData);
    return deferred.promise;
}

function renderForm(data) {
    document.querySelector("#form-parent").innerHTML = formTemplateCompiled(data);
}

export { show, initForm };

