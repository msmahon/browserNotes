# BrowserNotes

#### Video Demo:

## Description:

Store notes in the context of urls. This helps organize notes that pertain to specific web pages. Do you have a recipe bookmarked that you make slightly different than instructed? Save it as a note. Leave notes to help you remember why you bookmarked something. Do not save passwords or any sensitive information on notes. They are not a secure storage solution.

## Architecture

Chrome extensions have a background script that is responsible for interacting with the browser. Because this extension relies heavily on the chrome's storage API (https://developer.chrome.com/docs/extensions/reference/storage/#event), the background script serves as an api for my content scripts. The js driving the front end communicates with the background script using verbs similar to HTTP requests. If you send a message with the GET action like `{action: 'get'}`, the background script will query the storage API for all note data as an array for the current site. If you provide an id like `{action: 'get', id: '123456789'}`, you will recieve a single note. As you might expect, there are "endpoints" for CREATE, READ, UPDATE, DELETE that use similarly named actions. Some require an id and will log an error if none are provided, like the delete note endpoint.

Here is a basic layout of the API.

### CREATE

```js
{
    action: 'create',
    note: {/* note data */}
}
```

Note data should be sent with an id, title, and content key. The id is generated from time the note is created.

```js
{
    id: '12345678',
    title: 'My first note',
    content: 'Lorem ipsum dolor…'
}
```

### READ

```js
// Get all notes for the current page
{
    action: 'get'
}

// Get a specific note
{
    action: 'get',
    id: '12345678'
}
```

When fetching all notes, an array of objects is returned. If you provide an id, a single object is returned.

### UPDATE

```js
{
    action: 'update',
    note: {
        id: '12345678',
        title: 'Edited title',
        content: 'Or edited content',
    }
}
```

The existing note is fetched by id and its contents are updated from the provided note. If you delete the original note before saving your edit, a new note will be created.

### DELETE

```js
{
    action: 'delete',
    id: '12345678'
}
```

If no id is provided, an error is logged.

## The rest of the application

### CSS

I decided to use Bulma for styling. I have past experience with it and it is very easy to use. The class driven styling made prototyping quick and removed any need for a custom stylesheet. I only needed a little bit of inline styling for the options page.

I wanted a nice looking break between the form and the note list so I found an existing Bulma extension and just took the css I needed.

### Images

The only images used here are for the various icons chrome renders for the extension. I used [favicon.io](https://favicon.io/) for the icon generation.

### background.js

A lot of this is described in the CRUD events above. Each of the endpoints utilize various helper functions to accomplish their goals. I found that chrome preferred promises over async/await when replying to events. By extracting the work to helper functions, I was able to do most of my work using async/await.

The background script is also responsible for updating the extension icon badge count. It listens for data changes and updates the badge number by counting the number of notes in the changed data. When no notes exist, it is set to an empty string which makes it dissappear. This is convenient for telling if the current site has any notes.

### manifest.json

This is required by Chrome and describes the application. It's pretty minimal for this app.

### options.html

This is the options page that can be accessed by right-clicking the icon. There is a lot you could do here to customize the experience. I added utilities for deleting site data. It lists all storage keys (browserNotes: + the url) and a delete button to remove data for individual sites.

### options.js

This file is the logic for the options page. It works similarly to the panel.js file but is a little simpler. It also uses the background.js script to fetch notes and handle deleting site data.

### panel.html

This is the visual representation of the extension. When you click the icon, this is the page that appears. All of the notes are written inside the panel.js script and injected into the page.

### panel.js

This file sets up the event listeners attached to the form buttons and notes. Since the panel content is dynamic, I have to regenerate the html and re-attach the event listeners every time the content is updated. Luckily this is a relatively light application so it doesn't impact performance but could be an area for improvement. Many extensions utilize vue, which would make state management much easier but I didn't want a library doing all the work for me.

## Design decisions

I quickly became clear that a small custom API would be the easiest solution for this project based on how the chrome api passes around data. Initially I was saving notes as Note objects which was meant to handle the deletion, creation, and updating of notes. I still think this would be a good approach and may revisit it in the future. At the time of writing, I was having difficulties with the asynchronous nature of the chrome API and creating classes fell by the wayside.

## Potential improvements

- Badge indicator for extension icon
- Ability to position notes in separate window (more like a sticky note)
- Ability to tag notes
- Ability to export all note data
- Allow background create endpoint to generate id
- Validate submitted data
- Better error handling
