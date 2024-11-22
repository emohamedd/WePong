class ChatHeader extends HTMLElement {
  // Observe changes to attributes and update dynamically
  static get observedAttributes() {
      return ['friend-name', 'friend-image'];
  }

  constructor() {
      super();
      this.attachShadow({ mode: 'open' });

      const header = document.createElement('div');
      header.classList.add('chat-header');

      // Create image element for the friend's profile picture
      this.img = document.createElement('img');
      this.img.classList.add('friend-image');
      this.img.alt = 'Friend Image'; // Set a default alt text

      // Create span for the friend's name
      this.name = document.createElement('span');
      this.name.classList.add('friend-name');

      header.append(this.img, this.name);

      const style = document.createElement('style');
      style.textContent = `
      .chat-header {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center; /* Centers image and text */
        text-align: center; /* Ensures text is centered */
        padding: 16px;
      }

      .friend-image {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        margin-bottom: 8px; /* Space between image and name */
      }

      .friend-name {
        font-size: 1.2em;
        font-weight: bold;
        color : #FFFFFF;
      }

      @media (max-width: 600px) {
        .chat-header {
          padding: 12px;
          font-size: 1em;
          width: 70%;
        }
        .friend-image {
          width: 40px;
          height: 40px;
        }
        .friend-name {
          font-size: 1em;
        }
      }
    `;

      this.shadowRoot.append(style, header);
  }

  // Lifecycle method called when the element is added to the DOM
  connectedCallback() {
      // Get the attributes once the element is connected to the DOM
      this.img.src = this.getAttribute('friend-image') || '/images/default.png'; // Default image fallback
      this.name.textContent = this.getAttribute('friend-name') || 'Unknown';
  }

  attributeChangedCallback(name, oldValue, newValue) {
      if (name === 'friend-image') {
          this.img.src = newValue;
      }
      if (name === 'friend-name') {
          this.name.textContent = newValue;
      }
  }
}

customElements.define('chat-header', ChatHeader);

