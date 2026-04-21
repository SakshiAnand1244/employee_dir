import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri || !dbName) {
  console.error('Missing MONGODB_URI or MONGODB_DB. Populate .env.local first.');
  process.exit(1);
}

const departmentsSeed = [
  { name: 'Engineering', floor: 4 },
  { name: 'Operations', floor: 2 },
  { name: 'Design', floor: 3 },
  { name: 'People Success', floor: 5 },
];

const employeesSeed = [
  { name: 'Ananya Sharma', position: 'Senior Engineer', salary: 125000, departmentName: 'Engineering' },
  { name: 'Rohit Verma', position: 'Operations Lead', salary: 98000, departmentName: 'Operations' },
  { name: 'Maya Iyer', position: 'Product Designer', salary: 91000, departmentName: 'Design' },
  { name: 'Nikhil Rao', position: 'People Partner', salary: 87000, departmentName: 'People Success' },
  { name: 'Priya Nair', position: 'Staff Engineer', salary: 148000, departmentName: 'Engineering' },
];

async function seed() {
  const client = new MongoClient(uri);

  try {
    await client.connect();

    const db = client.db(dbName);
    const departments = db.collection('departments');
    const employees = db.collection('employees');
    const now = new Date();

    if (process.env.RESET_DB === '1') {
      await employees.deleteMany({});
      await departments.deleteMany({});
    }

    await departments.bulkWrite(
      departmentsSeed.map((department) => ({
        updateOne: {
          filter: { name: department.name },
          update: {
            $set: {
              floor: department.floor,
              updatedAt: now,
            },
            $setOnInsert: {
              name: department.name,
              createdAt: now,
            },
          },
          upsert: true,
        },
      })),
    );

    const departmentDocuments = await departments
      .find({ name: { $in: departmentsSeed.map((department) => department.name) } })
      .toArray();
    const departmentIds = new Map(departmentDocuments.map((department) => [department.name, department._id]));

    await employees.bulkWrite(
      employeesSeed.map((employee) => ({
        updateOne: {
          filter: {
            name: employee.name,
            position: employee.position,
          },
          update: {
            $set: {
              salary: employee.salary,
              departmentId: departmentIds.get(employee.departmentName),
              updatedAt: now,
            },
            $setOnInsert: {
              name: employee.name,
              position: employee.position,
              createdAt: now,
            },
          },
          upsert: true,
        },
      })),
    );

    const departmentCount = await departments.countDocuments();
    const employeeCount = await employees.countDocuments();

    console.log(`Seed complete. Departments: ${departmentCount}. Employees: ${employeeCount}.`);
  } finally {
    await client.close();
  }
}

seed().catch((error) => {
  console.error('Seed failed', error);
  process.exit(1);
});
