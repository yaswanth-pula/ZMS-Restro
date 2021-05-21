import { doesExist } from "./menu.js";
const LOCAL_STORE_KEY = "tablesData";

function createTablesIfNotExist() {
  if (sessionStorage.getItem(LOCAL_STORE_KEY) !== null) return;
  let baseTableObject = {
    tables: [
      { tableId: 701, name: "Table-1", order: [], billAmount: 0.0 },
      { tableId: 702, name: "Table-2", order: [], billAmount: 0.0 },
      { tableId: 703, name: "Table-3", order: [], billAmount: 0.0 },
    ],
  };
  sessionStorage.setItem(LOCAL_STORE_KEY, JSON.stringify(baseTableObject));
}

function getAllTableData() {
  let tableData = sessionStorage.getItem(LOCAL_STORE_KEY);
  tableData = JSON.parse(tableData);

  return tableData.tables;
}

function getTableListByName(queryTableName) {
  let tables = getAllTableData();
  let queryTableList = tables.filter((table) =>
    doesExist(table.name, queryTableName)
  );
  return queryTableList;
}

function getTableById(queryTableId) {
  let tables = getAllTableData();
  let queryTable = tables.filter((table) => table.tableId === queryTableId);
  return queryTable[0];
}
function getTableNameById(tableId) {
  let resTable = getTableById(tableId);
  return resTable.name;
}
function getTableOrderListById(tableId) {
  let resTable = getTableById(tableId);
  return resTable.order;
}

function addOrderItemToTable(orderTableId, orderItem) {
  if (orderTableId < 700) return;

  let currentTable = getTableById(orderTableId);
  let currentTableOrders = currentTable.order;

  if (isNewItem(currentTableOrders, orderItem))
    currentTableOrders.push(orderItem);

  incrementServing(orderTableId, orderItem.itemName);
  currentTable.order = currentTableOrders;

  updateTable(currentTable);
}

function isNewItem(orderList, orderItem) {
  for (let im of orderList) {
    if (im.itemName === orderItem.itemName) return false;
  }
  return true;
}

function deleteOrderItemFromTable(tableId, deleteItemName) {
  let currentTable = getTableById(tableId);
  let currentTableOrders = currentTable.order;
  currentTableOrders = currentTableOrders.filter(
    (val) => val.itemName !== deleteItemName
  );
  currentTable.order = currentTableOrders;
  updateTable(currentTable);
}
function makeTableOrderEmpty(tableId) {
  let currentTable = getTableById(tableId);
  currentTable.order = [];
  updateTable(currentTable);
}

function updateTable(currentTable) {
  let tables = getAllTableData();
  tables = tables.map((table) => {
    if (table.tableId === currentTable.tableId) {
      table = currentTable;
    }
    return table;
  });
  updateStorageData(tables);
}

function updateStorageData(tableList) {
  let updatedObject = { tables: tableList };
  sessionStorage.setItem(LOCAL_STORE_KEY, JSON.stringify(updatedObject));
}

function debugPrint() {
  console.log(getAllTableData());
  console.log(getTableById(701));
  console.log(addOrderItemToTable(701, 101));
}

// session store js
function getQtyOrderData(key) {
  let orderData = sessionStorage.getItem(key);
  if (orderData === null) return 0;
  return JSON.parse(orderData);
}
function getServingCount(tableId, itemName) {
  let storageKey = tableId + "@" + itemName;
  return getQtyOrderData(storageKey);
}

function incrementServing(tableId, itemName) {
  let storageKey = tableId + "@" + itemName;
  let qty = getQtyOrderData(storageKey);
  sessionStorage.setItem(storageKey, qty + 1);
}

function updateServing(key, updatedValue) {
  sessionStorage.setItem(key, updatedValue);
}

function deleteServing(key) {
  sessionStorage.removeItem(key);
}

export {
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
};
