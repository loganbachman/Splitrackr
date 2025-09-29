package com.splitrackr.backend.household.repository;

import com.splitrackr.backend.household.model.Household;
import com.splitrackr.backend.household.model.HouseholdMembership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HouseholdRepository extends JpaRepository<Household, Integer> {
    Optional<Household> findByInviteCode(String inviteCode);
    boolean existsByInviteCode(String inviteCode);
}
