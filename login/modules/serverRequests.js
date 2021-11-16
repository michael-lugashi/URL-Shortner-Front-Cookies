'use strict';
const baseUrl = 'http://localhost:3000/';
import axios from 'axios';
import swal from 'sweetalert';

export function loggingIn(event) {
 event.preventDefault();
 axios
  .post(`${baseUrl}login`, {
   username: usernameLoginInput.value,
   password: passwordLoginInput.value,
  })
  .then((res) => {
   console.log(res);
  })
  .catch(async (err) => {
   swal(`Oops!`, `${err.response.data}`, 'error');
  });
}
export function creatingAccount(event) {
 event.preventDefault();
 axios
  .post(`${baseUrl}createAccount`, {
   username: usernameCreateInput.value,
   password: passwordCreateInput.value,
  })
  .then((res) => {
   swal(`🥳`, `${res.response.data}`, 'success');
   console.log(res);
  })
  .catch(async (err) => {
   swal(`Oops!`, `${err.response.data}`, 'error');
  });
}
