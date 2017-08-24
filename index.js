"use strict";
class MyForm {

    constructor(formId) {
        this.form = document.getElementById(formId);
        this.inputs = this.form.getElementsByTagName('input');
    }

    validate() {
        let data = this.getData();
        let errorFields = [];

        let isValidPhone = function (phone) {
            let numbers = [];
            for (let i = 0; i < phone.length; i++) {
                let num = Number(phone.charAt(i));
                if (!Number.isNaN(num)) {
                    numbers.push(num);
                }
            }
            return numbers.reduce((x, y) => x + y, 0) <= 30;
        };
        if (!data.fio || data.fio.trim().split(' ').length !== 3) {
            errorFields.push('fio');
        }
        let regex = '^[a-zA-Z0-9._-]+@(ya.ru|yandex.ru|yandex.ua|yandex.by|yandex.kz|yandex.com)$';
        if (!data.email || data.email.trim().search(regex) === -1) {
            errorFields.push('email');
        }
        regex = '^\\+7\\(\\d{3}\\)\\d{3}\\-\\d{2}\\-\\d{2}$';
        if (!data.phone || data.phone.trim().search(regex) === -1 || !isValidPhone(data.phone)) {
            errorFields.push('phone');
        }
        return {isValid: errorFields.length === 0, errorFields: errorFields};
    }

    getData() {
        let data = {};
        for (let i = 0; i < this.inputs.length; i++) {
            let name = this.inputs[i].getAttribute('name');
            data[name] = this.inputs[i].value.trim();
        }
        return data;
    }

    setData(data) {
        let fields = ['fio', 'email', 'phone'];
        for (let i = 0; i < this.inputs.length; i++) {
            let name = this.inputs[i].getAttribute('name');
            if (fields.includes(name)) {
                let value = data[name];
                if (value) {
                    this.inputs[i].setAttribute('value', value);
                }
            }
        }
    }

    submit() {
        let valid = this.validate();
        let inputs = this.form.querySelectorAll('input');
        for (let input of inputs) {
            if (valid.errorFields.includes(input.name)) {
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }
        }
        if (!valid.isValid) {
            return;
        }
        document.getElementById('submitButton').disabled = true;
        let data = this.getData();
        let resultContainer = document.getElementById('resultContainer');
        resultContainer.classList.remove('success', 'progress', 'error');
        let xhr = new XMLHttpRequest();
        xhr.open('POST', this.form.action);
        xhr.send(JSON.stringify(data));
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== 4) {
                return;
            }
            let answers = ['success.json', 'progress.json', 'error.json'];
            this.form.action = answers[Math.floor(Math.random() * answers.length)];
            if (xhr.status === 200) {
                let response = JSON.parse(xhr.responseText);
                switch (response.status) {
                    case 'success':
                        document.getElementById('submitButton').disabled = false;

                        resultContainer.classList.add('success');
                        resultContainer.innerText = 'Success';
                        break;
                    case 'error':
                        document.getElementById('submitButton').disabled = false;

                        resultContainer.classList.add('error');
                        resultContainer.innerText = response.reason;
                        break;
                    case 'progress':
                        resultContainer.classList.add('progress');
                        resultContainer.innerText = '';
                        setTimeout(() => this.submit(), response.timeout);
                        break;
                }
            }

        };
    }

}

let myForm = new MyForm('myForm');

let button = document.getElementById('submitButton');
button.addEventListener('click', () => myForm.submit());








