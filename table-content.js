import {
  createTablesIfNotExist,
  getAllTableData,
  addOrderItemToTable,
  getTableListByName,
  getServingCount,
  getTableNameById,
  getTableOrderListById,
  updateServing,
  deleteOrderItemFromTable,
  deleteServing,
  makeTableOrderEmpty,
} from "./table.js";

document.addEventListener("DOMContentLoaded", handlePageLoad);
const tableContainer = document.getElementById("table-container");
const tableSearchContainer = document.getElementById("table-list-search");
const modal = document.getElementById("table-model");
const root = document.getElementById("root");
tableSearchContainer.addEventListener("change", hadleTableListSearch);

function handlePageLoad() {
  createTablesIfNotExist();
  loadTableList(getAllTableData());
}
function hadleTableListSearch() {
  let query = tableSearchContainer.value;
  let result = getTableListByName(query);
  loadTableList(result);
}

function loadTableList(tableList) {
  tableContainer.innerHTML = "";
  tableList.forEach((table) => {
    createTableElememt(table);
  });
}

function createTableElememt(table) {
  let card = document.createElement("a");
  card.classList.add("card", "custom-card");
  card.addEventListener("dragover", handleDragOver);
  card.addEventListener("drop", handleDrop);
  card.addEventListener("dragenter", handleDragEnter);
  card.addEventListener("click", handleClick);
  card.setAttribute("id", table.tableId);

  let cardBody = document.createElement("div");
  cardBody.classList.add("card-body");
  cardBody.setAttribute("id", table.tableId);

  let cardTitle = document.createElement("h3");
  cardTitle.classList.add("card-title");
  cardTitle.innerText = table.name;
  cardTitle.setAttribute("id", table.tableId);

  let subText = document.createElement("h6");
  let totalItems = document.createElement("p");
  totalItems.innerText = "Total Items: " + table.order.length;
  totalItems.setAttribute("id", table.tableId);

  let billAmount = document.createElement("p");
  billAmount.innerHTML =
    "Bill: " + "&#8377; " + getTotalPrice(table.order, table.tableId);
  billAmount.setAttribute("id", table.tableId);

  subText.appendChild(totalItems);
  subText.appendChild(billAmount);

  cardBody.appendChild(cardTitle);
  cardBody.appendChild(subText);

  card.appendChild(cardBody);

  tableContainer.appendChild(card);
}

function getTotalPrice(orderList, tableId) {
  let billAmount = 0;
  orderList.forEach((item) => {
    billAmount =
      billAmount + item.itemPrice * getServingCount(tableId, item.itemName);
  });
  return billAmount;
}

function getItemObject(dropedData) {
  let values = dropedData.split("\n");
  let name = values[0];
  let price = Number(values[1].replace("₹", ""));
  let itemObject = { itemName: name, itemPrice: price };

  return itemObject;
}

function genrateModal(targetTableId) {
  let orderList = getTableOrderListById(targetTableId);
  if (orderList.length === 0) {
    handleModalClose();
    setTimeout(() => {
      alert("No Items Ordered from this Table");
    }, 0);
    return;
  }
  modal.innerHTML = "";
  modal.appendChild(createModal(targetTableId));
  modal.style.display = "block";
  modal.classList.remove("fade");
  root.style.opacity = 0.5;
}

function createModal(targetTableId) {
  const modalDiv = document.createElement("div");
  let modalClassList = ["modal-dialog", "modal-dialog-centered", "modal-lg"];
  modalDiv.classList.add(...modalClassList);

  const modalContentDiv = document.createElement("div");
  modalContentDiv.classList.add("modal-content");

  modalContentDiv.appendChild(genrateModalHeader(targetTableId));
  modalContentDiv.appendChild(genrateModalBody(targetTableId));
  modalContentDiv.appendChild(getModalFooterDiv(targetTableId));

  modalDiv.appendChild(modalContentDiv);
  return modalDiv;
}

function genrateModalHeader(targetTableId) {
  const modalHeaderDiv = document.createElement("div");
  modalHeaderDiv.classList.add("modal-header", "custom-header");

  const modalTitle = document.createElement("h5");
  modalTitle.classList.add("modal-title");
  let currentTableName = getTableNameById(targetTableId);
  modalTitle.innerText = `${currentTableName} | Order Details`;

  const closeBtn = document.createElement("a");
  closeBtn.setAttribute("id", "modal-close-btn");
  closeBtn.innerHTML = ` <span>&times;</span>`;
  closeBtn.addEventListener("click", handleModalClose);

  modalHeaderDiv.appendChild(modalTitle);
  modalHeaderDiv.appendChild(closeBtn);

  return modalHeaderDiv;
}

function genrateModalBody(targetTableId) {
  const modalBodyDiv = document.createElement("div");
  modalBodyDiv.classList.add("modal-body");

  const orderTable = document.createElement("table");
  orderTable.classList.add("table", "table-borderless");

  const tableHead = getTableHeaderElement();
  orderTable.appendChild(tableHead);

  let orderList = getTableOrderListById(targetTableId);
  orderList.forEach((orderItem, index) => {
    orderTable.appendChild(getTableRow(index + 1, orderItem, targetTableId));
  });

  modalBodyDiv.appendChild(orderTable);
  modalBodyDiv.appendChild(getBillAmountDiv(orderList, targetTableId));
  return modalBodyDiv;
}

function getTableHeaderElement() {
  const thead = document.createElement("thead");
  const tr = document.createElement("tr");
  const colNameList = ["S.No", "Item", "Price", "Servings"];
  colNameList.forEach((colName) => {
    const th = document.createElement("th");
    th.setAttribute("scope", "col");
    th.innerText = colName;
    tr.appendChild(th);
  });
  thead.appendChild(tr);
  return thead;
}

function getTableRow(itemNumber, item, tableId) {
  const tr = document.createElement("tr");

  const th = document.createElement("th");
  th.setAttribute("scope", "row");
  th.innerText = itemNumber;

  tr.appendChild(th);
  tr.appendChild(getDetailNameText(item.itemName));
  tr.appendChild(getDetailPriceText(item.itemPrice));
  tr.appendChild(getServingInput(item.itemName, tableId));
  tr.appendChild(getItemDeleteButton(item.itemName, tableId));
  return tr;
}

function getDetailNameText(data) {
  const td = document.createElement("td");
  td.innerText = data;
  return td;
}
function getDetailPriceText(data) {
  const td = document.createElement("td");
  td.innerText = `₹ ${data}.00`;
  return td;
}
function getServingInput(itemName, tableId) {
  const td = document.createElement("td");
  const servInput = document.createElement("input");
  servInput.classList.add("form-control", "col-2");
  servInput.setAttribute("type", "number");
  servInput.setAttribute("min", "1");
  servInput.setAttribute("id", `${tableId}@${itemName}`);
  let qty = getServingCount(tableId, itemName);
  servInput.setAttribute("value", qty);
  servInput.addEventListener("change", handleQtyChange);
  td.appendChild(servInput);
  return td;
}

function getItemDeleteButton(itemName, tableId) {
  const td = document.createElement("td");
  const delButton = document.createElement("button");
  delButton.classList.add("btn");
  delButton.addEventListener("click", handleItemDelete);
  const icon = document.createElement("span");
  icon.classList.add("material-icons");
  icon.innerText = "delete";
  icon.setAttribute("id", `${tableId}@${itemName}`);
  delButton.appendChild(icon);

  td.appendChild(delButton);
  return td;
}

function getBillAmountDiv(orderList, tableId) {
  const div = document.createElement("div");
  const h6 = document.createElement("h6");
  h6.classList.add("center-align");
  let billAmount = getTotalPrice(orderList, tableId);
  h6.innerText = `Total Bill Amount: ₹ ${billAmount} .00`;
  div.appendChild(h6);
  return div;
}

function getModalFooterDiv(tableId) {
  const footerDiv = document.createElement("div");
  footerDiv.classList.add("modal-footer");
  const billButton = document.createElement("button");
  billButton.classList.add("btn", "btn-outline-primary");
  billButton.innerText = "Genrate Bill";
  billButton.setAttribute("id", tableId);
  billButton.addEventListener("click", handleGenrateBill);
  footerDiv.appendChild(billButton);

  return footerDiv;
}

function handleDrop(dropEvent) {
  dropEvent.preventDefault();

  let data = dropEvent.dataTransfer.getData("text");
  let obj = getItemObject(data);

  let tableId = Number(dropEvent.target.id);
  addOrderItemToTable(tableId, obj);

  loadTableList(getAllTableData());
}

function handleDragOver(dragOverEvent) {
  dragOverEvent.preventDefault();
}

function handleDragEnter(dragEnterEvent) {
  dragEnterEvent.preventDefault();
}
function handleClick(event) {
  let targetTableId = Number(event.target.id);
  if (targetTableId === 0) return;
  genrateModal(targetTableId);
}

function handleModalClose(event) {
  modal.style.display = "none";
  modal.classList.add("fade");
  root.style.opacity = 1;
  modal.innerHTML = "";
  handlePageLoad();
}
function handleQtyChange(event) {
  let key = event.target.id;
  let val = Number(event.target.value);
  updateServing(key, val);
  let tableId = Number(key.split("@")[0]);
  genrateModal(tableId);
}

function handleItemDelete(event) {
  let key = event.target.id;
  let tableId = Number(key.split("@")[0]);
  let itemName = key.split("@")[1];
  deleteOrderItemFromTable(tableId, itemName);
  deleteServing(key);
  genrateModal(tableId);
}

function handleGenrateBill(event) {
  handleModalClose();
  let billTableId = event.target.id;
  clearOfTable(Number(billTableId));
  setTimeout(() => {
    alert("Thank You Visit Us Again :)");
  }, 0);
}

function clearOfTable(tableId) {
  let orderList = getTableOrderListById(tableId);
  orderList.forEach((item) => {
    let key = `${tableId}@${item.itemName}`;
    deleteServing(key);
  });
  makeTableOrderEmpty(tableId);
  handlePageLoad();
}
