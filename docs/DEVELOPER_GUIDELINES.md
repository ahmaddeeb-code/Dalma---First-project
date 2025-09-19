Developer Guidelines — Forms & Table Actions

Purpose

- Ensure consistent UX across the app for: required-field marking and table-level actions (Add / Export / Page size).

Files & Components to use

- Label (client/components/ui/label.tsx)
  - Accepts requiredMark?: boolean and auto-detects an associated control when possible.
  - Use requiredMark when you know a field is mandatory and cannot rely on native input.required detection.

- Form primitives (client/components/ui/form.tsx)
  - Use FormLabel + FormControl when building react-hook-form driven forms — FormLabel auto-detects requiredness from the FormControl by id.

- TableToolbar (client/components/ui/table-toolbar.tsx)
  - Use this component for all pages containing lists/tables. It centralizes Add, Export (CSV/XLSX/PDF), and Page size.
  - Props: onAdd, addLabel, onExport(type), pageSize, onPageSizeChange, pageSizeOptions, children.

How to apply (short examples)

- Marking required fields:
  - If you are adding an uncontrolled input and it must be required:
    <Label requiredMark>Full name</Label>
    <Input required />

  - If using react-hook-form FormItem/FormControl/FormLabel:
    <FormItem>
    <FormLabel>Full name</FormLabel>
    <FormControl>
    <input required />
    </FormControl>
    <FormMessage />
    </FormItem>
    FormLabel will pick up the requiredness and display the red asterisk automatically.

- Adding toolbar above a table (recommended pattern):
  1. Import TableToolbar:
     import TableToolbar from "@/components/ui/table-toolbar";

  2. Place it immediately above the table wrapper (before the Table element) and wire handlers:
     <div className="mb-3">
       <TableToolbar
         onAdd={() => setAddOpen(true)}
         addLabel="Add Employee"
         onExport={async (type) => {
           const cols = [ { header: 'Name', accessor: (r) => r.name }, ... ];
           const { exportAll } = await import('@/lib/export');
           exportAll(pageItems, cols, type, 'employees');
         }}
         pageSize={pageSize}
         onPageSizeChange={(n) => setPageSize(n)}
       />
     </div>
     <Table>...</Table>

Guidelines / Best practices

- Always place table-level actions above the table; put filters/search in the surrounding CardHeader or left side and the table actions toolbar directly above the table content.
- Keep the Add button visually prominent (primary/default).
- Export buttons should be secondary/outline and grouped together.
- Provide sensible page size options: [10, 25, 50, 100]. Persist choice per-user if needed (future improvement).
- Ensure responsive behavior: toolbar uses flex-wrap so controls wrap on small screens — prefer short labels for small screens.
- For accessibility: ensure TableToolbar action buttons have clear accessible text (icons must have visible label or aria-label where used alone).

When to customize

- If a table has special actions (bulk archive/delete, saved views), pass those as children to TableToolbar so they remain grouped with other actions.
- If exporting requires server-side data (very large data set), implement onExport to request the server endpoint and stream/download the result.

Developer checklist before merging

- New list pages: include TableToolbar above the Table and wire handlers.
- New form pages: use FormLabel + FormControl where possible; otherwise use Label with requiredMark and set the input's required attribute.
- Visually test on narrow screens to confirm wrapping and overflow.

Questions or automation

- If you'd like, I can add a lint rule or an ESLint codemod suggestion to warn when a page contains a Table without a TableToolbar; say the word and I will add a checklist or simple script.

Thank you — follow these rules to keep UI consistent and accessible across the app.
