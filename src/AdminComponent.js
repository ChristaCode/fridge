import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTable } from 'react-table';
import './AdminComponent.css';

function AdminPanel() {
  const [tablesData, setTablesData] = useState({
    ingredients: [],
    recipes: [],
    users: [],
  });

  useEffect(() => {
    const fetchTableData = async (apiUrl, tableName) => {
      try {
        const response = await axios.get(apiUrl);
        setTablesData(prevState => ({
          ...prevState,
          [tableName]: response.data,
        }));
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };

    fetchTableData('/ingredients', 'ingredients');
    fetchTableData('/recipes', 'recipes');
    fetchTableData('/users', 'users');
  }, []);

  const columnsIngredients = [
    { Header: 'ID', accessor: 'ingredient_id' },
    { Header: 'Name', accessor: 'name' },
    { Header: 'Name', accessor: 'description' }
  ];

  const columnsRecipes = [
    { Header: 'ID', accessor: 'id' },
    { Header: 'Title', accessor: 'title' },
    { Header: 'Description', accessor: 'description' },
  ];

  const columnsUsers = [
    { Header: 'ID', accessor: 'user_id' },
    { Header: 'Username', accessor: 'username' },
    { Header: 'Email', accessor: 'email' },
  ];

  const Table = ({ data, columns }) => {
    const {
      getTableProps,
      getTableBodyProps,
      headerGroups,
      rows,
      prepareRow,
    } = useTable({ columns, data });

    return (
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps()}>{column.render('Header')}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map(row => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => (
                  <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <div>
      <h1>Admin Panel</h1>
      <Table data={tablesData.ingredients} columns={columnsIngredients} />
      {/* <Table data={tablesData.recipes} columns={columnsRecipes} />
      <Table data={tablesData.users} columns={columnsUsers} /> */}
    </div>
  );
}

export default AdminPanel;
