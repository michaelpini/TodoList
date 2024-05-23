/* global Handlebars */
import Data from "../model/data.js";
import LocalDbService from "../services/local-db.service.js";
import dummyData from "../../json/dummy-data.json" with { type: 'json' };
import { DateTime } from "../../libraries/luxon.js";
import { initForm, show } from "./form-controller.js";

const spinner = document.querySelector('#spinner');
const displayOptions = {
    show: 'list',
    sortBy: 'name',
    sortMode: 'asc',
    filterOpen: false,
    theme: 'light',
}
let navTemplateCompiled = null;
let listTemplateCompiled = null;
let svgAsc = null;
let svgDesc = null;

// Event Handlers
function addEventListeners() {
    document.querySelector('.navbar').addEventListener('click', navBarClickHandler);
    document.querySelector('#toolbar-parent').addEventListener('click', toolbarClickHandler);
    document.querySelector('#toolbar-parent').addEventListener('change', toolbarSelectHandler);
    document.querySelector('#list-parent').addEventListener('click', listItemClickHandler);
}

function navBarClickHandler(ev) {
    if (ev.target.id === 'NewTask') showForm();
    if (ev.target.id === 'ToggleMode') setTheme('toggle');
}

function toolbarClickHandler(ev) {
    // SortBy button
    if (ev.target?.dataset?.sortBy) {
        if (displayOptions.sortBy === ev.target.dataset.sortBy) {
            displayOptions.sortMode = displayOptions.sortMode === 'asc' ? 'desc' : 'asc';
        } else {
            displayOptions.sortMode = ev.target.dataset.sortMode;
        }
        displayOptions.sortBy = ev.target.dataset.sortBy;
        renderSortedFiltered();
    }
    // FilterOpen button
    else if (ev.target?.dataset?.filterOpen) {
        displayOptions.filterOpen = !displayOptions.filterOpen;
        renderSortedFiltered();
    }
}

function toolbarSelectHandler(ev) {
    const selectedOption = ev.target.options[ev.target.selectedIndex];
    displayOptions.sortBy = selectedOption.value;
    displayOptions.sortMode = selectedOption.dataset.sortMode;
    renderSortedFiltered();
}

function listItemClickHandler(ev) {
    const id = ev.target?.dataset?.id;
    if (id) showForm(id);
}

function renderSortedFiltered() {
    let data = Data.getSortedFiltered(
        displayOptions.sortBy, displayOptions.sortMode, displayOptions.filterOpen && 'open');
    renderList(data);
}

// Initialize
async function initialize() {
    await initList();
    await initForm();
    await loadListData();
}

async function initList() {
    await loadIcons();
    setTheme();
    initHandlebars();
    addEventListeners();
    renderList();
}

function initHandlebars() {
    Handlebars.registerHelper('hbFormatDate', str => DateTime.fromISO(str).toRelativeCalendar());
    Handlebars.registerHelper('hbGetClass', (baseClass, isActive) => `${baseClass}${isActive ? ' btn-active' : ''}`);
    Handlebars.registerHelper('hbSortBy', (by) => {
        if (displayOptions.sortBy === by) {
            return (displayOptions.sortMode === 'asc') ? `&nbsp;${svgAsc}` : `&nbsp;${svgDesc}`;
        }
        return '';
    });
    Handlebars.registerHelper('hbSetSelected', (option, sortBy) => option === sortBy ? 'selected' : '');
    Handlebars.registerHelper('hbFormatImportance', p => '&#10045;'.repeat(+p));
    Handlebars.registerHelper('hbAddAttribute', (attr, condition) => condition ? attr : '');
    navTemplateCompiled = Handlebars.compile(document.querySelector('#nav-template').innerHTML);
    listTemplateCompiled = Handlebars.compile(document.querySelector('#list-template').innerHTML);
}

async function loadIcons() {
    const res1 = await fetch('../icons/sort-ascending.svg');
    svgAsc = await res1.text();
    const res2 = await fetch('../icons/sort-descending.svg');
    svgDesc = await res2.text();
}

async function loadListData() {
    spinner.showModal();
    let data = await LocalDbService.getAll();
    if (!data.length) data = await populateDummyData();
    Data.setAll(data);
    renderSortedFiltered();
    spinner.close();
}

async function populateDummyData() {
    return LocalDbService.addMultiple(dummyData);
}

// Render View
function setView(view = 'list') {
    displayOptions.view = view;
    if (view === 'list') {
        document.querySelector("#view-list").classList.remove("hidden");
        document.querySelector("#view-form").classList.add("hidden");
    } else {
        document.querySelector("#view-list").classList.add("hidden");
        document.querySelector("#view-form").classList.remove("hidden");
    }
}

function renderList(data = null) {
    document.querySelector("#toolbar-parent").innerHTML = navTemplateCompiled(displayOptions);
    document.querySelector("#list-parent").innerHTML = listTemplateCompiled(data);
}

/**
 * Sets the light or dark theme, depending on parameter theme and stores the value in LocalStorage
 * @param theme {string?: "light" | "dark" | "toggle" | "default"} optional: light | dark | toggle | default
 * @example
 * setTheme()  // applies value in localStorage, otherwise sets browser preference
 * setTheme('toggle')   // Toggles between light and dark
 * setTheme('light')    // Sets specified theme ('light' or 'dark')
 */
function setTheme(theme = 'default') {
    switch (theme) {
        case "light":
        case "dark":
            displayOptions.theme = theme;
            break;
        case "toggle":
            displayOptions.theme = (displayOptions.theme === "light") ? "dark" : "light";
            break;
        case 'default':
        default:
            if (Object.hasOwn(localStorage, "theme")) {
                displayOptions.theme = localStorage.getItem("theme");
            } else {
                displayOptions.theme = (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
            }
    }
    document.documentElement.setAttribute("data-theme", displayOptions.theme);
    try {
        localStorage.setItem("theme", displayOptions.theme);
    } catch (err) {/* ignore */
    }
}

function showForm(id) {
    setView('form');
    show(id)
        .then(res => renderSortedFiltered())
        .catch(err => {})
        .finally(() => setView('list'))
}

export { initialize, spinner };
