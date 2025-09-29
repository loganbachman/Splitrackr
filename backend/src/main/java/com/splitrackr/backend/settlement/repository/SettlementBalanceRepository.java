package com.splitrackr.backend.settlement.repository;

import com.splitrackr.backend.settlement.model.SettlementBalance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SettlementBalanceRepository extends JpaRepository<SettlementBalance, Integer> {
    List<SettlementBalance> findBySettlement_SettlementId(Integer settlementId);

    void deleteBySettlement_SettlementId(Integer settlementId);
}
