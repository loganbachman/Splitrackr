package com.splitrackr.backend.settlement.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TransferCalculationService {

    // minimally calculate all transfers between users
    public List<TransferProposal> calculateMinimalTransfers(Map<Integer, Integer> balances) {
        List<TransferProposal> transfers = new ArrayList<>();

        // creditors (positive balance) and debtors (negative balance)
        List<UserBalance> creditors = new ArrayList<>();
        List<UserBalance> debtors = new ArrayList<>();

        for (Map.Entry<Integer, Integer> entry : balances.entrySet()) {
            Integer userId = entry.getKey();
            Integer netCents = entry.getValue();

            if (netCents > 0) {
                creditors.add(new UserBalance(userId, netCents));
            } else if (netCents < 0) {
                debtors.add(new UserBalance(userId, Math.abs(netCents)));
            }
            // skip any users that have no balance
        }

        // sort by largest balance / debt (tie-breaking by userId)
        creditors.sort(Comparator.comparing((UserBalance ub) -> ub.balance).reversed()
                .thenComparing(ub -> ub.userId));
        debtors.sort(Comparator.comparing((UserBalance ub) -> ub.balance).reversed()
                .thenComparing(ub -> ub.userId));

        // match largest creditor to largest debtor
        int creditorIndex = 0;
        int debtorIndex = 0;

        // loop until sorted through all creditors & debtors
        while (creditorIndex < creditors.size() && debtorIndex < debtors.size()) {
            UserBalance creditor = creditors.get(creditorIndex);
            UserBalance debtor = debtors.get(debtorIndex);

            // transfer amount is minimum of what creditor is owed and what debtor owes
            Integer transferAmount = Math.min(creditor.balance, debtor.balance);

            if (transferAmount > 0) {
                transfers.add(new TransferProposal(
                        debtor.userId,    // from debtor
                        creditor.userId,  // to creditor
                        transferAmount    // amount
                ));

                // update balances
                creditor.balance -= transferAmount;
                debtor.balance -= transferAmount;
            }

            // move to next creditor or debtor if current one is settled
            if (creditor.balance == 0) {
                creditorIndex++;
            }
            if (debtor.balance == 0) {
                debtorIndex++;
            }
        }

        return transfers;
    }


    public record TransferProposal(Integer fromUserId, Integer toUserId, Integer amountCents) {
    }

    private static class UserBalance {
        public final Integer userId;
        public Integer balance;

        public UserBalance(Integer userId, Integer balance) {
            this.userId = userId;
            this.balance = balance;
        }
    }
}
