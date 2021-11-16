'use strict';
import {
  createOriginalUrlTableElement,
  createShortUrlTableElement,
  createTableElement,
  createTableRowHeader,
} from './createFunctions.js';

// this function displays all the data
export function displayData(data) {
  let i = 0;
  displayUrlInfo.textContent = '';
  for (const urlInfo in data) {
    const tableRow = document.createElement('tr');
    tableRow.append(createTableRowHeader(++i));
    tableRow.append(createOriginalUrlTableElement(data[urlInfo]));
    tableRow.append(createTableElement(data[urlInfo].redirectCount));
    tableRow.append(createTableElement(data[urlInfo].creationDate));
    tableRow.append(createShortUrlTableElement(data[urlInfo].shortUrlId));
    displayUrlInfo.append(tableRow);
  }
}
