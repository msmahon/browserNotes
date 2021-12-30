export default class Note {
    constructor(id, title = null, content = null) {
        this.id = id;
        this.title = title;
        this.content = content;
    }

    save() {
        return chrome.runtime.sendMessage({action: 'create', note: this.getObjectNotation()}, apiResponse => {
            return apiResponse;
        });
    }

    delete() {
        return chrome.runtime.sendMessage({action: 'delete', id: this.id}, apiResponse => {
            return apiResponse;
        });
    }

    getObjectNotation() {
        return {id: this.id, title: this.title, content: this.content};
    }
}