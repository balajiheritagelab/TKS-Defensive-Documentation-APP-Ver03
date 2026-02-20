let currentStep = 1;
let record = {};
let processSteps = [];

function startNew() {
  document.getElementById("home").classList.add("hidden");
  document.getElementById("records-section").classList.add("hidden");
  document.getElementById("form-section").classList.remove("hidden");

  currentStep = 1;
  processSteps = [];

  record = {
    uuid: generateUUID(),
    created_at: new Date().toISOString(),
    craft: {},
    practitioner: {},
    materials: [],
    process_steps: []
  };

  renderStep();
}

function goHome() {
  document.getElementById("form-section").classList.add("hidden");
  document.getElementById("records-section").classList.add("hidden");
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

    if (!records.length) {
      container.innerHTML = "<p>No records saved.</p>";
      return;
    }

    records.forEach(r => {
      const div = document.createElement("div");
      div.innerHTML = `
        <strong>${r.craft.name}</strong><br/>
        ${r.created_at}<br/>
        Hash: ${r.record_hash.substring(0,16)}...<br/>
        <button onclick='exportRecord(${JSON.stringify(r)})'>Export</button>
        <button onclick="deleteRecord('${r.uuid}')">Delete</button>
        <hr/>
      `;
      container.appendChild(div);
    });
  });
}

function renderStep() {
  document.getElementById("step-indicator").innerText =
    `Step ${currentStep} of 5`;

  const content = document.getElementById("step-content");

  if (currentStep === 1) {
    content.innerHTML = `
      <h2>Craft Identification</h2>
      <input id="craft_name" placeholder="Craft Name"/>
      <input id="local_name" placeholder="Local Name"/>
      <select id="category">
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
      <textarea id="materials" placeholder="Comma separated materials"></textarea>
    `;
  }

  if (currentStep === 4) {
    content.innerHTML = `
      <h2>Process Documentation</h2>
      <textarea id="step_description" placeholder="Describe step"></textarea>
      <input type="file" accept="image/*" id="step_image"/>
      <button onclick="addProcessStep()">Add Step</button>
      <div id="process-list"></div>
    `;
    renderProcessList();
  }

  if (currentStep === 5) {
    content.innerHTML = `
      <h2>Finalize</h2>
      <p>Click Next to generate cryptographic hash and save record.</p>
    `;
  }
}

function nextStep() {
  if (currentStep === 1) {
    record.craft = {
      name: document.getElementById("craft_name").value,
      local_name: document.getElementById("local_name").value,
      category: document.getElementById("category").value
    };
  }

  if (currentStep === 2) {
    record.practitioner = {
      name: document.getElementById("practitioner").value,
      community: document.getElementById("community").value,
      transmission: document.getElementById("transmission").value
    };
  }

  if (currentStep === 3) {
    record.materials =
      document.getElementById("materials").value.split(",");
  }

  if (currentStep === 4) {
    record.process_steps = processSteps;
  }

  if (currentStep === 5) {
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

function addProcessStep() {
  const desc = document.getElementById("step_description").value;
  const file = document.getElementById("step_image").files[0];

  if (!desc || !file) return alert("Add description and image.");

  compressImage(file, async (base64) => {
    const hash = await hashObject(base64);

    processSteps.push({
      step_no: processSteps.length + 1,
      description: desc,
      image: base64,
      image_hash: hash
    });

    renderProcessList();
  });
}

function renderProcessList() {
  const container = document.getElementById("process-list");
  if (!container) return;

  container.innerHTML = processSteps.map(s => `
    <div>
      <strong>Step ${s.step_no}</strong>
      <p>${s.description}</p>
      <img src="${s.image}" width="100"/>
      <hr/>
    </div>
  `).join("");
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

  tx.oncomplete = renderRecords;
}
