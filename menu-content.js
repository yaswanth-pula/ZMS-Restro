import { getAllData, readData, getItemsByName } from "./menu.js";

// DOM
document.addEventListener("DOMContentLoaded", onPageLoad);
const itemContainerElement = document.getElementById("item-container");
const itemSearchElement = document.getElementById("menu-item-search");
itemSearchElement.addEventListener("change", handleSearch);

function onPageLoad() {
  readData().then(() => {
    let menuItems = getAllData();
    loadMenuItems(menuItems);
  });
}

function loadMenuItems(menuItems) {
  itemContainerElement.innerHTML = "";
  menuItems.forEach((item) => {
    itemContainerElement.appendChild(createItemCardElement(item));
  });
}

function createItemCardElement(item) {
  let card = document.createElement("div");
  card.classList.add("card", "custom-card", "menu-card");
  card.setAttribute("draggable", true);
  card.addEventListener("dragstart", handleDragStart);
  card.addEventListener("dragend", handleDragEnd);

  let cardBody = document.createElement("div");
  cardBody.classList.add("card-body");

  let cardTitle = document.createElement("h5");
  cardTitle.classList.add("card-title");
  cardTitle.innerText = item.name;

  let cardPrice = document.createElement("h6");
  cardPrice.classList.add("card-text");
  cardPrice.innerHTML = "&#8377; " + item.price;

  let dishType = document.createElement("span");
  dishType.classList.add("badge", "bg-primary");
  dishType.innerText = item.type;

  cardBody.appendChild(cardTitle);
  cardBody.appendChild(cardPrice);
  cardBody.appendChild(dishType);
  card.appendChild(cardBody);

  return card;
}

function handleSearch() {
  let query = itemSearchElement.value;
  let result = getItemsByName(query);

  loadMenuItems(result);
}

// drag and drop
function handleDragStart(event) {
  event.target.classList.add("convert-small");
  event.dataTransfer.setData("text", event.target.innerText);
  setTimeout(() => {
    event.target.classList.remove("convert-small");
  }, 0);
}
function handleDragEnd(event) {
  // console.log("end :" + event);
}
