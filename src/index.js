'use strict';
import style from './style.css';
import axios from 'axios';
import swal from 'sweetalert';
import {displayData} from './modules/displayData.js'

const baseUrl = 'http://localhost:3000/';

shorten.addEventListener('click', shorteningUrl);
window.addEventListener('load', getTableData);

// loads the information for the table everytime you open the page
function getTableData() {
  axios.get(`${baseUrl}shortend/list`).then((response) => {
    displayData(response.data);
  });
}

// sends request to shorten Url and responds accordingly
function shorteningUrl(event) {
  axios
    .post(`${baseUrl}shorten`, {
      longURL: originalUrlInput.value,
    })
    .then((response) => {
      displayData(response.data);
      originalUrlInput.value = '';
    })
    .catch((err) => {
      // this is an extention I use instead of using alert
      swal(`Error: ${err.response.status}`, err.response.data, 'error')
    });
}
