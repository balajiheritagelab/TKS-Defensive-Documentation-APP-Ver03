let db;

function initDB() {
  const request = indexedDB.open("TKS_DB", 1);

  request.onupgradeneeded = function (e) {
    db = e.target.result;
    db.createObjectStore("records", { keyPath: "uuid" });
  };

  request.onsuccess = function (e) {
    db = e.target.result;
  };
}

function saveRecord(record) {
  const tx = db.transaction(["records"], "readwrite");
  const store = tx.objectStore("records");
  store.put(record);
}

function getAllRecords(callback) {
  const tx = db.transaction(["records"], "readonly");
  const store = tx.objectStore("records");
  const request = store.getAll();
  request.onsuccess = () => callback(request.result);
}

initDB();
