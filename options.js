const deleteButton = document.getElementById('delete-all-data');
const siteDeleteButtons = document.getElementsByClassName('delete-site-data')
const siteList = document.getElementById('site-list');

let allSites = [];

deleteButton.addEventListener('click', (event) => {
    console.log('sending message');
    chrome.runtime.sendMessage({action: 'get all notes'}, response => {
        console.log(response)
    });
});

function getSiteData() {
    let allSites = [];
    chrome.runtime.sendMessage({action: 'get all notes'}, response => {
        allSites = response;
    });
}

function deleteSite(key) {
    let button = document.querySelector(`#${key} button`);
    button.classList.add('is-loading');
    chrome.runtime.sendMessage({action: 'delete site', key: key}, response => {
        if (response) {
            renderNotesList();
        }
    });
}

function renderNotesList() {
    let allSites = [];
    chrome.runtime.sendMessage({action: 'get all notes'}, response => {
        allSites = response;

        siteList.innerHTML = '';
        allSites.forEach(site => {
            let siteDiv = `
                <div class="mb-2" id="${site}">
                    <button class="button is-danger is-delete is-small delete-site-data" aria-label="delete">DELETE</button>
                    <span>${site}</span>
                </div>
            `;
            siteList.innerHTML = siteList.innerHTML + siteDiv;
        });

        Array.from(siteDeleteButtons).forEach(node => {
            node.addEventListener('click', () => deleteSite(node.parentElement.id));
        });
    });
}

renderNotesList();
