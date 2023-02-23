let db;
const request = indexedDB.open("pizza_hunt", 1);

// create changes if db changes
request.onupgradeneeded = function (event) {
	const db = event.target.result;
	// create object to store (new_pizza) data of
	db.createObjectStore("new_pizza", { autoIncrement: true });
};

request.onsuccess = function (event) {
	// When successful creation, save to global variable
	db = event.target.result;

	if (navigator.online) {
		uploadPizza();
		print(navigator.geolocation);
	}
};

// log error if occur
request.onerror = function (event) {
	console.log(event.target.errorCode);
};

// execute if there's no internet
function saveRecord(record) {
	// set store and record pizza
	db.transaction(["new_pizza"], "readwrite")
		.objectStore("new_pizza")
		.add(record);
}

function uploadPizza() {
	const getAll = db
		.transaction(["new_pizza"], "readwrite")
		.objectStore("new_pizza")
		.getAll();

	getAll.onsuccess = function () {
		if (getAll.result.length > 0) {
			fetch("/api/pizzas", {
				method: "POST",
				body: JSON.stringify(getAll.result),
				headers: {
					Accept: "application/json, text/plain, */*",
					"Content-Type": "application/json",
				},
			})
				.then((response) => response.json())
				.then((serverResponse) => {
					if (serverResponse.message) {
						throw new Error(serverResponse);
					}
					db.transaction(["new_pizza"], "readwrite")
						.objectStore("new_pizza")
						.clear();

					alert("All saved pizzas have been submitted");
				})
				.catch((err) => {
					console.log(err);
				});
		}
	};
}

window.addEventListener("online", uploadPizza);
