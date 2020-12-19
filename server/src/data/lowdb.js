import low from 'lowdb';
import Memory from 'lowdb/adapters/Memory';

const db = low(new Memory());

db.defaults({
  users: [
    {
      id: '23121d3c-84df-44ac-b458-3d63a9a05497',
      email: 'foo@example.com',
      email_verified: true,
    },
    {
      id: 'c2ac2b4a-2262-4e2f-847a-a40dd3c4dcd5',
      email: 'bar@example.com',
      email_verified: false,
    },
  ],
}).write();

export default db;
