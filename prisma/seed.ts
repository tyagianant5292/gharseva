import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SAMPLE = [
  { name: "Sunita Devi", services: ["MAID", "COOK"], city: "Noida", locality: "Sector 62", pincode: "201301", gender: "Female", exp: 8, salary: 9000, bio: "Experienced in cleaning and North-Indian cooking. Morning & evening shifts." },
  { name: "Ramesh Kumar", services: ["DRIVER"], city: "Noida", locality: "Sector 18", pincode: "201301", gender: "Male", exp: 12, salary: 18000, bio: "Light & heavy vehicle license. Punctual, knows Delhi-NCR routes." },
  { name: "Anjali Sharma", services: ["NANNY", "ELDER_CARE"], city: "Delhi", locality: "Dwarka", pincode: "110075", gender: "Female", exp: 5, salary: 14000, bio: "Caring with kids and elderly. First-aid trained." },
  { name: "Meena Yadav", services: ["COOK"], city: "Gurgaon", locality: "Sector 56", pincode: "122011", gender: "Female", exp: 10, salary: 12000, bio: "Specialist in South & North Indian, Chinese basics." },
  { name: "Pooja Singh", services: ["MAID", "ALL_ROUNDER"], city: "Noida", locality: "Sector 76", pincode: "201304", gender: "Female", exp: 6, salary: 10000, bio: "All-round house help — cleaning, utensils, laundry." },
  { name: "Lakshmi Nair", services: ["PATIENT_CARE", "ELDER_CARE"], city: "Delhi", locality: "Saket", pincode: "110017", gender: "Female", exp: 9, salary: 20000, bio: "Trained attendant for patient and elderly care." },
  { name: "Geeta Kumari", services: ["MAID"], city: "Gurgaon", locality: "DLF Phase 3", pincode: "122002", gender: "Female", exp: 4, salary: 8000, bio: "Reliable cleaning help, flexible timings." },
  { name: "Vikram Das", services: ["GARDENER", "ALL_ROUNDER"], city: "Noida", locality: "Sector 62", pincode: "201301", gender: "Male", exp: 7, salary: 11000, bio: "Garden maintenance plus general home help." },
];

async function main() {
  const pass = await bcrypt.hash("password123", 10);

  for (const [i, s] of SAMPLE.entries()) {
    const email = `${s.name.toLowerCase().replace(/[^a-z]/g, ".")}.${i}@example.com`;
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        name: s.name,
        email,
        mobile: `+9198${String(10000000 + i * 137).slice(0, 8)}`,
        passwordHash: pass,
        role: "PROVIDER",
        provider: {
          create: {
            services: s.services,
            city: s.city,
            locality: s.locality,
            pincode: s.pincode,
            gender: s.gender,
            experienceYears: s.exp,
            expectedSalary: s.salary,
            bio: s.bio,
            verified: true,
            verificationStatus: "VERIFIED",
          },
        },
      },
    });
  }

  // A demo customer to test the contact-reveal gating.
  await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      name: "Demo Customer",
      email: "customer@example.com",
      mobile: "+919800000000",
      passwordHash: pass,
      role: "CUSTOMER",
    },
  });

  console.log(`Seeded ${SAMPLE.length} providers + 1 customer (password: password123)`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
