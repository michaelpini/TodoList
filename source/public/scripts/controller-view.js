/* global Handlebars */
import { DateTime } from "../ext-modules/luxon.js";
import DataService from "../services/data-service.js";
import ServerService from "../services/server-service.js";
import TodoItem from "./model.js";

let navTemplateCompiled = null;
let listTemplateCompiled = null;
let formTemplateCompiled = null;

const displayOptions = {
    show: 'list',
    sortBy: 'name',
    sortDescending: false,
    filterOpen: false,
    theme: 'light',
}

/* *********** CONTROLLER ************* */

function onSortFilter(param) {
    if (param) Object.assign(displayOptions, param);
    const data = DataService.getList(displayOptions);
    renderList(data)
}

function addNavToolbarListeners() {
    document.querySelector('#NewTask').addEventListener('click', showAddEditForm);
    document.querySelector('#ToggleMode').addEventListener('click', onToggleTheme);
    document.querySelector('#SortByName').addEventListener('click', () => {
        onSortFilter({sortBy: 'name', sortDescending: false});
    })
    document.querySelector('#SortByDueDate').addEventListener('click', () => {
        onSortFilter({sortBy: 'dueDate', sortDescending: false});
    })
    document.querySelector('#SortByCreationDate').addEventListener('click', () => {
        onSortFilter({sortBy: 'createdDate', sortDescending: false});
    })
    document.querySelector('#SortByImportance').addEventListener('click', () => {
        onSortFilter({sortBy: 'importance', sortDescending: true});
    })
    document.querySelector('#FilterOpen').addEventListener('click', () => {
        onSortFilter({filterOpen: !displayOptions.filterOpen});
    })
}

function addListListeners() {
    const editButtons = document.querySelectorAll('button[data-id]');
    for (let i = 0; i < editButtons.length; i++) {
        editButtons[i].addEventListener('click', ev => {
            const {id} = ev.target.dataset;
            showAddEditForm(id);
        })
    }
}

function addFormListeners() {

}



/* *********** VIEW ************* */
Handlebars.registerHelper('formatDate', str => DateTime.fromISO(str).toRelativeCalendar());
Handlebars.registerHelper('getClass', (baseClass, isActive) => `"${baseClass}${isActive ? ' active' : ''}"`);
Handlebars.registerHelper('sortBy', (by) => {
    if (displayOptions.sortBy === by ) {
        return `&nbsp;<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M3.5 3.5a.5.5 0 0 0-1 0v8.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L3.5 12.293zm4 .5a.5.5 0 0 1 0-1h1a.5.5 0 0 1 0 1zm0 3a.5.5 0 0 1 0-1h3a.5.5 0 0 1 0 1zm0 3a.5.5 0 0 1 0-1h5a.5.5 0 0 1 0 1zM7 12.5a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 0-1h-7a.5.5 0 0 0-.5.5"/>
                      </svg>`
    }
    return '';
});
Handlebars.registerHelper('formatImportance', p => '&#10045;'.repeat(+p));

function renderList(data) {
    document.querySelector('.todo-nav').innerHTML = navTemplateCompiled(displayOptions);
    document.querySelector('.todo-list').innerHTML = listTemplateCompiled(data);
    addNavToolbarListeners();
    addListListeners();
}

function renderForm(data) {
    document.querySelector('.todo-form').innerHTML = formTemplateCompiled(data);
    addFormListeners();
}

async function initializeView() {
    if (Object.hasOwn(localStorage, 'theme')) {
        displayOptions.theme = localStorage.getItem('theme');
        onToggleTheme();
    }
    const navTemplate = document.querySelector('#nav-template').innerHTML;
    const listTemplate = document.querySelector('#list-template').innerHTML;
    const formTemplate = document.querySelector('#form-template').innerHTML;
    navTemplateCompiled = Handlebars.compile(navTemplate);
    listTemplateCompiled = Handlebars.compile(listTemplate);
    formTemplateCompiled = Handlebars.compile(formTemplate);

    renderList();
    document.querySelector('#spinner').showModal();
    const data = await ServerService.getList();
    DataService.setList(data);
    renderList(data);
    document.querySelector('#spinner').close();
}

function showAddEditForm(id) {
    document.querySelector('#view-list').classList.add('hidden')
    document.querySelector('#view-form').classList.remove('hidden');
    const data = DataService.getItem(id) || new TodoItem();
    renderForm(data);
}

function onToggleTheme(ev) {
    if (ev) {
        displayOptions.theme = (displayOptions.theme === 'light') ? 'dark' : 'light'
    }
    document.documentElement.setAttribute('data-theme', displayOptions.theme);
    try {
        localStorage.setItem('theme', displayOptions.theme)
    } catch (err) {/* ignore */}

}

export { initializeView }

