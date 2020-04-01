/* global $rdf, solid */ 

/* TODO: make more elegant by adding this function to the appropriate class or prototype */
var setVisibilityOf = (obj, boolean_value) => {
  boolean_value ? obj.style.display = "block" : obj.style.display = "none";
}

const FOAF = $rdf.Namespace('http://xmlns.com/foaf/0.1/');

// Log the user in and out on click
const popupUri = 'popup.html';
document.querySelector('#login  button').addEventListener("click", (e) => { 
  solid.auth.popupLogin({ popupUri });
});

document.querySelector('#logout button').addEventListener("click", (e) => { 
  solid.auth.logout();
})

// Update components to match the user's login status
solid.auth.trackSession(session => {
  const loggedIn = !!session;
  setVisibilityOf(document.querySelector('#login'), !loggedIn);
  setVisibilityOf(document.querySelector('#logout'), loggedIn);
  if (loggedIn) {
    document.querySelector('#user').textContent = session.webId;
    // Use the user's WebID as default profile
    if (!(document.querySelector('#profile').value))
      document.querySelector('#profile').value = session.webId;
  }
});

document.querySelector('#view').addEventListener("click", (e) => { 

async function loadProfile() {
  // Set up a local data store and associated data fetcher
  const store = $rdf.graph();
  const fetcher = new $rdf.Fetcher(store);

  // Load the person's data into the store
  const person = document.querySelector('#profile').value;
  await fetcher.load(person);

  // Display their details
  const fullName = store.any($rdf.sym(person), FOAF('name'));
  document.querySelector('#fullName').textContent = (fullName && fullName.value);

  // Display their friends
  const friends = store.each($rdf.sym(person), FOAF('knows'));
  
  document.querySelector('#friends').textContent = null;
  friends.forEach(async (friend) => {
    await fetcher.load(friend);
    const fullName = store.any(friend, FOAF('name'));
    document.querySelector('#friends').appendChild(
      document.querySelector('<li>').appendChild(
        document.querySelector('<a>').textContent = (fullName && fullName.value || friend.value)
                .addEventListener("click", (e) => { 
                  document.querySelector('#profile').textContent = friend.value;
                  })
                .addEventListener("click", (e) => { 
                  loadProfile
                  })));
  });
}
  loadProfile();
});
