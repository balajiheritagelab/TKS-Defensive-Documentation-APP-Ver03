function exportPDF(record) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("TKS Defensive Documentation Report", 10, 20);

  doc.setFontSize(12);
  doc.text(`Craft: ${record.craft.name}`, 10, 40);
  doc.text(`Category: ${record.craft.category}`, 10, 50);
  doc.text(`Practitioner: ${record.practitioner.name}`, 10, 60);
  doc.text(`Community: ${record.practitioner.community}`, 10, 70);

  doc.text(`Hash: ${record.record_hash}`, 10, 90);

  doc.save(`TKS_${record.uuid}.pdf`);
}