const saveButton = document.getElementById("save-note");
const clearButton = document.getElementById("clear-form");
const noteList = document.getElementById("note-list");
const noteListContainer = document.getElementById("note-list-container");

const idInput = document.getElementById("note-id");
const titleInput = document.getElementById("note-title");
const contentInput = document.getElementById("note-content");

const deleteButtons = document.getElementsByClassName("delete-button");
const editButtons = document.getElementsByClassName("edit-button");

var fetchedNotes = [];

async function initialize() {
  const storageData = await chrome.storage.local.get(["options"]);
  setColor(storageData.options?.color);
  refreshNotesList();
}

// Fetch and display current notes
function renderNotesList() {
  if (fetchedNotes.length === 0) {
    noteListContainer.classList.add("is-hidden");
  } else {
    noteListContainer.classList.remove("is-hidden");
  }
  noteList.innerHTML = "";
  fetchedNotes.forEach((note) => {
    let noteDiv = `
      <article class="message is-small" id="${note.id}">
        <div class="message-header">
          <p class="mb-0">${note.title}</p>
          <a class="edit-button is-size-7">edit</a>
          <button class="delete is-small delete-button" aria-label="delete"></button>
        </div>
        <div class="message-body">${note.content}</div>
      </article>
    `;
    noteList.innerHTML = noteList.innerHTML + noteDiv;
  });

  Array.from(deleteButtons).forEach((node) => {
    node.addEventListener("click", () =>
      deleteNote(node.parentElement.parentElement.id)
    );
  });

  Array.from(editButtons).forEach((node) => {
    node.addEventListener("click", () =>
      editNote(node.parentElement.parentElement.id)
    );
  });
}

function deleteNote(id) {
  chrome.runtime.sendMessage({ action: "delete", id: id }, () => {
    refreshNotesList();
  });
}

function editNote(id) {
  chrome.runtime.sendMessage({ action: "get", id: id }, (note) => {
    idInput.value = note.id;
    titleInput.value = note.title;
    contentInput.value = note.content;
  });
}

function refreshNotesList() {
  fetchedNotes = [];
  chrome.runtime.sendMessage({ action: "get" }, (notes) => {
    notes.forEach((note) => {
      fetchedNotes.push(note);
    });
    renderNotesList();
  });
}

saveButton.addEventListener("click", (event) => {
  var newNote = {
    id: idInput.value || new Date().getTime(),
    title: titleInput.value,
    content: contentInput.value,
  };

  if (idInput.value) {
    // UPDATE
    chrome.runtime.sendMessage({ action: "update", note: newNote }, () => {
      refreshNotesList();
    });
  } else {
    // CREATE
    chrome.runtime.sendMessage({ action: "create", note: newNote }, () => {
      refreshNotesList();
    });
  }
  clearForm();
});

clearButton.addEventListener("click", async (event) => {
  clearForm();
});

function clearForm() {
  idInput.value = "";
  titleInput.value = "";
  contentInput.value = "";
  titleInput.focus();
}

function setColor(color = "green") {
  setBodyColor(color);
  setHeaderColor(color);
}

function setBodyColor(color) {
  const colorMap = {
    green: "has-background-success",
    red: "has-background-danger",
    blue: "has-background-info",
  };
  document.body.classList.remove(...Object.values(colorMap));
  document.body.classList.add(colorMap[color]);
}

function setHeaderColor(color) {
  const colorMap = {
    green: "has-text-success-dark",
    red: "has-text-danger-dark",
    blue: "has-text-info-dark",
  };
  document
    .getElementById("header")
    .classList.remove(...Object.values(colorMap));
  document.getElementById("header").classList.add(colorMap[color]);
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(request);
  switch (request.action) {
    case "color changed":
      setColor(request.color);
      break;

    default:
      break;
  }
  sendResponse();
});

initialize();
