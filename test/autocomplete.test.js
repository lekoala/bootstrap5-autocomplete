import Autocomplete from "../autocomplete.js";
import test from "ava";

let form = document.createElement("form");
// Make our form available to jsdom
document.body.appendChild(form);

let singleEl = document.createElement("input");
singleEl.classList.add("autocomplete");
form.appendChild(singleEl);

let disabledEl = document.createElement("input");
disabledEl.classList.add("autocomplete");
disabledEl.setAttribute("disabled", "");
form.appendChild(disabledEl);

// Somehow new Event syntax is not working
Event = window.Event;

test("it can create", (t) => {
  let inst = new Autocomplete(singleEl);
  t.is(inst.constructor.name, "Autocomplete");
});
test("it can use init", (t) => {
  Autocomplete.init("input.autocomplete");
  let inst = Autocomplete.getInstance(singleEl);
  t.is(inst.constructor.name, "Autocomplete");
});
test("it can be disabled", (t) => {
  let disabledTags = Autocomplete.getInstance(disabledEl);
  let regularTags = Autocomplete.getInstance(singleEl);
  t.truthy(disabledTags.isDisabled());
  t.falsy(regularTags.isDisabled());
});
test("it doesn't contain debug log", (t) => {
  let count = (Autocomplete.toString().match(/console\.log/g) || []).length;
  t.is(count, 0, "The dev should pay more attention");
});
