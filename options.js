const deleteAllDataButton = document.getElementById("delete-all-data");
const siteDeleteButtons = document.getElementsByClassName("delete-site-data");
const siteList = document.getElementById("site-list");

// Delete all site data
deleteAllDataButton.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "get all site keys" }, (response) => {
    if (response.length) {
      response.forEach((site) => deleteSiteData(site));
    }
  });
});

for (let button of document.getElementsByClassName("color-button")) {
  button.addEventListener("click", () => {
    const color = button.getAttribute("data-color");
    chrome.storage.local.set({ options: { color } });
    chrome.runtime.sendMessage({
      action: "color changed",
      color,
    });
    setColor(color);
  });
}

// Delete individual site data
async function deleteSiteData(key) {
  chrome.runtime.sendMessage(
    { action: "delete site data", key: key },
    (response) => {
      if (response) {
        renderNotesList();
        return true;
      } else {
        console.error("Failed to delete site data");
        return false;
      }
    }
  );
}

function renderNotesList() {
  chrome.runtime.sendMessage({ action: "get all site keys" }, (siteKeys) => {
    siteList.innerHTML = "";
    siteKeys.forEach((site) => {
      let siteDiv = `
          <div class="mb-2" id="${site}">
            <button class="button is-danger is-delete is-small delete-site-data" aria-label="delete">DELETE</button>
            <span>${site}</span>
          </div>
      `;
      siteList.innerHTML = siteList.innerHTML + siteDiv;
    });

    Array.from(siteDeleteButtons).forEach((node) => {
      node.addEventListener("click", (event) =>
        deleteSiteData(node.parentElement.id)
      );
    });
  });
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

renderNotesList();
