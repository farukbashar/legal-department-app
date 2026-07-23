-- Add ON DELETE CASCADE to child-record foreign keys so deleting a parent
-- record (contract, litigation case, MoU, debt case, legal opinion request)
-- automatically removes its dependent rows instead of being blocked by a
-- foreign key constraint.

ALTER TABLE "contract_approvals" DROP CONSTRAINT "contract_approvals_contractId_fkey";
ALTER TABLE "contract_approvals" ADD CONSTRAINT "contract_approvals_contractId_fkey"
  FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "contract_signatures" DROP CONSTRAINT "contract_signatures_contractId_fkey";
ALTER TABLE "contract_signatures" ADD CONSTRAINT "contract_signatures_contractId_fkey"
  FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "legal_opinions" DROP CONSTRAINT "legal_opinions_requestId_fkey";
ALTER TABLE "legal_opinions" ADD CONSTRAINT "legal_opinions_requestId_fkey"
  FOREIGN KEY ("requestId") REFERENCES "legal_opinion_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "hearings" DROP CONSTRAINT "hearings_caseId_fkey";
ALTER TABLE "hearings" ADD CONSTRAINT "hearings_caseId_fkey"
  FOREIGN KEY ("caseId") REFERENCES "litigation_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "case_counsel" DROP CONSTRAINT "case_counsel_caseId_fkey";
ALTER TABLE "case_counsel" ADD CONSTRAINT "case_counsel_caseId_fkey"
  FOREIGN KEY ("caseId") REFERENCES "litigation_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "judgments" DROP CONSTRAINT "judgments_caseId_fkey";
ALTER TABLE "judgments" ADD CONSTRAINT "judgments_caseId_fkey"
  FOREIGN KEY ("caseId") REFERENCES "litigation_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "mou_approvals" DROP CONSTRAINT "mou_approvals_mouId_fkey";
ALTER TABLE "mou_approvals" ADD CONSTRAINT "mou_approvals_mouId_fkey"
  FOREIGN KEY ("mouId") REFERENCES "mous"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "debt_payments" DROP CONSTRAINT "debt_payments_debtCaseId_fkey";
ALTER TABLE "debt_payments" ADD CONSTRAINT "debt_payments_debtCaseId_fkey"
  FOREIGN KEY ("debtCaseId") REFERENCES "debt_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
