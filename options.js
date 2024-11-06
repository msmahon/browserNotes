const deleteAllDataButton = document.getElementById("delete-all-data");
const siteDeleteButtons = document.getElementsByClassName("delete-site-data");
const siteList = document.getElementById("site-list");

let allSites = [];

// Delete all site data
deleteAllDataButton.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "get all site keys" }, (response) => {
    if (response.length) {
      response.forEach((site) => deleteSiteData(site));
    }
  });
});

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

renderNotesList();
