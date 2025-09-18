export type ColumnDef<T> = { header: string; accessor: (row: T) => any };

function downloadBlob(data: Blob, filename: string){
  const url = URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export function exportToCSV<T>(rows: T[], cols: ColumnDef<T>[], filename: string){
  const headers = cols.map(c=>`"${c.header.replace(/"/g,'""')}"`).join(",");
  const lines = rows.map(r => cols.map(c => {
    const v = c.accessor(r);
    const s = v==null? "" : String(v);
    return `"${s.replace(/"/g,'""')}"`;
  }).join(","));
  const csv = [headers, ...lines].join("\n");
  downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8;" }), filename.endsWith(".csv")?filename:`${filename}.csv`);
}

export async function exportToXLSX<T>(rows: T[], cols: ColumnDef<T>[], filename: string){
  const XLSX = await import("xlsx");
  const data = [cols.map(c=>c.header), ...rows.map(r=>cols.map(c=>c.accessor(r)))];
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, filename.endsWith(".xlsx")?filename:`${filename}.xlsx`);
}

export async function exportToPDF<T>(rows: T[], cols: ColumnDef<T>[], filename: string){
  const jsPDFmod = await import("jspdf");
  await import("jspdf-autotable");
  // @ts-ignore
  const doc = new jsPDFmod.jsPDF({ orientation: "landscape" });
  // @ts-ignore
  (doc as any).autoTable({ head: [cols.map(c=>c.header)], body: rows.map(r=>cols.map(c=>c.accessor(r))) });
  doc.save(filename.endsWith(".pdf")?filename:`${filename}.pdf`);
}

export async function exportAll<T>(rows: T[], cols: ColumnDef<T>[], type: "csv"|"xlsx"|"pdf", filename: string){
  if(type==="csv") return exportToCSV(rows, cols, filename);
  if(type==="xlsx") return exportToXLSX(rows, cols, filename);
  return exportToPDF(rows, cols, filename);
}
