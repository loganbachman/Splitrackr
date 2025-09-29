package com.splitrackr.backend.settlement.repository;

import com.splitrackr.backend.settlement.model.SettlementTransfer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SettlementTransferRepository extends JpaRepository<SettlementTransfer, Integer> {

}
