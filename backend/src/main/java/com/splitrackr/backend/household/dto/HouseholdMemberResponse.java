package com.splitrackr.backend.household.dto;

import com.splitrackr.backend.household.model.MembershipRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.lang.reflect.Member;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HouseholdMemberResponse {
    private Integer id;
    private String firstName;
    private String lastName;
    private String email;
    private MembershipRole role;
    private Instant joinedDate;
}
