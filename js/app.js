let currentStep = 1;
let record = {};

function startNew() {
  document.getElementById("home").classList.add("hidden");
  document.getElementById("form-section").classList.remove("hidden");
  document.getElementById("records-section").classList.add("hidden");

  currentStep = 1;
  record = {
    uuid: generateUUID(),
    created_at: new Date().toISOString()
  };

  renderStep();
}

function goHome() {
  document.getElementById("records-section").classList.add("hidden");
  document.getElementById("form-section").classList.add("hidden");
  document.getElementById("home").classList.remove("hidden");
}

function viewRecords() {
  document.getElementById("home").classList.add("hidden");
  document.getElementById("form-section").classList.add("hidden");
  document.getElementById("records-section").classList.remove("hidden");

  renderRecords();
}

function renderRecords() {
  getAllRecords(records => {
    const container = document.getElementById("records-list");
    container.innerHTML = "";

    if (records.length === 0) {
      container.innerHTML = "<p>No saved records.</p>";
      return;
    }

    records.forEach(r => {
      const div = document.createElement("div");

      div.innerHTML = `
        <strong>${r.craft_name}</strong><br/>
        ${r.created_at}<br/>
        Hash: ${r.record_hash ? r.record_hash.substring(0, 16) + "..." : "Draft"}<br/>
        <button onclick='exportRecord(${JSON.stringify(r)})'>Export</button>
        <button onclick="deleteRecord('${r.uuid}')">Delete</button>
        <hr/>
      `;

      container.appendChild(div);
    });
  });
}

function renderStep() {
  const indicator = document.getElementById("step-indicator");
  indicator.innerText = `Step ${currentStep} of 4`;

  const content = document.getElementById("step-content");

  if (currentStep === 1) {
    content.innerHTML = `
      <h2>Craft Identification</h2>
      <input id="craft_name" placeholder="Craft Name"/>
      <input id="local_name" placeholder="Local Name"/>
      <select id="category">
        <option value="">Select Category</option>
        <option>Weaving</option>
        <option>Pottery</option>
        <option>Metalwork</option>
        <option>Woodcraft</option>
      </select>
    `;
  }

  if (currentStep === 2) {
    content.innerHTML = `
      <h2>Practitioner</h2>
      <input id="practitioner" placeholder="Practitioner Name"/>
      <input id="community" placeholder="Community"/>
      <select id="transmission">
        <option>Familial</option>
        <option>Apprenticeship</option>
        <option>Guild</option>
      </select>
    `;
  }

  if (currentStep === 3) {
    content.innerHTML = `
      <h2>Materials</h2>
      <textarea id="materials" placeholder="List materials used"></textarea>
    `;
  }

  if (currentStep === 4) {
    content.innerHTML = `
      <h2>Finalize</h2>
      <p>Click Next to finalize and generate record hash.</p>
    `;
  }
}

function nextStep() {
  if (currentStep === 1) {
    record.craft_name = document.getElementById("craft_name").value;
    record.local_name = document.getElementById("local_name").value;
    record.category = document.getElementById("category").value;
  }

  if (currentStep === 2) {
    record.practitioner = document.getElementById("practitioner").value;
    record.community = document.getElementById("community").value;
    record.transmission = document.getElementById("transmission").value;
  }

  if (currentStep === 3) {
    record.materials = document.getElementById("materials").value;
  }

  if (currentStep === 4) {
    finalizeRecord();
    return;
  }

  currentStep++;
  renderStep();
}

function prevStep() {
  if (currentStep > 1) {
    currentStep--;
    renderStep();
  }
}

async function finalizeRecord() {
  record.last_modified = new Date().toISOString();
  record.record_hash = await hashObject(record);

  saveRecord(record);

  alert("Record saved successfully!");

  document.getElementById("form-section").classList.add("hidden");
  document.getElementById("records-section").classList.remove("hidden");

  renderRecords();
}

function deleteRecord(uuid) {
  const tx = db.transaction(["records"], "readwrite");
  const store = tx.objectStore("records");
  store.delete(uuid);

  tx.oncomplete = function () {
    renderRecords();
  };
}