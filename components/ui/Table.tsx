
import React from 'react';

interface TableColumn<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string; // For column specific styling
  headerClassName?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  getRowClassName?: (item: T) => string;
}

const Table = <T extends object,>({ columns, data, getRowClassName }: TableProps<T>): React.ReactNode => {
  return (
    <div className="overflow-x-auto bg-dark-card shadow-md rounded-lg">
      <table className="min-w-full divide-y divide-dark-border">
        <thead className="bg-gray-700">
          <tr>
            {columns.map((col, index) => (
              <th
                key={index}
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider ${col.headerClassName || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-dark-card divide-y divide-dark-border">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-secondary text-center">
                No hay datos disponibles.
              </td>
            </tr>
          ) : (
            data.map((item, rowIndex) => (
              <tr key={rowIndex} className={getRowClassName ? getRowClassName(item) : ''}>
                {columns.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className={`px-6 py-4 whitespace-nowrap text-sm ${col.className || 'text-dark-text-primary'}`}
                  >
                    {typeof col.accessor === 'function'
                      ? col.accessor(item)
                      : String(item[col.accessor] !== null && item[col.accessor] !== undefined ? item[col.accessor] : '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
    