'use strict';
import style from './style.css';
const axios = require('axios');
import swal from 'sweetalert';
const baseUrl = 'http://localhost:3000/';

shorten.addEventListener('click', shorteningUrl);
window.addEventListener('load', getTableData);

function getTableData() {
  console.log('success');
  axios.get(`${baseUrl}shortend/list`).then((response) => {
    displayData(response.data);
  });
}
function shorteningUrl(event) {
  // console.log(originalUrl.value)
  axios
    .post(`${baseUrl}shorten`, {
      longURL: originalUrlInput.value,
    })
    .then((response) => {
      displayData(response.data);
      originalUrlInput.value = '';
      console.log(response.data);
    })
    .catch((err) => {
      console.log(err.response);
      swal(`Error: ${err.response.status}`, err.response.data, 'error')
    });
}
function displayData(data) {
  let i = 0;
  displayUrlInfo.textContent = '';
  for (const urlInfo in data) {
    const tableRow = document.createElement('tr');
    tableRow.append(createTableRowHeader(++i));
    tableRow.append(createOriginalUrlTableElement(data[urlInfo]));
    tableRow.append(createTableElement(data[urlInfo].redirectCount));
    tableRow.append(createTableElement(data[urlInfo].creationDate));
    tableRow.append(createShortUrlTableElement(data[urlInfo].shortUrl));
    displayUrlInfo.append(tableRow);
  }
}
function createTableRowHeader(rowNum) {
  const rowHeader = document.createElement('th');
  rowHeader.textContent = rowNum;
  return rowHeader;
}
function createOriginalUrlTableElement(urlInfo) {
  if (urlInfo.originalUrl === originalUrlInput.value) {
    displayShortUrl(urlInfo.shortUrl);
  }
  const _originalUrl = document.createElement('td');
  _originalUrl.textContent = urlInfo.originalUrl;
  _originalUrl.classList.add('lengthControl');
  return _originalUrl;
}
function createTableElement(text) {
  const tableElement = document.createElement('td');
  tableElement.textContent = text;
  return tableElement;
}
function displayShortUrl(shortUrl) {
  shortendUrl.textContent = '';
  shortendUrl.append(createLink(shortUrl));
}
function createShortUrlTableElement(shortUrl) {
  const tableElement = document.createElement('td');
  tableElement.append(createLink(shortUrl));
  return tableElement;
}
function createLink(shortUrl) {
  const link = document.createElement('a');
  link.textContent = shortUrl;
  link.href = shortUrl;
  return link;
}
