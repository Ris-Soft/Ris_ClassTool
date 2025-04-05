// 切换主内容区
document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', function (e) {
        const targetId = this.getAttribute('data-target');
        document.querySelectorAll('.content-page').forEach(page => {
            page.classList.remove('active');
        });
        document.querySelector(targetId).classList.add('active');
        document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
    });
});

function prompt(message, callback) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '1000';

    // Create prompt box
    const promptBox = document.createElement('div');
    promptBox.style.backgroundColor = '#fff';
    promptBox.style.padding = '20px';
    promptBox.style.borderRadius = '8px';
    promptBox.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    promptBox.style.textAlign = 'center';

    // Create message
    const promptMessage = document.createElement('p');
    promptMessage.textContent = message;
    promptMessage.style.marginBottom = '10px';

    // Create input
    const input = document.createElement('input');
    input.type = 'text';
    input.style.width = '100%';
    input.style.padding = '8px';
    input.style.marginBottom = '10px';
    input.style.boxSizing = 'border-box';

    // Auto-focus input
    setTimeout(() => input.focus(), 0);

    // Create buttons
    const buttonContainer = document.createElement('div');
    const confirmButton = document.createElement('button');
    confirmButton.textContent = '确认';
    confirmButton.style.marginRight = '10px';
    const cancelButton = document.createElement('button');
    cancelButton.textContent = '取消';

    // Append elements
    buttonContainer.appendChild(confirmButton);
    buttonContainer.appendChild(cancelButton);
    promptBox.appendChild(promptMessage);
    promptBox.appendChild(input);
    promptBox.appendChild(buttonContainer);
    overlay.appendChild(promptBox);
    document.body.appendChild(overlay);

    // Event listeners
    confirmButton.addEventListener('click', () => {
        callback(input.value);
        document.body.removeChild(overlay);
    });

    cancelButton.addEventListener('click', () => {
        callback(null);
        document.body.removeChild(overlay);
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            confirmButton.click();
        } else if (e.key === 'Escape') {
            cancelButton.click();
        }
    });
}

function alert(message, callback) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '1000';

    // Create alert box
    const alertBox = document.createElement('div');
    alertBox.style.backgroundColor = '#fff';
    alertBox.style.padding = '20px';
    alertBox.style.borderRadius = '8px';
    alertBox.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    alertBox.style.textAlign = 'center';

    // Create message
    const alertMessage = document.createElement('p');
    alertMessage.textContent = message;
    alertMessage.style.marginBottom = '20px';

    // Create button
    const okButton = document.createElement('button');
    okButton.textContent = '确定';

    // Append elements
    alertBox.appendChild(alertMessage);
    alertBox.appendChild(okButton);
    overlay.appendChild(alertBox);
    document.body.appendChild(overlay);

    // Event listener
    okButton.addEventListener('click', () => {
        if (callback) callback();
        document.body.removeChild(overlay);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === 'Escape') {
            okButton.click();
        }
    }, { once: true });
}

function regsterTimePicker() {
    document.querySelectorAll('.time-cell').forEach(cell => {
        cell.addEventListener('click', (event) => {
            const cell = event.target;
            const currentValue = cell.textContent.trim();

            // Create time picker modal
            const timePickerModal = document.createElement('div');
            timePickerModal.style.position = 'fixed';
            timePickerModal.style.top = '0';
            timePickerModal.style.left = '0';
            timePickerModal.style.width = '100%';
            timePickerModal.style.height = '100%';
            timePickerModal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            timePickerModal.style.display = 'flex';
            timePickerModal.style.justifyContent = 'center';
            timePickerModal.style.alignItems = 'center';
            timePickerModal.style.zIndex = '1000';

            const modalContent = document.createElement('div');
            modalContent.style.backgroundColor = '#fff';
            modalContent.style.padding = '20px';
            modalContent.style.borderRadius = '8px';
            modalContent.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
            modalContent.style.textAlign = 'center';

            const input = document.createElement('input');
            input.type = 'text';
            input.value = currentValue;
            input.style.width = '100%';
            input.style.padding = '8px';
            input.style.marginBottom = '10px';
            input.style.boxSizing = 'border-box';

            const buttonContainer = document.createElement('div');
            const saveButton = document.createElement('button');
            saveButton.textContent = '保存';
            saveButton.style.marginRight = '10px';
            const cancelButton = document.createElement('button');
            cancelButton.textContent = '取消';

            buttonContainer.appendChild(saveButton);
            buttonContainer.appendChild(cancelButton);
            modalContent.appendChild(input);
            modalContent.appendChild(buttonContainer);
            timePickerModal.appendChild(modalContent);
            document.body.appendChild(timePickerModal);

            // Save button click event
            saveButton.addEventListener('click', () => {
                const newValue = input.value.trim();
                if (newValue) {
                    cell.textContent = newValue;
                    document.body.removeChild(timePickerModal);
                } else {
                    alert('时间不能为空');
                }
            });

            // Cancel button click event
            cancelButton.addEventListener('click', () => {
                document.body.removeChild(timePickerModal);
            });

            // Close modal on Escape key
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    document.body.removeChild(timePickerModal);
                }
            });

            // Auto-focus input
            setTimeout(() => input.focus(), 0);
        });
    });
}