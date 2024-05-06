/* global Handlebars */
import { DateTime } from "../ext-modules/luxon.js";
import DataService from "../services/data-service.js";
import ServerService from "../services/server-service.js";
import TodoItem from "./model.js";

const displayOptions = {
    show: 'list',
    sortBy: 'name',
    sortDescending: false,
    filterOpen: false,
    theme: 'light',
}
const spinner = document.querySelector('#spinner');
let formData = null;



/* *********** VIEW ************* */
let navTemplateCompiled = null;
let listTemplateCompiled = null;
let formTemplateCompiled = null;
Handlebars.registerHelper('formatDate', str => DateTime.fromISO(str).toRelativeCalendar());
Handlebars.registerHelper('getClass', (baseClass, isActive) => `${baseClass}${isActive ? ' btn-active' : ''}`);
Handlebars.registerHelper('sortBy', (by) => {
    if (displayOptions.sortBy === by ) {
        return `&nbsp;<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16" class="disabled">
                      <path d="M3.5 3.5a.5.5 0 0 0-1 0v8.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L3.5 12.293zm4 .5a.5.5 0 0 1 0-1h1a.5.5 0 0 1 0 1zm0 3a.5.5 0 0 1 0-1h3a.5.5 0 0 1 0 1zm0 3a.5.5 0 0 1 0-1h5a.5.5 0 0 1 0 1zM7 12.5a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 0-1h-7a.5.5 0 0 0-.5.5"/>
                      </svg>`
    }
    return '';
});
Handlebars.registerHelper('formatImportance', p => '&#10045;'.repeat(+p));
Handlebars.registerHelper('addAttribute', (attr, condition) => condition ? attr : '');

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
        localStorage.setItem('theme', displayOptions.theme)
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

function onSortFilter(param) {
    if (param) Object.assign(displayOptions, param);
    const data = DataService.getList(displayOptions);
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

function addNavToolbarListeners() {
    document.querySelector(".navbar").addEventListener('click', ev => {
        if (ev.target.id === 'NewTask') showAddEditForm();
        if (ev.target.id === 'ToggleMode') setTheme('toggle');
    });
    document.querySelector("#toolbar-parent").addEventListener('click', ev => {
        if (ev.target?.dataset?.sortBy) {
            onSortFilter(ev.target.dataset);
        }
        else if (ev.target?.dataset?.filterOpen) {
            onSortFilter({filterOpen: !displayOptions.filterOpen});
        }
    })
}

function validateForm() {
    return document.querySelector('form').reportValidity();
}

function addListListeners() {
    document.querySelector('#list-parent').addEventListener('click', ev => {
        const id = ev.target?.dataset?.id;
        if (id) showAddEditForm(id);
    })
}

function addFormListeners() {
    document.querySelector('form').addEventListener('submit', ev => {
        ev.preventDefault();
    })
    document.querySelector('button[name="btnSave"]').addEventListener('click', ev => {
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
    })
    document.querySelector('button[name="btnCancel"]').addEventListener('click', ev => {
        const dirty = isDirty();
        if (!dirty || confirm('Discard changes and close?')) {
            document.querySelector('#view-form').classList.add('hidden');
            document.querySelector('#view-list').classList.remove('hidden');
        }
    })
}

async function loadListData() {
    spinner.showModal();
    const data = await ServerService.getList();
    DataService.setList(data);
    renderList(data);
    spinner.close();
}

function initializeView() {
    const navTemplate = document.querySelector('#nav-template').innerHTML;
    const listTemplate = document.querySelector('#list-template').innerHTML;
    const formTemplate = document.querySelector('#form-template').innerHTML;
    navTemplateCompiled = Handlebars.compile(navTemplate);
    listTemplateCompiled = Handlebars.compile(listTemplate);
    formTemplateCompiled = Handlebars.compile(formTemplate);
    setTheme();
    addNavToolbarListeners();
    addListListeners();
    addFormListeners();
    renderList();
    loadListData();
}

export default initializeView;

