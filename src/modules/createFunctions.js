'use strict';

const shortUrlBase = 'http://localhost:3000/redirect/'
export function createTableRowHeader(rowNum) {
  const rowHeader = document.createElement('th');
  rowHeader.textContent = rowNum;
  return rowHeader;
}

// here If I check if the url is is the one the user just entered to so I can readily show him
export function createOriginalUrlTableElement(urlInfo) {
  if (urlInfo.originalUrl === originalUrlInput.value) {
    displayShortUrl(urlInfo.shortUrlId);
  }
  const _originalUrl = document.createElement('td');
  _originalUrl.textContent = urlInfo.originalUrl;
  _originalUrl.classList.add('lengthControl');
  return _originalUrl;
}

export function createTableElement(text) {
  const tableElement = document.createElement('td');
  tableElement.textContent = text;
  return tableElement;
}

export function createShortUrlTableElement(shortUrlId) {
  const tableElement = document.createElement('td');
  tableElement.append(createLink(shortUrlBase + shortUrlId));
  return tableElement;
}

function displayShortUrl(shortUrlId) {
  shortendUrl.textContent = '';
  shortendUrl.append(createLink(shortUrlBase + shortUrlId));
}
function createLink(shortUrl) {
  const link = document.createElement('a');
  link.textContent = shortUrl;
  link.href = shortUrl;
  return link;
}
