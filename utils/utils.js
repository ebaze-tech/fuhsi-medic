// Helper function to check and add page
const checkPageBreak = (doc, contentHeight, margin = 50) => {
  const pageHeight = doc.page.height;
  if (doc.y + contentHeight > pageHeight - margin) {
    doc.addPage();
  }
};

// Helper to draw a table
const renderTableWithBorders = (doc, startY, rows, headers, colWidths) => {
  let y = startY;
  const tableLeft = 50;
  const colPositions = [tableLeft];
  const minRowHeight = 33; // Minimum row height
  const padding = 5; // Padding for text inside cells

  // Calculate column positions based on widths
  for (let i = 0; i < colWidths.length; i++) {
    colPositions.push(colPositions[i] + colWidths[i]);
  }

  // Draw header background
  const headerHeight = minRowHeight;
  doc
    .rect(
      tableLeft,
      y,
      colWidths.reduce((a, b) => a + b),
      headerHeight
    )
    .fillAndStroke("#f0f0f0", "black");

  // Draw header text
  doc.fillColor("black").font("Helvetica-Bold").fontSize(11);
  headers.forEach((text, i) => {
    doc.text(text, colPositions[i] + padding, y + padding, {
      width: colWidths[i] - 2 * padding,
      align: i === 0 ? "left" : "center",
    });
  });

  y += headerHeight;

  doc.font("Helvetica").fontSize(10);

  // Draw table rows
  let tableHeight = headerHeight; // Start with header height
  rows.forEach((row, rowIndex) => {
    // Calculate the required height for this row based on the first column's text
    const firstCellText = row[0];
    const firstCellHeight = doc.heightOfString(firstCellText, {
      width: colWidths[0] - 2 * padding,
    });
    const rowHeight = Math.max(minRowHeight, firstCellHeight + 2 * padding);

    // Check if row fits on current page
    if (y + rowHeight > doc.page.height - 50) {
      doc.addPage();
      y = 50;

      // Redraw headers on new page
      doc
        .rect(
          tableLeft,
          y,
          colWidths.reduce((a, b) => a + b),
          headerHeight
        )
        .fillAndStroke("#f0f0f0", "black");

      doc.fillColor("black").font("Helvetica-Bold").fontSize(11);
      headers.forEach((text, i) => {
        doc.text(text, colPositions[i] + padding, y + padding, {
          width: colWidths[i] - 2 * padding,
          align: i === 0 ? "left" : "center",
        });
      });

      y += headerHeight;
      doc.font("Helvetica").fontSize(10);
    }

    // Draw row background
    doc
      .fillColor("white")
      .rect(
        tableLeft,
        y,
        colWidths.reduce((a, b) => a + b),
        rowHeight
      )
      .fill();

    // Explicitly set the text color to black for the row text
    doc.fillColor("black");

    // Draw each cell in row
    row.forEach((cell, i) => {
      doc.text(cell, colPositions[i] + padding, y + padding, {
        width: colWidths[i] - 2 * padding,
        align: i === 0 ? "left" : "center",
      });

      // Draw vertical line between columns
      doc
        .moveTo(colPositions[i + 1], y)
        .lineTo(colPositions[i + 1], y + rowHeight)
        .stroke();
    });

    // Draw bottom line for the row
    doc
      .moveTo(tableLeft, y + rowHeight)
      .lineTo(colPositions[colPositions.length - 1], y + rowHeight)
      .stroke();

    y += rowHeight;
    tableHeight += rowHeight;
  });

  // Draw left border of the table
  doc
    .moveTo(tableLeft, startY)
    .lineTo(tableLeft, startY + tableHeight)
    .stroke();

  // Draw right border of the table
  doc
    .moveTo(colPositions[colPositions.length - 1], startY)
    .lineTo(colPositions[colPositions.length - 1], startY + tableHeight)
    .stroke();

  return y;
};

module.exports = { checkPageBreak, renderTableWithBorders }