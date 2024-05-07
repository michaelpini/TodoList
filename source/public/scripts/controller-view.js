/* global Handlebars */
import { DateTime } from "../ext-modules/luxon.js";
import DataService from "../services/data.service.js";
import ServerService from "../services/server.service.js";
import TodoItem from "./todo-item.model.js";
import { sortObjectArray } from "../services/util.js";

const displayOptions = {
    show: 'list',
    sortBy: 'name',
    sortMode: 'asc',
    filterOpen: false,
    theme: 'light',
}
const spinner = document.querySelector('#spinner');
let formData = null;



/* *********** VIEW ************* */
let navTemplateCompiled = null;
let listTemplateCompiled = null;
let formTemplateCompiled = null;

function initHandlebars() {
    Handlebars.registerHelper('formatDate', str => DateTime.fromISO(str).toRelativeCalendar());
    Handlebars.registerHelper('getClass', (baseClass, isActive) => `${baseClass}${isActive ? ' btn-active' : ''}`);
    Handlebars.registerHelper('sortBy', (by) => {
        if (displayOptions.sortBy === by) {
            if (displayOptions.sortMode === 'asc') {
                return `&nbsp;<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16" class="disabled">
                        <path d="M3.5 3.5a.5.5 0 0 0-1 0v8.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L3.5 12.293zm4 .5a.5.5 0 0 1 0-1h1a.5.5 0 0 1 0 1zm0 3a.5.5 0 0 1 0-1h3a.5.5 0 0 1 0 1zm0 3a.5.5 0 0 1 0-1h5a.5.5 0 0 1 0 1zM7 12.5a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 0-1h-7a.5.5 0 0 0-.5.5"/>
                        </svg>`
            } else {
                return `&nbsp;<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-sort-up" viewBox="0 0 16 16">
                        <path d="M3.5 12.5a.5.5 0 0 1-1 0V3.707L1.354 4.854a.5.5 0 1 1-.708-.708l2-1.999.007-.007a.5.5 0 0 1 .7.006l2 2a.5.5 0 1 1-.707.708L3.5 3.707zm3.5-9a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5M7.5 6a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1z"/>
                        </svg>`
            }
        }
        return '';
    });
    Handlebars.registerHelper('formatImportance', p => '&#10045;'.repeat(+p));
    Handlebars.registerHelper('addAttribute', (attr, condition) => condition ? attr : '');
    navTemplateCompiled = Handlebars.compile(document.querySelector('#nav-template').innerHTML);
    listTemplateCompiled = Handlebars.compile(document.querySelector('#list-template').innerHTML);
    formTemplateCompiled = Handlebars.compile(document.querySelector('#form-template').innerHTML);
}

/**
 * Sets the light or dark theme, depending on parameter p and stores the value in LocalStorage
 * @param p {string?: 'light' | 'dark' |'toggle'} optional light | dark | toggle
 * @example
 * setTheme()  // applies value in localStorage, otherwise sets browser preference
 * setTheme('toggle')   // Toggles between light and dark
 * setTheme('light')    // Sets specified theme ('light' or 'dark')
 */
function setTheme(p) {
    switch (p) {
        case 'light':
        case 'dark':
            displayOptions.theme = p;
            break;
        case 'toggle':
            displayOptions.theme = (displayOptions.theme === 'light') ? 'dark' : 'light';
            break;
        default:
            if (Object.hasOwn(localStorage, 'theme')) {
                displayOptions.theme = localStorage.getItem('theme');
            } else {
                displayOptions.theme = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
            }
    }
    document.documentElement.setAttribute('data-theme', displayOptions.theme);
    try {
        localStorage.setItem('theme', displayOptions.theme);
    } catch (err) {/* ignore */}
}

function renderList(data) {
    document.querySelector('#toolbar-parent').innerHTML = navTemplateCompiled(displayOptions);
    document.querySelector('#list-parent').innerHTML = listTemplateCompiled(data);
}

function renderForm(data) {
    document.querySelector('#form-parent').innerHTML = formTemplateCompiled(data);
}

function showAddEditForm(id) {
    document.querySelector('#view-list').classList.add('hidden')
    document.querySelector('#view-form').classList.remove('hidden');
    formData = DataService.getItem(id) || new TodoItem();
    renderForm(formData);
}


/* *********** CONTROLLER ************* */

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

function sortFilter() {
    let data = DataService.getList();
    if (displayOptions.filterOpen) {
        data = data.filter(x => !x.completed);
    }
    sortObjectArray(data, displayOptions.sortBy, displayOptions.sortMode === 'desc');
    renderList(data);
}

function getFormData() {
    const newData = {...formData};
    newData.name = document.querySelector('input[name="name"]').value;
    newData.description = document.querySelector('textarea[name="description"]').value;
    newData.importance = +document.querySelector('input[name="importance"]').value;
    newData.dueDate = document.querySelector('input[name="dueDate"]').value;
    newData.completed = document.querySelector('input[name="completed"]').checked;
    return newData;
}

function isDirty() {
    const newData = getFormData();
    for (let key of Object.keys(newData)) {
        if (newData[key] !== formData[key]) return true;
    }
    return false;
}

function saveHandler() {
    if (validateForm()) {
        const data= getFormData();
        ServerService.saveItem(data)
          .then(response => {
              if (!DataService.updateItem(response)) DataService.addItem(response);
              renderList(DataService.getList());
              document.querySelector('#view-form').classList.add('hidden');
              document.querySelector('#view-list').classList.remove('hidden');
          })
          .catch(() => {
              alert('Error saving data');
          })
    } else {
        alert('Data is missing - please fill in all required fields');
    }
}

function cancelHandler() {
    if (!isDirty() || confirm('Discard changes and close?')) {
        document.querySelector('#view-form').classList.add('hidden');
        document.querySelector('#view-list').classList.remove('hidden');
    }
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
}

function validateForm() {
    return document.querySelector('form').reportValidity();
}

async function loadListData() {
    spinner.showModal();
    const data = await ServerService.getList();
    DataService.setList(data);
    renderList(data);
    spinner.close();
}

function initializeView() {
    initHandlebars();
    setTheme();
    addEventListeners();
    renderList();
    loadListData();
}

export default initializeView;

