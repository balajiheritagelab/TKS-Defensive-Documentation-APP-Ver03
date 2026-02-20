function exportRecord(record) {
  const blob = new Blob([JSON.stringify(record, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `TKS_Record_${record.uuid}.json`;
  a.click();
}
