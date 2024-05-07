/* global Handlebars */
import { DateTime } from "../ext-modules/luxon.js";
import DataService from "../services/data.service.js";
import TodoItem from "./todo-item.model.js";

let navTemplateCompiled = null;
let listTemplateCompiled = null;
let formTemplateCompiled = null;
let formData = null;
let iconAsc = '';
let iconDesc = '';

async function loadIcons() {
    const res1 = await fetch('../icons/sort-ascending.svg');
    iconAsc= await res1.text();
    const res2 = await fetch('../icons/sort-descending.svg');
    iconDesc= await res2.text();
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

function initHandlebars(displayOptions) {
    Handlebars.registerHelper("hbFormatDate", str => DateTime.fromISO(str).toRelativeCalendar());
    Handlebars.registerHelper("hbGetClass", (baseClass, isActive) => `${baseClass}${isActive ? " btn-active" : ""}`);
    Handlebars.registerHelper("hbSortBy", (by) => {
        if (displayOptions.sortBy === by) {
            return (displayOptions.sortMode === "asc") ? `&nbsp;${iconAsc}` : `&nbsp;${iconDesc}`;
        }
        return "";
    });
    Handlebars.registerHelper("hbFormatImportance", p => "&#10045;".repeat(+p));
    Handlebars.registerHelper("hbAddAttribute", (attr, condition) => condition ? attr : "");
    navTemplateCompiled = Handlebars.compile(document.querySelector("#nav-template").innerHTML);
    listTemplateCompiled = Handlebars.compile(document.querySelector("#list-template").innerHTML);
    formTemplateCompiled = Handlebars.compile(document.querySelector("#form-template").innerHTML);
}

/**
 * Sets the light or dark theme, depending on parameter p and stores the value in LocalStorage
 * @param displayOptions {Object} options object from controller
 * @param theme {string?: "light" | "dark" |"toggle"} optional: light | dark | toggle
 * @example
 * setTheme()  // applies value in localStorage, otherwise sets browser preference
 * setTheme('toggle')   // Toggles between light and dark
 * setTheme('light')    // Sets specified theme ('light' or 'dark')
 */
function setTheme(displayOptions, theme) {
    switch (theme) {
        case "light":
        case "dark":
            displayOptions.theme = theme;
            break;
        case "toggle":
            displayOptions.theme = (displayOptions.theme === "light") ? "dark" : "light";
            break;
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

function renderList(displayOptions, data) {
    document.querySelector("#toolbar-parent").innerHTML = navTemplateCompiled(displayOptions);
    document.querySelector("#list-parent").innerHTML = listTemplateCompiled(data);
}

function renderForm(data) {
    document.querySelector("#form-parent").innerHTML = formTemplateCompiled(data);
}

function showAddEditForm(id) {
    document.querySelector("#view-list").classList.add("hidden");
    document.querySelector("#view-form").classList.remove("hidden");
    formData = DataService.getItem(id) || new TodoItem();
    renderForm(formData);
}

export { getFormData, initHandlebars, isDirty, loadIcons, setTheme, renderList, renderForm, showAddEditForm };