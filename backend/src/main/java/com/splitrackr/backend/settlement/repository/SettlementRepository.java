package com.splitrackr.backend.settlement.repository;

import com.splitrackr.backend.settlement.model.Settlement;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SettlementRepository extends JpaRepository<Settlement, Integer> {
    @Query("SELECT s FROM Settlement s WHERE s.householdId.householdId = :householdId " +
            "AND s.status = 'FINALIZED' ORDER BY s.periodEnd DESC LIMIT 1")
    Optional<Settlement> findLatestFinalizedByHousehold(@Param("householdId") Integer householdId);

    @Query("SELECT s FROM Settlement s WHERE s.householdId.householdId = :householdId " +
            "AND s.status = 'OPEN'")
    Optional<Settlement> findOpenByHousehold(@Param("householdId") Integer householdId);

    @Query("SELECT s FROM Settlement s WHERE s.householdId.householdId = :householdId " +
            "ORDER BY s.createdAt DESC")
    List<Settlement> findByHouseholdOrderByCreatedAtDesc(@Param("householdId") Integer householdId,
                                                         Pageable pageable);
}
