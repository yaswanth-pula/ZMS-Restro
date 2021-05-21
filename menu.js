let menuData = [];
async function readData() {
  await fetch("db.json")
    .then((res) => res.json())
    .then((data) => {
      menuData = data.menuItems;
    });
}

// menu operations
function getAllData() {
  return menuData;
}

// itemList : []
function getItemsByName(searchName) {
  return menuData.filter((item) => doesExist(item.name, searchName));
}

function getItemsByType(searchType) {
  return menuData.filter((item) => doesExist(item.type, searchType));
}

function doesExist(main, sub) {
  main = main.toLowerCase();
  sub = sub.trim().toLowerCase();
  return main.indexOf(sub) !== -1;
}

// exports
export { readData, getAllData, getItemsByType, getItemsByName, doesExist };
