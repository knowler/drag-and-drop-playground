const DRAG_AND_DROP_EVENT_TYPES = ["drag", "dragstart", "dragend", "dragenter", "dragleave", "dragover", "drop"]

class SortableListElement extends HTMLElement {
  get listElement() { return this.querySelector(":scope > :is(ol, ul)"); }
  get listItemElements() { return this.listElement.querySelectorAll(":scope > li"); }

  connectedCallback() {
    for (const listItemElement of this.listItemElements) {
      listItemElement.draggable = true;
      for (const eventType of DRAG_AND_DROP_EVENT_TYPES) {
        listItemElement.addEventListener(eventType, this.handleDragEvent.bind(this));
      }
    }
  }

  handleDragEvent(event) {
    switch (event.type) {
      case "dragstart":
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", event.currentTarget.textContent);
        break;
      case "dragend":
        if (event.dataTransfer.dropEffect === "move") event.currentTarget.remove();
        break;
      case "dragover":
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        break;
      case "drop":
        event.preventDefault();
        const isBefore = event.offsetY < event.target.clientHeight / 2;

        // Check if element is the same one or if it’s already in this
        // place.

        const droppedListItemElement = this.ownerDocument.createElement("li");
        droppedListItemElement.draggable = true;
        droppedListItemElement.textContent = event.dataTransfer.getData("text/plain");
        droppedListItemElement.classList.add("dropped");

        // Determine if the element should be before or after...

        event.currentTarget[isBefore ? 'before' : 'after'](droppedListItemElement);
        event.currentTarget.classList.remove("dragover");

        for (const eventType of DRAG_AND_DROP_EVENT_TYPES) {
          droppedListItemElement.addEventListener(eventType, this.handleDragEvent.bind(this));
        }
        break;
      case "dragenter":
        event.currentTarget.classList.add("dragover");
        break;
      case "dragleave":
        event.currentTarget.classList.remove("dragover");
        break;
    }
  }
}

if (!window.customElements.get("sortable-list")) {
  window.SortableListElement = SortableListElement;
  window.customElements.define("sortable-list", SortableListElement);
}
