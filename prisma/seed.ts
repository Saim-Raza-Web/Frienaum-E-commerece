import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create active terms version if none exists
  console.log("Checking for active terms version...");
  const existingTerms = await prisma.termsVersion.findFirst({
    where: { isActive: true }
  });

  if (!existingTerms) {
    console.log("Creating active terms version...");
    await prisma.termsVersion.create({
      data: {
        version: "1.0",
        title: "Allgemeine Geschäftsbedingungen v1.0",
        content: `
          <h2>1. Geltungsbereich</h2>
          <p>Diese Allgemeinen Geschäftsbedingungen regeln die Nutzung der Online-Plattform Feinraumshop.</p>
          
          <h2>2. Vertragspartner</h2>
          <p>Feinraumshop ist nicht Verkäuferin der über die Plattform angebotenen Produkte. Ein Kaufvertrag kommt ausschliesslich zwischen der Kundschaft und dem jeweiligen Lieferanten zustande.</p>
          
          <h2>3. Preise und Zahlung</h2>
          <p>Sämtliche Preise werden in Schweizer Franken (CHF) angezeigt.</p>
          
          <h2>4. Versand und Lieferung</h2>
          <p>Versand und Lieferung erfolgen durch den jeweiligen Lieferanten. Standardversand beträgt CHF 8.50.</p>
          
          <h2>5. Datenschutz</h2>
          <p>Wir bearbeiten Personendaten gemäss unserer Datenschutzerklärung.</p>
          
          <h2>6. Anwendbares Recht</h2>
          <p>Es gilt schweizerisches Recht. Gerichtsstand ist Arbon, Schweiz.</p>
        `,
        isActive: true,
        effectiveDate: new Date()
      }
    });
    console.log("Active terms version created successfully!");
  } else {
    console.log("Active terms version already exists.");
  }
}

main().finally(() => prisma.$disconnect());