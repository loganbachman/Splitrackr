package com.splitrackr.backend.household.repository;

import com.splitrackr.backend.household.model.HouseholdMembership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HouseholdMembershipRepository extends JpaRepository<HouseholdMembership, Integer> {
    boolean existsByUser_IdAndHousehold_HouseholdId(Integer userId, Integer householdMembershipId);
    List<HouseholdMembership> findAllByUser_Id(Integer userId);
    List<HouseholdMembership> findAllByHousehold_HouseholdId(Integer householdId);
}
