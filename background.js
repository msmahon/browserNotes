// Main page notes container
var pageNotes = [];
var pageKey;

// Set icon badge count
async function setBadge(noteCount) {
  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  let badgeText = noteCount ? `${noteCount}` : "";
  chrome.action.setBadgeBackgroundColor({ color: "#279AF1" });
  chrome.action.setBadgeText({ tabId: tab.id, text: badgeText });
}

// Set badge count on page load
chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
  if (changeInfo.status == "complete") {
    let notes = await getPageNotes();
    setBadge(notes.length);
  }
});

// Update badge count on storage change event
chrome.storage.onChanged.addListener(function (changes, namespace) {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    // newValue is not provided when site data is deleted
    if (newValue === undefined) {
      setBadge(0);
      return;
    }
    setBadge(newValue.length);
  }
});

async function getPageNotes(id = null) {
  // This is the first function to run on page load so it
  // sets the pagekey which is used by the rest of the application.
  let url = await getCurrentUrl();
  pageKey = `browserNotes:${url}`;
  let allNotes = await chrome.storage.local.get(pageKey);
  if (id) {
    return allNotes[pageKey].filter((note) => note.id == id)[0];
  }
  return allNotes[pageKey] ?? [];
}

async function createNote(note) {
  let allNotes = await getPageNotes();
  let updatedNotes = [...allNotes, note];
  try {
    await chrome.storage.local.set({ [pageKey]: updatedNotes });
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function updateNote(note) {
  let allNotes = await getPageNotes();
  let index = allNotes.findIndex((savedNote) => savedNote.id == note.id);
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
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function deleteNote(id) {
  let allNotes = await getPageNotes();
  let updatedNotes = allNotes.filter((note) => note.id != id);
  try {
    await chrome.storage.local.set({ [pageKey]: updatedNotes });
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function getCurrentUrl() {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  const url = new URL(tab.url);
  return url.origin + url.pathname;
}

async function getSiteKeys() {
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
  if (message.action === "create") {
    createNote(message.note).then(sendResponse);
    return true;
  }

  // READ
  if (message.action === "get") {
    getPageNotes(message?.id).then(sendResponse);
    return true;
  }

  if (message.action == "update") {
    updateNote(message.note).then(sendResponse);
    return true;
  }

  // DELETE
  if (message.action === "delete") {
    if (!message.id) {
      console.error("No id provided");
      sendResponse(false);
    }
    deleteNote(message.id).then(sendResponse);
    return true;
  }

  if (message.action === "get all site keys") {
    getSiteKeys().then(sendResponse);
    return true;
  }

  if (message.action === "delete site data") {
    deleteSite(message.key).then(sendResponse);
    return true;
  }
});
