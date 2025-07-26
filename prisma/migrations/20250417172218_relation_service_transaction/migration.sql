-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
