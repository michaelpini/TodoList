| CAS FEE Project 1    | Michael Pini     | June 2024 |
|----------------------|------------------|-----------|  
```
External libraries:
- handlebars.js  (templating engine)
- luxon.js       (date / time handling)
- idb.js         (utility for indexed db handling - local storage)

Backend API:     express.js
Persistence:     NeDB  (Alternatively the browsers IndexedDB storage)
```
Instructions:  
1. Install dependencies: ```npm install```
2. Start server: ```npm start```
3. In browser goto http://localhost:3000 to open application

----------------------------------
# A simple Todo List 

The list contains simple todo items with a few properties:
- Name
- Due Date
- Importance  (1 - 5)
- Description
- Completed / Done

### Sort   
The list can be sorted by 4 buttons (drop down list in mobile view).  
👉 Press button twice to toggle sort order

| Sort                    | initial sort order            |
|-------------------------|-------------------------------|
| ``By Name``             | ascending (A...Z)             |
| ``By Due Date``         | ascending (oldest first)      |
| ``By Creation Date``    | ascending (oldest first)      |
| ``By Importance``       | descending (highest first)    |

### Filter:  
Press ``Filter Open`` to show only open items. 👉 Press again to show all.

### Reload:
Press the reload button to load data from the server.  
👉 ```Ctrl``` + click will add some dummy data.

### Theme:
A ``light`` and a ``dark`` theme are available, which can be toggled via the ``Toggle Theme`` button.  
The selection is stored in the browser's localStorage and will be applied on next use.

### Add / Edit Form  
- Press ``New Task`` to add a new item to the list.
- Click the ``Edit`` button of an item in the list to edit it.  

For new items the due date will be set to the current day, importance to 3.  
To save an item, Name, Due Date and Description are required.  
Cancel will warn the user if changes would be lost.

| Field                | Initial value       | Validation      |
|----------------------|---------------------|-----------------|
| ``Name``             |                     | required        |
| ``Due Date``         | today's date        | required        |
| ``Importance``       | 3                   |                 |
| ``Done``             | false               |                 |
| ``Description``      |                     | required        |

