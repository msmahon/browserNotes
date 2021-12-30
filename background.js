// Main page notes container
var pageNotes = [];
var pageKey;

async function getAllKeys() {

}

async function getPageNotes(id = null) {
    // This is the first function to run on page load so it
    // sets the pagekey which is used by the rest of the application.
    console.log(id);
    let url = await getCurrentUrl();
    pageKey = `browserNotes:${url}`;
    let allNotes = await chrome.storage.local.get(pageKey);
    if (id) {
        console.log('test', allNotes[pageKey].filter(note => note.id == id));
        return allNotes[pageKey].filter(note => note.id == id)[0];
    }
    return allNotes[pageKey] || [];
}

async function createNote(note) {
    let allNotes = await getPageNotes();
    let updatedNotes = [...allNotes, note];
    try {
        await chrome.storage.local.set({ [pageKey]: updatedNotes });
    } catch (error) {
        console.error(error);
        return false;
    }
    return true;
}

async function updateNote(note) {
    let allNotes = await getPageNotes();
    let index = allNotes.findIndex(savedNote => savedNote.id == note.id);
    if (index === -1) {
        // Note was deleted before saving so just resave it
        try {
            await createNote(note);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    // Update note and resave
    allNotes[index].title = note.title;
    allNotes[index].content = note.content;
    try {
        await chrome.storage.local.set({ [pageKey]: allNotes });
    } catch (error) {
        console.error(error);
        return false;
    }
    return true;
}

async function deleteNote(id) {
    let allNotes = await getPageNotes();
    let updatedNotes = allNotes.filter(note => note.id != id);
    try {
        await chrome.storage.local.set({ [pageKey]: updatedNotes });
    } catch (error) {
        console.error(error);
        return false;
    }
    return true;
}

async function getCurrentUrl() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab.url;
}

async function getData() {
    let items = await chrome.storage.local.get(null);
    return Object.keys(items);
}

async function deleteSite(key) {
    try {
        await chrome.storage.local.remove(key);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    /**
     * Chrome extensions do not seem to work will with
     * Async/Await. Calling functions outside the listener
     * still work and let us return promises.
     */

    // CREATE
    if (message.action === 'create') {
        createNote(message.note).then(sendResponse);
        return true;
    }

    // READ
    if (message.action === 'get') {
        getPageNotes(message?.id).then(sendResponse);
        return true;
    }

    if (message.action == 'update') {
        updateNote(message.note).then(sendResponse);
        return true;
    }

    // DELETE
    if (message.action === 'delete') {
        if (!message.id) {
            console.error('No id provided');
            sendResponse(false);
        }
        deleteNote(message.id).then(sendResponse);
        return true;
    }

    if (message.action === 'get all notes') {
        getData().then(sendResponse);
        return true;
    }

    if (message.action === 'delete site data') {
        deleteSite(message.key).then(sendResponse);
        return true;
    }
});
