// C:\Users\Daniel Lopez\Documents\devsecops\React\proyectox\frontend\components\ui\table.tsx

export const Table = ({ children }: { children: React.ReactNode }) => (
    <table className="min-w-full divide-y divide-gray-200">{children}</table>
  );
  
  export const Thead = ({ children }: { children: React.ReactNode }) => (
    <thead className="bg-gray-50">{children}</thead>
  );
  
  export const Tbody = ({ children }: { children: React.ReactNode }) => (
    <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>
  );
  
  export const Tr = ({ children }: { children: React.ReactNode }) => (
    <tr>{children}</tr>
  );
  
  export const Th = ({ children }: { children: React.ReactNode }) => (
    <th
      scope="col"
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
    >
      {children}
    </th>
  );
  
  export const Td = ({ children }: { children: React.ReactNode }) => (
    <td className="px-6 py-4 whitespace-nowrap">{children}</td>
  );
  