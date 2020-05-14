/* global $rdf, solid */
import "./rdflib.min.js";
import "./solid-auth-client.bundle.js";

const FOAF = $rdf.Namespace("http://xmlns.com/foaf/0.1/");

const [profile, user, login, logout] = [
  document.querySelector("#profile"),
  document.querySelector("#user"),
  document.querySelector("#login"),
  document.querySelector("#logout"),
];

// Log the user in and out on click
const popupUri = "popup.html";
login
  .querySelector("button")
  .addEventListener("click", (e) => solid.auth.popupLogin({ popupUri }));
logout
  .querySelector("button")
  .addEventListener("click", (e) => solid.auth.logout());

// Update components to match the user's login status
solid.auth.trackSession((session) => {
  login.toggleAttribute("hidden");
  logout.toggleAttribute("hidden");
  
  // check if logged in
  if (!!session) {    
    user.textContent = session.webId;
    // Use the user's WebID as default profile
    if (!profile.value) profile.value = session.webId;
  }
});

document.querySelector("#view").addEventListener("click", async (e) => {
  // Set up a local data store and associated data fetcher
  const store = $rdf.graph();
  const fetcher = new $rdf.Fetcher(store);

  // Load the person's data into the store
  const person = profile.value;
  await fetcher.load(person);

  // Display their details
  const fullName = store.any($rdf.sym(person), FOAF("name"));
  document.querySelector("#fullName").textContent = fullName && fullName.value;

  // Display their friends
  const friends = store.each($rdf.sym(person), FOAF("knows"));
  const friendList = document.querySelector("#friends");
  friendList.textContent = null;

  friends.forEach(async (friend) => {
    await fetcher.load(friend);
    const fullName = store.any(friend, FOAF("name"));

    // Build the list item to append to the DOM
    const listItem = document.createElement("li");
    const friendLink = document.createElement("a");
    friendLink.textContent = (fullName && fullName.value) || friend.value;
    friendLink.addEventListener("click", (e) => {
      profile.value = friend.value;
    });
    listItem.appendChild(friendLink);
    friendList.appendChild(listItem);
  });
});
