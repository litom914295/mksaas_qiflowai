import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { payment, userCredit } from '../src/db/schema';
import { eq, and, desc } from 'drizzle-orm';

const connectionString = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL not found');
  process.exit(1);
}

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

async function verifySubscription() {
  const userId = 'mLcZLbqhL3xmFoAx4RmQieh39MSxnDG2';
  
  console.log('\n📊 Checking subscription status...\n');
  
  // Get latest payment records
  const payments = await db
    .select()
    .from(payment)
    .where(eq(payment.userId, userId))
    .orderBy(desc(payment.createdAt))
    .limit(5);
  
  console.log('💳 Payment Records:');
  payments.forEach((p, i) => {
    console.log(`\n${i + 1}. Payment ID: ${p.id}`);
    console.log(`   Type: ${p.type}`);
    console.log(`   Scene: ${p.scene}`);
    console.log(`   Status: ${p.status}`);
    console.log(`   Paid: ${p.paid}`);
    console.log(`   Subscription ID: ${p.subscriptionId}`);
    console.log(`   Invoice ID: ${p.invoiceId}`);
    console.log(`   Created: ${p.createdAt}`);
  });
  
  // Get credit balance
  const credits = await db
    .select()
    .from(userCredit)
    .where(eq(userCredit.userId, userId))
    .limit(1);
  
  console.log('\n\n💰 Credit Balance:');
  if (credits.length > 0) {
    console.log(`   Current Credits: ${credits[0].currentCredits}`);
    console.log(`   Last Updated: ${credits[0].updatedAt}`);
  } else {
    console.log('   No credit record found');
  }
  
  await client.end();
}

verifySubscription()
  .then(() => {
    console.log('\n✅ Verification complete\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });
