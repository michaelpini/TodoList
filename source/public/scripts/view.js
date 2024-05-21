/* global Handlebars */
import { DateTime } from "../ext-modules/luxon.js";
import {
    cancelHandler,
    deleteHandler,
    editItemHandler,
    navBarClickHandler,
    saveHandler,
    toolbarClickHandler,
    toolbarSelectHandler
} from "./controller.js";

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
let formTemplateCompiled = null;
let iconAsc = '';
let iconDesc = '';

function addEventListeners() {
    document.querySelector('.navbar').addEventListener('click', navBarClickHandler);
    document.querySelector('#toolbar-parent').addEventListener('click', toolbarClickHandler);
    document.querySelector('#toolbar-parent').addEventListener('change', toolbarSelectHandler);
    document.querySelector('#list-parent').addEventListener('click', editItemHandler);
    document.querySelector('form').addEventListener('submit', ev => {
        ev.preventDefault();
    })
    document.querySelector('button[name="btnSave"]').addEventListener('click', saveHandler);
    document.querySelector('button[name="btnCancel"]').addEventListener('click', cancelHandler);
    document.querySelector('button[name="btnDelete"]').addEventListener('click', deleteHandler);
}

async function loadIcons() {
    const res1 = await fetch('../icons/sort-ascending.svg');
    iconAsc = await res1.text();
    const res2 = await fetch('../icons/sort-descending.svg');
    iconDesc = await res2.text();
}

function initHandlebars() {
    Handlebars.registerHelper("hbFormatDate", str => DateTime.fromISO(str).toRelativeCalendar());
    Handlebars.registerHelper("hbGetClass", (baseClass, isActive) => `${baseClass}${isActive ? " btn-active" : ""}`);
    Handlebars.registerHelper("hbSortBy", (by) => {
        if (displayOptions.sortBy === by) {
            return (displayOptions.sortMode === "asc") ? `&nbsp;${iconAsc}` : `&nbsp;${iconDesc}`;
        }
        return "";
    });
    Handlebars.registerHelper("hbSetSelected", (option, sortBy) => option === sortBy ? 'selected' : '');
    Handlebars.registerHelper("hbFormatImportance", p => "&#10045;".repeat(+p));
    Handlebars.registerHelper("hbAddAttribute", (attr, condition) => condition ? attr : "");
    navTemplateCompiled = Handlebars.compile(document.querySelector("#nav-template").innerHTML);
    listTemplateCompiled = Handlebars.compile(document.querySelector("#list-template").innerHTML);
    formTemplateCompiled = Handlebars.compile(document.querySelector("#form-template").innerHTML);
}

async function initView() {
    await loadIcons();
    initHandlebars();
    setTheme();
    addEventListeners();
    renderList();
}

function renderList(data = null) {
    document.querySelector("#toolbar-parent").innerHTML = navTemplateCompiled(displayOptions);
    document.querySelector("#list-parent").innerHTML = listTemplateCompiled(data);
}

function renderForm(data) {
    document.querySelector("#form-parent").innerHTML = formTemplateCompiled(data);
}

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

export { displayOptions, initView, renderList, renderForm, setTheme, setView, spinner };