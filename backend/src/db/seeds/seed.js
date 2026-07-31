import 'dotenv/config';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const USERS = [
  { name: 'Aleya Admin', email: 'admin@mcmc.gov.my', password: 'Admin@123', role: 'admin' },
  { name: 'Ahmad Officer', email: 'officer@mcmc.gov.my', password: 'Officer@123', role: 'officer' },
];

const COMPLAINTS = [
  ['No coverage in Taman Melawati since Monday', 'Complainant reports zero signal bars for 3 consecutive days in the Taman Melawati area.', 'Network Service Quality', 'Investigation', 'Nurul Huda', '+6012-3456789', 'nurul.huda@example.com', 9],
  ['Received scam SMS claiming to be from bank', 'SMS asking to click a link to "verify account" impersonating a local bank.', 'Fraud, Scam & Security', 'New', 'Wei Ming Tan', '+6013-2223344', 'weiming.tan@example.com', 8],
  ['Overcharged on monthly postpaid bill', 'Bill shows RM230 instead of the usual RM89 plan rate, no explanation given.', 'Billing & Charges', 'Investigation', 'Siti Aisyah', '+6019-8765432', 'siti.aisyah@example.com', 7],
  ['Internet service down for entire apartment block', 'Whole building in Cheras has had no fixed broadband since yesterday morning.', 'Service Provisioning', 'Resolved', 'Kumar Selvam', '+6016-1122334', 'kumar.selvam@example.com', 6],
  ['Repeated missed call scam pattern', 'Multiple one-ring calls from unknown international numbers, suspected wangiri scam.', 'Fraud, Scam & Security', 'Closed', 'Farah Izzati', '+6017-9988776', 'farah.izzati@example.com', 5],
  ['Mobile data extremely slow during peak hours', 'Data speed drops to under 1 Mbps every evening between 7pm and 10pm.', 'Network Service Quality', 'New', 'Chong Wei Liang', '+6011-4455667', 'weiliang.chong@example.com', 4],
  ['Double charged for the same invoice', 'Same monthly invoice amount was deducted twice from bank account.', 'Billing & Charges', 'New', 'Priya Devi', '+6018-2233445', 'priya.devi@example.com', 3],
  ['Broadband installation delayed beyond promised date', 'Installation was scheduled 3 weeks ago and has been rescheduled twice.', 'Service Provisioning', 'On Hold', 'Mohd Firdaus', '+6014-5566778', 'firdaus.mohd@example.com', 2],
  ['Unsolicited spam calls promoting investment scheme', 'Receiving 5-6 calls daily promoting a suspicious crypto investment scheme.', 'Fraud, Scam & Security', 'Appeal', 'Lee Mei Ling', '+6012-6677889', 'meiling.lee@example.com', 2],
  ['General enquiry about porting number between telcos', 'Complainant wants clarification on the number porting process and timeline.', 'Digital & Online Services', 'Closed', 'Rajesh Kumar', '+6019-3344556', 'rajesh.kumar@example.com', 1],
];

export async function seed() {
  const client = await pool.connect();
  try {
    const { rows: existingUsers } = await client.query('SELECT COUNT(*)::int AS count FROM users');
    if (existingUsers[0].count > 0) {
      console.log('Seed skipped: users table is not empty.');
      return;
    }

    await client.query('BEGIN');

    const userIds = {};
    for (const u of USERS) {
      const passwordHash = await bcrypt.hash(u.password, 10);
      const { rows } = await client.query(
        `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id`,
        [u.name, u.email, passwordHash, u.role]
      );
      userIds[u.email] = rows[0].id;
    }
    const adminId = userIds['admin@mcmc.gov.my'];
    const officerId = userIds['officer@mcmc.gov.my'];

    for (const [i, c] of COMPLAINTS.entries()) {
      const [title, description, category, status, name, phone, email, daysAgo] = c;
      const assignedTo = status === 'New' ? null : officerId;
      const { rows } = await client.query(
        `INSERT INTO complaints
           (title, description, category, status, complainant_name, complainant_phone,
            complainant_email, assigned_to, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW() - $9 * INTERVAL '1 day', NOW() - ($9 - 1) * INTERVAL '1 day')
         RETURNING id`,
        [title, description, category, status, name, phone, email, assignedTo, daysAgo]
      );
      const complaintId = rows[0].id;

      await client.query(
        `INSERT INTO activity_logs (complaint_id, action, description, performed_by, created_at)
         VALUES ($1, 'created', 'Complaint submitted by complainant.', $2, NOW() - $3 * INTERVAL '1 day')`,
        [complaintId, adminId, daysAgo]
      );

      if (status !== 'New') {
        await client.query(
          `INSERT INTO activity_logs (complaint_id, action, description, performed_by, created_at)
           VALUES ($1, 'assigned', 'Assigned to Officer Ahmad.', $2, NOW() - $3 * INTERVAL '1 day')`,
          [complaintId, adminId, Math.max(daysAgo - 1, 0)]
        );
        await client.query(
          `INSERT INTO activity_logs (complaint_id, action, description, performed_by, created_at)
           VALUES ($1, 'status_changed', $2, $3, NOW() - $4 * INTERVAL '1 day')`,
          [complaintId, `Status changed to ${status}.`, officerId, Math.max(daysAgo - 2, 0)]
        );
      }

      void i;
    }

    await client.query('COMMIT');
    console.log(`Seeded ${USERS.length} users and ${COMPLAINTS.length} complaints.`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

const isMainModule = process.argv[1] && process.argv[1].endsWith('seed.js');
if (isMainModule) {
  seed()
    .then(() => pool.end())
    .catch((err) => {
      console.error('Seed failed:', err.message);
      pool.end();
      process.exit(1);
    });
}
