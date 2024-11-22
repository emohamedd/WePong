class ChatInput extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        // Create a new wrapper for the input container
        const outerWrapper = document.createElement('div');
        outerWrapper.classList.add('outer-container');

        const wrapper = document.createElement('div');
        wrapper.classList.add('input-container');

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Type a message...';

        const button = document.createElement('button');
        button.className = 'chat-input-button';
        // set a class name for the button

        wrapper.append(input, button);
        outerWrapper.append(wrapper); // Append input container to outer wrapper

        const style = document.createElement('style');
        style.textContent = `
            .outer-container {
                display: flex; /* Enables flexbox layout */
                justify-content: center; /* Centers horizontally */
                align-items: center; /* Centers vertically */
                padding: 8px;
                width: 100%;
            }

            .input-container {
                display: flex;
                padding: 8px;
                background-color: #300141;
                border: 1px solid #FFFFFF;
                border-radius: 4px;
                width: 80%;
            }

            input {
                flex: 1;
                padding: 8px;
                background-color: #300141;
                border: none;
                width: 100%; /* Make input take full width of input-container */
                font-size: 1em;
                color: #FFFFFF; /* Change font-color to color */
                font-weight: bold;
            }

            input:focus {
                outline: none; /* Remove default focus outline */
                border: none; /* Remove any border on focus */
            }

            .chat-input-button {
                border: none;
                background-color: #EE36A4;
                border-radius: 4px;
                cursor: pointer;
                display: flex;
                align-items: center;
                position: relative; /* Required for absolute positioning of the icon */
            }

            .chat-input-button::before {
                content: "";
                background-image: url('../images/send-icon.png'); 
                background-size: contain; 
                background-repeat: no-repeat; 
                width: 20px; 
                height: 20px; 
                position: absolute;
                left: 10px;
                top: 50%;
                transform: translateY(-50%);
            }

            .chat-input-button {
                padding-left: 35px; /* Adjust padding to make space for the icon */
            }

            .chat-input-button:hover {
                border: 1px solid #FFFFFF;
            } 

            @media (max-width: 600px) {
                button {
                    padding: 8px 12px;
                    font-size: 0.9em;
                }
                input {
                    padding: 6px;
                    font-size: 0.9em;
                }
            }
        `;

        this.shadowRoot.append(style, outerWrapper); // Append outerWrapper to shadow root

        // Event listeners
        button.addEventListener('click', () => this.sendMessage());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }

    sendMessage() {
        const input = this.shadowRoot.querySelector('input');
        const message = input.value.trim();
        if (message) {
            // Dispatch a custom event with the message
            this.dispatchEvent(new CustomEvent('message-sent', {
                detail: { message },
                bubbles: true, // means that parent elements can listen for this event, not just the component itself
                composed: true // Allows the event to pass through the shadow DOM boundary
            }));
            input.value = '';
        }
    }
}

customElements.define('chat-input', ChatInput);
